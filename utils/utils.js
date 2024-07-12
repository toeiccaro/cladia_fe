import cookies from 'vue-cookies'
import axios from 'axios'
import api from '@/api/api'
import { SORT_TYPE, SERVER_RESPONSE_CODE } from '@/constants'

export function convertToGmt(date) {
  if (date) {
    const UTC = new Date(date)
    const GMT = dateFormatDetail(new Date(UTC))
    return GMT
  } else {
    return ''
  }
}

export function dateShortFormat(date) {
  if (isNaN(date)) {
    return
  }

  const options = { weekday: 'short', month: 'numeric', day: 'numeric' }
  const localeDateString = date.toLocaleDateString('en', options)
  const formattedDateString = localeDateString.replaceAll('/', ' ')

  return formattedDateString
}

export function dateFormatVi(value) {
  if (value) {
    const date = new Date(value)
    return `${date.getDate().toString().padStart(2, '0')}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getFullYear().toString().padStart(4, '0')}`
  }
  return ''
}

export function dateFormatDetail(value) {
  if (value) {
    const date = new Date(value)
    return `${date.getFullYear().toString().padStart(4, '0')}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date
      .getSeconds()
      .toString()
      .padStart(2, '0')}`
  }
  return ''
}

export function dateFormatHyphen(dt) {
  if (isNaN(dt)) {
    return
  }

  return `${dt.getFullYear().toString().padStart(4, '0')}-${(dt.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${dt.getDate().toString().padStart(2, '0')} ${dt
    .getHours()
    .toString()
    .padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt
    .getSeconds()
    .toString()
    .padStart(2, '0')}`
}

export function dateFormat(dt) {
  return `${dt.getFullYear().toString().padStart(4, '0')}/${(dt.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${dt.getDate().toString().padStart(2, '0')}`
}
export function dateFormatYYYY(value) {
  if (value) {
    const date = new Date(value)
    return `${date.getFullYear().toString().padStart(4, '0')}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  }
  return ''
}

export function convertStampTime(date) {
  if (date) {
    const StampTime = new Date(date).getTime()
    return StampTime
  } else {
    return ''
  }
}
export function setCookie(cname, cvalue, exdays) {
  const d = new Date()
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
  const expires = 'expires=' + d.toUTCString()
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}
export function downloadFileExcel(response, type) {
  const typeExcel = type ?? 'xls'
  const date = dateFormatYYYY(new Date())
  const linkSource = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${response}`
  const downloadLink = document.createElement('a')
  downloadLink.href = linkSource
  downloadLink.setAttribute('download', `Excel${date}.${typeExcel}`)
  downloadLink.target = '_blank'
  downloadLink.click()
}

export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function sum(dataArray) {
  const notANumberArray = dataArray.some(isNaN)

  if (notANumberArray) {
    return 0
  }

  return dataArray.reduce((partialSum, number) => partialSum + number, 0)
}

export function searchDetails({ data = [], filterData }) {
  const filterKeys = Object.keys(filterData)
  const hasNoFilters = filterKeys.length === 0
  if (hasNoFilters) {
    return data
  }

  const finalFilterData = {}
  for (const key in filterData) {
    if (!isEmptyValue(filterData[key])) {
      finalFilterData[key] = filterData[key]
    }
  }

  const selectBoxFields = [
    'warehouseId',
    'warehouseID',
    'itemCode',
    'unit',
    'unitId',
    'unitID',
    'itemTypeID',
    'itemType',
  ]

  const dateFields = ['date', 'promiseDate', 'effectiveDate']

  const numberFields = [
    'quantity',
    'price',
    'amount',
    'warehouseId',
    'warehouseID',
    'unit',
    'unitId',
    'unitID',
    'itemTypeID',
    'itemType',
  ]

  // const exactlyMatchFields = ['itemCode']

  for (const key in finalFilterData) {
    data = data?.filter((item) => {
      const isValidSelectBoxData =
        selectBoxFields?.includes(key) && finalFilterData[key] === ''

      if (isValidSelectBoxData) {
        return true
      }

      const isValidDateData =
        dateFields?.includes(key) &&
        dateFormatYYYY(new Date(finalFilterData[key])) ===
          dateFormatYYYY(new Date(item[key]))

      if (isValidDateData) {
        return true
      }

      // const shouldExactlyMatch = exactlyMatchFields.includes(key)
      // if (shouldExactlyMatch) {
      //   return item[key].toString() === finalFilterData[key].toString()
      // }

      const isNumberField = numberFields.includes(key)
      if (isNumberField) {
        let parsedNumber = parseFloat(item[key].toString().replace(/,/g, ''))
        if (typeof parsedNumber !== 'number') {
          parsedNumber = 0
        }

        return parsedNumber.toString().includes(finalFilterData[key].toString())
      }

      if (!isEmptyValue(item[key])) {
        return item[key].toString().includes(finalFilterData[key].toString())
      }

      return false
    })
  }

  return data
}

export async function getParameterOptionsCommon(keyCode, language) {
  const payload = {
    keyCode,
    language,
  }
  const response = await api('getParameter', payload)
  const listOptions = []
  response?.data?.forEach((item) => {
    if (item.name) {
      listOptions.push({ text: item.name, value: item.id })
    }
  })
  listOptions.unshift({
    text: '',
    value: '',
  })
  return listOptions
}

export function isEmptyValue(value) {
  return value === '' || value === undefined || value === null
}

export function sortList(arr, sortKey, sortType) {
  if (sortType === SORT_TYPE.ASCENDING) {
    arr.sort((a, b) =>
      a[`${sortKey}`] > b[`${sortKey}`]
        ? 1
        : b[`${sortKey}`] > a[`${sortKey}`]
        ? -1
        : 0
    )
  } else {
    arr.sort((a, b) =>
      a[`${sortKey}`] < b[`${sortKey}`]
        ? 1
        : b[`${sortKey}`] < a[`${sortKey}`]
        ? -1
        : 0
    )
  }
}

export function getUnique(arr, comp) {
  const unique = arr
    .map((e) => e[comp])

    // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)

    // eliminate the dead keys & store unique objects
    .filter((e) => arr[e])
    .map((e) => arr[e])

  return unique
}

/* eslint-disable no-unused-expressions */
export function flatNestedArrayByKey({
  array = [],
  initialList = [],
  key = 'childs',
}) {
  return array.reduce((childPages, currentPage) => {
    const notHaveChildren = currentPage[key] && !currentPage[key].length
    notHaveChildren
      ? childPages.push(currentPage)
      : (childPages.push(currentPage),
        flatNestedArrayByKey({
          array: currentPage[key],
          initialList: childPages,
          key,
        }),
        (currentPage[key] = []))

    return childPages
  }, initialList)
}

export function formatNumberWithCommas(number) {
  const REGEX = /\B(?=(\d{3})+(?!\d))/g
  if (number === '0' || !number) {
    return 0
  }
  const dotIdx = number?.toString().indexOf('.') 
  const isDecimal = dotIdx !== -1 

  // Format decimal
  if (isDecimal) {
    let leftDotNumbers = number?.toString().slice(0, dotIdx)
    const rightDotNumbers = number?.toString().slice(dotIdx + 1)
    leftDotNumbers = leftDotNumbers.replace(REGEX, ',')
    
    return leftDotNumbers + '.' + rightDotNumbers
  } 

  // Format integer
  return number?.toString().replace(REGEX, ',')

}

export function parseToNumber(str) {
  if (str === '0' || str === 0) {
    return 0
  }
  if (typeof str === 'string') {
    return parseFloat(str?.split(',').join(''));
  }
}

export function range({ from, to, step = 1 }) {
  return [...Array(Math.floor((to - from) / step) + 1)].map(
    (num, index) => from + index * step
  )
}

export function rangeOfHours({ interval }) {
  const MAX_HOUR = 24
  const MAX_MINUTE = 60
  const NUMBER_TEN = 10

  let hour = 0
  let minute = 0

  const result = []

  while (hour < MAX_HOUR) {
    if (minute >= MAX_MINUTE) {
      const surplus = minute % MAX_MINUTE
      const extraHours = Math.floor(minute / MAX_MINUTE)

      hour += extraHours
      minute = surplus

      if (hour >= MAX_HOUR) break
    }

    let hourText = hour.toString()
    let minuteText = minute.toString()

    hour < NUMBER_TEN && (hourText = `0${hour.toString()}`)

    minute < NUMBER_TEN && (minuteText = `0${minute.toString()}`)

    result.push(`${hourText}:${minuteText}`)

    minute += interval
  }

  return result
}

export function stringUpperFirstCase(string){
  string = string.replace("/\\s/g", "");
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export async function getAccessToken() {
  try {
    // eslint-disable-next-line prefer-const
    let token = cookies.get('JWT_TOKEN')
    const refreshToken = cookies.get('REFRESH_TOKEN')
    if (!token && refreshToken) {
      const resRefresh = await axios.get(
        `${process.env.BASE_URL}refresh-token`,
        { params: { refreshToken } }
      )
      if (resRefresh && resRefresh.status === SERVER_RESPONSE_CODE.OK) {
        cookies.set(
          'JWT_TOKEN',
          resRefresh.data.data.accessToken,
          new Date(resRefresh.data.data.expirationTimeToken)
        )
        cookies.set(
          'REFRESH_TOKEN',
          resRefresh.data.data.refreshToken,
          new Date(
            new Date(resRefresh.data.data.expirationTimeToken).getTime() +
              86400 * 365 * 1000 * 10
          )
        )
        token = resRefresh.data.data.accessToken
      }
    }
    return token
  } catch(err) {
    console.log(err)
  }
}
