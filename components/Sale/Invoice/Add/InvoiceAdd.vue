<template>
  <div class="add-sale-invoice-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <InvoiceForm
      ref="invoiceForm"
      :key="refreshFormAddInvoiceKey"
      :selected-details="availableListDetails"
      @update-data="(data) => (newInvoiceData = data)"
      @update-warehouse="updateWarehouse"
    />
    <base-table-item-detail
      ref="invoiceFormTableItems"
      class="add-sale-invoice-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'saleInvoice'"
      :customer-id="newInvoiceData.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      @changeTable="changeDataDetailTable"
    />
    <BaseModalAttach ref="attachments" add></BaseModalAttach>
    <BaseModalImport
      ref="modalImport"
      :invoice-data="newInvoiceData"
      :list-error-message="importErrorMessage"
      @update-invoice-details="(data) => updateInvoiceDetails(data)"
    ></BaseModalImport>
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
import { SERVER_RESPONSE_CODE } from '@/constants'
import systemMixins from '@/mixins/system'
import { downloadFileExcel, searchDetails, getUnique } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar'
import BaseModalAttach from '@/components/UI/BaseModalAttach'
import BaseModalImport from '@/components/Sale/Invoice/Modal/BaseModalImport'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import InvoiceForm from '@/components/Sale/Invoice/Add/InvoiceForm'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'

export default {
  name: 'InvoiceAdd',
  components: {
    ToolBar,
    InvoiceForm,
    BaseModalAttach,
    BaseModalImport,
    BaseValidateMessage,
    BaseTableItemDetail,
    BaseSetColumnDetail,
  },
  mixins: [systemMixins],
  data() {
    return {
      listItemMaster: [],
      dataTable: [],
      modalAddNewItem: false,
      refreshFormAddInvoiceKey: 0,
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
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
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
      importErrorMessage: [],
      newInvoiceData: {},
      lang: this.$i18n.locale,
      listItemCode: [],
      columnHides: [],
    }
  },

  fetch() {
    Promise.all([
      this.getListItemCode(),
      this.getItemTypeOptionsFromAPI(),
      this.getWarehouseOptions(this.lang),
      this.getUnitOptions(this.lang),
      this.getScolumnHides(),
    ])
  },

  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
      warehouseOptions: 'getWarehouseOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },
    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
    },

    isCheck() {
      return !!(this.newInvoiceData?.checker && this.newInvoiceData.checkDate)
    },

    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          filter: '',
          disabled: this.isCheck,
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
          disabled: this.isCheck,
          fieldRequired: true,
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
          key: 'amount',
          name: this.$t('lbl_Amount_0'),
          filter: 'number',
          width: 150,
          align: 'right',
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
          options: this.warehouseOptions,
          disabled: this.isCheck,
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
          case 'print':
            item.disabled = !this.getActiveButtonToolBar?.isPrint
            break
          default:
            break
        }
        return item
      })
    },
  },

  watch: {
    dataTable: {
      deep: true,
      handler() {
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
    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
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
        filterData: JSON.parse(JSON.stringify(filterData)),
      })
    },

    updateInvoiceDetails(data) {
      this.importErrorMessage = []

      const clonedListCustomers = Array.from(
        this.availableListDetails.concat(data)
      )

      const existingCurrencyIds = clonedListCustomers.map(
        (item) => item.currencyID
      )
      const existingPaymentIds = clonedListCustomers.map(
        (item) => item.paymentID
      )

      const isUniqueExistingCurrencyId = new Set(existingCurrencyIds).size === 1
      const isUniqueExistingPaymentId = new Set(existingPaymentIds).size === 1
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

        this.$refs.invoiceForm.newInvoiceData = Object.assign(
          {},
          this.$refs.invoiceForm.newInvoiceData,
          {
            currencyId: existingItem.currencyID,
            paymentId: existingItem.paymentID,
          }
        )
        return (this.$refs.modalImport.showModal = false)
      }

      this.importErrorMessage.push({
        text: this.$t('msg_CurrencyIsNotSame_0'),
      })
    },
    async getListItemMaster() {
      const res = await api('getItemCode')
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.listItemMaster = res?.data
      }
    },
    handleAction(key) {
      const customerID = this.newInvoiceData?.customerId

      switch (key) {
        case 'refresh':
          location.reload()
          break

        case 'add':
          this.handleButtonAddInvoice()
          break

        case 'save':
        case 'newSaveInvoice':
          this.handleButtonSaveInvoice()
          break

        case 'delete':
          this.handleButtonDeleteInvoice()
          break

        case 'newItem':
          this.modalAddNewItem = true
          break

        case 'print':
          this.handlePrint()
          break

        case 'unCheck':
          window.alert(this.$t('msg_NoCheck_0'))
          break

        case 'attach':
          this.$refs.attachments.showModal = true
          break

        case 'import':
          if (customerID) {
            this.UPDATE_PAYLOAD_SALE_INVOICE_IMPORT({
              customerID,
            })

            this.importErrorMessage = []
            return (this.$refs.modalImport.showModal = true)
          }

          window.alert(this.$t('msg_NoselectCustomer_0'))
          break

        case 'back':
          this.$router.push(this.localePath({ path: '/sales/invoice' }))
          break

        case 'close':
          this.$router.push(this.localePath({ path: '/' }))
          break

        case 'setQuotation':
          this.$refs.baseSetColumnModal.showModal = true
          break

        default:
          break
      }
    },
    handleButtonDeleteInvoice() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        this.resetInvoiceAddForm()
        window.alert(this.$t('msg_IsDeleted_0'))
      }
    },
    handleButtonAddInvoice() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.resetInvoiceAddForm()
      }
    },
    resetInvoiceAddForm() {
      this.listErrorMessage = []
      this.newInvoiceData = {}
      this.dataTable = []
      this.$refs.invoiceFormTableItems.selectedItem = {}
      ++this.refreshFormAddInvoiceKey
    },

    validateForm() {
      const listError = []
      const dataTableFilter = this.availableListDetails

      const requiredFields = {
        orderDate: 'OrderDate',
        customerId: 'CustomerName',
        paymentId: 'PaymentID',
        payDate: 'APDate',
        currencyId: 'Currency',
      }

      const requiredTableDetail = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        price: 'Price',
        warehouseID: 'Warehouse',
      }

      for (const key in requiredFields) {
        if (!this.newInvoiceData[key]) {
          listError.push({
            fieldName: this.$t(`lbl_${requiredFields[key]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      if (dataTableFilter.length === 0) {
        listError.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        dataTableFilter.forEach((item) => {
          for (const key in requiredTableDetail) {
            if (
              (['quantity', 'price'].includes(key) &&
                !this.parseStringToFloat(item[key])) ||
              !item[key]
            ) {
              listError.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_${requiredTableDetail[key]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
              })
            }
          }
        })
      }

      this.listErrorMessage = getUnique(listError, 'fieldName')
      if (this.listErrorMessage.length > 0) {
        return
      }

      return {
        dataTableFilter,
        payload: this.newInvoiceData,
      }
    },

    async handleButtonSaveInvoice() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      const validateInfo = this.validateForm()
      if (validateInfo) {
        this.loading = true
        const { dataTableFilter, payload } = validateInfo

        const params = {
          ...payload,
          salesInDtl: dataTableFilter.map((item) => {
            return {
              customerPO: item.customerPO,
              itemCode: item.itemCode,
              itemId:
                item.itemID ??
                this.listItemCode.find((_el) => _el.key === item.itemCode)
                  ?.itemId,
              memoDtl: item.memoDTL,
              price: this.parseStringToFloat(item.price),
              productName: item.itemName,
              quantity: this.parseStringToFloat(item.quantity),
              sono: item.sono,
              sonoLineId: item?.sonoLineId,
              unitId: item.unitID,
              warehouseId: item.warehouseID,
            }
          }),
        }

        const response = await api('addNewInvoice', params)
        this.loading = false
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === 200) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.$router.push({
            path: `/${this.$i18n.locale}/sales/invoice/detail?invoiceNo=${response.data._1?.invoiceNo}`,
          })
        }
      }
    },

    async handlePrint() {
      const confirm = window.confirm(this.$t('msg_ConfirmPrint_0'))
      if (confirm) {
        if (this.newInvoiceData?.invoiceNo) {
          this.loading = true
          const response = await api('printInvoice', this.newInvoiceData)
          downloadFileExcel(response.data, 'xls')
          this.loading = false
        } else location.reload()
      }
    },

    changeDataDetailTable(data) {
      this.dataTable = data
    },
  },
}
</script>
<style lang="scss" scoped>
::v-deep .custom-control {
  margin-left: 1.5rem;
  padding: 0;
}
.add-sale-invoice-page {
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
