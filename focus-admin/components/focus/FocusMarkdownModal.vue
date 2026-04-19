<template>
  <n-modal
    :show="modelValue"
    preset="card"
    :style="{ width: '80vw', maxHeight: '90vh', minHeight: '50vh', overflow: 'auto' }"
    :title="title"
    :mask-closable="previewOnly"
    header-class="sticky top-0 bg-[var(--n-color-modal)] z-[999]"
    @update:show="updateShow">
    <n-spin style="width: 100%; height: 100%" size="large" :show="show">
      <template #description>文件上传中...</template>
      <MdEditor
        v-if="!previewOnly"
        ref="editorRef"
        v-model="currentText"
        :theme="mdTheme"
        :toolbarsExclude="['github']"
        @on-upload-img="onUploadImg"
        @save="save" />

      <MdPreview v-else :model-value="text" :theme="mdTheme" />
    </n-spin>

    <template #footer>
      <div v-if="!previewOnly" class="w-full flex justify-end">
        <n-space>
          <n-button @click="updateShow(false)">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </div>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
import { MdEditor, MdPreview, type Themes, config } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
// @ts-ignore
import LinkAttr from 'markdown-it-link-attributes';
import type { GlobalTheme } from 'naive-ui';

config({
  markdownItPlugins(plugins, { editorId }) {
    const taskList = plugins.find((item) => item.type === 'taskList');
    if (taskList) taskList.options.enabled = true;
    return [
      ...plugins,
      {
        type: 'linkAttr',
        plugin: LinkAttr,
        options: {
          matcher(href: string) {
            // 如果使用了markdown-it-anchor
            // 应该忽略标题头部的锚点链接
            return !href.startsWith('#');
          },
          attrs: {
            target: '_blank'
          }
        }
      }
    ];
  }
});

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  },
  previewOnly: {
    type: Boolean,
    default: false
  },
  upload: {
    type: Function,
    default: () => {}
  },
  title: {
    type: String,
    default: 'Markdown'
  }
});

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  'update:text': [val: string];
  save: [val: string, h: string];
}>();

const message = useMessage();
const show = ref(false);

const theme = inject<Ref<GlobalTheme>>('theme');

const mdTheme = computed<Themes>(() => {
  return (theme?.value?.name as Themes) || 'light';
});

const editorRef = ref<typeof MdEditor>();

const currentText = ref(props.text);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nextTick(() => {
        editorRef.value?.togglePreviewOnly(props.previewOnly);
      });
    }
  }
);

function updateShow(show: boolean) {
  emit('update:modelValue', show);
}

/**
 * 根据文件类型生成对应的 Markdown 标签
 * @param file 文件对象
 * @param url 文件上传后的URL
 * @returns 生成的 Markdown 标签字符串
 */
function generateMarkdownTag(file: File, url: string): string {
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';

  // 图片文件处理
  if (file.name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) {
    return `![${fileName}](${url})`;
  }
  // 视频文件处理 - 使用HTML5视频标签
  else if (file.name.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/i)) {
    return `
<video controls width="100%" style="max-width: 800px;">
  <source src="${url}" type="video/${fileExtension}">
  您的浏览器不支持视频播放。<a href="${url}" target="_blank">点击下载视频文件：${fileName}</a>
</video>

`;
  }
  // 音频文件处理 - 使用HTML5音频标签
  else if (file.name.match(/\.(mp3|wav|ogg|aac|flac|m4a)$/i)) {
    return `
<audio controls>
  <source src="${url}" type="audio/${fileExtension}">
  您的浏览器不支持音频播放。<a href="${url}" target="_blank">点击下载音频文件：${fileName}</a>
</audio>

`;
  }
  // PDF文档处理 - 使用嵌入式PDF查看器
  else if (file.name.match(/\.pdf$/i)) {
    return `
<embed src="${url}" type="application/pdf" width="100%" height="600px">
<p>您的浏览器不支持PDF预览。<a href="${url}" target="_blank">点击下载PDF文件：${fileName}</a></p>

`;
  }
  // 其他文件类型 - 使用普通链接
  else {
    return `[${fileName}](${url})`;
  }
}

/**
 * 处理文件上传
 * @param files 要上传的文件数组
 */
async function onUploadImg(files: File[]) {
  if (!files || files.length === 0) {
    return;
  }

  // 显示加载状态
  show.value = true;

  try {
    const uploadPromises = files.map(async (file) => {
      try {
        // 验证文件
        const validation = validateFile(file);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }

        // 上传文件
        console.log('正在上传文件:', file.name);
        const res = await props.upload({ file });

        if (Number(res.code) === 200) {
          // 生成对应的 Markdown 标签
          const markdownTag = generateMarkdownTag(file, res.data);

          // 添加到编辑器内容中
          currentText.value += markdownTag;

          return {
            success: true,
            fileName: file.name,
            url: res.data
          };
        } else {
          throw new Error(res.msg || '上传失败');
        }
      } catch (error: any) {
        console.error(`文件 ${file.name} 上传失败:`, error);
        return {
          success: false,
          fileName: file.name,
          error: error.message
        };
      }
    });

    // 等待所有上传完成
    const results = await Promise.allSettled(uploadPromises);

    // 统计上传结果
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const uploadResult = result.value;
        if (uploadResult.success) {
          successCount++;
          console.log(`文件 ${uploadResult.fileName} 上传成功`);
        } else {
          failCount++;
          errors.push(`${uploadResult.fileName}: ${uploadResult.error}`);
        }
      } else {
        failCount++;
        errors.push(`上传过程中发生未知错误: ${result.reason}`);
      }
    });

    // 显示上传结果消息
    if (successCount > 0 && failCount === 0) {
      message.success(`成功上传 ${successCount} 个文件`);
    } else if (successCount > 0 && failCount > 0) {
      message.warning(`成功上传 ${successCount} 个文件，失败 ${failCount} 个文件`);
      console.warn('上传失败的文件:', errors);
    } else if (failCount > 0) {
      message.error(`所有文件上传失败`);
      console.error('上传失败详情:', errors);
    }
  } catch (error: any) {
    console.error('文件上传过程中发生错误:', error);
    message.error(`文件上传失败: ${error.message}`);
  } finally {
    // 隐藏加载状态
    show.value = false;
  }
}

async function save(v: string, h: Promise<string>) {
  const html = await h;
  emit('update:text', v);
  emit('save', v, html);
}

function handleSave() {
  editorRef.value?.triggerSave();
  updateShow(false);
}
</script>
