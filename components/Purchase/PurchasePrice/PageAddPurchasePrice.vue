<template>
  <div class="add-purchase-price-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormPurchasePrice ref="purchasePriceForm" :data="newPurchasePriceData" />
    <BaseTableItemDetail
      ref="purchasePriceTableDetail"
      class="add-purchase-price-table-details"
      :table-content="dataTable"
      :table-type="'purchasePriceDetail'"
      :list-item-master="listItemCode"
      :column-hides="columnHides"
      :customer-id="newPurchasePriceData.supplierId"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="handleChangeTable"
    ></BaseTableItemDetail>
    <ModalPriceAnalysis ref="priceAnalysisModal" add></ModalPriceAnalysis>

    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    ></base-set-column-detail>
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { dateFormatYYYY, isEmptyValue, getUnique } from '@/utils/utils'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE } from '@/constants'
import systemMixins from '@/mixins/system'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar'
import ModalPriceAnalysis from '@/components/Purchase/PurchasePrice/Modal/ModalPriceAnalysis'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import FormPurchasePrice from '@/components/Purchase/PurchasePrice/FormPurchasePrice'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'

export default {
  name: 'SalePriceAdd',
  components: {
    ToolBar,
    FormPurchasePrice,
    ModalPriceAnalysis,
    BaseValidateMessage,
    BaseLoading,
    BaseSetColumnDetail,
    BaseTableItemDetail,
  },
  mixins: [systemMixins],
  data() {
    return {
      dataTable: [],
      modalAddNewItem: false,
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
          key: 'newSave',
          label: this.$t('btn_btnNewSave_0'),
          icon: '/images/new_save.png',
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
        },
        {
          key: 'priceAnalysis',
          label: this.$t('btn_btnPriceAnalysis_0'),
          icon: '/images/set.png',
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'setColumn',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
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
      newPurchasePriceData: {},
      listApparelCode: {},

      isNewSave: false,
      columnHides: [],
      listItemCode: [],
      lang: this.$i18n.locale,
    }
  },

  async fetch() {
    try {
      this.addNewLineData()
      await Promise.all([this.getListItemCode(), this.getScolumnHides()])
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'delete') {
          item.disabled = !this.getActiveButtonToolBar?.isDelete
        }
        return item
      })
    },
    newLine() {
      return {
        minQuantity: '',
        maxQuantity: '',
        price: '',
        isNewLine: true,
        isUpdate: true,
      }
    },
    availableDetails() {
      return this.dataTable.filter((item) => item && !item.isNewLine)
    },

    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          typeInput: 'checkbox',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          typeInput: '',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'minQuantity',
          name: this.$t('lbl_MinQuantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'maxQuantity',
          name: this.$t('lbl_MaxQuantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'price',
          name: this.$t('lbl_Price_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          fieldRequired: true,
          hidden: false,
        },
      ]
    },
  },

  methods: {
    reloadPage() {
      return location.reload()
    },
    async getScolumnHides() {
      try {
        this.loading = true
        const response = await api('getPurchaseScolumns', {
          gridName: 'POPriceDetail',
        })
        this.columnHides = response?.data
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },

    closeModal() {
      this.modalAddNewItem = false
    },
    handleAction(key) {
      switch (key) {
        case 'refresh':
          return this.handleRefresh()
        case 'add':
          return this.handleAdd()
        case 'save':
          return this.handleSave()
        case 'newSave':
          this.isNewSave = true
          return this.handleSave()
        case 'delete':
          return this.handleDelete()
        case 'setColumn':
          return (this.$refs.baseSetColumnModal.showModal = true)
        case 'priceAnalysis':
          return (this.$refs.priceAnalysisModal.showModal = true)
        case 'back':
          return this.$router.push(
            this.localePath({ path: '/purchase/po-price' })
          )
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          break
      }
    },
    handleRefresh() {
      this.resetPageData()
    },
    handleDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        window.alert(this.$t('msg_IsDeleted_0'))
        this.resetPageData()
      }
    },
    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.resetPageData()
      }
    },
    async handleSave() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.loading = true

        this.validate()

        const hasError = this.listErrorMessage.length
        if (hasError) {
          return
        }

        const payload = this.makePayloadData()
        await this.sendAddSalePriceRequest(payload)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
        this.isNewSave = false
      }
    },

    validate() {
      this.listErrorMessage = []
      const formData = this.$refs.purchasePriceForm.purchasePriceData

      const requiredFields = {
        supplierId: 'SupplierName',
        itemId: 'ItemCode',
        effectiveDate: 'EffectiveDate',
        currencyId: 'Currency',
        unitId: 'Unit',
      }

      const requiredTableDetail = {
        minQuantity: 'MinQuantity',
        maxQuantity: 'MaxQuantity',
        price: 'Price',
      }

      for (const prop in requiredFields) {
        if (isEmptyValue(formData[prop])) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      const isEmptyDetails = this.availableDetails.length === 0
      if (isEmptyDetails) {
        this.listErrorMessage.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        let requiredErrors = []
        this.availableDetails.forEach((item) => {
          for (const key in requiredTableDetail) {
            if (
              (['minQuantity', 'maxQuantity', 'price'].includes(key) &&
                !this.parseStringToFloat(item[key])) ||
              !item[key]
            ) {
              requiredErrors.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${item.lineID} 
                - ${this.$t(`lbl_${requiredTableDetail[key]}_0`)}
                `,
                text: this.$t('msg_NoInput_0')
              })
              this.listErrorMessage.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${item.lineID} 
                - ${this.$t(`lbl_${requiredTableDetail[key]}_0`)}
                `,
                text: this.$t('msg_NoInput_0')
              })
            }
          }
        })
        requiredErrors = getUnique(requiredErrors, 'fieldName')
        if (requiredErrors.length > 0) return
      }

      const sectionErrors = this.availableDetails.map((item, index) => {
        const minQuantityGreaterThanMax =
          this.parseStringToFloat(item.minQuantity) >=
          this.parseStringToFloat(item.maxQuantity)

        const invalidQuantity = minQuantityGreaterThanMax

        if (invalidQuantity) {
          this.listErrorMessage.push({
            fieldName: `${this.$t(`lbl_LineID_0`)}${index + 1}`,
            text: this.$t('msg_QtySectionError_0'),
          })

          return item
        }

        return null
      })

      const hasSectionError = sectionErrors.filter(Boolean).length
      if (hasSectionError) {
        return
      }

      const finalAvailableDetails = this.availableDetails.map((item) => ({
        ...item,
        minQuantity: Number(item.minQuantity),
        maxQuantity: Number(item.maxQuantity),
        price: Number(item.price),
      }))

      finalAvailableDetails.forEach((item, index) => {
        const duplicateItem = finalAvailableDetails.find(
          (detailItem, detailItemIndex) => {
            const itemIncludesDetailItem =
              detailItem.minQuantity >= item.minQuantity &&
              detailItem.maxQuantity <= item.maxQuantity

            const itemIsInRangeOfDetailItem =
              detailItem.minQuantity <= item.minQuantity &&
              detailItem.maxQuantity >= item.maxQuantity

            const detailItemMinValueIsInRangeOfItem =
              detailItem.minQuantity >= item.minQuantity &&
              detailItem.minQuantity <= item.maxQuantity

            const detailItemMaxValueIsInRangeOfItem =
              detailItem.maxQuantity >= item.minQuantity &&
              detailItem.maxQuantity <= item.maxQuantity

            const interferometry =
              detailItemMinValueIsInRangeOfItem ||
              detailItemMaxValueIsInRangeOfItem

            const excludeCurrentLoopingItem = detailItemIndex !== index
            const hasError =
              excludeCurrentLoopingItem &&
              (itemIncludesDetailItem ||
                interferometry ||
                itemIsInRangeOfDetailItem)

            return hasError
          }
        )

        if (duplicateItem) {
          this.listErrorMessage.push({
            fieldName: `${this.$t(`lbl_LineID_0`)}${index + 1}`,
            text: this.$t('msg_DuplicateSection_0'),
          })
        }
      })

      this.listErrorMessage = getUnique(this.listErrorMessage, 'fieldName')
    },

    makePayloadData() {
      const formData = this.$refs.purchasePriceForm.purchasePriceData
      const payload = Object.assign(formData, {
        maxMinRequest: this.availableDetails,
      })

      const convertDateFields = ['effectiveDate']
      for (const key of convertDateFields) {
        payload[key] = dateFormatYYYY(new Date(payload[key]))
      }

      return payload
    },

    async sendAddSalePriceRequest(payload) {
      const response = await api('addPurchasePrice', payload)
      const errorCode = response?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(response?.data?.response?.data?.message))
        return
      }

      const validResponse = response.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        window.alert(this.$t('msg_IsSaved_0'))

        if (this.isNewSave) {
          return this.resetPageData()
        }

        return this.$router.push({
          path: this.localePath('/purchase/po-price/detail'),
          query: {
            lang: this.lang,
            supplierId: payload.supplierId,
            itemId: payload.itemId,
            effectiveDate: payload.effectiveDate,
          },
        })
      }

      const error = response.data?.response?.data?.message
      const isRepeatedInfo = error === SERVER_ERROR_MESSAGE.MAIN_INFO_REPEATED
      if (isRepeatedInfo) {
        this.listErrorMessage.push({
          text: this.$t('msg_MainInfoRepeat_0'),
        })
      }
    },

    resetTableDetailData() {
      this.dataTable = []
      this.$refs.purchasePriceTableDetail.activeRow = -1
      this.$refs.purchasePriceTableDetail.resetSearchData()
      this.addNewLineData()
    },

    resetPageData() {
      try {
        this.loading = true
        this.listErrorMessage = []
        this.resetTableDetailData()
        this.$refs.purchasePriceForm.resetData()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    handleChangeTable(data) {
      this.dataTable = data
    },

    addNewLineData() {
      this.dataTable.push({
        ...this.newLine,
        lineID: this.dataTable.length + 1,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.add-purchase-price-page {
  background: #fff 50% bottom repeat-x;
  color: #222;
  position: relative;
  padding: 0.2em 0.2em 0;
  zoom: 1;
  font-family: Lucida Grande, Lucida Sans, Arial, sans-serif;
  font-size: 1.1em;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  height: 100%;
}
</style>
