<template>
  <div :class="!isMenuRoot ? 'sidebar-item' : 'sidebar-head'">
    <div
      :class="{
        'bg-cladia': isMenuRoot,
      }"
      class="sidebar-head"
      @click="getMenuSidebar(menuItem.key)"
    >
      <div class="word__nobreak">
        {{ $t(menuItem.text) }}
      </div>
    </div>

    <div v-if="hasChildren" class="sidebar-child-container">
      <menu-item
        v-for="option in menuItem.options"
        :key="option.key"
        :menu-item="option"
        :get-menu-sidebar="getMenuSidebar"
      ></menu-item>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    menuItem: {
      type: Object,
      default: () => ({}),
    },

    getMenuSidebar: {
      type: Function,
      default: () => {},
    },
  },

  computed: {
    hasChildren() {
      return this.menuItem?.options?.length > 0
    },

    isMenuRoot() {
      return !this.menuItem?.isHaveParent
    },
  },
}
</script>

<style lang="scss" scoped>
.sidebar-head {
  background-color: #2a4ea1;
  color: #ffffff;
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  font-size: 14px;
  font-weight: bold;
  padding-left: 28px;
}

.word__nobreak {
  overflow: hidden;
  word-break: keep-all;
  white-space: nowrap;
}

.sidebar-item {
  line-height: 24px;
  text-align: left;
  // text-indent: 18px;
  font-size: 12px;
  cursor: pointer;
  display: block;
  margin-top: 1px;
  margin-bottom: 1px;
  border-bottom: 1px dotted #5180d8;
  font-weight: bold;
  .menu_sidebar {
    position: relative;
    .icon {
      position: absolute;
    }
  }
  &_active {
    background: #fdeaa6;
  }
}
</style>
