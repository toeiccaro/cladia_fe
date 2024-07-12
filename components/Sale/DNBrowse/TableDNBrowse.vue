<template>
  <div class="table-order d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-order--body"
      :initial-filters="payloadSaleDNBrowse"
      :update-filters-function="UPDATE_PAYLOAD_SALE_DN_BROWSE"
      @search="filterAndSort"
      @row="handleDetailId"
      @changeLayout="changeLayout"
    >
      <slot
        v-for="(item, index) in dataTable"
        :slot="`isCheckAccount-${index}`"
      >
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.isCheckAccount" />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadSaleDNBrowse.pageSize"
      :current-page="payloadSaleDNBrowse.pageNo"
      :number-item="dataTable.length"
      class="table-order--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { dnBrowseSchema } from '@/schemas/sales/dn-browse'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import dateTimeMixins from '~/mixins/dateTime'
import commonOptionsMixins from '~/mixins/commonOptions'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  name: 'TableDNBrowse',
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTimeMixins, commonOptionsMixins],
  data() {
    return {
      loading: false,
      isLoadingTable: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters({
      payloadSaleDNBrowse: 'filterSort/getPayloadSaleDNBrowse',
    }),
    listDataShow() {
      return this.dataHeader
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
    totalRtAmount() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.totalRtAmount) {
          sum += parseFloat(item.totalRtAmount)
        }
      })
      return sum
    },
    totalTotalAmount() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.totalAmount) {
          sum += parseFloat(item.totalAmount)
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
        if (item.key === 'itemName') {
          temp.value = 'Total: '
        }
        if (item.key === 'quantity') {
          temp.value = this.totalQuantity
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'totalAmount') {
          temp.value = this.totalTotalAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'amount') {
          temp.value = this.totalAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'totalRtAmount') {
          temp.value = this.totalRtAmount
          temp.align = 'right'
          temp.type = 'amount'
        }
        if (item.key === 'isCheckAccount') {
          temp.type = 'checkbox'
        }
        return temp
      })
    },
    dataTableMapping() {
      const alignRightFields = [
        'Quantity',
        'Amount',
        'Price',
        'TotalAmount',
        'TotalRtAmount',
      ]
      const data = this.dataTable?.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadSaleDNBrowse.pageSize *
                (this.payloadSaleDNBrowse.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          keyRow: item.sono,
        }
        this.listDataShow?.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }

          if (alignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          if (headerItem.fieldName === 'IsCheckAccount') {
            obj[mappingFieldName].type = 'slot'
          }

          if (headerItem.fieldName === 'WarehouseID') {
            obj[mappingFieldName].value = item.warehouse
          }
          if (headerItem.fieldName === 'TotalRtAmount') {
            if (!obj[mappingFieldName].value) {
              obj[mappingFieldName].value = 0
            }
          }
          const listConvertDate = [
            'InvoiceDate',
            'PayDate',
            'DeliveryDate',
            'CheckDate',
            'EditDate',
          ]
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const listNumberField = [
        'Quantity',
        'Amount',
        'Price',
        'TotalAmount',
        'TotalRtAmount',
      ]
      const selectBoxFields = ['IsCheckAccount']
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
      ]
      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || dnBrowseSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: selectBoxFields.includes(item.fieldName) ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }
        if (item.fieldName === 'IsCheckAccount') {
          headerItem.options = this.yesNoOptions
        }

        header.push(headerItem)
      })

      return header
    },
  },

  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_SALE_DN_BROWSE({
        language: this.lang,
      })
      await this.getData()
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  created() {
    this.SET_PAYLOAD_SALE_DN_BROWSE({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_SALE_DN_BROWSE: 'filterSort/UPDATE_PAYLOAD_SALE_DN_BROWSE',
      SET_PAYLOAD_SALE_DN_BROWSE: 'filterSort/SET_PAYLOAD_SALE_DN_BROWSE',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_SALE_DN_BROWSE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_SALE_DN_BROWSE({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('searchDNBrowse', this.payloadSaleDNBrowse)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader =
            res.data.tableContent?.content.length >= 0
              ? res.data?.scolumnHides
              : []
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
          this.SET_DATA_COLUMN_HIDE(this.dataHeader)
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

        const res = await api('searchDNBrowse', this.payloadSaleDNBrowse)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
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
