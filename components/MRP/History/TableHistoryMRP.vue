<template>
  <div class="table-mrp-history d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-mrp-history--body"
      :initial-filters="payloadMRPHistory"
      :update-filters-function="UPDATE_PAYLOAD_MRP_HISTORY"
      @search="filterAndSort"
      @changeLayout="changeLayout"
    >
      <slot v-for="(item, idx) in dataTableMapping" :slot="'memoMRP-' + idx">
        <div :key="idx" class="py-[4px]">
          <b-form-input
            v-model="item.memoMRP.value"
            type="text"
            class="w-full h-[20px] border border-dark focus:!border text-[#212529]"
            @change="(val) => onChangeMemo(val, item)"
          />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadMRPHistory.pageSize"
      :current-page="payloadMRPHistory.pageNo"
      :number-item="dataTable.length"
      class="table-mrp-history--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { cloneDeep } from 'lodash'
import { historySchema } from '@/schemas/mrp/history'
import { SERVER_RESPONSE_CODE, FIELD_TYPE } from '@/constants'
import BasePagination from '@/components/UI/BasePagination.vue'
import dateTime from '@/mixins/dateTime'
import api from '@/api/api'
import BaseTableDraggable from '@/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
export default {
  name: 'TableMRPHistory',
  components: {
    BaseTableDraggable,
    BasePagination,
    BaseTableLoader,
  },
  mixins: [dateTime],
  props: {
    labelMapping: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      dataTable: [],
      dataHeader: [],
      total: 0,
      loading: false,
      isLoadingTable: false,
      listMemoChange: [],
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_MRP_HISTORY({
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
      payloadMRPHistory: 'filterSort/getPayloadMRPHistory',
    }),
    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadMRPHistory.pageSize *
                (this.payloadMRPHistory.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
        }

        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )

          switch (true) {
            case FIELD_TYPE.NUMBER.includes(headerItem.fieldName):
              obj[mappingFieldName] = {
                value: item[mappingFieldName] || 0,
                align: 'right',
              }
              break
            case FIELD_TYPE.DATE.includes(headerItem.fieldName):
              obj[mappingFieldName] = {
                value: this.convertDate(item[mappingFieldName]),
                align: 'center',
              }
              break
            case FIELD_TYPE.DATE_TIME.includes(headerItem.fieldName):
              obj[mappingFieldName] = {
                value: this.convertDateTillSecond(item[mappingFieldName]),
                align: 'center',
              }
              break
            case FIELD_TYPE.INPUT.includes(headerItem.fieldName):
              obj[mappingFieldName] = {
                value: item[mappingFieldName] || '',
                type: 'slot',
              }
              break
            default:
              obj[mappingFieldName] = {
                value: item[mappingFieldName] || '',
              }
              break
          }
        })
        return obj
      })
      return data
    },
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
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
        const maxLength = FIELD_TYPE.NUMBER.includes(item.fieldName)
          ? '30'
          : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || historySchema,
            item.fieldName
          ),
          name: this.labelMapping[item.fieldName],
          filter: 'input',
          width: +item.fieldWide,
          fieldName: item.fieldName,
          maxLength,
        }

        header.push(headerItem)
      })

      return header
    },
  },
  watch: {
    dataTable: {
      immediate: true,
      handler() {
        this.listMemoChange = []
        this.SET_HISTORY_MEMOS([])
      },
    },
  },
  created() {
    this.SET_PAYLOAD_MRP_HISTORY({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_MRP_HISTORY: 'filterSort/UPDATE_PAYLOAD_MRP_HISTORY',
      SET_PAYLOAD_MRP_HISTORY: 'filterSort/SET_PAYLOAD_MRP_HISTORY',
      SET_HISTORY_MEMOS: 'mrp/SET_HISTORY_MEMOS',
      SET_HISTORY_TOTAL_PAGES: 'mrp/SET_HISTORY_TOTAL_PAGES',
    }),
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    onChangeMemo(value, item) {
      const idx = this.listMemoChange.findIndex(
        (el) => el.mrpID === item.mrpID.value
      )
      const mrpMemo = {
        mrpID: item.mrpID.value,
        memo: item.memoMRP.value,
      }
      if (idx !== -1) {
        this.listMemoChange[idx].memo = value
        this.SET_HISTORY_MEMOS(cloneDeep(this.listMemoChange))
        return
      }
      this.listMemoChange.push(mrpMemo)
      this.SET_HISTORY_MEMOS(cloneDeep(this.listMemoChange))
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_MRP_HISTORY(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_MRP_HISTORY({
        pageNo: Number(value),
      })
      this.getData()
    },

    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('getMRPHistory', this.payloadMRPHistory)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          const resData = res.data
          this.dataHeader = resData?.scolumnHides
          this.dataTable = resData?.tableContent?.content
          this.total = resData?.tableContent?.totalElements
          this.SET_HISTORY_TOTAL_PAGES(resData?.tableContent?.totalPages)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async filterAndSort() {
      try {
        this.loading = true
        const res = await api('getMRPHistory', this.payloadMRPHistory)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data?.tableContent?.content
          this.total = res.data?.tableContent?.totalElements
          this.SET_HISTORY_TOTAL_PAGES(res.data?.tableContent?.totalPages)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async refreshTable() {
      await this.getData()
    },
    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },
  },
}
</script>

<style scoped lang="scss">
.table-mrp-history {
  height: calc(100% - 70px);

  .table-mrp-history--body {
    height: calc(100% - 26px);
  }

  .table-mrp-history--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
</style>
