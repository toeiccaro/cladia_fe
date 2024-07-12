<template>
  <div v-if="showModal">
    <div class="modal-container">
      <div class="modal-import-invoice" @click="showModal = false"></div>
      <div class="modal-content">
        <div
          class="bg-cladia d-flex align-items-center justify-content-between"
        >
          <div class="text-white pl-2 font-weight-bold">
            {{ $t('btn_btnShowDetails_0') }}
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

        <TableReceiveBrowseDetail
          ref="detailBoard"
          :use-checkbox="true"
          :order-no="orderNo"
          @handleDetailId="handleDetailId"
          @changeLayout="changeLayout"
        />
      </div>
    </div>
    <BaseTableLoader v-if="loading" />
  </div>
</template>

<script>
import TableReceiveBrowseDetail from '@/components/ReceiveBrowse/TableReceiveBrowseDetail'
import ToolBar from '@/components/UI/ToolBar.vue'
export default {
  name: 'BaseModalDetails',
  components: {
    ToolBar,
    TableReceiveBrowseDetail,
  },
  props: {
    orderNo: {
      type: String,
      default: () => '',
    },
  },
  data() {
    return {
      saleViewsChecked: [],
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
          key: 'close',
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
    async handleAction(key) {
      if (key === 'refresh') {
        return await this.$refs.detailBoard?.refresh()
      }

      if (key === 'close') {
        return (this.showModal = false)
      }
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
  width: 806px;
  height: 506px;
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
