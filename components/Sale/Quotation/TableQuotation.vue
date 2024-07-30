<template>
  <div class="table-quotation d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-quotation--body"
      :initial-filters="payloadSaleQuotation"
      :update-filters-function="UPDATE_PAYLOAD_SALE_QUOTATION"
      @search="filterAndSort"
      @row="handleRow"
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
      <slot v-for="(item, index) in dataTable" :slot="`isCheck-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <input
            type="checkbox"
            class="checkbox"
            disabled
            :checked="item.isCheck"
          />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadSaleQuotation.pageSize"
      :current-page="payloadSaleQuotation.pageNo"
      :number-item="dataTable.length"
      class="table-quotation--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { quotationSchema } from '@/schemas/sales/quotation'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import dateTime from '~/mixins/dateTime'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  name: 'TableQuotation',
  components: { BasePagination, BaseTableDraggable, BaseTableLoader },
  mixins: [dateTime],
  data() {
    return {
      isLoadingTable: false,
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters({
      payloadSaleQuotation: 'filterSort/getPayloadSaleQuotation',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    checkAccountOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },
    totalAmount() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.amount) {
          sum += parseFloat(item.amount)
        }
      })
      return sum
    },
    totalQuantity() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.quantity) {
          sum += parseFloat(item.quantity)
        }
      })
      return sum
    },
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTableMapping() {
      const listAlignRightFields = ['Quantity', 'Price', 'Amount']

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadSaleQuotation.pageSize *
                (this.payloadSaleQuotation.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.quoteNO,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = { value: item[mappingFieldName] || '' }
          if (headerItem.fieldName === 'Color') {
            obj[mappingFieldName].value = item[mappingFieldName]
              ? this.$t(`cmb_Color_${item[mappingFieldName]}`)
              : ''
          }
          if (listAlignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName] = {
              value: item[mappingFieldName] || 0,
              align: 'right',
            }
          }
          if (headerItem.fieldName === 'IsCheck') {
            obj[mappingFieldName].type = 'slot'
          }
          if (headerItem.fieldName === 'PaymentID') {
            obj[mappingFieldName].value = item.payment
          }
          if (headerItem.fieldName === 'UnitID') {
            obj[mappingFieldName].value = item.unit
          }
          const listConvertDate = [
            'Orderdate',
            'CheckDate',
            'Editdate',
            'OrderDate',
            'EditDate',
          ]
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          const alignRight = ['Quantity', 'Price', 'Amount', 'TaxRate']
          if (alignRight.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }

          if (headerItem.fieldName === 'QuoteNO') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/sales/quotation/detail?quoteNO=${item.quoteNO}`
          }
        })
        return obj
      })
      return data
    },
    dataTotalMapping() {
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
        }
        if (item.key === 'itemName') {
          temp.value = 'Total: '
          temp.type = 'text'
        }
        if (item.key === 'quantity') {
          temp.value = this.totalQuantity
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'amount') {
          temp.value = this.totalAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'isCheck') {
          temp.type = 'checkbox'
        }
        return temp
      })
    },
    headerMapping() {
      const listNumberField = ['Quantity', 'Price', 'Amount', 'TaxRate']
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
            this.dataTable[0] || quotationSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: item.fieldName === 'IsCheck' ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }
        if (item.fieldName === 'IsCheck') {
          headerItem.options = this.checkAccountOptions
        }
        if (item.fieldName === 'Orderdate') {
          headerItem.name = this.$t('lbl_OrderDate_0')
        }
        if (item.fieldName === 'Editdate') {
          headerItem.name = this.$t('lbl_EditDate_0')
        }
        if (item.fieldName === 'Payment') {
          headerItem.name = this.$t('lbl_PaymentID_0')
        }
        header.push(headerItem)
      })

      return header
    },
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_SALE_QUOTATION({
        language: this.lang,
      })
      await this.getData()
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  created() {
    const isCheck = this.$route.query?.isCheck

    const payload = {
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    }

    if (isCheck) {
      payload.isCheck = 0
    }
    this.$router.replace({ query: null })
    this.SET_PAYLOAD_SALE_QUOTATION(payload)
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_SALE_QUOTATION: 'filterSort/UPDATE_PAYLOAD_SALE_QUOTATION',
      SET_PAYLOAD_SALE_QUOTATION: 'filterSort/SET_PAYLOAD_SALE_QUOTATION',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_SALE_QUOTATION(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_SALE_QUOTATION({
        pageNo: Number(value),
      })
      this.getData()
    },
    handleRow(payload) {
      this.$emit('handleDetailId', payload.keyRow)
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    async filterAndSort() {
      try {
        this.loading = true
        const res = await api('getQuotation', this.payloadSaleQuotation)
        this.loading = false

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent.content
          this.total = res.data.tableContent.totalElements
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
        const res = await api('getQuotation', this.payloadSaleQuotation)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          res.data.scolumnHides.push({
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

          res.data.scolumnHides.push({
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

          res.data.scolumnHides.push({
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

          res.data.scolumnHides.push({
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
          
          this.dataHeader = res.data.scolumnHides
          this.dataTable = res.data.tableContent.content
          this.total = res.data.tableContent.totalElements
          this.SET_DATA_COLUMN_HIDE(res?.data?.scolumnHides)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async refresh() {
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
.table-quotation {
  // border: 1px solid #5180d8;
  height: calc(100% - 70px);
  .table-quotation--body {
    height: calc(100% - 26px);
  }
  .table-quotation--footer {
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
.checkbox {
  height: 12px !important;
}
</style>
