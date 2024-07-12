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
    />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { SERVER_ERROR_MESSAGE, SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar.vue'
import FormItemMaster from '@/components/MasterData/ItemMaster/FormItemMaster.vue'
import api from '@/api/api'
import BaseModalAttach from '~/components/UI/BaseModalAttach.vue'
import ModalPriceAnalysis from '~/components/MasterData/ItemMaster/Modal/ModalPriceAnalysis.vue'
export default {
  components: { ToolBar, FormItemMaster, BaseModalAttach, ModalPriceAnalysis },
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
      paramsAddItemMaster: {
        itemTypeId: 0,
        description: '',
        weight: 0,
        price: 0,
        boxType: '',
        outPeriod: 0,
        purchasePeriod: 0,
        salePeriod: 0,
        packPeriod: 0,
        makePeriod: 0,
        dayAbility: 0.0,
        safeQty: 0,
        outRate: 0,
        moq: 0,
        spq: 0,
        soprice: 0,
        isCommon: false,
        isNotNeedMRP: false,
        unitId: null,
      },
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
          this.localePath({
            path: `/${this.$i18n.locale}/master-data/item-master`,
          })
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
        location.reload()
      }
    },
    async handleSaveItemMaster() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

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
          response = await api('addItemMaster', payload)

          if (response?.data?.response?.status === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }

          if (response?.data?.response?.status === SERVER_RESPONSE_CODE.BAD_REQUEST) {
            const errors = response.data?.response?.data?.errors

            const isDuplicateCompanyCode = errors.some(
              (error) =>
                error.field ===
                  SERVER_ERROR_MESSAGE.DUPLICATE_ADD_ITEM_CODE.FIELD &&
                error.message ===
                  SERVER_ERROR_MESSAGE.DUPLICATE_ADD_ITEM_CODE.MESSAGE
            )

            if (isDuplicateCompanyCode) {
              this.listErrorMessage.push({
                fieldName: this.$t(`lbl_ItemCode_0`),
                text: this.$t('msg_Exists_0'),
              })
            }
            return
          }

          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push({
              path: `/${this.$i18n.locale}/master-data/item-master/detail?itemCode=${response?.data?.itemId}`,
            })
            return
          }
        }

      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      }
    },
    handleDeleteItemMaster() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        window.alert(this.$t('msg_IsDeleted_0'))
        location.reload()
      }
    },
    updateDataDetail() {
      this.paramsAddItemMaster.attachments = this.form.attachments
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
