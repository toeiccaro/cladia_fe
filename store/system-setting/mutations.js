export default {
  SET_LIST_DATA_SECURITY(state, payload) {
    state.listSecurityByUserGroup = payload
  },
  SET_LIST_DATA_SECURITY_FOR_AUTHORIZATION(state, payload) {
    state.listSecurityForAuthorization = payload
  },
  SET_LIST_TEXT_CHANGE(state, payload) {
    state.listTextChange = payload
  },
}
