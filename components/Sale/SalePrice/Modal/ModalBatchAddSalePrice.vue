<template>
  <div v-if="showModal" class="modal-container">
    <div class="modal-item-master" @click="closeModal"></div>
    <div class="modal-content">
      <div class="bg-cladia d-flex align-items-center justify-content-between">
        <div class="text-white pl-2 font-weight-bold"></div>
        <div class="text-white pr-2 cursor-pointer" @click="closeModal">x</div>
      </div>
      <BatchAddSalePrice @handleShow="handleShow"></BatchAddSalePrice>
    </div>
  </div>
</template>
<script>
import BatchAddSalePrice from '@/components/Sale/SalePrice/Add/BatchAddSalePrice'
export default {
  components: { BatchAddSalePrice },
  data() {
    return {
      showModal: false,
      listToolPrice: [
        {
          key: 'queryPrice',
          label: this.$t('btn_btnSearch_0'),
          icon: '/images/search.png',
        },
        {
          key: 'exportPrice',
          label: this.$t('btn_btnExport_0'),
          icon: '/images/export.png',
        },
      ],
    }
  },
  methods: {
    handleShow() {
      this.showModal = false
    },
    closeModal() {
      this.showModal = false
    },
    openModal() {
      this.showModal = true
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
  height: 480px;
  position: absolute;
  top: 40%;
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
