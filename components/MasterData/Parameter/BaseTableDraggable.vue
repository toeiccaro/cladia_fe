<template>
  <div class="position-relative">
    <div
      class="table-container"
      :style="{
        height: dataTotal && dataTotal.length ? 'calc(100% - 22px)' : '100%',
      }"
    >
      <table id="table-resize" :class="{ 'w-100': fullWidth }">
        <thead class="header-name">
          <draggable
            v-model="headersComponent"
            tag="tr"
            :disabled="isDisableDraggle"
            @change="change"
          >
            <th
              v-for="(item, index) in headersComponent"
              :key="index"
              :style="{
                minWidth: item.key === 'last' ? '10px' : item.width + 'px',
                width: item.key === 'last' ? '100%' : item.width + 'px',
                maxWidth: item.key === 'last' ? '100%' : item.width + 'px',
              }"
              class="table-item row-header"
              :class="{
                'header__cell--last cell--last': item.key === 'last',
                'header__cell-border--last': disabledFilter,
              }"
              @click="
                item.key === 'last' || item.canNotSort ? null : sort(item.key)
              "
            >
              <div class="sys-flex-center w-100">
                <slot v-if="item.type === 'slot'" :name="`${item.key}`"></slot>
                <div v-else class="hide-text w-100">{{ item.name }}</div>
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
                  resizer: item.key !== 'last',
                }"
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
            v-if="!disabledFilter && headersComponent.length"
            class="row__filter"
          >
            <td
              v-for="(item, index) in headersComponent"
              :key="`header-${index}`"
              :style="{
                minWidth: item.width + 'px',
                width: item.width + 'px',
              }"
              class="header-bg header-filter text-center table-item position-relative"
              :class="{
                'filter__cell--last cell--last': item.key === 'last',
              }"
            >
              <div v-if="item.key !== 'last'">
                <b-form-input
                  v-if="item.filter === 'input'"
                  v-model="filters[item.key]"
                  type="text"
                  :maxLength="item.maxLength || '256'"
                  class="w-100 border border-dark"
                  @keyup.enter="filterData()"
                  autocomplete="off"
                />
                <b-form-select
                  v-else-if="item.filter === 'select'"
                  v-model="filters[item.key]"
                  :options="item.options"
                  type="text"
                  class="w-100 border border-dark"
                  @change="filterData()"
                >
                </b-form-select>
                <span v-else>&nbsp;</span>
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
          <tr
            v-for="(item, index) in dataComponent"
            :key="`tr${index}`"
            :class="{
              active: activeRow === index,
            }"
            class="row-data"
            @click="eventActiveRow(item, index, item.keyRow)"
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
              :class="{
                item__index:
                  item[headerItem.key] && item[headerItem.key].type === 'index',
                'cell--last': headerItem.key === 'last',
              }"
            >
              <template
                v-if="
                  item.isUpdate &&
                  item[headerItem.key] &&
                  item[headerItem.key].type !== 'index'
                "
              >
                <b-form-input
                  v-if="headerIndex === FIRST_CELL_DATA_INDEX"
                  v-model="item[headerItem.key].value"
                  v-auto-focus
                  class="input__edit-data-table"
                  @keyup.enter="saveData"
                >
                </b-form-input>

                <b-form-input
                  v-else
                  v-model="item[headerItem.key].value"
                  class="input__edit-data-table"
                  @keyup.enter="saveData"
                >
                </b-form-input>
              </template>
              <template v-else-if="item[headerItem.key]">
                <slot
                  v-if="item[headerItem.key].type === 'slot'"
                  :name="headerItem.key + '-' + index"
                ></slot>
                <nuxt-link
                  v-else-if="item[headerItem.key].type === 'link'"
                  :to="localePath({ path: item[headerItem.key].link })"
                  class="cell-data d-block text-underline hide-text"
                  :style="{
                    textAlign: item[headerItem.key].align,
                    color: item[headerItem.key].color,
                  }"
                  :class="{ 'font-weight-bold': item[headerItem.key].bold }"
                >
                  <span
                    v-html="keepTextSpaces(item[headerItem.key].value)"
                  ></span>
                </nuxt-link>
                <div
                  v-else
                  :style="{
                    textAlign: item[headerItem.key].align,
                    color: item[headerItem.key].color,
                  }"
                  :class="{ 'font-weight-bold': item[headerItem.key].bold }"
                  class="hide-text w-100"
                >
                  <span
                    v-html="keepTextSpaces(item[headerItem.key].value)"
                  ></span>
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
      </table>
    </div>
    <div
      v-if="dataTotal && dataTotal.length"
      id="table-total"
      ref="total"
      class="table-total"
    >
      <table id="table-resize">
        <tbody>
          <tr class="row-data">
            <td
              v-for="(item, index) in dataTotal"
              :key="`total-${index}`"
              :style="{
                minWidth:
                  headersComponent[index].key === 'last'
                    ? '11px'
                    : headersComponent[index].width + 'px',
                width:
                  headersComponent[index].key === 'last'
                    ? '100%'
                    : headersComponent[index].width + 'px',
                maxWidth:
                  headersComponent[index].key === 'last'
                    ? '100%'
                    : headersComponent[index].width + 'px',
              }"
              class="table-item total__item font-weight-bold"
              :class="{
                'total__cell--last cell--last':
                  headersComponent[index].key === 'last',
              }"
            >
              <template v-if="item">
                <div
                  :style="{ textAlign: item.align }"
                  class="hide-text"
                  :class="{
                    'd-flex justify-center': item.type === 'checkbox',
                  }"
                >
                  <span v-if="item.type === 'text' && item.value">{{
                    item.value
                  }}</span>
                  <span v-if="item.type === 'number'">{{
                    formatNumber(item.value)
                  }}</span>
                  <span
                    v-else-if="item.type === 'checkbox'"
                    class="d-flex flex-column justify-center"
                  >
                    <b-form-checkbox :disabled="true"></b-form-checkbox>
                  </span>
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import {
  BIconCaretDown,
  BIconCaretUp,
  BIconCaretUpFill,
  BIconCaretDownFill,
} from 'bootstrap-vue';
import systemMixins from '@/mixins/system';
import { DRAGGABLE_TABLE } from '@/constants';
import { isEmptyValue } from '~/utils/utils';
export default {
  name: 'BaseTableDraggable',
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
    draggable,
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
    data: {
      type: Array,
      default: () => [],
    },
    dataTotal: {
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
      dataComponent: JSON.parse(JSON.stringify(this.data)),
      filters: {},
      sortParams: {},
      isResize: false,
      activeRow: null,
      FIRST_CELL_DATA_INDEX: 1,
    };
  },
  watch: {
    header: {
      handler(value) {
        this.headersComponent = value;
      },
      deep: true,
    },
    data: {
      handler(value) {
        this.dataComponent = JSON.parse(JSON.stringify(value));
      },
      deep: true,
    },
    dataComponent: {
      handler(value) {
        this.$bus.$emit('table-parameter-data-changed', value);
      },
      deep: true,
    },
    headersComponent: {
      handler(value) {
        this.filters[value.key] = this.filters[value.key] || '';
      },
      deep: true,
    },
    currentIndex: {
      immediate: true,
      handler(value) {
        if (value > -1) {
          this.activeRow = value;
        }
      },
    },
  },
  created() {
    this.headersComponent.forEach((item) => {
      this.filters[item.key] = '';
    });
  },
  methods: {
    formatNumber(value) {
      const invalidNumber = isNaN(Number(value)) || !value;
      if (invalidNumber) {
        return value;
      }

      return this.parseStringToFloat(value);
    },

    keepTextSpaces(value) {
      return value === 0
        ? value
        : value && value.toString().replace(/ /g, '&nbsp;');
    },

    sort(key) {
      this.sortParams = {
        sortKey: key,
        isAscending: this.isAscending,
      };
      if (!this.isResize) {
        this.$emit(
          'sort',
          {
            sortParams: this.sortParams,
            filterParams: this.filters,
          },
          'sort'
        );
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
      );
    },
    eventActiveRow(item, indexRow, keyRow) {
      this.activeRow = indexRow;
      const emitPayload = {};
      if (item) {
        emitPayload.item = item;
      }
      if (!isEmptyValue(indexRow)) {
        emitPayload.index = indexRow;
      }
      if (keyRow) {
        emitPayload.keyRow = keyRow;
      }
      this.$emit('row', emitPayload);
    },
    mousedown(index, e) {
      const headerBeforeChange = JSON.parse(
        JSON.stringify(this.headersComponent)
      );
      this.resizeState = index;
      this.isResize = true;
      const clienX = e.clientX;
      const itemWidth = headerBeforeChange[index].width * 1;
      const mouseMoveHandler = (event) => {
        headerBeforeChange[index].width =
          itemWidth * 1 + event.clientX - clienX;

        const cantResize =
          headerBeforeChange[index].width <= DRAGGABLE_TABLE.MIN_COLUMN_WIDTH;
        if (cantResize) {
          headerBeforeChange[index].width = DRAGGABLE_TABLE.MIN_COLUMN_WIDTH;
        }
      };
      const mouseUpHandler = () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
        this.resizeState = null;
        setTimeout(() => (this.isResize = false), 0);
      };
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      this.headersComponent = headerBeforeChange;
      this.$emit('changeLayout', {
        indexColumn: index,
        headerData: this.headersComponent,
      });
    },
    change(value) {
      this.$emit('changeLayout', {
        indexColumn: '',
        headerData: this.headersComponent,
      });
    },

    saveData() {
      this.$emit('saveData');
    },
  },
};
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
  width: inherit;

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
.header-bg,
.item__index {
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
  cursor: pointer;
}

.border-dark:focus {
  box-shadow: none !important;
  outline: 1px solid #000000;
}
.header__cell-border--last {
  border-bottom: 1px solid #5180d8 !important;
}
.input__edit-data-table {
  height: 20px;
}
</style>
