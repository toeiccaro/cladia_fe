<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableViews
      ref="tableSaleView"
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
import TableViews from '@/components/Sale/View/TableViews'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'

export default {
  components: { ToolBar, TableViews, BaseSetColumn },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'stopView',
          label: this.$t('btn_btnStop_0'),
          icon: '/images/check.png',
        },
        {
          key: 'refreshView',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'exportView',
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
          key: 'setView',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'saveLayout',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'closeView',
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
      getPayloadSalesView: 'filterSort/getPayloadSaleView',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'exportView') {
          item.disabled = !this.activeButtonToolBar?.isExport
        }
        return item
      })
    },
    labelMapping() {
      return {
        LineID: this.$t('lbl_LineID_0'),
        CustomerName: this.$t('lbl_CustomerName_0'),
        SONO: this.$t('lbl_SONO_0'),
        OrderDate: this.$t('lbl_OrderDate_0'),
        CustomerPO: this.$t('lbl_CustomerPO_0'),
        Currency: this.$t('lbl_Currency_0'),
        Department: this.$t('lbl_Department_0'),
        PromiseDate: this.$t('lbl_PromiseDate_0'),
        ItemCode: this.$t('lbl_ItemCode_0'),
        ItemName: this.$t('lbl_ItemName_0'),
        Unit: this.$t('lbl_Unit_0'),
        Price: this.$t('lbl_Price_0'),
        SOQTY: this.$t('lbl_SOQty_0'),
        Amount: this.$t('lbl_ARAmount_0'),
        InvoiceQTY: this.$t('lbl_InvoiceQTY_0'),
        ReturnQTY: this.$t('lbl_ReturnQTY_0'),
        Blance: this.$t('lbl_Blance_0'),
        BlanceAmount: this.$t('lbl_BlanceAmount_0'),
        StopQty: this.$t('lbl_StopQty_0'),
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
      return this.$refs.tableSaleView.refresh()
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    handleDetailId(data) {
      this.paramsStopView = data
    },
    changeActiveToolBar(key) {
      if (key === 'stopView') {
        return this.handleStopView()
      }
      if (key === 'setView') {
        return (this.$refs.modalSetColumn.showModal = true)
      }
      if (key === 'refreshView') {
        return location.reload()
      }
      if (key === 'closeView') {
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
        this.$refs.tableSaleView.refresh()
        this.loading = false
      }
    },
    async handleExportExcel(payload) {
      this.loading = true
      const response = await api('exportView', payload)
      this.loading = false
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (confirm) {
        const payload = {
          ...this.getPayloadSalesView,
          exportAll: false,
        }
        this.handleExportExcel(payload)
      }
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (confirm) {
        const sortFilter = this.getPayloadSalesView
        delete sortFilter.pageNo
        delete sortFilter.pageSize
        const payload = {
          ...sortFilter,
          exportAll: true,
        }
        this.handleExportExcel(payload)
      }
    },
    async handleStopView() {
      try {
        const invoiceQuantity = this.paramsStopView?.item?.invoiceQTY?.value
        const isStopped = this.paramsStopView?.item?.stopQty?.value
        const soQuantity = this.paramsStopView?.item?.soqty?.value

        const canNotStop = isStopped || invoiceQuantity === soQuantity

        if (canNotStop) {
          return
        }

        const confirm = window.confirm(this.$t('msg_RecordStop_0'))
        if (!confirm) {
          return
        }

        this.loading = true

        const payload = this.paramsStopView.keyRow
        const res = await api('stopView', payload)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          return this.$refs.tableSaleView?.refresh()
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
