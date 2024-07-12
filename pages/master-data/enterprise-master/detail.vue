<template>
  <div>
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    />
    <div class="add-enterprise-page">
      <TabBar
        :list-menu="listMenus"
        :value="activeTabMenu"
        @changeTab="changeTab"
      ></TabBar>
      <div v-show="activeTabMenu === 'enterpriseMaster'">
        <DetailEnterpriseItem
          :record-item="recordItem"
          @updateData="getData"
          @validateMessage="validateMessage"
        />
      </div>
      <div v-show="activeTabMenu === 'businessCards'">
        <BusinessCard :data="recordItem.cards || []" />
      </div>
      <div v-show="activeTabMenu === 'record'">
        <EnterpriseRecord
          :data="recordItem"
          @changeData="getData"
          @validation-errors="(data) => (listErrorMessage = data)"
        ></EnterpriseRecord>
      </div>
    </div>
  </div>
</template>
<script>
import TabBar from '@/components/UI/TabBar.vue'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import DetailEnterpriseItem from '@/components/MasterData/EnterpriseMaster/DetailEnterpriseItem.vue'
import api from '@/api/api'
import BusinessCard from '~/components/MasterData/EnterpriseMaster/BusinessCard.vue'
import EnterpriseRecord from '~/components/MasterData/EnterpriseMaster/EnterpriseRecord.vue'
import { formatNumberWithCommas } from '~/utils/utils'
export default {
  components: {
    TabBar,
    DetailEnterpriseItem,
    BusinessCard,
    EnterpriseRecord,
    BaseValidateMessage,
  },
  middleware: ['authenticated'],
  data() {
    return {
      activeTabMenu: 'enterpriseMaster',
      listMenus: [
        {
          key: 'enterpriseMaster',
          label: this.$t('lbl_BaseData_Enterprise_0'),
        },
        {
          key: 'businessCards',
          label: this.$t('lbl_EnterpriseCards_0'),
        },
        {
          key: 'record',
          label: this.$t('lbl_Record_0'),
        },
      ],
      recordItem: {},
      listErrorMessage: [],
    }
  },

  created() {
    this.getData()
  },
  methods: {
    changeTab(key) {
      this.activeTabMenu = key
    },
    async getData() {
      const res = await api(
        'getEnterpriseMasterById',
        this.$route.query?.companyCode
      )
      this.recordItem = res?.data

      const formatNumberFields = ['payPeriod', 'settleDate']
      for (const key of formatNumberFields) {
        this.recordItem[key] = formatNumberWithCommas(res.data[key]) || 0
      }
    },
    validateMessage(listErrorMessage) {
      this.listErrorMessage = listErrorMessage
    },
  },
}
</script>
<style lang="scss" scoped>
.add-enterprise-page {
  border: 1px solid #5180d8;
  background: #ffffff 50% bottom repeat-x;
  color: #222222;
  position: relative;
  padding: 0.2em;
  zoom: 1;
  font-size: 1.1em;
}
</style>
