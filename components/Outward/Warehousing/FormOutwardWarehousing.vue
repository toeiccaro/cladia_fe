<template>
  <div :key="refreshKey" class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.orderNo" v-auto-focus type="text" disabled />
          </td>
          <td class=""></td>

          <td class="label">
            <span>{{ $t('lbl_OrderDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="form.orderDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_Responsible_0') }}</span>
          </td>
          <td class="input">
            <BaseTypeaheadAutocomplete
              :initial-value="form.responsibleID"
              :initial-text="form.responsible"
              :items="listEmployee"
              :disable-input="isDisabled"
              @change="(event) => changeResponsible(event)"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span>{{ $t('lbl_SupplierName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.supplierID"
              :initial-text="form.supplierName"
              :items="listSupplierNameFormatted"
              :disable-input="isDisabled"
              @change="(event) => changeSupplier(event)"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_SupplierResponsible_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.supplierResponsible"
              type="text"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_ItemCode_0') }}</span>
          </td>
          <td class="input">
            <BaseTypeaheadAutocomplete
              :initial-value="form.itemID"
              :initial-text="form.itemCode"
              :items="listItemCodeFormatted"
              :disable-input="isDisabled"
              @change="(event) => changeItemCode(event)"
            />
          </td>
          <td class="info">*</td>

          <td class="label">
            <span>{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.itemName" type="text" disabled />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_UnitID_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.unitID"
              :options="unitOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_DeliveryNote_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.deliveryNote"
              type="text"
              :disabled="isDisabled"
            />
          </td>
          <td class=""></td>

          <td class="label">
            <span>{{ $t('lbl_Currency_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.currencyID"
              :options="currencyOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Quantity_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.quantity"
              type="text"
              class="text-right"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
              :disabled="isDisabled"
            />
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span>{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <input v-model="form.memo" type="text" :disabled="isDisabled" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Price_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.price"
              type="text"
              class="text-right"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
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
            <span>{{ $t('lbl_Amount_0') }}</span>
          </td>
          <td class="input d-flex justify-center w-100">
            <input
              v-model="calculateAmount"
              type="text"
              class="text-right"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
              disabled
            />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
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
            <span>{{ $t('lbl_WarehouseIN_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.warehouseIn"
              :options="warehouseOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-7">
          <td class="label">
            <span>{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <input v-model="form.attachmentList" type="text" disabled />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_WarehouseOut_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.warehouseOut"
              :options="warehouseOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { SUPPLIER_COMPANY_TYPE } from '~/constants'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import { formatNumberWithCommas } from '@/utils/utils'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
export default {
  name: 'FormOutwardWarehousing',
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
    listItemCode: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: {},
      lang: this.$i18n.locale,
      highlighted: {
        dates: [new Date()],
      },
      listSupplierName: [],
      refreshKey: Math.random() * 100000,
    }
  },
  async fetch() {
    try {
      await Promise.all([
        this.getListSupplier({
          companyType: SUPPLIER_COMPANY_TYPE.OUTWARD,
        }),
        this.getListEmployee(),
        this.getCurrencyOptions(this.lang),
      ])
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters('base', {
      currencyOptions: 'getCurrencyOptions',
      warehouseOptions: 'getWarehouseOptions',
      unitOptions: 'getUnitOptions',
      employeeList: 'getEmployeeOptions',
    }),
    listItemCodeFormatted() {
      return this.listItemCode?.map((item) => ({
        text: item.key,
        value: item.itemId,
        appendText: item.itemName ? `(${item.itemName})` : '',
        ...item,
      }))
    },
    listSupplierNameFormatted() {
      return this.listSupplierName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
      }))
    },
    listEmployee() {
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
    calculateAmount(){
      return formatNumberWithCommas(this.form.amount)
    }
  },
  watch: {
    data: {
      handler(value) {
        this.form = value
        this.form.amount = formatNumberWithCommas(value.amount)
        this.form.price = formatNumberWithCommas(value.price)
        this.form.quantity = formatNumberWithCommas(value.quantity)
      },
      deep: true,
      immediate: true,
    },
    'form.warehouseOut': {
      handler(value) {
        const validData = value !== null && value !== undefined
        validData &&
          this.$emit('update-warehouse', {
            key: 'warehouseOut',
            value,
          })
      },
    },
  },
  methods: {
    ...mapActions({
      getCurrencyOptions: 'base/getCurrencyOptions',
      getListEmployee: 'base/getListEmployee',
    }),
    async getListSupplier() {
      const response = await api('getListCompanyByCondition', {
        companyType: 'Outward',
      })

      this.listSupplierName = response.data
    },
    changeItemCode(select) {
      this.form.itemName = select?.itemName
      this.form.itemID = select?.itemId
      this.form.unitID = select?.unitID
      this.form.wpoId = null
      this.form.wpono = null

      this.refresh()
    },
    changeResponsible(select) {
      this.form.responsible = select?.text
      this.form.responsibleID = Number(select?.value)

      this.refresh()
    },
    changeSupplier(select) {
      const supplier = this.listSupplierName.find(
        (item) => item.id === select?.value
      )

      this.form.supplierName = supplier?.companyName
      this.form.supplierID = supplier?.id
      this.form.currencyID = supplier?.currencyID
      this.form.supplierResponsible =
        supplier?.responsibleMan || supplier?.companyName

      this.refresh()
    },
    refresh() {
      this.$forceUpdate()
    },
    resetForm() {
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
.checkbox {
  width: 14px !important;
  height: 14px !important;
}
</style>
