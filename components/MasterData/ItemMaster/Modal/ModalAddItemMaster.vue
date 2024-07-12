<template>
  <div class="add-item-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />

    <ModalAddItemMasterForm
      ref="modalAddItemMasterForm"
      :params-item-master="paramsAddItemMaster"
    ></ModalAddItemMasterForm>

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
import ToolBar from '@/components/UI/ToolBar'
import ModalAddItemMasterForm from '@/components/MasterData/ItemMaster/Modal/ModalAddItemMasterForm'
import api from '@/api/api'
import BaseModalAttach from '~/components/UI/BaseModalAttach'
import ModalPriceAnalysis from '~/components/MasterData/ItemMaster/Modal/ModalPriceAnalysis'
export default {
  components: {
    ToolBar,
    ModalAddItemMasterForm,
    BaseModalAttach,
    ModalPriceAnalysis,
  },
  props: {
    paramsDetailItemMaster: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      componentRefesh: true,
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
          key: 'priceAnalysisItemMaster',
          label: this.$t('btn_btnPriceAnalysis_0'),
          icon: '/images/set.png',
        },
        {
          key: 'attachItemMaster',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
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
  watch: {
    paramsDetailItemMaster: {
      handler(value) {
        this.paramsAddItemMaster = JSON.parse(JSON.stringify(value))
        this.form = JSON.parse(JSON.stringify(value))
        this.paramsAddItemMaster.attachments =
          this.paramsAddItemMaster.attachments
            .map((item) => `${item.fileName}.${item.fileType}`)
            .join(' ; ')
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
      if (key === 'attachItemMaster') {
        return (this.$refs.attachments.showModal = true)
      }
      if (key === 'closeItemMaster') {
        return this.$bus.$emit('close-quotation-add-item-master-dialog')
      }
      if (key === 'priceAnalysisItemMaster') {
        this.$refs.priceAnalysis.showModal = true
      }
    },
    handleButtonAddItemMaster() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (!confirm) {
        return
      }

      this.paramsAddItemMaster = {
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
      }

      this.$emit('validation-errors', [])
      this.$router.push(
        this.localePath({
          path: this.$route.fullPath,
          query: {
            itemCode: this.paramsAddItemMaster.itemCode,
            itemId: this.paramsAddItemMaster.itemId,
          },
        })
      )
    },
    async handleSaveItemMaster() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.listErrorMessage = []

        const requiredFields = {
          itemCode: 'ItemCode',
          itemName: 'ItemName',
          itemTypeId: 'ItemType',
          unitId: 'Unit',
        }

        for (const prop in requiredFields) {
          if (!this.paramsAddItemMaster[prop]) {
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

        const finalApi = this.$route.query.itemCode
          ? 'editItemMaster'
          : 'addItemMaster'

        let response = {}
        if (this.paramsAddItemMaster.itemCode) {
          delete this.paramsAddItemMaster.attachments
          response = await api(finalApi, this.paramsAddItemMaster)

          if (
            response?.data?.response?.status === SERVER_RESPONSE_CODE.FORBIDDEN
          ) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }

          if (
            response?.data?.response?.status ===
            SERVER_RESPONSE_CODE.BAD_REQUEST
          ) {
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
          }
          this.$emit('validation-errors', this.listErrorMessage)
          const hasError = this.listErrorMessage.length > 0
          if (hasError) {
            return
          }
          this.paramsAddItemMaster = response?.data
          this.$router.push(
            this.localePath({
              path: this.$route.fullPath,
              query: {
                itemCode: this.paramsAddItemMaster.itemCode,
                itemId: this.paramsAddItemMaster.itemId,
              },
            })
          )
          window.alert(this.$t('msg_IsSaved_0'))
        }
      } catch (err) {
        console.error(err)
      }
    },
    updateDataDetail(data) {
      this.form.attachments.push(data)
      this.paramsAddItemMaster.attachments = this.form.attachments
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep .modal-container {
  position: unset;
}
.add-item-page {
  display: block;
  border-width: 0;
  padding: 1em 1.4em;
  background: none;
  color: #222222;
}
</style>
