<template>
  <div class="edit-quotation-page">
    <DetailQuotation></DetailQuotation>
  </div>
</template>
<script>
import DetailQuotation from '~/components/Sale/Quotation/Detail/DetailQuotation.vue'

export default {
  components: { DetailQuotation },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.edit-quotation-page {
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
