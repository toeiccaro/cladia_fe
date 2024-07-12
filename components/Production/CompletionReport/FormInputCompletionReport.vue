<template>
  <div class="add-form-completion-report">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span id="OrderNO">{{ $t('lbl_OrderNO_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.orderNo"
              v-auto-focus
              name="txtOrderNumber"
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
              v-model="form.orderDate"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__orderDate',
              }"
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__orderDate"
              :highlighted="highlighted"
              typeable
            ></datepicker>
          </td>
          <td class="info">*</td>
          <td class="label">
            <span id="Responsible">{{ $t('lbl_Responsible_0') }}</span>
          </td>
          <td class="input">
            <BaseTypeaheadAutocomplete
              :initial-value="form.responsibleID"
              :initial-text="form.responsible"
              :items="listEmployeeName"
              :disable-input="isDisabled"
              @change="(event) => changeResponsible(event)"
            >
            </BaseTypeaheadAutocomplete>
          </td>
          <td class="info"></td>
        </tr>

        <!-- <tr>
          <td class="label">
            <span id="ItemCode">{{ $t('lbl_ItemCode_0') }}</span>
          </td>
          <td class="input">
            <BaseTypeaheadAutocomplete
              :initial-value="form.itemID"
              :initial-text="form.itemName"
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
          <td class="info"></td>


          <td class="label">
            <span id="Unit">{{ $t('lbl_UnitID_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.unitID"
              :options="unitOptions"
              class="select"
              :disabled="isDisabled"
            />
          </td>
          <td class="info">*</td>
        </tr> -->

        <tr>
          <td class="label">
            <span>{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editUser" type="text" disabled />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editDate" disabled type="text" />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_IsBad_0') }}</span>
          </td>
          <td class="input center">
            <input
              v-model="form.isBad"
              type="checkbox"
              class="checkbox"
              name="isBadCheck"
              :disabled="isDisabled"
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
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_TotalQty_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="totalQuantity"
              type="text"
              class="number"
              disabled
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr>
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td class="input" colspan="4">
            <input
              v-model="form.memo"
              name="Memo"
              type="text"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_WarehouseSource_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              v-model="form.warehouseFromID"
              :options="warehouseOptions"
              class="select"
              :disabled="isDisabled"
            ></b-form-select>
          </td>
          <td class="info"></td>
        </tr>

        <tr>
          <td class="label">
            <span id="Attachments">{{ $t('lbl_Attachments_0') }}</span>
          </td>
          <td colspan="4" class="input">
            <input
              v-model="form.attachments"
              name="Attachments"
              type="text"
              disabled
            />
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
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import { formatNumberWithCommas } from '@/utils/utils'
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
    listItemCode: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: this.data,
      listEmployee: [],
      highlighted: {
        dates: [new Date()],
      },
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    this.form.deliveryAddress = this.showUserInformation?.companyName
    await Promise.all([
      this.getCurrencyOptions(this.lang),
      this.getEmployeeList(),
      await this.getWarehouseOptions(this.lang),
    ])
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
    listEmployeeName() {
      const result = []

      for (const key in this.listEmployee) {
        const employeeValue = this.listEmployee[key] || ''
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
    totalQuantity() {
      return formatNumberWithCommas(this.form.quantity)
    },
  },
  watch: {
    data: {
      handler(value) {
        this.form = value
      },
      deep: true,
    },
    'form.warehouseFromID': {
      handler(value) {
        this.$emit('update-warehouse', {
          key: 'warehouseFromID',
          value,
        })
      },
    },
    'form.warehouseToID': {
      handler(value) {
        this.$emit('update-warehouse', {
          key: 'warehouseToID',
          value,
        })
      },
    },
    'form.isBad': {
      handler(value) {
        this.$emit('update-warehouse', {
          key: 'isBad',
          value,
        })
      },
    },
  },

  methods: {
    ...mapActions('base', ['getWarehouseOptions', 'getCurrencyOptions']),
    async getEmployeeList() {
      const response = await api('getEmployeeList')
      this.listEmployee = response?.data
    },
    refresh() {
      this.$forceUpdate()
    },

    changeResponsible(select) {
      this.form.responsible = select?.text
      this.form.responsibleID = select?.value
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

.add-form-completion-report {
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

.center {
  display: flex;
  justify-content: center;
  width: 100% !important;

  .checkbox {
    width: 14px;
    height: 14px;
  }
}
</style>
