<template>
  <div :key="refreshKey" class="table-item-detail">
    <div class="tool-bar">
      <div
        v-for="tool in toolBar"
        :key="`tool-${tool.key}`"
        class="tool-bar--item"
        :class="{ 'disable-button': disableInput }"
        @click="handleDelete"
      >
        <img :src="tool.icon" alt="" />
        <span>{{ tool.name }}</span>
      </div>

      <div v-if="showQuantity">
        <span class="label-required">{{ $t('lbl_ShowQty_0') }}</span>
        <input
          type="text"
          disabled
          class="label-required quantity-value"
          :value="quantityByItem"
        />
      </div>
    </div>

    <div class="table-item-container">
      <table id="table-resize">
        <thead class="table-header">
          <tr>
            <th
              v-for="(header, headerIndex) in tableHeaders"
              v-show="!header.hidden"
              :key="header.key"
              :style="{
                width: `${header.width}px`,
                minWidth: `${header.width}px`,
                maxWidth: `${header.width}px`,
              }"
              class="table-item-th row-header"
            >
              <div class="sys-flex-center w-100">
                <input
                  v-if="header.key === 'checkbox' && listCheckbox.length > 0"
                  v-model="isCheckedAll"
                  type="checkbox"
                  @change="(event) => handleCheckboxAll(event.target.checked)"
                />

                <div v-if="header.key !== 'checkbox'" class="hide-text w-100">
                  {{ header.name }}
                  <span v-if="header.fieldRequired" class="label-required">
                    *
                  </span>
                </div>
              </div>

              <div
                v-if="header.key !== 'checkbox'"
                :class="{
                  'resize-bg': resizeState === headerIndex,
                }"
                class="resizer"
                @mousedown.prevent="mousedown(headerIndex, header.key, $event)"
              >
                &nbsp;
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <BaseSearchFormDetail
            :list-search="tableHeaders"
            :list-item-code="listItemCode"
            :search-form="searchForm"
            :table-type="tableType"
            :customer-id="customerId"
            @changeSearchForm="changeSearchForm"
          />

          <tr
            v-for="(content, contentIndex) in tableDataTempt"
            :key="`${content.lineID}-${contentIndex}`"
            class="row-data"
            :class="{
              active: activeRow === content.lineID,
            }"
            @click="handleActiveRow(content.lineID)"
            @dblclick="handleEditRow"
          >
            <td
              v-for="(header, index) in tableHeaders"
              v-show="!header.hidden"
              :key="`${content.lineID}-${header.key}`"
              :style="{
                width: `${header.width}px`,
                minWidth: `${header.width}px`,
                maxWidth: `${header.width}px`,
                textAlign: header.align,
                padding: header.key === 'checkbox' ? '4px' : '',
              }"
              class="table-content-td position-relative"
            >
              <template v-if="!content.isNewLine">
                <template v-if="!content.isUpdate">
                  <span v-if="header.key === 'checkbox'">
                    <input
                      v-model="listCheckbox[contentIndex].value"
                      type="checkbox"
                    />
                  </span>
                  <input
                    v-else-if="
                      header.filter === 'checkbox' ||
                      header.dataType === 'checkbox'
                    "
                    v-model="content[header.key]"
                    type="checkbox"
                    class="input-disabled"
                    :style="{
                      opacity: '1 !important',
                    }"
                    disabled
                  />
                  <span
                    v-else-if="separateWithCommaFields.includes(header.key)"
                  >
                    {{ makeFormatNumberWithCommas(content[header.key] || 0) }}
                  </span>

                  <span v-else-if="listMappingOptions.includes(header.key)">
                    {{ mapTextOptions(content[header.key], header.key) }}
                  </span>

                  <span v-else>{{ content[header.key] }}</span>
                </template>

                <template v-else>
                  <span v-if="header.key === 'lineID'">
                    {{ content[header.key] }}
                  </span>

                  <span v-else-if="header.key === 'checkbox'">
                    <input
                      v-model="listCheckbox[contentIndex].value"
                      type="checkbox"
                    />
                  </span>

                  <input
                    v-if="header.filter === 'input'"
                    v-model="content[header.key]"
                    type="text"
                    :class="{
                      'input-disabled': header.disabled,
                    }"
                    :style="{
                      opacity: '1 !important',
                    }"
                    :disabled="header.disabled"
                  />

                  <input
                    v-else-if="
                      header.filter === 'checkbox' ||
                      header.dataType === 'checkbox'
                    "
                    v-model="content[header.key]"
                    type="checkbox"
                    :class="{
                      'input-disabled': header.disabled,
                    }"
                    :style="{
                      opacity: '1 !important',
                    }"
                    :disabled="header.disabled"
                  />

                  <input
                    v-else-if="header.filter === 'number'"
                    v-model="content[header.key]"
                    v-parse-number
                    type="text"
                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                    :class="{
                      'input-disabled': header.disabled,
                    }"
                    :style="{
                      opacity: '1 !important',
                      'text-align': 'right',
                    }"
                    :disabled="header.disabled"
                  />

                  <b-form-select
                    v-else-if="header.filter === 'select'"
                    v-model="content[header.key]"
                    :options="header.options"
                    class="select"
                    :class="{
                      'input-disabled': header.disabled,
                    }"
                    :disabled="header.disabled"
                    :style="{
                      opacity: '1 !important',
                    }"
                  ></b-form-select>

                  <base-typeahead-autocomplete
                    v-else-if="header.filter === 'autocomplete'"
                    v-model="content[header.key]"
                    :initial-text="content[header.key]"
                    :initial-value="content[header.key]"
                    :items="listItemCode"
                    :style="{
                      opacity: '1 !important',
                    }"
                    :disable-input="header.disabled"
                    @handleItemCode="handleItemCode"
                  >
                  </base-typeahead-autocomplete>

                  <datepicker
                    v-else-if="header.filter === 'datetime'"
                    v-model="content[header.key]"
                    typeable
                    format="yyyy-MM-dd"
                    :disabled="header.disabled"
                  ></datepicker>
                </template>
              </template>

              <template v-else>
                <input
                  v-if="header.filter === 'input'"
                  v-model="content[header.key]"
                  type="text"
                  :class="{
                    'input-disabled': header.disabled,
                  }"
                  :style="{
                    opacity: '1 !important',
                  }"
                  :disabled="header.disabled"
                />

                <input
                  v-else-if="
                    header.filter === 'checkbox' ||
                    header.dataType === 'checkbox'
                  "
                  v-model="content[header.key]"
                  type="checkbox"
                  :class="{
                    'input-disabled': header.disabled,
                  }"
                  :style="{
                    opacity: '1 !important',
                  }"
                  :disabled="header.disabled"
                />

                <input
                  v-else-if="header.filter === 'number'"
                  v-model="content[header.key]"
                  type="text"
                  oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                  :class="{
                    'input-disabled': header.disabled,
                  }"
                  :style="{
                    opacity: '1 !important',
                    'text-align': 'right',
                  }"
                  :disabled="header.disabled"
                />

                <b-form-select
                  v-else-if="header.filter === 'select'"
                  v-model="content[header.key]"
                  :options="header.options"
                  class="select"
                  :class="{
                    'input-disabled': header.disabled,
                  }"
                  :disabled="header.disabled"
                  :style="{
                    opacity: '1 !important',
                  }"
                ></b-form-select>

                <base-typeahead-autocomplete
                  v-else-if="header.filter === 'autocomplete'"
                  v-model="content[header.key]"
                  :initial-text="content[header.key]"
                  :initial-value="content[header.key]"
                  :items="listItemCode"
                  :style="{
                    opacity: '1 !important',
                  }"
                  :disable-input="header.disabled"
                  :line-i-d="content.lineID"
                  @handleItemCode="handleItemCode"
                >
                </base-typeahead-autocomplete>

                <datepicker
                  v-else-if="header.filter === 'datetime'"
                  v-model="content[header.key]"
                  v-only-date="{
                    isAppendToChild: true,
                    childClass: 'input__date',
                  }"
                  typeable
                  input-class="input__date"
                  format="yyyy-MM-dd"
                  :disabled="header.disabled"
                  :highlighted="highlighted"
                ></datepicker>
              </template>
              <div
                :class="{ 'resize-bg': resizeState === index }"
                class="resizer"
                @mousedown.prevent="mousedown(index, header.key, $event)"
              ></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import systemMixins from '@/mixins/system'
import { DRAGGABLE_TABLE } from '@/constants'
import BaseSearchFormDetail from '@/components/UI/Table/BaseSearchFormDetail.vue'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'
import { getUnique, formatNumberWithCommas, isEmptyValue } from '@/utils/utils'
import dateTime from '@/mixins/dateTime'

export default {
  components: {
    BaseSearchFormDetail,
    BaseTypeaheadAutocomplete,
  },

  mixins: [systemMixins, dateTime],

  props: {
    tableContent: {
      type: Array,
      default: () => [],
    },

    listItemMaster: {
      type: Array,
      default: () => [],
    },

    tableType: {
      type: String,
      default: () => '',
    },

    customerId: {
      type: [Number, String],
      default: () => null,
    },

    columnHides: {
      type: Array,
      default: () => [],
    },

    disableInput: {
      type: Boolean,
      default: () => false,
    },

    headerDetail: {
      type: Array,
      default: () => [],
    },

    typeAction: {
      type: String,
      default: () => '',
    },

    showQuantity: {
      type: Boolean,
      default: () => false,
    },

    newLine: {
      type: Object,
      default: () => {},
    },
    isPurchase: {
      type: Boolean,
      default: () => false,
    },
    lineLimit: {
      type: Number,
      default: () => 0,
    },
  },

  data() {
    return {
      separateWithCommaFields: ['amount', 'price', 'quantity', 'weight'],
      toolBar: [
        {
          key: 'delete',
          name: this.$t('btn_btnDelRow_0'),
          icon: '/images/DelRow.png ',
        },
      ],
      listMappingOptions: ['unitID', 'itemTypeID', 'warehouseID'],
      tableDataTempt: [],
      tableHeaders: JSON.parse(JSON.stringify(this.headerDetail)),
      resizeState: null,
      activeRow: -1,
      isResize: false,
      searchForm: {
        quantity: null,
        price: null,
        amount: null,
      },
      actionRow: '', // type of action: add or edit or view
      listCheckbox: [],
      isCheckedAll: {},
      quantityByItem: null,
      highlighted: {
        dates: [new Date()],
      },
      refreshKey: Math.random() * 100000,
    }
  },

  computed: {
    listItemCode() {
      if (this.listItemMaster.length > 0)
        return this.listItemMaster.map((item) => ({
          ...item,
          text: item.key,
          value: item.key,
          appendText: item.itemName ? `(${item.itemName})` : '',
        }))
      return []
    },

    currentRow() {
      const itemRow = this.tableDataTempt.find(
        (item) => item && item?.lineID === this.activeRow
      )
      return itemRow || null
    },

    isSearchFlag() {
      for (const key in this.searchForm) {
        if (this.searchForm[key]) {
          return true
        }
      }
      return false
    },

    isMaxDetailLines() {
      // -1 because it will be fired when the table's data changes (after addNewLineData called)
      return !!this.lineLimit && this.availableData.length >= this.lineLimit - 1
    },

    availableData() {
      return this.tableDataTempt.filter((item) => !item.isNewLine)
    },
  },

  watch: {
    headerDetail: {
      handler(value) {
        this.tableHeaders = JSON.parse(JSON.stringify(value))
        this.makeHideColumns()
      },
      deep: true,
      immediate: true,
    },

    columnHides: {
      handler() {
        this.makeHideColumns()
      },
      deep: true,
    },

    tableContent: {
      handler(value) {
        if (this.isSearchFlag) {
          return
        }

        this.tableDataTempt = value
      },
      deep: true,
      immediate: true,
    },

    tableDataTempt: {
      handler(value) {
        this.setListCheckbox(value)
        // if (this.isSearchFlag) {
        //   this.activeRow = -1
        // }
      },
      deep: true,
    },

    activeRow: {
      handler(value) {
        if (value !== -1) {
          this.tableDataTempt.forEach((item) => {
            if (item.isNewLine) {
              item.isUpdate = true
            } else {
              item.isUpdate = false
            }
          })
        }
      },
    },

    currentRow: {
      handler(value) {
        if (value && value.isNewLine && this.isCurrentRowChanged(value)) {
          this.addNewLine()
          delete value.isNewLine
          this.setListCheckbox(this.tableDataTempt)
          this.changeActionRow('ADD')
        }
      },
      deep: true,
    },

    'currentRow.itemCode': {
      handler(value) {
        if (!this.currentRow?.isUpdate) {
          return
        }

        if (this.currentRow) {
          this.handleChangeItemInfo('itemCode')
        } else {
          const itemRow = this.tableDataTempt.find(
            (element) => element.lineID === this.currentRow?.lineID
          )
          if (value) {
            this.clearCurrentRow(itemRow)
          }
        }
      },
    },

    'currentRow.quantity': {
      handler() {
        if (!this.currentRow?.isUpdate) {
          return
        }

        if (this.currentRow) {
          this.handleChangeItemInfo('quantity')
        }
      },
    },

    'currentRow.price': {
      handler() {
        if (this.currentRow) {
          this.handleChangeItemPrice('price')
        }
      },
    },

    'currentRow.itemID': {
      handler(value) {
        this.quantityByItem = null
      },
    },

    listCheckbox: {
      handler(value) {
        this.isCheckedAll = value.every((item) => item.value)
      },
      deep: true,
    },
  },

  methods: {
    makeFormatNumberWithCommas(number) {
      return formatNumberWithCommas(number)
    },
    makeHideColumns() {
      const invalidData = !this.columnHides.length || !this.tableHeaders.length
      if (invalidData) {
        return
      }

      this.tableHeaders.forEach((item) => {
        const scolumnData = this.columnHides.find(
          (column) => column.fieldKey?.toLowerCase() === item.key?.toLowerCase()
        )

        item.hidden = !!scolumnData?.hidden
        item.width =
          scolumnData &&
          (Number(scolumnData?.fieldWide) ||
            DRAGGABLE_TABLE.DEFAULT_COLUMN_WIDTH)
      })
    },
    mapTextOptions(unitID, key) {
      const mappedUnit = this.headerDetail
        .find((item) => item.key === key)
        ?.options?.find((item) => item.value === Number(unitID))

      if (mappedUnit) return mappedUnit.text
      return ''
    },

    mousedown(index, key, e) {
      const headerBeforeChange = JSON.parse(JSON.stringify(this.tableHeaders))

      this.resizeState = index
      this.isResize = true
      const clientX = e.clientX
      const itemWidth = headerBeforeChange[index].width * 1
      const scolumnData = this.columnHides.find(
        (item) => item.fieldKey.toLowerCase() === key.toLowerCase()
      )

      const mouseMoveHandler = (event) => {
        const updatedWitdh = itemWidth * 1 + event.clientX - clientX
        headerBeforeChange[index].width = updatedWitdh
        scolumnData.fieldWide = updatedWitdh.toString()

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
      this.tableHeaders = headerBeforeChange
    },

    handleActiveRow(lineID) {
      this.activeRow = lineID
    },

    filterTableDataTempt() {
      const params = {}
      const keysToParse = ['quantity', 'price', 'amount']

      for (const key in this.searchForm) {
        if (!isEmptyValue(this.searchForm[key])) {
          params[key] = keysToParse.includes(key)
            ? this.parseStringToFloat(this.searchForm[key])
            : this.searchForm[key]
        }
      }

      const tableDataSearch =
        Object.keys(params).length === 0
          ? this.tableContent
          : getUnique(this.tableContent, 'lineID').filter((obj) =>
              Object.keys(params).every((c) =>
                new RegExp(params[c], 'i').test(obj[c])
              )
            )

      this.tableDataTempt = [...tableDataSearch]
    },

    changeSearchForm(formValue) {
      this.searchForm = formValue
      this.tableDataTempt.forEach((item) => {
        item.isUpdate = item.isNewLine
      })
      this.activeRow = -1
      this.filterTableDataTempt()
    },

    isAddNewRow(item) {
      if (item.itemCode || item.quantity || item.price || item.memoDTL)
        return true
      return false
    },

    changeModeRow() {
      this.currentRow.isUpdate = true
      this.tableDataTempt.forEach((item) => {
        if (item.isNewLine) {
          item.isUpdate = true
        } else {
          const currentLineId = this.currentRow.lineID
          if (item.lineID === currentLineId) {
            item.isUpdate = true
          } else {
            item.isUpdate = false
          }
        }
      })

      this.$forceUpdate()
    },

    handleEditRow() {
      this.changeModeRow()
    },

    getItemCode(itemCode) {
      const item = this.listItemCode.find(
        (item) => item && item.key === itemCode
      )

      if (item) return item
      return null
    },

    clearCurrentRow(itemRow) {
      itemRow.itemName = ''
      itemRow.productName = ''
      itemRow.description = ''
      itemRow.unitID = ''
      itemRow.itemTypeID = ''
      itemRow.warehouseID = null
      itemRow.weight = null
      itemRow.price = 0
    },

    calculateAmount(itemRow, keyChange, keyGet) {
      const quantity = this.parseStringToFloat(itemRow[keyChange])
      const price = this.parseStringToFloat(keyGet)
      const amount = quantity * price
      itemRow.amount = amount
    },

    handleChangeItemInfo(keyColumn) {
      const itemRow = this.tableDataTempt.find(
        (element) => element.lineID === this.currentRow.lineID
      )

      if (itemRow.isUpdate) {
        const item = this.getItemCode(this.currentRow.itemCode)

        switch (keyColumn) {
          case 'itemCode':
            itemRow.itemName = item?.itemName || ''
            itemRow.productName = item?.itemName || ''
            itemRow.description = item?.description || ''
            itemRow.unitID = item?.unitID || ''
            itemRow.itemID = item?.itemId || ''
            itemRow.itemTypeID = item?.itemTypeID || ''
            itemRow.warehouseID = item?.warehouseID || null
            itemRow.weight = item?.weight || null
            itemRow.price = item?.price || 0
            break

          case 'quantity':
            this.calculateAmount(itemRow, 'quantity', itemRow.price)
            break

          case 'price':
            this.calculateAmount(itemRow, 'price', itemRow.quantity)
            break

          default:
            break
        }
      }
    },
    handleChangeItemPrice(keyColumn) {
      const itemRow = this.tableDataTempt.find(
        (element) => element.lineID === this.currentRow.lineID
      )

      if (itemRow.isUpdate) {
        if (keyColumn === 'price') {
          this.calculateAmount(itemRow, 'price', itemRow.quantity)
        }
      }
    },

    isCurrentRowChanged(value) {
      if (
        value?.quantity ||
        value?.price ||
        value?.amount ||
        value?.rackNo ||
        value?.itemTypeID ||
        value?.weight ||
        value?.isBad ||
        value?.warehouseID ||
        value?.lotNO ||
        value?.reason
      ) {
        return true
      }
      return false
    },

    changeActionRow(action) {
      this.actionRow = action
    },

    setListCheckbox(value) {
      const result = []
      value.forEach((item) => {
        if (!item.isNewLine) {
          result.push({
            lineID: item.lineID,
            systemId: item.systemId ?? item.systemID,
            value: false,
          })
        }
      })

      this.listCheckbox = getUnique(result, 'lineID')
    },

    handleCheckboxAll(value) {
      this.listCheckbox.forEach((item) => {
        item.value = value
      })
    },

    handleDelete() {
      const hasNoSelected =
        this.listCheckbox.filter((item) => item.value)?.length === 0
      if (hasNoSelected) {
        return window.alert(this.$t('msg_NoSelected_0'))
      }
      const confirm = window.confirm(this.$t('msg_ConfirmDelDetail_0'))
      if (!confirm) {
        return
      }
      const tableDataFilter = []

      this.tableDataTempt.forEach((item) => {
        this.listCheckbox.forEach((element) => {
          const isCheck =
            !element.value && item.lineID === element.lineID && !item.isNewLine
          if (isCheck) {
            tableDataFilter.push({
              ...item,
              lineID: tableDataFilter.length + 1,
            })
          }
        })
      })

      if (this.newLine) {
        tableDataFilter.push({
          ...this.newLine,
          lineID: tableDataFilter.length + 1,
        })
      }

      this.tableDataTempt = [...tableDataFilter]
      this.emitData()
    },

    emitData() {
      this.$emit('changeTable', this.tableDataTempt)
    },

    addNewLine() {
      !this.isMaxDetailLines &&
        this.tableDataTempt.push({
          ...this.newLine,
          lineID: this.tableDataTempt.length + 1,
        })
    },

    refreshTable() {
      ++this.refreshKey
    },

    resetSearchData() {
      this.searchForm = {}
      this.refreshTable()
    },

    handleItemCode(value) {
      if (
        value.lineID === this.currentRow.lineID &&
        this.currentRow.isNewLine
      ) {
        delete this.currentRow.isNewLine
        this.addNewLine()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.hide-text {
  max-height: 18px;
  overflow: hidden;
}
.table-item-detail {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;

  .tool-bar {
    margin: 0px;
    text-align: left;
    margin: 8px 0;
    display: flex;

    .tool-bar--item {
      display: flex;
      align-items: center;
      margin-right: 12px;
      cursor: pointer;
      pointer-events: initial;

      img {
        margin-right: 4px;
      }
    }
    .disable-button {
      cursor: default;
      pointer-events: none;
      color: #b9b7b7;
    }

    .quantity-value {
      text-align: right;
    }
  }

  .table-item-container {
    height: 100%;
    overflow-x: auto;
    overflow-y: auto;
    width: 100%;
    font-size: 12px;

    .resizer {
      position: absolute;
      top: 0;
      right: 0;
      width: 5px;
      cursor: col-resize;
      user-select: none;
      height: 100%;
    }

    table {
      border-spacing: 0;
      border-right: 1px solid #5180d8;
    }

    th,
    td {
      height: 22px;
    }

    td {
      border-right: 1px solid #5180d8;
      border-bottom: 1px solid #5180d8;

      &:last-child {
        border-right: none !important;
      }

      &:first-child {
        border-left: 1px solid #5180d8 !important;
      }
    }

    #table-resize {
      height: fit-content;
      position: relative;
    }

    .table-header {
      position: sticky;
      top: 0;
      left: 0;
      z-index: 2;
      cursor: pointer;
      background: #bcdbf3;
    }

    .table-item-th {
      border-right: 1px solid #5180d8;
      border-bottom: 1px solid #5180d8;
      border-top: 1px solid #5180d8;
      padding: 4px;
      word-break: break-all;

      &:last-child {
        border-right: none !important;
      }

      &:first-child {
        border-left: 1px solid #5180d8 !important;
      }
    }

    .active td {
      background: #fbec88 !important;
    }

    .row-data {
      cursor: pointer;

      &:hover {
        background: #d4e7f5 !important;
      }
    }

    .row-data:nth-child(even) {
      background-color: #f6fbfe;
    }

    .table-content-td {
      padding: 4px;
      position: relative;
      word-break: break-all;
    }

    .row-header {
      position: relative;
      cursor: pointer;
      text-align: center;
    }

    input {
      width: 100%;
      border: 1px solid #aaa;
      height: 20px;
      border-radius: 2px;
      padding: 2px;
    }

    input[type='checkbox'] {
      height: 13px;
    }

    .select {
      height: 20px;
      font-size: 12px;
      border: 1px solid #aaa;
      background-color: #fff;
      border-radius: 2px;
      padding: 0 8px;
    }

    .input-disabled {
      cursor: no-drop;
    }
  }

  .label-required {
    color: #f00;
    font-weight: 700;
  }
}
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
  cursor: default;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #999999;
  border-radius: 12px;
}
</style>
