<template>
  <div class="table-view d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      class="table-view--body"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      :initial-filters="payloadPurchaseOrder"
      :update-filters-function="UPDATE_PAYLOAD_PURCHASE_ORDER"
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
    </BaseTableDraggable>

    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadPurchaseOrder.pageSize"
      :current-page="payloadPurchaseOrder.pageNo"
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
import { purchaseOrderSchema } from '@/schemas/purchase/purchase-order'
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
    }
  },
  computed: {
    ...mapGetters({
      payloadPurchaseOrder: 'filterSort/getPayloadPurchaseOrder',
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
        if (item.key === 'isCheck') {
          temp.type = 'checkbox'
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
      ]

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadPurchaseOrder.pageSize *
                (this.payloadPurchaseOrder.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.pono,
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
          ]
          obj[mappingFieldName] = { value: item[mappingFieldName] }
          if (alignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          switch (headerItem.fieldName) {
            case 'POPriceIncludeTax':
            case 'POAmountIncludeTax':
            case 'POPriceIncludeDiscount':
            case 'PODiscountRate':
              obj[mappingFieldName].value = obj[mappingFieldName].value == 0 ? 0 : obj[mappingFieldName].value
              break
          }
          if (headerItem.fieldName === 'IsCheck') {
            obj[mappingFieldName].type = 'slot'
          }
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }

          const alignRight = ['Quantity', 'Price', 'Amount', 'EndQuantity']
          if (alignRight.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          if (headerItem.fieldName === 'PONO') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/purchase/order/detail?pono=${item.pono}`
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
        console.log('this.labelMapping', this.labelMapping);
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || purchaseOrderSchema,
            item.fieldName
          ),
          name: this.labelMapping[item.fieldName],
          filter: item.fieldName === 'IsCheck' ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }
        if (item.fieldName === 'IsCheck') {
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
      this.UPDATE_PAYLOAD_PURCHASE_ORDER({
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
    this.SET_PAYLOAD_PURCHASE_ORDER(payload)
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_ORDER: 'filterSort/UPDATE_PAYLOAD_PURCHASE_ORDER',
      SET_PAYLOAD_PURCHASE_ORDER: 'filterSort/SET_PAYLOAD_PURCHASE_ORDER',
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
      this.UPDATE_PAYLOAD_PURCHASE_ORDER(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_PURCHASE_ORDER({
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

        const res = await api('getListPurchaseOrder', this.payloadPurchaseOrder)

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
        const res = await api('getListPurchaseOrder', this.payloadPurchaseOrder)
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
