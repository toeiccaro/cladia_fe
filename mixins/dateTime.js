export default {
  methods: {
    convertDate(value) {
      if (value) {
        const date = new Date(value)
        return `${date.getFullYear().toString().padStart(4, '0')}-${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
      }
      return ''
    },
    convertDateTillSecond(value) {
      if (value) {
        const date = new Date(value)
        return `${date.getFullYear().toString().padStart(4, '0')}-${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}-${date
          .getDate()
          .toString()
          .padStart(2, '0')} ${date
          .getHours()
          .toString()
          .padStart(2, '0')}:${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
      }
      return ''
    },
    getMonthDate(value) {
      const date = value ?? new Date()
      return date.getMonth() + 1
    },
    getYearDate(value) {
      const date = value ?? new Date()
      return date.getFullYear()
    },
    numberRemoveComas(value) {
      const finalValue = value ?? ''
      const validateValue = finalValue.toString().replace(/,/g, '')
      return Number(validateValue)
    },
    formatAMPM(date) {
      const parsedDate = new Date(date)

      const invalidDate = !date || isNaN(parsedDate)
      if (invalidDate) {
        return
      }

      const TWELVE = 12

      const hours = parsedDate.getHours()
      const ampm = hours >= TWELVE ? 'PM' : 'AM'

      const dateFormated = this.convertDateTillSecond(date)

      const dateTimeFormatted = `${dateFormated} ${ampm}`
      return dateTimeFormatted
    },
    isBeforeToday(value) {
      const isValidDate = !isNaN(new Date(value).getTime())

      const isBeforeToday =
        new Date().getTime() - new Date(value).getTime() > 86400000 // milliseconds of one day

      return isValidDate && isBeforeToday
    },
  },
}
