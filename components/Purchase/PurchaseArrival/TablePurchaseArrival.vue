<template>
  <div class="table-view d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      class="table-view--body"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      :initial-filters="payloadPurchaseArrival"
      :update-filters-function="UPDATE_PAYLOAD_PURCHASE_ARRIVAL"
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
      <slot v-for="(item, index) in dataTable" :slot="`isPrintedLabel-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.isPrintedLabel" />
        </div>
      </slot>
    </BaseTableDraggable>

    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadPurchaseArrival.pageSize"
      :current-page="payloadPurchaseArrival.pageNo"
      :number-item="dataTable.length"
      class="table-view--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import systemMixins from '@/mixins/system'
import dateTimeMixins from '@/mixins/dateTime'
import api from '@/api/api'
import { purchaseArrivalSchema } from '~/schemas/purchase/purchase-arrival'
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
      listHeaderIgnore: ['OrderDate', 'Weight', 'TaxRate', 'NoTaxAmount'],
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters({
      payloadPurchaseArrival: 'filterSort/getPayloadPurchaseArrival',
      inspectionTypes: 'base/getInspectionTypes',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    checkOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },
    listDataShow() {
      return this.dataHeader
        .filter(
          (item) =>
            !item.hidden && !this.listHeaderIgnore.includes(item.fieldName)
        )
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
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
        if (item.key === 'receiptQty') {
          temp.value = this.calculateTotalOfField('receiptQty')
          temp.type = 'number'
          temp.align = 'right'
        }
        if (item.key === 'amount') {
          temp.value = this.calculateTotalOfField('amount')
          temp.type = 'amount'
          temp.align = 'right'
        }
        if (item.key === 'goodQty') {
          temp.value = this.calculateTotalOfField('goodQty')
          temp.type = 'number'
          temp.align = 'right'
        }
        if (item.key === 'badQty') {
          temp.value = this.calculateTotalOfField('badQty')
          temp.type = 'number'
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
        'ReceiptQty',
        'POLineID',
        'GoodQty',
        'BadQty',
      ]
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadPurchaseArrival.pageSize *
                (this.payloadPurchaseArrival.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.receiptNO,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          const listConvertDate = ['ReceiptDate', 'CheckDate', 'EditDate']
          obj[mappingFieldName] = { value: item[mappingFieldName] }
          if (alignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          if (headerItem.fieldName === 'IsCheck') {
            obj[mappingFieldName].type = 'slot'
          }
          if (headerItem.fieldName === 'IsPrintedLabel') {
            obj[mappingFieldName].type = 'slot'
          }
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          if (headerItem.fieldName === 'ReceiptNo') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/purchase/arrival/detail?receiptNO=${item.receiptNO}`
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
        'POLineID',
        'GoodQty',
        'BadQty',
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
      const listHeaderSelect = ['IsCheck', 'InspectionType', 'IsPrintedLabel']

      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName)
          ? '30'
          : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || purchaseArrivalSchema,
            item.fieldName
          ),
          name: this.labelMapping[item.fieldName],
          filter: listHeaderSelect.includes(item.fieldName)
            ? 'select'
            : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }
        if (item.fieldName === 'IsCheck') {
          headerItem.options = this.checkOptions
        }
        if (item.fieldName === 'IsPrintedLabel') {
          headerItem.options = this.checkOptions
        }
        if (item.fieldName === 'InspectionType') {
          headerItem.options = this.inspectionTypes
        }
        if (item.fieldName === 'POLineID') {
          headerItem.name = this.$t('lbl_POLineID_0')
        }
        header.push(headerItem)
      })
      return header
    },
  },
  fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_PURCHASE_ARRIVAL({
        language: this.lang,
      })
      Promise.all([this.getInspectionTypesFromAPI(this.lang), this.getData()])
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
    this.SET_PAYLOAD_PURCHASE_ARRIVAL(payload)
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_ARRIVAL:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_ARRIVAL',
      SET_PAYLOAD_PURCHASE_ARRIVAL: 'filterSort/SET_PAYLOAD_PURCHASE_ARRIVAL',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    ...mapActions({
      getInspectionTypesFromAPI: 'base/getInspectionTypesFromAPI',
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
      this.UPDATE_PAYLOAD_PURCHASE_ARRIVAL(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_PURCHASE_ARRIVAL({
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
          'getListPurchaseArrival',
          this.payloadPurchaseArrival
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
          'getListPurchaseArrival',
          this.payloadPurchaseArrival
        )
        this.isLoadingTable = false
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.dataHeader = res.data.scolumnHides
          this.dataTable = res.data.tableContent.content
          this.total = res.data.tableContent.totalElements
          this.dataTotal = res.data.tableFooter
          this.SET_DATA_COLUMN_HIDE(
            this.convertListIgnoreHeader(res?.data?.scolumnHides)
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    convertListIgnoreHeader(data) {
      return data.filter(
        (item) => !this.listHeaderIgnore.includes(item.fieldName)
      )
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
