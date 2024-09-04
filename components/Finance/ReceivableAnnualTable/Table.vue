<template>
  <div class="table__receive-browse d-flex flex-column position-relative">
    <tr class="tr-2 form-year">
      <td class="label">
        <span id="year">
          {{ $t('lbl_StYear_0') }}
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
      class="table__receive-browse--body"
      :initial-filters="payloadReceivableQuery"
      :update-filters-function="UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY"
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
      :per-page="payloadReceivableQuery.pageSize"
      :current-page="payloadReceivableQuery.pageNo"
      :number-item="dataTable.length"
      class="table__receive-browse--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>
    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { receivableAnnualTableSchema } from '@/schemas/finance/receivable-annual-table'
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
      dataFooter: {},
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY({
        language: this.lang,
      })
      await Promise.all([this.getData()])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters({
      payloadReceivableQuery: 'filterSort/getPayloadReceivableQuery',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),
    listDataShow() {
      return this.dataHeader
        .filter((_el) => !this.listIgnoreFieldName.includes(_el.fieldName))
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTotalMapping() {
      const listTotalFields = [
        'ARJan',
        'ARFeb',
        'ARMar',
        'ARApr',
        'ARMay',
        'ARJune',
        'ARJuly',
        'ARAug',
        'ARSep',
        'AROct',
        'ARNov',
        'ARDec',
        'ARTotalAmount',
      ]
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
          type: 'text',
        }
        if (item.key === 'AREndingBalance') {
          temp.value = 'Total: '
          temp.align = 'center'
        }
        if (listTotalFields.includes(item.key)) {
          temp.align = 'right'
          temp.type = 'amount'
          temp.value = this.dataFooter[item.key]
        }
        return temp
      })
    },
    dataTableMapping() {
      const listAlignRightFields = [
        'AREndingBalance',
        'ARJan',
        'ARFeb',
        'ARMar',
        'ARApr',
        'ARMay',
        'ARJune',
        'ARJuly',
        'ARAug',
        'ARSep',
        'AROct',
        'ARNov',
        'ARDec',
        'ARTotalAmount',
      ]

      const listAlignRightFieldsAREndingBalance = ['AREndingBalance']

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
          keyRow: item.ARCompanyName,
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
            obj[mappingFieldName].value =
              obj[mappingFieldName].value === 0
                ? 0
                : formatNumberWithCommas(obj[mappingFieldName].value)
            obj[mappingFieldName].color =
              index % 3 === 1 ? 'blue' : index % 3 === 2 ? 'red' : ''
          }

          if (
            listAlignRightFieldsAREndingBalance.includes(headerItem.fieldName)
          ) {
            const color =
              index % 3 === 1 ? 'blue' : index % 3 === 2 ? 'red' : ''

            obj[mappingFieldName] = {
              value:
                item[mappingFieldName] !== 0 || color === ''
                  ? formatNumberWithCommas(item[mappingFieldName])
                  : '',
              align: 'right',
              color: color,
            }
          }

          switch (headerItem.fieldName) {
            case 'ARCompanyName':
              obj[mappingFieldName].align = 'left'
              break
            case 'ARSubject':
            case 'ARCurrency':
              obj[mappingFieldName].align = 'center'
              break
            case 'ARType':
            case 'ARYear':
              obj[mappingFieldName].align = 'center'
              obj[mappingFieldName].color =
                index % 3 === 1 ? 'blue' : index % 3 === 2 ? 'red' : ''
              break
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
      ]
      const getHeaderItem = (item) => {
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || receivableAnnualTableSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: 'input',
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
    this.generateYearOptions()
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
      UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY:
        'filterSort/UPDATE_PAYLOAD_RECEIVABLE_ANNUAL_QUERY',
      SET_PAYLOAD_RECEIVABLE_ANNUAL_QUERY:
        'filterSort/SET_PAYLOAD_RECEIVABLE_ANNUAL_QUERY',
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
          year: this.selectedYear,
        })
        const res = await api(
          'querySearchReceiveTable',
          this.payloadReceivableQuery
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res.data?.scolumnHides
          this.dataTable = res.data.tableContent?.content
          this.dataFooter = res.data?.tableFooter || {}
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
          year: this.selectedYear,
        })

        const res = await api(
          'querySearchReceiveTable',
          this.payloadReceivableQuery
        )
        this.loading = false

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
          this.dataFooter = res.data?.tableFooter || {}
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
          year: this.selectedYear,
        }
        this.SET_PAYLOAD_RECEIVABLE_ANNUAL_QUERY(payload)
        const res = await api(
          'querySearchReceiveTable',
          this.payloadReceivableQuery
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res.data?.scolumnHides
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
          this.dataFooter = res.data?.tableFooter || {}
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

    generateYearOptions() {
      const currentYear = new Date().getFullYear()
      const startYear = currentYear - 5
      const endYear = currentYear + 5

      this.yearOptions = []
      for (let year = startYear; year <= endYear; year++) {
        this.yearOptions.push({ value: year, text: year.toString() })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.table__receive-browse {
  height: calc(100% - 72px);
  .table__receive-browse--body {
    height: calc(100% - 70px);
  }
  .table__receive-browse--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
  .border--full {
    border-top: 1px solid #5180d8 !important;
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
    margin-right: 10px;
  }
}
</style>
