<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableInvoice
      ref="tableSaleInvoice"
      @handleDetailId="handleDetailId"
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
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar.vue'
import TableInvoice from '@/components/Sale/Invoice/TableInvoice.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'

export default {
  components: { ToolBar, TableInvoice, BaseSetColumn },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'addInvoice',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'editInvoice',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
        },
        {
          key: 'refreshInvoice',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'exportInvoice',
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
          key: 'setInvoice',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'saveLayout',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'closeInvoice',
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
      activeButtonToolBar: 'base/getActiveButtonToolBar',
    }),
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'addInvoice':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'editInvoice':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'exportInvoice':
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
    functionReload() {
      this.$bus.$emit('refresh-filter-data')
      return this.$refs.tableSaleInvoice.refresh()
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (confirm) {
        const payload = {
          ...this.$refs.tableSaleInvoice.statusPayload,
          language: this.$i18n.locale,
          exportExcel: true,
        }
        console.log("exportByPage", payload)

        this.handleExportExcel(payload)
      }
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (confirm) {
        const payload = {
          ...this.$refs.tableSaleInvoice.statusPayload,
          language: this.$i18n.locale,
          exportExcel: false,
        }
        console.log("exportAll", payload)
        this.handleExportExcel(payload)
      }
    },
    changeActiveToolBar(key) {
      if (key === 'addInvoice') {
        return this.$router.push(
          this.localePath({ path: '/sales/invoice/add' })
        )
      }
      if (key === 'editInvoice') {
        this.currentId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/sales/invoice/detail?invoiceNo=${this.currentId}`,
          })
        return
      }
      if (key === 'exportInvoice') {
        return this.handleExportExcel()
      }
      if (key === 'setInvoice') {
        return (this.$refs.modalSetColumn.showModal = true)
      }
      if (key === 'refreshInvoice') {
        return location.reload()
      }
      if (key === 'closeInvoice') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'saveLayout') {
        return this.handleSaveLayout()
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
        this.$refs.tableSaleInvoice.refresh()
      }
    },
    async handleExportExcel(payload) {
      this.loading = true
      const response = await api('exportInvoice', payload)
      this.loading = false
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
  },
}
</script>
