<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      :show-border-save="isShowBorderSave"
      @changeActiveToolBar="handleAction"
    />
    <HeaderFormEnterprise
      ref="formAddEnterprise"
      :data-form-enterprise="paramsAddEnterprise"
    />
    <BaseModalAttach ref="attachments" :data="recordItem"></BaseModalAttach>
  </div>
</template>
<script>
import { get } from 'lodash'
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import HeaderFormEnterprise from '@/components/MasterData/EnterpriseMaster/HeaderFormEnterprise.vue'
import BaseModalAttach from '~/components/UI/BaseModalAttach.vue'

export default {
  components: { ToolBar, HeaderFormEnterprise, BaseModalAttach },
  data() {
    return {
      isShowBorderSave: false,
      listErrorMessage: [],
      showModalAttach: false,
      recordItem: {},
      listToolBars: [
        {
          key: 'addNewEnterprise',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'saveEnterprise',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'newSaveEnterprise',
          label: this.$t('btn_btnNewSave_0'),
          icon: '/images/new_save.png',
        },
        {
          key: 'deleteEnterprise',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'attachEnterprise',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
        },
        {
          key: 'backAddEnterprise',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },
        {
          key: 'closeAddEnterprise',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      paramsAddEnterprise: {
        payPeriod: null,
        settleDate: null,
        attachments: [],
        taxRate: 0,
        discountRate: 0
      },
    }
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'deleteEnterprise':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          case 'attachEnterprise':
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
      if (key === 'addNewEnterprise') {
        return this.handleButtonAddEnterprise()
      }
      if (key === 'saveEnterprise' || key === 'newSaveEnterprise') {
        this.isShowBorderSave = true
        return this.handleButtonSaveEnterprise()
      }
      if (key === 'deleteEnterprise') {
        return this.handleButtonDeleteEnterprise()
      }
      if (key === 'attachEnterprise') {
        this.$refs.attachments.showModal = true
        return
      }
      if (key === 'backAddEnterprise') {
        return this.$router.push(
          this.localePath({ path: '/master-data/enterprise-master' })
        )
      }
      if (key === 'refresh') {
        return location.reload()
      }
      if (key === 'closeAddEnterprise') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    handleButtonAddEnterprise() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
    },
    async handleButtonSaveEnterprise() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        this.paramsAddEnterprise.companyID = Math.floor(Math.random() * 100)
        const params = this.$refs.formAddEnterprise?.dataFormEnterprise
        params.relateCompanyID = this.paramsAddEnterprise.relateCompanyId
        if (confirm) {
          this.listErrorMessage = []

          const requiredFields = {
            companyCode: 'CompanyCode',
            companyName: 'CompanyName',
            companyTypeID: 'CompanyType',
          }

          for (const prop in requiredFields) {
            if (!params[prop]) {
              this.listErrorMessage.push({
                fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
                text: this.$t('msg_NoInput_0'),
              })
            }
          }

          const enterDay = {
            payPeriod: 'PayPeriod',
            settleDate: 'SettleDate',
          }

          for (const prop in enterDay) {
            if (params[prop]) {
              if(params[prop] < 1 || params[prop] > 31) {
                this.listErrorMessage.push({
                  fieldName: this.$t(`lbl_${enterDay[prop]}_0`),
                  text: this.$t('msg_NoInput_0'),
                })
              }
            }
          }

          this.$emit('validation-errors', this.listErrorMessage)

          const hasError = this.listErrorMessage.length > 0
          if (hasError) {
            return
          }

          const response = await api('addEnterpriseMaster', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }

          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push({
              path: `/${this.$i18n.locale}/master-data/enterprise-master/detail?companyCode=${response?.data?.companyID}`,
            })
          }

          const isDuplicateCompanyCode =
            get(response, 'data.response.data.message', '') ===
            SERVER_ERROR_MESSAGE.DUPLICATE_COMPANY_CODE

          if (isDuplicateCompanyCode) {
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_CompanyCode_0`),
              text: this.$t('msg_Exists_0'),
            })
          }

          this.$emit('validation-errors', this.listErrorMessage)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async handleButtonDeleteEnterprise() {
      try {
        const params = {
          companyCode: this.paramsAddEnterprise?.companyCode,
        }
        const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
        if (confirm) {
          if (params.companyCode) {
            const response = await api('deleteEnterpriseMaster', params)
            const errorCode = response?.data?.response?.status

            if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
              window.alert(this.$t(response?.data?.response?.data?.message))
              return
            }
            if (response.status === SERVER_RESPONSE_CODE.OK) {
              window.alert(this.$t('msg_IsDeleted_0'))
            } else {
              window.alert(`${response?.message}`)
            }
          } else location.reload()
        }
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>
<style lang="scss" scoped></style>
