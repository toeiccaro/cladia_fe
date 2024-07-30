<template>
  <div class="add-form">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="OrderNumber">{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.quoteNO"
              disabled
              type="text"
              required
            />
          </td>
          <td class="info">*</td>

          <td class="label">
            <span id="OrderDate">{{ $t('lbl_OrderDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="form.orderDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisableInput"
              input-class="input__orderDate"
              :highlighted="highlighted"
            ></datepicker>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span id="Currency">{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.currencyId"
              :options="currencyOptions"
              :disabled="isDisableInput"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_CustomerName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input" position-relative>
            <BaseTypeaheadAutocomplete
              v-model="form.customerID"
              :initial-value="form.customerID"
              :initial-text="form.customerName"
              :items="listCustomerName"
              :disable-input="isDisableInput"
              @change="(event) => changeCustomer(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span id="ResponsibleMan">{{ $t('lbl_ResponsibleMan_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.responsibleMan"
              :disabled="isDisableInput"
              name="txtResponsibleMan"
              type="text"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-3">
          <td class="label">
            <span id="EffectiveDate">{{ $t('lbl_EffectiveDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="form.effectiveDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__effectiveDate',
              }"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisableInput"
              input-class="input__effectiveDate"
              :highlighted="highlighted"
            ></datepicker>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span id="Payment">{{ $t('lbl_PaymentType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.paymentId"
              :options="paymentOptions"
              :disabled="isDisableInput"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span id="DepartType">{{ $t('lbl_DepartType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.departId"
              :options="departmentOptions"
              :disabled="isDisableInput"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="EditUser">{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.editUser"
              disabled
              name="txtEditUser"
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="EditDate">{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="form.editDate"
              typeable
              format="yyyy-MM-dd"
              disabled
              input-class="input__orderDate"
              :highlighted="highlighted"
            ></datepicker>
          </td>
          <td class="info">&nbsp;</td>

          <td class="label">
            <span id="SONO">{{ $t('lbl_SONO_0') }}</span>
          </td>
          <td class="input">
            <b-form-input v-model="form.sono" type="text" disabled />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span id="checker">{{ $t('lbl_Checker_0') }}</span>
          </td>
          <td class="input">
            <b-form-input v-model="form.checker" type="text" disabled />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="CheckDate">{{ $t('lbl_CheckDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="form.checkDate"
              typeable
              format="yyyy-MM-dd"
              disabled
              input-class="input__orderDate"
              :highlighted="highlighted"
            ></datepicker>
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="TaxRate">{{ $t('lbl_TaxRate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.taxRate"
              :disabled="isDisableInput"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
              type="text"
              class="number"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-6">
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input
              v-model="form.memo"
              :disabled="isDisableInput"
              name="Memo"
              type="text"
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="discountRate">{{ $t('lbl_QDiscountRate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.discountRate"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
            />
          </td>
          
          <td class="info"></td>
        </tr>

        <tr class="tr-7">
          <td class="label">
            <span id="Attachments">{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input
              v-model="form.attachments"
              disabled
              name="Attachments"
              type="text"
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="TotalAmount">{{ $t('lbl_TotalAmount_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.totalAmount"
              disabled
              type="text"
              class="number"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import api from '@/api/api'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
export default {
  components: { BaseTypeaheadAutocomplete },
  props: {
    paramsQuotation: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: this.paramsQuotation,
      listAllCustomerName: [],
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters('base', {
      currencyOptions: 'getCurrencyOptions',
      paymentOptions: 'getPaymentTypeOptions',
      departmentOptions: 'getDepartmentOptions',
    }),
    listCustomerName() {
      return this.listAllCustomerName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
        taxRate: item.taxRate,
        discountRate: item.discountRate,
      }))
    },
    isDisableInput() {
      return !!(this.form?.checker && this.form.checkDate)
    },
  },
  watch: {
    paramsQuotation: {
      handler(value) {
        this.form = value
      },
      deep: true,
    },
  },
  async created() {
    await Promise.all([
      await this.getCurrencyOptions(this.lang),
      await this.getListCustomerName(),
      await this.getDepartmentOptionsFromAPI(this.lang),
      await this.getPaymentTypeOptionsFromAPI(this.lang),
    ])
  },
  methods: {
    ...mapActions('base', [
      'getCurrencyOptions',
      'getDepartmentOptionsFromAPI',
      'getPaymentTypeOptionsFromAPI',
    ]),
    async getListCustomerName() {
      const response = await api('getEnterpriseCustomerNames')
      this.listAllCustomerName = response.data
    },
    changeCustomer(select) {
      this.form.taxRate = select?.taxRate
      this.form.discountRate = select?.discountRate

      this.form.customerId = select?.value
      const result = this.listAllCustomerName.find(
        (item) => item.id === select?.value
      )
      this.form.customerName = result?.companyName
      this.form.currencyId =
        Number(result?.currencyID) && Number(result?.currencyID) !== 0
          ? Number(result?.currencyID)
          : null
      this.form.paymentId =
        Number(result?.paymentID) && Number(result?.paymentID) !== 0
          ? Number(result?.paymentID)
          : null
      this.form.responsibleMan = result?.responsibleMan
    },
  },
}
</script>
<style lang="scss" scoped>
@import '@/assets/vue-auto-complete.scss';
@import '@/assets/vuejs-datepicker.scss';
.add-form {
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
      border: 1px solid #aaa;
      padding-top: 2px;
      padding-bottom: 2px;
      height: 20px;
    }
    td.label {
      padding: 2px;
    }
    td.input {
      padding: 2px;
      .select {
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
    }
    td.info {
      padding: 3px;
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
