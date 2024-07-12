<template>
  <div class="card-promise-date">
    <div class="card-header" :class="isShowCard ? 'border-bottom' : ''">
      <div class="card-header--title">{{ title }}</div>
      <!-- <div class="card-header--action">
        <BIconChevronDown class="action-asc" @click="handleActionSort('ASC')" />
        <BIconChevronUp class="action-desc" @click="handleActionSort('DESC')" />
      </div> -->
      <BIconCaretDownFill
        v-if="isShowCard"
        class="action-show"
        @click="handleActionShow"
      />
      <BIconCaretUpFill v-else class="action-show" @click="handleActionShow" />
    </div>
    <div v-if="isShowCard" class="main-card">
      <div class="selection-date">
        <datepicker
          :value="promiseDate"
          format="yyyy-MM-dd"
          input-class="input__orderDate"
          :highlighted="highlighted"
          :disabled-dates="disabledDates"
          class="promise-date"
          @selected="changeDate"
        ></datepicker>
      </div>
      <div class="card-body">
        <div
          v-for="(item, index) in data"
          :key="`${item.orderNo} - ${index}`"
          class="card-body--item"
        >
          <div class="text-hidden">
            <span
              class="order-no"
              :title="item.orderNo"
              @click="redirectLinkDetail(item.linkUrl)"
            >
              {{ item.orderNo }}</span
            >
          </div>
          <div class="text-hidden" :title="item.customerName">
            {{ item.customerName }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import { BIconChevronDown, BIconChevronUp } from 'bootstrap-vue'
import { BIconCaretDownFill, BIconCaretUpFill } from 'bootstrap-vue'
import dateTime from '@/mixins/dateTime'

export default {
  components: {
    BIconCaretDownFill,
    BIconCaretUpFill,
  },
  mixins: [dateTime],
  props: {
    title: {
      type: String,
      default: '',
    },
    data: {
      type: [Object, Array],
      default: () => [],
    },
    type: {
      type: String,
      default: '',
    },
    show: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      promiseDate: new Date(),
      highlighted: {
        dates: [new Date()],
      },
      isShowCard: this.show,
    }
  },
  computed: {
    disabledDates() {
      const disabledDate = {}
      const date = new Date()
      disabledDate.to = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
      disabledDate.from = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 7
      )
      return disabledDate
    },
  },
  watch: {
    show: {
      handler(value) {
        this.isShowCard = value
      },
    },
  },
  methods: {
    handleActionSort(type) {},
    changeDate(value) {
      this.promiseDate = this.convertDate(value)
      this.$emit('changeDataDate', this.convertDate(value))
    },
    handleActionShow() {
      this.isShowCard = !this.isShowCard
      let cardName
      switch (this.title) {
        case 'Promise Date (Production)':
          cardName = 'PromiseDateProduction'
          break
        case 'Promise Date (Outward)':
          cardName = 'PromiseDateOutward'
          break
        case 'Promise Date (Sales)':
          cardName = 'PromiseDateSales'
          break
        case 'Promise Date (Purchase)':
          cardName = 'PromiseDatePurchase'
          break
        default:
          break
      }
      this.$emit('actionShow', {
        cardName,
        active: this.isShowCard,
      })
    },
    redirectLinkDetail(linkUrl) {
      if (!linkUrl) {
        return
      }
      let urlOrigin = ''
      if (this.type === 'PromiseSale') {
        urlOrigin = '/sales/order'
      } else if (this.type === 'PromisePurchase') {
        urlOrigin = '/purchase/order'
      }
      localStorage.setItem('currentActivatingRoute', urlOrigin)
      window.open(`/${this.$i18n.locale}${linkUrl}`, '_blank')
    },
  },
}
</script>
<style lang="scss">
@import '@/assets/vuejs-datepicker.scss';
</style>
<style lang="scss" scoped>
.border-bottom {
  border-bottom: 1px solid #aaa;
}
.card-promise-date {
  // border: 1px solid #aaa;
  // max-height: 248px;
  height: 100%;
  .card-header {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    border: none;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 12px;
    .card-header--title {
      font-size: 14px;
      font-weight: 700;
    }
    .card-header--action {
      .action-asc {
        margin-right: 8px;
        cursor: pointer;
      }
      .action-desc {
        cursor: pointer;
      }
    }
    .action-show {
      cursor: pointer !important;
    }
  }

  .main-card {
    // border: 1px solid #aaa;
    border-top: none;
    height: calc(100% - 31px);
  }
  .card-body {
    padding: 10px 12px;
    overflow: auto;
    height: calc(100% - 48px);
    .card-body--item {
      font-size: 14px;
      display: grid;
      grid-template-columns: 35% 65%;
      gap: 10px;
      .order-no {
        // color: #2a4ea1;
        width: 100%;
        font-weight: 700;
        color: #5180d8;
        margin-right: 10px;
        &:hover,
        &:focus {
          text-decoration: underline;
          color: #5180d8;
          cursor: pointer;
        }
      }
      .customer-name {
        word-break: break-all;
        white-space: pre-line;
      }
    }
  }
  .selection-date {
    padding-top: 8px;
    margin-left: 12px;
    .promise-date {
      width: 150px;
    }
  }
}
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  background: #f4f7fb;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb {
  background: #c4c4c4;
  border-radius: 12px;
}
</style>
