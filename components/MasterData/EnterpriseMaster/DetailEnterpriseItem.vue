<template>
  <div class="edit-item-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <HeaderFormEnterprise :data-form-enterprise="dataItem" />
    <BaseModalAttach
      ref="attachments"
      :data="form"
      module-name="Enterprise"
      key-file-no="companyCode"
      @updateData="updateData"
      @deleteData="deleteData"
    ></BaseModalAttach>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import systemMixins from '@/mixins/system'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import HeaderFormEnterprise from '@/components/MasterData/EnterpriseMaster/HeaderFormEnterprise.vue'
import BaseModalAttach from '~/components/UI/BaseModalAttach.vue'

export default {
  components: {
    ToolBar,
    HeaderFormEnterprise,
    BaseModalAttach,
  },
  mixins: [systemMixins],
  props: {
    recordItem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      listErrorMessage: [],
      listFieldRequired: [
        {
          key: 'companyCode',
          fieldName: this.$t('lbl_CompanyCode_0'),
        },
        {
          key: 'companyName',
          fieldName: this.$t('lbl_CompanyName_0'),
        },
        {
          key: 'companyTypeID',
          fieldName: this.$t('lbl_CompanyType_0'),
        },
      ],
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
      dataItem: this.recordItem
        ? JSON.parse(JSON.stringify(this.recordItem))
        : {},
      form: this.recordItem ? JSON.parse(JSON.stringify(this.recordItem)) : {},
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
  watch: {
    recordItem: {
      handler(val) {
        this.form = JSON.parse(JSON.stringify(val))
        this.dataItem = JSON.parse(JSON.stringify(val))
        this.joinAttachmentString(this.dataItem.attachments)
      },
    },
  },

  methods: {
    handleAction(key) {
      if (key === 'addNewEnterprise') {
        return this.handleButtonAddEnterprise()
      }
      if (key === 'saveEnterprise') {
        return this.handleButtonSaveEnterprise()
      }
      if (key === 'newSaveEnterprise') {
        return this.handleNewSave()
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
        this.$router.push(
          this.localePath({ path: '/master-data/enterprise-master/add' })
        )
      }
    },
    async handleButtonSaveEnterprise() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        if (
          this.dataItem.companyCode &&
          this.dataItem.companyName &&
          this.dataItem.companyTypeID
        ) {
          const finalDataItem = Object.assign({}, this.dataItem, {
            attachments: this.form.attachments,
          })

          const mapProps = {
            relateCompanyId: 'relateCompanyID',
          }

          for (const prop in mapProps) {
            finalDataItem[mapProps[prop]] = finalDataItem[prop]
          }

          const formatNumberFields = [
            'payPeriod',
            'settleDate',
            'relateCompanyID',
          ]
          for (const key of formatNumberFields) {
            finalDataItem[key] =
              this.parseStringToFloat(finalDataItem[key]) || 0
          }

          const response = await api('updateItemEnterprise', finalDataItem)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsSaved_0'))
            // location.reload()
          } else {
            window.alert(`${response?.message}`)
          }
        } else {
          this.listErrorMessage = []
          this.listFieldRequired.forEach((item) => {
            if (this.dataItem[item.key] === '') {
              this.listErrorMessage.push({
                fieldName: item.fieldName,
                text: this.$t('msg_NoInput_0'),
              })
            }
          })
          this.$emit('validateMessage', this.listErrorMessage)
        }
      }
    },
    handleNewSave() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        if (
          this.dataItem.companyCode &&
          this.dataItem.companyName &&
          this.dataItem.companyTypeID
        ) {
          this.$router.push(
            this.localePath({ path: '/master-data/enterprise-master/add' })
          )
        } else {
          this.listErrorMessage = []
          this.listFieldRequired.forEach((item) => {
            if (this.dataItem[item.key] === '') {
              this.listErrorMessage.push({
                fieldName: item.fieldName,
                text: this.$t('msg_NoInput_0'),
              })
            }
          })
          this.$emit('validateMessage', this.listErrorMessage)
        }
      }
    },
    async handleButtonDeleteEnterprise() {
      const params = {
        companyCode: this.dataItem?.companyCode,
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
            this.$router.push(
              this.localePath({ path: '/master-data/enterprise-master/add' })
            )
          } else {
            window.alert(`${response?.message}`)
          }
        }
      }
    },
    updateData(data) {
      this.form.attachments?.push(data)
      this.joinAttachmentString(this.form.attachments)
    },

    deleteData(id) {
      this.form.attachments = this.form.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.form.attachments)
    },

    joinAttachmentString(attachmentArray = []) {
      this.dataItem.attachments = attachmentArray
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
