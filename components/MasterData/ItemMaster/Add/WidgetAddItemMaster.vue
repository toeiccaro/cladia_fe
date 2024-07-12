<template>
  <div class="view-widget">
    <BaseValidateMessage
      :is-error="true"
      :list-error-message="listErrorMessage"
    ></BaseValidateMessage>
    <TabBar
      :list-menu="listMenu"
      :value="activeTabMenu"
      @changeTab="changeTab"
    ></TabBar>
    <div v-show="activeTabMenu === 'add'">
      <AddItemMaster
        @updateData="updateDataDetail"
        @validation-errors="(data) => (listErrorMessage = data)"
      />
    </div>
    <div v-show="activeTabMenu === 'picture'">
      <PictureItemMaster :params-detail-item-master="dataDetailItemMaster" />
    </div>
    <div v-show="activeTabMenu === 'record'">
      <RecordItemMaster
        :data="dataRecord"
        @validation-errors="(data) => (listErrorMessage = data)"
      />
    </div>
    <div v-show="activeTabMenu === 'manufacturing'">
      <TabManufacturing
        :data-item-master="dataDetailItemMaster"
        @validation-errors="(data) => (listErrorMessage = data)"
      />
    </div>
    <div v-show="activeTabMenu === 'inspection'">
      <TabInspection
        :data-item-master="dataDetailItemMaster"
        @validation-errors="(data) => (listErrorMessage = data)"
      />
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import AddItemMaster from '@/components/MasterData/ItemMaster/Add/AddItemMaster'
import PictureItemMaster from '@/components/MasterData/ItemMaster/PictureItemMaster'
import RecordItemMaster from '@/components/MasterData/ItemMaster/RecordItemMaster'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import TabBar from '@/components/UI/TabBar'
import TabManufacturing from '@/components/MasterData/ItemMaster/Manufacturing/TabManufacturing.vue'
import TabInspection from '@/components/MasterData/ItemMaster/Inspection/TabInspection.vue'

export default {
  components: {
    TabBar,
    AddItemMaster,
    PictureItemMaster,
    RecordItemMaster,
    BaseValidateMessage,
    TabManufacturing,
    TabInspection,
  },

  data() {
    return {
      listErrorMessage: [],
      listMenu: [
        {
          key: 'add',
          label: this.$t('lbl_BaseData_ItemMaster_0'),
        },
        {
          key: 'picture',
          label: this.$t('lbl_ItemPic_0'),
        },
        {
          key: 'record',
          label: this.$t('lbl_Record_0'),
        },
        {
          key: 'manufacturing',
          label: this.$t('lbl_Manufacturing_Information_0'),
        },
        {
          key: 'inspection',
          label: this.$t('lbl_Inspection_Information_0'),
        },
      ],
      activeTabMenu: 'add',
      dataDetailItemMaster: {},
      dataRecord: [],
      lang: this.$i18n.locale,
    }
  },
  computed: {
    ...mapGetters('base', {
      listBox: 'getListBox',
    }),
    listBoxTypes() {
      return this.listBox.map((item) => ({
        text: item.boxType,
        value: item.boxType,
      }))
    },
  },
  async created() {
    await this.getListBox(this.lang)
  },
  methods: {
    ...mapActions('base', ['getListBox']),
    updateDataDetail() {
      this.$emit('updateData')
    },
    changeTab(tabKey) {
      this.activeTabMenu = tabKey
    },
  },
}
</script>
<style lang="scss" scoped>
.view-widget {
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
