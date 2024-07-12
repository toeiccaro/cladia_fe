<template>
  <div class="table__view-import position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table__view-import--body"
      :initial-filters="payloadOutwardInvoiceImport"
      :update-filters-function="UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT"
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

    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadOutwardInvoiceImport.pageSize"
      :current-page="payloadOutwardInvoiceImport.pageNo"
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
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT({
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
      payloadOutwardInvoiceImport: 'filterSort/getPayloadOutwardInvoiceImport',
    }),
    listDataShow() {
      const filteredData = this.dataHeader.filter((item) => {
        const validItem = !item.hidden
        return validItem
      })

      return filteredData.sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTotalMapping() {
      const propertyMapping = {
        itemName: {
          value: 'Total: ',
          type: 'text',
        },
        quantity: {
          value: this.calculateSum('quantity'),
          align: 'right',
          type: 'amount',
        },
        amount: {
          value: this.calculateSum('amount'),
          align: 'right',
          type: 'amount',
        },
      }

      return this.headerMapping.map((item) => {
        const { key } = item
        const temp = {
          key,
          value: '',
          ...propertyMapping[key],
        }
        return temp
      })
    },
    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadOutwardInvoiceImport.pageSize *
                (this.payloadOutwardInvoiceImport.pageNo - 1) +
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
        const listConvertDate = ['OrderDate', 'EditDate', 'CheckDate']
        const listAlignRight = ['Amount', 'Price', 'Quantity']
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const fieldKey = headerItem.fieldKey
          obj[fieldKey] = {
            value: item[fieldKey] || '',
          }
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[fieldKey].value = this.convertDate(item[fieldKey])
            obj[fieldKey].align = 'center'
          }
          if (listAlignRight.includes(headerItem.fieldName)) {
            obj[fieldKey].value = item[fieldKey] || 0
            obj[fieldKey].align = 'right'
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
          key: item.fieldKey,
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          fieldKey: item.fieldKey,
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

  destroyed() {
    this.SET_PAYLOAD_OUTWARD_INVOICE_IMPORT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT',
      SET_PAYLOAD_OUTWARD_INVOICE_IMPORT:
        'filterSort/SET_PAYLOAD_OUTWARD_INVOICE_IMPORT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    calculateSum(key) {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item[key]) {
          sum += parseFloat(item[key])
        }
      })
      return sum
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT({
        pageNo: Number(value),
      })
      this.getData()
    },
    async filterAndSort() {
      try {
        this.loading = true
        const res = await api(
          'getOutwardInvoiceImportList',
          this.payloadOutwardInvoiceImport
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
          'getOutwardInvoiceImportList',
          this.payloadOutwardInvoiceImport
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
      this.SET_PAYLOAD_OUTWARD_INVOICE_IMPORT({
        language: this.lang,
        pageNo: 1,
        pageSize: 30,
        supplierID: this.payloadOutwardInvoiceImport.supplierID,
      })
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
