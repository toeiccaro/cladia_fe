<template>
  <div class="notification-item mt-2">
    <span class="notification-icon mr-4">
      <BIconBell class="icon" />
      <span class="number">{{ number }}</span>
    </span>
    {{ number }} {{ label }}
    <span class="link" @click="handleOpenAllApplication(cardId)">{{
      $t('lbl_CheckNow_0')
    }}</span>
  </div>
</template>
<script>
import { BIconBell } from 'bootstrap-vue'
export default {
  components: {
    BIconBell,
  },
  props: {
    number: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
      required: true,
    },
    cardId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {}
  },
  methods: {
    handleOpenAllApplication(cardId) {
      this.$emit('openApplication', cardId)
    },
  },
}
</script>
<style lang="scss" scoped>
.notification-item {
  position: relative;
  .notification-icon {
    position: relative;

    .icon {
      height: 14px;
      width: 14px;
    }
    .number {
      position: absolute;
      font-weight: 700;
      color: red;
      left: 9px;
      top: -8px;
    }
  }
  .link {
    color: #007bff;
    cursor: pointer;
  }
}
</style>
