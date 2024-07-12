<template>
  <div>
    <highcharts
      ref="chart"
      :constructor-type="constructorType"
      :options="optionsChart"
      class="chart"
    />
  </div>
</template>
<script>
import Vue from 'vue'
import { Chart } from 'highcharts-vue'

export default Vue.extend({
  components: {
    highcharts: Chart,
  },
  props: {
    optionsChart: {
      type: Object,
      default: () => {},
    },

    constructorType: {
      type: String,
      default: 'chart',
    },
  },
  data() {
    return {}
  },
  watch: {},
  methods: {},
})
</script>
<style lang="scss">
.highcharts-button {
  cursor: pointer;
  &:last-child {
    display: none;
  }
}
.highcharts-credits {
  display: none;
}

.chart-scroll-custom {
  background: #fff;
  height: auto !important;
  .highcharts-xaxis-labels {
    span {
      left: 24px !important;
    }
  }
}
.highcharts-text-outline {
  fill: white;
  stroke: none;
}
.highcharts-background {
  display: none;
}
.highcharts-plot-background {
  display: none;
}
.highcharts-scrolling {
  &::-webkit-scrollbar {
    width: 4px;
    background: #f4f7fb;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: #c4c4c4;
    border-radius: 3px;
  }
}
.menu-context-highchart path {
  transform: scale(0.03);
}
.menu-context-highchart-custom {
  transform: scale(0.03);
  position: absolute;
  top: 10px;
  right: 10px;
}
.menu-context-background {
  .highcharts-menu {
    background: #ffffff !important;
    box-shadow: 0px 1px 8px rgba(102, 102, 102, 0.2) !important;
    border-radius: 3px !important;
    border: none !important;
    .highcharts-menu-item {
      &:hover {
        background: #e7f1fd !important;
        color: #333333 !important;
      }
    }
  }
}
.label-custom {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.highcharts-subtitle {
  div {
    white-space: nowrap !important;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.highcharts-scrollable-mask {
  pointer-events: auto;
}
.highcharts-scrolling {
  border-radius: 10px;
}
.bg-transparent {
  .highcharts-container {
    background: transparent;
    image {
      width: 240px;
      height: 240px;
    }
  }
}
.retirement-container {
  .chart-donut {
    background: transparent;
    image {
      width: 240px;
      height: 240px;
      x: 43;
      y: 100;
    }
  }
}
.title-graph-donut {
  color: #333333;
  font-weight: bold;
  font-size: 16px;
  font-weight: bold;
  line-height: 24px;
}
</style>
<style lang="scss">
.top-tooltip {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    margin-right: 8px;
    .name {
      color: #fff;
      font-weight: 600;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .employee-name {
    font-size: 14px;
    font-weight: 400;
    color: #333333;
  }
}
.bottom-tooltip {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  color: #333333;
  font-size: 12px;
  font-weight: 400;
}
</style>
