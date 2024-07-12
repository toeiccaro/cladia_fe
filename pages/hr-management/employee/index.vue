<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableEmployee
      ref="tableEmployeeMaster"
      :label-mapping="labelMapping"
      @handleDetailId="handleDetailId"
      @changeLayout="changeLayout"
    />
    <BaseSetColumn
      ref="modalSetEmployeeColumn"
      :label-mapping="labelMapping"
      @reloadSet="reloadSet"
    ></BaseSetColumn>
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
import { mapGetters } from 'vuex'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar.vue'
import TableEmployee from '@/components/HrManagement/Employee/TableEmployee.vue'
import api from '@/api/api'
import { downloadFileExcel } from '@/utils/utils'
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue'

export default {
  components: { ToolBar, TableEmployee, BaseSetColumn },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'addEmployeeMaster',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'editEmployeeMaster',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
        },
        {
          key: 'refreshEmployeeMaster',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'exportEmployeeMaster',
          label: this.$t('btn_btnExport_0'),
          icon: '/images/export.png',
          type: 'menu',
          items: [
            {
              text: 'btn_btnPaged_0',
              action: () => this.exportByPage(),
            },

            {
              text: 'btn_btnFiltered_0',
              action: () => this.exportAll(),
            },
          ],
        },

        {
          key: 'setEmployeeMaster',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'saveLayout',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'closeEmployeeMaster',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      currentId: '',
      loading: false,
      exportSize: 30,
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getPayloadEmployee: 'filterSort/getPayloadEmployee',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'addEmployeeMaster':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'editEmployeeMaster':
            item.disabled = !this.activeButtonToolBar?.isEdit
            break
          case 'exportEmployeeMaster':
            item.disabled = !this.activeButtonToolBar?.isExport
            break
          default:
            break
        }
        return item
      })
    },
    labelMapping() {
      return {
        EmployeeCode: this.$t('lbl_EmployeeCode_0'),
        EmployeeName: this.$t('lbl_EmployeeName_0'),
        Sex: this.$t('lbl_Sex_0'),
        EmployeeNO: this.$t('lbl_EmployeeNO_0'),
        Department:
          this.lang === 'japanese'
            ? this.$t('lbl_DepartType_0')
            : this.$t('lbl_Department_0'),
        Post: this.$t('lbl_Post_0'),
        State: this.$t('lbl_State_0'),
        Age: this.$t('lbl_Age_0'),
        IDCard: this.$t('lbl_IDCard_0'),
        Tel: this.$t('lbl_Tel_0'),
        Address: this.$t('lbl_Address_0'),
        Born: this.$t('lbl_Born_0'),
        EntryDate: this.$t('lbl_EntryDate_0'),
        EnterDate: this.$t('lbl_EnterDate_0'),
        Marital: this.$t('lbl_Marital_0'),
        Hostel: this.$t('lbl_Hostel_0'),
        LeaveDate: this.$t('lbl_LeaveDate_0'),
        LeaveReason: this.$t('lbl_LeaveReason_0'),
        PayType: this.$t('lbl_PayType_0'),
        Degree: this.$t('lbl_DegreeID_0'),
        BornPlace: this.$t('lbl_BornPlace_0'),
        Nation: this.$t('lbl_NationID_0'),
        PartyAffiliation: this.$t('lbl_PartyAffiliation_0'),
        EditUser: this.$t('lbl_EditUser_0'),
        EditDate: this.$t('lbl_EditDate_0'),
        Email: this.$t('lbl_Email_0'),
        JapaneseName: this.$t('lbl_JapaneseName_0'),
      }
    },
  },
  watch: {
    'dataLayout.headerData': {
      immediate: true,
      deep: true,
      handler(val) {
        this.listColumnChange = []
        this.dataLayout?.headerData?.forEach((item, index) => {
          this.listDataColumn.forEach((_el) => {
            if (item.fieldName === _el.fieldName) {
              this.listColumnChange.push({
                fieldWide: item.width.toString(),
                fieldName: item.fieldName,
                id: _el.id,
                fieldOrder: index - 1,
                gridName: _el.gridName,
                hidden: _el.hidden,
                loginId: _el.loginId,
              })
            }
          })
        })
      },
    },
  },
  methods: {
    exportByPage() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (confirm) {
        const payload = this.getPayloadEmployee
        payload.exportAll = false

        this.handleExportExcel(payload)
      }
    },
    exportAll() {
      const confirm = window.confirm(this.$t('msg_ConfirmExport_0'))
      if (confirm) {
        const sortFilter = JSON.parse(JSON.stringify(this.getPayloadEmployee))
        delete sortFilter.pageNo
        delete sortFilter.pageSize
        const payload = {
          ...sortFilter,
          exportAll: true,
        }
        this.handleExportExcel(payload)
      }
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data
      this.listDataColumn = listDataColumn
    },
    async handleSaveLayout() {
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        await api('updateColumn', this.listColumnChange)
        this.$refs.tableEmployeeMaster.refresh()
      }
    },
    changeActiveToolBar(key) {
      if (key === 'addEmployeeMaster') {
        return this.$router.push(
          this.localePath({ path: '/hr-management/employee/add' })
        )
      }
      if (key === 'editEmployeeMaster') {
        this.currentId &&
          this.$router.push({
            path: `/${this.$i18n.locale}/hr-management/employee/detail?employeeCode=${this.currentId}`,
          })
        return
      }
      if (key === 'exportEmployeeMaster') {
        return this.handleExportExcel()
      }
      if (key === 'setEmployeeMaster') {
        this.$refs.modalSetEmployeeColumn.showModal = true
        return
      }
      if (key === 'refreshEmployeeMaster') {
        return location.reload()
      }
      if (key === 'closeEmployeeMaster') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'saveLayout') {
        return this.handleSaveLayout()
      }
    },
    handleDetailId(data) {
      this.currentId = data
    },
    async handleExportExcel(payload) {
      this.loading = true
      const response = await api('exportExcelEmployee', payload)
      if (response?.status === SERVER_RESPONSE_CODE.OK && response?.data) {
        downloadFileExcel(response.data)
      }
      this.loading = false
    },
    async reloadSet() {
      await this.$refs.tableEmployeeMaster.refresh()
    },
  },
}
</script>
