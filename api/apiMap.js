const api = (config) => ({
  login: (user) => config('post', 'login', user, {}),
  logout: () => config('post', 'logout', '', {}),
  getUserInfo: () => config('get', 'user-info', '', {}),
  getLanguage: () => config('get', 'language', '', {}),
  getDecentralization: () => config('get', 'permission-list', '', {}),
  getListTimeZone: () => config('get', 'time-zones'),
  updateUserInfo: (payload) => config('put', 'user-info', payload),

  // column hides

  getScolumnHideDetail: (gridName) =>
    config('get', `getScolumn?gridName=${gridName}`),

  // Attachment
  uploadAttachment: (payload) =>
    config('post', 'attachment-its/file-upload', payload),
  deleteAttachment: (payload) =>
    config('delete', 'attachment-its/delete/' + payload.id),
  // Parameter
  deleteParameter: (params) =>
    config(
      'get',
      `parameter/delete?keyCode=${params.keyCode}&keyId=${params.keyId}`
    ),
  updateParameter: (payload) => config('post', 'parameter/update', payload),
  addParameter: (payload) => config('post', 'parameter/save', payload),
  getParameter: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('get', `parameter/keyCode?${urlQuery}`)
  },
  getParameterLanguage: (payload) =>
    config('post', `parameter/keyCodes?keyCode=${payload.keyCode}`, payload),
  getParameterKeyCodeName: () => config('get', 'parameter/key-code-name'),
  searchKeyCodeName: (payload) =>
    config(
      'get',
      `parameter/key-code-name-search?language=${payload.language}&searchValue=${payload.searchValue}`
    ),
  // Item master

  getItemMaster: (payload) => {
    return config('post', `item-master`, payload)
  },
  getItemType: () => config('get', 'item-master/item-type'),
  getProductName: () => config('get', 'item-master/itemName'),
  addItemMaster: (payload) => config('post', 'item-master/add-item', payload),
  updateColumnItemMaster: (payload) =>
    config('post', 'item-master/update-column-set', payload),
  editItemMaster: (payload) => config('put', 'item-master/edit', payload),
  exportItemMaster: (payload) =>
    config('post', 'item-master/export-excel', payload),
  deleteItemMaster: (params) =>
    config(
      'delete',
      `item-master/delete?subId=${params.subId}&groupId=${params.groupId}&itemId=${params.itemId}`
    ),
  getDetailItemMaster: (params) =>
    config('get', `item-master/${params.itemMasterId}`),
  uploadFilePicture: (payload) =>
    config('post', 'item-master/file-upload', payload, {
      'Content-Type': 'multipart/form-data',
    }),
  updateColumn: (payload) => config('post', 'update-column-set', payload),
  clearItemMasterImage: (payload) =>
    config('get', 'item-master/clear-image', payload),
  getItemMasterRecord: (itemCode) =>
    config('get', `item-master/record?itemIdOptional=${itemCode}`),
  addItemMasterRecord: (payload) =>
    config('post', 'item-master/record/add', payload),
  editItemMasterRecord: (payload) =>
    config('put', 'item-master/record/edit', payload),
  deleteItemMasterRecord: (payload) =>
    config(
      'delete',
      'item-master/record/delete?itemId=' +
        payload.itemId +
        '&lineId=' +
        payload.lineId
    ),

  getPriceAnalysis: (payload) =>
    config('post', 'item-master/priceAnalysis', payload),
  exportExcelPriceAnalysis: (payload) =>
    config('post', 'item-master/export-excel-priceAnalysis', payload),
  getItemCode: () => config('get', 'item-master/itemCode'),

  // manufacturing information
  getManufacturingInformation: (itemId) =>
    config('get', `manufacturing-information/?itemId=${itemId}`),

  saveManufacturingInformation: (payload) =>
    config('post', 'manufacturing-information/save', payload),

  // inspection information
  getInspectionInformation: (itemId) =>
    config('get', `inspection-information/?itemId=${itemId}`),
  saveInspectionInformation: (payload) =>
    config('post', 'inspection-information/save', payload),

  // exchange rate
  getExchangeRate: (payload) => config('post', 'exchange', payload),
  addExchangeRate: (payload) => config('post', 'exchange/add', payload),
  deleteExchangeRate: (rateID) =>
    config('post', `exchange/delete?rateID=${rateID}`),
  updateExchangeRate: (payload) => config('post', 'exchange/edit', payload),
  getExchangeRateDetail: (rateId) =>
    config('get', `exchange/detail?rateId=${rateId}`),
  // Box
  getBox: (payload) => config('post', 'box', payload),
  addBox: (payload) => config('post', 'box/add', payload),
  getBoxDetail: (boxId) => config('get', `box/detail/${boxId}`),
  exportExcelBox: (payload) => config('post', 'box/excel', payload),
  updateBox: (payload) => config('put', 'box/update', payload),
  deleteBox: (systemID) => config('post', `box/delete/${systemID}`),
  // Enterprise
  getEnterpriseMaster: (payload) => config('post', 'enterprise', payload),
  getEnterpriseCustomerNames: (payload) =>
    config('get', 'enterprise/customerName', payload),
  getEnterpriseMasterById: (payload) => config('get', `enterprise/${payload}`),
  addEnterpriseMaster: (payload) => config('post', 'enterprise/add', payload),
  deleteEnterpriseMaster: (params) =>
    config('delete', `enterprise/delete/${params.companyCode}`),
  exportExcelEnterprise: (payload) =>
    config('post', 'enterprise/export-excel', payload),
  updateItemEnterprise: (payload) => config('put', `enterprise/edit`, payload),
  getCompany: (payload) => config('get', 'company', payload),
  addEnterpriseRecord: (payload) =>
    config('post', 'enterprise/record/add', payload),
  editEnterpriseRecord: (payload) =>
    config('put', 'enterprise/record/edit', payload),
  deleteEnterpriseRecord: (payload) =>
    config('delete', 'enterprise/record/delete?recordID=' + payload),
  getRelatedCompany: () => config('get', 'enterprise/relateCompanyList'),
  getSupplierName: () => config('get', 'enterprise/supplierName'),
  getMixedSupplierName: (payload) => config('get', 'enterprise/mixedCompany', payload),
  // Employee
  clearCompanyImage: () => config('get', 'company/clear-image'),
  editCompany: (payload) => config('post', 'company/edit', payload),
  getEmployeeMove: (payload) => config('get', 'employeeMove', payload),
  addEmployeeMove: (payload) => config('post', 'employeeMove/add', payload),
  deleteEmployeeMove: (payload) =>
    config('delete', 'employeeMove/delete', payload, null, payload),
  editEmployeeMove: (payload) => config('put', 'employeeMove/edit', payload),
  getEmployee: (payload) => config('post', 'employee', payload),
  addEmployeeMaster: (payload) =>
    config('post', 'employee/add-item', payload, {
      'Content-Type': 'multipart/form-data',
    }),
  getEmployeeMasterDetail: (employeeID) =>
    config('post', `employee/${employeeID}`),

  updateEmployeeMaster: (payload) =>
    config('post', 'employee/edit', payload, {
      'Content-Type': 'multipart/form-data',
    }),
  deleteEmployeeMaster: (employeeID) =>
    config('delete', `employee/delete/${employeeID}`),

  exportExcelEmployee: (payload) =>
    config('post', 'employee/exportExcel', payload),
  // Inventory Adjustment
  getInventoryAdjustment: (payload) =>
    config('post', `InvAdjustment?type=${payload.type}`, payload.form),
  exportExcelAdjustment: (payload) =>
    config('post', `InvAdjustment/excel?type=${payload.type}`, payload.form),
  printExcelAdjustment: (payload) =>
    config('get', 'InvAdjustment/ExcelInventory', payload),
  getDepartment: (payload) =>
    config('get', 'InvAdjustment/department', payload),
  getDetailInventoryAdjustment: (params) =>
    config('get', `InvAdjustment/detail/${params.orderNO}`),
  deleteInventoryAdjustment: (payload) =>
    config('delete', `InvAdjustment/delete?orderNO=${payload.orderNO}`),
  getInventoryItemField: (payload) =>
    config('get', 'InvAdjustment/itemField', payload),
  addInventoryAdjustment: (payload) =>
    config('post', `InvAdjustment/add?type=${payload.type}`, payload.form),

  updateInventoryAdjustment: (payload) => {
    return config(
      'put',
      `InvAdjustment/edit?lang=${payload.lang}&type=${payload.type}`,
      payload.form
    )
  },
  getEmployeeList: () => config('get', 'InvAdjustment/employeeList'),
  printInventoryAdjustmentDetails: (payload) =>
    config('post', 'InvAdjustment/print', payload),

  // Inventory Query
  getSheetDetail: (payload) => config('post', 'inventory/sheet', payload),
  querySearchInventory: (payload) => config('post', 'inventory/query', payload),
  getOrderType: () => config('get', 'inventory/getOrderType'),
  exportInventoryQuery: (payload) =>
    config('post', 'inventory/export', payload),
  // Inventory Import
  getFileDefaultExcel: (lang) =>
    config('get', `inventory/downLoadExcel?lang=${lang}`),
  importFileInventoryInport: (payload) =>
    config('post', 'inventory/import', payload, {
      'Content-Type': 'multipart/form-data',
    }),
  importFileInventorySave: (payload) =>
    config('post', 'inventory/save', payload),
  // Receive Browse
  receiveBrowseBatchCollection: (payload) =>
    config('post', 'receive-browse/batchCollection', payload),
  checkReceiveBrowses: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('get', `receive-browse/check?${urlQuery}`)
  },
  unCheckReceiveBrowses: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('get', `receive-browse/unCheck?${urlQuery}`)
  },
  getReceiveBrowses: (payload) => config('post', 'receive-browse', payload),
  editReceiveBrowseDetails: (payload) =>
    config('put', `receive-browse/edit-detail`, payload),
  exportReceiveBrowse: (payload) =>
    config('post', 'receive-browse/export-excel', payload),
  getReceiveBrowseDetailsById: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('get', `receive-browse/edit/findById?${urlQuery}`)
  },
  searchReceiveBrowseByOrderNo: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }
    return config('get', `receive-browse/home-details?${urlQuery}`)
  },
  deleteReceiveBrowseDetail: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('delete', `receive-browse/delete-detail?${urlQuery}`, payload)
  },

  // Stock Detail
  getListStockDetail: (payload) => config('post', 'stock_detail', payload),
  exportExcelStock: (payload) => config('post', 'stock_detail/excel', payload),

  // Product BOM
  getBOM: (payload) => config('post', 'bom', payload),
  getBOMChild: (payload) =>
    config(
      'get',
      `bom/get-child?id=${payload.id}&language=${payload.language}&level=${payload.level}`
    ),
  exportExcelBOM: (payload) => config('post', 'bom/export-excel', payload),
  exportExcelBOMReverse: (payload) =>
    config('post', 'bom-reverse/excel', payload),

  deleteBOM: (payload) =>
    config(
      'delete',
      `bom/delete?parentItemId=${payload.parentItemId}`,
      payload
    ),
  getBOMDetail: (payload) => config('get', 'bom/detail', payload),
  saveBOM: (payload) => config('post', 'bom/save', payload),
  updateBOM: (payload) => config('put', 'bom/update', payload),
  deleteBOMDetail: (payload) => config('delete', `bom/delete-detail`, payload),

  // Product BOM reverse
  getBOMReverse: (payload) => config('post', 'bom-reverse', payload),
  getBOMReverseChild: (payload) =>
    config(
      'get',
      `bom-reverse/get-child?id=${payload.id}&language=${payload.language}&level=${payload.level}`
    ),

  // Email set
  createBEmailSet: (payload) =>
    config('post', 'emailSet/createBEmailSet', payload),
  getByEmployeeIdAndModuleId: (payload) =>
    config('get', 'emailSet/getByEmployeeIDAndModuleID', payload),
  getEmailHost: (payload) => config('get', 'emailSet/getEmailHost', payload),
  getListModuleIds: (payload) =>
    config('get', 'emailSet/getListModuleID', payload),
  getListEmailSets: (payload) => config('post', 'emailSet/search', payload),
  updateEmailSet: (payload) => config('post', 'emailSet/update', payload),
  updateBEmailSet: (payload) =>
    config(
      'post',
      `emailSet/updateBEmailSet/${payload.employeeID}/${payload.moduleID}`,
      payload
    ),

  // common
  getScolumnHides: (payload) =>
    config('get', `getScolumn?gridName=${payload.gridName}`),

  // Calendar
  getListEvents: (payload) =>
    config(
      'get',
      `calendar/search?startDate=${payload.startDate}&endDate=${payload.endDate}`
    ),
  getDetailEvent: (payload) =>
    config('get', `calendar/detail/${payload.scheduleId}`),
  addEvent: (payload) => config('post', 'calendar/save', payload),
  updateEvent: (payload) =>
    config('post', `calendar/update/${payload.scheduleId}`, payload),
  deleteEvent: (payload) =>
    config('delete', `calendar/delete/${payload.scheduleId}`),

  getActiveButtonByKeyCode: (payload) =>
    config('get', `active-button-info?keyCode=${payload.keyCode}`),

  getHolidayCalendar: (params) =>
    config(
      'get',
      `calendar/getRestDate?endDate=${params.endDate}&startDate=${params.startDate}`
    ),
  updateHoliday: (payload) => config('post', 'calendar/updateHoliday', payload),
  // security
  getMenuSidebar: (payload) =>
    config('get', `security/getMenuCanUsing?key=${payload.key}`),
  getDashboardConfig: (params) =>
    config(
      'get',
      `config/dashboard/getPagesByGroup?groupID=${params.groupId}&userRoleID=${params.userRoleId}`
    ),
  updateDashboardConfig: (payload) =>
    config('post', `config/dashboard/update`, payload),

  // dashboard
  getPlanDashboard: (sortType) =>
    config('get', `dashboard/getPlan?sortType=${sortType}`),
  getOrderUnCheck: (params) =>
    config(
      'get',
      `dashboard/getOrderUnCheck?id=${params.pageName}&sortType=${params.sortType}`
    ),
  getPromiseDatePurchase: (date) =>
    config('get', `dashboard/getPromiseDatePurchase?date=${date}`),
  getPromiseDateSales: (date) =>
    config('get', `dashboard/getPromiseDateSales?date=${date}`),
  getPromiseDateOutward: (date) =>
    config('get', `dashboard/getPromiseDateOutward?date=${date}`),
  getPromiseDateProduction: (params) =>
    config(
      'get',
      `dashboard/getPromiseDateProduction?date=${params.date}&language=${params.language}`
    ),
  getTaskToday: (params) => config('get', `dashboard/getTaskToday`),
  getRevenueSaleOrder: () => config('get', 'dashboard/getRevenuesSaleOrder'),
  getRevenueSaleInvoice: () => config('get', 'dashboard/getRevenuesInvoice'),
  getListConfigDashboard: () =>
    config('get', 'config/dashboard/getConfigByUser'),
  getListDashboardPosition: (userId) =>
    config('get', `config/dashboard/getCardPosition`),
  updateDashboardPosition: (payload) =>
    config('post', `config/dashboard/savePosition`, payload),
  getApprovalPendingOptions: () => config('get', 'dashboard/getListCanUsing'),
  getAllApprovalPending: () =>
    config('get', `dashboard/getAllApprovalPending?sortType=asc`),
})

export default api
