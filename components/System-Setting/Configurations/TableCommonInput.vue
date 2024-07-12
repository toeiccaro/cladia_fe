<template>
  <div>
    <div>
      <div class="common-input p-1">
        <div class="text-title">{{ $t('lbl_ManageBarcode_0') }}</div>
        <div class="input__group d-flex">
          <div class="d-flex flex-column justify-center">
            <input
              v-model="barcodeInfo.BarCodeSystem"
              type="checkbox"
              @change="
                (event) =>
                  emitChangedBarcodeSettings(
                    'BarCodeSystem',
                    event.target.checked
                  )
              "
            />
          </div>
          <label>{{ $t('lbl_BarcodeSystem_0') }}</label>
        </div>
      </div>
    </div>
    <div class="common-input p-1">
      <div class="text-title">{{ $t('lbl_OrderConfiguration_0') }}</div>
      <div>
        <div class="input__group d-flex">
          <div class="d-flex flex-column justify-center">
            <input
              v-model="checkStatus.SOInvoiceCanUnCheck"
              type="checkbox"
              @change="
                (event) => emitChangedStatus('SOInvoiceCanUnCheck', event)
              "
            />
          </div>
          <label>{{ $t('lbl_SOInvoiceCanUnCheck_0') }}</label>
        </div>
        <div class="input__group d-flex">
          <div class="d-flex flex-column justify-center">
            <input
              v-model="checkStatus.WOReceiptCanUnCheck"
              type="checkbox"
              @change="
                (event) =>
                  emitChangedStatus('WOReceiptCanUnCheck', event.target.checked)
              "
            />
          </div>
          <label>{{ $t('lbl_WOReceiptCanUnCheck_0') }}</label>
        </div>
        <div class="input__group d-flex">
          <div class="d-flex flex-column justify-center">
            <input
              v-model="checkStatus.WPOReceiptCanUnCheck"
              type="checkbox"
              @change="
                (event) =>
                  emitChangedStatus(
                    'WPOReceiptCanUnCheck',
                    event.target.checked
                  )
              "
            />
          </div>
          <label>{{ $t('lbl_WPOReceiptCanUnCheck_0') }}</label>
        </div>
        <div class="input__group d-flex">
          <div class="d-flex flex-column justify-center">
            <input
              v-model="checkStatus.POReceiptCanUnCheck"
              type="checkbox"
              @change="
                (event) =>
                  emitChangedStatus('POReceiptCanUnCheck', event.target.checked)
              "
            />
          </div>
          <label>{{ $t('lbl_POReceiptCanUnCheck_0') }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableCommonInput',
  props: {
    data: {
      type: Object,
      required: true,
    },
    barcodeSettings: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      checkStatus: {},
      barcodeInfo: {},
    }
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler(value) {
        this.checkStatus = JSON.parse(JSON.stringify(value))
      },
    },
    barcodeSettings: {
      deep: true,
      immediate: true,
      handler(value) {
        this.barcodeInfo = JSON.parse(JSON.stringify(value))
      },
    },
  },
  methods: {
    emitChangedStatus(keyCode, keyValue) {
      this.$emit('changed-status', { keyCode, keyValue })
    },
    emitChangedBarcodeSettings(keyCode, keyValue) {
      this.$emit('changed-barcode', { keyCode, keyValue })
    },
  },
}
</script>

<style scoped lang="scss">
.common-input,
.barcode-info {
  gap: 32px;
  display: grid !important;
  grid-template-columns: 15% 85%;
}
.input__group {
  gap: 3px;
}
.text-title {
  font-size: 12px;
  font-weight: 700;
}
.barcode-info {
  padding-left: 12px;
}
.item-input {
  width: 400px;
  height: 20px;
  border: 1px solid #000;
  color: #212529;
  &:disabled {
    cursor: not-allowed;
  }
}
</style>
