<template>
  <div>
    <div class="clear-both"></div>
    <div class="d-flex mt-2 mb-2 mb-2 pl-2 btn-container">
      <div
        class="mr-2 d-flex cursor-pointer align-content-center"
        :class="isChecked ? 'text--disabled' : ''"
        @click="onClickDelete"
      >
        <img src="@/assets/icon/DelRow.png" alt="" />
        <span>{{ $t('btn_btnDelRow_0') }}</span>
      </div>
    </div>
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
            :maxLength="item?.maxLength || '256'"
            :disabled="item.disabled"
            @keyup.enter="filterData()"
          />
          <input
            v-else-if="item.filter === 'input-number'"
            v-model="filters[item.key]"
            :maxLength="item?.maxLength || '256'"
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
            @selected="
              (event) => setFilterData({ path: item.key, data: event })
            "
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
            v-model="isCheckedAll"
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
          @click="handleClick(index)"
          @dblclick="handleDoubleClick(index, item)"
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
                @keyup.enter="handleEnter(item, headerItem.key)"
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
                  childClass: 'input__orderDate',
                }"
                :value="item[headerItem.key]"
                typeable
                format="yyyy-MM-dd"
                :disabled="headerItem.disabled"
                input-class="input__orderDate"
                class="filter-date"
                :highlighted="highlighted"
                @selected="
                  (event) =>
                    setSelectedDate({ data: event, path: headerItem.key })
                "
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
            <div v-else class="word-break--all">
              <span v-if="headerItem.key === 'warehouseId'">
                {{ mapWarehouse({ warehouseId: item[headerItem.key] }) }}
              </span>
              <span
                v-else-if="
                  headerItem.key === 'wastageRate' ||
                  headerItem.key === 'subQuantity'
                "
              >
                {{ parseStringToFloat(item[headerItem.key]) || '' }}
              </span>
              <span v-else-if="headerItem.key === 'unit'">{{
                mapUnit(item[headerItem.key])
              }}</span>
              <span v-else>{{ item[headerItem.key] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash'
import { mapGetters } from 'vuex'
import dateTime from '@/mixins/dateTime'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
import systemMixins from '@/mixins/system'

export default {
  components: { BaseTypeaheadAutocomplete },
  mixins: [dateTime, systemMixins],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    formData: {
      type: Object,
      default: () => {},
    },
    listItemMaster: {
      type: Array,
      default: () => [],
    },
    isDisabledInput: {
      type: Boolean,
      default: false,
    },
    edit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      highlighted: {
        dates: [new Date()],
      },
      listErrorMessage: [],
      listCheckbox: [],
      currentIndex: -1,
      filters: {},
      isCheckedAll: false,
      oldDetailData: {},
    }
  },
  computed: {
    ...mapGetters('base', {
      warehouseOptions: 'getWarehouseOptions',
      unitOptions: 'getUnitOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    isChecked() {
      return get(this.data, 'isCheck', false) === true
    },

    header() {
      return [
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: `10%`,
          options: this.listItemCode,
          disabled: !this.getActiveButtonToolBar.isEdit,
        },
        {
          key: 'itemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'description',
          name: this.$t('lbl_Description_0'),
          filter: 'input',
          width: `9%`,
          disabled: !this.getActiveButtonToolBar.isEdit,
          maxLength: '256',
        },
        {
          key: 'unit',
          name: this.$t('lbl_Unit_0'),
          filter: 'select',
          width: `8%`,
          options: this.unitOptions,
          disabled: !this.getActiveButtonToolBar.isEdit,
        },
        {
          key: 'subQuantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'input-number',
          width: `8%`,
          disabled: !this.getActiveButtonToolBar.isEdit,
          maxLength: '30',
        },
        {
          key: 'wastageRate',
          name: this.$t('lbl_WastageRate_0'),
          filter: 'input-number',
          width: `8%`,
          disabled: !this.getActiveButtonToolBar.isEdit,
          maxLength: '30',
        },
        {
          key: 'effectiveDate',
          name: this.$t('lbl_EffectiveDate_0'),
          filter: 'date',
          width: `8%`,
          disabled: !this.getActiveButtonToolBar.isEdit,
        },
        {
          key: 'memo',
          name: this.$t('lbl_Memo_0'),
          filter: 'input',
          width: `15%`,
          disabled: !this.getActiveButtonToolBar.isEdit,
          maxLength: '256',
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
    itemDetailAvailable() {
      return this.listCheckbox?.filter((item) => item && !item.isNewLine) || []
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
      handler(value) {
        if (!value.length) {
          return
        }

        const isCheckedAll = value.every((item) => item.value)
        if (isCheckedAll) {
          return (this.isCheckedAll = true)
        }

        this.isCheckedAll = false
      },
    },
  },
  methods: {
    setSelectedDate({ data, path }) {
      this.listCheckbox[this.currentIndex][path] = this.convertDate(data)
    },
    handleClick(index) {
      this.currentIndex = index
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
      itemOrder.subItemID = result?.itemId

      this.$forceUpdate()
    },
    setFilterData({ data, path }) {
      this.filters = Object.assign({}, this.filters, { [path]: data })
      this.filterData()
    },
    filterData() {
      this.$emit('filter', this.filters)
    },
    handleEnter(item, columnKey) {
      if (!this.getActiveButtonToolBar.isEdit) {
        return
      }
      if (columnKey !== 'memo') {
        return
      }

      this.listErrorMessage = []
      const convertToNumberFields = ['subQuantity', 'subItemID', 'wastageRate']
      for (const key of convertToNumberFields) {
        item[key] = Number(item[key]) || 0
      }

      const requiredFields = {
        subQuantity: 'Quantity',
        subItemID: 'ItemCode',
        effectiveDate: 'EffectiveDate',
      }

      for (const prop in requiredFields) {
        if (!item[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      const isRepeatItemId = this.formData?.itemId === item.subItemID

      if (isRepeatItemId) {
        this.listErrorMessage.push({
          fieldName: '物料和成品', // FIXME: BE them i18n
          text: this.$t('msg_RepeatInput_0'),
        })
      }

      this.$emit('validate-message', this.listErrorMessage)
      const hasError = this.listErrorMessage.length > 0
      if (hasError) {
        if (item.isNewLine) {
          this.$emit('add-details', item)
        }
        return this.emitData()
      }

      this.oldDetailData = {}
      this.$emit('validate-message', [])
      this.checkAddOrUpdate(item)
    },

    checkAddOrUpdate(item) {
      if (item.isNewLine) {
        return this.addItem(item)
      }
      this.updateItem(item)
    },

    addItem(item) {
      Object.assign(item, { isNewLine: false, isUpdate: false })
      this.emitData()
      this.$emit('add-details', {
        subQuantity: 0,
        wastageRate: 0,
        effectiveDate: this.convertDate(new Date()),
        isUpdate: true,
        isNewLine: true,
      })
    },

    emitData() {
      const tempData = JSON.parse(JSON.stringify(this.itemDetailAvailable))
      this.$emit('changeTable', tempData)
    },

    handleDoubleClick(index, item) {
      if (item.isUpdate) {
        return
      }

      const { data: oldData, index: oldIndex } = this.oldDetailData

      const hasOldDetailData = !!oldData && Object.keys(oldData).length
      if (hasOldDetailData) {
        this.listCheckbox[oldIndex] = oldData
      }

      this.oldDetailData = {
        index,
        data: JSON.parse(JSON.stringify(item)),
      }

      this.listCheckbox.forEach((item) => {
        item.isUpdate = false
      })

      item.isUpdate = true

      this.listCheckbox = JSON.parse(JSON.stringify(this.listCheckbox))
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

    onClickDelete() {
      if (this.isChecked) {
        return
      }

      this.deleteItem()
    },

    updateItem(editingItem) {
      editingItem.isUpdate = false

      this.emitData()
    },
    deleteItem() {
      const notSelectedDetails = !this.itemDetailAvailable.some(
        (item) => item.value
      )
      if (notSelectedDetails) {
        return window.alert(this.$t('msg_NoSelected_0'))
      }

      const confirm = window.confirm(this.$t('msg_ConfirmDelDetail_0'))
      if (!confirm) {
        return
      }

      this.listCheckbox = this.listCheckbox.filter((item) => !item.value)
      this.emitData()
    },

    resetFilters() {
      this.filters = {}
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vue-auto-complete.scss';
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
.table-item-container {
  cursor: pointer;

  &:not(.active):hover {
    background: #d4e7f5 !important;
  }

  & .word-break--all {
    word-break: break-all;
  }
}
.filter-number {
  padding: 4px 3px 4px 3px;
  border: 1px solid #aaa;
  width: 100%;
  height: 20px;
}
.filter-date {
  border: 1px solid #aaa;
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
