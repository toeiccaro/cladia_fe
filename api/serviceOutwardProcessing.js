const api = (config) => ({
  // Common Supplier

  getListCompanyByCondition: (params) =>
    config('get', `enterprise/company?companyType=${params.companyType}`),

  // Outward Delivery
  getOutwardDelivery: (payload) => config('post', `outwardDelivery`, payload),
  printOutwardDelivery: (payload) =>
    config('get', `outwardDelivery/print`, payload),
  getImportOutwardDelivery: (payload) =>
    config(
      'post',
      `outwardDelivery/import?supplierId=${payload.supplierID}`,
      payload
    ),
  getOutwardBomCompute: (payload) =>
    config('post', `outwardDelivery/bomCompute`, payload),
  getOutwardDeliveryDetail: (payload) =>
    config('get', `outwardDelivery/detail`, payload),
  exportOutwardDelivery: (payload) =>
    config('post', `outwardDelivery/export`, payload),
  addOutwardDelivery: (payload) =>
    config('post', `outwardDelivery/add?language=${payload.language}`, payload),
  checkOutwardDelivery: (payload) =>
    config('get', `outwardDelivery/check?orderNo=${payload.orderNo}`),
  unCheckOutwardDelivery: (payload) =>
    config('get', `outwardDelivery/uncheck?orderNo=${payload.orderNo}`),
  deleteOutwardDelivery: (payload) =>
    config('delete', `outwardDelivery/delete?orderNo=${payload.orderNo}`),
  editOutwardDelivery: (payload) =>
    config(
      'put',
      `outwardDelivery/edit?language=${payload.language}&orderNo=${payload.orderNo}`,
      payload
    ),

  // Outward Warehousing
  getOutwardWarehousing: (payload) =>
    config('post', `outward-warehousing`, payload),
  getImportOutwardWarehousing: (payload) =>
    config('post', `outward-warehousing/import`, payload),
  getOutwardWarehousingDetail: (payload) =>
    config('get', `outward-warehousing/detail`, payload),
  exportOutwardWarehousing: (payload) =>
    config('post', `outward-warehousing/export-excel`, payload),
  addOutwardWarehousing: (payload) =>
    config('post', `outward-warehousing/add?language=${payload.lang}`, payload),
  checkOutwardWarehousing: (payload) =>
    config('get', `outward-warehousing/check?orderNumber=${payload.orderNo}`),
  unCheckOutwardWarehousing: (payload) =>
    config('get', `outward-warehousing/unCheck?orderNumber=${payload.orderNo}`),
  deleteOutwardWarehousing: (payload) =>
    config(
      'delete',
      `outward-warehousing/delete?orderNumber=${payload.orderNo}`
    ),
  editOutwardWarehousing: (payload) =>
    config(
      'put',
      `outward-warehousing/update?language=${payload.lang}&orderNumber=${payload.orderNo}`,
      payload
    ),

  // Outward Order
  getListOutwardOrder: (payload) =>
    config('post', 'outward-order/search', payload),
  printOutwardOrder: (payload) => config('get', 'outward-order/print', payload),
  exportExcelOutwardOrder: (payload) =>
    config('post', 'outward-order/export', payload),
  getDetailOutwardOrder: (params) =>
    config(
      'get',
      `outward-order/detail?language=${params.language}&orderNo=${params.orderNo}`
    ),

  deleteOutwardOrder: (orderNo) =>
    config('delete', `outward-order/delete/${orderNo}`),

  addOutwardOrder: (payload) =>
    config(
      'post',
      `outward-order/add?language=${payload.language}`,
      payload.form
    ),
  updateOutwardOrder: (payload) =>
    config(
      'put',
      `outward-order/update?language=${payload.language}&orderNo=${payload.orderNo}`,
      payload.form
    ),

  UnCheckOutwardOrder: (orderNo) =>
    config('get', `outward-order/unCheck?orderNo=${orderNo}`),
  checkOutwardOrder: (orderNo) =>
    config('get', `outward-order/check?orderNo=${orderNo}`),
  outwardOrderimportToExcel: (payload) => { 
    console.log("payloadpayload=", payload)
    return config('post', 'outward-order/import-to-excel', payload)
  },

  // Outward Return
  getListOutwardReturn: (payload) =>
    config('post', 'outward-return/search', payload),
  getDetailOutwardReturn: (params) =>
    config(
      'get',
      `outward-return/detail?language=${params.language}&orderNo=${params.orderNo}`
    ),
  addOutwardReturn: (payload) => {
    return config(
      'post',
      `outward-return/add?language=${payload.language}`,
      payload
    )
  },
  getOutwardReturnImportList: (payload) =>
    config(
      'post',
      `outward-return/import?customerID=${payload.supplierID}`,
      payload
    ),
  updateOutwardReturn: (payload) =>
    config(
      'put',
      `outward-return/update?language=${payload.language}&orderNo=${payload.orderNo}`,
      payload.form
    ),
  deleteOutwardReturn: (orderNo) =>
    config('delete', `outward-return/delete/${orderNo}`),
  unCheckOutwardReturn: (orderNo) =>
    config('get', `outward-return/unCheck?orderNo=${orderNo}`),
  checkOutwardReturn: (orderNo) =>
    config('get', `outward-return/check?orderNo=${orderNo}`),
  exportOutwardReturn: (payload) =>
    config('post', `outward-return/export`, payload),

  // Outward WPO Invoice
  getListOutwardInvoice: (payload) =>
    config('post', 'outward-invoice/search', payload),
  addOutwardInvoice: (payload) =>
    config(
      'post',
      `outward-invoice/add?language=${payload.language}`,
      payload.form
    ),
  updateOutwardInvoice: (payload) =>
    config(
      'put',
      `outward-invoice/edit?language=${payload.language}&orderNo=${payload.orderNo}`,
      payload.form
    ),
  getDetailOutwardInvoice: (params) =>
    config(
      'get',
      `outward-invoice/details?language=${params.language}&orderNo=${params.orderNo}`
    ),
  deleteOutwardInvoice: (orderNo) =>
    config('delete', `outward-invoice/delete?orderNo=${orderNo}`),
  UnCheckOutwardInvoice: (orderNo) =>
    config('get', `outward-invoice/uncheck?orderNo=${orderNo}`),
  checkOutwardInvoice: (orderNo) =>
    config('get', `outward-invoice/check?orderNo=${orderNo}`),
  exportExcelOutwardInvoice: (payload) =>
    config('post', 'outward-invoice/export', payload),
  getOutwardInvoiceImportList: (payload) =>
      config(
          'post',
          `outward-invoice/import?supplierId=${payload.supplierID}`,
          payload
      ),
})
export default api
