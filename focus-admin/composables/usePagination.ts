export interface UsePageOptions<T, P = any> {
  page?: number;
  pageSize?: number;
  pageSizes?: number[];
  handler: (params: P) => Promise<Result<{ records: T[]; total: number } | { data: T[]; total: number }>> | Promise<Result<Page<T>>>;
  handleKey: string;
  params?: Record<string, unknown> | Ref<Record<string, unknown>>;
  pageKey?: string;
  pageSizeKey?: string;
}

export function usePagination<T, P = any>({
  page = 1,
  pageSize = 5,
  pageSizes = [5, 10, 20],
  handler,
  handleKey,
  params,
  pageKey = 'current',
  pageSizeKey = 'size'
}: UsePageOptions<T, P>) {
  const currentPageSizes = pageSizes;
  const currentPage = ref(page);
  const currentPageSize = ref(pageSize);

  const currentParams = isRef(params) ? params : ref(params || {});

  // 使用useAsyncData处理异步分页数据请求
  const { data, status, error, refresh, clear } = useAsyncData(
    handleKey + '-pagination',
    () => {
      // 构建请求参数，包含分页信息和其他参数
      const requestParams = {
        [pageKey]: currentPage.value,
        [pageSizeKey]: currentPageSize.value,
        ...(unref(currentParams) as Record<string, unknown>)
      } as P;
      return handler(requestParams);
    },
    {
      default: () => ({ data: { records: [], total: 0 } }),
      watch: [currentPage, currentPageSize]
    }
  );

  onMounted(() => {
    if (import.meta.client && !data.value.data?.total) {
      refresh();
    }
  });

  const currentTotal = computed(() => {
    return data.value?.data?.total || 0;
  });

  const loading = computed(() => {
    return !['success', 'error'].includes(status.value);
  });

  const pagination = computed(() => {
    return {
      page: currentPage.value,
      pageSize: currentPageSize.value,
      showSizePicker: true,
      pageSizes: currentPageSizes,
      itemCount: currentTotal.value,
      onChange: onPageChange,
      onUpdatePageSize: onPageSizeChange
    };
  });

  const onPageChange = (page: number) => {
    currentPage.value = page;
  };

  const onPageSizeChange = (pageSize: number) => {
    currentPage.value = 1;
    currentPageSize.value = pageSize;
  };

  const onSearch = () => {
    if (currentPage.value === 1) {
      refresh();
      return;
    }
    currentPage.value = 1;
  };

  return {
    pagination,
    page: currentPage,
    pageSize: currentPageSize,
    params: currentParams,
    loading,
    onPageChange,
    onPageSizeChange,
    refresh,
    error,
    clear,
    onSearch,
    data: computed(() => {
      const responseData = data.value?.data;
      if (!responseData) return [];
      return 'records' in responseData ? responseData.records : responseData.data;
    })
  };
}
