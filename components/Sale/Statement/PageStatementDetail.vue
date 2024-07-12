<template>
  <div>
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <FormStatement
      ref="formEditStatement"
      :data-form="dataForm"
      :disable-input="true"
    ></FormStatement>
    <DetailTableStatement
      :list-details="form.statementImportDTOS"
      @changeData="changeDataDetailTable"
    ></DetailTableStatement>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="statementNo"
      module-name="SOStatement"
      @updateData="updateData"
      @deleteData="deleteData"
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
import { downloadFileExcel, formatNumberWithCommas } from '@/utils/utils'
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
      form: {},
      dataForm: {},
      listFieldRequired: [
        {
          key: 'orderDate',
          fieldName: this.$t('lbl_OrderDate_0'),
        },
        {
          key: 'customerID',
          fieldName: this.$t('lbl_CustomerName_0'),
        },
        {
          key: 'year',
          fieldName: this.$t('lbl_StYear_0'),
        },

        {
          key: 'month',
          fieldName: this.$t('lbl_StMonth_0'),
        },
      ],
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
          disabled: true,
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
  created() {
    this.getDetailData()
  },

  methods: {
    async getDetailData() {
      try {
        this.loading = true
        const params = {
          statementNo: this.$route.query?.statementNo,
        }
        const response = await api('getDetailStatement', params)
        this.form = response?.data
        this.form.totalAmount = formatNumberWithCommas(this.form.totalAmount)
        this.dataForm = JSON.parse(JSON.stringify(response?.data))
        this.joinAttachmentString(this.dataForm.attachments)
      } catch (error) {
      } finally {
        this.loading = false
      }
    },
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
      } else if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    async handleExportExcel() {
      const sortFormOptional = {
        localLanguage: this.$i18n.locale,
        exportAllData: true,
        statementNO: this.form.statementNo,
      }
      const response = await api('exportStatement', sortFormOptional)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
    },
    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/sales/statement/add' }))
      }
    },
    async handleButtonSave() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        if (
          this.dataForm.orderDate &&
          this.dataForm.customerID &&
          this.dataForm.month &&
          this.dataForm.year &&
          this.dataForm.statementImportDTOS.length > 0
        ) {
          this.loading = true
          const payload = this.dataForm
          payload.startDate = this.convertDate(payload.startDate)
          payload.endDate = this.convertDate(payload.endDate)
          const response = await api('addStatement', payload)
          this.loading = false

          const errorCode = response?.data?.response?.status
          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }

          if (response?.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsSaved_0'))
          } else {
            window.alert(this.$t(`${response?.data?.response?.data?.message}`))
          }
        } else {
          this.listErrorMessage = []
          this.listFieldRequired.forEach((item) => {
            if (!this.dataForm[item.key]) {
              this.listErrorMessage.push({
                fieldName: item.fieldName,
                text: this.$t('msg_NoInput_0'),
              })
            }
          })
          if (this.dataForm.statementImportDTOS.length === 0) {
            this.listErrorMessage.push({
              fieldName: this.$t('msg_Details_0'),
              text: this.$t('msg_NoInput_0'),
            })
          }
        }
      }
    },
    async handleButtonDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        this.loading = true
        const res = await api('deleteStatement', {
          statementNo: this.$route.query?.statementNo,
        })
        this.loading = false
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsDeleted_0'))
          this.$router.push(this.localePath({ path: '/sales/statement/add' }))
        }
      }
    },
    handleButtonQuery() {},
    updateData(data) {
      this.form.attachments.push(data)
      this.joinAttachmentString(this.form.attachments)
    },
    deleteData(id) {
      this.form.attachments = this.form.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.form.attachments)
    },

    joinAttachmentString(attachmentArray = []) {
      this.dataForm.attachments = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
    },
    changeDataDetailTable(data) {
      this.dataForm.statementImportDTOS = data
    },
  },
}
</script>
<style lang="scss" scoped></style>
