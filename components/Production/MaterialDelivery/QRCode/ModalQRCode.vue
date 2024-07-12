<template>
  <div v-if="showModal">
    <div class="modal-container">
      <div class="modal-qr-code" @click="showModal = false"></div>
      <div class="modal-content">
        <div class="d-flex align-items-center justify-content-center h-full">
          <QRCode :value="orderNumber" :options="{ width: 250 }"></QRCode>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalQRCodeMaterialDelivery',
  props: {
    orderNumber: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      showModal: false,
    }
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
.modal-qr-code {
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
  width: 500px;
  height: 400px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgb(42, 78, 161);
  padding: 1px;
}
</style>
