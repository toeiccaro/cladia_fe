<template>
  <div class="add-purchase-invoice-page">
    <PageAddPurchaseInvoice />
  </div>
</template>
<script>
import PageAddPurchaseInvoice from '@/components/Purchase/PurchaseInvoice/Add/PageAddPurchaseInvoice'
export default {
  components: { PageAddPurchaseInvoice },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-purchase-invoice-page {
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
