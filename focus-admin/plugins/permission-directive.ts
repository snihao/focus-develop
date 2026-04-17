/**
 * 权限验证自定义指令插件
 * 提供 v-permission 指令用于权限验证和登录状态检查
 */

import type { DirectiveBinding } from 'vue';
import { createDiscreteApi } from 'naive-ui';

const { notification } = createDiscreteApi(['notification']);

/**
 * 权限指令配置接口
 */
interface PermissionDirectiveValue {
  /** 权限列表 */
  permissions?: string[];
  /** 回调函数 */
  callback?: () => void | Promise<void>;
  /** 提示消息 */
  message?: string;
  /** 是否显示消息 */
  showMessage?: boolean;
  /** 权限验证模式：'login' 仅检查登录状态，'permission' 检查具体权限 */
  mode?: 'login' | 'permission';
  /** 当权限不足时的行为：'hide' 隐藏元素，'disable' 禁用元素，'callback' 执行回调 */
  onDenied?: 'hide' | 'disable' | 'callback';
  /** 权限不足时的回调函数 */
  onDeniedCallback?: () => void | Promise<void>;
}

type PermissionDirective = PermissionDirectiveValue | (() => void | Promise<void>) | string | string[];

/**
 * 扩展HTMLElement类型，添加自定义属性
 */
interface ExtendedHTMLElement extends HTMLElement {
  __permissionHandler?: (event: Event) => void;
  __originalDisplay?: string; // 原始display属性值
  __originalDisabled?: boolean; // 原始disabled属性值
  __permissionWatcher?: () => void; // 权限状态监听器清理函数
  __originalClickHandlers?: EventListener[]; // 原始点击事件处理器列表
  __originalOnclick?: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null; // 原始onclick属性
}

/**
 * 处理权限验证逻辑
 * @param el 绑定的DOM元素
 * @param binding 指令绑定对象
 */
const handlePermissionCheck = (el: ExtendedHTMLElement, binding: DirectiveBinding<PermissionDirective>) => {
  // 解析指令值
  let options: PermissionDirectiveValue;

  if (typeof binding.value === 'function') {
    // 如果传入的是函数，则作为回调函数，默认为登录验证模式
    options = {
      callback: binding.value,
      mode: 'login'
    };
  } else if (typeof binding.value === 'string') {
    // 如果传入的是字符串，则作为权限验证模式
    options = {
      permissions: [binding.value]
    };
  } else if (Array.isArray(binding.value)) {
    // 如果传入的是数组，则作为权限列表
    options = {
      permissions: binding.value
    };
  } else {
    // 如果传入的是对象，则使用对象配置
    options = binding.value || {};
  }

  const {
    permissions = [],
    callback,
    message: tipMessage = '您没有权限执行此操作',
    showMessage = true,
    mode = 'permission',
    onDenied = 'hide',
    onDeniedCallback
  } = options;

  // 移除之前的事件监听器和权限监听器（如果存在）
  const existingHandler = el.__permissionHandler;
  if (existingHandler) {
    el.removeEventListener('click', existingHandler, true);
  }

  // 恢复之前保存的原始onclick事件处理器
  if (el.__originalOnclick !== undefined) {
    el.onclick = el.__originalOnclick;
    delete el.__originalOnclick;
  }

  const existingWatcher = el.__permissionWatcher;
  if (existingWatcher) {
    existingWatcher();
  }

  const userStore = useUserStore();

  // 创建响应式的权限检查函数
  const updatePermissionState = () => {
    // 执行权限检查
    const hasPermission = mode === 'login' ? userStore.isLogin : userStore.hasPermissions(permissions);

    // 根据权限检查结果处理元素
    if (!hasPermission) {
      switch (onDenied) {
        case 'hide':
          // 隐藏元素
          if (el.__originalDisplay === undefined) {
            el.__originalDisplay = el.style.display || '';
          }
          el.style.display = 'none';
          return;

        case 'disable':
          // 禁用元素
          if (el.__originalDisabled === undefined) {
            el.__originalDisabled = (el as any).disabled || false;
          }
          (el as any).disabled = true;
          el.style.opacity = '0.5';
          el.style.cursor = 'not-allowed';
          return;

        case 'callback':
        default:
          break;
      }
    } else {
      // 有权限时，恢复元素状态
      if (el.__originalDisplay !== undefined) {
        el.style.display = el.__originalDisplay;
        delete el.__originalDisplay;
      }

      if (el.__originalDisabled !== undefined) {
        (el as any).disabled = el.__originalDisabled;
        el.style.opacity = '';
        el.style.cursor = '';
        delete el.__originalDisabled;
      }
    }
  };

  // 初始执行权限检查
  updatePermissionState();

  // 设置响应式监听器，当权限状态变化时自动更新
  const stopWatcher = watch(
    () => (mode === 'login' ? userStore.isLogin : userStore.permissions),
    () => {
      updatePermissionState();
    },
    { deep: true }
  );

  // 保存监听器清理函数
  el.__permissionWatcher = stopWatcher;

  // 保存并移除原始的点击事件处理器
  const saveAndRemoveOriginalHandlers = () => {
    // 保存原始的onclick属性
    if (el.onclick && !el.__originalOnclick) {
      el.__originalOnclick = el.onclick;
      el.onclick = null;
    }
  };

  // 恢复原始的点击事件处理器
  const restoreOriginalHandlers = () => {
    if (el.__originalOnclick !== undefined) {
      el.onclick = el.__originalOnclick;
    }
  };

  // 创建新的事件处理器
  const permissionHandler = async (event: Event) => {
    // 实时获取当前权限状态
    const currentHasPermission = mode === 'login' ? userStore.isLogin : userStore.hasPermissions(permissions);

    // 如果有权限
    if (currentHasPermission) {
      // 先执行指令中的回调函数
      if (callback) {
        try {
          await callback();
        } catch (error) {
          console.error('❌ 执行权限验证后操作时发生错误:', error);
        }
      }

      // 然后执行原始的onclick事件（如果存在）
      if (el.__originalOnclick) {
        try {
          await el.__originalOnclick.call(el, event as MouseEvent);
        } catch (error) {
          console.error('❌ 执行原始onclick事件时发生错误:', error);
        }
      }

      return;
    }

    // 没有权限时的处理
    event.preventDefault(); // 阻止默认事件
    event.stopPropagation(); // 阻止事件冒泡
    event.stopImmediatePropagation(); // 阻止同一元素上的其他事件监听器执行

    if (mode === 'login') {
      // 登录验证模式
      if (showMessage) {
        notification.warning({ content: tipMessage });
      }
      navigateTo('/');
    } else {
      // 权限验证模式
      const permissionMessage = tipMessage || `您没有执行此操作的权限，需要权限：${permissions.join(', ')}`;
      if (showMessage) {
        notification.warning({ content: permissionMessage });
      }

      // 执行权限不足时的回调
      if (onDeniedCallback) {
        try {
          await onDeniedCallback();
        } catch (error) {
          console.error('❌ 执行权限不足回调时发生错误:', error);
        }
      }
    }
  };

  // 保存原始事件处理器
  saveAndRemoveOriginalHandlers();

  // 绑定权限验证事件监听器（使用捕获阶段，确保在其他事件之前执行）
  el.addEventListener('click', permissionHandler, true);

  // 保存事件处理器引用，用于后续清理
  el.__permissionHandler = permissionHandler;
};

/**
 * 权限验证指令定义
 */
const permissionDirective = {
  /**
   * 指令挂载时
   */
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionDirective>) {
    handlePermissionCheck(el as ExtendedHTMLElement, binding);
  },

  /**
   * 指令更新时
   */
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionDirective>) {
    handlePermissionCheck(el as ExtendedHTMLElement, binding);
  },

  /**
   * 指令卸载时
   */
  unmounted(el: HTMLElement) {
    const extendedEl = el as ExtendedHTMLElement;

    // 清理事件监听器
    const existingHandler = extendedEl.__permissionHandler;
    if (existingHandler) {
      el.removeEventListener('click', existingHandler, true);
      delete extendedEl.__permissionHandler;
    }

    // 恢复原始的onclick事件处理器
    if (extendedEl.__originalOnclick !== undefined) {
      el.onclick = extendedEl.__originalOnclick;
      delete extendedEl.__originalOnclick;
    }

    // 清理权限状态监听器
    const existingWatcher = extendedEl.__permissionWatcher;
    if (existingWatcher) {
      existingWatcher();
      delete extendedEl.__permissionWatcher;
    }

    // 恢复元素原始状态
    if (extendedEl.__originalDisplay !== undefined) {
      el.style.display = extendedEl.__originalDisplay;
      delete extendedEl.__originalDisplay;
    }

    if (extendedEl.__originalDisabled !== undefined) {
      (el as any).disabled = extendedEl.__originalDisabled;
      el.style.opacity = '';
      el.style.cursor = '';
      delete extendedEl.__originalDisabled;
    }
  }
};

export default defineNuxtPlugin((nuxtApp) => {
  // 注册全局指令
  nuxtApp.vueApp.directive('permission', permissionDirective);
});
