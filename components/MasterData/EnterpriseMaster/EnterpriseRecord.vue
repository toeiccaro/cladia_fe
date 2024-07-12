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
      <div class="table-header-filter d-flex flex-item align-items-center">
        <b-row class="nowrap">
          <b-col cols="1" class="tdIndex">
            <div class="p-0 px-1 table-id">
              <input
                :value="currentIndex + 1"
                disabled
                class="w-100 filter-input input__lineId"
                type="text"
              />
            </div>
          </b-col>
          <b-col>
            <div class="table-memo-input">
              <textarea
                v-model="selectedItem.memo"
                class="filter-input maxWith"
                maxlength="255"
                type="text"
              />
            </div>
          </b-col>
          <b-col>
            <div class="col-2 p-0 px-1 table-date">
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
          </b-col>
        </b-row>
      </div>
      <div class="py-1 table-header font-weight-bold d-flex align-items-center">
        <div class="text-center table-check-box" :style="{ width: `5%` }">
          <b-form-checkbox
            id="boxCheckAll"
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
      <div v-if="!items.length" class="no-details">
        <span>{{ $t('msg_InputDetails_0') }}</span>
      </div>
      <template v-else>
        <div
          v-for="(item, index) in items"
          :key="`record${item.id}`"
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
            {{ index + 1 }}
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
export default {
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    add: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      textra: 0,
      items: this.data?.records
        ? JSON.parse(JSON.stringify(this.data?.records))
        : [],
      listCheckbox: this.data?.records
        ? this.data?.records?.map((item) => {
            return { id: item.id, value: false }
          })
        : [],
      indeterminate: false,
      highlighted: {
        dates: [new Date()],
      },
      demo: '',
      // fields: [
      //   {
      //     key: 'checkbox',
      //     name: 'checkbox',
      //     fieldWide: '10px',
      //     secondHeader: '',
      //     value: '',
      //   },
      //   {
      //     key: 'id',
      //     name: 'ID',
      //     fieldWide: '20px',
      //     secondHeader: '',
      //     value: '',
      //   },
      //   {
      //     key: 'memo',
      //     name: 'Memo',
      //     fieldWide: '150px',
      //     secondHeader: '',
      //     value: '',
      //   },
      //   {
      //     key: 'date',
      //     name: 'Date',
      //     fieldWide: '150px',
      //     secondHeader: '',
      //     value: '',
      //   },
      // ],
      currentIndex: -1,
      selectedItem: {
        itemId: '',
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
        this.items = JSON.parse(JSON.stringify(value?.records))
        this.listCheckbox = this.data?.records?.map((item) => {
          return { id: item.id, value: false }
        })
      },
      deep: true,
    },
  },
  methods: {
    unCheckAllBox() {
      document.getElementById('boxCheckAll').checked = false
    },
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

        Object.assign(this.selectedItem, {
          companyId: this.$route.query?.companyCode,
        })

        const requiredFields = {
          companyId: 'CompanyCode',
          memo: 'Memo',
          orderDate: 'OrderDate',
        }

        for (const prop in requiredFields) {
          if (!this.selectedItem[prop]) {
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

        if (this.add) {
          return
        }

        const res = await api('addEnterpriseRecord', this.selectedItem)
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.$emit('changeData')
        }

        this.$emit('validation-errors', this.listErrorMessage)
      } catch (err) {
        console.error(err)
      }
    },
    async updateItem() {
      try {
        if (this.currentIndex < 0) {
          window.alert(this.$t('msg_NoSelected_0'))
          return
        }

        this.listErrorMessage = []

        Object.assign(this.selectedItem, {
          companyId: this.$route.query?.employeeCode,
        })

        const requiredFields = {
          companyId: 'CompanyCode',
          memo: 'Memo',
          orderDate: 'OrderDate',
        }

        for (const prop in requiredFields) {
          if (!this.selectedItem[prop]) {
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

        const res = await api('editEnterpriseRecord', this.selectedItem)
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
      const listFilter = this.listCheckbox.filter((item) => item.value)
      const hasCheckboxes = listFilter.length

      if (!hasCheckboxes) {
        return window.alert(this.$t('msg_NoSelected_0'))
      }

      const confirm = window.confirm(this.$t('msg_ConfirmDelDetail_0'))
      if (confirm) {
        const deleteEnterpriseMasterPromises = listFilter.map(
          async (item) => await api('deleteEnterpriseRecord', item.id)
        )

        const res = await Promise.all(deleteEnterpriseMasterPromises)
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }
        setTimeout(() => {
          document.getElementById('boxCheckAll').checked = false
        }, 500)
        this.$emit('changeData')
      }
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
.tdIndex {
  margin-left: 50px;
}

.nowrap {
  flex-wrap: nowrap;
}

.maxWith {
  max-width: 700px !important;
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

.input-date {
  width: 60%;
  height: 100%;
}

.table-header-filter {
  background-color: #0e76bc;
  padding: 2px 0;
  height: fit-content;
}

.table-item-container {
  cursor: pointer;
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
    width: 660px;
  }
}

.table-date {
  max-width: 156px !important;
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

::v-deep .vdp-datepicker {
  div:first-child {
    height: 100%;

    input {
      height: 100%;
    }
  }
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
