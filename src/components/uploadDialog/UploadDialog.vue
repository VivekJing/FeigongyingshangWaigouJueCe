<template>
  <el-dialog v-model="dialogTableVisible" title="附件" width="50%">
    <div class="text-right">
      <el-button type="primary" :disabled="auth === 'read'" @click="upload(id)"
        >上传附件</el-button
      >
    </div>
    <el-table :data="fileList">
      <el-table-column property="Name" label="文件名">
        <template #default="{ row }: { row: { Id: string; Name: string } }">
          <el-link target="_blank" :href="toDetail(row.Id)">{{
            row.Name
          }}</el-link>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import { toDetail } from '@/utils';
import { getBaseQRObj, type Auth } from '@/request/outsourcingApplication';
import config from '@/config/config';

defineProps<{
  id: string;
  fileList: { Id: string; Name: string }[];
  auth: Auth | null;
}>();

const dialogTableVisible = defineModel();

const upload = async (recordId: string) => {
  const loading = ElLoading.service();
  const [e, r] = await getBaseQRObj(recordId);
  loading.close();
  if (e) return console.error(e);
  console.log(r);
  const { email, userIdLong, token } = r!;

  window.open(
    `${config.uploadUrl}?id=${recordId}&userid=${email}&uid=${userIdLong}&token=${token}`
  );
};
</script>

<style scoped></style>
