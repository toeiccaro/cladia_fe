<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormEmailSet ref="addEmailSetForm" :data="emailSetData" />
    <BaseTableLoader v-if="loading" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import api from '@/api/api'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar'
import FormEmailSet from '@/components/MasterData/EmailSet/FormEmailSet'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import BaseTableLoader from '@/components/loaders/BaseTableLoader'
export default {
  name: 'PageAddUser',
  components: {
    FormEmailSet,
    ToolBar,
    BaseTableLoader,
    BaseValidateMessage,
  },
  data() {
    return {
      isNewSave: false,
      emailSetData: {},
      listToolBars: [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'newSave',
          label: this.$t('btn_btnNewSave_0'),
          icon: '/images/new_save.png',
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
          key: 'back',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },

        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      loading: false,
      listErrorMessage: [],
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    try {
      this.loading = true
      const { employeeID, moduleID } = this.$route.query

      const payload = {
        employeeID,
        moduleID,
      }
      const res = await api('getByEmployeeIdAndModuleId', payload)

      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        this.emailSetData = res.data || {}
      }
    } catch (err) {
      console.error(err)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'delete') {
          item.disabled = !this.getActiveButtonToolBar?.isDelete
        }
        return item
      })
    },
  },
  methods: {
    changeActiveToolBar(key) {
      switch (key) {
        case 'add':
          return this.handleAdd()
        case 'save':
          return this.handleSave()
        case 'delete':
          return this.handleDelete()
        case 'newSave':
          return this.handleNewSave()
        case 'refresh':
          return this.handleRefresh()
        case 'back':
          return this.$router.go(-1)
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          break
      }
    },

    resetFormData() {
      this.emailSetData = {}
    },

    handleDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (!confirm) {
        return
      }

      this.resetFormData()
    },

    handleRefresh() {
      this.$fetch()
    },

    handleNewSave() {
      this.isNewSave = true
      this.handleSave()
    },

    async handleSave() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        this.loading = true
        this.listErrorMessage = []

        const payload = this.emailSetData || {}

        const requiredFields = {
          employeeID: 'EmployeeName',
          moduleID: 'ModuleName',
        }
        for (const prop in requiredFields) {
          if (!payload[prop]) {
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
              text: this.$t('msg_NoInput_0'),
            })
          }
        }

        const hasError = this.listErrorMessage.length
        if (hasError) {
          return
        }

        const endpoint = this.isNewSave ? 'createBEmailSet' : 'updateBEmailSet'

        const response = await api(endpoint, payload)
        const validResponse =
          response && response.status === SERVER_RESPONSE_CODE.OK

        if (validResponse) {
          window.alert(this.$t('msg_IsSaved_0'))
          if (this.isNewSave) {
            return this.redirectToAddPage(response.data)
          }

          return this.redirectToDetailPage(response.data)
        }

        if (this.isNewSave) {
          window.alert(this.$t('msg_IsSaved_0'))
          return this.redirectToAddPage(payload)
        }

        window.alert(response?.message)
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
        this.isNewSave = false
      }
    },

    redirectToAddPage(payload) {
      this.$router.push(
        this.localePath(
          `/master-data/email-set/add?moduleID=${payload.moduleID}`
        )
      )
    },

    redirectToDetailPage(payload) {
      this.$router.push(
        this.localePath(
          `/master-data/email-set/detail?employeeID=${payload.employeeID}&moduleID=${payload.moduleID}`
        )
      )
    },

    handleAdd() {
      this.resetFormData()
      this.$router.push(this.localePath('/master-data/email-set/add'))
    },
  },
}
</script>
