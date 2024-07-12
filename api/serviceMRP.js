const api = (config) => ({
  createMRP: (payload) => config('post', '/mrp/create', payload),
  cancelMRP: () => config('post', '/mrp/cancel'),
  getMRPHistory: (payload) => config('post', '/mrp/history/logs', payload),
  updateMRPHistory: (payload) =>
    config('patch', '/mrp/history/logs/update', payload),
  exportExcelMRPHistory: (payload) =>
    config('post', '/mrp/history/exportExcel', payload),
  getDemandSupply: (payload) =>
    config('post', '/mrp/supplyAndDemands', payload),
  searchDemandSupply: (payload) =>
    config('get', '/mrp/supplyAndDemands/search', payload),
  exportExcelDemandSupply: (payload) =>
    config('post', '/mrp/supplyAndDemands/export', payload),
  updateDemandSupply: (payload) =>
    config('post', '/mrp/supplyAndDemands/update', payload),
  searchPurchasePlan: (payload) =>
    config('post', '/mrp/purchasePlans/search', payload),
  exportExcelPurchasePlan: (payload) =>
    config('post', '/mrp/purchasePlans/export', payload),
  updatePurchasePlan: (payload) =>
    config('post', '/mrp/purchasePlans/update', payload),
  generatePurchaseOrder: (payload) =>
    config('post', '/mrp/purchasePlans/generateOrder', payload),
  getWorkPlans: (payload) => config('post', '/mrp/workPlans', payload),
  updateWorkPlans: (payload) =>
    config('post', '/mrp/workPlans/update', payload),
  generateWorkOrder: (payload) =>
    config('post', '/mrp/workPlans/generateOrder', payload),
  exportExcelWorkPlans: (payload) =>
    config('post', '/mrp/workPlans/export', payload),
  searchWorkPlans: (payload) =>
    config('post', '/mrp/workPlans/search', payload),
  searchOutwardPlans: (payload) =>
    config('post', '/mrp/outwardPlans/search', payload),
  generateOutwardOrder: (payload) =>
    config('post', '/mrp/outwardPlans/generateOrder', payload),
  exportExcelOutwardPlans: (payload) =>
    config('post', '/mrp/outwardPlans/export', payload),
  updateOutwardPlans: (payload) =>
    config('post', '/mrp/outwardPlans/update', payload),
})
export default api
