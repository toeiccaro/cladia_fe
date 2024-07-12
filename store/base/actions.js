import api from '@/api/api'
import { getParameterOptionsCommon } from '@/utils/utils'
import {
  CUSTOMER_COMPANY_TYPE_ID,
  SUPPLIER_COMPANY_TYPE,
  SERVER_RESPONSE_CODE,
} from '~/constants'
export default {
  async getListCustomer({ commit }) {
    const res = await api('getEnterpriseMaster', {
      companyType: CUSTOMER_COMPANY_TYPE_ID,
    })
    if (res && res.status === SERVER_RESPONSE_CODE.OK) {
      commit('SET_CUSTOMER_LIST', res.data?.tableContent?.content)
    }
  },
  async getListSupplier({ commit }) {
    const res = await api('getEnterpriseMaster', {
      companyType: SUPPLIER_COMPANY_TYPE,
    })
    if (res && res.status === SERVER_RESPONSE_CODE.OK) {
      commit('SET_SUPPLIER_LIST', res.data?.tableContent?.content)
    }
  },
  async getListCustomerName({ commit }) {
    const response = await api('getEnterpriseCustomerNames')
    const listAllCustomerName = response.data
    commit('SET_CUSTOMER_NAME_LIST', listAllCustomerName)
  },
  async getListEmployee({ commit }) {
    const res = await api('getEmployeeList')
    commit('SET_EMPLOYEE_LIST', res?.data)
  },

  async getWarehouseOptions({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('Warehouse', language)
    commit('SET_WAREHOUSE_OPTIONS', listOptions)
  },
  async getUnitOptions({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('Unit', language)
    commit('SET_UNIT_OPTIONS', listOptions)
  },
  async getCurrencyOptions({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('Currency', language)
    commit('SET_CURRENCY_OPTIONS', listOptions)
  },
  async getDepartmentOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('Department', language)
    commit('SET_DEPARTMENT_OPTIONS', listOptions)
  },
  async getListBox({ commit }, language) {
    const listBoxRes = []
    const response = await api('getBox', { language })
    listBoxRes.push(...response?.data?.tableContent?.content)
    commit('SET_LIST_BOX', listBoxRes)
  },
  async getPaymentTypeOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('PaymentType', language)
    commit('SET_PAYMENT_TYPE_OPTIONS', listOptions)
  },
  async getColorOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('Color', language)
    commit('SET_COLOR_OPTIONS', listOptions)
  },
  async getItemCustomOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ItemCustom', language)
    commit('SET_ITEM_CUSTOM_OPTIONS', listOptions)
  },
  async getNationOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('NationID', language)
    commit('SET_NATION_ID_OPTIONS', listOptions)
  },
  async getBornPlaceOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('BornPlace', language)
    commit('SET_BORN_PLACE_OPTIONS', listOptions)
  },
  async getDegreeOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('DegreeID', language)
    commit('SET_DEGREE_ID_OPTIONS', listOptions)
  },
  async getPositionOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('Post', language)
    commit('SET_POSITION_OPTIONS', listOptions)
  },
  async getPayTypeOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('PayType', language)
    commit('SET_PAY_TYPE_OPTIONS', listOptions)
  },
  async getStateOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('State', language)
    commit('SET_STATE_OPTIONS', listOptions)
  },
  async getHostelOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('Hostel', language)
    commit('SET_HOSTEL_OPTIONS', listOptions)
  },
  async getLeaveReasonOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('LeaveReason', language)
    commit('SET_LEAVE_REASON_OPTIONS', listOptions)
  },
  async getWeightUnitOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('WeightUnit', language)
    commit('SET_WEIGHT_UNIT_OPTIONS', listOptions)
  },
  async getUserGroupOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('UserGroup', language)
    commit('SET_USER_GROUP_OPTIONS', listOptions)
  },
  async getShareTypeOptions({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ShareType', language)
    commit('SET_SHARE_TYPE_OPTIONS', listOptions)
  },
  async getCompanyTypeOptions({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('CompanyType', language)
    commit('SET_COMAPNY_TYPE_OPTIONS', listOptions)
  },
  async getApparelOptions({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ApparelCode', language)
    commit('SET_APPAREL_CODE_OPTIONS', listOptions)
  },
  async getOperationTypeOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('OperType', language)
    commit('SET_OPERATION_TYPE_OPTIONS', listOptions)
  },
  async getPalletOptionsFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('Pallet', language)
    commit('SET_PALLET_OPTIONS', listOptions)
  },
  async getItemTypeOptionsFromAPI({ commit }) {
    const res = await api('getItemType')
    if (res) {
      const listOptions = res.data.map((item) => {
        return {
          text: item.key,
          value: item.keyId,
        }
      })
      listOptions.unshift({
        text: '',
        value: '',
      })
      commit('SET_ITEM_TYPE_OPTIONS', listOptions)
    }
  },
  async getListBox1OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox1', language)
    commit('SET_LIST_BOX1', listOptions)
  },
  async getListBox2OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox2', language)
    commit('SET_LIST_BOX2', listOptions)
  },
  async getListBox3OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox3', language)
    commit('SET_LIST_BOX3', listOptions)
  },
  async getListBox4OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox4', language)
    commit('SET_LIST_BOX4', listOptions)
  },
  async getListBox5OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox5', language)
    commit('SET_LIST_BOX5', listOptions)
  },
  async getListBox6OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox6', language)
    commit('SET_LIST_BOX6', listOptions)
  },
  async getInspectionTypesFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon(
      'InspectionType',
      language
    )
    commit('SET_INSPECTION_TYPES', listOptions)
  },
  async getListBox8OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox8', language)
    commit('SET_LIST_BOX8', listOptions)
  },
  async getListBox9OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox9', language)
    commit('SET_LIST_BOX9', listOptions)
  },
  async getListBox10OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox10', language)
    commit('SET_LIST_BOX10', listOptions)
  },
  async getListBox11OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox11', language)
    commit('SET_LIST_BOX11', listOptions)
  },
  async getListBox12OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('ListBox12', language)
    commit('SET_LIST_BOX12', listOptions)
  },
  async getListCOCustom1OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('COCustom1', language)
    commit('SET_LIST_CO_CUSTOM1', listOptions)
  },
  async getListCOCustom2OptionFromAPI({ commit }, language) {
    const listOptions = await getParameterOptionsCommon('COCustom2', language)
    commit('SET_LIST_CO_CUSTOM2', listOptions)
  },
  async getProcessStatus({ commit }, language) {
    const list = await getParameterOptionsCommon('ProcessStatus', language)
    const status = {}
    list.forEach((item) => {
      switch (item.value) {
        case 1:
          status.start = { ...item }
          break
        case 2:
          status.partial = { ...item }
          break
        case 3:
          status.completion = { ...item }
          break
      }
    })
    commit('SET_LIST_PROCESS_STATUS', list)
    commit('SET_PROCESS_STATUS', status)
  },
  async setSmaPriApiURL({ commit }) {
    try {
      const res = await api('getPrinterSettings')
      if (res.status === SERVER_RESPONSE_CODE.OK && res.data) {
        const data = res.data
        if (!data.barcodeEnable) return

        if (data.ipAddress && data.port) {
          const ip = data.ipAddress || ''
          const port = data.port || ''
          let url = `https://${ip}`
          if (port) {
            url = `https://${ip}:${port}`
          }
          commit('SET_SMAPRI_API_URL', url)
        }
      }
    } catch (err) {
      console.log(err)
    }
  },
}
