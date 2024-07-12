<template>
  <div class="table__view-import position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table__view-import--body"
      :initial-filters="payloadPurchaseArrivalImport"
      :update-filters-function="UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT"
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
      :per-page="payloadPurchaseArrivalImport.pageSize"
      :current-page="payloadPurchaseArrivalImport.pageNo"
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
import api from '@/api/api'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
import { importPurchaseArrivalSchema } from '~/schemas/purchase/import-purchase-arrival'
import dateTime from '~/mixins/dateTime'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import { SERVER_RESPONSE_CODE } from '~/constants'
export default {
  name: 'TableImportPurchaseArrival',
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
      listCheckbox: this.dataTable?.map((item) =>
        Object.assign({}, item, { value: false })
      ),
      selectedOrderList: [],
      listDataSelected: [],
      isCheckAll: false,
      lang: this.$i18n.locale,
      acceptedFields: [
        'LineNumber',
        'ProductName',
        'POQty',
        'TaxRate',
        'Blance',
        'StopQty',
        'SONO.',
        'DetailMemo',
        'Checker',
        'PONO',
        'OrderDate',
        'TaxRate',
        'ItemCode',
        'ItemName',
        'Unit',
        'Quantity',
        'Price',
        'Amount',
        'Balance',
        'EndQuantity',
        'LineID',
        'Description',
      ],
    }
  },

  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      payloadPurchaseArrivalImport:
        'filterSort/getPayloadPurchaseArrivalImport',
    }),
    listDataShow() {
      const mapProps = {
        Quantity: 'POQty',
        EndQuantity: 'StopQty',
        Balance: 'Blance',
      }

      return this.dataHeader
        .filter(
          (item) => !item.hidden && this.acceptedFields.includes(item.fieldName)
        )
        .map((item) => {
          for (const prop in mapProps) {
            if (item.fieldName === prop) {
              item.fieldName = mapProps[prop]
            }
          }

          return item
        })
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },

    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadPurchaseArrivalImport.pageSize *
                (this.payloadPurchaseArrivalImport.pageNo - 1) +
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
          switch (headerItem.fieldName) {
            case 'OrderDate':
              obj[mappingFieldName].value = this.convertDate(
                item[mappingFieldName]
              )
              obj[mappingFieldName].align = 'center'
              break
            case 'LineID':
              obj.lineNumber = {
                value: item.polineID,
              }
              break
            case 'POQty':
              obj[mappingFieldName].align = 'right'
              break
            case 'Amount':
              obj[mappingFieldName].align = 'right'
              break
            case 'Price':
              obj[mappingFieldName].align = 'right'
              break
            case 'Blance':
              obj[mappingFieldName].align = 'right'
              break
            case 'StopQty':
              obj[mappingFieldName].value = item.stopQty ?? 0
              obj[mappingFieldName].align = 'right'
              break
            case 'TaxRate':
              obj[mappingFieldName].value = item.taxRate ?? 0
              break
            default:
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
            this.dataTable[0] || importPurchaseArrivalSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
        }
        if (item.fieldName === 'LineID') {
          headerItem.key = 'lineNumber'
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
      this.UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT({
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
    this.SET_PAYLOAD_PURCHASE_ARRIVAL_IMPORT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT',
      SET_PAYLOAD_PURCHASE_ARRIVAL_IMPORT:
        'filterSort/SET_PAYLOAD_PURCHASE_ARRIVAL_IMPORT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),

    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        this.isCheckAll = false

        const res = await api(
          'getPurchaseArrivalImport',
          this.payloadPurchaseArrivalImport
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataTable = res.data?.tableContent?.content
        this.dataHeader = res.data?.scolumnHides
        this.total = res.data?.tableContent?.totalElements
        // const arrRemote = [
        //   'SupplierName',
        //   'SupplierCode',
        //   'Description',
        //   'Currency',
        //   'PromiseDate',
        //   'ArrivalAddress',
        //   'Memo',
        //   'CheckDate',
        // ]
        const mapProps = {
          Quantity: 'POQty',
          EndQuantity: 'StopQty',
          Balance: 'Blance',
        }
        const editHeader = JSON.parse(JSON.stringify(this.dataHeader))
          .filter((item) => this.acceptedFields.includes(item.fieldName))
          .map((item) => {
            for (const prop in mapProps) {
              if (item.fieldName === prop) {
                item.fieldName = mapProps[prop]
              }
            }

            return item
          })

        this.SET_DATA_COLUMN_HIDE(editHeader)
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async filterAndSort(filterPayload) {
      try {
        this.loading = true
        const mappedUnitID = this.mapUnit(
          this.payloadPurchaseArrivalImport.unit
        )
        const finalPayload = {
          ...this.payloadPurchaseArrivalImport,
          unit: mappedUnitID,
        }

        const res = await api('getPurchaseArrivalImport', finalPayload)

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
