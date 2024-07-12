<template>
  <div class="table-item-master d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-item-master--body"
      :initial-filters="payloadItemMaster"
      :update-filters-function="UPDATE_PAYLOAD_ITEM_MASTER"
      @search="filterAndSort"
      @row="handleToOpenDetail"
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
      <slot v-for="(item, index) in dataTable" :slot="`isCommon-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <input
            type="checkbox"
            class="checkbox"
            disabled
            :checked="item.isCommon"
          />
        </div>
      </slot>
      <slot v-for="(item, index) in dataTable" :slot="`isNotNeedMRP-${index}`">
        <div
          :key="`icon-attract${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <input
            type="checkbox"
            class="checkbox"
            disabled
            :checked="item.isNotNeedMRP"
          />
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadItemMaster.pageSize"
      :current-page="payloadItemMaster.pageNo"
      :number-item="dataTable.length"
      class="table-item-master--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { itemMasterSchema } from '@/schemas/master-data/item-master'
import BasePagination from '@/components/UI/BasePagination.vue'
import dateTime from '~/mixins/dateTime'
import api from '~/api/api'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  name: 'TableItemMaster',
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
      itemTypeOptions: [],
      dataTable: [],
      dataHeader: [],
      total: 0,
      loading: false,
      isLoadingTable: false,
      lang: this.$i18n.locale,
      isClickCallAPIQuery: false,
    }
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_ITEM_MASTER({
        language: this.lang,
      })
      await Promise.all([
        this.getData(),
        this.getItemTypeFormAPI(),
        this.getListBox(),
        this.getWarehouseOptions(this.lang),
        this.getItemCustomOptionsFromAPI(this.lang),
      ])
      if (this.itemTypeID) {
        const itemType =
          this.itemTypeID === 'other' ? 'Other' : Number(this.itemTypeID)
        this.UPDATE_PAYLOAD_ITEM_MASTER({ itemType })
        await this.filterAndSort()
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },

  computed: {
    ...mapGetters({
      payloadItemMaster: 'filterSort/getPayloadItemMaster',
      getLanguage: 'base/getLanguage',
      listBox: 'base/getListBox',
      warehouseOptions: 'base/getWarehouseOptions',
      itemCustomOptions: 'base/getItemCustomOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    listBoxTypes() {
      const box = this.listBox.map((item) => ({
        text: item.boxType,
        value: item.boxType,
      }))
      box.unshift({
        text: '',
        value: '',
      })
      return box
    },

    checkOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },

    itemTypeID() {
      return this.$route?.query?.type || ''
    },

    dataTableMapping() {
      const listAlignRightFields = [
        'MOQ',
        'SPQ',
        'OutPeriod',
        'OutRate',
        'PackPeriod',
        'PackPeriod',
        'SalesPrice',
        'PurchasePeriod',
        'SafeQty',
        'SalesPrice',
        'Price',
        'Weight',
        'SalePeriod',
        'SOPrice',
      ]

      const fieldsCheckOpt = ['IsCommon', 'IsNotNeedMRP']

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadItemMaster.pageSize *
                (this.payloadItemMaster.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.itemID,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }
          if (listAlignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName] = {
              value: item[mappingFieldName] || 0,
              align: 'right',
            }
          }
          if (headerItem.fieldName === 'ItemPic') {
            obj.itemPic.value =
              obj.itemPic.value === '0' ? '' : obj.itemPic.value
          }
          if (
            headerItem.fieldName === 'ItemCode' ||
            headerItem.fieldName === 'ItemName'
          ) {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/master-data/item-master/detail?itemCode=${item.itemID}`
          }
          const listConvertDate = ['OrderDate', 'CheckDate', 'EditDate']
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          if (fieldsCheckOpt.includes(headerItem.fieldName)) {
            obj[mappingFieldName].type = 'slot' 
          }
        })
        return obj
      })
      return data
    },
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    itemTypeOptionsByConditionQuery() {
      if (this.itemTypeID === 'other') {
        const itemOptionOther = this.itemTypeOptions.filter(
          (item) => item.value > 6
        )
        itemOptionOther.unshift({
          text: '',
          value: 'Other',
        })
        return itemOptionOther
      }
      return this.itemTypeOptions
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

      const itemTypeID = this.$route?.query?.type

      const listNumberField = [
        'MOQ',
        'SPQ',
        'OutPeriod',
        'OutRate',
        'PackPeriod',
        'PackPeriod',
        'SalesPrice',
        'PurchasePeriod',
        'SafeQty',
        'SalesPrice',
        'Price',
        'Weight',
        'SalePeriod',
        'SOPrice',
      ]

      const fieldsCheckOpt = ['IsCommon', 'IsNotNeedMRP']

      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName)
          ? '30'
          : '256'
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || itemMasterSchema,
            item.fieldName
          ),
          name: this.labelMapping[item.fieldName],
          filter: item.fieldName === 'ItemType' ? 'select' : 'input',
          width: item.fieldWide * 1,
          disabled:
            itemTypeID &&
            itemTypeID !== 'other' &&
            item.fieldName === 'ItemType',
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }

        if (item.fieldName === 'ItemType') {
          headerItem.options =
            this.itemTypeID !== 'other'
              ? this.itemTypeOptions
              : this.itemTypeOptionsByConditionQuery
        }

        if (item.fieldName === 'Price') {
          headerItem.fieldName = 'CostPrice'
          headerItem.name = this.$t('lbl_CostPrice_0')
        }

        if (['Responsible', 'ResponsibleMan'].includes(item.fieldName)) {
          headerItem.name = this.$t('lbl_ResponsibleMan_0')
          headerItem.key = 'responsibleMan'
        }

        if (fieldsCheckOpt.includes(item.fieldName)) {
          headerItem.filter = 'select'
          headerItem.options = this.checkOptions
        }

        if (item.fieldName === 'BoxType') {
          headerItem.filter = 'select'
          headerItem.options = this.listBoxTypes
        }

        if (item.fieldName === 'Warehouse') {
          headerItem.filter = 'select'
          headerItem.options = this.warehouseOptions
        }

        if (item.fieldName === 'ItemCustom') {
          headerItem.filter = 'select'
          headerItem.options = this.itemCustomOptions
        }

        header.push(headerItem)
      })

      return header
    },
  },
  watch: {
    '$route.query.type': {
      async handler(val) {
        this.SET_PAYLOAD_ITEM_MASTER({
          pageNo: 1,
          pageSize: 30,
          language: this.lang,
        })

        if (val) {
          const itemType =
            this.itemTypeID === 'other' ? 'Other' : Number(this.itemTypeID)
          this.UPDATE_PAYLOAD_ITEM_MASTER({
            itemType,
            isClickCallAPIQuery: true,
          })
          await this.filterAndSort()
          this.UPDATE_PAYLOAD_ITEM_MASTER({ isClickCallAPIQuery: false })
        } else {
          await this.getData()
        }

        const itemType =
          this.itemTypeID === 'other' ? 'Other' : Number(this.itemTypeID)
        this.UPDATE_PAYLOAD_ITEM_MASTER({
          itemType,
        })
      },
    },
  },
  created() {
    this.SET_PAYLOAD_ITEM_MASTER({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_ITEM_MASTER: 'filterSort/UPDATE_PAYLOAD_ITEM_MASTER',
      SET_PAYLOAD_ITEM_MASTER: 'filterSort/SET_PAYLOAD_ITEM_MASTER',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    ...mapActions({
      getListBox: 'base/getListBox',
      getWarehouseOptions: 'base/getWarehouseOptions',
      getItemCustomOptionsFromAPI: 'base/getItemCustomOptionsFromAPI',
    }),

    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_ITEM_MASTER(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_ITEM_MASTER({
        pageNo: Number(value),
      })
      this.getData()
    },
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
    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('getItemMaster', this.payloadItemMaster)
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
    async changeLimit(value) {
      this.perPage = Number(value)
      this.currentPage = 1
      await this.getData()
    },
    async filterAndSort() {
      try {
        this.loading = true
        const res = await api('getItemMaster', this.payloadItemMaster)
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
    async refreshTable() {
      await this.getData()
    },
    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (fieldName === 'Responsible' || fieldName === 'ResponsibleMan') {
          return 'responsibleMan'
        } else if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },
    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },
  },
}
</script>

<style scoped lang="scss">
.table-item-master {
  height: calc(100% - 70px);

  .table-item-master--body {
    height: calc(100% - 26px);
  }

  .table-item-master--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
</style>
