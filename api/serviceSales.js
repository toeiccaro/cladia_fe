import { get } from 'lodash'

const api = (config) => ({
  // Quotation
  getQuotation: (payload) => config('post', 'quotation', payload),
  getQuotationById: (payload) => config('get', 'quotation/' + payload),
  checkQuotation: (payload) => config('put', `quotation/check/${payload}`),
  uncheckQuotation: (payload) => config('put', `quotation/uncheck/${payload}`),
  updateQuotation: (payload) =>
    config('put', `quotation/edit/${payload.orderNumber}`, payload.data),
  addQuotation: (payload) => config('post', `quotation/add`, payload),
  deleteQuotation: (payload) =>
    config('delete', `quotation/delete?qouteNO=${payload.quoteNO}`),
  deleteQuotationItemByLineId: (params) =>
    config(
      'delete',
      `quotation/deleteDetail/${params.quoteNO}/deleteIdList?${params.deleteIdList}`
    ),
  exportExcelQuotation: (payload) => config('post', 'quotation/excel', payload),
  exportExcelQuotationDetail: (payload) => {
    const urlQuery = new URLSearchParams()

    const lang = get(payload, 'lang', 'english')
    const quoteNo = get(payload, 'quoteNo')
    const listDetails = get(payload, 'listDetails', [])

    if (lang) {
      urlQuery.set('lang', lang)
    }

    return config(
      'post',
      `quotation/exportDetail/${quoteNo}?${urlQuery}`,
      listDetails
    )
  },
  generateSaleOrder: (payload) => config('post', 'quotation/generate/' + payload),
  getQuotationDetailColumn: () => config('get', 'quotation/getSColumnHide'),

  // Sale Order
  getOrders: (payload) => config('post', `orders`, payload),
  getOrderById: (payload) => config('get', 'orders/' + payload),
  deleteOrder: (params) => config('delete', `orders/${params.soNo}/delete`),
  checkOrder: (payload) => config('put', `orders/${payload}/check-order`),
  uncheckOrder: (payload) => config('put', `orders/${payload}/uncheck-order`),
  editOrder: (payload) => config('put', 'orders/edit', payload),
  exportOrder: (payload) => config('post', `orders/excel`, payload),
  addOrder: (payload) => config('post', 'orders/add', payload),
  importOrder: (payload) => config('post', 'orders/import', payload),
  getModeImport: (params) => config('get', `orders/mode?lang=${params.lang}`),
  getShowQty: (params) =>
    config('get', `orders/showQty?itemID=${params.itemID}`),
  deleteItemDetailSaleOrder: (params) =>
    config(
      'delete',
      `orders/${params.SONO}/deleteDetail?${params.deleteIdList}`
    ),
  getPriceOrder: (params) =>
    config(
      'get',
      `orders/getPrice?customerID=${params.customerID}&itemID=${params.itemID}&quantity=${params.quantity}`
    ),
  getOrderDetailColumn: () => config('get', 'orders/getSColumnHide'),

  // Sale View
  getViews: (payload) => config('post', 'salesView', payload),
  exportView: (payload) => config('post', 'salesView/excel', payload),

  stopView: (params) => {
    return config(
      'post',
      `salesView/stop?lineID=${params.lineID}&sono=${params.sono}`
    )
  },

  // Invoice
  getInvoicesImportList: (payload) => config('post', 'invoice/import', payload),
  getInvoices: (payload) => config('post', 'invoice', payload),
  getInvoicePackingListDetail: (payload) =>
    config('get', 'invoice/packing-list-detail', payload),
  getInvoicePackingList: (payload) => {
    const urlQuery = new URLSearchParams()

    const invoiceNo = get(payload, 'invoiceNo', 0)
    const lang = get(payload, 'lang', '')

    if (invoiceNo) {
      urlQuery.set('invoiceNo', invoiceNo)
    }

    if (lang) {
      urlQuery.set('lang', lang)
    }

    return config('get', `invoice/packing-list?${urlQuery}`)
  },
  addNewInvoice: (payload) => config('post', 'invoice/add', payload),
  updateInvoice: (payload) => config('post', 'invoice/update-detail', payload),
  deleteInvoice: (params) => {
    const urlQuery = new URLSearchParams()

    for (const key in params) {
      urlQuery.set(key, params[key])
    }

    return config('delete', `invoice/delete-salesInvoice?${urlQuery}`)
  },
  deleteInvoiceDetails: (params) =>
    config('post', `invoice/${params.invoiceNo}/delete-detail`, [
      params.lineId,
    ]),
  exportInvoice: (payload) => config('post', 'invoice/excel', payload),
  getInvoiceDetails: (payload) => {
    const urlQuery = new URLSearchParams()

    const invoiceNo = get(payload, 'invoiceNo', '')

    if (invoiceNo) {
      urlQuery.set('invoiceNo', invoiceNo)
    }
    return config('get', `invoice/detail?${urlQuery}`)
  },
  checkInvoice: (payload) => {
    const urlQuery = new URLSearchParams()

    const invoiceNo = get(payload, 'invoiceNo', 0)

    if (invoiceNo) {
      urlQuery.set('invoiceNo', invoiceNo)
    }

    return config('get', `invoice/check?${urlQuery}`)
  },
  uncheckInvoice: (payload) => {
    const urlQuery = new URLSearchParams()

    const invoiceNo = get(payload, 'invoiceNo', 0)

    if (invoiceNo) {
      urlQuery.set('invoiceNo', invoiceNo)
    }

    return config('get', `invoice/unCheck?${urlQuery}`)
  },
  printInvoice: (params) => config('get', `invoice/print?${params}`),
  printInvoicePackingList: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }
    return config('get', `invoice/print-packing?${urlQuery}`)
  },
  addContainerNO: (payload) =>
    config('post', `invoice/packing-list/add-container`, payload),

  // Statement
  getStatements: (payload) => config('post', 'statement', payload),
  exportStatement: (payload) =>
    config('post', 'statement/export-excel', payload),
  getCustomerName: () => config('get', 'enterprise/customerName'),
  addStatement: (payload) => config('post', 'statement/add', payload),
  getDetailStatement: (params) =>
    config('get', `statement/${params.statementNo}`),
  deleteStatement: (params) =>
    config('delete', `statement/delete/${params.statementNo}`),
  queryStatement: (payload) =>
    config('post', 'statement/statementImport', payload),

  // DN Browse
  searchDNBrowse: (payload) => config('post', `DNBrowse`, payload),
  exportDNBrowse: (payload) => config('post', 'DNBrowse/excel', payload),

  // Sale Return
  getListSaleReturn: (payload) => config('post', 'sale-returns', payload),
  addSaleReturn: (payload) => config('post', 'sale-returns/add', payload),
  updateSaleReturn: (payload) =>
    config('put', `sale-returns/edit?rtNO=${payload.rtNO}`, payload.mainForm),

  deleteSaleReturn: (returnNumber) =>
    config('delete', `sale-returns/${returnNumber}`),

  exportExcelSaleReturn: (payload) =>
    config('post', 'sale-returns/excel', payload),
  getDetailSaleReturn: (returnNumber) =>
    config('get', `sale-returns/${returnNumber}`),
  checkSaleReturn: (returnNumber) =>
    config('put', `sale-returns/${returnNumber}/check`),
  unCheckSaleReturn: (returnNumber) =>
    config('put', `sale-returns/${returnNumber}/unCheck`),
  importSaleReturn: (payload) =>
    config(
      'post',
      `sale-returns/import?customerID=${payload.form.customerID}`,
      payload.form
    ),

  // Sale Price
  getSalePrices: (payload) => config('post', 'sales-price', payload),
  exportExcelSalePrice: (payload) =>
    config('post', 'sales-price/export-excel', payload),
  exportExcelSalePricePriceAnalysis: (payload) =>
    config('post', 'sales-price/export-excel-priceAnalysis', payload),
  addSalePrice: (payload) => config('post', 'sales-price/add', payload),
  deleteSalePrice: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }
    return config('delete', `sales-price/delete?${urlQuery}`)
  },
  deleteSalePriceDetail: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('delete', `sales-price/delete-detail?${urlQuery}`)
  },
  getSalePrice: (payload) => config('get', 'sales-price/detail', payload),
  updateSalePriceDetail: (payload) =>
    config('put', `sales-price/edit`, payload),
  batchAddSalePrice: (payload) =>
    config('post', 'sales-price/batch-add', payload),

  // receive-browse-controller
  addARRB: (payload) => config('post', '/receive-browse/addAR', payload),
  getDetailRB: (payload) =>  {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('get', `/receive-browse/detailAR?${urlQuery}`)
  },
    
  editRB: (payload) => config('put', '/receive-browse/detail/editAR', payload),

  deleteRB: (payload) => config('delete', '/receive-browse/delete-detail', payload),
  checkRB: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('get', `/receive-browse/detailAR/check?${urlQuery}`)
  },
  uncheckRB: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('get', `/receive-browse/detailAR/unCheck?${urlQuery}`)
  },
  // pay-browse-controller
  addAPPB: (payload) => config('post', '/pay-browse/addAP', payload),
  getDetailPB: (payload) =>  {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('get', `/pay-browse/detailAP?${urlQuery}`)
  },
  editPB: (payload) => config('put', '/pay-browse/detail/editAP', payload),

  deletePB: (payload) => config('delete', '/pay-browse/delete-detail', payload),
  checkPB: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('get', `/pay-browse/detailAP/check?${urlQuery}`)
  },
  uncheckPB: (payload) => {
    const urlQuery = new URLSearchParams()

    for (const key in payload) {
      if (payload[key]) {
        urlQuery.set(key, payload[key])
      }
    }

    return config('get', `/pay-browse/detailAP/unCheck?${urlQuery}`)
  },
})
export default api
