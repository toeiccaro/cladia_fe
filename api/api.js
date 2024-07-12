/* eslint-disable no-console */
import cookies from 'vue-cookies'
import axios from 'axios'
import authApiMap from './apiMap'
import systemMaintenanceApiMap from './systemMaintenance'
import servicePurchase from './servicePurchase'
import serviceSales from './serviceSales'
import serviceOutwardProcessing from './serviceOutwardProcessing'
import serviceProduction from './serviceProduction'
import serviceMRP from './serviceMRP'
import { SERVER_RESPONSE_CODE } from '@/constants'

const config = (method, url, data, header, params) => {
  const obj = {
    method,
    url,
  }
  if (data) {
    if (method === 'get') {
      obj.params = data
    } else {
      if (data) {
        obj.data = data
      }
      if (params) {
        obj.params = params
      }
    }
  }
  if (header) {
    obj.headers = header
  }
  return obj
}

const apiMap = Object.assign(
  {},
  authApiMap(config),
  systemMaintenanceApiMap(config),
  servicePurchase(config),
  serviceSales(config),
  serviceOutwardProcessing(config),
  serviceProduction(config),
  serviceMRP(config),
)

const api = async (apiName, apiParams) => {
  const configApi = apiMap[apiName](apiParams)
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
    const request = axios.create({
      baseURL: process.env.BASE_URL,
      withCredentials: true,
      timeout: 60 * 60 * 1000,
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
    const { data } = await request(configApi)
    return data
  } catch (error) {
    return {
      success: false,
      data: error.response
        ? error
        : {
            response: {
              data: {
                message:
                  'ネットワーク通信品質が低下しています。通信環境を再確認するか、しばらくお待ちいただいてから再度接続してみてください。',
              },
            },
          },
    }
  }
}

export default api
