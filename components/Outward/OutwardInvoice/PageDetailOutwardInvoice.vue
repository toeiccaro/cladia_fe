<template>
  <div class="edit-sale-order-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormInputOutwardInvoice
      ref="editOrderForm"
      :data="dataDetail"
      :is-disabled="isCheck"
    ></FormInputOutwardInvoice>
    <BaseTableItemDetail
      ref="outwardInvoiceTableItem"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardInvoice'"
      :customer-id="dataDetail.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      @changeTable="changeDataDetailTable"
    />
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNo"
      module-name="OutwardInvoice"
      @updateData="updateData"
      @deleteData="deleteData"
    ></BaseModalAttach>
    <ModalImportOutwardInvoice
      ref="importOutwardInvoice"
      :invoice-data="dataDetail"
      :list-error-message="importErrorMessage"
      @close-modal="$refs.importOutwardInvoice.showModal = false"
      @update-invoice-details="(data) => updateInvoiceDetails(data)"
    ></ModalImportOutwardInvoice>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { compact } from 'lodash'
import FormInputOutwardInvoice from '~/components/Outward/OutwardInvoice/FormInputOutwardInvoice.vue'
import { getUnique } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import { SERVER_ERROR_MESSAGE, SERVER_RESPONSE_CODE } from '@/constants'
import ModalImportOutwardInvoice from '@/components/Outward/OutwardInvoice/Import/ModalImportOutwardInvoice.vue'
export default {
  name: 'PageDetailOutwardInvoice',
  components: {
    BaseValidateMessage,
    ToolBar,
    FormInputOutwardInvoice,
    BaseModalAttach,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    ModalImportOutwardInvoice,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      listErrorMessage: [],
      form: {},
      dataImportDetail: [],
      dataTable: [],
      loading: false,
      dataDetail: {},
      importErrorMessage: [],
      listItemCode: [],
      columnHides: [],
      lang: this.$i18n.locale,
    }
  },

  async fetch() {
    try {
      this.setLoading(true)
      await Promise.all([
        this.getListItemCode(),
        this.getData(),
        this.getItemTypeOptionsFromAPI(),
        this.getScolumnHides(),
        this.getUnitOptions(this.lang),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      this.setLoading(false)
    }
  },

  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
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
      return !!(this.form?.checkUser && this.form.checkDate)
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
          key: 'unit',
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
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },

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
          disabled: !this.getActiveButtonToolBar.isDelete || this.isCheck,
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
          disabled: !this.getActiveButtonToolBar.isCheck || this.isCheck,
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
          disabled: !this.getActiveButtonToolBar.isCheck || !this.isCheck,
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
  },

  watch: {
    dataTable: {
      handler() {
        this.dataDetail.totalAmount = this.dataTable
          .map((v) => v.amount ?? 0)
          .reduce((totalAmount, currentQuantity) => {
            return parseInt(totalAmount) + parseInt(currentQuantity)
          }, 0)
      },
      deep: true,
    },
    form: {
      immediate: true,
      handler(val) {
        if (val) {
          this.dataDetail = JSON.parse(JSON.stringify(val))
          this.joinAttachmentString(compact(this.dataDetail.attachments))
        }
      },
    },
  },

  methods: {
    ...mapActions('base', ['getItemTypeOptionsFromAPI', 'getUnitOptions']),
    ...mapMutations({
      setLoading: 'base/SET_LOADING',
      UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_INVOICE_IMPORT',
    }),

    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'OutwardInvoiceDetail',
      })
      if (response.status === 200) {
        this.columnHides = response?.data || []
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
      this.importErrorMessage = []

      window.alert(this.$t('msg_NoselectSupplier_0'))
    },
    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },

    async getData() {
      try {
        const params = {
          orderNo: this.$route.query?.orderNo,
          language: this.$i18n.locale,
        }
        const res = await api('getDetailOutwardInvoice', params)
        if (res.status === 200) {
          this.form = res.data
          this.form.orderDate = this.convertDate(this.form.orderDate)
          this.form.editDate = this.convertDate(this.form.editDate)
          this.form.checkDate = this.convertDate(this.form.checkDate)
          this.form.dueDate = this.convertDate(this.form.dueDate)
          this.dataDetail = JSON.parse(JSON.stringify(this.form))
          this.joinAttachmentString(compact(this.dataDetail.attachments))

          this.dataTable = res?.data?.itemDetails?.map((item, index) => {
            item.lineID = index + 1
            return item
          })
        }
      } catch (error) {
        console.error(error)
      }
    },
    handleAction(key) {
      switch (key) {
        case 'add':
          this.handleButtonAddOrder()
          break
        case 'import':
          this.handleOpenModalImport()
          break
        case 'attach':
          this.$refs.attachments.showModal = true
          break
        case 'save':
          this.handleButtonSaveOrder()
          break
        case 'delete':
          this.handleButtonDeleteOrder()
          break
        case 'back':
          this.$router.push(this.localePath({ path: '/outward/wpo-invoice' }))
          break
        case 'close':
          this.$router.push(this.localePath({ path: '/' }))
          break
        case 'check':
          this.handleButtonCheck()
          break
        case 'refresh':
          this.handleRefresh()
          break
        case 'unCheck':
          this.handleButtonUnCheck()
          break
        case 'setQuotation':
          this.$refs.baseSetColumnModal.showModal = true
          break
        default:
      }
    },

    resetTableDetailData() {
      this.dataTable = []
      this.$refs.outwardInvoiceTableItem.resetSearchData()
      this.$refs.outwardInvoiceTableItem.activeRow = -1
    },

    async handleRefresh() {
      try {
        this.setLoading(true)
        this.resetTableDetailData()
        await Promise.all([this.$fetch(), this.$refs.editOrderForm.$fetch()])
      } catch (err) {
        console.error(err)
      } finally {
        this.setLoading(false)
      }
    },
    async handleButtonCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      const params = this.form?.orderNo
      if (!confirm) {
        return
      }

      try {
        this.setLoading(true)
        const response = await api('checkOutwardInvoice', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsChecked_0'))
          await this.getData()
        } else {
          window.alert(`${response?.message}`)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.setLoading(false)
      }
    },

    async handleButtonUnCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
      const params = this.form?.orderNo
      if (!confirm) {
        return
      }

      try {
        this.setLoading(true)
        const response = await api('UnCheckOutwardInvoice', params)
        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (validResponse) {
          window.alert(this.$t('msg_IsUnChecked_0'))
          return await this.getData()
        }
        const errorMessage = response?.data?.response?.data?.message
        const isInUsedError = errorMessage === SERVER_ERROR_MESSAGE.IS_IN_USED
        if (isInUsedError) {
          window.alert(this.$t(errorMessage))
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.setLoading(false)
      }
    },
    handleButtonAddOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/outward/wpo-invoice/add' }))
      }
    },

    validateData() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      const listError = []
      const dataTableFilter = this.availableListDetails
      const requiredFields = {
        orderDate: 'OrderDate',
        invoiceNo: 'InvoiceNo',
        supplierId: 'SupplierName',
        paymentId: 'PaymentID',
        currencyId: 'Currency',
        dueDate: 'RtDate',
      }
      const requiredTableDetail = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        price: 'Price',
      }

      for (const key in requiredFields) {
        if (!this.dataDetail[key]) {
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
        payload: this.dataDetail,
      }
    },

    async handleButtonSaveOrder() {
      if (this.validateData) {
        const { dataTableFilter, payload } = this.validateData()

        const params = {
          form: {
            ...payload,
            itemDetails: dataTableFilter,
          },
          language: this.$i18n.locale,
          orderNo: this.form.orderNo,
        }

        try {
          this.setLoading(true)
          const response = await api('updateOutwardInvoice', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            await this.getData()
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.setLoading(false)
        }
      }
    },
    async handleButtonDeleteOrder() {
      const orderNo = this.form?.orderNo
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        const response = await api('deleteOutwardInvoice', orderNo)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsDeleted_0'))
          await this.$router.push(
            this.localePath({ path: '/outward/wpo-invoice/add' })
          )
        } else {
          window.alert(`${response?.message}`)
        }
      }
    },

    updateData(data) {
      this.form.attachments?.push(data)
      this.joinAttachmentString(this.form.attachments)
      this.$refs.editOrderForm.refresh()
    },

    deleteData(id) {
      this.form.attachments = this.form.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.form.attachments)
      this.$refs.editOrderForm.refresh()
    },

    joinAttachmentString(attachmentArray = []) {
      this.dataDetail.attachments = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
    },

    changeDataDetailTable(data) {
      this.dataTable = data
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
        existingCurrencyIds[0] === this.dataDetail?.currencyId
      const isUniqueExistingPaymentId =
        new Set(existingPaymentIds).size === 1 &&
        existingPaymentIds[0] === this.dataDetail?.paymentId
      const isSameCurrency = existingCurrencyIds.every(
        (currencyImport) => currencyImport === this.form.currencyId
      )

      const canMerge =
        isUniqueExistingCurrencyId &&
        isUniqueExistingPaymentId &&
        isSameCurrency&&
        clonedListCustomers.length > 0

      if (canMerge) {
        const finalData = data.map((item) => {
          return Object.assign({}, item, {
            unit: item.unitID,
            quantity: item.blance,
            amount: item.blance * item.price,
            relateOrderNo: item.orderNO,
            relateOrderDate: item.orderDate
          })
        })

        this.dataTable = this.availableListDetails
          .concat(finalData)
          .map((item, index) => ({ ...item, lineID: index + 1 }))

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
.edit-sale-order-page {
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
