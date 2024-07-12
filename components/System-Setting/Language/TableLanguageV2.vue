<template>
  <div class="table-language">
    <TableInputLanguage
      :header="headersComponents"
      :data="dataTableLanguage"
      :sort-key="sortKey"
      :is-ascending="isAscending"
      class="table-language--body"
      @sort="handleFilterAndSort"
      @filter="handleFilterAndSort"
      @enter="handleSaveText"
    ></TableInputLanguage>
    <BasePagination
      v-if="!loading"
      :total="totalElements"
      :per-page="pageSize"
      :current-page="currentPage"
      :number-item="listTextLanguage.length"
      class="table-language--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changeLimit(value)"
    ></BasePagination>

    <div
      v-if="loading"
      class="spinner content d-flex justify-content-center align-items-center"
    >
      <b-spinner
        b-spinner
        style="width: 3rem; height: 3rem"
        label="Loading..."
      ></b-spinner>
    </div>
  </div>
</template>
<script>
import TableInputLanguage from './TableInputLanguage.vue'
import BasePagination from '@/components/UI/BasePagination.vue'

import api from '~/api/api'
import { isEmptyValue, stringUpperFirstCase } from '~/utils/utils'

export default {
  name: 'TableLanguageV2',
  components: { TableInputLanguage, BasePagination },
  data() {
    return {
      loading: false,
      listTextLanguage: [],
      headers: [],
      totalElements: null,
      currentPage: 1,
      pageSize: 30,
      sortKey: '',
      isAscending: false,
      sortFormOptional: {
        pageNo: 1,
        pageSize: 30,
        langName: this.$i18n.locale,
      },
      CHINESE_SIMPLIFIED: 'Chinese_Simplified',
      CHINESE_TRADITIONAL: 'Chinese_Traditional',
    }
  },
  computed: {
    headersComponents() {
      const result = [
        {
          key: 'index',
          name: '',
          width: 40,
        },
        // {
        //     key: 'menuID',
        //     name: this.$t('lbl_MenuID_0'),
        //     width: '200',
        //     filter: 'input',
        // },
        // {
        //     key: 'keyCode',
        //     name: this.$t('lbl_KeyCode_0'),
        //     width: '200',
        //     filter: 'input',
        // },
      ]
      this.headers.forEach((item) => {
        const defaultHeader = ['KeyCode', 'MenuID']
        const upperFirstCase = stringUpperFirstCase(item)
        const titleHeader = defaultHeader.includes(upperFirstCase)
          ? this.$t(`lbl_${upperFirstCase}_0`)
          : this.$t(`lan_${upperFirstCase}_0`)
        result.push({
          key: item,
          name: titleHeader,
          filter: 'input',
          width: '200',
        })
      })
      return result
    },
    dataTableLanguage() {
      const data = this.listTextLanguage.map((item, index) => {
        const obj = {
          index: this.pageSize * (this.currentPage - 1) + index + 1,
          keyCode: item.keyCode,
          menuID: item.menuID,
          id: item.id,
          isUpdate: item.isUpdate,
        }
        this.headers.forEach((headerItem, headerIndex) => {
          obj[headerItem] = item[headerItem]
        })
        return obj
      })
      return data
    },
  },
  created() {
    this.getAllTextLanguages()
  },
  methods: {
    async setCurrentPage(value) {
      this.currentPage = Number(value)
      this.sortFormOptional.pageNo = this.currentPage
      await this.getAllTextLanguages()

      ++this.refreshPaginationKey
    },
    async changeLimit(value) {
      this.pageSize = Number(value)
      this.currentPage = 1
      this.sortFormOptional.pageSize = this.pageSize
      this.sortFormOptional.pageNo = 1
      await this.getAllTextLanguages()
    },
    async getAllTextLanguages() {
      try {
        this.loading = true
        const response = await api(
          'getAllTextLanguagesWithMenu',
          this.sortFormOptional
        )
        const { scolumnHides, tableContent } = response
        if (scolumnHides) {
          this.headers = scolumnHides.map((r) => r.fieldKey)
        }
        if (tableContent) {
          this.listTextLanguage = this.mapDataTable(tableContent.content)
          this.totalElements = tableContent.totalElements
        }
        this.loading = false
      } catch (error) {
      } finally {
        this.loading = false
      }
    },
    async handleFilterAndSort({ sortParams, filterParams }, type) {
      try {
        const { sortKey, isAscending } = sortParams
        this.sortKey = sortKey
        this.isAscending = !isAscending

        if (type === 'filter') {
          this.currentPage = 1
        }

        const sortColumn =
          sortKey === 'Chinese (Simplified)'
            ? this.CHINESE_SIMPLIFIED
            : sortKey === 'Chinese (traditional)'
            ? this.CHINESE_TRADITIONAL
            : sortKey

        const finalFilterParams = {}
        for (const [property, value] of Object.entries(filterParams)) {
          if (property === 'keyCode') {
            finalFilterParams.keyCode = value
          } else if (property === 'menuID') {
            finalFilterParams.menuID = value
          } else if (value) {
            const languageHeader =
              property === 'Chinese (Simplified)'
                ? this.CHINESE_SIMPLIFIED
                : property === 'Chinese (traditional)'
                ? this.CHINESE_TRADITIONAL
                : null
            const finalFilterParamsKey = stringUpperFirstCase(
              languageHeader || property
            )
            finalFilterParams[finalFilterParamsKey] = value
          }
        }

        const paginationParams = {
          pageNo: this.currentPage,
          pageSize: this.pageSize,
          language: this.$i18n.locale,
          keyCode: filterParams?.keyCode,
          sortByColumn: sortColumn,
          sortAscOrDesc: this.isAscending ? 'ASC' : 'DESC',
        }
        if (!finalFilterParams) {
          delete paginationParams.sortAscOrDesc
        }
        const searchFormOptional = {
          ...paginationParams,
          ...finalFilterParams,
        }
        for (const property in searchFormOptional) {
          if (
            isEmptyValue(searchFormOptional[property]) ||
            searchFormOptional[property].length === 0
          ) {
            delete searchFormOptional[property]
          }
        }
        this.sortFormOptional = searchFormOptional

        await this.getAllTextLanguages()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    handleSaveText() {
      this.$emit('enter')
    },
    mapDataTable(rawDataContent) {
      const mappedDataTable = []

      // NOTE: put these fields in order of responded data
      const tableMappingData = ['id', ...this.headers]
      rawDataContent.forEach((item) => {
        const dataItem = {}

        tableMappingData.forEach((fieldName, index) => {
          dataItem[fieldName] = item[fieldName]
          dataItem.isUpdate = false
        })

        mappedDataTable.push(dataItem)
      })

      return mappedDataTable
    },
  },
}
</script>
<style lang="scss" scoped>
.table-language {
  height: calc(100% - 73px);

  .table-language--body {
    height: calc(100% - 26px);
  }

  .table-language--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
</style>
