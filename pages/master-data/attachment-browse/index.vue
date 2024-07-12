<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableAttachment ref="tableItemMaster" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar'
import TableAttachment from '~/components/MasterData/AttachmentBrowse/TableAttachment.vue'
import { downloadFileExcel } from '@/utils/utils'

export default {
  components: { ToolBar, TableAttachment },
  data() {
    return {
      loading: false,
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
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      payloadAttachmentBrowse: 'filterSort/getPayloadAttachmentBrowse',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'export') {
          item.disabled = !this.activeButtonToolBar?.isAttachments
        }
        return item
      })
    },
  },
  methods: {
    changeActiveToolBar(key) {
      switch (key) {
        case 'refresh':
          return location.reload()
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          break
      }
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFormOptional = this.payloadAttachmentBrowse
      sortFormOptional.isExport = false
      sortFormOptional.lang = this.$i18n.locale
      this.handleExportExcel(sortFormOptional)
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const sortFormOptional = {
        ...this.payloadAttachmentBrowse,
        lang: this.$i18n.locale,
        isExport: true,
      }
      delete sortFormOptional.pageNo
      delete sortFormOptional.pageSize
      this.handleExportExcel(sortFormOptional)
    },
    async handleExportExcel(payload) {
      const response = await api('exportExcelAttachmentBrowse', payload)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
