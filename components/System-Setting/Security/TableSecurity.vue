<template>
  <div class="security-table">
    <table class="table-wrapper">
      <thead class="table-header">
        <tr>
          <th
            v-for="(item, index) in headers"
            :key="`header-${index}`"
            :class="`th-${index}`"
          >
            <input
              v-if="item.checkbox"
              ref="columnCheckbox"
              type="checkbox"
              class="checkbox"
              @change="(event) => columnCheck(event.target.checked, item)"
            />
            {{ item.name }}
          </th>
        </tr>
        <tr>
          <td v-for="(item, index) in headers" :key="`header-${index}`">
            <input
              v-if="item.input"
              v-model="textPageNameSearch"
              type="text"
              @keyup.enter="
                (event) => onChangeTextSearch(event.target.value, item.key)
              "
            />
          </td>
        </tr>
      </thead>
      <tbody class="table-body">
        <tr v-for="(element, index) in listDataSecurity" :key="`body-${index}`">
          <td>{{ index + 1 }}</td>
          <td>
            <input
              ref="rowCheckbox"
              v-model="element.isCheckedRow"
              type="checkbox"
              class="checkbox"
              @change="(event) => rowCheck(event.target.checked, element)"
            />
          </td>
          <template v-if="element.childs && element.childs.length > 0">
            <td>
              <div class="text-page-name">
                <b-icon-caret-right-fill
                  v-if="!element.isOpenSubPage"
                  class="icon-right-fill"
                  @click="handleExpandRow(element, index)"
                />

                <b-icon-caret-down-fill
                  v-else
                  class="icon-right-fill"
                  @click="handleNarrowRow(element, index)"
                />
                {{ $t(`lbl_${element.srightName}_0`) }}
              </div>
            </td>
          </template>
          <template v-else>
            <td :class="{ 'is-children': element.isChildren }">
              <a
                v-if="element.srightId === S_RIGHT_ID_DASHBOARD"
                class="dashboard-button"
                @click="handleClickPopupConfig"
                >{{ $t(`lbl_${element.srightName}_0`) }}</a
              >
              <span v-else> {{ $t(`lbl_${element.srightName}_0`) }}</span>
            </td>
          </template>
          <td>
            <input
              v-model="element.isRun"
              type="checkbox"
              class="checkbox"
              @change="
                (value) =>
                  onChangeSelect('isRun', value.target.checked, element)
              "
            />
          </td>
          <td>
            <input
              v-model="element.isEdit"
              type="checkbox"
              class="checkbox"
              @change="
                (value) =>
                  onChangeSelect('isEdit', value.target.checked, element)
              "
            />
          </td>
          <td>
            <input
              v-model="element.isDelete"
              type="checkbox"
              class="checkbox"
              @change="
                (value) =>
                  onChangeSelect('isDelete', value.target.checked, element)
              "
            />
          </td>
          <td>
            <input
              v-model="element.isExport"
              type="checkbox"
              class="checkbox"
              @change="
                (value) =>
                  onChangeSelect('isExport', value.target.checked, element)
              "
            />
          </td>
          <td>
            <input
              v-model="element.isAttachments"
              type="checkbox"
              class="checkbox"
              @change="
                (value) =>
                  onChangeSelect('isAttachments', value.target.checked, element)
              "
            />
          </td>
          <td>
            <input
              v-model="element.isPrint"
              type="checkbox"
              class="checkbox"
              @change="
                (value) =>
                  onChangeSelect('isPrint', value.target.checked, element)
              "
            />
          </td>
          <td>
            <input
              v-model="element.isCheck"
              type="checkbox"
              class="checkbox"
              @change="
                (value) =>
                  onChangeSelect('isCheck', value.target.checked, element)
              "
            />
          </td>
        </tr>
      </tbody>
    </table>
    <popup-dashboard-config
      ref="dashboardConfig"
      :user-info="userInfo"
      :data-config-by-user="listDataConfig"
      :user-role-i-d="userRoleID"
      @setLoading="setLoading"
    />
    <base-loading v-if="loading" />
  </div>
</template>
<script>
import { mapMutations, mapGetters } from 'vuex'
import { BIconCaretRightFill, BIconCaretDownFill } from 'bootstrap-vue'
import PopupDashboardConfig from './PopupDashboardConfig.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import { S_RIGHT_ID_DASHBOARD } from '~/constants'
export default {
  components: {
    BIconCaretRightFill,
    BIconCaretDownFill,
    PopupDashboardConfig,
    BaseLoading,
  },
  props: {
    userInfo: {
      type: Object,
      default: () => ({}),
    },
    listDataConfig: {
      type: Array,
      default: () => [],
    },
    userRoleID: {
      type: [Number, String],
      default: 0,
    },
  },

  data() {
    return {
      listDataSecurity: [],
      checkBoxFields: [
        'isRun',
        'isEdit',
        'isDelete',
        'isExport',
        'isAttachments',
        'isPrint',
        'isCheck',
      ],
      listSecurityChange: [],
      loading: false,
      S_RIGHT_ID_DASHBOARD,
      textPageNameSearch: '',
      isShowPopupDashboard: false,
      lang: this.$i18n.locale,
    }
  },

  computed: {
    ...mapGetters({
      getListDataSecurity: 'system-setting/getListDataSecurity',
      payloadSystemConfigSecurity: 'filterSort/getPayloadSystemConfigSecurity',
    }),
    headers() {
      return [
        {
          name: 'ID',
        },
        {
          key: 'isCheckAll',
          name: '',
          checkbox: true,
        },
        {
          key: 'pageName',
          name: this.$t('lbl_PageName_0'),
          checkbox: false,
          input: true,
        },
        {
          key: 'isRun',
          name: this.$t('lbl_Run_0'),
          checkbox: true,
        },
        {
          key: 'isEdit',
          name: this.$t('lbl_Edit_0'),
          checkbox: true,
        },
        {
          key: 'isDelete',
          name: this.$t('lbl_Delete_0'),
          checkbox: true,
        },
        {
          key: 'isExport',
          name: this.$t('lbl_Export_0'),
          checkbox: true,
        },
        {
          key: 'isAttachments',
          name: this.$t('lbl_Attachments_0'),
          checkbox: true,
        },
        {
          key: 'isPrint',
          name: this.$t('lbl_Print_0'),
          checkbox: true,
        },
        {
          key: 'isCheck',
          name: this.$t('lbl_Check_0'),
          checkbox: true,
        },
      ]
    },
  },
  watch: {
    getListDataSecurity: {
      handler(value) {
        this.isOpenSubPage = false
        this.listDataSecurity = JSON.parse(JSON.stringify(value))
      },
    },

    payloadSystemConfigSecurity: {
      deep: true,
      immediate: true,
      handler() {
        this.$emit('search')
      },
    },
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_SYSTEM_CONFIG_SECURITY:
        'filterSort/UPDATE_PAYLOAD_SYSTEM_CONFIG_SECURITY',
      SET_LIST_DATA_SECURITY: 'system-setting/SET_LIST_DATA_SECURITY',
    }),

    setLoading(loading) {
      this.loading = loading
    },

    handleClickPopupConfig() {
      this.showPopupDashboardConfig()
    },
    showPopupDashboardConfig() {
      this.$emit('getDashboardConfig')
      this.$bvModal.show('popup-dashboard-config')
      
    },
    handleExpandRow(element, index) {
      let newIndex = index + 1
      this.listDataSecurity[index].isOpenSubPage = true
      element.childs.forEach((child) => {
        this.listDataSecurity.splice(newIndex, 0, {
          ...child,
          isChildren: true,
        })
        newIndex++
      })
    },
    checkShowChildItem(srightId) {
      this.listDataSecurity = this.listDataSecurity.filter(
        (item, index) => item.parentId !== srightId
      )
    },
    handleNarrowRow(element, index) {
      this.listDataSecurity[index].isOpenSubPage = false
      this.checkShowChildItem(element.srightId)
    },
    rowCheck(isChecked, rowData) {
      if (rowData.isChildren) {
        const parentElement = this.listDataSecurity.find(
          (item) => item.srightId === rowData.parentId
        )

        for (const child of parentElement.childs) {
          if (child.srightId === rowData.srightId) {
            this.setCheckData(isChecked, child)
            break
          }
        }
      }

      this.setCheckData(isChecked, rowData)
      if (!rowData.isChildren) {
        this.listSecurityChange = Array.from(new Set(this.listDataSecurity))
      }
    },
    setCheckData(isChecked, rowData) {
      for (const propertyName in rowData) {
        const isCheckboxField = this.checkBoxFields.includes(propertyName)

        if (isCheckboxField) {
          rowData[propertyName] = isChecked
          rowData.isCheckedRow = isChecked
        }
      }
    },
    columnCheck(isChecked, columnData) {
      const isValidCheckAll = columnData.key === 'isCheckAll'

      if (isValidCheckAll) {
        return this.checkAllTable({ isChecked })
      }
      this.checkByColumn(isChecked, columnData)
    },

    checkAllTable({ isChecked, isExcludeCheckAllBox = true }) {
      this.listSecurityChange = []
      this.checkAllTableHeader({ isChecked, isExcludeCheckAllBox })
      this.checkAllTableBody({ isChecked })
    },

    checkAllTableBody({ isChecked }) {
      this.listSecurityChange = []
      this.listDataSecurity = this.listDataSecurity.map((item, index) => {
        if (item.childs && item.childs.length > 0) {
          item.childs.map((_el) => this.rowCheck(isChecked, _el))
        }
        this.rowCheck(isChecked, item)
        return item
      })
    },

    checkAllTableHeader({ isChecked, isExcludeCheckAllBox = true }) {
      const rowCheckboxes = this.$refs.rowCheckbox
      const validRowCheckboxes = !!rowCheckboxes && rowCheckboxes.length
      if (validRowCheckboxes) {
        for (const row of rowCheckboxes) {
          row.checked = isChecked
        }
      }

      const columnCheckboxes = isExcludeCheckAllBox
        ? this.$refs.columnCheckbox?.slice(1)
        : this.$refs.columnCheckbox

      const validColumnCheckboxes =
        !!columnCheckboxes && columnCheckboxes.length

      if (validColumnCheckboxes) {
        for (const column of columnCheckboxes) {
          column.checked = isChecked
        }
      }
    },

    checkByColumn(isChecked, columnData) {
      this.listDataSecurity = this.listDataSecurity.map((item) => ({
        ...item,
        [columnData.key]: isChecked,
      }))
      this.listSecurityChange = this.listDataSecurity
      this.listSecurityChange = Array.from(new Set(this.listSecurityChange))
    },
    onChangeSelect(key, value, element) {
      const matchingElement = this.listSecurityChange.find(
        (item) => item.pageNameSetId === element.pageNameSetId
      )

      if (matchingElement) {
        matchingElement[key] = value
      } else this.listSecurityChange.push(element)

      if (element.isChildren) {
        const parentRow = this.listDataSecurity.find(
          (item) => item.srightId === element.parentId
        )
        parentRow[key] = true
      }

      this.listSecurityChange = Array.from(new Set(this.listSecurityChange))
    },
    onChangeTextSearch(value, key) {
      this.textPageNameSearch = value
      this.UPDATE_PAYLOAD_SYSTEM_CONFIG_SECURITY({
        language: this.lang,
        [key]: value,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.table-wrapper {
  width: 100%;
  border-collapse: collapse;
  position: relative;
  .table-header {
    position: sticky;
    top: 0;
    left: 0;
    background: #fff;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 1px solid #5180d8;
      z-index: 1;
    }
    tr:first-child th {
      border-right: 1px solid #5180d8;
      border-left: 1px solid #5180d8;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-top: 1px solid #5180d8;
        border-bottom: 1px solid #5180d8;
        z-index: 1;
      }

      input {
        position: relative;
        z-index: 999;
      }
    }

    tr:last-child td {
      border-top: none;
      border-bottom: none;
      input {
        position: relative;
        z-index: 999;
      }
    }
  }
  .table-body {
    overflow: auto;
    tr:first-child td {
      border-top: none;
    }
  }
  th {
    line-height: 23px;
    margin-top: 1px;
    margin-bottom: 1px;
    text-align: center;
    vertical-align: middle;
    background-color: #eff3ff;
    &.th-0 {
      width: 40px;
    }
  }
  td {
    line-height: 23px;
    border: 1px solid #5180d8;
    text-align: center;
    input[type='text'] {
      padding: 2px;
      border: 1px solid #aaa;
      height: 20px;
      width: 100%;
    }
  }
}
.text-page-name {
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-right-fill {
  font-size: 12px;
  margin-right: 4px;
  color: #439add;
  cursor: pointer;
}
.is-children {
  text-align: left !important;
  padding-left: 20px;
}
.dashboard-button {
  cursor: pointer;
  text-decoration: underline;
}
</style>
