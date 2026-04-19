<template>
  <n-modal
    :show="show"
    preset="dialog"
    draggable
    :show-icon="false"
    :bordered="false"
    :title="title"
    style="width: 50vw; overflow: auto"
    @update:show="updateShow">
    <n-form ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="120px">
      <slot name="header" />
      <n-grid :cols="cols" :x-gap="16">
        <n-gi v-for="field in fields" :key="field.key" :span="field.span || cols">
          <n-form-item :label="field.label" :path="field.key" :required="field.required">
            <!-- 输入框类型 -->
            <n-input
              v-if="field.type === 'input'"
              v-model:value="formData[field.key]"
              type="text"
              :allow-input="(value) => onlyAllowInput(value, field.inputType)"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :disabled="field.disabled || disabled"
              :maxlength="field.maxLength"
              :minlength="field.minLength"
              clearable />

            <!-- 数字输入框类型 -->
            <n-input-number
              v-else-if="field.type === 'number'"
              v-model:value="formData[field.key]"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :disabled="field.disabled || disabled"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :precision="field.precision"
              style="width: 100%" />

            <!-- 选择器类型 -->
            <n-select
              v-else-if="field.type === 'select'"
              v-model:value="formData[field.key]"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :multiple="field.multiple || false"
              :options="field.options || []"
              :disabled="field.disabled || disabled"
              clearable />

            <!-- 日期选择器类型 -->
            <n-date-picker
              v-else-if="isDateField(field)"
              v-model:value="formData[field.key]"
              :type="field.type as SupportedDatePickerType"
              :placeholder="field.placeholder || `请选择${field.label}`"
              :disabled="field.disabled || disabled"
              clearable />

            <!-- textarea 类型 -->
            <n-input
              v-else-if="field.type === 'textarea'"
              v-model:value="formData[field.key]"
              type="textarea"
              :allow-input="(value) => onlyAllowInput(value, field.inputType)"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :disabled="field.disabled || disabled"
              clearable />

            <!-- upload -->
            <FocusImageUpload
              v-else-if="field.type === 'upload'"
              :ref="(el) => onUploadRef(field.key, el as unknown as typeof FocusImageUpload)"
              :src="formData[field.key]"
              :is-edit-mode="!isDisabled(field)" />
          </n-form-item>
        </n-gi>
      </n-grid>
      <slot name="footer" />
    </n-form>

    <!-- 操作按钮 -->
    <div class="flex justify-end gap-3 mt-6 pt-4 border-t">
      <n-button @click="handleCancel">取消</n-button>
      <n-button v-if="!disabled" type="primary" :loading="loading" @click="handleSave">保存</n-button>
    </div>
  </n-modal>
</template>

<script lang="ts" setup>
import type { FormInst, FormRules } from 'naive-ui';
import FocusImageUpload from '~/components/focus/FocusImageUpload.vue';
import type { PropType } from 'vue';

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

type FormModel = Record<string, any>;
type UploadRequest = (..._args: any[]) => Promise<Result<string> | null>;
type SaveHandler = (_payload: FormModel) => Promise<any> | any;
const DATE_FIELD_TYPES: SupportedDatePickerType[] = ['date', 'datetime', 'daterange', 'datetimerange', 'month', 'year', 'quarter', 'monthrange', 'quarterrange', 'yearrange', 'week'];
const RANGE_DATE_FIELD_TYPES: SupportedDatePickerType[] = ['daterange', 'datetimerange', 'monthrange', 'quarterrange', 'yearrange'];

const show = defineModel<boolean>('show', { required: true });
const formData = defineModel<FormModel>('formData', { required: true });

const props = defineProps({
  rules: {
    type: Object as PropType<FormRules>,
    default: () => ({})
  },
  title: {
    type: String,
    required: true
  },
  fields: {
    type: Array as PropType<FormField[]>,
    required: true
  },
  // 几个栅格
  cols: {
    type: Number,
    default: 2
  },
  // 图片上传函数（有图片时必传）
  uploadReq: {
    type: Function as PropType<UploadRequest>,
    default: () => Promise.resolve(null)
  },
  // 上传图片时需要的参数
  uploadParams: {
    type: Object as PropType<FormModel>,
    default: () => ({})
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // 保存函数，支持异步操作
  onSave: {
    type: Function as PropType<SaveHandler>,
    default: null
  }
});

const emit = defineEmits(['cancel']);

const message = useMessage();

const formRef = ref<FormInst>();

const imgUploadRefs = ref<Record<string, typeof FocusImageUpload>>({});

/**
 * 上传图片
 * @param {string} key - 图片字段名
 * @param {typeof FocusImageUpload} ref - 图片上传组件实例
 */
function onUploadRef(key: string, ref: typeof FocusImageUpload) {
  imgUploadRefs.value[key] = ref;
}

const loading = ref(false);

/**
 * 更新显示状态
 * @param {boolean} value - 显示状态
 */
function updateShow(value: boolean) {
  show.value = value;
}

// 取消操作
const handleCancel = () => {
  updateShow(false);
  emit('cancel');
};

const handleSave = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch (error) {
    const firstValidationMessage = getFirstValidationMessage(error);
    if (firstValidationMessage) {
      message.warning(firstValidationMessage);
    }
    return;
  }

  loading.value = true;

  try {
    await Promise.all(
      Object.keys(imgUploadRefs.value).map(async (key) => {
        const file = imgUploadRefs.value[key]?.getFile();
        if (file) {
          const result = await uploadImageFile({
            file,
            params: props.uploadParams,
            errorMsg: '图片上传失败',
            req: props.uploadReq as (...args: any[]) => Promise<Result<string>>
          });
          if (result === null) return (loading.value = false);

          if (formData.value && typeof formData.value === 'object') {
            formData.value[key] = result;
          }
        }
      })
    );

    const params = { ...formData.value };
    await (props.onSave as SaveHandler)?.(params);
  } catch (error) {
    console.log(error);
    message.error('失败');
  } finally {
    loading.value = false;
    updateShow(false);
  }
};

function isDisabled(field: FormField) {
  if (field.disabled) return true;
  return props.disabled;
}

function onlyAllowInput(value: string, inputType?: string) {
  if (inputType && inputType === 'number') {
    return !value || /^\d+$/.test(value);
  }
  // 无前后空格
  return !value.startsWith(' ') && !value.endsWith(' ');
}

/**
 * 提取表单校验的第一条错误信息，便于在保存失败时直接提示用户。
 * @param {unknown} error - validate 抛出的错误对象
 * @returns {string} 第一条错误文案
 */
function getFirstValidationMessage(error: unknown): string {
  if (!Array.isArray(error)) return '';

  const firstErrorGroup = error[0];
  if (!Array.isArray(firstErrorGroup) || firstErrorGroup.length === 0) return '';

  const firstError = firstErrorGroup[0] as { message?: string } | undefined;
  return firstError?.message || '';
}

/**
 * 判断当前字段是否应当使用数字输入组件。
 * 仅真正声明为 number 类型的字段才使用数字输入框，
 * inputType=number 仍然沿用原文本输入框，避免影响旧业务。
 * @param {FormField} field - 当前字段配置
 * @returns {boolean} 是否为数字输入字段
 */
function isNumberField(field: FormField): boolean {
  return field.type === 'number';
}

/**
 * 判断当前字段是否为日期类组件。
 * @param {FormField} field - 当前字段配置
 * @returns {boolean} 是否为日期类字段
 */
function isDateField(field: FormField): boolean {
  return DATE_FIELD_TYPES.includes(field.type as SupportedDatePickerType);
}

/**
 * 将外部传入的值归一化为数字，避免旧页面把数字以字符串形式传入时无法正常回显。
 * @param {any} value - 当前字段值
 * @returns {number | null | any} 归一化后的数字值
 */
function normalizeNumberValue(value: any): number | null | any {
  if (value === '' || value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;

    const numericValue = Number(trimmedValue);
    return Number.isNaN(numericValue) ? value : numericValue;
  }

  return value;
}

/**
 * 将外部传入的日期值统一转换为时间戳，兼容字符串、Date 对象和时间范围数组。
 * @param {any} value - 当前字段值
 * @param {FormField} field - 当前字段配置
 * @returns {number | [number, number] | null | any} 归一化后的日期值
 */
function normalizeDateValue(value: any, field: FormField): number | [number, number] | null | any {
  if (value === '' || value === undefined || value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    const normalizedRange = value.map((item) => convertSingleDateValue(item));
    if (normalizedRange.every((item): item is number => typeof item === 'number')) {
      return normalizedRange as [number, number];
    }
    return value;
  }

  if (RANGE_DATE_FIELD_TYPES.includes(field.type as SupportedDatePickerType)) {
    return value;
  }

  return convertSingleDateValue(value);
}

/**
 * 将单个日期值转换为时间戳。
 * @param {any} value - 单个日期值
 * @returns {number | null | any} 转换结果
 */
function convertSingleDateValue(value: any): number | null | any {
  if (value === '' || value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? null : value;
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  if (typeof value === 'string') {
    const timestamp = new Date(value).getTime();
    return Number.isNaN(timestamp) ? value : timestamp;
  }

  return value;
}

/**
 * 根据字段配置对表单值做就地归一化，保证数字与日期字段能被对应控件正确识别。
 */
function normalizeFormData() {
  if (!formData.value || typeof formData.value !== 'object') return;

  props.fields.forEach((field) => {
    if (!(field.key in formData.value)) return;

    if (isNumberField(field)) {
      formData.value[field.key] = normalizeNumberValue(formData.value[field.key]);
      return;
    }

    if (isDateField(field)) {
      formData.value[field.key] = normalizeDateValue(formData.value[field.key], field);
    }
  });
}

/**
 * 弹窗打开或字段配置变化时重新归一化表单数据，
 * 这样既兼容旧数据结构，也能让新增的数字与时间类型立即生效。
 */
watch(
  () => [show.value, props.fields],
  ([visible]) => {
    if (!visible) return;
    normalizeFormData();
  },
  { deep: true, immediate: true }
);
</script>
