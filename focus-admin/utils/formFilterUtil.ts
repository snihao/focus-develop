import type { SelectOption } from 'naive-ui';

export type FormDateFieldType =
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

export type SingleDateFieldType = 'date' | 'datetime' | 'month' | 'year' | 'quarter' | 'week';
export type RangeDateFieldType = 'daterange' | 'datetimerange' | 'monthrange' | 'quarterrange' | 'yearrange';

export interface FormField {
  key: string; // 字段键名
  label: string; // 字段标签
  type: 'input' | 'number' | 'select' | FormDateFieldType | 'textarea' | 'upload'; // 字段类型
  required?: boolean; // 是否必填
  placeholder?: string; // 占位符文本
  style?: Record<string, string | number> | string; // 自定义样式
  options?: SelectOption[]; // 选择器选项（仅select类型使用）
  defaultValue?: unknown; // 默认值
  multiple?: boolean; // 多选（仅select类型使用）
  span?: number; // 网格跨度（默认1）
  disabled?: boolean; // 是否禁用
  inputType?: string;
  maxLength?: number;
  minLength?: number;
  min?: number; // 数字输入最小值
  max?: number; // 数字输入最大值
  step?: number; // 数字输入步长
  precision?: number; // 数字输入精度
}

const genderOptions = [
  {
    label: '男',
    value: 1
  },
  {
    label: '女',
    value: 0
  }
];

const statusOptions = [
  {
    label: '正常',
    value: 1
  },
  {
    label: '禁用',
    value: 0
  }
];

const menuTypeOptions = [
  {
    label: '目录',
    value: 0
  },
  {
    label: '菜单',
    value: 1
  },
  {
    label: '按钮',
    value: 2
  }
];

export const CommonOptionMap = {
  gender: genderOptions,
  status: statusOptions,
  menuType: menuTypeOptions
};

/**
 * 表单字段配置生成器
 */
export class FormFieldBuilder {
  private fields: FormField[] = [];

  // 是否为行内表单
  private inline?: boolean;

  /**
   * 构造函数
   */
  constructor(inline?: boolean) {
    this.inline = inline ?? true;
  }

  /**
   * 通用字段添加方法
   * @param fieldConfig 字段配置对象
   * @private
   */
  private addField(fieldConfig: FormField): FormFieldBuilder {
    this.fields.push(fieldConfig);
    return this;
  }

  /**
   * 创建基础字段配置
   * @param type 字段类型
   * @param key 字段键名
   * @param label 字段标签
   * @param style 自定义样式
   * @param placeholder 占位符文本
   * @param additionalConfig 额外配置
   * @private
   */
  private createBaseField(
    type: FormField['type'],
    key: string,
    label: string,
    style: Record<string, string | number> | string | undefined,
    placeholder?: string,
    additionalConfig: Partial<FormField> = {}
  ): FormField {
    return {
      key,
      label,
      type,
      placeholder: placeholder || this.generatePlaceholder(type, label),
      style,
      ...additionalConfig
    };
  }

  /**
   * 生成默认占位符文本
   * @param type 字段类型
   * @param label 字段标签
   * @private
   */
  private generatePlaceholder(type: string, label: string): string {
    const placeholderMap: Record<string, string> = {
      input: `请输入${label}`,
      number: `请输入${label}`,
      select: `请选择${label}`,
      date: `请选择${label}`,
      datetime: `请选择${label}`,
      month: `请选择${label}`,
      year: `请选择${label}`,
      quarter: `请选择${label}`,
      week: `请选择${label}`,
      daterange: `请选择${label}`,
      datetimerange: `请选择${label}`,
      monthrange: `请选择${label}`,
      quarterrange: `请选择${label}`,
      yearrange: `请选择${label}`
    };
    return placeholderMap[type] || `请输入${label}`;
  }

  /**
   * 添加名称输入框
   * @param options 配置选项对象
   * @param options.key 字段键名，默认为 'name'
   * @param options.label 字段标签，默认为 '名称'
   * @param options.placeholder 占位符文本，如果不提供则自动生成
   * @param options.style 自定义样式，默认为 'width: 240px'
   */
  addNameInput(
    options: {
      key?: string;
      label?: string;
      placeholder?: string;
      style?: Record<string, string | number> | string;
      span?: number;
      required?: boolean;
      disabled?: boolean;
      inputType?: string;
      maxLength?: number;
      minLength?: number;
      min?: number;
      max?: number;
      step?: number;
      precision?: number;
    } = {}
  ): FormFieldBuilder {
    const {
      key = 'name',
      label = '名称',
      placeholder,
      style = this.inline ? 'width: 240px' : undefined,
      span = 1,
      required = false,
      disabled = false,
      inputType = '',
      maxLength,
      minLength,
      min,
      max,
      step,
      precision
    } = options;

    return this.addField(
      this.createBaseField('input', key, label, style, placeholder, {
        defaultValue: '',
        span,
        required,
        disabled,
        inputType,
        maxLength,
        minLength,
        min,
        max,
        step,
        precision
      })
    );
  }

  /**
   * 添加数字输入框
   * @param options 配置选项对象
   * @param options.key 字段键名，默认为 'number'
   * @param options.label 字段标签，默认为 '数字'
   * @param options.placeholder 占位符文本，如果不提供则自动生成
   * @param options.style 自定义样式，默认为 'width: 240px'
   */
  addNumberInput(
    options: {
      key?: string;
      label?: string;
      placeholder?: string;
      style?: Record<string, string | number> | string;
      span?: number;
      required?: boolean;
      disabled?: boolean;
      defaultValue?: number | null;
      min?: number;
      max?: number;
      step?: number;
      precision?: number;
    } = {}
  ): FormFieldBuilder {
    const {
      key = 'number',
      label = '数字',
      placeholder,
      style = this.inline ? 'width: 240px' : undefined,
      span = 1,
      required = false,
      disabled = false,
      defaultValue = null,
      min,
      max,
      step,
      precision
    } = options;

    return this.addField(
      this.createBaseField('number', key, label, style, placeholder, {
        defaultValue,
        span,
        required,
        disabled,
        min,
        max,
        step,
        precision
      })
    );
  }

  /**
   * 添加状态选择器
   * @param options 配置选项对象
   * @param options.key 字段键名，默认为 'status'
   * @param options.label 字段标签，默认为 '状态'
   * @param options.options 选项数组，默认为 STATUS_OPTIONS
   * @param options.style 自定义样式，默认为 'width: 240px'
   * @param options.multiple 是否多选，默认为 false
   */
  addStatusSelect(
    options: {
      key?: string;
      label?: string;
      options?: { label: string; value: string | number }[];
      style?: Record<string, string | number> | string;
      multiple?: boolean;
      span?: number;
      required?: boolean;
      defaultValue?: string | number | (string | number)[];
      disabled?: boolean;
    } = {}
  ): FormFieldBuilder {
    const {
      key = 'status',
      label = '状态',
      options: selectOptions,
      style = this.inline ? 'min-width: 240px' : '',
      multiple = false,
      span = 1,
      required = false,
      defaultValue,
      disabled = false
    } = options;

    // 根据是否多选设置默认值
    const finalDefaultValue = defaultValue ?? (multiple ? [] : null);

    return this.addField(
      this.createBaseField('select', key, label, style, undefined, {
        options: selectOptions,
        multiple,
        defaultValue: finalDefaultValue,
        span,
        required,
        disabled
      })
    );
  }

  /**
   * 添加日期选择器
   * @param options 配置选项对象
   * @param options.key 字段键名，默认为 'date'
   * @param options.label 字段标签，默认为 '日期'
   * @param options.style 自定义样式，默认为 'width: 240px'
   */
  addDatePicker(
    options: {
      key?: string;
      label?: string;
      style?: Record<string, string | number> | string;
      span?: number;
      required?: boolean;
      disabled?: boolean;
      dateType?: SingleDateFieldType;
    } = {}
  ): FormFieldBuilder {
    const {
      key = 'date',
      label = '日期',
      style = this.inline ? 'width: 240px' : '',
      span = 1,
      required = false,
      disabled = false,
      dateType = 'date'
    } = options;
    const fieldType: FormField['type'] = dateType;

    return this.addField(
      this.createBaseField(fieldType, key, label, style, undefined, {
        defaultValue: null,
        span,
        required,
        disabled
      })
    );
  }

  /**
   * 添加日期范围选择器
   * @param options 配置选项对象
   * @param options.key 字段键名，默认为 'dateRange'
   * @param options.label 字段标签，默认为 '日期范围'
   * @param options.style 自定义样式，默认为 'width: 280px'
   */
  addDateRangePicker(
    options: {
      key?: string;
      label?: string;
      style?: Record<string, string | number> | string;
      span?: number;
      required?: boolean;
      disabled?: boolean;
      dateType?: RangeDateFieldType;
    } = {}
  ): FormFieldBuilder {
    const {
      key = 'dateRange',
      label = '日期范围',
      style = this.inline ? 'width: 280px' : '',
      span = 1,
      required = false,
      disabled = false,
      dateType = 'daterange'
    } = options;
    const fieldType: FormField['type'] = dateType;

    return this.addField(
      this.createBaseField(fieldType, key, label, style, undefined, {
        defaultValue: null,
        span,
        required,
        disabled
      })
    );
  }

  /**
   * 添加文本区域
   * @param options 配置选项对象
   * @param options.key 字段键名，默认为 'textarea'
   * @param options.label 字段标签，默认为 '文本区域'
   */
  addTextarea(
    options: {
      key?: string;
      label?: string;
      style?: Record<string, string | number> | string;
      span?: number;
      required?: boolean;
      disabled?: boolean;
    } = {}
  ): FormFieldBuilder {
    const { key = 'textarea', label = '文本区域', span = 1, required = false, disabled = false } = options;

    return this.addField(
      this.createBaseField('textarea', key, label, '', undefined, {
        defaultValue: '',
        span,
        required,
        disabled
      })
    );
  }

  addUpload(
    options: {
      key?: string;
      label?: string;
      style?: Record<string, string | number> | string;
      span?: number;
      required?: boolean;
      disabled?: boolean;
    } = {}
  ): FormFieldBuilder {
    const { key = 'upload', label = '上传', span = 1, required = false, disabled = false } = options;

    return this.addField(
      this.createBaseField('upload', key, label, '', undefined, {
        defaultValue: '',
        span,
        required,
        disabled
      })
    );
  }

  /**
   * 添加自定义字段
   * @param field 字段配置
   */
  addCustomField(field: FormField): FormFieldBuilder {
    this.fields.push(field);
    return this;
  }

  /**
   * 构建字段配置数组
   */
  build(): FormField[] {
    return [...this.fields];
  }

  removeField(key: string) {
    this.fields = this.fields.filter((field) => field.key !== key);
    return this;
  }

  /**
   * 重置构建器
   */
  reset(): FormFieldBuilder {
    this.fields = [];
    return this;
  }
}

/**
 * 生成表单的初始数据
 * @param fields 字段配置数组
 * @returns 初始表单数据对象
 */
export function generateInitialFormData(fields: FormField[]): Record<string, any> {
  const initialData: Record<string, any> = {};

  fields.forEach((field) => {
    initialData[field.key] = field.defaultValue;
  });

  return initialData;
}
