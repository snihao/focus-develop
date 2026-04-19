<template>
  <div class="w-full h-full bg-paper dark:bg-ink-deep font-display text-ink dark:text-paper/90 overflow-auto p-6 max-sm:p-4">
    <!-- 过滤栏 -->
    <section
      class="mb-5 sticky top-0 z-[8] border border-ink/15 dark:border-paper/10 bg-paper-deep/85 dark:bg-ink-raised/85 backdrop-blur px-5 py-4">
      <FocusFilterForm
        v-model="filterData"
        :fields="filterFields"
        :delete="userStore.hasPermissions(['menu:delete'])"
        :add="userStore.hasPermissions(['menu:add'])"
        @search="refresh"
        @reset="refresh"
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
        :data="data?.data"
        :loading="loading"
        :row-key="(row) => row.id"
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
      @save="(val) => handleSave(val as Menu)">
      <template #footer>
        <n-form-item label="图标" path="icon" :disabled="type === 'view'">
          <n-input v-model:value="editFormData.icon" class="mr-4" type="text" placeholder="请输入图标" :disabled="type === 'view'" clearable />
          <n-popover placement="left" trigger="click" :disabled="type === 'view'">
            <template #trigger>
              <n-button v-if="!editFormData.icon" type="primary">选择图标</n-button>
              <NIcon v-else size="20" :component="Icons[editFormData.icon as keyof typeof Icons]" />
            </template>
            <OfIcon @choose="(val) => (editFormData.icon = val)" />
          </n-popover>
        </n-form-item>
      </template>
    </FocusEditModal>
  </div>
</template>

<script lang="ts" setup>
import { type DataTableColumns, NTag, type DataTableRowKey, NIcon, NSwitch, type FormRules, type FormItemRule } from 'naive-ui';
import { addMenu, queryMenuList, type Menu, delMenu, upMenu, disableMenu } from '@/api/menu';
import * as Icons from '@vicons/ionicons5';

const theme = inject<Ref<boolean>>('theme');
const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();

const menuTypeMap = {
  0: { label: '目录', value: 0, type: 'info' },
  1: { label: '菜单', value: 1, type: 'primary' },
  2: { label: '按钮', value: 2, type: 'error' }
};

// 表格 CSS 变量：墨黑表头 + 象牙行背景，呼应编辑杂志美学
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
  .addStatusSelect({ key: 'type', label: '类型', options: CommonOptionMap.menuType })
  .build();

const filterData = ref(generateInitialFormData(filterFields));

const { refresh, status, data } = useAsyncData('menu-list', () => queryMenuList(objArrayToString(filterData.value)), { default: () => ({ data: [] }) });
const loading = computed(() => !['success', 'error'].includes(status.value));

onMounted(() => {
  // 客户端挂载时强制刷新，保证读取到 localStorage 的最新数据
  if (import.meta.client) refresh();
});

const type = ref<'add' | 'edit' | 'view'>('view');
const showEditModal = ref(false);

const tableHeader = computed<DataTableColumns<Menu>>(() => [
  { type: 'selection' },
  { title: 'ID', key: 'id', align: 'center', width: 64 },
  { title: '名称', key: 'name', align: 'center' },
  {
    title: '图标',
    key: 'icon',
    align: 'center',
    width: 72,
    render(row) {
      if (row.icon && typeof row.icon === 'string' && Icons[row.icon as keyof typeof Icons]) {
        return h(NIcon, { size: 18 }, { default: () => h(Icons[row.icon as keyof typeof Icons]) });
      }
      return h('span', { class: 'text-ink-soft dark:text-paper/40 font-mono text-[11px]' }, '—');
    }
  },
  {
    title: '类型',
    key: 'type',
    align: 'center',
    width: 96,
    render(row) {
      const t = Number(row.type) as 0 | 1 | 2;
      const cfg = menuTypeMap[t];
      if (cfg) return h(NTag, { bordered: false, type: cfg.type as any }, { default: () => cfg.label });
      return h('span', {}, String(row.type));
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
          disabled: !userStore.hasPermissions(['menu:disable']),
          'checked-value': 1,
          'unchecked-value': 0,
          'onUpdate:value': async () => {
            if (Number(row.id) === 1) {
              message.error('默认菜单不能禁用');
              return;
            }
            await disableMenu([row.id]);
            refresh();
            refreshNuxtData('empMenuList');
          }
        },
        { checked: () => '启用', unchecked: () => '禁用' }
      );
    }
  },
  { title: '路由', key: 'route', align: 'center' },
  { title: '排序', key: 'order', align: 'center', width: 72, sortOrder: false, sorter: 'default' },
  { title: '标识', key: 'mark', align: 'center' },
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
  getTableActions<Menu>({
    viewBtn: { onClick: handleView },
    editBtn: { onClick: handleEdit, show: userStore.hasPermissions(['menu:update']) },
    deleteBtn: {
      show: userStore.hasPermissions(['menu:delete']),
      onClick: handleDelete
    },
    addBtn: { showFn: (row) => Number(row.type) !== 2 && userStore.hasPermissions(['menu:add']), onClick: handleAdd }
  })
]);

const editFields = new FormFieldBuilder()
  .addNameInput({ key: 'id', label: 'id', span: 2, disabled: true })
  .addNameInput({ key: 'parentId', label: '父级id', span: 2, inputType: 'number' })
  .addNameInput({ key: 'name', label: '名称', span: 2 })
  .addStatusSelect({ key: 'type', label: '类型', options: CommonOptionMap.menuType, span: 2 })
  .addNameInput({ key: 'route', label: '路由地址', span: 2 })
  .addStatusSelect({ key: 'status', label: '状态', options: CommonOptionMap.status, span: 2 })
  .addNameInput({ key: 'order', label: '排序', span: 2, inputType: 'number' })
  .addNameInput({ key: 'mark', label: '标识', span: 2 })
  .build();
const editFormData = ref(generateInitialFormData(editFields));

const editRules: FormRules = {
  name: { required: true, message: '请输入菜单名称', trigger: 'blur' },
  order: {
    required: true,
    message: '请输入排序',
    trigger: 'blur',
    validator: (_rule: FormItemRule, val: number) => val !== undefined && val !== null
  },
  type: [
    {
      required: true,
      message: '请选择类型',
      trigger: 'blur',
      validator: (_rule: FormItemRule, val: number) => {
        if (val === undefined || val === null) return new Error('请选择类型');
        return true;
      }
    }
  ],
  status: [
    {
      required: true,
      message: '请选择状态',
      trigger: 'blur',
      validator: (_rule: FormItemRule, val: number) => {
        if (val === undefined || val === null) return new Error('请选择状态');
        return true;
      }
    }
  ]
};

const editFormTitle = computed(() => {
  switch (type.value) {
    case 'add':
      return '新增菜单';
    case 'edit':
      return '编辑菜单';
    default:
      return '查看菜单';
  }
});

function handleView(row: Menu) {
  type.value = 'view';
  editFormData.value = { ...row };
  editFormData.value.id = row.id.toString();
  editFormData.value.order = row.order.toString();
  showEditModal.value = true;
}

function handleEdit(row: Menu) {
  type.value = 'edit';
  editFormData.value = { ...row };
  editFormData.value.id = row.id.toString();
  editFormData.value.order = row.order.toString();
  showEditModal.value = true;
}

function handleDelete(row: Menu) {
  if (Number(row.id) === 1) {
    message.warning('不能删除默认菜单');
    return;
  }
  dialog.warning({
    title: '警告',
    content: `确定要删除${menuTypeMap[Number(row.type) as keyof typeof menuTypeMap]?.label}：${row.name}吗？`,
    positiveText: '确定',
    negativeText: '取消',
    draggable: true,
    onPositiveClick: () => {
      delMenu([row.id]).then((res) => {
        if (Number(res.code) === 200) {
          message.success('删除成功');
          refresh();
          refreshNuxtData('empMenuList');
        }
      });
    }
  });
}

function handleSave(val: Menu) {
  if (type.value === 'edit') {
    upMenu(val).then((res) => {
      if (Number(res.code) === 200) {
        message.success('更新成功');
        refresh();
        refreshNuxtData('empMenuList');
      }
    });
  } else if (type.value === 'add') {
    const { id, ...rest } = val;
    addMenu(rest).then((res) => {
      if (Number(res.code) === 200) {
        message.success('新增成功');
        refresh();
        refreshNuxtData('empMenuList');
      }
    });
  }
}

const checkedRowKeysRef = ref<DataTableRowKey[]>([]);

function handleCheck(rowKeys: DataTableRowKey[]) {
  checkedRowKeysRef.value = rowKeys;
}

const handleAdd = (row?: Menu) => {
  type.value = 'add';
  editFormData.value = { icon: '', ...generateInitialFormData(editFields) };
  if (row) editFormData.value.parentId = row.id;
  showEditModal.value = true;
};

const handleMultipleDelete = () => {
  if (checkedRowKeysRef.value.length === 0) {
    message.warning('请选择要删除的菜单');
    return;
  }
  if (checkedRowKeysRef.value.includes(1)) {
    message.warning('不能删除默认菜单');
    return;
  }
  dialog.warning({
    title: '警告',
    content: `确定要删除以下${checkedRowKeysRef.value.length}个菜单吗？`,
    positiveText: '确定',
    negativeText: '取消',
    draggable: true,
    onPositiveClick: () => {
      delMenu(checkedRowKeysRef.value as number[]).then((res) => {
        if (Number(res.code) === 200) {
          message.success('删除成功');
          refresh();
          refreshNuxtData('empMenuList');
        }
      });
    }
  });
};
</script>
