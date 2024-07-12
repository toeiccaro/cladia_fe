<template>
  <div class="edit-purchase-price-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormPurchasePrice ref="purchasePriceForm" :data="purchasePriceData" />
    <BaseTableItemDetail
      ref="purchasePriceTableDetail"
      class="edit-purchase-price-table-details"
      :table-content="dataTable"
      :table-type="'purchasePriceDetail'"
      :list-item-master="listItemCode"
      :column-hides="columnHides"
      :customer-id="purchasePriceData.supplierId"
      :header-detail="tableHeaders"
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
import { pick, difference } from 'lodash'
import { dateFormatYYYY, isEmptyValue, getUnique } from '@/utils/utils'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE } from '@/constants'
import systemMixins from '@/mixins/system'
import dateTimeMixins from '@/mixins/dateTime'
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
  mixins: [systemMixins, dateTimeMixins],
  data() {
    return {
      dataTable: [],
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
      purchasePriceData: {},
      isNewSave: false,
      lang: this.$i18n.locale,
      columnHides: [],
      listItemCode: [],
    }
  },
  async fetch() {
    try {
      this.loading = true
      const queryParams = this.$route.query
      const [response] = await Promise.all([
        api('getPurchasePriceDetail', queryParams),
        this.getListItemCode(),
        this.getScolumnHides(),
      ])

      const validResponse =
        response && response.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.dataTable = response.data?.response?.map((item, index) => ({
          ...item,
          lineID: index + 1,
        }))

        this.addNewLineData()

        this.purchasePriceData = Object.assign({}, response.data, {
          apparelCode: response.data?.apparelCodeId,
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
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

    availableDetails() {
      return this.dataTable.filter((item) => item && !item.isNewLine)
    },
  },

  watch: {
    columnHides: {
      handler(value) {
        this.tableHeaders.slice(1).forEach((item, index) => {
          item.hidden = value[index].hidden
          if (item.key === 'unitId') {
            item.options = this.unitOptions
          }
        })
      },
      deep: true,
    },
  },

  methods: {
    reloadPage() {
      return location.reload()
    },
    async getScolumnHides() {
      const response = await api('getPurchaseScolumns', {
        gridName: 'POPriceDetail',
      })
      this.columnHides = response?.data
    },
    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
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
    async handleDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (!confirm) {
        return
      }

      const payload = {
        supplierId: this.purchasePriceData?.supplierId,
        effectiveDate: this.convertDate(this.purchasePriceData?.effectiveDate),
        itemId: this.purchasePriceData?.itemId,
      }
      const res = await api('deletePurchasePrice', payload)
      const errorCode = res?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(res?.data?.response?.data?.message))
        return
      }
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        window.alert(this.$t('msg_IsDeleted_0'))
        this.$router.push(this.localePath({ path: '/purchase/po-price/add' }))
      }
    },
    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/purchase/po-price/add' }))
      }
    },

    async handleSave() {
      try {
        this.loading = true

        this.validate()

        const hasError = this.listErrorMessage.length
        if (hasError) {
          return
        }

        const payload = this.makePayloadData()
        if (this.hasChangedUniqValues(this.purchasePriceData, payload)) {
          const confirm = window.confirm(
            this.$t('msg_ConfirmExistRecordAddNew_0')
          )
          if (!confirm) return
          this.sendAddSalePriceRequest(payload)
          return
        }

        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        await this.sendAddOrUpdateSalePriceRequest(payload)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
        this.isNewSave = false
      }
    },

    validate() {
      this.listErrorMessage = []
      const updatedSalePriceData =
        this.$refs.purchasePriceForm.purchasePriceData || {}

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
        if (isEmptyValue(updatedSalePriceData[prop])) {
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
                text: this.$t('msg_NoInput_0'),
              })
              this.listErrorMessage.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${item.lineID} 
                - ${this.$t(`lbl_${requiredTableDetail[key]}_0`)}
                `,
                text: this.$t('msg_NoInput_0'),
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
        return false
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
      const updatedSalePriceData =
        this.$refs.purchasePriceForm.purchasePriceData || {}

      const payload = Object.assign(updatedSalePriceData, {
        maxMinRequest: this.availableDetails,
      })

      const convertDateFields = ['effectiveDate']
      for (const key of convertDateFields) {
        payload[key] = dateFormatYYYY(new Date(payload[key]))
      }

      return payload
    },

    async sendAddOrUpdateSalePriceRequest(payload) {
      const endPoint = this.isNewSave
        ? 'addPurchasePrice'
        : 'updatePurchasePrice'
      const response = await api(endPoint, payload)
      const errorCode = response?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(response?.data?.response?.data?.message))
        return
      }

      const validResponse = response.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        window.alert(this.$t('msg_IsSaved_0'))
        if (this.isNewSave) {
          return this.$router.push(this.localePath(`/purchase/po-price/add`))
        }

        await this.$fetch()
      }

      const error = response.data?.response?.data?.message
      const isRepeatedInfo = error === SERVER_ERROR_MESSAGE.ITEM_EXISTS
      if (isRepeatedInfo) {
        this.listErrorMessage.push({
          text: this.$t('msg_MainInfoRepeat_0'),
        })
      }
    },

    resetTableDetailData() {
      this.$refs.purchasePriceTableDetail.activeRow = -1
      this.$refs.purchasePriceTableDetail.resetSearchData()
    },

    resetPageData() {
      try {
        this.listErrorMessage = []
        this.resetTableDetailData()

        Promise.all([this.$refs.purchasePriceForm.resetData(), this.$fetch()])
      } catch (err) {
        console.error(err)
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

    hasChangedUniqValues(prev, curr) {
      const uniques = ['supplierId', 'itemId', 'effectiveDate']
      const prevValues = Object.values(pick(prev, uniques))
      const currValues = Object.values(pick(curr, uniques))
      const differences = difference(prevValues, currValues)
      return !!differences.length
    },

    async sendAddSalePriceRequest(payload) {
      try {
        const response = await api('addPurchasePrice', payload)
        const errorCode = response?.data?.response?.status
  
        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
  
        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          window.alert(this.$t('msg_IsSaved_0'))
          return this.$router.push(this.localePath(`/purchase/po-price/add`))
        }
  
        const error = response.data?.response?.data?.message
        const isRepeatedInfo = error === SERVER_ERROR_MESSAGE.ITEM_EXISTS
        if (isRepeatedInfo) {
          this.listErrorMessage.push({
            text: this.$t('msg_MainInfoRepeat_0'),
          })
        }
      } catch(err) {
        console.log(err);
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-purchase-price-page {
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
