<template>
  <div class="table__view-import position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table__view-import--body"
      :initial-filters="payloadPurchaseReturnImport"
      :update-filters-function="UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT"
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
            @change="setSelectedImportItem(item, index)"
          />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadPurchaseReturnImport.pageSize"
      :current-page="payloadPurchaseReturnImport.pageNo"
      :number-item="dataTable.length"
      class="mt-2 table__view-import--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { importPurchaseReturnSchema } from '@/schemas/purchase/import-purchase-return'
import api from '@/api/api'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
import dateTime from '~/mixins/dateTime'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import { SERVER_RESPONSE_CODE } from '~/constants'
export default {
  name: 'TableImportSaleReturn',
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTime],
  props: {
    dataForm: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      isLoadingTable: false,
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      dataTotal: {},
      listCheckbox: this.dataTable?.map((item) =>
        Object.assign({}, item, { value: false })
      ),
      selectedDetails: [],
      isCheckAll: false,
      tableColumns: [
        'ReceiptNo',
        'ReceiptDate',
        'Receiver',
        'ItemCode',
        'ItemName',
        'Unit',
        'ReceiptQty',
        'LotNo',
        'PONO',
        'Description',
        'Warehouse',
        'POLineID',
      ],
      lang: this.$i18n.locale,
    }
  },

  computed: {
    ...mapGetters({
      warehouseOptions: 'base/getWarehouseOptions',
      unitOptions: 'base/getUnitOptions',
      payloadPurchaseReturnImport: 'filterSort/getPayloadPurchaseReturnImport',
    }),
    listDataShow() {
      return this.dataHeader
        .filter((item) => {
          if (!item.hidden && this.tableColumns.includes(item.fieldName)) {
            return item
          }

          return null
        })
        .filter(Boolean)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },

    dataTableMapping() {
      const alignRightFields = ['ReceiptQty', 'POLineID']

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadPurchaseReturnImport.pageSize *
                (this.payloadPurchaseReturnImport.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          checkbox: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.inLineID,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }
          if (headerItem.fieldName === 'ReceiptDate') {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          if (alignRightFields.includes(headerItem.fieldName)) {
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
            this.dataTable[0] || importPurchaseReturnSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
        }
        if (item.fieldName === 'Unit') {
          headerItem.options = this.unitOptions
          headerItem.filter = 'select'
        }
        if (item.fieldName === 'Warehouse') {
          headerItem.options = this.warehouseOptions
          headerItem.filter = 'select'
        }
        if (item.fieldName === 'ReturnQty') {
          headerItem.name = this.$t('lbl_RtQuantity_0')
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
      this.UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT({
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
    this.SET_PAYLOAD_PURCHASE_RETURN_IMPORT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT',
      SET_PAYLOAD_PURCHASE_RETURN_IMPORT:
        'filterSort/SET_PAYLOAD_PURCHASE_RETURN_IMPORT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        this.isCheckAll = false

        const res = await api(
          'getImportPurchaseReturn',
          this.payloadPurchaseReturnImport
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataTable = res.data?.tableContent?.content
        this.dataHeader = res.data?.scolumnHides
        this.total = res.data?.tableContent?.totalElements
        this.SET_DATA_COLUMN_HIDE(
          this.dataHeader.filter((item) =>
            this.tableColumns.includes(item.fieldName)
          )
        )
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async filterAndSort() {
      try {
        this.loading = true

        const mappedUnitID = this.mapUnit(this.payloadPurchaseReturnImport.unit)
        const mappedWarehouseID = this.mapWarehouse(
          this.payloadPurchaseReturnImport.warehouse
        )

        const finalPayload = {
          ...this.payloadPurchaseReturnImport,
          unit: mappedUnitID,
          warehouse: mappedWarehouseID,
        }

        const res = await api('getImportPurchaseReturn', finalPayload)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data?.tableContent?.content
          this.total = res.data?.tableContent?.totalElements
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    mapUnit(unitId) {
      return this.unitOptions.find((item) => item.value === unitId)?.text
    },
    mapWarehouse(warehouseId) {
      return this.warehouseOptions.find((item) => item.value === warehouseId)
        ?.text
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
    handleScroll(value) {
      this.$refs.orderTotal.scrollLeft = value
    },
    checkAll(value = true) {
      this.listCheckbox = this.listCheckbox.map((item) =>
        Object.assign({}, item, { value })
      )
    },
    setSelectedImportItem(rowData, rowIndex) {
      this.isCheckAll = false

      const tableCheckboxes = document.querySelectorAll('.table-checkbox')
      const isChecked = tableCheckboxes[rowIndex].checked

      Object.assign(rowData, { rowIndex })

      if (!isChecked) {
        this.$refs.checkboxAll.checked = false
        this.listCheckbox = this.listCheckbox.filter(
          (item) => item.rowIndex !== rowIndex
        )
        return
      }

      const saleViewsChecked = this.dataTable.find(
        (dataItem) =>
          dataItem.invoiceNO === rowData.invoiceNO &&
          dataItem.inLineID === rowData.inLineID
      )
      this.listCheckbox.push(saleViewsChecked)
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
