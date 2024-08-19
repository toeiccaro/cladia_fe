<template>
  <div class="form__composite">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span id="TotalAmount">{{ $t('lbl_TotalAmount_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              :value="calculatedTotalAmount"
              disabled
              name="txtTotalAmount"
              type="text"
              required
              class="text-right"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span id="ARUser">{{ $t('lbl_ARUser_0') }}</span>
          </td>
          <td class="input position-relative">
            <BaseTypeaheadAutocomplete
              v-model="compositeData.user"
              :items="listEmployeeName"
            />
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-3">
          <td class="label">
            <span id="Date">{{ $t('lbl_Date_0') }}</span>
          </td>
          <td class="input position-relative">
            <datepicker
              v-model="compositeData.date"
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__date',
              }"
              typeable
              class="input-date"
              format="yyyy-MM-dd"
              input-class="input__date"
              :highlighted="highlighted"
            ></datepicker>
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-4">
          <td class="label">
            <span id="Memo">{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="compositeData.memo"
              name="txtMemo"
              type="text"
              required
            />
          </td>
          <td class="info"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete'
import { formatNumberWithCommas } from '@/utils/utils'

export default {
  components: {
    BaseTypeaheadAutocomplete,
  },
  props: {
    selectedItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      highlighted: {
        dates: [new Date()],
      },
      compositeData: {
        date: new Date(),
      },
      listEmployee: [],
      listFieldRequired: {
        user: 'ARUser',
        date: 'Date',
      },
    }
  },
  async fetch() {
    try {
      await this.getListEmployee()
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    checkRequired() {
      return this.compositeData.user && this.compositeData.date
    },
    calculatedTotalAmount() {
      const amounts = this.selectedItems
        .filter((item) => !item.isStop)
        .map((item) => item.amount)

      const arAmounts = this.selectedItems
        .filter((item) => !item.isStop)
        .map((item) => item.aramount)

      const totalAmount = amounts.reduce(
        (partialSum, num) => partialSum + parseFloat(num),
        0
      )

      const totalArAmount = arAmounts.reduce(
        (partialSum, num) => partialSum + parseFloat(num),
        0
      )
      const total = totalAmount - totalArAmount

      if (total < 0) {
        return 0
      }

      return formatNumberWithCommas(total)
    },

    listEmployeeName() {
      const result = []

      for (const key in this.listEmployee) {
        const employeeValue = this.listEmployee[key] || ''
        const lastIndexOfOpenParenthese = employeeValue.lastIndexOf('(') || 0

        const appendText = employeeValue.substring(lastIndexOfOpenParenthese)
        const employeeCode = employeeValue.substring(
          0,
          lastIndexOfOpenParenthese
        )

        result.push({
          text: employeeCode,
          value: employeeCode,
          appendText,
        })
      }
      return result
    },
  },
  methods: {
    async getListEmployee() {
      const res = await api('getEmployeeList')
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.listEmployee = res.data || {}
      }
    },

    async save() {
      try {
        if (this.checkRequired) {
          const checkedItems = this.selectedItems?.filter((item) => item.value)
          const checkedIds = checkedItems.map((item) => item.id)

          const apiPayload = Object.assign(
            {},
            {
              ...this.compositeData,
              language: this.$i18n.locale,
              ids: checkedIds,
            }
          )
          const res = await api('receiveBrowseBatchCollection', apiPayload)
          const listErrorMessage = []
          this.$emit('validation-errors', listErrorMessage)
          return res
        } else {
          const listErrorMessage = []
          for (const prop in this.listFieldRequired) {
            if (!this.compositeData[prop]) {
              listErrorMessage.push({
                fieldName: this.$t(`lbl_${this.listFieldRequired[prop]}_0`),
                text: this.$t('msg_NoInput_0'),
              })
            }
          }

          this.$emit('validation-errors', listErrorMessage)
        }
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
@import '@/assets/vue-auto-complete.scss';
</style>
<style lang="scss" scoped>
.form__composite {
  font-size: 12px;
  margin: 0px 1px;
  padding: 4px 32px 4px 4px;
  background: #ebeff6;
  color: #222;
  .form-control {
    font-size: 12px !important;
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

label {
  font-size: 12px !important;
}
</style>
