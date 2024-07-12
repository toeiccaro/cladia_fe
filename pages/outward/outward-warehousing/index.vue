<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableOutwardWarehousing
      ref="tableSaleOrder"
      @handleActiveRow="handleActiveRow"
      @changeLayout="changeLayout"
    />
    <BaseSetColumn
      ref="modalSetColumn"
      @reloadSet="functionReload"
    ></BaseSetColumn>
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar.vue'
import TableOutwardWarehousing from '@/components/Outward/Warehousing/TableOutwardWarehousing.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'

export default {
  components: { ToolBar, TableOutwardWarehousing, BaseSetColumn, BaseLoading },
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
      selectedRow: {},
      loading: false,
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      payloadOutwardWarehousing: 'filterSort/getPayloadOutwardWarehousing',
      activeButtonToolBar: 'base/getActiveButtonToolBar',
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
  },
  watch: {
    'dataLayout.headerData': {
      immediate: true,
      deep: true,
      handler(val) {
        this.listColumnChange = []
        this.dataLayout?.headerData?.forEach((item, index) => {
          this.listDataColumn.forEach((_el) => {
            if (
              item.fieldKey === _el.fieldKey &&
              item.fieldName === _el.fieldName
            ) {
              this.listColumnChange.push({
                fieldWide: item.width.toString(),
                fieldName: item.fieldName,
                fieldKey: item.fieldKey,
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
      return this.$refs.tableSaleOrder.refresh()
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFormOptional = {
        ...this.payloadOutwardWarehousing,
        searchType: 'Paged',
      }
      this.handleExportExcel(sortFormOptional)
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFilter = this.payloadOutwardWarehousing
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        localLanguage: this.$i18n.locale,
        searchType: 'all',
      }
      this.handleExportExcel(sortFormOptional)
    },
    changeActiveToolBar(key) {
      switch (key) {
        case 'add':
          return this.handleAdd()
        case 'edit':
          return this.handleEdit()
        case 'set':
          return this.handleSet()
        case 'refresh':
          return this.handleRefresh()
        case 'close':
          return this.handleClose()
        case 'saveLayout':
          return this.handleSaveLayout()
        default:
          break
      }
    },
    handleAdd() {
      this.$router.push(
        this.localePath({ path: '/outward/outward-warehousing/add' })
      )
    },
    handleEdit() {
      const selectedOrderNumber = this.selectedRow?.orderNo?.value
      selectedOrderNumber &&
        this.$router.push({
          path: `/${this.$i18n.locale}/outward/outward-warehousing/detail?orderNo=${selectedOrderNumber}`,
        })
    },
    handleSet() {
      this.$refs.modalSetColumn.showModal = true
    },
    handleRefresh() {
      location.reload()
    },
    handleClose() {
      this.$router.push(this.localePath({ path: '/' }))
    },
    handleActiveRow(data) {
      this.selectedRow = data
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async handleSaveLayout() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (confirm) {
          this.loading = true
          await api('updateColumn', this.listColumnChange)
          this.$refs.tableSaleOrder.refresh()
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async handleExportExcel(sortFormOptional) {
      try {
        this.loading = true
        const response = await api('exportOutwardWarehousing', sortFormOptional)
        const validResponse =
          response?.status === SERVER_RESPONSE_CODE.OK && response?.data

        validResponse && downloadFileExcel(response.data)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
