<template>
  <div class="table-user-wrapper">
    <div class="table-user">
      <ToolBar
        :list-tools="listToolBarsCheckAuthority"
        @changeActiveToolBar="changeActiveToolBar"
      ></ToolBar>
      <BaseTableDraggable
        :header="headerMapping"
        :data="dataTableMapping"
        :sort-key="sortKey"
        :is-ascending="isAscending"
        :disabled-filter="true"
        :is-disable-draggable="true"
        class="table-user--body"
        @sort="filterSort"
        @filter="filterSort"
        @row="handleDetailId"
      >
        <slot v-for="(item, index) in dataTable" :slot="`enable-${index}`">
          <div
            :key="`icon-attract${index}`"
            class="d-flex align-items-center justify-content-center h-100 w-100"
          >
            <b-form-checkbox disabled :checked="item.enable" />
          </div>
        </slot>
      </BaseTableDraggable>
      <BasePagination
        :total="total"
        :per-page="perPage"
        :current-page="currentPage"
        :number-item="dataTable.length"
        class="table-user--footer"
        @changePage="(value) => setCurrentPage(value)"
        @changePerPage="(value) => changePerPage(value)"
      ></BasePagination>
      <BaseTableLoader v-if="loading" />
      <BaseConfirmDeleteModal
        :is-show="isShowConfirmDeleteModal"
        :pointer-event="modalPointerEvent"
        @cancel="isShowConfirmDeleteModal = false"
        @delete="deleteUser"
      />
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import ToolBar from '@/components/UI/ToolBar.vue'
import BasePagination from '@/components/UI/BasePagination.vue'
import { SERVER_RESPONSE_CODE } from '@/constants'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
import BaseTableDraggable from '~/components/UI/BaseTableDraggable.vue'
import BaseConfirmDeleteModal from '~/components/UI/BaseConfirmDeleteModal'
import userManageMixin from '~/mixins/userManage'
import dateTime from '~/mixins/dateTime'
import api from '~/api/api'

export default {
  components: {
    BasePagination,
    BaseTableDraggable,
    BaseTableLoader,
    ToolBar,
    BaseConfirmDeleteModal,
  },
  mixins: [dateTime, userManageMixin],
  data() {
    return {
      isShowConfirmDeleteModal: false,
      total: 0,
      currentPage: 1,
      perPage: 30,
      dataTable: [],
      sortKey: '',
      isAscending: false,
      loading: false,
      lang: this.$i18n.locale,
      currentRow: -1,
      modalPointerEvent: null,
      listToolBars: [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'edit',
          label: this.$t('btn_btnEdit_0'),
          icon: '/images/edit.png',
        },
        {
          key: 'delete',
          label: this.$t('btn_btnDel_0'),
          icon: '/images/delete.png',
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
    }
  },
  computed: {
    ...mapGetters('filterSort', ['getPayloadUserManage']),
    ...mapGetters('base', ['getActiveButtonToolBar']),
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'add':
            item.disabled = !this.getActiveButtonToolBar?.isEdit
            break
          case 'edit':
            item.disabled = !this.getActiveButtonToolBar?.isEdit
            break
          case 'delete':
            item.disabled = !this.getActiveButtonToolBar?.isDelete
            break
          default:
            break
        }
        return item
      })
    },
    dataTableMapping() {
      const alignCenterFields = [
        'EmployeeName',
        'UserGroupName',
        'Memo',
        'EditUser',
        'EditDate',
      ]

      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value: this.perPage * (this.currentPage - 1) + index + 1,
            align: 'center',
          },
          keyRow: item.loginID,
        }
        this.dataHeaderUser.forEach((headerItem, headerIndex) => {
          obj[headerItem.key] = {
            value: item[headerItem.key] || '',
          }

          if (headerItem.fieldName === 'Enable') {
            obj[headerItem.key].type = 'slot'
          }

          if (headerItem.fieldName === 'LoginName') {
            obj[headerItem.key].type = this.getActiveButtonToolBar?.isEdit
              ? 'link'
              : ''
            obj[
              headerItem.key
            ].link = `/${this.$i18n.locale}/system-maintenance/user-manage/detail?userID=${item.loginID}`
          }

          if (headerItem.fieldName === 'EditDate') {
            obj[headerItem.key].value = this.convertDate(item[headerItem.key])
          }

          if (alignCenterFields.includes(headerItem.fieldName)) {
            obj[headerItem.key].align = 'center'
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

      this.dataHeaderUser.forEach((item) => {
        const headerItem = {
          key: item.key,
          name: item.labelName,
          width: item.fieldWide * 1,
          fieldName: item.fieldName,
        }

        header.push(headerItem)
      })

      return header
    },
  },
  created() {
    this.getData()
  },
  methods: {
    ...mapMutations({
      SET_PAYLOAD_USER_MANAGE: 'filterSort/SET_PAYLOAD_USER_MANAGE',
    }),
    handleDetailId(data) {
      this.currentRow = data?.index
    },
    changeActiveToolBar(key, event) {
      switch (key) {
        case 'add':
          return this.$router.push({
            path: `/${this.$i18n.locale}/system-maintenance/user-manage/add`,
          })
        case 'edit':
          return this.handleEditButton()
        case 'refresh':
          return this.handleRefreshButton()
        case 'delete':
          return this.handleDeleteButton(event)
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          return null
      }
    },
    handleEditButton() {
      if (this.currentRow < 0) {
        return
      }

      const selectedItemId = this.dataTable[this.currentRow]?.loginID

      this.$router.push({
        path: `/${this.$i18n.locale}/system-maintenance/user-manage/detail?userID=${selectedItemId}`,
      })
    },

    handleRefreshButton() {
      location.reload()
    },

    handleDeleteButton(event) {
      if (this.currentRow < 0) {
        return
      }
      const selectedItemId = this.dataTable[this.currentRow]?.loginID
      const ADMIN = 1
      if (selectedItemId === ADMIN) {
        window.alert(this.$t('msg_AdminNotDelete_0'))
        return
      }
      this.modalPointerEvent = event
      this.isShowConfirmDeleteModal = true
    },
    async deleteUser() {
      try {
        this.loading = true
        const selectedItemId = this.dataTable[this.currentRow]?.loginID

        const payload = {
          loginID: selectedItemId,
        }
        const res = await api('deleteUser', payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          await this.getData()
          window.alert(this.$t('msg_calenderDeleteSuccess_0'))
          this.isShowConfirmDeleteModal = false
        }
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    async getData() {
      try {
        this.loading = true
        const params = {
          pageNo: this.currentPage,
          pageSize: this.perPage,
          localLanguage: this.$i18n.locale,
          searchType: 'Paged',
        }

        this.SET_PAYLOAD_USER_MANAGE(params)
        const res = await api('getUserManageList', this.getPayloadUserManage)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data?.tableContent?.content || []
          this.total = res.data?.tableContent?.totalElements || 0
        }
      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      } finally {
        this.loading = false
      }
    },
    changePerPage(value) {
      this.perPage = Number(value)
      this.currentPage = 1
      this.$store.commit('filterSort/UPDATE_PAYLOAD_USER_MANAGE', {
        pageSize: this.perPage,
        pageNo: 1,
      })
      this.getData()
    },
    setCurrentPage(value) {
      this.currentPage = Number(value)
      this.$store.commit('filterSort/UPDATE_PAYLOAD_USER_MANAGE', {
        pageNo: this.currentPage,
      })
      this.getData()
    },
    async filterSort({ sortParams, filterParams }, type) {
      try {
        this.sortKey = sortParams.sortKey
        this.isAscending = !sortParams.isAscending
        const finalFilterParams = {}
        const ACTION_FILTER = 'filter'
        if (type === ACTION_FILTER) {
          this.currentPage = 1
        }

        if (this.sortKey === 'enable') {
          this.sortKey = 'isEnable'
        }

        const finalSortParams = {
          pageNo: this.currentPage,
          pageSize: this.perPage,
          sortByColumn: this.sortKey,
          sortAscOrDesc: this.isAscending ? 'ASC' : 'DESC',
          localLanguage: this.$i18n.locale,
        }

        for (const property in filterParams) {
          if (filterParams[property]) {
            finalFilterParams[property] = filterParams[property]
          }
        }

        this.loading = true

        const payloadOptions = Object.assign(
          {},
          finalFilterParams,
          finalSortParams
        )
        this.SET_PAYLOAD_USER_MANAGE(payloadOptions)
        const res = await api('getUserManageList', this.getPayloadUserManage)

        this.loading = false
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
        if (validResponse) {
          this.dataTable = res.data?.tableContent?.content || []
          this.total = res.data?.totalElements || 0
        }
      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.table-user-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  .table-user {
    height: calc(100% - 70px);
    .table-user--body {
      height: calc(100% - 26px);
    }
    .table-user--footer {
      color: #000000;
      background: #eff3ff 50% 50% repeat-x;
      border: 1px solid #5180d8;
      border-top: 0;
    }
  }
}
</style>
