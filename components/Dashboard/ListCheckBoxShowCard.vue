<template>
  <div v-if="listCheckBoxConfig.length > 0" class="list-checkbox">
    <div class="text-title">{{ $t('lbl_DashboardConfiguration_0') }}</div>
    <div class="common-input">
      <div
        v-for="checkbox in listCheckBoxConfig"
        :key="checkbox.pageID"
        class="input__group d-flex"
      >
        <div class="d-flex flex-column justify-center">
          <input
            :id="`dashboard-config-${checkbox.pageID}`"
            v-model="checkbox.isShow"
            type="checkbox"
            @change="() => emitChangedStatus(checkbox)"
          />
        </div>
        <label :for="`dashboard-config-${checkbox.pageID}`">{{
          $t(`${checkbox.pageName}`)
        }}</label>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import api from '@/api/api'
export default {
  name: 'ListCheckBoxShowCard',
  props: {
    layout: {
      type: Array,
      default: () => [],
    },
    listCheckBoxConfig: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      checkStatus: {},
      // listCheckBoxConfig: [],
    }
  },
  computed: {
    ...mapGetters({
      userInfo: 'getUserInfo',
    }),
  },
  watch: {
    listCheckBoxConfig: {
      handler() {
        this.handleSaveCheckBoxConfig(this.layout)
      },
      deep: true,
    },
  },
  // async created() {
  //   await this.getListCheckBoxConfig()
  // },
  methods: {
    emitChangedStatus(id) {
      this.$emit('dashboard-config', id)
    },

    async handleSaveCheckBoxConfig(layout) {
      layout.forEach((item) => {
        const page = this.listCheckBoxConfig.find((page) => {
          return page.pageID === item.i
        })
        if (page) {
          item.isCheck = page.isShow ? 1 : 0
        }
      })
      const payload = {
        userID: this.userInfo.loginID,
        dashboardRequestList: layout,
      }

      await api('updateDashboardPosition', payload)
    },

    // async getListCheckBoxConfig() {
    //   try {
    //     const response = await api('getListConfigDashboard')
    //     if (response.status === 200) {
    //       this.listCheckBoxConfig = response.data
    //     }
    //   } catch (error) {
    //     throw new Error(error)
    //   }
    // },
  },
}
</script>

<style scoped>
.list-checkbox {
  border: 1px solid #aaa;
  margin-bottom: 16px;
  padding: 4px 12px;
}
.text-title {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}
.common-input {
  gap: 6px;
  display: flex !important;
  align-items: flex-start;
  flex-wrap: wrap;
}
.input__group {
  gap: 3px;
}
</style>
