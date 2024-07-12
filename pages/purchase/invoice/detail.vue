<template>
  <div class="detail-purchase-invoice-page">
    <PageDetailPurchaseInvoice />
  </div>
</template>
<script>
import PageDetailPurchaseInvoice from '@/components/Purchase/PurchaseInvoice/Detail/PageDetailPurchaseInvoice'
export default {
  components: { PageDetailPurchaseInvoice },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.detail-purchase-invoice-page {
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
