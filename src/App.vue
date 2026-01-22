<template>
  <el-config-provider size="small" :locale="zhCn">
    <RouterView />
  </el-config-provider>
</template>

<script lang="ts" setup>
import zhCn from 'element-plus/es/locale/lang/zh-cn';
</script>
