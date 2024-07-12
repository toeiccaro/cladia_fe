<template>
  <div>
    <div class="add-employee-page">
      <BaseValidateMessage
        :is-error="true"
        :list-error-message="listErrorMessage"
      />
      <TabBar
        :list-menu="listMenus"
        :value="activeTabMenu"
        @changeTab="changeTab"
      ></TabBar>
      <div v-show="activeTabMenu === 'employeeBaseInfo'">
        <DetailEmployeeInfo
          :record-item="recordItem"
          @updateData="getData"
          @validation-errors="(data) => (listErrorMessage = data)"
        />
      </div>
      <div v-show="activeTabMenu === 'employeeMove'">
        <EmployeeMove
          edit
          :data="employeeMove"
          @changeData="getDataEmployeeMove"
          @validation-errors="(data) => (listErrorMessage = data)"
        />
      </div>
    </div>
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
import { SERVER_RESPONSE_CODE } from '@/constants'
import api from '@/api/api'
import TabBar from '@/components/UI/TabBar.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import DetailEmployeeInfo from '~/components/HrManagement/Employee/DetailEmployeeInfo.vue'
import EmployeeMove from '~/components/HrManagement/Employee/EmployeeMove.vue'
export default {
  components: { TabBar, DetailEmployeeInfo, EmployeeMove, BaseValidateMessage },
  middleware: ['authenticated'],
  data() {
    return {
      activeTabMenu: 'employeeBaseInfo',
      listMenus: [
        {
          key: 'employeeBaseInfo',
          label: this.$t('lbl_EmployeeBaseInfo_0'),
        },
        {
          key: 'employeeMove',
          label: this.$t('lbl_EmployeeMove_0'),
        },
      ],
      employeeMove: [],
      recordItem: {},
      loading: false,
      listErrorMessage: [],
    }
  },
  async created() {
    await this.getData()
    await this.getDataEmployeeMove()
  },
  methods: {
    changeTab(key) {
      this.activeTabMenu = key
    },
    async getData() {
      this.loading = true
      const res = await api(
        'getEmployeeMasterDetail',
        this.$route.query?.employeeCode
      )
      this.loading = false
      this.recordItem = res?.data
    },
    async getDataEmployeeMove() {
      this.loading = true
      const res = await api('getEmployeeMove', {
        employeeIdOptional: this.$route.query?.employeeCode,
      })
      this.loading = false
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.employeeMove = res.data
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.add-employee-page {
  border: 1px solid #5180d8;
  background: #ffffff 50% bottom repeat-x;
  color: #222222;
  position: relative;
  padding: 0.2em;
  zoom: 1;
  font-family: Lucida Grande, Lucida Sans, Arial, sans-serif;
  font-size: 1.1em;
}
</style>
