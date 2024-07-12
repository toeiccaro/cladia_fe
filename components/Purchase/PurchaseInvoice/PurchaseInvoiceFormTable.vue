<template>
  <div class="overflow-x-auto" style="height: calc(100% - 315px)">
    <div class="clear-both"></div>
    <div class="d-flex mt-2 mb-2 mb-2 pl-2 btn-container">
      <div
        class="
          mr-2
          d-flex
          cursor-pointer
          align-content-center align-items-center
        "
        :class="{
          'text--disabled': isDisabledInput,
        }"
        @click="deleteItem"
      >
        <img src="@/assets/icon/DelRow.png" alt="" />
        <span>{{ $t('btn_btnDelRow_0') }}</span>
      </div>
    </div>
    <div class="table-container">
      <div class="table-header-filter d-flex align-items-center">
        <div class="text-center" :style="{ width: `5%` }"></div>
        <div class="px-1" :style="{ width: `5%` }">
          <b-form-input class="w-100 filter-input" type="text" disabled />
        </div>
        <div
          v-for="(item, index) in header"
          :key="`filter-${index}`"
          class="px-1"
          :style="{ width: item.width }"
        >
          <b-form-input
            v-if="item.filter === 'input'"
            v-model="filters[item.key]"
            class="w-100 filter-input"
            type="text"
            :disabled="item.disabled"
            @keyup.enter="filterData()"
          />
          <input
            v-else-if="item.filter === 'input-number'"
            v-model="filters[item.key]"
            oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            class="w-100 filter-input"
            :disabled="item.disabled"
            @keyup.enter="filterData()"
          />
          <datepicker
            v-else-if="item.filter === 'date'"
            v-only-date="{
              isAppendToChild: true,
              childClass: 'input__orderDate',
            }"
            :value="filters[item.key]"
            typeable
            format="yyyy-MM-dd"
            input-class="input__orderDate"
            :highlighted="highlighted"
            :disable-input="item.disabled"
            @keyup.enter="filterData()"
          ></datepicker>

          <b-form-select
            v-else-if="item.filter === 'select'"
            v-model="filters[item.key]"
            class="filter-input"
            :options="item.options"
            :disabled="item.disabled"
            @change="
              (event) => setFilterData({ path: item.key, data: event.value })
            "
          >
          </b-form-select>
          <BaseTypeaheadAutocomplete
            v-else-if="item.filter === 'autocomplete'"
            :initial-text="filters[item.key]"
            :initial-value="filters[item.key]"
            :items="item.options"
            :disable-input="item.disabled"
            @hit="(event) => setFilterData({ path: item.key, data: event })"
          >
          </BaseTypeaheadAutocomplete>
        </div>
      </div>
      <div class="py-1 table-header font-weight-bold d-flex align-items-center">
        <div class="text-center" :style="{ width: `5%` }">
          <b-form-checkbox
            id="checkAllDetails"
            v-model="checkAll"
            @change="(event) => setCheckAll(event)"
          ></b-form-checkbox>
        </div>
        <div class="px-1" :style="{ width: `5%` }">
          {{ `ID` }}
        </div>
        <div
          v-for="(item, index) in header"
          :key="`header-text-${index}`"
          class="px-1 text-overflow"
          :style="{ width: item.width }"
        >
          {{ item.name }}
        </div>
      </div>
      <div v-if="!listCheckbox.length" class="no-details px-1">
        <span>{{ $t('msg_InputDetails_0') }}</span>
      </div>
      <div v-else>
        <div
          v-for="(item, index) in listCheckbox"
          :key="`item-${index}`"
          class="py-1 table-item-container d-flex align-items-center"
        >
          <div class="text-center" :style="{ width: `5%` }">
            <b-form-checkbox
              v-model="listCheckbox[index].value"
              @change="changeItemCheckbox"
            ></b-form-checkbox>
          </div>
          <div class="px-1" :style="{ width: `5%` }">
            {{ index + 1 }}
          </div>
          <div
            v-for="(headerItem, headerIndex) in header"
            :key="`data-${headerIndex}`"
            class="px-1"
            :style="{ width: headerItem.width }"
            @dblclick="handleDoubleClick(index)"
          >
            <div
              v-if="item.isNewLine || item.isUpdate"
              class="position-relative"
            >
              <b-form-input
                v-if="headerItem.filter === 'input'"
                v-model="item[headerItem.key]"
                class="w-100 filter-input"
                type="text"
                :disabled="headerItem.disabled"
                @keyup.enter="handleEnter(item, headerItem.key, index)"
              />
              <input
                v-else-if="headerItem.filter === 'input-number'"
                v-model="item[headerItem.key]"
                :disabled="headerItem.disabled"
                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                type="text"
                class="filter-number"
                @keyup.enter="handleEnter(item, headerItem.key, index)"
                @input="onChangeNumber(item)"
              />

              <datepicker
                v-else-if="headerItem.filter === 'date'"
                :value="item[headerItem.key]"
                typeable
                format="yyyy-MM-dd"
                :disabled="headerItem.disabled"
                class="input-date"
                :highlighted="highlighted"
                @input="changePromiseDate()"
              ></datepicker>
              <BaseTypeaheadAutocomplete
                v-else-if="headerItem.filter === 'autocomplete'"
                class="filter-input"
                :initial-text="item[headerItem.key]"
                :initial-value="item[headerItem.key]"
                :items="headerItem.options"
                :disable-input="headerItem.disabled"
              >
              </BaseTypeaheadAutocomplete>
              <b-form-select
                v-else-if="headerItem.filter === 'select'"
                v-model="item[headerItem.key]"
                :options="headerItem.options"
                class="select"
                :disabled="headerItem.disabled"
              ></b-form-select>
            </div>
            <div v-else>
              <span>{{ item[headerItem.key] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api'
import { isEmptyValue } from '@/utils/utils'
import systemMixins from '@/mixins/system'
import commonOptions from '@/mixins/commonOptions'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'

export default {
  name: 'PurchaseInvoiceFormTable',
  components: { BaseTypeaheadAutocomplete },
  mixins: [commonOptions, systemMixins],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    isDisabledInput: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      highlighted: {
        dates: [new Date()],
      },
      listCheckbox: [],
      filters: Object.assign({}),
      checkAll: false,
      listErrorMessage: [],
    }
  },
  computed: {
    header() {
      return [
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: `12%`,
          disabled: true,
        },
        {
          key: 'itemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: `14%`,
          disabled: true,
        },
        {
          key: 'desctiption',
          name: this.$t('lbl_Description_0'),
          filter: 'input',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'unit',
          name: this.$t('lbl_UnitID_0'),
          filter: 'select',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'weight',
          name: this.$t('lbl_Weight_0'),
          filter: 'input-number',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'quantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'input-number',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'price',
          name: this.$t('lbl_Price_0'),
          filter: 'input-number',
          width: `10%`,
          disabled: this.isDisabledInput,
        },
        {
          key: 'amount',
          name: this.$t('lbl_Amount_0'),
          filter: 'input-number',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'noTaxAmount',
          name: this.$t('lbl_NoTaxAmount_0'),
          filter: 'input-number',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'taxRate',
          name: this.$t('lbl_TaxRate_0'),
          filter: 'input-number',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'tariffShare',
          name: this.$t('lbl_Tariff_0'),
          filter: 'input-number',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'otherCostShare',
          name: this.$t('lbl_OtherCost_0'),
          filter: 'input-number',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'receiptNo',
          name: this.$t('lbl_ReceiptNo_0'),
          filter: 'input',
          width: `12%`,
          disabled: true,
        },
        {
          key: 'pono',
          name: this.$t('lbl_PONO_0'),
          filter: 'input',
          width: `12%`,
          disabled: true,
        },
        {
          key: 'deliveryNO',
          name: this.$t('lbl_DeliveryNO_0'),
          filter: 'input',
          width: `12%`,
          disabled: true,
        },
      ]
    },
  },
  watch: {
    data: {
      handler(value) {
        this.listCheckbox = JSON.parse(JSON.stringify(value)).map((item) =>
          Object.assign(item, {
            value: false,
            amount: this.isDecimal(item.amount)
              ? item.amount.toFixed(2)
              : item.amount,
            noTaxAmount: this.isDecimal(item.noTaxAmount)
              ? item.noTaxAmount.toFixed(2)
              : item.noTaxAmount,
            tariffShare: item.tariffShare ?? 0,
            otherCostShare: item.tariffSharetariffShare ?? 0,
          })
        )
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    notHasValue(value) {
      return isEmptyValue(value)
    },
    onChangeNumber(item) {
      const amountValue =
        item.quantity * this.parseStringToFloat(item.price || 0)

      item.amount = this.isDecimal(amountValue)
        ? amountValue.toFixed(2)
        : amountValue

      const noTaxAmountValue = item.amount / (1 + item.taxRate / 100)

      item.noTaxAmount = this.isDecimal(noTaxAmountValue)
        ? noTaxAmountValue.toFixed(2)
        : noTaxAmountValue
    },
    isDecimal(value) {
      return value % 1 !== 0
    },
    setFilterData({ data, path }) {
      this.filters = Object.assign({}, this.filters, { [path]: data })
      this.filterData()
    },
    filterData() {
      this.$emit('filter', JSON.parse(JSON.stringify(this.filters)))
    },
    handleEnter(item, columnKey, index) {
      if (columnKey !== 'price') {
        return
      }

      this.listErrorMessage = []

      const requiredFields = {
        price: 'Price',
      }

      for (const field in requiredFields) {
        if (!item[field]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[field]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      this.$emit('validation-errors', this.listErrorMessage)

      const hasError = this.listErrorMessage.length > 0
      if (hasError) {
        return
      }

      const convertToNumberFields = ['price']

      const finalSelectedItem = Object.assign({}, item)
      for (const key in item) {
        const isNumberField = convertToNumberFields.includes(key)

        if (isNumberField) {
          finalSelectedItem[key] = this.parseStringToFloat(item[key])
        }
      }

      this.updateItem(item, index)
    },
    handleDoubleClick(indexItem) {
      if (this.isDisabledInput) {
        return
      }
      this.listCheckbox.forEach((item) => {
        item.isUpdate = false
      })

      this.listCheckbox[indexItem].isUpdate = true
      this.$forceUpdate()
    },
    changeItemCheckbox() {
      const hasUncheckedItem = this.listCheckbox.some((item) => !item.value)
      if (hasUncheckedItem) {
        this.checkAll = false
      }
    },
    setCheckAll(value) {
      this.listCheckbox = this.listCheckbox.map((item) =>
        Object.assign(item, { value })
      )
    },
    emitData() {
      const tempData = JSON.parse(JSON.stringify(this.listCheckbox))
      this.$emit('changeTable', tempData)
    },
    updateItem(item, index) {
      Object.assign(item, { isUpdate: false })
      this.listCheckbox[index] = Object.assign({}, item)
      this.emitData()
    },
    async deleteItem() {
      if (this.isDisabledInput) {
        return
      }

      const notSelectedDetails = !this.listCheckbox.some((item) => item.value)
      if (notSelectedDetails) {
        return window.alert(this.$t('msg_NoSelected_0'))
      }

      const confirm = window.confirm(this.$t('msg_ConfirmDelDetail_0'))
      if (!confirm) {
        return
      }

      const selectedItems = this.listCheckbox.filter((item) => item.value)

      const listSelectedLineIds = selectedItems.map((item) => item.lineID)

      await api('deletePurchaseInvoiceDetails', {
        lineIDs: listSelectedLineIds,
        pInvoiceNO: this.$route.query.orderNo,
      })

      this.listCheckbox = this.listCheckbox.filter((item) => !item.value)
      this.emitData()
      this.$emit('refresh-data')
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vue-auto-complete.scss';
</style>
<style lang="scss" scoped>
.table-item-container {
  cursor: pointer;

  &:hover {
    background: #d4e7f5 !important;
  }
}
.filter-number {
  padding: 4px 3px 4px 3px;
  border: 1px solid #aaa;
  width: 100%;
  height: 20px;
}

.table-container {
  font-size: 12px;
  min-width: max-content;
}

.table-header {
  background-color: #bcdbf3;
  margin-top: 1px;
}

.filter-input {
  height: 20px;
  padding: 0px 0px 0px 5px;
  font-size: 12px;
  border-radius: unset;
}

.datepicker-input {
  width: 60%;
  height: 32px;
}

.table-header-filter {
  background-color: #0e76bc;
  padding: 2px 0;
  height: 30px;
}

.table-item-container {
  cursor: pointer;
}

.table-item-container:nth-child(even) {
  background-color: #f6fbfe;
}

.active {
  background-color: #fbec88 !important;
}

.clear-both {
  clear: both;
}

.btn-container {
  font-size: 12px;
}

.text-overflow {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.form-control-sm {
  height: 20px !important;
  font-size: 10px;
  padding: 0px 0px 0px 5px;
  border-radius: unset;
}

.text--disabled {
  color: #8f9192;
}
::v-deep .input__autocomplete {
  input:first-child {
    margin-bottom: 0px !important;
  }
}
.autocomplete {
  position: absolute;
  top: 0px;
  padding: 2px;
}

.autocomplete__wrapper {
  padding: 0 !important;
}

.select {
  height: 20px;
  font-size: 12px;
  border: 1px solid #aaa;
  background-color: #fff;
  border-radius: 2px;
  padding: 0 2px;
}
.no-details {
  margin: 35px 0;
}
</style>
