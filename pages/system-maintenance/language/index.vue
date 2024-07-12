<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TableLanguageV2 ref="tableLanguage" @enter="handleSaveEnter"></TableLanguageV2>
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
import axios from 'axios'
import ToolBar from '@/components/UI/ToolBar'
import TableLanguageV2 from '~/components/System-Setting/Language/TableLanguageV2.vue'
import api from '~/api/api'
import { SERVER_RESPONSE_CODE } from '~/constants'
export default {
  components: { ToolBar, TableLanguageV2 },
  data() {
    return {
      loading: false,
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
          key: 'setLanguage',
          label: this.$t('btn_btnSetLanguage_0'),
          icon: '/images/set.png',
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
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
      getListTextChange: 'system-setting/getListTextChange',
    }),

    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        if (item.key === 'save' || item.key === 'setLanguage') {
          item.disabled = !this.activeButtonToolBar?.isEdit
        }
        return item
      })
    },
  },
  methods: {
    changeActiveToolBar(key) {
      switch (key) {
        case 'save':
          return this.handleButtonSave()
        case 'refresh':
          return location.reload()
        case 'setLanguage':
          return this.$router.push({
            path: `/${this.$i18n.locale}/system-maintenance/language/set-language`,
          })
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          break
      }
    },
    async handleButtonSave() {
      try {
        this.loading = true
        const response = await api('updateTextLanguage', this.getListTextChange)
        if (response && response.status === SERVER_RESPONSE_CODE.OK) {
          window.alert(this.$t('msg_IsSaved_0'))
          await axios.get(`${process.env.BASE_URL}i18n/${this.$i18n.locale}`)
          this.$refs.tableLanguage.getAllTextLanguages()  
        }
      } catch (error) {
      } finally {
        this.loading = false
      }
    },
    async handleSaveEnter() {
      await api('updateTextLanguage', this.getListTextChange)
      location.reload()
    },
  },
}
</script>
<style lang="scss" scoped></style>
