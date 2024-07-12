<template>
  <div class="add-outward-warehousing-page">
    <PageDetailOutwardWarehousing></PageDetailOutwardWarehousing>
  </div>
</template>
<script>
import PageDetailOutwardWarehousing from '~/components/Outward/Warehousing/PageDetailOutwardWarehousing'

export default {
  components: { PageDetailOutwardWarehousing },
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
}
</style>
