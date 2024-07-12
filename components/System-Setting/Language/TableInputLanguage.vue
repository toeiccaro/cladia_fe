<template>
  <div class="position-relative">
    <div
      class="table-container"
      :style="{
        height: '100%',
      }"
    >
      <table id="table-resize">
        <div id="table-header">
          <thead class="header-name">
            <tr>
              <th
                v-for="(item, index) in headersComponent"
                :key="index"
                :style="{
                  minWidth: item.width + 'px',
                  width: item.width + 'px',
                  maxWidth: item.width + 'px',
                }"
                class="table-item row-header"
                :class="{ 'header__cell-border--last': disabledFilter }"
                @click="sort(item.key)"
              >
                <div class="sys-flex-center w-100">
                  <div class="hide-text w-100">{{ item.name }}</div>
                  <template v-if="sortKey && item.key === sortKey">
                    <b-icon-caret-down-fill
                      :class="{
                        'color-active': !isAscending,
                        'color-disable': isAscending,
                      }"
                      class="ml-1"
                    ></b-icon-caret-down-fill>
                    <b-icon-caret-up-fill
                      class="ml-1"
                      :class="{
                        'color-active': isAscending,
                        'color-disable': !isAscending,
                      }"
                    ></b-icon-caret-up-fill>
                  </template>
                </div>
                <div
                  :class="{
                    'resize-bg': resizeState === index,
                  }"
                  class="resizer"
                  @mousedown.prevent="mousedown(index, $event)"
                >
                  &nbsp;
                </div>
              </th>
              <th class="table-item row-header header__cell--last cell--last">
                <div>&nbsp;&nbsp;</div>
              </th>
            </tr>
            <tr v-if="headersComponent.length" class="row__filter">
              <td
                v-for="(item, index) in headersComponent"
                :key="`header-${index}`"
                :style="{
                  minWidth: item.width + 'px',
                  width: item.width + 'px',
                }"
                class="header-bg header-filter text-center table-item position-relative"
              >
                <div v-if="item.key !== 'last'">
                  <b-form-input
                    v-if="item.filter === 'input'"
                    v-model="filters[item.key]"
                    type="text"
                    max-length="256"
                    class="w-100 border border-dark"
                    @keyup.enter="filterData()"
                  />
                </div>
                <div
                  class="resizer"
                  :class="{ 'resize-bg': resizeState === index }"
                  @mousedown.prevent="mousedown(index, $event)"
                >
                  &nbsp;
                </div>
              </td>
            </tr>
          </thead>
        </div>
        <div id="table-body" @scroll="onScrollBody">
          <tbody>
            <tr
              v-for="(item, index) in dataComponent"
              :key="`tr${index}`"
              :class="{
                active:
                  (activeRows && activeRows.includes(index)) ||
                  (!activeRows && activeRow === index),
              }"
              class="row-data"
              @click="eventActiveRow(item, index)"
            >
              <td
                v-for="(headerItem, headerIndex) in headersComponent"
                :key="`item-]${headerIndex}-${index}`"
                :style="{
                  minWidth: headerItem.width + 'px',
                  width: headerItem.width + 'px',
                  maxWidth: headerItem.width + 'px',
                }"
                class="table-item position-relative hide-text"
              >
                <template v-if="item">
                  <div
                    v-if="headerItem.key === 'menuID'"
                    v-b-tooltip
                    :title="item[headerItem.key]"
                    class="hide-text w-100"
                    @click="handleUpdate(item, headerItem, headerIndex, index)"
                  >
                    <span>{{ item[headerItem.key] }}</span>
                  </div>
                  <div
                    v-else
                    class="hide-text w-100"
                    @click="handleUpdate(item, headerItem, headerIndex, index)"
                  >
                    <span v-if="ignoreInput.includes(headerItem.key)">
                      {{ item[headerItem.key] }}</span
                    >
                    <span
                      v-else-if="
                        columnCellActive === headerIndex &&
                        item.isUpdate &&
                        rowCellActive === index
                      "
                    >
                      <b-form-input
                        v-model="item[headerItem.key]"
                        v-auto-focus
                        class="input-update"
                        type="text"
                        @keypress.enter="
                          handleEnter(item, headerItem.key, index)
                        "
                        @change="
                          (value) =>
                            handleChangeText(value, item, headerItem.key, index)
                        "
                      />
                    </span>

                    <span v-else-if="item[headerItem.key]">{{
                      item[headerItem.key]
                    }}</span>

                    <span v-else>&nbsp;</span>
                  </div>
                </template>
                <div
                  class="resizer"
                  :class="{ 'resize-bg': resizeState === headerIndex }"
                  @mousedown.prevent="mousedown(headerIndex, $event)"
                ></div>
              </td>
            </tr>
          </tbody>
        </div>
      </table>
    </div>
  </div>
</template>

<script>
import {
  BIconCaretDown,
  BIconCaretUp,
  BIconCaretUpFill,
  BIconCaretDownFill,
} from 'bootstrap-vue'
import systemMixins from '@/mixins/system'
import { DRAGGABLE_TABLE } from '@/constants'
import { stringUpperFirstCase } from '~/utils/utils'
export default {
  name: 'TableInputLanguage',
  components: {
    // eslint-disable-next-line vue/no-unused-components
    BIconCaretDown,
    // eslint-disable-next-line vue/no-unused-components
    BIconCaretUpFill,
    // eslint-disable-next-line vue/no-unused-components
    BIconCaretDownFill,
    // eslint-disable-next-line vue/no-unused-components
    BIconCaretUp,
    // eslint-disable-next-line vue/no-unused-components
  },
  mixins: [systemMixins],
  props: {
    activeRows: {
      type: Array,
      default: () => undefined,
    },
    header: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    sortKey: {
      type: String,
      default: 'id',
    },
    isAscending: {
      type: Boolean,
      default: false,
    },
    disabledFilter: {
      type: Boolean,
      default: false,
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
    isDisableDraggle: {
      type: Boolean,
      default: false,
    },
    currentIndex: {
      type: Number,
      default: () => -1,
    },
  },
  data() {
    return {
      resizeState: false,
      headersComponent: this.header,
      dataComponent: this.data,
      filters: {},
      sortParams: {},
      indexMouseDown: null,
      clientX: null,
      isResize: false,
      activeRow: null,
      inputActive: '',
      listLanguageChange: [],
      listTextChange: [],
      columnCellActive: null,
      rowCellActive: null,
      CHINESE_SIMPLIFIED: 'Chinese_Simplified',
      CHINESE_TRADITIONAL: 'Chinese_Traditional',
      ignoreInput: ['keyCode', 'index'],
    }
  },
  watch: {
    header: {
      handler(value) {
        this.headersComponent = value
      },
      deep: true,
    },
    data: {
      handler(value) {
        this.dataComponent = value
      },
      deep: true,
    },
    headersComponent: {
      handler(value) {
        this.filters[value.key] = this.filters[value.key] || ''
      },
      deep: true,
    },
    currentIndex: {
      immediate: true,
      handler(value) {
        if (value > -1) {
          this.activeRow = value
        }
      },
    },
  },
  created() {
    this.headersComponent.forEach((item) => {
      this.filters[item.key] = ''
    })

    this.$bus.$on('refresh-filter-data', () => {
      this.filters = {}
    })
  },
  mounted() {
    const tableHeader = document.getElementById('table-header')
    this.preventScrollListener(tableHeader)
  },
  methods: {
    onScrollBody() {
      const scrollLeft = document.getElementById('table-body').scrollLeft

      const tableHeader = document.getElementById('table-header')
      this.scrollElement(tableHeader, scrollLeft)
    },
    scrollElement(element, offsetX) {
      element && element.scrollTo(offsetX, 0)
    },
    preventScrollListener(element) {
      element &&
        element.addEventListener('wheel', (e) => this.preventScroll(e), {
          passive: false,
        })
    },
    preventScroll(event) {
      event.preventDefault()
      event.stopPropagation()

      return false
    },

    sort(key) {
      this.sortParams = {
        sortKey: key,
        isAscending: this.isAscending,
      }
      if (!this.isResize) {
        this.$emit(
          'sort',
          {
            sortParams: this.sortParams,
            filterParams: this.filters,
          },
          'sort'
        )
      }
    },
    filterData() {
      this.$emit(
        'filter',
        {
          sortParams: this.sortParams,
          filterParams: this.filters,
        },
        'filter'
      )
    },
    eventActiveRow(indexRow) {
      this.activeRow = indexRow
    },
    handleUpdate(data, headerItem, headerIndex, bodyIndex) {
      this.dataComponent.forEach((item) => {
        item.isUpdate = false
      })
      data.isUpdate = true
      this.columnCellActive = headerIndex
      this.rowCellActive = bodyIndex
    },
    handleChangeText(value, data, headerKey, bodyIndex) {
      let languageHeader = null
      if (headerKey === 'Chinese (Simplified)') {
        languageHeader = this.CHINESE_SIMPLIFIED
      }
      if (headerKey === 'Chinese (traditional)') {
        languageHeader = this.CHINESE_TRADITIONAL
      }
      this.listLanguageChange.push({
        keyCode: data?.keyCode,
        id: data?.id,
        language: stringUpperFirstCase(languageHeader ?? headerKey),
        languageName: data[headerKey],
      })
      this.listTextChange = this.mappingArrayDuplicate(this.listLanguageChange)
      this.$store.commit(
        'system-setting/SET_LIST_TEXT_CHANGE',
        this.listTextChange
      )
      this.dataComponent.forEach((item) => {
        item.isUpdate = false
      })
    },
    handleEnter(data, headerItem, index) {
      this.dataComponent.forEach((item) => {
        item.isUpdate = false
      })
      setTimeout(() => {
        this.$emit('enter')
      }, 0)
    },
    mappingArrayDuplicate(array) {
      const convertListLanguage = []
      array.forEach((item) => {
        const result = convertListLanguage.find((el) => el?.id === item.id)
        if (result) {
          result.forms = [{
            language: stringUpperFirstCase(item.language),
            languageName: item.languageName,
          }]
        } else {
          convertListLanguage.push({
            id: item.id,
            keyCode: item.keyCode,
            forms: [
              {
                language: stringUpperFirstCase(item.language),
                languageName: item.languageName,
              },
            ],
          })
        }
      })
      return convertListLanguage
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
  },
}
</script>

<style lang="scss" scoped>
#table-header {
  border-bottom: 1px solid #5180d8;
  overflow: auto;
  background: #eff3ff 50% 50% repeat-x;
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

#table-body {
  display: flex;
  overflow: auto;
  height: -webkit-fill-available;
  tbody {
    height: fit-content;
  }
}
.custom-checkbox {
  z-index: 0 !important;
}

#table-resize {
  height: fit-content;
  position: relative;
  display: flex;
  flex-direction: column;
  width: -webkit-fill-available;
  height: -webkit-fill-available;
  overflow: unset;

  .header-name {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1;
  }

  .row__filter {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1;
  }
}

.table-container {
  width: 100%;
  border: 1px solid #5180d8;
  border-bottom: none;
  font-size: 12px;
  height: calc(100% - 22px);
  display: flex;
}
.input-update {
  height: 16px;
  padding: 0px 0px 0px 5px;
  font-size: 12px;
  border-radius: unset;
  border: 1px solid #aaa;
  &:focus {
    border: 2px solid #5180d8 !important;
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

.row-data:hover {
  td:not(.cell--last) {
    background: #fbec88;
  }

  * {
    text-decoration: none !important;
  }
}
.cell--last {
  pointer-events: none;
}
.active td:not(.cell--last) {
  background: #fbec88;
}

table {
  border-spacing: 0;
}

.table-item {
  border: 1px solid #5180d8;
  border-top: none;
  border-left: none;
  padding: 0 4px;
}

.cell--last:not(.filter__cell--last) {
  border: none;
}

.filter__cell--last {
  border-bottom: 1px solid #5180d8;
  border-top: 0;
}

.cell--last {
  border-right: 0;
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
  padding: 2px 5px 4px 5px;

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

.border-dark:focus {
  box-shadow: none !important;
  outline: 1px solid #000000;
}
.header__cell-border--last {
  border-bottom: 1px solid #5180d8 !important;
}
</style>
