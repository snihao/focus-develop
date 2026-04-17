// https://nuxt.com/docs/api/configuration/nuxt-config
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL,
      FILTER_ROUTES: process.env.NUXT_PUBLIC_FILTER_ROUTES || '',
      ENV: process.env.NUXT_PUBLIC_ENV,
      RSA_PUBLIC_KEY: process.env.NUXT_PUBLIC_RSA_PUBLIC_KEY || ''
    }
  },
  build: {
    transpile: ['vueuc', 'naive-ui', '@css-render/vue3-ssr']
  },
  routeRules: {},
  modules: ['nuxtjs-naive-ui', '@pinia/nuxt', '@nuxt/eslint', '@nuxtjs/stylelint-module'],
  // ESLint 模块配置
  eslint: {
    config: {
      stylistic: false
    }
  },
  // Stylelint 模块配置
  stylelint: {
    // 启用缓存以提高性能
    cache: true,
    // 检查的文件类型
    include: ['**/*.{css,scss,sass,vue}'],
    // 排除的文件和目录
    exclude: ['**/node_modules/**', 'virtual:', '.nuxt/**', '.output/**'],
    // 在项目启动时进行检查
    lintOnStart: false,
    // 只检查修改的文件
    lintDirtyOnly: true,
    // 显示警告
    emitWarning: true,
    // 显示错误
    emitError: true,
    // 警告时不中断构建
    failOnWarning: false,
    // 错误时中断构建
    failOnError: false
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },
  css: ['~/assets/css/theme.scss', '~/assets/css/tailwind.scss'],
  $production: {
    routeRules: {
      '/**': { isr: true }
    }
  },
  vite: {
    ssr: {
      noExternal: ['naive-ui', 'vueuc', '@css-render/vue3-ssr']
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/css/constant.scss" as *;'
        }
      }
    },
    plugins: [
      AutoImport({
        imports: [
          {
            'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar']
          },
          'vue',
          'vue-router'
        ]
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      })
    ],
    build:{
      target: 'esnext'
    },
    esbuild: {
      // drop: process.env.NUXT_PUBLIC_ENV !== 'development' ? ['console', 'debugger'] : [],
      // pure: process.env.NUXT_PUBLIC_ENV !== 'development' ? ['console.log', 'console.error', 'console.warn', 'console.debug', 'console.trace'] : []
    }
  },
  app: {
    baseURL: '/admin/',
    // pageTransition: { name: 'slide-left', mode: 'out-in' },
    head: {
      title: 'Focus Admin'
    }
  }
});
