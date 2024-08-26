<template>
  <div class="add-item-page">
    <ToolBar :list-tools="listToolBars" @changeActiveToolBar="handleAction" />

    <FormInspection
      ref="formInspection"
      :default-form="form"
      :data-item-master="dataItemMaster"
    ></FormInspection>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import FormInspection from './FormInspection.vue'
import { SERVER_RESPONSE_CODE } from '@/constants'
import ToolBar from '@/components/UI/ToolBar.vue'
import api from '@/api/api'
export default {
  components: { ToolBar, FormInspection },
  props: {
    dataItemMaster: {
      type: Object,
      default: () => {},
    },
    dataInspection: {
      type: Object,
      default: () => {},
    },
  },
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
      defaultForm: {
        productLT: 0,
        safetyLT: 0,
        numberField9: 0,
        numberField10: 0,
        numberField11: 0,
        numberField12: 0,
        numberField13: 0,
        numberField14: 0,
        numberField15: 0,
        numberField16: 0,
        inspectionType: 1,
      },
      form: {},
      listErrorMessage: [],
    }
  },
  fetch() {
    if (this.dataInspection) {
      this.form = Object.assign({}, this.dataInspection)
    } else this.form = Object.assign({}, this.defaultForm)
  },
  computed: {
    ...mapGetters('base', ['getActiveButtonToolBar']),
  },
  watch: {
    dataInspection: {
      handler(val) {
        this.form = Object.assign({}, this.dataInspection)
      },
    },
  },
  methods: {
    ...mapMutations({
      setLoading: 'base/SET_LOADING',
    }),
    handleAction(key) {
      if (key === 'save') {
        return this.handleSaveInspectionInformation()
      }
      if (key === 'back') {
        return this.$router.push(
          this.localePath({
            path: `/${this.$i18n.locale}/master-data/item-master`,
          })
        )
      }
      if (key === 'refresh') {
        return this.handleRefresh()
      }
      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
    },
    validateForm() {
      this.listErrorMessage = []
      if (!this.$route.query?.itemCode) {
        this.listErrorMessage.push({
          fieldName: this.$t(`lbl_ItemCode_0`),
          text: this.$t('msg_NoInput_0'),
        })
      }
      this.$emit('validation-errors', this.listErrorMessage)

      const hasError = this.listErrorMessage.length > 0
      if (hasError) {
        return false
      }
    },
    async handleRefresh() {
      await this.$fetch()
    },
    async handleSaveInspectionInformation() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
        if (!confirm) {
          return
        }

        const payload = {
          ...this.form,
          itemId: this.$route.query?.itemCode,
        }
        this.validateForm()
        this.setLoading(true)
        const response = await api('saveInspectionInformation', payload)
        const errorCode = response?.data?.response?.status

        if (errorCode === SERVER_RESPONSE_CODE.FORBIDDEN) {
          window.alert(this.$t(response?.data?.response?.data?.message))
          return
        }
        window.alert(this.$t('msg_IsSaved_0'))
        this.$emit('get-data')
      } catch (err) {
        window.alert(err?.data?.response?.data?.message)
      } finally {
        this.setLoading(false)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.add-item-page {
  display: block;
  border-width: 0;
  padding: 1em 1.4em;
  background: none;
  color: #222222;
}
</style>
