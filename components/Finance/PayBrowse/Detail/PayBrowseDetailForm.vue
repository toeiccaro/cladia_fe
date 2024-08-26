<template>
  <div class="add-form">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="orderNumber">{{ $t('lbl_PBOrderNumber_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="form.PBOrderNumber"
              disabled
              name="txtOrderNumber"
              type="text"
              required
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span id="subject">{{ $t('lbl_PBSubject_0') }}</span>
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
            <span id="opponentSubjectId">{{ $t('lbl_PBOpponentSubjectId_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.PBOpponentSubjectId"
              :options="listCurrentAssets"
              class="select"
            ></b-form-select>
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span id="supplierId">{{ $t('lbl_SupplierName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <b-form-input
              :value="finalListCustomerNames"
              name="txtSupplierId"
              type="text"
              class="text"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="currency">{{ $t('lbl_PBCurrency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.PBCurrencyId"
              :options="currencyOptions"
              disabled
              class="select"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-3">
          <td class="label">
            <span id="totalAmount">{{ $t('lbl_PBTotalAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="form.PBTotalAmount"
              name="txtTotalAmount"
              type="text"
              class="number"
              disabled
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="balanceAmount">{{ $t('lbl_PBBalanceAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="form.PBBalanceAmount"
              name="txtBalanceAmount"
              type="text"
              class="number"
              disabled
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="actualAmount">{{ $t('lbl_PBActualAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.PBActualAmount"
              disabled
              name="txtActualAmount"
              type="text"
              class="number"
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
              v-model="form.PBMemo"
              disabled
              name="Memo"
              type="text"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="otherExpensesAmount">{{ $t('lbl_PBOtherExpensesAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.PBOtherExpensesAmount"
              disabled
              name="txtOtherExpensesAmount"
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
import { mapActions, mapGetters } from 'vuex'
import api from '@/api/api'
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
      listCustomers: [],
      form: {},
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters('base', {
      currencyOptions: 'getCurrencyOptions',
      listAccountingItems: "getListAccountingItems",
      listCurrentAssets: "getListCurrentAssets",
    }),

    finalListCustomerNames() {
      const listCustomers = this.listCustomers.find((item) => item.id == Number(this.form.PBSupplierId));
      return listCustomers?.companyName
    },

    currentSubject() {
      return this.$t('lbl_PBPurchase_0');
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
    await this.getListSupplierNames()
  },
  methods: {
    ...mapActions('base', [
      'getCurrencyOptions',
      'getListAccountingItems',
      'getListCurrentAssets',
    ]),

    async getListSupplierNames() {
      const response = await api('getSupplierName')
      this.listCustomers = response.data
    },

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
