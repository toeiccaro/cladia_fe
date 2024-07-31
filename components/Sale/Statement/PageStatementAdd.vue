<template>
  <div>
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <FormStatement :data-form="form"></FormStatement>
    <DetailTableStatement
      :list-details="form.statementImportDTOS"
      @changeData="changeData"
    ></DetailTableStatement>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      module-name="SOStatement"
    ></BaseModalAttach>
    <div
      v-if="loading"
      class="spinner content d-flex justify-content-center align-items-center"
    >
      <b-spinner
        b-spinner
        style="width: 3rem; height: 3rem"
        label="Loading..."
      ></b-spinner>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import FormStatement from './FormStatement.vue'
import DetailTableStatement from './DetailTableStatement.vue'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import {
  downloadFileExcel,
  getUnique,
  formatNumberWithCommas,
} from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'

export default {
  components: {
    ToolBar,
    FormStatement,
    BaseValidateMessage,
    DetailTableStatement,
    BaseModalAttach,
  },
  mixins: [dateTime],
  data() {
    return {
      loading: false,
      listErrorMessage: [],
      lang: this.$i18n.locale,
      form: {
        orderDate: this.convertDate(new Date()),
        statementImportDTOS: [],
        year: this.getYearDate(),
        totalAmount: 0,
        month: this.getMonthDate(),
        endDate: ''
      },
    }
  },

  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),

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
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
          disabled: !this.getActiveButtonToolBar?.isDelete,
        },
        {
          key: 'query',
          label: this.$t('btn_btnSearch_0'),
          icon: '/images/search.png',
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
          disabled: !this.getActiveButtonToolBar?.isPrint,
        },
        {
          key: 'attach',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
          disabled: !this.getActiveButtonToolBar?.isAttachments,
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
  },
  methods: {
    handleAction(key) {
      if (key === 'add') {
        return this.handleButtonAdd()
      }
      if (key === 'save') {
        return this.handleButtonSave()
      }
      if (key === 'delete') {
        return this.handleButtonDelete()
      }
      if (key === 'query') {
        return this.handleButtonQuery()
      }
      if (key === 'attach') {
        return (this.$refs.attachments.showModal = true)
      }
      if (key === 'print') {
        return this.handleExportExcel()
      }
      if (key === 'back') {
        return this.$router.push(this.localePath({ path: '/sales/statement' }))
      }
      if (key === 'refresh') {
        return location.reload()
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
    },
    async handleExportExcel() {
      const response = await api('exportStatement', {})
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    validateData() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      this.listErrorMessage = []
      const dataTableFilter = this.form.statementImportDTOS || []

      const payload = this.form

      const requiredFields = {
        orderDate: 'OrderDate',
        customerID: 'CustomerName',
        month: 'StMonth',
        year: 'StYear',
      }

      for (const prop in requiredFields) {
        if (!payload[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      if (dataTableFilter.length === 0) {
        this.listErrorMessage.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      }
      this.listErrorMessage = getUnique(this.listErrorMessage, 'fieldName')
      const hasError = this.listErrorMessage.length > 0
      if (hasError) {
        return
      }
      return {
        payload,
      }
    },
    async handleButtonSave() {
      try {
        const { payload } = this.validateData()
        payload.startDate = this.convertDate(payload.startDate)
        payload.endDate = this.convertDate(payload.endDate)

        this.loading = true
        const response = await api('addStatement', payload)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response?.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.$router.push({
            path: `/${this.$i18n.locale}/sales/statement/detail?statementNo=${response?.data}`,
          })
        } else {
          window.alert(this.$t(`${response?.data?.response?.data?.message}`))
        }
      } catch (error) {
      } finally {
        this.loading = false
      }
    },
    changeData(data) {
      this.form.statementImportDTOS = data
    },
    async handleButtonDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        if (this.form.statementNo) {
          this.loading = true
          const res = await api('deleteStatement', {
            statementNo: this.form.statementNo,
          })
          this.loading = false

          const errorCode = res?.data?.response?.status
          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(res?.data?.response?.data?.message))
            return
          }
          if (res && res.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
          }
        } else {
          window.alert(this.$t('msg_IsDeleted_0'))
        }
        location.reload()
      }
    },
    async handleButtonQuery() {
      const confirmSearch = window.confirm(this.$t('msg_ConfirmSearch_0'))

      if (this.form.customerID) {
        if (confirmSearch) {
          this.loading = true
          const payload = {
            beginDate: this.convertDate(this.form.startDate) ?? '',
            customerID: this.form.customerID,
            localLanguge: this.lang,
            endDate: this.convertDate(this.form.endDate) ?? '',
            month: this.form.month ?? '',
            year: this.form.year ?? '',
          }
          const res = await api('queryStatement', payload)
          this.loading = false
          if (res && res.status === SERVER_RESPONSE_CODE.OK) {
            this.form.statementImportDTOS = res?.data?.data.map(
              (item, index) => {
                item.invoiceOrderDate = item.orderDate
                item.lineID = index + 1
                delete item.orderDate
                return item
              }
            )
            this.form.totalAmount = formatNumberWithCommas(
              res?.data?.totalAmount
            )
          }
        }
      } else {
        const confirm = window.confirm(this.$t('msg_NoselectCustomer_0'))
        if (confirm) {
          return true
        }
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
