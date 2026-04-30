import type { GlobalTheme } from 'naive-ui'
import { darkTheme } from 'naive-ui'

/**
 * 主题切换过渡 composable
 * 使用 View Transition API 实现圆形裁剪动画效果
 */
export const useThemeTransition = () => {
  const theme = useState<GlobalTheme | null>('theme', () => null)
  const isDark = computed(() => theme.value === darkTheme)

  /**
   * 应用主题
   */
  const applyTheme = (targetDark: boolean) => {
    theme.value = targetDark ? darkTheme : null
  }

  /**
   * 处理主题切换，带 View Transition 过渡效果
   */
  const handleThemeToggle = async (event: MouseEvent, targetDark?: boolean) => {
    const shouldBeDark = targetDark ?? !isDark.value

    // 检查是否支持 View Transition API
    const hasViewTransitions =
      typeof document !== 'undefined' &&
      typeof (document as any).startViewTransition === 'function'

    if (!hasViewTransitions) {
      applyTheme(shouldBeDark)
      return
    }

    // 获取点击位置
    const x = event.clientX
    const y = event.clientY

    // 计算圆形裁剪的最大半径
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // 启动 View Transition
    const transition = (document as any).startViewTransition(async () => {
      applyTheme(shouldBeDark)
      await nextTick()
    })

    // 等待 transition ready 后应用动画
    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ]

      // 添加临时 class 用于 CSS 控制 z-index
      document.documentElement.classList.add(
        shouldBeDark ? 'theme-transition-to-dark' : 'theme-transition-to-light'
      )

      const animationOptions: KeyframeAnimationOptions = {
        duration: 520,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards' as FillMode
      }

      if (shouldBeDark) {
        // 切换到 dark mode: 对 old(亮) 应用收缩动画
        document.documentElement.animate(
          { clipPath: [...clipPath].reverse() },
          { ...animationOptions, pseudoElement: '::view-transition-old(root)' }
        )
      } else {
        // 切换到 light mode: 对 new(亮) 应用展开动画
        document.documentElement.animate(
          { clipPath },
          { ...animationOptions, pseudoElement: '::view-transition-new(root)' }
        )
      }

      // 动画结束后移除临时 class
      transition.finished.then(() => {
        document.documentElement.classList.remove(
          'theme-transition-to-dark',
          'theme-transition-to-light'
        )
      })
    })
  }

  /**
   * 切换到指定主题（兼容旧接口）
   */
  const switchTheme = (style: GlobalTheme | null) => {
    theme.value = style
  }

  return {
    theme,
    isDark,
    applyTheme,
    handleThemeToggle,
    switchTheme
  }
}
