<template>
  <WidgetDetailItemMaster :active-tool-bar="activeToolBar">
  </WidgetDetailItemMaster>
</template>
<script>
import WidgetDetailItemMaster from '@/components/MasterData/ItemMaster/Detail/WidgetDetailItemMaster'
export default {
  components: { WidgetDetailItemMaster },
  layout: 'default',
  middleware: ['authenticated'],
  props: {
    activeToolBar: {
      type: String,
      default: () => 'editItemMaster',
    },
  },
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
