<template>
  <div v-show="isShow" class="modal-mrp__overlay">
    <div class="modal-mrp-wrapper">
      <div class="modal__header">
        <div class="header__title">
          <span>{{ $t('lbl_MRP_Calculate_0') }}</span>
        </div>
      </div>
      <div class="modal__label">
        <div class="header__label">
          <span>{{ $t('lbl_MRPCalculating_0') }}</span>
        </div>
      </div>
      <div class="modal__body">
        <div class="progress__percent">{{ percentCalc + '%' }}</div>
        <div class="progress__outer">
          <div
            class="progress__inner"
            :style="{ width: `${percentCalc}%` }"
          ></div>
        </div>
      </div>
      <div class="modal__footer">
        <div class="footer__button" @click="handleCancel">
          <div class="button__text">
            <span>{{ $t('btn_MRPCancel_0') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalTrackingMRPProgress',
  props: {
    modalData: {
      type: Object,
      default: () => ({
      }),
    },
    isShow: {
      type: Boolean,
      default: false,
    },
    percentCalc: {
      type: Number,
      default: 0,
    },
  },
  beforeDestroy() {
    this.$emit('modalDestroyed')
  },
  methods: {
    handleCancel() {
      this.$emit('cancel')
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-mrp__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  z-index: 998;
}
.modal-mrp-wrapper {
  position: fixed;
  width: 250px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 4px;
  border: 1px solid #5180d8;
  background: #fff;
  z-index: 998;
  &:active {
    cursor: move;
  }
}
.modal__header {
  display: flex;
  justify-content: space-between;
  height: 30px;
  border: 1px solid #5180d8;
  background-color: #5180d8;
  color: #ffffff;
  font-weight: bold;
  padding: 0 3px;
}
.modal__body {
  height: 40px;
  padding-top: 2px;
}
.modal__footer {
  height: 39px;
  display: flex;
  justify-content: center;
  text-align: center;
  padding-top: 7px;
  margin: 24px 0 2px 2px;
  gap: 5px;
}
.footer__button {
  min-width: 66px;
  height: 25px;
  border: 1px solid #5180d8;
  font-weight: bold;
  color: #000000;
  background: #eff3ff 50% 50% repeat-x;
  display: flex;
  cursor: pointer;
  &:hover {
    background: #fdeaa6;
  }
}

.header__title,
.header__label {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.button__text {
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4px;
}

.modal__label {
  display: flex;
  justify-content: space-between;
  height: 30px;
  border: 1px solid #ebeff6;
  background-color: #ebeff6;
  font-weight: bold;
  padding: 0 3px;
}

.progress__percent {
  text-align: center;
}

.progress__outer {
  border: 2px solid #333;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.progress__inner {
  width: 0;
  height: 100%;
  background-color: #2a4ea2;
  transition: all 0.3s ease;
}
</style>
