<template>
  <div class="edit-order-page">
    <OrderDetail></OrderDetail>
  </div>
</template>
<script>
import OrderDetail from '~/components/Sale/Order/OrderDetail.vue'
export default {
  components: { OrderDetail },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.edit-order-page {
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
