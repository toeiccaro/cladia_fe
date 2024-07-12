<template>
  <div class="table__item-master position-relative">
    <BaseTableDraggable
      v-if="!loading"
      :header="headerMapping"
      :data="dataTableMapping"
      :disabled-filter="true"
      :is-disable-draggable="true"
      class="table__item-master--body"
      :initial-filters="payloadInventoryQuery"
      :update-filters-function="UPDATE_PAYLOAD_INVENTORY_QUERY"
      @search="filterAndSort"
      @changeLayout="changeLayout"
    >
      <slot v-for="(item, index) in dataTableQuery" :slot="`isBad-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.isBad" />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      :total="totalElements"
      :per-page="payloadInventoryQuery.pageSize"
      :current-page="payloadInventoryQuery.pageNo"
      :number-item="dataTableQuery.length"
      class="table__item-master--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <div
      v-if="loading"
      class="spinner content d-flex justify-content-center align-items-center"
    >
      <b-spinner
        b-spinner
        style="width: 3rem; height: 3rem"
        label="Loading..."
      ></b-spinner>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import BasePagination from '@/components/UI/BasePagination.vue'
import dateTime from '@/mixins/dateTime'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'

export default {
  components: { BaseTableDraggable, BasePagination },
  mixins: [dateTime],
  props: {
    dataHeaderQuery: {
      type: Array,
      required: false,
      default: () => [],
    },
    dataTableQuery: {
      type: Array,
      required: false,
      default: () => [],
    },
    checkedList: {
      type: Array,
      default: () => [],
    },
    totalElements: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    ...mapGetters({
      payloadInventoryQuery: 'filterSort/getPayloadInventoryQuery',
    }),
    dataTableMapping() {
      const data = this.dataTableQuery.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadInventoryQuery.pageSize *
                (this.payloadInventoryQuery.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.itemID,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const listAlignRight = ['Price', 'Quantity', 'CostPrice', 'Amount']
          obj[headerItem.key] = {
            value: item[headerItem.key],
          }
          if (headerItem.fieldName === 'IsBad') {
            obj[headerItem.key].type = 'slot'
          }
          if (listAlignRight.includes(headerItem.fieldName)) {
            obj[headerItem.key].align = 'right'
          }
          if (headerItem.fieldName === 'TransateDate') {
            obj[headerItem.key].value = this.convertDate(item.transDate)
          }
        })
        return obj
      })
      return data
    },
    listDataShow() {
      let listHeader = []
      listHeader = this.dataHeaderQuery.filter(
        (item) => item.default || this.checkedList.includes(item.fieldName)
      )

      return listHeader.sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    headerMapping() {
      const header = [
        {
          key: 'index',
          name: '',
          width: 30,
        },
      ]
      this.listDataShow.forEach((item) => {
        const headerItem = {
          key: item.key,
          name: item.labelName,
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
        }

        header.push(headerItem)
      })

      return header
    },
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_INVENTORY_QUERY:
        'filterSort/UPDATE_PAYLOAD_INVENTORY_QUERY',
      SET_PAYLOAD_INVENTORY_QUERY: 'filterSort/SET_PAYLOAD_INVENTORY_QUERY',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_INVENTORY_QUERY(filterPayload)
      this.emitSearch()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_INVENTORY_QUERY({
        pageNo: Number(value),
      })
      this.emitSearch()
    },
    filterAndSort() {
      this.emitSearch()
    },
    emitSearch() {
      this.$emit('filterAndSort', this.payloadInventoryQuery)
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

<style scoped lang="scss">
.table__item-master {
  height: calc(100% - 230px);
  .table__item-master--body {
    border-top: 0;
    border-left: 0;
    border-right: 0;
    height: calc(100% - 25px);
    overflow-y: auto;
  }
  .table__item-master--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
  }
}
</style>
