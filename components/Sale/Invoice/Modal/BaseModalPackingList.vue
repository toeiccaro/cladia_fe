<template>
  <div v-if="showModal" class="modal-container">
    <div class="modal-pep" @click="closeModalPackingList"></div>
    <div class="modal-content">
      <div class="bg-cladia d-flex align-items-center justify-content-between">
        <div class="text-white pl-2 font-weight-bold">
          {{ $t('btn_btnPackList_0') }}
        </div>
        <div
          class="text-white pr-2 cursor-pointer"
          @click="closeModalPackingList"
        >
          x
        </div>
      </div>

      <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />

      <InformationRow :invoice-data="invoiceData" />

      <InvoicePackingListTable
        ref="invoicePackingListTable"
        :invoice-form="invoiceData"
      />

      <BaseTableLoader v-if="loading" />
    </div>
  </div>
</template>

<script>
import { SERVER_RESPONSE_CODE } from '@/constants'
import { downloadFileExcel } from '@/utils/utils'
import api from '@/api/api'
import InvoicePackingListTable from '@/components/Sale/Invoice/Modal/InvoicePackingListTable'
import InformationRow from '@/components/Sale/Invoice/InformationRow'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  name: 'BaseModalPackingList',
  components: {
    ToolBar,
    InvoicePackingListTable,
    InformationRow,
    BaseTableLoader,
  },
  props: {
    invoiceData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      saleViewsChecked: [],
      currentId: '',
      lineId: null,
      loading: false,
      showModal: false,
      payloadApi: {
        data: {
          pageNo: 1,
          pageSize: 30,
        },
      },
    }
  },

  computed: {
    listToolBars() {
      return [
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
        },
        {
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ]
    },
  },
  methods: {
    handleAction(key) {
      if (key === 'print') {
        return this.printInvoicePackingList()
      }
      if (key === 'close') {
        return this.closeModalPackingList()
      }
      if (key === 'delete') {
        const selectedItems =
          this.$refs.invoicePackingListTable.listCheckbox || []

        const hasNoSelectedItems = selectedItems.every((item) => !item.value)

        if (hasNoSelectedItems) {
          return window.alert(this.$t('msg_NoSelected_0'))
        }

        const confirm = window.confirm(this.$t('msg_ConfirmDelDetail_0'))
        if (confirm) {
          return window.alert(this.$t('msg_IsDeleted_0'))
        }
      }
    },

    async printInvoicePackingList() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmPrint_0'))
        if (!confirm) {
          return
        }

        this.loading = true

        const payload = {
          invoiceNo: this.invoiceData.invoiceNo,
          lang: this.$i18n.locale,
        }

        const response = await api('printInvoicePackingList', payload)
        const validResponse =
          response?.status === SERVER_RESPONSE_CODE.OK && response?.data

        if (validResponse) {
          downloadFileExcel(response.data, 'xls')
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    closeModalPackingList() {
      this.showModal = false
      this.$emit('closeModalPackingList')
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
.modal-pep {
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
  padding: 0 1px 1px 1px;
  overflow-y: auto;
}

.bg-cladia {
  position: sticky;
  top: 0%;
  left: 0%;
  z-index: 13;
  border-top: 1px solid #ffffff;
}

.modal-content__main {
  font-size: 12px;
}

.bg-header-attachment {
  background-color: #ebeff6;
}

.table-attachment__header {
  background-color: #bcdbf3;
  font-weight: bold;
}

.table-attachment__item {
  padding: 4px 3px 4px 3px;
}

.col-1-5 {
  flex: 1 1 calc(100% / 8);
  max-width: calc(100% / 8);
}

.col-0-5 {
  flex: 1 1 calc(100% / 24);
  max-width: calc(100% / 24);
}

.text-blue {
  color: blue;
  text-decoration: underline;
}

.table-attachment__row:nth-child(even) {
  background-color: #eff3fb;
}
</style>
