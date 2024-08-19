<template>
  <div class="table__receive-browse-details position-relative">
    <BaseTableDraggable
      v-if="!loading"
      :header="headerMapping"
      :data="dataTableMapping"
      :sort-key="sortKey"
      :is-ascending="isAscending"
      :disabled-filter="true"
      class="table__receive-browse-details--body"
      @row="handleDetailId"
      @sort="sort"
      @changeLayout="changeLayout"
    >
    </BaseTableDraggable>
    <BasePagination
      v-if="!loading"
      :key="refreshPaginationKey"
      :per-page-options="perPageOptions"
      :total="total"
      :per-page="perPage"
      :current-page="currentPage"
      :number-item="dataTable.length"
      class="table__receive-browse-details--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading" />
  </div>
</template>
<script>
import { SERVER_RESPONSE_CODE } from '@/constants'
import { receiveBrowseSchema } from '@/schemas/finance/receive-browse'
import api from '@/api/api'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
import dateTime from '~/mixins/dateTime'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTime],
  props: {
    orderNo: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      currentPage: 1,
      perPage: 1000,
      sortKey: '',
      isAscending: false,
      refreshPaginationKey: Math.random() * 10000,
      queryPayload: {
        language: this.$i18n.locale,
      },
      perPageOptions: [1000, 2000],
      acceptColumns: [
        'LineID',
        'ItemName',
        'OrderDate',
        'Quantity',
        'Price',
        'Amount',
        'Memo',
      ],
    }
  },
  async fetch() {
    await this.getData()
  },
  computed: {
    listDataShow() {
      return this.dataHeader
        .filter(
          (item) => !item.hidden && this.acceptColumns.includes(item.fieldName)
        )
        .map((item) => {
          if (item.fieldName === 'LineID') {
            item.fieldName = 'LineNumber'
          }

          if (item.fieldName === 'ItemName') {
            item.fieldName = 'ProductName'
          }

          if (item.fieldName === 'Memo') {
            item.fieldName = 'MemoDTL'
          }

          return item
        })
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTableMapping() {
      const dateFieldsToConvert = ['OrderDate']
      const alignRightFields = ['Quantity', 'Price', 'Amount']
      const alignCenterFields = ['ProductName', 'OrderDate', 'LineNumber']

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value: index + 1,
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

          if (headerItem.fieldName === 'MemoDTL') {
            obj[mappingFieldName].value = item.detailMemo
          }

          if (dateFieldsToConvert.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          if (alignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          if (alignCenterFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'center'
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const header = []
      this.listDataShow.forEach((item) => {
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || receiveBrowseSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
        }

        if (headerItem.fieldName === 'Memo') {
          headerItem.name = this.$t(`lbl_MemoDTL_0`)
        }

        if (headerItem.fieldName === 'LineNumber') {
          headerItem.name = this.$t(`lbl_LineID_0`)
        }

        if (headerItem.fieldName === 'ProductName') {
          headerItem.name = this.$t(`lbl_ItemName_0`)
        }

        header.push(headerItem)
      })

      return header
    },
  },

  methods: {
    async changePerPage(value) {
      this.perPage = Number(value)
      this.queryPayload.pageSize = this.perPage
      await this.getData()

      ++this.refreshPaginationKey
    },
    async setCurrentPage(value) {
      this.currentPage = Number(value)
      this.queryPayload.pageNo = this.currentPage
      await this.getData()

      ++this.refreshPaginationKey
    },
    async sort({ sortParams }) {
      try {
        this.sortKey = sortParams?.sortKey
        this.isAscending = !sortParams?.isAscending

        const apiPayload = {
          pageNo: this.currentPage,
          orderNO: this.orderNo,
        }

        const finalApiPayload = {}
        for (const key in apiPayload) {
          if (apiPayload[key]) {
            finalApiPayload[key] = apiPayload[key]
          }
        }

        this.queryPayload = finalApiPayload
        this.loading = true
        const res = await api('searchReceiveBrowseByOrderNo', this.queryPayload)

        if (res) {
          this.dataTable = res.data?.tableContent.content
          this.total = res.data?.tableContent.totalElements
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getData() {
      try {
        this.loading = true

        const apiPayload = {
          pageNo: this.currentPage,
          orderNO: this.orderNo,
        }

        const finalApiPayload = {}
        for (const key in apiPayload) {
          if (apiPayload[key]) {
            finalApiPayload[key] = apiPayload[key]
          }
        }

        const res = await api('searchReceiveBrowseByOrderNo', finalApiPayload)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataHeader = res.data.scolumnHides
        this.dataTable = res.data?.tableContent?.content
        this.total = res.data.tableContent.totalElements
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async refresh() {
      this.sortKey = ''
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
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
  },
}
</script>
<style lang="scss" scoped>
.table__receive-browse-details {
  height: calc(100% - 89px);
  .table__receive-browse-details--body {
    border-top: 0;
    border-left: 0;
    border-right: 0;
    height: calc(100% - 43px);
    overflow-y: auto;
  }
  .table__receive-browse-details--footer {
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
