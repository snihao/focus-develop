// https://nuxt.com/docs/api/configuration/nuxt-config
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  ssr: false,
  runtimeConfig: {
    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL,
      WS_URL: process.env.NUXT_PUBLIC_WS_URL,
    },
  },

  build: {
    transpile: ['vueuc', 'naive-ui', '@css-render/vue3-ssr'],
  },

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  },

  modules: ['nuxtjs-naive-ui', '@pinia/nuxt', '@vueuse/nuxt', '@nuxtjs/color-mode'],

  css: ['~/assets/css/tailwind.scss'],

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/css/constant.scss" as *;',
        },
      },
    },
    plugins: [
      AutoImport({
        imports: [
          {
            'naive-ui': ['useDialog', 'useMessage', 'useNotification', 'useLoadingBar'],
          },
          'vue',
          'vue-router',
        ],
      }),
      Components({
        resolvers: [NaiveUiResolver()],
      }),
    ],
  },

  app: {
    head: {
      title: 'Nuxt Electron App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Nuxt 3 + Electron 桌面应用' },
      ],
    },
  },

  router: {
    options: {
      hashMode: true,
    },
  },
})
