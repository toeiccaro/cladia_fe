<template>
  <div class="edit-receive-browse-order-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <PayBrowseDetailForm
      :data="payBrowseData"
    ></PayBrowseDetailForm>
    <base-table-item-detail
      ref="PBFormTableItems"
      class="pb-table-details"
      :table-content="dataTable"
      :table-type="'PB'"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :new-line="newLine"
      :form="payBrowseData"
      @changeTable="changeDataDetailTable"
    />
    <BaseTableLoader v-if="loading" />
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { searchDetails, formatNumberWithCommas } from '@/utils/utils'
import { SERVER_RESPONSE_CODE } from '@/constants'
import systemMixins from '@/mixins/system'
import ToolBar from '@/components/UI/ToolBar.vue'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import PayBrowseDetailTable from '@/components/Finance/PayBrowse/PayBrowseDetailTable'
import PayBrowseDetailForm from '@/components/Finance/PayBrowse/Detail/PayBrowseDetailForm.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import { parseToNumber } from '@/utils/utils'

export default {
  components: {
    ToolBar,
    PayBrowseDetailForm,
    PayBrowseDetailTable,
    BaseValidateMessage,
    BaseTableLoader,
    BaseTableItemDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      lang: this.$i18n.locale,
      payBrowseData: {},
      loading: false,
      listItemMaster: [],
      hasError: false,
      listErrorMessage: [],
      dataTotalTable: {},
      dataTable: [],
      filteredDataTable: [],
      columnHides: [],
      listEmployee: [],
      listFieldCheck: [
        {
          key: 'PBBalanceAmount',
          fieldName: this.$t('lbl_PBBalanceAmount_0'),
        },
        {
          key: 'PBActualAmount',
          fieldName: this.$t('lbl_PBActualAmount_0'),
        },
      ],
      listFieldRequired: [
        {
          key: 'RBOpponentSubjectId',
          fieldName: this.$t('lbl_RBOpponentSubjectId_0'),
        },
      ],
    }
  },
  async fetch() {
    const res = await api('getEmployeeList')
    if (res && res.status === SERVER_RESPONSE_CODE.OK) {
      this.listEmployee = res.data || {}
    }

    await Promise.all([
      this.getListItemMaster(),
      this.getData(),
      this.getScolumnHides(),
    ])
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),

    ...mapGetters('base', {
      listAccountingItems: "getListAccountingItems",
    }),

    listEmployeeName() {
      const result = []
      for (const key in this.listEmployee) {
        const employeeValue = this.listEmployee[key] || ''
        const lastIndexOfOpenParenthese = employeeValue.lastIndexOf('(') || 0

        const appendText = employeeValue.substring(lastIndexOfOpenParenthese)
        const responsibleManValue = employeeValue.substring(
          0,
          lastIndexOfOpenParenthese
        )

        result.push({
          text: responsibleManValue,
          value: responsibleManValue,
          appendText,
        })
      }
      return result
    },

    itemListAccountingItems() {
      return this.listAccountingItems.map((item) => ({
        text: item.text,
        value: item.text,
      }))
    },

    isCheck() {
      return !!(this.payBrowseData?.checker && this.payBrowseData.checkDate)
    },

    newLine() {
      return {
        amount: 0,
        otherAmount: '',
        expenseCategory:'',
        date: '',
        apUser: '',
        memo: '',
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
          key: 'amount',
          name: this.$t('lbl_PBAmount_0'),
          filter: 'number',
          width: `12%`,
          align: 'right',
        },
        {
          key: 'otherAmount',
          name: this.$t('lbl_PBOtherAmount_0'),
          filter: 'number',
          width: `12%`,
          align: 'right',
        },
        {
          key: 'expenseCategory',
          name: this.$t('lbl_PBExpenseCategory_0'),
          filter: 'select',
          width: `24%`,
          options: this.itemListAccountingItems,
        },
        {
          key: 'date',
          name: this.$t('lbl_PBDate_0'),
          filter: 'datetime',
          width: `12%`,
        },
        {
          key: 'apUser',
          name: this.$t('lbl_PBApUser_0'),
          filter: 'select',
          width: `12%`,
          options: this.listEmployeeName,
        },
        {
          key: 'memo',
          name: this.$t('lbl_PBMemo_0'),
          filter: 'input',
          width: `18%`,
        },
      ]
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
    dataTable: {
      deep: true,
      handler(data) {
        this.handleAmountTable(data)
        this.filterDetails()
      },
    },
  },
  methods: {
    ...mapActions('base', [
      'getListAccountingItems',
    ]),

    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'ReceiveBrowseInvoiceDetail',
      })
      if (response.status === 200) {
        this.columnHides = response?.data || []
      }
    },
    
    setArAmount(data) {
      this.payBrowseData.amount = formatNumberWithCommas(data) || 0
    },
    async getListItemMaster() {
      const res = await api('getItemCode')
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.listItemMaster = res?.data
      }
    },
    filterDetails(filterData = {}) {
      this.filteredDataTable = searchDetails({
        data: this.dataTable,
        filterData: JSON.parse(JSON.stringify(filterData)),
      })
    },

    handleAmountTable(data = []) {
      //amount
      const totalAmount = data.reduce((sum, item) => sum + Number(item.amount), 0);
      this.payBrowseData.PBBalanceAmount = formatNumberWithCommas(parseToNumber(this.payBrowseData.PBTotalAmount) - totalAmount);

      //orther Amount
      const totalOrtherAmount = data.reduce((sum, item) => sum + Number(item.otherAmount), 0);
      this.payBrowseData.PBOtherExpensesAmount = formatNumberWithCommas(totalOrtherAmount);

      //actual Amount
      this.payBrowseData.PBActualAmount = formatNumberWithCommas(parseToNumber(this.payBrowseData.PBTotalAmount) - totalOrtherAmount);

    },

    changeDataDetailTable(data) {
      this.dataTable = data
    },

    async handleAction(key) {
      try {
        if (key === 'add') {
          const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
          if (confirm) {
            this.payBrowseData.payBrowsDTL.push({
              PBAmount: '',
              PBOtherAmount: '',
              PBExpenseCategory: '',
              PBDate: '',
              PBApUser: '',
              PBMemo: '',
              isUpdate: true,
              isNewLine: true,
            })
          }
        }
        if (key === 'save') {
          return await this.save()
        }
        if (key === 'delete') {
          try {
            const selectedDetailItems =
              this.$refs.payBrowseDetailForm.itemDetailAvailable

            const hasNoSelectedDetailItems = selectedDetailItems.every(
              (item) => !item.value
            )

            if (hasNoSelectedDetailItems) {
              return window.alert(this.$t('msg_NoSelected_0'))
            }

            const confirm = window.confirm(this.$t('msg_ConfirmDelDetail_0'))
            if (!confirm) {
              return
            }

            this.loading = true

            const deletePayBrowsePromises = selectedDetailItems.map(
              async (item) => {
                if (item.value) {
                  return await api('deletePayBrowseDetail', {
                    idDTL: item.id,
                  })
                }
              }
            )

            await Promise.all(deletePayBrowsePromises)

            await this.getData()

            this.$refs.payBrowseDetailForm.selectedItem = {}

            window.alert(this.$t('msg_IsDeleted_0'))
          } catch (err) {
            console.error(err)
          }

          return
        }
        if (key === 'close') {
          return this.$router.push(this.localePath({ path: '/' }))
        }
        if (key === 'back') {
          return this.$router.push(
            this.localePath({ path: '/finance/receive-browse' })
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    // eslint-disable-next-line require-await
    async save() {
      try {
        this.loading = true
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }
        this.listErrorMessage = []

        this.listFieldCheck.forEach((item) => {
          if (parseToNumber(this.payBrowseData[item.key]) < 0) {
            this.listErrorMessage.push({
              fieldName: item.fieldName,
              text: this.$t('msg_MustNotLessZero_0'),
            })
          }
        })

        this.listFieldRequired.forEach((item) => {
          if (!this.payBrowseData[item.key]){
            this.listErrorMessage.push({
              fieldName: item.fieldName,
              text: this.$t('msg_NoInput_0'),
            })
          }
        })

        this.payBrowseData.payBrowsDTL.map((item) => {
          const requiredFields = {
            otherAmount: 'PBOtherAmount',
            expenseCategory: 'PBExpenseCategory',
          };

          let otherAmount = !!item['otherAmount'];
          let expenseCategory = !!item['expenseCategory'];

          if (!(otherAmount && expenseCategory) && (otherAmount || expenseCategory)) {
            for (const key in requiredFields) {
              if (!item[key]) {
                this.listErrorMessage.push({
                  fieldName: `${this.$t('lbl_LineID_0')} ${
                  item.lineID
                } - ${this.$t(`lbl_${requiredFields[key]}_0`)}`,
                text: this.$t('msg_NoInput_0'),
                });
              }
            }
          }
        })
        
        if(this.listErrorMessage.length > 0){
          return
        }

        await this.addOrUpdateItem(this.payBrowseData)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async addOrUpdateItem(data) {
      console.log('data', data);
      data.payBrowsDTL.pop();
      try {
        const payload = {
          PBMstId: data.PBMstId,
          PBOrderNumber: data.PBOrderNumber,
          PBCustomerId: data.PBCustomerId,
          PBTotalAmount: parseToNumber(data.PBTotalAmount),
          PBMemo: data.PBMemo,
          PBSubjectId: data.PBSubjectId,
          PBOpponentSubjectId: data.PBOpponentSubjectId,
          PBCurrencyId: data.PBCurrencyId,
          PBBalanceAmount: parseToNumber(data.PBBalanceAmount),
          PBActualAmount: parseToNumber(data.PBActualAmount),
          PBOtherExpensesAmount: parseToNumber(data.PBOtherExpensesAmount),
          payBrowsDTL: data.payBrowsDTL.map((item) => {

            const PBExpenseCategory = this.findValueByText(
              this.itemListAccountingItems,
              item.expenseCategory,
            )

            const PBApUser = this.findValueByText(
              this.listEmployeeName,
              item.apUser,
            )

            return {
              PBLineID: item.lineID,
              PBAmount: parseToNumber(item.amount),
              PBOtherAmount: parseToNumber(item.otherAmount),
              PBExpenseCategory: PBExpenseCategory,
              PBDate: item.date,
              PBApUser: PBApUser,
              PBMemo: item.memo,
            }
          })
        }
        // return console.log('payload', payload);
        const res = await api('editInvoicePB', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          window.alert(this.$t('msg_IsSaved_0'))
          this.refresh()
        }
      } catch (err) {
        console.error(err)
      }
    },
    async getData() {
      try {
        this.loading = true

        const res = await api('getInvoiceDetailPB', {
          orderNo: this.$route.query?.sono,
          language: this.$i18n.locale,
        })

        const validPayResponse =
          res && res.status === SERVER_RESPONSE_CODE.OK

        if (validPayResponse) {

          this.payBrowseData = res?.data
          this.dataTable = res?.data?.payBrowsDTL || []
          
          const totalAmount = this.dataTable.reduce((sum, item) => sum + item.amount, 0);

          this.dataTable.push({
            lineID: 1,
            amount: formatNumberWithCommas(res?.data?.PBTotalAmount - totalAmount),
            otherAmount: '',
            expenseCategory:'',
            date: '',
            apUser: '',
            memo: '',
            isUpdate: true,
            isNewLine: true,
          })
          
          this.payBrowseData.PBBalanceAmount = formatNumberWithCommas(
            this.payBrowseData.PBBalanceAmount
          )
          this.payBrowseData.PBActualAmount = formatNumberWithCommas(
            this.payBrowseData.PBActualAmount
          )
          this.payBrowseData.PBTotalAmount = formatNumberWithCommas(
            this.payBrowseData.PBTotalAmount
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async refresh() {
      await this.getData()
    },

    changeDataTable(data) {
      this.dataTable = data
      this.payBrowseData.payBrowsDTL = data;
    },
  },
}
</script>
<style lang="scss" scoped>
.edit-receive-browse-order-page {
  background: #ffffff 50% bottom repeat-x;
  color: #222222;
  position: relative;
  padding: 0.2em;
  zoom: 1;
  font-size: 1.1em;
}
</style>
