import axios from 'axios'
import api from '@/api/api'
import { setCookie } from '@/utils/utils'
export const state = () => ({
  tab: '',
  hasError: false,
  companyCode: localStorage.getItem('companyCode')
    ? JSON.parse(localStorage.getItem('companyCode'))
    : '',
  listTimeZones: [],
  dark: false,
  userInfo: {},
  dataColumnHides: [],
  isExpandSideBar: true,
  statusPayloadList: {
    pageNo: 1,
    pageSize: 30,
  },
})

export const getters = {
  getUserInfo: (state) => state.userInfo,
  getHasError: (state) => state.hasError,
  dark: (state) => state.dark,
  getDataColumnHides: (state) => state.dataColumnHides,
  getStatusExpandSideBar: (state) => state.isExpandSideBar,
  getStatusPayloadList: (state) => state.statusPayloadList,
}

export const mutations = {
  SET_DATA_COLUMN_HIDE(state, payload) {
    state.dataColumnHides = payload
  },
  SET_USER_INFO(state, payload) {
    state.userInfo = payload
  },
  setTab(state, payload) {
    state.tab = payload
  },
  SET_AUTH(state, payload) {
    state.auth = payload
  },

  SET_LOGIN_ERROR(state, payload) {
    state.hasError = payload
  },

  CLEAR_AUTH(state) {
    state.auth = null
    state.userInfo = null
  },
  SET_LIST_TIMEZONES(state, payload) {
    state.listTimeZones = payload
  },
  SET_DARK: (state, bool) => {
    state.dark = bool
  },
  SET_EXPAND_SIDEBAR(state, payload) {
    state.isExpandSideBar = payload
  },
  SET_STATUS_PAYLOAD_LIST(state, payload) {
    state.statusPayloadList = Object.assign(
      {},
      state.statusPayloadList,
      payload
    )
  },
}

export const actions = {
  setUserInfo({ commit }, payload) {
    localStorage.setItem('userInfo', JSON.stringify(payload))
    commit('SET_USER_INFO', payload)
  },

  setAuth({ commit }, payload) {
    commit('SET_AUTH', payload)
  },

  async login({ commit }, payload) {
    const res = await axios({
      url: `${process.env.BASE_URL}login`,
      method: 'post',
      withCredentials: true,
      data: payload,
    })
      .then(function (response) {
        setCookie('JWT_TOKEN', response.data?.data?.token, 0.5)
        localStorage.setItem('companyCode', JSON.stringify(payload.companyCode))
        // localStorage.setItem('userInfo', JSON.stringify(userInfo))
        commit('SET_AUTH', true)
        commit('login/SET_USERNAME', '')
        commit('login/SET_PASSWORD', '')
        // const res = await api('getDecentralization')
        // if (res.success) {
        //   commit('decentralization/SET_PERMISSION_LIST', res.data.data)
        // }
        return response.data
      })
      .catch((error) => {
        if (error.response) {
          return error.response.data
        }
      })
    return res
  },
  async logout({ commit }) {
    const res = await api('logout')
    if (res.success) {
      // localStorage.removeItem('userInfo')
      commit('locale/SET_LOCALE_STATE', true)
      commit('CLEAR_AUTH')
      this.$router.push(this.localePath({ path: '/login' }))
    }
  },
}
