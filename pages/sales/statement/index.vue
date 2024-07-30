<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableStatement
      ref="tableStatement"
      :label-mapping="labelMapping"
      @detail="handleDetailId"
      @changeLayout="changeLayout"
    />
    <BaseSetColumn
      ref="modalSetColumn"
      :label-mapping="labelMapping"
      @reloadSet="functionReload"
    ></BaseSetColumn>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE, TOOLBAR_TYPE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar'
import TableStatement from '@/components/Sale/Statement/TableStatement'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn'

export default {
  components: { ToolBar, TableStatement, BaseSetColumn },
  middleware: ['authenticated'],
  data() {
    return {
      componentRefesh: true,
      listToolBars: [
        {
          key: 'addStatement',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'editStatement',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
        },
        {
          key: 'refreshStatement',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'exportStatement',
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
          key: 'setStatement',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'saveLayout',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'closeStatement',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      currentId: '',
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
    }),
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'addStatement':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'editStatement':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'exportStatement':
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
        StatementNo: this.$t('lbl_StatementNo_0'),
        CustomerName: this.$t('lbl_CustomerName_0'),
        StatementDate: this.$t('lbl_StatementDate_0'),
        StYear: this.$t('lbl_StYear_0'),
        StMonth: this.$t('lbl_StMonth_0'),
        Currency: this.$t('lbl_Currency_0'),
        OrderNo: this.$t('lbl_OrderNO_0'),
        OrderDate: this.$t('lbl_OrderDate_0'),
        Amount: this.$t('lbl_Amount_0'),
        EditUser: this.$t('lbl_EditUser_0'),
        EditDate: this.$t('lbl_EditDate_0'),
        Memo: this.$t('lbl_Memo_0'),
        DeliveryDate: this.$t('lbl_DeliveryDate_0'),
        PayDate: this.$t('lbl_PayDate_0'),
        //mock
        SOPriceIncludeTax: this.$t('lbl_SOPriceIncludeTax_0'),
        SOAmountIncludeTax: this.$t('lbl_SOAmountIncludeTax_0'),
        SODiscountRate: this.$t('lbl_SODiscountRate_0'),
        SOPriceIncludeDiscount: this.$t('lbl_SOPriceIncludeDiscount_0'),
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
      return this.$refs.tableStatement.refresh()
    },
    exportByPage() {
      const sortFormOptional = this.$refs.tableStatement.sortFormOptional
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
      const sortFormOptional = {
        ...this.$refs.tableStatement.sortFormOptional,
        localLanguage: this.$i18n.locale,
        exportAllData: true,
      }
      this.handleExportExcel(sortFormOptional)
    },
    changeActiveToolBar(key) {
      if (key === 'addStatement') {
        return this.$router.push(
          this.localePath({ path: '/sales/statement/add' })
        )
      }

      if (key === 'editStatement') {
        this.currentId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/sales/statement/detail?statementNo=${this.currentId}`,
          })
        return
      }
      if (key === 'exportStatement') {
        return this.handleExportExcel()
      }

      if (key === 'setStatement') {
        return (this.$refs.modalSetColumn.showModal = true)
      }

      if (key === 'refreshStatement') {
        return location.reload()
      }
      if (key === 'closeStatement') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'saveLayout') {
        return this.handleSaveLayout()
      }
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        await api('updateColumn', this.listColumnChange)
        this.$refs.tableStatement.refresh()
      }
    },
    handleDetailId(data) {
      this.currentId = data
    },
    async handleExportExcel(sortFormOptional) {
      this.loading = true
      const response = await api('exportStatement', sortFormOptional)
      this.loading = false
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
  },
}
</script>
