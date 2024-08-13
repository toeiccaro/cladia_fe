<template>
  <div class="add-enterprise-page">
    <div class="enterprise__wrapper">
      <h1>Pay</h1>
    </div>
  </div>
</template>
<script>
import TabBar from '@/components/UI/TabBar.vue';
import AddEnterprise from '@/components/MasterData/EnterpriseMaster/AddEnterprise.vue';
import BaseValidateMessage from '@/components/UI/BaseValidateMessage';
import BusinessCard from '~/components/MasterData/EnterpriseMaster/BusinessCard.vue';
import EnterpriseRecord from '~/components/MasterData/EnterpriseMaster/EnterpriseRecord.vue';
export default {
  components: {
    TabBar,
    AddEnterprise,
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
      listErrorMessage: [],
    };
  },

  methods: {
    changeTab(key) {
      this.activeTabMenu = key;
    },
  },
};
</script>
<style lang="scss" scoped>
.add-enterprise-page {
  background: #ffffff 50% bottom repeat-x;
  color: #222222;
  position: relative;
  padding-top: 1px;
  zoom: 1;
  font-family: Lucida Grande, Lucida Sans, Arial, sans-serif;
  font-size: 1.1em;
}
.enterprise__wrapper {
  max-height: fit-content;
  border: 1px solid #5180d8;
  padding: 4px 4px 16px 4px;
  min-height: 250px;
}
.enterprise__tabPanel {
  padding: 0.5rem 0.4rem 1rem 0.4rem;
}
</style>
