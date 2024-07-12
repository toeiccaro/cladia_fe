<template>
  <div class="add-order-page">
    <PageAddProductionOrder />
  </div>
</template>
<script>
import PageAddProductionOrder from '@/components/Production/ProductionOrder/PageAddProductionOrder.vue'
export default {
  components: { PageAddProductionOrder },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-order-page {
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
