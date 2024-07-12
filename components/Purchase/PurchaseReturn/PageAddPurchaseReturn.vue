<template>
  <div class="add-purchase-return-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormPurchaseReturn
      ref="formAddPurchaseReturn"
      :data="form"
      @on-change-warehouse="changeDetailsWarehouse"
    />
    <BaseTableItemDetail
      ref="tableDetails"
      class="add-purchase-return-table-details"
      :table-content="dataTable"
      :disable-input="isDisableInput"
      :table-type="'POReturnDetail'"
      :list-item-master="listItemCode"
      :column-hides="columnHides"
      :customer-id="form.supplierID"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="handleChangeTable"
    ></BaseTableItemDetail>
    <ModalImportPurchaseReturn
      ref="importPurchaseReturn"
      :form="form"
      @update-details="handleImportData"
    ></ModalImportPurchaseReturn>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="rtNO"
      module-name="POReturn"
    ></BaseModalAttach>
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
import ModalImportPurchaseReturn from './Import/ModalImportPurchaseReturn'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar'
import BaseModalAttach from '@/components/UI/BaseModalAttach'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import systemMixins from '@/mixins/system'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import FormPurchaseReturn from '@/components/Purchase/PurchaseReturn/FormPurchaseReturn'

export default {
  components: {
    ToolBar,
    FormPurchaseReturn,
    BaseModalAttach,
    BaseValidateMessage,
    ModalImportPurchaseReturn,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      columnHides: [],
      listItemCode: [],
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
      form: {
        rtDate: this.convertDate(new Date()),
        totalQty: 0,
      },
      dataTable: [],
      loading: false,
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.addNewLineData()
      await Promise.all([
        this.getListItemCode(),
        this.getScolumnHides(),
        this.getWarehouseOptionsFromAPI(this.lang),
        this.getUnitOptions(this.lang),
        this.getItemTypeOptionsFromAPI(this.lang),
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
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),
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
    newLine() {
      return {
        productName: null,
        unit: null,
        unitID: null,
        warehouseID: null,
        returnQty: 0,
        price: 0,
        amount: 0,
        itemCode: '',
        itemName: '',
        itemId: '',
        description: '',
        reason: '',
        isNewLine: true,
        isUpdate: true,
      }
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
          key: 'returnQty',
          name: this.$t('lbl_RtQty_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          typeInput: 'number',
          disabled: this.isDisableInput,
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
          disabled: this.isDisableInput,
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
          key: 'lotNO',
          name: this.$t('lbl_LotNo_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          typeInput: 'input',
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
          typeInput: 'select',
          disabled: this.isDisableInput,
          fieldRequired: true,
          hidden: false,
          options: this.warehouseOptions,
        },
        {
          key: 'receiptNO',
          name: this.$t('lbl_ReceiptNo_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          typeInput: 'input',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'reason',
          name: this.$t('lbl_Reason_0'),
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

    formattedListItemTypes() {
      return this.itemTypeOptions.map((item) => ({
        text: this.$t(item.text),
        value: item.value,
      }))
    },
  },

  methods: {
    ...mapActions({
      getWarehouseOptionsFromAPI: 'base/getWarehouseOptions',
      getUnitOptions: 'base/getUnitOptions',
      getItemTypeOptionsFromAPI: 'base/getItemTypeOptionsFromAPI',
    }),
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT',
    }),
    async getScolumnHides() {
      try {
        this.loading = true
        const response = await api('getPurchaseScolumns', {
          gridName: 'POReturnDetail',
        })
        this.columnHides = response?.data
        this.loading = false
      } catch (error) {
        console.error(error)
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

    changeDetailsWarehouse(data) {
      this.dataTable = this.availableListDetails.map((item, index) =>
        Object.assign(item, {
          warehouseID: data,
          lineID: index + 1,
        })
      )
      this.addNewLineData()
    },

    handleAction(key) {
      switch (key) {
        case 'add':
          return this.handleButtonAdd()
        case 'save':
          return this.savePurchaseReturn()
        case 'delete':
          return this.handleButtonDelete()
        case 'import':
          return this.handleOpenModalImport()
        case 'attach':
          return (this.$refs.attachments.showModal = true)
        case 'back':
          return this.$router.push(
            this.localePath({
              path: '/purchase/purchase-return',
            })
          )
        case 'refresh':
          return this.handleButtonRefresh()
        case 'setColumn':
          return (this.$refs.baseSetColumnModal.showModal = true)
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        case 'unCheck':
          return this.handleButtonUnCheck()
        default:
          break
      }
    },

    handleButtonRefresh() {
      try {
        this.loading = true
        this.resetTableDetailData()
        this.form = {
          rtDate: this.convertDate(new Date()),
          totalQty: 0,
        }
        this.listErrorMessage = []
        this.$refs.formAddPurchaseReturn.getListSupplier()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    resetTableDetailData() {
      this.dataTable = []
      this.$refs.tableDetails.activeRow = -1
      this.$refs.tableDetails.resetSearchData()
      this.addNewLineData()
    },
    handleButtonUnCheck() {
      return window.confirm(this.$t('msg_NoCheck_0'))
    },

    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.handleButtonRefresh()
      }
    },

    async savePurchaseReturn() {
      const shouldSave = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!shouldSave) {
        return
      }

      this.listErrorMessage = []

      const payload = this.form
      const listDetail = this.availableListDetails || []

      listDetail.forEach((item, index) => {
        item.lineID = index + 1
        item.wareHouseID = item.warehouseID
        item.price = this.parseStringToFloat(item.price)
      })

      const finalPayload = {
        ...payload,
        listDetail,
      }

      const requiredFields = {
        rtDate: 'RtDate',
        supplierID: 'SupplierName',
      }

      for (const [prop, fieldName] of Object.entries(requiredFields)) {
        if (!finalPayload[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${fieldName}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }

      const hasNoDetails = listDetail.length === 0
      if (hasNoDetails) {
        this.listErrorMessage.push({
          fieldName: this.$t('msg_Details_0'),
          text: this.$t('msg_NoInput_0'),
        })
      }

      const requiredDetailsFields = {
        itemID: 'ItemCode',
        itemCode: 'ItemCode',
        returnQty: 'Quantity',
        wareHouseID: 'Warehouse',
      }

      const invalidDetailData = listDetail.find((item) => {
        for (const field in requiredDetailsFields) {
          if (!item[field]) {
            return true
          }
        }

        return false
      })

      if (invalidDetailData) {
        for (const [field, fieldName] of Object.entries(
          requiredDetailsFields
        )) {
          if (!invalidDetailData[field]) {
            this.listErrorMessage.push({
              fieldName: invalidDetailData.itemCode,
              text: `${this.$t(`lbl_${fieldName}_0`)} ${this.$t(
                'msg_NoInput_0'
              )}`,
            })
          }
        }
      }

      if (this.listErrorMessage.length > 0) {
        return
      }

      this.loading = true

      try {
        const response = await api('addPurchaseReturn', finalPayload)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }

        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsSaved_0'))
          const rtNO = response?.data?.rtNO
          return this.$router.push(
            this.localePath(`/purchase/purchase-return/detail?returnNo=${rtNO}`)
          )
        }

        window.alert(`${response?.message}`)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleButtonDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        window.alert(this.$t('msg_IsDeleted_0'))
        this.handleButtonRefresh()
      }
    },
    handleOpenModalImport() {
      const supplierID = this.form.supplierID
      if (supplierID) {
        this.UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT({
          supplierID,
        })

        return (this.$refs.importPurchaseReturn.showModal = true)
      }

      window.alert(this.$t('msg_NoselectSupplier_0'))
    },
    handleImportData(data) {
      this.dataTable = this.availableListDetails
        .concat(data)
        .map((item, index) => ({
          ...item,
          lineID: index + 1,
        }))

      this.addNewLineData()
    },
    handleChangeTable(data) {
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
.add-purchase-return-page {
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
