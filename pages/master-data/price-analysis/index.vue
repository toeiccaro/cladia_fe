<template>
  <IndexPriceAnalysis :list-tool-bars="listToolBarDefault"></IndexPriceAnalysis>
</template>
<script>
import IndexPriceAnalysis from '~/components/MasterData/PriceAnalysis/IndexPriceAnalysis.vue'
export default {
  components: { IndexPriceAnalysis },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBarDefault: [
        {
          key: 'queryPrice',
          label: this.$t('btn_btnSearch_0'),
          icon: '/images/search.png',
        },
        {
          key: 'exportPrice',
          label: this.$t('btn_btnExport_0'),
          icon: '/images/export.png',
        },
        {
          key: 'closePrice',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
    }
  },
}
</script>

<style lang="scss" scoped></style>
