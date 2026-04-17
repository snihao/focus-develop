<template>
  <div class="w-full h-full p-1.5">
    <div class="p-3 box-border mb-2.5 sticky top-0 z-[999] shadow-sm rounded-xl" :class="themeClass('box-bg')">
      <FocusFilterForm
        v-model="filterData"
        :fields="filterFields"
        :add="userStore.hasPermissions(['user:add'])"
        :delete="userStore.hasPermissions(['user:delete'])"
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
      :row-key="(row: EmpInfo) => row.id"
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
  if (import.meta.client) loadRoles();
});

const { pagination, refresh, loading, data, onSearch } = usePagination<EmpInfo>({
  handler: (params: any) => getEmpList({ ...filterData.value, ...params }),
  handleKey: 'emp-list',
  params: computed(() => filterData.value)
});

const tableHeader = computed<DataTableColumns<EmpInfo>>(() => [
  { type: 'selection' },
  { title: 'id', key: 'id', align: 'center' },
  { title: '姓名', key: 'name', align: 'center' },
  { title: '手机号', key: 'phone', align: 'center', render(row) { return maskPhoneNumber(row.phone); } },
  {
    title: '性别', key: 'gender', align: 'center',
    render(row) { return row.gender === 1 ? '男' : '女'; }
  },
  {
    title: '状态', key: 'status', align: 'center',
    render(row) {
      return h(NSwitch, {
        value: Number(row.status),
        disabled: !userStore.hasPermissions(['user:disable']),
        'checked-value': 1, 'unchecked-value': 0,
        'onUpdate:value': async () => { await disableEmp([row.id]); refresh(); }
      }, { checked: () => '启用', unchecked: () => '禁用' });
    }
  },
  {
    title: '角色', key: 'roles', align: 'center',
    render(row) {
      return (row.roles || []).map(r => h(NTag, { type: 'info', class: 'mr-1' }, { default: () => r.name }));
    }
  },
  { title: '创建时间', key: 'createDate', align: 'center', render(row) { return getDateFormat(row.createDate); } },
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
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: ['input', 'blur'] }
  ]
};

const editFormTitle = computed(() => {
  switch (type.value) {
    case 'add': return '新增员工';
    case 'edit': return '编辑员工';
    default: return '查看员工';
  }
});

function handleView(row: EmpInfo) {
  type.value = 'view';
  editFormData.value = { ...row, id: row.id.toString(), roleIds: (row.roles || []).map(r => r.roleId) };
  showEditModal.value = true;
}

function handleEdit(row: EmpInfo) {
  type.value = 'edit';
  editFormData.value = { ...row, id: row.id.toString(), roleIds: (row.roles || []).map(r => r.roleId) };
  showEditModal.value = true;
}

function handleDelete(row: EmpInfo) {
  dialog.warning({
    title: '警告',
    content: `确定要删除员工：${row.name}吗？`,
    positiveText: '确定', negativeText: '取消', draggable: true,
    onPositiveClick: () => {
      delEmp([row.id]).then(res => {
        if (Number(res.code) === 200) { message.success('删除成功'); refresh(); }
      });
    }
  });
}

function handleSave(val: EmpUpdateParams) {
  if (type.value === 'edit') {
    updateEmp(val).then(res => {
      if (Number(res.code) === 200) { message.success('更新成功'); refresh(); }
    });
  } else if (type.value === 'add') {
    const { id, ...rest } = val as any;
    addEmp(rest).then(res => {
      if (Number(res.code) === 200) { message.success('新增成功'); refresh(); }
    });
  }
}

const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
function handleCheck(rowKeys: DataTableRowKey[]) { checkedRowKeysRef.value = rowKeys; }

const handleAdd = async () => {
  type.value = 'add';
  await loadRoles();
  editFormData.value = { ...generateInitialFormData(editFields), roleIds: [] };
  showEditModal.value = true;
};

const handleMultipleDelete = () => {
  if (checkedRowKeysRef.value.length === 0) { message.warning('请选择要删除的员工'); return; }
  dialog.warning({
    title: '警告',
    content: `确定要删除以下${checkedRowKeysRef.value.length}个员工吗？`,
    positiveText: '确定', negativeText: '取消', draggable: true,
    onPositiveClick: () => {
      delEmp(checkedRowKeysRef.value as number[]).then(res => {
        if (Number(res.code) === 200) { message.success('删除成功'); refresh(); }
      });
    }
  });
};
</script>
