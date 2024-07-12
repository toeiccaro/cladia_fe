<template>
  <div class="table-company d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!loading"
      :header="headerMapping"
      :data="dataTableMapping"
      :disabled-filter="true"
      :sort-key="sortKey"
      :is-ascending="isAscending"
      class="table-company--body"
      @row="handleDetailId"
      @sort="sort"
      @changeLayout="changeLayout"
    >
    </BaseTableDraggable>
    <div
      v-if="!loading"
      class="table-company--footer d-flex justify-content-end pl-2"
    >
      <span class="mr-3">1 - {{ dataTableMapping.length }}</span>
      <span class="mr-3">{{ dataTableMapping.length }}</span>
    </div>

    <BaseTableLoader v-else />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
import dateTime from '~/mixins/dateTime'
export default {
  components: { BaseTableDraggable, BaseTableLoader },
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
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      currentPage: 1,
      perPage: 30,
      sortKey: '',
      isAscending: false,
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters('base', {
      currencyOptions: 'getCurrencyOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    listDataShow() {
      return this.dataHeader
        .filter((el) => el.fieldName !== 'UserManagement')
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTableMapping() {
      const data = [this.dataTable].map((item, index) => {
        const obj = {
          index: {
            value: this.perPage * (this.currentPage - 1) + index + 1,
            align: 'center',
          },
          keyRow: item.subID,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }
          if (headerItem.fieldName === 'CompanyName') {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/master-data/company/detail?companyID=${item.subID}`
          }
          if (headerItem.fieldName === 'EditDate') {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
            obj[mappingFieldName].align = 'center'
          }
          if (headerItem.fieldName === 'Currency') {
            obj.currencyID = {
              value: this.currencyOptions.find(
                (currency) => currency.value === item.currencyID
              )?.text,
            }
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
      this.listDataShow.forEach((item) => {
        const headerItem = {
          key: this.mappingProperty(this.dataTable, item.fieldName),
          name: this.labelMapping[item.fieldName],
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
        }
        if (headerItem.fieldName === 'Currency') {
          headerItem.name = this.$t('lbl_Currency_0')
          headerItem.key = 'currencyID'
        }
        header.push(headerItem)
      })

      return header
    },
  },
  async created() {
    await Promise.all([this.getData(), this.getCurrencyOptions(this.lang)])
  },
  methods: {
    ...mapActions('base', ['getCurrencyOptions']),
    async sort({ sortParams, filterParams }) {
      try {
        this.sortKey = sortParams.sortKey
        this.isAscending = !sortParams.isAscending
        const finalFilterParams = {}

        const finalSortParams = {
          pageNo: this.currentPage,
          pageSize: this.perPage,
          sortByColumn: this.sortKey,
          sortAscOrDesc: this.isAscending ? 'ASC' : 'DESC',
          language: this.$i18n.locale,
        }

        for (const property in filterParams) {
          if (filterParams[property]) {
            finalFilterParams[property] = filterParams[property]
          }
        }

        this.loading = true
        const sortFormOptional = Object.assign(
          {},
          finalSortParams,
          finalFilterParams
        )
        const res = await api('getCompany', sortFormOptional)
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.dataTable = res?.data?.company
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getData() {
      try {
        const params = {}
        params.pageNo = this.currentPage
        params.pageSize = this.perPage
        this.loading = true
        const res = await api('getCompany')
        this.loading = false
        if (res && res.status === SERVER_RESPONSE_CODE.OK) {
          this.dataHeader = res?.data?.scolumnSets
          this.dataTable = res?.data?.company
          this.$store.commit('SET_DATA_COLUMN_HIDE', res?.data?.scolumnSets)
        }
      } catch (err) {
        console.error(err)
        this.loading = false
      }
    },
    refresh() {
      this.getData()
    },
    handleDetailId(data) {
      this.$emit('handleDetailId', data.keyRow)
    },
    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (fieldName === 'Currency') {
          return 'currencyID'
        }
        if (property.toLowerCase() === fieldName.toLowerCase()) {
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
<style lang="scss" scoped>
.table-company {
  height: calc(100% - 70px);
  .table-company--body {
    height: calc(100% - 26px);
  }
  .table-company--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
  }
}
</style>
