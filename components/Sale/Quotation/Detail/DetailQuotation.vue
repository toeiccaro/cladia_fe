<template>
  <div class="add-enterprise-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <FormInputQuotation
      :params-quotation="dataAttach"
      @update-table="updateTable"
    ></FormInputQuotation>
    <base-table-item-detail
      class="edit-quotation-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'quotationDetail'"
      :customer-id="dataAttach.customerID"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :new-line="newLine"
      :form="form"
      @changeTable="changeDataDetailTable"
    ></base-table-item-detail>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="quoteNO"
      module-name="SOQuotation"
      @updateData="updateAttachments"
      @deleteData="deleteData"
    ></BaseModalAttach>
    <ModalNewItemMaster ref="newItemMaster"></ModalNewItemMaster>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    ></base-set-column-detail>
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import {
  downloadFileExcel,
  getUnique,
  formatNumberWithCommas,
} from '@/utils/utils'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import api from '@/api/api'
import FormInputQuotation from '@/components/Sale/Quotation/FormInputQuotation.vue'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar'
import BaseModalAttach from '@/components/UI/BaseModalAttach'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import ModalNewItemMaster from '~/components/MasterData/ItemMaster/Modal/ModalNewItemMaster'

export default {
  name: 'DetailQuotation',
  components: {
    ToolBar,
    FormInputQuotation,
    BaseModalAttach,
    ModalNewItemMaster,
    BaseValidateMessage,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      form: {},
      loading: false,
      dataTable: [],
      dataAttach: {},
      listItemCode: [],
      listErrorMessage: [],
      columnHides: [],
    }
  },

  fetch() {
    Promise.all([
      this.getScolumnHides(),
      this.getListItemCode(),
      this.getData(),
      this.getUnitOptions(this.$i18n.locale),
      this.getItemTypeOptionsFromAPI(),
    ])
  },

  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      getItemTypeOptions: 'base/getItemTypeOptions',
      getStatusPayloadList: 'getStatusPayloadList',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    newLine() {
      return {
        itemCode: '',
        itemName: '',
        description: '',
        unitID: '',
        quantity: 0,
        price: 0,
        amount: 0,
        memoDTL: '',
        isUpdate: true,
        isNewLine: true,
      }
    },

    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
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
          typeInput: '',
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
          typeInput: 'autocomplete',
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
          key: 'quantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
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
          typeInput: 'number',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'priceIncludeDiscount',
          name: this.$t('lbl_QPriceIncludeDiscount_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'priceIncludeTax',
          name: this.$t('lbl_QPriceIncludeTax_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
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
          key: 'amountIncludeTax',
          name: this.$t('lbl_QAmountIncludeTax_0'),
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
          width: 300,
          align: 'left',
          typeInput: 'input',
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
          key: 'newItem',
          label: this.$t('btn_btnNewItem_0'),
          icon: '/images/edit_add.png',
          width: '16px',
          height: '16px',
          disabled: this.isCheck,
        },
        {
          key: 'generateOrder',
          label: this.$t('btn_btnGenerateOrder_0'),
          icon: '/images/set.png',
          disabled: !this.isCheck,
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

    isCheck() {
      return !!(this.form?.checker && this.form.checkDate)
    },
    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },
  },

  watch: {
    form: {
      handler(val) {
        if (val) {
          this.dataAttach = JSON.parse(JSON.stringify(val))
          this.joinAttachmentString(this.dataAttach.attachments)
        }
      },
    },
  },

  methods: {
    ...mapActions('base', ['getUnitOptions', 'getItemTypeOptionsFromAPI']),

    updateTable(val) {
      this.dataTable = this.dataTable.map((item) => {
        const quantity = item.quantity
        const price = item.price
        const discountRate = val.discountRate
        const taxRate = val.taxRate

        const {
          priceIncludeDiscount,
          amount,
          priceIncludeTax,
          amountIncludeTax,
        } = this.parseFloatCalculatePrice({
          quantity,
          price,
          discountRate,
          taxRate,
        })

        return Object.assign({}, item, {
          amount,
          priceIncludeDiscount,
          priceIncludeTax,
          amountIncludeTax,
        })
      })
    },

    async getScolumnHides() {
      try {
        this.loading = true
        const response = await api('getPurchaseScolumns', {
          gridName: 'QuotationDetail',
        })
        this.columnHides = response?.data
        this.loading = false
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    updateAttachments(data) {
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
      this.dataAttach.attachments = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
    },

    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },
    handleButtonAddQuotation() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/sales/quotation/add' }))
      }
    },
    async handleAction(key) {
      if (key === 'add') {
        return this.handleButtonAddQuotation()
      }
      if (key === 'close') {
        this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'back') {
        this.$router.push(this.localePath({ path: '/sales/quotation' }))
      }
      if (key === 'unCheck') {
        return this.handleUncheck()
      }
      if (key === 'check') {
        return this.handleCheck()
      }
      if (key === 'attach') {
        this.$refs.attachments.showModal = true
        return
      }
      if (key === 'refresh') {
        return location.reload()
      }
      if (key === 'print') {
        return await this.printDetails()
      }
      if (key === 'save') {
        return await this.save()
      }
      if (key === 'delete') {
        return this.handleDeleteQuotation()
      }
      if (key === 'add') {
        const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
        if (!confirm) {
          return
        }

        return this.$router.push(
          this.localePath({ path: '/sales/quotation/add' })
        )
      }
      if (key === 'newItem') {
        return this.$refs.newItemMaster.openModal()
      }
      if (key === 'generateOrder') {
        return await this.generateOrder()
      }
      if (key === 'newSave') {
        return await this.newSave()
      }
      if (key === 'setQuotation') {
        return (this.$refs.baseSetColumnModal.showModal = true)
      }
    },
    async handleCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const res = await api('checkQuotation', this.$route.query?.quoteNO)
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          await this.getData()
          window.alert(this.$t('msg_IsChecked_0'))
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async handleUncheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
      if (confirm) {
        try {
          this.loading = true
          const res = await api('uncheckQuotation', this.$route.query?.quoteNO)
          const errorCode = res?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(res?.data?.response?.data?.message))
            return
          }
          if (res && res.status === SERVER_RESPONSE_CODE.OK) {
            await this.getData()
            window.alert(this.$t('msg_IsUnChecked_0'))
          }
        } catch (err) {
          console.error(err)
        } finally {
          this.loading = false
        }
      }
    },
    async printDetails() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmPrint_0'))
        if (!confirm) {
          return
        }

        this.loading = true
        const selectedItems = this.availableListDetails || []
        const listDetails = selectedItems.map((item, index) => ({
          ...item,
          id: index + 1,
        }))
        const payload = {
          lang: this.$i18n.locale,
          quoteNo: this.$route.query?.quoteNO,
          listDetails,
        }
        const response = await api('exportExcelQuotationDetail', payload)
        const validResponse =
          response?.status === SERVER_RESPONSE_CODE.OK && response?.data

        if (validResponse) {
          return downloadFileExcel(response.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    validateData() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      this.listErrorMessage = []
      const dataTableFilter = this.availableListDetails
      const selectedItems = dataTableFilter
      const payload = this.dataAttach

      const requiredFields = {
        orderDate: 'OrderDate',
        currencyId: 'Currency',
        customerID: 'CustomerName',
        effectiveDate: 'EffectiveDate',
        paymentId: 'PaymentID',
      }

      const requiredTableDetail = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        price: 'Price',
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
              (['quantity', 'price'].includes(key) &&
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
      const hasError = this.listErrorMessage.length > 0
      if (hasError) {
        return
      }

      return {
        selectedItems,
        payload,
      }
    },
    // eslint-disable-next-line require-await
    async save() {
      try {
        if (this.validateData) {
          const { selectedItems, payload } = this.validateData()

          const params = {
            orderNumber: this.$route.query?.quoteNO,
            data: {
              quotationRequest: {
                companyID: payload.customerID,
                customerID: payload.customerID,
                currencyID: payload.currencyId,
                departID: payload.departId,
                effectiveDate: payload.effectiveDate,
                memo: payload.memo,
                orderDate: payload.orderDate,
                paymentID: payload.paymentId,
                responsibleMan: payload.responsibleMan,
                taxRate: this.parseStringToFloat(payload.taxRate),
                totalAmount: this.parseStringToFloat(payload.totalAmount),
                discountRate: this.parseStringToFloat(payload.discountRate),
              },
              quotationDTLRequest: selectedItems.map((item) => {
                return {
                  itemId: item.itemID,
                  lineId: item.lineID,
                  memoDTL: item.memoDTL,
                  price: this.parseStringToFloat(item.price),
                  quantity: this.parseStringToFloat(item.quantity),
                }
              }),
            },
          }

          this.loading = true

          const response = await api('updateQuotation', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.getData()
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async newSave() {
      try {
        const { selectedItems, payload } = this.validateData()
        if (payload && selectedItems.length > 0) {
          const params = {
            fsoQuotation: {
              customerId: payload.customerID,
              currencyId: payload.currencyId,
              departId: payload.departId ?? 0,
              effectiveDate: payload.effectiveDate,
              memo: payload.memo,
              orderDate: new Date(),
              paymentId: payload.paymentId,
              responsibleMan: payload.responsibleMan,
              taxRate: this.parseStringToFloat(payload.taxRate),
              discountRate: this.parseStringToFloat(payload.discountRate),
            },
            fsoQuotationDTL: selectedItems.map((item) => {
              return {
                itemId: item.itemID,
                lineId: item.lineID,
                memoDTL: item.memoDTL,
                price: this.parseStringToFloat(item.price),
                quantity: this.parseStringToFloat(item.quantity),
              }
            }),
          }

          this.loading = true

          const response = await api('addQuotation', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push({
              path: `/${this.$i18n.locale}/sales/quotation/detail?quoteNO=${response.data?.data?._1.quoteNO}`,
            })
            this.getData(response.data?.data?._1.quoteNO)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getData(quotationNO) {
      try {
        this.loading = true
        const quoteNo = quotationNO ?? this.$route.query?.quoteNO
        const res = await api('getQuotationById', quoteNo)
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.form = res.data._1
          this.form.totalAmount = formatNumberWithCommas(
            res.data._1.totalAmount
          )
          this.dataTable = res.data._2.content?.map((item, index) => ({
            ...item,
            lineID: index + 1,
          }))
          if (!this.isCheck) {
            this.addNewLineData()
          }

          this.form.customerId = this.form.customerID
          this.form.orderDate = this.convertDate(this.form.orderDate)
          this.form.effectiveDate = this.convertDate(this.form.effectiveDate)
          this.form.editDate = this.convertDate(this.form.editDate)
          this.form.checkDate = this.convertDate(this.form.checkDate)
          this.form.taxRate = formatNumberWithCommas(this.form.taxRate)
          this.form.discountRate = formatNumberWithCommas(
            this.form.discountRate
          )
          this.dataAttach = JSON.parse(JSON.stringify(this.form))
          this.joinAttachmentString(this.form.attachments)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async generateOrder() {
      const lang = this.$i18n.locale
      try {
        const confirm = window.confirm(this.$t('btn_btnGenerateOrder_0'))
        if (!confirm) {
          return
        }
        this.loading = true
        const res = await api('generateSaleOrder', this.$route.query?.quoteNO)
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          const confirmGenerate = window.confirm(
            this.$t('msg_MessageJumpToSaleOrder_0')
          )
          if (!confirmGenerate) {
            return
          }
          this.$router.push(
            this.localePath({
              path: `/${lang}/sales/order/detail?sono=${res.data}`,
            })
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async handleDeleteQuotation() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const res = await api('deleteQuotation', {
          quoteNO: this.$route.query?.quoteNO,
        })
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsDeleted_0'))
          this.$router.push(this.localePath({ path: '/sales/quotation/add' }))
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    changeDataDetailTable(data) {
      this.dataTable = data
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
.add-enterprise-page {
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
