<template>
  <div v-if="isError">
    <ul v-show="hasError" class="error-list">
      <li v-for="(message, index) in listErrorMessage" :key="index">
        <span v-if="message.fieldName">[{{ message.fieldName }}]</span>
        {{ message.text }}
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    isError: {
      type: Boolean,
      required: true,
      default: false,
    },
    listErrorMessage: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {}
  },
  computed: {
    hasError() {
      return this.listErrorMessage.length > 0
    },
  },
}
</script>
<style lang="scss" scoped>
.error-list {
  list-style-type: disc;
  padding-left: 20px;
  margin-top: 5px;
  margin-bottom: 5px;
  font-weight: bold;
  color: #f00;
  border: 1px solid #f00;
  font-size: 12px;
  li {
    height: 20px;
    line-height: 20px;
  }
}
::marker {
  color: red;
  unicode-bidi: isolate;
  font-variant-numeric: tabular-nums;
  text-transform: none;
  text-indent: 0px !important;
  text-align: start !important;
  text-align-last: start !important;
}
</style>
