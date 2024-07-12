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
      <DetailItemMaster
        :params-detail-item-master="dataDetailItemMaster"
        @updateData="getData"
        @validation-errors="(data) => (listErrorMessage = data)"
      />
    </div>
    <div v-show="activeTabMenu === 'picture'">
      <PictureItemMaster :params-detail-item-master="dataDetailItemMaster" />
    </div>
    <div v-show="activeTabMenu === 'record'">
      <RecordItemMaster
        :data="dataRecord"
        @changeData="getDataRecord"
        @validation-errors="(data) => (listErrorMessage = data)"
      />
    </div>
    <div v-show="activeTabMenu === 'manufacturing'">
      <TabManufacturing
        :data-item-master="dataDetailItemMaster"
        :data-manufacturing="dataManufacturing"
        @get-data="getDetailManufacturingInformation"
        @validation-errors="(data) => (listErrorMessage = data)"
      />
    </div>
    <div v-show="activeTabMenu === 'inspection'">
      <TabInspection
        :data-item-master="dataDetailItemMaster"
        :data-inspection="dataInspection"
        @get-data="getDetailInspectionInformation"
        @validation-errors="(data) => (listErrorMessage = data)"
      />
    </div>
  </div>
</template>
<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import DetailItemMaster from '@/components/MasterData/ItemMaster/Detail/DetailItemMaster'
import PictureItemMaster from '@/components/MasterData/ItemMaster/PictureItemMaster'
import RecordItemMaster from '@/components/MasterData/ItemMaster/RecordItemMaster'
import api from '@/api/api'
import { formatNumberWithCommas } from '~/utils/utils'
import { SERVER_RESPONSE_CODE } from '@/constants'
import BaseValidateMessage from '@/components/UI/BaseValidateMessage'
import TabBar from '@/components/UI/TabBar'
import TabManufacturing from '@/components/MasterData/ItemMaster/Manufacturing/TabManufacturing.vue'
import TabInspection from '@/components/MasterData/ItemMaster/Inspection/TabInspection.vue'
export default {
  components: {
    TabBar,
    DetailItemMaster,
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
      dataManufacturing: {},
      dataInspection: {},
      listConvertStringToFloat: [
        'spq',
        'soprice',
        'safeQty',
        'salePeriod',
        'packPeriod',
        'makePeriod',
        'moq',
        'outPeriod',
        'outRate',
        'price',
        'purchasePeriod',
        'weight',
      ],
    }
  },
  async fetch() {
    try {
      this.setLoading(true)
      await Promise.all([
        this.getData(),
        this.getListBox(this.lang),
        this.getDataRecord(),
        this.getDetailManufacturingInformation(),
        this.getDetailInspectionInformation(),
      ])
    } catch (error) {
    } finally {
      this.setLoading(false)
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
  methods: {
    ...mapActions('base', ['getListBox']),
    ...mapMutations({
      setLoading: 'base/SET_LOADING',
    }),
    async getData() {
      const res = await api('getDetailItemMaster', {
        itemMasterId: this.$route.query?.itemCode,
      })
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.dataDetailItemMaster = res.data

        for (const key in res.data) {
          if (this.listConvertStringToFloat.includes(key))
            this.dataDetailItemMaster[key] = this.parseStringToFloat(
              res.data[key]
            )
        }

        const formatNumberFields = [
          'outRate',
          'spq',
          'packPeriod',
          'safeQty',
          'weight',
          'moq',
          'salePeriod',
          'price',
          'soprice',
          'purchasePeriod',
          'outPeriod',
        ]
        for (const key of formatNumberFields) {
          this.dataDetailItemMaster[key] =
            formatNumberWithCommas(res.data[key]) || 0
        }

        this.setLoading(false)
      }
    },
    changeTab(tabKey) {
      this.activeTabMenu = tabKey
    },
    async getDataRecord() {
      const res = await api('getItemMasterRecord', this.$route.query?.itemCode)
      if (res && res.status === SERVER_RESPONSE_CODE.OK) {
        this.dataRecord = res.data
      }
    },
    async getDetailManufacturingInformation() {
      try {
        const response = await api(
          'getManufacturingInformation',
          this.$route.query?.itemCode
        )
        this.dataManufacturing = response
      } catch (error) {
      } finally {
        this.setLoading(false)
      }
    },
    async getDetailInspectionInformation() {
      try {
        const response = await api(
          'getInspectionInformation',
          this.$route.query?.itemCode
        )
        this.dataInspection = response
      } catch (error) {
      } finally {
        this.setLoading(false)
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
