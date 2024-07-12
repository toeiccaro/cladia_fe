<template>
  <div class="edit-sale-return-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormSaleReturn
      :data="dataDetail"
      :is-disabled="isCheck"
      @update-warehouse="(data) => updateWarehouse(data)"
    ></FormSaleReturn>
    <base-table-item-detail
      class="edit-sale-return-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :customer-id="dataDetail.customerID"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :type-quantity="'rtQuantity'"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    ></base-table-item-detail>
    <ModalImportSaleReturn
      ref="importSaleReturn"
      :form="dataDetail"
      @update-sale-return-details="handleImportData"
    ></ModalImportSaleReturn>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="rtNO"
      module-name="SOReturn"
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
import ModalImportSaleReturn from './Import/ModalImportSaleReturn.vue'
import FormSaleReturn from './FormSaleReturn.vue'
import api from '@/api/api'
import { getUnique } from '@/utils/utils'
import { SERVER_RESPONSE_CODE, DETAIL_ITEM_TABLE } from '@/constants'
import dateTime from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'

export default {
  name: 'PageDetailSaleReturn',
  components: {
    BaseValidateMessage,
    ToolBar,
    FormSaleReturn,
    BaseModalAttach,
    ModalImportSaleReturn,
    BaseLoading,
    BaseTableItemDetail,
    BaseSetColumnDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      filteredDataTable: [],
      listErrorMessage: [],
      form: {},
      dataTable: [],
      loading: false,
      dataDetail: {},
      lang: this.$i18n.locale,
      listItemCode: [],
      columnHides: [],
    }
  },
  fetch() {
    Promise.all([
      this.getListItemCode(),
      this.getDataDetail(),
      this.getUnitOptions(this.lang),
      this.getItemTypeOptionsFromAPI(),
      this.getWarehouseOptionFromAPI(this.lang),
      this.getScolumnHides(),
    ])
  },
  computed: {
    ...mapGetters('base', {
      warehouseOptions: 'getWarehouseOptions',
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    isCheck() {
      return (
        !this.isCheckNullEmpty(this.form.checkUser) &&
        !this.isCheckNullEmpty(this.form.checkDate)
      )
    },
    newLine() {
      return {
        lineID: this.dataTable.length + 1,
        itemCode: '',
        itemName: '',
        itemId: '',
        description: '',
        unitID: '',
        inQuantity: 0,
        rtQuantity: 0,
        price: 0,
        amount: 0,
        reason: '',
        warehouseID: '',
        isUpdate: true,
        isNewLine: true,
      }
    },
    tableHeaders() {
      return [
        {
          key: 'checkbox',
          name: '',
          width: 30,
          align: 'left',
          fieldRequired: false,
          disabled: this.isCheck,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          fieldRequired: false,
          disabled: this.isCheck,
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
          key: 'inQuantity',
          name: this.$t('lbl_InQuantity _0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'rtQuantity',
          name: this.$t('lbl_RtQuantity_0'),
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
          fieldRequired: true,
          hidden: false,
          options: this.warehouseOptions,
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
      ]
    },
    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
    },
    availableListDetails() {
      return this.dataTable.filter((item) => !item.isNewLine)
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
          key: 'set',
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
      handler(val) {
        if (val) {
          this.dataDetail = JSON.parse(JSON.stringify(val))
          this.joinAttachmentString(compact(this.dataDetail.attachments))
        }
      },
    },
  },
  created() {},

  methods: {
    ...mapActions({
      getWarehouseOptionFromAPI: 'base/getWarehouseOptions',
      getUnitOptions: 'base/getUnitOptions',
      getItemTypeOptionsFromAPI: 'base/getItemTypeOptionsFromAPI',
    }),
    ...mapMutations({
      UPDATE_PAYLOAD_SALE_RETURN_IMPORT:
        'filterSort/UPDATE_PAYLOAD_SALE_RETURN_IMPORT',
    }),

    updateWarehouse(warehouseId) {
      this.dataTable = this.dataTable.map((item) =>
        Object.assign({}, item, {
          warehouseID: warehouseId,
        })
      )
    },

    isCheckNullEmpty(value) {
      return value === null || !value
    },
    async getDataDetail() {
      this.loading = true
      const res = await api('getDetailSaleReturn', this.$route.query?.returnNo)
      this.loading = false
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.form = res.data
        this.form.rtDate = this.convertDate(res.data.rtDate)
        this.form.checkDate = this.convertDate(res.data.checkDate)
        this.form.editDate = this.convertDate(res.data.editDate)
        this.dataTable = res.data.listDetail.map((item, index) => {
          item.lineID = index + 1
          item.isUpdate = false
          item.warehouseID = this.warehouseOptions?.find(
            (el) => el.text === item.warehouse
          )?.value
          return item
        })
        if (!this.isCheck) {
          this.addNewLineData()
        }
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
      if (key === 'attach') {
        return (this.$refs.attachments.showModal = true)
      }
      if (key === 'back') {
        return this.$router.push(
          this.localePath({ path: '/sales/sales-return' })
        )
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'check') {
        return this.handleButtonCheck()
      }
      if (key === 'refresh') {
        return location.reload()
      }
      if (key === 'unCheck') {
        return this.handleButtonUnCheck()
      }
      if (key === 'set') {
        return (this.$refs.baseSetColumnModal.showModal = true)
      }
    },
    async getScolumnHides() {
      try {
        this.loading = true
        const response = await api(
          'getScolumnHideDetail',
          DETAIL_ITEM_TABLE.SALE_RETURN_DETAIL
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
    handleOpenModalImport() {
      const customerID = this.dataDetail?.customerID
      if (customerID) {
        this.UPDATE_PAYLOAD_SALE_RETURN_IMPORT({
          customerID,
        })

        return (this.$refs.importSaleReturn.showModal = true)
      }

      window.alert(this.$t('msg_NoselectCustomer_0'))
    },
    async handleButtonCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      const returnNumber = this.form?.rtNO
      if (confirm) {
        this.loading = true
        const response = await api('checkSaleReturn', returnNumber)
        this.loading = false
        const errorCode = response?.data?.response?.status
        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        if (response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsChecked_0'))
          this.getDataDetail()
        } else {
          window.alert(`${response?.message}`)
        }
      }
    },

    async handleButtonUnCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
      const returnNumber = this.form?.rtNO
      if (confirm) {
        this.loading = true
        const response = await api('unCheckSaleReturn', returnNumber)
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
        this.$router.push(this.localePath({ path: '/sales/sales-return/add' }))
      }
    },
    validateData() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      this.listErrorMessage = []
      const dataTableFilter = this.availableListDetails || []
      const selectedItems = dataTableFilter
      const payload = this.dataDetail

      const requiredFields = {
        rtDate: 'RtDate',
        customerID: 'CustomerName',
      }

      const requiredTableDetail = {
        itemCode: 'ItemCode',
        rtQuantity: 'RtQuantity',
        price: 'Price',
        warehouseID: 'Warehouse',
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
    async handleButtonSave() {
      try {
        const { selectedItems, payload } = this.validateData()
        if (payload && selectedItems && selectedItems.length > 0) {
          const params = {
            rtNO: this.form.rtNO,
            mainForm: {
              mainTable: {
                currencyID: payload.currencyID,
                customerID: payload.customerID,
                orderDate: payload.rtDate,
                warehouseID: payload.warehouseID,
                attachments: this.form.attachments,
                reason: payload.reason,
                memo: payload.memo,
                checkAccount: payload.checkAccount,
                editDate: payload.editDate,
                editUser: payload.editUser,
              },
              listDetail: selectedItems.map((item, index) => ({
                id: item.id ?? index + 1,
                inLineID: item.inLineID,
                inNO: item.inNO,
                inQuantity: item.inQuantity ?? 0,
                itemID: item.itemID,
                price: item.price,
                reason: item.reason,
                rtQuantity: item.rtQuantity,
                unitID: item.unitID,
                warehouseID: item.warehouseID,
              })),
            },
          }

          this.loading = true
          const response = await api('updateSaleReturn', params)
          this.loading = false
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsSaved_0'))
          } else {
            window.alert(`${response?.message}`)
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async handleButtonDelete() {
      const returnNumber = this.form?.rtNO
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        if (returnNumber) {
          const response = await api('deleteSaleReturn', returnNumber)
          const errorCode = response?.data?.response?.status
          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
            this.$router.push(
              this.localePath({ path: '/sales/sales-return/add' })
            )
          } else {
            window.alert(`${response?.message}`)
          }
        }
      }
    },
    changeDataDetailTable(data) {
      this.dataTable = data
    },

    handleImportData(data) {
      // item.lineId = item.inLineID
      this.dataTable = this.availableListDetails
        .concat(data)
        .map((item, index) => ({
          ...item,
          lineID: index + 1,
        }))

      this.addNewLineData()
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
.edit-sale-return-page {
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
