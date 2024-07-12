<template>
  <div class="table__item-master position-relative">
    <BaseTableDraggable
      v-if="!loading"
      :header="headerMapping"
      :data="dataTableMapping"
      :sort-key="sortKey"
      :is-ascending="isAscending"
      :disabled-filter="true"
      class="table__item-master--body"
      @sort="sort"
      @changeLayout="changeLayout"
    >
    </BaseTableDraggable>
    <BasePagination
      :total="total"
      :per-page="perPage"
      :current-page="currentPage"
      :number-item="dataTablePrice.length"
      class="table__item-master--footer"
      @changePage="(value) => (currentPage = value * 1)"
      @changePerPage="changeLimit"
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
import BasePagination from '@/components/UI/BasePagination.vue'
// import api from '~/api/api'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
export default {
  name: 'TableItemMaster',
  components: { BaseTableDraggable, BasePagination },
  props: {
    dataHeaderPrice: {
      type: Array,
      required: false,
      default: () => [],
    },
    dataTablePrice: {
      type: Array,
      required: false,
      default: () => [],
    },
    totalPage: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  data() {
    return {
      data: [],
      itemTypeOptions: [],
      total: 0,
      currentPage: 1,
      perPage: 30,
      loading: false,
      sortKey: '',
      isAscending: false,
    }
  },
  computed: {
    dataTableMapping() {
      const data = this.dataTablePrice.map((item, index) => {
        const obj = {
          index: {
            value: index + 1,
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
          obj[headerItem.key] = {
            value: item[headerItem.key] || '',
            color: headerItem.color || '',
          }
        })
        return obj
      })
      return data
    },
    listDataShow() {
      return this.dataHeaderPrice
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
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
  watch: {
    async currentPage() {
      await this.$emit('changePerPage', {
        pageNo: this.currentPage,
        pageSize: this.perPage,
      })
    },
  },
  methods: {
    // eslint-disable-next-line require-await
    async changeLimit(value) {
      this.perPage = value * 1
      this.loading = true
      await this.$emit('changePerPage', {
        pageNo: this.currentPage,
        pageSize: this.perPage,
      })
      this.loading = false
    },
    sort({ sortParams, filterParams }) {
      try {
        this.sortKey = sortParams.sortKey
        this.isAscending = !sortParams.isAscending
        const params = {}
        params.pageNo = this.currentPage
        params.pageSize = this.perPage
        for (const property in sortParams) {
          if (sortParams[property]) {
            params[property] = sortParams[property]
          }
        }
        params.sortBy = this.sortKey
        params.isAsc = this.isAscending ? 'ASC' : 'DESC'
        this.loading = true
        const searchFormOptional = Object.assign({}, params, filterParams)
        this.$emit('changePerPage', searchFormOptional)
        this.loading = false
      } catch (err) {
        console.error(err)
      }
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
  height: calc(100% - 120px);
  .table__item-master--body {
    border-top: 0;
    border-left: 0;
    border-right: 0;
    height: calc(100% - 43px);
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
