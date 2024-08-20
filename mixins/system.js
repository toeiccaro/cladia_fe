import {
  BIconCaretRight,
  BIconCalendar3,
  BIconBox,
  BIconClipboardData,
  BIconServer,
  BIconCart4,
  BIconFiles,
  BIconCash,
  BIconClipboardX,
  BIconJoystick,
} from 'bootstrap-vue'
import { INVENTORY_ADJUSTMENT_ADD_TYPE } from '@/constants'

export default {
  computed: {
    path() {
      return this.$route.path
    },
    sidebarOptions() {
      return [
        {
          title: this.$t('lbl_Routine_0'),
          icon: BIconCalendar3,
          key: 'RT1001',
          options: [
            {
              key: 'RW010',
              path: '/',
              text: this.$t('lbl_Dashboard_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/dashboard') && false,
            },
            {
              key: 'RW020',
              path: '/routine-work/calendar',
              text: this.$t('lbl_Routine_Calendar_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/routine-work/calendar'),
            },
            {
              key: 'RW030',
              path: '/message',
              text: this.$t('lbl_Routine_Message_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/message'),
            },
            {
              key: 'RW040',
              path: '/task',
              text: this.$t('lbl_Routine_Task_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/task'),
            },
            {
              key: 'RW050',
              path: '/deadline',
              text: this.$t('lbl_Routine_DeadLine_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/deadline'),
            },
          ],
          value: 'Routine Work',
        },
        {
          title: this.$t('lbl_BaseData_0'),
          icon: BIconBox,
          key: 'BD1001',
          options: [
            {
              path: '/master-data/item-master',
              key: 'MD010',
              text: this.$t('lbl_BaseData_ItemMaster_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/master-data/item-master'),
              options: [
                {
                  path: '/master-data/item-master?type=1',
                  text: this.$t('lbl_itemMaster_0'),
                  icon: BIconCaretRight,
                  key: 'MD011',
                  selected: this.path.includes('/master-data/item-master'),
                  query: {
                    type: 1,
                  },
                },
                {
                  path: '/master-data/item-master?type=3',
                  text: this.$t('lbl_itemMaster1_0'),
                  icon: BIconCaretRight,
                  key: 'MD012',
                  selected: this.path.includes('/master-data/item-master'),
                  query: {
                    type: 3,
                  },
                },
                {
                  path: '/master-data/item-master?type=4',
                  text: this.$t('lbl_itemMaster2_0'),
                  icon: BIconCaretRight,
                  key: 'MD013',
                  selected: this.path.includes('/master-data/item-master'),
                  query: {
                    type: 4,
                  },
                },
                {
                  path: '/master-data/item-master?type=5',
                  text: this.$t('lbl_itemMaster3_0'),
                  icon: BIconCaretRight,
                  key: 'MD014',
                  selected: this.path.includes('/master-data/item-master'),
                  query: {
                    type: 5,
                  },
                },
                {
                  path: '/master-data/item-master?type=6',
                  text: this.$t('lbl_itemMaster4_0'),
                  icon: BIconCaretRight,
                  key: 'MD015',
                  selected: this.path.includes('/master-data/item-master'),
                  query: {
                    type: 6,
                  },
                },
                {
                  path: '/master-data/item-master?type=other',
                  text: this.$t('lbl_itemMaster5_0'),
                  icon: BIconCaretRight,
                  key: 'MD016',
                  selected: this.path.includes('/master-data/item-master'),
                  query: {
                    type: 'other',
                  },
                },
              ],
            },
            {
              path: '/master-data/enterprise-master',
              text: this.$t('lbl_BaseData_Enterprise_0'),
              key: 'MD020',
              icon: BIconCaretRight,
              selected: this.path.includes('/master-data/enterprise-master'),
              options: [
                {
                  path: '/master-data/enterprise-master?type=1',
                  text: this.$t('cmb_CompanyType_1'),
                  icon: BIconCaretRight,
                  key: 'MD021',
                  selected: this.path.includes(
                    '/master-data/enterprise-master'
                  ),
                  query: {
                    type: 1,
                  },
                },
                {
                  path: '/master-data/enterprise-master?type=6',
                  text: this.$t('cmb_CompanyType_6'),
                  icon: BIconCaretRight,
                  selected: this.path.includes(
                    '/master-data/enterprise-master'
                  ),
                  key: 'MD022',
                  query: {
                    type: 6,
                  },
                },
                {
                  path: '/master-data/enterprise-master?type=2',
                  text: this.$t('cmb_CompanyType_2'),
                  icon: BIconCaretRight,
                  key: 'MD023',
                  selected: this.path.includes(
                    '/master-data/enterprise-master'
                  ),
                  query: {
                    type: 2,
                  },
                },
                {
                  path: '/master-data/enterprise-master?type=7',
                  text: this.$t('cmb_CompanyType_7'),
                  icon: BIconCaretRight,
                  key: 'MD024',
                  selected: this.path.includes(
                    '/master-data/enterprise-master'
                  ),
                  query: {
                    type: 7,
                  },
                },
                {
                  path: '/master-data/enterprise-master?type=8',
                  text: this.$t('cmb_CompanyType_8'),
                  icon: BIconCaretRight,
                  key: 'MD025',
                  selected: this.path.includes(
                    '/master-data/enterprise-master'
                  ),
                  query: {
                    type: 8,
                  },
                },
              ],
            },
            {
              path: '/master-data/name-cards',
              text: this.$t('lbl_BaseData_EnterpriseCards_0'),
              icon: BIconCaretRight,
              key: 'MD090',
              selected: this.path.includes('/master-data/name-cards'),
            },
            {
              path: '/master-data/exchange-rate',
              text: this.$t('lbl_BaseData_Rate_0'),
              key: 'SS080',
              icon: BIconCaretRight,
              selected: this.path.includes('/master-data/exchange-rate'),
            },
            {
              path: '/master-data/box',
              text: this.$t('lbl_BaseData_Box_0'),
              icon: BIconCaretRight,
              key: 'MD040',
              selected: this.path.includes('/master-data/box'),
            },
            {
              path: '/master-data/parameter',
              text: this.$t('lbl_BaseData_Parameter_0'),
              icon: BIconCaretRight,
              key: 'SS060',
              selected: this.path.includes('/master-data/parameter'),
            },
            {
              path: '/master-data/company',
              text: this.$t('lbl_BaseData_Company_0'),
              icon: BIconCaretRight,
              key: 'MD060',
              selected: this.path.includes('/master-data/company'),
            },
            {
              path: '/master-data/price-analysis',
              text: this.$t('lbl_BaseData_PriceAnalysis_0'),
              icon: BIconCaretRight,
              key: 'MD070',
              selected: this.path.includes('/master-data/price-analysis'),
            },
            {
              path: '/master-data/attachment-browse',
              text: this.$t('lbl_BaseData_AttachmentBrowse_0'),
              icon: BIconCaretRight,
              key: 'SS090',
              selected: this.path.includes('/master-data/attachment-browse'),
            },
            {
              path: '/master-data/email-set',
              text: this.$t('lbl_BaseData_EmailSet_0'),
              icon: BIconCaretRight,
              key: 'SS070',
              selected: this.path.includes('/master-data/email-set'),
            },
            {
              path: '/master-data/b-bom',
              text: this.$t('lbl_Production_Bom_0'),
              icon: BIconCaretRight,
              key: 'MD050',
              selected: this.path.includes('/master-data/bom'),
            },
            {
              path: '/master-data/bom-reverse',
              text: this.$t('lbl_Production_BomReverse_0'),
              icon: BIconCaretRight,
              key: 'MD051',
              selected: this.path.includes('/master-data/bom-reverse'),
            },
          ],
          value: 'Master Data',
        },
        {
          title: this.$t('lbl_Employee_Management_menu_0'),
          icon: BIconCaretRight,
          value: 'Hr Management',
          key: 'USM1001',
          options: [
            {
              path: '/hr-management/employee',
              text: this.$t('lbl_BaseData_Employee_0'),
              icon: BIconCaretRight,
              key: 'HM001',
              selected: this.path.includes('/hr-management/employee'),
            },
          ],
        },
        {
          title: this.$t('lbl_Sales_0'),
          icon: BIconClipboardData,
          key: 'SL1001',
          options: [
            {
              path: '/sales/quotation',
              key: 'SM020',
              text: this.$t('lbl_Sales_SOQuotation_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/sales/quotation'),
            },

            {
              path: '/sales/order',
              key: 'SM030',
              text: this.$t('lbl_Sales_SOOrder_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/sales/order'),
            },
            {
              path: '/sales/view',
              text: this.$t('lbl_Sales_SOBrowse_0'),
              icon: BIconCaretRight,
              key: 'SM040',
              selected: this.path.includes('/sales/view'),
            },
            {
              path: '/sales/invoice',
              text: this.$t('lbl_Sales_SOInvoice_0'),
              icon: BIconCaretRight,
              key: 'SM060',
              selected: this.path.includes('/sales/invoice'),
            },
            {
              path: '/sales/statement',
              text: this.$t('lbl_Sales_SOStatement_0'),
              icon: BIconCaretRight,
              key: 'SM080',
              selected: this.path.includes('/sales/statement'),
            },
            {
              path: '/sales/dn-browse',
              text: this.$t('lbl_Sales_DNBrowse_0'),
              icon: BIconCaretRight,
              key: 'SM050',
              selected: this.path.includes('/sales/dn-browse'),
            },
            {
              path: '/sales/sales-return',
              text: this.$t('lbl_Sales_SOReturn_0'),
              icon: BIconCaretRight,
              key: 'SM070',
              selected: this.path.includes('/sales/sales-return'),
            },
            {
              path: '/sales/sales-price',
              text: this.$t('lbl_Sales_SOPrice_0'),
              icon: BIconCaretRight,
              key: 'SM090',
              selected: this.path.includes('/sales-price'),
            },
          ],
          value: 'Sales',
        },
        {
          title: this.$t('lbl_Purchase_0'),
          icon: BIconCart4,
          key: 'PC1001',
          options: [
            {
              path: '/purchase/order',
              text: this.$t('lbl_Purchase_POOrder_0'),
              icon: BIconCaretRight,
              key: 'PU010',
              selected: this.path.includes('/purchase/order'),
            },
            {
              path: '/purchase/po-browse',
              text: this.$t('lbl_Purchase_POBrowse_0'),
              icon: BIconCaretRight,
              key: 'PU020',
              selected: this.path.includes('/purchase/po-browse'),
            },
            {
              path: '/purchase/arrival',
              text: this.$t('lbl_Purchase_POReceipt_0'),
              icon: BIconCaretRight,
              key: 'PU030',
              selected: this.path.includes('/purchase/arrival'),
            },
            {
              path: '/purchase/rn-browse',
              text: this.$t('lbl_Purchase_RNBrowse_0'),
              icon: BIconCaretRight,
              key: 'PU070',
              selected: this.path.includes('/purchase/rn-browse'),
            },
            {
              path: '/purchase/purchase-return',
              text: this.$t('lbl_Purchase_POReturn_0'),
              icon: BIconCaretRight,
              key: 'PU040',
              selected: this.path.includes('/purchase/purchase-return'),
            },
            {
              path: '/purchase/invoice',
              text: this.$t('lbl_Purchase_POInvoice_0'),
              icon: BIconCaretRight,
              key: 'PU050',
              selected: this.path.includes('/purchase/invoice'),
            },
            {
              path: '/purchase/po-price',
              text: this.$t('lbl_Purchase_POPrice_0'),
              icon: BIconCaretRight,
              key: 'PU060',
              selected: this.path.includes('/purchase/po-price'),
            },
          ],
          value: 'Purchase',
        },
        {
          title: this.$t('lbl_WPO_0'),
          icon: BIconServer,
          key: 'OP1001',
          options: [
            {
              path: '/outward/outward-order',
              text: this.$t('lbl_WPO_Order_0'),
              icon: BIconCaretRight,
              key: 'OP010',
              selected: this.path.includes('/outward/outward-order'),
            },
            {
              path: '/outward/outward-delivery',
              text: this.$t('lbl_WPO_OrderOut_0'),
              icon: BIconCaretRight,
              key: 'OP020',
              selected: this.path.includes('/outward/outward-delivery'),
            },
            {
              path: '/outward/outward-warehousing',
              text: this.$t('lbl_WPO_OrderIn_0'),
              icon: BIconCaretRight,
              key: 'OP030',
              selected: this.path.includes('/outward/outward-warehousing'),
            },
            {
              path: '/outward/outward-return',
              text: this.$t('lbl_WPO_OrderReturn_0'),
              icon: BIconCaretRight,
              key: 'OP040',
              selected: this.path.includes('/outward/outward-return'),
            },
            {
              path: '/outward/wpo-invoice',
              text: this.$t('lbl_WPO_Invoice_0'),
              icon: BIconCaretRight,
              key: 'OP050',
              selected: this.path.includes('/outward/wpo-invoice'),
            },
          ],
          value: 'WPO',
        },
        {
          title: this.$t('lbl_Production_0'),
          icon: BIconJoystick,
          key: 'PD1001',
          options: [
            {
              path: '/production/requirement',
              text: this.$t('lbl_Production_Requirement_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/production/requirement'),
            },
            {
              path: '/requirement-month',
              text: this.$t('lbl_Production_RequirementByMonth_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/requirement-month'),
            },
            {
              path: '/production/production-order',
              text: this.$t('lbl_Production_Order_0'),
              icon: BIconCaretRight,
              key: 'PD010',
              selected: this.path.includes('/production/production-order'),
            },
            {
              path: '/production/material-delivery',
              text: this.$t('lbl_Production_WOMaterialOut_0'),
              icon: BIconCaretRight,
              key: 'PD030',
              selected: this.path.includes('/production/material-delivery'),
            },
            {
              path: '/production/manufacturing-process',
              text: this.$t('lbl_Production_Manufacturing_0'),
              icon: BIconCaretRight,
              key: 'PD020',
              selected: this.path.includes('/production/manufacturing-process'),
            },
            {
              path: '/production/completion-report',
              text: this.$t('lbl_Production_WOFinishIN_0'),
              icon: BIconCaretRight,
              key: 'PD040',
              selected: this.path.includes('/production/completion-report'),
            },
          ],
          value: 'Production',
        },
        {
          title: this.$t('lbl_MRP_0'),
          icon: BIconCaretRight,
          key: 'MRP1001',
          options: [
            {
              path: '/mrp/create',
              text: this.$t('lbl_MRP_Calculate_0'),
              icon: BIconCaretRight,
              key: 'MRP020',
              selected: this.path.includes('/mrp/create'),
            },
            {
              path: '/mrp/demand-supply',
              text: this.$t('lbl_MRP_Supply_Demand_0'),
              icon: BIconCaretRight,
              key: 'MRP030',
              selected: this.path.includes('/mrp/demand-supply'),
              options: [
                {
                  path: 'mrp/demand-supply/product-plan',
                  text: this.$t('lbl_MRP_Production_Plan_0'),
                  icon: BIconCaretRight,
                  key: 'MRP050',
                  selected: this.path.includes(
                    '/mrp/demand-supply/product-plan'
                  ),
                },
                {
                  path: '/mrp/demand-supply/outward-plan',
                  text: this.$t('lbl_MRP_Outward_Plan_0'),
                  icon: BIconCaretRight,
                  key: 'MRP060',
                  selected: this.path.includes(
                    '/mrp/demand-supply/outward-plan'
                  ),
                },
                {
                  path: '/mrp/demand-supply/purchase-plan',
                  text: this.$t('lbl_MRP_Purchase_Plan_0'),
                  icon: BIconCaretRight,
                  key: 'MRP070',
                  selected: this.path.includes(
                    '/mrp/demand-supply/purchase-plan'
                  ),
                },
              ],
            },
            {
              path: '/mrp/history',
              text: this.$t('lbl_MRP_Log_0'),
              icon: BIconCaretRight,
              key: 'MRP040',
              selected: this.path.includes('/mrp/history'),
            },
          ],
          value: 'MRP',
        },
        {
          title: this.$t('lbl_Inventory_0'),
          icon: BIconClipboardX,
          key: 'IV1001',
          options: [
            {
              path: '/inventory/adjustment',
              text: this.$t('lbl_Inventory_WHAdjust_0'),
              icon: BIconCaretRight,
              key: 'IM030',
              selected: this.path.includes('/inventory/adjustment'),
              options: [
                {
                  path: '/inventory/adjustment?type=export',
                  text: this.$t('lbl_Inventory_Manual_Export_0'),
                  icon: BIconCaretRight,
                  key: 'IM031',
                  selected: this.path.includes('/inventory/adjustment'),
                  query: {
                    type: INVENTORY_ADJUSTMENT_ADD_TYPE.EXPORT,
                  },
                },
                {
                  path: '/inventory/adjustment?type=import',
                  text: this.$t('lbl_Inventory_Manual_Import_0'),
                  key: 'IM032',
                  icon: BIconCaretRight,
                  selected: this.path.includes('/inventory/adjustment'),
                  query: {
                    type: INVENTORY_ADJUSTMENT_ADD_TYPE.IMPORT,
                  },
                },
              ],
            },
            {
              path: '/inventory/query',
              text: this.$t('lbl_Inventory_WHQuery_0'),
              icon: BIconCaretRight,
              key: 'IM010',
              selected: this.path.includes('/inventory/query'),
            },
            {
              path: '/inventory/stock-detail',
              text: this.$t('lbl_Inventory_WHDetail_0'),
              icon: BIconCaretRight,
              key: 'IM020',
              selected: this.path.includes('/inventory/stock-detail'),
            },
            {
              path: '/inventory/import',
              text: this.$t('lbl_Inventory_WHImport_0'),
              icon: BIconCaretRight,
              key: 'IM040',
              selected: this.path.includes('/inventory/import'),
            },
          ],
          value: 'Inventory',
        },
        {
          title: '原価計算',
          icon: BIconCash,
          key: 'CC1001',
          options: [
            {
              path: '/cost-compute',
              text: '原価計算',
              key: 'CC010',
              icon: BIconCaretRight,
              selected: this.path.includes('/cost-compute'),
            },
            {
              path: '/for-the-summary',
              text: '入出庫明細',
              key: 'CC020',
              icon: BIconCaretRight,
              selected: this.path.includes('/for-the-summary'),
            },
            {
              path: '/cost-compute-logs',
              text: '原価計算ログ',
              key: 'CC030',
              icon: BIconCaretRight,
              selected: this.path.includes('/cost-compute-logs'),
            },
          ],
          value: 'CostCompute',
        },
        {
          title: this.$t('lbl_Finance_0'),
          icon: BIconFiles,
          key: 'FN1001',
          options: [
            {
              path: '/finance/subject-setting',
              text: this.$t('lbl_Finance_SubjectSetting_0'),
              icon: BIconCaretRight,
              key: 'FM010',
              selected: this.path.includes('/finance/subject-setting'),
            },
            {
              path: '/finance/receive-browse',
              text: this.$t('lbl_Finance_ReceiveBrowse_0'),
              icon: BIconCaretRight,
              key: 'FM030',
              selected: this.path.includes('/finance/receive-browse'),
            },
            {
              path: '/pay-browse',
              text: this.$t('lbl_Finance_PayBrowse_0'),
              icon: BIconCaretRight,
              key: 'FM050',
              selected: this.path.includes('/pay-browse'),
            },
            {
              path: '/finance/transaction-detail',
              text: this.$t('lbl_Finance_TransactionDetail_0'),
              icon: BIconCaretRight,
              key: 'FM040',
              selected: this.path.includes('/finance/transaction-detail'),
            },
            {
              path: '/finance/accounts-receivable-annual',
              text: this.$t('lbl_Finance_AccountsReceivableAnnual_0'),
              icon: BIconCaretRight,
              key: 'FM060',
              selected: this.path.includes(
                '/finance/accounts-receivable-annual'
              ),
            },
            {
              path: '/finance/accounts-payable-annual',
              text: this.$t('lbl_Finance_AccountsPayableAnnual_0'),
              icon: BIconCaretRight,
              key: 'FM070',
              selected: this.path.includes('/finance/accounts-payable-annual'),
            },
            {
              path: '/finance/bank-balance',
              text: this.$t('lbl_Finance_BankBalance_0'),
              icon: BIconCaretRight,
              key: 'FM080',
              selected: this.path.includes('/finance/bank-balance'),
            },
            // New option added here
            {
              path: '/finance/new-option',
              text: this.$t('New Option'),
              icon: BIconCaretRight,
              key: 'NEW_OPTION',
              selected: this.path.includes('/finance/new-option'),
            },
          ],
          value: 'Finance',
        },
        {
          title: this.$t('lbl_SystemData_0'),
          icon: BIconClipboardData,
          key: 'SD1001',
          options: [
            {
              path: '/system-maintenance/configurations',
              text: this.$t('lbl_SystemData_SystemSet_0'),
              icon: BIconCaretRight,
              key: 'SS010',
              selected: this.path.includes(
                '/system-maintenance/configurations'
              ),
            },
            {
              path: '/system-maintenance/language',
              key: 'SS020',
              text: this.$t('lbl_SystemData_Language_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/system-maintenance/language'),
            },
            {
              path: '/system-maintenance/user-manage',
              key: 'SS030',
              text: this.$t('lbl_SystemData_User_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/system-maintenance/user-manage'),
            },
            {
              path: '/system-maintenance/security',
              key: 'SS040',
              text: this.$t('lbl_SystemData_Right_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/system-maintenance/security'),
            },
            {
              path: '/system-maintenance/edit-password',
              key: 'SS050',
              text: this.$t('lbl_SystemData_PasswordEdit_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/system-maintenance/edit-password'),
            },
            {
              path: '/system-profile',
              text: 'プロフィール',
              icon: BIconCaretRight,
              selected: this.path.includes(
                '/system-maintenance/system-profile'
              ),
            },
            {
              path: '/system-maintenance/barcode-management',
              key: 'SS050',
              text: this.$t('lbl_Barcode_Management_0'),
              icon: BIconCaretRight,
              selected: this.path.includes(
                '/system-maintenance/barcode-management'
              ),
            },
            {
              path: '/system-maintenance/about',
              text: this.$t('lbl_SystemData_About_0'),
              icon: BIconCaretRight,
              selected: this.path.includes('/system-maintenance/about'),
            },
          ],
          value: 'System Data',
        },
      ]
    },
  },
  methods: {
    parseStringToFloat(string = '') {
      const finalString = string || ''
      const parsedNumber = parseFloat(finalString.toString().replace(/,/g, ''))

      const validNumber =
        typeof parsedNumber === 'number' && !isNaN(parsedNumber)

      if (validNumber) {
        return parsedNumber
      }

      return 0
    },

    parseFloatCalculatePrice({ quantity, price, discountRate, taxRate }) {
      quantity = quantity ?? 0
      price = price ?? 0
      discountRate = discountRate / 100 ?? 0
      taxRate = taxRate / 100 ?? 0

      // Discount
      const priceIncludeDiscount = price * (1 - discountRate)
      const amount = quantity * priceIncludeDiscount

      // Tax
      const priceIncludeTax = priceIncludeDiscount * (1 + taxRate)
      const amountIncludeTax = quantity * priceIncludeTax

      // Chỉ làm tròn kết quả cuối cùng
      return {
        priceIncludeDiscount: this.parseFloatPrice(priceIncludeDiscount),
        amount: this.parseFloatPrice(amount),
        priceIncludeTax: this.parseFloatPrice(priceIncludeTax),
        amountIncludeTax: this.parseFloatPrice(amountIncludeTax),
      }
    },

    parseFloatPrice(number) {
      return parseFloat(number.toFixed(2))
    },

    makeToast(variant = null, message = 'Success') {
      this.$bvToast.toast(message, {
        title: 'Message',
        variant,
        solid: true,
      })
    },
  },
}
