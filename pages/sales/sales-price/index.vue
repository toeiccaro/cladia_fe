<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableSalePrice
      ref="tableSalesPrice"
      @changeLayout="changeLayout"
      @handleDetailId="handleDetailRow"
    />
    <BaseSetColumn
      ref="modalSetColumn"
      @reload-set="functionReload"
      @on-close="$refs.tableSalesPrice.refresh()"
    ></BaseSetColumn>
    <BaseTableLoader v-if="loading"></BaseTableLoader>
    <ModalBatchAddSalePrice ref="modalBatchAdd" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { dateFormatYYYY, downloadFileExcel } from '@/utils/utils'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar'
import TableSalePrice from '@/components/Sale/SalePrice/TableSalePrice.vue'
import ModalBatchAddSalePrice from '@/components/Sale/SalePrice/Modal/ModalBatchAddSalePrice.vue'
import api from '@/api/api'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'

export default {
  components: {
    ToolBar,
    TableSalePrice,
    BaseSetColumn,
    BaseTableLoader,
    ModalBatchAddSalePrice,
  },
  middleware: ['authenticated'],
  data() {
    return {
      selectedRowIndex: null,
      listToolBars: [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'batchAdd',
          label: this.$t('btn_btnPriceEditBatch_0'),
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
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getPayloadSalePrice: 'filterSort/getPayloadSalePrice',
    }),

    listToolBarsCheckAuthority() {
      const listCheckByEdit = ['add', 'edit', 'batchAdd']
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
    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        this.loading = true
        await api('updateColumn', this.listColumnChange)
        this.$refs.tableSalesPrice.refresh()
        this.loading = false
      }
    },
    handleDetailRow(data) {
      this.selectedRowIndex = data.index
    },
    functionReload() {
      this.$bus.$emit('refresh-filter-data')
      return this.$refs.tableSalesPrice.refresh()
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async changeActiveToolBar(key) {
      if (key === 'saveLayout') {
        return this.handleSaveLayout()
      }
      if (key === 'export') {
        return await this.handleExportExcel()
      }
      if (key === 'add') {
        return this.$router.push(
          this.localePath({ path: '/sales/sales-price/add' })
        )
      }
      if (key === 'edit') {
        return this.handleEdit()
      }
      if (key === 'set') {
        return (this.$refs.modalSetColumn.showModal = true)
      }
      if (key === 'batchAdd') {
        return (this.$refs.modalBatchAdd.showModal = true)
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
    handleEdit() {
      const dataTable = this.$refs.tableSalesPrice.dataTable
      const itemToEdit = (dataTable && dataTable[this.selectedRowIndex]) || {}

      this.selectedRowIndex >= 0 &&
        this.$router.push({
          path: this.localePath('/sales/sales-price/detail'),
          query: {
            customerID: itemToEdit.customerID,
            itemID: itemToEdit.itemID,
            effectiveDate: dateFormatYYYY(new Date(itemToEdit.effectiveDate)),
          },
        })
    },

    async handleExportExcel(payload) {
      this.loading = true
      const response = await api('exportExcelSalePrice', payload)
      this.loading = false
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    exportByPage() {
      const sortFormOptional = this.getPayloadSalePrice
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
      const sortFilter = JSON.parse(JSON.stringify(this.getPayloadSalePrice))
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
