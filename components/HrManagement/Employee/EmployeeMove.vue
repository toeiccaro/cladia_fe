<template>
  <div class="employee-move">
    <div>
      <div class="d-flex mt-2 mb-2 pl-2 btn-container">
        <div
          class="
            mr-3
            d-flex
            cursor-pointer
            align-content-center align-items-center
          "
          @click="addItem"
        >
          <img src="@/assets/icon/AddRow.png" alt="" />
          <span>{{ $t('btn_btnAdd_0') }}</span>
        </div>
        <div
          class="
            mr-3
            d-flex
            cursor-pointer
            align-content-center align-items-center
          "
          @click="updateItem"
        >
          <img src="@/assets/icon/UpdateRow.png" alt="" />
          <span>{{ $t('btn_btnUpdateRow_0') }}</span>
        </div>
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
      <table
        role="table"
        aria-busy="false"
        aria-colcount="3"
        class="table b-table"
        responsive
      >
        <caption v-if="!items.length" class="text-dark pt-12">
          {{
            $t('msg_InputDetails_0')
          }}
        </caption>
        <thead role="rowgroup" class="">
          <tr role="row" class="header-1">
            <th class="row__first">
              <div class="col-12"></div>
            </th>
            <th class="w-60">
              <div class="col-12 table__cell">
                <input
                  v-model="wiget.id"
                  class="input-insite-th input-id"
                  disabled
                />
              </div>
            </th>
            <th class="w-100">
              <div class="col-12 table__cell">
                <input v-model="wiget.fdepartID" maxlength="256" class="input-insite-th" />
              </div>
            </th>
            <th class="w-100">
              <div class="col-12 table__cell">
                <input v-model="wiget.feposition" maxlength="256" class="input-insite-th" />
              </div>
            </th>
            <th class="w-100">
              <div class="col-12 table__cell">
                <input v-model="wiget.tdepartID" maxlength="256" class="input-insite-th" />
              </div>
            </th>
            <th class="w-100">
              <div class="col-12 table__cell">
                <input v-model="wiget.teposition" maxlength="256" class="input-insite-th" />
              </div>
            </th>
            <th class="w-100">
              <div class="col-12 table__cell">
                <input v-model="wiget.moveReason" maxlength="256" class="input-insite-th" />
              </div>
            </th>
            <th class="w-100">
              <div class="col-12 table__cell">
                <datepicker
                  v-model="wiget.moveDate"
                  v-only-date="{
                    isAppendToChild: true,
                    childClass: 'input__orderDate',
                  }"
                  typeable
                  format="yyyy-MM-dd"
                  input-class="input__orderDate"
                  :highlighted="highlighted"
                ></datepicker>
              </div>
            </th>
            <th class="w-100">
              <div class="col-12 table__cell">
                <input v-model="wiget.responsibleMan" maxlength="256" class="input-insite-th" />
              </div>
            </th>
          </tr>

          <tr role="row" class="header-2">
            <th
              v-for="(item, index) in fields"
              :key="index"
              :style="{ width: item.fieldWide }"
            >
              <div
                v-if="item.name && item.name == 'checkbox'"
                class="checkbox__check-all"
              >
                <b-form-checkbox
                  id="boxCheckAll"
                  @change="(event) => checkAll(event)"
                ></b-form-checkbox>
              </div>
              <div v-else class="col-12 table__cell">{{ item.name }}</div>
            </th>
          </tr>
        </thead>
        <tbody role="rowgroup">
          <!---->
          <tr
            v-for="(item, index) in items"
            :key="`wiget-${item.id}`"
            role="row"
            class="cursor-pointer table__row"
            :class="{ 'active-tr': currentIndex == index }"
            @click="selectItem(index)"
          >
            <td
              aria-colindex="1"
              role="cell"
              class="text-align-center table__cell"
            >
              <b-form-checkbox
                v-model="listCheckBox[index].value"
                @change="unCheckAllBox"
                class="checkBox"
              ></b-form-checkbox>
            </td>
            <td aria-colindex="2" role="cell" class="table__cell">
              {{ item.id }}
            </td>
            <td aria-colindex="4" role="cell" class="table__cell">
              {{ item.fdepartID }}
            </td>
            <td aria-colindex="5" role="cell" class="table__cell">
              {{ item.feposition }}
            </td>
            <td aria-colindex="6" role="cell" class="table__cell">
              {{ item.tdepartID }}
            </td>
            <td aria-colindex="7" role="cell" class="table__cell">
              {{ item.teposition }}
            </td>
            <td aria-colindex="8" role="cell" class="table__cell">
              {{ item.moveReason }}
            </td>
            <td aria-colindex="9" role="cell" class="table__cell">
              {{ item.moveDate.split(' ')[0] }}
            </td>
            <td aria-colindex="11" role="cell" class="table__cell">
              {{ item.responsibleMan }}
            </td>
          </tr>
        </tbody>
        <!---->
      </table>
    </div>
  </div>
</template>

<script>
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
export default {
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      listErrorMessage: [],
      highlighted: {
        dates: [new Date()],
      },
      demo: '',
      fields: [
        {
          key: 'checkbox',
          name: 'checkbox',
          fieldWide: '60px ',
          secondHeader: '',
          value: '',
        },
        {
          key: 'id',
          name: 'ID',
          fieldWide: '60px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'FDepartID',
          name: this.$t('lbl_FDepartID_0'),
          fieldWide: '150px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'Feposition',
          name: this.$t('lbl_Feposition_0'),
          fieldWide: '150px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'TDepartID',
          name: this.$t('lbl_TDepartID_0'),
          fieldWide: '150px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'Teposition',
          name: this.$t('lbl_Teposition_0'),
          fieldWide: '150px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'MoveReason',
          name: this.$t('lbl_MoveReason_0'),
          fieldWide: '150px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'MoveDate',
          name: this.$t('lbl_MoveDate_0'),
          fieldWide: '150px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'ResponsibleMan',
          name: this.$t('lbl_ResponsibleMan_0'),
          fieldWide: '150px',
          secondHeader: '',
          value: '',
        },
      ],
      items: JSON.parse(JSON.stringify(this.data)),
      listCheckBox: this.data
        ? this.data?.map((item) => {
            return { id: item.id, value: false }
          })
        : [],
      currentIndex: -1,
      checkbox: false,
      id: '',
      companyName: '',
      FDepartID: '',
      Feposition: '',
      TDepartID: '',
      Teposition: '',
      MoveReason: '',
      MoveDate: '',
      ResponsibleMan: '',
      wiget: {
        employeeId: this.$route.query?.employeeCode,
        fdepartID: '',
        feposition: '',
        id: '',
        moveDate: '',
        moveReason: '',
        responsibleMan: '',
        tdepartID: '',
        teposition: '',
      },
      selectedItem: null,
    }
  },
  watch: {
    data: {
      handler(value) {
        this.items = JSON.parse(JSON.stringify(value))
        this.listCheckBox = this.data
          ? this.data?.map((item) => {
              return { id: item.id, value: false }
            })
          : []
      },
      deep: true,
    },
  },
  methods: {
    unCheckAllBox() {
      document.getElementById('boxCheckAll').checked = false
    },
    checkAll(event) {
      this.listCheckBox = this.listCheckBox.map((item) =>
        Object.assign({}, item, { value: event })
      )
    },
    selectItem(index) {
      this.currentIndex = index
      this.wiget = JSON.parse(JSON.stringify(this.items[index]))
    },

    async addItem() {
      this.listErrorMessage = []
      const params = JSON.parse(JSON.stringify(this.wiget))
      delete params.id

      if (!this.edit) {
        this.listErrorMessage.push({
          fieldName: this.$t(`lbl_EmployeeCode_0`),
          text: this.$t('msg_NoExist_0'),
        })
      }

      const requiredFields = {
        moveDate: 'Date',
      }

      for (const prop in requiredFields) {
        if (!params[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      this.$emit('validation-errors', this.listErrorMessage)

      const hasError = this.listErrorMessage.length > 0
      if (hasError) {
        return
      }

      const res = await api('addEmployeeMove', params)
      const errorCode = res?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(res?.data?.response?.data?.message))
        return
      }
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.$emit('changeData')
        this.wiget = {}
      }
    },

    // eslint-disable-next-line require-await
    async updateItem() {
      this.listErrorMessage = []

      const requiredFields = {
        moveDate: 'Date',
      }
      for (const prop in requiredFields) {
        if (!this.wiget[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      this.$emit('validation-errors', this.listErrorMessage)

      const hasError = this.listErrorMessage.length > 0
      if (hasError) {
        return
      }

      const res = await api('editEmployeeMove', this.wiget)
      const errorCode = res?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(res?.data?.response?.data?.message))
        return
      }
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.$emit('changeData')
      }
    },
    async deleteItem() {
      const listFilter = this.listCheckBox.filter((item) => item.value)
      if (!listFilter.length) {
        return window.alert(this.$t('msg_NoSelected_0'))
      }

      const confirm = window.confirm(this.$t('msg_ConfirmDelDetail_0'))
      if (!confirm) {
        return
      }

      const deleteEmployeePromises = listFilter.map(
        async (item) =>
          await api('deleteEmployeeMove', {
            id: item.id,
            employeeId: this.$route.query?.employeeCode,
          })
      )

      const response = await Promise.all(deleteEmployeePromises)
      const errorCode = response?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(response?.data?.response?.data?.message))
        return
      }

      this.$emit('changeData')
      window.alert(this.$t('msg_IsDeleted_0'))
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
.checkBox {
  padding: 0;
  margin-left: -14px;
}
.table {
  border-collapse: collapse;
}
.table tbody td {
  padding: 4px 3px 4px 15px;
  border: unset;
}
.table thead th {
  border: unset;
}
.w-100 {
  width: 150px !important;
}
.w-60 {
  width: 60px;
}
.btn .b-icon.bi {
  display: none !important;
}
.dropdown {
  border-radius: unset !important;
}
.table thead tr:first-child th {
  padding: 0px 0px;
  padding-left: unset;
}
.table thead tr:last-child th {
  padding: unset;
}
.header-1 {
  background: #0e76bc;
}
.record {
  font-size: 12px;
  line-height: 25px;
}
.header-2 {
  background: #bcdbf3;
}
.text-align-center {
  text-align: center;
}
.text-area-insite-th {
  height: 38px;
}
.container-btn {
  display: flex;
  align-items: center;
  width: 100%;
  .header-btn {
    width: 100px;
    height: 34px;
    padding: 5px 0px;
    cursor: pointer;
    border: 1px solid #bababa;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
.table-header {
  display: flex;
  align-items: center;
}
input {
  width: 100%;
  padding-left: 5px;
  height: 16px;
}
.input-id {
  background-color: rgb(235, 239, 246);
}
.input-date-picker {
  width: 300px;
}
.checkbox__check-all {
  padding-left: 15px;
}
.employee-move {
  margin-top: 20px;
  font-size: 12px;
  line-height: 25px;
  padding: 0 1.4rem 1rem 1.4rem;
}

.cursor-pointer {
  cursor: pointer;
}

.active-tr {
  background-color: #fbec88;
}

.input-date {
  height: 20px;
  font-size: 12px;
  border: 1px solid #aaa;
  border-radius: 2px;
  align-items: center !important;
}
img {
  width: 16px;
  height: 16px;
}

::v-deep .input__orderDate {
  height: 16px !important;
}
.table__cell {
  padding-right: 5px !important;
  padding-left: 0 !important;
}
::v-deep .custom-checkbox .custom-control-label {
  margin-top: 2px;
}
.table__row {
  &:hover {
    background: #d4e7f5 !important;
  }
  &:nth-child(even) {
    background-color: #f6fbfe;
  }
}
</style>
