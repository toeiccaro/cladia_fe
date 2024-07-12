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
            <span>{{ $t('lbl_ResponsibleMan_0') }}</span>
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
            <span>{{ $t('lbl_CustomerName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <BaseTypeaheadAutocomplete
              :initial-value="form.customerID"
              :initial-text="form.customerName"
              :items="listSupplierName"
              :disable-input="isDisabled"
              @change="(event) => changeSupplier(event)"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_SONO_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.sono" type="text" disabled />
          </td>
          <td class="info">&nbsp;</td>
        </tr>

        <tr class="tr-4">
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
            <span>{{ $t('lbl_ProductionQuantity_0') }}</span>
          </td>
          <td class="input d-flex justify-center w-100">
            <input
              v-model="form.quantity"
              :disabled="isDisabled"
              type="text"
              class="text-right"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
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

        <tr class="tr-4">
          <td class="label">
            <span>{{ $t('lbl_ItemType_0') }}</span>
          </td>
          <td class="input d-flex justify-center w-100">
            <b-form-select
              v-model="form.itemTypeID"
              :options="itemTypeOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.itemName" disabled type="text" />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editDate" disabled type="text" />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_PromiseDateOrder_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="form.promiseDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
              @selected="changePromiseDate"
            ></datepicker>
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ProductionStartDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="form.startDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              typeable
              format="yyyy-MM-dd"
              disabled
              input-class="input__orderDate"
              :highlighted="highlighted"
              @selected="changeStartDate"
            ></datepicker>
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Checker_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkUser" type="text" disabled />
          </td>
          <td class="info"></td>
        </tr>
        <tr>
          <td class="label">
            <span>{{ $t('lbl_Memo_0') }}</span>
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
            <span>{{ $t('lbl_CheckDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkDate" type="text" disabled />
          </td>
          <td class="info">&nbsp;</td>
        </tr>
        <tr class="tr-7">
          <td class="label">
            <span>{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input">
            <input v-model="form.attachments" type="text" disabled />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_WarehouseDestination_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.warehouseToID"
              :options="warehouseOptions"
              class="select"
              :disabled="isDisabled"
              @change="onChangeShipmentTo"
            ></b-form-select>
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
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'
export default {
  name: 'FormOutwardDelivery',
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
      listAllCustomerName: [],
      listItemMaster: [],
      refreshKey: Math.random() * 100000,
    }
  },
  async fetch() {
    try {
      await Promise.all([
        this.getListSupplier(),
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
      employeeList: 'getEmployeeOptions',
      getItemTypeOptions: 'getItemTypeOptions',
    }),

    listSupplierName() {
      return this.listAllCustomerName.map((item) => ({
        text: item.companyName,
        value: item.id,
        appendText: `(${item.companyCode})`,
      }))
    },

    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
    },
    listItemCodeFormatted() {
      return this.listItemCode?.map((item) => ({
        text: item.key,
        value: item.itemId,
        appendText: item.itemName ? `(${item.itemName})` : '',
        ...item,
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
  },
  watch: {
    data: {
      handler(value) {
        this.form = value
      },
      deep: true,
      immediate: true,
    },
    'form.warehouseToID': {
      handler(value) {
        this.$emit('update-shipment', {
          key: 'warehouseToID',
          value,
        })
      },
    },
    'form.shipmentFromID': {
      handler(value) {
        this.$emit('update-shipment', {
          key: 'shipmentFromID',
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
      const response = await api('getEnterpriseCustomerNames')
      this.listAllCustomerName = response.data
    },

    onChangeShipmentTo() {
      this.$emit('update-shipment-to', this.form)
    },

    changeSupplier(select) {
      const supplier = this.listAllCustomerName.find(
        (item) => item.id === select?.value
      )

      this.form.customerName = supplier?.companyName
      this.form.customerID = supplier?.id
      this.refresh()
    },
    changeResponsible(select) {
      this.form.responsible = select?.text
      this.form.responsibleID = select?.value
    },
    changeItemCode(select) {
      if (this.form.itemID !== select?.itemId) {
        this.$emit('change-item-code', true)
      }
      this.form.itemCode = select?.key
      this.form.itemName = select?.itemName
      this.form.unitID = select?.unitID
      this.form.itemID = select?.itemId
      this.form.itemTypeID = select?.itemTypeID
      this.refresh()
    },
    refresh() {
      this.$forceUpdate()
    },
    changePromiseDate(value) {
      this.form.promiseDate = this.convertDate(value)
    },
    changeStartDate(value) {
      this.form.startDate = this.convertDate(value)
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
