<template>
  <div
    v-click-outside="hideDropdownMenu"
    class="autocomplete__wrapper"
    tabindex="0"
    @keyup.enter="handleEnter(currentSelectIndex)"
    @keydown.down.stop.prevent="moveCursorDown()"
    @keydown.up.stop.prevent="moveCursorUp()"
  >
    <div class="input__autocomplete">
      <input
        class="custom-select"
        ref="inputAutocomplete"
        type="text"
        :value="selectedItem.text"
        :class="[inputClass]"
        :disabled="disableInput"
        :placeholder="placeholder"
        @input="handleInput"
        @focus="showDropdownMenu = true"
        @click="showDropdownMenu = true"
      />
    </div>
    <div
      v-show="showDropdownMenu"
      ref="dropdownAutoComplete"
      class="dropdown__autocomplete"
    >
      <div
        v-for="(item, index) in filteredItems"
        :key="index"
        class="dropdown__item"
        :class="{
          'active--option': currentSelectIndex === index,
        }"
        @click="setSelectedItem(item, index)"
      >
        <span v-if="item.prependText">{{ item.prependText }}</span>
        <span>{{ item[bindingText] }}</span>
        <span v-if="item.appendText">{{ item.appendText }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  prop: ['value'],

  model: {
    prop: 'value',
    event: 'hit',
  },

  props: {
    items: {
      type: Array,
      default: () => [],
    },

    initialText: {
      type: String,
      default: () => '',
    },

    initialValue: {
      type: [String, Number],
      default: () => '',
    },

    bindingText: {
      type: String,
      default: () => 'text',
    },

    bindingValue: {
      type: String,
      default: () => 'value',
    },

    appendText: {
      type: String,
      default: () => 'text',
    },

    prependText: {
      type: String,
      default: () => 'text',
    },

    disableSearch: {
      type: Boolean,
      default: () => false,
    },

    disableInput: {
      type: Boolean,
      default: () => false,
    },

    placeholder: {
      type: String,
      default: () => '',
    },

    inputClass: {
      type: String,
      default: () => '',
    },

    showMenuOnNoText: {
      type: Boolean,
      default: () => false,
    },

    lineID: {
      type: Number,
      default: () => null,
    },
  },

  data() {
    return {
      selectedItem: {
        text: this.initialText,
        value: this.initialValue,
      },
      showDropdownMenu: false,
      filteredItems: this.items,
      currentSelectIndex: -1,
      flagChooseByOption: false,
      isDisableSearch: true,
    }
  },

  watch: {
    selectedItem: {
      deep: true,
      handler(value) {
        this.filterData()
        this.$emit('hit', value[this.bindingValue] || undefined)
        // if (this.filteredItems?.length > 0 && !this.flagChooseByOption) {
        //   this.showDropdownMenu = true
        // }
        if (this.flagChooseByOption) {
          this.flagChooseByOption = false
        }
      },
    },
    'selectedItem.text': {
      handler(value) {
        if (value) {
          this.$emit('handleItemCode', {
            lineID: this.lineID,
          })
        }
      },
    },
    items: {
      deep: true,
      handler(value) {
        this.filteredItems = value
      },
    },

    initialValue: {
      handler(value) {
        this.selectedItem.value = value
      },
    },

    initialText: {
      handler(value) {
        this.selectedItem.text = value
      },
    },
    selectedAndOptions: {
      handler(newValue) {
        this.currentSelectIndex = newValue.options.findIndex(
          (item) => item.value === newValue.selected
        )
      },
      deep: true,
    },
  },
  computed: {
    selectedAndOptions() {
      return {
        selected: this.initialValue,
        options: this.filteredItems,
      }
    },
  },
  methods: {
    setSelectedItem(item, idx) {
      this.isDisableSearch = true
      this.selectedItem = item
      this.$emit('change', item)
      this.hideDropdownMenu()
      this.currentSelectIndex = idx
    },
    handleEnter(currentSelectIndex) {
      const matchingItems = this.filteredItems.find(
        (item) => item.text === this.selectedItem.text
      )
      if (currentSelectIndex === -1 && !matchingItems) {
        this.hideDropdownMenu()
        this.flagChooseByOption = true
        return
      }
      if (currentSelectIndex === -1 && matchingItems) {
        this.selectedItem = matchingItems
      } else {
        this.selectedItem = this.filteredItems[currentSelectIndex]
      }
      this.$emit('handleEnter')
      this.hideDropdownMenu()
      this.flagChooseByOption = true
      this.$refs.inputAutocomplete.focus()
    },
    hideDropdownMenu() {
      return setTimeout(() => (this.showDropdownMenu = false), 0)
    },

    handleInput(event) {
      this.isDisableSearch = false
      this.selectedItem = {
        ...this.selectedItem,
        text: event.target.value || '',
        // value: undefined,
      }

      this.$emit('input', this.selectedItem)
      this.$emit('text-change', event.target.value)
    },

    filterData() {
      if (this.isDisableSearch) {
        this.filteredItems = this.items

        if (this.selectedItem.text) {
          return this.hideDropdownMenu()
        }

        return this.showMenuOnNoText && (this.showDropdownMenu = true)
      }

      this.filteredItems = this.items.filter((item) =>
        `${item.prependText} ${item.text} ${item.appendText}`
          ?.toLowerCase()
          .includes(this.selectedItem?.text?.toLowerCase())
      )
    },
    setCursor(index) {
      this.currentSelectIndex = index
    },

    moveCursorUp() {
      let newPosition
      if (this.currentSelectIndex === -1) {
        newPosition = this.filteredItems.length - 1
      } else if (this.currentSelectIndex !== 0) {
        newPosition = this.currentSelectIndex - 1
      } else {
        newPosition = this.currentSelectIndex
      }
      this.scrollIntoView(newPosition)
      this.setCursor(newPosition)
    },
    moveCursorDown() {
      if (this.showDropdownMenu) {
        let newPosition
        if (this.currentSelectIndex === -1) {
          newPosition = 0
        } else if (this.currentSelectIndex !== this.filteredItems.length - 1) {
          newPosition = this.currentSelectIndex + 1
        } else {
          newPosition = this.currentSelectIndex
        }
        if (newPosition > 4) {
          this.scrollIntoView(newPosition)
        }
        this.setCursor(newPosition)
      }
    },
    scrollIntoView(newPosition) {
      const list = this.$refs.dropdownAutoComplete
      const allList = list.childNodes
      if (allList[newPosition].scrollIntoViewIfNeeded) {
        allList[newPosition].scrollIntoViewIfNeeded(false)
      } else {
        const diff = list.offsetTop - list.scrollTop
        if (diff < 0 || diff > list.offsetHeight - list.offsetHeight) {
          const listElement = list || list.parentElement
          list.scrollTop = listElement.offsetTop
        }
      }
    },
  },
}
</script>

<style lang="scss">
.autocomplete__wrapper {
  position: relative;
}
.input__autocomplete input:first-child {
  border: 1px solid #aaa;
  border-radius: 2px;
  height: 20px;
  font-size: 12px;
  margin-bottom: 2px;
  width: 100%;
  padding: 2px;
}
.dropdown__autocomplete {
  max-height: 206px;
  min-height: 206px;
  overflow-y: auto;
  border: 1px solid #5180d8;
  padding: 2px;
  bottom: 0;
  left: 0;
  width: 100%;
  top: 100%;
  position: absolute;
  background: #fff;
  z-index: 99;
}
.dropdown__item {
  padding: 2px 4px;
  cursor: pointer;
  &.active--option {
    border: 1px solid #5180d8;
    background: #fdeaa6;
  }
}
.dropdown__item:hover {
  border: 1px solid #5180d8;
  background: #fdeaa6;
}
</style>
