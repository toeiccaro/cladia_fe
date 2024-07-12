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
        <TableImportMaterialDelivery
          ref="importProductionMaterialDelivery"
          :use-checkbox="true"
          :data-form="form"
          @handleDetailId="handleDetailId"
          @changeLayout="changeLayout"
        />
      </div>
    </div>
    <BaseSetColumn
      ref="modalSetColumn"
      full-width
      @on-close="$refs.importProductionMaterialDelivery.refresh()"
    ></BaseSetColumn>
  </div>
  <div
    v-else-if="loading"
    class="spinner content d-flex justify-content-center align-items-center"
  >
    <b-spinner
      b-spinner
      style="width: 3rem; height: 3rem"
      label="Loading..."
    ></b-spinner>
  </div>
</template>

<script>
import TableImportMaterialDelivery from './TableImportMaterialDelivery.vue'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'
export default {
  name: 'ModalImportProductionMaterialDelivery',
  components: {
    ToolBar,
    BaseSetColumn,
    TableImportMaterialDelivery,
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
      currentId: '',
      lineId: null,
      loading: false,
      showModal: false,
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
      payloadApi: {
        data: {
          pageNo: 1,
          pageSize: 30,
        },
      },
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
          key: 'setTableColumn',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'okSaveDetail',
          label: this.$t('btn_btnOK_0'),
          icon: '/images/ok.png',
        },
        {
          key: 'saveLayout',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
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
            if (
              item.fieldName === _el.fieldName &&
              item.fieldKey === _el.fieldKey
            ) {
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
    handleDetailId(data) {
      this.selectedRow = data?.item || {}
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        await api('updateColumn', this.listColumnChange)
        this.$refs.importProductionMaterialDelivery?.refresh()
      }
    },
    async handleAction(key) {
      if (key === 'refresh') {
        this.$refs.importProductionMaterialDelivery?.checkAll(false)
        this.$refs.importProductionMaterialDelivery.queryPayload = {
          pageNo: 1,
          pageSize: 30,
          localLanguage: this.$i18n.locale,
        }
        return await this.$refs.importProductionMaterialDelivery?.refresh()
      }
      if (key === 'saveLayout') {
        this.handleSaveLayout()
      }
      if (key === 'setTableColumn') {
        return (this.$refs.modalSetColumn.showModal = true)
      }
      if (key === 'okSaveDetail') {
        return this.handleImportData()
      }
      if (key === 'closeImport') {
        return (this.showModal = false)
      }
    },

    handleImportData() {
      const hasNoSelectedData =
        !this.selectedRow || !Object.keys(this.selectedRow).length

      if (hasNoSelectedData) {
        return alert(this.$t('msg_NoSelected_0'))
      }

      this.$emit('update-details', this.selectedRow)
      this.showModal = false
      this.selectedRow = {}
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
