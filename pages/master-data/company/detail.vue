<template>
  <div>
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <ToolBar
      :list-tools="listToolBars"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <DetailPage
      ref="companyDetail"
      @validation-errors="(data) => (listErrorMessage = data)"
    />
  </div>
</template>
<script>
import ToolBar from '@/components/UI/ToolBar.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import DetailPage from '@/components/MasterData/CompanyData/DetailCompany.vue'
export default {
  components: { ToolBar, DetailPage, BaseValidateMessage },
  middleware: ['authenticated'],
  data() {
    return {
      listErrorMessage: [],
      listToolBars: [
        {
          key: 'saveDetailCompany',
          label: this.$t('btn_btnSave_0'),
          icon: '/images/save.png',
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'backDetailCompany',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },
        {
          key: 'closeDetailCompany',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
    }
  },
  computed: {
    canEditPage() {
      return this.activeButtonToolBar && this.activeButtonToolBar.isEdit
    },
  },
  methods: {
    changeActiveToolBar(key) {
      if (key === 'saveDetailCompany') {
        return this.$refs.companyDetail.saveData()
      }
      if (key === 'backDetailCompany') {
        return this.$router.push(
          this.localePath({ path: '/master-data/company' })
        )
      }
      if (key === 'closeDetailCompany') {
        return this.$router.push(this.localePath({ path: '/' }))
      }
      if (key === 'refresh') {
        return location.reload()
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
