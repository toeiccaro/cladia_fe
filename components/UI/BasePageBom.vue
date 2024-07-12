<template>
  <div>
    <div
      class="
        pagination-container
        d-flex
        align-items-center
        justify-content-center
        position-relative
      "
    >
      <div class="pagination-number__container">
        <span v-if="total">
          <span class="mr-2">{{ `1 - ${total}` }}</span>
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
  },
}
</script>

<style lang="scss" scoped>
.pagination-container {
  font-size: 12px;
  padding: 2px;
  border-top: 1px solid #5180d8;
  height: 28px;
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
