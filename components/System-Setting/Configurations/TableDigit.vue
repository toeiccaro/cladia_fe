<template>
  <div class="table-digit">
    <div class="text-title">{{ $t('lbl_SetDecimalPoint_0') }}</div>
    <BaseTableDraggable
      :header="headerMapping"
      :data="dataTableMapping"
      full-width
      class="table-digit--body"
      @dataChanged="dataChanged"
      @saveData="saveData"
    ></BaseTableDraggable>
  </div>
</template>
<script>
import systemConfigurationMixins from '@/mixins/systemConfiguration'
import dateTimeMixins from '@/mixins/dateTime'
import { systemConfigDigitSchema } from '@/schemas/system-setting/system-config-digit'
import BaseTableDraggable from '@/components/System-Setting/Configurations/BaseTableDraggable'
export default {
  name: 'TableDigit',
  components: {
    BaseTableDraggable,
  },
  mixins: [systemConfigurationMixins, dateTimeMixins],
  props: {
    dataHeader: {
      type: Array,
      default: () => [],
    },
    dataTable: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    headerMapping() {
      const header = []

      this.listDataShow.forEach((item) => {
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || systemConfigDigitSchema,
            item.fieldName
          ),
          name: item.name,
          width: item.fieldWide,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
        }

        header.push(headerItem)
      })

      return header
    },

    dataTableMapping() {
      const inputNumberFields = ['Digit']
      const selectFields = ['CalculTypeId']

      const data = this.dataTable.map((item) => {
        const obj = {}

        this.listDataShow.forEach((headerItem) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )

          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
            align: headerItem.align,
          }
          if (inputNumberFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].type = 'input-number'
          }

          if (selectFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].type = 'select'
            obj[mappingFieldName].options = this.calculateTypeOptions
          }

          if (headerItem.fieldName === 'CalculTypeId') {
            obj[mappingFieldName].options = this.calculateTypeOptions
          }
        })
        return obj
      })
      return data
    },
  },

  methods: {
    saveData() {
      this.$emit('saveData')
    },
    dataChanged(data) {
      this.$emit('dataDigitChanged', data)
    },
    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },
  },
}
</script>

<style lang="scss" scoped>
.table-digit {
  .table-digit {
    width: 100%;
  }
  .table-digit-body {
    width: 100%;
  }
}
.text-title {
  font-size: 12px;
  font-weight: 700;
}
</style>
