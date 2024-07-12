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
    <EditPasswordForm ref="editPasswordForm" />
    <BaseTableLoader v-if="loading" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import api from '@/api/api'
import EditPasswordForm from '@/components/System-Setting/EditPassword/EditPasswordForm'
import ToolBar from '@/components/UI/ToolBar'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
import { SERVER_RESPONSE_CODE } from '~/constants'

export default {
  components: {
    EditPasswordForm,
    ToolBar,
    BaseTableLoader,
    BaseValidateMessage,
  },
  middleware: ['authenticated'],

  data() {
    return {
      listErrorMessage: [],
      loading: false,
    }
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),

    listToolBars() {
      return [
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
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
          return this.handleButtonSave()
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          break
      }
    },

    async handleButtonSave() {
      try {
        this.loading = true
        this.listErrorMessage = []
        const payload = this.$refs.editPasswordForm.form || {}

        const { newPassword, passwordAgain } = payload
        if (newPassword !== passwordAgain) {
          this.listErrorMessage.push({
            text: `[${this.$t('msg_PwdNotSame_0')}]`,
          })

          this.clearFormData()
        }

        const hasError = this.listErrorMessage.length
        if (hasError) {
          return
        }

        const response = await api('changePassword', payload)

        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.clearFormData()
          return window.alert(this.$t('msg_Completed_0'))
        }

        this.listErrorMessage.push({
          text: `[${this.$t('msg_PwdError_0')}]`,
        })

        this.clearFormData()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    clearFormData() {
      this.$refs.editPasswordForm.clearData()
    },
  },
}
</script>
