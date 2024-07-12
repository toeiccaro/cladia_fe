<template>
  <div class="edit-completion-report-page">
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
    <FormInputCompletionReport
      ref="completionReportForm"
      :list-item-code="listItemCode"
      :is-disabled="isCheck"
      :data="dataDetail"
      @update-warehouse="(data) => updateWarehouse(data)"
    />
    <BaseTableItemDetail
      ref="completionReportTableItem"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardOrder'"
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
      module-name="CompletionReport"
      @updateData="updateData"
      @deleteData="deleteData"
    />
    <ModalImportCompletionReport
      ref="importCompletionReport"
      :form="form"
      @update-details="handleImportData"
    />
    <BaseSetColumnDetail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
  </div>
</template>
<script>
import axios from 'axios'
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { compact } from 'lodash'
import FormInputCompletionReport from './FormInputCompletionReport.vue'
import ModalImportCompletionReport from './Import/ModalImportCompletionReport.vue'
import BaseTableItemDetail from './BaseTableItemDetail.vue'
import { getUnique, downloadFileExcel } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import { SERVER_RESPONSE_CODE, SMAPRI_DRIVER_RESPONSE } from '@/constants'

const axiosInstance = axios.create({
  headers: { 'ngrok-skip-browser-warning': 'any' }, // Skip ngrok warning page
})
export default {
  name: 'PageDetailCompletionReport',
  components: {
    BaseValidateMessage,
    ToolBar,
    BaseModalAttach,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    FormInputCompletionReport,
    ModalImportCompletionReport,
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
    try {
      this.SET_LOADING(true)
      this.SET_SMAPRI_API_URL('') // Reset SmaPri API URL
      await Promise.all([
        this.getListItemCode(),
        this.getData(),
        this.getItemTypeOptionsFromAPI(),
        this.getScolumnHides(),
        this.getUnitOptions(this.lang),
        this.getWarehouseOptions(this.$i18n.locale),
        this.setSmaPriApiURL(),
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
      getActiveButtonToolBar: 'getActiveButtonToolBar',
      smaPriApiUrl: 'getSmaPriApiUrl',
    }),

    isEnabledBarcode() {
      return this.form.barcodeEnable
    },

    checkboxOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ]
    },

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
          width: 50,
          align: 'left',
          fieldRequired: false,
          hidden: false,
          disabled: this.isCheck,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 50,
          align: 'center',
          fieldRequired: false,
          hidden: false,
          disabled: this.isCheck,
        },
        {
          key: 'deliveryDate',
          name: this.$t('lbl_DeliveryDate_0'),
          filter: 'datetime',
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
          width: 300,
          align: 'left',
          fieldRequired: true,
          hidden: false,
          disabled: this.isCheck,
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
          width: 400,
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
          key: 'lotNO',
          name: this.$t('lbl_LotNo_0'),
          filter: 'input',
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
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
          key: 'rackNo',
          name: this.$t('lbl_RackNO_0'),
          filter: 'input',
          align: 'left',
          fieldRequired: false,
          hidden: false,
          disabled: this.isCheck,
        },
        {
          key: 'isBad',
          name: this.$t('lbl_IsBad_0'),
          filter: 'checkbox',
          align: 'center',
          dataType: 'checkbox',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
          headerFilter: 'select',
          options: this.checkboxOptions,
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
          key: 'isPrintedLabel',
          name: this.$t('lbl_IsPrintedLabel_0'),
          filter: 'checkbox',
          width: 100,
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
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
          disabled: !this.getActiveButtonToolBar?.isPrint,
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
          disabled: !this.isEnabledBarcode,
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
        subQuantity: 0,
        deliveryDate: this.convertDate(new Date()),
        productionOrder: '',
        lotNO: '',
        warehouseFromID: null,
        warehouseToID: null,
        rackNO: null,
        isBad: false,
        memoDTL: '',
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
        this.dataDetail.quantity = this.dataTable
          .map((v) => (v.subQuantity ? v.subQuantity : 0))
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
      'setSmaPriApiURL',
    ]),
    ...mapMutations({
      SET_LOADING: 'base/SET_LOADING',
      SET_SMAPRI_API_URL: 'base/SET_SMAPRI_API_URL',
    }),
    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'CompletionReportDetail',
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

    updateWarehouse({ key, value }) {
      const newWarehouseData = this.dataTable.map((item) =>
        Object.assign({}, item, {
          [key]: value,
        })
      )
      this.setDataTableDetail(newWarehouseData)
    },

    async getData() {
      try {
        const params = {
          orderNo: this.$route.query?.orderNo,
          language: this.$i18n.locale,
        }
        const res = await api('getDetailCompletionReport', params)

        if (res.status === 200) {
          const { data } = res
          this.form = {
            ...data,
            quantity: data.totalQuantity,
          }
          this.dataDetail = JSON.parse(JSON.stringify(this.form))
          this.joinAttachmentString(compact(this.dataDetail.attachments))
          this.dataTable = res?.data?.detail?.map((item, index) => {
            Object.assign(item, {
              lineID: index + 1,
              deliveryDate: this.convertDate(item.deliveryDate),
              memoDTL: item.memoDtl,
              productionOrder: item.productionOrd,
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
      switch (key) {
        case 'add':
          this.handleButtonAddCompletionReport()
          break
        case 'attach':
          this.$refs.attachments.showModal = true
          break
        case 'save':
          this.handleUpdateCompletionReport()
          break
        case 'delete':
          this.handleButtonDeleteCompletionReport()
          break
        case 'back':
          this.$router.push(
            this.localePath({ path: '/production/completion-report' })
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
        case 'print':
          this.handlePrint()
          break
        case 'import':
          this.handleClickImport()
          break
        case 'printQRLabel': {
          const hasNoSelected =
            this.$refs.completionReportTableItem.listCheckbox.filter(
              (item) => item.value
            )?.length === 0
          if (hasNoSelected) {
            return window.alert(this.$t('msg_NoSelected_0'))
          }
          const hasPrintedRecord =
            this.$refs.completionReportTableItem.listCheckbox.some(
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
          break
        }

        default:
      }
    },

    async handlePrintLabel() {
      this.SET_LOADING(true)
      try {
        const selectedItems =
          this.$refs.completionReportTableItem.listCheckbox.filter(
            (item) => item.value
          )
        const payload = {
          param: 'type=COMPLETION_REPORT',
          data: selectedItems.map((item) => ({
            itemId: item.itemID,
            itemTypeId: item.itemTypeID,
            lineId: item.lineID,
            lotNo: item.lotNO,
            memo: item.memo,
            orderNo: this.form.orderNo,
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
        this.SET_LOADING(false)
      }
    },

    resetTableDetailData() {
      this.setDataTableDetail([])
      this.$refs.completionReportTableItem.resetSearchData()
      this.$refs.completionReportTableItem.activeRow = -1
    },

    async handleRefresh() {
      try {
        this.loading = true
        this.resetTableDetailData()
        await Promise.all([
          this.$fetch(),
          this.$refs.completionReportForm.$fetch(),
        ])
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
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
          orderNo: this.$route.query?.orderNo,
        }
        const res = await api('printCompletionReport', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        validResponse && downloadFileExcel(res.data)
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
        const response = await api('checkCompletionReport', params)
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
        const response = await api('unCheckCompletionReport', params)
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
        window.alert(this.$t(errorMessage))
      } catch (err) {
        console.error(err)
      } finally {
        this.SET_LOADING(false)
      }
    },
    handleButtonAddCompletionReport() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(
          this.localePath({ path: '/production/completion-report/add' })
        )
      }
    },

    validateData() {
      const listError = []
      const dataTableFilter = this.availableListDetails
      const requiredFields = {
        orderDate: 'OrderDate',
      }
      const requiredTableDetail = {
        itemCode: 'ItemCode',
        subQuantity: 'Quantity',
        warehouseToID: 'WarehouseDestination',
        warehouseFromID: 'WarehouseSource',
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
              (['quantity'].includes(key) &&
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

    async handleUpdateCompletionReport() {
      if (this.validateData) {
        const { dataTableFilter, payload } = this.validateData()
        const params = {
          form: {
            detail: dataTableFilter.map((item) => {
              return {
                detailMemo: item.memoDTL,
                subQuantity: this.parseStringToFloat(item.subQuantity),
                woLineID: item?.woLineID,
                woNo: item?.productionOrder,
                ...item,
              }
            }),
            isBad: payload.isBad,
            memo: payload.memo,
            orderDate: payload.orderDate,
            responsible: payload?.responsibleID,
            totalQuantity: Number(payload.quantity),
          },
          language: this.$i18n.locale,
          orderNo: this.form?.orderNo,
        }

        try {
          this.SET_LOADING(true)
          const response = await api('updateCompletionReport', params)
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
    async handleButtonDeleteCompletionReport() {
      const orderNo = this.form?.orderNo

      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        const response = await api('deleteCompletionReport', orderNo)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsDeleted_0'))
          this.$router.push(
            this.localePath({ path: '/production/completion-report/add' })
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
      this.$refs.completionReportForm.refresh()
    },

    deleteData(id) {
      this.form.attachments = this.form.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.form.attachments)
      this.$refs.completionReportForm.refresh()
    },

    joinAttachmentString(attachmentArray = []) {
      this.dataDetail.attachments = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
    },

    changeDataDetailTable(data) {
      this.setDataTableDetail(data)
    },
    handleClickImport() {
      this.$refs.importCompletionReport.showModal = true
    },
    handleImportData(data) {
      const cloneDataTable = [...this.availableListDetails, ...data]

      const existLineID = cloneDataTable.map((item) => item.lineID)
      const isUniqueExistLineID = new Set(existLineID).size > 0

      const canMerge =
        isUniqueExistLineID || this.availableListDetails.length > 0

      if (canMerge) {
        const newDataTable = this.availableListDetails
          .concat(data)
          .map((item, index) => ({
            ...item,
            productionOrder: item.orderNO,
            lineID: index + 1,
            deliveryDate: this.convertDate(new Date()),
            woLineID: item.lineID,
            subQuantity: item?.possibleImportQty || item.subQuantity,
          }))
        this.setDataTableDetail(newDataTable)
      }
      this.addNewLineData()
    },
    setDataTableDetail(data) {
      this.dataTable = data
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
.edit-completion-report-page {
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
