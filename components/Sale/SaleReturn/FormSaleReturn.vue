<template>
  <div class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="OrderNumber">{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.rtNO"
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
              :value="form.rtDate"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeRtDate"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_Warehouse_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.warehouseID"
              :options="warehouseOptions"
              class="select"
              :disabled="isDisabled"
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
              :initial-value="form.customerID"
              :initial-text="form.customerName"
              :items="listCustomerName"
              :disable-input="isDisabled"
              @change="(event) => changeCustomer(event)"
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
          <td class="info"></td>
        </tr>
        <tr>
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
            <span>{{ $t('lbl_Reason_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.reason" type="text" :disabled="isDisabled" />
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
            <span id="CheckAccount">{{ $t('lbl_IsCheckAccount_0') }}</span>
          </td>
          <td class="input d-flex justify-center w-100">
            <input
              type="checkbox"
              class="checkbox"
              disabled
              :checked="form.checkAccount"
            />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-5">
          <td class="label">
            <span>{{ $t('lbl_Checker_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkUser" type="text" disabled />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkDate" type="text" disabled />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_TotalQty_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.totalQuantity"
              disabled
              type="text"
              class="number"
            />
          </td>
          <td class="info">&nbsp;</td>
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
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import dateTime from '@/mixins/dateTime'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
export default {
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
      form: {},
      lang: this.$i18n.locale,
      highlighted: {
        dates: [new Date()],
      },
    }
  },
  computed: {
    ...mapGetters('base', {
      listAllCustomerName: 'getCustomerNameList',
      currencyOptions: 'getCurrencyOptions',
      warehouseOptions: 'getWarehouseOptions',
    }),
    listCustomerName() {
      return this.listAllCustomerName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
      }))
    },
  },
  watch: {
    data: {
      handler(value) {
        this.form = value
        this.form.currencyID =
          this.currencyOptions?.find((item) => item.text === value.currency)
            ?.value || ''
      },
      deep: true,
      immediate: true,
    },
    'form.warehouseID': {
      handler(value) {
        this.$emit('update-warehouse', value)
      },
    },
  },
  async created() {
    await Promise.all([
      await this.getListCustomerName(),
      await this.getCurrencyOptions(this.lang),
    ])
  },
  methods: {
    ...mapActions({
      getCurrencyOptions: 'base/getCurrencyOptions',
      getListCustomerName: 'base/getListCustomerName',
    }),
    changeCustomer(select) {
      this.form.customerID = select?.value
      const result = this.listAllCustomerName.find(
        (item) => item.id === select?.value
      )
      this.form.customerName = result?.companyName

      const currencyName =
        this.currencyOptions?.find((item) => item.value === result?.currencyID)
          ?.text || ''
      this.form.currency = currencyName
      this.$forceUpdate()
    },
    changeRtDate(value) {
      this.form.rtDate = this.convertDate(value)
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
.checkbox {
  width: 14px !important;
  height: 14px !important;
}
</style>
