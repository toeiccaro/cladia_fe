<template>
  <div class="table__view-import position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table__view-import--body"
      :initial-filters="payloadCompletionReportImport"
      :update-filters-function="UPDATE_PAYLOAD_COMPLETION_REPORT_IMPORT"
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
            v-model="selectedOrderList"
            :value="index"
            type="checkbox"
            class="table-checkbox"
          />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadCompletionReportImport.pageSize"
      :current-page="payloadCompletionReportImport.pageNo"
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
import dateTime from '~/mixins/dateTime'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import { SERVER_RESPONSE_CODE } from '~/constants'
export default {
  name: 'TableImportProductionOrder',
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
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_COMPLETION_REPORT_IMPORT({
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
      payloadCompletionReportImport:
        'filterSort/getPayloadCompletionReportImport',
    }),
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },

    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadCompletionReportImport.pageSize *
                (this.payloadCompletionReportImport.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          checkbox: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          itemID: {
            value: item.itemID,
          },
          customerID: {
            value: item.customerID,
          },
          itemTypeID: {
            value: item.itemTypeID,
          },
          startDate: {
            value: item.startDate,
          },
          keyRow: item.lineID,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const fieldKey = headerItem.fieldKey

          obj[fieldKey] = {
            value: item[fieldKey] || '',
          }
          switch (headerItem.fieldName) {
            case 'PromiseDate':
            case 'OrderDate':
              obj[fieldKey].value = this.convertDate(item[fieldKey])
              obj[fieldKey].align = 'center'
              break
            case 'FinishedQuantity':
            case 'ProductionQuantity':
            case 'PossibleImportQty':
              obj[fieldKey].value = item[fieldKey] || 0
              obj[fieldKey].align = 'right'
              break
            // case 'ItemName':
            //   obj.itemName = {
            //     value: item.productName,
            //   }
              // break
            case 'Blance':
              obj[fieldKey].align = 'right'
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
      this.listDataShow
        .filter((item) => {
          const ignoreLabel = ['StartDate', 'SONO', 'CustomerName']
          return !ignoreLabel.includes(item.fieldName)
        })
        .forEach((item) => {
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

    selectedOrderList: {
      handler(value) {
        if (value?.length === this.dataTable?.length) {
          this.isCheckAll = true
          this.listDataSelected = this.dataTable
        } else {
          this.isCheckAll = false
          this.listDataSelected = this.dataTable.filter((item, index) =>
            this.selectedOrderList.includes(index)
          )
        }
      },
    },
  },

  destroyed() {
    this.SET_PAYLOAD_COMPLETION_REPORT_IMPORT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_COMPLETION_REPORT_IMPORT:
        'filterSort/UPDATE_PAYLOAD_COMPLETION_REPORT_IMPORT',
      SET_PAYLOAD_COMPLETION_REPORT_IMPORT:
        'filterSort/SET_PAYLOAD_COMPLETION_REPORT_IMPORT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),

    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_COMPLETION_REPORT_IMPORT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_COMPLETION_REPORT_IMPORT({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        this.isCheckAll = false

        const res = await api(
          'importCompletionReport',
          this.payloadCompletionReportImport
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
          'importCompletionReport',
          this.payloadCompletionReportImport
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
      this.SET_PAYLOAD_COMPLETION_REPORT_IMPORT({
        language: this.lang,
        pageNo: 1,
        pageSize: 30,
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
    handleScroll(value) {
      this.$refs.orderTotal.scrollLeft = value
    },
    checkAll(value) {
      // this.listCheckbox = this.listCheckbox.map((item) => {
      //   return Object.assign({}, item, { value })
      // })

      if (this.isCheckAll) {
        this.dataTable.forEach((item, index) => {
          if (item) {
            this.selectedOrderList.push(index)
            this.selectedOrderList = Array.from(new Set(this.selectedOrderList))
          }
        })
        this.listDataSelected = this.dataTable
      } else {
        this.selectedOrderList = []
        this.listDataSelected = []
      }
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
