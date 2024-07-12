<template>
  <div class="table__view-import position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table__view-import--body"
      :initial-filters="payloadPurchaseInvoiceImport"
      :update-filters-function="UPDATE_PAYLOAD_PURCHASE_INVOICE_IMPORT"
      @search="filterAndSort"
      @row="handleDetailId"
      @changeLayout="changeLayout"
    >
      <slot slot="checkbox">
        <div
          key="cell-checkbox"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <input
            ref="checkboxAll"
            v-model="isCheckAll"
            type="checkbox"
            class="table-checkboxes"
            @change="(event) => checkAll(event.target.checked)"
          />
        </div>
      </slot>
      <slot v-for="(item, index) in listCheckbox" :slot="'checkbox-' + index">
        <div
          :key="`cell-checkbox-${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <input
            v-model="listCheckbox[index].value"
            type="checkbox"
            class="table-checkbox"
          />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadPurchaseInvoiceImport.pageSize"
      :current-page="payloadPurchaseInvoiceImport.pageNo"
      :number-item="listCheckbox.length"
      class="mt-2 table__view-import--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { get } from 'lodash'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { importPurchaseInvoiceSchema } from '@/schemas/purchase/import-purchase-invoice'
import api from '@/api/api'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
import dateTime from '~/mixins/dateTime'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'

export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTime],
  props: {
    purchaseInvoiceData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      listCheckbox: [],
      isCheckAll: false,
      isLoadingTable: false,
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_PURCHASE_INVOICE_IMPORT({
        language: this.lang,
      })
      await Promise.all([this.getData(), this.getUnitOptions(this.lang)])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      payloadPurchaseInvoiceImport:
        'filterSort/getPayloadPurchaseInvoiceImport',
    }),

    listDataShow() {
      const acceptedFields = [
        'ReceiptNo',
        'OrderDate',
        'DeliveryNO',
        'PONO',
        'POLineID',
        'ItemCode',
        'ItemName',
        'Description',
        'Unit',
        'Weight',
        'ReceiptQty',
        'Price',
        'Amount',
        'TaxRate',
        'NoTaxAmount',
      ]
      return this.dataHeader
        .filter(
          (item) => !item.hidden && acceptedFields.includes(item.fieldName)
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
        const listCalculate = ['receiptQty', 'amount', 'noTaxAmount']
        listCalculate.forEach((el) => {
          if (item.key === el) {
            temp.value = this.calculateTotalOfField(el)
            temp.type = 'number'
            temp.align = 'right'
          }
        })
        return temp
      })
    },
    dataTableMapping() {
      const data = this.listCheckbox.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadPurchaseInvoiceImport.pageSize *
                (this.payloadPurchaseInvoiceImport.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          checkbox: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.lineID,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const listConvertDate = ['EditDate', 'CheckDate', 'OrderDate']
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          if (headerItem.fieldName === 'Weight') {
            obj[mappingFieldName].value = item.weight ?? 0
          }
          if (headerItem.fieldName === 'NoTaxAmount') {
            obj[mappingFieldName].value = item.noTaxAmount ?? 0
          }
          if (headerItem.fieldName === 'TaxRate') {
            obj[mappingFieldName].value = item.taxRate ?? 0
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
          canNotSort: true,
        },
        {
          key: 'checkbox',
          name: '',
          width: 40,
          type: 'slot',
          canNotSort: true,
        },
      ]
      this.listDataShow.forEach((item) => {
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || importPurchaseInvoiceSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: item.fieldName === 'Unit' ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
        }

        if (item.fieldName === 'Unit') {
          headerItem.options = this.unitOptions
        }

        if (item.fieldName === 'ReceiptQty') {
          headerItem.name = this.$t('lbl_Quantity_0')
        }
        if (item.fieldName === 'POLineID') {
          headerItem.name = this.$t('lbl_LineID_0')
        }
        header.push(headerItem)
      })

      return header
    },
  },

  watch: {
    dataTable: {
      deep: true,
      handler(value) {
        const purchaseInvoiceDetails =
          this.purchaseInvoiceData?.pinvoiceDTL || []

        const selectedItems = purchaseInvoiceDetails.map(
          (item) => item.receiptLineId
        )

        this.listCheckbox = value
          .filter((item) => !selectedItems.includes(item.lineID))
          .map((item) => Object.assign({}, item, { value: false }))

        this.total = this.listCheckbox.length
      },
    },

    listCheckbox: {
      deep: true,
      handler(data) {
        this.isCheckAll = data.length && data.every((item) => item.value)
      },
    },
  },
  destroyed() {
    this.SET_PAYLOAD_PURCHASE_INVOICE_IMPORT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapActions('base', ['getUnitOptions']),
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_INVOICE_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_INVOICE_IMPORT',
      SET_PAYLOAD_PURCHASE_INVOICE_IMPORT:
        'filterSort/SET_PAYLOAD_PURCHASE_INVOICE_IMPORT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),

    mapUnit(unitId) {
      return this.unitOptions.find((item) => item.value === unitId)?.text
    },

    calculateTotalOfField(fieldName) {
      let sum = 0
      this.listCheckbox.forEach((item) => {
        if (item[fieldName]) {
          sum += this.numberRemoveComas(item[fieldName])
        }
      })
      return sum
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_PURCHASE_INVOICE_IMPORT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_PURCHASE_INVOICE_IMPORT({
        pageNo: Number(value),
      })
      this.getData()
    },
    async filterAndSort() {
      try {
        this.loading = true

        const mappedUnitID = this.mapUnit(
          this.payloadPurchaseInvoiceImport.unit
        )
        const finalPayload = {
          ...this.payloadPurchaseInvoiceImport,
          unit: mappedUnitID,
        }

        const res = await api('getPurchaseInvoiceImportList', finalPayload)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent.content
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
        this.isCheckAll = false

        const res = await api(
          'getPurchaseInvoiceImportList',
          this.payloadPurchaseInvoiceImport
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataHeader = res.data.scolumnHides

        const resContent = get(res, 'data.tableContent.content')

        this.dataTable = resContent
        this.SET_DATA_COLUMN_HIDE(res?.data?.scolumnHides)
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
    checkAll(value = true) {
      this.listCheckbox = this.listCheckbox.map((item) =>
        Object.assign({}, item, { value })
      )
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
  },
}
</script>
<style lang="scss" scoped>
.table__view-import {
  height: calc(100% - 89px);
  .table__view-import--body {
    border-top: 0;
    border-left: 0;
    border-right: 0;
    height: calc(100% - 43px);
    overflow-y: auto;
  }
  .table__view-import--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
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
