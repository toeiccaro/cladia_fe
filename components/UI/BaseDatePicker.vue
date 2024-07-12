<template>
  <div class="date-picker">
    <input
      class="c__input-value"
      type="text"
      v-model="dateDisplay"
      @input="(event) => onInputData(event.target.value)"
      @click.prevent.stop="showCalendar = true"
    />
    <div
      class="calendar"
      v-show="showCalendar"
      v-click-outside="hideCalendarMenu"
      tabindex="0"
    >
      <div class="c__header f__d-flex f__justify-between">
        <div
          class="prev-button button f__d-flex m__clickable"
          @click.prevent.stop="decreaseMonth"
        >
          &lt;
        </div>
        <div class="month-label">
          <span>{{ getMonthDisplayText(currentMonth) }}</span>
          <span>{{ currentYear }}</span>
        </div>
        <div
          class="next-button button f__d-flex m__clickable"
          @click.prevent.stop="increaseMonth"
        >
          &gt;
        </div>
      </div>
      <div class="f__d-flex flex-column">
        <div class="days-of-week f__d-flex f__justify-between">
          <ul class="days-of-week-list">
            <li
              v-for="dayOfWeekItem in daysOfWeek"
              :key="'days-of-week-' + dayOfWeekItem.value"
              class="day-of-week-item"
            >
              {{ dayOfWeekItem.text }}
            </li>
          </ul>
        </div>
        <div class="days-of-month f__d-flex">
          <ul class="days-of-month-list">
            <li
              v-for="(dayOfMonthItem, index) in getDaysInMonth(
                currentMonth,
                currentYear
              )"
              :key="'days-of-month' + index"
              class="day-of-month-item t__text-right"
              :class="dayOfMonthItem.display ? 'item-border' : ''"
              @click="setChoosenDay(dayOfMonthItem)"
            >
              {{ dayOfMonthItem.display ? dayOfMonthItem.text : '&nbsp;' }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseDatePicker',
  model: {
    prop: 'value',
    event: 'change',
  },
  directives: {
    clickOutside: {
      bind: (element, binding, vnode) => {
        element.clickOutsideEvent = (event) => {
          const isClickedOutside =
            element !== event.target || !element.includes(event.target)

          if (isClickedOutside) {
            vnode.context[binding.expression](event)
          }
        }
        window.addEventListener('click', element.clickOutsideEvent)
      },
      unbind: (element) => {
        window.removeEventListener('click', element.clickOutsideEvent)
      },
    },
  },
  props: {
    value: {
      type: [Date, String],
      default: () => new Date(),
    },
  },
  data() {
    return {
      dateDisplay: this.formatDate(new Date()),
      dateSelected: this.formatDate(new Date()),
      selectedDate: new Date(),
      showCalendar: false,
      currentDay: new Date().getDate(),
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
      months: [
        {
          text: 'January',
          value: 1,
        },
        {
          text: 'February',
          value: 2,
        },
        {
          text: 'March',
          value: 3,
        },
        {
          text: 'April',
          value: 4,
        },
        {
          text: 'May',
          value: 5,
        },
        {
          text: 'June',
          value: 6,
        },
        {
          text: 'July',
          value: 7,
        },
        {
          text: 'August',
          value: 8,
        },
        {
          text: 'September',
          value: 9,
        },
        {
          text: 'October',
          value: 10,
        },
        {
          text: 'November',
          value: 11,
        },
        {
          text: 'December',
          value: 12,
        },
      ],
      daysOfWeek: [
        {
          text: 'Su',
          value: 8,
        },
        {
          text: 'Mo',
          value: 2,
        },
        {
          text: 'Tu',
          value: 3,
        },
        {
          text: 'We',
          value: 4,
        },
        {
          text: 'Th',
          value: 5,
        },
        {
          text: 'Fr',
          value: 6,
        },
        {
          text: 'Sa',
          value: 7,
        },
      ],
    }
  },
  computed: {
    formattedDate() {
      return this.formatDate(
        new Date(this.currentYear, this.currentMonth - 1, this.currentDay)
      )
    },
  },
  watch: {
    dateDisplay: {
      handler(data) {
        this.onInputData(data)
      },
    },
  },
  methods: {
    hideCalendarMenu() {
      this.showCalendar = false
    },

    setChoosenDay(dayOfMonthItem) {
      if (!dayOfMonthItem.display) {
        return
      }
      this.currentDay = dayOfMonthItem.value
      this.dateDisplay = this.formattedDate
      this.hideCalendarMenu()
    },

    getMonthDisplayText(month) {
      return this.months.find((item) => item.value === month).text
    },

    decreaseMonth() {
      --this.currentMonth

      if (this.currentMonth < 1) {
        this.currentMonth = 12
        --this.currentYear
      }
    },

    increaseMonth() {
      ++this.currentMonth

      if (this.currentMonth > 12) {
        this.currentMonth = 1
        ++this.currentYear
      }
    },

    getDaysInMonth(month, year) {
      const numberOfDays = new Date(year, month, 0).getDate()
      const totalToFirstDayOfMonth = new Date(year, month - 1, 1).getDay()
      const daysOfMonthData = []

      // skip some days before the first day of the month
      for (let index = 0; index < totalToFirstDayOfMonth; index++) {
        daysOfMonthData.push({
          text: 0,
          value: 0,
          display: false,
        })
      }

      // make data for each day of the month
      for (let dayNumber = 1; dayNumber <= numberOfDays; dayNumber++) {
        daysOfMonthData.push({
          text: dayNumber,
          value: dayNumber,
          display: true,
        })
      }
      return daysOfMonthData
    },

    onInputData(data) {
      const splittedValue = data.split('-')

      const DAY_INDEX = 2
      const MONTH_INDEX = 1
      const YEAR_INDEX = 0

      if (splittedValue[MONTH_INDEX]?.toString().length < 2) {
        splittedValue[MONTH_INDEX] = '0' + splittedValue[MONTH_INDEX]
      }

      if (splittedValue[DAY_INDEX]?.toString().length < 2) {
        splittedValue[DAY_INDEX] = '0' + splittedValue[DAY_INDEX]
      }

      if (splittedValue[YEAR_INDEX]?.toString().length < 4) {
        splittedValue[YEAR_INDEX] = new Date().getFullYear()
      }

      const utcStringDate = this.convertToUTCString(splittedValue.join('-'))
      this.$emit('change', utcStringDate)
      return utcStringDate
    },

    formatDate(value) {
      let parsedDate = Date.parse(value)

      if (isNaN(parsedDate)) {
        parsedDate = new Date()
      }

      const date = new Date(parsedDate)

      let getDate = date.getDate()
      let getMonth = date.getMonth() + 1
      const getYear = date.getFullYear()

      if (getMonth.toString().length < 2) getMonth = '0' + getMonth

      if (getDate.toString().length < 2) getDate = '0' + getDate

      return [getYear, getMonth, getDate].join('-')
    },

    convertToUTCString(value) {
      if (!this.isValidDate(value)) {
        return value
      }

      let parsedDate = Date.parse(value)

      if (isNaN(parsedDate)) {
        parsedDate = new Date()
      }

      const date = new Date(parsedDate)

      return date.toUTCString()
    },

    isValidDate(dateString) {
      const regEx = /^\d{4}-\d{2}-\d{2}$/

      if (!dateString.match(regEx)) return false // Invalid format

      const date = new Date(dateString)
      const timestamp = date.getTime()

      if (!timestamp && timestamp !== 0) return false // NaN value, Invalid date

      return date.toISOString().slice(0, 10) === dateString
    },
  },
}
</script>

<style scoped>
.calendar {
  min-width: 225px;
  min-height: 185px;
  width: 235px;
  height: 215px;
  border: 1px solid black;
  position: absolute;
  bottom: 0;
  left: 0;
  transform: translateY(calc(100%));
  background: #ffffff;
  z-index: 999;
}
.c__input-value {
  max-height: 20px;
  min-height: 20px;
  height: 20px;
  font-size: 18px;
}
.button {
  width: 30px;
  height: 30px;
  justify-content: center;
  background: green;
}
.date-picker {
  position: relative;
}
.f__d-flex {
  display: flex;
}
.flex-column {
  flex-direction: column;
}
.justify-center {
  justify-content: space-center;
}
.f__justify-between {
  justify-content: space-between;
}
.justify-around {
  justify-content: space-around;
}

.days-of-month {
  padding: 0 12px;
}
.days-of-week {
  padding: 0 12px 0 17px;
}
.c__header {
  height: fit-content;
}
.day-of-month-item,
.day-of-week-item {
  width: 29px;
  height: 24px;
  margin: 0;
  display: inline-block;
  cursor: default;
}
.days-of-month-list,
.days-of-week-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
.item-border {
  border: 1px solid blue;
}
.t__text-right {
  text-align: right;
}
.m__clickable {
  cursor: pointer;
}
</style>
