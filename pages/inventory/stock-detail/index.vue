<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableStockDetail
      ref="tableStockDetail"
      :label-mapping="labelMapping"
      @changeLayout="changeLayout"
    />
    <BaseSetColumn
      ref="modalSetColumn"
      :label-mapping="labelMapping"
      @reloadSet="functionReload"
    ></BaseSetColumn>
    <BaseTableLoader v-if="loading"></BaseTableLoader>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar'
import TableStockDetail from '@/components/Inventory/StockDetail/TableStockDetail.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'

export default {
  components: { ToolBar, TableStockDetail, BaseSetColumn, BaseTableLoader },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
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
      loading: false,
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getPayloadStockDetail: 'filterSort/getPayloadStockDetail',
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
        OrderNo: this.$t('lbl_OrderNO_0'),
        Currency: this.$t('lbl_Currency_0'),
        Department: this.$t('lbl_Department_0'),
        ItemCode: this.$t('lbl_ItemCode_0'),
        ItemName: this.$t('lbl_ItemName_0'),
        Unit: this.$t('lbl_Unit_0'),
        Price: this.$t('lbl_Price_0'),
        Amount: this.$t('lbl_Amount_0'),
        Description: this.$t('lbl_Description_0'),
        EditUser: this.$t('lbl_EditUser_0'),
        EditDate: this.$t('lbl_EditDate_0'),
        ItemType: this.$t('lbl_ItemType_0'),
        TransDate: this.$t('lbl_TransDate_0'),
        OrderType: this.$t('lbl_OrderType_0'),
        IsBad: this.$t('lbl_IsBad_0'),
        RackNo: this.$t('lbl_RackNO_0'),
        LotNO: this.$t('lbl_LotNo_0'),
        Warehouse: this.$t('lbl_Warehouse_0'),
        Reason: this.$t('lbl_Reason_0'),
        Memo: this.$t('lbl_Memo_0'),
        Quantity: this.$t('lbl_Quantity_0'),
        GoodsReceiverName: this.$t('lbl_GoodsReceiverName_0'),
        GoodsDispatcherName: this.$t('lbl_GoodsDispatcherName_0'),
        LabelCode: this.$t('lbl_LabelCode_0'),
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
      return this.$refs.tableStockDetail.refresh()
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async changeActiveToolBar(key) {
      if (key === 'exportView') {
        return await this.handleExportExcel()
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
        this.$refs.tableStockDetail.refresh()
        this.loading = false
      }
    },
    async handleExportExcel(payload) {
      this.loading = true
      const response = await api('exportExcelStock', payload)
      this.loading = false
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    exportByPage() {
      const sortFormOptional = this.getPayloadStockDetail
      sortFormOptional.exportAllData = false
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
      const sortFilter = JSON.parse(JSON.stringify(this.getPayloadStockDetail))
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        exportAllData: true,
      }
      this.handleExportExcel(sortFormOptional)
    },
  },
}
</script>
