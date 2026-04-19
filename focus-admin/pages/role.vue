<template>
  <div class="w-full h-full p-1.5">
    <div class="p-3 box-border mb-2.5 sticky top-0 z-[999] shadow-sm rounded-xl" :class="themeClass('box-bg')">
      <FocusFilterForm
        v-model="filterData"
        :fields="filterFields"
        :delete="userStore.hasPermissions(['role:delete'])"
        :add="userStore.hasPermissions(['role:add'])"
        @search="onSearch"
        @reset="onSearch"
        @add="handleAdd"
        @delete="handleMultipleDelete" />
    </div>

    <n-data-table
      :style="`--n-merged-th-color:${theme ? '#35364E' : '#DBDDF4'}`"
      :bordered="false"
      :single-line="false"
      :columns="tableHeader"
      :data="data"
      :loading="loading"
      :row-key="(row) => row.id"
      :pagination="pagination"
      remote
      @update:checked-row-keys="handleCheck" />

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
import { type DataTableColumns, type DataTableRowKey, NSwitch, type FormRules, type FormItemRule, type TreeSelectOption } from 'naive-ui';
import { eqRole, upRole, delRole, disableRole, addRole, type Role, eqRoleMenu } from '@/api/role';
import { getBaseMenuList } from '@/api/menu';

// definePageMeta({
//   permissions: ['role:add']
// });

const theme = inject<Ref<boolean>>('theme');
const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();

const filterFields = new FormFieldBuilder()
  .addNameInput({ key: 'name', label: '名称' })
  .addNameInput({ key: 'mark', label: '标识' })
  .addStatusSelect({ key: 'status', label: '状态', options: CommonOptionMap.status })
  .build();

const filterData = ref(generateInitialFormData(filterFields));

const { data: baseMenuList, refresh: refreshBaseMenuList } = useAsyncData('baseMenuList', getBaseMenuList, {
  default: () => ({
    data: [] as TreeSelectOption[]
  })
});
onMounted(() => {
  if (import.meta.client && !baseMenuList.value?.data?.length) {
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
  params: computed(() => {return filterData.value;})
});

const type = ref<'add' | 'edit' | 'view'>('view');
const showEditModal = ref(false);

watch(showEditModal, (newVal) => {
  if (!newVal) {
    menuDefaultValue.value = [];
  }
});

const tableHeader = computed<DataTableColumns<Role>>(() => [
  {
    type: 'selection'
  },
  { title: 'id', key: 'id', align: 'center' },
  { title: '名称', key: 'name', align: 'center' },
  {
    title: '状态',
    key: 'status',
    align: 'center',
    render(row) {
      return h(
        NSwitch,
        {
          value: Number(row.status),
          disabled: !userStore.hasPermissions(['role:disable']),
          'checked-value': 1,
          'unchecked-value': 0,
          'onUpdate:value': async (val: number) => {
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
    align: 'center'
  },
  {
    title: '描述',
    key: 'description',
    align: 'center'
  },
  {
    title: '创建时间',
    key: 'createDate',
    align: 'center',
    render(row) {
      return getDateFormat(row.createDate);
    }
  },
  {
    title: '更新时间',
    key: 'updateDate',
    align: 'center',
    render(row) {
      return getDateFormat(row.updateDate);
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
  menuIdList: [] as number[]
});

const editRules: FormRules = {
  name: {
    required: true,
    message: '请输入角色名称',
    trigger: 'blur'
  },
  mark: {
    required: true,
    message: '请输入角色标识',
    trigger: 'blur'
  },
  menuIdList: [
    {
      required: true,
      message: '请选择菜单',
      trigger: 'blur',
      validator: (rule: FormItemRule, val: number[]) => {
        console.log(val, 'val');
        if (val.length === 0) {
          return new Error('请选择菜单');
        }
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
    case 'view':
      return '查看角色';
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

/**
 * 处理新增操作
 * 触发新增事件并传递当前表单数据
 */
const handleAdd = async () => {
  type.value = 'add';
  await refreshBaseMenuList();
  editFormData.value = {
    ...generateInitialFormData(editFields),
    menuIdList: []
  };
  showEditModal.value = true;
};

/**
 * 处理删除操作
 * 触发删除事件并传递当前表单数据
 */
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
