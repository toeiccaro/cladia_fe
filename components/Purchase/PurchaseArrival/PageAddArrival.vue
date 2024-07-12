<template>
  <div class="add-purchase-arrival-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormArrival ref="purchaseArrivalForm" :data="form"></FormArrival>
    <BaseTableItemDetail
      ref="tableItem"
      class="add-purchase-arrival-table-details"
      :table-content="dataTable"
      :disable-input="isDisableInput"
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
      :form="form"
      @update-details="handleImportData"
    ></ModalImportArrival>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="receiptNO"
      module-name="POArrival"
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
import { mapActions, mapGetters, mapMutations } from 'vuex'
import FormArrival from './FormArrival.vue'
import ModalImportArrival from './Import/ModalImportArrival.vue'
import BaseTableItemDetail from './BaseTableItemDetail.vue'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { getUnique } from '@/utils/utils'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import systemMixins from '@/mixins/system'
import ModalImportExcel from '@/components/Purchase/PurchaseArrival/ImportExcel/ModalImportExcel'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'

export default {
  components: {
    ToolBar,
    FormArrival,
    BaseTableItemDetail,
    BaseModalAttach,
    BaseValidateMessage,
    ModalImportArrival,
    ModalImportExcel,
    BaseLoading,
    BaseSetColumnDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      listErrorMessage: [],
      columnHides: [],
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
          key: 'importExcel',
          label: this.$t('lbl_ExcelInstallation_0'),
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
      defaultFormData: {
        receiptDate: this.convertDate(new Date()),
        totalQuantity: 0,
      },
      form: {},
      dataTable: [],
      loading: false,
      isAddSuccess: false,
      listItemCode: [],
      listFieldRequired: [
        {
          key: 'receiptDate',
          fieldName: this.$t('lbl_ReceiptDate_0'),
        },
        {
          key: 'supplierID',
          fieldName: this.$t('lbl_SupplierName_0'),
        },
      ],
      lang: this.$i18n.locale,
    }
  },

  async fetch() {
    try {
      this.form = Object.assign({}, this.defaultFormData)
      this.loading = true
      await Promise.all([
        this.getScolumnHides(),
        this.getListItemCode(),
        this.getUnitOptions(this.lang),
        this.getItemTypeOptionsFromAPI(this.lang),
        this.getInspectionTypesFromAPI(this.lang),
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
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    formattedListItemTypes() {
      return this.itemTypeOptions.map((item) => ({
        text: this.$t(item.text),
        value: item.value,
      }))
    },

    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
    },

    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          typeInput: 'checkbox',
          disabled: this.isDisableInput,
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
          disabled: this.isDisableInput,
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
          disabled: this.isDisableInput,
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
          disabled: this.isDisableInput,
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
          disabled: this.isDisableInput,
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
          disabled: this.isDisableInput,
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
          disabled: this.isDisableInput,
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
          disabled: this.isDisableInput,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },

    isDisableInput() {
      return !!(this.form?.checker && this.form.checkDate)
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
    checkboxOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },
  },
  watch: {
    'form.warehouseID': {
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
    }),
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT',
    }),

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

    handleAction(key) {
      switch (key) {
        case 'add':
          return this.handleButtonAdd()

        case 'importExcel':
          return (this.$refs.modalImportExcel.showModal = true)

        case 'save':
          return this.handleButtonSave()

        case 'delete':
          return this.handleButtonDelete()

        case 'import':
          return this.handleOpenModalImport()

        case 'attach':
          return (this.$refs.attachments.showModal = true)

        case 'back':
          return this.$router.push(
            this.localePath({ path: '/purchase/arrival' })
          )

        case 'refresh':
          return this.handleRefresh()

        case 'setColumn':
          return (this.$refs.baseSetColumnModal.showModal = true)

        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))

        case 'unCheck':
          return this.handleButtonUnCheck()

        default:
        // code block
      }
    },
    resetTableDetailData() {
      this.dataTable = []
      this.$refs.tableItem.resetSearchData()
      this.$refs.tableItem.activeRow = -1
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
    handleButtonUnCheck() {
      return window.confirm(this.$t('msg_NoCheck_0'))
    },

    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
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
          const response = await api('addPurchaseArrival', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsSaved_0'))
            const newData = response.data || {}
            return this.$router.push(
              `/${this.$i18n.locale}/purchase/arrival/detail?receiptNO=${newData?.receiptNO}`
            )
          }

          window.alert(`${response?.message}`)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    handleButtonDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        location.reload()
        window.alert(this.$t('msg_IsDeleted_0'))
      }
    },
    handleOpenModalImport() {
      const supplierID = this.form.supplierID
      if (supplierID) {
        this.UPDATE_PAYLOAD_PURCHASE_ARRIVAL_IMPORT({
          supplierID,
        })

        return (this.$refs.importPurchaseArrival.showModal = true)
      }
      window.alert(this.$t('msg_NoselectSupplier_0'))
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
  },
}
</script>
<style lang="scss" scoped>
.font-size-14 {
  font-size: 14px;
}

.pr-20 {
  padding-right: 20px;
}

.color-red {
  color: red;
}

.add-purchase-arrival-page {
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
