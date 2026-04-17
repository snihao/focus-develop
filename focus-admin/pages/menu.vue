@ -0,0 +1,57 @@
<template>
  <div class="w-full h-full p-1.5">
    <div class="p-3 box-border mb-2.5 sticky top-0 z-[999] shadow-sm rounded-xl" :class="themeClass('box-bg')">
      <FocusFilterForm
        v-model="filterData"
        :fields="filterFields"
        :delete="userStore.hasPermissions(['menu:delete'])"
        :add="userStore.hasPermissions(['menu:add'])"
        @search="refresh"
        @reset="refresh"
        @add="handleAdd"
        @delete="handleMultipleDelete" />
    </div>

    <n-data-table
      :style="`--n-merged-th-color:${theme ? '#35364E' : '#DBDDF4'}`"
      :bordered="false"
      :single-line="false"
      :columns="tableHeader"
      :data="data?.data"
      :loading="loading"
      :row-key="(row) => row.id"
      remote
      @update:checked-row-keys="handleCheck" />

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

// definePageMeta({
//   permissions: ['menu:add']
// });

const theme = inject<Ref<boolean>>('theme');
const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();

const menuTypeMap = {
  0: {
    label: '目录',
    value: 0,
    type: 'info'
  },
  1: {
    label: '菜单',
    value: 1,
    type: 'primary'
  },
  2: {
    label: '按钮',
    value: 2,
    type: 'error'
  }
};

const filterFields = new FormFieldBuilder()
  .addNameInput({ key: 'name', label: '名称' })
  .addNameInput({ key: 'mark', label: '标识' })
  .addStatusSelect({ key: 'status', label: '状态', options: CommonOptionMap.status })
  .addStatusSelect({ key: 'type', label: '类型', options: CommonOptionMap.menuType })
  .build();

const filterData = ref(generateInitialFormData(filterFields));

const { refresh, status, data } = useAsyncData('menu-list', () => queryMenuList(objArrayToString(filterData.value)), { default: () => ({ data: [] }) });
const loading = computed(() => {
  return !['success', 'error'].includes(status.value);
});

onMounted(() => {
  if (import.meta.client && !data.value.data.length) {
    refresh();
  }
});

const type = ref<'add' | 'edit' | 'view'>('view');
const showEditModal = ref(false);

const tableHeader = computed<DataTableColumns<Menu>>(() => [
  {
    type: 'selection'
  },
  { title: 'id', key: 'id', align: 'center' },
  { title: '名称', key: 'name', align: 'center' },
  {
    title: '图标',
    key: 'icon',
    align: 'center',
    render(row) {
      // 如果row.icon存在且是字符串，则动态渲染图标
      if (row.icon && typeof row.icon === 'string' && Icons[row.icon as keyof typeof Icons]) {
        return h(NIcon, { size: 20 }, { default: () => h(Icons[row.icon as keyof typeof Icons]) });
      }
      // 如果图标不存在或无效，显示默认图标或空白
      return h('div', { class: 'w-6 h-6' }, { default: () => h(NIcon, null, { default: () => h(Icons.HelpCircleOutline) }) });
    }
  },
  {
    title: '类型',
    key: 'type',
    align: 'center',
    render(row) {
      const type = Number(row.type) as 0 | 1 | 2;
      const typeConfig = menuTypeMap[type];
      // 如果找到对应的类型配置，显示标签；否则显示原始值
      if (typeConfig) {
        return h(NTag, { type: typeConfig.type as any }, { default: () => typeConfig.label });
      }
      // 如果没有找到对应配置，直接显示数字
      return h('span', {}, { default: () => String(row.type) });
    }
  },
  {
    title: '状态',
    key: 'status',
    align: 'center',
    render(row) {
      return h(
        NSwitch,
        {
          value: Number(row.status),
          disabled: !userStore.hasPermissions(['menu:disable']),
          'checked-value': 1,
          'unchecked-value': 0,
          'onUpdate:value': async (val: number) => {
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
  {
    title: '路由',
    key: 'route',
    align: 'center'
  },
  {
    title: '排序',
    key: 'order',
    align: 'center',
    sortOrder: false,
    sorter: 'default'
  },
  {
    title: '标识',
    key: 'mark',
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
  name: {
    required: true,
    message: '请输入菜单名称',
    trigger: 'blur'
  },
  order: {
    required: true,
    message: '请输入排序',
    trigger: 'blur',
    validator: (rule: FormItemRule, val: number) => {
      if (val === undefined || val === null) {
        return false;
      }
      return true;
    }
  },
  type: [
    {
      required: true,
      message: '请选择类型',
      trigger: 'blur',
      validator: (rule: FormItemRule, val: number) => {
        if (val === undefined || val === null) {
          return new Error('请选择类型');
        }
        return true;
      }
    }
  ],
  status: [
    {
      required: true,
      message: '请选择状态',
      trigger: 'blur',
      validator: (rule: FormItemRule, val: number) => {
        if (val === undefined || val === null) {
          return new Error('请选择状态');
        }
        return true;
      }
    }
  ]
  // mark: {
  //   required: true,
  //   message: '请输入标识',
  //   trigger: 'blur'
  // }
};

const editFormTitle = computed(() => {
  switch (type.value) {
    case 'add':
      return '新增菜单';
    case 'edit':
      return '编辑菜单';
    case 'view':
      return '查看菜单';
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

/**
 * 处理新增操作
 * 触发新增事件并传递当前表单数据
 */
const handleAdd = (row?: Menu) => {
  type.value = 'add';
  editFormData.value = { icon: '', ...generateInitialFormData(editFields) };
  if (row) {
    editFormData.value.parentId = row.id;
  }
  showEditModal.value = true;
};

/**
 * 处理删除操作
 * 触发删除事件并传递当前表单数据
 */
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
