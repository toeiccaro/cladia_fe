<template>
  <div class="add-outward-delivery-page">
    <PageDetailOutwardDelivery></PageDetailOutwardDelivery>
  </div>
</template>
<script>
import PageDetailOutwardDelivery from '~/components/Outward/Delivery/PageDetailOutwardDelivery.vue'

export default {
  components: { PageDetailOutwardDelivery },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-outward-delivery-page {
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
