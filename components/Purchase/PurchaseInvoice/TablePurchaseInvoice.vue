<template>
  <div class="table-view d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      class="table-view--body"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      :initial-filters="payloadPurchaseInvoice"
      :update-filters-function="UPDATE_PAYLOAD_PURCHASE_INVOICE"
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
      <slot v-for="(item, index) in dataTable" :slot="`isCheck-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.isCheck" />
        </div>
      </slot>
      <slot v-for="(item, index) in dataTable" :slot="`isStop-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.isStop" />
        </div>
      </slot>
    </BaseTableDraggable>

    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadPurchaseInvoice.pageSize"
      :current-page="payloadPurchaseInvoice.pageNo"
      :number-item="dataTable.length"
      class="table-view--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import systemMixins from '@/mixins/system'
import dateTimeMixins from '@/mixins/dateTime'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
import { purchaseInvoiceSchema } from '~/schemas/purchase/purchase-invoice'

export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [systemMixins, dateTimeMixins],
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
      isLoadingTable: false,
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters({
      payloadPurchaseInvoice: 'filterSort/getPayloadPurchaseInvoice',
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
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
        .map((item) => ({
          ...item,
          fieldName:
            item.fieldName === 'PaymentID' ? 'Payment' : item.fieldName,
        }))
    },
    dataTotalMapping() {
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
          type: 'text',
        }
        if (item.key === 'invoiceNO') {
          temp.value = 'Total: '
        }
        const listCalculate = [
          'quantity',
          'otherCost',
          'weight',
          'tariff',
          'taxRate',
          'totalOtherCost1',
          'totalOtherCost2',
          'totalOtherCost3',
          'totalOtherCost4',
          'totalOtherCost5',
          'totalTariff',
          'amount',
          'noTaxAmount',
        ]
        listCalculate.forEach((el) => {
          if (item.key === el) {
            temp.value = this.calculateTotalOfField(el)
            temp.type = 'amount'
            temp.align = 'right'
          }
        })
        if (item.key === 'isCheck' || item.key === 'isStop') {
          temp.type = 'checkbox'
        }
        return temp
      })
    },

    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadPurchaseInvoice.pageSize *
                (this.payloadPurchaseInvoice.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.orderNO,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )

          const listConvertDate = [
            'PromiseDate',
            'OrderDate',
            'CheckDate',
            'EditDate',
            'ReceiptDate',
          ]
          const listAlignRight = [
            'LineID',
            'TotalTariff',
            'TotalOtherCost1',
            'TotalOtherCost2',
            'TotalOtherCost3',
            'TotalOtherCost4',
            'TotalOtherCost5',
            'Weight',
            'Quantity',
            'Price',
            'Amount',
            'TaxRate',
            'Tariff',
            'OtherCost',
            'ReceiptLineID',
            'NoTaxAmount',
          ]
          const listAlignCenter = [
            'OrderDate',
            'ReceiptDate',
            'CheckDate',
            'EditDate',
          ]

          obj[mappingFieldName] = { value: item[mappingFieldName] }

          if (
            headerItem.fieldName === 'IsCheck' ||
            headerItem.fieldName === 'IsStop'
          ) {
            obj[mappingFieldName].type = 'slot'
          }
          if (headerItem.fieldName === 'LineID') {
            obj[mappingFieldName].value = item.lineNumber
          }
          if (headerItem.fieldName === 'Payment') {
            obj[mappingFieldName].value = item.payment
          }
          if (headerItem.fieldName === 'ShareType') {
            obj[mappingFieldName].value = item.shareType1
          }
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          if (listAlignRight.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          if (listAlignCenter.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'center'
          }
          if (headerItem.fieldName === 'OrderNO') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/purchase/invoice/detail?orderNo=${item.orderNO}`
          }
          if (headerItem.fieldName === 'PaymentID') {
            obj[mappingFieldName].value = item.payment
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const listNumberField = [
        'LineID',
        'TotalTariff',
        'TotalOtherCost1',
        'TotalOtherCost2',
        'TotalOtherCost3',
        'TotalOtherCost4',
        'TotalOtherCost5',
        'Weight',
        'Quantity',
        'Price',
        'Amount',
        'TaxRate',
        'Tariff',
        'OtherCost',
        'ReceiptLineID',
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
            this.dataTable[0] || purchaseInvoiceSchema,
            item.fieldName
          ),
          name: this.labelMapping[
            item.fieldName === 'Payment' ? 'PaymentID' : item.fieldName
          ],
          filter:
            item.fieldName === 'IsCheck' || item.fieldName === 'IsStop'
              ? 'select'
              : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }
        if (item.fieldName === 'IsCheck' || item.fieldName === 'IsStop') {
          headerItem.options = this.checkAccountOptions
        }
        header.push(headerItem)
      })
      return header
    },
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_PURCHASE_INVOICE({
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
    this.SET_PAYLOAD_PURCHASE_INVOICE(payload)
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_INVOICE:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_INVOICE',
      SET_PAYLOAD_PURCHASE_INVOICE: 'filterSort/SET_PAYLOAD_PURCHASE_INVOICE',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    handleDetailId(data) {
      this.$emit('handleDetailId', data.keyRow)
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_PURCHASE_INVOICE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_PURCHASE_INVOICE({
        pageNo: Number(value),
      })
      this.getData()
    },
    calculateTotalOfField(fieldName) {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item[fieldName]) {
          sum += this.numberRemoveComas(item[fieldName])
        }
      })
      return sum
    },

    async filterAndSort() {
      try {
        this.loading = true

        const res = await api(
          'getListPurchaseInvoice',
          this.payloadPurchaseInvoice
        )

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
    convertLineNumberDisable(data) {
      return data.map((item) => {
        if (item.fieldName === 'SOLineID') {
          item.disable = true
        }
        return item
      })
    },
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api(
          'getListPurchaseInvoice',
          this.payloadPurchaseInvoice
        )
        this.isLoadingTable = false
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.dataHeader = res.data.scolumnHides
          this.dataTable = res.data.tableContent.content
          this.total = res.data.tableContent.totalElements
          this.dataTotal = res.data.tableFooter
          this.SET_DATA_COLUMN_HIDE(
            this.convertLineNumberDisable(res?.data?.scolumnHides)
          )
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
        if (fieldName === 'LineID') {
          return 'lineNumber'
        } else if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },
  },
}
</script>
<style lang="scss" scoped>
.table-view {
  height: calc(100% - 71px);
  .table-view--body {
    height: calc(100% - 26px);
  }
  .table-view--footer {
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
