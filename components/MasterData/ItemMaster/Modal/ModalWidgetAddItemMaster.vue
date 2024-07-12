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
      <ModalAddItemMaster
        :params-detail-item-master="dataDetailItemMaster"
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
        :add="checkHasRoute"
        @changeData="getDataRecord"
        @validation-errors="(data) => (listErrorMessage = data)"
      />
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import ModalAddItemMaster from '@/components/MasterData/ItemMaster/Modal/ModalAddItemMaster'
import PictureItemMaster from '@/components/MasterData/ItemMaster/PictureItemMaster'
import RecordItemMaster from '@/components/MasterData/ItemMaster/RecordItemMaster'
import api from '@/api/api'
import { SERVER_RESPONSE_CODE } from '@/constants'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import TabBar from '@/components/UI/TabBar'

export default {
  components: {
    TabBar,
    ModalAddItemMaster,
    PictureItemMaster,
    RecordItemMaster,
    BaseValidateMessage,
  },
  props: {
    activeToolBar: {
      type: String,
      default: () => 'addItemMaster',
    },
    paramsDetailItemMaster: {
      type: Object,
      default: () => {},
    },
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
    checkHasRoute() {
      return !this.$route.query?.itemCode
    },
  },

  async created() {
    await Promise.all([this.getItemTypeFromAPI(), this.getListBox(this.lang)])

    if (this.paramsDetailItemMaster) {
      this.dataDetailItemMaster = JSON.parse(
        JSON.stringify(this.paramsDetailItemMaster)
      )
    }
  },
  methods: {
    ...mapActions('base', ['getListBox']),
    updateDataDetail() {
      this.$emit('updateData')
    },
    changeTab(tabKey) {
      this.activeTabMenu = tabKey
    },
    async getItemTypeFromAPI() {
      const res = await api('getItemType')
      if (res) {
        const itemTypeOptions = res.data.map((item) => {
          return {
            text: this.$t(item.key),
            value: item.keyId,
          }
        })
        itemTypeOptions.unshift({
          text: '',
          value: '',
        })
        this.$store.commit('itemMaster/SET_LIST_ITEM_TYPE', itemTypeOptions)
      }
    },
    async getDataRecord() {
      const res = await api('getItemMasterRecord', this.$route.query?.itemId)
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.dataRecord = res.data
      }
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
