<template>
  <div class="table-order d-flex flex-column position-relative">
    <tr class="tr-2 form-year">
      <td class="label">
        <span id="year">
          {{ $t('lbl_APYear_0') }}
        </span>
      </td>
      <td class="input">
        <b-form-select
      v-model="selectedYear"
      :options="yearOptions"
      class="select"
      :disabled="isDisabled"
    ></b-form-select>
      </td>
    </tr>
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-order--body"
      :initial-filters="payloadReceivableQuery"
      :update-filters-function="UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY"
      @search="filterAndSort"
      @row="handleDetailId"
      @changeLayout="changeLayout"
      is-line-set-color

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
      :per-page="payloadReceivableQuery.pageSize"
      :current-page="payloadReceivableQuery.pageNo"
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
import { saleOrderSchema } from '@/schemas/sales/sale-order'
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
      loading: false,
      isLoadingTable: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      lang: this.$i18n.locale,
      listIgnoreFieldName: ['Blance'],
      selectedYear: null,
      yearOptions: [],
      isDisabled: false,
      selectedYear: null, 
      yearOptions: [], 
      isDisabled: false, 
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY({
        language: this.lang,
      })
      await Promise.all([this.getData(), this.getUnitOptions(this.lang)])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters({
      unitOptions: 'base/getUnitOptions',
      payloadReceivableQuery: 'filterSort/getPayloadReceivableQuery',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),
    checkAccountOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },
    listDataShow() {
      return this.dataHeader
        .filter((_el) => !this.listIgnoreFieldName.includes(_el.fieldName))
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    totalAmount() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.amount) {
          sum += parseFloat(item.amount)
        }
      })
      return sum
    },
    totalQuantity() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.quantity) {
          sum += parseFloat(item.quantity)
        }
      })
      return sum
    },
    dataTotalMapping() {
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
          type: 'text',
        }
        if (item.key === 'AREndingBalance') {
          console.log(item.key)
          temp.value = 'Total: '
          temp.align = 'center'
        }
        return temp
      })
    },
    dataTableMapping() {
      const listAlignRightFields = [
        'Quantity',
        'Amount',
        'Price',
        'StopQty',
        'TaxRate',
        'SODiscountRate',
        'SOAmountIncludeTax',
        'SOPriceIncludeTax',
        'SOPriceIncludeDiscount',
      ]

      const data = this.dataTable?.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadReceivableQuery.pageSize *
                (this.payloadReceivableQuery.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
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
        })

        return obj
      })

      return data
    },
    headerMapping() {
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
        {
          key: 'icon',
          name: '',
          width: 40,
        },
      ]
      const getHeaderItem = (item) => {
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || saleOrderSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: item.fieldName === 'IsCheck' ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
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
    this.generateYearOptions();
    const isCheck = this.$route.query?.isCheck

    const payload = {
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    }

    if (isCheck) {
      payload.isCheck = 0
    }
    this.$router.replace({ query: null })
    this.SET_PAYLOAD_RECEIVABLE_ANNUAL_QUERY(payload)
  },
  methods: {
    ...mapActions('base', ['getUnitOptions']),
    ...mapMutations({
      UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY: 'filterSort/UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY',
      SET_PAYLOAD_RECEIVABLE_ANNUAL_QUERY: 'filterSort/SET_PAYLOAD_RECEIVABLE_ANNUAL_QUERY',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true

        this.UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY({
          ...this.payloadReceivableQuery,
          year: this.selectedYear
        })
        const res = await api('querySearchReceiveTable', this.payloadReceivableQuery)

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

        this.UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY({
          ...this.payloadReceivableQuery,
          year: this.selectedYear
        })

        const res = await api('querySearchReceiveTable', this.payloadReceivableQuery)
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
    async query() {
      try {
        this.isLoadingTable = true
        const payload = {
          pageNo: this.payloadReceivableQuery.pageNo,
          pageSize: this.payloadReceivableQuery.pageSize,
          language: this.payloadReceivableQuery.language,
          year: this.selectedYear
        }
        this.SET_PAYLOAD_RECEIVABLE_ANNUAL_QUERY(payload)
        const res = await api('querySearchReceiveTable', this.payloadReceivableQuery)

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

    mapUnit(unitId) {
      return (
        this.unitOptions.find((item) => unitId && item.value === unitId)
          ?.text || ''
      )
    },

    generateYearOptions() {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 5; 
      const endYear = currentYear + 5; 

      this.yearOptions = [];
      for (let year = startYear; year <= endYear; year++) {
        this.yearOptions.push({ value: year, text: year.toString() });
      }
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
.form-year {
  margin-bottom: 15px;
  span {
    margin-right: 10px
  }
}
</style>
