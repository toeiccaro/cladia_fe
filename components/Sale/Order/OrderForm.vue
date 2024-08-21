<template>
  <div :key="refreshKey" class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="OrderNumber">{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.orderNumber"
              v-auto-focus
              name="txtOrderNumber"
              type="text"
              disabled
            />
          </td>
          <td class=""></td>

          <td class="label">
            <span id="OrderDate">{{ $t('lbl_OrderDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              ref="orderDatepickerInput"
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
              @change="changeOrderDateBlur"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="OperationType">{{ $t('lbl_OperType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.operationTypeId"
              :options="operationTypeOptions"
              disabled
              class="select"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_CustomerName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.customerId"
              :initial-text="form.customerName"
              :items="listCustomerName"
              :disable-input="isDisabled"
              @change="(event) => changeCustomer(event)"
              @text-change="(event) => resetCustomerBindingData(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span id="ResponsibleMan">{{ $t('lbl_ResponsibleMan_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.responsibleMan"
              name="txtResponsibleMan"
              type="text"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_Currency_0') }}</span>
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
            <span id="Payment">{{ $t('lbl_PaymentID_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.paymentId"
              :options="paymentTypeOptions"
              class="select"
              :disabled="isDisabled"
            >
            </b-form-select>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="">{{ $t('lbl_Saler_0') }}</span>
          </td>
          <td class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-text="form.saler"
              :initial-value="form.salerId"
              :items="listEmployeeName"
              :disable-input="isDisabled"
              @change="(value) => changeEmployee(value)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr class="tr-4">
          <td class="label">
            <span>{{
              lang === 'japanese'
                ? $t('lbl_DepartType_0')
                : $t('lbl_Department_0')
            }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.departmentId"
              :options="departmentOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_QuoteNO_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.quoteNO" type="text" disabled />
          </td>
          <td class="info">&nbsp;</td>

          <td class="label">
            <span>{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editUser" type="text" disabled />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span>{{ $t('lbl_TaxRate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.taxRate"
              type="text"
              class="number"
              :disabled="isDisabled"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_AmountReceiveBrowse_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.totalAmount"
              disabled
              type="text"
              class="number"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editDate" disabled type="text" />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-6">
          <td class="label">
            <span>{{ $t('lbl_QDiscountRate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.discountRate"
              type="text"
              class="number"
              :disabled="isDisabled"
            />
          </td>

          <td class="info"></td>
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" class="input">
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
            <input v-model="form.checker" type="text" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-7">
          <td class="label">
            <span id="Attachments">{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <input
              :value="form.attachmentList"
              name="Attachments"
              type="text"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkDate" type="text" disabled />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'

export default {
  name: 'OrderForm',
  components: { BaseTypeaheadAutocomplete },
  mixins: [dateTime],
  props: {
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
      refreshKey: Math.random() * 100000,
      form: this.data,
      listEmployee: {},
      listAllCustomerName: [],
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    try {
      await Promise.all([
        this.getEmployeeList(),
        this.getListCustomerName(),
        this.getDepartmentOptionsFromAPI(this.lang),
        this.getCurrencyOptions(this.lang),
        this.getPaymentTypeOptionsFromAPI(this.lang),
        this.getWarehouseOptions(this.lang),
        this.getOperationTypeOptionsFromAPI(this.lang),
      ])
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters('base', {
      departmentOptions: 'getDepartmentOptions',
      currencyOptions: 'getCurrencyOptions',
      paymentTypeOptions: 'getPaymentTypeOptions',
      warehouseOptions: 'getWarehouseOptions',
      operationTypeOptions: 'getOperationTypeOptions',
    }),
    listOperationType() {
      return [
        { text: this.$t('cmb_OperType_0'), value: 0 },
        { text: this.$t('cmb_OperType_1'), value: 1 },
        { text: this.$t('cmb_OperType_2'), value: 2 },
        { text: this.$t('cmb_OperType_3'), value: 3 },
      ]
    },
    listEmployeeName() {
      const result = []
      Object.keys(this.listEmployee).forEach((key) => {
        result.push({
          text: this.listEmployee[key],
          value: key,
        })
      })
      return result
    },
    listCustomerName() {
      return this.listAllCustomerName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
        taxRate: item.taxRate,
        discountRate: item.discountRate,
      }))
    },
  },
  watch: {
    data: {
      handler(value) {
        this.form = value
        this.$emit('update-table', value)
      },
      deep: true,
      immediate: true,
    },
  },

  methods: {
    ...mapActions('base', [
      'getDepartmentOptionsFromAPI',
      'getCurrencyOptions',
      'getPaymentTypeOptionsFromAPI',
      'getWarehouseOptions',
      'getOperationTypeOptionsFromAPI',
    ]),

    resetCustomerBindingData(select) {
      if (!select) {
        this.form = Object.assign(this.form, {
          customerId: '',
          currencyId: '',
          paymentId: '',
          responsibleMan: '',
          customerName: '',
        })
      }
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
    async getEmployeeList() {
      const response = await api('getEmployeeList')
      this.listEmployee = response?.data
    },
    async getListCustomerName() {
      const response = await api('getEnterpriseCustomerNames')
      this.listAllCustomerName = response.data
    },
    changeEmployee(select) {
      this.form.saler = select?.text
      this.form.salerId = select?.value
    },

    //Update date picker
    updateDate(field, value) {
      const convertedDate = this.convertDate(value)
      this.$set(this.form, field, convertedDate)
    },

    handleDateBlur(refName, field) {
      const inputElement = this.$refs[refName].$el.querySelector('input')
      if (inputElement) {
        this.updateDate(field, inputElement.value)
        if (this.form[field] === null) {
          inputElement.value = ''
        }
      }
    },

    changeOrderDate(value) {
      this.updateDate('orderDate', value)
    },

    changeOrderDateBlur() {
      this.handleDateBlur('orderDatepickerInput', 'orderDate')
    },

    setupFocusOutListener() {
      this.$nextTick(() => {
        const orderDateInputElement =
          this.$refs.orderDatepickerInput.$el.querySelector('input')

        if (orderDateInputElement) {
          orderDateInputElement.addEventListener(
            'focusout',
            this.changeOrderDateBlur
          )
        }
      })
    },
    refresh() {
      ++this.refreshKey
    },
  },
  mounted() {
    this.setupFocusOutListener()
  },
  beforeDestroy() {
    const orderDateInputElement =
      this.$refs.orderDatepickerInput?.$el?.querySelector('input')

    if (orderDateInputElement) {
      orderDateInputElement.removeEventListener(
        'focusout',
        this.changeOrderDateBlur
      )
    }
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
