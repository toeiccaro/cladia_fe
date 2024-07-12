<template>
  <div class="edit-manufacturing-process-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormManufacturingProcess
      ref="formManufacturingProcess"
      :data="dataDetail"
      :list-item-code="listItemCode"
      :is-disabled="isCheck"
      :status="processStatus"
      @update-shipment="(data) => updateShipment(data)"
      @processing="onProcessing"
    />
    <ModalImportManufacturingProcess
      ref="importManufacturingProcess"
      @update-import-details="handleImportData"
    />
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapMutations, mapGetters, mapActions } from 'vuex'
import ModalImportManufacturingProcess from '@/components/Production/ManufacturingProcess/Import/ModalImportManufacturingProcess.vue'
import FormManufacturingProcess from '@/components/Production/ManufacturingProcess/FormManufacturingProcess.vue'
import api from '@/api/api'
import { isEmptyValue, getUnique } from '@/utils/utils'
import { SERVER_RESPONSE_CODE } from '@/constants'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'

export default {
  name: 'PageDetailManufacturingProcess',
  components: {
    BaseValidateMessage,
    ToolBar,
    FormManufacturingProcess,
    ModalImportManufacturingProcess,
    BaseLoading,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      listErrorMessage: [],
      loading: false,
      dataDetail: {},
      lang: this.$i18n.locale,
      listItemCode: [],
    }
  },
  async fetch() {
    try {
      this.loading = true
      await Promise.all([
        this.getListItemCode(),
        this.getDataDetail(),
        this.getProcessStatus(this.lang),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      getActiveButtonToolBar: 'base/getActiveButtonToolBar',
      processStatus: 'base/getProcessStatus',
      userInfo: 'getUserInfo',
    }),

    isCheck() {
      return (
        !isEmptyValue(this.dataDetail.checkUser) &&
        !isEmptyValue(this.dataDetail.checkDate)
      )
    },

    listToolBars() {
      return [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
          disabled: this.isCheck,
        },
        {
          key: 'import',
          label: this.$t('btn_btnImport_0'),
          icon: '/images/import.png',
          disabled: this.isCheck,
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
          disabled: !this.getActiveButtonToolBar.isDelete || this.isCheck,
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'check',
          label: this.$t('btn_btnCheck_0'),
          icon: '/images/check.png',
          disabled: !this.getActiveButtonToolBar.isCheck || this.isCheck,
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
          disabled: !this.getActiveButtonToolBar.isCheck || !this.isCheck,
        },
        {
          key: 'back',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ]
    },

    processStatusValue() {
      const currentStatus = this.$refs.formManufacturingProcess.processStatus
      switch (currentStatus) {
        case this.processStatus.start.text:
          return this.processStatus.start.value
        case this.processStatus.partial.text:
          return this.processStatus.partial.value
        case this.processStatus.completion.text:
          return this.processStatus.completion.value
        default:
          return this.processStatus.start.value
      }
    },
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT:
        'filterSort/UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT',
    }),
    ...mapActions('base', ['getProcessStatus']),
    onProcessing(value) {
      this.dataDetail.isFinished = value
    },
    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      validResponse && (this.listItemCode = res?.data)
    },
    async getDataDetail() {
      const payload = {
        processOrder: this.$route.query?.orderNo,
        language: this.lang,
      }
      const res = await api('getManufacturingProcessDetail', payload)
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (!validResponse) {
        return
      }

      this.dataDetail = res.data
      this.dataDetail.productionOrder = res.data.wono
      this.dataDetail.scheduleStartDate = res.data.beginDate
      this.dataDetail.scheduleEndDate = res.data.endDate
      this.dataDetail.defectiveQuantity = res.data.defectiveQuantity || 0
      this.dataDetail.remainQuantity = res.data.remainQuantity || 0
      this.dataDetail.orderQuantity = res.data.quantity || 0
    },
    handleAction(key) {
      switch (key) {
        case 'add':
          return this.handleAdd()
        case 'save':
          return this.handleSave()
        case 'delete':
          return this.handleDelete()
        case 'import':
          return this.handleButtonImport()
        case 'back':
          return this.handleBack()
        case 'refresh':
          return this.handleRefresh()
        case 'close':
          return this.handleClose()
        case 'check':
          return this.handleCheck()
        case 'unCheck':
          return this.handleUnCheck()
        default:
          break
      }
    },

    handleBack() {
      this.$router.push(
        this.localePath({ path: '/production/manufacturing-process' })
      )
    },
    handleClose() {
      this.$router.push(this.localePath({ path: '/' }))
    },
    async handleRefresh() {
      this.listErrorMessage = []
      await Promise.all([
        this.$refs.formManufacturingProcess.$fetch(),
        this.$fetch(),
      ])
    },

    handleButtonImport() {
      const itemCode = this.dataDetail?.itemCode
      if (!itemCode) {
        return window.alert(this.$t('msg_NoSelectItemCode_0'))
      }

      this.UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT({
        processCode: itemCode,
      })

      this.$refs.importManufacturingProcess.showModal = true
    },
    async handleCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const orderNo = this.dataDetail?.orderNo
        if (!orderNo) {
          return
        }

        const nextProcessID = this.dataDetail?.nextProcessID
        const remainQuantity = this.dataDetail?.remainQuantity
        const isFinished = this.dataDetail?.isFinished

        const params = {
          isLastStage: !!(!nextProcessID && !remainQuantity && isFinished),
          processOrder: orderNo,
          productionOrder: this.dataDetail?.productionOrder,
        }

        const response = await api('checkManufacturingProcess', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return window.alert(`${response?.message}`)
        }

        window.alert(this.$t('msg_IsChecked_0'))
        await this.getDataDetail()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleUnCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const orderNo = this.dataDetail?.orderNo
        if (!orderNo) {
          return
        }

        const nextProcessID = this.dataDetail?.nextProcessID
        const remainQuantity = this.dataDetail?.remainQuantity
        const isFinished = this.dataDetail?.isFinished

        const params = {
          isLastStage: !!(!nextProcessID && !remainQuantity && isFinished),
          processOrder: orderNo,
          productionOrder: this.dataDetail?.productionOrder,
        }

        const response = await api('unCheckManufacturingProcess', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return window.alert(`${response?.message}`)
        }

        window.alert(this.$t('msg_IsUnChecked_0'))
        await this.getDataDetail()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      confirm &&
        this.$router.push(
          this.localePath({ path: '/production/manufacturing-process/add' })
        )
    },
    validateData() {
      const errors = []

      const requiredFields = {
        processCode: 'ProcessCode',
        processName: 'ProcessName',
        productionOrder: 'Production_Order',
        orderQuantity: 'OrderQuantity',
        beginTime: 'StartTime',
        endTime: 'EndTime',
      }

      Object.keys(requiredFields).forEach((field) => {
        if (!this.dataDetail[field]) {
          errors.push({
            fieldName: this.$t(`lbl_${requiredFields[field]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      })

      if (
        +this.dataDetail.goodProductionQty > +this.dataDetail.possibleProductQty
      ) {
        errors.push({
          fieldName: this.$t(`lbl_PossibleProductQty_0`),
          text: this.$t('msg_GoodQtyExceedPossibleQty_0'),
        })
      }

      this.listErrorMessage = getUnique(errors, 'fieldName')
      if (this.listErrorMessage.length > 0) {
        return
      }
      return {
        payload: this.dataDetail,
      }
    },
    async handleSave() {
      try {
        this.loading = true
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.validateData()
        if (this.listErrorMessage.length) {
          return
        }

        const apiParams = {
          ...this.dataDetail,
          processStatus: this.processStatusValue,
          language: this.lang,
          woNo: this.dataDetail.productionOrder,
          beginTime: this.dataDetail.beginTime,
          endTime: this.dataDetail.endTime,
          actualTime: this.makeValidTimeValue(this.dataDetail.actualTime),
          breakTime: this.makeValidTimeValue(this.dataDetail.breakTime),
          itemID: this.dataDetail.itemId,
          goodProductionQty: Number(this.dataDetail.goodProductionQty),
          failureQty: Number(this.dataDetail.defectiveQuantity),
          woLineID: this.dataDetail.woLineId,
          remainQuantity:
            Number(this.dataDetail?.orderQuantity) -
            Number(this.dataDetail?.goodProductionQty) -
            Number(this.dataDetail?.defectiveQuantity),
        }

        const res = await api('editManufacturingProcess', apiParams)
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return window.alert(res?.message)
        }

        window.alert(this.$t('msg_IsSaved_0'))
        await this.getDataDetail()
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    makeValidTimeValue(value) {
      if (!value || value === '0:00') {
        return '00:00'
      }

      const hasNoTimeSeparator = !value.includes(':')

      if (hasNoTimeSeparator) {
        return `${value}:00`
      }
      return value
    },
    async handleDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const orderNo = this.dataDetail?.orderNo
        if (!orderNo) {
          return
        }

        const response = await api('deleteManufacturingProcess', {
          orderNo,
        })
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return window.alert(`${response?.message}`)
        }

        window.alert(this.$t('msg_IsDeleted_0'))
        this.$router.push(
          this.localePath({ path: '/production/manufacturing-process/add' })
        )
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    handleImportData(data) {
      this.dataDetail.unitID = data.unitID?.value
      this.dataDetail.processItemID = data.subItemID?.value
      this.dataDetail.orderQuantity = data.blance?.value
      this.dataDetail.nextProcessId = data.nextProcessID?.value
      this.dataDetail.nextProcessID = data.nextProcessID?.value
      this.dataDetail.nextProcessName = data.nextProcessName?.value
      this.dataDetail.nextProcessCode = data.nextProcessCode?.value
      this.dataDetail.sono = data.sono?.value
      this.dataDetail.productionOrder = data.orderNO?.value
      this.dataDetail.scheduleStartDate = data.subBeginDate?.value
      this.dataDetail.scheduleEndDate = data.subEndDate?.value
      this.dataDetail.processCode = data.subItemCode?.value
      this.dataDetail.processName = data.subItemName?.value
      this.dataDetail.woLineID = data.lineID?.value
      this.dataDetail.woLineId = data.lineID?.value
      this.dataDetail.soLineNo = data.solineID?.value
      this.dataDetail.possibleProductQty = data.possibleProductQty?.value
      this.dataDetail.goodProductionQty = data?.goodProductionQty?.value || 0
      this.dataDetail.defectiveQuantity = data?.defectiveQuantity?.value || 0
      this.dataDetail.beginTime = data?.beginTime?.value || ''
      this.dataDetail.endTime = data?.endTime?.value || ''
      this.dataDetail.beginDate = data.beginDate?.value || ''
      this.dataDetail.endDate = data.endDate?.value || ''
      this.dataDetail.responsible = data?.responsible?.value || ''
      this.dataDetail.processingStartDate = data?.processingStartDate?.value || ''
      this.dataDetail.processingEndDate = data?.processingEndDate?.value || ''
      this.dataDetail.breakTime = data?.breakTime?.value || ''
      this.dataDetail.actualTime = data?.actualTime?.value || ''
      this.dataDetail.editUser = data?.editUser?.value || ''
      this.dataDetail.editDate = data?.editDate?.value || '' 
      this.dataDetail.checkUser = data?.checkUser?.value || ''
      this.dataDetail.checkDate = data?.checkDate?.value || ''
      this.dataDetail.customerText1 = data?.customerText1?.value || ''
      this.dataDetail.customerText2 = data?.customerText2?.value || ''
      this.dataDetail.numberField1 = data?.numberField1?.value || ''
      this.dataDetail.numberField2 = data?.numberField2?.value || ''
      this.dataDetail.checkbox1 = data?.checkbox1?.value || false
      this.dataDetail.checkbox2 = data?.checkbox2?.value || false
      this.dataDetail.isFinished = data?.isFinished?.value || false
      this.dataDetail.memo = data?.memo?.value || ''
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-manufacturing-process-page {
  background: #fff 50% bottom repeat-x;
  color: #222;
  position: relative;
  padding: 0.2em 0.2em 0;
  zoom: 1;
  font-family: Lucida Grande, Lucida Sans, Arial, sans-serif;
  font-size: 1.1em;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  height: 100%;
}
</style>
