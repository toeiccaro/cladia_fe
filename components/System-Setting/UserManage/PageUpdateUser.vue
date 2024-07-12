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
    <UserManageForm ref="updateUserForm" :data="userDetail" />
    <BaseLoading v-if="loading" />
  </div>
</template>

<script>
import api from '@/api/api'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE } from '@/constants'
import dateTimeMixins from '@/mixins/dateTime'
import ToolBar from '@/components/UI/ToolBar.vue'
import UserManageForm from '@/components/System-Setting/UserManage/UserManageForm'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
export default {
  name: 'PageUpdateUser',
  components: {
    UserManageForm,
    ToolBar,
    BaseLoading,
    BaseValidateMessage,
  },
  mixins: [dateTimeMixins],
  data() {
    return {
      loading: false,
      listErrorMessage: [],
      userDetail: {},
      lang: this.$i18n.locale,
      ADMIN: 1,
    }
  },
  fetch() {
    this.getUserDataDetail()
  },
  computed: {
    isAdmin() {
      return this.userDetail?.loginID && this.userDetail?.loginID === this.ADMIN
    },
    listToolBars() {
      return [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
          disabled: this.isAdmin,
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
          disabled: this.isAdmin,
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
    async getUserDataDetail() {
      try {
        this.loading = true
        const payload = {
          userID: this.$route.query.userID,
        }
        const res = await api('getUserDetail', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          const userData = res.data
          this.userDetail = Object.assign({}, userData, {
            employeeId: userData.employeeID,
            editDate: this.convertDate(userData.editDate),
            userGroupIDSelected: userData.userGroupID,
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
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

        const payload = this.$refs.updateUserForm.form || {}

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
        let response = {}
        if (payload.loginName) {
          this.loading = true
          response = await api('updateUser', payload)
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
          this.getUserDataDetail()
          return window.alert(this.$t('msg_IsSaved_0'))
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

      this.listErrorMessage = []
      this.$router.push(this.localePath('/system-maintenance/user-manage/add'))
    },
  },
}
</script>
