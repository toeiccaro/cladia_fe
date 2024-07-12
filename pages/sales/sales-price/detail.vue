<template>
  <div class="edit-sale-price-page">
    <SalePriceDetail></SalePriceDetail>
  </div>
</template>
<script>
import SalePriceDetail from '~/components/Sale/SalePrice/Detail/SalePriceDetail.vue'
export default {
  components: { SalePriceDetail },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.edit-sale-price-page {
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
