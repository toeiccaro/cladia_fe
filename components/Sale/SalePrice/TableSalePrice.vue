<template>
  <div class="table-return d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-return--body"
      :initial-filters="payloadSalePrice"
      :update-filters-function="UPDATE_PAYLOAD_SALE_PRICE"
      @search="filterAndSort"
      @row="handleRow"
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
      :per-page="payloadSalePrice.pageSize"
      :current-page="payloadSalePrice.pageNo"
      :number-item="dataTable.length"
      class="table-return--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { dateFormatYYYY } from '@/utils/utils'
import { salePriceSchema } from '@/schemas/sales/sale-price'
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
      payloadSalePrice: 'filterSort/getPayloadSalePrice',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    isEnableOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },
    totalAmount() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.amount) {
          sum += this.numberRemoveComas(item.amount)
        }
      })
      return sum
    },
    totalQuantity() {
      let sum = 0
      this.dataTable.forEach((item) => {
        if (item.quantity) {
          sum += this.numberRemoveComas(item.quantity)
        }
      })
      return sum
    },
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTableMapping() {
      const alignRightFields = ['MinQuantity', 'MaxQuantity', 'Price']
      const convertDateFields = ['EffectiveDate', 'EditDate']
      const linkToPageFields = ['CompanyName', 'ItemCode', 'ItemName']
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadSalePrice.pageSize *
                (this.payloadSalePrice.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          keyRow: item.subID,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )

          obj[mappingFieldName] = { value: item[mappingFieldName] || '' }
          if (alignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          if (headerItem.fieldName === 'IsEnable') {
            obj[mappingFieldName].type = 'slot'
          }
          if (headerItem.fieldName === 'Apparel Code') {
            obj[mappingFieldName].value = item.apparelCode
          }

          if (convertDateFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }

          if (linkToPageFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[mappingFieldName].link = `/${
              this.$i18n.locale
            }/sales/sales-price/detail?customerID=${item.customerID}&itemID=${
              item.itemID
            }&effectiveDate=${dateFormatYYYY(new Date(item.effectiveDate))}`
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

      const selectBoxFields = ['IsEnable']

      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const headerItem = {
          key: this.mappingProperty(salePriceSchema, item.fieldName),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: selectBoxFields.includes(item.fieldName) ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }
        if (selectBoxFields.includes(item.fieldName)) {
          headerItem.options = this.isEnableOptions
        }

        if (item.fieldName === 'Editdate') {
          headerItem.name = this.$t(`lbl_EditDate_0`)
        }
        if (item.fieldName === 'Apparel Code') {
          headerItem.name = this.$t(`lbl_ApprarelCode_0`)
        }
        if (item.fieldName === 'CustomerPartsName') {
          headerItem.name = this.$t(`lbl_CusPartsName_0`)
        }

        header.push(headerItem)
      })

      return header
    },
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_SALE_PRICE({
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
    this.SET_PAYLOAD_SALE_PRICE({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_SALE_PRICE: 'filterSort/UPDATE_PAYLOAD_SALE_PRICE',
      SET_PAYLOAD_SALE_PRICE: 'filterSort/SET_PAYLOAD_SALE_PRICE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_SALE_PRICE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_SALE_PRICE({
        pageNo: Number(value),
      })
      this.getData()
    },
    handleRow(payload) {
      this.$emit('handleDetailId', payload)
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
    async filterAndSort() {
      try {
        this.loading = true
        const res = await api('getSalePrices', this.payloadSalePrice)

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
        const res = await api('getSalePrices', this.payloadSalePrice)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          const dataHeader = res.data.scolumnHides
          const mapFieldNames = {
            Editdate: 'EditDate',
          }

          for (const prop in mapFieldNames) {
            const headerNeedToBeChangeName = dataHeader.find(
              (item) => item.fieldName === prop
            )

            if (!headerNeedToBeChangeName) {
              continue
            }

            headerNeedToBeChangeName.fieldName = mapFieldNames[prop]
          }

          this.dataHeader = dataHeader
          this.dataTable = res.data.tableContent.content
          this.total = res.data.tableContent.totalElements
          this.$store.commit('SET_DATA_COLUMN_HIDE', dataHeader)
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
.table-return {
  // border: 1px solid #5180d8;
  height: calc(100% - 75px);
  .table-return--body {
    height: calc(100% - 26px);
  }
  .table-return--footer {
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
