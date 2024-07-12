<template>
  <div>
    <ToolBar
      :list-tools="listToolBars"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>

    <div v-if="!loading">
      <TableCommonInput
        :data="formattedCheckStatus"
        :barcode-settings="formattedBarcodeSettings"
        @changed-status="setCheckStatus"
        @changed-barcode="setBarcodeSettings"
      />
      <div class="spacer"></div>
      <TableDigit
        :data-header="tableDigitColumns"
        :data-table="digitDataTable"
        @dataDigitChanged="dataDigitChanged"
        @saveData="handleSave"
      ></TableDigit>
      <div class="spacer"></div>
      <TableBillEntities
        :data-header="tableBillColumns"
        :data-table="billDataTable"
        @dataBillChanged="dataBillChanged"
        @saveData="handleSave"
      ></TableBillEntities>
    </div>
    <div class="spacer"></div>
    <InputCalendar />
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import api from '@/api/api'
import systemConfigurationMixins from '@/mixins/systemConfiguration'
import ToolBar from '@/components/UI/ToolBar'
import TableDigit from '@/components/System-Setting/Configurations/TableDigit'
import TableBillEntities from '@/components/System-Setting/Configurations/TableBillEntities'
import TableCommonInput from '@/components/System-Setting/Configurations/TableCommonInput'
import BaseLoading from '~/components/UI/Loading/BaseLoading.vue'
import {
  SERVER_RESPONSE_CODE,
  BARCODE_SYS_STATUS,
  CONFIGURATIONS_KEYCODE,
} from '~/constants'
import InputCalendar from '~/components/System-Setting/Configurations/InputCalendar.vue'

export default {
  components: {
    ToolBar,
    TableDigit,
    TableBillEntities,
    TableCommonInput,
    BaseLoading,
    InputCalendar,
  },
  mixins: [systemConfigurationMixins],
  data() {
    return {
      loading: false,
      billDataTable: [],
      digitDataTable: [],
      checkStatuses: [],
      changedBillDataTable: [],
      changedDigitDataTable: [],
      lang: this.$i18n.locale,
      barcodeSettings: [],
    }
  },

  async fetch() {
    try {
      this.loading = true

      const payload = {
        language: this.lang,
      }
      const response = await api('getAllConfigs', payload)

      const validResponse =
        response && response.status === SERVER_RESPONSE_CODE.OK

      if (validResponse) {
        this.digitDataTable = response.data?.sdigitSetEntities || []
        this.billDataTable = response.data?.sbillSetEntities || []
        this.checkStatuses = response.data?.ssystemSetEntities || []
        this.barcodeSettings =
          response.data?.sbarcodeSetEntities.map((item) => {
            if (item.keyCode === CONFIGURATIONS_KEYCODE.BARCODE_SYSTEM) {
              return { ...item, keyValue: !!Number(item.keyValue) }
            }
            return item
          }) || []
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
    }),
    formattedCheckStatus() {
      const checkStatus = {}
      for (const item of this.checkStatuses) {
        checkStatus[item.keyCode] = item.keyValue
      }
      return checkStatus
    },
    formattedBarcodeSettings() {
      const barcodeSettings = {}
      for (const item of this.barcodeSettings) {
        barcodeSettings[item.keyCode] = item.keyValue
        if (item.keyCode === 'BarCodeSystem') {
          barcodeSettings[item.keyCode] = !!Number(item.keyValue)
        }
      }
      return barcodeSettings
    },

    listToolBars() {
      return [
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
          disabled: !this.activeButtonToolBar.isEdit,
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
        if (!confirm) {
          return
        }

        const [isSavedBill, isSavedDigit] = await Promise.all([
          this.saveBill(),
          this.saveDigit(),
          this.updateCheckStatus(),
          this.updateBarcodeSettings(),
        ])

        const validateMessageBill =
          isSavedBill && isSavedBill.status === SERVER_RESPONSE_CODE.OK

        const allSaved = validateMessageBill && isSavedDigit
        if (allSaved) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.$fetch()
        }

        const hasResponseError = isSavedBill.status !== SERVER_RESPONSE_CODE.OK
        if (hasResponseError) {
          const messageError = isSavedBill.data?.response?.data?.message
          window.alert(this.$t(messageError))
        }
      } catch (error) {
      } finally {
        this.loading = false
      }
    },

    dataDigitChanged(data) {
      this.changedDigitDataTable = data
    },

    dataBillChanged(data) {
      this.changedBillDataTable = data
    },

    setCheckStatus({ keyCode, keyValue }) {
      for (const item of this.checkStatuses) {
        if (item.keyCode === keyCode) {
          item.keyValue = keyValue
          break
        }
      }
    },

    setBarcodeSettings({ keyCode, keyValue }) {
      for (const item of this.barcodeSettings) {
        if (item.keyCode === keyCode) {
          item.keyValue = keyValue
          break
        }
      }
    },

    async updateCheckStatus() {
      try {
        return await api('updateCheckStatus', this.checkStatuses)
      } catch (err) {
        console.error(err)
      }
    },

    async updateBarcodeSettings() {
      try {
        const payload = this.barcodeSettings.map((item) => {
          let barcodeStatus = item.keyValue
          if (item.keyCode === CONFIGURATIONS_KEYCODE.BARCODE_SYSTEM) {
            barcodeStatus = item.keyValue
              ? BARCODE_SYS_STATUS.CHECKED
              : BARCODE_SYS_STATUS.UNCHECKED
          }
          return { ...item, keyValue: barcodeStatus }
        })
        return await api('updateBarcodeSettings', payload)
      } catch (err) {
        console.error(err)
      }
    },

    async saveBill() {
      try {
        const payload = this.changedBillDataTable.map((bill) => ({
          addCompanyCodeBillSet: bill.billPrefix?.value,
          billFormat: bill.billFormat?.value,
          billId: bill.billID?.value,
          memoBillSet: bill.memo?.value,
          prefixCodeBillSet: bill.prefixCode?.value,
          serialNumber: bill.serialNumber?.value,
        }))

        const res = await api('saveBill', payload)

        return res
      } catch (err) {
        console.error(err)
      }
    },

    async saveDigit() {
      try {
        const payload = this.changedDigitDataTable.map((digit) => ({
          calculateTypeDigitSetId: digit.calculTypeId?.value,
          digitId: digit.id?.value,
          digitLength: digit.digit?.value,
          memoDigitSet: digit.memo?.value,
        }))

        const res = await api('saveDigit', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK

        return validResponse
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.spacer {
  height: 5px;
}
</style>
