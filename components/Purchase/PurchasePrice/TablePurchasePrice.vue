<template>
  <div class="table-purchase-price d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-purchase-price--body"
      :initial-filters="payloadPurchasePrice"
      :update-filters-function="UPDATE_PAYLOAD_PURCHASE_PRICE"
      @search="filterAndSort"
      @row="handleRowSelected"
      @changeLayout="changeLayout"
    >
      <slot v-for="(item, index) in dataTable" :slot="`isEnable-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.isEnable" />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadPurchasePrice.pageSize"
      :current-page="payloadPurchasePrice.pageNo"
      :number-item="dataTable.length"
      class="table-purchase-price--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { purchasePriceSchema } from '@/schemas/purchase/purchase-price'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import dateTime from '~/mixins/dateTime'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  components: { BasePagination, BaseTableDraggable, BaseTableLoader },
  mixins: [dateTime],
  data() {
    return {
      isLoadingTable: false,
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters({
      payloadPurchasePrice: 'filterSort/getPayloadPurchasePrice',
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
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTableMapping() {
      const alignCenterFields = ['EffectiveDate', 'IsEnable', 'EditDate']
      const alignRightFields = ['MinQuantity', 'MaxQuantity', 'Price']
      const convertDateFields = ['EffectiveDate', 'EditDate']
      const linkFields = ['SupplierName', 'ItemCode', 'ItemName']

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadPurchasePrice.pageSize *
                (this.payloadPurchasePrice.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          supplierId: {
            value: item.supplierID,
          },
          effectiveDate: {
            value: this.convertDate(item.effectiveDate),
          },
          itemId: {
            value: item.itemID,
          },
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = { value: item[mappingFieldName] || '' }
          if (headerItem.fieldName === 'IsEnable') {
            obj[mappingFieldName].type = 'slot'
          }

          if (alignCenterFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'center'
          }

          if (alignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }

          if (convertDateFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
          }

          if (linkFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''

            const query = new URLSearchParams()
            query.set('lang', this.lang)
            query.set('supplierId', item.supplierID)
            query.set('effectiveDate', this.convertDate(item.effectiveDate))
            query.set('itemId', item.itemID)

            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/purchase/po-price/detail?${query}`
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const listNumberField = ['MinQuantity', 'MaxQuantity', 'Price']
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
            this.dataTable[0] || purchasePriceSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }

        if (item.fieldName === 'IsEnable') {
          headerItem.filter = 'select'
          headerItem.options = this.checkAccountOptions
        }

        header.push(headerItem)
      })
      return header
    },
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_PURCHASE_PRICE({
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
    this.SET_PAYLOAD_PURCHASE_PRICE({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_PRICE: 'filterSort/UPDATE_PAYLOAD_PURCHASE_PRICE',
      SET_PAYLOAD_PURCHASE_PRICE: 'filterSort/SET_PAYLOAD_PURCHASE_PRICE',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    calculateTotal(key) {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item[key]) {
          sum += this.numberRemoveComas(item[key])
        }
      })
      return sum
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_PURCHASE_PRICE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_PURCHASE_PRICE({
        pageNo: Number(value),
      })
      this.getData()
    },
    handleRowSelected(payload) {
      this.$emit('handleRowSelected', payload)
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    async filterAndSort() {
      try {
        this.loading = true
        const res = await api('getListPurchasePrice', this.payloadPurchasePrice)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent.content
          this.total = res.data.tableContent.totalElements
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('getListPurchasePrice', this.payloadPurchasePrice)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res.data.scolumnHides
          this.dataTable = res.data.tableContent.content
          this.total = res.data.tableContent.totalElements
          this.SET_DATA_COLUMN_HIDE(res?.data?.scolumnHides)
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },
    async refresh() {
      await this.getData()
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
::v-deep .custom-checkbox {
  input {
    opacity: 0 !important;
  }
}
.table-purchase-price {
  height: calc(100% - 73px);
  .table-purchase-price--body {
    height: calc(100% - 26px);
  }
  .table-purchase-price--footer {
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
