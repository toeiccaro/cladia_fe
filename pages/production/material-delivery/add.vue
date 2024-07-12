<template>
  <div class="add-order-page">
    <PageAddMaterialDelivery />
  </div>
</template>
<script>
import PageAddMaterialDelivery from '@/components/Production/MaterialDelivery/PageAddMaterialDelivery.vue'
export default {
  components: { PageAddMaterialDelivery },
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
