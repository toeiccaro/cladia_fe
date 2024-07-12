<template>
  <b-modal
    id="popup-calendar-holiday"
    content-class="popup-calendar-container"
    centered
    hide-header-close
    size="lg"
  >
    <div class="popup-header"></div>
    <div class="popup-body">
      <span v-if="dayInfo?.isHoliday">{{
        $t('msg_ChangeToWorkingDay_0')
      }}</span>
      <span v-else>{{ $t('msg_ChangeToHoliday_0') }}</span>
    </div>

    <template #modal-footer>
      <div class="w-100 d-flex justify-content-between m-0 mt-2 px-2">
        <div class="d-flex w-100">
          <div class="footer__button" @click="handleUpdateHoliday">
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
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'

export default {
  name: 'BasePopupCalendarHoliday',

  mixins: [dateTime],

  props: {
    dayInfo: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {}
  },

  methods: {
    closePopup() {
      this.$bvModal.hide('popup-calendar-holiday')
    },
    async handleUpdateHoliday() {
      const payload = {
        date: this.dayInfo?.date,
        isHoliday: !this.dayInfo?.isHoliday,
      }

      try {
        this.$emit('setLoading', true)
        const response = await api('updateHoliday', payload)
        if (response.status === 200) {
          this.dayInfo?.isHoliday
            ? window.alert(this.$t('msg_UpdateWorkingDaySuccess_0'))
            : window.alert(this.$t('msg_UpdateHolidaySuccess_0'))
          this.closePopup()
        } else {
          this.dayInfo?.isHoliday
            ? window.alert(this.$t('msg_UpdateWorkingDayFail_0'))
            : window.alert(this.$t('msg_UpdateHolidayFail_0'))
        }
      } catch (error) {
        this.dayInfo?.isHoliday
          ? window.alert(this.$t('msg_UpdateWorkingDayFail_0'))
          : window.alert(this.$t('msg_UpdateHolidayFail_0'))
      } finally {
        this.$emit('setLoading', false)
        this.$emit('rerender-holiday')
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
