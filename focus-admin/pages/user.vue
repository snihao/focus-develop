<template>
  <div class="w-full h-full bg-paper dark:bg-ink-deep font-display text-ink dark:text-paper/90 overflow-auto p-6 max-sm:p-4">
    <!-- 过滤栏 -->
    <section
      class="mb-5 sticky top-0 z-[8] border border-ink/15 dark:border-paper/10 bg-paper-deep/85 dark:bg-ink-raised/85 backdrop-blur px-5 py-4">
      <FocusFilterForm
        v-model="filterData"
        :fields="filterFields"
        :add="userStore.hasPermissions(['user:add'])"
        :delete="userStore.hasPermissions(['user:delete'])"
        @search="onSearch"
        @reset="onSearch"
        @add="handleAdd"
        @delete="handleMultipleDelete" />
    </section>

    <!-- 表格卡 -->
    <section class="border border-ink/15 dark:border-paper/10 bg-white/50 dark:bg-ink-raised">
      <n-data-table
        :style="tableCssVars"
        :bordered="false"
        :single-line="false"
        :columns="tableHeader"
        :data="data"
        :loading="loading"
        :row-key="(row: EmpInfo) => row.id"
        :pagination="pagination"
        remote
        @update:checked-row-keys="handleCheck" />
    </section>

    <!-- 新增 / 编辑 / 查看 -->
    <FocusEditModal
      v-model:show="showEditModal"
      v-model:formData="editFormData"
      :fields="editFields"
      :title="editFormTitle"
      :rules="editRules"
      :disabled="type === 'view'"
      @save="(val) => handleSave(val as EmpUpdateParams)">
      <template #footer>
        <n-form-item label="角色" path="roleIds">
          <n-select
            v-model:value="editFormData.roleIds"
            multiple
            :options="roleOptions"
            :disabled="type === 'view'"
            placeholder="请选择角色" />
        </n-form-item>
      </template>
    </FocusEditModal>
  </div>
</template>

<script lang="ts" setup>
import { type DataTableColumns, NTag, NSwitch, type DataTableRowKey, type FormRules } from 'naive-ui';
import { getEmpList, addEmp, updateEmp, delEmp, disableEmp, type EmpInfo, type EmpUpdateParams } from '@/api/admin';
import { eqRole, type Role } from '@/api/role';

const theme = inject<Ref<boolean>>('theme');
const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();

const tableCssVars = computed(() => ({
  '--n-merged-th-color': theme?.value ? '#1f2026' : '#ebe4d6',
  '--n-th-text-color': theme?.value ? '#f4efe7' : '#1a1a1a',
  '--n-td-text-color': theme?.value ? '#e4ddd0' : '#1a1a1a',
  '--n-th-font-weight': '600'
}));

const filterFields = new FormFieldBuilder()
  .addNameInput({ key: 'name', label: '姓名' })
  .addNameInput({ key: 'phone', label: '手机号' })
  .addStatusSelect({ key: 'status', label: '状态', options: CommonOptionMap.status })
  .build();

const filterData = ref(generateInitialFormData(filterFields));

const type = ref<'add' | 'edit' | 'view'>('view');
const showEditModal = ref(false);

// 角色选项
const roleOptions = ref<{ label: string; value: number }[]>([]);
async function loadRoles() {
  const res = await eqRole({ page: 1, size: 999 });
  if (res.data?.records) {
    roleOptions.value = res.data.records.map((r: Role) => ({ label: r.name, value: r.id }));
  }
}
onMounted(() => {
  // 客户端挂载时强制刷新，保证读取到 localStorage 的最新数据
  if (import.meta.client) {
    loadRoles();
    refresh();
  }
});

const { pagination, refresh, loading, data, onSearch } = usePagination<EmpInfo>({
  handler: (params: any) => getEmpList({ ...filterData.value, ...params }),
  handleKey: 'emp-list',
  params: computed(() => filterData.value)
});

const tableHeader = computed<DataTableColumns<EmpInfo>>(() => [
  { type: 'selection' },
  { title: 'ID', key: 'id', align: 'center', width: 64 },
  {
    title: '姓名',
    key: 'name',
    align: 'center',
    render(row) {
      return h('div', { class: 'flex items-center justify-center gap-2' }, [
        h('img', {
          src: row.photo,
          alt: row.name,
          class: 'w-7 h-7 rounded-full border border-ink/20 dark:border-paper/20 object-cover'
        }),
        h('span', { class: 'font-display text-ink dark:text-paper' }, row.name)
      ]);
    }
  },
  {
    title: '手机号',
    key: 'phone',
    align: 'center',
    render(row) {
      return h('span', { class: 'font-mono text-[12px] text-ink dark:text-paper' }, maskPhoneNumber(row.phone));
    }
  },
  {
    title: '性别',
    key: 'gender',
    align: 'center',
    width: 72,
    render(row) {
      return row.gender === 1 ? '男' : '女';
    }
  },
  {
    title: '状态',
    key: 'status',
    align: 'center',
    width: 128,
    render(row) {
      return h(
        NSwitch,
        {
          value: Number(row.status),
          disabled: !userStore.hasPermissions(['user:disable']),
          'checked-value': 1,
          'unchecked-value': 0,
          'onUpdate:value': async () => {
            await disableEmp([row.id]);
            refresh();
          }
        },
        { checked: () => '启用', unchecked: () => '禁用' }
      );
    }
  },
  {
    title: '角色',
    key: 'roles',
    align: 'center',
    render(row) {
      const roles = row.roles || [];
      if (!roles.length) return h('span', { class: 'font-mono text-[11px] text-ink-soft dark:text-paper/40' }, '—');
      return h(
        'div',
        { class: 'flex flex-wrap items-center justify-center gap-1' },
        roles.map((r) => h(NTag, { bordered: false, type: 'default', size: 'small' }, { default: () => r.name }))
      );
    }
  },
  {
    title: '创建时间',
    key: 'createDate',
    align: 'center',
    render(row) {
      return h('span', { class: 'font-mono text-[12px] text-ink-mid dark:text-paper/60' }, getDateFormat(row.createDate));
    }
  },
  getTableActions({
    viewBtn: { onClick: handleView },
    editBtn: { onClick: handleEdit, show: userStore.hasPermissions(['user:update']) },
    deleteBtn: { show: userStore.hasPermissions(['user:delete']), onClick: handleDelete }
  })
]);

const editFields = new FormFieldBuilder()
  .addNameInput({ key: 'id', label: 'id', span: 2, disabled: true })
  .addNameInput({ key: 'name', label: '姓名', span: 2 })
  .addNameInput({ key: 'phone', label: '手机号', span: 2 })
  .addStatusSelect({ key: 'gender', label: '性别', options: CommonOptionMap.gender, span: 2 })
  .addStatusSelect({ key: 'status', label: '状态', options: CommonOptionMap.status, span: 2 })
  .build();

const editFormData = ref<Record<string, any>>({
  ...generateInitialFormData(editFields),
  roleIds: [] as number[]
});

const editRules: FormRules = {
  name: { required: true, message: '请输入姓名', trigger: 'blur' },
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' }
  ]
};

const editFormTitle = computed(() => {
  switch (type.value) {
    case 'add':
      return '新增员工';
    case 'edit':
      return '编辑员工';
    default:
      return '查看员工';
  }
});

function handleView(row: EmpInfo) {
  type.value = 'view';
  editFormData.value = { ...row, id: row.id.toString(), roleIds: (row.roles || []).map((r) => r.roleId) };
  showEditModal.value = true;
}

function handleEdit(row: EmpInfo) {
  type.value = 'edit';
  editFormData.value = { ...row, id: row.id.toString(), roleIds: (row.roles || []).map((r) => r.roleId) };
  showEditModal.value = true;
}

function handleDelete(row: EmpInfo) {
  if (Number(row.id) === 1) {
    message.warning('不能删除演示账号');
    return;
  }
  dialog.warning({
    title: '警告',
    content: `确定要删除员工：${row.name}吗？`,
    positiveText: '确定',
    negativeText: '取消',
    draggable: true,
    onPositiveClick: () => {
      delEmp([row.id]).then((res) => {
        if (Number(res.code) === 200) {
          message.success('删除成功');
          refresh();
        }
      });
    }
  });
}

function handleSave(val: EmpUpdateParams) {
  if (type.value === 'edit') {
    updateEmp(val).then((res) => {
      if (Number(res.code) === 200) {
        message.success('更新成功');
        refresh();
      }
    });
  } else if (type.value === 'add') {
    const { id, ...rest } = val as any;
    addEmp(rest).then((res) => {
      if (Number(res.code) === 200) {
        message.success('新增成功');
        refresh();
      }
    });
  }
}

const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
function handleCheck(rowKeys: DataTableRowKey[]) {
  checkedRowKeysRef.value = rowKeys;
}

const handleAdd = async () => {
  type.value = 'add';
  await loadRoles();
  editFormData.value = { ...generateInitialFormData(editFields), roleIds: [] };
  showEditModal.value = true;
};

const handleMultipleDelete = () => {
  if (checkedRowKeysRef.value.length === 0) {
    message.warning('请选择要删除的员工');
    return;
  }
  const ids = (checkedRowKeysRef.value as number[]).filter((id) => id !== 1);
  if (ids.length === 0) {
    message.warning('演示账号不可删除');
    return;
  }
  dialog.warning({
    title: '警告',
    content: `确定要删除以下${ids.length}个员工吗？`,
    positiveText: '确定',
    negativeText: '取消',
    draggable: true,
    onPositiveClick: () => {
      delEmp(ids).then((res) => {
        if (Number(res.code) === 200) {
          message.success('删除成功');
          refresh();
        }
      });
    }
  });
};
</script>
