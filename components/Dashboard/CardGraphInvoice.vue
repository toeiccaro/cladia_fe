<template>
  <div class="card-graph-invoice">
    <!-- <div class="group-year">
      <b-form-select
        v-model="yearSelected"
        :options="yearOptions"
        class="select"
      />
    </div> -->
    <div class="chart-header" :class="isShowCard ? 'border-bottom' : ''">
      <div class="chart-header--title">{{ $t('lbl_GraphSalesInvoice_0') }}</div>
      <BIconCaretDownFill
        v-if="isShowCard"
        class="action-show"
        @click="handleActionShow"
      />
      <BIconCaretUpFill v-else class="action-show" @click="handleActionShow" />
    </div>
    <Chart v-if="isShowCard" :options-chart="optionsChart" class="chart" />
  </div>
</template>
<script>
import { BIconCaretDownFill, BIconCaretUpFill } from 'bootstrap-vue'
import Chart from '@/components/UI/Chart/Chart.vue'
import { formatNumberWithCommas } from '@/utils/utils'

export default {
  components: {
    Chart,
    BIconCaretDownFill,
    BIconCaretUpFill,
  },
  props: {
    data: {
      type: [Object, Array],
      default: () => {},
    }, 
    show: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      yearOptions: [
        {
          value: '2022',
          text: '2022',
        },
        {
          value: '2023',
          text: '2023',
        },
        {
          value: '2024',
          text: '2024',
        },
        {
          value: '2025',
          text: '2025',
        },
        {
          value: '2026',
          text: '2027',
        },
      ],
      yearSelected: '2023',
      isShowCard: this.show,
    }
  },
  computed: {
    categoriesOfXAxis() {
      const result = []
      const year =
        this.data && this.data?.data?.length > 0 ? this.data?.data[0]?.year : ''
      this.data?.inRange?.forEach((element) => {
        result.push(`${element}/${year}`)
      })
      return result
    },
    categoriesOfYAxis() {
      let result = []
      this.data?.data?.forEach((element) => {
        result = result.concat(element.data)
      })
      return new Set(result)
    },
    optionsChart() {
      return {
        chart: {
          type: 'column',
          height: 500,
        },
        title: {
          text: this.$t('lbl_GraphSalesInvoice_0'),
        },
        xAxis: {
          title: {
            text: this.$t('lbl_StMonth_0'),
          },
          categories: this.categoriesOfXAxis,
        },
        yAxis: {
          min: 0,
          title: {
            text: this.$t('lbl_Amount_0'),
          },
          labels: {
            formatter() {
              return this.value / 1000000 + 'M'
            },
          },
        },
        // tooltip: {
        //   pointFormat:
        //     '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
        //   shared: true,
        // },
        tooltip: {
          formatter() {
            return `<p>${this.x}</p><br/><p><b>${
              this.series.name
            }</b>: ${formatNumberWithCommas(this.point.y)} </p><br/>`
          },
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            pointWidth: 40,
          },
        },
        series: this.data?.data,
      }
    },
  },
  methods: {
    handleActionShow() {
      this.isShowCard = !this.isShowCard
      this.$emit('actionShow', {
        cardName: 'CardGraphInvoice',
        active: this.isShowCard,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.card-graph-invoice {
  // border: 1px solid #aaa;
  // margin-top: 16px;
}
.border-bottom {
  border-bottom: 1px solid #aaa;
}
.chart-header {
  padding: 4px 12px;
  height: 31px;
  align-items: center;
  display: flex;
  justify-content: space-between;

  &--title {
    font-size: 14px;
    font-weight: 700;
  }
  .action-show {
    float: right;
    cursor: pointer;
  }
}

.chart {
  // border: 1px solid #aaa;
  border-top: none;
}
.group-year {
  width: 64px;
  margin: 20px 20px 0;
  .select {
    height: 20px;
    font-size: 12px;
    border: 1px solid #aaa;
  }
}
</style>
