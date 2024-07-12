<template>
  <div class="edit-purchase-invoice-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormDetailPurchaseInvoice
      ref="purchaseInvoiceForm"
      :data="purchaseInvoiceData"
    />
    <BaseTableItemDetail
      ref="salePriceFormTableItems"
      class="edit-purchase-invoice-table-details"
      :table-content="dataTable"
      :disable-input="isDisableInput"
      :table-type="'POInvoiceDetail'"
      :list-item-master="listItemCode"
      :column-hides="columnHides"
      :customer-id="purchaseInvoiceData.supplierID"
      :header-detail="tableHeaders"
      is-purchase
    ></BaseTableItemDetail>
    <BaseModalAttach
      ref="attachments"
      :data="dataBaseInfo"
      key-file-no="orderNO"
      module-name="PurchaseInvoice"
      @updateData="updateData"
      @deleteData="deleteData"
    ></BaseModalAttach>
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
import BaseModalImport from '@/components/Purchase/PurchaseInvoice/Modal/BaseModalImport'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import FormDetailPurchaseInvoice from '@/components/Purchase/PurchaseInvoice/Detail/FormDetailPurchaseInvoice'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import { formatNumberWithCommas } from '~/utils/utils'
export default {
  name: 'PageDetailPurchaseInvoice',
  components: {
    ToolBar,
    FormDetailPurchaseInvoice,
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
      lang: this.$i18n.locale,
      listItemCode: [],
      columnHides: [],
      purchaseInvoiceData: {},
      loading: false,
      listErrorMessage: [],
      dataBaseInfo: this.purchaseInvoiceData
        ? JSON.parse(JSON.stringify(this.purchaseInvoiceData))
        : {},
    }
  },

  async fetch() {
    try {
      this.loading = true
      await Promise.all([
        this.getListItemCode(),
        this.getScolumnHides(),
        this.getUnitOptions(this.lang),
        this.getData(),
        this.getItemTypeOptionsFromAPI(this.lang),
      ])

      this.initData()
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
    listToolBars() {
      return [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
          disabled: this.isDisableInput,
        },
        {
          key: 'import',
          label: this.$t('btn_btnImport_0'),
          icon: '/images/import.png',
          disabled: this.isDisableInput,
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
          disabled:
            !this.getActiveButtonToolBar.isDelete || this.isDisableInput,
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
          disabled: !this.getActiveButtonToolBar.isCheck || this.isDisableInput,
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
          disabled: !this.getActiveButtonToolBar.isCheck,
        },
        {
          key: 'attach',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
          disabled: !this.getActiveButtonToolBar.isAttachments,
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
      ]
    },
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
    initData() {
      this.dataBaseInfo = JSON.parse(JSON.stringify(this.purchaseInvoiceData))
    },
    async getData() {
      try {
        this.loading = true
        const query = this.$route.query

        const queryParams = {
          pInvoiceNO: query.orderNo,
          language: this.$i18n.locale,
        }

        const response = await api('getPurchaseInvoice', queryParams)

        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK

        if (validResponse) {
          this.dataTable = response.data?.pinvoiceDTL.map((item, index) =>
            Object.assign(item, { unitId: item.unitID, lineID: index + 1 })
          )
          this.purchaseInvoiceData = response.data || {}
          const formatNumberFields = [
            'totalAmount',
            'totalShare',
            'diff',
            'totalTariff',
            'totalOtherCost1',
            'totalOtherCost2',
            'totalOtherCost3',
            'totalOtherCost4',
            'totalOtherCost5',
          ]
          for (const key of formatNumberFields) {
            this.purchaseInvoiceData[key] =
              formatNumberWithCommas(response.data[key]) || 0
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleAction(key) {
      if (key === 'refresh') {
        return this.handleRefresh()
      }
      if (key === 'add') {
        return this.handleButtonAdd()
      }
      if (key === 'save') {
        return this.handleButtonSave()
      }
      if (key === 'delete') {
        return this.handleDelete()
      }
      if (key === 'attach') {
        return (this.$refs.attachments.showModal = true)
      }
      if (key === 'check') {
        return await this.handleCheck()
      }
      if (key === 'unCheck') {
        return await this.handleUnCheck()
      }
      if (key === 'setColumn') {
        return (this.$refs.baseSetColumnModal.showModal = true)
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
      if (key === 'back') {
        return this.$router.push(this.localePath({ path: '/purchase/invoice' }))
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    updateInvoiceDetails(data) {
      this.dataTable = this.dataTable
        .concat(data)
        .map((item, index) => ({ ...item, lineID: index + 1 }))
    },
    async handleCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      if (!confirm) {
        return
      }

      const payload = {
        orderNO: this.$route.query.orderNo,
      }
      const res = await api('checkPurchaseInvoice', payload)
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      const errorCode = res?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(res?.data?.response?.data?.message))
        return
      }
      if (validResponse) {
        window.alert(this.$t('msg_IsChecked_0'))
        await this.getData()
      }
    },
    async handleUnCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
      if (!confirm) {
        return
      }

      const payload = {
        orderNO: this.$route.query.orderNo,
      }
      const res = await api('unCheckPurchaseInvoice', payload)
      const errorCode = res?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(res?.data?.response?.data?.message))
        return
      }
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        window.alert(this.$t('msg_IsUnChecked_0'))
        await this.getData()
      }
    },
    async handleDelete() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
        if (!confirm) {
          return
        }

        const payload = {
          orderNo: this.$route.query.orderNo,
        }
        const res = await api('deletePurchaseInvoice', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }
        if (validResponse) {
          window.alert(this.$t('msg_IsDeleted_0'))
          this.$router.push(this.localePath({ path: '/purchase/invoice/add' }))
        }
      } catch (err) {
        console.error(err)
      }
    },
    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/purchase/invoice/add' }))
      }
    },
    async handleButtonSave() {
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

        await this.sendUpdateRequest(payload)
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
      const finalData = this.$refs.purchaseInvoiceForm.purchaseInvoiceData

      const formatNumberFields = [
        'totalAmount',
        'totalShare',
        'diff',
        'totalTariff',
        'totalOtherCost1',
        'totalOtherCost2',
        'totalOtherCost3',
        'totalOtherCost4',
        'totalOtherCost5',
      ]
      for (const key of formatNumberFields) {
        finalData[key] = this.parseStringToFloat(finalData[key]) || 0
      }

      const payloadDetails = []
      this.dataTable.forEach((detail, index) =>
        payloadDetails.push(
          Object.assign({}, finalData, detail, {
            arrivalLineID: detail.arrivalLineID || detail.receiptLineID,
            lineID: index + 1,
            price: this.parseStringToFloat(detail.price),
          })
        )
      )

      if (payloadDetails.length === 0) {
        payloadDetails.push(Object.assign({}, finalData))
      }

      return payloadDetails
    },
    async sendUpdateRequest(payload) {
      const response = await api('updatePurchaseInvoice', payload)
      const errorCode = response?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(response?.data?.response?.data?.message))
        return
      }

      const validResponse = response.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        window.alert(this.$t('msg_IsSaved_0'))
        await this.$fetch()
      }
    },
    resetTableDetailData() {
      this.$refs.salePriceFormTableItems.activeRow = -1
      this.$refs.salePriceFormTableItems.resetSearchData()
    },
    async handleRefresh() {
      try {
        this.loading = true
        this.resetTableDetailData()
        await Promise.all([
          this.$fetch(),
          this.$refs.purchaseInvoiceForm.resetFormData(),
        ])
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    updateData(data) {
      this.dataBaseInfo.attachments?.push(data)
      this.purchaseInvoiceData.attachments?.push(data)
    },
    deleteData(id) {
      this.dataBaseInfo.attachments = this.dataBaseInfo.attachments?.filter(
        (item) => item.id !== id
      )
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-purchase-invoice-page {
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
