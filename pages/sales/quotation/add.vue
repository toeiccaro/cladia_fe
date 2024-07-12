<template>
  <div class="add-quotation-page">
    <AddQuotationComponent />
  </div>
</template>
<script>
import AddQuotationComponent from '~/components/Sale/Quotation/Add/AddQuotation.vue'
export default {
  components: { AddQuotationComponent },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-quotation-page {
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
