<template>
  <div>
    <tool-bar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></tool-bar>

    <form-search @search="queryBOMReserveList"></form-search>

    <table-BOM
      :data-table-query="dataTable"
      :data-header-query="dataHeader"
      :is-go-detail="isGoDetail"
      :expand-parent-list="expandParentList"
      @rowActive="handleRowActive"
      @setExpandParentList="setExpandParentList"
    ></table-BOM>

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
import { mapGetters, mapMutations } from 'vuex'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import FormSearch from '~/components/BOM/BOM/FormSearch.vue'
import TableBOM from '~/components/BOM/BOM/TableBOM.vue'
import bomMixin from '@/mixins/bom'
import { downloadFileExcel } from '@/utils/utils'

export default {
  name: 'BomReverse',

  components: {
    ToolBar,
    FormSearch,
    TableBOM,
  },

  mixins: [bomMixin],

  data() {
    return {
      listToolBars: [
        {
          key: 'query',
          label: this.$t('btn_btnSearch_0'),
          icon: '/images/search.png',
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
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      dataTable: [],
      currentRow: {},
      loading: false,
      isGoDetail: false,
      expandParentList: [],
    }
  },

  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getPayloadBom: 'filterSort/getPayloadBom',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'export') {
          item.disabled = !this.activeButtonToolBar?.isExport
        }
        return item
      })
    },
  },

  created() {
    this.getBOMReverse()
  },

  methods: {
    ...mapMutations('filterSort', ['UPDATE_PAYLOAD_BOM', 'SET_PAYLOAD_BOM']),

    async getBOMReverse() {
      try {
        this.loading = true
        this.UPDATE_PAYLOAD_BOM({
          path: 'lang',
          data: this.$i18n.locale,
        })
        const payload = {}
        for (const key in this.getPayloadBom) {
          if (this.getPayloadBom[key]) {
            payload[key] = this.getPayloadBom[key]
          }
        }

        const response = await api('getBOMReverse', payload)

        if (response && response.status === 200) {
          this.dataTable = response.data?.content
        } else {
          window.alert(this.$t(response?.message))
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    changeActiveToolBar(key) {
      switch (key) {
        case 'query':
          this.queryBOMReserveList()
          return
        case 'refresh':
          this.refreshBOMReserveList()
          return
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        case 'export':
          return this.exportAllData()
        default:
          return null
      }
    },

    handleRowActive(data) {
      this.currentRow = data
    },

    clearExpandParentList() {
      this.expandParentList = []
    },

    setExpandParentList(itemId) {
      this.expandParentList.push(itemId)
    },

    queryBOMReserveList() {
      this.clearExpandParentList()
      this.getBOMReverse()
    },

    refreshBOMReserveList() {
      this.clearExpandParentList()
      this.SET_PAYLOAD_BOM({
        lang: this.$i18n.locale,
      })
      this.getBOMReverse()
    },

    exportDisplayedData() {},

    exportAllData() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      this.handleExportExcel()
    },

    async handleExportExcel() {
      const response = await api('exportExcelBOMReverse', this.getPayloadBom)
      if (response?.status === 200 && response?.data) {
        downloadFileExcel(response.data)
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
