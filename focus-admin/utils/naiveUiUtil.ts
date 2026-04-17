// 通知弹窗
import {createDiscreteApi, NButton, NFloatButton, NGradientText, NPopover, NTooltip} from 'naive-ui';
import { h, ref, inject } from 'vue';

const { notification } = createDiscreteApi(['notification']);
type NotificationType = keyof typeof notification;
export const tips = (type: NotificationType, msg: string) => {
  notification[type]({
    content: msg,
    duration: 2500,
    keepAliveOnHover: true
  });
};

export const useTheme = () => {
  return inject('theme') as Ref<any>;
};

export const themeClass = (className: string) => {
  const theme = useTheme();
  return theme.value ? `${className}-dark` : className;
};

/**
 * 表格操作按钮项配置接口
 * @template T 行数据类型
 */
export interface TableActionBtnItem<T = any> {
  /** 是否显示按钮，默认由各按钮类型决定 */
  show?: boolean;
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 按钮类型 */
  type?: 'primary' | 'info' | 'success' | 'warning' | 'error';
  /** 按钮文本 */
  text?: string;
  /** 是否显示对话框确认 */
  doalog?: boolean;
  /** 按钮颜色（仅适用于部分按钮） */
  color?: string;
  /**
   * 自定义显示逻辑函数，根据行数据决定是否显示按钮
   * @param row 行数据
   * @returns 返回true显示按钮，false不显示
   */
  showFn?: (row: T) => boolean;
  disabledFn?: (row: T) => boolean;
  /**
   * 按钮点击事件处理函数
   * @param row 行数据
   */
  onClick?: (row: T) => void;
}

/**
 * 表格操作列配置接口
 * @template T 行数据类型
 */
export interface TableActionOption<T = any> {
  /** 查看按钮配置 */
  viewBtn?: TableActionBtnItem<T>;
  /** 编辑按钮配置 */
  editBtn?: TableActionBtnItem<T>;
  /** 删除按钮配置 */
  deleteBtn?: TableActionBtnItem<T>;
  /** 添加按钮配置 */
  addBtn?: TableActionBtnItem<T>;
  /** 更多操作按钮数组（如有则以菜单形式展示） */
  moreBtns?: TableActionBtnItem<T>[];
}

/**
 * 生成表格操作列配置
 *
 * @template T 行数据类型
 * @param options 操作列配置选项
 * @returns 操作列配置对象
 */
export function getTableActions<T = any>(options: TableActionOption<T> = {}) {
  // 合并默认配置和用户配置
  const viewBtn = {
    show: true,
    size: 'small' as const,
    type: 'primary' as const,
    text: '查看',
    ...options.viewBtn
  };

  const editBtn = {
    show: true,
    size: 'small' as const,
    type: 'info' as const,
    text: '编辑',
    ...options.editBtn
  };

  const deleteBtn = {
    show: false,
    size: 'small' as const,
    type: 'error' as const,
    text: '删除',
    ...options.deleteBtn
  };
  const addBtn = {
    show: false,
    size: 'small' as const,
    type: 'success' as const,
    text: '添加',
    color: '#626aef',
    ...options.addBtn
  };

  // 创建渲染按钮的通用函数
  const renderButton = (btn: TableActionBtnItem<T>, row: T) => {
    // 如果有自定义显示函数，则使用它来决定是否显示按钮
    if (btn.showFn) {
      // 如果showFn返回false，则不显示按钮
      if (!btn.showFn(row)) {
        return null;
      }
    } else if (!btn.show) {
      // 如果没有showFn但show为false，也不显示按钮
      return null;
    }

    // 渲染按钮
    return h(
      NButton,
      {
        strong: true,
        size: btn.size,
        type: btn.type,
        color: btn.color,
        disabled: btn.disabledFn?.(row),
        onClick: () => btn.onClick?.(row)
      },
      { default: () => btn.text }
    );
  };

  const renderMoreBtns = (btns: TableActionBtnItem<T>[], row: T) => {
    // 过滤掉不显示的按钮
    const visibleBtns = btns.filter((btn) => {
      if (btn.showFn) return btn.showFn(row);
      return btn.show !== false;
    });
    if (visibleBtns.length === 0) return null;

    return h(
      NPopover,
      {
        trigger: 'click'
      },
      {
        default: () =>
          h(
            'div',
            { class: 'flex flex-col gap-1 p-2' },
            visibleBtns.map((btn) =>
              h(
                NButton,
                {
                  size: 'small',
                  type: btn.type || 'default',
                  block: true,
                  onClick: () => btn.onClick?.(row)
                },
                { default: () => btn.text }
              )
            )
          ),
        // 默认显示的按钮内容
        trigger: () => h(NButton, { circle: true }, { default: () => '···' })
      }
    );
  };

  return {
    title: '操作',
    key: 'actions',
    align: 'center' as const,
    fixed: 'right' as const,
    render(row: T) {
      return h('div', { class: 'flex justify-center items-center gap-x-4 gap-y-2 flex-wrap' }, [
        renderButton(viewBtn, row),
        renderButton(editBtn, row),
        renderButton(deleteBtn, row),
        renderButton(addBtn, row),
        // 渲染更多操作按钮（如有）
        options.moreBtns ? renderMoreBtns(options.moreBtns, row) : null
      ]);
    }
  };
}

export function tableHeadTips(title: string = "title", tips: string = "content") {
  return h(NTooltip, null, {
    trigger: () => h(NGradientText, {type: 'danger'}, {default: () => title}),
    default: () => tips
  });
}