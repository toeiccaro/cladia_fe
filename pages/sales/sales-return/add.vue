<template>
  <div class="page-sale-return-add">
    <PageAddSaleReturn></PageAddSaleReturn>
  </div>
</template>
<script>
import PageAddSaleReturn from '@/components/Sale/SaleReturn/PageAddSaleReturn.vue'
export default {
  components: { PageAddSaleReturn },
}
</script>
<style lang="scss" scoped>
.page-sale-return-add {
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
