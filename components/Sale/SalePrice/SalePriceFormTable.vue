<template>
  <div class="overflow-x-auto">
    <div class="clear-both"></div>
    <div class="d-flex mt-2 mb-2 mb-2 pl-2 btn-container">
      <div
        class="
          mr-2
          d-flex
          cursor-pointer
          align-content-center align-items-center
        "
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
          <b-form-input class="w-100 filter-input" type="text" />
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
          <div v-if="item.isNewLine || item.isUpdate" class="position-relative">
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
            />
          </div>
          <div v-else>
            <span
              v-if="
                headerItem.key === 'minQuantity' ||
                headerItem.key === 'maxQuantity' ||
                headerItem.key === 'price'
              "
            >
              {{ parseStringToFloat(item[headerItem.key] || 0) }}
            </span>
            <span v-else>{{ item[headerItem.key] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api/api'
import systemMixins from '@/mixins/system'

export default {
  mixins: [systemMixins],
  props: {
    data: {
      type: Array,
      default: () => [],
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
          key: 'minQuantity',
          name: this.$t('lbl_MinQuantity_0'),
          filter: 'input-number',
          width: `12%`,
        },
        {
          key: 'maxQuantity',
          name: this.$t('lbl_MaxQuantity_0'),
          filter: 'input-number',
          width: `12%`,
        },
        {
          key: 'price',
          name: this.$t('lbl_Price_0'),
          filter: 'input-number',
          width: `12%`,
        },
      ]
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
      immediate: true,
    },
  },
  methods: {
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

      const requiredFields = [
        {
          key: 'maxQuantity',
          type: 'number',
        },
        {
          key: 'minQuantity',
          type: 'number',
        },
        {
          key: 'price',
          type: 'number',
        },
      ]

      for (const field of requiredFields) {
        if (!item[field.key]) {
          Object.assign(item, { [field.key]: 1 })
          continue
        }

        const inValidValue =
          field.type === 'number' && isNaN(Number(item[field.key]))

        if (inValidValue) {
          Object.assign(item, { [field.key]: 0 })
        }
      }

      const convertToNumberFields = ['minQuantity', 'maxQuantity', 'price']

      const finalSelectedItem = Object.assign({}, item)
      for (const key in item) {
        const isNumberField = convertToNumberFields.includes(key)

        if (isNumberField) {
          finalSelectedItem[key] = this.parseStringToFloat(item[key])
        }
      }

      this.checkAddOrUpdate(finalSelectedItem, index)
    },
    checkAddOrUpdate(item, index) {
      if (item.isNewLine) {
        return this.addItem(item)
      }
      this.updateItem(item, index)
    },
    handleDoubleClick(indexItem) {
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

    addItem(item) {
      Object.assign(item, { isNewLine: false })
      this.listCheckbox.push(item)
      this.emitData()
      this.$emit('add-details', {
        minQuantity: '',
        maxQuantity: '',
        price: '',
        isNewLine: true,
      })
    },
    emitData() {
      const tempData = JSON.parse(JSON.stringify(this.itemDetailAvailable))
      this.$emit('changeTable', tempData)
    },
    updateItem(item, index) {
      Object.assign(item, { isUpdate: false })
      this.listCheckbox[index] = Object.assign({}, item)
      this.emitData()
    },
    async deleteItem() {
      const notSelectedDetails = !this.listCheckbox.some((item) => item.value)
      if (notSelectedDetails) {
        return window.alert(this.$t('msg_NoSelected_0'))
      }

      const confirm = window.confirm(this.$t('msg_ConfirmDelDetail_0'))
      if (!confirm) {
        return
      }

      const selectedItems = this.listCheckbox.filter((item) => item.value)

      const filteredSelectedItems = selectedItems.filter(
        (item) => item.parentIDUsingDeteteDTLAndEditOnly
      )

      const deleteSelectedItemPromises = filteredSelectedItems.map(
        async (item) =>
          await api('deleteSalePriceDetail', {
            sOPriceID: item.parentIDUsingDeteteDTLAndEditOnly,
          })
      )

      await Promise.all(deleteSelectedItemPromises)

      this.listCheckbox = this.listCheckbox.filter((item) => !item.value)
      this.emitData()
    },

    resetFilters() {
      this.filters = {}
    },
  },
}
</script>
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
</style>
