<template>
  <div class="edit-inventory-adjustment-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <DetailAdjustmentForm :data-form="form"></DetailAdjustmentForm>
    <DetailTableProduct
      ref="invoiceFormTableItems"
      class="add-sale-invoice-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'inventoryAdjustment'"
      :column-hides="columnHides"
      :header-detail="tableHeaders"
      :new-line="newLine"
      :line-limit="INVENTORY_ADJUSTMENT.MAX_DETAIL_LINES"
      @changeTable="changeDataTable"
    ></DetailTableProduct>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { downloadFileExcel, sum, formatNumberWithCommas } from '@/utils/utils'
import commonMixins from '@/mixins/commonOptions'
import dateTimeMixins from '@/mixins/dateTime'
import systemMixins from '@/mixins/system'
import DetailAdjustmentForm from '@/components/Inventory/Adjustment/Detail/DetailAdjustmentForm'
import { SERVER_RESPONSE_CODE, INVENTORY_ADJUSTMENT } from '@/constants'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import DetailTableProduct from '@/components/Inventory/Adjustment/DetailTableProduct.vue'

export default {
  components: {
    ToolBar,
    DetailAdjustmentForm,
    BaseValidateMessage,
    BaseLoading,
    BaseSetColumnDetail,
    DetailTableProduct,
  },
  mixins: [dateTimeMixins, systemMixins, commonMixins],
  data() {
    return {
      filteredDataTable: [],
      dataTable: [
        {
          lineID: 1,
          itemCode: '',
          productName: '',
          description: '',
          unitID: '',
          warehouseID: '',
          rackNo: '',
          weight: 0,
          isBad: false,
          isPrinted: false,
          lotNO: '',
          quantity: 0,
          price: 0,
          amount: 0,
          reason: '',
          isUpdate: true,
          isNewLine: true,
        },
      ],
      listItemCode: [],
      columnHides: [],
      lang: this.$i18n.locale,
      loading: false,
      listErrorMessage: [],
      form: {},
      INVENTORY_ADJUSTMENT,
    }
  },
  fetch() {
    try {
      this.loading = true
      Promise.all([
        this.getDetailData(),
        this.getListItemCode(),
        this.getItemTypeOptionsFromAPI(),
        this.getWarehouseOptions(this.lang),
        this.getUnitOptions(this.lang),
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
      getItemTypeOptions: 'getItemTypeOptions',
      warehouseOptions: 'getWarehouseOptions',
      getActiveButtonToolBar: 'getActiveButtonToolBar',
    }),

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
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'lineID',
          name: 'ID',
          align: 'center',
          filter: '',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'itemCode',
          name: this.$t('lbl_ItemCode_0'),
          filter: 'autocomplete',
          align: 'left',
          fieldRequired: true,
          hidden: false,
          options: this.listItemCode,
        },
        {
          key: 'itemTypeID',
          name: this.$t('lbl_ItemType_0'),
          filter: 'select',
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
          options: this.itemTypeOptions,
        },
        {
          key: 'productName',
          name: this.$t('lbl_ItemName_0'),
          filter: 'input',
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'description',
          name: this.$t('lbl_Description_0'),
          filter: 'input',
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'unitID',
          name: this.$t('lbl_Unit_0'),
          filter: 'select',
          align: 'left',
          disabled: false,
          fieldRequired: false,
          hidden: false,
          options: this.unitOptions,
        },
        {
          key: 'warehouseID',
          name: this.$t('lbl_WarehouseID_0'),
          filter: 'select',
          align: 'left',
          disabled: false,
          fieldRequired: false,
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
        },
        {
          key: 'weight',
          name: this.$t('lbl_Weight_0'),
          filter: 'number',
          align: 'right',
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'isBad',
          name: this.$t('lbl_IsBad_0'),
          filter: 'select',
          dataType: 'checkbox',
          align: 'center',
          disabled: false,
          fieldRequired: false,
          hidden: false,
          options: this.booleanOptions,
        },
        {
          key: 'isPrinted',
          name: this.$t('lbl_IsPrinted_0'),
          filter: 'select',
          dataType: 'checkbox',
          align: 'center',
          disabled: true,
          fieldRequired: false,
          hidden: false,
          options: this.booleanOptions,
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
          key: 'quantity',
          name: this.$t('lbl_Quantity_0'),
          filter: 'number',
          align: 'right',
          disabled: false,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'price',
          name:
            this.lang === 'japanese'
              ? this.$t('lbl_CostPrice_0')
              : this.$t('lbl_Price_0'),
          filter: 'number',
          align: 'right',
          disabled: false,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'amount',
          name: this.$t('lbl_Amount_0'),
          filter: 'number',
          align: 'right',
          disabled: false,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'reason',
          name: this.$t('lbl_Reason_0'),
          filter: 'input',
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
        productName: '',
        description: '',
        unitID: '',
        warehouseID: '',
        rackNo: '',
        weight: 0,
        isBad: false,
        isPrinted: false,
        lotNO: '',
        quantity: 0,
        price: 0,
        amount: 0,
        reason: '',
        isUpdate: true,
        isNewLine: true,
      }
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
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
          disabled: !this.getActiveButtonToolBar.isDelete,
        },

        {
          key: 'print',
          label: this.$t('btn_btnPrint_0'),
          icon: '/images/print.png',
          disabled: !this.getActiveButtonToolBar.isPrint,
        },
        {
          key: 'setInventoryAdjustment',
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
    itemTypeOptions() {
      return this.getItemTypeOptions.map((item) => ({
        text: this.$t(`${item.text}`),
        value: item.value,
      }))
    },
    isMaxDetailLines() {
      return (
        this.availableListDetails.length >=
        INVENTORY_ADJUSTMENT.MAX_DETAIL_LINES
      )
    },
  },
  watch: {
    dataTable: {
      deep: true,
      handler(value) {
        this.form.totalWeight = sum(
          value.map((item) =>
            this.numberRemoveComas(Number(item.weight) * Number(item.quantity))
          )
        )?.toFixed(2)
        this.form.totalAmount = formatNumberWithCommas(
          sum(value.map((item) => Number(item.amount)))
        )
        this.form.totalQuantity = sum(
          value.map((item) => Number(item.quantity))
        )
      },
    },
  },

  methods: {
    ...mapActions('base', [
      'getWarehouseOptions',
      'getUnitOptions',
      'getItemTypeOptionsFromAPI',
    ]),
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

        const response = await api('getScolumnHides', {
          gridName: 'InvAdjustmentDetail',
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

    async getDetailData() {
      const params = {
        orderNO: this.$route.query?.orderNO,
        lang: this.$i18n.locale,
      }
      const response = await api('getDetailInventoryAdjustment', params)
      this.form = response?.data
      this.form.editDate = this.convertDate(new Date(this.form.editDate))
      this.dataTable = response?.data?.listDtl.map((item) => {
        item.price = item.price ?? 0
        item.lotNo = item.lotNO
        item.printed = item.isPrinted
        return item
      })
      if (!this.isMaxDetailLines) {
        this.dataTable.push({
          ...this.newLine,
          lineID: this.dataTable.length + 1,
        })
      }
    },
    async handleAction(key) {
      if (key === 'add') {
        return this.handleButtonAdd()
      }
      if (key === 'save') {
        return this.handleButtonSave()
      }
      if (key === 'delete') {
        return this.handleButtonDelete()
      }
      if (key === 'back') {
        return this.$router.push(
          this.localePath({
            path: `/inventory/adjustment?type=${this.$route.query?.type}`,
          })
        )
      }
      if (key === 'print') {
        return await this.handlePrintDetails()
      }
      if (key === 'setInventoryAdjustment') {
        return (this.$refs.baseSetColumnModal.showModal = true)
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    async handlePrintDetails() {
      try {
        const selectedDetails =
          this.$refs.invoiceFormTableItems.listCheckbox.filter(
            (item) => item.value
          ) || []
        const systemIDs = selectedDetails.map((item) => item.systemId) || []

        const queryParams = {
          inventoryNO: this.form.orderNo,
          lang: this.$i18n.locale,
          systemIDs,
        }

        this.loading = true

        const response = await api(
          'printInventoryAdjustmentDetails',
          queryParams
        )
        const validResponse =
          response?.status === SERVER_RESPONSE_CODE.OK && response?.data

        if (validResponse) {
          downloadFileExcel(response.data)
          return await this.getDetailData()
        }
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
          this.localePath({
            path: `/inventory/adjustment/add?type=${this.$route.query?.type}`,
          })
        )
      }
    },
    async handleButtonSave() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.validate()

        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        this.loading = true

        this.makeApiPayload()

        await this.sendUpdateRequest()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    validate() {
      this.listErrorMessage = []

      const requiredFields = {
        transDate: 'TransDate',
      }

      for (const prop in requiredFields) {
        if (!this.form[prop]) {
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
        }
      }
      const requiredTableDetail = {
        itemCode: 'ItemCode',
        quantity: 'Quantity',
        price: 'Price',
        warehouseID: 'Warehouse',
      }
      const isEmptyDetails = this.availableListDetails.length === 0
      if (isEmptyDetails) {
        this.listErrorMessage.push({
          id: Date.now(),
          fieldName: this.$t(`msg_Details_0`),
          text: this.$t('msg_NoInput_0'),
        })
      } else {
        this.availableListDetails.forEach((item) => {
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

      this.emitErrorMessage()
    },
    makeApiPayload() {
      const convertDateFields = ['transDate']
      for (const key of convertDateFields) {
        this.form[key] = this.convertDate(new Date(this.form[key]))
      }
      this.form.departID = this.form.departmentID
      this.form.orderNO = this.form.orderNo
      this.form.editRequest = this.availableListDetails.map((item) => {
        item.lotNo = item.lotNO
        item.unitID = this.unitOptions?.find(
          (_el) => _el.value === item.unitID
        )?.value
        return item
      })
    },
    async sendUpdateRequest() {
      const response = await api('updateInventoryAdjustment', {
        lang: this.$i18n.locale,
        type: this.$route.query?.type,
        form: this.form,
      })
      const errorCode = response?.data?.response?.status
      if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
        window.alert(this.$t(response?.data?.response?.data?.message))
        return
      }

      const validResponse =
        response && response?.status === SERVER_RESPONSE_CODE.OK

      if (validResponse) {
        window.alert(this.$t('msg_IsSaved_0'))
        return await this.getDetailData()
      }
      if (!validResponse) {
        return window.alert(
          this.$t(`${response?.data?.response?.data?.message}`)
        )
      }
    },
    emitErrorMessage() {
      this.$emit('validation-errors', this.listErrorMessage)
    },
    async handleButtonDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        this.loading = true
        const res = await api('deleteInventoryAdjustment', {
          orderNO: this.$route.query?.orderNO,
        })
        this.loading = false
        const errorCode = res?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(res?.data?.response?.data?.message))
          return
        }
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsDeleted_0'))
          this.$router.push(
            this.localePath({
              path: `/inventory/adjustment/add?type=${this.$route.query?.type}`,
            })
          )
        }
      }
    },
    changeDataTable(data) {
      this.dataTable = data
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-inventory-adjustment-page {
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
