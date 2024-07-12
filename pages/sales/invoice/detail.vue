<template>
  <div class="add-invoice-page">
    <DetailSaleInvoice></DetailSaleInvoice>
  </div>
</template>
<script>
import DetailSaleInvoice from '~/components/Sale/Invoice/Detail/DetailSaleInvoice'

export default {
  components: { DetailSaleInvoice },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-invoice-page {
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
