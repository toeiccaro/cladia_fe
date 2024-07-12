<template>
  <div class="add-purchase-return-page">
    <PageAddPurchaseReturn />
  </div>
</template>
<script>
import PageAddPurchaseReturn from '@/components/Purchase/PurchaseReturn/PageAddPurchaseReturn.vue'
export default {
  components: { PageAddPurchaseReturn },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-purchase-return-page {
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
