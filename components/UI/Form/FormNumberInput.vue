<template>
  <div>
    <td class="label">
      <span>{{ label }}</span>
    </td>
    <td class="input">
      <input
        v-model="itemMaster.price"
        name="txtPrice"
        type="text"
        class="number"
        oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
      />
    </td>
    <td class="info">&nbsp;</td>
  </div>
</template>
<script>
export default {
  props: {
    numberValue: {
      type: [Number, String],
      default: () => 0,
    },
    label: {
      type: String,
      default: () => '',
    },
  },
  data() {
    return {
      value: 0,
    }
  },
  watch: {
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
