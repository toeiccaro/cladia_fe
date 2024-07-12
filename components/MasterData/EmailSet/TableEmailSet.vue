<template>
  <div class="table__email-set d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      ref="tableEmailSet"
      :header="headerMapping"
      :data="dataTableMapping"
      :sort-key="sortKey"
      :is-ascending="isAscending"
      :initial-filters="payloadEmailSet"
      :update-filters-function="UPDATE_PAYLOAD_EMAIL_SET"
      class="table__email-set--body"
      @row="handleDetailRow"
      @changeLayout="changeLayout"
      @search="filterAndSort"
      >
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="perPage"
      :current-page="currentPage"
      :number-item="dataTable.length"
      class="table__email-set--footer"
      :class="{
        'border--full': !total,
      }"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { emailSetSchema } from '@/schemas/master-data/email-set'
import dateTimeMixins from '@/mixins/dateTime'
import api from '@/api/api'
import BasePagination from '~/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [dateTimeMixins],
  data() {
    return {
      isLoadingTable: false,
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      currentPage: 1,
      perPage: 30,
      sortKey: 'moduleName',
      isAscending: false,
      lang: this.$i18n.locale,
      listModules: [],
    }
  },
  async fetch() {
    try {
      this.UPDATE_PAYLOAD_EMAIL_SET({
        language: this.lang,
      })
      const [moduleRes] = await Promise.all([
        api('getListModuleIds'),
        this.getData(),
      ])
  
      const validGetModuleResponse =
        moduleRes && moduleRes.status === SERVER_RESPONSE_CODE.OK
      if (validGetModuleResponse) {
        this.listModules = moduleRes.data || []
      }
    } catch (err) {
      console.log(err)
    }
  },

  computed: {
    ...mapGetters({
      payloadEmailSet: 'filterSort/getPayloadEmailSet',
    }),
    listModuleOptions() {
      const options = this.listModules?.map((item) => ({
        value: item,
        text: this.$t(`lbl_${item}_0`),
      }))

      options.unshift({
        text: 'ALL',
        value: '',
      })

      return options
    },
    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },

    dataTableMapping() {
      const listAlignCenterFields = [
        'EmployeeName',
        'Email',
        'EditUser',
        'EditDate',
      ]

      const convertDateFields = ['EditDate']

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value: this.perPage * (this.currentPage - 1) + index + 1,
            align: 'center',
          },
          checkbox: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          employeeID: {
            value: item.employeeID,
          },
          keyRow: item.receiveBrowseNo,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )

          obj[mappingFieldName] = {
            value: item[mappingFieldName] || '',
          }

          if (listAlignCenterFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].align = 'center'
          }

          if (convertDateFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = this.convertDate(
              item[mappingFieldName]
            )
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
          canNotSort: true,
        },
      ]

      this.listDataShow.forEach((item) => {
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || emailSetSchema,
            item.fieldName
          ),
          name: this.$t(`lbl_${item.fieldName}_0`),
          filter: 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
        }

        if (item.fieldName === 'ModuleName') {
          headerItem.options = this.listModuleOptions
          headerItem.filter = 'select'
        }

        header.push(headerItem)
      })

      return header
    },
  },

  mounted() {
    if (!this.isLoadingTable) {
      this.$refs.tableEmailSet.filters = {
        moduleName: '',
      }
    }
  },

  created() {
    this.SET_PAYLOAD_EMAIL_SET({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },

  methods: {
    async filterAndSort () {
      try {
        this.loading = true
        const res = await api('getListEmailSets', this.payloadEmailSet)
        const successResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!successResponse) {
          return
        }

        this.dataTable = res.data?.tableContent?.content || []
        this.total = res.data?.tableContent?.totalElements
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    ...mapMutations({
      SET_PAYLOAD_EMAIL_SET: 'filterSort/SET_PAYLOAD_EMAIL_SET',
      UPDATE_PAYLOAD_EMAIL_SET: 'filterSort/UPDATE_PAYLOAD_EMAIL_SET',
    }),
    async setCurrentPage(value) {
      this.currentPage = Number(value)
      this.UPDATE_PAYLOAD_EMAIL_SET({
        pageNo: this.currentPage,
      })
      await this.getData()
    },
    async changePerPage(value) {
      this.perPage = Number(value)
      this.UPDATE_PAYLOAD_EMAIL_SET({
        pageSize: this.perPage,
      })
      await this.getData()
    },
    handleDetailRow(payload) {
      this.$emit('handleDetailRow', payload)
    },
    async sort({ sortParams, filterParams }) {
      try {
        this.sortKey = sortParams.sortKey
        this.isAscending = !sortParams.isAscending
        const params = {
          pageNo: this.currentPage,
          pageSize: this.perPage,
          sortByColumn: this.sortKey,
          sortAscOrDesc: this.isAscending ? 'ASC' : 'DESC',
          language: this.$i18n.locale,
        }

        const finalFilterParams = {}
        for (const property in filterParams) {
          if (filterParams[property] || filterParams[property] === 0) {
            finalFilterParams[property] = filterParams[property]
          }
        }

        this.loading = true
        const searchFormOptional = Object.assign({}, params, finalFilterParams)

        this.SET_PAYLOAD_EMAIL_SET(searchFormOptional)
        const res = await api('getListEmailSets', searchFormOptional)

        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data?.tableContent?.content || []
          this.dataHeader = res.data?.scolumnHides || []
          this.total = res.data?.tableContent?.totalElements
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
        const res = await api('getListEmailSets', this.payloadEmailSet)
        const successResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!successResponse) {
          return
        }

        this.dataTable = res.data?.tableContent?.content || []
        this.dataHeader = res.data?.scolumnHides || []
        this.total = res.data?.tableContent?.totalElements
      } catch (err) {
        console.error(err)
      } finally {
        this.isLoadingTable = false
      }
    },

    async filterData({ sortParams, filterParams }) {
      try {
        this.sortKey = sortParams.sortKey || this.sortKey
        if (sortParams.sortKey) {
          this.isAscending = !sortParams.isAscending
        }

        this.currentPage = 1

        const finalFilterParams = {}

        const paginationParams = {
          pageNo: this.currentPage,
          pageSize: this.perPage,
          sortByColumn: this.sortKey,
          sortAscOrDesc: this.isAscending ? 'ASC' : 'DESC',
          localLanguge: this.$i18n.locale,
        }

        for (const property in filterParams) {
          if (filterParams[property] || filterParams[property] === 0) {
            finalFilterParams[property] = filterParams[property]
          }
        }

        this.loading = true
        const searchFormOptional = Object.assign(
          {},
          paginationParams,
          finalFilterParams
        )

        this.SET_PAYLOAD_EMAIL_SET(searchFormOptional)
        const res = await api('getListEmailSets', searchFormOptional)

        const successResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (!successResponse) {
          return
        }

        this.dataTable = res.data?.tableContent?.content || []
        this.dataHeader = res.data?.scolumnHides || []
        this.total = res.data?.tableContent?.totalElements
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property
        }
      }
      return ''
    },

    changeLayout(data) {
      this.$emit('changeLayout', data, this.listDataShow)
    },

    async refresh() {
      await this.getData()
    },
  },
}
</script>
<style lang="scss" scoped>
.table__email-set {
  height: calc(100% - 151px);
  .table__email-set--body {
    height: calc(100% - 26px);
  }
  .table__email-set--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
  .border--full {
    border-top: 1px solid #5180d8 !important;
  }
}
</style>
