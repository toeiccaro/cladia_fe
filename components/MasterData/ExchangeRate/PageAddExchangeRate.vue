<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="handleAction"
    />
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <FormExchangeRate :data-form="form"></FormExchangeRate>
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
import FormExchangeRate from './FormExchangeRate.vue'
import ToolBar from '@/components/UI/ToolBar'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import api from '@/api/api'
import { SERVER_RESPONSE_CODE } from '@/constants'
import systemMixins from '@/mixins/system'

export default {
  components: { ToolBar, BaseValidateMessage, FormExchangeRate },
  mixins: [systemMixins],
  data() {
    return {
      listErrorMessage: [],
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
      defaultFormData: {
        rate: 0,
        effectiveDate: null,
        currencyMainId: 0,
      },
      form: {},
      loading: false,
    }
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      userInfo: 'getUserInfo',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'delete') {
          item.disabled = !this.activeButtonToolBar?.isDelete
        }
        return item
      })
    },
  },
  watch: {
    'userInfo.currencyID': {
      immediate: true,
      handler(currencyMainId) {
        this.makeDefaultFormData(currencyMainId)
      },
    },
  },
  methods: {
    makeDefaultFormData(currencyMainId = 0) {
      this.form = Object.assign({}, this.defaultFormData, {
        currencyMainId,
      })
    },

    async handleAction(key) {
      switch (key) {
        case 'add':
          return this.handleAdd()
        case 'save': {
          const response = await this.handleSave()
          if (response) {
            this.$router.push({
              path: `/${this.$i18n.locale}/master-data/exchange-rate/detail?rateID=${response.data.rateID}`,
            })
          }
          return
        }
        case 'newSave': {
          const isSaved = await this.handleSave()
          if (isSaved) {
            location.reload()
          }
          return
        }
        case 'delete':
          this.handleDelete()
          return
        case 'refresh':
          this.handleRefresh()
          return
        case 'back':
          return this.$router.push(
            this.localePath({ path: `/master-data/exchange-rate` })
          )
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          return null
      }
    },
    handleAdd() {
      const confirm = window.confirm(this.$t('msg_ConfirmContinue_0'))
      if (confirm) {
        location.reload()
      }
    },
    async handleSave() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return false
        }
        this.listErrorMessage = []

        const requiredFields = {
          currencyMainId: 'CurrencyMain',
          currencyChangeId: 'CurrencyChange',
          rate: 'Rate',
          effectiveDate: 'EffectiveDate',
        }
        for (const prop in requiredFields) {
          if (!this.form[prop]) {
            this.listErrorMessage.push({
              fieldName: this.$t(`lbl_${requiredFields[prop]}_0`),
              text: this.$t('msg_NoInput_0'),
            })
          }
        }
        const hasError = this.listErrorMessage.length > 0
        if (hasError) {
          return false
        }
        this.loading = true
        const formatNumberFields = ['rate']
        for (const key of formatNumberFields) {
          this.form[key] = this.parseStringToFloat(this.form[key]) || 0
        }
        const response = await api('addExchangeRate', this.form)

        if (response.status === SERVER_RESPONSE_CODE.OK) {
          this.form.rateID = response.data.rateID
          window.alert(this.$t('msg_IsSaved_0'))
          return response
        }
        return false
      } catch (error) {
      } finally {
        this.loading = false
      }
    },
    handleDelete() {
      const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
      if (confirm) {
        location.reload()
        window.alert(this.$t('msg_IsDeleted_0'))
      }
    },
    handleRefresh() {
      this.makeDefaultFormData(this.userInfo?.currencyID)
    },
  },
}
</script>
