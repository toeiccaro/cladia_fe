export default {
  SET_LIST_ERROR_MESSAGE(state, payload) {
    state.listErrorMessage = payload
  },
  SET_SHOW_ERROR(state, payload) {
    state.isErrorMessage = payload
  },
}
