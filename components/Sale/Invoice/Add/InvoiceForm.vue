<template>
  <div class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="OrderNumber">{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="newInvoiceData.invoiceNo"
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
              :value="newInvoiceData.orderDate"
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
            <span id="InvoiceCode">{{ $t('lbl_InvoiceCode_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="newInvoiceData.invoiceCode"
              name="txtInvoiceCode"
              type="text"
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
              v-model="newInvoiceData.customerId"
              :items="finalListCustomerNames"
              :initial-text="newInvoiceData.companyName"
              :initial-value="newInvoiceData.customerId"
              @change-selected-item="changeSelectedItem"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="ResponsibleMan">{{ $t('lbl_ResponsibleMan_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="newInvoiceData.responsibleMan"
              name="txtResponsibleMan"
              type="text"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-3">
          <td class="label">
            <span id="DeliveryAddress">{{ $t('lbl_DeliveryAddress_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input
              v-model="newInvoiceData.deliveryAddress"
              name="DeliveryAddress"
              type="text"
              autocomplete="off"
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span>{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="newInvoiceData.currencyId"
              :options="currencyOptions"
              class="select"
            />
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="Payment">{{ $t('lbl_PaymentID_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="newInvoiceData.paymentId"
              :options="paymentOptions"
              class="select"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="TradeTerm">{{ $t('lbl_TradeTerm_0') }}</span>
          </td>
          <td class="input">
            <b-form-input v-model="newInvoiceData.tradeTerm" type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_PayDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              ref="payDatepickerInput"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__payDate',
              }"
              :value="newInvoiceData.payDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__payDate"
              :highlighted="highlighted"
              @input="changePayDate"
              @change="changePayDateBlur"
            ></datepicker>
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input
              v-model="newInvoiceData.memo"
              name="Memo"
              type="text"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ReceiveDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              ref="receiveDatepickerInput"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__receiveDate',
              }"
              :value="newInvoiceData.receiveDate"
              typeable
              format="yyyy-MM-dd"
              input-class="input__receiveDate"
              :highlighted="highlighted"
              @input="changeReceiveDate"
              @change="changeReceiveDateBlur"
            ></datepicker>
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span>{{ $t('lbl_TotalAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="totalAmount"
              disabled
              type="number"
              class="text-end"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_RtAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="newInvoiceData.totalRtAmount"
              disabled
              type="number"
              class="text-end"
            />
          </td>
          <td class="info">&nbsp;</td>

          <td class="label">
            <span>{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="newInvoiceData.editUser"
              type="text"
              disabled
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span>{{ $t('lbl_IsCheckAccount_0') }}</span>
          </td>
          <td class="input d-flex justify-center w-100">
            <b-form-checkbox v-model="newInvoiceData.checkAccount" disabled />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_Checker_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="newInvoiceData.checker"
              disabled
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="newInvoiceData.editDate" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-6">
          <td class="label">
            <span id="Attachments">{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="newInvoiceData.attachments"
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
            <input v-model="newInvoiceData.checkDate" disabled />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Warehouse_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="newInvoiceData.warehouseId"
              :options="warehouseOptions"
              class="select"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { sum, formatNumberWithCommas } from '@/utils/utils'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'
import api from '@/api/api'
import datetimeMixins from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
export default {
  components: {
    BaseTypeaheadAutocomplete,
  },
  mixins: [datetimeMixins, systemMixins],
  props: {
    selectedDetails: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      listCustomers: [],
      highlighted: {
        dates: [new Date()],
      },
      newInvoiceData: {
        totalAmount: 0,
        amount: 0,
        orderDate: this.convertDate(new Date()),
      },
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    try {
      await this.getListCustomerNames()
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters('base', {
      warehouseOptions: 'getWarehouseOptions',
      currencyOptions: 'getCurrencyOptions',
      paymentOptions: 'getPaymentTypeOptions',
    }),
    totalAmount() {
      const amountsSelected = this.selectedDetails.map((item) =>
        this.parseStringToFloat(item.amount)
      )
      return formatNumberWithCommas(sum(amountsSelected))
    },
    finalListCustomerNames() {
      return this.listCustomers.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
        payPeriod: item.payPeriod,
      }))
    },
  },
  watch: {
    'newInvoiceData.payDate': {
      handler(val) {
        if (val) {
          const date = new Date(val)
          const getMonthPayDate = date.getMonth() + 1
          const getYearPayDate = date.getFullYear().toString().padStart(4, '0')
          const receiveDate = new Date(getYearPayDate, getMonthPayDate, 1)
          this.newInvoiceData.receiveDate = this.convertDate(receiveDate)
        }
      },
    },
    'newInvoiceData.warehouseId': {
      handler(value) {
        this.$emit('update-warehouse', value)
      },
    },
    newInvoiceData: {
      deep: true,
      immediate: true,
      handler(data) {
        this.$emit('update-data', data)
        this.$emit('update-table', data)
      },
    },
  },
  async created() {
    await Promise.all([
      this.getPaymentTypeOptionsFromAPI(this.lang),
      this.getCurrencyOptions(this.lang),
    ])
  },
  methods: {
    ...mapActions('base', [
      'getPaymentTypeOptionsFromAPI',
      'getCurrencyOptions',
    ]),
    async getListCustomerNames() {
      const response = await api('getEnterpriseCustomerNames')
      this.listCustomers = response.data
    },

    changeSelectedItem(item) {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      if (item.payPeriod) {
        const lastDayOfMonth = new Date(year, month, 0).getDate()
        if (item.payPeriod > lastDayOfMonth) {
          item.payPeriod = lastDayOfMonth
        }

        date.setDate(item.payPeriod)
        this.newInvoiceData.payDate = this.convertDate(date)
      }
    },

    //Update date picker
    updateDate(field, value) {
      const convertedDate = this.convertDate(value)
      this.$set(this.newInvoiceData, field, convertedDate)
    },

    handleDateBlur(refName, field) {
      const inputElement = this.$refs[refName].$el.querySelector('input')
      if (inputElement) {
        this.updateDate(field, inputElement.value)
        if (this.newInvoiceData[field] === null) {
          inputElement.value = ''
        }
      }
    },

    changeOrderDate(value) {
      this.updateDate('orderDate', value)
    },

    changePayDate(value) {
      this.updateDate('payDate', value)
    },
    changeReceiveDate(value) {
      this.updateDate('receiveDate', value)
    },

    changeOrderDateBlur() {
      this.handleDateBlur('orderDatepickerInput', 'orderDate')
    },
    changePayDateBlur() {
      this.handleDateBlur('payDatepickerInput', 'payDate')
    },
    changeReceiveDateBlur() {
      this.handleDateBlur('receiveDatepickerInput', 'receiveDate')
    },

    setupFocusOutListener() {
      this.$nextTick(() => {
        const orderDateInputElement =
          this.$refs.orderDatepickerInput.$el.querySelector('input')

        const payDateInputElement =
          this.$refs.payDatepickerInput.$el.querySelector('input')

        const receiveDateInputElement =
          this.$refs.receiveDatepickerInput.$el.querySelector('input')

        if (orderDateInputElement) {
          orderDateInputElement.addEventListener(
            'focusout',
            this.changeOrderDateBlur
          )
        }
        if (payDateInputElement) {
          payDateInputElement.addEventListener(
            'focusout',
            this.changePayDateBlur
          )
        }

        if (receiveDateInputElement) {
          receiveDateInputElement.addEventListener(
            'focusout',
            this.changeReceiveDateBlur
          )
        }
      })
    },
  },

  mounted() {
    this.setupFocusOutListener()
  },
  beforeDestroy() {
    const orderDateInputElement =
      this.$refs.orderDatepickerInput?.$el?.querySelector('input')
    const payDateInputElement =
      this.$refs.payDatepickerInput?.$el?.querySelector('input')
    const receiveDateInputElement =
      this.$refs.receiveDatepickerInput?.$el?.querySelector('input')

    if (orderDateInputElement) {
      orderDateInputElement.removeEventListener(
        'focusout',
        this.changeOrderDateBlur
      )
    }
    if (payDateInputElement) {
      payDateInputElement.removeEventListener(
        'focusout',
        this.changePayDateBlur
      )
    }
    if (receiveDateInputElement) {
      receiveDateInputElement.removeEventListener(
        'focusout',
        this.changeReceiveDateBlur
      )
    }
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
@import '@/assets/vue-auto-complete.scss';
</style>
<style lang="scss" scoped>
.text-end {
  text-align: end !important;
}
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
        border-radius: 2px;
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
