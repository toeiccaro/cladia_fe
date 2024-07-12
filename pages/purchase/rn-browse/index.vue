<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableRNBrowse
      ref="tableRNBrowse"
      @changeLayout="changeLayout"
    />
    <BaseSetColumn
      ref="modalSetColumn"
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
import { EXPORT_TYPES, SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar.vue'
import TableRNBrowse from '@/components/Purchase/PurchaseRNBrowse/TableRNBrowse.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'

export default {
  name: 'PurchaseRNBrowse',
  components: { ToolBar, TableRNBrowse, BaseSetColumn },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
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
          items: [],
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
      currentId: '',
      loading: false,
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      payloadPurchaseRNBrowse: 'filterSort/getPayloadPurchaseRNBrowse',
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      purchaseRNBrowseTotalPages: 'purchase/getPurchaseRNBrowseTotalPages',
    }),
    listToolBarsCheckAuthority() {
      const hasManyPages = this.purchaseRNBrowseTotalPages > 1
      return this.listToolBars.map((item) => {
        if (item.key === 'export') {
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
                id: _el.id,
                fieldOrder: index - 1,
                gridName: _el.gridName,
                hidden: _el.hidden,
                loginId: _el.loginId,
                fieldKey: item.key,
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
      return this.$refs.tableRNBrowse.refresh()
    },
    async exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const queryPayload = {
        ...this.payloadPurchaseRNBrowse,
        language: this.$i18n.locale,
        searchType: EXPORT_TYPES.PAGED,
      }
      await this.handleExportExcel(queryPayload)
    },
    async exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFilter = this.payloadPurchaseRNBrowse
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const queryPayload = {
        ...sortFilter,
        language: this.$i18n.locale,
        searchType: EXPORT_TYPES.ALL,
      }
      await this.handleExportExcel(queryPayload)
    },
    changeActiveToolBar(key) {
      if (key === 'set') {
        return (this.$refs.modalSetColumn.showModal = true)
      }
      if (key === 'refresh') {
        return location.reload()
      }
      if (key === 'saveLayout') {
        return this.handleSaveLayout()
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
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
          this.$refs.tableRNBrowse.refresh()
        }
      } catch (err) {
        console.log(err)
      } finally {
        this.loading = false
      }
    },
    async handleExportExcel(queryPayload) {
      try {
        this.loading = true
        const response = await api('exportPurchaseRNBrowse', queryPayload)
        if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
          downloadFileExcel(response.data)
        }
      } catch (err) {
        console.log(err)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
