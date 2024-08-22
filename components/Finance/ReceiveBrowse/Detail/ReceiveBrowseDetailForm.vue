<template>
  <div class="add-form">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="orderNumber">{{ $t('lbl_RBOrderNumber_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="form.RBOrderNumber"
              disabled
              name="txtOrderNumber"
              type="text"
              required
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="subject">{{ $t('lbl_RBSubject_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="currentSubject"
              disabled
              name="txtSubject"
              type="text"
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="opponentSubjectId">{{ $t('lbl_RBOpponentSubjectId_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.RBOpponentSubjectId"
              :options="listCurrentAssets"
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span id="customerName">{{ $t('lbl_CustomerName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <b-form-select
              v-model="form.RBCustomerId"
              :options="itemCustomerNameList"
              disabled
              class="select"
            ></b-form-select>
            
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="currency">{{ $t('lbl_RBCurrency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.RBCurrencyId"
              :options="currencyOptions"
              disabled
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-3">
          <td class="label">
            <span id="totalAmount">{{ $t('lbl_RBTotalAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="form.RBTotalAmount"
              name="txtTotalAmount"
              type="text"
              class="number"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="balanceAmount">{{ $t('lbl_RBBalanceAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="form.RBBalanceAmount"
              name="txtBalanceAmount"
              type="text"
              class="number"
              disabled
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="actualAmount">{{ $t('lbl_RBActualAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.RBActualAmount"
              disabled
              name="txtActualAmount"
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
              v-model="form.RBMemo"
              disabled
              name="Memo"
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="otherExpensesAmount">{{ $t('lbl_RBOtherExpensesAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.RBOtherExpensesAmount"
              disabled
              name="txtOtherExpensesAmount"
              type="text"
            />
          </td>
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
      listAccountingItems: "getListAccountingItems",
      listCurrentAssets: "getListCurrentAssets",
      customerNameList: "getCustomerNameList"
    }),

    itemCustomerNameList() {
      return this.customerNameList.map((item) => ({
        text: item.companyName,
        value: item.id,
      }))
    },

    currentSubject() {
      return this.$t('lbl_RBRevenue_0');
    },
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
    await this.getCurrencyOptions(this.lang),
    await this.getListAccountingItems(this.lang),
    await this.getListCurrentAssets(this.lang)
    await this.getListCustomerName()
  },
  methods: {
    ...mapActions('base', [
      'getCurrencyOptions',
      'getListAccountingItems',
      'getListCurrentAssets',
      'getListCustomerName'
    ]),

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
