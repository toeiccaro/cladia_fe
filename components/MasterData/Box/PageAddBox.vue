<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormBox :data-form="form"></FormBox>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="systemID"
      module-name="Box"
    />
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
import FormBox from './FormBox.vue'
import { SERVER_RESPONSE_CODE } from '@/constants'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '~/components/UI/BaseModalAttach.vue'
export default {
  components: { ToolBar, FormBox, BaseModalAttach, BaseValidateMessage },
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
          key: 'attach',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
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
      form: {
        cbm: '0.000000',
        high: 0,
        weight: 0,
        packQty: 0,
        width: 0,
        boxLong: 0,
      },
      loading: false,
      listErrorMessage: [],
    }
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'delete':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          case 'attach':
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
      if (key === 'add') {
        return this.handleButtonAddBox()
      }
      if (key === 'save') {
        return this.handleButtonSaveBox()
      }
      if (key === 'delete') {
        return this.handleDeleteBox()
      }
      if (key === 'attach') {
        this.$refs.attachments.showModal = true
        return
      }
      if (key === 'back') {
        return this.$router.push(this.localePath({ path: '/master-data/box' }))
      }
      if (key === 'refresh') {
        return location.reload()
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    handleButtonAddBox() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
    },
    async handleButtonSaveBox() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return false
        }

        this.listErrorMessage = []

        const requiredFields = {
          boxType: 'BoxType',
          boxLong: 'Long',
          width: 'Width',
          high: 'High',
          weight: 'Weight',
          packQty: 'PackQty',
        }

        for (const prop in requiredFields) {
          if (!this.form[prop]) {
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
              text: this.$t('msg_NoInput_0'),
            })
          }
        }

        const payload = this.form
        let response = {}
        if (payload.boxType) {
          this.loading = true
          response = await api('addBox', payload)
          const hasResponseError = response.status !== 200
          this.loading = false
          if (hasResponseError) {
            const messErr = response.data?.response?.data?.errors[0]
            const textField =
              messErr.field.charAt(0).toUpperCase() + messErr.field.slice(1)
            const textMess = messErr.message
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_${textField}_0`),
              text: this.$t(`${textMess}`),
            })
          }
        }
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.$router.push({
            path: `/${this.$i18n.locale}/master-data/box/detail?systemID=${response?.data?.systemID}`,
          })
          return response
        }
        return false
      } catch (err) {
        console.error(err)
      }
    },

    handleDeleteBox() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        window.alert(this.$t('msg_IsDeleted_0'))
        location.reload()
      }
    },
  },
}
</script>
