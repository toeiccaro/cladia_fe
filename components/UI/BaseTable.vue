<template>
  <div id="sys-table" ref="sysTable" class="sys-table" @scroll="handleScroll">
    <div class="sys-table__header">
      <div
        v-for="(item, index) in header"
        :key="`header-${index}`"
        class="sys-table__header--data sys-flex-center"
        :style="{
          minWidth: ratio[index],
          maxWidth: ratio[index],
          flex: `0 0 ` + ratio[index],
        }"
        :class="{ 'cursor-pointer': item.sortKey && body.length }"
        @click="sort(item.sortKey)"
      >
        <slot v-if="item.type === 'slot'" :name="item.key"></slot>
        <span v-else class="sys-table__header--text">{{ item.name }}</span>
        <template v-if="item.sortable && item.sortKey && body.length">
          <span v-if="currentSortData.sortBy === item.sortKey">
            <b-icon-caret-down-fill
              v-if="isSortDescending"
              class="ml-1 cursor-pointer"
            ></b-icon-caret-down-fill>
            <b-icon-caret-down
              v-else
              class="ml-1 cursor-pointer"
            ></b-icon-caret-down>
          </span>
          <span v-if="currentSortData.sortBy === item.sortKey">
            <b-icon-caret-up-fill
              v-if="!isSortDescending"
              class="ml-1 cursor-pointer"
            ></b-icon-caret-up-fill>
            <b-icon-caret-up
              v-else
              class="ml-1 cursor-pointer"
            ></b-icon-caret-up>
          </span>
        </template>
      </div>
    </div>
    <div v-if="!disabledFilter" class="sys-table__header">
      <div
        v-for="(item, index) in header"
        :key="`header-filter-${index}`"
        class="sys-table__header--data sys-flex-center py-1"
        :style="{
          maxWidth: ratio[index],
          flex: `0 0 ` + ratio[index],
        }"
      >
        <input
          v-if="item.secondHeader === 'input'"
          type="text"
          class="w-100 border border-dark"
          @keyup.enter="filterData($event, item.key)"
        />
        <input v-else-if="item.secondHeader === 'checkbox'" type="checkbox" />
        <select
          v-else-if="item.secondHeader === 'select'"
          :option="item.optionSelect"
          type="text"
          class="w-100 border border-dark"
          @change="filterData($event, item.key)"
        >
          <option
            v-for="(select, indexSelect) in item.optionSelect"
            :key="indexSelect"
            :value="select.value"
          >
            {{ select.text }}
          </option>
        </select>
      </div>
    </div>
    <div v-if="loading" class="pl-5 pt-3 pb-3 overflow-hidden-ell">
      <b-spinner></b-spinner>
    </div>
    <div v-else>
      <div v-if="body.length" class="sys-table__body">
        <div
          v-for="(row, indexRow) in body"
          :key="indexRow"
          class="sys-table__body--row"
          @click="handleRedirectToDetail(body[indexRow], indexRow)"
        >
          <div
            v-for="(data, keyData) in row"
            :key="keyData"
            class="sys-table__body--data"
            :class="{
              'sys-style-center': data.styleCenter,
              active: indexRow === activeRow,
            }"
            :style="{
              maxWidth: ratio[data.orderByList],
              flex: `0 0 ` + ratio[data.orderByList],
            }"
          >
            <!-- create slot for each cell -->
            <slot
              v-if="data.type === 'slot'"
              :name="keyData + '-' + indexRow"
            ></slot>

            <slot
              v-else-if="data.type === 'checkbox'"
              name="checkbox"
              :rowData="row"
              :rowIndex="indexRow"
            ></slot>

            <nuxt-link
              v-else-if="data.type === 'link'"
              :to="localePath({ path: data.link })"
              class="cell-data d-block text-underline"
              :class="{
                'text-bold': data.textBold,
                'text-right': data.text === 'right',
                'text-left': data.text === 'left',
                'text-center': data.text === 'center',
              }"
              :style="{ textAlign: textAlign }"
            >
              {{ data.value }}
            </nuxt-link>
            <div v-else-if="data.isCheckbox" class="text-center">
              <input :checked="data.checkboxValue" disabled type="checkbox" />
            </div>
            <div
              v-else
              class="cell-data"
              :class="{
                'text-bold': data.textBold,
                'text-right': data.text === 'right',
                'text-left': data.text === 'left',
                'text-center': data.text === 'center',
              }"
              :style="{ textAlign: textAlign }"
            >
              {{ data.value }}
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="searched" class="pl-5 pt-3 pb-3">
        {{ $t('no-data') }}
      </div>
    </div>
  </div>
</template>

<script>
import {
  BIconCaretDown,
  BIconCaretUp,
  BIconCaretUpFill,
  BIconCaretDownFill,
} from 'bootstrap-vue'
export default {
  name: 'BaseTable',
  components: {
    BIconCaretDown,
    BIconCaretUpFill,
    BIconCaretDownFill,
    BIconCaretUp,
  },
  props: {
    name: {
      type: String,
      default: '',
    },
    ratio: {
      type: Array,
      default: () => [],
    },
    header: {
      type: Array,
      default: () => [],
    },
    body: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    sortData: {
      type: Object,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
    textAlign: {
      type: String,
      default: 'left',
    },
    styleCenter: {
      type: Boolean,
      default: false,
    },
    searched: {
      type: Boolean,
      default: false,
    },
    disabledFilter: {
      type: Boolean,
      default: false,
    },
    keyCode: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      activeRow: null,
      currentSortData: {
        sortBy: '',
        direction: '',
      },
      isSortDescending: true,
    }
  },
  methods: {
    sort(sortBy) {
      const isSortOnSameField = this.currentSortData.sortBy === sortBy
      if (isSortOnSameField) {
        this.isSortDescending = !this.isSortDescending
      } else {
        this.isSortDescending = true
      }

      this.currentSortData = {
        sortBy,
        direction: this.isSortDescending ? 'desc' : 'asc',
      }

      if (!this.loading && sortBy && this.body.length) {
        this.$emit('sort', {
          ...this.currentSortData,
        })
      }
    },
    filterData(event, key) {
      this.$emit('filterData', {
        key,
        value: event.target.value,
      })
    },
    handleRedirectToDetail(body, indexRow) {
      this.activeRow = indexRow
      this.$emit('detail', body.index)
    },
    handleScroll(e) {
      // this.$emit('scroll', e.target.scrollLeft)
    },
  },
}
</script>

<style lang="scss" scoped>
.sys-table {
  position: relative;
  overflow: auto;
  border: 1px solid #5180d8;
  // width: max-content;
  &__header {
    position: sticky;
    top: 0;
    left: 0;
    display: flex;
    line-height: 22px;
    &--data {
      border-right: 1px solid #5180d8;
      border-bottom: 1px solid #5180d8;
      background-color: #eff3ff;
      display: inline-block;
      font-size: 12px;
      padding: 0 2px 0 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      &:last-child {
        border-right: 0;
      }
      input,
      select {
        height: 20px;
        border-radius: 2px;
        border: solid 1px rgb(118, 118, 118) !important;
      }
    }
    &--text {
      font-size: 12px;
      font-weight: bold;
    }
  }

  &__body {
    &--row {
      display: flex;
      cursor: default;
      &:last-child {
        border-bottom: 0;
      }
      &:hover {
        background-color: #fdeaa6;
      }
    }
    &--data {
      border-bottom: 1px solid #5180d8;
      border-right: 1px solid #5180d8;
      padding: 0 2px;
      line-height: 22px;
      &.active {
        background: #fbec88;
      }
      &:last-child {
        border-right: 0;
      }
      .cell-data {
        font-size: 12px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .text-underline {
        text-decoration: underline;
        cursor: pointer;
      }
    }
  }
}
</style>
