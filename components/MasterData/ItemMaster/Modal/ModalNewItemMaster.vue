<template>
  <div v-if="showModal" class="modal-container" @keydown.esc="closeModal">
    <div class="modal-item-master" @click="closeModal"></div>
    <div class="modal-content">
      <div class="bg-cladia d-flex align-items-center justify-content-between">
        <div class="text-white pl-2 font-weight-bold">
          {{ $t('lbl_BaseData_ItemMaster_0') }}
        </div>
        <div class="text-white pr-2 cursor-pointer" @click="closeModal">x</div>
      </div>
      <ModalWidgetAddItemMaster
        active-tool-bar="`addItemMaster`"
        @close-modal="closeModal"
      ></ModalWidgetAddItemMaster>
    </div>
  </div>
</template>
<script>
import ModalWidgetAddItemMaster from '@/components/MasterData/ItemMaster/Modal/ModalWidgetAddItemMaster'
export default {
  components: { ModalWidgetAddItemMaster },
  data() {
    return {
      showModal: false,
    }
  },
  watch: {
    showModal: {
      handler(value) {
        if (!value) {
          this.replaceUrl()
        }
      },
    },
  },
  created() {
    this.$bus.$on(
      'close-quotation-add-item-master-dialog',
      () => (this.showModal = false)
    )

    this.replaceUrl()
  },
  methods: {
    closeModal() {
      this.showModal = false
    },
    openModal() {
      this.showModal = true
    },
    replaceUrl() {
      const query = Object.assign({}, this.$route.query)
      const hasQueryParams = query.itemCode || query.itemId

      if (query.itemCode) {
        delete query.itemCode
      }

      if (query.itemId) {
        delete query.itemId
      }

      if (hasQueryParams) {
        this.$router.replace({ query })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep {
  .add-item-page {
    padding: 0;
  }
}
.container-modal {
  width: 900px;
  .modal-header {
    background: rgb(42, 78, 161);
    height: 24px;
    color: #fff;
  }
  .modal-body {
    background: #fff;
    border: 1px solid #5180d8;
  }
}

.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10;
}
.modal-item-master {
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
</style>
