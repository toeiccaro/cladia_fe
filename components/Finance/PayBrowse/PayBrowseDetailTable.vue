<template>
  <div>
    <div class="clear-both"></div>
    <div class="table-container">
      <div class="table-header-filter d-flex align-items-center">
        <div class="text-center" :style="{ width: `5%` }"></div>
        <div class="px-1" :style="{ width: `5%` }">
          <b-form-input
            v-model="filters.lineId"
            disabled
            class="w-100 filter-input"
            type="text"
          />
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
              childClass: 'input__date',
            }"
            v-model="filters[item.key]"
            typeable
            format="yyyy-MM-dd"
            input-class="input__date"
            :highlighted="highlighted"
            :disable-input="item.disabled"
            @selected="($event) => onDateSelected($event, item.key)"
            class="input-date"
          ></datepicker>

          <b-form-select
            v-else-if="item.filter === 'select'"
            v-model="filters[item.key]"
            class="filter-input"
            :options="item.options"
            :disabled="item.disabled"
            @change="filterData()"
          >
          </b-form-select>
          <BaseTypeaheadAutocomplete
            v-else-if="item.filter === 'autocomplete'"
            :initial-text="filters[item.key]"
            :initial-value="filters[item.key]"
            :items="item.options"
            :disable-input="isDisabledInput"
            @hit="(event) => setFilterData({ path: item.key, data: event })"
          >
          </BaseTypeaheadAutocomplete>
        </div>
      </div>
      <div class="py-1 table-header font-weight-bold d-flex align-items-center">
        <div class="text-center" :style="{ width: `5%` }">
          <b-form-checkbox
            id="checkAllDetails"
            @change="(event) => checkAll(event)"
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
      <div class="table-item-wrapper">
        <div
          v-for="(item, index) in listCheckbox"
          :key="`item-${index}`"
          class="py-1 table-item-container d-flex align-items-center"
          :class="{ active: currentIndex === index }"
          @dblclick="handleDoubleClick(index)"
        >
          <div class="text-center" :style="{ width: `5%` }">
            <b-form-checkbox
              v-if="!item.isNewLine"
              v-model="listCheckbox[index].value"
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
          >
            <div
              v-if="item.isNewLine || item.isUpdate"
              class="position-relative"
            >
              <b-form-input
                v-if="headerItem.filter === 'input'"
                v-model="item[headerItem.key]"
                class="w-100 filter-input"
                :disabled="headerItem.disabled"
                type="text"
                @keyup.enter="handleEnter(item, headerItem.key, index)"
              />
              <input
                v-else-if="headerItem.filter === 'input-number'"
                v-model="item[headerItem.key]"
                :disabled="headerItem.disabled"
                oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                type="text"
                class="filter-number"
              />
              <datepicker
                v-else-if="headerItem.filter === 'date'"
                v-only-date="{
                  isAppendToChild: true,
                  childClass: 'input__date',
                }"
                v-model="item[headerItem.key]"
                typeable
                format="yyyy-MM-dd"
                :disabled="headerItem.disabled"
                input-class="input__date"
                :highlighted="highlighted"
                class="input-date"
              ></datepicker>

              <b-form-select
                v-else-if="headerItem.filter === 'select'"
                v-model="item[headerItem.key]"
                class="filter-input"
                :options="headerItem.options"
                :disabled="headerItem.disabled"
              >
              </b-form-select>
              <BaseTypeaheadAutocomplete
                v-else-if="headerItem.filter === 'autocomplete'"
                v-model="item[headerItem.key]"
                :initial-text="item[headerItem.key]"
                :initial-value="item[headerItem.key]"
                :items="headerItem.options"
                :disable-input="headerItem.disabled"
                @change="
                  (value) => onChangeItemCode(value, index, headerItem.key)
                "
              >
                {{ headerItem }}
              </BaseTypeaheadAutocomplete>
            </div>
            <div v-else>
              <span v-if="notHasValue(item[headerItem.key])"> &nbsp; </span>
              <span v-else-if="headerItem.key === 'warehouseId'">
                {{ mapWarehouse({ warehouseId: item[headerItem.key] }) }}
              </span>
              <span v-else-if="headerItem.key === 'date'">
                {{ convertDate(new Date(item[headerItem.key])) }}
              </span>
              <span
                v-else-if="separateWithCommaFields.includes(headerItem.key)"
              >
                {{ makeFormatNumberWithCommas(item[headerItem.key] || 0) }}
              </span>
              <span
                v-else-if="
                  headerItem.key === 'price' ||
                  headerItem.key === 'quantity' ||
                  headerItem.key === 'soQTY' ||
                  headerItem.key === 'soqty'
                "
              >
                {{ parseStringToFloat(item[headerItem.key] || 0) }}
              </span>
              <span
                v-else-if="
                  headerItem.key === 'unitID' ||
                  headerItem.key === 'unitId' ||
                  headerItem.key === 'unit'
                "
                >{{ mapUnit(item[headerItem.key]) }}</span
              >
              <span v-else>{{ item[headerItem.key] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { get } from 'lodash'
import api from '@/api/api'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { isEmptyValue, formatNumberWithCommas } from '@/utils/utils'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
import systemMixins from '@/mixins/system'
import dateTimeMixins from '@/mixins/dateTime'
import commonOptionsMixins from '@/mixins/commonOptions'

export default {
  components: { BaseTypeaheadAutocomplete },
  mixins: [systemMixins, commonOptionsMixins, dateTimeMixins],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    listItemMaster: {
      type: Array,
      default: () => [],
    },
    isDisabledInput: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      separateWithCommaFields: ['amount', 'otherAmount'],
      highlighted: {
        dates: [new Date()],
      },
      listErrorMessage: [],
      listCheckbox: [],
      currentIndex: -1,
      filters: {},
      listEmployee: [],
    }
  },
  async fetch() {
    const res = await api('getEmployeeList')
    if (res && res.status === SERVER_RESPONSE_CODE.OK) {
      this.listEmployee = res.data || {}
    }
  },
  computed: {
    ...mapGetters('base', {
      warehouseOptions: 'getWarehouseOptions',
    }),
    isChecked() {
      return get(this.data, 'isCheck', false) === true
    },

    header() {
      return [
        {
          key: 'amount',
          name: this.$t('lbl_AmountReceiveBrowse_0'),
          filter: 'input-number',
          width: `12%`,
          align: 'right',
        },
        {
          key: 'otherAmount',
          name: this.$t('lbl_OtherAmount_0'),
          filter: 'input-number',
          width: `12%`,
          align: 'right',
        },
        {
          key: 'date',
          name: this.$t('lbl_ARDate_0'),
          filter: 'date',
          width: `12%`,
        },
        {
          key: 'user',
          name: this.$t('lbl_ARUser_0'),
          filter: 'autocomplete',
          width: `12%`,
          options: this.listEmployeeName,
        },
        {
          key: 'memo',
          name: this.$t('lbl_Memo_0'),
          filter: 'input',
          width: `18%`,
        },
      ]
    },
    listItemCode() {
      return this.listItemMaster?.map((item) => ({
        text: item.key,
        value: item.key,
        appendText: item.itemName ? `(${item.itemName})` : '',
        ...item,
      }))
    },
    listEmployeeName() {
      const result = []
      for (const key in this.listEmployee) {
        const employeeValue = this.listEmployee[key] || ''
        const lastIndexOfOpenParenthese = employeeValue.lastIndexOf('(') || 0

        const appendText = employeeValue.substring(lastIndexOfOpenParenthese)
        const responsibleManValue = employeeValue.substring(
          0,
          lastIndexOfOpenParenthese
        )

        result.push({
          text: responsibleManValue,
          value: responsibleManValue,
          appendText,
        })
      }
      return result
    },
    itemDetailAvailable() {
      return this.listCheckbox.filter((item) => item && !item.isNewLine) || []
    },
  },
  watch: {
    data: {
      handler(value) {
        this.listCheckbox = JSON.parse(JSON.stringify(value)).map((item) =>
          Object.assign(item, { value: false })
        )
      },
      deep: true,
    },

    itemDetailAvailable: {
      deep: true,
      handler(data) {
        const amounts = data.map((item) => item.amount)
        const totalAmount = amounts.reduce(
          (partialSum, amount) => partialSum + Number(amount),
          0
        )

        const otherAmounts = data.map((item) => item.otherAmount)
        const totalOtherAmount = otherAmounts.reduce(
          (partialSum, amount) => partialSum + Number(amount),
          0
        )

        this.$emit('calculated-aramount', totalOtherAmount + totalAmount)
      },
    },
  },
  created() {
    this.$bus.$on('update-invoice-selected-details', (data) => {
      this.$emit('update-details', data)
    })
  },
  methods: {
    makeFormatNumberWithCommas(number) {
      return formatNumberWithCommas(number)
    },
    notHasValue(value) {
      return isEmptyValue(value)
    },
    onDateSelected(value, path) {
      this.filters[path] = value
      this.filterData()
    },
    mapUnit(unitID) {
      const mappedUnit = this.unitOptions?.find(
        (item) => item.value === Number(unitID)
      )
      return mappedUnit?.text ?? ''
    },
    findItemCode(code) {
      return this.listItemCode.find((item) => item.key === code)
    },
    onChangeItemCode(select, index, columnKey) {
      if (columnKey !== 'itemCode') {
        return
      }

      const itemOrder = this.listCheckbox[index]
      itemOrder.itemCode = select?.value
      const result = this.findItemCode(select?.value)
      itemOrder.itemName = result?.itemName
      itemOrder.description = result?.description
      itemOrder.unit = result?.unitID
      itemOrder.itemId = result?.itemId
    },
    setFilterData({ data, path }) {
      this.filters = Object.assign({}, this.filters, { [path]: data })
      this.filterData()
    },
    filterData() {
      this.$emit('filter', this.filters)
    },

    handleEnter(item, columnKey, index) {
      if (item && columnKey !== 'memo') {
        return
      }

      this.listErrorMessage = []
      const requiredFields = {
        amount: 'Amount',
        date: 'ARDate',
        user: 'ARUser',
      }

      const numberFields = ['amount']
      for (const field of numberFields) {
        item[field] = Number(item[field])
      }

      for (const prop in requiredFields) {
        if (!item[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      const hasError = this.listErrorMessage.length > 0
      if (hasError) {
        if (item.isNewLine) {
          this.$emit('add-detail', item)
        } else {
          this.emitData()
        }
        return this.$emit('validation-errors', this.listErrorMessage)
      }

      this.addOrUpdateItem(item, index)
    },

    addOrUpdateItem(item, index) {
      if (item.isNewLine) {
        return this.addItem(item)
      }

      this.updateItem(item, index)
    },

    addItem(item) {
      Object.assign(item, {
        isNewLine: false,
        isUpdate: false,
        parentID: this.$route.query.receiveBrowse,
      })
      this.emitData()
      this.$emit('add-detail', {
        amount: '',
        otherAmount: '',
        date: '',
        user: '',
        memo: '',
        isUpdate: true,
        isNewLine: true,
      })
    },

    updateItem(item, index) {
      Object.assign(item, {
        isUpdate: false,
        parentID: this.$route.query.receiveBrowse,
      })
      this.listCheckbox[index] = Object.assign({}, item)
      this.emitData()
    },

    handleDoubleClick(index) {
      this.listCheckbox.forEach((item) => {
        item.isUpdate = false
      })

      this.listCheckbox[index].isUpdate = true
      this.$forceUpdate()
    },
    checkAll(value) {
      this.listCheckbox = this.listCheckbox.map((item) =>
        Object.assign(item, { value })
      )
    },
    mapWarehouse({ warehouseId }) {
      const mappedWarehouse = this.warehouseOptions.filter(
        (item) => item.value === warehouseId
      )
      return get(mappedWarehouse, '0.text')
    },

    emitData() {
      const tempData = JSON.parse(JSON.stringify(this.itemDetailAvailable))
      this.$emit(
        'changeTable',
        tempData.map((item) => {
          item.itemID = this.listItemMaster?.find(
            (subItem) => item.key === subItem.itemCode
          )?.itemId
          return item
        })
      )
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
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

.input-date {
  height: 20px;
  font-size: 12px;
  border-radius: unset;
  // border: 1px solid #ced4da;
  background: #fff;
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
</style>
