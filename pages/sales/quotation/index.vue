<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>

    <TableQuotation
      ref="tableQuotation"
      @handleDetailId="handleDetailId"
      @changeLayout="changeLayout"
    />
    <BaseSetColumn
      ref="modalSetColumn"
      @reloadSet="functionReload"
    ></BaseSetColumn>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar.vue'
import TableQuotation from '@/components/Sale/Quotation/TableQuotation.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'

export default {
  components: { ToolBar, TableQuotation, BaseSetColumn },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'addQuotation',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'editQuotation',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
        },
        {
          key: 'refreshQuotation',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'exportQuotation',
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
          key: 'setQuotation',
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
      currentId: '',
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getStatusPayloadList: 'getStatusPayloadList',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'addQuotation':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'editQuotation':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'exportQuotation':
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
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        this.loading = true
        await api('updateColumn', this.listColumnChange)
        window.alert(this.$t('msg_IsSaved_0'))
        this.$refs.tableQuotation.refresh()
        this.loading = false
      }
    },
    functionReload() {
      this.$bus.$emit('refresh-filter-data')
      return this.$refs.tableQuotation.refresh()
    },
    changeActiveToolBar(key) {
      if (key === 'addQuotation') {
        return this.$router.push(
          this.localePath({ path: '/sales/quotation/add' })
        )
      }

      if (key === 'editQuotation') {
        this.currentId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/sales/quotation/detail?quoteNO=${this.currentId}`,
          })
        return
      }
      if (key === 'setQuotation') {
        return (this.$refs.modalSetColumn.showModal = true)
      }

      if (key === 'refreshQuotation') {
        return location.reload()
      }
      if (key === 'saveLayout') {
        this.handleSaveLayout()
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    handleDetailId(data) {
      this.currentId = data
    },
    async handleExportExcel(payload) {
      const response = await api('exportExcelQuotation', payload)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    exportByPage() {
      const sortFormOptional = this.getStatusPayloadList
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
      const sortFilter = JSON.parse(JSON.stringify(this.getStatusPayloadList))
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
