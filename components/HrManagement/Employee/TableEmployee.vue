<template>
  <div class="table-employee d-flex flex-column position-relative">
    <BaseTableDraggable
      v-if="!isLoadingTable"
      :header="headerMapping"
      :data="dataTableMapping"
      class="table-employee--body"
      :initial-filters="payloadEmployee"
      :update-filters-function="UPDATE_PAYLOAD_EMPLOYEE"
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

      <slot v-for="(item, index) in dataTable" :slot="'marital-' + index">
        <div
          :key="`marital-checkbox-${index}`"
          class="d-flex align-items-center justify-content-center h-100 w-100"
        >
          <b-form-checkbox disabled :checked="item.marital"></b-form-checkbox>
        </div>
      </slot>
    </BaseTableDraggable>
    <BasePagination
      v-if="!isLoadingTable"
      :total="total"
      :per-page="payloadEmployee.pageSize"
      :current-page="payloadEmployee.pageNo"
      :number-item="dataTable.length"
      class="table-employee--footer"
      @changePage="(value) => setCurrentPage(value)"
      @changePerPage="(value) => changePerPage(value)"
    ></BasePagination>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import { employeeSchema } from '@/schemas/master-data/employee'
import { dateFormatYYYY } from '@/utils/utils'
import api from '@/api/api'
import BasePagination from '@/components/UI/BasePagination.vue'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseTableLoader from '~/components/loaders/BaseTableLoader'
export default {
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
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
      loading: false,
      dataTable: [],
      dataHeader: [],
      total: 0,
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters({
      payloadEmployee: 'filterSort/getPayloadEmployee',
      getLanguage: 'base/getLanguage',
      stateOptions: 'base/getStateOptions',
    }),
    ...mapGetters('base', ['getActiveButtonToolBar']),

    listDataShow() {
      return this.dataHeader
        .filter((item) => !item.hidden)
        .sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    dataTableMapping() {
      const listAlignRightFields = ['Age']

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value:
              this.payloadEmployee.pageSize *
                (this.payloadEmployee.pageNo - 1) +
              index +
              1,
            align: 'center',
          },
          icon: {
            orderByList: 1,
            type: 'slot',
            value: false,
          },
          keyRow: item.employeeID,
        }
        this.listDataShow.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(
            item,
            headerItem.fieldName
          )
          obj[mappingFieldName] = { value: item[mappingFieldName] || '' }
          if (listAlignRightFields.includes(headerItem.fieldName)) {
            obj[mappingFieldName] = {
              value: item[mappingFieldName] || 0,
              align: 'right',
            }
          }
          if (
            headerItem.fieldName === 'EmployeeCode' ||
            headerItem.fieldName === 'EmployeeName'
          ) {
            obj[mappingFieldName].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              mappingFieldName
            ].link = `/${this.$i18n.locale}/hr-management/employee/detail?employeeCode=${item.employeeID}`
          }

          if (headerItem.fieldName === 'Marital') {
            obj[mappingFieldName].type = 'slot'
          }
          const listConvertDate = [
            'EntryDate',
            'EnterDate',
            'LeaveDate',
            'CheckDate',
            'EditDate',
            'Born',
          ]
          if (listConvertDate.includes(headerItem.fieldName)) {
            obj[mappingFieldName].value = item[mappingFieldName]
              ? dateFormatYYYY(item[mappingFieldName])
              : ''
            obj[mappingFieldName].align = 'center'
          }
        })
        return obj
      })
      return data
    },

    stateMaritalOptions() {
      return [
        { text: '', value: '' },
        { text: 'Yes', value: 1 },
        { text: 'No', value: 0 },
      ]
    },
    headerMapping() {
      const listNumberField = ['Age']
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
      this.listDataShow.forEach((item) => {
        const maxLength = listNumberField.includes(item.fieldName) ? '30' : '256'
        const selectBoxFields = ['State', 'Marital']
        const headerItem = {
          key: this.mappingProperty(
            this.dataTable[0] || employeeSchema,
            item.fieldName
          ),
          name: this.labelMapping[item.fieldName],
          filter: selectBoxFields.includes(item.fieldName) ? 'select' : 'input',
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
          fieldOrder: item.fieldOrder,
          maxLength,
        }
        if (item.fieldName === 'State') {
          headerItem.options = this.stateOptions
        }

        if (item.fieldName === 'Marital') {
          headerItem.options = this.stateMaritalOptions
        }
        header.push(headerItem)
      })

      return header
    },
  },
  async fetch() {
    try {
      this.loading = true
      this.UPDATE_PAYLOAD_EMPLOYEE({
        language: this.lang,
      })
      await Promise.all([
        this.getData(),
        this.getStateOptionsFromAPI(this.lang),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  created() {
    this.SET_PAYLOAD_EMPLOYEE({
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    })
  },
  methods: {
    ...mapActions({
      getStateOptionsFromAPI: 'base/getStateOptionsFromAPI',
    }),
    ...mapMutations({
      UPDATE_PAYLOAD_EMPLOYEE: 'filterSort/UPDATE_PAYLOAD_EMPLOYEE',
      SET_PAYLOAD_EMPLOYEE: 'filterSort/SET_PAYLOAD_EMPLOYEE',
      SET_DATA_COLUMN_HIDE: 'SET_DATA_COLUMN_HIDE',
    }),
    changePerPage(value) {
      const filterPayload = {
        pageSize: Number(value),
        pageNo: 1,
      }
      this.UPDATE_PAYLOAD_EMPLOYEE(filterPayload)
      this.getData()
    },
    setCurrentPage(value) {
      this.UPDATE_PAYLOAD_EMPLOYEE({
        pageNo: Number(value),
      })
      this.getData()
    },

    async getData() {
      try {
        this.isLoadingTable = true
        const res = await api('getEmployee', this.payloadEmployee)
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
        const res = await api('getEmployee', this.payloadEmployee)
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
.table-employee {
  height: calc(100% - 70px);

  .table-employee--body {
    height: calc(100% - 26px);
  }
  .table-employee--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
</style>
