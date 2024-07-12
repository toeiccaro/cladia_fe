<template>
  <div class="edit-sale-order-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormInputMaterialDelivery
      ref="materialDeliveryForm"
      :data="dataDetail"
      :is-disabled="isCheck"
      :list-item-code="listItemCode"
      @update-shipment-to="(data) => updateTableMaterial(data)"
      @change-item-code="handleChangeItemCode"
    />
    <BaseTableItemDetail
      ref="materialDeliveryTableItem"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'materialDelivery'"
      :customer-id="dataDetail.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    />
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNo"
      module-name="MaterialDelivery"
      @updateData="updateData"
      @deleteData="deleteData"
    ></BaseModalAttach>
    <ModalImportMaterialDelivery
      ref="importMaterialDelivery"
      :form="form"
      @update-details="handleImportData"
    />
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
    <ModalQRCode ref="modalQRCode" :order-number="form.orderNo" />
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { compact } from 'lodash'
import ModalQRCode from './QRCode/ModalQRCode.vue'
import ModalImportMaterialDelivery from './Import/ModalImportMaterialDelivery.vue'
import FormInputMaterialDelivery from '@/components/Production/MaterialDelivery/FormInputMaterialDelivery.vue'
import { downloadFileExcel, getUnique, isEmptyValue } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import { SERVER_RESPONSE_CODE, ITEM_TYPE } from '@/constants'

export default {
  name: 'OrderDetail',
  components: {
    BaseValidateMessage,
    ToolBar,
    FormInputMaterialDelivery,
    BaseModalAttach,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    ModalImportMaterialDelivery,
    ModalQRCode,
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
      clickBomCompute: false,
      clickDateCompute: false,
      isChangeItemCode: false,
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
    newLine() {
      return {
        lineID: 1,
        subItemCode: '',
        subItemID: '',
        subItemName: '',
        subDescription: '',
        deliveryDate: '',
        lt: 0,
        memoDtl: '',
        subQuantity: 0,
        deliveredQuantity: 0,
        balanceQty: 0,
        unit: '',
        subUnitID: '',
        warehouseFromID: 0,
        warehouseToID: this.form.warehouseToID,
        productionOrder: '',
        isUpdate: true,
        isNewLine: true,
      }
    },
    itemTypeOptions() {
      return this.getItemTypeOptions
        .map((item) => ({
          text: this.$t(`${item.text}`),
          value: item.value,
        }))
        .filter(
          (item, idx) =>
            idx === ITEM_TYPE.EMPTY ||
            item.value === ITEM_TYPE.OUTSOURCED_PRODUCT ||
            item.value === ITEM_TYPE.MATERIAL
        )
    },
    isCheck() {
      return !!(this.form?.checkUser && this.form.checkDate)
    },
    disabledQRCodeBtn() {
      return !this.form.barcodeEnable
    },
    isEnabledBarcode() {
      return this.form.barcodeEnable
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
          key: 'deliveryDate',
          name: this.$t('lbl_DeliveryDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'lt',
          name: this.$t('lbl_LT_0'),
          width: 100,
          align: 'right',
          filter: 'number',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'subItemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'subItemTypeID',
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
          key: 'subItemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: 250,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'subDescription',
          name: this.$t('lbl_Description_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'subUnitID',
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
          key: 'subQuantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'deliveredQuantity',
          name: this.$t('lbl_DeliveredQuantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: true,
          hidden: false,
        },
        {
          key: 'balanceQty',
          name: this.$t('lbl_BalanceQty_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: true,
          hidden: false,
        },
        {
          key: 'warehouseFromID',
          name: this.$t('lbl_WarehouseSource_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
          options: this.warehouseOptions,
        },
        {
          key: 'warehouseToID',
          name: this.$t('lbl_WarehouseDestination_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
          options: this.warehouseOptions,
        },
        {
          key: 'productionOrder',
          name: this.$t('lbl_Production_Order_0'),
          filter: 'input',
          width: 200,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'barCode',
          name: this.$t('lbl_Barcode_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: this.isCheck,
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
          key: 'bomCompute',
          label: this.$t('btn_btnBomCompute_0'),
          icon: '/images/mode.png',
          disabled: this.isCheck,
        },
        {
          key: 'dateCompute',
          label: this.$t('btn_btnDateCompute_0'),
          icon: '/images/mode.png',
          disabled: this.isCheck,
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
            !this.getActiveButtonToolBar.isCheck ||
            this.isCheck ||
            this.isEnabledBarcode,
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
          key: 'generateQRCode',
          label: this.$t('btn_btnQRCode_0'),
          icon: '/images/qrcode.svg',
          disabled: this.disabledQRCodeBtn,
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
    form: {
      immediate: true,
      handler(val) {
        if (val) {
          this.dataDetail = JSON.parse(JSON.stringify(val))
          this.joinAttachmentString(compact(this.dataDetail.attachments))
        }
      },
    },
    'dataDetail.woNO': {
      handler(val) {
        if (val) {
          this.availableListDetails = this.availableListDetails.map((item) => {
            item.productionOrder = val
            return item
          })
        }
      },
    },
    // 'dataDetail.promiseDate': {
    //   handler() {
    //     this.isChangeItemCode = true
    //     this.clickBomCompute = false
    //     this.clickDateCompute = false
    //   },
    // },
  },

  methods: {
    ...mapActions('base', [
      'getItemTypeOptionsFromAPI',
      'getUnitOptions',
      'getWarehouseOptions',
    ]),
    ...mapMutations({
      SET_LOADING: 'base/SET_LOADING',
      UPDATE_PAYLOAD_MATERIAL_DELIVERY_IMPORT:
        'filterSort/UPDATE_PAYLOAD_MATERIAL_DELIVERY_IMPORT',
    }),

    handleChangeItemCode(data) {
      if (data) {
        this.clickBomCompute = false
        this.clickDateCompute = false
        this.isChangeItemCode = true
      }
    },

    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'MaterialDeliveryDetail',
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
        const res = await api('getDetailMaterialDelivery', params)
        if (res.status === 200) {
          this.form = res.data
          this.form.orderDate = this.convertDate(this.form.orderDate)
          this.form.warehouseIDTo = res.data.warehouseIDTo
          this.form.editDate = this.convertDate(this.form.editDate)
          this.form.checkDate = this.convertDate(this.form.checkDate)
          this.dataDetail = JSON.parse(JSON.stringify(this.form))
          this.joinAttachmentString(compact(this.dataDetail.attachments))

          this.dataTable = res?.data?.detail?.map((item, index) => {
            Object.assign(item, {
              lineID: index + 1,
              deliveryDate: this.convertDate(item.deliveryDate),
            })
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
      this.actionKey = key
      switch (key) {
        case 'add':
          this.addMaterialDelivery()
          break
        case 'attach':
          this.$refs.attachments.showModal = true
          break
        case 'save':
          this.handleUpdateMaterialDelivery()
          break
        case 'delete':
          this.handleButtonDeleteMaterialDelivery()
          break
        case 'back':
          this.$router.push(
            this.localePath({ path: '/production/material-delivery/' })
          )
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
        case 'import':
          this.handleButtonImport()
          break
        case 'bomCompute':
          this.handleButtonCompute()
          break
        case 'dateCompute':
          this.handleButtonDateCompute()
          break
        case 'print':
          this.handlePrint()
          break
        case 'generateQRCode':
          this.handleGenerateQRCode()
          break
        default:
      }
    },

    resetTableDetailData() {
      this.dataTable = []
      this.$refs.materialDeliveryTableItem.resetSearchData()
      this.$refs.materialDeliveryTableItem.activeRow = -1
      this.clickBomCompute = false
      this.clickDateCompute = false
    },

    async handleRefresh() {
      try {
        this.loading = true
        this.resetTableDetailData()
        await Promise.all([
          this.$fetch(),
          this.$refs.materialDeliveryForm.$fetch(),
        ])
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    confirmAction(message) {
      return window.confirm(message)
    },

    async handleApiResponse(response, successMessage, errorMessage) {
      if (response.status === SERVER_RESPONSE_CODE.OK) {
        window.alert(successMessage)
        await this.getData()
      } else {
        window.alert(`${response?.message}`)
      }
    },

    async handleButtonCheck() {
      const confirm = await this.confirmAction(this.$t('msg_ConfirmCheck_0'))
      if (!confirm) {
        return
      }

      const params = this.form?.orderNo

      try {
        this.SET_LOADING(true)
        const response = await api('checkMaterialDelivery', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        await this.handleApiResponse(response, this.$t('msg_IsChecked_0'))
      } catch (err) {
        console.error(err)
      } finally {
        this.SET_LOADING(false)
      }
    },

    async handleButtonUnCheck() {
      const confirm = await this.confirmAction(this.$t('msg_ConfirmUncheck_0'))
      if (!confirm) {
        return
      }

      const params = this.form?.orderNo

      try {
        this.SET_LOADING(true)
        const response = await api('unCheckMaterialDelivery', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        await this.handleApiResponse(
          response,
          this.$t('msg_IsUnChecked_0'),
          response?.data?.response?.data?.message
        )
      } catch (err) {
        console.error(err)
      } finally {
        this.SET_LOADING(false)
      }
    },
    addMaterialDelivery() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(
          this.localePath({ path: '/production/material-delivery/add' })
        )
      }
    },

    validateData() {
      const listError = []
      const dataTableFilter = this.availableListDetails
      const requiredFields = {
        orderDate: 'OrderDate',
        itemCode: 'ItemCode',
        quantity: 'Quantity',
      }
      const requiredTableDetail = {
        subItemCode: 'ItemCode',
        subQuantity: 'Quantity',
        warehouseFromID: 'WarehouseSource',
        warehouseToID: 'WarehouseDestination',
        deliveryDate: 'DeliveryDate'
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
              (key === 'subQuantity' && !this.parseStringToFloat(item[key])) ||
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
    async handleUpdateMaterialDelivery() {
      if (this.validateData) {
        const { dataTableFilter, payload } = this.validateData()
        const detailIds = this.availableListDetails
          .map((item) => item.id)
          .filter(Boolean)

        this.dataDetail.detail?.forEach(
          (item) =>
            !detailIds.includes(item.id) &&
            dataTableFilter.push({ ...item, isDeleted: true })
        )
        const params = {
          form: {
            customerID: payload.customerID,

            detail: dataTableFilter
              .filter((item) => !item.isDeleted)
              .map((itemDetail) => {
                return {
                  ...itemDetail,
                  barcode: itemDetail.barCode,
                  subQuantity: Number(itemDetail.subQuantity),
                }
              }),
            itemID: payload.itemID,
            memo: payload.memo,
            orderDate: payload.orderDate,
            promiseDate: payload.promiseDate,
            quantity: payload.quantity,
            responsibleID: payload?.responsibleID,
            startDate: payload.startDate,
            warehouseToID: payload.warehouseToID,
            woLineNO: payload.woLineNO,
            woNO: payload.woNO || '',
          },
          language: this.$i18n.locale,
          orderNo: this.form?.orderNo,
        }

        try {
          this.SET_LOADING(true)
          const response = await api('updateMaterialDelivery', params)
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
    async handleButtonDeleteMaterialDelivery() {
      const orderNo = this.form?.orderNo

      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        const response = await api('deleteMaterialDelivery', orderNo)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsDeleted_0'))
          this.$router.push(
            this.localePath({ path: '/production/material-delivery/add' })
          )
        } else {
          window.alert(`${response?.message}`)
        }
      }
    },

    updateData(data) {
      this.form.attachments?.push(data)
      this.joinAttachmentString(this.form.attachments)
      this.$refs.materialDeliveryForm.refresh()
    },

    deleteData(id) {
      this.form.attachments = this.form.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.form.attachments)
      this.$refs.materialDeliveryForm.refresh()
    },

    joinAttachmentString(attachmentArray = []) {
      this.dataDetail.attachments = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
    },

    changeDataDetailTable(data) {
      this.dataTable = data
    },
    handleButtonImport() {
      if (this.form.itemID) {
        this.UPDATE_PAYLOAD_MATERIAL_DELIVERY_IMPORT({
          itemID: this.form.itemID,
        })
      }
      this.$refs.importMaterialDelivery.showModal = true
    },

    handleImportData(data) {
      this.clickBomCompute = false
      this.clickDateCompute = false
      // this.isChangeItemCode = true
      this.dataDetail.promiseDate = data.promiseDate?.value
      this.dataDetail.itemCode = data.itemCode?.value
      this.dataDetail.customerID = data.customerID?.value
      this.dataDetail.customerName = data.customerName?.value
      this.dataDetail.itemName = data.itemName?.value
      this.dataDetail.unit = data.unit?.value
      this.dataDetail.itemID = data.itemID?.value
      this.dataDetail.quantity = data.blance?.value
      this.dataDetail.itemTypeID = data.itemTypeID.value
      this.dataDetail.sono = data.sono?.value
      this.dataDetail.startDate = data.startDate?.value
      this.form.woLineNO = data.lineID?.value
      this.form.woNO = data.orderNO?.value
      this.$refs.materialDeliveryForm.resetForm()
    },
    validateBomComputeData() {
      this.listErrorMessage = []

      const requiredFields = {
        itemID: 'ItemCode',
        promiseDate: 'PromiseDate',
        quantity: 'ProductionQuantity',
      }

      for (const prop in requiredFields) {
        isEmptyValue(this.form[prop]) &&
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
      }
    },
    async handleButtonCompute() {
      this.clickBomCompute = true
      try {
        this.loading = true

        this.validateBomComputeData()
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        // get orderNo after import
        const payload = {
          itemId: this.dataDetail.itemID,
          quantity: this.dataDetail.quantity,
        }

        const res = await api('newBomComputeMaterialDelivery', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        // if itemCode is changed, get new data
        if (this.isChangeItemCode) {
          this.dataTable = res.data.map((item, index) => ({
            ...item,
            lineID: index + 1,
            subItemTypeID: item.itemTypeID ?? item.subItemTypeID,
            lt: item.leadTime,
            warehouseFromID: item.warehouseID,
            deliveryDate: '',
          }))
        } else {
          // get new data bom compute
          const dataBomCompute = res.data.map((item) => {
            const { deliveryDate, ...rest } = item
            return rest
          })
          // remove last object newLine
          this.dataTable.pop()
          // merge new bomCompute data into current data
          this.dataTable = this.dataTable.map((item, index) => {
            return {
              ...item,
              ...dataBomCompute[index],
            }
          })
        }

        // if clickBomCompute 2 times clear delivery date
        if (this.availableListDetails[0].deliveryDate !== '') {
          this.dataTable = this.availableListDetails.map((item) => {
            return {
              ...item,
              deliveryDate: '',
            }
          })
        }

        // this.dataDetail.startDate = !this.isChangeItemCode
        //   ? this.availableListDetails[0]?.deliveryDate
        //   : this.clickDateCompute
        //   ? this.availableListDetails[0]?.deliveryDate
        //   : ''

        this.addNewLineData()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleButtonDateCompute() {
      this.clickDateCompute = true
      try {
        this.loading = true

        this.validateBomComputeData()
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        // get orderNo after import
        const payload = {
          startDate: this.dataDetail.startDate || '',
          form: this.availableListDetails
        }

        const res = await api('newDateComputeMaterialDelivery', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        // if item code is changed, get the new data date compute
        if (this.isChangeItemCode) {
          // if bomCompute is clicked, update new data
          if (this.clickBomCompute) {
            this.dataTable = res.data.map((item, index) => {
              return {
                ...item,
                lineID: index + 1,
                subItemTypeID: item.itemTypeID ?? item.subItemTypeID,
                lt: item.leadTime,
                warehouseFromID: item.warehouseID,
              }
            })
          } else {
            // just fill deliveryDate
            // this.dataTable = res.data.map((item, index) => {
            //   return {
            //     lineID: index + 1,
            //     deliveryDate: item.deliveryDate,
            //   }
            // })
            this.dataTable = []
          }
        } else {
          // if itemCode is not changed, just update deliveryDate

          // get new deliveryDate
          const dataDateCompute = res.data.map((item, index) => {
            return {
              lineID: index + 1,
              deliveryDate: item.deliveryDate,
            }
          })

          this.dataTable.pop()
          // fill new deliveryDate into dataTable
          for (let i = 0; i < this.dataTable.length; i++) {
            for (let j = 0; j < dataDateCompute.length; j++) {
              if (this.dataTable[i].lineID === dataDateCompute[j].lineID) {
                this.dataTable[i].deliveryDate = dataDateCompute[j].deliveryDate
              }
            }
          }
        }

        // this.dataDetail.startDate = this.availableListDetails[0]?.deliveryDate

        this.addNewLineData()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    updateTableMaterial(data) {
      this.dataTable = this.dataTable.map((item) => {
        return {
          ...item,
          warehouseToID: data.warehouseToID,
        }
      })
    },
    addNewLineData() {
      this.dataTable.push({
        ...this.newLine,
        lineID: this.availableListDetails.length + 1,
      })
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
          orderNo: this.$route.query?.orderNo,
        }
        const res = await api('printMaterialDelivery', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        validResponse && downloadFileExcel(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleGenerateQRCode() {
      this.$refs.modalQRCode.showModal = true
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
