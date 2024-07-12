<template>
  <div class="add-order-page">
    <InvoiceAdd />
  </div>
</template>
<script>
import InvoiceAdd from '~/components/Sale/Invoice/Add/InvoiceAdd.vue'
export default {
  components: { InvoiceAdd },
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
  flex-basis: 100%;
}
</style>
