<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TablePurchasePrice
      ref="tableSaleReturn"
      @changeLayout="changeLayout"
      @handleRowSelected="handleRowSelected"
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
import TablePurchasePrice from '@/components/Purchase/PurchasePrice/TablePurchasePrice'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'

export default {
  components: { ToolBar, TablePurchasePrice, BaseSetColumn, BaseTableLoader },
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
      selectedRowData: {},
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      payloadPurchasePrice: 'filterSort/getPayloadPurchasePrice',
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
        InQuantity: this.$t('lbl_InQuantity _0'),
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
    handleRowSelected(data) {
      this.selectedRowData = data?.item
    },
    functionReload() {
      return this.$refs.tableSaleReturn.refresh()
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    changeActiveToolBar(key) {
      switch (key) {
        case 'export':
          return this.handleExportExcel()
        case 'add':
          return this.handleAdd()
        case 'edit':
          return this.handleEdit()
        case 'set':
          return this.handleSetLayout()
        case 'refresh':
          return location.reload()
        case 'close':
          return this.handleClose()
        case 'saveLayout':
          return this.handleSaveLayout()
        default:
          break
      }
    },

    handleAdd() {
      return this.$router.push(
        this.localePath({ path: '/purchase/po-price/add' })
      )
    },
    handleEdit() {
      const supplierId = this.selectedRowData.supplierId?.value
      const effectiveDate = this.selectedRowData.effectiveDate?.value
      const itemId = this.selectedRowData.itemId?.value

      const validRowData = supplierId && effectiveDate && itemId

      return (
        validRowData &&
        this.$router.push({
          path: `/${this.$i18n.locale}/purchase/po-price/detail`,
          query: {
            lang: this.lang,
            supplierId,
            effectiveDate,
            itemId,
          },
        })
      )
    },
    handleSetLayout() {
      return (this.$refs.modalSetColumn.showModal = true)
    },
    handleClose() {
      return this.$router.push(this.localePath({ path: '/' }))
    },

    async handleSaveLayout() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.loading = true
        await api('updateColumn', this.listColumnChange)
        this.$refs.tableSaleReturn.refresh()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async handleExportExcel(payload) {
      try {
        this.loading = true
        const response = await api('exportPurchasePrice', payload)
        const validResponse =
          response?.status === SERVER_RESPONSE_CODE.OK && response?.data

        if (validResponse) {
          downloadFileExcel(response.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    exportByPage() {
      const exportPayload = {
        ...this.payloadPurchasePrice,
        export: false,
        language: this.lang,
      }

      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      this.handleExportExcel(exportPayload)
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }

      const exportPayload = {
        ...this.payloadPurchasePrice,
        export: true,
        language: this.lang,
      }
      this.handleExportExcel(exportPayload)
    },
  },
}
</script>
