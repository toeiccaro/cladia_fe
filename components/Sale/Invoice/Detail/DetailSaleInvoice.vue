<template>
  <div class="edit-sale-invoice-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <FormDetailSaleInvoice
      ref="formDetailInvoice"
      :data-invoice="dataInvoice"
      :list-details="dataTable"
      @changeTable="changeDataDetailTable"
      @update-data="(data) => (updatedInvoiceData = data)"
      @update-warehouse="updateWarehouse"
    ></FormDetailSaleInvoice>
    <BaseTableItemDetail
      ref="formDetailInvoice"
      class="edit-sale-invoice-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'saleInvoice'"
      :customer-id="updatedInvoiceData.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      @changeTable="changeDataDetailTable"
    ></BaseTableItemDetail>
    <BaseModalAttach
      ref="attachments"
      :data="dataInvoice"
      key-file-no="invoiceNo"
      module-name="SOInvoice"
      @updateData="updateData"
      @deleteData="deleteData"
    ></BaseModalAttach>
    <BaseModalImport
      ref="modalImport"
      :invoice-data="updatedInvoiceData"
      :list-error-message="importErrorMessage"
      @close-modal="$refs.modalImport.showModal = false"
      @update-invoice-details="(data) => updateInvoiceDetails(data)"
    ></BaseModalImport>
    <BaseModalPackingList
      ref="modalPackingList"
      :invoice-data="updatedInvoiceData"
      @closeModalPackingList="getData"
    />
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
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE } from '@/constants'
import systemMixins from '@/mixins/system'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseModalImport from '@/components/Sale/Invoice/Modal/BaseModalImport'
import BaseModalPackingList from '@/components/Sale/Invoice/Modal/BaseModalPackingList'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import {
  downloadFileExcel,
  searchDetails,
  getUnique,
  formatNumberWithCommas,
} from '@/utils/utils'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import FormDetailSaleInvoice from '@/components/Sale/Invoice/Detail/FormDetailSaleInvoice.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'

export default {
  name: 'DetailSaleInvoice',
  components: {
    ToolBar,
    FormDetailSaleInvoice,
    BaseModalAttach,
    BaseTableItemDetail,
    BaseModalImport,
    BaseModalPackingList,
    BaseValidateMessage,
    BaseSetColumnDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      dataInvoice: {},
      loading: false,
      dataTable: [],
      listItemCode: [],
      listErrorMessage: [],
      updatedInvoiceData: {},
      lang: this.$i18n.locale,
      importErrorMessage: [],
      columnHides: [],
    }
  },

  async fetch() {
    this.loading = true
    try {
      await Promise.all([
        this.getData(),
        this.getListItemMaster(),
        this.getWarehouseOptions(this.lang),
        this.getUnitOptions(this.lang),
        this.getScolumnHides(),
        this.getItemTypeOptionsFromAPI(),
      ])
    } catch (err) {
      console.log(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
      warehouseOptions: 'getWarehouseOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    isEnabledBarcode() {
      return this.dataInvoice.barcodeEnable
    },

    isCheck() {
      return !!(this.dataInvoice?.checker && this.dataInvoice.checkDate)
    },

    listToolBars() {
      return [
        {
          key: 'addNew',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
          disabled: this.isCheck,
        },
        {
          key: 'import',
          label: this.$t('btn_btnImport_0'),
          icon: '/images/import.png',
          disabled: this.isCheck,
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
          disabled: !this.getActiveButtonToolBar?.isDelete || this.isCheck,
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
          disabled:
            !this.getActiveButtonToolBar?.isCheck ||
            this.isCheck ||
            this.isEnabledBarcode,
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
          disabled: !this.getActiveButtonToolBar?.isCheck || !this.isCheck,
        },
        {
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
          disabled: !this.getActiveButtonToolBar.isPrint,
        },
        {
          key: 'packaging',
          label: this.$t('btn_btnPackList_0'),
          icon: '/images/pack.png',
        },
        {
          key: 'attach',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
          disabled: !this.getActiveButtonToolBar.isAttachments,
        },
        {
          key: 'setQuotation',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'backEdit',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },
        {
          key: 'closeEdit',
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
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          filter: '',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'customerPO',
          name: this.$t('lbl_CustomerPO_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'itemTypeID',
          name: this.$t('lbl_ItemType_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          typeInput: 'select',
          disabled: true,
          fieldRequired: true,
          hidden: false,
          options: this.itemTypeOptions,
        },
        {
          key: 'itemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: 250,
          align: 'left',
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
          disabled: true,
          fieldRequired: false,
          hidden: false,
          options: this.unitOptions,
        },
        {
          key: 'quantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          fieldRequired: true,
          disabled: this.isCheck,
          hidden: false,
        },
        {
          key: 'price',
          name: this.$t('lbl_Price_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'discountRate',
          name: this.$t('lbl_SIDiscountRate_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'priceIncludeDiscount',
          name: this.$t('lbl_SIPriceIncludeDiscount_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'priceIncludeTax',
          name: this.$t('lbl_SIPriceIncludeTax_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'amount',
          name: this.$t('lbl_Amount_0'),
          filter: 'number',
          width: 100,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'amountIncludeTax',
          name: this.$t('lbl_SIAmountIncludeTax_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'warehouseID',
          name: this.$t('lbl_Warehouse_0'),
          filter: 'select',
          width: 250,
          align: 'left',
          disabled: this.isCheck,
          options: this.warehouseOptions,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'sono',
          name: this.$t('lbl_SONO_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'memoDTL',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },

    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },

    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
    },
  },
  watch: {
    dataTable: {
      deep: true,
      handler(data) {
        this.filterDetails()
      },
    },
  },

  methods: {
    ...mapActions('base', [
      'getWarehouseOptions',
      'getUnitOptions',
      'getItemTypeOptionsFromAPI',
    ]),
    ...mapMutations({
      UPDATE_PAYLOAD_SALE_INVOICE_IMPORT:
        'filterSort/UPDATE_PAYLOAD_SALE_INVOICE_IMPORT',
    }),

    updateWarehouse(warehouseId) {
      this.dataTable = this.dataTable.map((item) =>
        Object.assign({}, item, {
          warehouseID: warehouseId,
        })
      )
    },
    async getScolumnHides() {
      try {
        this.loading = true

        const response = await api('getScolumnHides', {
          gridName: 'SaleInvoiceDetail',
        })
        if (response.status === 200) {
          this.columnHides = response?.data || []
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    filterDetails(filterData = {}) {
      this.dataTable = searchDetails({
        data: this.dataTable,
        filterData,
      })
    },

    updateInvoiceDetails(data) {
      this.importErrorMessage = []
      const clonedListCustomers = Array.from(data)

      const existingCurrencyIds = clonedListCustomers.map(
        (item) => item.currencyID
      )
      const existingPaymentIds = clonedListCustomers.map(
        (item) => item.paymentID
      )
      const isUniqueExistingCurrencyId =
        new Set(existingCurrencyIds).size === 1 &&
        existingCurrencyIds[0] === this.dataInvoice?.currencyId
      const isUniqueExistingPaymentId =
        new Set(existingPaymentIds).size === 1 &&
        existingPaymentIds[0] === this.dataInvoice?.paymentId

      const canMerge =
        (isUniqueExistingCurrencyId && isUniqueExistingPaymentId) ||
        this.availableListDetails.length > 0

      if (canMerge) {
        const finalData = data.map((item) =>
          Object.assign({}, item, { unit: item.unitID })
        )

        this.dataTable = this.availableListDetails
          .concat(finalData)
          .map((item, index) => ({ ...item, lineID: index + 1 }))

        const existingItem = this.availableListDetails[0]

        this.dataInvoice = Object.assign({}, this.dataInvoice, {
          currencyId: existingItem.currencyID,
          paymentId: existingItem.paymentID,
        })

        return (this.$refs.modalImport.showModal = false)
      }

      this.importErrorMessage.push({
        text: this.$t('msg_CurrencyIsNotSame_0'),
      })
    },

    updateDetails(data) {
      this.dataTable = data
    },

    async getListItemMaster() {
      const res = await api('getItemCode')
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.listItemCode = res?.data
      }
    },
    handleAction(key) {
      if (key === 'unCheck') {
        return this.handleUnCheck()
      }

      if (key === 'check') {
        return this.handleCheck()
      }
      if (key === 'import') {
        return this.handleImport()
      }

      if (key === 'packaging') {
        return (this.$refs.modalPackingList.showModal = true)
      }
      if (key === 'attach') {
        return (this.$refs.attachments.showModal = true)
      }
      if (key === 'refresh') {
        return location.reload()
      }
      if (key === 'addNew') {
        return this.handleAddNew()
      }
      if (key === 'save') {
        return this.save()
      }
      if (key === 'delete') {
        return this.handleDelete()
      }
      if (key === 'add') {
        return this.handleAdd()
      }
      if (key === 'newItem') {
        return this.$refs.newItemMaster.openModal()
      }
      if (key === 'print') {
        return this.handlePrint()
      }
      if (key === 'setQuotation') {
        return (this.$refs.baseSetColumnModal.showModal = true)
      }

      if (key === 'closeEdit') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'backEdit') {
        return this.$router.push(this.localePath({ path: '/sales/invoice' }))
      }
    },

    async handleUnCheck() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
        if (!confirm) {
          return
        }

        this.loading = true
        const res = await api('uncheckInvoice', {
          invoiceNo: this.$route.query?.invoiceNo,
        })

        const errorCode = res?.data?.response?.status
        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          return await this.getData()
        }

        const errorMessage = res.data?.response?.data?.message
        const isInUsed = res && errorMessage === SERVER_ERROR_MESSAGE.IS_IN_USED
        if (isInUsed) {
          window.alert(this.$t(errorMessage))
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleCheck() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
        if (!confirm) {
          return
        }

        this.loading = true
        const res = await api('checkInvoice', {
          invoiceNo: this.$route.query?.invoiceNo,
        })

        const errorCode = res?.data?.response?.status
        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          await this.getData()
          window.confirm(this.$t('msg_IsChecked_0'))
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    handleImport() {
      const customerID = this.updatedInvoiceData?.customerId
      if (customerID) {
        this.UPDATE_PAYLOAD_SALE_INVOICE_IMPORT({
          customerID,
        })

        this.importErrorMessage = []
        return (this.$refs.modalImport.showModal = true)
      }

      window.alert(this.$t('msg_NoselectCustomer_0'))
    },

    async handleDelete() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
        if (!confirm) {
          return
        }

        this.loading = true
        const res = await api('deleteInvoice', {
          invoiceNo: this.$route.query?.invoiceNo,
        })

        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          await this.getData()
          window.alert(this.$t('msg_IsDeleted_0'))
          this.$router.push(this.localePath({ path: '/sales/invoice/add' }))
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    handleAddNew() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (!confirm) {
        return
      }

      this.$router.push(this.localePath({ path: '/sales/invoice/add' }))
    },

    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (!confirm) {
        return
      }

      this.$router.push(this.localePath({ path: '/sales/invoice/add' }))
    },

    validateData() {
      const listError = []
      const requiredFields = {
        currencyId: 'Currency',
        customerId: 'CustomerName',
        paymentId: 'PaymentID',
        payDate: 'APDate',
        receiveDate: 'ReceiveDate',
        orderDate: 'OrderDate',
      }
      const requiredDetailsFields = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        price: 'Price',
        warehouseID: 'Warehouse',
      }

      for (const key in requiredFields) {
        if (!this.dataInvoice[key]) {
          listError.push({
            fieldName: this.$t(`lbl_${requiredFields[key]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      const currentListDetails = this.dataTable.filter(
        (item) => item && !item.isNewLine
      )

      if (currentListDetails.length === 0) {
        listError.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        currentListDetails.forEach((item) => {
          for (const key in requiredDetailsFields) {
            if (
              (['quantity', 'price'].includes(key) &&
                !this.parseStringToFloat(item[key])) ||
              !item[key]
            ) {
              listError.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_${requiredDetailsFields[key]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
              })
            }
          }
        })
      }
      this.listErrorMessage = getUnique(listError, 'fieldName')

      if (this.listErrorMessage.length === 0) {
        return currentListDetails
      }
    },
    // eslint-disable-next-line require-await
    async save() {
      // try {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      const currentListDetails = this.validateData()
      if (currentListDetails) {
        try {
          this.loading = true
          const params = {
            currencyId: this.dataInvoice.currencyId,
            customerId: this.dataInvoice.customerId,
            deliveryAddress: this.dataInvoice.deliveryAddress,
            invoiceCode: this.dataInvoice.invoiceCode,
            invoiceNo: this.dataInvoice.invoiceNo,
            memo: this.dataInvoice.memo,
            orderDate: this.convertDate(this.dataInvoice.orderDate),
            payDate: this.convertDate(this.dataInvoice.payDate),
            paymentId: this.dataInvoice.paymentId,
            receiveDate: this.convertDate(this.dataInvoice.receiveDate),
            responsibleMan: this.dataInvoice.responsibleMan,
            tradeTerm: this.dataInvoice.tradeTerm,
            warehouseId: this.dataInvoice.warehouseId,
            salesInDtl: currentListDetails.map((item) => {
              return {
                customerPO: item.customerPO,
                itemCode: item.itemCode,
                itemId:
                  item.itemID ??
                  this.listItemCode.find((_el) => _el.key === item.itemCode)
                    ?.itemId,
                lineId: item.lineID,
                memoDTL: item.memoDTL,
                price: this.parseStringToFloat(item.price),
                productName: item.itemName,
                quantity: this.parseStringToFloat(item.quantity),
                soLineId: item?.sonoLineId ?? item?.solineID,
                sono: item.sono,
                unitId: item.unitID,
                warehouseId: item.warehouseID,
              }
            }),
          }

          const response = await api('updateInvoice', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.getData()
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.loading = false
        }
      }
    },
    async handlePrint() {
      const confirm = window.confirm(this.$t('msg_ConfirmPrint_0'))
      if (!confirm) {
        return
      }

      if (!this.dataInvoice?.invoiceNo) {
        return location.reload()
      }

      this.loading = true
      const params = `invoiceNo=${this.dataInvoice.invoiceNo}&lang=${this.$i18n.locale}`
      const response = await api('printInvoice', params)
      downloadFileExcel(response.data, 'xls')
      this.loading = false
    },
    async getData() {
      try {
        this.loading = true

        const res = await api('getInvoiceDetails', {
          invoiceNo: this.$route.query?.invoiceNo,
        })

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataInvoice = res.data || {}

        this.dataTable = res.data?.detailResponse.map((item, index) => ({
          ...item,
          lineID: index + 1,
        }))

        const convertDateFields = [
          'invoiceDate',
          'deliveryDate',
          'receiveDate',
          'editDate',
          'checkDate',
          'payDate',
        ]

        for (const key of convertDateFields) {
          this.dataInvoice[key] = this.convertDate(this.dataInvoice[key])
        }
        this.dataInvoice.totalRtAmount = formatNumberWithCommas(
          this.dataInvoice.totalRtAmount
        )
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    updateData(data) {
      this.dataInvoice.attachments?.push(data)
    },

    deleteData(id) {
      this.dataInvoice.attachments = this.dataInvoice.attachments?.filter(
        (item) => item.id !== id
      )
    },

    changeDataDetailTable(value) {
      this.dataTable = value
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-sale-invoice-page {
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
