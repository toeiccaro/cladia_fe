<template>
  <div class="table-browse d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      :data-total="dataTotalMapping"
      class="table-browse--body"
      :initial-filters="payloadPurchaseRNBrowse"
      :update-filters-function="UPDATE_PAYLOAD_PURCHASE_RN_BROWSE"
      @search="filterAndSort"
      @changeLayout="changeLayout"
    >
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
      :per-page="payloadPurchaseRNBrowse.pageSize"
      :current-page="payloadPurchaseRNBrowse.pageNo"
      :number-item="dataTable.length"
      class="table-browse--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { purchaseRNBrowseSchema } from '@/schemas/purchase/purchase-rn-browse'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import dateTimeMixins from '~/mixins/dateTime'
import commonOptionsMixins from '~/mixins/commonOptions'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  name: 'TableRNBrowse',
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
      dataFooter: {},
      itemTypeOptions: [],
    }
  },

  fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_PURCHASE_RN_BROWSE({
        language: this.lang,
      })
      Promise.all([
        this.getInspectionTypesFromAPI(this.lang),
        this.getItemTypeFormAPI(),
        this.getData(),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters({
      payloadPurchaseRNBrowse: 'filterSort/getPayloadPurchaseRNBrowse',
      inspectionTypes: 'base/getInspectionTypes',
    }),
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTotalMapping() {
      const fieldsHasTotal = [
        'receiptLabelQty',
        'remainReceiptLabelQty',
        'quantity',
        'badQty',
      ]
      return this.headerMapping.map((item) => {
        const temp = {
          key: item.key,
          value: '',
          type: 'text',
        }
        if (item.key === 'receiptNo') {
          temp.value = 'Total: '
        }
        if (fieldsHasTotal.includes(item.key)) {
          temp.value = this.dataFooter[item.key]
          temp.align = 'right'
          temp.type = 'amount'
        }
        return temp
      })
    },
    dataTableMapping() {
      const alignRightFields = [
        'ReceiptLabelQty',
        'RemainReceiptLabelQty',
        'ReceiptOrderQty',
        'ReceiptInvQty',
        'BadQty',
        'Quantity',
        'BalanceQty',
      ]
      const data = this.dataTable?.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadPurchaseRNBrowse.pageSize *
                (this.payloadPurchaseRNBrowse.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          keyRow: item.receiptNo,
        }
        this.listDataShow?.forEach((headerItem) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldKey
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }

          if (headerItem.fieldName === 'ReceiptNo') {
            obj[mappingFieldName].type = 'link'

            const query = new URLSearchParams()
            query.set('receiptNO', item[mappingFieldName])

            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/purchase/arrival/detail?${query}`
          }

          if (alignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'right'
            obj[mappingFieldName].value = item[mappingFieldName] || 0
          }
          if (headerItem.fieldName === 'IsCheck') {
            obj[mappingFieldName].type = 'slot'
          }

          const listConvertDate = ['PromiseDate', 'ReceiptDate', 'CheckDate']
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'center'
          }
        })
        return obj
      })
      return data
    },
    headerMapping() {
      const listNumberField = [
        'ReceiptLabelQty',
        'RemainReceiptLabelQty',
        'ReceiptOrderQty',
        'ReceiptInvQty',
        'BadQty',
        'Quantity',
        'BalanceQty'
      ]
      const selectBoxFields = ['IsCheck', 'InspectionType', 'ItemType']
      const header = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
      ]
      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName)
          ? '30'
          : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || purchaseRNBrowseSchema,
            item.fieldKey
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: selectBoxFields.includes(item.fieldName) ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }

        if (item.fieldName === 'InspectionType') {
          headerItem.options = this.inspectionTypes
        }

        if (item.fieldName === 'IsCheck') {
          headerItem.options = this.yesNoOptions
        }

        if (item.fieldName === 'ItemType') {
          headerItem.options = this.itemTypeOptions
        }

        header.push(headerItem)
      })

      return header
    },
  },

  created() {
    this.SET_PAYLOAD_PURCHASE_RN_BROWSE({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_PURCHASE_RN_BROWSE:
        'filterSort/UPDATE_PAYLOAD_PURCHASE_RN_BROWSE',
      SET_PAYLOAD_PURCHASE_RN_BROWSE:
        'filterSort/SET_PAYLOAD_PURCHASE_RN_BROWSE',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
      SET_PURCHASE_RN_BROWSE_TOTAL_PAGES:
        'purchase/SET_PURCHASE_RN_BROWSE_TOTAL_PAGES',
    }),
    ...mapActions({
      getInspectionTypesFromAPI: 'base/getInspectionTypesFromAPI',
    }),
    async getItemTypeFormAPI() {
      this.loading = true
      const res = await api('getItemType')
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.itemTypeOptions = res.data?.map((item) => {
          return {
            text: this.$t(item.key),
            value: item.keyId,
          }
        })
        this.itemTypeOptions.unshift({
          text: '',
          value: '',
        })
      }
      this.loading = false
    },
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_PURCHASE_RN_BROWSE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_PURCHASE_RN_BROWSE({
        pageNo: Number(value),
      })
      this.getData()
    },
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api(
          'getListPurchaseRNBrowse',
          this.payloadPurchaseRNBrowse
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataHeader =
            res?.data?.tableContent?.content.length >= 0
              ? res.data?.scolumnHides
              : []
          this.dataTable = res?.data?.tableContent?.content
          this.total = res?.data?.tableContent?.totalElements
          this.SET_DATA_COLUMN_HIDE(this.dataHeader)
          this.SET_PURCHASE_RN_BROWSE_TOTAL_PAGES(
            res.data?.tableContent?.totalPages
          )
          this.dataFooter = res?.data?.tableFooter || {}
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

        const res = await api(
          'getListPurchaseRNBrowse',
          this.payloadPurchaseRNBrowse
        )

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data.tableContent?.content
          this.total = res.data.tableContent?.totalElements
          this.SET_PURCHASE_RN_BROWSE_TOTAL_PAGES(
            res.data?.tableContent?.totalPages
          )
          this.dataFooter = res?.data?.tableFooter || {}
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
.table-browse {
  height: calc(100% - 70px);

  .table-browse--body {
    height: calc(100% - 26px);
  }

  .table-browse--footer {
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
