<template>
  <main>
    <el-dialog
      v-model="dialogVisible"
      center
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-row class="uploadRow">
        <span style="margin-right: 20px">选择文件: </span>
        <el-upload
          ref="upload"
          action="0"
          :auto-upload="false"
          :limit="1"
          :on-exceed="handleExceed"
          @change="changeTargetFile"
        >
          <template #trigger>
            <el-button type="primary">选择文件</el-button>
          </template>
        </el-upload>
      </el-row>

      <el-collapse v-model="collapseList" class="mt-2.5">
        <el-collapse-item title="导入模板" name="1">
          <el-table max-height="200" border :data="templateData">
            <el-table-column
              type="index"
              label="No."
              width="50px"
              align="center"
            />
            <el-table-column
              label="模板名称"
              prop="templateName"
              align="center"
            />
            <el-table-column label="操作" width="100px" align="center">
              <template #default="{ row }">
                <el-link
                  target="_blank"
                  underline="hover"
                  style="color: #409eff"
                  @click="download(row)"
                  >下载</el-link
                >
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>

      <template #footer>
        <el-button @click="((dialogVisible = false), $emit('close'))"
          >返回</el-button
        >
      </template>
    </el-dialog>
  </main>
</template>

<script setup lang="ts">
import { genFileId } from 'element-plus';
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import type { ParsingOptions } from 'xlsx';
import { importFile, openDownloadDialog } from '@/utils/downloadExcel';
import { useNavigate } from '@/hooks/useNavigate';

const props = defineProps<{
  templateData: DownloadRow[];
  readOpts?: ParsingOptions;
}>();

const emit = defineEmits(['file-change', 'close']);

const { showToast } = useNavigate();

const dialogVisible = defineModel();
const collapseList = reactive(['1']);
const upload = ref<UploadInstance>();

const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  console.log(file);

  const allowedTypes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  ];
  const isAllowed = allowedTypes.includes(file.type);

  if (!isAllowed) showToast('只支持上传 Excel 文件（.xls 或 .xlsx）', 'error');

  return isAllowed;
};

// 选择文件
const changeTargetFile: UploadProps['onChange'] = async (file) => {
  if (!beforeUpload(file.raw!)) {
    upload.value!.clearFiles();
    return;
  }
  const ws = await importFile(file.raw!, props.readOpts);
  console.log(ws);

  emit('file-change', ws);
};

type DownloadRow = {
  templateName: string;
  url?: string;
  getUrl?: () => Blob;
};
const download = (row: DownloadRow) => {
  const url = row.getUrl ? row.getUrl() : row.url;
  openDownloadDialog(url!, `${row.templateName}.xlsx`);
};
</script>

<style scoped>
.uploadRow {
  display: flex;
  align-items: center;
}

.uploadRow > div {
  display: flex;
  align-items: center;
}

.uploadRow :deep(.el-upload-list__item) {
  margin-top: 0px;
}

.importTipsTitle {
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
