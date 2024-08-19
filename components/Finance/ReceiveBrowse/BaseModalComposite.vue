<template>
  <div v-if="showModal">
    <div class="modal-container">
      <div class="modal-import-invoice" @click="showModal = false"></div>
      <div class="modal-content">
        <div
          class="bg-cladia d-flex align-items-center justify-content-between"
        >
          <div class="text-white pl-2 font-weight-bold">
            {{ $t('btn_btnSRBatch_0') }}
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

        <ReceiveBrowseCompositeForm
          ref="compositeBoard"
          :selected-items="selectedItems"
          @validation-errors="(data) => (listErrorMessage = data)"
        />
      </div>
    </div>
    <BaseTableLoader v-if="loading" />
  </div>
</template>

<script>
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ReceiveBrowseCompositeForm from '@/components/Finance/ReceiveBrowse/ReceiveBrowseCompositeForm'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
export default {
  name: 'BaseModalComposite',
  components: {
    ToolBar,
    ReceiveBrowseCompositeForm,
    BaseTableLoader,
    BaseValidateMessage,
  },
  props: {
    selectedItems: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      loading: false,
      showModal: false,
      listErrorMessage: [],
    }
  },
  computed: {
    listToolBars() {
      return [
        {
          key: 'ok',
          label: this.$t('btn_btnOK_0'),
          icon: '/images/save.png',
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
    async handleAction(key) {
      if (key === 'ok') {
        try {
          const res = await this.$refs.compositeBoard?.save()

          const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
          if (validResponse) {
            window.alert(this.$t('msg_Completed_0'))
            this.showModal = false
          }

          this.$emit('refresh-data-table')
        } catch (err) {
          console.error(err)
        } finally {
          this.loading = false
        }

        return
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
  width: 506px;
  height: 286px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgb(42, 78, 161);
  padding: 1px;
  .tool-bar {
    margin-bottom: 0;
  }
  .error-list {
    margin-bottom: 10px;
  }
}

.modal-content__main {
  font-size: 12px;
  overflow-y: auto;
}
</style>
