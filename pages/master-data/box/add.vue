<template>
  <div class="add-box-page">
    <PageAddBox />
  </div>
</template>
<script>
import PageAddBox from '@/components/MasterData/Box/PageAddBox.vue'
export default {
  components: { PageAddBox },
  layout: 'default',
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-box-page {
  background: #ffffff 50% bottom repeat-x;
  color: #222222;
  position: relative;
  padding: 0.2em;
  zoom: 1;
}
</style>
