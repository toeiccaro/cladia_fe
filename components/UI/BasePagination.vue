<template>
  <div>
    <div
      class="pagination-container d-flex align-items-center justify-content-center position-relative"
    >
      <span
        class="pagination-icon pagination-icon-first mr-1"
        :class="{ disabled: currentPage === 1 }"
        @click="currentPage !== 1 ? changePage(1) : ''"
      ></span>
      <span
        class="pagination-icon pagination-icon-back mr-1"
        :class="{ disabled: currentPage === 1 }"
        @click="currentPage !== 1 ? changePage(currentPage - 1) : ''"
      ></span>
      <div class="border-left pl-1">
        <input
          class="pagination-input mr-1"
          type="text"
          size="3"
          maxlength="7"
          role="textbox"
          oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
          :value="total ? currentPage : 0"
          @keyup.enter="changePage($event.target.value)"
        />
      </div>
      <div class="border-right pr-1">{{ `Sum ${sumPage} Page` }}</div>
      <span
        class="pagination-icon pagination-icon-next ml-1 mr-1"
        :class="{ disabled: currentPage === sumPage }"
        @click="currentPage !== sumPage ? changePage(currentPage + 1) : ''"
      ></span>
      <span
        class="pagination-icon pagination-icon-last mr-1"
        :class="{ disabled: currentPage === sumPage }"
        @click="currentPage !== sumPage ? changePage(sumPage) : ''"
      ></span>
      <select :value="perPage" @change="changePerPage($event.target.value)">
        <option
          v-for="(item, index) in perPageOptions"
          :key="`size-${index}`"
          :value="item"
        >
          {{ item }}
        </option>
      </select>
      <div class="pagination-number__container">
        <span v-if="total">
          <span class="mr-2">{{
            `${(currentPage - 1) * perPage + 1 || 1} - ${
              (currentPage - 1) * perPage + numberItem
            }`
          }}</span>
          <span>{{ total }}</span>
        </span>
        <span v-else>No Records</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BasePagination',
  props: {
    total: {
      type: Number,
      default: 0,
    },
    perPage: {
      type: Number,
      default: 30,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    perPageOptions: {
      type: Array,
      default: () => [30, 50, 100],
    },
    numberItem: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      pageSize: this.perPage,
    }
  },
  computed: {
    sumPage() {
      return Math.ceil(this.total / this.perPage) || 1
    },
  },
  methods: {
    changePage(value) {
      const finalValue = value > 0 ? value : 1
      this.$emit('changePage', finalValue)
    },
    changePerPage(value) {
      this.$emit('changePerPage', value)
    },
  },
}
</script>

<style lang="scss" scoped>
.pagination-container {
  font-size: 12px;
  padding: 2px;
  border-top: 1px solid #5180d8;
}

.pagination-input {
  font-size: 0.8em;
  border: 1px solid rgb(118, 118, 118);
}

.pagination-icon {
  width: 16px;
  height: 16px;
  background-image: url('@/assets/icon/ui-icon.png');
  text-indent: -99999px;
  overflow: hidden;
  background-repeat: no-repeat;
  cursor: pointer;
}

.pagination-icon-first {
  background-position: -80px -160px;
}

.pagination-icon-back {
  background-position: -48px -160px;
}

.pagination-icon-next {
  background-position: -32px -160px;
}

.pagination-icon-last {
  background-position: -64px -160px;
}

.pagination-number__container {
  position: absolute;
  right: 5px;
}

.disabled {
  opacity: 0.35;
  cursor: auto;
}

.position-abs {
  position: absolute;
  width: 100%;
  bottom: 0;
}
</style>
