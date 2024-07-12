<template>
  <div class="table-import position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-import--body"
      :initial-filters="payloadManufacturingProcessImport"
      :update-filters-function="UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT"
      @row="handleDetailId"
      @search="filterAndSort"
      @changeLayout="changeLayout"
    />
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadManufacturingProcessImport.pageSize"
      :current-page="payloadManufacturingProcessImport.pageNo"
      :number-item="dataTable.length"
      class="table-employee--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>
    <BaseLoading v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import api from '@/api/api'
import BaseLoading from '@/components/UI/Loading/BaseLoading'
import dateTime from '~/mixins/dateTime'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import { SERVER_RESPONSE_CODE } from '~/constants'
import BasePagination from '@/components/UI/BasePagination.vue'
import { dateFormatYYYY } from '@/utils/utils'

export default {
  name: 'TableImportManufacturingProcess',
  components: { BaseTableDraggable, BaseLoading, BasePagination },
  mixins: [dateTime],
  data() {
    return {
      isLoadingTable: false,
      lang: this.$i18n.locale,
      loading: false,
      dataTable: [],
      dataHeader: [],
      selectedRow: {},
      total: 0,
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT({
        language: this.lang,
      })
      await this.getData()
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      payloadManufacturingProcessImport:
        'filterSort/getPayloadManufacturingProcessImport',
    }),
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },

    dataTableMapping() {
      const convertDateFields = [
        'OrderDate',
        'ScheduleEndDate',
        'ScheduleStartDate',
      ]
      const numberFields = [
        'productionQty',
        'producedQty',
        'blance',
      ]
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadManufacturingProcessImport.pageSize *
                (this.payloadManufacturingProcessImport.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          unitID: {
            value: item.unitID,
          },
          itemID: {
            value: item.itemID,
          },
          nextProcessID: {
            value: item.nextProcessID,
          },
          nextProcessName: {
            value: item.nextProcessName,
          },
          nextProcessCode: {
            value: item.nextProcessCode,
          },
          orderNO: {
            value: item.orderNO,
          },
          subBeginDate: {
            value: item.subBeginDate,
          },
          subEndDate: {
            value: item.subEndDate,
          },
          lineID: {
            value: item.lineID,
          },
          solineID: {
            value: item.solineID,
          },
          subItemID: {
            value: item.subItemID,
          },
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const fieldKey = headerItem.fieldKey
          obj[fieldKey] = {
            value: item[fieldKey] || '',
          }

          if (convertDateFields.includes(headerItem.fieldName)) {
            obj[fieldKey].value = item[fieldKey]
              ? dateFormatYYYY(item[fieldKey])
              : ''
            obj[fieldKey].align = 'center'
          }
          if (numberFields.includes(headerItem.fieldKey)) {
            obj[fieldKey].value = item[fieldKey] || 0
            obj[fieldKey].align = 'right'
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
      ]
      this.listDataShow.forEach((item) => {
        const headerItem = {
          key: item.fieldKey,
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          fieldKey: item.fieldKey,
        }

        header.push(headerItem)
      })

      return header
    },
  },

  destroyed() {
    this.SET_PAYLOAD_MANUFACTURING_PROCESS_IMPORT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT:
        'filterSort/UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT',
      SET_PAYLOAD_MANUFACTURING_PROCESS_IMPORT:
        'filterSort/SET_PAYLOAD_MANUFACTURING_PROCESS_IMPORT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),

    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT({
        pageNo: Number(value),
      })
      this.getData()
    },
    handleDetailId(data) {
      this.$emit('handleDetailId', data)
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    async filterAndSort() {
      try {
        this.loading = true

        await this.getDataTable()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getData() {
      this.dataTable = []
      this.dataHeader = []
      this.total = 0
      this.SET_DATA_COLUMN_HIDE([])
      try {
        this.isLoadingTable = true

        await this.getDataTable()
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },

    async refresh() {
      this.SET_PAYLOAD_MANUFACTURING_PROCESS_IMPORT({
        processCode: this.payloadManufacturingProcessImport.processCode,
        language: this.lang,
        pageNo: 1,
        pageSize: 30,
      })
      await this.getData()
    },

    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }

      return ''
    },
    async getDataTable() {
      try {
        const res = await api(
          'getImportManufacturingProcess',
          this.payloadManufacturingProcessImport
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          this.dataTable = []
          this.dataHeader = []
          this.total = 0
          this.SET_DATA_COLUMN_HIDE([])
          return
        }

        this.dataTable = res.data?.tableContent?.content
        this.dataHeader = res.data?.scolumnHides
        this.total = res.data.tableContent?.totalElements
        this.SET_DATA_COLUMN_HIDE(this.dataHeader)
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.table-import {
  height: calc(100% - 89px);
  .table-import--body {
    border-top: 0;
    border-left: 0;
    border-right: 0;
    height: calc(100% - 43px);
    overflow-y: auto;
  }

  .table-import--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
  }
}
</style>
