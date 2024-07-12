<template>
  <div class="add-item-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />

    <FormItemMaster
      ref="formAddItemMaster"
      :params-item-master="paramsAddItemMaster"
    ></FormItemMaster>

    <ModalPriceAnalysis ref="priceAnalysis"></ModalPriceAnalysis>

    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="itemCode"
      module-name="ItemMaster"
      @updateData="updateDataDetail"
      @deleteData="deleteData"
    />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import systemMixins from '@/mixins/system'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar'
import FormItemMaster from '@/components/MasterData/ItemMaster/FormItemMaster'
import api from '@/api/api'
import ModalPriceAnalysis from '@/components/MasterData/ItemMaster/Modal/ModalPriceAnalysis'
import BaseModalAttach from '~/components/UI/BaseModalAttach'
export default {
  components: { ToolBar, FormItemMaster, BaseModalAttach, ModalPriceAnalysis },
  props: {
    paramsDetailItemMaster: {
      type: Object,
      default: () => {},
    },
  },
  mixins: [systemMixins],
  data() {
    return {
      listToolBars: [
        {
          key: 'addNewItemMaster',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'saveItemMaster',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'newSaveItemMaster',
          label: this.$t('btn_btnNewSave_0'),
          icon: '/images/new_save.png',
        },
        {
          key: 'deleteItemMaster',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
        },
        {
          key: 'priceAnalysisItemMaster',
          label: this.$t('btn_btnPriceAnalysis_0'),
          icon: '/images/set.png',
        },
        {
          key: 'refreshAddItem',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'attachItemMaster',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
        },
        {
          key: 'backItemMaster',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },
        {
          key: 'closeItemMaster',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      paramsAddItemMaster: {},
      form: {},
      listErrorMessage: [],
    }
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'deleteItemMaster':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          case 'attachItemMaster':
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
    paramsDetailItemMaster: {
      handler(value) {
        this.paramsAddItemMaster = JSON.parse(JSON.stringify(value))
        this.form = JSON.parse(JSON.stringify(value))
        this.joinAttachmentString(this.paramsAddItemMaster.attachments)
      },
      deep: true,
    },
  },
  created() {
    if (this.paramsDetailItemMaster && this.paramsDetailItemMaster?.itemCode) {
      this.paramsAddItemMaster = JSON.parse(
        JSON.stringify(this.paramsDetailItemMaster)
      )
      this.form = JSON.parse(JSON.stringify(this.paramsDetailItemMaster))
    }
  },

  methods: {
    handleAction(key) {
      if (key === 'addNewItemMaster') {
        return this.handleButtonAddItemMaster()
      }
      if (key === 'saveItemMaster' || key === 'newSaveItemMaster') {
        return this.handleSaveItemMaster()
      }
      if (key === 'deleteItemMaster') {
        return this.handleDeleteItemMaster()
      }
      if (key === 'attachItemMaster') {
        this.$refs.attachments.showModal = true
        return
      }
      if (key === 'backItemMaster') {
        return this.$router.push(
          this.localePath({ path: '/master-data/item-master' })
        )
      }
      if (key === 'refreshAddItem') {
        return location.reload()
      }
      if (key === 'closeItemMaster') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'priceAnalysisItemMaster') {
        this.$refs.priceAnalysis.showModal = true
      }
    },
    handleButtonAddItemMaster() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(
          this.localePath({ path: '/master-data/item-master/add' })
        )
      }
    },
    async handleSaveItemMaster() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))

        if (confirm) {
          this.listErrorMessage = []
          const payload = this.paramsAddItemMaster
          const requiredFields = {
            itemCode: 'ItemCode',
            itemName: 'ItemName',
            itemTypeId: 'ItemType',
            unitId: 'Unit',
          }

          for (const prop in requiredFields) {
            if (!payload[prop]) {
              this.listErrorMessage.push({
                fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
                text: this.$t('msg_NoInput_0'),
              })
            }
          }

          this.$emit('validation-errors', this.listErrorMessage)
          const hasError = this.listErrorMessage.length > 0
          if (hasError) {
            return
          }

          let response = {}
          if (payload.itemCode) {
            delete payload.attachments

            const formatNumberFields = [
              'outRate',
              'spq',
              'packPeriod',
              'safeQty',
              'weight',
              'moq',
              'salePeriod',
              'price',
              'soprice',
              'purchasePeriod',
              'outPeriod',
            ]
            for (const key of formatNumberFields) {
              payload[key] = this.parseStringToFloat(payload[key]) || 0
            }

            response = await api('editItemMaster', payload)
            const errorCode = response?.data?.response?.status

            if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
              window.alert(this.$t(response?.data?.response?.data?.message))
              return
            }

            if (errorCode === SERVER_RESPONSE_CODE.BAD_REQUEST) {
              const errors = response.data?.response?.data?.errors

              const isDuplicateCompanyCode = errors.some(
                (error) =>
                  error.field === 'itemCode' &&
                  error.message === 'msg_IsExist_0'
              )
              if (isDuplicateCompanyCode) {
                this.listErrorMessage.push({
                  fieldName: this.$t(`lbl_ItemCode_0`),
                  text: this.$t('msg_Exists_0'),
                })
              }
              return
            }
            
            if (response && response.status === 200) {
              window.alert(this.$t('msg_IsSaved_0'))
            }
          }
        }
      } catch (err) {
        console.error(err)
      }
    },
    async handleDeleteItemMaster() {
      const params = {
        subId: this.paramsAddItemMaster?.subId,
        groupId: this.paramsAddItemMaster?.groupId,
        itemId: this.paramsAddItemMaster?.itemId,
      }
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        if (this.paramsAddItemMaster?.itemId) {
          const response = await api('deleteItemMaster', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }

          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
            this.$router.push(
              this.localePath({ path: '/master-data/item-master/add' })
            )
          } else {
            window.alert(this.$t(`${response?.data?.response?.data?.message}`))
          }
        }
      }
    },
    updateDataDetail(data) {
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
      this.paramsAddItemMaster.attachments = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
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
