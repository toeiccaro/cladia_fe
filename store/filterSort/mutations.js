import { isEmptyValue } from '~/utils/utils'

export default {
  IS_DIFFERENT_ROUTE(state, data) {
    state.isDifferentRoute = data
  },

  UPDATE_PAYLOAD_PURCHASE_ORDER(state, data) {
    state.payloadPurchaseOrder = {
      ...state.payloadPurchaseOrder,
      ...data,
    }

    for (const prop in state.payloadPurchaseOrder) {
      isEmptyValue(state.payloadPurchaseOrder[prop]) &&
        delete state.payloadPurchaseOrder[prop]
    }
  },
  SET_PAYLOAD_PURCHASE_ORDER(state, data) {
    state.payloadPurchaseOrder = data
  },

  UPDATE_PAYLOAD_PURCHASE_BROWSE(state, data) {
    state.payloadPurchaseBrowse = {
      ...state.payloadPurchaseBrowse,
      ...data,
    }

    for (const prop in state.payloadPurchaseBrowse) {
      isEmptyValue(state.payloadPurchaseBrowse[prop]) &&
        delete state.payloadPurchaseBrowse[prop]
    }
  },
  SET_PAYLOAD_PURCHASE_BROWSE(state, data) {
    state.payloadPurchaseBrowse = data
  },

  UPDATE_PAYLOAD_RECEIVE_BROWSE(state, data) {
    state.payloadReceiveBrowse = {
      ...state.payloadReceiveBrowse,
      ...data,
    }

    for (const prop in state.payloadReceiveBrowse) {
      isEmptyValue(state.payloadReceiveBrowse[prop]) &&
        delete state.payloadReceiveBrowse[prop]
    }
  },
  SET_PAYLOAD_RECEIVE_BROWSE(state, data) {
    state.payloadReceiveBrowse = data
  },

  UPDATE_PAYLOAD_SALE_DN_BROWSE(state, data) {
    state.payloadSaleDNBrowse = {
      ...state.payloadSaleDNBrowse,
      ...data,
    }

    for (const prop in state.payloadSaleDNBrowse) {
      isEmptyValue(state.payloadSaleDNBrowse[prop]) &&
        delete state.payloadSaleDNBrowse[prop]
    }
  },
  SET_PAYLOAD_SALE_DN_BROWSE(state, data) {
    state.payloadSaleDNBrowse = data
  },

  UPDATE_PAYLOAD_SALE_INVOICE(state, data) {
    state.payloadSaleInvoice = {
      ...state.payloadSaleInvoice,
      ...data,
    }

    for (const prop in state.payloadSaleInvoice) {
      isEmptyValue(state.payloadSaleInvoice[prop]) &&
        delete state.payloadSaleInvoice[prop]
    }
  },
  SET_PAYLOAD_SALE_INVOICE(state, data) {
    state.payloadSaleInvoice = data
  },

  UPDATE_PAYLOAD_SALE_ORDER(state, data) {
    state.payloadSaleOrder = {
      ...state.payloadSaleOrder,
      ...data,
    }

    for (const prop in state.payloadSaleOrder) {
      isEmptyValue(state.payloadSaleOrder[prop]) &&
        delete state.payloadSaleOrder[prop]
    }
  },
  SET_PAYLOAD_SALE_ORDER(state, data) {
    state.payloadSaleOrder = data
  },

  UPDATE_PAYLOAD_SALE_STATEMENT(state, data) {
    state.payloadSaleStatement = {
      ...state.payloadSaleStatement,
      ...data,
    }

    for (const prop in state.payloadSaleStatement) {
      isEmptyValue(state.payloadSaleStatement[prop]) &&
        delete state.payloadSaleStatement[prop]
    }
  },
  SET_PAYLOAD_SALE_STATEMENT(state, data) {
    state.payloadSaleStatement = data
  },

  UPDATE_PAYLOAD_SALE_PRICE(state, data) {
    state.payloadSalePrice = {
      ...state.payloadSalePrice,
      ...data,
    }

    for (const prop in state.payloadSalePrice) {
      isEmptyValue(state.payloadSalePrice[prop]) &&
        delete state.payloadSalePrice[prop]
    }
  },
  SET_PAYLOAD_SALE_PRICE(state, data) {
    state.payloadSalePrice = data
  },

  UPDATE_PAYLOAD_PURCHASE_ARRIVAL(state, data) {
    state.payloadPurchaseArrival = {
      ...state.payloadPurchaseArrival,
      ...data,
    }

    for (const prop in state.payloadPurchaseArrival) {
      isEmptyValue(state.payloadPurchaseArrival[prop]) &&
        delete state.payloadPurchaseArrival[prop]
    }
  },
  SET_PAYLOAD_PURCHASE_ARRIVAL(state, data) {
    state.payloadPurchaseArrival = data
  },

  SET_PAYLOAD_ENTERPRISE(state, data) {
    state.payloadEnterprise = data
  },
  UPDATE_PAYLOAD_ENTERPRISE(state, data) {
    state.payloadEnterprise = {
      ...state.payloadEnterprise,
      ...data,
    }

    for (const prop in state.payloadEnterprise) {
      isEmptyValue(state.payloadEnterprise[prop]) &&
        delete state.payloadEnterprise[prop]
    }
  },

  UPDATE_PAYLOAD_EMPLOYEE(state, data) {
    state.payloadEmployee = {
      ...state.payloadEmployee,
      ...data,
    }

    for (const prop in state.payloadEmployee) {
      isEmptyValue(state.payloadEmployee[prop]) &&
        delete state.payloadEmployee[prop]
    }
  },
  SET_PAYLOAD_EMPLOYEE(state, data) {
    state.payloadEmployee = data
  },

  UPDATE_PAYLOAD_STOCK_DETAIL(state, data) {
    state.payloadStockDetail = {
      ...state.payloadStockDetail,
      ...data,
    }

    for (const prop in state.payloadStockDetail) {
      isEmptyValue(state.payloadStockDetail[prop]) &&
        delete state.payloadStockDetail[prop]
    }
  },
  SET_PAYLOAD_STOCK_DETAIL(state, data) {
    state.payloadStockDetail = data
  },

  UPDATE_PAYLOAD_INVENTORY_ADJUSTMENT(state, data) {
    state.payloadInventoryAdjustment = {
      ...state.payloadInventoryAdjustment,
      ...data,
    }

    for (const prop in state.payloadInventoryAdjustment) {
      isEmptyValue(state.payloadInventoryAdjustment[prop]) &&
        delete state.payloadInventoryAdjustment[prop]
    }
  },
  SET_PAYLOAD_INVENTORY_ADJUSTMENT(state, data) {
    state.payloadInventoryAdjustment = data
  },

  UPDATE_PAYLOAD_PURCHASE_RETURN(state, data) {
    state.payloadPurchaseReturn = {
      ...state.payloadPurchaseReturn,
      ...data,
    }

    for (const prop in state.payloadPurchaseReturn) {
      isEmptyValue(state.payloadPurchaseReturn[prop]) &&
        delete state.payloadPurchaseReturn[prop]
    }
  },
  SET_PAYLOAD_PURCHASE_RETURN(state, data) {
    state.payloadPurchaseReturn = data
  },

  UPDATE_PAYLOAD_SALE_VIEW(state, data) {
    state.payloadSaleView = {
      ...state.payloadSaleView,
      ...data,
    }

    for (const prop in state.payloadSaleView) {
      isEmptyValue(state.payloadSaleView[prop]) &&
        delete state.payloadSaleView[prop]
    }
  },
  SET_PAYLOAD_SALE_VIEW(state, data) {
    state.payloadSaleView = data
  },

  UPDATE_PAYLOAD_ITEM_MASTER(state, data) {
    state.payloadItemMaster = {
      ...state.payloadItemMaster,
      ...data,
    }

    for (const prop in state.payloadItemMaster) {
      isEmptyValue(state.payloadItemMaster[prop]) &&
        delete state.payloadItemMaster[prop]
    }
  },
  SET_PAYLOAD_ITEM_MASTER(state, data) {
    state.payloadItemMaster = data
  },

  UPDATE_PAYLOAD_EXCHANGE_RATE(state, data) {
    state.payloadExchangeRate = {
      ...state.payloadExchangeRate,
      ...data,
    }

    for (const prop in state.payloadExchangeRate) {
      isEmptyValue(state.payloadExchangeRate[prop]) &&
        delete state.payloadExchangeRate[prop]
    }
  },
  SET_PAYLOAD_EXCHANGE_RATE(state, data) {
    state.payloadExchangeRate = data
  },

  UPDATE_PAYLOAD_BOX(state, data) {
    state.payloadBox = {
      ...state.payloadBox,
      ...data,
    }

    for (const prop in state.payloadBox) {
      isEmptyValue(state.payloadBox[prop]) && delete state.payloadBox[prop]
    }
  },
  SET_PAYLOAD_BOX(state, data) {
    state.payloadBox = data
  },

  UPDATE_PAYLOAD_SALE_QUOTATION(state, data) {
    state.payloadSaleQuotation = {
      ...state.payloadSaleQuotation,
      ...data,
    }

    for (const prop in state.payloadSaleQuotation) {
      isEmptyValue(state.payloadSaleQuotation[prop]) &&
        delete state.payloadSaleQuotation[prop]
    }
  },
  SET_PAYLOAD_SALE_QUOTATION(state, data) {
    state.payloadSaleQuotation = data
  },

  UPDATE_PAYLOAD_SALE_RETURN(state, data) {
    state.payloadSaleReturn = {
      ...state.payloadSaleReturn,
      ...data,
    }

    for (const prop in state.payloadSaleReturn) {
      isEmptyValue(state.payloadSaleReturn[prop]) &&
        delete state.payloadSaleReturn[prop]
    }
  },
  SET_PAYLOAD_SALE_RETURN(state, data) {
    state.payloadSaleReturn = data
  },

  UPDATE_PAYLOAD_PURCHASE_INVOICE(state, data) {
    state.payloadPurchaseInvoice = {
      ...state.payloadPurchaseInvoice,
      ...data,
    }

    for (const prop in state.payloadPurchaseInvoice) {
      isEmptyValue(state.payloadPurchaseInvoice[prop]) &&
        delete state.payloadPurchaseInvoice[prop]
    }
  },
  SET_PAYLOAD_PURCHASE_INVOICE(state, data) {
    state.payloadPurchaseInvoice = data
  },

  UPDATE_PAYLOAD_ATTACHMENT_BROWSE(state, data) {
    state.payloadAttachmentBrowse = {
      ...state.payloadAttachmentBrowse,
      ...data,
    }

    for (const prop in state.payloadAttachmentBrowse) {
      isEmptyValue(state.payloadAttachmentBrowse[prop]) &&
        delete state.payloadAttachmentBrowse[prop]
    }
  },
  SET_PAYLOAD_ATTACHMENT_BROWSE(state, data) {
    state.payloadAttachmentBrowse = data
  },

  UPDATE_PAYLOAD_PURCHASE_PRICE(state, data) {
    state.payloadPurchasePrice = {
      ...state.payloadPurchasePrice,
      ...data,
    }

    for (const prop in state.payloadPurchasePrice) {
      isEmptyValue(state.payloadPurchasePrice[prop]) &&
        delete state.payloadPurchasePrice[prop]
    }
  },
  SET_PAYLOAD_PURCHASE_PRICE(state, data) {
    state.payloadPurchasePrice = data
  },

  UPDATE_PAYLOAD_PURCHASE_INVOICE_IMPORT(state, data) {
    state.payloadPurchaseInvoiceImport = {
      ...state.payloadPurchaseInvoiceImport,
      ...data,
    }

    for (const prop in state.payloadPurchaseInvoiceImport) {
      isEmptyValue(state.payloadPurchaseInvoiceImport[prop]) &&
        delete state.payloadPurchaseInvoiceImport[prop]
    }
  },
  SET_PAYLOAD_PURCHASE_INVOICE_IMPORT(state, data) {
    state.payloadPurchaseInvoiceImport = data
  },

  UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT(state, data) {
    state.payloadPurchaseArrivalImport = {
      ...state.payloadPurchaseArrivalImport,
      ...data,
    }

    for (const prop in state.payloadPurchaseArrivalImport) {
      isEmptyValue(state.payloadPurchaseArrivalImport[prop]) &&
        delete state.payloadPurchaseArrivalImport[prop]
    }
  },
  SET_PAYLOAD_PURCHASE_ARRIVAL_IMPORT(state, data) {
    state.payloadPurchaseArrivalImport = data
  },
  UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT(state, data) {
    state.payloadPurchaseReturnImport = {
      ...state.payloadPurchaseReturnImport,
      ...data,
    }

    for (const prop in state.payloadPurchaseReturnImport) {
      isEmptyValue(state.payloadPurchaseReturnImport[prop]) &&
        delete state.payloadPurchaseReturnImport[prop]
    }
  },
  SET_PAYLOAD_PURCHASE_RETURN_IMPORT(state, data) {
    state.payloadPurchaseReturnImport = data
  },

  UPDATE_PAYLOAD_SALE_INVOICE_IMPORT(state, data) {
    state.payloadSaleInvoiceImport = {
      ...state.payloadSaleInvoiceImport,
      ...data,
    }

    for (const prop in state.payloadSaleInvoiceImport) {
      isEmptyValue(state.payloadSaleInvoiceImport[prop]) &&
        delete state.payloadSaleInvoiceImport[prop]
    }
  },
  SET_PAYLOAD_SALE_INVOICE_IMPORT(state, data) {
    state.payloadSaleInvoiceImport = data
  },
  UPDATE_PAYLOAD_SALE_RETURN_IMPORT(state, data) {
    state.payloadSaleReturnImport = {
      ...state.payloadSaleReturnImport,
      ...data,
    }

    for (const prop in state.payloadSaleReturnImport) {
      isEmptyValue(state.payloadSaleReturnImport[prop]) &&
        delete state.payloadSaleReturnImport[prop]
    }
  },
  SET_PAYLOAD_SALE_RETURN_IMPORT(state, data) {
    state.payloadSaleReturnImport = data
  },

  UPDATE_PAYLOAD_PURCHASE_ORDER_IMPORT(state, data) {
    state.payloadPurchaseOrderImport = {
      ...state.payloadPurchaseOrderImport,
      ...data,
    }

    for (const prop in state.payloadPurchaseOrderImport) {
      isEmptyValue(state.payloadPurchaseOrderImport[prop]) &&
        delete state.payloadPurchaseOrderImport[prop]
    }
  },
  SET_PAYLOAD_PURCHASE_ORDER_IMPORT(state, data) {
    state.payloadPurchaseOrderImport = data
  },

  UPDATE_PAYLOAD_SYSTEM_CONFIG_SECURITY(state, data) {
    state.payloadSystemConfigSecurity = {
      ...state.payloadSystemConfigSecurity,
      ...data,
    }

    for (const prop in state.payloadSystemConfigSecurity) {
      isEmptyValue(state.payloadSystemConfigSecurity[prop]) &&
        delete state.payloadSystemConfigSecurity[prop]
    }
  },
  SET_PAYLOAD_SYSTEM_CONFIG_SECURITY(state, data) {
    state.payloadSystemConfigSecurity = data
  },

  SET_PAYLOAD_BOM(state, data) {
    state.payloadBom = data
  },
  UPDATE_PAYLOAD_BOM(state, { data, path }) {
    state.payloadBom[path] = data
  },

  UPDATE_PAYLOAD_PARAMETER(state, { data, path }) {
    state.payloadParameter[path] = data
  },
  SET_PAYLOAD_PARAMETER(state, payload) {
    state.payloadParameter = payload
  },
  SET_PAYLOAD_USER_MANAGE(state, data) {
    state.payloadUserManage = data
  },
  UPDATE_PAYLOAD_USER_MANAGE(state, { data, path }) {
    state.payloadUserManage[path] = data
  },
  SET_PAYLOAD_EMAIL_SET(state, data) {
    state.payloadEmailSet = data
  },
  UPDATE_PAYLOAD_EMAIL_SET(state, data) {
    state.payloadEmailSet = {
      ...state.payloadEmailSet,
      ...data,
    }
  },

  SET_PAYLOAD_KEY_ROUTER(state, data) {
    state.keyRouter = data
  },
  UPDATE_PAYLOAD_INVENTORY_QUERY(state, data) {
    state.payloadInventoryQuery = {
      ...state.payloadInventoryQuery,
      ...data,
    }

    for (const prop in state.payloadInventoryQuery) {
      isEmptyValue(state.payloadInventoryQuery[prop]) &&
        delete state.payloadInventoryQuery[prop]
    }
  },
  SET_PAYLOAD_INVENTORY_QUERY(state, data) {
    state.payloadInventoryQuery = data
  },

  UPDATE_PAYLOAD_OUTWARD_ORDER(state, data) {
    state.payloadOutwardOrder = {
      ...state.payloadOutwardOrder,
      ...data,
    }

    for (const prop in state.payloadOutwardOrder) {
      isEmptyValue(state.payloadOutwardOrder[prop]) &&
        delete state.payloadOutwardOrder[prop]
    }
  },
  SET_PAYLOAD_OUTWARD_ORDER(state, data) {
    state.payloadOutwardOrder = data
  },
  UPDATE_PAYLOAD_OUTWARD_RETURN(state, data) {
    state.payloadOutwardReturn = {
      ...state.payloadOutwardReturn,
      ...data,
    }

    for (const prop in state.payloadOutwardReturn) {
      isEmptyValue(state.payloadOutwardReturn[prop]) &&
        delete state.payloadOutwardReturn[prop]
    }
  },
  SET_PAYLOAD_OUTWARD_RETURN(state, data) {
    state.payloadOutwardReturn = data
  },
  UPDATE_PAYLOAD_OUTWARD_INVOICE(state, data) {
    state.payloadOutwardInvoice = {
      ...state.payloadOutwardInvoice,
      ...data,
    }

    for (const prop in state.payloadOutwardInvoice) {
      isEmptyValue(state.payloadOutwardInvoice[prop]) &&
        delete state.payloadOutwardInvoice[prop]
    }
  },
  SET_PAYLOAD_OUTWARD_INVOICE(state, data) {
    state.payloadOutwardInvoice = data
  },
  UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT(state, data) {
    state.payloadOutwardInvoiceImport = {
      ...state.payloadOutwardInvoiceImport,
      ...data,
    }

    for (const prop in state.payloadOutwardInvoiceImport) {
      isEmptyValue(state.payloadOutwardInvoiceImport[prop]) &&
        delete state.payloadOutwardInvoiceImport[prop]
    }
  },
  SET_PAYLOAD_OUTWARD_INVOICE_IMPORT(state, data) {
    state.payloadOutwardInvoiceImport = data
  },
  UPDATE_PAYLOAD_OUTWARD_WAREHOUSING(state, data) {
    state.payloadOutwardWarehousing = {
      ...state.payloadOutwardWarehousing,
      ...data,
    }

    for (const prop in state.payloadOutwardWarehousing) {
      isEmptyValue(state.payloadOutwardWarehousing[prop]) &&
        delete state.payloadOutwardWarehousing[prop]
    }
  },
  SET_PAYLOAD_OUTWARD_WAREHOUSING(state, data) {
    state.payloadOutwardWarehousing = data
  },
  UPDATE_PAYLOAD_OUTWARD_DELIVERY(state, data) {
    state.payloadOutwardDelivery = {
      ...state.payloadOutwardDelivery,
      ...data,
    }

    for (const prop in state.payloadOutwardDelivery) {
      isEmptyValue(state.payloadOutwardDelivery[prop]) &&
        delete state.payloadOutwardDelivery[prop]
    }
  },
  SET_PAYLOAD_OUTWARD_DELIVERY(state, data) {
    state.payloadOutwardDelivery = data
  },
  UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT(state, data) {
    state.payloadOutwardDeliveryImport = {
      ...state.payloadOutwardDeliveryImport,
      ...data,
    }

    for (const prop in state.payloadOutwardDeliveryImport) {
      isEmptyValue(state.payloadOutwardDeliveryImport[prop]) &&
        delete state.payloadOutwardDeliveryImport[prop]
    }
  },
  SET_PAYLOAD_OUTWARD_DELIVERY_IMPORT(state, data) {
    state.payloadOutwardDeliveryImport = data
  },
  UPDATE_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT(state, data) {
    state.payloadOutwardWarehousingImport = {
      ...state.payloadOutwardWarehousingImport,
      ...data,
    }

    for (const prop in state.payloadOutwardWarehousingImport) {
      isEmptyValue(state.payloadOutwardWarehousingImport[prop]) &&
        delete state.payloadOutwardWarehousingImport[prop]
    }
  },
  SET_PAYLOAD_OUTWARD_WAREHOUSING_IMPORT(state, data) {
    state.payloadOutwardWarehousingImport = data
  },
  UPDATE_PAYLOAD_MANUFACTURING_PROCESS(state, data) {
    state.payloadManufacturingProcess = {
      ...state.payloadManufacturingProcess,
      ...data,
    }

    for (const prop in state.payloadManufacturingProcess) {
      isEmptyValue(state.payloadManufacturingProcess[prop]) &&
        delete state.payloadManufacturingProcess[prop]
    }
  },
  SET_PAYLOAD_MANUFACTURING_PROCESS(state, data) {
    state.payloadManufacturingProcess = data
  },
  UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT(state, data) {
    state.payloadManufacturingProcessImport = {
      ...state.payloadManufacturingProcessImport,
      ...data,
    }

    for (const prop in state.payloadManufacturingProcessImport) {
      isEmptyValue(state.payloadManufacturingProcessImport[prop]) &&
        delete state.payloadManufacturingProcessImport[prop]
    }
  },
  SET_PAYLOAD_MANUFACTURING_PROCESS_IMPORT(state, data) {
    state.payloadManufacturingProcessImport = data
  },
  UPDATE_PAYLOAD_PRODUCTION_ORDER_IMPORT(state, data) {
    state.payloadProductionOrderImport = {
      ...state.payloadProductionOrderImport,
      ...data,
    }

    for (const prop in state.payloadProductionOrderImport) {
      isEmptyValue(state.payloadProductionOrderImport[prop]) &&
        delete state.payloadProductionOrderImport[prop]
    }
  },
  SET_PAYLOAD_PRODUCTION_ORDER_IMPORT(state, data) {
    state.payloadProductionOrderImport = data
  },
  UPDATE_PAYLOAD_PRODUCTION_ORDER(state, data) {
    state.payloadProductionOrder = {
      ...state.payloadProductionOrder,
      ...data,
    }

    for (const prop in state.payloadProductionOrder) {
      isEmptyValue(state.payloadProductionOrder[prop]) &&
        delete state.payloadProductionOrder[prop]
    }
  },
  SET_PAYLOAD_PRODUCTION_ORDER(state, data) {
    state.payloadProductionOrder = data
  },
  UPDATE_PAYLOAD_MATERIAL_DELIVERY(state, data) {
    state.payloadMaterialDelivery = {
      ...state.payloadMaterialDelivery,
      ...data,
    }

    for (const prop in state.payloadMaterialDelivery) {
      isEmptyValue(state.payloadMaterialDelivery[prop]) &&
        delete state.payloadMaterialDelivery[prop]
    }
  },
  SET_PAYLOAD_MATERIAL_DELIVERY(state, data) {
    state.payloadMaterialDelivery = data
  },
  UPDATE_PAYLOAD_MATERIAL_DELIVERY_IMPORT(state, data) {
    state.payloadMaterialDeliveryImport = {
      ...state.payloadMaterialDeliveryImport,
      ...data,
    }

    for (const prop in state.payloadMaterialDeliveryImport) {
      isEmptyValue(state.payloadMaterialDeliveryImport[prop]) &&
        delete state.payloadMaterialDeliveryImport[prop]
    }
  },
  SET_PAYLOAD_MATERIAL_DELIVERY_IMPORT(state, data) {
    state.payloadMaterialDeliveryImport = data
  },
  UPDATE_PAYLOAD_OUTWARD_RETURN_IMPORT(state, data) {
    state.payloadOutwardReturnImport = {
      ...state.payloadOutwardReturnImport,
      ...data,
    }

    for (const prop in state.payloadOutwardReturnImport) {
      isEmptyValue(state.payloadOutwardReturnImport[prop]) &&
        delete state.payloadOutwardReturnImport[prop]
    }
  },
  SET_PAYLOAD_OUTWARD_RETURN_IMPORT(state, data) {
    state.payloadOutwardReturnImport = data
  },

  // Completion Report
  UPDATE_PAYLOAD_COMPLETION_REPORT(state, data) {
    state.payloadCompletionReport = {
      ...state.payloadCompletionReport,
      ...data,
    }
  },
  SET_PAYLOAD_COMPLETION_REPORT(state, data) {
    state.payloadCompletionReport = data
  },

  SET_PAYLOAD_COMPLETION_REPORT_IMPORT(state, data) {
    state.payloadCompletionReportImport = data
  },
  UPDATE_PAYLOAD_COMPLETION_REPORT_IMPORT(state, data) {
    state.payloadCompletionReportImport = {
      ...state.payloadCompletionReportImport,
      ...data,
    }

    for (const prop in state.payloadCompletionReportImport) {
      isEmptyValue(state.payloadCompletionReportImport[prop]) &&
        delete state.payloadCompletionReportImport[prop]
    }
  },

  // MRP
  SET_PAYLOAD_MRP_HISTORY(state, data) {
    state.payloadMRPHistory = data
  },
  UPDATE_PAYLOAD_MRP_HISTORY(state, data) {
    state.payloadMRPHistory = {
      ...state.payloadMRPHistory,
      ...data,
    }
  },
  SET_PAYLOAD_DEMAND_SUPPLY(state, data) {
    state.payloadDemandSupply = data
  },
  UPDATE_PAYLOAD_DEMAND_SUPPLY(state, data) {
    state.payloadDemandSupply = {
      ...state.payloadDemandSupply,
      ...data,
    }
  },
  SET_PAYLOAD_PURCHASE_PLAN(state, data) {
    state.payloadPurchasePlan = data
  },
  UPDATE_PAYLOAD_PURCHASE_PLAN(state, data) {
    state.payloadPurchasePlan = {
      ...state.payloadPurchasePlan,
      ...data,
    }
  },
  SET_PAYLOAD_PRODUCT_PLAN(state, data) {
    state.payloadProductPlan = data
  },
  UPDATE_PAYLOAD_PRODUCT_PLAN(state, data) {
    state.payloadProductPlan = {
      ...state.payloadProductPlan,
      ...data,
    }
  },
  SET_PAYLOAD_OUTWARD_PLAN(state, data) {
    state.payloadOutwardPlan = data
  },
  UPDATE_PAYLOAD_OUTWARD_PLAN(state, data) {
    state.payloadOutwardPlan = {
      ...state.payloadOutwardPlan,
      ...data,
    }
  },

  SET_PAYLOAD_PURCHASE_RN_BROWSE(state, data) {
    state.payloadPurchaseRNBrowse = data
  },
  UPDATE_PAYLOAD_PURCHASE_RN_BROWSE(state, data) {
    state.payloadPurchaseRNBrowse = {
      ...state.payloadPurchaseRNBrowse,
      ...data,
    }
  },
}
