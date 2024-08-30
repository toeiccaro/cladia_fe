<template>
  <div class="edit-receive-browse-order-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <ReceiveBrowseDetailForm
      :data="receiveBrowseData"
    ></ReceiveBrowseDetailForm>
    <BaseTableItemDetail
      ref="RBFormTableItems"
      class="rb-table-details"
      :table-content="dataTable"
      :table-type="'RB'"
      :column-hides="columnHides"
      :disable-input="isCheck"
      :header-detail="tableHeaders"
      :new-line="newLine"
      :form="receiveBrowseData"
      @changeTable="changeDataDetailTable"
      :onDelete="handleDelete"
    ></BaseTableItemDetail>
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
import ReceiveBrowseDetailTable from '@/components/Finance/ReceiveBrowse/ReceiveBrowseDetailTable'
import ReceiveBrowseDetailForm from '@/components/Finance/ReceiveBrowse/Detail/ReceiveBrowseDetailForm.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
import BaseTableItemDetail from '@/components/UI/Table/BaseTableItemDetail.vue'
import { parseToNumber } from '@/utils/utils'

export default {
  components: {
    ToolBar,
    ReceiveBrowseDetailForm,
    ReceiveBrowseDetailTable,
    BaseValidateMessage,
    BaseTableLoader,
    BaseTableItemDetail,
  },
  mixins: [dateTime, systemMixins],
  data() {
    return {
      lang: this.$i18n.locale,
      receiveBrowseData: {},
      loading: false,
      listItemMaster: [],
      hasError: false,
      listErrorMessage: [],
      dataTable: [],
      dataTotalTable: {},
      filteredDataTable: [],
      columnHides: [],
      listEmployee: [],
      listFieldCheck: [
        {
          key: 'RBBalanceAmount',
          fieldName: this.$t('lbl_RBBalanceAmount_0'),
        },
        {
          key: 'RBActualAmount',
          fieldName: this.$t('lbl_RBActualAmount_0'),
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
      listAccountingItems: 'getListAccountingItems',
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
      return !!this.receiveBrowseData?.checker
    },

    newLine() {
      return {
        amount: 0,
        otherAmount: '',
        expenseCategory:'',
        paymentDate: '',
        arUser: '',
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
          name: this.$t('lbl_RBAmount_0'),
          filter: 'number',
          width: `12%`,
          align: 'right',
          fieldRequired: true,
        },
        {
          key: 'otherAmount',
          name: this.$t('lbl_RBOtherAmount_0'),
          filter: 'number',
          width: `12%`,
          align: 'right',
        },
        {
          key: 'expenseCategory',
          name: this.$t('lbl_RBExpenseCategory_0'),
          filter: 'select',
          width: `24%`,
          options: this.itemListAccountingItems,
        },
        {
          key: 'paymentDate',
          name: this.$t('lbl_RBPaymentDate_0'),
          filter: 'datetime',
          width: `12%`,
          fieldRequired: true,
        },
        {
          key: 'arUser',
          name: this.$t('lbl_RBArUser_0'),
          filter: 'select',
          width: `12%`,
          options: this.listEmployeeName,
          fieldRequired: true,
        },
        {
          key: 'memo',
          name: this.$t('lbl_RBMemo_0'),
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
          disabled: !this.getActiveButtonToolBar.isDelete || this.isCheck,
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
        this.handleDate(data)
        this.handleAmountTable(data)
        this.filterDetails()
      },
    },
  },
  methods: {
    ...mapActions('base', ['getListAccountingItems']),

    async getScolumnHides() {
      const response = await api('getScolumnHides', {
        gridName: 'ReceiveBrowseInvoiceDetail',
      })
      if (response.status === 200) {
        this.columnHides = response?.data || []
      }
    },

    setArAmount(data) {
      this.receiveBrowseData.amount = formatNumberWithCommas(data) || 0
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
      const totalAmount = data.reduce((sum, item, index) => {
        return index < data.length - 1 ? sum + Number(item.amount) : sum
      }, 0)
      this.receiveBrowseData.RBBalanceAmount = formatNumberWithCommas(
        parseToNumber(this.receiveBrowseData.RBTotalAmount) - totalAmount
      )

      //orther Amount
      const totalOrtherAmount = data.reduce(
        (sum, item) => sum + Number(item.otherAmount),
        0
      )
      this.receiveBrowseData.RBOtherExpensesAmount =
        formatNumberWithCommas(totalOrtherAmount)

      //actual Amount
      this.receiveBrowseData.RBActualAmount = formatNumberWithCommas(
        parseToNumber(this.receiveBrowseData.RBTotalAmount) - totalOrtherAmount
      )
    },

    handleDate(data = []) {
      data.forEach(item => {item.paymentDate = this.convertDate(item.paymentDate) });  
    },

    changeDataDetailTable(data) {
      this.dataTable = data
    },

    async handleAction(key) {
      try {
        if (key === 'add') {
          const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
          if (confirm) {
            const lastRB =  this.receiveBrowseData.receiveBrowsDTL[this.receiveBrowseData.receiveBrowsDTL.length - 1]
            if(lastRB) {
              lastRB.amount = '';
              lastRB.otherAmount = '';
              lastRB.expenseCategory = '';
              lastRB.paymentDate = '';
              lastRB.arUser = '';
              lastRB.memo = '';
            }
          }
        }
        if (key === 'save') {
          return await this.save()
        }

        if (key === 'delete') {
          return await this.handleButtonDeleteOrder()
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
          if (parseToNumber(this.receiveBrowseData[item.key]) < 0) {
            this.listErrorMessage.push({
              fieldName: item.fieldName,
              text: this.$t('msg_MustNotLessZero_0'),
            })
          }
        })

        this.listFieldRequired.forEach((item) => {
          if (!this.receiveBrowseData[item.key]) {
            this.listErrorMessage.push({
              fieldName: item.fieldName,
              text: this.$t('msg_NoInput_0'),
            })
          }
        })

        this.receiveBrowseData.receiveBrowsDTL = this.dataTable

        this.receiveBrowseData.receiveBrowsDTL.map((item, index) => {
          if(index < this.receiveBrowseData.receiveBrowsDTL.length - 1 ) {
            const sameFields = {
              otherAmount: 'RBOtherAmount',
              expenseCategory: 'RBExpenseCategory',
            }

            let otherAmount = !!item['otherAmount']
            let expenseCategory = !!item['expenseCategory']

            if (
              !(otherAmount && expenseCategory) &&
              (otherAmount || expenseCategory)
            ) {
              for (const key in sameFields) {
                if (!item[key]) {
                  this.listErrorMessage.push({
                    fieldName: `${this.$t('lbl_LineID_0')} ${
                      item.lineID
                    } - ${this.$t(`lbl_${sameFields[key]}_0`)}`,
                    text: this.$t('msg_NoInput_0'),
                  })
                }
              }
            }

            const requiredFields = {
              amount: 'RBAmount',
              paymentDate: 'PBPaymentDate',
              arUser: 'RBArUser',
            }

            for (const key in requiredFields) {
              if (!item[key]) {
                this.listErrorMessage.push({
                  fieldName: `${this.$t('lbl_LineID_0')} ${
                    item.lineID
                  } - ${this.$t(`lbl_${requiredFields[key]}_0`)}`,
                  text: this.$t('msg_NoInput_0'),
                })
              }
            }
          }
        })

        if (this.listErrorMessage.length > 0) {
          return
        }
        await this.addOrUpdateItem(this.receiveBrowseData)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleButtonDeleteOrder() {
      const params = {
        orderNo: this.receiveBrowseData?.RBOrderNumber,
      }
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        if (params.orderNo) {
          const response = await api('deleteReceiveBrowsedDeleteAR', params)
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
            return this.$router.push(
              this.localePath({ path: '/finance/receive-browse' })
            )
          }
          window.alert(`${response?.message}`)
        }
      }
    },
    async addOrUpdateItem(data) {
      try {
        data.receiveBrowsDTL.pop()
        const SubjectId = this.listAccountingItems.find(item => item.text == 'Revenue').value;
        const payload = {
          RBMstId: data.RBMstId,
          RBOrderNumber: data.RBOrderNumber,
          RBCustomerId: data.RBCustomerId,
          RBTotalAmount: parseToNumber(data.RBTotalAmount),
          RBMemo: data.RBMemo,
          RBSubjectId: SubjectId,
          RBOpponentSubjectId: data.RBOpponentSubjectId,
          RBCurrencyId: data.RBCurrencyId,
          RBBalanceAmount: parseToNumber(data.RBBalanceAmount),
          RBActualAmount: parseToNumber(data.RBActualAmount),
          RBOtherExpensesAmount: parseToNumber(data.RBOtherExpensesAmount),
          receiveBrowsDTL: data.receiveBrowsDTL.map((item) => {
            const RBExpenseCategory = this.findValueByText(
              this.listAccountingItems,
              item.expenseCategory
            )

            return {
              RBLineID: item.lineID,
              RBAmount: typeof item.amount === "string" ? parseToNumber(item.amount) : item.amount,
              RBOtherAmount: typeof item.otherAmount === "string" ? parseToNumber(item.otherAmount) : item.otherAmount,
              RBExpenseCategory: Number(RBExpenseCategory),
              RBPaymentDate: item.paymentDate,
              RBArUser: item.arUser,
              RBMemo: item.memo,
              RBItemID: item.itemID ? item.itemID : null,
            }
          }),
        }
        // return console.log('payload', payload);
        const res = await api('editInvoiceRB', payload)
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

        const res = await api('getInvoiceDetailRB', {
          orderNo: this.$route.query?.sono,
          language: this.$i18n.locale,
        })

        const validReceiveResponse =
          res && res.status === SERVER_RESPONSE_CODE.OK

        if (validReceiveResponse) {
          this.receiveBrowseData = res?.data

          this.dataTable =
            res?.data?.receiveBrowsDTL.map((item) => {
              const newObject = {}
              for (const key in item) {
                let newKey = key.replace(/^RB/, '')
                newKey = newKey[0].toLowerCase() + newKey.slice(1)
                newObject[newKey] = item[key]

                let expenseCategoryID = 0
                setTimeout(() => {
                  if (newKey == 'expenseCategory' && this.listAccountingItems) {
                    expenseCategoryID = this.listAccountingItems.find(
                      (item) => item.value == newObject.expenseCategory
                    )
                    newObject.expenseCategory = expenseCategoryID.text
                  }
                }, 100)
              }
              return newObject
            }) || []
          const totalAmount = this.dataTable.reduce(
            (sum, item) => sum + item.amount,
            0
          )

          this.dataTable.push({
            lineID: this.dataTable.length + 1,
            amount: formatNumberWithCommas(
              res?.data?.RBTotalAmount - totalAmount
            ),
            otherAmount: '',
            expenseCategory:'',
            paymentDate: '',
            arUser: '',
            memo: '',
            isUpdate: true,
            isNewLine: true,
          })

          this.receiveBrowseData.RBBalanceAmount = formatNumberWithCommas(
            this.receiveBrowseData.RBBalanceAmount
          )
          this.receiveBrowseData.RBActualAmount = formatNumberWithCommas(
            this.receiveBrowseData.RBActualAmount
          )
          this.receiveBrowseData.RBTotalAmount = formatNumberWithCommas(
            this.receiveBrowseData.RBTotalAmount
          )
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async handleDelete(selectedRows) {
      const itemIDs = selectedRows.map((row) => row.itemID)

      const queryString = itemIDs.map((id) => `RBItemIDs=${id}`).join('&')
      const params = {
        RBMstId: this.receiveBrowseData?.RBMstId,
        ID: queryString,
      }
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))

      if (confirm) {
        if (params.RBMstId) {
          const response = await api(
            'deleteReceiveBrowsedDetailDeleteInvoice',
            params
          )
          const errorCode = response?.data?.response?.status

          if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
            window.alert(this.$t(response?.data?.response?.data?.message))
            return
          }
          if (response.status === SERVER_RESPONSE_CODE.OK) {
            window.alert(this.$t('msg_IsDeleted_0'))
            this.getData()
          }
          window.alert(`${response?.message}`)
        }
      }
    },

    async refresh() {
      await this.getData()
    },

    changeDataTable(data) {
      this.dataTable = data
      this.receiveBrowseData.receiveBrowsDTL = data
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
