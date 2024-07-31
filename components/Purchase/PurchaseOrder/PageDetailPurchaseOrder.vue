<template>
  <div class="edit-purchase-order-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormPurchaseOrder
      ref="formUpdateOrder"
      :data="dataDetail"
      :is-disabled="isCheck"
      :arrival-addresses="arrivalAddresses"
    ></FormPurchaseOrder>
    <BaseTableItemDetail
      ref="tableDetails"
      class="edit-purchase-order-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'PurchaseOrderDetail'"
      :customer-id="dataDetail.supplierID"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :new-line="newLine"
      is-purchase
      :show-quantity="true"
      @changeTable="changeDataDetailTable"
    ></BaseTableItemDetail>
    <ModalImportPurchaseOrder
      ref="importPurchaseOrder"
      :form="dataDetail"
      @update-details="handleImportData"
    ></ModalImportPurchaseOrder>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="pono"
      module-name="POOrder"
      @updateData="updateParamAttachments"
      @deleteData="deleteData"
    ></BaseModalAttach>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getPODetailColumn"
    ></base-set-column-detail>
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { compact } from 'lodash'
import FormPurchaseOrder from './FormPurchaseOrder.vue'
import ModalImportPurchaseOrder from './Import/ModalImportPurchaseOrder.vue'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import systemMixins from '@/mixins/system'
import dateTime from '@/mixins/dateTime'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import {
  downloadFileExcel,
  formatNumberWithCommas,
  getUnique,
} from '@/utils/utils'
import {
  SERVER_RESPONSE_CODE,
  DETAIL_ITEM_TABLE,
  SERVER_ERROR_MESSAGE,
} from '@/constants'
import api from '@/api/api'

export default {
  components: {
    BaseValidateMessage,
    ToolBar,
    FormPurchaseOrder,
    BaseModalAttach,
    ModalImportPurchaseOrder,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      arrivalAddresses: [],
      listErrorMessage: [],
      form: {},
      dataTable: [],
      loading: false,
      dataDetail: {},
      columnHides: [],
      listItemCode: [],
    }
  },
  async fetch() {
    try {
      this.loading = true
      const [deliveryRes] = await Promise.all([
        api('getListCompanyTypeOther'),
        this.getDataDetail(),
        this.getListItemCode(),
        this.getUnitOptions(this.$i18n.locale),
        this.getItemTypeOptionsFromAPI(),
        this.getPODetailColumn(),
      ])

      const validResponse =
        deliveryRes && deliveryRes.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.arrivalAddresses = deliveryRes.data || []
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
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
    newLine() {
      return {
        productName: null,
        unit: null,
        unitID: null,
        quantity: 0,
        price: 0,
        amount: 0,
        sono: '',
        solineNumber: 0,
        itemCode: '',
        itemId: '',
        description: '',
        promiseDate: this.convertDate(new Date()),
        memoDTL: '',
        memoDTL1: '',
        isUpdate: true,
        isNewLine: true,
      }
    },
    isCheck() {
      return (
        !this.isCheckNullEmpty(this.form.checker) &&
        !this.isCheckNullEmpty(this.form.checkDate)
      )
    },
    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          fieldRequired: false,
          disabled: this.isCheck,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          fieldRequired: false,
          disabled: this.isCheck,
          hidden: false,
        },
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
          align: 'left',
          fieldRequired: true,
          disabled: this.isCheck,
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
          width: 200,
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
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'SODiscountRate',
          name: this.$t('lbl_SODiscountRate_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'SOPriceIncludeDiscount',
          name: this.$t('lbl_SOPriceIncludeDiscount_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'SOPriceIncludeTax',
          name: this.$t('lbl_SOPriceIncludeTax_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
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
          key: 'SOAmountIncludeTax',
          name: this.$t('lbl_SOAmountIncludeTax_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'promiseDate',
          name: this.$t('lbl_PromiseDate_0'),
          filter: 'datetime',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'sono',
          name: this.$t('lbl_SONO_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'solineNumber',
          name: this.$t('lbl_SOLineID_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'memoDTL',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'memoDTL1',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 150,
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
          key: 'newSave',
          label: this.$t('btn_btnNewSave_0'),
          icon: '/images/new_save.png',
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
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
          disabled: !this.getActiveButtonToolBar.isPrint,
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
  },
  watch: {
    form: {
      deep: true,
      handler(val) {
        if (val) {
          this.dataDetail = JSON.parse(JSON.stringify(val))
          this.joinAttachmentString(compact(this.dataDetail.attachments))
        }
      },
    },
    dataTable: {
      deep: true,
      handler(data) {
        const purchaseOrderAmounts = data.map((item) => item.amount)
        const totalAmount = purchaseOrderAmounts.reduce(
          (partialSum, amount) => partialSum + amount,
          0
        )
        this.dataDetail.totalAmount = totalAmount
      },
    },
  },

  methods: {
    ...mapActions('base', {
      getUnitOptions: 'getUnitOptions',
      getItemTypeOptionsFromAPI: 'getItemTypeOptionsFromAPI',
    }),
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_ORDER_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_ORDER_IMPORT',
    }),

    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },
    async getPODetailColumn() {
      try {
        this.loading = true
        const response = await api(
          'getScolumnHideDetail',
          DETAIL_ITEM_TABLE.PURCHASE_ORDER_DETAIL
        )

        this.columnHides = response?.data
        this.loading = false
      } catch (error) {
      } finally {
        this.loading = false
      }
    },

    isCheckNullEmpty(value) {
      return value === null || !value
    },
    async getDataDetail(poNo) {
      try {
        const params = {
          pono: poNo ?? this.$route.query?.pono,
          lang: this.$i18n.locale,
        }
        const res = await api('getDetailPurchaseOrder', params)
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.form = res.data
          this.form.orderDate = this.convertDate(this.form.orderDate)
          this.form.editDate = this.convertDate(this.form.editDate)
          this.form.checkDate = this.convertDate(this.form.checkDate)
          this.form.taxRate = formatNumberWithCommas(this.form.taxRate)
          this.dataTable = res?.data?.listDetail.map((item, index) => {
            item.promiseDate = this.convertDate(item.promiseDate)
            item.price = this.parseStringToFloat(item.price || 0)
            item.quantity = this.parseStringToFloat(item.quantity || 0)
            item.amount = this.parseStringToFloat(item.amount || 0)
            item.lineID = index + 1
            return item
          })
          if (!this.isCheck) {
            this.addNewLineData()
          }
        }
      } catch (err) {
        console.error(err)
      }
    },
    handleAction(key) {
      switch (key) {
        case 'add':
          return this.handleButtonAddOrder()
        case 'save':
          return this.handleButtonSaveOrder()
        case 'newSave':
          return this.handleButtonNewSaveOrder()
        case 'delete':
          return this.handleButtonDeleteOrder()
        case 'import':
          return this.handleOpenModalImport()
        case 'attach':
          return (this.$refs.attachments.showModal = true)
        case 'back':
          return this.$router.push(this.localePath({ path: '/purchase/order' }))
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        case 'print':
          return this.handlePrintPurchaseOrder()
        case 'check':
          return this.handleButtonCheck()
        case 'refresh':
          return this.handleRefresh()
        case 'setColumn':
          return (this.$refs.baseSetColumnModal.showModal = true)
        case 'unCheck':
          return this.handleButtonUnCheck()
        default:
          break
      }
    },

    handleRefresh() {
      this.listErrorMessage = []
      this.$refs.tableDetails.resetSearchData()
      this.$refs.tableDetails.activeRow = -1
      Promise.all([this.$fetch(), this.$refs.formUpdateOrder.$fetch()])
    },

    async handlePrintPurchaseOrder() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmPrint_0'))
        if (!confirm) {
          return
        }

        const payload = {
          language: this.$i18n.locale,
          orderNO: this.$route.query.pono,
        }
        const res = await api('printPurchaseOrder', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          downloadFileExcel(res.data)
          return window.alert(this.$t('msg_Successfully_0')) // FIXME: need to confirm this message with tester
        }

        window.alert(res?.message)
      } catch (err) {
        console.error(err)
      }
    },
    handleOpenModalImport() {
      const supplierId = this.dataDetail.supplierID
      if (supplierId) {
        this.UPDATE_PAYLOAD_PURCHASE_ORDER_IMPORT({
          supplierId,
        })
        return (this.$refs.importPurchaseOrder.showModal = true)
      }

      window.alert(this.$t('msg_NoselectSupplier_0'))
    },
    async handleButtonCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      const purchaseNumber = this.form?.pono
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const response = await api('checkPurchaseOrder', purchaseNumber)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsChecked_0'))
          this.getDataDetail()
        } else {
          window.alert(`${response?.message}`)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleButtonUnCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
      const purchaseNumber = this.form?.pono
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const response = await api('unCheckPurchaseOrder', purchaseNumber)
        
        const errorCode = response?.data?.response?.status
        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }

        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          window.alert(this.$t('msg_IsUnChecked_0'))
          return await this.getDataDetail()
        }

        const errorMessage = response?.data?.response?.data?.message
        const isInUsedError = errorMessage === SERVER_ERROR_MESSAGE.IS_IN_USED
        if (isInUsedError) {
          window.alert(this.$t(errorMessage))
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleButtonAddOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/purchase/order/add' }))
      }
    },
    validateData() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      this.listErrorMessage = []
      const selectedItems = this.availableListDetails || []
      const payload = this.dataDetail

      const requiredFields = {
        orderDate: 'OrderDate',
        supplierID: 'SupplierName',
        currencyID: 'Currency',
      }

      const requiredTableDetail = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        promiseDate: 'PromiseDate',
      }

      for (const prop in requiredFields) {
        if (!payload[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      if (selectedItems.length === 0) {
        this.listErrorMessage.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        selectedItems.forEach((item) => {
          for (const key in requiredTableDetail) {
            if (
              (['quantity'].includes(key) &&
                !this.parseStringToFloat(item[key])) ||
              !item[key]
            ) {
              this.listErrorMessage.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_${requiredTableDetail[key]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
              })
            }
          }
        })
      }

      this.listErrorMessage = getUnique(this.listErrorMessage, 'fieldName')
    },
    async handleButtonNewSaveOrder() {
      try {
        this.validateData()

        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        if (this.dataDetail && this.availableListDetails.length > 0) {
          const params = {
            ...this.dataDetail,
            orderDate: this.convertDate(new Date()),
            listDetail: this.availableListDetails.map((item, index) =>
              Object.assign({}, item, { lineID: index + 1 })
            ),
          }

          this.loading = true
          const formatNumberFields = ['taxRate']
          for (const key of formatNumberFields) {
            params[key] = this.parseStringToFloat(params[key]) || 0
          }

          const response = await api('addPurchaseOrder', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            this.form.pono = response.data.pono
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push(
              `/${this.$i18n.locale}/purchase/order/detail?pono=${this.form.pono}`
            )
            await this.getDataDetail(response.data.pono)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async handleButtonSaveOrder() {
      this.validateData()

      const hasError = this.listErrorMessage.length > 0
      if (hasError) {
        return
      }

      if (
        this.dataDetail &&
        this.availableListDetails &&
        this.availableListDetails.length > 0
      ) {
        const payload = {
          purchaseNumber: this.form.pono,
          form: this.dataDetail,
        }
        payload.form.listDetail = this.availableListDetails.map((item, index) =>
          Object.assign({}, item, {
            lineID: index + 1,
            price: this.parseStringToFloat(item.price),
          })
        )
        delete payload.form.attachments
        this.loading = true

        const formatNumberFields = ['taxRate']
        for (const key of formatNumberFields) {
          payload.form[key] = this.parseStringToFloat(payload.form[key]) || 0
        }
        const response = await api('updatePurchaseOrder', payload)
        this.loading = false
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.$fetch()
        } else {
          window.alert(`${response?.message}`)
        }
      }
    },
    async handleButtonDeleteOrder() {
      const params = {
        pono: this.form?.pono,
      }
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        if (params.pono) {
          const response = await api('deletePurchaseOrder', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
            return this.$router.push(
              this.localePath({ path: '/purchase/order/add' })
            )
          }
          window.alert(`${response?.message}`)
        }
      }
    },
    changeDataDetailTable(data) {
      this.dataTable = data
    },

    handleImportData(data) {
      const dataConvert = data.map((item, index) => {
        item.productName = item.itemName
        item.promiseDate = this.convertDate(item.promiseDate)
        item.price = this.parseStringToFloat(item.price || 0)
        item.quantity = this.parseStringToFloat(item.quantity || 0)
        item.amount = this.parseStringToFloat(item.amount || 0)

        return item
      })
      this.dataTable = this.availableListDetails
        .concat(dataConvert)
        .map((item, index) => ({
          ...item,
          lineID: index + 1,
        }))
      this.addNewLineData()
    },
    updateParamAttachments(data) {
      this.form.attachments?.push(data)
      this.joinAttachmentString(this.form.attachments)
    },
    deleteData(id) {
      this.form.attachments = this.form.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.form.attachments)
    },

    joinAttachmentString(attachmentArray = []) {
      this.dataDetail.attachments = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
    },
    addNewLineData() {
      this.dataTable.push({
        ...this.newLine,
        lineID: this.availableListDetails.length + 1,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.edit-purchase-order-page {
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
