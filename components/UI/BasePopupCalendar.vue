<template>
  <b-modal
    id="popup-calendar-event"
    content-class="popup-calendar-container"
    centered
    hide-header-close
    size="lg"
    @hide="clearErrorMessage"
  >
    <div class="popup-header">
      <div class="d-flex flex-column justify-center mr-3">
        <div
          v-if="activeDateInfo?.employeeName"
          class="button button-pencil"
        ></div>
      </div>
      <div class="header-user-name">{{ activeDateInfo?.employeeName }}</div>
    </div>
    <div class="popup-body">
      <div v-if="listValidateForm.length > 0" class="message-error">
        <ul>
          <li v-for="item in listValidateForm" :key="item.key">
            {{ item.message }}
          </li>
        </ul>
      </div>

      <div class="form-input">
        <div class="text__title pl-3">{{ $t('lbl_Title_0') }}(*)</div>
        <b-form-textarea
          v-model="formEvent.title"
          no-resize
          :disabled="isEdit"
        />
      </div>

      <div class="form-input">
        <div class="text__title pl-3">{{ $t('lbl_ScheduleContent_0') }}</div>
        <b-form-textarea
          v-model="formEvent.scheduleContent"
          no-resize
          :rows="3"
          :disabled="isEdit"
        />
      </div>

      <div class="form-input d-flex">
        <div class="mb-3 d-flex pl-3">
          <input
            v-model="formEvent.isEndDate"
            type="checkbox"
            :disabled="isEdit"
          />
          <div class="text__title pl-2">
            {{ $t('lbl_AllDay_0') }}
          </div>
        </div>
        <div class="mb-3 d-flex pl-3">
          <input
            v-model="formEvent.isPublic"
            type="checkbox"
            :disabled="isEdit"
          />
          <div class="text__title pl-2">
            {{ $t('lbl_ScheduleContentPublic_0') }}
          </div>
        </div>
        <!-- <div v-if="userInfo.isAdmin" class="mb-3 d-flex pl-3">
          <input v-model="formEvent.isHoliday" type="checkbox" :disabled="isEdit"/>
          <div class="text__title pl-2">
            {{ $t('lbl_ScheduleContentHoliday_0') }}
          </div>
        </div> -->
      </div>

      <div class="form-input">
        <div class="d-flex">
          <div class="text__title pl-3">{{ $t('lbl_ScheduleTime_0') }}</div>
        </div>
      </div>
      <div class="form-input">
        <div class="d-flex justify-center">
          <div class="time__start">
            <select
              :value="startTime"
              :disabled="isEdit"
              @change="
                (event) =>
                  updateEventTime({
                    data: event.target.value,
                    type: EVENT_TIME_STRUCTURE.TIME,
                    path: 'startDate',
                  })
              "
            >
              <option
                v-for="(time, index) in timeRange"
                :key="`time-select-1-${index}`"
                :value="time"
              >
                {{ time }}
              </option>
            </select>
            <select
              :value="startDay"
              :disabled="isEdit"
              @change="
                (event) =>
                  updateEventTime({
                    data: event.target.value,
                    type: EVENT_TIME_STRUCTURE.DAY,
                    path: 'startDate',
                  })
              "
            >
              <option
                v-for="(day, index) in dayRange"
                :key="`day-select-1-${index}`"
                :value="day"
              >
                {{ day }}
              </option>
            </select>
            <select
              :value="startMonth"
              :disabled="isEdit"
              @change="
                (event) =>
                  updateEventTime({
                    data: event.target.value,
                    type: EVENT_TIME_STRUCTURE.MONTH,
                    path: 'startDate',
                  })
              "
            >
              <option
                v-for="(month, index) in monthRange"
                :key="`month-select-1-${index}`"
                :value="month"
              >
                {{ month }}
              </option>
            </select>
            <select
              :value="startYear"
              :disabled="isEdit"
              @change="
                (event) =>
                  updateEventTime({
                    data: event.target.value,
                    type: EVENT_TIME_STRUCTURE.YEAR,
                    path: 'startDate',
                  })
              "
            >
              <option
                v-for="(year, index) in yearRange"
                :key="`year-select-1-${index}`"
                :value="year"
              >
                {{ year }}
              </option>
            </select>
          </div>
          <div class="time__separator px-3"></div>
          <div class="time__end">
            <select
              :value="endTime"
              :disabled="isEdit"
              @change="
                (event) =>
                  updateEventTime({
                    data: event.target.value,
                    type: EVENT_TIME_STRUCTURE.TIME,
                    path: 'endDate',
                  })
              "
            >
              <option
                v-for="(time, index) in timeRange"
                :key="`time-select-2-${index}`"
                :value="time"
              >
                {{ time }}
              </option>
            </select>
            <select
              :value="endDay"
              :disabled="isEdit"
              @change="
                (event) =>
                  updateEventTime({
                    data: event.target.value,
                    type: EVENT_TIME_STRUCTURE.DAY,
                    path: 'endDate',
                  })
              "
            >
              <option
                v-for="(day, index) in dayRange"
                :key="`day-select-2-${index}`"
                :value="day"
              >
                {{ day }}
              </option>
            </select>
            <select
              :value="endMonth"
              :disabled="isEdit"
              @change="
                (event) =>
                  updateEventTime({
                    data: event.target.value,
                    type: EVENT_TIME_STRUCTURE.MONTH,
                    path: 'endDate',
                  })
              "
            >
              <option
                v-for="(month, index) in monthRange"
                :key="`month-select-2-${index}`"
                :value="month"
              >
                {{ month }}
              </option>
            </select>
            <select
              :value="endYear"
              @change="
                (event) =>
                  updateEventTime({
                    data: event.target.value,
                    type: EVENT_TIME_STRUCTURE.YEAR,
                    path: 'endDate',
                  })
              "
            >
              <option
                v-for="(year, index) in yearRange"
                :key="`year-select-2-${index}`"
                :value="year"
              >
                {{ year }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <template #modal-footer>
      <div class="w-100 d-flex justify-content-between m-0 mt-2 px-2">
        <div class="d-flex w-100">
          <div v-if="!isEdit" class="footer__button" @click="saveEvent">
            <div class="button button-save"></div>
            <div v-html="$t('btn_btnSave_0')"></div>
          </div>

          <div class="footer__button" @click="closePopup">
            <div class="button button-close"></div>
            <div v-html="$t('btn_btnClose_0')"></div>
          </div>

          <div
            v-if="!isNewEvent && !isEdit"
            class="footer__button"
            @click="deleteEvent"
          >
            <div class="button button-delete"></div>
            <div v-html="$t('btn_btnDel_0')"></div>
          </div>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUnique, range, rangeOfHours } from '@/utils/utils'
import 'vue2-datepicker/index.css'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import { EVENT_TIME_STRUCTURE } from '@/constants'

export default {
  name: 'BasePopupCalendar',

  mixins: [dateTime],

  props: {
    getListEvents: {
      type: Function,
      default: () => {},
    },

    activeDateInfo: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      formEvent: {
        scheduleId: null,
        title: '',
        scheduleContent: '',
        startDate: null,
        endDate: null,
        isPublic: true,
        isHoliday: false,
        isEndDate: false,
      },
      listValidateForm: [],
      minutesDuration: 5 * 60 * 1000,
      openSelectStartDate: false,
      openSelectEndDate: false,
      EVENT_TIME_STRUCTURE,
    }
  },

  computed: {
    ...mapGetters({
      userInfo: 'getUserInfo',
    }),

    isEdit() {
      if (this.activeDateInfo?.userId) {
        return !(this.userInfo?.loginID === this.activeDateInfo?.userId)
      }
      return false
    },

    isNewEvent() {
      return !this.formEvent.scheduleId
    },

    dayRange() {
      return range({ from: 1, to: 31 })
    },

    monthRange() {
      return range({ from: 1, to: 12 })
    },

    yearRange() {
      return range({ from: 2018, to: 2038 })
    },

    timeRange() {
      return rangeOfHours({ interval: 5 })
    },

    startTime() {
      return this.formEvent.isEndDate
        ? '00:00'
        : new Date(this.formEvent.startDate).toTimeString().substring(0, 5)
    },

    startDay() {
      return new Date(this.formEvent.startDate).getDate()
    },

    startMonth() {
      return new Date(this.formEvent.startDate).getMonth() + 1
    },

    startYear() {
      return new Date(this.formEvent.startDate).getFullYear()
    },

    endTime() {
      return this.formEvent.isEndDate
        ? '00:00'
        : new Date(this.formEvent.endDate).toTimeString().substring(0, 5)
    },

    endDay() {
      const nowDay = new Date(this.formEvent.endDate).getDate()
      const startDate = new Date(this.formEvent.startDate).getDate()
      const isAddedDate = nowDay === startDate + 1

      const month = new Date(this.formEvent.endDate).getMonth()
      const year = new Date(this.formEvent.endDate).getFullYear()
      const lastDay = this.getLastDayOfMonth(year, month)

      if (this.isNewEvent && this.formEvent.isEndDate && !isAddedDate) {
        // if current day is last day of the month then return the first day of the next month
        if (nowDay === lastDay) {
          return 1
        }
        return nowDay + 1
      }
      return nowDay
    },

    endMonth() {
      const nowDay = new Date(this.formEvent.endDate).getDate()
      const startDate = new Date(this.formEvent.startDate).getDate()
      const isAddedDate = nowDay === startDate + 1

      const month = new Date(this.formEvent.endDate).getMonth()
      const year = new Date(this.formEvent.endDate).getFullYear()
      const lastDay = this.getLastDayOfMonth(year, month)

      if (this.isNewEvent && this.formEvent.isEndDate && !isAddedDate) {
        // if current day is last day of the month then return the the next month
        if (nowDay === lastDay) {
          return month + 2
        }
        return month + 1
      }
      return month + 1
    },

    endYear() {
      return new Date(this.formEvent.endDate).getFullYear()
    },
  },

  watch: {
    // 'formEvent.isHoliday': {
    //   handler(val) {
    //     // if (!this.formEvent.title) {
    //       this.formEvent.title = val ? 'holiday' : ''
    //     // }
    //   },
    // },

    activeDateInfo: {
      handler(value) {
        const dateInfo = JSON.parse(JSON.stringify(value))
        if (dateInfo.scheduleId) {
          // detail event
          const startDate = new Date(dateInfo.startDate)
          const endDate = new Date(dateInfo.endDate)

          this.formEvent = {
            ...dateInfo,
            startDate,
            endDate,
          }
        } else {
          // add event
          this.setDatetimeFormEvent(value)
          this.formEvent.isPublic = dateInfo.isPublic
          this.formEvent.isHoliday = dateInfo.isHoliday
          this.formEvent.isEndDate = dateInfo.isEndDate
          this.formEvent.title = ''
          this.formEvent.scheduleContent = ''
          this.formEvent.scheduleId = null
        }
      },
      deep: true,
    },
  },

  methods: {
    // function get last day of the month
    getLastDayOfMonth(year, month) {
      return new Date(year, month + 1, 0).getDate()
    },

    updateEventTime({ data, type, path }) {
      const timeData = new Date(this.formEvent[path])

      let draftDate
      if (type === EVENT_TIME_STRUCTURE.TIME) {
        draftDate = new Date(`01-01-1970 ${data}`)
      }

      switch (type) {
        case EVENT_TIME_STRUCTURE.TIME:
          timeData.setHours(draftDate.getHours())
          timeData.setMinutes(draftDate.getMinutes())
          break
        case EVENT_TIME_STRUCTURE.DAY:
          timeData.setDate(data)
          break
        case EVENT_TIME_STRUCTURE.MONTH:
          timeData.setMonth(data - 1)
          break
        case EVENT_TIME_STRUCTURE.YEAR:
          timeData.setYear(data)
          break
        default:
          break
      }

      this.formEvent[path] = timeData
    },

    closePopup() {
      this.$bvModal.hide('popup-calendar-event')
      this.clearErrorMessage()
      this.formEvent = {
        scheduleId: null,
        title: '',
        scheduleContent: '',
        startDate: null,
        endDate: null,
        isHoliday: false,
      }
    },

    handleChangeSelectDate(key, type) {
      if (type === 'minute') {
        if (key === 'startDate') {
          this.openSelectStartDate = false
        } else {
          this.openSelectEndDate = false
        }
      }
    },

    disableSelectDate(date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return date < today
    },

    disableSelectTime(date) {
      // first hour a day is started 08:00
      return date.getHours() < 8
    },

    validateEvent() {
      const messageErrorList = []
      for (const key in this.formEvent) {
        switch (key) {
          // case 'title':
          //   if (!this.formEvent[key]) {
          //     messageErrorList.push({
          //       key,
          //       message: `[${this.$t('lbl_Title_0')}] ${this.$t(
          //         'msg_NoInput_0'
          //       )}`,
          //     })
          //   }
          //   break

          case 'startDate':
            if (!this.formEvent[key]) {
              messageErrorList.push({
                key,
                message: `[${this.$t('lbl_StartDate_0')}] ${this.$t(
                  'msg_NoInput_0'
                )}`,
              })
            }
            break

          case 'endDate':
            if (!this.formEvent[key]) {
              messageErrorList.push({
                key,
                message: `[${this.$t('lbl_EndDate_0')}] ${this.$t(
                  'msg_NoInput_0'
                )}`,
              })
            } else if (this.formEvent[key] < this.formEvent.startDate) {
              messageErrorList.push({
                key,
                message: `[${this.$t('lbl_EndDate_0')}] ${this.$t(
                  'msg_calender_startDate_endDate_0'
                )}`,
              })
            }
            break
          case 'isEndDate':
            if (this.formEvent[key]) {
              this.formEvent.endDate = new Date(
                new Date(this.formEvent.endDate - 1).setHours(24, 0, 0, 0)
              )
              this.formEvent.startDate = new Date(
                new Date(this.formEvent.startDate).setHours(0, 0, 1, 0)
              )
            }
            break

          default:
            break
        }
      }

      this.listValidateForm = getUnique(messageErrorList, 'key')
    },

    roundDatetimeByMinutes(datetime) {
      if (datetime) {
        return new Date(
          Math.ceil(datetime.getTime() / this.minutesDuration) *
            this.minutesDuration
        )
      }
      return null
    },

    setDatetimeFormEvent(value) {
      let startDate = new Date(value.startDate)
      const start = new Date(new Date(value.startDate).setHours(8, 0, 0, 0))
      if (startDate < start) {
        startDate = new Date(startDate.setHours(8, 0, 0, 0))
      }
      const finalStartDate = this.roundDatetimeByMinutes(startDate)
      const finalEndDate = new Date(
        finalStartDate.getTime() + this.minutesDuration
      )

      this.formEvent = {
        ...this.formEvent,
        startDate: finalStartDate,
        endDate: finalEndDate,
      }
    },

    async addNewEvent(payload) {
      try {
        this.$emit('setLoading', true)
        const response = await api('addEvent', payload)
        if (response.status === 200) {
          window.alert(this.$t('msg_calender_addNew_Success_0'))
          this.closePopup()
          this.getListEvents()
        } else {
          window.alert(this.$t('msg_calender_addNew_fail_0'))
        }
      } catch (error) {
        window.alert(this.$t('msg_calender_addNew_fail_0'))
      } finally {
        this.$emit('setLoading', false)
        this.$emit('rerender-holiday')
      }
    },

    async updateEvent(payload) {
      try {
        this.$emit('setLoading', true)

        const response = await api('updateEvent', payload)
        if (response.status === 200) {
          await this.getListEvents()
          window.alert(this.$t('msg_calenderUpdateSuccess_0'))
        } else {
          window.alert(this.$t('msg_calenderUpdateFail_0'))
        }
      } catch (error) {
        window.alert(this.$t('msg_calenderUpdateFail_0'))
      } finally {
        this.$emit('setLoading', false)
        this.$emit('rerender-holiday')
        this.closePopup()
      }
    },

    async deleteEvent() {
      const payload = {
        scheduleId: this.formEvent.scheduleId,
      }
      try {
        this.$emit('setLoading', true)
        const response = await api('deleteEvent', payload)
        if (response.status === 200) {
          await this.getListEvents()
          window.alert(this.$t('msg_calenderDeleteSuccess_0'))
        } else {
          window.alert(this.$t('msg_calenderDeleteFail_0'))
        }
      } catch (error) {
        window.alert('msg_calenderDeleteFail_0')
      } finally {
        this.$emit('setLoading', false)
        this.closePopup()
      }
    },

    saveEvent() {
      this.validateEvent()

      // save event
      if (this.listValidateForm.length === 0) {
        const payload = {}
        for (const key in this.formEvent) {
          if (this.formEvent[key]) {
            if (['startDate', 'endDate'].includes(key)) {
              payload[key] = this.convertDateTillSecond(this.formEvent[key])
            } else if (key !== 'openSelectDate') {
              payload[key] = this.formEvent[key]
            }
          }
        }

        if (this.isNewEvent) {
          this.addNewEvent(payload)
        } else {
          this.updateEvent(payload)
        }
      }
    },

    clearErrorMessage() {
      this.listValidateForm = []
    },
  },
}
</script>

<style lang="scss" scoped>
.time__start select,
.time__start option,
.time__end select,
.time__end option {
  color: #000 !important;
  padding: 0 !important;
}
.time__separator {
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 9px;
    height: 1px;
    background-color: #000;
  }
}
.text__title {
  font-size: 18px;
  font-weight: bold;
}
.form-control:is(textarea),
.form-control:is(textarea):focus {
  border: none !important;
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
  outline: none !important;
}
.form-control:is(textarea) {
  border-radius: 0 !important;
  padding: 2px 0px 2px 10px;
}
.button {
  background-image: url('@/assets/icon/controls.png');
  background-repeat: no-repeat;
  width: 21px;
  height: 21px;
}
::v-deep .popup-calendar-container {
  background-color: #e2edff;
  border-radius: 5px;
  color: #000;
  width: 580px;
  height: fit-content;
  box-shadow: 5px 5px 5px #888;
  padding: 3px 3px 0 3px !important;
  z-index: 99;
  .modal-header {
    padding: 0 !important;
  }
  .modal-body {
    background-color: #afc0e3 !important;
    color: #ffffff;
    padding: 0 !important;
    display: flex;
    flex-direction: column;
  }
  .popup-header {
    background-color: #e2edff !important;
    color: #000 !important;
    display: flex;
    .header-user-name {
      font-size: 16px !important;
    }

    .button-pencil {
      background-position: 0px -43px;
      width: 12.67px !important;
      height: 11px !important;
    }
  }
  .popup-body {
    border: 1px solid #5180d8;
    height: 100%;
    .message-error {
      padding: 4px 20px;
      border: 1px solid red;
      color: red;
      font-weight: 700;
      font-size: 12px;

      ul {
        list-style: disc;
      }
    }

    .form-input {
      margin: 5px 0;
    }
  }
  .modal-footer {
    padding: 0 !important;
    .footer__button {
      cursor: pointer;
      display: flex;

      .button-save {
        background-position: -84px 0px;
      }
      .button-close {
        background-position: -63px 0px;
        margin-left: 15px !important;
      }
      .button-delete {
        background-position: -42px 0px;
      }

      &:has(.button-delete) {
        margin-left: auto;
      }
    }
  }
}
</style>
<style lang="scss">
.modal {
  position: fixed;
  top: 0;
  right: 0;
  left: auto;
  z-index: 1050;
  display: none;
  width: calc(100% - 182px);
  height: 100%;
  overflow: hidden;
  outline: 0;
  display: flex !important;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  left: auto;
  z-index: 1040;
  width: calc(100vw - 182px);
  height: 100vh;
  background-color: #000;
}
</style>
