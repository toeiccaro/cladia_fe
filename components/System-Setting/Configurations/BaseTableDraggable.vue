<template>
  <div class="position-relative">
    <div class="table-container">
      <table id="table-resize" :class="{ 'w-100': fullWidth }">
        <thead class="header-name">
          <th
            v-for="(item, index) in headersComponent"
            :key="`th${index}`"
            :style="{
              minWidth: item.width,
              width: item.width,
              maxWidth: item.width,
            }"
            class="table-item row-header"
          >
            <div class="sys-flex-center w-100">
              <slot v-if="item.type === 'slot'" :name="`${item.key}`"></slot>
              <div v-else class="hide-text w-100">{{ item.name }}</div>
            </div>
          </th>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in dataComponent"
            :key="`tr${index}`"
            class="row-data"
          >
            <td
              v-for="(headerItem, headerIndex) in headersComponent"
              :key="`item-${headerIndex}-${index}`"
              :style="{
                minWidth: headerItem.width,
                width: headerItem.width,
                maxWidth: headerItem.width,
              }"
              class="table-item position-relative hide-text"
            >
              <template>
                <slot
                  v-if="item[headerItem.key].type === 'slot'"
                  :name="headerItem.key + '-' + index"
                ></slot>
                <div
                  v-else-if="item[headerItem.key].type === 'input'"
                  class="hide-text w-100"
                >
                  <b-form-input
                    v-model="item[headerItem.key].value"
                    class="table-input-item"
                    :class="{ 'font-weight-bold': item[headerItem.key].bold }"
                    :style="{
                      textAlign: item[headerItem.key].align,
                      color: item[headerItem.key].color,
                    }"
                    @keyup.enter="saveData"
                  ></b-form-input>
                </div>
                <div
                  v-else-if="item[headerItem.key].type === 'input-number'"
                  class="hide-text w-100"
                >
                  <b-form-input
                    v-model="item[headerItem.key].value"
                    v-limit-number="{
                      min: 0,
                      max: 9,
                    }"
                    oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
                    class="table-input-item"
                    :class="{ 'font-weight-bold': item[headerItem.key].bold }"
                    :style="{
                      textAlign: item[headerItem.key].align,
                      color: item[headerItem.key].color,
                    }"
                    @keyup.enter="saveData"
                  ></b-form-input>
                </div>
                <div
                  v-else-if="item[headerItem.key].type === 'select'"
                  class="hide-text w-100"
                >
                  <b-form-select
                    v-model="item[headerItem.key].value"
                    :options="item[headerItem.key].options"
                    class="table-select-item"
                    :class="{ 'font-weight-bold': item[headerItem.key].bold }"
                    :style="{
                      textAlign: item[headerItem.key].align,
                      color: item[headerItem.key].color,
                    }"
                  ></b-form-select>
                </div>
                <div
                  v-else
                  :style="{
                    textAlign: item[headerItem.key].align,
                    color: item[headerItem.key].color,
                  }"
                  :class="{ 'font-weight-bold': item[headerItem.key].bold }"
                  class="hide-text w-100"
                >
                  <span
                    v-html="keepTextSpaces(item[headerItem.key].value)"
                  ></span>
                </div>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import systemMixins from '@/mixins/system'
export default {
  name: 'BaseTableDraggable',
  mixins: [systemMixins],
  props: {
    header: {
      type: Array,
      default: () => [
        {
          key: 'address',
          name: 'address',
          width: 300,
          filter: 'select',
          options: ['test', 'address', 'abc'],
        },
      ],
    },
    data: {
      type: Array,
      default: () => [],
    },
    fullWidth: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      headersComponent: [],
      dataComponent: [],
    }
  },
  watch: {
    header: {
      handler(value) {
        this.headersComponent = JSON.parse(JSON.stringify(value))
      },
      deep: true,
      immediate: true,
    },
    data: {
      handler(value) {
        this.dataComponent = JSON.parse(JSON.stringify(value))
      },
      deep: true,
      immediate: true,
    },

    dataComponent: {
      handler(value) {
        this.$emit('dataChanged', value || [])
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    keepTextSpaces(value) {
      return value === 0
        ? value
        : value && value.toString().replace(/ /g, '&nbsp;')
    },

    saveData() {
      this.$emit('saveData')
    },
  },
}
</script>

<style lang="scss" scoped>
#table-resize {
  height: fit-content;
  position: relative;

  .header-name {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 1;
  }
}

.table-container {
  overflow: auto;
  width: 100%;
  border: 1px solid #5180d8;
  border-bottom: none;
  font-size: 12px;
  height: calc(100% - 22px);
}

th,
td {
  height: 22px;
}

th,
.header-bg {
  background: #eff3ff 50% 50% repeat-x;
}

.row-header {
  position: relative;
  text-align: center;
}

table {
  border-spacing: 0;
}

.table-item {
  border: 1px solid #5180d8;
  border-top: none;
  border-left: none;
  padding: 0 4px;
  & .table-input-item,
  .table-select-item {
    padding: 2px;
  }
  & .table-input-item {
    border: none;
    height: 16px;
    line-height: 8px;
  }
  & .table-select-item {
    height: 18px;
    // line-height: 9px;
  }
}

.table-item:first-child {
  border-left: none;
}

table {
  table-layout: fixed;
  overflow: auto;
}

.hide-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
