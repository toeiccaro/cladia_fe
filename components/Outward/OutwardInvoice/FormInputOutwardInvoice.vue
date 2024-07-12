<template>
  <div class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span id="OrderNO">{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.orderNo"
              v-auto-focus
              name="txtOrderNumber"
              type="text"
              disabled
            />
          </td>
          <td class="info"></td>
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
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
              typeable
              @selected="changeOrderDate"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="InvoiceCode">{{ $t('lbl_InvoiceNo_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.invoiceNo"
              type="text"
              required
              :disabled="isDisabled"
            />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="SupplierName">{{ $t('lbl_SupplierName_0') }}</span>
          </td>
          <td class="input position-relative" colspan="4">
            <BaseTypeaheadAutocomplete
              v-model="form.supplierId"
              :initial-value="form.supplierId"
              :initial-text="form.supplierName"
              :items="listSupplier"
              :disable-input="isDisabled"
              @change="(event) => changeSupplierName(event)"
              @text-change="(event) => resetCustomerBindingData(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_SupplierResponsible_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.supplierResponsible"
              name="txtSupplierResponsible"
              type="text"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_PaymentID_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.paymentId"
              :options="paymentOptions"
              class="select"
              :disabled="isDisabled"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="Currency">{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.currencyId"
              :options="currencyOptions"
              class="select"
              :disabled="isDisabled"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="OrderDate">{{ $t('lbl_DueDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="form.dueDate"
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
              typeable
              @selected="changeDueDate"
            ></datepicker>
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td class="input" colspan="4">
            <input
              v-model="form.memo"
              name="Memo"
              type="text"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Checker_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkUser" type="text" disabled />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editUser" type="text" disabled />
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
            <span>{{ $t('lbl_CheckDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkDate" type="text" disabled />
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
              name="Attachments"
              type="text"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_TotalAmount_0') }}</span>
          </td>
          <td class="input">
            <input v-model="totalAmount" disabled type="text" class="number" />
          </td>
          <td class="info"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import { isEmptyValue, formatNumberWithCommas } from '@/utils/utils'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
export default {
  components: { BaseTypeaheadAutocomplete },
  mixins: [dateTime],
  props: {
    arrivalAddresses: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Object,
      default: () => {},
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: this.data,
      listSupplierName: [],
      deliveryAddress: [],
      listEmployee: [],
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
      isDisableSearchAddress: true,
      showUserInformation: JSON.parse(localStorage.getItem('company')) || {},
    }
  },
  async fetch() {
    this.form.deliveryAddress = this.showUserInformation?.companyName
    await Promise.all([
      this.getCurrencyOptions(this.lang),
      this.getPaymentTypeOptionsFromAPI(this.lang),
      this.getListOutwardCompany(),
    ])
  },
  computed: {
    ...mapGetters('base', {
      currencyOptions: 'getCurrencyOptions',
      paymentOptions: 'getPaymentTypeOptions',
    }),

    listSupplier() {
      return this.listSupplierName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
      }))
    },
    totalAmount() {
      return formatNumberWithCommas(this.form.totalAmount) || 0
    },
  },
  watch: {
    data: {
      handler(value) {
        this.form = value
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    ...mapActions({
      getCurrencyOptions: 'base/getCurrencyOptions',
      getPaymentTypeOptionsFromAPI: 'base/getPaymentTypeOptionsFromAPI',
    }),
    async getEmployeeList() {
      const response = await api('getEmployeeList')
      this.listEmployee = response?.data
    },
    resetCustomerBindingData(select) {
      if (!select) {
        this.form = Object.assign(this.form, {
          supplierId: '',
          supplierName: '',
          currencyId: '',
        })
        this.$forceUpdate()
      }
    },
    changeSupplierName(select) {
      this.form.supplierId = select?.value
      const result = this.listSupplierName.find(
        (item) => item.id === select?.value
      )
      this.form.supplierName = result?.companyName
      this.form.supplierResponsible = isEmptyValue(result?.responsibleMan)
        ? result?.companyName
        : result?.responsibleMan
      this.form.currencyId = result?.currencyID
        ? Number(result?.currencyID)
        : ''
      this.form.paymentId = result?.paymentID ? Number(result?.paymentID) : ''
      this.$forceUpdate()
    },
    async getListOutwardCompany() {
      const response = await api('getListCompanyByCondition', {
        companyType: 'Outward',
      })
      this.listSupplierName = response.data
    },
    changeOrderDate(value) {
      this.form.orderDate = this.convertDate(value)
    },
    changeDueDate(value) {
      this.form.dueDate = this.convertDate(value)
    },
    changeEmployeeName(select) {
      this.form.managerID = select?.value
      this.form.managerName = select?.text
    },
    refresh() {
      this.$forceUpdate()
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vue-auto-complete.scss';
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
select {
  font-size: 12px;
}

.add-form-enterprise {
  font-size: 12px;
  margin: 0px 1px;
  padding: 4px 32px 4px 4px;
  background: #ebeff6;
  color: #222;

  table.edit {
    width: 100%;
    background-color: #ebeff6;

    td input {
      width: 100%;
      padding: 2px;
      border: 1px solid #aaa;
      background-color: #fff;
      border-radius: 2px;
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
        background-color: #fff;
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
        border: 1px solid #aaa;
        border-radius: 2px;
      }
    }

    td.info {
      padding: 3px;
    }
  }
}

input[disabled] {
  opacity: 0.5;
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
