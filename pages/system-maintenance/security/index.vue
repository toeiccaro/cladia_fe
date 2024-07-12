<template>
  <div class="security-page">
    <div class="header-security">
      <tool-bar
        :list-tools="listToolBarsCheckAuthority"
        @changeActiveToolBar="changeActiveToolBar"
      ></tool-bar>
      <div class="user-grid">
        <span>{{ $t('lbl_UserGroupName_0') }}</span>
        <b-form-select
          :value="payloadSystemConfigSecurity.userGroupID"
          :options="listUserGroupOptions"
          class="select"
          @change="
            (event) => onChangeSelect({ path: 'userGroupID', data: event })
          "
        />

        <span>{{ $t('lbl_EmployeeName_0') }}</span>
        <b-form-select
          :value="payloadSystemConfigSecurity.loginID"
          :options="employeeOptions"
          class="select"
          @change="(event) => onChangeSelect({ path: 'loginID', data: event })"
        />
      </div>
    </div>
    <TableSecurity
      ref="tableSecurity"
      :user-info="payloadSystemConfigSecurity"
      :list-data-config="listDataConfig"
      :user-role-i-d="userRoleID"
      class="body-security"
      @search="search"
      @getDashboardConfig="getListDataConfig"
    ></TableSecurity>

    <BaseLoading v-if="loading" />
  </div>
</template>
<script>
import { mapActions, mapMutations, mapGetters } from 'vuex'
import api from '@/api/api'
import ToolBar from '@/components/UI/ToolBar.vue'
import { SERVER_RESPONSE_CODE } from '@/constants'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'
import TableSecurity from '~/components/System-Setting/Security/TableSecurity.vue'
import { S_RIGHT_ID_DASHBOARD } from '~/constants'

export default {
  components: { ToolBar, TableSecurity, BaseLoading },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      loading: false,
      language: this.$i18n.locale,
      employees: [],
      listDataConfig: [],
    }
  },

  async fetch() {
    try {
      this.loading = true
      let params = {}
      if (this.$route.query?.userGroupID) {
        params = {
          userGroupID: Number(this.$route.query?.userGroupID),
          loginID: this.$route.query?.loginID,
        }
      } else {
        params = {
          userGroupID: 1,
          loginID: 0,
        }
      }
      this.$router.replace({ query: null })

      this.SET_PAYLOAD_SYSTEM_CONFIG_SECURITY(params)

      await Promise.all([
        this.getListUserInGroup(),
        this.getUserGroupOptionsFromAPI(this.language),
        this.getAllSecurity(),
      ])
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      userGroupOptions: 'base/getUserGroupOptions',
      payloadSystemConfigSecurity: 'filterSort/getPayloadSystemConfigSecurity',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'save') {
          item.disabled = !this.activeButtonToolBar?.isEdit
        }
        return item
      })
    },
    listUserGroupOptions() {
      const clonedUserGroupList = JSON.parse(
        JSON.stringify(this.userGroupOptions)
      )
      clonedUserGroupList.shift()
      return clonedUserGroupList
    },
    employeeOptions() {
      return this.employees.map((item) => ({
        text: item.employeeName,
        value: item.loginID,
        userRoleID: item.userRoleID,
      }))
    },
    userRoleID() {
      return this.employeeOptions?.find(
        (item) =>
          item.value === Number(this.payloadSystemConfigSecurity.loginID)
      )?.userRoleID
    },
  },

  watch: {
    'payloadSystemConfigSecurity.userGroupID': {
      handler() {
        this.UPDATE_PAYLOAD_SYSTEM_CONFIG_SECURITY({
          ...this.payloadSystemConfigSecurity,
          loginID: 0,
        })
      },
    },
  },

  methods: {
    ...mapActions({
      getUserGroupOptionsFromAPI: 'base/getUserGroupOptionsFromAPI',
    }),
    ...mapMutations({
      SET_LIST_DATA_SECURITY: 'system-setting/SET_LIST_DATA_SECURITY',
      SET_USER_GROUP_ID: 'system-setting/SET_USER_GROUP_ID',
      UPDATE_PAYLOAD_SYSTEM_CONFIG_SECURITY:
        'filterSort/UPDATE_PAYLOAD_SYSTEM_CONFIG_SECURITY',
      SET_PAYLOAD_SYSTEM_CONFIG_SECURITY:
        'filterSort/SET_PAYLOAD_SYSTEM_CONFIG_SECURITY',
    }),
    async getListUserInGroup() {
      const response = await api(
        'getUserInGroup',
        this.payloadSystemConfigSecurity.userGroupID
      )

      const validUserInGroupRes =
        response && response.status === SERVER_RESPONSE_CODE.OK

      if (validUserInGroupRes) {
        this.employees = response.data
      }
    },

    async onChangeSelect({ path, data }) {
      try {
        this.loading = true

        this.UPDATE_PAYLOAD_SYSTEM_CONFIG_SECURITY({
          [path]: data,
          pageName: '',
        })
        this.$refs.tableSecurity.textPageNameSearch = ''
        await Promise.all([this.getListUserInGroup(), this.getAllSecurity()])
        this.resetTableHeaderCheckboxes()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    changeActiveToolBar(key) {
      switch (key) {
        case 'refresh':
          return location.reload()
        case 'save':
          return this.handleSaveSecurity()
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          return null
      }
    },
    async handleSaveSecurity() {
      try {
        const EMPTY = 0
        const userRoleId = this.userRoleID ?? EMPTY

        if (userRoleId === EMPTY) {
          window.alert(this.$t('msg_AuthorizationsDefault_0'))
        } else {
          const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
          if (!confirm) {
            return
          }
        }

        const listSecurityChange =
          this.$refs.tableSecurity?.listSecurityChange.length > 0
            ? this.$refs.tableSecurity?.listSecurityChange
            : this.$refs?.tableSecurity?.listDataSecurity
        const payload = {
          userGroupId: this.payloadSystemConfigSecurity.userGroupID,
          userRoleId,
          securityDetails: listSecurityChange,
        }
        this.loading = true
        const response = await api('updateSecurityByUserGroup', payload)

        const validResponse = response && response.status === 200
        if (validResponse) {
          window.alert(this.$t('msg_IsSaved_0'))
          await this.getAllSecurity()
          this.checkIsDashboard(listSecurityChange)
          await this.getListDataConfig()
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    checkIsDashboard(listSecurityChange) {
      const dashboardPage = listSecurityChange.find(
        (item) => item.srightId === S_RIGHT_ID_DASHBOARD
      )
      if (dashboardPage) {
        this.updateListDataConfig(dashboardPage?.isRun)
      }
    },
    async getListDataConfig() {
      const params = {
        groupId: this.payloadSystemConfigSecurity?.userGroupID,
        userRoleId: this.userRoleID ?? 0,
      }
      try {
        const response = await api('getDashboardConfig', params)
        if (response.status === 200) {
          this.listDataConfig = response.data
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    async getAllSecurity(action) {
      try {
        const response = await api(
          'getAllSecurityHome',
          this.payloadSystemConfigSecurity
        )

        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK

        if (validResponse) {
          const dataReplace = this.replaceDataWithRowCheckStatus(response.data)
          const finalData = action === 'search' ? response.data : dataReplace
          this.SET_LIST_DATA_SECURITY(finalData)
        }
      } catch (error) {
        console.error(error)
      }
    },
    replaceDataWithRowCheckStatus(responseData = []) {
      const oldSecurityData = this.$refs.tableSecurity.listDataSecurity
      const finalData = responseData

      for (const securityItem of finalData) {
        const foundItem = oldSecurityData?.find(
          (item) => item.srightId === securityItem?.srightId
        )

        if (!foundItem) {
          continue
        }

        securityItem.isCheckedRow = !!foundItem?.isCheckedRow

        for (const childItem of securityItem?.childs) {
          const foundChildItem = foundItem.childs?.find(
            (item) => item?.srightId === childItem?.srightId
          )

          if (!foundItem) {
            continue
          }

          childItem.isCheckedRow = !!foundChildItem?.isCheckedRow
        }
      }

      return finalData
    },
    async search() {
      try {
        this.loading = true

        await this.getAllSecurity('search')
        this.resetTableHeaderCheckboxes()
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    resetTableCheckboxes() {
      this.$refs.tableSecurity.checkAllTable({
        isChecked: false,
        isExcludeCheckAllBox: false,
      })
    },
    resetTableHeaderCheckboxes() {
      this.$refs.tableSecurity.checkAllTableHeader({
        isChecked: false,
        isExcludeCheckAllBox: false,
      })
      this.$refs.tableSecurity.listSecurityChange = []
    },
    async updateListDataConfig(isShowItem) {
      const dataDetails = this.listDataConfig.map((item) => {
        return {
          isShow: isShowItem,
          pageID: item.id,
        }
      })
      const payload = {
        detail: [...dataDetails],
        groupID: this.payloadSystemConfigSecurity?.userGroupID,
        userRoleID: this.userRoleID,
      }
      try {
        this.loading = true
        await api('updateDashboardConfig', payload)
      } catch (error) {
        throw new Error(error)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.user-grid {
  margin-bottom: 5px;
  padding-top: 5px;
  padding-bottom: 5px;
  text-indent: 20px;
  border: 1px solid #5180d8;
  display: flex;
  .select {
    margin-left: 4px;
    height: 20px;
    font-size: 12px;
    border: 1px solid #aaa;
    background-color: #fff;
    border-radius: 2px;
    padding: 0px 2px !important;
    width: 250px;
  }
}

.security-page {
  display: flex;
  flex-direction: column;

  .header-security {
    z-index: 100;
    background: #fff;
    width: 100%;
  }
  .body-security {
    position: relative;
    overflow: auto;
  }
}
</style>
