<template>
  <div class="edit-sale-price-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <DetailSalePriceForm
      ref="editSalePriceForm"
      :key="refreshFormKey"
      :data="salePriceData"
    />
    <base-table-item-detail
      ref="salePriceFormTableItems"
      :table-content="listDetailTable"
      :table-type="'salePrice'"
      :column-hides="columnHides"
      :header-detail="tableHeaders"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    />
    <ModalPriceAnalysis ref="priceAnalysisModal" add></ModalPriceAnalysis>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
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
import { dateFormatYYYY, isEmptyValue } from '@/utils/utils'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE } from '@/constants'
import systemMixins from '@/mixins/system'
import dateTimeMixins from '@/mixins/dateTime'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar'
import ModalPriceAnalysis from '@/components/Sale/SalePrice/Modal/ModalPriceAnalysis'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import DetailSalePriceForm from '@/components/Sale/SalePrice/Detail/DetailSalePriceForm'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'

export default {
  name: 'SalePriceDetail',
  components: {
    ToolBar,
    DetailSalePriceForm,
    ModalPriceAnalysis,
    BaseValidateMessage,
    BaseTableItemDetail,
    BaseSetColumnDetail,
  },
  mixins: [systemMixins, dateTimeMixins],
  data() {
    return {
      modalAddNewItem: false,
      refreshFormKey: 0,
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
          key: 'setQuotation',
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
      salePriceData: {},
      oldSalePriceData: {},
      isNewSave: false,
      listDetailTable: [],
      columnHides: [],
      newLine: {
        minQuantity: '',
        maxQuantity: '',
        price: '',
        isNewLine: true,
        isUpdate: true,
      },
    }
  },

  async fetch() {
    try {
      this.loading = true

      await Promise.all([this.getOrderDetail(), this.getScolumnHides()])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),

    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'center',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          filter: '',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'minQuantity',
          name: this.$t('lbl_MinQuantity_0'),
          filter: 'number',
          width: 200,
          align: 'left',
          disabled: false,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'maxQuantity',
          name: this.$t('lbl_MaxQuantity_0'),
          filter: 'number',
          width: 200,
          align: 'left',
          disabled: false,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'price',
          name: this.$t('lbl_Price_0'),
          filter: 'number',
          width: 200,
          align: 'left',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },

    listDetailTableFilter() {
      const result = []
      this.listDetailTable.forEach((item) => {
        if (item && !item.isNewLine) {
          result.push({
            minQuantity: this.parseStringToFloat(item.minQuantity),
            maxQuantity: this.parseStringToFloat(item.maxQuantity),
            price: this.parseStringToFloat(item.price),
            parentIDUsingDeteteDTLAndEditOnly:
              item.parentIDUsingDeteteDTLAndEditOnly,
          })
        }
      })

      return result
    },
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'delete') {
          item.disabled = !this.getActiveButtonToolBar?.isDelete
        }
        return item
      })
    },
  },

  methods: {
    closeModal() {
      this.modalAddNewItem = false
    },
    handleAction(key) {
      switch (key) {
        case 'refresh':
          this.handleRefresh()
          break

        case 'add':
          this.handleAdd()
          break

        case 'save':
          this.handleSave()
          break

        case 'newSave':
          this.isNewSave = true
          this.handleSave()
          break

        case 'delete':
          this.handleDelete()
          break

        case 'priceAnalysis':
          this.$refs.priceAnalysisModal.showModal = true
          break

        case 'setQuotation':
          this.$refs.baseSetColumnModal.showModal = true
          break

        case 'back':
          this.$router.push(this.localePath({ path: '/sales/sales-price' }))
          break

        case 'close':
          this.$router.push(this.localePath({ path: '/' }))
          break

        default:
          break
      }
    },
    handleRefresh() {
      this.resetPageData()
    },
    async handleDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        const payload = {
          customerID: this.oldSalePriceData?.customerId,
          effectiveDate: this.convertDate(this.oldSalePriceData?.effectiveDate),
          itemID: this.oldSalePriceData?.itemId,
        }
        const response = await api('deleteSalePrice', payload)
        const errorCode = response?.data?.response?.status
        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        window.alert(this.$t('msg_IsDeleted_0'))
        this.$router.push(this.localePath({ path: '/sales/sales-price/add' }))
      }
    },
    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/sales/sales-price/add' }))
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

        const payload = this.isNewSave
          ? this.makePayloadAddData()
          : this.makePayloadUpdateData()

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
        this.$refs.editSalePriceForm.salePriceData || {}

      const requiredFields = {
        customerId: 'CustomerName',
        itemId: 'ItemCode',
        effectiveDate: 'EffectiveDate',
        currencyId: 'Currency',
        unitId: 'Unit',
      }

      for (const prop in requiredFields) {
        if (isEmptyValue(updatedSalePriceData[prop])) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      const isEmptyDetails = this.listDetailTableFilter.length === 0
      if (isEmptyDetails) {
        this.listErrorMessage.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      }

      const sectionErrors = this.listDetailTableFilter.map((item, index) => {
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

      this.listDetailTableFilter.forEach((item, index) => {
        const duplicateItem = this.listDetailTableFilter.find(
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
              (itemIncludesDetailItem ||
                interferometry ||
                itemIsInRangeOfDetailItem) &&
              excludeCurrentLoopingItem

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
    },

    makePayloadUpdateData() {
      const dataOldUsingUpdateOnly = Object.assign({}, this.oldSalePriceData)
      const updatedSalePriceData =
        this.$refs.editSalePriceForm.salePriceData || {}

      const payload = Object.assign(updatedSalePriceData, {
        soPriceDTLS: this.listDetailTableFilter,
        dataOldUsingUpdateOnly: {
          customerID: dataOldUsingUpdateOnly.customerId,
          effectiveDate: dataOldUsingUpdateOnly.effectiveDate,
          itemID: dataOldUsingUpdateOnly.itemId,
        },
      })

      const convertDateFields = ['effectiveDate']
      for (const key of convertDateFields) {
        payload[key] = dateFormatYYYY(new Date(payload[key]))

        payload.dataOldUsingUpdateOnly[key] = dateFormatYYYY(
          new Date(payload.dataOldUsingUpdateOnly[key])
        )
      }

      return payload
    },

    makePayloadAddData() {
      const updatedSalePriceData =
        this.$refs.editSalePriceForm.salePriceData || {}

      const payload = Object.assign(updatedSalePriceData, {
        soPriceDTLS: this.listDetailTableFilter,
      })

      const convertDateFields = ['effectiveDate']
      for (const key of convertDateFields) {
        payload[key] = dateFormatYYYY(new Date(payload[key]))
      }

      return payload
    },

    async sendAddOrUpdateSalePriceRequest(payload) {
      const endPoint = this.isNewSave ? 'addSalePrice' : 'updateSalePriceDetail'
      try {
        this.loading = true
        const response = await api(endPoint, payload)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }

        if (response.status === 200) {
          window.alert(this.$t('msg_IsSaved_0'))
          if (this.isNewSave) {
            return this.$router.push(this.localePath(`/sales/sales-price/add`))
          }
          this.getOrderDetail()
        } else {
          const errorMessage = response.data?.response?.data?.message
          const isRepeatedInfo =
            errorMessage === SERVER_ERROR_MESSAGE.MAIN_INFO_REPEATED
          if (isRepeatedInfo) {
            this.listErrorMessage.push({
              text: this.$t('msg_MainInfoRepeat_0'),
            })
          }
        }
      } catch (error) {
        this.listErrorMessage.push({
          text: this.$t('msg_MainInfoRepeat_0'),
        })
      } finally {
        this.loading = false
      }
    },

    resetTableDetailData() {
      this.$refs.salePriceFormTableItems.resetSearchData()
      this.$refs.salePriceFormTableItems.activeRow = -1
    },

    refreshFormData() {
      ++this.refreshFormKey
    },

    async resetPageData() {
      try {
        this.loading = true
        this.resetTableDetailData()
        await Promise.all([
          this.$refs.editSalePriceForm.$fetch(),
          this.$fetch(),
        ])
        this.refreshFormData()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    changeDataDetailTable(data) {
      this.listDetailTable = data
    },

    async getOrderDetail() {
      try {
        const queryParams = this.$route.query

        const response = await api('getSalePrice', queryParams)

        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.listDetailTable = response.data?.soPriceDTLS.map(
            (item, index) => {
              return {
                isUpdate: false,
                minQuantity: item.minQuantity,
                maxQuantity: item.maxQuantity,
                parentIDUsingDeteteDTLAndEditOnly:
                  item.parentIDUsingDeteteDTLAndEditOnly,
                price: item.price,
                lineID: index + 1,
              }
            }
          )
          this.listDetailTable.push({
            ...this.newLine,
            lineID: this.listDetailTable.length + 1,
          })
          this.salePriceData = response.data || {}
          this.oldSalePriceData = response.data || {}
        }
      } catch (err) {
        console.error(err)
      }
    },

    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'SalePriceDetail',
      })
      if (response.status === 200) {
        this.columnHides = response?.data || []
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-sale-price-page {
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
