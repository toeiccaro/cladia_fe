<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <FormSearch @search="queryBOMList" />
    <TableBOM
      :data-table-query="dataTable"
      :data-header-query="dataHeader"
      :is-go-detail="isGoDetail"
      :is-edit="isEdit"
      :expand-parent-list="expandParentList"
      @detail="handleDetailId"
      @rowActive="handleRowActive"
      @setExpandParentList="setExpandParentList"
    ></TableBOM>
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
import bomMixin from '@/mixins/bom'
import { downloadFileExcel } from '@/utils/utils'
import { SERVER_RESPONSE_CODE } from '@/constants'
import FormSearch from '~/components/BOM/BOM/FormSearch.vue'
import TableBOM from '~/components/BOM/BOM/TableBOM.vue'

export default {
  components: {
    ToolBar,
    TableBOM,
    FormSearch,
  },
  mixins: [bomMixin],
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
      loading: false,
      currentId: '',
      currentRow: {},
      isGoDetail: true,
      expandParentList: [],
    }
  },

  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getPayloadBom: 'filterSort/getPayloadBom',
    }),

    isEdit() {
      return this.activeButtonToolBar?.isEdit
    },
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

  created() {
    this.handleQueryBOM()
  },

  methods: {
    ...mapMutations('filterSort', ['UPDATE_PAYLOAD_BOM', 'SET_PAYLOAD_BOM']),

    handleRowActive(data) {
      this.currentRow = data
    },

    handleDetailId(data) {
      this.currentId = data
    },

    changeActiveToolBar(key) {
      switch (key) {
        case 'add':
          return this.$router.push(
            this.localePath({ path: `/master-data/b-bom/add` })
          )
        case 'edit':
          return this.handleClickEdit()
        case 'query':
          this.queryBOMList()
          return
        case 'refresh':
          this.refreshBOMList()
          return
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        case 'export':
          return this.exportAll()
        default:
          return null
      }
    },
    handleClickEdit() {
      const invalidData =
        !Object.keys(this.currentRow)?.length ||
        !this.currentRow?.itemID ||
        this.currentRow?.childLeaf

      if (invalidData) {
        return
      }

      this.$router.push(
        this.localePath({
          path: `/master-data/b-bom/detail?itemID=${this.currentRow.itemID}`,
        })
      )
    },
    async handleQueryBOM() {
      try {
        this.loading = true
        this.UPDATE_PAYLOAD_BOM({
          path: 'language',
          data: this.$i18n.locale,
        })

        const payload = {}
        for (const key in this.getPayloadBom) {
          if (this.getPayloadBom[key]) {
            payload[key] = this.getPayloadBom[key]
          }
        }

        const response = await api('getBOM', payload)
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

    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }
      const searchParamsOption = this.getPayloadBom
      this.handleExportExcel(searchParamsOption)
    },

    async handleExportExcel(payload) {
      const response = await api('exportExcelBOM', payload)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },

    clearExpandParentList() {
      this.expandParentList = []
    },

    setExpandParentList(itemId) {
      this.expandParentList.push(itemId)
    },

    queryBOMList() {
      this.clearExpandParentList()
      this.handleQueryBOM()
    },

    refreshBOMList() {
      this.clearExpandParentList()
      this.SET_PAYLOAD_BOM({
        language: this.$i18n.locale,
      })
      this.handleQueryBOM()
    },
  },
}
</script>
