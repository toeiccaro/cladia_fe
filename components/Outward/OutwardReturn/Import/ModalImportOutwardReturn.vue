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

        <BaseValidateMessage
          :is-error="true"
          :list-error-message="listErrorMessage"
        />

        <TableImportOutwardReturn
          ref="importOutwardReturn"
          :use-checkbox="true"
          @handleDetailId="handleDetailId"
          @changeLayout="changeLayout"
        />
      </div>
    </div>
    <BaseSetColumn
      ref="modalSetColumn"
      :label-mapping="setColumnLabelMapping"
      :api-name="'getInvoicesImportList'"
      :body="payloadApi"
      full-width
      @on-close="$refs.importOutwardReturn.refresh()"
    />
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
import TableImportOutwardReturn from './TableImportOutwardReturn.vue'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'
export default {
  name: 'BaseModalImport',
  components: {
    ToolBar,
    BaseSetColumn,
    BaseValidateMessage,
    TableImportOutwardReturn,
  },
  props: {
    invoiceData: {
      type: Object,
      default: () => {},
    },
    listErrorMessage: {
      type: Array,
      default: () => [],
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
    }
  },
  computed: {
    setColumnLabelMapping() {
      return {
        SOQTY: this.$t('lbl_SOQty_0'),
      }
    },
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
      const { sono: id, lineId } = data
      this.currentId = id
      this.lineId = lineId
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    handleAction(key) {
      if (key === 'refresh') {
        this.handleRefreshModal()
      }
      if (key === 'okSaveDetail') {
        return this.handleImportData()
      }
      if (key === 'saveLayout') {
        this.handleSaveLayout()
      }
      if (key === 'closeImport') {
        return this.handleClose()
      }
      if (key === 'set') {
        return (this.$refs.modalSetColumn.showModal = true)
      }
    },
    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        await api('updateColumn', this.listColumnChange)
        this.$refs.importBoard?.refresh()
      }
    },
    async handleRefreshModal() {
      this.$refs.importOutwardReturn?.checkAll(false)
      this.$refs.importOutwardReturn.SET_PAYLOAD_OUTWARD_RETURN_IMPORT({
        pageNo: 1,
        pageSize: 30,
        localLanguage: this.$i18n.locale,
        supplierID:
          this.$refs.importOutwardReturn.payloadOutwardReturnImport.supplierID,
      })
      return await this.$refs.importOutwardReturn?.refresh()
    },
    handleImportData() {
      const availableItems = this.$refs.importOutwardReturn?.listCheckbox || []
      const selectedItems = availableItems.filter((item) => item.value)

      const isSelectedDetails = selectedItems.length > 0
      if (!isSelectedDetails) {
        return window.alert(this.$t('msg_NoSelected_0'))
      }

      const finalSelectedCustomers = selectedItems.map((item) => {
        return Object.assign(item, {
          quantity: item.quantity,
        })
      })
      this.showModal = false
      return this.$emit('update-modal-import-outward', finalSelectedCustomers)
    },
    handleClose() {
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
