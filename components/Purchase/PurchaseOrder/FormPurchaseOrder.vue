<template>
  <div class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="OrderNumber">{{ $t('lbl_PONO_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.pono"
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
            <span>{{ $t('lbl_Department_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.departID"
              :options="departmentOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_SupplierName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <BaseTypeaheadAutocomplete
              v-model="form.supplierID"
              :initial-value="form.supplierID"
              :initial-text="form.supplierName"
              :items="listSupplier"
              :disable-input="isDisabled"
              @change="(event) => changeCustomer(event)"
              @text-change="(event) => resetCustomerBindingData(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span>{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.currencyID"
              :options="currencyOptions"
              class="select"
              :disabled="isDisabled"
            />
          </td>
          <td class="info">*</td>
        </tr>
        <tr>
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_ArrivalAddress_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.arrivalAddress"
              :initial-text="form.arrivalAddress"
              :items="listArrivalAddresses"
              :disable-input="isDisabled"
              :disable-search="isDisableSearchAddress"
              @change="(event) => changeArrivalAddress(event)"
              @text-change="(event) => changeArrivalAddressText(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_TaxRate_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.taxRate"
              type="text"
              class="number"
              oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <input
              v-model="form.memo"
              name="Memo"
              type="text"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_TotalAmount_0') }}</span>
          </td>
          <td class="input">
            <input v-model="totalAmount" disabled type="text" class="number" />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr class="tr-4">
          <td class="label">
            <span>{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editUser" type="text" disabled />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editDate" disabled type="text" />
          </td>
          <td class="info">&nbsp;</td>
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
              v-model="form.attachments"
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
import { formatNumberWithCommas } from '@/utils/utils'
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
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
      isDisableSearchAddress: true,
    }
  },
  async fetch() {
    await Promise.all([
      this.getDepartmentOptionsFromAPI(this.lang),
      this.getCurrencyOptions(this.lang),
      this.getListSupplier(),
    ])
  },
  computed: {
    ...mapGetters('base', {
      departmentOptions: 'getDepartmentOptions',
      currencyOptions: 'getCurrencyOptions',
    }),
    listArrivalAddresses() {
      return this.arrivalAddresses.map((item) => ({
        text: item.companyName,
        value: item.companyName,
      }))
    },
    listSupplier() {
      return this.listSupplierName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
      }))
    },
    totalAmount() {
      return formatNumberWithCommas(this.form.totalAmount)
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

  methods: {
    ...mapActions({
      getCurrencyOptions: 'base/getCurrencyOptions',
      getDepartmentOptionsFromAPI: 'base/getDepartmentOptionsFromAPI',
    }),

    resetCustomerBindingData(select) {
      if (!select) {
        this.form = Object.assign(this.form, {
          supplierID: '',
          supplierName: '',
          currencyID: '',
        })
        this.$forceUpdate()
      }
    },
    changeCustomer(select) {
      this.form.supplierID = select?.value
      const result = this.listSupplierName.find(
        (item) => item.id === select?.value
      )
      this.form.supplierName = result?.companyName
      this.form.currencyID = result?.currencyID
        ? Number(result?.currencyID)
        : ''
      this.$forceUpdate()
    },
    changeArrivalAddress(data) {
      this.form.arrivalAddress = data.value || data
      this.isDisableSearchAddress = true
    },
    changeArrivalAddressText(data) {
      this.changeArrivalAddress(data)
      this.isDisableSearchAddress = false
    },
    async getListSupplier() {
      const response = await api('getSupplierName')
      this.listSupplierName = response.data
    },
    changeOrderDate(value) {
      this.form.orderDate = this.convertDate(value)
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
