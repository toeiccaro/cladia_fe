<template>
  <div class="table__view-import position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table__view-import--body"
      :initial-filters="payloadSaleInvoiceImport"
      :update-filters-function="UPDATE_PAYLOAD_SALE_INVOICE_IMPORT"
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
      <slot v-for="(item, index) in dataTable" :slot="'checkbox-' + index">
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
    <div
      v-if="dataTable.length"
      id="order-total"
      ref="orderTotal"
      class="d-flex align-items-center overflow-hidden"
    >
      <div
        v-for="(item, index) in headerMapping"
        :key="`total${index}`"
        :style="{
          maxWidth: ratioMapping[index],
          flex: `0 0 ` + ratioMapping[index],
        }"
        class="total-item"
      ></div>
    </div>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadSaleInvoiceImport.pageSize"
      :current-page="payloadSaleInvoiceImport.pageNo"
      :number-item="dataTable.length"
      class="mt-2 table__view-import--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { get } from 'lodash'
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { importSaleInvoiceSchema } from '@/schemas/sales/import-sale-invoice'
import api from '@/api/api'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
import dateTime from '~/mixins/dateTime'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTime],
  props: {
    newInvoiceData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      isLoadingTable: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      listCheckbox: this.dataTable?.map((item) =>
        Object.assign({}, item, { value: false })
      ),
      isCheckAll: false,
      lang: this.$i18n.locale,
    }
  },

  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      payloadSaleInvoiceImport: 'filterSort/getPayloadSaleInvoiceImport',
    }),
    listDataShow() {
      const tableColumns = [
        'SONO',
        'OrderDate',
        'CustomerPO',
        'ItemCode',
        'ItemName',
        'Description',
        'UnitID',
        'SOQTY',
        'Blance',
        'Price',
        'SIDiscountRate',
        'SIPriceIncludeDiscount',
        'SITaxRate',
        'SIPriceIncludeTax',
        'Amount',
        'SIAmountIncludeTax',
        'PromiseDate',
        'MemoDTL',
        'StopQty',
      ]
      const filteredData = this.dataHeader.filter((item) => {
        const validItem = !item.hidden && tableColumns.includes(item.fieldName)
        return validItem
      })

      return filteredData
        .map((item) => {
          if (item.fieldName === 'UnitID') {
            return Object.assign({}, item, {
              fieldName: 'Unit',
            })
          }

          return item
        })
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    ratioMapping() {
      const ratio = ['40px', '40px']
      this.listDataShow.forEach((item) => {
        ratio.push(item.fieldWide + 'px')
      })
      return ratio
    },
    dataTableMapping() {
      const numberFields = ['SOQTY', 'Blance', 'Price', 'StopQty', 'Amount']
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadSaleInvoiceImport.pageSize *
                (this.payloadSaleInvoiceImport.pageNo - 1) +
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
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }
          if (
            headerItem.fieldName === 'OrderDate' ||
            headerItem.fieldName === 'PromiseDate'
          ) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }

          if (
            headerItem.fieldName === 'EditDate' ||
            headerItem.fieldName === 'CheckDate'
          ) {
            obj[mappingFieldName].value = this.convertDateTillSecond(
              item[mappingFieldName]
            )
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
            this.dataTable[0] || importSaleInvoiceSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
        }
        if (item.fieldName === 'SOQTY') {
          headerItem.name = this.$t('lbl_SOQty_0')
        }
        if (item.fieldName === 'Unit') {
          headerItem.filter = 'select'
          headerItem.options = this.unitOptions
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
        this.listCheckbox = value.map((item) =>
          Object.assign({}, item, { value: false })
        )
        this.isCheckAll = false
      },
    },
  },

  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_SALE_INVOICE_IMPORT({
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
    this.SET_PAYLOAD_SALE_INVOICE_IMPORT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_SALE_INVOICE_IMPORT:
        'filterSort/UPDATE_PAYLOAD_SALE_INVOICE_IMPORT',
      SET_PAYLOAD_SALE_INVOICE_IMPORT:
        'filterSort/SET_PAYLOAD_SALE_INVOICE_IMPORT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),

    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_SALE_INVOICE_IMPORT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_SALE_INVOICE_IMPORT({
        pageNo: Number(value),
      })
      this.getData()
    },
    async filterAndSort() {
      try {
        this.loading = true
        const res = await api(
          'getInvoicesImportList',
          this.payloadSaleInvoiceImport
        )
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
        this.isCheckAll = false

        const res = await api(
          'getInvoicesImportList',
          this.payloadSaleInvoiceImport
        )
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataHeader = res.data.scolumnHides

        const resContent = get(res, 'data.tableContent.content')

        this.dataTable = resContent
        this.total = res.data.tableContent.totalElements
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
