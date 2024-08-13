<template>
  <div class="position-relative">
    <div
      class="table-container"
      :style="{
        height: dataTotal && dataTotal.length ? 'calc(100% - 22px)' : '100%',
      }"
      @scroll="handleScroll"
    >
      <table id="table-resize" :class="{ 'w-100': fullWidth }">
        <div id="table-header">
          <thead class="header-name">
            <draggable
              v-model="headersComponent"
              tag="tr"
              :disabled="isDisableDraggable"
              @change="change"
            >
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
                @click="item.canNotSort ? null : sort(item.key)"
              >
                <div class="sys-flex-center w-100">
                  <slot
                    v-if="item.type === 'slot'"
                    :name="`${item.key}`"
                  ></slot>
                  <div v-else class="hide-text w-100">{{ item.name }}</div>
                  <template
                    v-if="
                      filters.sortByColumn && item.key === filters.sortByColumn
                    "
                  >
                    <b-icon-caret-down-fill
                      :class="{
                        'color-active': filters.isAscending,
                        'color-disable': !filters.isAscending,
                      }"
                      class="ml-1"
                    ></b-icon-caret-down-fill>
                    <b-icon-caret-up-fill
                      class="ml-1"
                      :class="{
                        'color-active': !filters.isAscending,
                        'color-disable': filters.isAscending,
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
              <th
                v-if="hasData"
                class="table-item row-header header__cell--last cell--last"
              >
                <div>&nbsp;&nbsp;</div>
              </th>
            </draggable>

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
              >
                <b-form-input
                  v-if="item.filter === 'input'"
                  v-model="filters[item.key]"
                  type="text"
                  :maxlength="item?.maxLength || '256'"
                  :disabled="item.disabled || false"
                  class="w-100 border border-dark"
                  @keyup.enter="filterData"
                  @input="handleInput(item.key)"
                />
                <b-form-select
                  v-else-if="item.filter === 'select'"
                  v-model="filters[item.key]"
                  :options="item.options"
                  :disabled="item.disabled"
                  type="text"
                  class="w-100 border border-dark"
                  @change="filterData"
                >
                </b-form-select>
                <span v-else>&nbsp;</span>
                <div
                  class="resizer"
                  :class="{ 'resize-bg': resizeState === index }"
                  @mousedown.prevent="mousedown(index, $event)"
                >
                  &nbsp;
                </div>
              </td>
              <td
                v-if="hasData"
                class="table-item row-header header__cell--last cell--last"
              >
                <div>&nbsp;&nbsp;</div>
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
                    item[headerItem.key] &&
                    item[headerItem.key].type === 'index',
                }"
              >
                <template v-if="item[headerItem.key]">
                  <slot
                    v-if="item[headerItem.key].type === 'slot'"
                    :name="headerItem.key + '-' + index"
                  ></slot>
                  <nuxt-link
                    v-else-if="item[headerItem.key].type === 'link'"
                    :to="{ path: item[headerItem.key].link }"
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
                    class="hide-text dddd w-100"
                  >
                    <span
                      v-if="separateWithCommaFields.includes(headerItem.key)"
                      v-html="
                        makeFormatNumberWithCommas(item[headerItem.key].value)
                      "
                    ></span>
                    <span
                      v-else
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
        </div>
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
                minWidth: headersComponent[index].width + 'px',
                width: headersComponent[index].width + 'px',
                maxWidth: headersComponent[index].width + 'px',
              }"
              class="table-item total__item font-weight-bold"
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
                  <span v-if="item.type === 'amount'">{{
                    makeFormatNumberWithCommas(item.value)
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
            <td
              v-if="hasData"
              class="table-item row-header header__cell--last cell--last"
            >
              <div>&nbsp;&nbsp;</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import {
  BIconCaretDown,
  BIconCaretUp,
  BIconCaretUpFill,
  BIconCaretDownFill,
} from "bootstrap-vue";
import systemMixins from "@/mixins/system";
import { DRAGGABLE_TABLE } from "@/constants";
import { isEmptyValue, formatNumberWithCommas } from "~/utils/utils";

export default {
  name: "BaseTableDraggable",
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
    activeRows: {
      type: Array,
      default: () => undefined,
    },
    header: {
      type: Array,
      default: () => [
        {
          key: "address",
          name: "address",
          width: 300,
          filter: "select",
          options: ["test", "address", "abc"],
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
    disabledFilter: {
      type: Boolean,
      default: false,
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
    isDisableDraggable: {
      type: Boolean,
      default: false,
    },
    currentIndex: {
      type: Number,
      default: () => -1,
    },
    initialFilters: {
      type: Object,
      default: () => {},
    },
    updateFiltersFunction: {
      type: Function,
      default: () => null,
    },
  },
  data() {
    return {
      resizeState: false,
      headersComponent: this.header,
      dataComponent: JSON.parse(JSON.stringify(this.data)),
      filters: {},
      sortParams: {},
      filterPayload: {},
      indexMouseDown: null,
      clientX: null,
      isResize: false,
      activeRow: null,
      separateWithCommaFields: [
        "amount",
        "aramount",
        "noTaxAmount",
        "blanceAmount",
        "otherAmount",
        "totalAmount",
        "totalRtAmount",
        "price",
        "taxRate",
        "quantity",
        "stopQty",
        "soqty",
        "invoiceQTY",
        "returnQTY",
        "blance",
        "inQuantity",
        "rtQuantity",
        "minQuantity",
        "maxQuantity",
        "endQuantity",
        "solineNumber",
        "receiptQty",
        "lineID",
        "rtQty",
        "polineID",
        "balance",
        "receiptLineID",
        "totalTariff",
        "totalElement",
        "totalOtherCost1",
        "totalOtherCost2",
        "totalOtherCost3",
        "totalOtherCost4",
        "totalOtherCost5",
        "tariff",
        "otherCost",
        "weight",
        "moq",
        "outPeriod",
        "spq",
        "outRate",
        "packPeriod",
        "soprice",
        "purchasePeriod",
        "safeQty",
        "salePeriod",
        "settleDate",
        "payPeriod",
        "rate",
        "boxLong",
        "width",
        "high",
        "height",
        "cbm",
        "packQty",
        "sorate",
        "soprice_Convert",
        "porate",
        "gp",
        "fileSize",
        "age",
        "subProcessDays",
        "subQuantity",
        "completionQuantity",
        "calculateDays",
        "demandQty",
        "supplyQty",
        "needDays",
        "leadTime",
        "plannedQty",
        "stockQty",
        "needQty",
        "balanceQty",
      ],
      isMounted: false,
    };
  },
  computed: {
    canSetMinWidthForBody() {
      return document && this.isMounted && !this.hasData;
    },

    hasData() {
      return this.dataComponent.length;
    },
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
        this.makeSetMinWidthForBody();
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
    initialFilters: {
      immediate: true,
      deep: true,
      handler(data) {
        this.filters = Object.assign({}, data);
        this.makeSetMinWidthForBody();
      },
    },
  },
  created() {
    if (this.currentIndex >= 0) {
      const currentItem = this.dataComponent[this.currentIndex];
      this.eventActiveRow(currentItem, this.currentIndex, currentItem.keyRow);
    }

    this.$bus.$on("refresh-filter-data", () => {
      this.filters = {};
    });
  },
  mounted() {
    const tableHeader = document.getElementById("table-header");
    const tableTotal = document.getElementById("table-total");

    this.preventScrollListener(tableHeader);
    this.preventScrollListener(tableTotal);

    this.isMounted = true;
    this.makeSetMinWidthForBody();
  },
  methods: {
    onScrollBody() {
      const scrollLeft = document.getElementById("table-body").scrollLeft;

      const tableHeader = document.getElementById("table-header");
      const tableTotal = document.getElementById("table-total");

      this.scrollElement(tableHeader, scrollLeft);
      this.scrollElement(tableTotal, scrollLeft);
    },
    scrollElement(element, offsetX) {
      element && element.scrollTo(offsetX, 0);
    },
    preventScrollListener(element) {
      element &&
        element.addEventListener("wheel", this.preventScroll, {
          passive: false,
        });
    },
    preventScroll(event) {
      event.preventDefault();
      event.stopPropagation();

      return false;
    },
    setMinWidthForBody() {
      const bodyCollapsed = document.querySelectorAll("#table-body tbody")[0];
      const headerCollapsed = document.getElementsByClassName("header-name")[0];
      bodyCollapsed.style.minWidth = `${headerCollapsed.offsetWidth}px`;
    },

    makeSetMinWidthForBody() {
      this.canSetMinWidthForBody && this.setMinWidthForBody();
    },

    makeFormatNumberWithCommas(number) {
      return formatNumberWithCommas(number) || "0";
    },
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
        : value && value.toString().replace(/ /g, "&nbsp;");
    },

    sort(key) {
      if (this.isResize) {
        return;
      }

      this.sortParams = {
        sortByColumn: key,
        sortAscOrDesc: this.filters.isAscending ? "ASC" : "DESC",
        isAscending: !this.filters.isAscending,
      };

      this.filterData();
    },
    filterData() {
      this.makeValidFilterPayload();
      this.updateFiltersFunction(this.filterPayload);
      this.$emit("search");
      this.$forceUpdate();
    },
    makeValidFilterPayload() {
      const finalPayloadData = {
        ...this.filters,
        ...this.sortParams,
        pageNo: 1,
      };
      // itemType = 'Other' in Item Master
      if (
        this.initialFilters.itemType === "Other" &&
        this.filters.isClickCallAPIQuery
      ) {
        finalPayloadData.itemType = "Other";
      }
      for (const prop in finalPayloadData) {
        isEmptyValue(prop) && delete finalPayloadData[prop];
      }

      this.filterPayload = finalPayloadData;
    },
    eventActiveRow(item, indexRow, keyRow) {
      this.activeRow = indexRow;
      const emitPayload = {};
      if (item) {
        emitPayload.item = item;
      }
      if (indexRow || indexRow === 0) {
        emitPayload.index = indexRow;
      }
      if (keyRow) {
        emitPayload.keyRow = keyRow;
      }
      this.$emit("row", emitPayload);
    },
    handleScroll(e) {
      if (this.$refs.total) {
        this.$refs.total.scrollLeft = e.target.scrollLeft;
      }
      // document.getElementById('table-total').scrollLeft = e.target.scrollLeft
      // this.$emit('scroll', e.target.scrollLeft)
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
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        this.resizeState = null;
        setTimeout(() => (this.isResize = false), 0);
      };
      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
      this.headersComponent = headerBeforeChange;
      this.$emit("changeLayout", {
        indexColumn: index,
        headerData: this.headersComponent,
      });
    },
    change(value) {
      this.$emit("changeLayout", {
        indexColumn: "",
        headerData: this.headersComponent,
      });
    },

    handleInput(key) {
      this.filters[key] = this.filters[key].trim(); // Xử lý thêm nếu cần
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

#table-header {
  border-bottom: 1px solid #5180d8;
  overflow: auto;
  background: #eff3ff 50% 50% repeat-x;
  padding-bottom: 2px;
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

.table-total {
  border-left: 1px solid #5180d8;
  border-right: 1px solid #5180d8;
  font-size: 12px;
  position: absolute;
  bottom: 0;
  overflow: auto;
  width: 100%;
  left: 0;
  height: 22px;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  #table-resize {
    overflow: unset !important;
  }

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
@media only screen and (max-height: 568px) {
  #table-header {
    padding-bottom: 5px;
  }
}
</style>
