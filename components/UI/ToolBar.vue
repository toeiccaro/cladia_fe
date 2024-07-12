<template>
  <div class="tool-bar">
    <div
      v-for="tool in listTools"
      :key="tool.key"
      class="tool-bar--item"
      :class="{
        disabled: tool.disabled,
        'btn-save-border':
          tool.key === 'saveEnterprise' ||
          tool.key === 'save' ||
          tool.key === 'queryInventory' ||
          isShowBorderSave,
      }"
      @click="
        (event) =>
          isMenuType(tool)
            ? false
            : changeActive(tool.key, tool.disabled, event)
      "
    >
      <b-dropdown
        v-if="tool.type === 'menu' && !tool.disabled"
        variant="link"
        toggle-class="text-decoration-none p-0"
        no-caret
        menu-class="p-0"
        class="menu-export"
      >
        <template #button-content>
          <img :src="tool.icon" alt="icon" />
        </template>
        <b-dropdown-item
          v-for="(toolItem, index) in tool.items"
          :key="index + Date.now()"
          class="text-center dropdown__item"
        >
          <button @click="toolItem.action">
            {{ $t(toolItem.text) }}
          </button>
        </b-dropdown-item>
      </b-dropdown>
      <img
        v-else
        :src="tool.icon"
        alt="icon"
        :style="{ width: tool.width, height: tool.height }"
      />
      {{ tool.label }}
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  props: {
    listTools: {
      type: Array,
      required: false,
      default: () => [],
    },
    showBorderSave: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isShowBorderSave: this.showBorderSave,
    }
  },
  watch: {
    isShowBorderSave: {
      deep: true,
      immediate: true,
      handler(newVal) {},
    },
  },
  mounted() {
    window.addEventListener('click', function (e) {
      const listClass = document.getElementsByClassName('tool-bar--item')
      for (let i = 0; i < listClass.length; i++) {
        if (listClass[i].classList.contains('btn-save-border')) {
          listClass[i].classList.remove('btn-save-border')
        }
      }
    })
  },
  methods: {
    isMenuType(tool) {
      return tool.type === 'menu'
    },
    changeActive(key, isDisabled, event) {
      if (!isDisabled) {
        this.$emit('changeActiveToolBar', key, event)
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.btn-save-border {
  -webkit-box-shadow: inset 0px 0px 0px 2px #000000;
  -moz-box-shadow: inset 0px 0px 0px 2px #000000;
  box-shadow: inset 0px 0px 0px 2px #000000;
  border-radius: 5px !important;
}

.tool-bar--item:hover {
  color: rgb(235, 0, 0);
  background-color: #f3f3f3;
}
.tool-bar {
  display: flex;
  text-align: left;
  margin: 6px 0px 10px 0px;
  font-size: 12px;
  width: 100%;
  .tool-bar--item {
    justify-content: space-between;
    border: 3px;
    cursor: pointer;
    text-align: center;
    padding: 4px 10px;
    border: 0;
    margin: 2px;
    display: flex;
    align-items: center;
    flex-direction: column;
    img {
      width: 24px;
      height: 24px;
    }
    button {
      padding: 0 !important;
    }
    .dropdown__item {
      background: #ececec !important;
      border: 1px solid #767676 !important;
    }
    .dropdown__item:not(&:last-child) {
      margin-bottom: 1px !important;
    }
  }
}
.disabled {
  color: #bababa;
  cursor: default !important;
  &:hover {
    background-color: transparent !important;
    color: #bababa !important;
  }
}
::v-deep .dropdown-item:active {
  color: #000000;
  background-color: #ececec !important;
}
::v-deep .dropdown-item {
  height: 25px;
  padding: 4px;
}
::v-deep .dropdown-menu {
  top: 12px !important;
}
</style>
