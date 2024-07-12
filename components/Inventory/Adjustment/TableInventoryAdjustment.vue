<template>
  <div class="table-adjustment d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-adjustment--body"
      :initial-filters="payloadInventoryAdjustment"
      :update-filters-function="UPDATE_PAYLOAD_INVENTORY_ADJUSTMENT"
      @search="filterAndSort"
      @row="handleToOpenDetail"
      @changeLayout="changeLayout"
    >
      <slot v-for="(item, index) in dataTable" :slot="`isBad-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.isBad" />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadInventoryAdjustment.pageSize"
      :current-page="payloadInventoryAdjustment.pageNo"
      :number-item="dataTable.length"
      class="table-adjustment--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="changePerPage"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { inventoryAdjustmentSchema } from '@/schemas/inventory/inventory-adjustment'
import BasePagination from '@/components/UI/BasePagination.vue'
import dateTime from '@/mixins/dateTime'
import api from '~/api/api'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTime],
  props: {
    labelMapping: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      isLoadingTable: false,
      itemTypeOptions: [],
      dataTable: [],
      dataHeader: [],
      total: 0,
      loading: false,
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_INVENTORY_ADJUSTMENT({
        language: this.lang,
      })
      await this.getData()
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      payloadInventoryAdjustment: 'filterSort/getPayloadInventoryAdjustment',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    typeQuery() {
      return this.$route?.query?.type
    },
    isBadOptions() {
      return [
        {
          text: '',
          value: '',
        },
        {
          text: 'Yes',
          value: 1,
        },
        {
          text: 'No',
          value: 0,
        },
      ]
    },

    dataTableMapping() {
      const alignRightFields = [
        'LineID',
        'Quantity',
        'Price',
        'TaxRate',
        'EndQuantity',
        'Amount',
      ]
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadInventoryAdjustment.pageSize *
                (this.payloadInventoryAdjustment.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          keyRow: item.orderNO,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          const alignRight = ['Quantity', 'Price', 'Amount']
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }
          if (alignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
          }
          const listConvertDate = [
            'OrderDate',
            'CheckDate',
            'EditDate',
            'TransDate',
          ]
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          if (headerItem.fieldName === 'IsBad') {
            obj[mappingFieldName].type = 'slot'
          }
          if (alignRight.includes(headerItem.fieldName)) {
            obj[mappingFieldName] = {
              value: Math.abs(item[mappingFieldName]) || 0,
              align: 'right',
            }
          }
          if (headerItem.fieldName === 'OrderNo') {
            obj[mappingFieldName].type =
              this.typeQuery && this.getActiveButtonToolBar?.isEdit
                ? 'link'
                : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/inventory/adjustment/detail?type=${this.typeQuery}&orderNO=${item.orderNO}`
          }
        })
        return obj
      })
      return data
    },
    listDataShow() {
      const redundantFields = ['OrderDate']

      return this.dataHeader
        .filter(
          (item) => !item.hidden && !redundantFields.includes(item.fieldName)
        )
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    headerMapping() {
      const listNumberField = [
        'LineID',
        'Quantity',
        'Price',
        'TaxRate',
        'EndQuantity',
        'Amount',
      ]
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
            this.dataTable[0] || inventoryAdjustmentSchema,
            item.fieldName
          ),
          name: this.labelMapping[item.fieldName],
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }

        if (item.fieldName === 'IsBad') {
          headerItem.filter = 'select'
          headerItem.options = this.isBadOptions
        }

        header.push(headerItem)
      })

      return header
    },
  },
  watch: {
    typeQuery() {
      this.getData()
    },
  },
  created() {
    this.SET_PAYLOAD_INVENTORY_ADJUSTMENT({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_INVENTORY_ADJUSTMENT:
        'filterSort/UPDATE_PAYLOAD_INVENTORY_ADJUSTMENT',
      SET_PAYLOAD_INVENTORY_ADJUSTMENT:
        'filterSort/SET_PAYLOAD_INVENTORY_ADJUSTMENT',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),

    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_INVENTORY_ADJUSTMENT(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_INVENTORY_ADJUSTMENT({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('getInventoryAdjustment', {
          type: this.typeQuery ?? '',
          form: this.payloadInventoryAdjustment,
        })
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader = res.data?.scolumnHides
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
          this.SET_DATA_COLUMN_HIDE(res?.data?.scolumnHides)
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
        const res = await api('getInventoryAdjustment', {
          type: this.typeQuery,
          form: this.payloadInventoryAdjustment,
        })
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
    handleToOpenDetail(data) {
      this.$emit('detail', data.keyRow)
    },
    async refresh() {
      await this.getData()
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

<style scoped lang="scss">
.table-adjustment {
  height: calc(100% - 70px);
  .table-adjustment--body {
    height: calc(100% - 26px);
  }
  .table-adjustment--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
</style>
