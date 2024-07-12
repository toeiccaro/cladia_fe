<template>
  <div class="position-relative">
    <div
      class="table-container"
      :style="{
        height: '100%',
      }"
    >
      <table id="table-resize">
        <thead class="header-name">
          <draggable v-model="headersComponent" tag="tr" @change="change">
            <th
              v-for="(item, index) in headersComponent"
              :key="`header-${item.key}`"
              :style="{
                minWidth: item.key === 'last' ? '10px' : item.width + 'px',
                width: item.key === 'last' ? '100%' : item.width + 'px',
                maxWidth: item.key === 'last' ? '100%' : item.width + 'px',
              }"
              class="table-item row-header"
              @click="sortBomList(item.key)"
            >
              <div class="sys-flex-center w-100">
                <div class="hide-text w-100">{{ item.name }}</div>
                <template v-if="item.key === sortParams.sortKey">
                  <b-icon-caret-down-fill
                    :class="{
                      'color-active': sortParams.sortType === 'DESC',
                      'color-disable': sortParams.sortType === 'ASC',
                    }"
                    class="ml-1"
                  ></b-icon-caret-down-fill>
                  <b-icon-caret-up-fill
                    class="ml-1"
                    :class="{
                      'color-active': sortParams.sortType === 'ASC',
                      'color-disable': sortParams.sortType === 'DESC',
                    }"
                  ></b-icon-caret-up-fill>
                </template>
              </div>

              <div
                :class="{
                  'resize-bg': resizeState === index,
                }"
                class="resizer"
                @mousedown.prevent="
                  item.key === 'last' ? undefined : mousedown(index, $event)
                "
              >
                &nbsp;
              </div>
            </th>
          </draggable>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in dataComponent"
            v-show="item.isShow"
            :key="`data-${item.id}-${index}`"
            class="row-data"
            :class="{
              active: activeRow === index,
            }"
            @click="handleActiveRow(item, index)"
          >
            <td
              v-for="(headerItem, headerIndex) in headersComponent"
              :key="`${headerItem.key}-${item.id}`"
              :style="{
                minWidth: headerItem.width + 'px',
                width: headerItem.width + 'px',
                maxWidth: headerItem.width + 'px',
              }"
              class="table-item position-relative hide-text"
              :class="headerItem.key === 'last' ? 'cell--last' : ''"
            >
              <template v-if="!isEmptyValue(item[headerItem.key])">
                <div
                  v-if="headerItem.key === 'itemCode'"
                  :style="{
                    marginLeft: item.level * 16 - 16 + 'px',
                  }"
                  class="flex align-items-center"
                >
                  <span v-if="item.isChildren">
                    <b-icon-caret-right-fill
                      v-if="!item.isOpenSubMenu"
                      class="icon-right-fill"
                      @click="handleExpandRow(item, index)"
                    />

                    <b-icon-caret-down-fill
                      v-else
                      class="icon-right-fill"
                      @click="handleNarrow(item)"
                    />
                  </span>

                  <b-icon-circle v-else class="icon-circle" />

                  <nuxt-link
                    v-if="!item.childLeaf && isGoDetail"
                    :to="
                      localePath({
                        path: `b-bom/detail?itemID=${item.itemID}`,
                      })
                    "
                    class="cell-data cell-root d-block text-underline hide-text"
                  >
                    <!-- eslint-disable vue/no-v-html -->
                    <span v-html="keepTextSpaces(item[headerItem.key])"></span
                  ></nuxt-link>
                  <a v-else class="cell-data d-block text-underline hide-text">
                    <!-- eslint-disable vue/no-v-html -->
                    <span v-html="keepTextSpaces(item[headerItem.key])"></span
                  ></a>
                </div>
                <span
                  v-else-if="separateWithCommaFields.includes(headerItem.key)"
                  >{{ makeFormatNumberWithCommas(item[headerItem.key]) }}</span
                >
                <span
                  v-else
                  v-html="keepTextSpaces(item[headerItem.key])"
                ></span>
              </template>

              <div
                class="resizer"
                :class="{ 'resize-bg': resizeState === headerIndex }"
                @mousedown.prevent="mousedown(headerIndex, $event)"
              ></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
import draggable from 'vuedraggable'
import {
  BIconCaretRightFill,
  BIconCircle,
  BIconCaretDownFill,
  BIconCaretUpFill,
} from 'bootstrap-vue'
import systemMixins from '@/mixins/system'
import { DRAGGABLE_TABLE, SORT_TYPE } from '@/constants'
import api from '@/api/api'
import { formatNumberWithCommas } from '~/utils/utils'

export default {
  name: 'BaseTableDraggable',

  components: {
    draggable,
    BIconCaretRightFill,
    BIconCircle,
    BIconCaretDownFill,
    BIconCaretUpFill,
  },

  mixins: [systemMixins],

  props: {
    header: {
      type: Array,
      default: () => [
        {
          key: 'address',
          name: 'address',
          width: 300,
          filter: 'select',
          options: ['test', 'address', 'abc'],
        },
      ],
    },
    bomList: {
      type: Array,
      default: () => [],
    },
    sortParams: {
      type: Object,
      default: () => ({
        sortKey: '',
        sortType: '',
      }),
    },
    isGoDetail: {
      type: Boolean,
      default: () => false,
    },
    expandParentList: {
      type: Array,
      default: () => [],
      require: true,
    },
  },

  data() {
    return {
      headersComponent: this.header,
      dataComponent: [],
      activeRow: -1,
      resizeState: null,
      isResize: false,
      loading: false,
      separateWithCommaFields: ['failRate', 'subWastageRate', 'quantity'],
    }
  },

  computed: {
    apiUrl() {
      if (this.isGoDetail) return 'getBOMChild'
      return 'getBOMReverseChild'
    },
  },

  watch: {
    header: {
      handler(value) {
        this.headersComponent = value
      },
      deep: true,
    },

    bomList: {
      handler(value) {
        this.dataComponent = value
      },
      deep: true,
    },
  },

  methods: {
    makeFormatNumberWithCommas(number) {
      return formatNumberWithCommas(number)
    },

    isEmptyValue(value) {
      return value === '' || value === undefined || value === null
    },
    change() {
      this.$emit('changeLayout', {
        indexColumn: '',
        headerData: this.headersComponent,
      })
    },

    handleActiveRow(item, itemIndex) {
      this.activeRow = itemIndex
      this.$emit('rowActive', item)
    },

    keepTextSpaces(value) {
      return value === 0
        ? value
        : value && value.toString().replace(/ /g, '&nbsp;')
    },

    mousedown(index, e) {
      const headerBeforeChange = JSON.parse(
        JSON.stringify(this.headersComponent)
      )
      this.resizeState = index
      this.isResize = true
      const clienX = e.clientX
      const itemWidth = headerBeforeChange[index].width * 1
      const mouseMoveHandler = (event) => {
        headerBeforeChange[index].width = itemWidth * 1 + event.clientX - clienX

        const cantResize =
          headerBeforeChange[index].width <= DRAGGABLE_TABLE.MIN_COLUMN_WIDTH
        if (cantResize) {
          headerBeforeChange[index].width = DRAGGABLE_TABLE.MIN_COLUMN_WIDTH
        }
      }
      const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler)
        document.removeEventListener('mouseup', mouseUpHandler)
        this.resizeState = null
        setTimeout(() => (this.isResize = false), 0)
      }
      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)
      this.headersComponent = headerBeforeChange
      this.$emit('changeLayout', {
        indexColumn: index,
        headerData: this.headersComponent,
      })
    },

    formatNumber(value) {
      const invalidNumber = isNaN(Number(value)) || !value
      if (invalidNumber) {
        return value
      }

      return this.parseStringToFloat(value)
    },

    sortBomList(key) {
      this.$emit('changeSortParams', {
        sortKey: key,
        sortType:
          this.sortParams.sortType === SORT_TYPE.ASCENDING
            ? SORT_TYPE.DESCENDING
            : SORT_TYPE.ASCENDING,
      })
    },

    async handleExpandRow(item, index) {
      const payload = {
        id: item.id,
        language: this.$i18n.locale,
        level: item.level,
      }

      if (this.expandParentList.includes(item.id)) {
        item.isOpenSubMenu = true
        this.checkShowChildItem(item.id, true)
      } else {
        try {
          let newIndex = index + 1
          this.loading = true
          const response = await api(this.apiUrl, payload)

          if (response && response.status === 200) {
            item.isOpenSubMenu = true
            this.$emit('setExpandParentList', item.id)
            this.$emit('setTotalItem', response.data?.length)
            response.data.forEach((child) => {
              this.dataComponent.splice(newIndex, 0, child)
              newIndex++
            })
          }
        } catch (error) {
          window.alert(error?.data?.response?.data?.message)
        } finally {
          this.loading = false
        }
      }
    },

    handleNarrow(item) {
      item.isOpenSubMenu = false
      this.checkShowChildItem(item.id, false)
    },

    checkShowChildItem(parentId, status) {
      this.dataComponent.forEach((item) => {
        if (item.parentID === parentId) {
          item.isShow = status
          if (!status) {
            item.isOpenSubMenu = false
          }

          this.checkShowChildItem(item.id, false)
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.Center-Name {
  text-align: center;
}
.custom-checkbox {
  z-index: 0 !important;
}

#table-resize {
  height: fit-content;
  position: relative;

  .header-name {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .row__filter {
    position: sticky;
    top: 22px;
    left: 0;
    z-index: 1;
  }
}

.table-container {
  overflow: auto;
  width: 100%;
  border: 1px solid #5180d8;
  border-bottom: none;
  font-size: 12px;
  height: calc(100% - 22px);
}

.table-total {
  border-left: 1px solid #5180d8;
  border-right: 1px solid #5180d8;
  font-size: 12px;
  position: absolute;
  bottom: 0;
  overflow: hidden;
  width: 100%;
  left: 0;
  height: 22px;

  .total__item {
    border-top: 1px solid #5180d8;
  }
}

th,
td {
  height: 22px;
}

th,
.header-bg {
  background: #eff3ff 50% 50% repeat-x;
}

.row-header:not(.header__cell--last) {
  position: relative;
  cursor: pointer;
  text-align: center;
}

.row-header:not(.header__cell--last):hover {
  background-color: #fbec88;
}

.row-data {
  // cursor: pointer;
  &:hover {
    td:not(.cell--last) {
      background: #fbec88;
    }

    * {
      text-decoration: none !important;
    }
  }
}

.active td:not(.cell--last) {
  background: #fbec88;
}

table {
  border-spacing: 0;
  border-right: 1px solid #5180d8;
}

.table-item {
  border: 1px solid #5180d8;
  border-top: none;
  border-right: none;
  padding: 0 4px;
}

.cell--last:not(.filter__cell--last) {
  border: none;
  border-left: 1px solid #5180d8;
}

.filter__cell--last {
  border-bottom: 1px solid #5180d8;
  border-top: 0;
}

.cell--last {
  border-right: 1px solid #5180d8 !important;
}

.color-active {
  color: #5180d8 !important;
}

.color-disable {
  color: #d4e7f5 !important;
}

.total__item {
  border-bottom: none;
}

.table-item:first-child {
  border-left: none;
}

.header-filter {
  padding: 2px 5px;

  input,
  select {
    font-size: 12px;
    padding: 4px 8px;
    line-height: 1;
    height: 20px;
    border-radius: 2px;
    border: solid 1px rgb(118, 118, 118) !important;
  }
}

table {
  table-layout: fixed;
  overflow: auto;
}

.resizer {
  position: absolute;
  top: 0;
  right: 0;
  width: 5px;
  cursor: col-resize;
  user-select: none;
  height: 100%;
}

.resize-bg {
  border-right: 1px solid blue;
}

.hide-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-underline {
  text-decoration: underline;
  cursor: default;
}

.cell-root {
  cursor: pointer;
}

.border-dark:focus {
  box-shadow: none !important;
  outline: 1px solid #000000;
}
.header__cell-border--last {
  border-bottom: 1px solid #5180d8 !important;
}

.icon-right-fill {
  font-size: 12px;
  margin-right: 4px;
  color: #439add;
  cursor: pointer;
}

.icon-circle {
  font-size: 9px;
  margin-right: 4px;
  color: #439add;
}
</style>
