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
    <RBForm ref="addRBForm" 
      :key="refreshAddRBFormKey"
      :data="form"
    />
    <BaseTableItemDetail
      ref="tableDetails"
      class="add-sale-order-table-details"
      :table-content="dataTable"
      :list-item-master="listItemCode"
      :table-type="'saleOrder'"
      :customer-id="form.customerId"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :show-quantity="true"
      :type-action="'ADD'"
      :new-line="newLine"
      @changeTable="changeDataDetailTable"
    ></BaseTableItemDetail>
    <ModalImport ref="importOrder" @importData="handleImportData"></ModalImport>
    <BaseModalAttach
      ref="attachments"
      :data="form"
      key-file-no="orderNumber"
      module-name="SOOrder"
    ></BaseModalAttach>
    <base-set-column-detail
      ref="baseSetColumnModal"
      :column-hides="columnHides"
      :get-scolumn-hides="getScolumnHides"
    />
    <div
      v-if="loading"
      class="spinner content d-flex justify-content-center align-items-center"
    >
      <b-spinner
        b-spinner
        style="width: 3rem; height: 3rem"
        label="Loading..."
      ></b-spinner>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import ModalImport from './ModalImport.vue'
import RBForm from './RBForm.vue'
import systemMixins from '@/mixins/system'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { getUnique } from '@/utils/utils'
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseModalAttach from '@/components/UI/BaseModalAttach.vue'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import BaseSetColumnDetail from '@/components/UI/Table/BaseSetColumnDetail.vue'

export default {
  components: {
    ToolBar,
    RBForm,
    BaseModalAttach,
    BaseValidateMessage,
    ModalImport,
    BaseTableItemDetail,
    BaseSetColumnDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      lang: this.$i18n.locale,
      refreshAddRBFormKey: 0,
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
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
        },
        // {
        //   key: 'check',
        //   label: this.$t('btn_btnCheck_0'),
        //   icon: '/images/check.png',
        // },
        // {
        //   key: 'unCheck',
        //   label: this.$t('btn_btnUnCheck_0'),
        //   icon: '/images/uncheck.png',
        // },
        {
          key: 'set',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'backAdd',
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
        checker: '',
        departmentID: '',
        editDate: '',
        editor: '',
        entryDate: this.convertDate(new Date()),
        margin: 0,
        memo: '',
        responsiblePerson: '',
        totalCreditAmount: 0,
        totalDebitAmount: 0,
      },
      form: {},
      dataTable: [
        {
          lineID: 1,
          companyName: "",
          creditAmount: 0,
          currency: '',
          date: this.convertDate(new Date()),
          debitAmount: 0,
          employee: "",
          invoiceDate: "",
          invoiceNotes: "",
          invoiceNumber: "",
          isInvoice: false,
          itemID: 0,
          opponentSubject: "",
          reason: "",
          subject: "",

          isUpdate: true,
          isNewLine: true,
        },
      ],
      loading: false,
      isAddSuccess: false,
      dataImportDetail: [],
      listItemCode: [],
      columnHides: [],
    }
  },

  async fetch() {
    try {
      this.form = Object.assign({}, this.defaultFormData)
      await Promise.all([
        this.getListItemCode(),
        this.getItemTypeOptionsFromAPI(),
        this.getUnitOptions(this.$i18n.locale),
        this.getScolumnHides(),
        this.getCurrencyOptions(this.lang),
        this.getListAccountingItems(this.lang),
        this.getListCurrentAssets(this.lang),
      ])
    } catch (err) {
      console.error(err)
    }
  },

  computed: {
    ...mapGetters('base', {
      unitOptions: 'getUnitOptions',
      getItemTypeOptions: 'getItemTypeOptions',
      currencyOptions: "getCurrencyOptions",
      listAccountingItems: "getListAccountingItems",
      listCurrentAssets: "getListCurrentAssets",
    }),

    ...mapGetters('base', ['getActiveButtonToolBar']),

    itemCurrencyOptions() {
      return this.currencyOptions.map((item) => ({
        text: item.text,
        value: item.value,
      }))
    },
    itemListAccountingItems() {
      return this.listAccountingItems.map((item) => ({
        text: item.text,
        value: item.value,
      }))
    },
    itemListCurrentAssets() {
      return this.listCurrentAssets.map((item) => ({
        text: item.text,
        value: item.value,
      }))
    },

    checkboxOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
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
          key: 'date',
          name: this.$t('lbl_RBdate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'subject',
          name: this.$t('lbl_RBsubject_0'),
          filter: 'select',
          typeInput: 'select',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
          options: this.itemListAccountingItems
        },
        {
          key: 'creditAmount',
          name: this.$t('lbl_RBamount_0'),
          filter: 'input',
          width: 150,
          align: 'left',
          fieldRequired: true,
          hidden: false,
        },
        {
          key: 'opponentSubject',
          name: this.$t('lbl_RBopponentSubject_0'),
          filter: 'select',
          typeInput: 'select',
          width: 150,
          align: 'left',
          disabled: this.isCheck,
          fieldRequired: true,
          hidden: false,
          options: this.itemListCurrentAssets
        },
        {
          key: 'debitAmount',
          name: this.$t('lbl_RBamount_0'),
          filter: 'input',
          width: 200,
          align: 'left',
          fieldRequired: true,
          hidden: false,
          disabled: this.isCheck,
        },
        {
          key: 'currency',
          name: this.$t('lbl_RBcurrency_0'),
          filter: 'select',
          typeInput: 'select',
          width: 150,
          align: 'left',
          fieldRequired: true,
          hidden: false,
          disabled: this.isCheck,
          options: this.itemCurrencyOptions
          
        },
        {
          key: 'companyName',
          name: this.$t('lbl_RBcompanyName_0'),
          filter: 'input',
          width: 150,
          align: 'right',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'isInvoice',
          name: this.$t('lbl_RBisInvoice_0'),
          filter: 'checkbox',
          width: 100,
          align: 'center',
          dataType: 'checkbox',
          disabled: false,
          fieldRequired: false,
          hidden: false,
          options: this.checkboxOptions,
          headerFilter: 'select',
        },
        {
          key: 'invoiceNumber',
          name: this.$t('lbl_RBinvoiceNumber_0'),
          filter: 'number',
          width: 150,
          align: 'right',
          fieldRequired: false,
          hidden: false,
          disabled: this.isCheck,
        },
        {
          key: 'invoiceDate',
          name: this.$t('lbl_RBinvoiceDate_0'),
          filter: 'datetime',
          width: 200,
          align: 'left',
          disabled: false,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'invoiceNotes',
          name: this.$t('lbl_RBinvoiceNotes_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          typeInput: 'input',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'employee',
          name: this.$t('lbl_RBemployee_0'),
          filter: 'input',
          width: 300,
          align: 'left',
          typeInput: 'input',
          disabled: this.isCheck,
          fieldRequired: false,
          hidden: false,
        },
        {
          key: 'reason',
          name: this.$t('lbl_RBreason_0'),
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
        companyName: "",
        creditAmount: 0,
        currency: '',
        date: this.convertDate(new Date()),
        debitAmount: 0,
        employee: "",
        invoiceDate: "",
        invoiceNotes: "",
        invoiceNumber: "",
        isInvoice: false,
        itemID: 0,
        opponentSubject: "",
        reason: "",
        subject: "",

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
          // case 'check':
          //   item.disabled = !this.getActiveButtonToolBar?.isCheck
          //   break
          // case 'unCheck':
          //   item.disabled = !this.getActiveButtonToolBar?.isCheck
          //   break
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
        let totalDebitAmount = 0;
        let totalCreditAmount = 0;
        let margin = 0;
        
        value.map((item) =>{
          const debitAmount = item.debitAmount ?? 0;
          const creditAmount = item.creditAmount ?? 0;

          totalDebitAmount = totalDebitAmount + Number(debitAmount)
          totalCreditAmount = totalCreditAmount + Number(creditAmount)
        });

        margin = totalCreditAmount - totalDebitAmount

        this.form.totalDebitAmount = totalDebitAmount ?? 0
        this.form.totalCreditAmount = totalCreditAmount ?? 0
        this.form.margin = margin
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    ...mapActions('base', [
      'getUnitOptions',
      'getItemTypeOptionsFromAPI',
      'getCurrencyOptions',
      'getListAccountingItems',
      'getListCurrentAssets'
    ]),

    async getScolumnHides() {
      try {
        this.loading = true

        const response = await api('getScolumnHides', {
          gridName: 'ReceiveBrowseManualDetail',
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

        case 'save':
          this.handleSaveOrder()
          break

        case 'delete':
          this.handleButtonDeleteOrder()
          break

        case 'backAdd':
          this.$router.push(this.localePath({ path: '/finance/receive-browse' }))
          break

        case 'close':
          this.$router.push(this.localePath({ path: '/' }))
          break

        // case 'check':
        //   this.handleButtonCheck()
        //   break
        
        // case 'unCheck':
        //   this.handleButtonUnCheck()
        //   break

        case 'set':
          this.$refs.baseSetColumnModal.showModal = true
          break

        default:
          break
      }
    },
    resetTableDetailData() {
      this.dataTable = []
      this.$refs.tableDetails.resetSearchData()
      this.$refs.tableDetails.activeRow = -1
    },
    refreshFormData() {
      ++this.refreshAddRBFormKey
    },
    async handleRefresh() {
      this.listErrorMessage = []
      this.resetTableDetailData()
      await Promise.all([this.$fetch(), this.$refs.addRBForm.$fetch()])
      this.refreshFormData()
      this.addNewLineData()
    },
    // handleButtonCheck() {
    //   return window.confirm(this.$t('msg_NoCheck_0'))
    // },

    // handleButtonUnCheck() {
    //   return window.confirm(this.$t('msg_NoCheck_0'))
    // },

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
        entryDate: 'EntryDate',
      };
      
      const requiredTableDetails = {
        date: 'date',
        subject: 'subject',
        creditAmount: 'creditAmount',
        opponentSubject: 'opponentSubject',
        debitAmount: 'debitAmount',
        currency: 'currency',
      };

      Object.keys(requiredFields).forEach((field) => {
        if (!this.form[field]) {
          errors.push({
            fieldName: this.$t(`lbl_RB${requiredFields[field]}_0`),
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
            if (!item[field]) {
              errors.push({
                fieldName: `${this.$t('lbl_RBlineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_RB${requiredTableDetails[field]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
              })
            }
          })
        })
      }

      if (this.form.margin !== 0) {
          errors.push({
            fieldName: this.$t(`lbl_RBmargin_0`),
            text: this.$t('msg_MustBeZero_0'),
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
          checker: payload.checker,
          departmentID: payload.departmentID,
          editDate: payload.editDate,
          editor: payload.editor,
          entryDate: payload.entryDate,
          margin: payload.margin,
          memo: payload.memo,
          orderNumber: payload.orderNumber,
          responsiblePerson: payload.responsiblePerson,
          totalCreditAmount: payload.totalCreditAmount,
          totalDebitAmount: payload.totalDebitAmount,
          listDetail: dataTableFilter.map((item) => {
            return {
              companyName: item.companyName,
              creditAmount: item.creditAmount,
              currency: item.currency,
              date: item.date,
              debitAmount: item.debitAmount,
              employee: item.employee,
              invoiceDate: item.invoiceDate,
              invoiceNotes: item.invoiceNotes,
              invoiceNumber: item.invoiceNumber,
              isInvoice: item.isInvoice,
              itemID: item.itemID,
              lineID: item.lineID,
              opponentSubject: item.opponentSubject,
              reason: item.reason,
              subject: item.subject
            }
          }),
        }

        try {
          this.loading = true
          const response = await api('addARReceiveBrowse', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === 200) {
            window.alert(this.$t('msg_IsSaved_0'))
            this.$router.push({
              // path: `/${this.$i18n.locale}/sales/order/detail?sono=${response.data._1.orderNumber}`,
            })
          }
        } catch (error) {
          console.error(error)
        } finally {
          this.loading = false
        }
      }
    },

    getMessageError(listError) {
      this.listErrorMessage = []
      this.listErrorMessage = [...this.listErrorMessage, ...listError]
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

    handleImportData(data) {
      this.dataTable = this.availableListDetails
        .concat(data)
        .map((item, index) => ({
          ...item,
          promiseDate: this.convertDate(item.promiseDate),
          price: this.parseStringToFloat(item.price || 0),
          quantity: this.parseStringToFloat(item.quantity || 0),
          amount: this.parseStringToFloat(item.amount || 0),
          lineID: index + 1,
        }))

      this.addNewLineData()
    },

    changeDataDetailTable(data) {
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
