<template>
  <div class="w-full h-full bg-paper dark:bg-ink-deep font-display text-ink dark:text-paper/90 overflow-auto p-6 max-sm:p-4">
    <!-- 过滤栏 -->
    <section
      class="mb-5 sticky top-0 z-[8] border border-ink/15 dark:border-paper/10 bg-paper-deep/85 dark:bg-ink-raised/85 backdrop-blur px-5 py-4">
      <FocusFilterForm
        v-model="filterData"
        :fields="filterFields"
        :delete="userStore.hasPermissions(['role:delete'])"
        :add="userStore.hasPermissions(['role:add'])"
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
        :row-key="(row) => row.id"
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
      @save="(val) => handleSave(val as Role)">
      <template #footer>
        <n-form-item label="菜单" path="menuIdList">
          <n-tree-select
            multiple
            key-field="id"
            label-field="name"
            :disabled="type === 'view'"
            :options="treeSelectOption"
            :default-value="menuDefaultValue"
            @update:value="handleUpdateValue" />
        </n-form-item>
      </template>
    </FocusEditModal>
  </div>
</template>

<script lang="ts" setup>
import { type DataTableColumns, type DataTableRowKey, NSwitch, NTag, type FormRules, type FormItemRule, type TreeSelectOption } from 'naive-ui';
import { eqRole, upRole, delRole, disableRole, addRole, type Role, eqRoleMenu } from '@/api/role';
import { getBaseMenuList } from '@/api/menu';

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
  .addNameInput({ key: 'name', label: '名称' })
  .addNameInput({ key: 'mark', label: '标识' })
  .addStatusSelect({ key: 'status', label: '状态', options: CommonOptionMap.status })
  .build();

const filterData = ref(generateInitialFormData(filterFields));

const { data: baseMenuList, refresh: refreshBaseMenuList } = useAsyncData('baseMenuList', getBaseMenuList, {
  default: () => ({ data: [] as TreeSelectOption[] })
});
onMounted(() => {
  // 客户端挂载时强制刷新，保证读取到 localStorage 的最新菜单
  if (import.meta.client) {
    refresh();
    refreshBaseMenuList();
  }
});

const treeSelectOption = computed<TreeSelectOption[]>(() => (baseMenuList.value?.data as TreeSelectOption[]) || []);
const menuDefaultValue = ref<number[]>([]);
function handleUpdateValue(value: string | number | Array<string | number> | null) {
  editFormData.value.menuIdList = (value as number[]) ?? [];
}

const { pagination, refresh, loading, data, onSearch } = usePagination({
  handler: eqRole,
  handleKey: 'roleList',
  params: computed(() => ({ ...filterData.value }))
});

const type = ref<'add' | 'edit' | 'view'>('view');
const showEditModal = ref(false);

watch(showEditModal, (newVal) => {
  if (!newVal) menuDefaultValue.value = [];
});

const tableHeader = computed<DataTableColumns<Role>>(() => [
  { type: 'selection' },
  { title: 'ID', key: 'id', align: 'center', width: 64 },
  { title: '名称', key: 'name', align: 'center' },
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
          disabled: !userStore.hasPermissions(['role:disable']),
          'checked-value': 1,
          'unchecked-value': 0,
          'onUpdate:value': async () => {
            await disableRole([row.id]);
            refresh();
          }
        },
        { checked: () => '启用', unchecked: () => '禁用' }
      );
    }
  },
  {
    title: '标识',
    key: 'mark',
    align: 'center',
    render(row) {
      return h('span', { class: 'font-mono text-[12px] text-ink dark:text-paper' }, row.mark);
    }
  },
  {
    title: '菜单权限',
    key: 'menuIdList',
    align: 'center',
    render(row) {
      const count = Array.isArray(row.menuIdList) ? row.menuIdList.length : 0;
      return h(NTag, { bordered: false, type: count > 0 ? 'default' : 'warning' }, { default: () => `${count} 项` });
    }
  },
  { title: '描述', key: 'description', align: 'center' },
  {
    title: '创建时间',
    key: 'createDate',
    align: 'center',
    render(row) {
      return h('span', { class: 'font-mono text-[12px] text-ink-mid dark:text-paper/60' }, getDateFormat(row.createDate));
    }
  },
  {
    title: '更新时间',
    key: 'updateDate',
    align: 'center',
    render(row) {
      return h('span', { class: 'font-mono text-[12px] text-ink-mid dark:text-paper/60' }, getDateFormat(row.updateDate));
    }
  },
  getTableActions({
    viewBtn: { onClick: handleView },
    editBtn: { onClick: handleEdit, show: userStore.hasPermissions(['role:update']) },
    deleteBtn: { show: userStore.hasPermissions(['role:delete']), onClick: handleDelete }
  })
]);

const editFields = new FormFieldBuilder()
  .addNameInput({ key: 'id', label: 'id', span: 2, disabled: true })
  .addNameInput({ key: 'name', label: '名称', span: 2 })
  .addNameInput({ key: 'description', label: '描述', span: 2 })
  .addNameInput({ key: 'mark', label: '标识', span: 2 })
  .build();
const editFormData = ref<{
  id?: string;
  name?: string;
  description?: string;
  mark?: string;
  menuIdList: number[];
}>({
  ...generateInitialFormData(editFields),
  menuIdList: []
});

const editRules: FormRules = {
  name: { required: true, message: '请输入角色名称', trigger: 'blur' },
  mark: { required: true, message: '请输入角色标识', trigger: 'blur' },
  menuIdList: [
    {
      required: true,
      message: '请选择菜单',
      trigger: 'blur',
      validator: (_rule: FormItemRule, val: number[]) => {
        if (!val || val.length === 0) return new Error('请选择菜单');
        return true;
      }
    }
  ]
};

const editFormTitle = computed(() => {
  switch (type.value) {
    case 'add':
      return '新增角色';
    case 'edit':
      return '编辑角色';
    default:
      return '查看角色';
  }
});

async function handleView(row: Role) {
  type.value = 'view';
  await refreshBaseMenuList();
  const res = await eqRoleMenu(row.id);
  menuDefaultValue.value = res.data;
  editFormData.value = { ...row, menuIdList: res.data, id: row.id.toString() };
  showEditModal.value = true;
}

async function handleEdit(row: Role) {
  type.value = 'edit';
  await refreshBaseMenuList();
  const res = await eqRoleMenu(row.id);
  menuDefaultValue.value = res.data;
  editFormData.value = { ...row, menuIdList: res.data, id: row.id.toString() };
  showEditModal.value = true;
}

function handleDelete(row: Role) {
  if (Number(row.id) === 1) {
    message.warning('不能删除默认角色');
    return;
  }
  dialog.warning({
    title: '警告',
    content: `确定要删除角色：${row.name}吗？`,
    positiveText: '确定',
    negativeText: '取消',
    draggable: true,
    onPositiveClick: () => {
      delRole([row.id]).then((res) => {
        if (Number(res.code) === 200) {
          message.success('删除成功');
          refresh();
        }
      });
    }
  });
}

function handleSave(val: Role) {
  if (type.value === 'edit') {
    upRole(val).then((res) => {
      if (Number(res.code) === 200) {
        message.success('更新成功');
        refresh();
      }
    });
  } else if (type.value === 'add') {
    const { id, ...rest } = val;
    addRole(rest).then((res) => {
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
  await refreshBaseMenuList();
  editFormData.value = {
    ...generateInitialFormData(editFields),
    menuIdList: []
  };
  showEditModal.value = true;
};

const handleMultipleDelete = () => {
  if (checkedRowKeysRef.value.length === 0) {
    message.warning('请选择要删除的角色');
    return;
  }
  dialog.warning({
    title: '警告',
    content: `确定要删除以下${checkedRowKeysRef.value.length}个角色吗？`,
    positiveText: '确定',
    negativeText: '取消',
    draggable: true,
    onPositiveClick: () => {
      delRole(checkedRowKeysRef.value as number[]).then((res) => {
        if (Number(res.code) === 200) {
          message.success('删除成功');
          refresh();
        }
      });
    }
  });
};
</script>
