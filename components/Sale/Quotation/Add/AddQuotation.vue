<template>
  <div class="add-quotation-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <FormInputQuotation :params-quotation="form"></FormInputQuotation>
    <BaseTableItemDetail
      ref="tableItem"
      class="add-quotation-table-details"
      :table-content="dataTable"
      :disable-input="isDisableInput"
      :table-type="'quotationDetail'"
      :list-item-master="listItemCode"
      :column-hides="columnHides"
      :customer-id="form.customerID"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    ></BaseTableItemDetail>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="quoteNo"
      module-name="SOQuotation"
    ></BaseModalAttach>
    <ModalNewItemMaster ref="newItemMaster"></ModalNewItemMaster>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getQuotationDetailColumn"
    ></base-set-column-detail>
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import { getUnique } from '@/utils/utils'
import { SERVER_RESPONSE_CODE, DETAIL_ITEM_TABLE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar'
import BaseModalAttach from '@/components/UI/BaseModalAttach'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import FormInputQuotation from '@/components/Sale/Quotation/FormInputQuotation.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import ModalNewItemMaster from '~/components/MasterData/ItemMaster/Modal/ModalNewItemMaster'

export default {
  name: 'AddQuotationComponent',
  components: {
    ToolBar,
    FormInputQuotation,
    BaseModalAttach,
    BaseTableItemDetail,
    BaseValidateMessage,
    ModalNewItemMaster,
    BaseLoading,
    BaseSetColumnDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      form: {
        orderDate: this.convertDate(new Date()),
        taxRate: 0,
        totalAmount: 0,
      },
      loading: false,
      dataTable: [],
      listItemCode: [],
      listErrorMessage: [],
      columnHides: [],
    }
  },
  fetch() {
    this.addNewLineData()
    Promise.all([
      this.getQuotationDetailColumn(),
      this.getListItemCode(),
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
    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          typeInput: 'checkbox',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          typeInput: '',
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
          fieldRequired: true,
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
          key: 'memoDTL',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          typeInput: 'input',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },
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
          disabled: !this.getActiveButtonToolBar?.isDelete,
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
          disabled: !this.getActiveButtonToolBar?.isCheck,
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
          disabled: !this.getActiveButtonToolBar?.isCheck,
        },
        {
          key: 'newItem',
          label: this.$t('btn_btnNewItem_0'),
          icon: '/images/edit_add.png',
          width: '16px',
          height: '16px',
        },
        {
          key: 'generateOrder',
          label: this.$t('btn_btnGenerateOrder_0'),
          icon: '/images/set.png',
          disabled: true,
        },
        {
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
          disabled: !this.getActiveButtonToolBar?.isPrint,
        },
        {
          key: 'attach',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
          disabled: !this.getActiveButtonToolBar?.isAttachments,
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
    isDisableInput() {
      return !!(this.form?.checker && this.form.checkDate)
    },
    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },
  },

  methods: {
    ...mapActions('base', ['getUnitOptions', 'getItemTypeOptionsFromAPI']),
    async getQuotationDetailColumn() {
      try {
        this.loading = true
        const response = await api(
          'getScolumnHideDetail',
          DETAIL_ITEM_TABLE.SALE_QUOTATION_DETAIL
        )
        this.columnHides = response?.data
        this.loading = false
      } catch (error) {
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
    validateData() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      this.listErrorMessage = []
      const dataTableFilter = this.availableListDetails
      const selectedItems = dataTableFilter
      const payload = this.form

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
    async handleSaveQuotation() {
      try {
        const { selectedItems, payload } = this.validateData()
        if (payload && selectedItems && selectedItems.length > 0) {
          const params = {
            fsoQuotation: {
              customerId: payload.customerID,
              currencyId: payload.currencyId,
              departId: payload.departId ?? 0,
              effectiveDate: payload.effectiveDate,
              memo: payload.memo,
              orderDate: payload.orderDate,
              paymentId: payload.paymentId,
              responsibleMan: payload.responsibleMan,
              taxRate: this.parseStringToFloat(payload.taxRate),
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
            return response
          }
          return false
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleButtonDeleteQuotation() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        location.reload()
        window.alert(this.$t('msg_IsDeleted_0'))
      }
    },
    handleButtonAddQuotation() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
    },
    handleButtonUnCheck() {
      return window.confirm(this.$t('msg_NoCheck_0'))
    },
    async handleAction(key) {
      if (key === 'attach') {
        return (this.$refs.attachments.showModal = true)
      }
      if (key === 'refresh') {
        return location.reload()
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'back') {
        return this.$router.push(this.localePath({ path: '/sales/quotation' }))
      }
      if (key === 'delete') {
        return this.handleButtonDeleteQuotation()
      }
      if (key === 'save' || key === 'newSave') {
        const response = await this.handleSaveQuotation()
        if (response) {
          this.$router.push({
            path: `/${this.$i18n.locale}/sales/quotation/detail?quoteNO=${response.data?.data?._1.quoteNO}`,
          })
        }
        return
      }
      if (key === 'newItem') {
        return this.$refs.newItemMaster.openModal()
      }
      if (key === 'add') {
        return this.handleButtonAddQuotation()
      }
      if (key === 'unCheck') {
        return this.handleButtonUnCheck()
      }
      if (key === 'setColumn') {
        return (this.$refs.baseSetColumnModal.showModal = true)
      }
    },

    changeDataDetailTable(data) {
      this.dataTable = data
    },

    addNewLineData() {
      this.dataTable.push({
        ...this.newLine,
        lineID: this.dataTable.length + 1,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.add-quotation-page {
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
