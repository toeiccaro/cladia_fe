<template>
  <div class="add-outward-warehousing-page">
    <PageAddOutwardWarehousing />
  </div>
</template>
<script>
import PageAddOutwardWarehousing from '~/components/Outward/Warehousing/PageAddOutwardWarehousing.vue'
export default {
  components: { PageAddOutwardWarehousing },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-outward-warehousing-page {
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
