export const CUSTOMER_COMPANY_TYPE_ID = 'Customer'
export const SUPPLIER_COMPANY_TYPE = 'Supplier'

export const TOOLBAR_TYPE = {
  EXPORT: 'export',
  MENU: 'menu',
}
export const YEAR = [
  { value: '2017', text: '2017' },
  { value: '2018', text: '2018' },
  { value: '2019', text: '2019' },
  { value: '2020', text: '2020' },
  { value: '2021', text: '2021' },
  { value: '2022', text: '2022' },
  { value: '2023', text: '2023' },
  { value: '2024', text: '2024' },
  { value: '2025', text: '2025' },
  { value: '2026', text: '2026' },
  { value: '2027', text: '2027' },
]
export const MONTH = [
  { value: '1', text: '1' },
  { value: '2', text: '2' },
  { value: '3', text: '3' },
  { value: '4', text: '4' },
  { value: '5', text: '5' },
  { value: '6', text: '6' },
  { value: '7', text: '7' },
  { value: '8', text: '8' },
  { value: '9', text: '9' },
  { value: '10', text: '10' },
  { value: '11', text: '11' },
  { value: '12', text: '12' },
]

export const SERVER_ERROR_MESSAGE = {
  DUPLICATE_COMPANY_CODE: 'msg_Exists_0',
  DUPLICATE_ADD_ITEM_CODE: {
    FIELD: 'itemCode',
    MESSAGE: 'msg_IsExit_0',
  },
  DUPLICATE_ADD_LOGIN_NAME: {
    FIELD: 'loginName',
    MESSAGE: 'msg_UserNameExists_0',
  },
  EMPLOYEE_CODE_EXISTS: '[Employee Code] Exists',
  MAIN_INFO_REPEATED: 'Main info is Repeat',
  BOM_ITEM_ID_NOT_EXISTS: 'Item is not exits',
  ITEM_EXISTS: 'msg_ItemExits_0',
  IS_IN_USED: 'msg_IsUsed_0',
}

export const SERVER_RESPONSE_CODE = {
  OK: 200,
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  CONFLICT_ERROR: 409,
}

export const INVENTORY_ADJUSTMENT_ADD_TYPE = {
  IMPORT: 'import',
  EXPORT: 'export',
}

export const INVENTORY_ADJUSTMENT = {
  MAX_DETAIL_LINES: 6,
}

export const DRAGGABLE_TABLE = {
  MIN_COLUMN_WIDTH: 29,
  DEFAULT_COLUMN_WIDTH: 120,
}

export const SORT_TYPE = {
  ASCENDING: 'ASC',
  DESCENDING: 'DESC',
}

export const ROOT_LEVEL = 1
export const DETAIL_ITEM_TABLE = {
  SALE_RETURN_DETAIL: 'SaleReturnDetail',
  SALE_QUOTATION_DETAIL: 'QuotationDetail',
  PURCHASE_ORDER_DETAIL: 'PODetail',
  PURCHASE_ARRIVAL_DETAIL: 'ArrivalDetail',
  OUTWARD_DELIVERY_DETAIL: 'OutwardDeliveryDetail',
  MANUFACTURING_PROCESS_DETAIL: 'ManufacturingProcessDetail',
  OUTWARD_WAREHOUSING_DETAIL: 'OutwardWarehousingDetail',
}

export const EVENT_TIME_STRUCTURE = {
  TIME: 'time',
  DAY: 'day',
  MONTH: 'month',
  YEAR: 'year',
}

export const DASHBOARD_CARDS_ID = {
  TODAY_EVENTS: 2,
  APPROVAL_PENDING: 3,
  PROMISE_DATE_SALES: 4,
  PROMISE_DATE_PURCHASE: 5,
  PROMISE_DATE_OUTWARD: 6,
  PROMISE_DATE_PRODUCTION: 7,
  GRAPH_MONTHLY_SALES_ORDER: 8,
  GRAPH_MONTHLY_SALES_INVOICE: 9,
}

export const S_RIGHT_ID_DASHBOARD = 64

export const TOOLBAR_KEYS = {
  REFRESH: 'refresh',
  EXPORT: 'export',
  SAVE: 'save',
  CLOSE: 'close',
  SET: 'set',
}

export const EXPORT_TYPES = {
  PAGED: 'Paged',
  ALL: 'all',
}

export const FIELD_TYPE = {
  DATE: ['EndTimeMRP', 'EditDate', 'startDate', 'endDate'],
  DATE_TIME: ['MrpDate'],
  INPUT: ['MemoMRP', 'memo'],
  NUMBER: [
    'CalculateDays',
    'demandQty',
    'supplyQty',
    'needDays',
    'leadTime',
    'plannedQty',
    'stockQty',
    'needQty',
  ],
  CANNOT_FILTER: ['safeQty'],
}

export const ITEM_TYPE = {
  EMPTY: 0,
  PRODUCT: 1,
  INTERMEDIATE_PRODUCT: 3,
  PRODUCT_PROCESS: 4,
  OUTSOURCED_PRODUCT: 5,
  MATERIAL: 6,
  NOTRON: 7,
}

export const PROCESS_STATUS = {
  start: {
    text: '開始',
    value: 1,
  },
  partial: {
    text: '一部完了',
    value: 2,
  },
  completion: {
    text: '完了',
    value: 3,
  },
}

export const MD_PARAMETER_TYPE = {
  WAREHOUSE: 'cmb_Warehouse_0'
}

export const INSPECTION_TYPE = {
  WITHOUT_INSPECTION: 1
}

export const BARCODE_SYS_STATUS = {
  UNCHECKED: '0',
  CHECKED: '1',
}

export const CONFIGURATIONS_KEYCODE = {
  BARCODE_SYSTEM: 'BarCodeSystem',
  PRINTER_IP_ADDRESS: 'IPAddressPrinter',
  PRINTER_PORT: 'PortPrinter'
}

export const SMAPRI_DRIVER_RESPONSE = {
  RESULT_OK: 'OK',
  RESULT_ERROR: 'NG',
  FORMAT_LABEL_NAME: 'cladia_qrcode_label_ofc'
}

export const ITEM_UNIT = {
  PIECES: 'pcs',
}