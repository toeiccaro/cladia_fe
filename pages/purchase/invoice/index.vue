<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TablePurchaseOrder
      ref="tablePurchaseOrder"
      :label-mapping="labelMapping"
      @handleDetailId="handleDetailId"
      @changeLayout="changeLayout"
    />
    <BaseSetColumn
      ref="modalSetColumn"
      :label-mapping="labelMapping"
      @reloadSet="functionReload"
    ></BaseSetColumn>
    <div
      v-if="loading"
      class="spinner content d-flex justify-content-center align-items-center"
    >
      <b-spinner
        b-spinner
        style="width: 3rem; height: 3rem"
        label="Loading..."
      ></b-spinner>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar'
import TablePurchaseOrder from '@/components/Purchase/PurchaseInvoice/TablePurchaseInvoice.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'

export default {
  components: { ToolBar, TablePurchaseOrder, BaseSetColumn },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'edit',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'export',
          label: this.$t('btn_btnExport_0'),
          icon: '/images/export.png',
          type: 'menu',
          items: [
            {
              text: 'btn_btnPaged_0',
              action: () => this.exportByPage(),
            },

            {
              text: 'btn_btnFiltered_0',
              action: () => this.exportAll(),
            },
          ],
        },
        {
          key: 'set',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'saveLayout',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      loading: false,
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
      currentId: '',
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getPayloadPurchaseInvoice: 'filterSort/getPayloadPurchaseInvoice',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'add':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'edit':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'export':
            item.disabled = !this.activeButtonToolBar?.isExport
            break
          default:
            break
        }
        return item
      })
    },
    labelMapping() {
      return {
        LineID: this.$t('lbl_LineID_0'),
        SupplierName: this.$t('lbl_SupplierName_0'),
        OrderNO: this.$t('lbl_OrderNO_0'),
        InvoiceNO: this.$t('lbl_InvoiceNo_0'),
        OrderDate: this.$t('lbl_OrderDate_0'),
        Currency: this.$t('lbl_Currency_0'),
        DeliveryNO: this.$t('lbl_DeliveryNO_0'),
        PaymentID: this.$t('lbl_PaymentID_0'),
        ShareType: this.$t('lbl_ShareType_0'),
        TotalTariff: this.$t('lbl_TotalTariff_0'),
        TotalOtherCost1: this.$t('lbl_TotalOtherCost1_0'),
        TotalOtherCost2: this.$t('lbl_TotalOtherCost2_0'),
        TotalOtherCost3: this.$t('lbl_TotalOtherCost3_0'),
        TotalOtherCost4: this.$t('lbl_TotalOtherCost4_0'),
        TotalOtherCost5: this.$t('lbl_TotalOtherCost5_0'),
        NoTaxAmount: this.$t('lbl_NoTaxAmount_0'),
        Tariff: this.$t('lbl_Tariff_0'),
        ItemCode: this.$t('lbl_ItemCode_0'),
        ItemName: this.$t('lbl_ItemName_0'),
        Unit: this.$t('lbl_Unit_0'),
        Price: this.$t('lbl_Price_0'),
        Quantity: this.$t('lbl_Quantity_0'),
        Weight: this.$t('lbl_Weight_0'),
        Amount: this.$t('lbl_Amount_0'),
        OtherCost: this.$t('lbl_OtherCost_0'),
        TaxRate: this.$t('lbl_TaxRate_0'),
        Memo: this.$t('lbl_Memo_0'),
        ReceiptLineID: this.$t('lbl_ReceiptLineID_0'),
        PONO: this.$t('lbl_PONO_0'),
        ReceiptNo: this.$t('lbl_ReceiptNo_0'),
        EditDate: this.$t('lbl_EditDate_0'),
        EditUser: this.$t('lbl_EditUser_0'),
        CheckUser: this.$t('lbl_CheckUser_0'),
        CheckDate: this.$t('lbl_CheckDate_0'),
        Description: this.$t('lbl_Description_0'),
        IsCheck: this.$t('lbl_IsCheck_0'),
        IsStop: this.$t('lbl_IsStop_0'),
        ReceiptDate: this.$t('lbl_ReceiptDate_0'),
      }
    },
  },
  watch: {
    'dataLayout.headerData': {
      immediate: true,
      deep: true,
      handler(val) {
        this.listColumnChange = []
        this.dataLayout?.headerData?.forEach((item, index) => {
          this.listDataColumn.forEach((_el) => {
            if (item.fieldName === _el.fieldName) {
              this.listColumnChange.push({
                fieldWide: item.width.toString(),
                fieldName: item.fieldName,
                id: _el.id,
                fieldOrder: index - 1,
                gridName: _el.gridName,
                hidden: _el.hidden,
                loginId: _el.loginId,
              })
            }
          })
        })
      },
    },
  },
  methods: {
    functionReload() {
      this.$bus.$emit('refresh-filter-data')
      return this.$refs.tablePurchaseOrder.refresh()
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    handleDetailId(data) {
      this.currentId = data
    },
    changeActiveToolBar(key) {
      if (key === 'add') {
        this.$router.push(this.localePath({ path: '/purchase/invoice/add' }))
      }
      if (key === 'edit') {
        this.currentId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/purchase/invoice/detail?orderNo=${this.currentId}`,
          })
      }
      if (key === 'refresh') {
        return location.reload()
      }
      if (key === 'set') {
        return (this.$refs.modalSetColumn.showModal = true)
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'saveLayout') {
        this.handleSaveLayout()
      }
    },
    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        this.loading = true
        await api('updateColumn', this.listColumnChange)
        this.$refs.tablePurchaseOrder.refresh()
        this.loading = false
      }
    },
    async handleExportExcel(payload) {
      this.loading = true
      const response = await api('exportExcelPurchaseInvoice', payload)
      this.loading = false
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    exportByPage() {
      const sortFormOptional = this.getPayloadPurchaseInvoice
      sortFormOptional.exportAllData = true // FIXME: BE dang de true = export by page
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      this.handleExportExcel(sortFormOptional)
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFilter = JSON.parse(
        JSON.stringify(this.getPayloadPurchaseInvoice)
      )
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        exportAllData: false, // FIXME: BE dang de false = export all
      }
      this.handleExportExcel(sortFormOptional)
    },
  },
}
</script>
