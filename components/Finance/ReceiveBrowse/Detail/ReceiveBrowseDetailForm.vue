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
              :value="form.orderNumber"
              disabled
              name="txtOrderNumber"
              type="text"
              required
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="OrderDate">{{ $t('lbl_InvoiceNo_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.invoiceNO"
              name="txtInvoiceNo"
              type="text"
              required
              disabled
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="ReceiveDate">{{ $t('lbl_ReceiveBrowseDate_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.receiveDate"
              name="txtReceiveDate"
              type="text"
              required
              disabled
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_CustomerName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <b-form-input
              v-model="form.customerName"
              name="txtCustomerName"
              type="text"
              required
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Currency">{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.currencyID"
              :options="currencyOptions"
              disabled
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-3">
          <td class="label">
            <span id="TotalAmount">{{ $t('lbl_TotalAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="form.totalAmount"
              name="TotalAmount"
              type="text"
              class="number"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="Amount">{{ $t('lbl_AmountReceiveBrowse_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="form.amount"
              name="Amount"
              type="text"
              class="number"
              disabled
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="ResponsibleMan">{{ $t('lbl_ResponsibleMan_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.responsibleMan"
              disabled
              name="txtTaxRate"
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr class="tr-4">
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <b-form-input
              v-model="form.memo"
              disabled
              name="Memo"
              type="text"
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
import systemMixins from '@/mixins/system'
import datetimeMixins from '@/mixins/dateTime'
import { formatNumberWithCommas } from '@/utils/utils'

export default {
  mixins: [datetimeMixins, systemMixins],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      form: {},
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters('base', {
      currencyOptions: 'getCurrencyOptions',
    }),
  },
  watch: {
    data: {
      handler(value) {
        this.form = value
      },
      deep: true,
    },
  },
  async created() {
    await this.getCurrencyOptions(this.lang)
  },
  methods: {
    ...mapActions('base', ['getCurrencyOptions']),

    makeFormatNumberWithCommas(number) {
      return formatNumberWithCommas(number)
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
@import '@/assets/vue-auto-complete.scss';
</style>
<style lang="scss" scoped>
.add-form {
  font-size: 12px;
  margin: 0px 1px;
  padding: 4px 32px 4px 4px;
  background: #ebeff6;
  color: #222;
  .form-control {
    font-size: 12px !important;
  }
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
.input__autocomplete input:first-child {
  margin-bottom: 0 !important;
}
</style>
