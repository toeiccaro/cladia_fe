<template>
  <div class="detail-order-page">
    <PageDetailArrival />
  </div>
</template>
<script>
import PageDetailArrival from '@/components/Purchase/PurchaseArrival/PageDetailArrival.vue'
export default {
  components: { PageDetailArrival },
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
