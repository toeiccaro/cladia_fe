<template>
  <div class="edit-outward-delivery-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormOutwardDelivery
      ref="formOutwardDelivery"
      :data="dataDetail"
      :list-item-code="listItemCode"
      :is-disabled="isCheck"
      @update-shipment="(data) => updateShipment(data)"
    />
    <BaseTableItemDetail
      ref="tableItem"
      class="edit-outward-delivery-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardDelivery'"
      :customer-id="dataDetail.supplierID"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    />
    <ModalImportOutwardDelivery
      ref="importOutwardDelivery"
      @update-import-details="handleImportData"
    />
    <BaseModalAttach
      ref="attachments"
      :data="dataDetail"
      key-file-no="orderNo"
      module-name="OutwardDelivery"
      @updateData="updateParamAttachments"
      @deleteData="deleteData"
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
import { compact } from 'lodash'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import ModalImportOutwardDelivery from '@/components/Outward/Delivery/Import/ModalImportOutwardDelivery.vue'
import FormOutwardDelivery from '@/components/Outward/Delivery/FormOutwardDelivery.vue'
import api from '@/api/api'
import { isEmptyValue, downloadFileExcel } from '@/utils/utils'
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
  name: 'PageDetailOutwardDelivery',
  components: {
    BaseValidateMessage,
    ToolBar,
    FormOutwardDelivery,
    BaseModalAttach,
    ModalImportOutwardDelivery,
    BaseLoading,
    BaseTableItemDetail,
    BaseSetColumnDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      listErrorMessage: [],
      dataTable: [],
      loading: false,
      dataDetail: {},
      lang: this.$i18n.locale,
      listItemCode: [],
      columnHides: [],
    }
  },
  async fetch() {
    try {
      this.loading = true
      await Promise.all([
        this.getListItemCode(),
        this.getDataDetail(),
        this.getUnitOptions(this.lang),
        this.getItemTypeOptionsFromAPI(),
        this.getWarehouseOptionFromAPI(this.lang),
        this.getScolumnHides(),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters('base', {
      warehouseOptions: 'getWarehouseOptions',
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
      getActiveButtonToolBar: 'getActiveButtonToolBar',
    }),

    isCheck() {
      return (
        !isEmptyValue(this.dataDetail.checker) &&
        !isEmptyValue(this.dataDetail.checkDate)
      )
    },
    newLine() {
      return {
        lineID: this.dataTable.length + 1,
        itemCode: '',
        itemTypeID: '',
        itemName: '',
        itemID: '',
        description: '',
        unitID: '',
        quantity: 0,
        shipmentFromID: '',
        shipmentToID: '',
        memoDTL: '',
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
          hidden: false,
          disabled: this.isCheck,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          fieldRequired: false,
          hidden: false,
          disabled: this.isCheck,
        },
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
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
          key: 'warehouseSource',
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
          key: 'warehouseDestination',
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
          key: 'bomCompute',
          label: this.$t('btn_btnBomCompute_0'),
          icon: '/images/mode.png',
          disabled: this.isCheck,
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
  },
  watch: {
    dataDetail: {
      handler(value) {
        value && this.joinAttachmentString(compact(value.attachments))
      },
    },
  },

  methods: {
    ...mapActions({
      getWarehouseOptionFromAPI: 'base/getWarehouseOptions',
      getUnitOptions: 'base/getUnitOptions',
      getItemTypeOptionsFromAPI: 'base/getItemTypeOptionsFromAPI',
    }),
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT',
    }),

    updateShipment({ key, value }) {
      this.dataTable = this.availableListDetails.map((item) =>
        Object.assign({}, item, {
          [key]: value,
        })
      )

      !this.isCheck && this.addNewLineData()
    },

    async getDataDetail() {
      const payload = {
        orderNo: this.$route.query?.orderNo,
        language: this.lang,
      }
      const res = await api('getOutwardDeliveryDetail', payload)
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (!validResponse) {
        return
      }

      this.dataDetail = res.data
      this.dataDetail.wpoId = this.dataDetail.listDetail[0]?.wpoId
      this.dataDetail.wpoNo = this.dataDetail.listDetail[0]?.wpoNo

      this.dataTable = this.dataDetail.listDetail.map((item, index) => ({
        ...item,
        lineID: index + 1,
        isUpdate: false,
      }))

      !this.isCheck && this.addNewLineData()
    },
    handleAction(key) {
      switch (key) {
        case 'add':
          return this.handleAdd()
        case 'save':
          return this.handleSave()
        case 'delete':
          return this.handleDelete()
        case 'import':
          return this.handleImport()
        case 'attach':
          return this.handleAttach()
        case 'back':
          return this.handleBack()
        case 'refresh':
          return this.handleRefresh()
        case 'close':
          return this.handleClose()
        case 'check':
          return this.handleCheck()
        case 'unCheck':
          return this.handleUnCheck()
        case 'setColumn':
          return this.handleSetColumn()
        case 'bomCompute':
          return this.handleBomCompute()
        case 'print':
          return this.handlePrint()
        default:
          break
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
        const res = await api('printOutwardDelivery', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        validResponse && downloadFileExcel(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleAttach() {
      this.$refs.attachments.showModal = true
    },
    handleBack() {
      this.$router.push(this.localePath({ path: '/outward/outward-delivery' }))
    },
    handleClose() {
      this.$router.push(this.localePath({ path: '/' }))
    },
    handleSetColumn() {
      this.$refs.baseSetColumnModal.showModal = true
    },
    async handleRefresh() {
      this.listErrorMessage = []
      this.$refs.tableItem.resetSearchData()
      await Promise.all([
        this.$refs.formOutwardDelivery.$fetch(),
        this.$fetch(),
      ])
    },
    async handleBomCompute() {
      try {
        this.loading = true

        this.validateBomComputeData()
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        const payload = {
          language: this.lang,
          itemID: this.dataDetail.itemID,
          quantity: this.parseStringToFloat(this.dataDetail.quantity),
        }
        const res = await api('getOutwardBomCompute', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        const finalComputedData = res.data?.map((item, index) => ({
          ...item,
          wpoId: this.dataDetail.wpoId,
          wpoNo: this.dataDetail.wpoNo,
          lineID: index + 1,
        }))

        this.dataTable = finalComputedData

        this.addNewLineData()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getScolumnHides() {
      try {
        const response = await api(
          'getScolumnHideDetail',
          DETAIL_ITEM_TABLE.OUTWARD_DELIVERY_DETAIL
        )
        this.columnHides = response?.data
      } catch (error) {
        console.error(error)
      }
    },
    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      validResponse && (this.listItemCode = res?.data)
    },
    handleImport() {
      const supplierID = this.dataDetail?.supplierID
      if (!supplierID) {
        return window.alert(this.$t('msg_NoselectSupplier_0'))
      }

      this.UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT({
        supplierID,
      })

      this.$refs.importOutwardDelivery.showModal = true
    },
    async handleCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'))
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const orderNo = this.dataDetail?.orderNo
        if (!orderNo) {
          return
        }

        const response = await api('checkOutwardDelivery', { orderNo })
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return window.alert(`${response?.message}`)
        }

        window.alert(this.$t('msg_IsChecked_0'))
        await this.getDataDetail()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleUnCheck() {
      const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'))
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const orderNo = this.dataDetail?.orderNo
        if (!orderNo) {
          return
        }

        const response = await api('unCheckOutwardDelivery', { orderNo })
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return window.alert(`${response?.message}`)
        }

        window.alert(this.$t('msg_IsUnChecked_0'))
        await this.getDataDetail()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      confirm &&
        this.$router.push(
          this.localePath({ path: '/outward/outward-delivery/add' })
        )
    },
    validateData() {
      this.listErrorMessage = []
      this.validateMainForm()
      this.validateDetailForm()
    },
    validateBomComputeData() {
      this.listErrorMessage = []

      const requiredFields = {
        itemID: 'ItemCode',
      }

      for (const prop in requiredFields) {
        isEmptyValue(this.dataDetail[prop]) &&
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
      }
    },
    validateMainForm() {
      const requiredFields = {
        orderDate: 'OrderDate',
        supplierID: 'SupplierName',
        currencyID: 'Currency',
        itemID: 'ItemCode',
        itemName: 'ItemName',
        quantity: 'Quantity',
      }

      for (const prop in requiredFields) {
        !this.dataDetail[prop] &&
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
      }
    },
    validateDetailForm() {
      if (!this.availableListDetails.length) {
        return this.listErrorMessage.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      }

      const requiredFields = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        warehouseSource: 'WarehouseSource',
        warehouseDestination: 'WarehouseDestination',
      }

      this.availableListDetails.forEach((item) => {
        for (const key in requiredFields) {
          !item[key] &&
            this.listErrorMessage.push({
              fieldName: `${this.$t('lbl_LineID_0')} ${item.lineID} - ${this.$t(
                `lbl_${requiredFields[key]}_0`
              )}`,
              text: this.$t('msg_NoInput_0'),
            })
        }
      })
    },
    async handleSave() {
      try {
        this.loading = true
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.validateData()
        if (this.listErrorMessage.length) {
          return
        }

        const detailsData = JSON.parse(
          JSON.stringify(this.availableListDetails)
        )

        const detailIds = detailsData.map((item) => item.id).filter(Boolean)

        this.dataDetail.listDetail?.forEach(
          (item) =>
            !detailIds.includes(item.id) &&
            detailsData.push({ ...item, isDelete: true })
        )

        const finalDetailsData = detailsData.map((item) => ({
          ...item,
          wpoId: this.dataDetail.wpoId,
          wpoNo: this.dataDetail.wpoNo,
          unitID: Number(item.unitID),
        }))

        const apiParams = {
          ...this.dataDetail,
          unitID: Number(this.dataDetail.unitID) || 0,
          quantity: this.parseStringToFloat(this.dataDetail.quantity) || 0,
          amount: this.parseStringToFloat(this.dataDetail?.amount) || 0,
          price: this.parseStringToFloat(this.dataDetail?.price) || 0,
          detailRequests: finalDetailsData,
          language: this.lang,
        }

        const res = await api('editOutwardDelivery', apiParams)
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return window.alert(res?.message)
        }

        window.alert(this.$t('msg_IsSaved_0'))
        await this.getDataDetail()
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    async handleDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (!confirm) {
        return
      }

      try {
        this.loading = true
        const orderNo = this.dataDetail?.orderNo
        if (!orderNo) {
          return
        }

        const response = await api('deleteOutwardDelivery', { orderNo })
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse = response.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return window.alert(`${response?.message}`)
        }

        window.alert(this.$t('msg_IsDeleted_0'))
        this.$router.push(
          this.localePath({ path: '/outward/outward-delivery/add' })
        )
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    changeDataDetailTable(data) {
      this.dataTable = data
    },

    handleImportData(data) {
      this.dataDetail.itemCode = data.itemCode?.value
      this.dataDetail.itemName = data.itemName?.value
      this.dataDetail.unitID = data.unitID?.value
      this.dataDetail.itemID = data.itemID?.value
      this.dataDetail.quantity = data.blance?.value
      this.dataDetail.wpoId = data.wpoId?.value
      this.dataDetail.wpoNo = data.wpoNo?.value
      this.dataTable = []
      this.$refs.formOutwardDelivery.resetForm()
    },
    updateParamAttachments(formData) {
      this.dataDetail.attachments?.push(formData)
      this.joinAttachmentString(this.dataDetail.attachments)
      this.$refs.formOutwardDelivery.refresh()
    },

    deleteData(id) {
      this.dataDetail.attachments = this.dataDetail.attachments?.filter(
        (item) => item.id !== id
      )
      this.joinAttachmentString(this.dataDetail.attachments)
      this.$refs.formOutwardDelivery.refresh()
    },

    joinAttachmentString(attachmentArray = []) {
      this.dataDetail.attachmentList = attachmentArray
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
.edit-outward-delivery-page {
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
