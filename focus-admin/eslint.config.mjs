import withNuxt from './.nuxt/eslint.config.mjs';
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default withNuxt([
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.es2021 },
      ecmaVersion: 'latest',
      parser: tseslint.parser
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'], // Vue3
  {
    rules: {
      'no-undef': 'off', // 禁用未定义变量检查
      'no-unused-vars': 'warn', // 禁用未使用变量检查
      '@typescript-eslint/no-unused-vars': 'warn', // 禁用 TypeScript 未使用变量检查
      '@typescript-eslint/no-explicit-any': 'warn', // 禁用 any 类型检查
      '@typescript-eslint/ban-ts-comment': 'off', // 禁用 @ts-ignore 等注释检查
      '@typescript-eslint/no-empty-object-type': 'warn', // 禁用空对象类型检查
      'vue/multi-word-component-names': 'off', // 禁用 Vue 组件名必须多单词检查
      'vue/no-multiple-template-root': 'warn', // 禁用多个根元素检查
      'vue/no-v-model-argument': 'off', // 禁用 v-model 参数检查
      'vue/require-default-prop': 'warn', // 禁用必须有默认值检查
      'vue/require-prop-types': 'warn', // 禁用必须有 prop 类型检查
      'vue/no-reserved-component-names': 'warn', // 禁用保留组件名检查
      'vue/valid-template-root': 'warn', // 禁用模板根元素检查
      'vue/no-deprecated-slot-attribute': 'warn', // 禁用废弃 slot 属性检查
      'vue/no-deprecated-slot-scope-attribute': 'warn', // 禁用废弃 slot-scope 属性检查
      'vue/max-attributes-per-line': 'off', // 禁用每行最大属性数检查
      'vue/singleline-html-element-content-newline': 'off', // 禁用单行元素内容换行检查
      'vue/html-closing-bracket-newline': 'warn', // 禁用闭合括号换行检查
      'vue/html-indent': 'warn', // 禁用 HTML 缩进检查
      'vue/html-self-closing': 'warn', // 禁用自闭合标签检查
      'vue/valid-v-else': 'warn', // 禁用 v-else 验证
      'vue/valid-v-on': 'warn', // 禁用 v-on 验证
      'vue/require-valid-default-prop': 'warn', // 禁用默认 prop 验证
      'vue/no-parsing-error': 'warn', // 禁用解析错误检查
      'vue/no-dupe-keys': 'warn', // 禁用重复键检查
      'vue/require-v-for-key': 'warn', // 禁用 v-for key 检查
      'vue/no-unused-vars': 'warn', // 禁用 Vue 模板中未使用变量检查
      '@typescript-eslint/no-unused-expressions': 'off', // 禁用未使用表达式检查
      'no-async-promise-executor': 'warn', // 禁用异步 Promise 执行器检查
      'no-useless-escape': 'warn', // 禁用无用转义字符检查
      'prefer-const': 'warn', // 禁用优先使用 const 检查
      'no-console': 'off', // 允许使用 console
      'no-debugger': 'off', // 允许使用 debugger
      'vue/attribute-hyphenation': 'off', // 禁用 Vue 组件属性驼峰命名检查
      '@typescript-eslint/no-dynamic-delete': 'off' // 禁用动态删除属性检查
    }
  },
  { ignores: ['.nuxt/'] } // 忽略校验 .nuxt/ 目录下的所有文件
]);
