<template>
  <div class="add-sale-price-page">
    <SalePriceAdd />
  </div>
</template>
<script>
import SalePriceAdd from '@/components/Sale/SalePrice/Add/SalePriceAdd.vue'
export default {
  components: { SalePriceAdd },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-sale-price-page {
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
