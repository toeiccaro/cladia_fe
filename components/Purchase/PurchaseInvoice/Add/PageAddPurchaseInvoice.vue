<template>
  <div class="add-purchase-invoice-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormAddPurchaseInvoice
      ref="purchaseInvoiceForm"
      :get-currency="currencyID"
      @update-purchase-invoice-data="(data) => (purchaseInvoiceData = data)"
    />
    <BaseTableItemDetail
      ref="salePriceFormTableItems"
      class="add-purchase-invoice-table-details"
      :table-content="dataTable"
      :disable-input="isDisableInput"
      :table-type="'POInvoiceDetail'"
      :list-item-master="listItemCode"
      :column-hides="columnHides"
      :customer-id="purchaseInvoiceData.supplierID"
      :header-detail="tableHeaders"
      is-purchase
      @changeTable="changeDataDetailTable"
    ></BaseTableItemDetail>
    <BaseModalAttach ref="attachments" add></BaseModalAttach>
    <BaseModalImport
      ref="modalImport"
      :purchase-invoice-data="purchaseInvoiceData"
      :detail-data="dataTable"
      @close-modal="$refs.modalImport.showModal = false"
      @update-purchase-invoice-details="(data) => updateInvoiceDetails(data)"
    ></BaseModalImport>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    ></base-set-column-detail>
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import systemMixins from '@/mixins/system'
import dateTimeMixins from '@/mixins/dateTime'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar'
import BaseModalAttach from '@/components/UI/BaseModalAttach'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import FormAddPurchaseInvoice from '@/components/Purchase/PurchaseInvoice/Add/FormAddPurchaseInvoice'
import BaseModalImport from '@/components/Purchase/PurchaseInvoice/Modal/BaseModalImport'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'

export default {
  name: 'PageAddPurchaseInvoice',
  components: {
    ToolBar,
    FormAddPurchaseInvoice,
    BaseModalAttach,
    BaseValidateMessage,
    BaseModalImport,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
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
          key: 'import',
          label: this.$t('btn_btnImport_0'),
          icon: '/images/import.png',
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
        },
        {
          key: 'share',
          label: this.$t('btn_btnShareCompute_0'),
          icon: '/images/mode.png',
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'check',
          label: this.$t('btn_btnCheck_0'),
          icon: '/images/check.png',
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
        },
        {
          key: 'attach',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
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
      purchaseInvoiceData: {},
      listItemCode: [],
      columnHides: [],
      lang: this.$i18n.locale,
      currencyID: null,
    }
  },

  async fetch() {
    try {
      this.loading = true
      await Promise.all([
        this.getListItemCode(),
        this.getScolumnHides(),
        this.getUnitOptions(this.lang),
        this.getItemTypeOptionsFromAPI(this.lang),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      itemTypeOptions: 'getItemTypeOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          typeInput: 'checkbox',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          typeInput: '',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
          align: 'left',
          typeInput: 'autocomplete',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'itemTypeID',
          name: this.$t('lbl_ItemType_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          typeInput: 'select',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
          options: this.formattedListItemTypes,
        },
        {
          key: 'itemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: 250,
          align: 'left',
          typeInput: 'input',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'description',
          name: this.$t('lbl_Description_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          typeInput: 'input',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'unitID',
          name: this.$t('lbl_Unit_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          typeInput: 'select',
          disabled: true,
          fieldRequired: false,
          hidden: false,
          options: this.unitOptions,
        },
        {
          key: 'weight',
          name: this.$t('lbl_Weight_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'quantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'price',
          name: this.$t('lbl_Price_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'amount',
          name: this.$t('lbl_Amount_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'noTaxAmount',
          name: this.$t('lbl_NoTaxAmount_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'taxRate',
          name: this.$t('lbl_TaxRate_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'tariffShare',
          name: this.$t('lbl_Tariff_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'otherCost',
          name: this.$t('lbl_OtherCost_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'receiptNO',
          name: this.$t('lbl_ReceiptNo_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          typeInput: 'input',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'pono',
          name: this.$t('lbl_PONO_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          typeInput: 'input',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'deliveryNO',
          name: this.$t('lbl_DeliveryNO_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          typeInput: 'input',
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },
    isDisableInput() {
      return !!(
        this.purchaseInvoiceData?.checkUser &&
        this.purchaseInvoiceData.checkDate
      )
    },
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'delete':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          case 'attach':
            item.disabled = !this.getActiveButtonToolBar?.isAttachments
            break
          case 'check':
            item.disabled = !this.getActiveButtonToolBar?.isCheck
            break
          case 'unCheck':
            item.disabled = !this.getActiveButtonToolBar?.isCheck
            break
          default:
            break
        }
        return item
      })
    },
    formattedListItemTypes() {
      return this.itemTypeOptions.map((item) => ({
        text: this.$t(item.text),
        value: item.value,
      }))
    },
  },

  methods: {
    ...mapActions('base', ['getUnitOptions', 'getItemTypeOptionsFromAPI']),
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_INVOICE_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_INVOICE_IMPORT',
    }),

    async getScolumnHides() {
      const response = await api('getPurchaseScolumns', {
        gridName: 'POInvoiceDetail',
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
      if (key === 'refresh') {
        return this.handleRefresh()
      }
      if (key === 'attach') {
        return (this.$refs.attachments.showModal = true)
      }
      if (key === 'add') {
        return this.handleButtonAdd()
      }
      if (key === 'import') {
        const supplierId =
          this.$refs.purchaseInvoiceForm?.purchaseInvoiceData?.supplierID

        if (!supplierId) {
          return window.alert(this.$t('msg_NoselectSupplier_0'))
        }

        this.UPDATE_PAYLOAD_PURCHASE_INVOICE_IMPORT({
          supplierId,
        })

        return (this.$refs.modalImport.showModal = true)
      }
      if (key === 'save') {
        return this.handleSave()
      }
      if (key === 'delete') {
        return this.handleButtonDelete()
      }
      if (key === 'priceAnalysis') {
        return (this.$refs.priceAnalysisModal.showModal = true)
      }
      if (key === 'back') {
        return this.$router.push(this.localePath({ path: '/purchase/invoice' }))
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'setColumn') {
        return (this.$refs.baseSetColumnModal.showModal = true)
      }
    },
    updateInvoiceDetails(data) {
      this.dataTable = this.dataTable
        .concat(data)
        .map((item, index) => ({ ...item, lineID: index + 1 }))
      const existingItem = this.dataTable[0]
      this.currencyID = existingItem.currencyID
    },
    handleButtonDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        window.alert(this.$t('msg_IsDeleted_0'))
        location.reload()
      }
    },
    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
    },
    async handleSave() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.validate()

        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        this.loading = true

        const payload = this.makePayloadData()
        await this.sendAddRequest(payload)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    validate() {
      this.listErrorMessage = []

      const requiredFields = {
        orderDate: 'OrderDate',
        supplierID: 'SupplierName',
        paymentID: 'PaymentID',
        currencyID: 'Currency',
        dueDate: 'DueDate',
      }
      for (const prop in requiredFields) {
        if (!this.purchaseInvoiceData[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      const isEmptyDetails = this.dataTable.length === 0
      if (isEmptyDetails) {
        this.listErrorMessage.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      }
    },
    makePayloadData() {
      const payloadDetails = []
      this.dataTable.forEach((item, index) => {
        payloadDetails.push(
          Object.assign({}, this.purchaseInvoiceData, item, {
            memo: this.purchaseInvoiceData.memo,
            currencyID: this.purchaseInvoiceData.currencyID,
            invoiceCode: this.purchaseInvoiceData.invoiceCode || '',
            lineID: index + 1,
            price: this.parseStringToFloat(item.price),
          })
        )
      })

      const payload = {
        payloadDetails,
        supplierId: this.purchaseInvoiceData.supplierID,
      }

      return payload
    },
    async sendAddRequest(payload) {
      const response = await api('addPurchaseInvoice', payload)
      const errorCode = response?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(response?.data?.response?.data?.message))
        return
      }

      const validResponse = response.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        window.alert(this.$t('msg_IsSaved_0'))
        this.$router.push(
          this.localePath({
            path: `/purchase/invoice/detail?orderNo=${response.data[0]?.orderNO}`,
          })
        )
      }
    },
    resetTableDetailData() {
      this.dataTable = []
      this.$refs.salePriceFormTableItems.activeRow = -1
      this.$refs.salePriceFormTableItems.resetSearchData()
    },
    async handleRefresh() {
      try {
        this.loading = true
        this.resetTableDetailData()
        this.$refs.purchaseInvoiceForm.resetFormData()
        await this.$fetch()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    changeDataDetailTable(data) {
      this.dataTable = data
    },
  },
}
</script>
<style lang="scss" scoped>
.add-purchase-invoice-page {
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
