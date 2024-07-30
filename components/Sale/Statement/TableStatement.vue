<template>
  <div class="table-statement d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-statement--body"
      :initial-filters="payloadSaleStatement"
      :update-filters-function="UPDATE_PAYLOAD_SALE_STATEMENT"
      @search="filterAndSort"
      @row="handleDetailId"
      @changeLayout="changeLayout"
    >
      <slot v-for="(item, index) in dataTable" :slot="'icon-' + index">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <img v-if="item.isAttach" src="@/assets/icon/attach.png" alt="" />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadSaleStatement.pageSize"
      :current-page="payloadSaleStatement.pageNo"
      :number-item="dataTable.length"
      class="table-statement--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { statementSchema } from '@/schemas/sales/statement'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import dateTime from '~/mixins/dateTime'
import systemMixins from '~/mixins/system'

import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  name: 'TableStatement',
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTime, systemMixins],
  props: {
    labelMapping: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      lang: this.$i18n.locale,
      isLoadingTable: false,
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_SALE_STATEMENT({
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
      payloadSaleStatement: 'filterSort/getPayloadSaleStatement',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    totalAmount() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.amount) {
          sum += parseFloat(item.amount)
        }
      })
      return this.parseStringToFloat(sum)
    },
    totalQuantity() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.quantity) {
          sum += parseFloat(item.quantity)
        }
      })
      return this.parseStringToFloat(sum)
    },
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTotalMapping() {
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
          type: 'text',
        }
        if (item.key === 'customerName') {
          temp.value = 'Total: '
        }
        if (item.key === 'quantity') {
          temp.value = this.totalQuantity
          temp.type = 'number'
        }
        if (item.key === 'amount') {
          temp.value = this.totalAmount
          temp.type = 'amount'
          temp.align = 'right'
        }
        return temp
      })
    },
    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadSaleStatement.pageSize *
                (this.payloadSaleStatement.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.statementNo,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          //mock
          item.SOPriceIncludeTax = 0
          item.SOAmountIncludeTax = 0
          item.SODiscountRate = 0
          item.SOPriceIncludeDiscount = 0

          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }
          const alignRight = ['Quantity', 'Price', 'Amount']
          if (alignRight.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          if (headerItem.fieldName === 'StYear') {
            obj.year = { value: item.year }
          }
          if (headerItem.fieldName === 'StMonth') {
            obj.month = { value: item.month }
          }
          if (headerItem.fieldName === 'OrderNo') {
            obj.orderNumber = { value: item.orderNumber }
            obj.orderNumber.type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj.orderNumber.link = `/${this.lang}/sales/invoice/detail?invoiceNo=${item.orderNumber}`
          }
          const listConvertDate = [
            'OrderDate',
            'StatementDate',
            'EditDate',
            'CheckDate',
            'DeliveryDate',
          ]
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }

          if (headerItem.fieldName === 'StatementNo') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/sales/statement/detail?statementNo=${item.statementNo}`
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const listNumberField = ['Quantity', 'Price', 'Amount']
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
        {
          key: 'icon',
          name: '',
          width: 40,
        },
      ]
      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || statementSchema,
            item.fieldName
          ),
          name: this.labelMapping[item.fieldName],
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }
        if (item.fieldName === 'StMonth') {
          headerItem.key = 'month'
        }
        if (item.fieldName === 'StYear') {
          headerItem.key = 'year'
        }
        if (item.fieldName === 'OrderNo') {
          headerItem.key = 'orderNumber'
        }
        header.push(headerItem)
      })

      return header
    },
  },
  created() {
    this.SET_PAYLOAD_SALE_STATEMENT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_SALE_STATEMENT: 'filterSort/UPDATE_PAYLOAD_SALE_STATEMENT',
      SET_PAYLOAD_SALE_STATEMENT: 'filterSort/SET_PAYLOAD_SALE_STATEMENT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_SALE_STATEMENT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_SALE_STATEMENT({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('getStatements', this.payloadSaleStatement)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          res.data?.scolumnHides.push({
            "id": 1001,
            "loginId": 1,
            "gridName": "SOPriceIncludeTax",
            "fieldName": "SOPriceIncludeTax",
            "fieldWide": "150",
            "fieldOrder": "17",
            "editUser": "admin",
            "fieldKey": null,
            "hidden": false,
            "system": false,
            "editDate": "2023-04-17T17:31:11.967+00:00"
          })

          res.data?.scolumnHides.push({
            "id": 1001,
            "loginId": 1,
            "gridName": "SOAmountIncludeTax",
            "fieldName": "SOAmountIncludeTax",
            "fieldWide": "150",
            "fieldOrder": "17",
            "editUser": "admin",
            "fieldKey": null,
            "hidden": false,
            "system": false,
            "editDate": "2023-04-17T17:31:11.967+00:00"
          })

          res.data?.scolumnHides.push({
            "id": 1001,
            "loginId": 1,
            "gridName": "SODiscountRate",
            "fieldName": "SODiscountRate",
            "fieldWide": "150",
            "fieldOrder": "17",
            "editUser": "admin",
            "fieldKey": null,
            "hidden": false,
            "system": false,
            "editDate": "2023-04-17T17:31:11.967+00:00"
          })

          res.data?.scolumnHides.push({
            "id": 1001,
            "loginId": 1,
            "gridName": "SOPriceIncludeDiscount",
            "fieldName": "SOPriceIncludeDiscount",
            "fieldWide": "150",
            "fieldOrder": "17",
            "editUser": "admin",
            "fieldKey": null,
            "hidden": false,
            "system": false,
            "editDate": "2023-04-17T17:31:11.967+00:00"
          })
          this.dataHeader = res.data?.scolumnHides
          console.log('res.data?.scolumnHides', res.data?.scolumnHides);
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
          this.SET_DATA_COLUMN_HIDE(res?.data?.scolumnHides)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async filterAndSort() {
      try {
        this.loading = true

        const res = await await api('getStatements', this.payloadSaleStatement)
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
    async refresh() {
      await this.getData()
    },
    handleDetailId(data) {
      this.$emit('detail', data.keyRow)
    },
    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
  },
}
</script>
<style lang="scss" scoped>
.table-statement {
  height: calc(100% - 70px);
  .table-statement--body {
    height: calc(100% - 26px);
  }
  .table-statement--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}

.total-item {
  border-right: 1px solid #5180d8;
  font-size: 12px;
  font-weight: bold;
  padding: 0 2px;
}

.total-item:last-child {
  border-right: none !important;
}
</style>
