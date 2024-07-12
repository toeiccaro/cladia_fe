export default {
  SET_COMPANY_CODE(state, payload) {
    state.companyCode = payload
  },
  SET_USERNAME(state, payload) {
    state.username = payload
  },
  SET_PASSWORD(state, payload) {
    state.password = payload
  },
  SET_IS_REMEMBER_PASSWORD(state, payload) {
    state.isRememberPassword = payload
  },
}
