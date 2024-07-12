<template>
  <div class="add-completion-report">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormInputCompletionReport
      ref="completionReportForm"
      :key="refreshAddOrderFormKey"
      :list-item-code="listItemCode"
      :data="form"
      @update-warehouse="(data) => updateWarehouse(data)"
    />
    <BaseTableItemDetail
      ref="productionCompletionReport"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardOrder'"
      :customer-id="form.supplierID"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    >
      <template #customCheckbox> </template>
    </BaseTableItemDetail>

    <ModalImportCompletionReport
      ref="importCompletionReport"
      :form="form"
      @update-details="handleImportData"
    />
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNumber"
      module-name="SOOrder"
    />
    <BaseSetColumnDetail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import FormInputCompletionReport from './FormInputCompletionReport.vue'
import ModalImportCompletionReport from './Import/ModalImportCompletionReport.vue'
import BaseTableItemDetail from './BaseTableItemDetail.vue'
import { SERVER_RESPONSE_CODE } from '@/constants'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import dateTime from '@/mixins/dateTime'
import api from '@/api/api'
import systemMixins from '@/mixins/system'
import { getUnique } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
export default {
  components: {
    ToolBar,
    BaseModalAttach,
    BaseValidateMessage,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
    FormInputCompletionReport,
    ModalImportCompletionReport,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      refreshAddOrderFormKey: 0,
      listErrorMessage: [],
      listToolBars: [
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
          key: 'import',
          label: this.$t('btn_btnImport_0'),
          icon: '/images/import.png',
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
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
        },
        {
          key: 'check',
          label: this.$t('btn_btnCheck_0'),
          icon: '/images/check.png',
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
        },
        {
          key: 'printQRLabel',
          label: this.$t('btn_btnPrintLabel_0'),
          icon: '/images/qrcode.svg',
        },
        {
          key: 'attach',
          label: this.$t('btn_btnAttach_0'),
          icon: '/images/attach.png',
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
      ],
      defaultForm: {
        orderDate: this.convertDate(new Date()),
        detail: [],
        quantity: 0,
      },
      form: {},
      dataTable: [
        {
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
        },
      ],
      loading: false,
      isAddSuccess: false,
      lang: this.$i18n.locale,
      listItemCode: [],
      columnHides: [],
    }
  },

  async fetch() {
    try {
      this.form = Object.assign({}, this.defaultForm)
      await Promise.all([
        this.getListItemCode(),
        this.getItemTypeOptionsFromAPI(),
        this.getUnitOptions(this.$i18n.locale),
        this.getScolumnHides(),
        this.getWarehouseOptions(this.$i18n.locale),
      ])
    } catch (err) {
      console.error(err)
    }
  },

  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
      warehouseOptions: 'getWarehouseOptions',
    }),

    checkboxOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },

    ...mapGetters('base', ['getActiveButtonToolBar']),
    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
    },
    dataTableFilter() {
      return this.dataTable?.filter((item) => item.itemID)
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
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 50,
          align: 'center',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'deliveryDate',
          name: this.$t('lbl_DeliveryDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: false,
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
          disabled: false,
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
          disabled: false,
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
          key: 'rackNO',
          name: this.$t('lbl_RackNO_0'),
          filter: 'input',
          align: 'left',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'isBad',
          name: this.$t('lbl_IsBad_0'),
          filter: 'checkbox',
          align: 'center',
          dataType: 'checkbox',
          disabled: false,
          fieldRequired: false,
          hidden: false,
          options: this.checkboxOptions,
          headerFilter: 'select',
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
          disabled: false,
          fieldRequired: false,
          hidden: false,
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

    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'delete':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          case 'attach':
            item.disabled = !this.getActiveButtonToolBar?.isAttachments
            break
          case 'check':
            item.disabled = !this.getActiveButtonToolBar?.isCheck
            break
          case 'unCheck':
            item.disabled = !this.getActiveButtonToolBar?.isCheck
            break
          default:
            break
        }
        return item
      })
    },
  },
  watch: {
    dataTable: {
      handler() {
        this.form.quantity = this.dataTable
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
      'getUnitOptions',
      'getItemTypeOptionsFromAPI',
      'getWarehouseOptions',
    ]),

    dateIsPastOrPresent(date) {
      const isValidDate = !isNaN(new Date(date).getTime())

      const isPastOrPresent =
        new Date().getTime() - new Date(date).getTime() >= 0

      return isValidDate && isPastOrPresent
    },

    async getScolumnHides() {
      try {
        this.loading = true

        const response = await api('getScolumnHides', {
          gridName: 'CompletionReportDetail',
        })
        if (response.status === 200) {
          this.columnHides = response?.data || []
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    updateWarehouse({ key, value }) {
      const dataWarehouse = this.availableListDetails.map((item) =>
        Object.assign({}, item, {
          [key]: value,
        })
      )
      this.setDataTable(dataWarehouse)
      this.addNewLineData()
    },

    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },

    handleAction(key) {
      switch (key) {
        case 'add':
          this.handleButtonAddOrder()
          break

        case 'save':
          this.handleSaveCompletionReport()
          break

        case 'import':
          this.handleClickImport()
          break

        case 'delete':
          this.handleButtonDeleteOrder()
          break

        case 'attach':
          this.$refs.attachments.showModal = true
          break

        case 'back':
          this.$router.push(
            this.localePath({ path: '/production/completion-report' })
          )
          break

        case 'refresh':
          this.handleRefresh()
          break

        case 'close':
          this.$router.push(this.localePath({ path: '/' }))
          break

        case 'unCheck':
          this.handleButtonUnCheck()
          break

        case 'setColumn':
          this.$refs.baseSetColumnModal.showModal = true
          break
        case 'print':
          return window.confirm(this.$t('msg_ConfirmPrint_0'))
        default:
          break
      }
    },
    resetTableDetailData() {
      this.setDataTable([])
      this.$refs.productionCompletionReport.resetSearchData()
      this.$refs.productionCompletionReport.activeRow = -1
    },
    refreshFormData() {
      ++this.refreshAddOrderFormKey
    },
    async handleRefresh() {
      this.listErrorMessage = []
      this.resetTableDetailData()
      await Promise.all([
        this.$fetch(),
        this.$refs.completionReportForm.$fetch(),
      ])
      this.refreshFormData()
      this.addNewLineData()
    },
    handleButtonUnCheck() {
      return window.confirm(this.$t('msg_NoCheck_0'))
    },

    handleButtonAddOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
    },

    validateForm() {
      const errors = []
      const dataTable = this.availableListDetails

      const requiredFields = {
        orderDate: 'OrderDate',
      }
      const requiredTableDetails = {
        itemCode: 'ItemCode',
        subQuantity: 'Quantity',
        warehouseToID: 'WarehouseDestination',
        warehouseFromID: 'WarehouseSource',
      }

      Object.keys(requiredFields).forEach((field) => {
        if (!this.form[field]) {
          errors.push({
            fieldName: this.$t(`lbl_${requiredFields[field]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      })

      if (dataTable.length === 0) {
        errors.push({
          fieldName: this.$t('msg_Details_0'),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        dataTable.forEach((item) => {
          Object.keys(requiredTableDetails).forEach((field) => {
            if (
              (['subQuantity'].includes(field) &&
                !this.parseStringToFloat(item[field])) ||
              !item[field]
            ) {
              errors.push({
                fieldName: `${this.$t('lbl_LineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_${requiredTableDetails[field]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
              })
            }
          })
        })
      }

      this.listErrorMessage = getUnique(errors, 'fieldName')
      if (this.listErrorMessage.length > 0) {
        return
      }

      return {
        dataTableFilter: dataTable,
        payload: this.form,
      }
    },

    async handleSaveCompletionReport() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      const validateInfo = this.validateForm()

      if (validateInfo) {
        const { dataTableFilter, payload } = validateInfo

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
            totalQuantity: payload?.quantity,
          },
          language: this.$i18n.locale,
        }

        try {
          this.loading = true
          const response = await api('addCompletionReport', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push({
              path: `/${this.$i18n.locale}/production/completion-report/detail?orderNo=${response.data.orderNo}`,
            })
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.loading = false
        }
      }
    },

    handleClickImport() {
      this.$refs.importCompletionReport.showModal = true
    },

    handleButtonDeleteOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        location.reload()
        this.refreshFormData()
        window.alert(this.$t('msg_IsDeleted_0'))
      }
    },

    changeDataDetailTable(data) {
      this.setDataTable(data)
    },

    handleImportData(data) {
      const cloneDataTable = [...this.availableListDetails, ...data]

      const existLineID = cloneDataTable.map((item) => item.lineID)
      const isUniqueExistLineID = new Set(existLineID).size > 0

      const canMerge =
        isUniqueExistLineID || this.availableListDetails.length > 0

      if (canMerge) {
        const mergeDataImport = this.availableListDetails
          .concat(data)
          .map((item, index) => ({
            ...item,
            productionOrder: item.orderNO,
            lineID: index + 1,
            deliveryDate: this.convertDate(new Date()),
            woLineID: item.lineID,
            subQuantity: item?.possibleImportQty || item.subQuantity,
          }))
        this.setDataTable(mergeDataImport)
      }
      this.addNewLineData()
    },

    addNewLineData() {
      this.dataTable.push({
        ...this.newLine,
        lineID: this.availableListDetails.length + 1,
      })
    },

    setDataTable(data) {
      this.dataTable = data
    },
  },
}
</script>
<style lang="scss" scoped>
.add-completion-report {
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
