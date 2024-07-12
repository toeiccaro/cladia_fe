<template>
  <div class="card-request-check">
    <div class="card-header" :class="isShowCard ? 'border-bottom' : ''">
      <div class="card-header--title">{{ $t('lbl_RequestCheck_0') }}</div>
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
    <div v-show="isShowCard" class="card-main">
      <div class="selection-group">
        <b-form-select
          v-model="pageNameID"
          :options="featureOptions()"
          class="select no-drag"
          @change="changeFeatureOrder"
        ></b-form-select>
      </div>
      <div class="card-body">
        <div
          v-for="(item, index) in dataContainCard"
          :key="`request-${index}`"
          class="card-body--item"
        >
          <div class="text-hidden">
            <span
              class="order-number"
              :class="item.linkUrl ? '' : 'disabled-edit'"
              :title="item.orderNo"
              @click="redirectLinkDetail(item.linkUrl)"
            >
              {{ item.orderNo }}</span
            >
          </div>
          <div class="customer-name">
            <span class="text-hidden" :title="item.customerName">{{
              item.customerName
            }}</span>
            <span
              v-if="item.responsibleMan"
              :title="item.responsibleMan"
              :class="item.linkUrl ? '' : 'disabled-edit'"
              class="person text-hidden"
              @click="redirectLinkDetail(item.linkUrl)"
              >({{ item.responsibleMan }})</span
            >
          </div>
        </div>
      </div>
      <div
        v-if="showButtonMore"
        class="button-more"
        @click="redirectScreenDetail"
      >
        {{ $t('lbl_ButtonMore_0') }}
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
      default: true,
    },
    options: {
      type: Array,
      default: () => [],
    },
    pageID: {
      type: [Number, String],
      required: false,
      default: () => 2,
    },
  },
  data() {
    return {
      pageNameID: this.pageID,
      payloadDefault: {
        language: this.$i18n.locale,
        pageNo: 1,
        pageSize: 30,
      },
      sortType: '',
      isShowCard: this.show,
    }
  },
  computed: {
    dataContainCard() {
      return this.data && this.data.length <= 9
        ? this.data
        : this.data?.slice(0, 9)
    },
    showButtonMore() {
      return this.data && this.data.length > 9
    },
  },
  watch: {
    show: {
      handler(value) {
        this.isShowCard = value
      },
    },
    typeSort: {
      handler(value) {
        this.$emit('changeData', {
          pageName: this.pageNameID,
          sortType: value,
        })
      },
    },
    pageNameID: {
      handler(value) {
        this.$emit('changeData', {
          pageName: this.pageNameID,
          sortType: this.sortType,
        })
      },
    },
  },

  methods: {
    featureOptions() {
      const listOptions = this.options.map((option) => {
        return {
          ...option,
          text: this.$t(option.text),
        }
      })
      return listOptions
    },
    handleActionSort(type) {
      this.typeSort = type
      this.$emit('changeData', {
        pageName: this.pageNameID,
        sortType: type,
      })
    },
    handleActionShow() {
      this.isShowCard = !this.isShowCard
      this.$emit('actionShow', {
        cardName: 'CardRequestCheck',
        active: this.isShowCard,
      })
    },
    changeFeatureOrder(value) {
      this.pageNameID = value
    },
    redirectLinkDetail(linkUrl) {
      if (!linkUrl) {
        return
      }
      const pageNow = this.options?.find(
        (item) => item.value === this.pageNameID
      )
      localStorage.setItem('currentActivatingRoute', pageNow.urlOrigin)
      window.open(`/${this.$i18n.locale}${linkUrl}`, '_blank')
    },
    redirectScreenDetail() {
      const pageNow = this.options?.find(
        (item) => item.value === this.pageNameID
      )
      localStorage.setItem('currentActivatingRoute', pageNow.urlOrigin)
      window.open(pageNow.urlMore, '_blank')
    },
  },
}
</script>
<style lang="scss" scoped>
.disabled-edit {
  cursor: default !important;
  &:hover {
    text-decoration: none !important;
  }
}
.border-bottom {
  border-bottom: 1px solid #aaa;
}
.card-request-check {
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
      .action-desc {
        margin-right: 8px;
        cursor: pointer;
      }
      .action-asc {
        cursor: pointer;
      }
      .active {
        font-weight: 700;
        color: #5180d8;
      }
    }
  }
  .card-main {
    border-top: none;
    height: calc(100% - 31px);
  }

  .card-body {
    padding: 8px 12px;
    overflow: auto;
    max-height: calc(100% - 60px);
    .card-body--item {
      font-size: 14px;
      display: grid;
      grid-template-columns: 30% 70%;
      gap: 10px;
      // span {
      //   word-break: break-all;
      // }

      .order-number {
        width: 100%;
        font-weight: 700;
        color: #5180d8;
        margin-right: 12px;
        cursor: pointer;
        &:hover {
          text-decoration: underline;
        }
      }
      .person {
        color: #2a4ea1;
        cursor: pointer;
        margin-left: 8px;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  .selection-group {
    padding-top: 8px;
    margin-left: 12px;
    .select {
      width: 150px;
      height: 20px;
      font-size: 12px;
      border: 1px solid #aaa;
      background-color: #fff !important;
      border-radius: 2px;
    }
  }
}
.button-more {
  float: right;
  margin-top: 4px;
  margin-right: 12px;
  color: #222;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid #aaa;
  border-radius: 4px;
  width: fit-content;
  padding: 2px;
}
::-webkit-scrollbar {
  height: 4px;
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
