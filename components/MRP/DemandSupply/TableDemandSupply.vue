<template>
  <div class="table-demand-supply d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :table-footer="dataFooter"
      class="table-demand-supply--body"
      :initial-filters="payloadDemandSupply"
      :update-filters-function="UPDATE_PAYLOAD_DEMAND_SUPPLY"
      @sort="filterSortDemandSupply"
      @search="filterSortDemandSupply"
      @changeLayout="changeLayout"
    >
      <slot v-for="(item, idx) in dataTableMapping" :slot="'memo-' + idx">
        <div :key="idx" class="py-[4px]">
          <b-form-input
            v-model="item.memo.value"
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
      :per-page="payloadDemandSupply.pageSize"
      :current-page="payloadDemandSupply.pageNo"
      :number-item="dataTable.length"
      class="table-demand-supply--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { cloneDeep } from 'lodash'
import BaseTableDraggable from './BaseTableDraggable.vue'
import { demandSupplySchema } from '@/schemas/mrp/demand-supply'
import { SERVER_RESPONSE_CODE, FIELD_TYPE } from '@/constants'
import BasePagination from '@/components/UI/BasePagination.vue'
import dateTime from '@/mixins/dateTime'
import api from '@/api/api'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
export default {
  name: 'TableDemandSupply',
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
      dataFooter: {},
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_DEMAND_SUPPLY({
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
      payloadDemandSupply: 'filterSort/getPayloadDemandSupply',
    }),
    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadDemandSupply.pageSize *
                (this.payloadDemandSupply.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          id: {
            value: item.id,
          },
        }

        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldKey
          )

          switch (true) {
            case FIELD_TYPE.NUMBER.includes(headerItem.fieldKey):
              obj[mappingFieldName] = {
                value: item[mappingFieldName] || 0,
                align: 'right',
              }
              break
            case FIELD_TYPE.DATE.includes(headerItem.fieldKey):
              obj[mappingFieldName] = {
                value: this.convertDate(item[mappingFieldName]),
                align: 'center',
              }
              break
            case FIELD_TYPE.DATE_TIME.includes(headerItem.fieldKey):
              obj[mappingFieldName] = {
                value: this.convertDateTillSecond(item[mappingFieldName]),
                align: 'center',
              }
              break
            case FIELD_TYPE.INPUT.includes(headerItem.fieldKey):
              obj[mappingFieldName] = {
                value: item[mappingFieldName] || '',
                type: 'slot',
              }
              break
            default:
              obj[mappingFieldName] = {
                value: item[mappingFieldName] || ' ',
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
        const maxLength = FIELD_TYPE.NUMBER.includes(item.fieldKey)
          ? '30'
          : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || demandSupplySchema,
            item.fieldKey
          ),
          name: this.labelMapping[item.fieldName],
          filter: 'input',
          width: +item.fieldWide,
          fieldName: item.fieldName,
          maxLength,
        }
        if (FIELD_TYPE.CANNOT_FILTER.includes(item.fieldKey)) {
          headerItem.canNotSort = true
          headerItem.disabled = true
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
        this.SET_DEMAND_SUPPLY_MEMOS([])
      },
    },
  },
  created() {
    this.SET_PAYLOAD_DEMAND_SUPPLY({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_DEMAND_SUPPLY: 'filterSort/UPDATE_PAYLOAD_DEMAND_SUPPLY',
      SET_PAYLOAD_DEMAND_SUPPLY: 'filterSort/SET_PAYLOAD_DEMAND_SUPPLY',
      SET_DEMAND_SUPPLY_MEMOS: 'mrp/SET_DEMAND_SUPPLY_MEMOS',
      SET_DEMAND_SUPPLY_TOTAL_PAGES: 'mrp/SET_DEMAND_SUPPLY_TOTAL_PAGES',
    }),
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    onChangeMemo(value, item) {
      const idx = this.listMemoChange.findIndex(
        (el) => el.supplyDemandID === item.id.value
      )
      const memo = {
        supplyDemandID: item.id.value,
        memo: item.memo.value,
      }
      if (idx !== -1) {
        this.listMemoChange[idx].memo = value
        this.SET_DEMAND_SUPPLY_MEMOS(cloneDeep(this.listMemoChange))
        return
      }
      this.listMemoChange.push(memo)
      this.SET_DEMAND_SUPPLY_MEMOS(cloneDeep(this.listMemoChange))
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_DEMAND_SUPPLY(filterPayload)
      this.filterSortDemandSupply()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_DEMAND_SUPPLY({
        pageNo: Number(value),
      })
      this.filterSortDemandSupply()
    },

    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('searchDemandSupply', this.payloadDemandSupply)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          const resData = res.data
          this.dataHeader = resData?.scolumnHides
          this.dataTable = resData?.tableContent?.content
          this.dataFooter = resData?.tableFooter || {}
          this.total = resData?.tableContent?.totalElements
          this.SET_DEMAND_SUPPLY_TOTAL_PAGES(resData?.tableContent?.totalPages)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async filterSortDemandSupply() {
      try {
        this.loading = true
        const res = await api('searchDemandSupply', this.payloadDemandSupply)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res?.data?.scolumnHides
          this.dataTable = res?.data?.tableContent?.content
          this.dataFooter = res?.data?.tableFooter || {}
          this.total = res?.data.tableContent?.totalElements
          this.SET_DEMAND_SUPPLY_TOTAL_PAGES(
            res?.data?.tableContent?.totalPages
          )
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
.table-demand-supply {
  height: calc(100% - 70px);

  .table-demand-supply--body {
    height: calc(100% - 26px);
  }

  .table-demand-supply--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
</style>
