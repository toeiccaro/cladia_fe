<template>
  <div class="add-order-page">
    <PageAddPurchaseOrder />
  </div>
</template>
<script>
import PageAddPurchaseOrder from '@/components/Purchase/PurchaseOrder/PageAddPurchaseOrder.vue'
export default {
  components: { PageAddPurchaseOrder },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-order-page {
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
