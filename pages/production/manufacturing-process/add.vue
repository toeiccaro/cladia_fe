<template>
  <div class="add-manufacturing-process-page">
    <PageAddManufacturingProcess />
  </div>
</template>
<script>
import PageAddManufacturingProcess from '@/components/Production/ManufacturingProcess/PageAddManufacturingProcess.vue'
export default {
  components: { PageAddManufacturingProcess },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-manufacturing-process-page {
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
