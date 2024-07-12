<template>
  <div class="page__record">
    <div class="clear-both"></div>
    <div class="d-flex mt-2 mb-2 pl-2 btn-container">
      <div
        class="mr-3 d-flex cursor-pointer align-content-center"
        @click="addItem"
      >
        <img src="@/assets/icon/AddRow.png" alt="" />
        <span>{{ $t('btn_btnAdd_0') }}</span>
      </div>
      <div
        class="mr-3 d-flex cursor-pointer align-content-center"
        @click="updateItem"
      >
        <img src="@/assets/icon/UpdateRow.png" alt="" />
        <span>{{ $t('btn_btnUpdateRow_0') }}</span>
      </div>
      <div
        class="mr-2 d-flex cursor-pointer align-content-center"
        @click="deleteItem"
      >
        <img src="@/assets/icon/DelRow.png" alt="" />
        <span>{{ $t('btn_btnDelRow_0') }}</span>
      </div>
    </div>
    <div class="table-container">
      <div class="table-header-filter d-flex">
        <div class="headerTable">
          <div class="p-0 px-1 table-id headertop">
            <input
              v-model="selectedItem.lineId"
              disabled
              class="w-100 filter-input input__lineId"
              type="text"
            />
          </div>
          <div class="table-memo-input textareaFrom">
            <textarea
              v-model="selectedItem.memo"
              class="filter-input maxWith"
              maxlength="255"
              type="text"
            />
          </div>
          <div class="col-2 p-0 px-1 table-date headertop">
            <datepicker
              v-model="selectedItem.orderDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              typeable
              format="yyyy-MM-dd"
              :highlighted="highlighted"
              input-class="input__orderDate"
            ></datepicker>
          </div>
        </div>
      </div>
      <div class="py-1 table-header font-weight-bold d-flex align-items-center">
        <div class="text-center table-check-box" :style="{ width: `5%` }">
          <b-form-checkbox
            v-model="checkAll"
            @change="setCheckAll($event)"
          ></b-form-checkbox>
        </div>
        <div class="col-1 p-0 px-1 table-id">
          {{ `ID` }}
        </div>
        <div class="col-7 p-0 px-1 table-memo">
          {{ $t('lbl_Memo_0') }}
        </div>
        <div class="col-3 p-0 px-1 table-date">
          {{ $t('lbl_Date_0') }}
        </div>
      </div>
      <div v-if="items.length <= 0" class="no-details">
        <span>{{ $t('msg_InputDetails_0') }}</span>
      </div>
      <template v-else>
        <div
          v-for="(item, index) in items"
          :key="`record-${item.lineId}`"
          class="py-1 table-item-container d-flex align-items-center"
          :class="{ active: currentIndex === index }"
          @click="selectItem(item, index)"
        >
          <div class="text-center table-check-box" :style="{ width: `5%` }">
            <b-form-checkbox
              v-model="listCheckbox[index].value"
              @change="changeItemCheckbox"
            ></b-form-checkbox>
          </div>
          <div class="col-1 p-0 px-1 table-id">
            {{ item.lineId }}
          </div>
          <div class="col-7 p-0 px-1 table-memo">
            {{ item.memo }}
          </div>
          <div class="col-3 p-0 px-1 table-date">
            {{
              item.orderDate.split('T').length
                ? item.orderDate.split('T')[0]
                : ''
            }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import dateTimeMixins from '@/mixins/dateTime'

export default {
  mixins: [dateTimeMixins],
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    add: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      textra: 0,
      indeterminate: false,
      highlighted: {
        dates: [new Date()],
      },
      demo: '',
      fields: [
        {
          key: 'checkbox',
          name: 'checkbox',
          fieldWide: '10px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'id',
          name: 'ID',
          fieldWide: '20px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'memo',
          name: 'Memo',
          fieldWide: '150px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'date',
          name: 'Date',
          fieldWide: '150px',
          secondHeader: '',
          value: '',
        },
      ],
      items: this.data ? JSON.parse(JSON.stringify(this.data)) : [],
      listCheckbox: this.data
        ? this.data?.map((item) => {
            return { id: item.lineId, value: false }
          })
        : [],
      currentIndex: -1,
      selectedItem: {
        itemId: this.$route.query?.itemCode,
        editDate: '',
        editUser: '',
        lineId: '',
        memo: '',
        orderDate: '',
      },
      listErrorMessage: [],
      checkAll: false,
    }
  },
  watch: {
    data: {
      handler(value) {
        this.items = JSON.parse(JSON.stringify(value))
        this.listCheckbox = this.data?.map((item) => {
          return { id: item.lineId, value: false }
        })
      },
      deep: true,
    },
  },
  methods: {
    setCheckAll(value) {
      this.listCheckbox = this.listCheckbox.map((item) => {
        item.value = value
        return item
      })
    },

    changeItemCheckbox() {
      let state = true
      this.listCheckbox.forEach((item) => {
        if (!item.value) {
          state = false
        }
      })
      if (state) {
        this.checkAll = true
      } else {
        this.checkAll = false
      }
    },

    selectItem(item, index) {
      this.currentIndex = index
      this.selectedItem = JSON.parse(JSON.stringify(item))
    },

    async addItem() {
      try {
        this.listErrorMessage = []
        if (!this.$route.query?.itemCode) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_ItemCode_0`),
            text: this.$t('msg_NoExist_0'),
          })
        }

        const requiredFields = {
          memo: 'Memo',
          orderDate: 'Date',
        }

        const params = {
          ...this.selectedItem,
          lineId: this.items.length + 1,
          itemId: this.$route.query?.itemId || this.$route.query?.itemCode,
        }

        for (const prop in requiredFields) {
          if (!params[prop]) {
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
              text: this.$t('msg_NoInput_0'),
            })
          }
        }

        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          this.$emit('validation-errors', this.listErrorMessage)
          return
        }

        const convertDateFields = ['orderDate']
        const finalParams = Object.assign({}, params)
        for (const key of convertDateFields) {
          finalParams[key] = this.convertDate(finalParams[key])
        }

        const res = await api('addItemMasterRecord', finalParams)
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }

        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.$emit('changeData')
          this.$emit('validation-errors', [])
        }
      } catch (err) {
        console.error(err)
      }
    },

    async updateItem() {
      try {
        if (this.currentIndex < 0) {
          return window.alert(this.$t('msg_NoSelected_0'))
        }

        const params = {
          lineId: this.selectedItem.lineId,
          itemId: this.$route.query?.itemCode,
          memo: this.selectedItem.memo,
          orderDate: this.selectedItem.orderDate.split('T')[0],
        }
        const res = await api('editItemMasterRecord', params)
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.$emit('changeData')
        }
      } catch (err) {
        console.error(err)
      }
    },

    async deleteItem() {
      try {
        const listFilter = this.listCheckbox.filter((item) => item.value)
        const hasCheckboxes = listFilter.length

        if (!hasCheckboxes) {
          return window.alert(this.$t('msg_NoSelected_0'))
        }

        const confirm = window.confirm(this.$t('msg_ConfirmDelDetail_0'))
        if (confirm) {
          const deleteItemMasterPromises = listFilter.map(
            async (item) =>
               await api('deleteItemMasterRecord', {
                lineId: item.id,
                itemId: this.$route.query?.itemCode,
              })
          )

          const response = await Promise.all(deleteItemMasterPromises)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          this.$emit('changeData')
          window.alert(this.$t('msg_IsDeleted_0'))
        }
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
.headerTable {
  display: flex;
  margin-left: 40px;
}
.headertop {
  margin-top: 5px;
}
.headerTable .table-memo-input {
  margin: 5px 15px 0px 5px;
}

.table-container {
  font-size: 12px;
}

.table-header {
  background-color: #bcdbf3;
  margin-top: 1px;
}

.filter-input {
  height: 30px;
  padding-left: 10px;
}

.datepicker-input {
  width: 60%;
  height: 32px;
}

.table-check-box {
  max-width: 46px !important;
}

.table-id {
  max-width: 46px !important;
}

.table-memo {
  max-width: 706px !important;
}

.table-memo-input {
  margin-bottom: -4px;

  textarea {
    width: 670px;
  }
}

.table-date {
  max-width: 156px !important;
}

.table-header-filter {
  background-color: #0e76bc;
  padding: 2px 0;
  height: 39px;
  height: fit-content;
}

.table-item-container {
  cursor: pointer;

  &:hover {
    background: #d4e7f5;
  }
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

.no-details {
  margin: 35px 0;
}

.input__lineId {
  max-width: 40px;
}

::v-deep .input__orderDate {
  min-height: 30px !important;
}

.page__record {
  padding: 1rem 1.4rem;
}
</style>
