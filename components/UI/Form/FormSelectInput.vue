<template>
  <div>
    <td class="label">
      <span>{{ label }}</span>
    </td>
    <td class="input">
      <b-form-select
        :value="value"
        :options="options"
        class="select"
      ></b-form-select>
    </td>
    <td class="info">&nbsp;</td>
  </div>
</template>
<script>
export default {
  props: {
    selectValue: {
      type: [Number, String],
      default: () => 0,
    },
    label: {
      type: String,
      default: () => '',
    },
    options: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      value: '',
    }
  },
  selectValue: {
    numberValue: {
      handler(val) {
        this.value = val
      },
      immediate: true,
      deep: true,
    },
  },
}
</script>
<style lang="scss" scoped>
td input {
  width: 100%;
  padding: 2px;
  border: 1px solid #aaa;
  background-color: #fff;
  border-radius: 2px;
}

td.label {
  padding: 2px;
}

td.input {
  padding: 2px;

  .number {
    text-align: right;
  }
}
td.info {
  padding: 3px;
}
</style>
