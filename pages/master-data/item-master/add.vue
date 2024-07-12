<template>
  <div>
    <WidgetAddItemMaster></WidgetAddItemMaster>
  </div>
</template>
<script>
import WidgetAddItemMaster from '~/components/MasterData/ItemMaster/Add/WidgetAddItemMaster'
export default {
  components: { WidgetAddItemMaster },
  layout: 'default',
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-item-page {
  display: block;
  border-width: 0;
  padding: 1em 1.4em;
  background: none;
  color: #222222;
}
</style>
