<template>
  <div class="tab-container">
    <div
      v-for="tab of listMenu"
      :key="tab.key"
      :class="['tab-item', tab.key == value && 'active']"
      @click="changeTabActive(tab.key)"
    >
      <span>
        {{ tab.label }}
      </span>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    listMenu: {
      type: Array,
      required: false,
      default: () => [],
    },
    value: {
      type: [String, Number],
      required: true,
    },
  },
  methods: {
    changeTabActive(tabKey) {
      this.$emit('changeTab', tabKey)
    },
  },
}
</script>
<style lang="scss" scoped>
.tab-container {
  display: block;
  margin: 0;
  padding: 0.2em 0.2em 0;
  border: 1px solid #5180d8;
  background-color: #5180d8;
  font-weight: bold;
  font-size: 12px;
  line-height: 1.3;
  height: 34px;
}
// margin-bottom: 0;
// padding-bottom: 1px;
.tab-item {
  list-style: none;
  float: left;
  top: 1px;
  position: relative;
  margin: 0 0.2em 1px 0;
  border-bottom: 0 !important;
  border: 1px solid #5180d8;
  color: #000000;
  background: #eff3ff 50% 50% repeat-x;
  white-space: nowrap;
  cursor: pointer;
  &.active {
    cursor: text !important;
    border: 1px solid #79b7e7;
    background: #f5f8f9;
    font-weight: bold;
    color: #e17009;
    height: 30px;
    &:hover {
      background-color: #f5f8f9;
    }
  }
  &:hover {
    background-color: #fdeaa6;
  }
  span {
    float: left;
    padding: 0.5em 1em;
    text-decoration: none;
  }
}
</style>
