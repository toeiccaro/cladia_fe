<template>
  <div v-if="showModal">
    <div class="modal-container">
      <div class="modal-import-invoice" @click="showModal = false"></div>
      <div class="modal-content">
        <div
          class="bg-cladia d-flex align-items-center justify-content-between"
        >
          <div class="text-white pl-2 font-weight-bold">
            {{ $t('btn_btnImport_0') }}
          </div>
          <div
            class="text-white pr-2 cursor-pointer"
            @click="showModal = false"
          >
            x
          </div>
        </div>

        <ToolBar
          :list-tools="listToolBars"
          @changeActiveToolBar="handleAction"
        />
        <TableImportOutwardWarehousing
          ref="importOutwardWarehousing"
          :data-form="form"
          @handleDetailId="handleDetailId"
          @changeLayout="changeLayout"
        />
      </div>
    </div>
    <BaseSetColumn
      ref="modalSetColumn"
      full-width
      @on-close="$refs.importOutwardWarehousing.refresh()"
    />
    <BaseLoading v-if="loading" />
  </div>
</template>

<script>
import TableImportOutwardWarehousing from '@/components/Outward/Warehousing/Import/TableImportOutwardWarehousing.vue'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'

export default {
  name: 'ModalImportOutwardWarehousing',
  components: {
    ToolBar,
    BaseSetColumn,
    TableImportOutwardWarehousing,
    BaseLoading,
  },
  mixins: [],
  props: {
    form: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      showModal: false,
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
      selectedRow: {},
    }
  },
  computed: {
    listToolBars() {
      return [
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'okSaveDetail',
          label: this.$t('btn_btnOK_0'),
          icon: '/images/ok.png',
        },
        {
          key: 'closeImport',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ]
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
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },

    handleAction(key) {
      switch (key) {
        case 'okSaveDetail':
          return this.handleImportDetail()
        case 'closeImport':
          return this.handleClose()
        case 'refresh':
          return this.handleRefresh()
        case 'saveLayout':
          return this.handleSaveLayout()
        default:
          break
      }
    },

    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        await api('updateColumn', this.listColumnChange)
        this.$refs.importOutwardWarehousing?.refresh()
      }
    },

    async handleRefresh() {
      try {
        this.loading = true

        this.$refs.importOutwardWarehousing?.checkAll(false)
        this.$refs.importOutwardWarehousing.queryPayload = {
          pageNo: 1,
          pageSize: 30,
          localLanguage: this.$i18n.locale,
        }

        await this.$refs.importOutwardWarehousing?.refresh()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    handleClose() {
      this.showModal = false
    },
    handleDetailId(data) {
      this.selectedRow = data || {}
    },
    handleImportDetail() {
      const hasNoSelectedData =
        !this.selectedRow || !Object.keys(this.selectedRow).length

      if (hasNoSelectedData) {
        return alert(this.$t('msg_NoSelected_0'))
      }

      this.$emit('update-import-details', this.selectedRow)
      this.showModal = false
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
}
.modal-import-invoice {
  position: absolute;
  top: 0;
  background: rgb(204, 204, 204);
  opacity: 0.6;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.modal-content {
  background-color: white;
  z-index: 11;
  width: 80%;
  height: 80%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgb(42, 78, 161);
  padding: 1px;
}

.modal-content__main {
  font-size: 12px;
  overflow-y: auto;
}
</style>
