const api = (config) => ({
  // Production Order
  getProductionOrder: (payload) => config('post', `productionOrder`, payload),
  getDetailProductionOrder: (params) =>
    config(
      'get',
      `productionOrder/detail?language=${params.language}&orderNo=${params.orderNo}`
    ),
  addProductionOrder: (payload) =>
    config(
      'post',
      `productionOrder/add?language=${payload.language}`,
      payload.form
    ),
  editProductionOrder: (payload) =>
    config(
      'post',
      `productionOrder/edit?language=${payload.language}&orderNo=${payload.orderNo}`,
      payload.form
    ),
  bomComputeProductionOrder: (payload) =>
    config('post', `productionOrder/bomCompute`, payload),

  // new bom compute
  newBomComputeProductionOrder: (payload) =>  config(
    'get',
    `productionOrder/bomCompute?itemID=${payload.itemID}&language=${payload.language}&quantity=${payload.quantity}`,
  ),
  newDateComputeProductionOrder: (payload) =>  config(
    'post',
    `productionOrder/dateCompute?endDate=${payload.endDate}`,
    payload.form
  ),

  importProductionOrder: (payload) => 
    config(
      'post',
      `productionOrder/import?itemCode=${payload.mainItemCode}`,
      payload
    ),
  checkProductionOrder: (orderNo) =>
    config('get', `productionOrder/check?orderNo=${orderNo}`),
  unCheckProductionOrder: (orderNo) =>
    config('get', `productionOrder/uncheck?orderNo=${orderNo}`),
  deleteProductionOrder: (orderNo) =>
    config('delete', `productionOrder/delete?orderNo=${orderNo}`),
  printProductionOrder: (payload) =>
    config(
      'get',
      `/productionOrder/print?language=${payload.language}&orderNo=${payload.orderNo}`
    ),
  exportExcelProductionOrder: (payload) =>
    config('post', 'productionOrder/export', payload),
  // Material Delivery
  getMaterialDelivery: (payload) =>
    config('post', `material_delivery/search`, payload),
  getDetailMaterialDelivery: (params) =>
    config(
      'get',
      `material_delivery/detail?language=${params.language}&orderNo=${params.orderNo}`
    ),
  addMaterialDelivery: (payload) =>
    config(
      'post',
      `material_delivery/add?language=${payload.language}`,
      payload.form
    ),
  updateMaterialDelivery: (payload) =>
    config(
      'put',
      `material_delivery/update?language=${payload.language}&orderNo=${payload.orderNo}`,
      payload.form
    ),
  checkMaterialDelivery: (orderNo) =>
    config('get', `material_delivery/check?orderNo=${orderNo}`),
  unCheckMaterialDelivery: (orderNo) =>
    config('get', `material_delivery/unCheck?orderNo=${orderNo}`),
  deleteMaterialDelivery: (orderNo) =>
    config('delete', `material_delivery/delete/${orderNo}`),
  bomComputeMaterialDelivery: (params) =>
    config(
      'post',
      `material_delivery/bomCompute?startDate=${params.startDate}&itemId=${params.itemId}&quantity=${params.quantity}`
    ),
  newBomComputeMaterialDelivery: (params) =>
    config(
      'get',
      `material_delivery/bomCompute?itemId=${params.itemId}&quantity=${params.quantity}`
    ),
  newDateComputeMaterialDelivery: (params) =>
    config(
      'post',
      `material_delivery/dateCompute?startDate=${params.startDate}`,
      params.form
    ),
  importMaterialDelivery: (payload) =>
    config('post', `material_delivery/import`, payload),
  printMaterialDelivery: (payload) =>
    config(
      'get',
      `material_delivery/print?language=${payload.language}&orderNo=${payload.orderNo}`
    ),
  exportExcelMaterialDelivery: (payload) =>
    config('post', `/material_delivery/export`, payload),

  // Manufacturing process
  getManufacturingProcess: (payload) => config('post', `process`, payload),
  getManufacturingProcessDetail: (payload) =>
    config('get', `process/detail`, payload),
  checkManufacturingProcess: (payload) =>
    config(
      'get',
      `process/check?isLastStage=${payload.isLastStage}&processOrder=${payload.processOrder}&productionOrder=${payload.productionOrder}`
    ),
  addManufacturingProcess: (payload) =>
    config('post', `process/add?language=${payload.language}`, payload),
  editManufacturingProcess: (payload) =>
    config(
      'post',
      `process/edit?language=${payload.language}&processOrder=${payload.orderNo}&lineId=${payload.lineID}`,
      payload
    ),
  getImportManufacturingProcess: (payload) =>
    config('post', `process/import?itemCode=${payload.processCode}`, payload),
  unCheckManufacturingProcess: (payload) =>
    config(
      'get',
      `process/uncheck?isLastStage=${payload.isLastStage}&processOrder=${payload.processOrder}&productionOrder=${payload.productionOrder}`
    ),
  deleteManufacturingProcess: (payload) =>
    config('delete', `process/delete?processOrder=${payload.orderNo}`, payload),
  exportManufacturingProcess: (payload) =>
    config('post', 'process/export', payload),
  // Completion Report
  getCompletionReport: (payload) =>
    config('post', `completion-report/search`, payload),
  getDetailCompletionReport: (params) =>
    config(
      'get',
      `completion-report/detail?language=${params.language}&orderNo=${params.orderNo}`
    ),
  addCompletionReport: (payload) =>
    config(
      'post',
      `completion-report/add?language=${payload.language}`,
      payload.form
    ),
  updateCompletionReport: (payload) =>
    config(
      'put',
      `completion-report/update?language=${payload.language}&orderNo=${payload.orderNo}`,
      payload.form
    ),
  deleteCompletionReport: (orderNo) =>
    config('delete', `completion-report/delete/${orderNo}`),
  checkCompletionReport: (orderNo) =>
    config('get', `/completion-report/check?orderNo=${orderNo}`),
  unCheckCompletionReport: (orderNo) =>
    config('get', `/completion-report/unCheck?orderNo=${orderNo}`),
  importCompletionReport: (payload) =>
    config('post', `/completion-report/import`, payload),
  printCompletionReport: (payload) =>
    config(
      'get',
      `/completion-report/print?language=${payload.language}&orderNo=${payload.orderNo}`
    ),
  exportExcelCompletionReport: (payload) =>
    config('post', `/completion-report/export`, payload),
})
export default api
