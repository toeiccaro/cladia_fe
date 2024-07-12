<template>
  <b-modal
    v-if="listDataConfig"
    id="popup-dashboard-config"
    content-class="popup-calendar-container"
    centered
    hide-header-close
    size="lg"
    @hide="closePopup"
  >
    <div class="popup-header">
      <span>{{ $t('lbl_DashboardConfiguration_0') }}</span>
    </div>
    <div class="popup-body">
      <div
        v-for="checkbox in listDataConfig"
        :key="checkbox.id"
        class="d-flex gap-2"
      >
        <div class="d-flex justify-center">
          <input
            :id="checkbox.id"
            v-model="checkbox.isShow"
            type="checkbox"
            @change="() => emitChangedStatus(checkbox.id)"
          />
        </div>
        <label :for="checkbox.id">{{ $t(`${checkbox.pageName}`) }}</label>
      </div>
    </div>

    <template #modal-footer>
      <div class="w-100 d-flex justify-content-between m-0 mt-2 px-2">
        <div class="d-flex w-100">
          <div class="footer__button" @click="updateListDataConfig">
            <div class="button button-save"></div>
            <div v-html="$t('btn_btnOK_0')"></div>
          </div>

          <div class="footer__button" @click="closePopup">
            <div class="button button-close"></div>
            <div v-html="$t('btn_btnCancel_0')"></div>
          </div>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import 'vue2-datepicker/index.css'
import { mapGetters } from 'vuex'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
export default {
  name: 'PopupDashboardConfig',
  mixins: [dateTime],
  props: {
    userInfo: {
      type: Object,
      default: () => ({}),
    },
    dataConfigByUser: {
      type: Array,
      default: () => [],
    },
    userRoleID: {
      type: [Number, String],
      default: 0,
    },
  },
  data() {
    return {
      listDataConfig: this.dataConfigByUser,
    }
  },
  computed: {
    ...mapGetters({
      payloadSystemConfigSecurity: 'filterSort/getPayloadSystemConfigSecurity',
    }),
  },
  watch: {
    dataConfigByUser: {
      handler(val) {
        this.listDataConfig = this.dataConfigByUser
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    closePopup() {
      this.$bvModal.hide('popup-dashboard-config')
    },
    emitChangedStatus(id) {
      this.$emit('dashboard-config', id)
    },
    async updateListDataConfig() {
      const dataDetails = this.listDataConfig.map((item) => {
        return {
          isShow: item.isShow,
          pageID: item.id,
        }
      })
      const payload = {
        detail: [...dataDetails],
        groupID: this.payloadSystemConfigSecurity?.userGroupID,
        userRoleID: this.userRoleID,
      }
      try {
        this.$emit('setLoading', true)
        const response = await api('updateDashboardConfig', payload)
        if (response.status === 200) {
          this.closePopup()
          window.alert(this.$t(response.message))
        }
      } catch (error) {
        throw new Error(error)
      } finally {
        this.$emit('setLoading', false)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.button {
  background-image: url('@/assets/icon/controls.png');
  background-repeat: no-repeat;
  width: 21px;
  height: 21px;
}
::v-deep .popup-calendar-container {
  background-color: #e2edff;
  border-radius: 5px;
  color: #000;
  width: 580px;
  height: fit-content;
  box-shadow: 5px 5px 5px #888;
  padding: 3px 3px 0 3px !important;
  z-index: 99;
  .modal-header {
    padding: 0 !important;
  }
  .modal-body {
    background-color: #afc0e3 !important;
    color: #ffffff;
    padding: 0 !important;
    display: flex;
    flex-direction: column;
  }
  .popup-header {
    background-color: #e2edff !important;
    color: #000 !important;
    display: flex;
  }
  .popup-body {
    border: 1px solid #5180d8;
    height: 100%;
    padding: 18px 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    span {
      font-size: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 12px;
    }
  }
  .modal-footer {
    padding: 0 !important;
    .footer__button {
      cursor: pointer;
      display: flex;
      align-items: center;

      .button-save {
        background-position: -84px 0px;
      }
      .button-close {
        background-position: -63px 0px;
        margin-left: 15px !important;
      }
    }
  }
}
</style>
<style lang="scss">
.modal {
  position: fixed;
  top: 0;
  right: 0;
  left: auto;
  z-index: 1050;
  display: none;
  width: calc(100% - 182px);
  height: 100%;
  overflow: hidden;
  outline: 0;
  display: flex !important;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  right: 0;
  left: auto;
  z-index: 1040;
  width: calc(100vw - 182px);
  height: 100vh;
  background-color: #000;
}
</style>
