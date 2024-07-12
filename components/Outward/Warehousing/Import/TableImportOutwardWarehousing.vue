<template>
  <div class="table__view-import position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table__view-import--body"
      :initial-filters="payloadOutwardWarehousingImport"
      :update-filters-function="UPDATE_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT"
      @search="filterAndSort"
      @row="handleDetailId"
      @changeLayout="changeLayout"
    />
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadOutwardWarehousingImport.pageSize"
      :current-page="payloadOutwardWarehousingImport.pageNo"
      :number-item="dataTable.length"
      class="mt-2 table__view-import--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    />

    <BaseLoading v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import api from '@/api/api'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import dateTime from '~/mixins/dateTime'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import { SERVER_RESPONSE_CODE } from '~/constants'
export default {
  name: 'TableImportOutwardWarehousing',
  components: { BaseTableDraggable, BasePagination, BaseLoading },
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
      lang: this.$i18n.locale,
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      listCheckbox: this.dataTable?.map((item) =>
        Object.assign({}, item, { value: false })
      ),
      isCheckAll: false,
      acceptedFieldKeys: [
        'orderNo',
        'orderDate',
        'responsible',
        'supplierResponsible',
        'responsible',
        'itemCode',
        'itemName',
        'unit',
        'description',
        'promiseDate',
        'blance',
        'supplierName',
        'checker',
        'price',
        'amount',
        'quantity',
        'inQuantity',
        'endQuantity',
        'memoDTL',
      ],
    }
  },

  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      payloadOutwardWarehousingImport:
        'filterSort/getPayloadOutwardWarehousingImport',
    }),
    listDataShow() {
      return this.dataHeader
        .filter(
          (item) =>
            !item.hidden && this.acceptedFieldKeys.includes(item.fieldKey)
        )
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },

    dataTableMapping() {
      const convertDateFields = ['OrderDate', 'PromiseDate']
      const numberFields = [
        'Quantity',
        'Price',
        'Amount',
        'EndQuantity',
        'Blance',
        'StopQuantity',
        'InQuantity',
      ]

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadOutwardWarehousingImport.pageSize *
                (this.payloadOutwardWarehousingImport.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          unitID: {
            value: item.unitID,
          },
          currencyID: {
            value: item.currencyID,
          },
          itemID: {
            value: item.itemId,
          },
          wpoId: {
            value: item.id,
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

          if (convertDateFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
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
      ]

      this.listDataShow.forEach((item) => {
        const headerItem = {
          key: item.fieldKey,
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
        }

        if (item.fieldName === 'EndQuantity') {
          headerItem.name = this.$t(`lbl_StopQty_0`)
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
      this.UPDATE_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT({
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
    this.SET_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT',
      SET_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT:
        'filterSort/SET_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        this.isCheckAll = false
        const res = await api(
          'getImportOutwardWarehousing',
          this.payloadOutwardWarehousingImport
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataTable = res.data?.tableContent?.content
        this.dataHeader = res.data?.scolumnHides
        this.total = res.data?.tableContent?.totalElements
        this.SET_DATA_COLUMN_HIDE(this.dataHeader)
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async filterAndSort() {
      try {
        this.loading = true

        const res = await api(
          'getImportOutwardWarehousing',
          this.payloadOutwardWarehousingImport
        )

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
    async refresh() {
      this.$bus.$emit('refresh-filter-data')
      this.SET_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT({
        language: this.lang,
        pageNo: 1,
        pageSize: 30,
      })
      await this.getData()
    },
    handleDetailId(data) {
      this.$emit('handleDetailId', data.item || {})
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
