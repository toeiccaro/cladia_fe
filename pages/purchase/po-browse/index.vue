<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TablePurchaseBrowse
      ref="tablePurchaseBrowse"
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
import TablePurchaseBrowse from '@/components/Purchase/PurchaseBrowse/TablePurchaseBrowse.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'

export default {
  components: { ToolBar, TablePurchaseBrowse, BaseSetColumn },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'stop',
          label: this.$t('btn_btnStop_0'),
          icon: '/images/check.png',
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
      paramsStopView: {},
      loading: false,
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getPayloadPurchaseBrowse: 'filterSort/getPayloadPurchaseBrowse',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'export') {
          item.disabled = !this.activeButtonToolBar?.isExport
        }
        return item
      })
    },
    labelMapping() {
      return {
        LineID: this.$t('lbl_LineID_0'),
        SupplierName: this.$t('lbl_SupplierName_0'),
        SONO: this.$t('lbl_SONO_0'),
        PONO: this.$t('lbl_PONO_0'),
        OrderDate: this.$t('lbl_OrderDate_0'),
        CustomerPO: this.$t('lbl_CustomerPO_0'),
        Currency: this.$t('lbl_Currency_0'),
        Department: this.$t('lbl_Department_0'),
        PromiseDate: this.$t('lbl_PromiseDate_0'),
        ItemCode: this.$t('lbl_ItemCode_0'),
        ItemName: this.$t('lbl_ItemName_0'),
        Unit: this.$t('lbl_Unit_0'),
        Price: this.$t('lbl_Price_0'),
        Quantity: this.$t('lbl_Quantity_0'),
        SOQTY: this.$t('lbl_SOQty_0'),
        Amount: this.$t('lbl_Amount_0'),
        ReceiptQty: this.$t('lbl_ReceiptQty_0'),
        RtQty: this.$t('lbl_RtQty_0'),
        Balance: this.$t('lbl_BalanceQty_0'),
        EndQuantity: this.$t('lbl_EndQuantity_0'),
        TaxRate: this.$t('lbl_TaxRate_0'),
        ArrivalAddress: this.$t('lbl_ArrivalAddress_0'),
        Memo: this.$t('lbl_Memo_0'),
        SupplierCode: this.$t('lbl_SupplierCode_0'),
        EditDate: this.$t('lbl_EditDate_0'),
        EditUser: this.$t('lbl_EditUser_0'),
        CheckUser: this.$t('lbl_CheckUser_0'),
        CheckDate: this.$t('lbl_CheckDate_0'),
        MemoDTL: this.$t('lbl_MemoDTL_0'),
        Description: this.$t('lbl_Description_0'),
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
      return this.$refs.tablePurchaseBrowse.refresh()
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    handleDetailId(data) {
      this.paramsStopView = data
    },
    async changeActiveToolBar(key) {
      if (key === 'stop') {
        return await this.handleStopView()
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
        this.$refs.tablePurchaseBrowse.refresh()
        this.loading = false
      }
    },
    async handleExportExcel(payload) {
      this.loading = true
      const response = await api('exportExcelPurchaseBrowse', payload)
      this.loading = false
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFormOptional = {
        ...this.getPayloadPurchaseBrowse,
        excelAll: false,
      }
      this.handleExportExcel(sortFormOptional)
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFilter = this.getPayloadPurchaseBrowse
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        excelAll: true,
      }
      this.handleExportExcel(sortFormOptional)
    },
    async handleStopView() {
      const isStopped = this.paramsStopView.item?.isStop?.value
      if (isStopped) {
        return
      }

      const confirm = window.confirm(this.$t('msg_RecordStop_0'))
      if (!confirm) {
        return
      }

      const supplierID = this.paramsStopView.item?.supplierID?.value
      const payload = Object.assign({}, this.paramsStopView.keyRow, {
        lang: this.$i18n.locale,
        pageNo: this.getPayloadPurchaseBrowse.pageNo,
        pageSize: this.getPayloadPurchaseBrowse.pageSize,
        supplierID,
      })

      await api('stopPurchaseBrowse', payload)

      this.$refs.tablePurchaseBrowse?.refresh()
    },
  },
}
</script>
