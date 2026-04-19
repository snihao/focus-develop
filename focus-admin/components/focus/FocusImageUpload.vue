<template>
  <div>
    <div v-if="!isEditMode" class="flex items-center gap-4 border rounded">
      <n-image v-if="src" :src="src" width="100" height="100" object-fit="cover" />
      <n-icon v-else size="100" class="text-gray-400" :component="Image" />
    </div>
    <div
      v-else
      class="relative inline-block border-2 border-dashed border-gray-300 rounded-lg p-1 hover:border-gray-400 transition-colors cursor-pointer"
      @click="fileInput?.click">
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange($event)" />
      <n-image v-if="selectedImageUrl || src" :src="selectedImageUrl || src" preview-disabled width="100" height="100" object-fit="cover" />
      <n-icon v-else size="100" class="text-gray-400" :component="Image" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Image } from '@vicons/ionicons5';

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
});

const message = useMessage();

const selectedImageUrl = ref(''); // 选中的产品图片预览URL
const selectedFile = ref<File | null>(null); // 选中的图片文件
const fileInput = ref<HTMLInputElement>();

/**
 * 通用文件验证和处理方法
 * @param {File} file - 选中的文件
 * @param {HTMLInputElement} target - 文件输入元素
 */
async function handleFileSelection(file: File, target: HTMLInputElement) {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    message.error('请选择图片文件');
    return;
  }

  // 验证文件大小（限制为5MB）
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    message.error('图片大小不能超过5MB');
    return;
  }

  // 根据类型保存选中的文件
  selectedFile.value = file;

  const url = await fileToBase64(file);
  selectedImageUrl.value = url;

  // 清空文件输入，允许重新选择相同文件
  target.value = '';
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  handleFileSelection(file, target);
}

function getFile() {
  return selectedFile.value || null;
}

defineExpose({
  getFile
});
</script>
