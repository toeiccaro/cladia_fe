<template>
  <div class="detail-order-page">
    <PageDetailOutwardReturn />
  </div>
</template>
<script>
import PageDetailOutwardReturn from '@/components/Outward/OutwardReturn/PageDetailOutwardReturn.vue'
export default {
  components: { PageDetailOutwardReturn },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.detail-order-page {
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
