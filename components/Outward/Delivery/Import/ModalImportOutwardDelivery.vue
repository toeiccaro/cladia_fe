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
        <TableImportOutwardDelivery
          ref="importOutwardDelivery"
          :use-checkbox="true"
          @handleDetailId="handleDetailId"
          @changeLayout="changeLayout"
        />
      </div>
    </div>
    <BaseSetColumn
      ref="modalSetColumn"
      :label-mapping="setColumnLabelMapping"
      full-width
      @on-close="$refs.importOutwardDelivery.refresh()"
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
import TableImportOutwardDelivery from '@/components/Outward/Delivery/Import/TableImportOutwardDelivery.vue'
// import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'
export default {
  name: 'ModalImportOutwardDelivery',
  components: {
    ToolBar,
    BaseSetColumn,
    TableImportOutwardDelivery,
  },
  mixins: [],
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
        case 'refresh':
          return this.handleRefresh()
        case 'okSaveDetail':
          return this.handleImportDetail()
        case 'closeImport':
          return this.handleClose()
        default:
          break
      }
    },
    async handleRefresh() {
      try {
        this.loading = true
        this.$refs.importOutwardDelivery.SET_PAYLOAD_OUTWARD_DELIVERY_IMPORT({
          pageNo: 1,
          pageSize: 30,
          language: this.$i18n.locale,
          supplierID:
            this.$refs.importOutwardDelivery.payloadOutwardDeliveryImport
              .supplierID,
        })
        await this.$refs.importOutwardDelivery.refresh()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleDetailId(data) {
      this.selectedRow = data?.item || {}
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
