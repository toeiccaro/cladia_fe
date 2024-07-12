<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableInventoryAdjustment
      ref="tableInventoryAdjustment"
      :label-mapping="labelMapping"
      @detail="handleDetailId"
      @changeLayout="changeLayout"
    />
    <BaseSetColumn
      ref="modalSetColumn"
      :label-mapping="labelMapping"
      @reloadSet="reloadSet"
    ></BaseSetColumn>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar.vue'
import TableInventoryAdjustment from '@/components/Inventory/Adjustment/TableInventoryAdjustment.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'

export default {
  components: { ToolBar, TableInventoryAdjustment, BaseSetColumn },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'ADD',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'EDIT',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
        },
        {
          key: 'refreshInventoryAdjustment',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'EXPORT',
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
          key: 'setInventoryAdjustment',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'saveLayout',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'closeInventoryAdjustment',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      currentId: '',
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
    }),
    typeQuery() {
      return this.$route?.query?.type ?? ''
    },
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'ADD':
            item.disabled = !this.typeQuery
              ? true
              : !this.activeButtonToolBar?.isEdit
            break
          case 'EDIT':
            item.disabled = !this.typeQuery
              ? true
              : !this.activeButtonToolBar?.isEdit
            break
          case 'EXPORT':
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
        OrderNo: this.$t('lbl_OrderNO_0'),
        LineID: this.$t('lbl_LineID_0'),
        Warehouse: this.$t('lbl_Warehouse_0'),
        RackNo: this.$t('lbl_RackNO_0'),
        LotNO: this.$t('lbl_LotNo_0'),
        ItemName: this.$t('lbl_ItemName_0'),
        Quantity: this.$t('lbl_Quantity_0'),
        Unit: this.$t('lbl_Unit_0'),
        Price:
          this.lang === 'japanese'
            ? this.$t('lbl_CostPrice_0')
            : this.$t('lbl_Price_0'),
        Currency: this.$t('lbl_Currency_0'),
        IsBad: this.$t('lbl_IsBad_0'),
        Department:
          this.lang === 'japanese'
            ? this.$t('lbl_DepartType_0')
            : this.$t('lbl_Department_0'),
        RelateOrderNo: this.$t('lbl_RelateOrderNO_0'),
        RelateLineID: this.$t('lbl_RelateLineID_0'),
        Reason: this.$t('lbl_Reason_0'),
        Memo: this.$t('lbl_Memo_0'),
        EditUser: this.$t('lbl_EditUser_0'),
        EditDate: this.$t('lbl_EditDate_0'),
        TransDate: this.$t('lbl_TransDate_0'),
        OrderType: this.$t('lbl_OrderType_0'),
        Description: this.$t('lbl_Description_0'),
        Amount: this.$t('lbl_Amount_0'),
        ItemCode: this.$t('lbl_ItemCode_0'),
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
    changeActiveToolBar(key) {
      if (key === 'ADD') {
        const query = this.$route.query

        const urlQuery = new URLSearchParams()

        for (const key in query) {
          if (query[key]) {
            urlQuery.set(key, query[key])
          }
        }

        return this.$router.push({
          path: `/${this.$i18n.locale}/inventory/adjustment/add?${urlQuery}`,
        })
      }
      if (key === 'EDIT') {
        this.currentId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/inventory/adjustment/detail?type=${this.typeQuery}&orderNO=${this.currentId}`,
          })
        return
      }
      if (key === 'setInventoryAdjustment') {
        return (this.$refs.modalSetColumn.showModal = true)
      }
      if (key === 'refreshInventoryAdjustment') {
        return location.reload()
      }
      if (key === 'saveLayout') {
        return this.handleSaveLayout()
      }
      if (key === 'closeInventoryAdjustment') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    handleDetailId(data) {
      this.currentId = data
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        await api('updateColumn', this.listColumnChange)
        this.$refs.tableInventoryAdjustment.refresh()
      }
    },
    exportByPage() {
      const searchParamsOption =
        this.$refs.tableInventoryAdjustment.searchParamsOption
      const params = {
        type: this.typeQuery,
        form: { ...searchParamsOption, isExportAll: false },
      }
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      this.handleExportExcel(params)
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const searchParamsOption = {
        type: this.typeQuery,
        form: { localLanguage: this.$i18n.locale, isExportAll: true },
      }
      this.handleExportExcel(searchParamsOption)
    },
    async handleExportExcel(payload) {
      const response = await api('exportExcelAdjustment', payload)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },

    async reloadSet() {
      await this.$refs.tableInventoryAdjustment.refresh()
    },
  },
}
</script>
