<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <SearchForm :search-form="form.searchForm"></SearchForm>
    <CheckFormPanel :check-form="form.checkForm"></CheckFormPanel>
    <TableQuery
      :data-table-query="dataTable"
      :data-header-query="dataHeader"
      :total-elements="totalElements"
      :checked-list="checkedList"
      @filterAndSort="filterAndSort"
    ></TableQuery>
    <BaseTableLoader v-if="loading" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import SearchForm from '@/components/Inventory/Query/SearchForm.vue'
import CheckFormPanel from '@/components/Inventory/Query/CheckFormPanel.vue'
import inventoryQueryMixin from '@/mixins/inventory-query'
import { downloadFileExcel } from '@/utils/utils'
import { SERVER_RESPONSE_CODE } from '@/constants'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
import TableQuery from '~/components/Inventory/Query/TableQuery.vue'

export default {
  components: {
    BaseTableLoader,
    ToolBar,
    CheckFormPanel,
    TableQuery,
    SearchForm,
  },
  mixins: [inventoryQueryMixin],
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'queryInventory',
          label: this.$t('btn_btnSearch_0'),
          icon: '/images/search.png',
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
      form: {
        checkForm: {
          itemCodeCheck: true,
          warehouseCheck: true,
        },
        searchForm: {
          language: this.$i18n.locale,
          itemCode: '',
          itemName: ''
        },
      },
      dataTable: [],
      checkedList: [],
      totalElements: null,
      loading: false,
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      payloadInventoryQuery: 'filterSort/getPayloadInventoryQuery',
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
    this.handleQuery()
  },
  methods: {
    filterAndSort() {
      this.handleQuery()
    },
    changeActiveToolBar(key) {
      if (key === 'queryInventory') {
        return this.handleQuery()
      }

      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    async handleQuery() {
      try {
        this.loading = true
        this.mapSearchFormData()
        const payload = this.form
        const response = await api('querySearchInventory', payload)
        if (response && response.status === 200) {
          this.dataTable = response.data?.data?.tableContent?.content
          this.checkedList = response.data?.checkList || []
          this.totalElements = response.data?.data?.tableContent?.totalElements
        } else {
          window.alert(this.$t(response?.message))
        }
      } catch (error) {
        window.alert(error?.data?.response?.data?.message)
      } finally {
        this.loading = false
      }
    },
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }

      this.mapSearchFormData()
      this.form.searchForm.isExportAll = false
      this.handleExportExcel(this.form)
    },
    mapSearchFormData() {
      this.form.searchForm = {
        ...this.form.searchForm,
        ...this.payloadInventoryQuery,
      }
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (!confirm) {
        return
      }

      this.mapSearchFormData()
      this.form.searchForm.isExportAll = true
      this.handleExportExcel(this.form)
    },
    async handleExportExcel(payload) {
      const response = await api('exportInventoryQuery', payload)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
  },
}
</script>
