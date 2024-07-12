<template>
  <div :key="refreshKey" class="add-form-enterprise">
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_ProcessOrder_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.orderNo" disabled />
          </td>
          <td class=""></td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span>{{ $t('lbl_ProcessCode_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.processCode" disabled />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_ProcessName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <input v-model="form.processName" disabled />
          </td>
          <td class="info">*</td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span>{{ $t('lbl_ItemCode_0') }}</span>
          </td>
          <td class="input">
            <BaseTypeaheadAutocomplete
              :initial-value="form.itemId"
              :initial-text="form.itemCode"
              :items="listItemCodeFormatted"
              :disable-input="isDisabled"
              @change="(event) => changeItemCode(event)"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <input v-model="form.itemName" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_Production_Order_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.productionOrder" disabled />
          </td>
          <td class="info">*</td>

          <td class="label">
            <span>{{ $t('lbl_OrderQuantity_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.orderQuantity"
              disabled
              class="text-right"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info">*</td>
          <td class="label">
            <span>{{ $t('lbl_PossibleProductQty_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.possibleProductQty"
              disabled
              class="text-right"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_ScheduleStartDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="form.scheduleStartDate"
              format="yyyy-MM-dd"
              disabled
            ></datepicker>
          </td>
          <td class=""></td>

          <td class="label">
            <span>{{ $t('lbl_ScheduleEndDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-model="form.scheduleEndDate"
              format="yyyy-MM-dd"
              disabled
            ></datepicker>
          </td>
          <td class="info"></td>

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

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_ProcessingStartDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__startDate',
              }"
              :value="form.processingStartDate"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__startDate"
              :highlighted="highlighted"
              @selected="
                (event) =>
                  changeDate({ path: 'processingStartDate', value: event })
              "
              @input="calculateActualTime"
            ></datepicker>
          </td>
          <td class=""></td>

          <td class="label">
            <span>{{ $t('lbl_ProcessingEndDate_0') }}</span>
          </td>
          <td class="input">
            <datepicker
              v-only-date="{
                isAppendToChild: true,
                childClass: 'input__endDate',
              }"
              :value="form.processingEndDate"
              typeable
              format="yyyy-MM-dd"
              :disabled="isDisabled"
              input-class="input__endDate"
              :highlighted="highlighted"
              @selected="
                (event) =>
                  changeDate({ path: 'processingEndDate', value: event })
              "
              @input="calculateActualTime"
            ></datepicker>
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_SONO_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.sono" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_StartTime_0') }}</span>
          </td>
          <td class="input">
            <div class="d-flex">
              <input
                v-model="form.beginTime"
                :disabled="isDisabled"
                class="text-right"
                oninput="this.value = this.value.replace(/[^0-9:]/g, '').replace(/^:/g, '').replace(/(:.*):/g, '$1');"
                @input="calculateActualTime"
              />
              <div class="d-flex flex-column justify-center ml-1">
                <img
                  src="~/assets/icon/endturn.png"
                  alt="image"
                  :width="18"
                  :height="18"
                  class="cursor-pointer"
                  @click="setStartTime"
                />
              </div>
            </div>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span>{{ $t('lbl_BreakTime_0') }}</span>
          </td>
          <td class="input">
            <b-form-input
              v-model="form.breakTime"
              :disabled="isDisabled"
              class="text-right"
              oninput="this.value = this.value.replace(/[^0-9:]/g, '').replace(/^:/g, '').replace(/(:.*):/g, '$1');"
              @input="calculateActualTime"
            />
          </td>
          <td class="info"></td>

          <td class="label">
            <span>{{ $t('lbl_EditUser_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editUser" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_EndTime_0') }}</span>
          </td>
          <td class="input">
            <div class="d-flex">
              <input
                v-model="form.endTime"
                :disabled="isDisabled"
                class="text-right"
                oninput="this.value = this.value.replace(/[^0-9:]/g, '').replace(/^:/g, '').replace(/(:.*):/g, '$1');"
                @input="calculateActualTime"
              />
              <div class="d-flex flex-column justify-center ml-1">
                <img
                  src="~/assets/icon/exit.png"
                  alt="image"
                  :width="18"
                  :height="18"
                  class="cursor-pointer"
                  @click="setEndTime"
                />
              </div>
            </div>
          </td>
          <td class="info">*</td>

          <td class="label">
            <span>{{ $t('lbl_ActualTime_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.actualTime"
              :disabled="isDisabled"
              class="text-right"
              oninput="this.value = this.value.replace(/[^0-9:]/g, '').replace(/^:/g, '').replace(/(:.*):/g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_EditDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.editDate" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_GoodProductionQuantity_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.goodProductionQty"
              :disabled="isDisabled"
              class="text-right"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class=""></td>

          <td class="label">
            <span>{{ $t('lbl_DefectiveQuantity_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.defectiveQuantity"
              :disabled="isDisabled"
              class="text-right"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Checker_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkUser" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_DefectiveCause_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.failureReason" :disabled="isDisabled" />
          </td>
          <td class=""></td>

          <td class="label">
            <span>{{ $t('lbl_RemainQuantity_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="remainQuantity"
              disabled
              class="text-right"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckDate_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.checkDate" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-2">
          <td class="label">
            <span>{{ $t('lbl_NextProcessCode_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.nextProcessCode" disabled />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_NextProcessName_0') }}</span>
          </td>
          <td rows="1" colspan="4" class="input position-relative">
            <input v-model="form.nextProcessName" disabled />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_CustomerText1_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText1" :disabled="isDisabled" />
          </td>
          <td class=""></td>

          <td class="label">
            <span>{{ $t('lbl_NumberField1_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField1"
              :disabled="isDisabled"
              class="text-right"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox1_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.checkbox1"
              type="checkbox"
              class="checkbox"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_CustomerText2_0') }}</span>
          </td>
          <td class="input">
            <input v-model="form.customerText2" :disabled="isDisabled" />
          </td>
          <td class=""></td>

          <td class="label">
            <span>{{ $t('lbl_NumberField2_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.numberField2"
              :disabled="isDisabled"
              class="text-right"
              oninput="this.value = this.value.replace(/(?!^-)[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_CheckBox2_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.checkbox2"
              type="checkbox"
              class="checkbox"
              :disabled="isDisabled"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">{{ $t('lbl_Status_0') }}</td>
          <td class="input">
            <input :value="processStatus" disabled />
          </td>
          <td class="info"></td>
          <td class="label">
            <span>{{ $t('lbl_Finished_0') }}</span>
          </td>
          <td class="input">
            <input
              v-model="form.isFinished"
              type="checkbox"
              class="checkbox"
              :disabled="isDisabled || isProcessing"
            />
          </td>
          <td class="info"></td>
        </tr>

        <tr class="tr-1">
          <td class="label">
            <span>{{ $t('lbl_Memo_0') }}</span>
          </td>
          <td rows="1" colspan="7" class="input position-relative">
            <textarea
              v-model="form.memo"
              rows="2"
              cols="20"
              class="textarea"
              :disabled="isDisabled"
            ></textarea>
          </td>
          <td class=""></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import api from '@/api/api'
import { rangeOfHours } from '@/utils/utils'
import dateTime from '@/mixins/dateTime'
import BaseTypeaheadAutocomplete from '@/components/UI/BaseTypeaheadAutocomplete.vue'

export default {
  name: 'FormManufacturingProcess',
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
    status: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      form: {},
      lang: this.$i18n.locale,
      highlighted: {
        dates: [new Date()],
      },
      listItemCode: [],
      refreshKey: Math.random() * 100000,
    }
  },
  async fetch() {
    try {
      await Promise.all([this.getListEmployee(), this.getListItemCode()])
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters('base', {
      employeeList: 'getEmployeeOptions',
    }),
    remainQuantity() {
      return (
        this.form.orderQuantity -
        this.form.goodProductionQty -
        this.form.defectiveQuantity
      )
    },
    remainGoodQuantity() {
      return this.form.orderQuantity - this.form.goodProductionQty
    },
    processStatus() {
      switch (true) {
        case this.remainGoodQuantity === this.form.orderQuantity:
          return this.status.start?.text
        case this.remainGoodQuantity > 0 &&
          this.remainGoodQuantity < this.form.orderQuantity:
          return this.status.partial?.text
        case this.remainGoodQuantity <= 0:
          return this.status.completion?.text
        default:
          return this.status.start?.text
      }
    },
    isProcessing() {
      return this.processStatus !== this.status.completion?.text
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
    timeRange() {
      return rangeOfHours({ interval: 30 })
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
    isProcessing: {
      handler(value) {
        if (value) {
          this.$emit('processing', false)
        }
      },
    },
  },

  methods: {
    ...mapActions({
      getListEmployee: 'base/getListEmployee',
    }),
    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === 200
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },
    setStartTime() {
      const now = new Date()
      const hour = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours()
      const minute =
        now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes()

      this.form.beginTime = `${hour}:${minute}`
      this.form.processingStartDate = this.convertDate(now)
      this.resetForm()
      this.calculateActualTime()
    },
    setEndTime() {
      const now = new Date()
      const hour = now.getHours() < 10 ? `0${now.getHours()}` : now.getHours()
      const minute =
        now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes()

      this.form.endTime = `${hour}:${minute}`
      this.form.processingEndDate = this.convertDate(now)

      // !this.form.breakTime && (this.form.breakTime = '00:00')
      this.calculateActualTime()
      this.resetForm()
    },
    calculateActualTime() {
      try {
        const beginTime = new Date(
          `${this.convertDate(this.form.processingStartDate)} ${
            this.form.beginTime
          }`
        ).getTime()

        const endTime = new Date(
          `${this.convertDate(this.form.processingEndDate)} ${
            this.form.endTime
          }`
        ).getTime()
        const breakTime = this.form.breakTime
          ? this.form.breakTime
              ?.replace(/[^0-9:]/g, '')
              .replace(/^:/g, '')
              .replace(/(:.*):/g, '$1')
              .split(':')
          : '00:00'

        const invalidData = this.isInvalidComputeData({
          beginTime,
          endTime,
          breakTime,
        })

        if (invalidData) {
          return this.setActualTime()
        }

        const totalBreakHour = Number(breakTime[0]) + Number(breakTime[1]) / 60
        const totalWorkHour = (endTime - beginTime) / (1000 * 60 * 60)

        const actualHour = totalWorkHour - totalBreakHour

        const parsedActualHour = Math.floor(actualHour)
        const parsedActualMinute = Math.round(
          (actualHour - parsedActualHour) * 60
        )

        if (parsedActualHour < 0) {
          return this.setActualTime()
        }

        const formattedActualMinute =
          parsedActualMinute < 10
            ? `0${parsedActualMinute}`
            : parsedActualMinute

        const formattedActualHour =
          parsedActualHour < 10 ? `0${parsedActualHour}` : parsedActualHour

        const formattedActualTime = `${formattedActualHour}:${formattedActualMinute}`
        this.setActualTime(formattedActualTime)
        this.refresh()
      } catch (err) {
        console.log(err)
      }
    },
    setActualTime(value) {
      this.form.actualTime = value ?? '00:00'
    },
    isInvalidComputeData(payload) {
      const { beginTime, endTime, breakTime } = payload
      return isNaN(beginTime) || isNaN(endTime) || breakTime?.length < 2
    },
    changeResponsible(select) {
      this.form.responsible = select?.text
    },
    changeItemCode(select) {
      this.form.itemCode = select?.key
      this.form.itemName = select?.itemName
      this.form.itemId = select?.itemId
      this.refresh()
    },
    changeDate({ path, value }) {
      this.form[path] = this.convertDate(value)
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
        height: 100px;
        width: 100%;
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
  height: 14px !important;
}
.filter-input {
  height: 20px;
  padding: 0px 0px 0px 5px;
  font-size: 12px;
  border-radius: unset;
  border: 1px solid #aaa;
}
</style>
