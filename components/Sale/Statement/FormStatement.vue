<template>
  <div class="form-statement">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span id="OrderNO">{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.statementNo"
              v-auto-focus
              name="txtStatementNo"
              type="text"
              config="readonly"
              readonly="readonly"
              style="background-color: rgb(235, 239, 246)"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="OrderDate">{{ $t('lbl_OrderDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="form.orderDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeOrderDate"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="StYear">{{ $t('lbl_StYear_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.year"
              :options="listYears"
              :disabled="disableInput"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_CustomerName_0') }}</span>
          </td>
          <td class="input position-relative" colspan="4">
            <BaseTypeaheadAutocomplete
              :initial-value="form.customerID"
              :initial-text="form.customerName"
              :items="listCustomerName"
              @change="(event) => changeCustomer(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="StMonth">{{ $t('lbl_StMonth_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.month"
              :options="listMonth"
              :disabled="disableInput"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="StartDate">{{ $t('lbl_StartDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="form.startDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              :disabled="disableInput"
              @selected="changeStartDate"
            ></datepicker>
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="EndDate">{{ $t('lbl_EndDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="form.endDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              typeable
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              :disabled="disableInput"
              @selected="changeEndDate"
            ></datepicker>
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="TotalAmount">{{ $t('lbl_TotalAmount_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="totalAmount"
              name="txtTotalAmount"
              type="text"
              class="number"
              config="readonly"
              readonly="readonly"
              style="background-color: rgb(235, 239, 246)"
            />
          </td>
          <td class="info">&nbsp;</td>
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
        <tr>
          <td class="label">
            <span id="Attachments">{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td colspan="4" class="input">
            <input
              v-model="form.attachments"
              name="txtAttachments"
              type="text"
              config="readonly"
              readonly="readonly"
              style="background-color: rgb(235, 239, 246)"
            />
          </td>
          <td class="info"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { YEAR, MONTH } from '@/constants'
import api from '@/api/api'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
import dateTime from '@/mixins/dateTime'
import { formatNumberWithCommas } from '@/utils/utils'

export default {
  components: { BaseTypeaheadAutocomplete },
  mixins: [dateTime],
  props: {
    dataForm: {
      type: Object,
      required: true,
    },
    disableInput: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      listYears: YEAR,
      listMonth: MONTH,
      form: {},
      listAllCustomerName: [],
      highlighted: {
        dates: [new Date()],
      },
    }
  },
  computed: {
    listCustomerName() {
      return this.listAllCustomerName?.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
        payPeriod: item.payPeriod,
        settleDate: item.settleDate,
      }))
    },
    totalAmount() {
      return formatNumberWithCommas(this.form.totalAmount)
    },
  },
  watch: {
    dataForm: {
      handler(val) {
        console.log(val);
        this.form = val
      },
    },
  },
  created() {
    this.form = this.dataForm
    this.getCustomerName()
  },
  methods: {
    async getCustomerName() {
      const response = await api('getEnterpriseCustomerNames')
      this.listAllCustomerName = response.data
    },
    changeCustomer(select) {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if(select.settleDate){
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        if (select.settleDate > lastDayOfMonth) {
          select.settleDate = lastDayOfMonth;
        }

        date.setDate(select.settleDate);
      } 
      this.form.endDate = this.convertDate(date);

      this.form.customerID = select?.value
      this.form.customerName =
        this.form.customerName ??
        this.listAllCustomerName.find((item) => item.value === select?.value)
          ?.companyName
    },
    changeOrderDate(value) {
      this.form.orderDate = this.convertDate(value)
    },
    changeStartDate(value) {
      this.form.startDate = this.convertDate(value)
    },
    changeEndDate(value) {
      this.form.endDate = this.convertDate(value)
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vue-auto-complete.scss';
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
.form-statement {
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
      .input-date {
        height: 20px;
        font-size: 12px;
        border-radius: 2px;
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
.autocomplete {
  position: absolute;
  top: 0px;
  padding: 2px;
}

input[disabled] {
  opacity: 0.5;
}
</style>
