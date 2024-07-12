<template>
  <div class="edit-item-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <FormEmployee
      ref="formEmployee"
      :data-form-employee="dataBaseInfo"
      @file-upload="(data) => (file = data)"
    />
    <BaseModalAttach
      ref="attachments"
      :data="dataBaseInfo"
      key-file-no="employeeCode"
      module-name="Employee"
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
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import FormEmployee from '@/components/HrManagement/Employee/FormEmployee.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import { isEmptyValue } from '~/utils/utils'
import systemMixins from '@/mixins/system'
export default {
  components: { ToolBar, FormEmployee, BaseModalAttach },
  mixins: [systemMixins],
  props: {
    recordItem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showModalAttach: false,
      listErrorMessage: [],
      listToolBars: [
        {
          key: 'addNewEmployee',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'saveEmployee',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'deleteEmployee',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
        },
        {
          key: 'refreshEmployee',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'attachEmployee',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
        },
        {
          key: 'backEmployee',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },
        {
          key: 'closeEmployee',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      file: '',
      dataBaseInfo: this.recordItem
        ? JSON.parse(JSON.stringify(this.recordItem))
        : {},
      loading: false,
      formData: null,
    }
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'deleteEmployee':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          case 'attachEmployee':
            item.disabled = !this.getActiveButtonToolBar?.isAttachments
            break
          default:
            break
        }
        return item
      })
    },
  },
  watch: {
    recordItem: {
      handler(val) {
        this.initData()
      },
    },
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      this.dataBaseInfo = JSON.parse(JSON.stringify(this.recordItem))
      this.dataBaseInfo.attachments = this.dataBaseInfo.attachmentList
      this.joinAttachmentString(this.dataBaseInfo.attachments)
    },
    handleAction(key) {
      if (key === 'addNewEmployee') {
        return this.handleButtonAddEmployee()
      }
      if (key === 'saveEmployee') {
        return this.handleButtonSaveEmployee()
      }
      if (key === 'deleteEmployee') {
        return this.handleButtonDeleteEmployee()
      }
      if (key === 'attachEmployee') {
        this.$refs.attachments.showModal = true
        return
      }
      if (key === 'backEmployee') {
        return this.$router.push(
          this.localePath({ path: '/hr-management/employee' })
        )
      }
      if (key === 'refreshEmployee') {
        return location.reload()
      }
      if (key === 'closeEmployee') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    handleButtonAddEmployee() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(
          this.localePath({ path: '/hr-management/employee/add' })
        )
      }
    },
    async handleButtonSaveEmployee() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.loading = true

        this.validate()

        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        await this.sendUpdateRequest()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    validate() {
      this.listErrorMessage = []
      this.formData = new FormData()
      const finalParams = {}

      const params = JSON.parse(JSON.stringify(this.dataBaseInfo))

      for (const property in params) {
        if (!isEmptyValue(params[property])) {
          finalParams[property] = params[property]
        }
      }

      if (this.file) {
        this.formData.append('file', this.file)
      }

      delete finalParams.attachments
      delete finalParams.attachmentList

      for (const property in finalParams) {
        this.formData.append(property, params[property])
      }

      const requiredFields = {
        employeeCode: 'EmployeeCode',
        employeeName: 'EmployeeName',
        born: 'Born',
      }
      for (const prop in requiredFields) {
        if (isEmptyValue(finalParams[prop])) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      this.emitErrorMessage()
    },
    async sendUpdateRequest() {
      const response = await api('updateEmployeeMaster', this.formData)
      const errorCode = response?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(response?.data?.response?.data?.message))
        return
      }

      if (response.status === SERVER_RESPONSE_CODE.OK) {
        return window.alert(this.$t('msg_IsSaved_0'))
      }
    },
    emitErrorMessage() {
      this.$emit('validation-errors', this.listErrorMessage)
    },
    async handleButtonDeleteEmployee() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
        if (!confirm) {
          return
        }
        this.loading = true
        const response = await api(
          'deleteEmployeeMaster',
          this.dataBaseInfo.employeeID
        )
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsDeleted_0'))

          this.$router.push(
            this.localePath({ path: '/hr-management/employee/add' })
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    updateData(data) {
      this.dataBaseInfo.attachments?.push(data)
      this.joinAttachmentString(this.dataBaseInfo.attachments)
    },

    deleteData(id) {
      this.dataBaseInfo.attachments = this.dataBaseInfo.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.dataBaseInfo.attachments)
    },

    joinAttachmentString(attachmentArray = []) {
      this.dataBaseInfo.attachmentList = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-item-page {
  display: block;
  border-width: 0;
  padding: 1em 1.4em;
  background: none;
  color: #222222;
}
</style>
