<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <TableDemandSupply
      ref="tableDemandSupply"
      :label-mapping="labelMapping"
      @changeLayout="changeLayout"
    />
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
import { SERVER_RESPONSE_CODE, TOOLBAR_KEYS, TOOLBAR_TYPE } from '@/constants'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar'
import TableDemandSupply from '@/components/MRP/DemandSupply/TableDemandSupply.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'

export default {
  components: { ToolBar, TableDemandSupply, BaseValidateMessage },
  middleware: ['authenticated'],
  data() {
    return {
      loading: false,
      listToolBars: [
        {
          key: TOOLBAR_KEYS.REFRESH,
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: TOOLBAR_KEYS.EXPORT,
          label: this.$t('btn_btnExport_0'),
          icon: '/images/export.png',
          type: TOOLBAR_TYPE.MENU,
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
          key: TOOLBAR_KEYS.SAVE,
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: TOOLBAR_KEYS.CLOSE,
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      listErrorMessage: [],
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      payloadDemandSupply: 'filterSort/getPayloadDemandSupply',
      demandSupplyMemos: 'mrp/getDemandSupplyMemos',
      demandSupplyTotalPages: 'mrp/getDemandSupplyTotalPages',
    }),
    labelMapping() {
      return {
        MrpID: this.$t('lbl_MrpID_0'),
        MRPOrderType: this.$t('lbl_MRPOrderType_0'),
        OrderNO: this.$t('lbl_OrderNO_0'),
        CreateOrderNO: this.$t('lbl_CreateOrderNO_0'),
        CreateOrderLineNO: this.$t('lbl_CreateOrderLineNO_0'),
        MRPRelateOrderNO: this.$t('lbl_MRPRelateOrderNO_0'),
        MRPLineID: this.$t('lbl_MRPLineID_0'),
        ItemCode: this.$t('lbl_ItemCode_0'),
        SafeQty: this.$t('lbl_SafeQty_0'),
        DemandQty: this.$t('lbl_DemandQty_0'),
        SupplyQty: this.$t('lbl_SupplyQty_0'),
        StockQty: this.$t('lbl_StockQty_0'),
        PlannedQty: this.$t('lbl_PlannedQty_0'),
        NeedQty: this.$t('lbl_NeedQty_0'),
        NeedDays: this.$t('lbl_NeedDays_0'),
        MRPSupplierName: this.$t('lbl_MRPSupplierName_0'),
        Memo: this.$t('lbl_Memo_0'),
        MRPSDStartDate: this.$t('lbl_MRPSDStartDate_0'),
        MRPSDEndDate: this.$t('lbl_MRPSDEndDate_0'),
        LeadTime: this.$t('lbl_LeadTime_0'),
        ItemName: this.$t('lbl_ItemName_0'),
      }
    },

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === TOOLBAR_KEYS.EXPORT) {
          const hasManyPages = this.demandSupplyTotalPages > 1
          const exportItems = hasManyPages
            ? [
                {
                  text: 'btn_btnPaged_0',
                  action: () => this.exportByPage(),
                },

                {
                  text: 'btn_btnFiltered_0',
                  action: () => this.exportAll(),
                },
              ]
            : [
                {
                  text: 'btn_btnPaged_0',
                  action: () => this.exportByPage(),
                },
              ]
          item.items = exportItems
          item.disabled = !this.activeButtonToolBar?.isExport
        }
        return item
      })
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
                fieldKey: item.key,
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
    changeActiveToolBar(key) {
      switch (key) {
        case TOOLBAR_KEYS.REFRESH:
          return location.reload()
        case TOOLBAR_KEYS.SAVE:
          this.handleSaveDemandSupply()
          return
        case TOOLBAR_KEYS.CLOSE:
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          break
      }
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFormOptional = {
        ...this.payloadDemandSupply,
        language: this.$i18n.locale,
        isExportAll: false,
      }
      this.handleExportExcel(sortFormOptional)
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFilter = this.payloadDemandSupply
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        language: this.$i18n.locale,
        isExportAll: true,
      }
      this.handleExportExcel(sortFormOptional)
    },
    async handleExportExcel(payload) {
      const response = await api('exportExcelDemandSupply', payload)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    async handleSaveDemandSupply() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) return

        this.loading = true
        this.listErrorMessage = []
        const hasInvalidMemo = this.demandSupplyMemos.some(
          (item) => item.memo.length > 1000
        )
        if (hasInvalidMemo) {
          this.listErrorMessage.push({
            fieldName: this.$t('lbl_Memo_0'),
            text: this.$t('msg_ValidateMemo_0'),
          })
          return
        }
        const [memoStatus, layoutStatus] = await Promise.all([
          this.updateMemo(),
          this.updateTableLayout(),
        ])
        if (
          memoStatus === SERVER_RESPONSE_CODE.OK &&
          layoutStatus === SERVER_RESPONSE_CODE.OK
        ) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.$refs.tableDemandSupply.filterSortDemandSupply()
        }
      } catch (err) {
        console.log(err)
      } finally {
        this.loading = false
      }
    },
    async updateTableLayout() {
      try {
        const res = await api('updateColumn', this.listColumnChange)
        return res.status
      } catch (err) {
        console.log(err)
      }
    },
    async updateMemo() {
      try {
        const res = await api('updateDemandSupply', this.demandSupplyMemos)
        return res.status
      } catch (err) {
        console.log(err)
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
