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
    <FormInputProductionOrder
      ref="addOrderForm"
      :key="refreshAddOrderFormKey"
      :data="form"
      :list-item-code="listItemCode"
      @change-item-code="changeItemCode"
    />
    <BaseTableItemDetail
      ref="productionOrderTableItem"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'outwardOrder'"
      :customer-id="form.customerID"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    >
      <template #subBeginDate="{ item }">
        <span
          :class="{
            'text-danger': dateIsPastOrPresent(item.subBeginDate),
          }"
          >{{ item.subBeginDate }}</span
        >
      </template>
    </BaseTableItemDetail>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNo"
      module-name="ProductionOrder"
    ></BaseModalAttach>
    <ModalImportProductionOrder
      ref="importProductionOrder"
      :form="form"
      @update-details="handleImportData"
    />
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
import { cloneDeep } from 'lodash'
import FormInputProductionOrder from '@/components/Production/ProductionOrder/FormInputProductionOrder.vue'
import systemMixins from '@/mixins/system'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import { SERVER_RESPONSE_CODE, ITEM_TYPE, ITEM_UNIT } from '@/constants'
import { getUnique } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import ModalImportProductionOrder from '@/components/Production/ProductionOrder/Import/ModalImportProductionOrder.vue'
import { isEmptyValue } from '~/utils/utils'

export default {
  name: 'PageAddProductionOrder',
  components: {
    ToolBar,
    FormInputProductionOrder,
    BaseModalAttach,
    BaseValidateMessage,
    BaseTableItemDetail,
    BaseSetColumnDetail,
    BaseLoading,
    ModalImportProductionOrder,
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
          key: 'newSave',
          label: this.$t('btn_btnNewSave_0'),
          icon: '/images/new_save.png',
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
        deliveryDate: this.convertDate(new Date()),
        // beginDate: this.convertDate(new Date()),
        isFinished: false,
      },
      form: {},
      dataTable: [
        {
          lineID: 1,
          subItemCode: '',
          subItemID: '',
          subItemTypeID: '',
          subItemName: '',
          subDescription: '',
          subUnitID: '',
          subQuantity: 0,
          subProcessDays: 0,
          subBeginDate: this.convertDate(new Date()),
          subEndDate: this.convertDate(new Date()),
          memoDTL: '',
          completionQuantity: 0,
          completionDate: '',
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

  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      getItemTypeOptions: 'base/getItemTypeOptions',
      getActiveButtonToolBar: 'base/getActiveButtonToolBar',
      generatedProductionOrder: 'mrp/getGeneratedProductionOrder',
    }),
    ...mapGetters({
      userInfo: 'getUserInfo',
    }),

    itemTypeOptions() {
      return this.getItemTypeOptions
        .map((item) => ({
          text: this.$t(`${item.text}`),
          value: item.value,
        }))
        .filter(
          (item, idx) =>
            idx === ITEM_TYPE.EMPTY ||
            item.value === ITEM_TYPE.INTERMEDIATE_PRODUCT ||
            item.value === ITEM_TYPE.PRODUCT_PROCESS
        )
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
          key: 'subBeginDate',
          name: this.$t('lbl_StartDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: false,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'subEndDate',
          name: this.$t('lbl_EndDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: false,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'subProcessDays',
          name: this.$t('lbl_ProductionLT_0'),
          filter: 'number',
          width: 120,
          align: 'right',
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
          typeInput: 'select',
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
          key: 'completionQuantity',
          name: this.$t('lbl_CompletionQuantity_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'completionDate',
          name: this.$t('lbl_CompletionDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: true,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'memoDTL',
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
        subItemTypeID: '',
        subItemName: '',
        subDescription: '',
        subUnitID: '',
        subQuantity: 0,
        subProcessDays: 0,
        subBeginDate: this.convertDate(new Date()),
        subEndDate: this.convertDate(new Date()),
        memoDTL: '',
        completionQuantity: 0,
        completionDate: '',
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
      handler(value) {
        if (value.length > 0) {
          const dataCompute = value.length > 0 ? value[0] : []
          // this.form.beginDate = this.convertDate(dataCompute.beginDate)
          this.form.sortID = dataCompute.sortID
          this.form.classesID = dataCompute.classesID
        }
      },
      deep: true,
    },
    'form.deliveryDate': {
      handler() {
        // this.clickBomCompute = false
        this.clickDateCompute = false
      },
    },
  },
  async mounted() {
    try {
      this.form = Object.assign({}, this.defaultForm)
      await Promise.all([
        this.getListItemCode(),
        this.getItemTypeOptionsFromAPI(),
        this.getUnitOptions(this.$i18n.locale),
        this.getScolumnHides(),
      ])

      if (this.generatedProductionOrder) {
        this.form = cloneDeep(this.generatedProductionOrder)
        const listCustomer = this.$refs.addOrderForm.listSupplierName
        const selectedCustomer = listCustomer.find(
          (el) => el.value === this.form.customerID
        )
        const selectedItem = this.listItemCode.find(
          (el) => el.itemId === this.form.itemID
        )
        if (selectedCustomer) {
          this.form.customerID = selectedCustomer.value
          this.form.customerName = selectedCustomer.text
        }
        if (selectedItem) {
          this.form.itemID = selectedItem.itemId
          this.form.itemCode = selectedItem.key
          this.form.itemTypeID = selectedItem.itemTypeID
          this.form.itemName = selectedItem.itemName

          // Rounds up quantity for item unit pieces
          const unitName = this.unitOptions.find(
            (item) => item.value === selectedItem.unitID
          )?.text
          const roundUpQty =
            this.form.confirmRoundUpQty && unitName === ITEM_UNIT.PIECES

          this.form.productionQuantity = roundUpQty
            ? Math.ceil(this.form.productionQuantity)
            : this.form.productionQuantity
        }
        this.form.deliveryDate = this.form.endDate

        await this.handleBomCompute()
        await this.handleDateCompute()
      }
    } catch (err) {
      console.error(err)
    }
  },

  beforeDestroy() {
    this.SET_GENERATED_PRODUCTION_ORDER(null)
  },
  methods: {
    ...mapActions('base', ['getUnitOptions', 'getItemTypeOptionsFromAPI']),
    ...mapMutations({
      UPDATE_PAYLOAD_PRODUCTION_ORDER_IMPORT:
        'filterSort/UPDATE_PAYLOAD_PRODUCTION_ORDER_IMPORT',
      SET_GENERATED_PRODUCTION_ORDER: 'mrp/SET_GENERATED_PRODUCTION_ORDER',
    }),

    changeItemCode(data) {
      if (data) {
        this.clickBomCompute = false
        this.clickDateCompute = false
      }
    },

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
          gridName: 'ProductionOrderDetail',
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

    handleAction(key) {
      switch (key) {
        case 'add':
          this.handleButtonAddOrder()
          break
        case 'newSave':
        case 'save':
          this.handleSaveOrder()
          break

        case 'delete':
          this.handleButtonDeleteOrder()
          break

        case 'attach':
          this.$refs.attachments.showModal = true
          break
        case 'import':
          this.handleOpenModalImport()
          break
        case 'bomCompute':
          this.handleBomCompute()
          break
        case 'dateCompute':
          this.handleDateCompute()
          break
        case 'back':
          this.$router.go(-1)
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
          this.handleButtonPrint()
          break
        default:
          break
      }
    },
    resetTableDetailData() {
      this.dataTable = []
      this.$refs.productionOrderTableItem.resetSearchData()
      this.$refs.productionOrderTableItem.activeRow = -1
    },
    refreshFormData() {
      this.clickBomCompute = false
      this.clickDateCompute = false
      ++this.refreshAddOrderFormKey
    },
    async handleRefresh() {
      this.listErrorMessage = []
      this.resetTableDetailData()
      await Promise.all([this.$fetch(), this.$refs.addOrderForm.$fetch()])
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
        itemCode: 'ItemCode',
        productionQuantity: 'ProductionQuantity',
        beginDate: 'ProductionStartDate',
      }
      const requiredTableDetails = {
        subItemCode: 'ItemCode',
        subQuantity: 'Quantity',
        subBeginDate: 'StartDate',
        subEndDate: 'EndDate',
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
              (['quantity'].includes(field) &&
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

    async handleSaveOrder() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (!confirm) {
        return
      }

      const validateInfo = this.validateForm()

      if (validateInfo) {
        const { dataTableFilter, payload } = validateInfo
        const params = {
          form: {
            ...payload,
            editUser: this.userInfo?.loginName,
            deliveryDate: this.convertDate(this.form.deliveryDate),
            listDetail: dataTableFilter.map((item) => {
              return {
                hourProductionQty: item.completionQuantity,
                subItemID: item.itemID,
                ...item,
              }
            }),
          },
          language: this.$i18n.locale,
        }

        try {
          this.loading = true
          const response = await api('addProductionOrder', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push({
              path: `/${this.$i18n.locale}/production/production-order/detail?orderNo=${response.data.orderNO}`,
            })
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.loading = false
        }
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
    handleOpenModalImport() {
      const itemCode = this.form.itemCode
      if (itemCode) {
        this.UPDATE_PAYLOAD_PRODUCTION_ORDER_IMPORT({
          mainItemCode: itemCode,
        })

        return (this.$refs.importProductionOrder.showModal = true)
      }
      window.alert(this.$t('msg_NoSelectItemCode_0'))
    },
    handleImportData(data) {
      this.clickBomCompute = false
      this.clickDateCompute = false

      const dataImport = data?.length > 0 ? data[0] : []
      this.form.soLineID = dataImport.lineID
      this.form.sono = dataImport?.sono
      this.form.customerID = dataImport?.customerID
      this.form.customerName = dataImport?.customerName
      this.form.productionQuantity = dataImport?.blance
      this.form.deliveryDate = dataImport?.promiseDate
      this.form.operationTypeID = dataImport?.operationTypeID
      this.$forceUpdate()
    },
    validateBomComputeData() {
      this.listErrorMessage = []

      const requiredFields = {
        itemID: 'ItemCode',
        deliveryDate: 'PromiseDate',
        productionQuantity: 'ProductionQuantity',
      }

      for (const prop in requiredFields) {
        isEmptyValue(this.form[prop]) &&
          this.listErrorMessage.push({
            fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
            text: this.$t('msg_NoInput_0'),
          })
      }
    },
    async handleBomCompute() {
      this.clickBomCompute = true
      try {
        this.loading = true
        this.validateBomComputeData()
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        const payload = {
          language: this.$i18n.locale,
          itemID: this.form.itemID,
          quantity: this.parseStringToFloat(this.form.productionQuantity),
          endDate: this.convertDate(this.form.deliveryDate),
        }
        const res = await api('newBomComputeProductionOrder', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }

        this.dataTable = res.data.map((item, index) => ({
          ...item,
          lineID: index + 1,
          subItemTypeID: item.itemTypeID,
          completionQuantity: item.goodProductionQty,
          completionDate: item.processingEndDate,
          subBeginDate: '',
          subEndDate: '',
        }))

        // if click BomCompute 2 times then clear start and end date
        if (this.availableListDetails[0]?.subBeginDate !== '') {
          this.dataTable = this.availableListDetails.map((item) => {
            return {
              ...item,
              subBeginDate: '',
              subEndDate: '',
            }
          })
        }

        this.form.beginDate = this.clickDateCompute
          ? this.availableListDetails[0]?.subBeginDate
          : ''
        const dataTableLength = this.availableListDetails?.length - 1
        this.form.endDate =
          this.availableListDetails[dataTableLength]?.subEndDate

        this.addNewLineData()

        this.$refs.addOrderForm.refresh()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleDateCompute() {
      this.clickDateCompute = true
      try {
        this.loading = true
        this.validateBomComputeData()
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return
        }

        const payload = {
          endDate: this.convertDate(this.form.deliveryDate),
          form: this.availableListDetails,
        }
        const res = await api('newDateComputeProductionOrder', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!validResponse) {
          return
        }
        if (this.clickBomCompute) {
          // this.dataTable = res.data.map((item, index) => {
          //   return {
          //     ...item,
          //     lineID: index + 1,
          //     subBeginDate: item.subBeginDate,
          //     subEndDate: item.subEndDate,
          //   }
          // })
          // get data date compute
          const dataDateCompute = res.data.map((item, index) => {
            return {
              lineID: index + 1,
              subBeginDate: item.subBeginDate,
              subEndDate: item.subEndDate,
            }
          })
          this.dataTable.pop()
          // merge date compute into current data table
          for (let i = 0; i < this.dataTable.length; i++) {
            for (let j = 0; j < dataDateCompute.length; j++) {
              if (this.dataTable[i].lineID === dataDateCompute[j].lineID) {
                this.dataTable[i].subBeginDate = dataDateCompute[j].subBeginDate
                this.dataTable[i].subEndDate = dataDateCompute[j].subEndDate
              }
            }
          }
        } else {
          // this.dataTable = res.data.map((item, index) => {
          //   return {
          //     lineID: index + 1,
          //     subBeginDate: item.subBeginDate,
          //     subEndDate: item.subEndDate,
          //   }
          // })
          this.dataTable = []
        }

        // if click DateCompute set Production start date = begin date
        this.form.beginDate = this.availableListDetails[0]?.subBeginDate
        const dataTableLength = this.availableListDetails?.length - 1
        this.form.endDate =
          this.availableListDetails[dataTableLength]?.subEndDate
        this.addNewLineData()

        this.$refs.addOrderForm.refresh()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleButtonPrint() {},
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
