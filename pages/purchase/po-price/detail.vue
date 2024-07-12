<template>
  <div class="page-po-price-edit">
    <PageDetailPurchasePrice></PageDetailPurchasePrice>
  </div>
</template>
<script>
import PageDetailPurchasePrice from '@/components/Purchase/PurchasePrice/PageDetailPurchasePrice'
export default {
  components: { PageDetailPurchasePrice },
}
</script>
<style lang="scss" scoped>
.page-po-price-edit {
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
