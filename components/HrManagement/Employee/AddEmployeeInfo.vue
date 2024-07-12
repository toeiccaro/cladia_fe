<template>
  <div class="add-item-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <FormEmployee
      :data-form-employee="dataBaseInfo"
      @file-upload="(data) => (file = data)"
    />
    <BaseModalAttach
      ref="attachments"
      :data="dataBaseInfo"
      key-file-no="employeeCode"
      module-name="Employee"
      @updateData="updateData"
    ></BaseModalAttach>
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import FormEmployee from '@/components/HrManagement/Employee/FormEmployee.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import { isEmptyValue } from '~/utils/utils'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'

export default {
  components: { ToolBar, FormEmployee, BaseModalAttach, BaseLoading },
  data() {
    return {
      showModalAttach: false,
      refreshFormEmployeeKey: 0,
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
      dataBaseInfo: {
        sexID: '',
        age: 0,
        IDCard: '',
        marital: false,
        entryDate: '',
        leaveDate: '',
        state: '1',
        born: '',
        enterDate: '',
        file: '',
      },
      employeeID: '',
      formData: null,
      loading: false,
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
  methods: {
    handleAction(key) {
      if (key === 'addNewEmployee') {
        return this.handleButtonAddEmployee()
      }
      if (key === 'saveEmployee') {
        return this.handleButtonSaveEmployee()
      }
      if (key === 'deleteEmployee') {
        return
      }
      if (key === 'attachEmployee') {
        this.$refs.attachments.showModal = true
        return
      }
      if (key === 'refreshEmployee') {
        return location.reload()
      }
      if (key === 'backEmployee') {
        return this.$router.push(
          this.localePath({ path: '/hr-management/employee' })
        )
      }
      if (key === 'closeEmployee') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    handleButtonAddEmployee() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.dataBaseInfo = {
          employeeID: '',
          employeeCode: '',
          employeeName: '',
          employeeNO: '',
          sexID: '',
          age: 0,
          partyAffiliation: '',
          IDCard: '',
          marital: false,
          entryDate: '',
          leaveDate: '',
          address: '',
          memo: '',
          email: '',
          tel: '',
          state: '1',
          born: '',
          enterDate: '',
          file: '',
        }
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

        await this.sendAddRequest()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    validate() {
      this.formData = new FormData()
      this.listErrorMessage = []
      const finalParams = {}

      const params = JSON.parse(JSON.stringify(this.dataBaseInfo))

      for (const property in params) {
        if (!isEmptyValue(params[property])) {
          finalParams[property] = params[property]
        }
      }

      for (const property in finalParams) {
        this.formData.append(property, params[property])
      }

      if (this.file) {
        this.formData.append('file', this.file)
      }

      const requiredFields = {
        employeeCode: 'EmployeeCode',
        employeeName: 'EmployeeName',
        born: 'Born',
      }

      for (const prop in requiredFields) {
        if (isEmptyValue(params[prop])) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      this.emitErrorMessage()
    },
    async sendAddRequest() {
      const response = await api('addEmployeeMaster', this.formData)
      const validResponse = response.status === SERVER_RESPONSE_CODE.OK
      const errorCode = response?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(response?.data?.response?.data?.message))
        return
      }
      if (!validResponse) {
        const errors = response.data?.response?.data?.errors || []
        const isEmployeeCodeExist = errors.find(
          (item) => item.message === SERVER_ERROR_MESSAGE.EMPLOYEE_CODE_EXISTS
        )

        if (isEmployeeCodeExist) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_EmployeeCode_0`),
            text: this.$t('msg_Exists_0'),
          })
        }

        return this.emitErrorMessage()
      }

      window.alert(this.$t('msg_IsSaved_0'))
      const employeeId = response?.data?.employeeID
      this.dataBaseInfo.employeeID = employeeId
      this.emitErrorMessage()
      this.$router.push({
        path: `/${this.$i18n.locale}/hr-management/employee/detail?employeeCode=${employeeId}`,
      })
    },

    emitErrorMessage() {
      this.$emit('validation-errors', this.listErrorMessage)
    },
    async handleButtonDeleteEmployee() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
        if (confirm) {
          if (this.dataBaseInfo.employeeID) {
            const response = await api(
              'deleteEmployeeMaster',
              this.dataBaseInfo.employeeID
            )
            if (response.status === SERVER_RESPONSE_CODE.OK) {
              window.alert(this.$t('msg_IsDeleted_0'))
            } else {
              window.alert(`${response?.message}`)
            }
          }
        }
      } catch (err) {
        console.error(err)
      }
    },
    async updateData() {
      if (this.dataBaseInfo.employeeID) {
        const res = await api(
          'getEmployeeMasterDetail',
          this.dataBaseInfo.employeeID
        )
        this.paramsDetailItemMaster = res?.data
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.add-item-page {
  display: block;
  border-width: 0;
  padding: 1em 1.4em;
  background: none;
  color: #222222;
}
</style>
