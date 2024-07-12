<template>
  <div class="">
    <div class="clear-both"></div>
    <div
      class="d-flex mt-2 mb-2 mb-2 pl-2 btn-container"
      :style="{ 'justify-content': 'space-between', 'align-items': 'center' }"
    >
      <div class="d-flex">
        <div class="mr-2 d-flex cursor-pointer align-content-center">
          <img src="@/assets/icon/DelRow.png" alt="" />
          <span>{{ $t('btn_btnDelRow_0') }}</span>
        </div>
        <div
          class="mr-2 d-flex cursor-pointer align-content-center"
          @click="saveDetails"
        >
          <img src="/images/save.png" alt="" :style="{ height: '16px' }" />
          <span>{{ textSave }}</span>
        </div>
      </div>
      <div class="input-container">
        <span>{{ $t('lbl_BatchInput_0') }}</span>
        <input v-model="container" type="text" class="container" />
      </div>
    </div>
    <div class="table-container">
      <div class="table-header-filter d-flex align-items-center">
        <div class="text-center" :style="{ width: `5%` }"></div>
        <div class="px-1" :style="{ width: `5%` }">
          <b-form-input
            v-model="selectedItem.lineId"
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
            @keyup.enter="filterData()"
          />
          <b-form-input
            v-else-if="item.filter === 'input-number'"
            v-model="filters[item.key]"
            oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            class="w-100 filter-input"
            @keyup.enter="filterData()"
          />
          <BaseTypeaheadAutocomplete
            v-else-if="item.filter === 'autocomplete'"
            v-model="filters[item.key]"
            :initial-text="selectedItem[item.key]"
            :initial-value="selectedItem[item.key]"
            :items="item.options"
            @hit="(event) => setFilterData({ path: 'itemCode', data: event })"
          >
          </BaseTypeaheadAutocomplete>
          <b-form-select
            v-else-if="item.filter === 'select'"
            v-model="selectedItem[item.key]"
            class="filter-input"
            :options="item.options"
            :disabled="item.disabled"
          >
          </b-form-select>
        </div>
      </div>
      <div class="py-1 table-header font-weight-bold d-flex align-items-center">
        <div class="text-center" :style="{ width: `5%` }">
          <b-form-checkbox
            id="checkAllPackingList"
            v-model="checkAll"
            @change="setCheckAll()"
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
        v-for="(item, index) in filteredDataTable"
        :key="`item-${index}`"
        class="py-1 table-item-container d-flex align-items-center"
        :class="{ active: currentIndex === index }"
        @dblclick="handleDoubleClick(index, item.lineID)"
      >
        <div class="text-center" :style="{ width: `5%` }">
          <b-form-checkbox
            v-model="selectedOrderList"
            type="checkbox"
            :value="item.itemID"
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
          <div v-if="item.isUpdate" class="position-relative">
            <input
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
              @input="onChangeNumber(index)"
            />

            <BaseTypeaheadAutocomplete
              v-else-if="headerItem.filter === 'autocomplete'"
              :initial-text="item[headerItem.key]"
              :initial-value="item[headerItem.key]"
              :items="headerItem.options"
              :disable-input="headerItem.disabled"
              @change="
                (value) => onChangeItemCode(value, index, headerItem.key)
              "
            >
            </BaseTypeaheadAutocomplete>
            <b-form-select
              v-else-if="item.filter === 'select'"
              v-model="selectedItem[item.key]"
              :options="item.options"
              class="select"
              :disabled="headerItem.disabled"
            ></b-form-select>
          </div>
          <div v-else>
            <span v-if="headerItem.key === 'warehouseId'">
              {{ mapWarehouse({ warehouseId: item[headerItem.key] }) }}
            </span>
            <span v-else>{{ item[headerItem.key] }}</span>
          </div>
        </div>
      </div>
    </div>
    <BaseTableLoader v-if="loading" />
  </div>
</template>

<script>
import _ from 'lodash'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import { searchDetails } from '@/utils/utils'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'

export default {
  name: 'InvoicePackingListTable',
  components: {
    BaseTableLoader,
    BaseTypeaheadAutocomplete,
  },
  props: {
    invoiceForm: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      checkAll: false,
      loading: false,
      packingList: [],
      highlighted: {
        dates: [new Date()],
      },
      demo: '',
      listItemMaster: [],
      currentIndex: -1,
      selectedItem: {},
      filters: Object.assign({}),
      filteredDataTable: [],
      lang: this.$i18n.locale,
      container: '',
      itemDetail: [],
      selectedOrderList: [],
    }
  },
  computed: {
    textSave() {
      return this.lang === 'japanese' ? '添加' : this.$t('btn_btnSave_0')
    },
    header() {
      return [
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: `10%`,
          options: this.listItemCode,
          disabled: true,
        },
        {
          key: 'itemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'quantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'input-number',
          width: `8%`,
          disabled: true,
        },
        {
          key: 'boxID',
          name: this.$t('lbl_BoxID_0'),
          filter: 'input',
          width: `8%`,
          disabled: true,
        },
        {
          key: 'boxType',
          name: this.$t('lbl_BoxType_0'),
          filter: 'input',
          width: `10%`,
          disabled: true,
        },
        {
          key: 'packageQty',
          name: this.$t('lbl_PackQty_0'),
          filter: 'input',
          width: `8%`,
          disabled: true,
        },
        {
          key: 'boxQty',
          name: this.$t('lbl_BoxQty_0'),
          filter: 'input',
          width: `8%`,
          disabled: true,
        },
        {
          key: 'memoDTL',
          name: this.$t('lbl_Memo_0'),
          filter: 'input',
          width: `15%`,
          disabled: true,
        },
        {
          key: 'container',
          name: this.$t('lbl_ContainerNo_0'),
          filter: 'input',
          width: `11%`,
          disabled: false,
        },
      ]
    },
    listItemCode() {
      return this.listItemMaster?.map((item) => ({
        text: item.key,
        value: item.key,
        appendText: `(${item.itemName})`,
        ...item,
      }))
    },
  },
  watch: {
    packingList: {
      handler(value) {
        this.itemDetail = value
        const data = JSON.parse(JSON.stringify(value))
        const boxIDCount = {}
        const boxTypes = data.map((item) => item.boxType).filter(Boolean)
        for (const key of boxTypes) {
          boxIDCount[key] = 0
        }

        this.itemDetail = data.map((item, index) => {
          boxIDCount[item.boxType] += 1

          return Object.assign({}, item, {
            isUpdate: false,
            value: false,
            boxID: boxIDCount[item.boxType] || '',
          })
        })
      },
      deep: true,
      immediate: true,
    },
    itemDetail() {
      this.filterData()
    },
    selectedOrderList: {
      handler(value) {
        if (value?.length === this.itemDetail?.length) {
          this.checkAll = true
        } else {
          this.checkAll = false
        }
      },
    },
  },
  async created() {
    try {
      this.loading = true
      const payload = {
        invoiceNo: this.$route.query?.invoiceNo,
        lang: this.$i18n.locale,
      }

      const [resItemMaster, resPackingList] = await Promise.all([
        api('getItemCode'),
        api('getInvoicePackingList', payload),
      ])

      if (resItemMaster && resItemMaster.status === SERVER_RESPONSE_CODE.OK) {
        this.listItemMaster = resItemMaster?.data
      }

      if (resPackingList && resPackingList.status === SERVER_RESPONSE_CODE.OK) {
        this.packingList = resPackingList.data
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  methods: {
    async saveDetails() {
      try {
        this.loading = true

        const selectedItems = this.selectedOrderList
        if (selectedItems.length === this.packingList.length) {
          this.checkAll = true
          this.setCheckAll()
        } else {
          this.checkAll = false
        }
        const addContainerNoPromises = selectedItems.map(async (item) => {
          const payload = {
            invoiceNo: this.invoiceForm.invoiceNo,
            containerDTL: [
              {
                itemID: item,
                containerName: this.container,
              },
            ],
          }

          return await api('addContainerNO', payload)
        })

        const res = await Promise.all(addContainerNoPromises)
        const errorCode = res?.data?.response?.status
        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }

        const payload = {
          invoiceNo: this.$route.query?.invoiceNo,
          lang: this.$i18n.locale,
        }

        const resPackingList = await api('getInvoicePackingList', payload)
        this.packingList = resPackingList.data
        this.container = ''
        this.selectedOrderList = []
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    findItemCode(code) {
      return this.listItemCode.find((item) => item.key === code)
    },
    onChangeItemCode(select, index, columnKey) {
      if (columnKey !== 'itemCode') {
        return
      }

      const itemOrder = this.itemDetail[index]
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
      this.filteredDataTable = searchDetails({
        data: this.itemDetail,
        filterData: JSON.parse(JSON.stringify(this.filters)),
      })
      this.$emit('filter', this.filters)
    },
    setCheckAll() {
      if (this.checkAll) {
        this.itemDetail.forEach((item) => {
          if (item) {
            this.selectedOrderList.push(item.itemID)
            this.selectedOrderList = Array.from(new Set(this.selectedOrderList))
          }
        })
      } else {
        this.selectedOrderList = []
      }
    },
    mapWarehouse({ warehouseId }) {
      const mappedWarehouse = this.warehouseOptions.filter(
        (item) => item.value === warehouseId
      )
      return _.get(mappedWarehouse, '0.text')
    },
    async updateItem(index) {
      const payload = {
        invoiceNo: this.invoiceForm.invoiceNo,
        containerDTL: [
          {
            itemID: this.filteredDataTable[index].itemID,
            containerName: this.filteredDataTable[index].container,
          },
        ],
      }
      this.loading = true
      const res = await api('addContainerNO', payload)
      if (res && res.status === 200) {
        const boxIDCount = {}
        const boxTypes = this.itemDetail
          .map((item) => item.boxType)
          .filter(Boolean)

        for (const key of boxTypes) {
          boxIDCount[key] = 0
        }

        this.itemDetail.map((item) => {
          if (item.itemID === this.filteredDataTable[index].itemID) {
            Object.assign(item, {
              container: this.filteredDataTable[index].container,
            })
          }

          boxIDCount[item.boxType] += 1

          return Object.assign({}, item, {
            isUpdate: false,
            value: false,
            boxID: boxIDCount[item.boxType] || '',
          })
        })
      }
      this.loading = false
      this.filteredDataTable[index].isUpdate = false
    },
    handleEnter(itemOrder, columnKey, index) {
      if (columnKey === 'container') {
        this.updateItem(index)
      }
    },

    handleDoubleClick(index) {
      this.filteredDataTable.forEach((item) => {
        item.isUpdate = false
      })
      this.filteredDataTable[index].isUpdate = true
      this.currentIndex = index
    },

    emitData() {
      const tempData = JSON.parse(JSON.stringify(this.itemDetail))
      this.$emit(
        'changeTable',
        tempData.map((item) => {
          item.itemId = this.listItemMaster.find(
            (subItem) => item.itemCode === subItem.itemCode
          )?.itemId
          return item
        })
      )
    },
  },
}
</script>
<style lang="scss" scoped>
.input-container {
  display: flex;
}
.table-container {
  font-size: 12px;
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
  border: 1px solid #aaa;
}
.container {
  height: 20px;
  padding: 0px 0px 0px 5px;
  font-size: 12px;
  border-radius: unset;
  border: 1px solid #aaa;
  margin-right: 16px;
  margin-left: 8px;
  width: 160px;
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
  &:hover {
    background: #d4e7f5;
  }
}

// .active {
//   background-color: #fbec88 !important;
// }

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
::v-deep .input__orderDate {
  min-height: 30px !important;
}
.filter-number {
  width: 100%;
}
</style>
