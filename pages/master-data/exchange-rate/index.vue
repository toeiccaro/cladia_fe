<template>
  <div>
    <tool-bar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></tool-bar>

    <table-exchange-rate
      ref="tableExchangeRate"
      @detail="handleRedirectToPageDetail"
      @changeLayout="changeLayout"
    ></table-exchange-rate>
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
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import TableExchangeRate from '~/components/MasterData/ExchangeRate/TableExchangeRate.vue'
import dateTimeMixins from '@/mixins/dateTime'
import BaseSetColumn from '~/components/UI/BaseSetColumn'

export default {
  components: {
    ToolBar,
    TableExchangeRate,
    BaseSetColumn,
  },

  mixins: [dateTimeMixins],

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
          key: 'set',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
      loading: false,
      rateID: null,
    }
  },
  computed: {
    ...mapGetters({
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
        if (this.dataLayout) {
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
        }
      },
    },
  },

  methods: {
    changeActiveToolBar(key) {
      switch (key) {
        case 'set':
          return (this.$refs.modalSetColumn.showModal = true)
        case 'add':
          return this.$router.push(
            this.localePath({ path: `/master-data/exchange-rate/add` })
          )
        case 'edit':
          return this.handleClickEdit()
        case 'refresh':
          return location.reload()
        case 'save':
          return this.handleSaveLayout()
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          return null
      }
    },
    functionReload() {
      location.reload()
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        await api('updateColumn', this.listColumnChange)
        this.$refs.tableExchangeRate.refresh()
      }
    },
    handleRedirectToPageDetail(id) {
      this.rateID = id
    },
    handleClickEdit() {
      this.rateID &&
        this.$router.push({
          path: `/${this.$i18n.locale}/master-data/exchange-rate/detail?rateID=${this.rateID}`,
        })
    },
  },
}
</script>

<style lang="scss" scoped></style>
