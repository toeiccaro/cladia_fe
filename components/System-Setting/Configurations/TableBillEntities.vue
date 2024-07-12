<template>
  <div class="table-bill">
    <div class="text-title">{{ $t('lbl_SetOrderNumber_0') }}</div>
    <BaseTableDraggable
      :header="headerMapping"
      :data="dataTableMapping"
      full-width
      class="table-bill--body"
      @dataChanged="dataChanged"
      @saveData="saveData"
    ></BaseTableDraggable>
  </div>
</template>
<script>
import systemConfigurationMixins from '@/mixins/systemConfiguration'
import dateTimeMixins from '@/mixins/dateTime'
import { systemConfigBillSchema } from '@/schemas/system-setting/system-config-bill'
import BaseTableDraggable from '@/components/System-Setting/Configurations/BaseTableDraggable'
export default {
  name: 'TableBillEntities',
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
            this.dataTable[0] || systemConfigBillSchema,
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
      const inputTextFields = ['PrefixCode']
      const inputNumberFields = ['SerialNumber']
      const selectFields = ['BillPrefix', 'BillFormat']

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

          if (inputTextFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].type = 'input'
          }

          if (inputNumberFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].type = 'input-number'
            obj[mappingFieldName].value = item[mappingFieldName] || 0
          }

          if (selectFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].type = 'select'
          }

          if (headerItem.fieldName === 'BillPrefix') {
            obj[mappingFieldName].options = this.companyCodeOptions
          }

          if (headerItem.fieldName === 'BillFormat') {
            obj[mappingFieldName].options = this.billFormatOptions
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
      this.$emit('dataBillChanged', data)
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
<style scoped>
.text-title {
  font-size: 12px;
  font-weight: 700;
}
</style>
