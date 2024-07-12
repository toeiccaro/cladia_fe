import { MutationTypes } from './mutation-types'

export default {
  [MutationTypes.SET_EMPLOYEE_CURRENT_PAGE](state, { data }) {
    state.employeeCurrentPage = data
  },
}
