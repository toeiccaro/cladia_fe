<template>
  <div class="add-sale-order-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormInputOutwardInvoice
      ref="addOrderForm"
      :key="refreshAddOrderFormKey"
      :data="form"
    />
    <BaseTableItemDetail
      ref="outwardInvoiceTableItem"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardInvoice'"
      :customer-id="form.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      @changeTable="changeDataDetailTable"
    ></BaseTableItemDetail>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNo"
      module-name="OutwardInvoice"
    ></BaseModalAttach>
    <ModalImportOutwardInvoice
      ref="importOutwardInvoice"
      :invoice-data="form"
      :list-error-message="importErrorMessage"
      @update-invoice-details="(data) => updateInvoiceDetails(data)"
    />
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import FormInputOutwardInvoice from '~/components/Outward/OutwardInvoice/FormInputOutwardInvoice.vue'
import systemMixins from '@/mixins/system'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { getUnique } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import ModalImportOutwardInvoice from '@/components/Outward/OutwardInvoice/Import/ModalImportOutwardInvoice.vue'

export default {
  components: {
    ToolBar,
    FormInputOutwardInvoice,
    BaseModalAttach,
    BaseValidateMessage,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
    ModalImportOutwardInvoice,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      refreshAddOrderFormKey: 0,
      listErrorMessage: [],
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
      defaultForm: {
        orderDate: this.convertDate(new Date()),
      },
      form: {},
      dataTable: [],
      loading: false,
      listItemCode: [],
      columnHides: [],
      importErrorMessage: [],
    }
  },

  async fetch() {
    try {
      this.form = Object.assign({}, this.defaultForm)
      await Promise.all([
        this.getListItemCode(),
        this.getItemTypeOptionsFromAPI(),
        this.getUnitOptions(this.$i18n.locale),
        this.getScolumnHides(),
      ])
    } catch (err) {
      console.error(err)
    }
  },

  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
    }),

    ...mapGetters('base', ['getActiveButtonToolBar']),

    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
    },

    isCheck() {
      return !!(this.form?.checker && this.form.checkDate)
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
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
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
          fieldRequired: false,
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
          disabled: false,
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
          key: 'relateOrderNo',
          name: this.$t('lbl_RelateOrderNO_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'relateOrderDate',
          name: this.$t('lbl_RelateOrderDate_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'memoDtl',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          typeInput: 'input',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },

    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
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
  },
  watch: {
    dataTable: {
      handler() {
        const totalAmount = this.dataTable
          .map((item) => item.amount ?? 0)
          .reduce((totalAmount, currentQuantity) => {
            return Number(totalAmount) + Number(currentQuantity)
          }, 0)
        this.form = { ...this.form, totalAmount }
      },
      deep: true,
    },
  },
  methods: {
    ...mapActions('base', ['getUnitOptions', 'getItemTypeOptionsFromAPI']),
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT',
    }),
    async getScolumnHides() {
      try {
        this.loading = true

        const response = await api('getScolumnHides', {
          gridName: 'OutwardInvoiceDetail',
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

    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },

    handleAction(key) {
      switch (key) {
        case 'add':
          this.handleButtonAddOrder()
          break
        case 'save':
          this.handleSaveWPOInvoice()
          break
        case 'import':
          this.handleOpenModalImport()
          break
        case 'delete':
          this.handleButtonDeleteOrder()
          break

        case 'attach':
          this.$refs.attachments.showModal = true
          break

        case 'back':
          this.$router.push(this.localePath({ path: '/outward/wpo-invoice' }))
          break

        case 'refresh':
          this.handleRefresh()
          break

        case 'close':
          this.$router.push(this.localePath({ path: '/' }))
          break

        case 'unCheck':
          this.handleButtonUnCheck()
          break

        case 'setColumn':
          this.$refs.baseSetColumnModal.showModal = true
          break

        default:
          break
      }
    },
    resetTableDetailData() {
      this.dataTable = []
      this.$refs.outwardInvoiceTableItem.resetSearchData()
      this.$refs.outwardInvoiceTableItem.activeRow = -1
    },
    refreshFormData() {
      ++this.refreshAddOrderFormKey
    },
    async handleRefresh() {
      this.listErrorMessage = []
      this.resetTableDetailData()
      await Promise.all([this.$fetch(), this.$refs.addOrderForm.$fetch()])
      this.refreshFormData()
    },
    handleButtonUnCheck() {
      return window.confirm(this.$t('msg_NoCheck_0'))
    },

    handleButtonAddOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
    },

    validateForm() {
      const errors = []
      const dataTable = this.availableListDetails

      const requiredFields = {
        orderDate: 'OrderDate',
        supplierId: 'SupplierName',
        paymentId: 'PaymentID',
        currencyId: 'Currency',
        invoiceNo: 'InvoiceNo',
        dueDate: 'RtDate',
      }
      const requiredTableDetails = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        price: 'Price',
      }

      Object.keys(requiredFields).forEach((field) => {
        if (!this.form[field]) {
          errors.push({
            fieldName: this.$t(`lbl_${requiredFields[field]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      })

      if (dataTable.length === 0) {
        errors.push({
          fieldName: this.$t('msg_Details_0'),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        dataTable.forEach((item) => {
          Object.keys(requiredTableDetails).forEach((field) => {
            if (
              (['quantity', 'price'].includes(field) &&
                !this.parseStringToFloat(item[field])) ||
              !item[field]
            ) {
              errors.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_${requiredTableDetails[field]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
              })
            }
          })
        })
      }

      this.listErrorMessage = getUnique(errors, 'fieldName')
      if (this.listErrorMessage.length > 0) {
        return
      }

      return {
        dataTableFilter: dataTable,
        payload: this.form,
      }
    },

    async handleSaveWPOInvoice() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      const validateInfo = this.validateForm()

      if (validateInfo) {
        const { dataTableFilter, payload } = validateInfo

        const params = {
          form: {
            ...payload,
            itemDetails: dataTableFilter,
          },
          language: this.$i18n.locale,
        }

        try {
          this.loading = true
          const response = await api('addOutwardInvoice', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            await this.$router.push({
              path: `/${this.$i18n.locale}/outward/wpo-invoice/detail?orderNo=${response?.data?.orderNo}`,
            })
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.loading = false
        }
      }
    },

    handleOpenModalImport() {
      const supplierID = this.form?.supplierId
      if (supplierID) {
        this.UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT({
          supplierID,
        })

        return (this.$refs.importOutwardInvoice.showModal = true)
      }

      window.alert(this.$t('msg_NoselectSupplier_0'))
    },

    handleButtonDeleteOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        location.reload()
        this.refreshFormData()
        window.alert(this.$t('msg_IsDeleted_0'))
      }
    },

    changeDataDetailTable(data) {
      this.dataTable = data
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

      const isSameCurrency = existingCurrencyIds.every(
        (currencyImport) => currencyImport === this.form.currencyId
      )
      const isUniqueExistingCurrencyId = new Set(existingCurrencyIds).size === 1
      const isUniqueExistingPaymentId = new Set(existingPaymentIds).size === 1
      const canMerge =
        isUniqueExistingCurrencyId &&
        isUniqueExistingPaymentId &&
        isSameCurrency &&
        clonedListCustomers.length > 0

      if (canMerge) {
        const finalData = data.map((item) => {
          return Object.assign({}, item, {
            unit: item.unitID,
            quantity: item.blance,
            amount: item.blance * item.price,
          })
        })
        this.dataTable = this.availableListDetails
          .concat(finalData)
          .map((item, index) => ({
            ...item,
            lineID: index + 1,
            relateOrderNo: item.orderNO,
            relateOrderDate: item.orderDate,
          }))

        return (this.$refs.importOutwardInvoice.showModal = false)
      }

      this.importErrorMessage.push({
        text: this.$t('msg_CurrencyIsNotSame_0'),
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.add-sale-order-page {
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
