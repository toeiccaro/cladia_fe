<template>
  <div :key="refreshKey" class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-2">
          <td class="label">
            <span id="OrderNo">{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input position-relative">
            <b-form-input
              v-model="purchaseInvoiceData.orderNO"
              name="txtOrderNo"
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
              v-model="purchaseInvoiceData.orderDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              typeable
              class="input-date"
              format="yyyy-MM-dd"
              input-class="input__orderDate"
              :highlighted="highlighted"
              :disabled="isDisableInput"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="InvoiceCode">{{ $t('lbl_InvoiceCode_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="purchaseInvoiceData.invoiceCode"
              name="txtInvoiceCode"
              type="text"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr class="tr-2">
          <td class="label">
            <span id="CustomerCode">{{ $t('lbl_SupplierName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <BaseTypeaheadAutocomplete
              v-model="purchaseInvoiceData.supplierID"
              :items="finalListSuplierNames"
              :initial-text="purchaseInvoiceData.supplierName"
              :initial-value="purchaseInvoiceData.supplierID"
              @change="(event) => getCustomerDetail({ companyId: event.value })"
              :disable-input="isDisableInput"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="DueDate">{{ $t('lbl_DueDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="purchaseInvoiceData.dueDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__dueDate',
              }"
              typeable
              class="input-date"
              format="yyyy-MM-dd"
              input-class="input__dueDate"
              :highlighted="highlighted"
              :disabled="isDisableInput"
            ></datepicker>
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="PaymentID">{{ $t('lbl_PaymentID_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="purchaseInvoiceData.paymentID"
              :options="paymentOptions"
              class="select"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="purchaseInvoiceData.currencyID"
              :options="currencyOptions"
              class="select"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_ShareType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="purchaseInvoiceData.shareType"
              :options="shareTypeOptions"
              class="select"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="TotalTariff">{{ $t('lbl_TotalTariff_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="purchaseInvoiceData.totalTariff"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
              type="text"
              class="number"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="TotalOtherCost1">{{ $t('lbl_TotalOtherCost1_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="purchaseInvoiceData.totalOtherCost1"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
              type="text"
              class="number"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_TotalOtherCost2_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="purchaseInvoiceData.totalOtherCost2"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
              type="text"
              class="number"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="TotalOtherCost3">{{ $t('lbl_TotalOtherCost3_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="purchaseInvoiceData.totalOtherCost3"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
              type="text"
              class="number"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="TotalOtherCost4">{{ $t('lbl_TotalOtherCost4_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="purchaseInvoiceData.totalOtherCost4"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
              type="text"
              class="number"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_TotalOtherCost5_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="purchaseInvoiceData.totalOtherCost5"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
              type="text"
              class="number"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <input
              v-model="purchaseInvoiceData.memo"
              type="text"
              :disabled="isDisableInput"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="TotalAmount">{{ $t('lbl_TotalAmount_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="purchaseInvoiceData.totalAmount"
              disabled
              class="number"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="TotalShare">{{ $t('lbl_TotalShare_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="purchaseInvoiceData.totalShare"
              disabled
              class="number"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Diff">{{ $t('lbl_Diff_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="purchaseInvoiceData.diff"
              type="text"
              disabled
              class="number"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Checker_0') }}</span>
          </td>
          <td class="input">
            <input v-model="purchaseInvoiceData.checkUser" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="EditUser">{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input v-model="purchaseInvoiceData.editUser" disabled />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="EditDate">{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="purchaseInvoiceData.editDate" disabled />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="purchaseInvoiceData.checkDate" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span>{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input :value="attachmentNames" disabled />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'
import api from '@/api/api'
import commonOptionsMixins from '@/mixins/commonOptions'
export default {
  components: {
    BaseTypeaheadAutocomplete,
  },
  mixins: [commonOptionsMixins],
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      listCustomers: [],
      listItemMasters: [],
      highlighted: {
        dates: [new Date()],
      },
      purchaseInvoiceData: {},
      lang: this.$i18n.locale,
      refreshKey: Math.random() * 100000,
    }
  },
  async fetch() {
    try {
      await Promise.all([
        this.getListSupplierNames(),
        this.getCurrencyOptions(this.lang),
        this.getShareTypeOptions(this.lang),
        this.getPaymentTypeOptionsFromAPI(this.lang),
      ])
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters('base', {
      currencyOptions: 'getCurrencyOptions',
      paymentOptions: 'getPaymentTypeOptions',
      shareTypeOptions: 'getShareTypeOptions',
    }),
    attachmentNames() {
      const attachments = this.purchaseInvoiceData?.attachments || []
      return attachments
        .filter((item) => item)
        .map((item) => `${item.fileName} ${item.fileType}`)
        .join(' ; ')
    },
    isDisableInput() {
      return !!this.purchaseInvoiceData.checkUser
    },
    finalListSuplierNames() {
      return this.listCustomers.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
      }))
    },
  },
  watch: {
    data: {
      deep: true,
      handler(data) {
        this.purchaseInvoiceData = data
      },
    },
  },
  methods: {
    ...mapActions('base', [
      'getCurrencyOptions',
      'getShareTypeOptions',
      'getPaymentTypeOptionsFromAPI',
    ]),
    async getListSupplierNames() {
      const response = await api('getSupplierName')
      this.listCustomers = response.data
    },

    getCustomerDetail({ companyId }) {
      const customerDetail = this.listCustomers.find(
        (item) => item.id === companyId
      )

      if (!customerDetail) {
        return
      }

      const acceptedDetailFields = ['paymentID', 'companyName']
      const finalCustomerDetail = {}
      for (const field of acceptedDetailFields) {
        finalCustomerDetail[field] = customerDetail[field]
      }

      Object.assign(this.purchaseInvoiceData, finalCustomerDetail)
    },
    refreshFormData() {
      ++this.refreshKey
    },
    async resetFormData() {
      await this.$fetch()
      this.refreshFormData()
    },
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
