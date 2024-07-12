<template>
  <div>
    <ModalTrackingMRPProgress
      :is-show="showModal"
      :percent-calc="percentCalc"
      @cancel="handleClickCancelBtn"
      @modal-destroyed="resetPercentCalc"
    />
    <h1 class="flex items-center py-6 px-4 font-bold bg-cladia">
      {{ $t('lbl_MRP_Calculate_0') }}
    </h1>
    <h2 class="flex items-center py-8 px-4 font-bold bg-[#ebeff6]">
      {{ $t('lbl_MRPPeriod_0') }}
    </h2>
    <div class="inline-flex flex-col items-center gap-y-6 py-8 px-4">
      <div class="flex flex-col gap-4">
        <div class="flex gap-5 justify-between">
          <span>{{ $t('lbl_MRPStartDate_0') }}</span>
          <datepicker
            v-model="startDate"
            :disabled-dates="disabledStartDates"
            format="yyyy-MM-dd"
          />
        </div>
        <div class="flex gap-5 justify-between">
          <span>{{ $t('lbl_MRPEndDate_0') }}</span>
          <datepicker
            v-model="endDate"
            :disabled-dates="disabledEndDates"
            format="yyyy-MM-dd"
          />
        </div>
      </div>
      <div class="flex gap-5">
        <button class="mrp-btn" @click="handleCreateMRP">
          {{ $t('btn_MRPStart_0') }}
        </button>
        <button class="mrp-btn" @click="handleToDemandSupply">
          {{ $t('btn_MRPClose_0') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchEventSource } from '@microsoft/fetch-event-source'
import ModalTrackingMRPProgress from './ModalTrackingMRPProgress.vue'
import api from '@/api/api'
import { getAccessToken } from '@/utils/utils'
import { SERVER_RESPONSE_CODE } from '@/constants'

const today = new Date()

export default {
  components: {
    ModalTrackingMRPProgress,
  },
  data() {
    return {
      startDate: today,
      endDate: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 180
      ),
      showModal: false,
      percentCalc: 0,
    }
  },
  computed: {
    disabledStartDates() {
      return {
        from: new Date(
          this.endDate.getFullYear(),
          this.endDate.getMonth(),
          this.endDate.getDate()
        ),
      }
    },
    disabledEndDates() {
      return {
        to: new Date(
          this.startDate.getFullYear(),
          this.startDate.getMonth(),
          this.startDate.getDate() + 1
        ),
      }
    },
  },
  beforeDestroy() {
    this.cancelMRPOnUnload()
  },
  methods: {
    async fetchMRPStatus() {
      try {
        const vue = this
        const token = await getAccessToken()
        await fetchEventSource(`${process.env.BASE_URL}mrp/status`, {
          headers: {
            Authorization: 'Bearer ' + token,
          },
          onopen(res) {
            if (res.status === SERVER_RESPONSE_CODE.OK) {
              return window.addEventListener('pagehide', vue.cancelMRPOnUnload)
            }
          },
          onmessage(event) {
            const progress = JSON.parse(event.data)
            vue.percentCalc = progress.percent
          },
          onclose() {
            window.removeEventListener('pagehide', vue.cancelMRPOnUnload)
            setTimeout(() => {
              vue.showModal = false
              vue.resetPercentCalc()
              vue.handleToDemandSupply()
            }, 700)
          },
          onerror(err) {
            console.log('There was an error from server', err)
          },
        })
      } catch (err) {
        console.log(err)
      }
    },
    async handleCreateMRP() {
      const payload = {
        startPeriodDate: this.startDate.getTime(),
        endPeriodDate: this.endDate.getTime(),
      }
      try {
        const res = await api('createMRP', payload)
        if (res.status === SERVER_RESPONSE_CODE.OK && res.data) {
          this.showModal = true
          this.fetchMRPStatus(res.data)
        } else if (
          res?.data?.response?.status === SERVER_RESPONSE_CODE.BAD_REQUEST
        ) {
          window.alert(this.$t('msg_MRPCalculating_0'))
        }
      } catch (error) {
        console.log(error)
      }
    },
    async cancelCalcMRP() {
      try {
        const res = await api('cancelMRP')
        return res
      } catch (err) {
        console.log(err)
        return err
      }
    },
    async handleClickCancelBtn() {
      try {
        const res = await this.cancelCalcMRP()
        if (res.status === SERVER_RESPONSE_CODE.OK) {
          this.showModal = false
          this.resetPercentCalc()
        }
      } catch (err) {
        console.log(err)
      }
    },
    handleToDemandSupply() {
      this.$router.push(this.localePath({ path: '/mrp/demand-supply' }))
    },
    resetPercentCalc() {
      this.percentCalc = 0
    },
    async cancelMRPOnUnload() {
      if (this.showModal && this.percentCalc < 100) {
        const token = await getAccessToken()
        fetch(`${process.env.BASE_URL}mrp/cancel`, {
          keepalive: true,
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })
      }
    },
  },
}
</script>

<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
button.mrp-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 66px;
  padding: 6px 8px;
  border: 1px solid #5180d8 !important;
  font-weight: bold;
  color: #000000;
  background: #eff3ff 50% 50% repeat-x;
  cursor: pointer;
  &:hover {
    background: #fdeaa6;
  }
}
</style>
