<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableOutwardOrder
      ref="tableOPOrder"
      @handleDetailId="handleDetailId"
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
import TableOutwardOrder from '@/components/Outward/OutwardOrder/TableOutwardOrder.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
export default {
  components: { ToolBar, TableOutwardOrder, BaseSetColumn, BaseLoading },
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
      currentId: '',
      loading: false,
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      getPayloadOutwardOrder: 'filterSort/getPayloadOutwardOrder',
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
            if (item.fieldName === _el.fieldName) {
              this.listColumnChange.push({
                fieldWide: item.width.toString(),
                fieldName: item.fieldName,
                id: _el.id,
                fieldOrder: index - 1,
                gridName: _el.gridName,
                hidden: _el.hidden,
                loginId: _el.loginId,
                fieldKey: item.fieldKey,
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
      return this.$refs.tableOPOrder.refresh()
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFormOptional = {
        ...this.getPayloadOutwardOrder,
        searchType: 'Paged',
      }
      this.handleExportExcel(sortFormOptional)
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFilter = this.getPayloadOutwardOrder
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        language: this.$i18n.locale,
        searchType: 'all',
      }
      this.handleExportExcel(sortFormOptional)
    },
    changeActiveToolBar(key) {
      if (key === 'add') {
        this.$router.push(
          this.localePath({ path: '/outward/outward-order/add' })
        )
      } else if (key === 'edit') {
        this.currentId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/outward/outward-order/detail?orderNo=${this.currentId}`,
          })
      } else if (key === 'set') {
        this.$refs.modalSetColumn.showModal = true
      } else if (key === 'refresh') {
        return location.reload()
      } else if (key === 'close') {
        this.$router.push(this.localePath({ path: '/' }))
      } else if (key === 'saveLayout') {
        this.handleSaveLayout()
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
        this.loading = true
        await api('updateColumn', this.listColumnChange)
        this.$refs.tableOPOrder.refresh()
        this.loading = false
      }
    },
    async handleExportExcel(sortFormOptional) {
      this.loading = true
      const response = await api('exportExcelOutwardOrder', sortFormOptional)
      this.loading = false
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
  },
}
</script>
