<template>
  <div class="edit-sale-order-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <OrderForm
      ref="editOrderForm"
      :data="dataDetail"
      :is-disabled="isCheck"
    ></OrderForm>
    <base-table-item-detail
      ref="saleOrderFormTableItems"
      class="edit-sale-order-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'saleOrder'"
      :customer-id="dataDetail.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :show-quantity="true"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    />
    <ModalImport ref="importOrder" @importData="handleImportData"></ModalImport>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNumber"
      module-name="SOOrder"
      @updateData="updateData"
      @deleteData="deleteData"
    ></BaseModalAttach>
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
import { mapGetters, mapActions } from 'vuex'
import { compact } from 'lodash'
import OrderForm from './RBForm.vue'
import ModalImport from './ModalImport.vue'
import { getUnique, formatNumberWithCommas } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import { SERVER_ERROR_MESSAGE, SERVER_RESPONSE_CODE } from '@/constants'

export default {
  name: 'OrderDetail',
  components: {
    BaseValidateMessage,
    ToolBar,
    OrderForm,
    BaseModalAttach,
    ModalImport,
    BaseTableItemDetail,
    BaseSetColumnDetail,
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
      listFieldRequired: [
        {
          key: 'orderDate',
          fieldName: this.$t('lbl_OrderDate_0'),
        },
        {
          key: 'customerID',
          fieldName: this.$t('lbl_CustomerName_0'),
        },
        {
          key: 'currencyID',
          fieldName: this.$t('lbl_Currency_0'),
        },

        {
          key: 'paymentID',
          fieldName: this.$t('lbl_PaymentType_0'),
        },
      ],
      listItemCode: [],
      columnHides: [],
      lang: this.$i18n.locale,
    }
  },

  async fetch() {
    try {
      this.loading = true
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

    checkRequired() {
      return (
        this.form.orderDate &&
        this.form.currencyId &&
        this.form.customerId &&
        this.form.paymentId &&
        this.dataTable.length > 0
      )
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
          key: 'discountRate',
          name: this.$t('lbl_SODiscountRate_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'priceIncludeDiscount',
          name: this.$t('lbl_SOPriceIncludeDiscount_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'priceIncludeTax',
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
          key: 'amountIncludeTax',
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
          width: 200,
          align: 'left',
          disabled: false,
          fieldRequired: true,
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

    newLine() {
      return {
        lineID: 1,
        customerPO: '',
        itemCode: '',
        itemID: '',
        itemTypeID: '',
        itemName: '',
        description: '',
        unitID: '',
        quantity: 0,
        price: 0,
        amount: 0,
        promiseDate: this.convertDate(new Date()),
        memoDTL: '',
        isUpdate: true,
        isNewLine: true,
        amountIncludeTax:0,
        priceIncludeDiscount:0,
        priceIncludeTax: 0,
        discountRate: 0,
      }
    },
  },

  watch: {
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

    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'SaleOrderDetail',
      })
      if (response.status === 200) {
        this.columnHides = response?.data || []
      }
    },

    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },

    async deleteItemDetail() {
      try {
        this.loading = true
        await this.getData()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getData() {
      try {
        const res = await api('getOrderById', this.$route.query?.sono)
        console.log('res', this.form);
        if (res.status === 200) {
          this.form = res.data._1
          this.form.orderDate = this.convertDate(this.form.orderDate)
          this.form.editDate = this.convertDate(this.form.editDate)
          this.form.checkDate = this.convertDate(this.form.checkDate)
          this.form.taxRate = formatNumberWithCommas(this.form.taxRate)
          this.form.totalAmount = formatNumberWithCommas(this.form.totalAmount)
          this.dataDetail = JSON.parse(JSON.stringify(this.form))
          this.joinAttachmentString(compact(this.dataDetail.attachments))

          console.log('this.dataTable', this.dataTable);
          this.dataTable = res?.data._2.map((item, index) => {
            item.promiseDate = this.convertDate(item.promiseDate)
            item.lineID = index + 1
            return item
          })

          if (!this.isCheck) {
            this.dataTable.push({
              ...this.newLine,
              lineID: this.dataTable.length + 1,
            })
          }
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
        case 'attach':
          this.$refs.attachments.showModal = true
          break
        case 'save':
          this.handleButtonSaveOrder()
          break
        case 'newSave':
          this.handleActionNewSave()
          break
        case 'delete':
          this.handleButtonDeleteOrder()
          break
        case 'import':
          this.$refs.importOrder.showModal = true
          break
        case 'attachOrder':
          this.$refs.attachments.showModal = true
          break
        case 'back':
          this.$router.push(this.localePath({ path: '/sales/order' }))
          break
        case 'closeAddOrder':
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
      this.$refs.saleOrderFormTableItems.resetSearchData()
      this.$refs.saleOrderFormTableItems.activeRow = -1
    },

    async handleRefresh() {
      try {
        this.loading = true
        this.resetTableDetailData()
        await Promise.all([this.$fetch(), this.$refs.editOrderForm.$fetch()])
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleActionNewSave() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      if (this.checkRequired) {
        const { dataTableFilter, payload } = this.validateData()
        const apiParams = this.makeAddData(payload, dataTableFilter)

        try {
          this.loading = true
          const response = await api('addOrder', apiParams)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))

            this.$router.push({
              path: `/${this.$i18n.locale}/sales/order/detail?sono=${response.data._1.orderNumber}`,
            })

            setTimeout(async () => await this.handleRefresh())
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.loading = false
        }

        return
      }

      this.listErrorMessage = []
      this.listFieldRequired.forEach((item) => {
        if (this.form[item.key] === '') {
          this.listErrorMessage.push({
            fieldName: item.fieldName,
            text: this.$t('msg_NoInput_0'),
          })
        }
      })
      if (this.dataTable.length === 0) {
        this.listErrorMessage.push({
          fieldName: this.$t('msg_Details_0'),
          text: this.$t('msg_NoInput_0'),
        })
      }
    },

    makeAddData(formData, detailsData) {
      const orderDate = new Date()

      const salesOrderDtlRequestList = detailsData.map((item) => ({
        customerPO: item.customerPO,
        itemID: item.itemID,
        lineID: item.lineID,
        memoDtl: item.memoDTL,
        price: this.parseStringToFloat(item.price),
        promiseDate: item.promiseDate,
        quantity: this.parseStringToFloat(item.quantity),
      }))

      return {
        currencyID: formData.currencyId,
        customerID: formData.customerId,
        customerName: formData.customerName,
        departID: formData.departmentId,
        memo: formData.memo,
        operationType: formData.operationTypeId,
        orderDate,
        paymentID: formData.paymentId,
        respondsibleMan: formData.responsibleMan,
        saler: formData.saler,
        taxRate: this.parseStringToFloat(formData.taxRate),
        salesOrderDtlRequestList,
      }
    },

    async handleButtonCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      const params = this.form?.orderNumber
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const response = await api('checkOrder', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }

        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsChecked_0'))
          this.dataDetail.checker = response.data.checker
          this.dataDetail.checkDate = this.convertDateTillSecond(
            response.data.checkDate
          )
          await this.getData()
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
      const params = this.form?.orderNumber
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const response = await api('uncheckOrder', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }

        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          window.alert(this.$t('msg_IsUnChecked_0'))
          this.dataDetail.checker = response.data.checker
          this.dataDetail.checkDate = response.data.checkDate

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
        this.loading = false
      }
    },
    handleButtonAddOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/sales/order/add' }))
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
        currencyId: 'Currency',
        paymentId: 'PaymentID',
        customerId: 'CustomerName',
      }
      const requiredTableDetail = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        price: 'Price',
        promiseDate: 'PromiseDate',
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
          currencyID: payload.currencyId,
          customerID: payload.customerId,
          customerName: payload.customerName,
          departID: payload.departmentId,
          memo: payload.memo,
          operationType: payload.operationTypeId,
          orderDate: payload.orderDate,
          attachments: this.form.attachments,
          paymentID: payload.paymentId,
          respondsibleMan: payload.responsibleMan,
          saler: payload.saler,
          sono: payload.orderNumber,
          taxRate: this.parseStringToFloat(payload.taxRate),
          discountRate: payload.discountRate,
          salesOrderDtlRequestList: dataTableFilter.map((item) => {
            return {
              customerPO: item.customerPO,
              itemID: item?.itemID,
              lineID: item.lineID,
              memoDtl: item.memoDTL,
              price: this.parseStringToFloat(item.price),
              promiseDate: item.promiseDate,
              quantity: this.parseStringToFloat(item.quantity),
              itemCode: item.itemCode,
            }
          }),
        }

        try {
          this.loading = true
          const response = await api('editOrder', params)
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
          this.loading = false
        }
      }
    },
    async handleButtonDeleteOrder() {
      const params = {
        soNo: this.form?.orderNumber,
      }
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        if (params.soNo) {
          const response = await api('deleteOrder', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
            this.$router.push(this.localePath({ path: '/sales/order/add' }))
          } else {
            window.alert(`${response?.message}`)
          }
        }
      }
    },

    handleImportData(data) {
      this.dataTable = this.availableListDetails
        .concat(data)
        .map((item, index) => ({
          ...item,
          promiseDate: this.convertDate(item.promiseDate),
          price: this.parseStringToFloat(item.price || 0),
          quantity: this.parseStringToFloat(item.quantity || 0),
          lineID: index + 1,
        }))

      this.addNewLineData()
    },

    addNewLineData() {
      this.dataTable.push({
        ...this.newLine,
        lineID: this.availableListDetails.length + 1,
      })
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
      this.dataDetail.attachmentList = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
    },

    changeDataDetailTable(data) {
      this.dataTable = data
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
