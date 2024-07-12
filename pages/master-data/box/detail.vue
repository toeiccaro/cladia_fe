<template>
  <div class="add-box-page">
    <PageDetailBox />
  </div>
</template>
<script>
import PageDetailBox from '@/components/MasterData/Box/PageDetailBox.vue'
export default {
  components: { PageDetailBox },
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
