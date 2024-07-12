<template>
  <div class="detail-outward-return-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormInputOutwardReturn
      ref="editOutwardReturnForm"
      :data="dataDetail"
      :is-disabled="isCheck"
      @update-warehouse="(data) => updateWarehouse(data)"
    />
    <BaseTableItemDetail
      ref="outwardReturnFormTableItems"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardReturn'"
      :customer-id="dataDetail.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    />
    <ModalImportOutwardReturn
      ref="importOutwardReturn"
      @update-modal-import-outward="handleImportMultipleData"
    />
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNO"
      module-name="OutWardReturn"
      @updateData="updateData"
      @deleteData="deleteData"
    />
    <BaseSetColumnDetail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { compact } from 'lodash'
import ModalImportOutwardReturn from './Import/ModalImportOutwardReturn.vue'
import FormInputOutwardReturn from '~/components/Outward/OutwardReturn/FormInputOutwardReturn.vue'
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
    FormInputOutwardReturn,
    BaseModalAttach,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    ModalImportOutwardReturn,
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
          key: 'supplierID',
          fieldName: this.$t('lbl_CustomerName_0'),
        },
      ],
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
        this.getWarehouseOptions(this.lang),
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
      return !!(this.dataDetail?.checkUser && this.dataDetail?.checkDate)
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
          key: 'warehouseID',
          name: this.$t('lbl_Warehouse_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
          options: this.warehouseOptions,
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
          key: 'reason',
          name: this.$t('lbl_Reason_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'wPono',
          name: this.$t('lbl_WPONO_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          disabled: true,
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
        warehouseID: '',
        memoDtl: '',
        reason: '',
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
    dataTable: {
      handler() {
        this.dataDetail.totalQuantity = this.dataTable
          .map((v) => (v.quantity ? v.quantity : 0))
          .reduce((totalQuantity, currentQuantity) => {
            return parseInt(totalQuantity) + parseInt(currentQuantity)
          }, 0)
      },
      deep: true,
    },
  },

  methods: {
    ...mapActions('base', [
      'getItemTypeOptionsFromAPI',
      'getUnitOptions',
      'getWarehouseOptions',
    ]),
    ...mapMutations({
      SET_LOADING: 'base/SET_LOADING',
      UPDATE_PAYLOAD_OUTWARD_RETURN_IMPORT:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_RETURN_IMPORT',
    }),
    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'OutwardReturnDetail',
      })
      if (response.status === 200) {
        this.columnHides = response?.data || []
      }
    },

    updateWarehouse({ key, value }) {
      this.dataTable = this.availableListDetails.map((item) =>
        Object.assign({}, item, {
          [key]: value,
        })
      )
      this.addNewLineData()
    },

    handleOpenModalImport() {
      const customerID = this.form?.customerID
      if (customerID) {
        this.UPDATE_PAYLOAD_SALE_RETURN_IMPORT({
          customerID,
        })

        return (this.$refs.importSaleReturn.showModal = true)
      }

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
        const res = await api('getDetailOutwardReturn', params)
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
          this.handleSaveOutwardReturn()
          break
        case 'delete':
          this.handleButtonDeleteOutwardReturn()
          break
        case 'import':
          this.handleClickImport()
          break
        case 'back':
          this.$router.push(
            this.localePath({ path: '/outward/outward-return' })
          )
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

    handleClickImport() {
      const supplierID = this.form?.supplierID

      if (!supplierID) {
        return window.alert(this.$t('msg_NoselectCustomer_0'))
      }

      this.UPDATE_PAYLOAD_OUTWARD_RETURN_IMPORT({
        supplierID,
      })

      this.$refs.importOutwardReturn.showModal = true
    },

    resetTableDetailData() {
      this.dataTable = []
      this.$refs.outwardReturnFormTableItems.resetSearchData()
      this.$refs.outwardReturnFormTableItems.activeRow = -1
    },

    async handleRefresh() {
      try {
        this.SET_LOADING(true)
        this.resetTableDetailData()
        await Promise.all([
          this.$fetch(),
          this.$refs.editOutwardReturnForm.$fetch(),
        ])
      } catch (err) {
        console.error(err)
      } finally {
        this.SET_LOADING(false)
      }
    },

    async handleButtonCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      if (!confirm) {
        return
      }

      try {
        this.SET_LOADING(true)
        const orderNo = this.form?.orderNO

        if (!orderNo) {
          return
        }
        const response = await api('checkOutwardReturn', orderNo)
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
      const orderNo = this.form?.orderNO
      if (!confirm) {
        return
      }

      try {
        this.SET_LOADING(true)
        const response = await api('unCheckOutwardReturn', orderNo)
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
          this.localePath({ path: '/outward/outward-return/add' })
        )
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
        supplierName: 'SupplierName',
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

    async handleSaveOutwardReturn() {
      if (this.validateData) {
        const { dataTableFilter, payload } = this.validateData()

        const params = {
          form: {
            ...payload,
            responsible: payload.responsibleID,
            detail: dataTableFilter.map((item) => {
              return {
                ...item,
                ID: item.id,
                amount: this.parseStringToFloat(item.amount),
                price: this.parseStringToFloat(item.price),
                quantity: this.parseStringToFloat(item.quantity),
              }
            }),
          },
          language: this.$i18n.locale,
          orderNo: this.form?.orderNO,
        }

        try {
          this.SET_LOADING(true)
          const response = await api('updateOutwardReturn', params)
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
          await this.handleRefresh()
        }
      }
    },
    async handleButtonDeleteOutwardReturn() {
      const orderNo = this.form?.orderNO
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        if (orderNo) {
          const response = await api('deleteOutwardReturn', orderNo)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
            this.$router.push(
              this.localePath({ path: '/outward/outward-return/add' })
            )
          } else {
            window.alert(`${response?.message}`)
          }
        }
      }
    },

    handleImportMultipleData(data) {
      const cloneDataTable = [...this.availableListDetails, ...data]
      const existLineID = cloneDataTable.map((item) => item.lineID)
      const isUniqueExistLineID = new Set(existLineID).size === 1

      const canMerge =
        isUniqueExistLineID || this.availableListDetails.length > 0

      if (canMerge) {
        const mergeData = data.map((item, index) => ({
          ...item,
          lineID: index + 1,
          wPono: item?.wPono ?? item?.orderNo,
          wpoID: Number(item.orderID),
          quantity: item.blance,
          amount: item.blance * item.price,
        }))

        this.dataTable = [...this.availableListDetails, ...mergeData].map(
          (item, index) => {
            return {
              ...item,
              lineID: index + 1,
              wPono: item?.wPono ?? item?.orderNo,
            }
          }
        )
      }
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
      // this.$refs.editOutwardReturnForm.refresh()
    },

    deleteData(id) {
      this.form.attachments = this.form.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.form.attachments)
      // this.$refs.editOutwardReturnForm.refresh()
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
.detail-outward-return-page {
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
