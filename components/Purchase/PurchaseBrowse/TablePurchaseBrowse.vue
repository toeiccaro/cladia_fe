<template>
  <div class="table-view d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      class="table-view--body"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      :current-index="currentIndex"
      :initial-filters="payloadPurchaseBrowse"
      :update-filters-function="UPDATE_PAYLOAD_PURCHASE_BROWSE"
      @search="filterAndSort"
      @row="handleDetailId"
      @changeLayout="changeLayout"
    >
    </BaseTableDraggable>

    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadPurchaseBrowse.pageSize"
      :current-page="payloadPurchaseBrowse.pageNo"
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
import { purchaseBrowseSchema } from '@/schemas/purchase/purchase-browse'
import systemMixins from '@/mixins/system'
import dateTimeMixins from '@/mixins/dateTime'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'

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
      currentIndex: -1,
    }
  },
  computed: {
    ...mapGetters({
      payloadPurchaseBrowse: 'filterSort/getPayloadPurchaseBrowse',
    }),

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
        if (item.key === 'unit') {
          temp.value = 'Total: '
        }
        if (item.key === 'quantity') {
          temp.value = this.calculateTotalOfField('quantity')
          temp.type = 'amount'
          temp.align = 'right'
        }
        if (item.key === 'receiptQty') {
          temp.value = this.calculateTotalOfField('receiptQty')
          temp.type = 'amount'
          temp.align = 'right'
        }
        if (item.key === 'rtQty') {
          temp.value = this.calculateTotalOfField('rtQty')
          temp.type = 'amount'
          temp.align = 'right'
        }
        if (item.key === 'balance') {
          temp.value = this.calculateTotalOfField('balance')
          temp.type = 'amount'
          temp.align = 'right'
        }
        if (item.key === 'endQuantity') {
          temp.value = this.calculateTotalOfField('endQuantity')
          temp.type = 'amount'
          temp.align = 'right'
        }
        if (item.key === 'amount') {
          temp.value = this.calculateTotalOfField('amount')
          temp.type = 'amount'
          temp.align = 'right'
        }
        return temp
      })
    },

    dataTableMapping() {
      const alignRightFields = [
        'LineID',
        'Quantity',
        'Price',
        'TaxRate',
        'EndQuantity',
        'Amount',
        'ReceiptQty',
        'RtQty',
        'Balance',
      ]
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadPurchaseBrowse.pageSize *
                (this.payloadPurchaseBrowse.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          supplierID: {
            value: item.supplierID,
          },
          isStop: {
            value: item.isStop,
          },
          keyRow: { pono: item.pono, poLineID: item.lineID },
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          const listConvertDate = ['PromiseDate', 'OrderDate', 'CheckDate']
          obj[mappingFieldName] = { value: item[mappingFieldName] }
          if (alignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          if (headerItem.fieldName === 'Unit') {
            obj[mappingFieldName].value = item.unit
          }

          if (headerItem.fieldName === 'Currency') {
            obj[mappingFieldName].value = item.currency
          }

          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const listNumberField = [
        'LineID',
        'Quantity',
        'Price',
        'TaxRate',
        'EndQuantity',
        'Amount',
        'ReceiptQty',
        'RtQty',
        'Balance',
      ]
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
      ]

      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || purchaseBrowseSchema,
            item.fieldName
          ),
          name: this.labelMapping[item.fieldName],
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }

        if (item.fieldName === 'Balance') {
          headerItem.name = this.$t('lbl_BalanceQty_0')
        }

        header.push(headerItem)
      })
      return header
    },
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_PURCHASE_BROWSE({
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
    this.SET_PAYLOAD_PURCHASE_BROWSE({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_BROWSE:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_BROWSE',
      SET_PAYLOAD_PURCHASE_BROWSE: 'filterSort/SET_PAYLOAD_PURCHASE_BROWSE',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),

    handleDetailId(data) {
      this.currentIndex = data.index
      this.$emit('handleDetailId', data)
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_PURCHASE_BROWSE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_PURCHASE_BROWSE({
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
          'getListPurchaseBrowse',
          this.payloadPurchaseBrowse
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
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api(
          'getListPurchaseBrowse',
          this.payloadPurchaseBrowse
        )
        this.isLoadingTable = false
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.dataHeader = res.data.scolumnHides
          this.dataTable = res.data.tableContent.content
          this.total = res.data.tableContent.totalElements
          this.dataTotal = res.data.tableFooter
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
.table-view {
  height: calc(100% - 70px);
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
