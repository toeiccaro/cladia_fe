<template>
  <div class="add-outward-delivery-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormOutwardDelivery
      ref="formOutwardDelivery"
      :data="form"
      :list-item-code="listItemCode"
      @update-shipment="(data) => updateShipment(data)"
    />
    <BaseTableItemDetail
      ref="tableItem"
      class="add-outward-delivery-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :column-hides="columnHides"
      :customer-id="form.supplierID"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    />
    <ModalImportOutwardDelivery
      ref="importOutwardDelivery"
      @update-import-details="handleImportData"
    />
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="rtNO"
      module-name="SOReturn"
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
import { mapActions, mapGetters, mapMutations } from 'vuex'
import FormOutwardDelivery from '@/components/Outward/Delivery/FormOutwardDelivery.vue'
import ModalImportOutwardDelivery from '@/components/Outward/Delivery/Import/ModalImportOutwardDelivery.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import systemMixins from '@/mixins/system'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import dateTime from '@/mixins/dateTime'
import { SERVER_RESPONSE_CODE, DETAIL_ITEM_TABLE } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import { isEmptyValue } from '~/utils/utils'

export default {
  name: 'PageAddOutwardDelivery',
  components: {
    ToolBar,
    FormOutwardDelivery,
    BaseTableItemDetail,
    BaseModalAttach,
    BaseValidateMessage,
    ModalImportOutwardDelivery,
    BaseSetColumnDetail,
    BaseLoading,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
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
          key: 'bomCompute',
          label: this.$t('btn_btnBomCompute_0'),
          icon: '/images/mode.png',
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
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
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
      form: {},
      defaultForm: { orderDate: this.convertDate(new Date()), quantity: 0 },
      dataTable: [],
      loading: false,
      lang: this.$i18n.locale,
      columnHides: [],
      listItemCode: [],
    }
  },
  async fetch() {
    try {
      this.loading = true

      this.addNewLineData()
      this.form = Object.assign({}, this.defaultForm)
      await Promise.all([
        this.getListItemCode(),
        this.getWarehouseOptionsFromAPI(this.lang),
        this.getUnitOptions(this.lang),
        this.getItemTypeOptionsFromAPI(),
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
      unitOptions: 'getUnitOptions',
      warehouseOptions: 'getWarehouseOptions',
      getItemTypeOptions: 'getItemTypeOptions',
      getActiveButtonToolBar: 'getActiveButtonToolBar',
    }),

    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
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
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
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
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'warehouseSource',
          name: this.$t('lbl_WarehouseSource_0'),
          filter: 'select',
          width: 150,
          align: 'left',
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
          fieldRequired: false,
          hidden: false,
        },
      ]
    },
    newLine() {
      return {
        lineID: 1,
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
  methods: {
    ...mapActions('base', {
      getWarehouseOptionsFromAPI: 'getWarehouseOptions',
      getUnitOptions: 'getUnitOptions',
      getItemTypeOptionsFromAPI: 'getItemTypeOptionsFromAPI',
    }),
    ...mapMutations({
      UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT:
        'filterSort/UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT',
    }),
    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      validResponse && (this.listItemCode = res?.data)
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
    updateShipment({ key, value }) {
      this.dataTable = this.availableListDetails.map((item) =>
        Object.assign({}, item, {
          [key]: value,
        })
      )

      this.addNewLineData()
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
    handlePrint() {
      window.confirm(this.$t('msg_ConfirmPrint_0'))
    },
    handleClose() {
      this.$router.push(this.localePath({ path: '/' }))
    },
    handleAttach() {
      this.$refs.attachments.showModal = true
    },
    handleSetColumn() {
      this.$refs.baseSetColumnModal.showModal = true
    },
    async handleRefresh() {
      this.dataTable = []
      this.listErrorMessage = []
      this.$refs.tableItem.resetSearchData()
      await Promise.all([
        this.$refs.formOutwardDelivery.$fetch(),
        this.$fetch(),
      ])
    },
    handleBack() {
      this.$router.push(this.localePath({ path: '/outward/outward-delivery' }))
    },
    handleUnCheck() {
      return window.confirm(this.$t('msg_NoCheck_0'))
    },
    handleImport() {
      const supplierID = this.form?.supplierID
      if (!supplierID) {
        return window.alert(this.$t('msg_NoselectSupplier_0'))
      }

      this.UPDATE_PAYLOAD_OUTWARD_DELIVERY_IMPORT({
        supplierID,
      })

      this.$refs.importOutwardDelivery.showModal = true
    },
    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
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
          itemID: this.form.itemID,
          quantity: this.parseStringToFloat(this.form.quantity),
        }
        const res = await api('getOutwardBomCompute', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        const finalComputedData = res.data?.map((item, index) => ({
          ...item,
          wpoId: this.form.wpoId,
          wpoNo: this.form.wpoNo,
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
        isEmptyValue(this.form[prop]) &&
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
      }
    },
    validateMainForm() {
      const requiredFields = {
        supplierID: 'CustomerName',
        orderDate: 'OrderDate',
        currencyID: 'Currency',
        itemID: 'ItemCode',
        quantity: 'Quantity',
      }

      for (const prop in requiredFields) {
        !this.form[prop] &&
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
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        const detailsData = this.availableListDetails

        const finalDetailsData = detailsData.map((item) => ({
          ...item,
          wpoId: this.form.wpoId,
          wpoNo: this.form.wpoNo,
          unitID: Number(item.unitID),
        }))

        const apiParams = {
          ...this.form,
          unitID: Number(this.form.unitID) || 0,
          quantity: this.parseStringToFloat(this.form.quantity) || 0,
          amount: this.parseStringToFloat(this.form?.amount) || 0,
          price: this.parseStringToFloat(this.form?.price) || 0,
          detailRequests: finalDetailsData,
          language: this.lang,
        }

        const response = await api('addOutwardDelivery', apiParams)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK

        if (!validResponse) {
          return window.alert(`${response?.message}`)
        }

        window.alert(this.$t('msg_IsSaved_0'))
        this.$router.push({
          path: this.localePath(`/outward/outward-delivery/detail`),
          query: {
            orderNo: response?.data?.orderNo,
          },
        })
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (!confirm) {
        return
      }

      window.alert(this.$t('msg_IsDeleted_0'))
      location.reload()
    },
    handleImportData(data) {
      this.form.itemCode = data.itemCode?.value
      this.form.itemName = data.itemName?.value
      this.form.unitID = data.unitID?.value
      this.form.itemID = data.itemID?.value
      this.form.quantity = data.blance?.value
      this.form.wpoId = data.wpoId?.value
      this.form.wpoNo = data.wpoNo?.value
      this.dataTable = []
      this.$refs.formOutwardDelivery.resetForm()
    },
    addNewLineData() {
      this.dataTable.push({
        ...this.newLine,
        lineID: this.availableListDetails.length + 1,
      })
    },
    changeDataDetailTable(data) {
      this.dataTable = data
    },
  },
}
</script>
<style lang="scss" scoped>
.add-outward-delivery-page {
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
