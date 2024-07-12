<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TablePurchaseArrival
      ref="tablePurchaseArrival"
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
import TablePurchaseArrival from '@/components/Purchase/PurchaseArrival/TablePurchaseArrival.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'

export default {
  components: { ToolBar, TablePurchaseArrival, BaseSetColumn },
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
      getPayloadPurchaseArrival: 'filterSort/getPayloadPurchaseArrival',
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
        SupplierName: this.$t('lbl_SupplierName_0'),
        ReceiptNo: this.$t('lbl_ReceiptNo_0'),
        PONO: this.$t('lbl_PONO_0'),
        DeliveryNO: this.$t('lbl_DeliveryNO_0'),
        ReceiptDate: this.$t('lbl_ReceiptDate_0'),
        Receiver: this.$t('lbl_Receiver_0'),
        Warehouse: this.$t('lbl_Warehouse_0'),
        LotNo: this.$t('lbl_LotNo_0'),
        ItemCode: this.$t('lbl_ItemCode_0'),
        ItemName: this.$t('lbl_ItemName_0'),
        Unit: this.$t('lbl_Unit_0'),
        Price: this.$t('lbl_Price_0'),
        Amount: this.$t('lbl_Amount_0'),
        ReceiptQty: this.$t('lbl_ReceiptQty_0'),
        Memo: this.$t('lbl_Memo_0'),
        EditDate: this.$t('lbl_EditDate_0'),
        EditUser: this.$t('lbl_EditUser_0'),
        Checker: this.$t('lbl_CheckUser_0'),
        CheckDate: this.$t('lbl_CheckDate_0'),
        MemoDTL: this.$t('lbl_MemoDTL_0'),
        Description: this.$t('lbl_Description_0'),
        IsCheck: this.$t('lbl_IsCheck_0'),
        GoodQty: this.$t('lbl_GoodQty_0'),
        BadQty: this.$t('lbl_BadQty_0'),
        InspectionType: this.$t('lbl_InspectionType_0'),
        IsPrintedLabel: this.$t('lbl_IsPrintedLabel_0')
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
      return this.$refs.tablePurchaseArrival.refresh()
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
        this.$router.push(this.localePath({ path: '/purchase/arrival/add' }))
      }
      if (key === 'edit') {
        this.currentId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/purchase/arrival/detail?receiptNO=${this.currentId}`,
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
        this.$refs.tablePurchaseArrival.refresh()
        this.loading = false
      }
    },
    async handleExportExcel(payload) {
      this.loading = true
      const response = await api('exportExcelPurchaseArrival', payload)
      this.loading = false
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    exportByPage() {
      const sortFormOptional = this.getPayloadPurchaseArrival
      sortFormOptional.isExportAll = false
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
        JSON.stringify(this.getPayloadPurchaseArrival)
      )
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        isExportAll: true,
      }
      this.handleExportExcel(sortFormOptional)
    },
  },
}
</script>
