<template>
  <div class="add-order-page">
    <OrderAdd />
  </div>
</template>
<script>
import OrderAdd from '@/components/Sale/Order/OrderAdd.vue'
export default {
  components: { OrderAdd },
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
