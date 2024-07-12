<template>
  <div class="card-plan-today">
    <div class="card-header" :class="isShowCard ? 'border-bottom' : ''">
      <div class="card-header--title">{{ $t('lbl_TodayEvents_0') }}</div>
      <div class="card-header--action">
        <BIconChevronDown
          class="action-desc"
          :class="{ active: sortType === 'desc' }"
          @click="handleActionSort('desc')"
        />
        <BIconChevronUp
          class="action-asc"
          :class="{ active: sortType === 'asc' }"
          @click="handleActionSort('asc')"
        />
        <BIconCaretDownFill
          v-if="isShowCard"
          class="action-asc"
          @click="handleActionShow"
        />
        <BIconCaretUpFill v-else class="action-asc" @click="handleActionShow" />
      </div>
    </div>
    <div v-if="isShowCard" class="card-body">
      <div
        v-for="(item, index) in data"
        :key="`plan-${index}`"
        class="card-body--item"
      >
        <div class="text-hidden" :title="`${item.startDate}- ${item.endDate}`">
          <span class="hour" @click="handleClickDetail(item)">
            {{ item.startDate }} - {{ item.endDate }}</span
          >
        </div>
        <div class="content text-hidden" :title="item.title">
          {{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  BIconChevronDown,
  BIconChevronUp,
  BIconCaretDownFill,
  BIconCaretUpFill,
} from 'bootstrap-vue'

export default {
  components: {
    BIconChevronDown,
    BIconChevronUp,
    BIconCaretDownFill,
    BIconCaretUpFill,
  },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    show: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sortType: '',
      isShowCard: this.show,
    }
  },
  watch: {
    show: {
      handler(value){
        this.isShowCard = value
      },
    }
  },
  methods: {
    handleActionSort(type) {
      this.sortType = type
      this.$emit('sortPlan', type)
    },
    handleActionShow() {
      this.isShowCard = !this.isShowCard
      this.$emit('actionShow', {
        cardName: 'CardPlanToday',
        active: this.isShowCard,
      })
    },
    handleClickDetail(item) {
      window.open(
        `/${this.$i18n.locale}/routine-work/calendar?plan=today&eventId=${item.id}`,
        '_blank'
      )
    },
  },
}
</script>
<style lang="scss" scoped>
.border-bottom {
  border-bottom: 1px solid #aaa;
}
.card-plan-today {
  height: 100%;
  .card-header {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 12px;
    border: none;
    background-color: white;
    .card-header--title {
      font-size: 14px;
      font-weight: 700;
    }
    .card-header--action {
      .action-asc {
        cursor: pointer;
      }
      .action-desc {
        cursor: pointer;
      }
      .active {
        font-weight: 700;
        color: #5180d8;
      }
    }
  }
  .card-body {
    // border: 1px solid #aaa;
    border-top: none;
    padding: 10px 12px;
    overflow: auto;
    height: calc(100% - 31px);
    .card-body--item {
      font-size: 14px;
      display: grid;
      grid-template-columns: 30% 70%;
      gap: 10px;
      align-items: center;
      .hour {
        width: 100%;
        font-weight: 700;
        color: #5180d8;
        &:hover {
          cursor: pointer;
          text-decoration: underline;
        }
      }
      .content {
        color: #222;
        word-break: break-all;
      }
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
