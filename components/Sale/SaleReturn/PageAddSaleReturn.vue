<template>
  <div class="add-sale-return-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      :show-border-save="isShowBorderSave"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormSaleReturn
      :key="refreshAddOrderFormKey"
      :data="form"
      @update-warehouse="(data) => updateWarehouse(data)"
    />
    <BaseTableItemDetail
      ref="tableItem"
      class="add-sale-return-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :column-hides="columnHides"
      :customer-id="form.customerID"
      :header-detail="tableHeaders"
      :type-quantity="'rtQuantity'"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    ></BaseTableItemDetail>
    <ModalImportSaleReturn
      ref="importSaleReturn"
      :form="form"
      @update-sale-return-details="handleImportData"
    ></ModalImportSaleReturn>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="rtNO"
      module-name="SOReturn"
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
import FormSaleReturn from './FormSaleReturn.vue'
import ModalImportSaleReturn from './Import/ModalImportSaleReturn.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import systemMixins from '@/mixins/system'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import dateTime from '@/mixins/dateTime'
import { SERVER_RESPONSE_CODE, DETAIL_ITEM_TABLE } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import { getUnique } from '@/utils/utils'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'

export default {
  name: 'PageAddSaleReturn',
  components: {
    ToolBar,
    FormSaleReturn,
    BaseTableItemDetail,
    BaseModalAttach,
    BaseValidateMessage,
    ModalImportSaleReturn,
    BaseSetColumnDetail,
    BaseLoading,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      isShowBorderSave: false,
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
        totalQuantity: 0,
        customerId: '',
      },
      dataTable: [],
      loading: false,
      lang: this.$i18n.locale,
      columnHides: [],
      listItemCode: [],
    }
  },
  fetch() {
    this.addNewLineData()
    Promise.all([
      this.getListItemCode(),
      this.getWarehouseOptionsFromAPI(this.lang),
      this.getUnitOptions(this.lang),
      this.getItemTypeOptionsFromAPI(),
      this.getScolumnHides(),
    ])
  },
  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      warehouseOptions: 'getWarehouseOptions',
      getItemTypeOptions: 'getItemTypeOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

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
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'price',
          name: this.$t('lbl_Price_0'),
          filter: 'number',
          width: 150,
          align: 'right',
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
          disabled: false,
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
      UPDATE_PAYLOAD_SALE_RETURN_IMPORT:
        'filterSort/UPDATE_PAYLOAD_SALE_RETURN_IMPORT',
    }),

    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
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
    updateWarehouse(warehouseId) {
      this.dataTable = this.availableListDetails.map((item) =>
        Object.assign({}, item, {
          warehouseID: warehouseId,
        })
      )

      this.addNewLineData()
    },

    handleAction(key) {
      switch (key) {
        case 'add':
          return this.handleButtonAdd()
        case 'save':
          this.isShowBorderSave = true
          return this.handleButtonSave()
        case 'delete':
          return this.handleButtonDelete()
        case 'import':
          return this.handleOpenModalImport()
        case 'attach':
          return (this.$refs.attachments.showModal = true)
        case 'back':
          return this.$router.push(
            this.localePath({ path: '/sales/sales-return' })
          )
        case 'refresh':
          return location.reload()
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        case 'unCheck':
          return this.handleButtonUnCheck()
        case 'setColumn':
          return (this.$refs.baseSetColumnModal.showModal = true)
        default:
          break
      }
    },
    handleButtonUnCheck() {
      return window.confirm(this.$t('msg_NoCheck_0'))
    },
    handleOpenModalImport() {
      const customerID = this.form?.customerID
      if (customerID) {
        this.UPDATE_PAYLOAD_SALE_RETURN_IMPORT({
          customerID,
        })

        return (this.$refs.importSaleReturn.showModal = true)
      }

      window.alert(this.$t('msg_NoselectCustomer_0'))
    },
    handleButtonAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
    },
    validateData() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      this.listErrorMessage = []
      const dataTableFilter = this.availableListDetails || []

      const payload = this.form

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

      if (dataTableFilter.length === 0) {
        this.listErrorMessage.push({
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        dataTableFilter.forEach((item) => {
          for (const key in requiredTableDetail) {
            if (
              (['rtQuantity', 'price'].includes(key) &&
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
        dataTableFilter,
        payload,
      }
    },
    async handleButtonSave() {
      try {
        const { dataTableFilter, payload } = this.validateData()
        if (payload && dataTableFilter && dataTableFilter?.length > 0) {
          const params = {
            currencyID: payload.currencyID,
            customerID: payload.customerID,
            orderDate: payload.rtDate,
            warehouseID: payload.warehouseID,
            reason: payload.reason,
            memo: payload.memo,
            checkAccount: false,
          }

          const listDetail = dataTableFilter.map((item, index) => ({
            id: index + 1,
            inQuantity: Number(item.inQuantity) ?? 0,
            inLineID: item.inLineID,
            inNO: item.inNO,
            itemID: item.itemID,
            price: Number(item.price) ?? 0,
            reason: item.reason,
            rtQuantity: Number(item.rtQuantity) ?? 0,
            unitID: item.unitID,
            warehouseID: item.warehouseID,
          }))

          const finalPayload = Object.assign({}, params, {
            listDetail,
          })

          this.loading = true
          const response = await api('addSaleReturn', finalPayload)

          const errorCode = response?.data?.response?.status
          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }

          const validResponse = response.status === SERVER_RESPONSE_CODE.OK
          if (validResponse) {
            this.form.rtNO = response.data.rtNO
            window.alert(this.$t('msg_IsSaved_0'))
            return this.$router.push({
              path: `/${this.$i18n.locale}/sales/sales-return/detail?returnNo=${this.form.rtNO}`,
            })
          }
          const errorStatus = response?.data?.response?.status === 500
          if (errorStatus) {
            this.listErrorMessage = response?.data?.response?.data?.errors?.map(
              (item) => {
                item.fieldName =
                  item.field === 'Return Quantity'
                    ? this.$t('lbl_RtQuantity_0')
                    : this.$t(`lbl_${item.field.replace(/ +/g, '')}_0`)
                item.text = this.$t('msg_NoInput_0')
                return item
              }
            )
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    getMessageError(listError) {
      this.listErrorMessage = []
      this.listErrorMessage = [...this.listErrorMessage, ...listError]
    },
    handleButtonDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        location.reload()
        ++this.refreshAddOrderFormKey
        window.alert(this.$t('msg_IsDeleted_0'))
      }
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
.add-sale-return-page {
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
