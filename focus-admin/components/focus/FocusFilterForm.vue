<template>
  <n-form
    class="flex flex-wrap gap-y-2"
    inline
    label-placement="left"
    label-align="left"
    require-mark-placement="right-hanging"
    :model="formModel"
    @keyup.enter="handleSearch">
    <!-- 动态渲染筛选项 -->
    <n-form-item v-for="field in fields" :key="field.key" :style="'--n-feedback-height: 0'" :label="field.label" :path="field.key">
      <!-- 输入框类型 -->
      <n-input
        v-if="field.type === 'input'"
        v-model:value="formModel[field.key]"
        type="text"
        :allow-input="(value) => onlyAllowInput(value, field.inputType)"
        :placeholder="field.placeholder || `请输入${field.label}`"
        :maxlength="field.maxLength"
        :minlength="field.minLength"
        :style="field.style"
        clearable />

      <!-- 数字输入框类型 -->
      <n-input-number
        v-else-if="field.type === 'number'"
        v-model:value="formModel[field.key]"
        :placeholder="field.placeholder || `请输入${field.label}`"
        :min="field.min"
        :max="field.max"
        :step="field.step"
        :precision="field.precision"
        :style="field.style || 'width: 240px'"
        clearable />

      <!-- 选择器类型 -->
      <n-select
        v-else-if="field.type === 'select'"
        v-model:value="formModel[field.key]"
        :placeholder="field.placeholder || `请选择${field.label}`"
        :style="field.style"
        :multiple="field.multiple || false"
        :options="field.options || []"
        clearable />

      <!-- 日期选择器类型 -->
      <n-date-picker
        v-else-if="isDateField(field)"
        v-model:value="formModel[field.key]"
        :type="field.type as SupportedDatePickerType"
        :placeholder="field.placeholder || `请选择${field.label}`"
        :style="field.style"
        clearable />
    </n-form-item>

    <!-- 操作按钮 -->
    <n-form-item :style="'--n-feedback-height: 0'">
      <n-button class="mr-2.5" secondary strong attr-type="button" type="primary" @click="handleSearch">
        <template #icon>
          <n-icon :component="Search" />
        </template>
        {{ searchText || '搜索' }}
      </n-button>

      <n-button class="mr-2.5" secondary strong attr-type="button" type="warning" @click="handleReset">
        <template #icon>
          <n-icon :component="Refresh" />
        </template>
        {{ resetText || '重置' }}
      </n-button>

      <n-button v-if="props.add" class="mr-2.5" secondary strong attr-type="button" type="info" @click="handleAdd">
        <template #icon>
          <n-icon :component="Add" />
        </template>
        {{ addText || '新增' }}
      </n-button>

      <n-button v-if="props.delete" secondary strong type="error" @click="handleDelete">
        <template #icon>
          <n-icon :component="TrashOutline" />
        </template>
        删除
      </n-button>

      <!-- 自定义额外按钮 -->
      <slot name="extra-buttons" :form-model="formModel" />
    </n-form-item>
  </n-form>
</template>

<script lang="ts" setup>
import { Search, Refresh, Add, TrashOutline } from '@vicons/ionicons5';

type SupportedDatePickerType =
  | 'date'
  | 'datetime'
  | 'daterange'
  | 'datetimerange'
  | 'month'
  | 'year'
  | 'quarter'
  | 'monthrange'
  | 'quarterrange'
  | 'yearrange'
  | 'week';

const DATE_FIELD_TYPES: SupportedDatePickerType[] = ['date', 'datetime', 'daterange', 'datetimerange', 'month', 'year', 'quarter', 'monthrange', 'quarterrange', 'yearrange', 'week'];

/**
 * 组件属性定义
 */
interface Props {
  fields: FormField[]; // 筛选字段配置数组
  searchText?: string; // 搜索按钮文本
  resetText?: string; // 重置按钮文本
  addText?: string; // 新增按钮文本
  add?: boolean; // 新增按钮是否显示
  delete?: boolean; // 删除按钮是否显示
  modelValue?: Record<string, any>; // 表单数据双向绑定
}

/**
 * 组件事件定义
 */
interface Emits {
  search: [formData: Record<string, any>]; // 搜索事件
  reset: []; // 重置事件
  add: []; // 新增事件
  delete: []; // 删除事件
  'update:modelValue': [value: Record<string, any>]; // 双向绑定更新事件
}

const props = withDefaults(defineProps<Props>(), {
  searchText: '搜索',
  resetText: '重置',
  addText: '新增',
  add: false,
  delete: false,
  modelValue: () => ({})
});

const emit = defineEmits<Emits>();

// 表单数据模型
const formModel = ref<Record<string, any>>({});

/**
 * 初始化表单数据
 * 根据字段配置设置默认值
 */
const initFormModel = () => {
  const model: Record<string, any> = {};

  props.fields.forEach((field) => {
    // 优先使用传入的modelValue，其次使用字段默认值
    model[field.key] = props.modelValue[field.key] ?? field.defaultValue;
  });

  formModel.value = model;
};

/**
 * 处理搜索操作
 * 触发搜索事件并传递当前表单数据
 */
const handleSearch = debounce(() => {
  emit('update:modelValue', { ...formModel.value });
  emit('search', { ...formModel.value });
});

/**
 * 处理重置操作
 * 清空表单数据并触发重置事件
 */
const handleReset = debounce(() => {
  const resetModel: Record<string, any> = {};

  props.fields.forEach((field) => {
    resetModel[field.key] = field.defaultValue ?? null;
  });

  formModel.value = resetModel;
  emit('update:modelValue', { ...resetModel });
  emit('reset');
});

/**
 * 处理新增操作
 * 触发新增事件并传递当前表单数据
 */
const handleAdd = debounce(() => {
  emit('add');
});

// 监听字段配置变化，重新初始化表单
watch(() => props.fields, initFormModel, { immediate: true, deep: true });

// 监听表单数据变化，实时更新父组件
watch(
  formModel,
  (newValue) => {
    emit('update:modelValue', { ...newValue });
  },
  { deep: true }
);

/**
 * 处理删除操作
 * 触发删除事件并传递当前表单数据
 */
const handleDelete = debounce(() => {
  emit('delete');
});

function onlyAllowInput(value: string, inputType?: string) {
  if (inputType === 'number') {
    // 只允许数字
    return !value || /^\d+$/.test(value);
  }
  // 无前后空格
  return !value.startsWith(' ') && !value.endsWith(' ');
}

/**
 * 判断筛选字段是否为日期类组件。
 * @param {FormField} field - 当前字段配置
 * @returns {boolean} 是否为日期字段
 */
function isDateField(field: FormField): boolean {
  return DATE_FIELD_TYPES.includes(field.type as SupportedDatePickerType);
}

</script>
