<template>
  <div class="edit-sale-order-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormInputOpOrder
      ref="editOrderForm"
      :data="dataDetail"
      :is-disabled="isCheck"
    ></FormInputOpOrder>
    <base-table-item-detail
      ref="outwardOrderTableItem"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardOrder'"
      :customer-id="dataDetail.supplierID"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :new-line="newLine"
      :is-purchase="true"
      @changeTable="changeDataDetailTable"
    />
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNo"
      module-name="OutwardOrder"
      @updateData="updateData"
      @deleteData="deleteData"
    ></BaseModalAttach>
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
import { compact } from 'lodash'
import FormInputOpOrder from '~/components/Outward/OutwardOrder/FormInputOutwardOrder.vue'
import {
  getUnique,
  formatNumberWithCommas,
  downloadFileExcel,
} from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import { SERVER_RESPONSE_CODE, SERVER_ERROR_MESSAGE } from '@/constants'

export default {
  name: 'OutwardOrderDetail',
  components: {
    BaseValidateMessage,
    ToolBar,
    FormInputOpOrder,
    BaseModalAttach,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
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
      listItemCode: [],
      columnHides: [],
      lang: this.$i18n.locale,
    }
  },

  async fetch() {
    try {
      this.SET_LOADING(true)
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
      this.SET_LOADING(false)
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
          key: 'promiseDate',
          name: this.$t('lbl_PromiseDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
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
        {
          key: 'endQuantity',
          name: this.$t('lbl_EndQuantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: true,
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
        itemCode: '',
        itemID: '',
        itemTypeID: '',
        itemName: '',
        description: '',
        unitID: '',
        quantity: 0,
        price: 0,
        amount: 0,
        endQuantity: 0,
        promiseDate: this.convertDate(new Date()),
        memoDtl: '',
        isUpdate: true,
        isNewLine: true,
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
    ...mapMutations('base', ['SET_LOADING']),
    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'OutwardOrderDetail',
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

    async getData() {
      try {
        const params = {
          orderNo: this.$route.query?.orderNo,
          language: this.$i18n.locale,
        }
        const res = await api('getDetailOutwardOrder', params)
        if (res.status === 200) {
          this.form = res.data
          this.form.orderDate = this.convertDate(this.form.orderDate)
          this.form.editDate = this.convertDate(this.form.editDate)
          this.form.checkDate = this.convertDate(this.form.checkDate)
          this.form.taxRate = formatNumberWithCommas(this.form.taxRate)
          this.form.totalAmount = formatNumberWithCommas(this.form.totalAmount)
          this.dataDetail = JSON.parse(JSON.stringify(this.form))
          this.joinAttachmentString(compact(this.dataDetail.attachments))

          this.dataTable = res?.data?.detail?.map((item, index) => {
            item.promiseDate = this.convertDate(item.promiseDate)
            item.lineID = index + 1
            return item
          })

          if (!this.isCheck) {
            const newLine = {
              ...this.newLine,
              lineID: this.dataTable.length + 1,
            }
            this.dataTable.push(newLine)
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
          this.handleUpdateOutwardOrder()
          break
        case 'delete':
          this.handleButtonDeleteOrder()
          break
        case 'back':
          this.$router.push(this.localePath({ path: '/outward/outward-order' }))
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
        case 'print':
          return this.handlePrint()
        default:
      }
    },

    async handlePrint() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmPrint_0'))
        if (!confirm) {
          return
        }

        this.loading = true
        const payload = {
          language: this.lang,
          orderNo: this.form?.orderNo,
        }
        const res = await api('printOutwardOrder', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        validResponse && downloadFileExcel(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    resetTableDetailData() {
      this.dataTable = []
      this.$refs.outwardOrderTableItem.resetSearchData()
      this.$refs.outwardOrderTableItem.activeRow = -1
    },

    async handleRefresh() {
      try {
        this.loading = true
        this.resetTableDetailData()
        await Promise.all([this.$fetch(), this.$refs.editOrderForm.refresh()])
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleButtonCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      const params = this.form?.orderNo
      if (!confirm) {
        return
      }

      try {
        this.SET_LOADING(true)
        const response = await api('checkOutwardOrder', params)
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
        this.SET_LOADING(false)
      }
    },

    async handleButtonUnCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
      const params = this.form?.orderNo
      if (!confirm) {
        return
      }

      try {
        this.SET_LOADING(true)
        const response = await api('UnCheckOutwardOrder', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
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
        this.SET_LOADING(false)
      }
    },
    handleButtonAddOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(
          this.localePath({ path: '/outward/outward-order/add' })
        )
      }
    },

    validateData() {
      const listError = []
      const dataTableFilter = this.availableListDetails
      const requiredFields = {
        orderDate: 'OrderDate',
        currencyID: 'Currency',
        supplierID: 'SupplierName',
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

    async handleUpdateOutwardOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }
      if (this.validateData) {
        const { dataTableFilter, payload } = this.validateData()

        const params = {
          form: {
            ...payload,
            detail: dataTableFilter.map((item) => {
              return {
                price: this.parseStringToFloat(item.price),
                quantity: this.parseStringToFloat(item.quantity),
                amount: this.parseStringToFloat(item.amount),
                description: item.description,
                endQuantity: this.parseStringToFloat(item.endQuantity),
                itemID: item.itemID,
                id: item.id,
                itemTypeID: item.itemTypeID,
                itemCode: item.itemCode,
                memoDtl: item.memoDtl,
                promiseDate: item.promiseDate,
                unitID: item.unitID,
                isDeleted: item.isDeleted,
              }
            }),
          },
          language: this.$i18n.locale,
          orderNo: this.form?.orderNo,
        }

        try {
          this.SET_LOADING(true)
          const response = await api('updateOutwardOrder', params)
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
          this.SET_LOADING(false)
        }
      }
    },
    async handleButtonDeleteOrder() {
      const orderNo = this.form?.orderNo

      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        const response = await api('deleteOutwardOrder', orderNo)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsDeleted_0'))
          this.$router.push(
            this.localePath({ path: '/outward/outward-order/add' })
          )
        } else {
          window.alert(`${response?.message}`)
        }
      }
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
      this.dataDetail.attachments = attachmentArray
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
