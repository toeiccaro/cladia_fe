<template>
  <div class="full-calendar-container">
    <full-calendar ref="fullCalendar" :options="calendarOptions">
      <template #dayCellContent="arg">
        <div :class="holidayClass(arg.date)" @click="handleDayClick(arg.date)">
          {{ arg.dayNumberText }}
        </div>
      </template>
    </full-calendar>
    <popup-calendar
      ref="popupCalendar"
      :get-list-events="getListEvents"
      :active-date-info="activeDateInfo"
      @setLoading="setLoading"
      @rerender-holiday="onRerenderHoliday"
    ></popup-calendar>

    <PopupCalendarHoliday
      v-if="userInfo?.isAdmin"
      ref="popupCalendarHoliday"
      :day-info="dayInfo"
      @setLoading="setLoading"
      @rerender-holiday="onRerenderHoliday"
    ></PopupCalendarHoliday>

    <base-loading v-if="loading" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import FullCalendar from '@fullcalendar/vue'
import DayGridPlugin from '@fullcalendar/daygrid'
import TimeGridPlugin from '@fullcalendar/timegrid'
import InteractionPlugin from '@fullcalendar/interaction'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import PopupCalendar from '@/components/UI/BasePopupCalendar.vue'
import PopupCalendarHoliday from '@/components/UI/BasePopupCalendarHoliday.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import { dateShortFormat, dateFormatVi, dateFormatYYYY } from '@/utils/utils'

export default {
  name: 'Calendar',

  components: {
    FullCalendar,
    PopupCalendar,
    BaseLoading,
    PopupCalendarHoliday,
  },

  mixins: [dateTime, systemMixins],

  data() {
    return {
      tabActive: 'dayGridMonth',
      loading: false,
      activeDateInfo: {},
      dateRange: {},
      listEventsHoliday: [],
      calendarOptions: {
        plugins: [DayGridPlugin, TimeGridPlugin, InteractionPlugin],
        initialView: 'dayGridMonth',
        stickyHeaderDates: true,
        stickyHeaderToolbar: true,
        fixedWeekCount: false,
        headerToolbar: {
          start: 'prev next today',
          center: 'title',
          end: 'dayGridMonth timeGridWeek timeGridDay',
        },
        views: {
          dayGridMonth: {
            titleFormat: { year: 'numeric', month: 'numeric' },
          },

          timeGridWeek: {
            dayHeaderContent: (args) => {
              return dateShortFormat(args.date)
            },
          },

          timeGridDay: {
            dayHeaderContent: (args) => {
              const strippedLeadingZero = this.stripLeadingZerosDate(
                dateFormatVi(args.date)
              )
              const formattedDate = strippedLeadingZero?.replaceAll('-', ' ')
              return formattedDate
            },
          },
        },
        selectable: true,
        navLinks: true,
        firstDay: 7,
        slotLabelFormat: {
          hour: '2-digit',
          minute: '2-digit',
          omitZeroMinute: false,
          hour12: false,
        },
        dayHeaderFormat: {
          weekday: 'long',
          omitCommas: false,
        },
        // dayHeaderFormat: {
        //   weekday: 'long',
        //   month: 'numeric',
        //   day: 'numeric',
        //   omitCommas: true,
        // },
        slotMinTime: '08:00:00',
        slotMaxTime: '24:00:00',
        dayMaxEvents: 2,
        height: '100%',
        expandRows: true,
        dateClick: this.handleDateClick,
        eventClick: this.handleEventClick,
        editable: true,
        events: [],
        datesSet: this.handleFetchEvents,
        eventTimeFormat: {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        },
        locale: 'EN-GB',
        eventDrop: this.handleChangeEvent,
        eventResize: this.handleChangeEvent,
        slotDuration: '00:30:00',
        snapDuration: '00:05:00',
        allDaySlot: false,
        slotEventOverlap: false,
        buttonText: {
          today: this.$t('msg_Cal_Today_0'),
          month: this.$t('msg_Cal_MonthTab_0'),
          week: this.$t('msg_Cal_WeekTab_0'),
          day: this.$t('msg_Cal_DayTab_0'),
        },
      },
      eventId: '',
      dayInfo: {},
    }
  },
  computed: {
    ...mapGetters({
      userInfo: 'getUserInfo',
    }),
  },
  watch: {
    '$i18n.locale': {
      handler(val) {
        const localeTimezone = {
          japanese: 'ja',
          english: 'en',
          vietnamese: 'vi',
        }
        this.calendarOptions.locale = localeTimezone[val]
      },
    },
  },
  created() {
    const isPlan = this.$route.query?.plan
    if (isPlan) {
      const today = new Date()
      const tomorrow = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
      )
      const startDate = this.convertDateTillSecond(today)
      const endDate = this.convertDateTillSecond(tomorrow)
      this.setDateRage({
        startDate,
        endDate,
      })
      this.calendarOptions.initialView = 'timeGridDay'
      const eventId = { event: { id: this.$route.query?.eventId } }
      this.handleEventClick(eventId)
    }
    this.$router.replace({ query: null })
  },
  methods: {
    onRerenderHoliday() {
      this.getListHolidayEvents()
    },
    holidayClass(date) {
      const holiday = this.listEventsHoliday.find((holiday) => {
        return dateFormatVi(date) === dateFormatVi(holiday?.start)
      })

      if (holiday && holiday?.isHoliday) {
        return this.userInfo?.isAdmin
          ? 'holiday day-events'
          : 'holiday day-event-casual'
      }
      return this.userInfo?.isAdmin ? 'day-events' : 'day-event-casual'
    },
    stripLeadingZerosDate(dateStr) {
      return dateStr
        .split('-')
        .reduce(function (date, datePart) {
          return (date += parseInt(datePart) + '-')
        }, '')
        .slice(0, -1)
    },

    showPopupCalendar() {
      this.$bvModal.show('popup-calendar-event')
    },

    closePopupCalendar() {
      this.$bvModal.hide('popup-calendar-event')
    },

    showPopupCalendarHoliday() {
      this.$bvModal.show('popup-calendar-holiday')
    },

    hidePopupCalendarHoliday() {
      this.$bvModal.hide('popup-calendar-holiday')
    },

    handleDateClick(dateInfo) {
      const startDate = this.convertDateTillSecond(dateInfo.date)
      const holiday = this.listEventsHoliday.findIndex(
        (item) => item.start === this.convertDate(startDate)
      )
      this.activeDateInfo = {
        startDate,
        isPublic: true,
        isHoliday: holiday !== -1,
      }
      this.showPopupCalendar()
    },

    handleDayClick(date) {
      const holiday = this.listEventsHoliday.find((holiday) => {
        return dateFormatVi(date) === dateFormatVi(holiday?.start)
      })
      if (this.userInfo?.isAdmin) {
        this.dayInfo = {
          date: dateFormatYYYY(date),
          isHoliday: !!holiday?.isHoliday,
        }
        this.showPopupCalendarHoliday()
      }
    },

    handleFetchEvents(calendarInfo) {
      this.tabActive = calendarInfo?.view?.type
      const startDate = this.convertDateTillSecond(calendarInfo.start)
      const endDate = this.convertDateTillSecond(calendarInfo.end)
      this.setDateRage({
        startDate,
        endDate,
      })
      this.getListEvents()
      this.getListHolidayEvents()
    },

    setDateRage({ startDate, endDate }) {
      this.dateRange = {
        startDate,
        endDate,
      }
    },

    async getListEvents() {
      try {
        this.loading = true
        const response = await api('getListEvents', this.dateRange)
        if (response && response.status === 200) {
          const listEvents = []
          response?.data?.forEach((element) => {
            if (element) {
              const user = element?.employeeName
                ? '(' + element.employeeName + ')'
                : ''
              listEvents.push({
                id: element.scheduleId,
                title: `${element.title ? element.title : ''} ${user}`,
                start: this.convertDateTillSecond(element.startDate),
                end: this.convertDateTillSecond(element.endDate),
                isPublic: element.isPublic,
                scheduleContent: element.scheduleContent,
                isHoliday: element.isHoliday,
                isEndDate: element.isEndDate,
                userId: element.userId,
                editable: !!(element.userId === this.userInfo?.loginID),
                allDay:
                  this.tabActive === 'dayGridMonth' ? element.isEndDate : false,
              })
            }
          })

          this.calendarOptions.events = listEvents
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getDetailEvent(scheduleId) {
      const payload = {
        scheduleId,
      }
      try {
        this.loading = true
        const response = await api('getDetailEvent', payload)
        if (response.status === 200) {
          this.activeDateInfo = {
            scheduleId: response.data.scheduleId,
            title: response.data.title,
            isPublic: response.data.isPublic,
            scheduleContent: response.data.scheduleContent,
            startDate: this.convertDateTillSecond(response.data.startDate),
            endDate: this.convertDateTillSecond(response.data.endDate),
            isHoliday: response?.data?.isHoliday,
            isEndDate: response?.data?.isEndDate,
            employeeName: response?.data?.employeeName,
            userId: response?.data?.userId,
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async handleEventClick(eventInfo) {
      eventInfo.jsEvent.preventDefault()
      const eventId = eventInfo.event.id
      this.eventId = eventId
      await this.getDetailEvent(this.parseStringToFloat(eventId))
      this.showPopupCalendar()
    },

    setLoading(loading) {
      this.loading = loading
    },

    handleChangeEvent({ event }) {
      const index = event.title.lastIndexOf('(')
      const title = event.title.substring(0, index).trim()

      const payload = {
        scheduleId: event.id,
        title,
        scheduleContent: event.extendedProps.scheduleContent,
        startDate: this.convertDateTillSecond(event.start),
        endDate: this.convertDateTillSecond(event.end),
        isHoliday: event.isHoliday,
        isEndDate: event.isEndDate,
      }

      this.$refs.popupCalendar.updateEvent(payload)
    },
    async getListHolidayEvents() {
      try {
        this.loading = true
        const response = await api('getHolidayCalendar', this.dateRange)
        if (response && response.status === 200) {
          const listEvents = []
          response.data.forEach((element) => {
            if (element) {
              listEvents.push({
                start: this.convertDate(element.restDate),
                end: this.convertDate(element.restDate),
                // title: '',
                display: 'none',
                isHoliday: true,
              })
            }
          })
          this.calendarOptions.events =
            this.calendarOptions.events.concat(listEvents)
          this.listEventsHoliday = listEvents
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss">
.holiday {
  color: red;
}
.day-events {
  text-decoration: underline !important;
  cursor: pointer !important;
}
.day-event-casual {
  text-decoration: none !important;
  cursor: default !important;
  &:hover {
    text-decoration: none !important;
  }
}
.fc-scrollgrid {
  border: none !important;
}

.fc-scrollgrid table {
  border-bottom-style: hidden;
}
.fc-scrollgrid-sync-table {
  tr {
    height: 20%;
  }
}

.fc-theme-standard td,
.fc-theme-standard th {
  border: 1px dotted #586a7e !important;
  border-top: none !important;
  border-left: none !important;
}

.fc-theme-standard th {
  border-top: 1px dotted #586a7e !important;
}

.fc-col-header-cell-cushion {
  font-weight: normal;
}

.fc-col-header-cell {
  background-color: #c2d5fc;
  padding-top: 3px;
}

.fc-toolbar-chunk:has(.fc-prev-button) {
  padding-left: 50px;
}

.fc-toolbar-chunk:has(.fc-toolbar-title) {
  margin-right: auto;
  padding-left: 20px;
  .fc-toolbar-title {
    font-size: 12px;
    font-weight: bold;
    padding-bottom: 3px;
  }
}

.fc-toolbar-chunk:has(.fc-dayGridMonth-button) {
  position: relative;
  top: 3px;
  z-index: 10;
}

.fc-dayGridMonth-button,
.fc-timeGridWeek-button,
.fc-timeGridDay-button {
  background-color: #d8e1ea !important;
  width: 59px;
  height: 21px;
  border-radius: 4px 4px 0 0 !important;
  padding: 0 !important;
  color: #2f3a48 !important;
  text-transform: capitalize !important;
  text-decoration: underline;
}

.fc-timeGridWeek-button,
.fc-timeGridDay-button {
  margin-left: 4px !important;
}

.fc-button-active {
  text-decoration: none;
  cursor: default !important;
  font-weight: bold !important;
  border: 1px dotted #586a7e !important;
  border-bottom: 0 !important;
  background-color: #c2d5fc !important;
}

.fc-prev-button,
.fc-next-button,
.fc-today-button {
  padding: 0 !important;
  background-image: url('@/assets/icon/buttons.png');
  background-repeat: no-repeat;
  background-size: cover;
  border-radius: 2px 0 0 2px !important;
}

.fc-prev-button,
.fc-next-button,
.fc-today-button {
  width: 29px;
  height: 17px;
  .fc-icon {
    display: none;
  }
}

.fc-today-button {
  width: 75px;
  height: 17px;
  color: #2f3a48 !important;
  background-position: -60px 0px;
  text-decoration: underline;
  opacity: 1 !important;
  margin-left: 4px !important;
  cursor: pointer;
}

.fc-next-button {
  background-position: -30px 0px;
  margin-left: 2px !important;
}

.fc-day-today {
  background-color: #d6e6ff !important;
  opacity: 1 !important;
}

.fc-timegrid-col {
  background-color: #e2edff;
  opacity: 1;
  .fc-event-time {
    padding: 5px 0;
    font-size: 13px !important;
  }
  .fc-event-title-container {
    padding-top: 5px;
    .fc-event-title {
      font-size: 14px !important;
      line-height: 15px;
    }
  }
}
.fc-day-today .fc-daygrid-day-top {
  background-color: #d1def4 !important;
  opacity: 1 !important;
  font-weight: 700;
}
.fc-col-header {
  .fc-day-today,
  th.fc-timegrid-axis {
    background-color: #c2d5fc !important;
  }
}
.fc-holiday-other {
  background-color: #d3d3d3 !important;
  .fc-daygrid-day-top {
    background-color: #d3d3d3 !important;
  }
}
// .fc-day-sun,
// .fc-day-sat {
//   .fc-daygrid-day-number {
//     color: red !important;
//   }
// }
.fc-timegrid-body {
  // tr:nth-child(odd) {
  //   background-color: #e2edff;
  // }
  tr:nth-child(even) {
    background-color: #ffff;
    opacity: 0.25;
  }
  td:first-child {
    background-color: #c2d5fc;
  }
  td:last-child {
    border: none !important;
  }
  .fc-event-start,
  .fc-event-end {
    box-shadow: none !important;
    .fc-event-time,
    .fc-event-title-container {
      font-size: 12px;
      color: #000 !important;
      margin: 0;
      line-height: 10px;
    }
    .fc-event-time {
      font-weight: bold;
    }
  }
}
.full-calendar-container {
  .fc-header-toolbar {
    margin: 0 !important;
    padding-bottom: 2px !important;
    background-color: #c2d5fc;
  }

  .fc-day-other {
    background-color: #ececec;
    .fc-daygrid-day-top {
      background-color: #e2e3e6;
    }
  }

  .fc-daygrid-day-top {
    background-color: #ebeff4;
    opacity: 1 !important;
    color: #2f3a48;
    font-size: 8pt;
  }

  // .fc-daygrid-day-number {
  //   pointer-events: none;
  //   cursor: default;
  //   text-decoration: none;
  // }

  .fc-v-event {
    background-color: #ffe763 !important;
    border: 1px solid #b7a543 !important;
    border-radius: 3px;
    .fc-event-title-container,
    .fc-event-title {
      font-size: 12px;
      color: initial;
      margin: 0;
    }
    .fc-event-time {
      border-bottom: 1px dotted #575555;
    }
  }

  .fc-h-event {
    background-color: #ffe763;
    border: 1px solid #b7a543;
    border-radius: 3px;
    height: 15px;
    padding-left: 10px;
    cursor: pointer;
    overflow: hidden;
    .fc-event-title-container,
    .fc-event-title {
      font-size: 8pt;
      color: initial;
      margin: 0;
      padding: 0 !important;
      line-height: 10px;
    }
    .fc-event-time {
      display: none;
    }
    * {
      max-height: 15px !important;
    }
  }

  .fc-daygrid-event-dot {
    display: none;
  }

  .fc-event-title {
    font-weight: normal;
  }

  .fc-daygrid-dot-event:hover,
  .fc-daygrid-more-link:hover {
    background-color: inherit !important;
    color: inherit !important;
  }
}
</style>
