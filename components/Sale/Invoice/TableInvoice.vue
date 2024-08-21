<template>
  <div class="table-invoice d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-invoice--body"
      :initial-filters="payloadSaleInvoice"
      :update-filters-function="UPDATE_PAYLOAD_SALE_INVOICE"
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
          <b-form-checkbox disabled :checked="item.isCheck" />
        </div>
      </slot>

      <slot
        v-for="(item, index) in dataTable"
        :slot="`isCheckAccount-${index}`"
      >
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.isCheckAccount" />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadSaleInvoice.pageSize"
      :current-page="payloadSaleInvoice.pageNo"
      :number-item="dataTable.length"
      class="table-invoice--footer"
      :class="{
        'border--full': !total,
      }"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { formatNumberWithCommas } from '@/utils/utils'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { invoiceSchema } from '@/schemas/sales/invoice'
import dateTime from '@/mixins/dateTime'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
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
      payloadSaleInvoice: 'filterSort/getPayloadSaleInvoice',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    checkAccountOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },
    listDataShow() {
      return this.dataHeader
        .filter((_el) => _el.fieldName !== 'Blance')
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    totalAmount() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.amount) {
          sum += parseFloat(item.amount)
        }
      })
      return formatNumberWithCommas(sum)
    },
    totalTotalAmount() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.amount) {
          sum += parseFloat(item.totalAmount)
        }
      })
      return formatNumberWithCommas(sum)
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
    totalTotalRtAmount() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.totalRtAmount) {
          sum += parseFloat(item.totalRtAmount)
        }
      })
      return sum
    },
    dataTotalMapping() {
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
          type: 'text',
        }
        if (item.key === 'itemName') {
          temp.value = 'Total: '
        }
        if (item.key === 'quantity') {
          temp.value = this.totalQuantity
          temp.type = 'amount'
          temp.align = 'right'
        }
        if (item.key === 'amount') {
          temp.value = this.totalAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'totalAmount') {
          temp.value = this.totalTotalAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'totalRtAmount') {
          temp.value = this.totalTotalRtAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'isCheck' || item.key === 'isCheckAccount') {
          temp.type = 'checkbox'
          temp.align = 'center'
        }
        return temp
      })
    },
    dataTableMapping() {
      const alignRightFields = [
        'Quantity',
        'SIPriceIncludeTax',
        'Amount',
        'SIAmountIncludeTax',
        'TotalAmount',
        'SIPriceIncludeDiscount',
        'TotalRtAmount',
        'SIDiscountRate',
        'Price',
        'SITaxRate',
      ]
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadSaleInvoice.pageSize *
                (this.payloadSaleInvoice.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.invoiceNo,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )

          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }

          switch (headerItem.fieldName) {
            case 'SIPriceIncludeTax':
            case 'SIAmountIncludeTax':
            case 'SIPriceIncludeDiscount':
            case 'SIDiscountRate':
            case 'SITaxRate':
              obj[mappingFieldName].value =
                obj[mappingFieldName].value == 0
                  ? 0
                  : obj[mappingFieldName].value
              break
          }

          if (headerItem.fieldName === 'WarehouseID') {
            obj[mappingFieldName].value = item.warehouse
          }

          if (headerItem.fieldName === 'PaymentID') {
            obj[mappingFieldName].value = item.payment
          }

          if (headerItem.fieldName === 'Currency') {
            obj[mappingFieldName].value = item.currency
          }

          if (headerItem.fieldName === 'TotalRtAmount') {
            obj[mappingFieldName].value = item.totalRtAmount
          }

          if (alignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }

          if (headerItem.fieldName === 'IsCheck') {
            obj[mappingFieldName].type = 'slot'
          }

          if (headerItem.fieldName === 'IsCheckAccount') {
            obj[mappingFieldName].type = 'slot'
          }
          const listConvertDate = [
            'OrderDate',
            'CheckDate',
            'EditDate',
            'PromiseDate',
            'InvoiceDate',
            'PayDate',
            'DeliveryDate',
          ]
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          if (headerItem.fieldName === 'InvoiceNo') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/sales/invoice/detail?invoiceNo=${item.invoiceNo}`
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const listNumberField = [
        'Quantity',
        'Amount',
        'TotalAmount',
        'TotalRtAmount',
        'Price',
      ]
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
        const maxLength = listNumberField.includes(item.fieldName)
          ? '30'
          : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || invoiceSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter:
            item.fieldName === 'IsCheckAccount' || item.fieldName === 'IsCheck'
              ? 'select'
              : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }

        if (item.fieldName === 'IsCheck') {
          headerItem.options = this.checkAccountOptions
        }

        if (item.fieldName === 'IsCheckAccount') {
          headerItem.options = this.checkAccountOptions
        }

        if (item.fieldName === 'Payment') {
          headerItem.name = this.$t(`lbl_PaymentID_0`)
        }

        header.push(headerItem)
      })

      return header
    },
  },

  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_SALE_INVOICE({
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
    this.SET_PAYLOAD_SALE_INVOICE(payload)
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_SALE_INVOICE: 'filterSort/UPDATE_PAYLOAD_SALE_INVOICE',
      SET_PAYLOAD_SALE_INVOICE: 'filterSort/SET_PAYLOAD_SALE_INVOICE',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),

    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_SALE_INVOICE({
        pageNo: Number(value),
      })
      this.getData()
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_SALE_INVOICE(filterPayload)
      this.getData()
    },
    handleRow(payload) {
      this.$emit('handleDetailId', payload.keyRow)
    },
    async filterAndSort() {
      try {
        this.loading = true
        this.UPDATE_PAYLOAD_SALE_INVOICE({
          payment: this.payloadSaleInvoice.paymentId,
        })
        const res = await api('getInvoices', this.payloadSaleInvoice)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
        }
      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      } finally {
        this.loading = false
      }
    },

    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('getInvoices', this.payloadSaleInvoice)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.loading = false
          this.dataHeader = res.data?.scolumnHides
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements

          const filteredScolumnHides = res?.data?.scolumnHides?.filter(
            (el) => el.fieldName !== 'Blance'
          )

          // Replace 'Payment' with 'PaymentID' in fieldName of remaining objects
          const finalScolumnHides = filteredScolumnHides?.map((item) => {
            if (item.fieldName === 'Payment') {
              item.fieldName = 'PaymentID'
            }
            return item
          })
          this.SET_DATA_COLUMN_HIDE(finalScolumnHides)
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
    handleDetailId(data) {
      this.$emit('handleDetailId', data)
    },
    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },
    handleScroll(value) {
      this.$refs.orderTotal.scrollLeft = value
    },

    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
  },
}
</script>
<style lang="scss" scoped>
.table-invoice {
  height: calc(100% - 70px);
  .table-invoice--body {
    height: calc(100% - 26px);
  }
  .table-invoice--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
  .border--full {
    border-top: 1px solid #5180d8 !important;
  }
}
</style>
