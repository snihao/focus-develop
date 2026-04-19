<template>
  <div class="markdown-editor">
    <textarea v-model="content" class="editor-textarea" placeholder="请输入 Markdown 内容..."></textarea>
    <div class="preview">
      <div v-html="renderedContent" class="preview-content"></div>
    </div>
    <div class="file-upload">
      <input type="file" @change="handleFileUpload" />
      <p>上传图片并在 Markdown 中显示</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import TurndownService from 'turndown';
import { useMessage } from 'naive-ui';
import type { PropType } from 'vue';

type UploadRequest = (_params: { file: File }) => Promise<Result<string>>;

const content = ref('');
const message = useMessage();

const markdownContent = ref('');
const htmlContent = ref('');

// 接收数据
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  fullContent: {
    type: String,
    default: ''
  },
  // 图片上传函数（外部注入，避免耦合具体业务 API）
  uploadReq: {
    type: Function as PropType<UploadRequest>,
    default: null
  }
});

// 处理数据
const handleData = () => {
  content.value = props.fullContent;
};

// 将 Markdown 转换为 HTML 并加上语法高亮
const renderedContent = computed(() => {
  marked.setOptions({
    highlight: (code: string) => {
      return hljs.highlightAuto(code).value;
    }
  });
  return marked(content.value);
});

// 导出 Markdown 内容
const exportMarkdown = () => {
  const blob = new Blob([content.value], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'document.md';
  link.click();
};

// html 转为 markdown
const HTMLtoMarkDown = () => {
  const turndown = new TurndownService();
  markdownContent.value = turndown.turndown(htmlContent.value);
};

// 文件上传功能
const handleFileUpload = async (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files ? fileInput.files[0] : null;
  if (!file) return;

  const url = await uploadSingleImage(file);
  if (!url) return;

  // 插入图片到 Markdown 内容
  const markdownImage = `![image](${url})`;
  content.value += `\n\n${markdownImage}\n`;
};

/**
 * 上传单个图片文件
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<string | null>} 上传成功返回图片URL，失败返回 null
 */
async function uploadSingleImage(file: File): Promise<string | null> {
  if (!props.uploadReq) {
    message.error('未配置上传函数');
    return null;
  }

  try {
    const res = await props.uploadReq({ file });
    if (Number(res.code) === 200) {
      return res.data;
    }
    throw new Error(res.msg || '图片上传失败');
  } catch (error) {
    console.error('图片上传失败:', error);
    message.error('图片上传失败');
    return null;
  }
}

watch(
  () => props.disabled,
  () => {
    handleData();
  },
  { immediate: true }
);
</script>

<style scoped>
.markdown-editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.editor-textarea {
  width: 100%;
  height: 300px;
  padding: 10px;
  font-size: 16px;
  line-height: 1.5;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: none;
}

.preview {
  background-color: #f8f8f8;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  min-height: 300px;
}

.preview-content {
  max-width: 100%;
  word-wrap: break-word;
}

.export-buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.file-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input[type='file'] {
  padding: 5px;
}
</style>
