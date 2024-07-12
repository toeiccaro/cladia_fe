<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableBox ref="tableBox" @detail="handleRedirectToPageDetail"></TableBox>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import TableBox from '@/components/MasterData/Box/TableBox.vue'
import { downloadFileExcel } from '@/utils/utils'
export default {
  components: {
    ToolBar,
    TableBox,
  },
  middleware: ['authenticated'],

  data() {
    return {
      activeToolBar: '',
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
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      dataDetailItemMaster: {},
      itemId: '',
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getPayloadBox: 'filterSort/getPayloadBox',
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
  methods: {
    functionReload() {
      location.reload()
    },
    changeActiveToolBar(key) {
      if (key === 'add') {
        this.$router.push(this.localePath({ path: '/master-data/box/add' }))
      } else if (key === 'export') {
        this.activeToolBar = key
      } else if (key === 'edit') {
        this.itemId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/master-data/box/detail?systemID=${this.itemId}`,
          })
      } else if (key === 'refresh') {
        location.reload()
      } else if (key === 'close') {
        this.$router.push(this.localePath({ path: '/' }))
      }
    },
    exportByPage() {
      const sortFormOptional = this.getPayloadBox
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
      const sortFilter = JSON.parse(JSON.stringify(this.getPayloadBox))
      delete sortFilter.pageNo
      delete sortFilter.pageSize
      const sortFormOptional = {
        ...sortFilter,
        isExportAll: true,
      }
      this.handleExportExcel(sortFormOptional)
    },
    async handleExportExcel(payload) {
      const response = await api('exportExcelBox', payload)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    handleRedirectToPageDetail(itemId) {
      this.itemId = itemId
    },
  },
}
</script>
<style lang="scss" scoped>
.item-master-container {
  width: 100%;
}
</style>
