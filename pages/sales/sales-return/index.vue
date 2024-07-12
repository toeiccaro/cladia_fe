<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableSaleReturn
      ref="tableSaleReturn"
      @changeLayout="changeLayout"
      @handleDetailId="handleDetailId"
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
import TableSaleReturn from '@/components/Sale/SaleReturn/TableSaleReturn.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'

export default {
  components: { ToolBar, TableSaleReturn, BaseSetColumn, BaseTableLoader },
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
      getPayloadSaleReturn: 'filterSort/getPayloadSaleReturn',
    }),

    listToolBarsCheckAuthority() {
      const listCheckByEdit = ['add', 'edit']
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case listCheckByEdit.includes(item.key):
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
    handleDetailId(data) {
      this.currentId = data
    },
    functionReload() {
      this.$bus.$emit('refresh-filter-data')
      return this.$refs.tableSaleReturn.refresh()
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async changeActiveToolBar(key) {
      if (key === 'export') {
        return await this.handleExportExcel()
      }
      if (key === 'add') {
        return this.$router.push(
          this.localePath({ path: '/sales/sales-return/add' })
        )
      }
      if (key === 'edit') {
        this.currentId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/sales/sales-return/detail?returnNo=${this.currentId}`,
          })
      }
      if (key === 'set') {
        return (this.$refs.modalSetColumn.showModal = true)
      }
      if (key === 'refresh') {
        return location.reload()
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
        this.$refs.tableSaleOrder.refresh()
        this.loading = false
      }
    },
    async handleExportExcel(payload) {
      this.loading = true
      const response = await api('exportExcelSaleReturn', payload)
      this.loading = false
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    exportByPage() {
      const sortFormOptional = this.getPayloadSaleReturn
      sortFormOptional.isOutputAll = false
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
      const sortFilter = JSON.parse(JSON.stringify(this.getPayloadSaleReturn))
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        isOutputAll: true,
      }
      this.handleExportExcel(sortFormOptional)
    },
  },
}
</script>
