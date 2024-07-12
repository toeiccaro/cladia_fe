<template>
  <div class="table__outward-plan d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      :active-rows="activeRows"
      :initial-filters="payloadOutwardPlan"
      :update-filters-function="UPDATE_PAYLOAD_OUTWARD_PLAN"
      class="table__outward-plan--body"
      @row="handleRow"
      @search="filterAndSort"
      @changeLayout="changeLayout"
    >
      <slot :slot="'checkbox'">
        <div
          key="checkbox-attract"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox
            v-model="isCheckAll"
            @change="(event) => checkAll(event)"
          ></b-form-checkbox>
        </div>
      </slot>

      <slot v-for="(item, index) in dataTable" :slot="'checkbox-' + index">
        <div
          :key="`checkbox-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox
            v-model="listCheckbox[index].value"
            @change="onChangeCheckbox($event, index)"
          ></b-form-checkbox>
        </div>
      </slot>

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
      :per-page="payloadOutwardPlan.pageSize"
      :current-page="payloadOutwardPlan.pageNo"
      :number-item="dataTable.length"
      class="table__outward-plan--footer"
      :class="{
        'border--full': !total,
      }"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { cloneDeep } from 'lodash'
import dateTime from '@/mixins/dateTime'
import api from '@/api/api'
import { outwardPlanSchema } from '@/schemas/mrp/outward-plan'
import { SERVER_RESPONSE_CODE, FIELD_TYPE } from '@/constants'

import BasePagination from '@/components/UI/BasePagination.vue'
import BaseTableDraggable from '@/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'

export default {
  name: 'TableOutwardPlan',
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
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
      loading: false,
      headerTable: [],
      dataTable: [],
      dataFooter: {},
      total: 0,
      listCheckbox: [],
      lang: this.$i18n.locale,
      isLoadingTable: false,
      isCheckAll: false,
      listMemoChange: [],
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_OUTWARD_PLAN({
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
      payloadOutwardPlan: 'filterSort/getPayloadOutwardPlan',
    }),
    listDataShow() {
      return this.headerTable
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
        {
          key: 'checkbox',
          name: '',
          width: 40,
          type: 'slot',
          canNotSort: true,
        },
      ]

      this.listDataShow.forEach((item) => {
        const maxLength = FIELD_TYPE.NUMBER.includes(item.fieldKey)
          ? '30'
          : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || outwardPlanSchema,
            item.fieldKey
          ),
          name: this.labelMapping[item.fieldName],
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
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
    dataTableMapping() {
      const checkBeforeToday = ['startDate']
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadOutwardPlan.pageSize *
                (this.payloadOutwardPlan.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          checkbox: {
            orderByList: 1,
            type: 'slot',
            value: false,
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
              if (
                checkBeforeToday.includes(headerItem.fieldKey) &&
                this.isBeforeToday(item[mappingFieldName])
              ) {
                obj[mappingFieldName].color = 'red'
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
    dataTotalMapping() {
      const colsHaveTotal = Object.keys(this.dataFooter)
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
          type: 'text',
        }
        if (colsHaveTotal.includes(item.key)) {
          temp.value = this.dataFooter[item.key]
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'orderNO') {
          temp.value = 'Total: '
          temp.align = 'left'
        }
        return temp
      })
    },
    activeRows() {
      const currentActiveRows = this.listCheckbox.map((item, index) => {
        if (item.value) {
          return index
        }

        return null
      })

      return currentActiveRows.filter((item) => item || item === 0)
    },
  },
  watch: {
    dataTable: {
      deep: true,
      immediate: true,
      handler(value) {
        this.listCheckbox = value.map((item) => ({
          endDate: item.endDate,
          id: item.id,
          itemID: item.itemID,
          supplierID: item.supplierID,
          needQty: item.needQty,
          moq: item.moq,
          value: false,
          unit: item.unit,
        }))
        this.listMemoChange = []
        this.SET_OUTWARD_PLAN_MEMOS([])
      },
    },

    listCheckbox: {
      deep: true,
      handler(data) {
        if (!data.length) {
          return
        }

        const allChecked = data.every((item) => item.value)
        if (allChecked) {
          return (this.isCheckAll = true)
        }

        this.isCheckAll = false
      },
    },
  },
  created() {
    this.SET_PAYLOAD_OUTWARD_PLAN({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_PLAN: 'filterSort/UPDATE_PAYLOAD_OUTWARD_PLAN',
      SET_PAYLOAD_OUTWARD_PLAN: 'filterSort/SET_PAYLOAD_OUTWARD_PLAN',
      SET_OUTWARD_PLAN_TOTAL_PAGES: 'mrp/SET_OUTWARD_PLAN_TOTAL_PAGES',
      SET_OUTWARD_PLAN_MEMOS: 'mrp/SET_OUTWARD_PLAN_MEMOS',
    }),
    async getData() {
      try {
        this.isLoadingTable = true

        const res = await api('searchOutwardPlans', this.payloadOutwardPlan)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.headerTable = res.data.scolumnHides
        this.dataTable = res.data.tableContent?.content
        this.dataFooter = res.data?.tableFooter || {}
        this.total = res.data.tableContent?.totalElements
        this.SET_OUTWARD_PLAN_TOTAL_PAGES(res.data?.tableContent?.totalPages)
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async filterAndSort() {
      try {
        this.loading = true

        const fieldValue = this.payloadOutwardPlan.sortByColumn
        const payload = {
          ...this.payloadOutwardPlan,
          sortByColumn: fieldValue === 'orderNO' ? 'id' : fieldValue,
        }
        const res = await api('searchOutwardPlans', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.headerTable = res.data.scolumnHides
          this.dataTable = res.data.tableContent?.content
          this.dataFooter = res.data?.tableFooter || {}
          this.total = res.data.tableContent?.totalElements
          this.SET_OUTWARD_PLAN_TOTAL_PAGES(res.data?.tableContent?.totalPages)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    onChangeCheckbox(event, index) {
      this.listCheckbox[index].value = !this.listCheckbox[index].value
    },
    checkAll(value) {
      this.listCheckbox = this.listCheckbox.map((item) =>
        Object.assign({}, item, { value })
      )
    },
    handleRow(payload) {
      const { index } = payload
      this.listCheckbox[index].value = !this.listCheckbox[index].value
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_OUTWARD_PLAN(filterPayload)
      this.filterAndSort()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_OUTWARD_PLAN({
        pageNo: Number(value),
      })
      this.filterAndSort()
    },
    onChangeMemo(value, item) {
      const idx = this.listMemoChange.findIndex(
        (el) => el.outwardPlanID === item.id.value
      )
      const memo = {
        outwardPlanID: item.id.value,
        memo: item.memo.value,
      }
      if (idx !== -1) {
        this.listMemoChange[idx].memo = value
        this.SET_OUTWARD_PLAN_MEMOS(cloneDeep(this.listMemoChange))
        return
      }
      this.listMemoChange.push(memo)
      this.SET_OUTWARD_PLAN_MEMOS(cloneDeep(this.listMemoChange))
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
.table__outward-plan {
  height: calc(100% - 70px);

  .table__outward-plan--body {
    height: calc(100% - 26px);
  }

  .table__outward-plan--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
</style>
