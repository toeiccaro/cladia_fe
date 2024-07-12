const api = (config) => ({
  // Scolumns
  getPurchaseScolumns: (payload) => config('get', 'getScolumn', payload),
  // Purchase Browse
  getListPurchaseBrowse: (payload) =>
    config('post', 'purchase/browse', payload),
  exportExcelPurchaseBrowse: (payload) =>
    config('post', 'purchase/export-excel', payload),
  stopPurchaseBrowse: (params) =>
    config(
      'get',
      `purchase/stop?lang=${params.lang}&poLineId=${params.poLineID}&pono=${params.pono}&supplierID=${params.supplierID}`
    ),

  // Purchase Order
  getListCompanyTypeOther: (payload) =>
    config('get', 'purchaseOrder/getCompanyTypeOther', payload),
  printPurchaseOrder: (payload) =>
    config(
      'post',
      `purchaseOrder/print?language=${payload.language}&orderNO=${payload.orderNO}`,
      payload
    ),
  getListPurchaseOrder: (payload) => config('post', 'purchaseOrder', payload),
  exportExcelPurchaseOrder: (payload) =>
    config('post', 'purchaseOrder/excel', payload),
  importPurchaseOrder: (payload) =>
    config('post', 'purchaseOrder/import', payload),
  addPurchaseOrder: (payload) => config('post', 'purchaseOrder/add', payload),
  getDetailPurchaseOrder: (params) =>
    config('get', `purchaseOrder/detail/${params.pono}?lang=${params.lang}`),
  deletePurchaseOrder: (params) =>
    config('delete', `purchaseOrder/delete?pONO=${params.pono}`),
  checkPurchaseOrder: (purchaseNumber) =>
    config('put', `purchaseOrder/check?pONO=${purchaseNumber}`),
  unCheckPurchaseOrder: (purchaseNumber) =>
    config('put', `purchaseOrder/uncheck?pONO=${purchaseNumber}`),
  updatePurchaseOrder: (payload) =>
    config('put', `purchaseOrder/edit/${payload.purchaseNumber}`, payload.form),
  getPurchaseOrderPrice: (payload) =>
    config('get', `purchaseOrder/getPrice`, payload),

  // Purchase Arrival
  addPurchaseArrival: (payload) =>
    config('post', 'purchaseArrival/add', payload),
  updatePurchaseArrival: (payload) =>
    config('post', `purchaseArrival/edit/${payload.receiptNO}`, payload),
  getPurchaseArrivalImport: (payload) =>
    config('post', `purchaseArrival/import/${payload.supplierID}`, payload),
  getListPurchaseArrival: (payload) =>
    config('post', 'purchaseArrival', payload),
  exportExcelPurchaseArrival: (payload) =>
    config('post', 'purchaseArrival/excel', payload),
  getDetailPurchaseArrival: (params) =>
    config('get', `purchaseArrival/${params.receiptNo}?lang=${params.lang}`),
  deletePurchaseArrival: (params) =>
    config('delete', `purchaseArrival/delete?receiptNO=${params.receiptNO}`),
  deletePurchaseArrivalDetail: (params) =>
    config('delete', `purchaseArrival/deleteDetail`, params),
  checkPurchaseArrival: (receiptNo) =>
    config('put', `purchaseArrival/check?receiptNO=${receiptNo}`),
  unCheckPurchaseArrival: (receiptNo) =>
    config('put', `purchaseArrival/uncheck?receiptNO=${receiptNo}`),
  getPurchaseArrivalMode: (payload) =>
    config('get', 'purchaseArrival/mode', payload),
  readPurchaseArrivalExcel: (payload) =>
    config('post', 'purchaseArrival/importExcel', payload, {
      'Content-Type': 'multipart/form-data',
    }),
  generateQRCodeLabel: (payload) =>
    config('post', `printBarcode/print?${payload.param}`, payload.data),
  // Purchase Invoice
  getListPurchaseInvoice: (payload) =>
    config('post', 'purchase-invoice', payload),
  getPurchaseInvoiceImportList: (payload) =>
    config('post', `purchase-invoice/import/${payload.supplierId}`, payload),
  addPurchaseInvoice: (payload) => {
    const supplierId = payload?.supplierId

    return config(
      'post',
      `purchase-invoice/${supplierId}/save`,
      payload.payloadDetails
    )
  },
  updatePurchaseInvoice: (payload) =>
    config('post', `purchase-invoice/saveOrUpdate`, payload),
  exportExcelPurchaseInvoice: (payload) =>
    config('post', 'purchase-invoice/excel', payload),
  checkPurchaseInvoice: (payload) =>
    config('get', 'purchase-invoice/check', payload),
  unCheckPurchaseInvoice: (payload) =>
    config('get', 'purchase-invoice/unCheck', payload),
  deletePurchaseInvoice: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('delete', `purchase-invoice/delete?${urlQuery}`, payload)
  },
  deletePurchaseInvoiceDetails: (payload) => {
    const lineIds = payload?.lineIDs || []
    const pInvoiceNO = payload?.pInvoiceNO

    return config(
      'delete',
      `purchase-invoice/${pInvoiceNO}/delete-detail`,
      lineIds
    )
  },
  getPurchaseInvoice: (payload) =>
    config('get', 'purchase-invoice/detail', payload),

  // Purchase Return
  getListPurchaseReturn: (payload) => config('post', 'purchaseReturn', payload),
  exportExcelPurchaseReturn: (payload) =>
    config('post', 'purchaseReturn/excel', payload),
  getDetailPurchaseReturn: (params) =>
    config(
      'get',
      `purchaseReturn/detail/${params.returnNo}?lang=${params.lang}`
    ),
  checkPurchaseReturn: (returnNO) =>
    config('put', `purchaseReturn/check?returnNO=${returnNO}`),
  unCheckPurchaseReturn: (returnNO) =>
    config('put', `purchaseReturn/uncheck?returnNO=${returnNO}`),
  deletePurchaseReturn: (params) =>
    config('delete', `purchaseReturn/delete?returnNO=${params.returnNo}`),
  updatePurchaseReturn: (payload) =>
    config('put', `purchaseReturn/edit/${payload.returnNo}`, payload),
  addPurchaseReturn: (payload) => config('post', `purchaseReturn/add`, payload),
  getImportPurchaseReturn: (payload) =>
    config('post', `purchaseReturn/import/${payload.supplierID}`, payload),

  // Purchase Price
  getListPurchasePrice: (payload) => config('post', 'fpoPrice/search', payload),
  exportPurchasePrice: (payload) => config('post', 'fpoPrice/excel', payload),
  addPurchasePrice: (payload) => config('post', 'fpoPrice/add', payload),
  deletePurchasePrice: (payload) => config('get', 'fpoPrice/delete', payload),
  deletePurchasePriceDetail: (payload) =>
    config('post', `fpoPrice/deleteDetail/${payload.supplierId}`, payload),
  getPurchasePriceDetail: (payload) =>
    config('get', 'fpoPrice/detail', payload),
  updatePurchasePrice: (payload) => config('post', 'fpoPrice/edit', payload),

  // Purchase RN Browse
  getListPurchaseRNBrowse: (payload) => config('post', 'purchase/rn-browse/search', payload),
  exportPurchaseRNBrowse: (payload) => config('post', 'purchase/rn-browse/export', payload),
})
export default api
