<template>
  <div class="detail-purchase-return-page">
    <PageDetailPurchaseReturn />
  </div>
</template>
<script>
import PageDetailPurchaseReturn from '@/components/Purchase/PurchaseReturn/PageDetailPurchaseReturn.vue'
export default {
  components: { PageDetailPurchaseReturn },
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
