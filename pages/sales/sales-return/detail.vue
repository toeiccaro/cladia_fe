<template>
  <div class="page-sale-return-edit">
    <PageDetailSaleReturn></PageDetailSaleReturn>
  </div>
</template>
<script>
import PageDetailSaleReturn from '@/components/Sale/SaleReturn/PageDetailSaleReturn.vue'
export default {
  components: { PageDetailSaleReturn },
}
</script>
<style lang="scss" scoped>
.page-sale-return-edit {
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
