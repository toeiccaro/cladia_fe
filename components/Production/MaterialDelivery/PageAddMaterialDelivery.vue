<template>
  <div class="add-sale-order-page">
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormInputMaterialDelivery
      ref="materialDeliveryForm"
      :key="refreshAddOrderFormKey"
      :data="form"
      :list-item-code="listItemCode"
      @update-shipment-to="(data) => updateTableMaterial(data)"
      @change-item-code="changeItemCode"
    />
    <BaseTableItemDetail
      ref="materialDeliveryTableItem"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'materialDelivery'"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    />

    <ModalImportMaterialDelivery
      ref="importMaterialDelivery"
      :form="form"
      @update-details="handleImportData"
    />
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNo"
      module-name="MaterialDelivery"
    ></BaseModalAttach>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import ModalImportMaterialDelivery from './Import/ModalImportMaterialDelivery.vue'
import FormInputMaterialDelivery from '@/components/Production/MaterialDelivery/FormInputMaterialDelivery.vue'
import systemMixins from '@/mixins/system'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import { SERVER_RESPONSE_CODE, ITEM_TYPE } from '@/constants'
import { getUnique, isEmptyValue } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
export default {
  components: {
    ToolBar,
    FormInputMaterialDelivery,
    BaseModalAttach,
    BaseValidateMessage,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
    ModalImportMaterialDelivery,
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
          key: 'bomCompute',
          label: this.$t('btn_btnBomCompute_0'),
          icon: '/images/mode.png',
        },
        {
          key: 'dateCompute',
          label: this.$t('btn_btnDateCompute_0'),
          icon: '/images/mode.png',
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
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
        },
        {
          key: 'printQRLabel',
          label: this.$t('btn_btnQRCode_0'),
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
        promiseDate: this.convertDate(new Date()),
      },
      form: {},
      dataTable: [
        {
          lineID: 1,
          subItemCode: '',
          subItemID: '',
          subItemName: '',
          subDescription: '',
          deliveryDate: '',
          lt: 0,
          memoDtl: '',
          subQuantity: 0,
          deliveredQuantity: 0,
          balanceQty: 0,
          unit: '',
          subUnitID: '',
          warehouseFromID: 0,
          warehouseToID: 0,
          productionOrder: '',
          isUpdate: true,
          isNewLine: true,
        },
      ],
      loading: false,
      isAddSuccess: false,
      listItemCode: [],
      columnHides: [],
      clickBomCompute: false,
      clickDateCompute: false,
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

    ...mapGetters('base', ['getActiveButtonToolBar']),

    itemTypeOptions() {
      return this.getItemTypeOptions
        .map((item) => ({
          text: this.$t(`${item.text}`),
          value: item.value,
        }))
        .filter(
          (item, idx) =>
            idx === ITEM_TYPE.EMPTY ||
            item.value === ITEM_TYPE.OUTSOURCED_PRODUCT ||
            item.value === ITEM_TYPE.MATERIAL
        )
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
          width: 30,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          width: 30,
          align: 'center',
          filter: '',
          disabled: this.isCheck,
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
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'lt',
          name: this.$t('lbl_LT_0'),
          width: 100,
          align: 'right',
          filter: 'number',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'subItemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'subItemTypeID',
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
          key: 'subItemName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          width: 250,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'subDescription',
          name: this.$t('lbl_Description_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'subUnitID',
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
          key: 'deliveredQuantity',
          name: this.$t('lbl_DeliveredQuantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: true,
          hidden: false,
        },
        {
          key: 'balanceQty',
          name: this.$t('lbl_BalanceQty_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: true,
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
          key: 'memoDtl',
          name: this.$t('lbl_MemoDTL_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          typeInput: 'input',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
      ]
    },

    newLine() {
      return {
        lineID: 1,
        subItemCode: '',
        subItemID: '',
        subItemName: '',
        subDescription: '',
        deliveryDate: '',
        lt: 0,
        memoDtl: '',
        subQuantity: 0,
        unit: '',
        subUnitID: '',
        warehouseFromID: 0,
        warehouseToID: this.form.warehouseToID,
        productionOrder: '',
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
    'form.woNO': {
      handler(val) {
        if (val) {
          this.availableListDetails = this.availableListDetails.map((item) => {
            item.productionOrder = val
            return item
          })
        }
      },
    },
    // 'form.promiseDate': {
    //   handler() {
    //     this.clickBomCompute = false
    //     this.clickDateCompute = false
    //   },
    // },
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_MATERIAL_DELIVERY_IMPORT:
      'filterSort/UPDATE_PAYLOAD_MATERIAL_DELIVERY_IMPORT',
    }),
    ...mapActions('base', [
      'getUnitOptions',
      'getItemTypeOptionsFromAPI',
      'getWarehouseOptions',
    ]),

    changeItemCode(data) {
      if (data) {
        this.clickBomCompute = false
        this.clickDateCompute = false
        this.form.startDate = ''
      }
    },

    async getScolumnHides() {
      try {
        this.loading = true

        const response = await api('getScolumnHides', {
          gridName: 'MaterialDeliveryDetail',
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

    async getListItemCode() {
      const res = await api('getItemCode')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.listItemCode = res?.data
      }
    },
    updateTableMaterial(data) {
      this.dataTable = this.dataTable.map((item) => {
        return {
          ...item,
          warehouseToID: data?.warehouseToID,
        }
      })
    },

    handleAction(key) {
      this.actionKey = key

      switch (key) {
        case 'add':
          this.handleButtonAddOrder()
          break

        case 'save':
          this.handleSaveMaterialDelivery()
          break

        case 'import':
          this.handleButtonImport()
          break

        case 'delete':
          this.handleButtonDeleteOrder()
          break

        case 'bomCompute':
          this.handleButtonCompute()
          break

        case 'dateCompute':
          this.handleButtonDateCompute()
          break

        case 'attach':
          this.$refs.attachments.showModal = true
          break

        case 'back':
          this.$router.push(
            this.localePath({ path: '/production/material-delivery' })
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

        default:
          break
      }
    },
    resetTableDetailData() {
      this.dataTable = []
      this.$refs.materialDeliveryTableItem.resetSearchData()
      this.$refs.materialDeliveryTableItem.activeRow = -1
    },
    refreshFormData() {
      this.clickBomCompute = false
      this.clickDateCompute = false
      ++this.refreshAddOrderFormKey
    },
    async handleRefresh() {
      this.listErrorMessage = []
      this.resetTableDetailData()
      await Promise.all([
        this.$fetch(),
        this.$refs.materialDeliveryForm.$fetch(),
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
        this.handleRefresh()
      }
    },

    validateForm() {
      const errors = []
      const dataTable = this.availableListDetails

      const requiredFields = {
        orderDate: 'OrderDate',
        itemCode: 'ItemCode',
        quantity: 'Quantity',
      }
      const requiredTableDetails = {
        subItemCode: 'ItemCode',
        subQuantity: 'Quantity',
        warehouseFromID: 'WarehouseSource',
        warehouseToID: 'WarehouseDestination',
        deliveryDate: 'DeliveryDate',
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

    async handleSaveMaterialDelivery() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      const validateInfo = this.validateForm()

      if (validateInfo) {
        const { dataTableFilter, payload } = validateInfo

        const params = {
          form: {
            customerID: payload.customerID,

            detail: dataTableFilter.map((itemDetail) => {
              return {
                ...itemDetail,
                barcode: itemDetail.barCode,
                isDeleted: true,
                subQuantity: Number(itemDetail.subQuantity),
              }
            }),
            itemID: payload.itemID,
            memo: payload.memo,
            orderDate: payload.orderDate,
            promiseDate: payload.promiseDate,
            quantity: payload.quantity,
            responsibleID: payload?.responsibleID,
            startDate: payload.startDate,
            warehouseToID: payload.warehouseToID,
            woLineNO: payload.woLineNO,
            woNO: payload.woNO || '',
          },
          language: this.$i18n.locale,
        }

        try {
          this.loading = true
          const response = await api('addMaterialDelivery', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push({
              path: `/${this.$i18n.locale}/production/material-delivery/detail?orderNo=${response.data.orderNo}`,
            })
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.loading = false
        }
      }
    },

    handleButtonImport() {
      if (this.form.itemID) {
        this.UPDATE_PAYLOAD_MATERIAL_DELIVERY_IMPORT({
          itemID: this.form.itemID,
        })
      }
      this.$refs.importMaterialDelivery.showModal = true
    },

    async handleButtonCompute() {
      this.clickBomCompute = true
      try {
        this.loading = true

        this.validateBomComputeData()
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        // get orderNo after import
        const payload = {
          itemId: this.form.itemID,
          quantity: this.form.quantity,
        }

        const res = await api('newBomComputeMaterialDelivery', payload)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataTable = res.data.map((item, index) => ({
          ...item,
          lineID: index + 1,
          subItemTypeID: item.itemTypeID ?? item.subItemTypeID,
          lt: item.leadTime,
          warehouseFromID: item.warehouseID,
          productionOrder: this.form.woNO ?? '',
          deliveryDate: '',
        }))

        // if clickBomCompute 2 times clear delivery date
        if(this.availableListDetails[0].deliveryDate !== ''){
          this.dataTable = this.availableListDetails.map(item => {
            return {
              ...item,
              deliveryDate: '',
            }
          })
        }

        this.addNewLineData()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleButtonDateCompute() {
      this.clickDateCompute = true
      try {
        this.loading = true

        this.validateBomComputeData()
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        // get orderNo after import
        const payload = {
          startDate: this.form.startDate || '',
          form: this.availableListDetails
        }

        const res = await api('newDateComputeMaterialDelivery', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        // if bomCompute is clicked, fill new data
        if (this.clickBomCompute) {
          const dataDateCompute = res.data.map((item, index) => {
            return {
              lineID: index + 1,
              deliveryDate: item.deliveryDate,
            }
          })
          this.dataTable.pop()
          // fill new deliveryDate into dataTable
          for (let i = 0; i < this.dataTable.length; i++) {
            for (let j = 0; j < dataDateCompute.length; j++) {
              if (this.dataTable[i].lineID === dataDateCompute[j].lineID) {
                this.dataTable[i].deliveryDate = dataDateCompute[j].deliveryDate
              }
            }
          }
        } else {
          // just fill deliveryDate
          // this.dataTable = res.data.map((item, index) => ({
          //   lineID: index + 1,
          //   deliveryDate: item.deliveryDate,
          // }))
          this.dataTable = []
        }
        this.addNewLineData()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    validateBomComputeData() {
      this.listErrorMessage = []

      const requiredFields = {
        itemID: 'ItemCode',
        promiseDate: 'PromiseDate',
        quantity: 'ProductionQuantity',
      }

      for (const prop in requiredFields) {
        isEmptyValue(this.form[prop]) &&
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
      }
    },

    handleButtonDeleteOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        location.reload()
        this.refreshFormData()
        window.alert(this.$t('msg_IsDeleted_0'))
      }
    },

    changeDataTable(data) {
      this.dataTable = data
    },

    changeDataDetailTable(data) {
      this.dataTable = data
    },

    handleImportData(data) {
      this.clickBomCompute = false
      this.clickDateCompute = false
      this.form.promiseDate = data.promiseDate?.value
      this.form.itemCode = data.itemCode?.value
      this.form.customerID = data.customerID?.value
      this.form.customerName = data.customerName?.value
      this.form.itemName = data.itemName?.value
      this.form.unit = data.unit?.value
      this.form.itemID = data.itemID?.value
      this.form.quantity = data.blance?.value
      this.form.sono = data.sono?.value
      this.form.startDate = data.startDate?.value
      this.form.itemTypeID = data.itemTypeID.value
      this.form.woLineNO = data.lineID?.value
      this.form.woNO = data.orderNO?.value
      const selected = {
        key: data?.itemCode?.value,
        itemName: data?.itemName?.value,
        itemId: data?.itemID?.value,
        itemTypeID: data?.itemTypeID?.value
      }
      this.$refs.materialDeliveryForm.changeItemCode(selected)
      this.$refs.materialDeliveryForm.resetForm()
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
.add-sale-order-page {
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
