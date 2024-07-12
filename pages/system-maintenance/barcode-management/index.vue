<template>
  <div>
    <ToolBar
      :list-tools="listToolBars"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <div>
      <div class="barcode-info p-1">
        <div class="pl-3 whitespace-pre-line text-title">{{ $t('lbl_IPPrinter_0') }}</div>
        <div>
          <b-form-input
            v-model="printerInformation.ipAddress"
            type="text"
            class="item-input"
            :disabled="disabledBarcodeInput"
          />
        </div>
      </div>
      <div class="barcode-info p-1">
        <div class="pl-3 text-title">{{ $t('lbl_PortPrinter_0') }}</div>
        <div>
          <b-form-input
            v-model="printerInformation.port"
            type="text"
            class="item-input"
            :disabled="disabledBarcodeInput"
            oninput="this.value = this.value
              .replace(/[^0-9]/g, '')
            "
          />
        </div>
      </div>
    </div>
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar'
import BaseValidateMessage from '~/components/UI/BaseValidateMessage.vue'
import BaseLoading from '~/components/UI/Loading/BaseLoading.vue'
import { SERVER_RESPONSE_CODE } from '~/constants'

export default {
  name: 'BarcodeManagement',
  components: {
    ToolBar,
    BaseValidateMessage,
    BaseLoading,
  },
  middleware: ['authenticated'],
  data() {
    return {
      checkStatus: {},
      printerInformation: {
        ipAddress: '',
        port: '',
        barcodeEnable: false,
      },
      listErrorMessage: [],
      loading: false,
    }
  },
  fetch() {
    this.listErrorMessage = []
    this.getPrinterInformation()
  },
  computed: {
    disabledBarcodeInput() {
      return !this.printerInformation.barcodeEnable
    },
    listToolBars() {
      return [
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
          disabled: this.disabledBarcodeInput,
        },
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
  methods: {
    changeActiveToolBar(key) {
      switch (key) {
        case 'save':
          return this.handleSave()
        case 'refresh':
          return this.$fetch()
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          break
      }
    },
    async handleSave() {
      try {
        this.loading = true
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) return

        const payload = {
          ipAddress: this.printerInformation.ipAddress,
          port: this.printerInformation.port,
        }
        const required = {
          ipAddress: 'IPPrinter',
        }
        this.listErrorMessage = []

        if (!this.disabledBarcodeInput) {
          for (const outProp in payload) {
            for (const inProp in required) {
              if (outProp === inProp && !payload[outProp]) {
                this.listErrorMessage.push({
                  fieldName: this.$t(`lbl_${required[inProp]}_0`),
                  text: this.$t('msg_NoInput_0'),
                })
              }
            }
          }
        }
        if (this.listErrorMessage.length) return
        const res = await api('savePrinterSettings', payload)
        if (res.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.$fetch()
        }
      } catch(err) {
        console.log(err)
      } finally {
        this.loading = false
      }
    },
    async getPrinterInformation() {
      try {
        this.loading = true
        const res = await api('getPrinterSettings')
        if (res.status === SERVER_RESPONSE_CODE.OK) {
          this.printerInformation = res.data
        }
      } catch (err) {
        console.log(err)
      } finally {
        this.loading = false
      }
    },
  }
}
</script>
<style lang="scss" scoped>
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
