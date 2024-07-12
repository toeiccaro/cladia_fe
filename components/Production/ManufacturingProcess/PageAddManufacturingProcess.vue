<template>
  <div class="add-manufacturing-process-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormManufacturingProcess
      ref="formAddManufacturing"
      :data="form"
      :status="processStatus"
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
import FormManufacturingProcess from '@/components/Production/ManufacturingProcess/FormManufacturingProcess.vue'
import ModalImportManufacturingProcess from '@/components/Production/ManufacturingProcess/Import/ModalImportManufacturingProcess.vue'
import systemMixins from '@/mixins/system'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import dateTime from '@/mixins/dateTime'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { getUnique } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'

export default {
  name: 'PageAddManufacturingProcess',
  components: {
    ToolBar,
    FormManufacturingProcess,
    BaseValidateMessage,
    ModalImportManufacturingProcess,
    BaseLoading,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      listErrorMessage: [],
      listToolBars: [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'import',
          label: this.$t('btn_btnImport_0'),
          icon: '/images/import.png',
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
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
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
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
      ],
      defaultForm: {
        isFinish: false,
        orderQuantity: 0,
        goodProductionQty: 0,
        defectiveQuantity: 0,
        numberField1: 0,
        numberField2: 0,
        breakTime: 0,
        beginTime: '',
        endTime: '',
      },
      form: {},
      loading: false,
      lang: this.$i18n.locale,
    }
  },
  fetch() {
    this.getProcessStatus(this.lang)
    this.form = Object.assign({}, this.defaultForm)
  },
  computed: {
    ...mapGetters({
      getActiveButtonToolBar: 'base/getActiveButtonToolBar',
      processStatus: 'base/getProcessStatus',
      userInfo: 'getUserInfo',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'delete':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          case 'check':
            item.disabled = !this.getActiveButtonToolBar?.isCheck
            break
          case 'unCheck':
            item.disabled = !this.getActiveButtonToolBar?.isCheck
            break
          default:
            break
        }
        return item
      })
    },
    processStatusValue() {
      const currentStatus = this.$refs.formAddManufacturing.processStatus
      switch (currentStatus) {
        case this.processStatus.start?.text:
          return this.processStatus.start?.value
        case this.processStatus.partial?.text:
          return this.processStatus.partial?.value
        case this.processStatus.completion?.text:
          return this.processStatus.completion?.value
        default:
          return this.processStatus.start?.value
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
      this.form.isFinished = value
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
          return this.handleImport()
        case 'back':
          return this.handleBack()
        case 'refresh':
          return this.handleRefresh()
        case 'close':
          return this.handleClose()
        case 'unCheck':
          return this.handleUnCheck()
        default:
          break
      }
    },
    handleClose() {
      this.$router.push(this.localePath({ path: '/' }))
    },
    async handleRefresh() {
      try {
        this.loading = true
        this.dataTable = []
        this.listErrorMessage = []
        await Promise.all([
          this.$refs.formAddManufacturing.$fetch(),
          this.$fetch(),
        ])
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleBack() {
      this.$router.push(
        this.localePath({ path: '/production/manufacturing-process' })
      )
    },
    handleUnCheck() {
      return window.confirm(this.$t('msg_NoCheck_0'))
    },
    handleImport() {
      const itemCode = this.form?.itemCode
      if (!itemCode) {
        return window.alert(this.$t('msg_NoSelectItemCode_0'))
      }

      this.UPDATE_PAYLOAD_MANUFACTURING_PROCESS_IMPORT({
        processCode: itemCode,
      })

      this.$refs.importManufacturingProcess.showModal = true
    },
    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
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
        if (!this.form[field]) {
          errors.push({
            fieldName: this.$t(`lbl_${requiredFields[field]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      })

      if (
        +this.form.goodProductionQty > +this.form.possibleProductQty
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
        payload: this.form,
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
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        const apiParams = {
          ...this.form,
          processStatus: this.processStatusValue,
          lineID: 1,
          language: this.lang,
          editUser: this.userInfo?.loginName,
          woNo: this.form.productionOrder,
          beginTime: this.form.beginTime,
          endTime: this.form.endTime,
          actualTime: this.makeValidTimeValue(this.form.actualTime),
          breakTime: this.makeValidTimeValue(this.form.breakTime),
          goodProductionQty: Number(this.form.goodProductionQty),
          defectiveQuantity: Number(this.form.defectiveQuantity),
          remainQuantity:
            Number(this.form?.orderQuantity) -
            Number(this.form?.goodProductionQty) -
            Number(this.form?.defectiveQuantity),
        }

        const response = await api('addManufacturingProcess', apiParams)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK

        if (!validResponse) {
          return window.alert(`${response?.message}`)
        }

        window.alert(this.$t('msg_IsSaved_0'))
        this.$router.push({
          path: this.localePath(`/production/manufacturing-process/detail`),
          query: {
            orderNo: response?.data?.orderNo,
          },
        })
      } catch (err) {
        console.error(err)
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

      window.alert(this.$t('msg_IsDeleted_0'))
      await this.handleRefresh()
    },
    handleImportData(data) {
      this.form.unitID = data.unitID?.value
      this.form.processItemID = data.subItemID?.value
      this.form.orderQuantity = data.blance?.value
      this.form.nextProcessId = data.nextProcessID?.value
      this.form.nextProcessID = data.nextProcessID?.value
      this.form.nextProcessName = data.nextProcessName?.value
      this.form.nextProcessCode = data.nextProcessCode?.value
      this.form.sono = data.sono?.value
      this.form.productionOrder = data.orderNO?.value
      this.form.scheduleStartDate = data.subBeginDate?.value
      this.form.scheduleEndDate = data.subEndDate?.value
      this.form.processCode = data.subItemCode?.value
      this.form.processName = data.subItemName?.value
      this.form.woLineID = data.lineID?.value
      this.form.woLineId = data.lineID?.value
      this.form.soLineNo = data.solineID?.value
      this.form.possibleProductQty = data.possibleProductQty?.value
      this.form.goodProductionQty = data?.goodProductionQty?.value || 0
      this.form.defectiveQuantity = data?.defectiveQuantity?.value || 0
      this.form.beginTime = data?.beginTime?.value || ''
      this.form.endTime = data?.endTime?.value || ''
      this.form.beginDate = data.beginDate?.value || ''
      this.form.endDate = data.endDate?.value || ''
      this.form.responsible = data?.responsible?.value || ''
      this.form.processingStartDate = data?.processingStartDate?.value || ''
      this.form.processingEndDate = data?.processingEndDate?.value || ''
      this.form.breakTime = data?.breakTime?.value || ''
      this.form.actualTime = data?.actualTime?.value || ''
      this.form.editUser = data?.editUser?.value || ''
      this.form.editDate = data?.editDate?.value || '' 
      this.form.checkUser = data?.checkUser?.value || ''
      this.form.checkDate = data?.checkDate?.value || ''
      this.form.customerText1 = data?.customerText1?.value || ''
      this.form.customerText2 = data?.customerText2?.value || ''
      this.form.numberField1 = data?.numberField1?.value || ''
      this.form.numberField2 = data?.numberField2?.value || ''
      this.form.checkbox1 = data?.checkbox1?.value || false
      this.form.checkbox2 = data?.checkbox2?.value || false
      this.form.isFinished = data?.isFinished?.value || false
      this.form.memo = data?.memo?.value || ''
    },
  },
}
</script>
<style lang="scss" scoped>
.add-manufacturing-process-page {
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
