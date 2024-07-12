<template>
  <div class="table-import position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-import--body"
      :initial-filters="payloadOutwardDeliveryImport"
      :update-filters-function="UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT"
      @row="handleDetailId"
      @search="filterAndSort"
    />
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadOutwardDeliveryImport.pageSize"
      :current-page="payloadOutwardDeliveryImport.pageNo"
      :number-item="dataTable.length"
      class="table-employee--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>
    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import api from '@/api/api'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
import dateTime from '~/mixins/dateTime'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import { SERVER_RESPONSE_CODE } from '~/constants'
import BasePagination from '@/components/UI/BasePagination.vue'
import { dateFormatYYYY } from '@/utils/utils'

export default {
  name: 'TableImportOutwardDelivery',
  components: { BaseTableDraggable, BaseTableLoader, BasePagination },
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
      acceptedFieldKeys: [
        'orderNo',
        'orderDate',
        'responsible',
        'supplierResponsible',
        'responsible',
        'itemCode',
        'itemName',
        'unit',
        'description',
        'promiseDate',
        'blance',
        'supplierName',
        'checker',
        'price',
        'amount',
        'quantity',
        'inQuantity',
        'endQuantity',
        'memoDTL',
      ],
    }
  },

  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      payloadOutwardDeliveryImport:
        'filterSort/getPayloadOutwardDeliveryImport',
    }),
    listDataShow() {
      return this.dataHeader
        .filter(
          (item) =>
            !item.hidden && this.acceptedFieldKeys.includes(item.fieldKey)
        )
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },

    dataTableMapping() {
      const convertDateFields = ['OrderDate', 'EditDate', 'PromiseDate']
      const numberFields = [
        'Quantity',
        'Price',
        'Amount',
        'EndQuantity',
        'Blance',
        'StopQuantity',
        'InQuantity',
      ]
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadOutwardDeliveryImport.pageSize *
                (this.payloadOutwardDeliveryImport.pageNo - 1) +
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
          wpoNo: {
            value: item.wpoNo,
          },
          wpoId: {
            value: item.wpoId,
          },
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }

          if (convertDateFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = item[mappingFieldName]
              ? dateFormatYYYY(item[mappingFieldName])
              : ''
            obj[mappingFieldName].align = 'center'
          }

          if (numberFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName] = {
              value: item[mappingFieldName] || 0,
            }
            obj[mappingFieldName].align = 'right'
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
        }

        if (item.fieldName === 'EndQuantity') {
          headerItem.name = this.$t(`lbl_StopQty_0`)
        }

        header.push(headerItem)
      })

      return header
    },
  },

  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT({
        language: this.lang,
      })
      await this.getData()
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  destroyed() {
    this.SET_PAYLOAD_OUTWARD_DELIVERY_IMPORT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT',
      SET_PAYLOAD_OUTWARD_DELIVERY_IMPORT:
        'filterSort/SET_PAYLOAD_OUTWARD_DELIVERY_IMPORT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT({
        pageNo: Number(value),
      })
      this.getData()
    },
    handleDetailId(data) {
      this.$emit('handleDetailId', data)
    },
    async filterAndSort() {
      try {
        this.loading = true

        const res = await api(
          'getImportOutwardDelivery',
          this.payloadOutwardDeliveryImport
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getData() {
      try {
        this.isLoadingTable = true

        const res = await api(
          'getImportOutwardDelivery',
          this.payloadOutwardDeliveryImport
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataTable = res.data?.tableContent?.content
        this.dataHeader = res.data?.scolumnHides
        this.total = res.data.tableContent?.totalElements
        this.SET_DATA_COLUMN_HIDE(this.dataHeader)
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },

    async refresh() {
      this.$bus.$emit('refresh-filter-data')
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
