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
              v-model="currentInvoiceData.invoiceNo"
              disabled
              name="txtOrderNumber"
              type="text"
              required
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
              typeable
              class="input-date-invoice"
              format="yyyy-MM-dd"
              :disabled="isCheck"
              :value="currentInvoiceData.orderDate"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="
                (event) =>
                  updateCurrentInvoiceData({
                    path: 'orderDate',
                    data: convertDate(event),
                  })
              "
            ></datepicker>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span id="InvoiceCode">{{ $t('lbl_InvoiceCode_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="currentInvoiceData.invoiceCode"
              name="txtInvoiceCode"
              type="text"
              required
              :disabled="isCheck"
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
              v-model="currentInvoiceData.customerId"
              :items="finalListCustomerNames"
              :initial-text="currentInvoiceData.customerName"
              :initial-value="currentInvoiceData.customerId"
              :disable-input="isCheck"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="ResponsibleMan">{{ $t('lbl_ResponsibleMan_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="currentInvoiceData.responsibleMan"
              :disabled="isCheck"
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
          <td rows="1" colspan="4" class="input position-relative">
            <b-form-input
              v-model="currentInvoiceData.deliveryAddress"
              name="DeliveryAddress"
              type="text"
              autocomplete="off"
              :disabled="isCheck"
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="Currency">{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="currentInvoiceData.currencyId"
              :options="currencyOptions"
              :disabled="isCheck"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="Payment">{{ $t('lbl_PaymentID_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="currentInvoiceData.paymentId"
              :options="paymentOptions"
              :disabled="isCheck"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="TradeTerm">{{ $t('lbl_TradeTerm_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="currentInvoiceData.tradeTerm"
              :disabled="isCheck"
              name="txtTradeTerm"
              type="text"
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="PayDate">{{ $t('lbl_PayDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__payDate',
              }"
              typeable
              class="input-date-invoice"
              format="yyyy-MM-dd"
              :disabled="isCheck"
              :value="currentInvoiceData.payDate"
              input-class="input__payDate"
              :highlighted="highlighted"
              @input="
                (event) =>
                  updateCurrentInvoiceData({
                    path: 'payDate',
                    data: convertDate(event),
                  })
              "
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
              v-model="currentInvoiceData.memo"
              :disabled="isCheck"
              name="Memo"
              type="text"
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="ReceiveDate">{{ $t('lbl_ReceiveDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__receiveDate',
              }"
              :value="currentInvoiceData.receiveDate"
              typeable
              class="input-date-invoice"
              format="yyyy-MM-dd"
              :disabled="isCheck"
              input-class="input__receiveDate"
              :highlighted="highlighted"
              @input="
                (event) =>
                  updateCurrentInvoiceData({
                    path: 'receiveDate',
                    data: convertDate(event),
                  })
              "
            ></datepicker>
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span id="TotalAmount">{{ $t('lbl_TotalAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="totalAmount"
              name="TotalAmount"
              type="text"
              class="number"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Amount">{{ $t('lbl_RtAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="currentInvoiceData.totalRtAmount"
              name="Amount"
              type="text"
              class="number"
              disabled
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="EditUser">{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="currentInvoiceData.editUser"
              disabled
              name="txtTaxRate"
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span id="CheckAccount">{{ $t('lbl_IsCheckAccount_0') }}</span>
          </td>
          <td class="input d-flex justify-center w-100">
            <input
              class="checkbox"
              type="checkbox"
              disabled
              :checked="currentInvoiceData.isCheckAccount"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="Checker">{{ $t('lbl_Checker_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="currentInvoiceData.checker"
              disabled
              name="txtTaxRate"
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="EditDate">{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input
              class="input-date-invoice"
              :value="convertDate(currentInvoiceData.editDate)"
              :disabled="true"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-6">
          <td class="label">
            <span id="Attachments">{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="attachmentNames"
              disabled
              name="Attachments"
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="CheckDate">{{ $t('lbl_CheckDate_0') }}</span>
          </td>
          <td class="input">
            <input
              class="input-date-invoice"
              :value="convertDate(currentInvoiceData.checkDate)"
              :disabled="true"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="WareHouse">{{ $t('lbl_Warehouse_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="currentInvoiceData.wareHouseId"
              :options="warehouseOptions"
              class="select"
              :disabled="isCheck"
              @change="(event) => mapWarehouse({ warehouseId: event })"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import api from '@/api/api'
import { dateFormatHyphen, sum, formatNumberWithCommas } from '@/utils/utils'
import systemMixins from '@/mixins/system'
import datetimeMixins from '@/mixins/dateTime'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'
export default {
  components: {
    BaseTypeaheadAutocomplete,
  },
  mixins: [datetimeMixins, systemMixins],
  props: {
    dataInvoice: {
      type: Object,
      required: true,
    },
    listDetails: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: this.paramsInvoice,
      refreshDeliveryAddressKey: 0,
      refreshCustomerIdKey: 0,
      orderDate: new Date(),
      highlighted: {
        dates: [new Date()],
      },
      currentInvoiceData: {},
      currentListDetails: [],
      listCustomers: [],
      lang: this.$i18n.locale,
      firstLoadCustomer: 0, // to check if this is the first time BaseTypeaheadAutocomplete trigger the 'change' event
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
      const amountsSelected = this.listDetails.map((item) =>
        this.parseStringToFloat(item.amount)
      )
      return formatNumberWithCommas(sum(amountsSelected))
    },
    isCheck() {
      return !!(
        this.currentInvoiceData?.checker && this.currentInvoiceData.checkDate
      )
    },
    attachmentNames() {
      const attachments = this.dataInvoice?.attachments || []
      return attachments
        .filter((item) => item)
        .map((item) => `${item.fileName} ${item.fileType}`)
        .join(' ; ')
    },
    finalListCustomerNames() {
      return this.listCustomers.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
      }))
    },
  },
  watch: {
    dataInvoice: {
      deep: true,
      handler(data) {
        this.currentInvoiceData = data
        this.$emit('update-table', data)
      },
    },
    listDetails: {
      deep: true,
      handler(data) {
        this.currentListDetails = data
      },
    },
    currentInvoiceData: {
      deep: true,
      immediate: true,
      handler(data) {
        this.$emit('update-data', data)
      },
    },
    'currentInvoiceData.customerId': {
      handler(v) {
        ++this.firstLoadCustomer
      },
    },
    'currentInvoiceData.warehouseId': {
      handler(value) {
        this.$emit('update-warehouse', value)
      },
    },
  },
  async created() {
    await Promise.all([
      await this.getPaymentTypeOptionsFromAPI(this.lang),
      await this.getCurrencyOptions(this.lang),
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
    updateCurrentInvoiceData({ path, data }) {
      this.currentInvoiceData[path] = data
    },
    makeDateFormatHyphen(datetime) {
      return datetime ? dateFormatHyphen(new Date(datetime)) : ''
    },

    mapWarehouse({ warehouseId }) {
      const mappedWarehouse = this.warehouseOptions.filter(
        (item) => item.value === warehouseId
      )

      const updatedDetails = this.currentListDetails.map((item) =>
        Object.assign({}, item, {
          warehouseId: mappedWarehouse[0]?.value || 0,
        })
      )
      this.$bus.$emit('update-invoice-selected-details', updatedDetails)
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
@import '@/assets/vue-auto-complete.scss';
</style>
<style lang="scss" scoped>
.table-item-container {
  cursor: pointer;

  &:hover {
    background: #d4e7f5;
  }
}
.table-item-container:nth-child(even) {
  background-color: #f6fbfe;
}
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
    }
    td.label {
      padding: 2px;
    }
    td.input {
      padding: 2px;
      .select {
        font-size: 12px;
        border: 1px solid #aaa;
        border-radius: 2px;
      }
      textarea {
        border: 1px solid #aaa;
        border-radius: 2px;
      }
      .number {
        text-align: right;
      }
      .input-date-invoice {
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

input {
  font-size: 12px;
}

input[type='checkbox'] {
  height: 12px !important;
}

label {
  font-size: 12px !important;
}

.bi-calendar {
  font-size: 100% !important;
}
</style>

<style lang="scss">
.bi-calendar {
  font-size: 100% !important;
}

.add-form {
  .form-control {
    font-size: 12px !important;
  }
}
</style>
