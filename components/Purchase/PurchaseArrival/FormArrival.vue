<template>
  <div :key="refreshKey" class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_ReceiptNo_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.receiptNO" v-auto-focus type="text" disabled />
          </td>
          <td class=""></td>

          <td class="label">
            <span id="OrderDate">{{ $t('lbl_ReceiptDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              :value="form.receiptDate"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @input="changeOrderDate"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_Receiver_0') }}</span>
          </td>
          <td class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.receiverID"
              :initial-text="form.receiver"
              :items="listEmployeeName"
              :disable-input="isDisabled"
              @change="(event) => changeReceiver(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_SupplierName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.supplierID"
              :initial-text="form.supplierName"
              :items="listSupplier"
              :disable-input="isDisabled"
              @change="(event) => changeCustomer(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span>{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editUser" type="text" disabled />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span id="CustomerName">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <input v-model="form.memo" type="text" :disabled="isDisabled" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editDate" disabled type="text" />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span>{{ $t('lbl_Checker_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checker" type="text" disabled />
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
              :value="makeFormatNumberWithCommas(form.totalQuantity)"
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
          <td class="label">
            <span id="WarehouseID">{{ $t('lbl_Warehouse_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.warehouseID"
              :options="warehouseOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
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
import dateTime from '@/mixins/dateTime'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
import { formatNumberWithCommas } from '@/utils/utils'
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
      form: this.data,
      listSupplierName: [],
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
      refreshKey: Math.random() * 100000,
    }
  },
  fetch() {
    Promise.all([
      this.getWarehouseOptions(this.lang),
      this.getListSupplier(),
      this.getListEmployee(),
    ])
  },
  computed: {
    ...mapGetters('base', {
      warehouseOptions: 'getWarehouseOptions',
      employeeList: 'getEmployeeOptions',
    }),
    listSupplier() {
      return this.listSupplierName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
      }))
    },
    listEmployeeName() {
      const result = []

      for (const key in this.employeeList) {
        const employeeValue = this.employeeList[key] || ''
        const lastIndexOfOpenParent = employeeValue.lastIndexOf('(') || 0

        const appendText = employeeValue.substring(lastIndexOfOpenParent)
        const responsibleManValue = employeeValue.substring(
          0,
          lastIndexOfOpenParent
        )

        result.push({
          text: responsibleManValue,
          value: Number(key),
          appendText,
        })
      }

      return result
    },
  },
  watch: {
    data: {
      handler(value) {
        this.form = value
      },
      deep: true,
    },
    form: {
      handler(value) {
        const convertDateTillSecondFields = ['checkDate', 'editDate']
        for (const key of convertDateTillSecondFields) {
          this.form[key] = this.convertDate(value[key])
        }
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions({
      getWarehouseOptions: 'base/getWarehouseOptions',
      getListEmployee: 'base/getListEmployee',
    }),
    makeFormatNumberWithCommas(number) {
      return formatNumberWithCommas(number)
    },
    changeReceiver(value) {
      this.form.receiver = value.text
    },
    changeCustomer(select) {
      this.form.supplierID = select?.value
      const result = this.listSupplierName.find(
        (item) => item.id === select?.value
      )
      this.form.supplierName = result?.companyName
      this.form.currencyId = this.form.currencyId ?? Number(result?.currencyID)
      this.form.paymentId = this.form.paymentId ?? Number(result?.paymentID)

      this.$forceUpdate()
    },
    async getListSupplier() {
      const response = await api('getSupplierName')
      this.listSupplierName = response.data
    },
    changeOrderDate(value) {
      this.form.receiptDate = this.convertDate(value)
    },
    refreshFormData() {
      ++this.refreshKey
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
