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
    <UserManageForm ref="addUserForm" :data="userDetail" />
    <BaseLoading v-if="loading" />
  </div>
</template>

<script>
import api from '@/api/api'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar.vue'
import UserManageForm from '@/components/System-Setting/UserManage/UserManageForm'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
export default {
  name: 'PageAddUser',
  components: {
    UserManageForm,
    ToolBar,
    BaseLoading,
    BaseValidateMessage,
  },
  data() {
    return {
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
      loading: false,
      listErrorMessage: [],
      lang: this.$i18n.locale,
      userDetail: {
        userGroupID: [],
        enable: true,
      },
    }
  },
  methods: {
    changeActiveToolBar(key) {
      switch (key) {
        case 'add':
          return this.handleAdd()
        case 'save':
          return this.handleSave()
        case 'back':
          return this.$router.push(
            this.localePath({ path: '/system-maintenance/user-manage' })
          )
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          break
      }
    },

    async handleSave() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.loading = true
        this.listErrorMessage = []

        const payload = this.$refs.addUserForm.form || {}

        const requiredFields = {
          loginName: 'LoginName',
          employeeId: 'EmployeeName',
          loginPwd: 'LoginPwd',
        }
        for (const prop in requiredFields) {
          if (!payload[prop]) {
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
              text: this.$t('msg_NoInput_0'),
            })
          }
        }
        if (payload.userGroupID.length === 0) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_UserGroupName_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
        const finalPayload = Object.assign({}, payload, {
          language: this.lang,
          employeeID: payload.employeeId,
        })
        let response = {}
        if (finalPayload.loginName) {
          this.loading = true
          response = await api('addUser', finalPayload)
          this.loading = false
          const hasResponseError = response.status !== SERVER_RESPONSE_CODE.OK
          if (hasResponseError) {
            const errors = response.data?.response?.data?.errors
            const isDuplicateLoginName = errors.some(
              (error) =>
                error.field ===
                  SERVER_ERROR_MESSAGE.DUPLICATE_ADD_LOGIN_NAME.FIELD &&
                error.message ===
                  SERVER_ERROR_MESSAGE.DUPLICATE_ADD_LOGIN_NAME.MESSAGE
            )
            if (isDuplicateLoginName) {
              this.listErrorMessage.push({
                fieldName: this.$t(`lbl_LoginName_0`),
                text: this.$t('msg_UserNameExists_0'),
              })
            }
          }
        }

        const hasError = this.listErrorMessage.length
        if (hasError) {
          return
        }
        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          window.alert(this.$t('msg_IsSaved_0'))
          return this.$router.push(
            this.localePath(
              `/system-maintenance/user-manage/detail?userID=${response.data?.loginID}`
            )
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (!confirm) {
        return
      }

      this.$refs.addUserForm.form = {
        userGroupID: [],
        isEnable: true,
      }
      this.listErrorMessage = []
      this.$refs.addUserForm.refresh()
    },
  },
}
</script>
