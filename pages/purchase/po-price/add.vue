<template>
  <div class="page-po-price-add">
    <PageAddPurchasePrice></PageAddPurchasePrice>
  </div>
</template>
<script>
import PageAddPurchasePrice from '@/components/Purchase/PurchasePrice/PageAddPurchasePrice'
export default {
  components: { PageAddPurchasePrice },
}
</script>
<style lang="scss" scoped>
.page-po-price-add {
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
