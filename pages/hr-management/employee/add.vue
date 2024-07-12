<template>
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
    <AddEmployeeInfo
      v-show="activeTabMenu === 'employeeBaseInfo'"
      @validation-errors="(data) => (listErrorMessage = data)"
    />
    <EmployeeMove
      v-show="activeTabMenu === 'employeeMove'"
      @validation-errors="(data) => (listErrorMessage = data)"
    />
  </div>
</template>
<script>
import TabBar from '@/components/UI/TabBar.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import AddEmployeeInfo from '~/components/HrManagement/Employee/AddEmployeeInfo.vue'
import EmployeeMove from '~/components/HrManagement/Employee/EmployeeMove.vue'
export default {
  components: { TabBar, AddEmployeeInfo, EmployeeMove, BaseValidateMessage },
  middleware: ['authenticated'],
  data() {
    return {
      listErrorMessage: [],
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
    }
  },
  methods: {
    changeTab(key) {
      this.activeTabMenu = key
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
  min-height: 250px;
}
</style>
