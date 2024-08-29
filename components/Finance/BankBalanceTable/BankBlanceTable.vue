<template>
    <div class="table-order d-flex flex-column position-relative">
      <tr class="tr-2">
        <td class="label">
          <span id="departmentID">
            {{ $t('lbl_SearchDate_0') }}
          </span>
        </td>
        <td class="input">
          <datepicker
            v-only-date="{
              isAppendToChild: true,
              childClass: 'input__orderDate',
            }"
            :value="selectedDate"
            typeable
            format="yyyy-MM-dd"
            input-class="input__orderDate"
            :disabled="isDisabled"
            :highlighted="highlighted"
            @input="changeOrderDate"
          ></datepicker>
        </td>
      </tr>
      <BaseTableDraggable
        v-if="!isLoadingTable"
        :header="headerMapping"
        :data="dataTableMapping"
        :data-total="dataTotalMapping"
        class="table-order--body"
        :initial-filters="payloadBankBalanceQuery"
        :update-filters-function="UPDATE_PAYLOAD_BANK_BALANCE_QUERY"
        @search="filterAndSort"
        @row="handleDetailId"
        @changeLayout="changeLayout"
      >
        <slot v-for="(item, index) in dataTable" :slot="'icon-' + index">
          <div
            :key="`icon-attract${index}`"
            class="d-flex align-items-center justify-content-center h-100 w-100"
          >
            <img v-if="item.isAttach" src="@/assets/icon/attach.png" alt="" />
          </div>
        </slot>
        <slot v-for="(item, index) in dataTable" :slot="`isCheck-${index}`">
          <div
            :key="`icon-attract${index}`"
            class="d-flex align-items-center justify-content-center h-100 w-100"
          >
            <b-form-checkbox disabled :checked="item.isCheck" />
          </div>
        </slot>
      </BaseTableDraggable>
      <BasePagination
        v-if="!isLoadingTable"
        :total="total"
        :per-page="payloadBankBalanceQuery.pageSize"
        :current-page="payloadBankBalanceQuery.pageNo"
        :number-item="dataTable.length"
        class="table-order--footer"
        @changePage="(value) => setCurrentPage(value)"
        @changePerPage="(value) => changePerPage(value)"
      ></BasePagination>
      <BaseTableLoader v-if="loading || isLoadingTable" />
    </div>
  </template>
  <script>
  import { mapActions, mapGetters, mapMutations } from 'vuex'
  import { SERVER_RESPONSE_CODE } from '@/constants'
  import { BankBalance } from '@/schemas/finance/BankBalance'
  import api from '@/api/api'
  import BasePagination from '~/components/UI/BasePagination.vue'
  import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
  import dateTime from '~/mixins/dateTime'
  import BaseTableLoader from '~/components/loaders/BaseTableLoader'
  import { formatNumberWithCommas } from '@/utils/utils'
  export default {
    components: { BaseTableDraggable, BasePagination, BaseTableLoader },
    mixins: [dateTime],
  
    data() {
      return {
        highlighted: {
          dates: [new Date()],
        },
        loading: false,
        isLoadingTable: false,
        dataTable: [],
        dataHeader: [],
        total: 0,
        lang: this.$i18n.locale,
        listIgnoreFieldName: ['Blance'],
        selectedDate: this.convertDate(new Date()),
        isDisabled: false,
      }
    },
  
    async fetch() {
      try {
        this.loading = true
        this.UPDATE_PAYLOAD_BANK_BALANCE_QUERY({
          language: this.lang,
        })
        await Promise.all([
          this.getData(),
          this.getCurrencyOptions(this.lang),
        ])
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
  
    computed: {
      ...mapGetters({
        payloadBankBalanceQuery: 'filterSort/getPayloadBankBalanceQuery',
        currencyOptions: 'base/getCurrencyOptions',
      }),

      ...mapGetters('base', ['getActiveButtonToolBar']),

      itemCurrencyOptions() {
        return this.currencyOptions.map((item) => ({
          text: item.text,
          value: item.value,
        }))
      },
      
      listDataShow() {
        return this.dataHeader
          .filter((_el) => !this.listIgnoreFieldName.includes(_el.fieldName))
          .filter((item) => !item.hidden)
          .sort((a, b) => a.fieldOrder - b.fieldOrder)
      },

      totalBBImportAmount() {
        let sum = 0
        this.dataTable.forEach((item) => {
          if (item.BBImportAmount) {
            sum += parseFloat(item.BBImportAmount)
          }
        })
        return sum
      },

      totalBBExportAmount() {
        let sum = 0
        this.dataTable.forEach((item) => {
          if (item.BBExportAmount) {
            sum += parseFloat(item.BBExportAmount)
          }
        })
        return sum
      },

      totalBBBalance() {
        let sum = 0
        this.dataTable.forEach((item) => {
          if (item.BBBalance) {
            sum += parseFloat(item.BBBalance)
          }
        })
        return sum
      },
      
      totalBBRevenue() {
        let sum = 0
        this.dataTable.forEach((item) => {
          if (item.BBRevenue) {
            sum += parseFloat(item.BBRevenue)
          }
        })
        return sum
      },

      dataTotalMapping() {
        return this.headerMapping.map((item) => {
          const temp = {
            key: item.key,
            value: '',
            type: 'text'
          }
          switch (item.key) {
            case 'BBCreditId':
              temp.value = 'Total: '
              break
            case 'BBImportAmount':
              temp.value = this.totalBBImportAmount
              temp.align = 'right'
              temp.type = 'amount'
              break
            case 'BBExportAmount':
              temp.value = this.totalBBExportAmount
              temp.align = 'right'
              temp.type = 'amount'
              break
            case 'BBBalance':
              temp.value = this.totalBBBalance
              temp.align = 'right'
              temp.type = 'amount'
              break
            case 'BBRevenue':
              temp.value = this.totalBBRevenue
              temp.type = 'right'
              temp.type = 'amount'
              break
            default:
              break
          }
          return temp
        })
      },
      dataTableMapping() {
        const listAlignRightFields = [
          'BBImportAmount',
          'BBExportAmount',
          'BBBalance',
          'BBRevenue',
        ]
  
        const data = this.dataTable?.map((item, index) => {
          const obj = {
            index: {
              value:
                this.payloadBankBalanceQuery.pageSize *
                  (this.payloadBankBalanceQuery.pageNo - 1) +
                index +
                1,
              align: 'center',
            },
            keyRow: item.sono,
          }
  
          this.listDataShow?.forEach((headerItem) => {
            const mappingFieldName = this.mappingProperty(
              item,
              headerItem.fieldName
            )
            obj[mappingFieldName] = {
              value: item[mappingFieldName] || '',
            }
  
            if (listAlignRightFields.includes(headerItem.fieldName)) {
              obj[mappingFieldName].align = 'right'
            }
  
            switch (headerItem.fieldName) {
              case 'BBImportAmount':
              case 'BBExportAmount':
              case 'BBBalance':
              case 'BBRevenue':
                obj[mappingFieldName].value =
                  obj[mappingFieldName].value === 0
                    ? 0
                    : formatNumberWithCommas(obj[mappingFieldName].value)
                break
              case 'BBCurrencyID':
                const valueCurrency = this.currencyOptions.find(item => Number(item.value - 1) == obj[mappingFieldName].value)
                obj[mappingFieldName].value = valueCurrency.text
                break
            }
          })
  
          return obj
        })
  
        return data
      },
      headerMapping() {
        const listNumberField = []
        const header = [
          {
            key: 'index',
            name: '',
            width: 40,
          }
        ]
        const getHeaderItem = (item) => {
          const maxLength = listNumberField.includes(item.fieldName)
            ? '30'
            : '256'
          const headerItem = {
            key: this.mappingProperty(
              this.dataTable[0] || BankBalance,
              item.fieldName
            ),
            name: this.$t(`lbl_${item.fieldName}_0`),
            filter: item.fieldName === 'BBCurrencyID' ? 'select' : 'input',
            width: item.fieldWide * 1,
            fieldName: item.fieldName,
            fieldOrder: item.fieldOrder,
            maxLength,
          }

          if (item.fieldName === 'BBCurrencyID') {
            headerItem.options = this.itemCurrencyOptions
          }
  
          return headerItem
        }

        this.listDataShow.forEach((item) => {
          header.push(getHeaderItem(item))
        })
  
        return header
      },
    },
    created() {
      const payload = {
        language: this.lang,
        pageNo: 1,
        pageSize: 30,
      }
  
      this.$router.replace({ query: null })
      this.SET_PAYLOAD_BANK_BALANCE_QUERY(payload)
    },
    methods: {
      ...mapActions('base', [
        'getCurrencyOptions'
      ]),

      ...mapMutations({
        UPDATE_PAYLOAD_BANK_BALANCE_QUERY:
          'filterSort/UPDATE_PAYLOAD_BANK_BALANCE_QUERY',
        SET_PAYLOAD_BANK_BALANCE_QUERY:
          'filterSort/SET_PAYLOAD_BANK_BALANCE_QUERY',
        SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
      }),
      changePerPage(value) {
        const filterPayload = {
          pageSize: Number(value),
          pageNo: 1,
        }
        this.UPDATE_PAYLOAD_BANK_BALANCE_QUERY(filterPayload)
        this.getData()
      },
      setCurrentPage(value) {
        this.UPDATE_PAYLOAD_BANK_BALANCE_QUERY({
          pageNo: Number(value),
        })
        this.getData()
      },
      changeOrderDate(value) {
        this.selectedDate = this.convertDate(value)
      },
      async getData() {
        try {
          this.isLoadingTable = true
          this.UPDATE_PAYLOAD_BANK_BALANCE_QUERY({
            ...this.payloadBankBalanceQuery,
            BBTransDate: this.selectedDate,
          })
  
          const res = await api('queryBankBalanceTable', this.payloadBankBalanceQuery)
  
          const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
          if (validResponse) {
            this.dataHeader = res.data?.scolumnHides
            this.dataTable = res.data.tableContent?.content
            this.total = res.data.tableContent?.totalElements
            this.SET_DATA_COLUMN_HIDE(
              this.dataHeader.filter(
                (_el) => !this.listIgnoreFieldName.includes(_el.fieldName)
              )
            )
          }
        } catch (err) {
          console.error(err)
        } finally {
          this.isLoadingTable = false
        }
      },
      async filterAndSort() {
        try {
          this.loading = true
          this.UPDATE_PAYLOAD_BANK_BALANCE_QUERY({
            ...this.payloadBankBalanceQuery,
            BBTransDate: this.selectedDate,
          })
          const res = await api('queryBankBalanceTable', this.payloadBankBalanceQuery)
          this.loading = false
  
          const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
          if (validResponse) {
            this.dataTable = res.data.tableContent?.content
            this.total = res.data.tableContent?.totalElements
          }
        } catch (err) {
          window.alert(err?.data?.response?.data?.message)
        } finally {
          this.loading = false
        }
      },
  
      refresh() {
        this.getData()
      },
      handleDetailId(data) {
        this.$emit('handleDetailId', data.keyRow)
      },
      changeLayout(data) {
        this.$emit('changeLayout', data, this.listDataShow)
      },
      mappingProperty(item, fieldName) {
        for (const property in item) {
          if (property.toLowerCase() === fieldName.toLowerCase()) {
            return property
          }
        }
        return ''
      },
     
    },
  }
  </script>
  <style lang="scss" scoped>
  .table-order {
    height: calc(100% - 70px);
  
    .table-order--body {
      height: calc(100% - 26px);
    }
  
    .table-order--footer {
      color: #000000;
      background: #eff3ff 50% 50% repeat-x;
      border: 1px solid #5180d8;
      border-top: 0;
    }
  }
  
  .total-item {
    border-right: 1px solid #5180d8;
    font-size: 12px;
    font-weight: bold;
    padding: 0 2px;
  }
  
  .total-item:last-child {
    border-right: none !important;
  }
  </style>
  