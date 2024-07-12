// import { get } from 'lodash'

const api = (config) => ({
  // System Setting User Manage
  deleteUser: (payload) =>
    config('delete', `user/delete/${payload.loginID}`, payload),
  getUserManageList: (payload) => config('post', 'user/search', payload),
  getUserDetail: (payload) =>
    config('get', `user/detail?userID=${payload.userID}`),
  getUserGroup: (language) =>
    config('get', `user/getUserGroup?language=${language}`),
  addUser: (payload) => config('post', 'user/add', payload),
  updateUser: (payload) => config('put', `user/update`, payload),

  // Password Settings
  changePassword: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('post', `changePass?${urlQuery}`, payload)
  },
  // Language

  getAllTextLanguages: (payload) => config('post', 'slanguage', payload),
  getAllTextLanguagesWithMenu: (payload) =>
    config('post', 'language-setting/search', payload),
  getKeyCodeLanguages: (language) =>
    config('get', `slanguage/lang?lang=${language}`),
  getOptionsLanguageName: (language) =>
    config('get', `slanguage/lang-name?lang=${language}`),
  saveLanguageName: (params) =>
    config(
      'get',
      `slanguage/save?isValid=${params.isValid}&languageId=${params.languageId}`
    ),
  updateTextLanguage: (payload) => config('post', 'slanguage/update', payload),

  // Attachment Browse

  getListAttachmentBrowse: (payload) =>
    config('post', 'attachment-its/search', payload),

  exportExcelAttachmentBrowse: (payload) =>
    config('post', 'attachment-its/excel', payload),

  // Configurations
  saveBill: (payload) => config('post', 'system/bill-save', payload),
  saveDigit: (payload) => config('post', 'system/digit-save', payload),
  getAllConfigs: (payload) => config('get', 'system/config', payload),
  updateCheckStatus: (payload) => config('post', 'system/setUncheck', payload),
  importHolidayCalendar: (payload) =>
    config('post', 'calendar/import', payload, {
      'Content-Type': 'multipart/form-data',
    }),
  updateBarcodeSettings: (payload) => config('post', 'system/barcodeSet', payload),
  // Security

  getAllSecurityHome: (payload) => config('post', `security/home`, payload),
  updateSecurityByUserGroup: (payload) =>
    config('put', 'security/update', payload),
  getPageNameSet: (userGroupID) =>
    config('get', `security/pageNameSet?userGroupId=${userGroupID}`),
  updatePageNameSetting: (payload) =>
    config('put', 'security/pageNameSet/update', payload),
  getUserInGroup: (groupID) =>
    config('get', `security/getUserInGroup?groupID=${groupID}`),

  // Barcode Management
  getPrinterSettings: (payload) => config('get', 'barcode-management/printer', payload),
  savePrinterSettings: (payload) => config('post', 'barcode-management/printer/save', payload),
})
export default api
