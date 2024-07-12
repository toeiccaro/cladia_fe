<template>
  <div class="detail-order-page">
    <PageDetailOutwardOrder />
  </div>
</template>
<script>
import PageDetailOutwardOrder from '@/components/Outward/OutwardOrder/PageDetailOutwardOrder.vue'
export default {
  components: { PageDetailOutwardOrder },
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
