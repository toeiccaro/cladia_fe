<template>
  <div class="detail-manufacturing-process-page">
    <PageDetailManufacturingProcess />
  </div>
</template>
<script>
import PageDetailManufacturingProcess from '@/components/Production/ManufacturingProcess/PageDetailManufacturingProcess.vue'
export default {
  components: { PageDetailManufacturingProcess },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.detail-manufacturing-process-page {
  background: #fff 50% bottom repeat-x;
  color: #222;
  position: relative;
  padding: 0.2em 0.2em 0;
  zoom: 1;
  font-family: Lucida Grande, Lucida Sans, Arial, sans-serif;
  font-size: 1.1em;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
