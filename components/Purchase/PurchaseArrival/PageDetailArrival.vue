<template>
  <div class="edit-purchase-arrival-page">
    <div v-show="false">
      <QRCode
        v-for="item in listGeneratedLabels"
        :id="item.qrCodeNo"
        :key="item.qrCodeNo"
        :value="item.qrCodeNo"
      ></QRCode>
    </div>
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormArrival
      ref="purchaseArrivalForm"
      :data="dataDetail"
      :is-disabled="isCheck"
    ></FormArrival>
    <BaseTableItemDetail
      ref="tableItem"
      class="edit-purchase-arrival-table-details"
      :table-content="dataTable"
      :disable-input="isCheck"
      :table-type="'POArrivalDetail'"
      :list-item-master="listItemCode"
      :column-hides="columnHides"
      :customer-id="form.supplierID"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      @changeTable="handleChangeTable"
    ></BaseTableItemDetail>
    <ModalImportArrival
      ref="importPurchaseArrival"
      :form="dataDetail"
      @update-details="handleImportData"
    ></ModalImportArrival>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="receiptNO"
      module-name="POArrival"
      @updateData="updateParamAttachments"
      @deleteData="deleteData"
    ></BaseModalAttach>
    <ModalImportExcel
      ref="modalImportExcel"
      @update-details="handleImportData"
    />
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    ></base-set-column-detail>
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import axios from 'axios'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { compact } from 'lodash'
import ModalImportArrival from './Import/ModalImportArrival.vue'
import FormArrival from './FormArrival.vue'
import BaseTableItemDetail from './BaseTableItemDetail.vue'
import { SERVER_RESPONSE_CODE, SMAPRI_DRIVER_RESPONSE } from '@/constants'
import api from '@/api/api'
import dateTimeMixins from '@/mixins/dateTime'
import { dateFormatYYYY, getUnique } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import systemMixins from '@/mixins/system'
import ModalImportExcel from '@/components/Purchase/PurchaseArrival/ImportExcel/ModalImportExcel'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '~/components/UI/Loading/BaseLoading.vue'

const axiosInstance = axios.create({
  headers: { 'ngrok-skip-browser-warning': 'any' }, // Skip ngrok warning page
})

export default {
  components: {
    BaseValidateMessage,
    ToolBar,
    FormArrival,
    BaseTableItemDetail,
    BaseModalAttach,
    ModalImportArrival,
    ModalImportExcel,
    BaseLoading,
    BaseSetColumnDetail,
  },
  mixins: [systemMixins, dateTimeMixins],
  data() {
    return {
      columnHides: [],
      listItemCode: [],
      listErrorMessage: [],
      form: {},
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
        {
          key: 'currencyID',
          fieldName: this.$t('lbl_Currency_0'),
        },
      ],
      lang: this.$i18n.locale,
      listGeneratedLabels: [
        {
          qrCodeNo: 'Placeholder NO',
          itemCode: '',
          itemName: '',
          lotNO: '',
          memo: '',
          quantity: 0,
          unitID: '',
          qrCodeImgUrl: '',
        },
      ],
    }
  },
  async fetch() {
    this.SET_SMAPRI_API_URL('') // Reset SmaPri API URL
    try {
      this.loading = true

      await Promise.all([
        this.getDataDetail(),
        this.getScolumnHides(),
        this.getListItemCode(),
        this.getUnitOptions(this.lang),
        this.getItemTypeOptionsFromAPI(this.lang),
        this.getInspectionTypesFromAPI(this.lang),
        this.setSmaPriApiURL(),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      warehouseOptions: 'base/getWarehouseOptions',
      unitOptions: 'base/getUnitOptions',
      itemTypeOptions: 'base/getItemTypeOptions',
      inspectionTypes: 'base/getInspectionTypes',
      smaPriApiUrl: 'base/getSmaPriApiUrl',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),
    isCheck() {
      return (
        !this.isCheckNullEmpty(this.form.checker) &&
        !this.isCheckNullEmpty(this.form.checkDate)
      )
    },
    disabledPrintLabel() {
      return !this.form.barcodeEnable
    },
    isEnabledBarcode() {
      return this.form.barcodeEnable
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
          key: 'importExcel',
          label: this.$t('lbl_ExcelInstallation_0'),
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
          key: 'printQRLabel',
          label: this.$t('btn_btnPrintLabel_0'),
          icon: '/images/qrcode.svg',
          disabled: this.disabledPrintLabel,
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

    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          typeInput: 'checkbox',
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
          disabled: true,
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
          options: this.formattedListItemTypes,
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
          key: 'receiptQuantity',
          name: this.$t('lbl_ReceiptQty_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'goodQty',
          name: this.$t('lbl_GoodQty_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'badQty',
          name: this.$t('lbl_BadQty_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: true,
          hidden: false,
        },
        {
          key: 'inspectionType',
          name: this.$t('lbl_InspectionType_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          typeInput: 'select',
          disabled: true,
          fieldRequired: false,
          hidden: false,
          options: this.inspectionTypes,
        },
        {
          key: 'price',
          name: this.$t('lbl_Price_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
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
          key: 'lotNO',
          name: this.$t('lbl_LotNo_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          typeInput: 'input',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'deliveryNO',
          name: this.$t('lbl_DeliveryNO_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          typeInput: 'input',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'warehouseID',
          name: this.$t('lbl_WarehouseID_0'),
          filter: 'select',
          width: 150,
          align: 'left',
          typeInput: 'select',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
          options: this.warehouseOptions,
        },
        {
          key: 'isPrintedLabel',
          name: this.$t('lbl_IsPrintedLabel_0'),
          filter: 'checkbox',
          align: 'center',
          dataType: 'checkbox',
          disabled: true,
          fieldRequired: false,
          hidden: false,
          options: this.checkboxOptions,
          headerFilter: 'select',
        },
        {
          key: 'memoDTL',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 200,
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

    formattedListItemTypes() {
      return this.itemTypeOptions.map((item) => ({
        text: this.$t(item.text),
        value: item.value,
      }))
    },

    checkboxOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },
  },
  watch: {
    form: {
      handler(val) {
        if (val) {
          this.dataDetail = JSON.parse(JSON.stringify(val))
          this.joinAttachmentString(compact(this.dataDetail.attachments))
        }
      },
    },

    'dataDetail.warehouseID': {
      immediate: true,
      handler(value) {
        this.dataTable = this.availableListDetails.map((item) =>
          Object.assign(item, {
            warehouseID: value,
          })
        )
      },
    },
  },

  methods: {
    ...mapActions({
      getUnitOptions: 'base/getUnitOptions',
      getItemTypeOptionsFromAPI: 'base/getItemTypeOptionsFromAPI',
      getInspectionTypesFromAPI: 'base/getInspectionTypesFromAPI',
      setSmaPriApiURL: 'base/setSmaPriApiURL',
    }),
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT',
      SET_SMAPRI_API_URL: 'base/SET_SMAPRI_API_URL',
    }),
    async handlePrintLabel() {
      this.loading = true
      try {
        const selectedItems = this.$refs.tableItem.listCheckbox.filter(
          (item) => item.value
        )
        const payload = {
          param: 'type=ARRIVAL_INSPECTION',
          data: selectedItems.map((item) => ({
            itemId: item.itemID,
            itemTypeId: item.itemTypeID,
            lineId: item.lineID,
            lotNo: item.lotNO,
            memo: item.memo,
            orderNo: this.form.receiptNO,
            quantity: item.quantity,
            rackNo: item.rackNO,
            unitId: item.unitID,
          })),
        }

        const labelRes = await api('generateQRCodeLabel', payload)

        if (labelRes.status === SERVER_RESPONSE_CODE.OK && labelRes.data) {
          this.listGeneratedLabels = labelRes.data.map((item) => ({
            qrCodeNo: item.barcodeNo,
            itemCode: item.itemCode,
            itemName: item.itemName,
            lotNO: item.lotNo,
            memo: item.memo,
            quantity: item.quantity || 0,
            unitID: item.unitID || '',
            qrCodeImgUrl: '',
          }))

          // Checking printer status
          const statusRes = await axiosInstance.get(
            `${this.smaPriApiUrl}/Printer/Status`
          )
          const { message, result } = this.getPrinterResponse(statusRes.data)
          if (result === SMAPRI_DRIVER_RESPONSE.RESULT_ERROR) {
            return window.alert(message)
          }

          await this.$nextTick()

          this.listGeneratedLabels = this.listGeneratedLabels.map((item) => {
            const qrCodeCanvas = document.getElementById(item.qrCodeNo)
            const qrCodeImgUrl = qrCodeCanvas.toDataURL()
            return {
              ...item,
              qrCodeImgUrl,
            }
          })

          // Checking if registered format qrcode label, neither register format
          const formatRes = await axiosInstance.get(
            `${this.smaPriApiUrl}/Format`
          )
          const curFormat = this.getPrinterResponseFormat(formatRes.data)
          if (curFormat !== SMAPRI_DRIVER_RESPONSE.FORMAT_LABEL_NAME) {
            await this.registerFormatLabel()
          }

          // Sending printing command
          let printError = false
          for (const label of this.listGeneratedLabels) {
            const printingRes = await this.sendPrintingCommand(label)
            if (printingRes.result === SMAPRI_DRIVER_RESPONSE.RESULT_ERROR) {
              printError = true
              window.alert(printingRes.message)
              break
            }
          }
          if (!printError) {
            window.alert(this.$t('msg_PrintLabelSuccessfully_0'))
            await this.handleRefresh()
          }
        }
      } catch (err) {
        console.log(err)
        return window.alert(
          `Error from server or SmaPri Driver API URL: ${this.smaPriApiUrl}!`
        )
      } finally {
        this.loading = false
      }
    },
    isCheckNullEmpty(value) {
      return value === null || !value
    },
    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },
    async getScolumnHides() {
      const response = await api('getPurchaseScolumns', {
        gridName: 'ArrivalDetail',
      })
      this.columnHides = response?.data
    },

    async getDataDetail() {
      this.loading = true
      const params = {
        receiptNo: this.$route.query?.receiptNO,
        lang: this.$i18n.locale,
      }
      const res = await api('getDetailPurchaseArrival', params)
      this.loading = false
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.form = res.data
        this.form.editDate = dateFormatYYYY(this.form.editDate)
        const listDetail = res?.data?.listDetail || []
        this.dataTable = listDetail.map((item, index) =>
          Object.assign({}, item, {
            poqty: item.receiptQuantity,
            lineID: index + 1,
            inspectionType: item.inspectionTypeID,
          })
        )

        this.form.receiptDate = dateFormatYYYY(this.form.receiptDate)
      }
    },
    handleAction(key) {
      if (key === 'add') {
        return this.handleButtonAdd()
      }
      if (key === 'save') {
        return this.handleButtonSave()
      }
      if (key === 'delete') {
        return this.handleButtonDelete()
      }
      if (key === 'import') {
        return this.handleOpenModalImport()
      }
      if (key === 'importExcel') {
        return (this.$refs.modalImportExcel.showModal = true)
      }
      if (key === 'attach') {
        return (this.$refs.attachments.showModal = true)
      }
      if (key === 'back') {
        return this.$router.push(this.localePath({ path: '/purchase/arrival' }))
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'check') {
        return this.handleButtonCheck()
      }
      if (key === 'refresh') {
        return this.handleRefresh()
      }
      if (key === 'setColumn') {
        return (this.$refs.baseSetColumnModal.showModal = true)
      }
      if (key === 'unCheck') {
        return this.handleButtonUnCheck()
      }
      if (key === 'printQRLabel') {
        const hasNoSelected =
          this.$refs.tableItem.listCheckbox.filter((item) => item.value)
            ?.length === 0
        if (hasNoSelected) {
          return window.alert(this.$t('msg_NoSelected_0'))
        }
        const hasPrintedRecord = this.$refs.tableItem.listCheckbox.some(
          (item) => item.value && item.isPrintedLabel
        )
        if (hasPrintedRecord) {
          const confirmRePrint = window.confirm(
            this.$t('msg_ConfirmRePrintingLabel_0')
          )
          if (!confirmRePrint) return
          this.handlePrintLabel()
        } else {
          this.handlePrintLabel()
        }
      }
    },
    resetTableDetailData() {
      this.$refs.tableItem.activeRow = -1
      this.$refs.tableItem.resetSearchData()
    },
    async handleRefresh() {
      try {
        this.loading = true
        this.resetTableDetailData()

        await Promise.all([
          this.$fetch(),
          this.$refs.purchaseArrivalForm.$fetch(),
        ])
        this.$refs.purchaseArrivalForm.refreshFormData()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleOpenModalImport() {
      const supplierID = this.dataDetail.supplierID
      if (supplierID) {
        this.UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT({
          supplierID,
        })

        return (this.$refs.importPurchaseArrival.showModal = true)
      }

      window.alert(this.$t('msg_NoselectSupplier_0'))
    },
    async handleButtonCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      const receiptNo = this.form?.receiptNO
      if (confirm) {
        this.loading = true
        const response = await api('checkPurchaseArrival', receiptNo)
        this.loading = false

        const errorCode = response?.data?.response?.status
        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response && response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsChecked_0'))
          this.getDataDetail()
        } else {
          window.alert(`${response?.message}`)
        }
      }
    },

    async handleButtonUnCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
      const receiptNo = this.form?.receiptNO
      if (confirm) {
        this.loading = true
        const response = await api('unCheckPurchaseArrival', receiptNo)
        this.loading = false

        const errorCode = response?.data?.response?.status
        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsUnChecked_0'))
          this.getDataDetail()
        } else {
          window.alert(`${response?.message}`)
        }
      }
    },
    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(this.localePath({ path: '/purchase/arrival/add' }))
      }
    },
    async handleButtonSave() {
      try {
        const { selectedItems, payload } = this.validateData()
        if (payload && selectedItems && selectedItems?.length > 0) {
          const params = {
            ...payload,
            listDetail: selectedItems.map((item, index) =>
              Object.assign({}, item, {
                lineID: index + 1,
                receiptQty: Number(item.receiptQuantity) || 0,
              })
            ),
          }

          this.loading = true
          const response = await api('updatePurchaseArrival', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.getDataDetail()
            return
          }

          window.alert(`${response?.message}`)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async handleButtonDelete() {
      const params = {
        receiptNO: this.form?.receiptNO,
      }
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (!confirm) {
        return
      }

      const response = await api('deletePurchaseArrival', params)
      const errorCode = response?.data?.response?.status

      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(response?.data?.response?.data?.message))
        return
      }
      if (response.status === SERVER_RESPONSE_CODE.OK) {
        window.alert(this.$t('msg_IsDeleted_0'))
        return this.$router.push(
          this.localePath({ path: '/purchase/arrival/add' })
        )
      }
      window.alert(`${response?.message}`)
    },

    handleImportData(data) {
      const finalData = data.map((item, index) => {
        return Object.assign({}, item, {
          receiptQuantity: item.blance,
          lineID: index + 1,
          goodQty: item.blance,
          inspectionType: item.inspectionTypeID,
          badQty: 0,
        })
      })
      this.dataTable = this.availableListDetails
        .concat(finalData)
        .map((item, index) => ({
          ...item,
          lineID: index + 1,
        }))
    },
    updateParamAttachments(formData) {
      this.form.attachments?.push(formData)
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
    handleChangeTable(data) {
      this.dataTable = data
    },
    validateData() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      this.listErrorMessage = []
      const selectedItems = this.availableListDetails || []
      const payload = this.form
      const requiredFields = {
        receiptDate: 'ReceiptDate',
        supplierID: 'SupplierName',
        receiver: 'Receiver',
      }
      const requiredTableDetail = {
        itemCode: 'ItemCode',
        receiptQuantity: 'ReceiptQty',
        warehouseID: 'Warehouse',
        goodQty: 'GoodQty',
      }

      for (const prop in requiredFields) {
        if (!payload[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      if (selectedItems && selectedItems.length === 0) {
        this.listErrorMessage.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        selectedItems.forEach((item) => {
          for (const key in requiredTableDetail) {
            if (
              (['receiptQuantity', 'goodQty'].includes(key) &&
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
            if (item.receiptQuantity < Number(item.goodQty)) {
              this.listErrorMessage.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_GoodQty_0`)}`,
                text: this.$t('msg_GoodQtyMoreThanReceiptQty_0'),
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
    getPrinterResponse(data) {
      let message = ''
      let result = ''
      if (data) {
        message = new DOMParser()
          .parseFromString(data, 'text/xml')
          .getElementsByTagName('message')[0].textContent
        result = new DOMParser()
          .parseFromString(data, 'text/xml')
          .getElementsByTagName('result')[0].textContent
      }
      return { message, result }
    },
    getPrinterResponseFormat(data) {
      let formatName = ''
      if (data) {
        const body = new DOMParser().parseFromString(data, 'text/xml')

        const format = body.getElementsByTagName('format')[0]

        if (format) {
          formatName = format.getAttribute('name')
        }
      }
      return formatName
    },
    async registerFormatLabel() {
      try {
        const res = await fetch('/format_label_qrcode.spfmtz')
        const formatLabel = await res.blob()
        const form = new FormData()
        form.append(
          '__format_archive_attach',
          new File([formatLabel], 'filename')
        )
        await axiosInstance.post(`${this.smaPriApiUrl}/Format`, form)
      } catch (error) {
        console.log(error)
      }
    },
    async sendPrintingCommand(label) {
      try {
        const selectedUnit = this.unitOptions.find(
          (unit) => unit.value === label.unitID
        )
        const unitName = selectedUnit ? selectedUnit.text : ''

        const formData = new FormData()
        formData.append('__format_id_number', 1)
        formData.append('Label', this.$t('lbl_PrintLabelCode_0'))
        formData.append('LabelValue', label.qrCodeNo)
        formData.append('ICodelbl', this.$t('lbl_ItemCode_0'))
        formData.append('ICodeValue', label.itemCode)
        formData.append('INamelbl', this.$t('lbl_ItemName_0'))
        formData.append('INameValue', label.itemName)
        formData.append('LotNOlbl', this.$t('lbl_LotNo_0'))
        formData.append('LotNOValue', label.lotNO || '')
        formData.append('Quantitylbl', this.$t('lbl_Quantity_0'))
        formData.append('QuantityValue', `${label.quantity}${unitName}`)
        formData.append('Memolbl', this.$t('lbl_Memo_0'))
        formData.append('MemoValue', label.memo || '')
        formData.append('qr_code', label.qrCodeImgUrl)

        const printingRes = await axiosInstance.post(
          `${this.smaPriApiUrl}/Format/Print`,
          formData
        )
        if (
          printingRes.status === SERVER_RESPONSE_CODE.OK &&
          printingRes.data
        ) {
          return this.getPrinterResponse(printingRes.data)
        }
        return { message: '', result: '' }
      } catch (error) {
        console.log(error)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-purchase-arrival-page {
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
