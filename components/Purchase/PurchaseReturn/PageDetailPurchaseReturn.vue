<template>
  <div class="edit-purchase-return-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormPurchaseReturn
      ref="formAddPurchaseReturn"
      :data="dataDetail"
      :is-disabled="isCheck"
      @on-change-warehouse="changeDetailsWarehouse"
    ></FormPurchaseReturn>
    <BaseTableItemDetail
      ref="tableDetails"
      class="edit-purchase-return-table-details"
      :table-content="dataTable"
      :disable-input="isCheck"
      :table-type="'POInvoiceDetail'"
      :list-item-master="listItemCode"
      :column-hides="columnHides"
      :customer-id="dataDetail.supplierID"
      :header-detail="tableHeaders"
      :new-line="newLine"
      @changeTable="handleChangeTable"
    ></BaseTableItemDetail>
    <ModalImportPurchaseReturn
      ref="importPurchaseReturn"
      ase-order
      :form="dataDetail"
      @update-details="handleImportData"
    ></ModalImportPurchaseReturn>
    <BaseModalAttach
      ref="attachments"
      :data="dataDetail"
      key-file-no="rtNO"
      module-name="POReturn"
      @updateData="updateParamAttachments"
      @deleteData="deleteData"
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
import { compact } from 'lodash'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import FormPurchaseReturn from './FormPurchaseReturn.vue'
import ModalImportPurchaseReturn from './Import/ModalImportPurchaseReturn.vue'
import systemMixins from '@/mixins/system'
import dateTimeMixins from '@/mixins/dateTime'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import { dateFormatYYYY } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'

export default {
  components: {
    BaseValidateMessage,
    ToolBar,
    FormPurchaseReturn,
    BaseModalAttach,
    ModalImportPurchaseReturn,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
  },
  mixins: [systemMixins, dateTimeMixins],
  data() {
    return {
      listItemCode: [],
      columnHides: [],
      listErrorMessage: [],
      dataTable: [],
      loading: false,
      dataDetail: {},
      lang: this.$i18n.locale,
      returnNo: this.$route.query?.returnNo,
    }
  },
  async fetch() {
    try {
      await Promise.all([
        this.getDataDetail(),
        this.getScolumnHides(),
        this.getListItemCode(),
        this.getWarehouseOptionsFromAPI(this.lang),
        this.getUnitOptions(this.lang),
        this.getItemTypeOptionsFromAPI(this.lang),
      ])
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters({
      warehouseOptions: 'base/getWarehouseOptions',
      unitOptions: 'base/getUnitOptions',
      itemTypeOptions: 'base/getItemTypeOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),
    newLine() {
      return {
        productName: null,
        unit: null,
        unitID: null,
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
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },
    isCheck() {
      return !!(this.dataDetail?.checker && this.dataDetail.checkDate)
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
          disabled: !this.getActiveButtonToolBar.isCheck,
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

    formattedListItemTypes() {
      return this.itemTypeOptions.map((item) => ({
        text: this.$t(item.text),
        value: item.value,
      }))
    },
    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
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

    async getDataDetail() {
      try {
        this.loading = true
        const params = {
          returnNo: this.returnNo,
          lang: this.$i18n.locale,
        }
        const res = await api('getDetailPurchaseReturn', params)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        const resData = res.data || {}
        const detailDTOS = resData.detailDTOS || []

        this.dataDetail = resData
        this.dataTable = detailDTOS.map((item, index) =>
          Object.assign(item, {
            itemName: item.productName,
            lineID: index + 1,
          })
        )

        if (!this.isCheck) {
          this.addNewLineData()
        }

        const convertDateFields = ['rtDate', 'editDate', 'checkDate']

        for (const prop of convertDateFields) {
          this.dataDetail[prop] = dateFormatYYYY(this.dataDetail[prop])
        }

        this.dataDetail.attachments = resData.listAttachments
        this.joinAttachmentString(compact(resData.listAttachments))
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleAction(key) {
      switch (key) {
        case 'add':
          return this.handleButtonAdd()
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
            this.localePath({ path: '/purchase/purchase-return' })
          )
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        case 'check':
          return this.handleButtonCheck()
        case 'setColumn':
          return (this.$refs.baseSetColumnModal.showModal = true)
        case 'unCheck':
          return this.handleButtonUnCheck()
        case 'refresh':
          return this.handleButtonRefresh()
        default:
          break
      }
    },
    resetTableDetailData() {
      this.$refs.tableDetails.activeRow = -1
      this.$refs.tableDetails.resetSearchData()
    },
    handleButtonRefresh() {
      this.resetTableDetailData()
      Promise.all([this.$fetch(), this.$refs.formAddPurchaseReturn.$fetch()])
    },
    handleOpenModalImport() {
      const supplierID = this.dataDetail.supplierID
      if (supplierID) {
        this.UPDATE_PAYLOAD_PURCHASE_RETURN_IMPORT({
          supplierID,
        })

        return (this.$refs.importPurchaseReturn.showModal = true)
      }

      window.alert(this.$t('msg_NoselectSupplier_0'))
    },

    async handleButtonCheck() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
        if (!confirm) {
          return
        }

        const purchaseNumber = this.dataDetail?.rtNO
        this.loading = true
        const response = await api('checkPurchaseReturn', purchaseNumber)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsChecked_0'))
          return this.getDataDetail()
        }

        window.alert(`${response?.message}`)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleButtonUnCheck() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
        if (!confirm) {
          return
        }

        const purchaseNumber = this.dataDetail?.rtNO
        this.loading = true
        const response = await api('unCheckPurchaseReturn', purchaseNumber)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsUnChecked_0'))
          return this.getDataDetail()
        }

        window.alert(`${response?.message}`)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        this.$router.push(
          this.localePath({ path: '/purchase/purchase-return/add' })
        )
      }
    },
    async handleButtonSave() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.listErrorMessage = []
        const payload = this.dataDetail
        const listDetail = this.availableListDetails || []
        const convertDateFields = ['rtDate']

        listDetail.forEach((item, index) => {
          item.lineID = index + 1
          item.itemName = item.itemName || item.productName
          item.rtNO = this.returnNo
          item.supplierID = payload.supplierID
          item.wareHouseID = item.warehouseID
          item.price = this.parseStringToFloat(item.price)
        })

        for (const field of convertDateFields) {
          payload[field] = dateFormatYYYY(payload[field])
        }
        const finalPayload = Object.assign({}, payload, {
          listDetail,
          returnNo: this.returnNo,
        })

        const requiredFields = {
          rtDate: 'RtDate',
          supplierID: 'SupplierName',
        }

        for (const prop in requiredFields) {
          if (!finalPayload[prop]) {
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
              text: this.$t('msg_NoInput_0'),
            })
          }
        }

        const hasNoDetails = this.availableListDetails.length === 0
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
          let hasInvalidData = false

          for (const field in requiredDetailsFields) {
            if (!item[field]) {
              hasInvalidData = true
            }
          }

          return hasInvalidData
        })

        if (invalidDetailData) {
          for (const field in requiredDetailsFields) {
            if (!invalidDetailData[field]) {
              this.listErrorMessage.push({
                fieldName: invalidDetailData.itemCode,
                text: `${this.$t(
                  `lbl_${requiredDetailsFields[field]}_0`
                )} ${this.$t('msg_NoInput_0')}`,
              })
            }
          }
        }

        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        this.loading = true
        const response = await api('updatePurchaseReturn', finalPayload)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }

        if (response.status === SERVER_RESPONSE_CODE.OK) {
          this.$router.push({
            path: this.$route.path,
            query: { returnNo: this.returnNo },
          })

          window.alert(this.$t('msg_IsSaved_0'))
          return this.getDataDetail()
        }

        window.alert(`${response?.message}`)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async handleButtonDelete() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
        if (!confirm) {
          return
        }

        this.loading = true
        const params = {
          returnNo: this.dataDetail?.rtNO,
        }

        const response = await api('deletePurchaseReturn', params)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsDeleted_0'))
          return this.$router.push(
            this.localePath({ path: '/purchase/purchase-return/add' })
          )
        }

        window.alert(`${response?.message}`)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    changeDataTable(data) {
      this.dataTable = data
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
    updateParamAttachments(formData) {
      this.dataDetail.attachments?.push(formData)
      this.joinAttachmentString(this.dataDetail.attachments)
      this.$refs.formAddPurchaseReturn.refresh()
    },
    deleteData(id) {
      this.dataDetail.attachments = this.dataDetail.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.dataDetail.attachments)
      this.$refs.formAddPurchaseReturn.refresh()
    },

    joinAttachmentString(attachmentArray = []) {
      this.dataDetail.attachmentsList = attachmentArray
        .map((item) => `${item.fileName}.${item.fileType}`)
        .join(' ; ')
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
.edit-purchase-return-page {
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
