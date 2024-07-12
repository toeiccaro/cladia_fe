<template>
  <div class="form-adjustment">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.orderNo"
              v-auto-focus
              name="txtOrderNo"
              type="text"
              readonly="readonly"
              style="background-color: rgb(235, 239, 246)"
            />
          </td>
          <td class=""></td>
          <td class="label">
            <span>{{ $t('lbl_TransDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="form.transDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeTransDate"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_TotalWeight_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.totalWeight" disabled type="text" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="DepartID">{{
              lang === 'japanese'
                ? $t('lbl_DepartType_0')
                : $t('lbl_Department_0')
            }}</span>
          </td>
          <td class="input position-relative">
            <b-form-select
              v-model="form.departmentID"
              :options="listDepartmentName"
              class="select"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ResponsibleMan_0') }}</span>
          </td>
          <td class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.managerID"
              :initial-text="form.managerName"
              :items="listEmployeeName"
              @change="(event) => changeEmployeeName(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_TotalAmountInv_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.totalAmount" disabled type="text" />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="EditUser">{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.editUser"
              name="txtEditUser"
              type="text"
              config="readonly"
              readonly="readonly"
              style="background-color: rgb(235, 239, 246)"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editDate" disabled type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_TotalQty_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.totalQuantity"
              name="txtTotalQty"
              type="text"
              class="number"
              config="readonly"
              readonly="readonly"
              style="background-color: rgb(235, 239, 246)"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td class="input" colspan="4">
            <input v-model="form.memo" name="txtMemo" type="text" />
          </td>
          <td class="info"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
export default {
  components: { BaseTypeaheadAutocomplete },
  mixins: [dateTime],
  props: {
    dataForm: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: this.dataForm,
      listDepartment: [],
      listEmployee: {},
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
    }
  },
  computed: {
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
          value: Number(key),
          appendText,
        })
      }

      return result
    },
    listDepartmentName() {
      const result = [
        {
          text: '',
          value: '',
        },
      ]
      this.listDepartment.forEach((item) => {
        if (item.department) {
          result.push({
            text: item.department,
            value: item.keyID,
          })
        }
      })
      return result
    },
  },
  watch: {
    dataForm: {
      handler(val) {
        this.form = val
      },
    },
    'dataForm.department': {
      handler(val) {
        if (val && this.listDepartmentName.length > 0) {
          this.form.departmentID = this.listDepartmentName?.find(
            (item) => item.text === val
          )?.value
        }
      },
    },
  },
  async created() {
    await Promise.all([
      await this.getListDepartments(),
      await this.getEmployeeList(),
    ])
  },
  methods: {
    async getListDepartments() {
      const response = await api('getDepartment')
      this.listDepartment = response?.data
    },
    async getEmployeeList() {
      const response = await api('getEmployeeList')
      this.listEmployee = response?.data
    },
    changeTransDate(value) {
      this.form.transDate = this.convertDate(value)
    },
    changeEmployeeName(select) {
      this.form.managerID = select?.value
      this.form.managerName = select?.text
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
@import '@/assets/vue-auto-complete.scss';
</style>
<style lang="scss" scoped>
.form-adjustment {
  font-size: 12px;
  background: #ebeff6;
  table.edit {
    width: 100%;
    background-color: #ebeff6;
    td input {
      width: 100%;
      padding: 2px;
      border: 1px solid #aaa;
      background-color: #fff;
      border-radius: 2px;
      height: 20px;
    }
    td.label {
      padding: 2px;
    }
    td.input {
      padding: 2px;
      .select {
        height: 20px;
        font-size: 12px;
        border: 1px solid #aaa;
        background-color: #fff !important;
        border-radius: 2px;
      }
      textarea {
        border: 1px solid #aaa;
        border-radius: 2px;
      }
      .number {
        text-align: right;
      }
    }
    td.info {
      padding: 3px;
    }
    td.button {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2px;
      border: 1px solid #aaa;
      border-radius: 2px;
      background-color: #fff !important;
    }
    td.mr-8 {
      margin-top: 8px;
    }
  }
}
</style>
