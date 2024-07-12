<template>
  <div class="table-item-detail">
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
      <table
        id="table-resize"
        :class="{
          'table-single-column': countColumnsHidden === 1,
        }"
      >
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
            :key="refreshSearchFormKey"
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
                    v-else-if="header.filter === 'checkbox'"
                    v-model="content[header.key]"
                    type="checkbox"
                    class="input-disabled-checkbox"
                    :style="{
                      opacity: '1 !important',
                    }"
                    :disabled="header.disabled"
                  />
                  <slot v-else :name="header.key" :item="content">
                    <span v-if="separateWithCommaFields.includes(header.key)">
                      {{ makeFormatNumberWithCommas(content[header.key] || 0) }}
                    </span>

                    <span v-else-if="listMappingOptions.includes(header.key)">
                      {{ mapTextOptions(content[header.key], header.key) }}
                    </span>

                    <span v-else>{{ content[header.key] }}</span>
                  </slot>
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
                    v-else-if="header.filter === 'checkbox'"
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
                    oninput="this.value = this.value
                      .replace(/[^0-9.]/g, '')
                      .replace(/(\..*)\./g, '$1')
                      .replace(/-+/g, (match, offset) => {
                        return offset === 0 ? '-' : '';
                      })
                    "
                    :class="{
                      'input-disabled':
                        header.disabled ||
                        itemWithoutInspection(
                          content?.inspectionType,
                          header.key
                        ),
                    }"
                    :style="{
                      opacity: '1 !important',
                      'text-align': 'right',
                    }"
                    :disabled="
                      header.disabled ||
                      itemWithoutInspection(content?.inspectionType, header.key)
                    "
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
                  v-else-if="header.filter === 'checkbox'"
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
import {
  DRAGGABLE_TABLE,
  SERVER_RESPONSE_CODE,
  INSPECTION_TYPE,
} from '@/constants'
import BaseSearchFormDetail from '@/components/UI/Table/BaseSearchFormDetail.vue'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'
import { getUnique, formatNumberWithCommas } from '@/utils/utils'
import dateTime from '@/mixins/dateTime'
import api from '@/api/api'

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
    typeQuantity: {
      type: String,
      default: () => 'quantity',
    },
  },

  data() {
    return {
      separateWithCommaFields: [
        'amount',
        'aramount',
        'noTaxAmount',
        'blanceAmount',
        'otherAmount',
        'totalAmount',
        'totalRtAmount',
        'price',
        'quantity',
        'rtQuantity',
        'returnQuantity',
        'inQuantity',
        'minQuantity',
        'maxQuantity',
        'taxRate',
        'tariffShare',
        'otherCost',
        'receiptQuantity',
        'returnQty',
        'endQuantity',
        'subQuantity',
        'productionQuantity',
        'completionQuantity',
        'goodQty',
        'badQty',
      ],
      toolBar: [
        {
          key: 'delete',
          name: this.$t('btn_btnDelRow_0'),
          icon: '/images/DelRow.png ',
        },
      ],
      listMappingOptions: [
        'unitID',
        'subUnitID',
        'itemTypeID',
        'subItemTypeID',
        'warehouseID',
        'warehouseSource',
        'warehouseDestination',
        'warehouseOut',
        'warehouseFromID',
        'warehouseToID',
        'inspectionType',
      ],
      tableDataTempt: [],
      tableHeaders: JSON.parse(JSON.stringify(this.headerDetail)),
      resizeState: null,
      activeRow: -1,
      isResize: false,
      searchForm: {
        subQuantity: null,
        quantity: null,
        productionQuantity: null,
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
      refreshSearchFormKey: Math.random() * 100000,
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

    countColumnsHidden() {
      return this.tableHeaders.filter((a) => !a.hidden).length
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

    'currentRow.subItemCode': {
      handler(value) {
        if (!this.currentRow?.isUpdate) {
          return
        }

        if (this.currentRow) {
          this.handleChangeItemInfo('subItemCode')
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
    'currentRow.productionQuantity': {
      handler() {
        if (!this.currentRow?.isUpdate) {
          return
        }

        if (this.currentRow) {
          this.handleChangeItemInfo('productionQuantity')
        }
      },
    },
    'currentRow.subQuantity': {
      handler() {
        if (!this.currentRow?.isUpdate) {
          return
        }

        if (this.currentRow) {
          this.handleChangeItemInfo('subQuantity')
        }
      },
    },

    'currentRow.rtQuantity': {
      handler() {
        if (!this.currentRow?.isUpdate) {
          return
        }

        if (this.currentRow) {
          this.handleChangeItemInfo('rtQuantity')
        }
      },
    },

    'currentRow.endQuantity': {
      handler() {
        if (!this.currentRow?.isUpdate) {
          return
        }

        if (this.currentRow) {
          this.handleChangeItemInfo('endQuantity')
        }
      },
    },
    'currentRow.receiptQuantity': {
      handler() {
        if (!this.currentRow?.isUpdate) {
          return
        }

        if (this.currentRow) {
          this.handleChangeItemInfo('receiptQuantity')
        }
      },
    },

    'currentRow.returnQty': {
      handler() {
        if (!this.currentRow?.isUpdate) {
          return
        }

        if (this.currentRow) {
          this.handleChangeItemInfo('returnQty')
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

    'currentRow.goodQty': {
      handler() {
        if (!this.currentRow?.isUpdate) {
          return
        }
        if (this.currentRow) {
          this.handleChangeItemInfo('goodQty')
        }
      },
    },

    'currentRow.promiseDate': {
      handler(value) {
        if (value) {
          this.currentRow.promiseDate = this.convertDate(value)
        }
      },
    },
    'currentRow.subBeginDate': {
      handler(value) {
        if (value) {
          this.currentRow.subBeginDate = this.convertDate(value)
        }
      },
    },
    'currentRow.subEndDate': {
      handler(value) {
        if (value) {
          this.currentRow.subEndDate = this.convertDate(value)
        }
      },
    },
    'currentRow.endDate': {
      handler(value) {
        if (value) {
          this.currentRow.endDate = this.convertDate(value)
        }
      },
    },
    'currentRow.startDate': {
      handler(value) {
        if (value) {
          this.currentRow.startDate = this.convertDate(value)
        }
      },
    },
    'currentRow.deliveryDate': {
      handler(value) {
        if (value) {
          this.currentRow.deliveryDate = this.convertDate(value)
        }
      },
    },
    'currentRow.itemID': {
      handler(value) {
        if (value && this.showQuantity) {
          this.getQuantity()
        } else {
          this.quantityByItem = null
        }
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
      const keysToParse = [
        'subQuantity',
        'productionQuantity',
        'quantity',
        'price',
        'amount',
      ]

      for (const key in this.searchForm) {
        if (this.searchForm[key]) {
          params[key] = keysToParse.includes(key)
            ? this.parseStringToFloat(this.searchForm[key])
            : this.searchForm[key]
        }
      }

      // check search isBad
      if (this.searchForm.isBad !== '') {
        params.isBad = this.searchForm.isBad
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
      if (
        item.itemCode ||
        item.quantity ||
        item.productionQuantity ||
        item.price ||
        item.memoDTL ||
        item.subQuantity ||
        item.subItemCode
      )
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
      itemRow.subItemName = ''
      itemRow.subProductName = ''
      itemRow.subDescription = ''
      itemRow.subUnitID = ''
      itemRow.subItemTypeID = ''
      itemRow.warehouseFromID = ''
    },

    calculateAmount(itemRow, keyChange, keyGet) {
      const quantity = this.parseStringToFloat(itemRow[keyChange])
      const price = this.parseStringToFloat(keyGet)
      const amount = quantity * price
      itemRow.amount = amount
    },

    calculateBadQuantity(itemRow) {
      if (itemRow.inspectionType === INSPECTION_TYPE.WITHOUT_INSPECTION) {
        const receiptQuantity = this.parseStringToFloat(
          itemRow?.receiptQuantity
        )
        const goodQuantity = this.parseStringToFloat(itemRow?.receiptQuantity)
        const badQuantity = receiptQuantity - goodQuantity
        itemRow.goodQty = receiptQuantity
        itemRow.badQty = badQuantity
        return
      }
      const goodQuantity = this.parseStringToFloat(itemRow?.goodQty)
      const receiptQuantity = this.parseStringToFloat(itemRow?.receiptQuantity)
      const badQuantity = receiptQuantity - goodQuantity
      itemRow.badQty = badQuantity
    },

    async handleChangeItemInfo(keyColumn) {
      const itemRow = this.tableDataTempt.find(
        (element) => element.lineID === this.currentRow.lineID
      )
      const listIgnoreGetPrice = [
        'saleInvoice',
        'POArrivalDetail',
        'materialDelivery',
      ]
      const checkValidateGetPrice =
        this.customerId &&
        itemRow.itemID &&
        itemRow.quantity &&
        !listIgnoreGetPrice.includes(this.tableType)
      if (checkValidateGetPrice) {
        const apiToCall = this.isPurchase
          ? 'getPurchaseOrderPrice'
          : 'getPriceOrder'

        const params = {
          customerID: this.customerId,
          supplierID: this.customerId,
          itemID: itemRow.itemID,
          quantity: itemRow.quantity,
        }

        const response = await api(apiToCall, params)
        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK

        if (validResponse) {
          itemRow.price = response.data
          // eslint-disable-next-line no-prototype-builtins
          if (itemRow.hasOwnProperty('quantity')) {
            this.calculateAmount(itemRow, 'quantity', itemRow.price)
          }
        }
      }
      const quantityForItem = this.typeQuantity
        ? itemRow[this.typeQuantity]
        : itemRow.quantity
      if (itemRow.isUpdate) {
        const item =
          this.getItemCode(this.currentRow.itemCode) ||
          this.getItemCode(this.currentRow.subItemCode)

        switch (keyColumn) {
          case 'itemCode':
            itemRow.itemName = item?.itemName || ''
            itemRow.productName = item?.itemName || ''
            itemRow.description = item?.description || ''
            itemRow.unitID = item?.unitID || ''
            itemRow.itemID = item?.itemId || ''
            itemRow.itemTypeID = item?.itemTypeID || ''
            itemRow.warehouseFromID = item?.warehouseID || ''
            if (this.showQuantity) {
              this.getQuantity()
            }
            break
          case 'subItemCode':
            itemRow.subItemName = item?.itemName || ''
            itemRow.subProductName = item?.itemName || ''
            itemRow.subDescription = item?.description || ''
            itemRow.subUnitID = item?.unitID || ''
            itemRow.subItemID = item?.itemId || ''
            itemRow.subItemTypeID = item?.itemTypeID || ''
            itemRow.warehouseFromID = item?.warehouseID || ''
            break
          case 'quantity':
            this.calculateAmount(itemRow, 'quantity', itemRow.price)
            break
          case 'subQuantity':
            this.calculateAmount(itemRow, 'subQuantity', itemRow.price)
            break

          case 'price':
            this.calculateAmount(itemRow, 'price', quantityForItem)
            break

          case 'rtQuantity':
            this.calculateAmount(itemRow, 'rtQuantity', itemRow.price)
            break

          case 'receiptQuantity':
            this.calculateAmount(itemRow, 'receiptQuantity', itemRow.price)
            this.calculateBadQuantity(itemRow)
            break

          case 'returnQty':
            this.calculateAmount(itemRow, 'returnQty', itemRow.price)
            break
          case 'goodQty':
            this.calculateBadQuantity(itemRow)
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
          const quantityForItem = this.typeQuantity
            ? itemRow[this.typeQuantity]
            : itemRow.quantity
          this.calculateAmount(itemRow, 'price', quantityForItem)
        }
      }
    },
    isDateExpired(date) {
      return date && date !== this.convertDate(new Date())
    },

    isCurrentRowChanged(value) {
      const checkPromiseDate = this.isDateExpired(value?.promiseDate)
      const checkEndDate = this.isDateExpired(value?.endDate)
      const checkStartDate = this.isDateExpired(value?.startDate)
      const checkBeginDate = this.isDateExpired(value?.subBeginDate)
      const checkSubEndDate = this.isDateExpired(value?.subEndDate)
      const checkDeliveryDate = this.isDateExpired(value?.deliveryDate)
      const propertiesToCheck =
        value?.productionQuantity ||
        value?.quantity ||
        value?.subQuantity ||
        value?.price ||
        value?.amount ||
        value?.memoDTL ||
        value?.customerPO ||
        value?.itemTypeID ||
        value?.subItemTypeID ||
        value?.minQuantity ||
        value?.maxQuantity ||
        value?.warehouseID ||
        value?.warehouseFromID ||
        value?.warehouseToID ||
        value?.barCode ||
        value?.memoDtl ||
        value?.rtQuantity ||
        value?.reason ||
        value?.sono ||
        checkPromiseDate ||
        checkStartDate ||
        checkEndDate ||
        checkBeginDate ||
        checkSubEndDate ||
        checkDeliveryDate
      return propertiesToCheck
    },

    changeActionRow(action) {
      this.actionRow = action
    },

    setListCheckbox(value) {
      const result = []
      value.forEach((item) => {
        if (!item.isNewLine) {
          result.push({
            value: false,
            lineID: item.lineID,
            isPrintedLabel: item.isPrintedLabel,
            itemID: item.itemID,
            itemTypeID: item.itemTypeID,
            lotNO: item.lotNO || '',
            memo: item.memoDTL || '',
            quantity: item.subQuantity,
            rackNO: item?.rackNO || '',
            unitID: item.unitID,
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

    async getQuantity() {
      if (this.currentRow && this.currentRow.itemID) {
        const response = await api('getShowQty', {
          itemID: this.currentRow.itemID,
        })
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          this.quantityByItem = formatNumberWithCommas(response.data)
        }
      } else this.quantityByItem = 0
    },

    resetSearchData() {
      this.searchForm = {}
      ++this.refreshSearchFormKey
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
    itemWithoutInspection(inspectionTypeID, headerKey) {
      return (
        headerKey === 'goodQty' &&
        inspectionTypeID === INSPECTION_TYPE.WITHOUT_INSPECTION
      )
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
    .input-disabled-checkbox {
      cursor: auto;
    }
    .table-single-column {
      border-right: unset;

      .search-form {
        top: 0;
      }
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
