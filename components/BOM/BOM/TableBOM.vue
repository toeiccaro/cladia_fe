<template>
  <div class="table__bom position-relative">
    <BaseTableDraggable
      v-if="!loading"
      :header="headerMapping"
      :bom-list="bomList"
      :sort-params="sortParams"
      :is-go-detail="isGoDetail"
      :is-edit="isEdit"
      :expand-parent-list="expandParentList"
      class="table__bom--body"
      @changeSortParams="changeSortParams"
      @rowActive="handleRowActive"
      @setExpandParentList="setExpandParentList"
      @setTotalItem="setTotalItem"
    >
    </BaseTableDraggable>

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
    <BasePageBom
      :total="totalItem"
      class="table-item-master--footer"
    ></BasePageBom>
  </div>
</template>

<script>
import dateTime from '@/mixins/dateTime'
import { sortList } from '@/utils/utils'
import BasePageBom from '@/components/UI/BasePageBom.vue'
import BaseTableDraggable from '~/components/BOM/BOM/BaseTableDraggable.vue'
import { ROOT_LEVEL } from '~/constants'

export default {
  components: {
    BaseTableDraggable,
    BasePageBom,
  },
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
    isGoDetail: {
      type: Boolean,
      default: () => false,
    },
    isEdit: {
      type: Boolean,
      default: () => true,
    },
    expandParentList: {
      type: Array,
      default: () => [],
      require: true,
    },
  },
  data() {
    return {
      data: [],
      itemTypeOptions: [],
      currentPage: 1,
      perPage: 30,
      loading: false,
      bomList: [],
      sortParams: {
        sortKey: '',
        sortType: '',
      },
      totalItem: 0,
    }
  },
  computed: {
    headerMapping() {
      const header = []
      this.dataHeaderQuery.forEach((item) => {
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
    currentPage() {
      this.$emit('changePerPage', {
        pageNo: this.currentPage,
        pageSize: this.perPage,
      })
    },

    sortParams: {
      handler(value) {
        this.sortBomList(value)
      },
    },

    dataTableQuery: {
      handler(value) {
        this.totalItem = value.length
        this.bomList = [...value]
        this.bomList.forEach((item) => {
          if (item.effectiveDate) {
            item.effectiveDate = this.convertDate(item.effectiveDate)
          }
        })
      },
    },
  },
  methods: {
    setTotalItem(value) {
      this.totalItem = value
    },
    handleRowActive(data) {
      this.$emit('rowActive', data)
    },
    changeLimit(value) {
      this.perPage = value * 1
      this.loading = true
      this.$emit('changePerPage', {
        pageNo: this.currentPage,
        pageSize: this.perPage,
      })
      this.loading = false
    },

    changeSortParams(sortParams) {
      this.sortParams = sortParams
    },

    sortBomList(sortParams) {
      const { sortKey, sortType } = sortParams

      const rootBomList = []
      const childBomList = []

      this.bomList.forEach((bom) => {
        if (bom.level !== ROOT_LEVEL) {
          childBomList.push(bom)
        } else {
          rootBomList.push(bom)
        }
      })

      sortList(rootBomList, sortKey, sortType)

      childBomList.forEach((child) => {
        rootBomList.forEach((root, index) => {
          if (child.parentID === root.id) {
            rootBomList.splice(index + 1, 0, child)
          }
        })
      })

      this.bomList = [...rootBomList]
    },

    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },

    setExpandParentList(itemId) {
      this.$emit('setExpandParentList', itemId)
    },
  },
}
</script>

<style scoped lang="scss">
.table__bom {
  height: calc(100% - 96px);
  .table__bom--body {
    border-top: 0;
    border-left: 0;
    border-right: 0;
    height: calc(100% - 29px);
    overflow-y: auto;
  }
  .table__bom--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border-bottom: 0;
    border-left: 0;
    border-right: 0;
  }
  .table-item-master--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
</style>
