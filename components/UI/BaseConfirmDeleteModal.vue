<template>
  <div v-show="isShow" class="modal-delete__overlay">
    <div
      v-click-outside="handleClickOutsideModal"
      id="modalDraggable"
      class="modal-delete-wrapper"
    >
      <div class="modal__header">
        <div class="header__title">
          <span>{{ modalData.headerTitle }}</span>
        </div>
        <div class="header__icon" @click="handleCancel">
          <span class="icon__close"></span>
        </div>
      </div>
      <div class="modal__body">
        <span>{{ $t(modalData.bodyText) }}</span>
      </div>
      <div class="modal__footer">
        <div class="footer__button button__delete" @click="handleDelete">
          <div class="footer__icon">
            <span class="icon__delete"></span>
          </div>
          <div class="button__text">
            <span>{{ $t('btn_btnDel_0') }}</span>
          </div>
        </div>
        <div class="footer__button button__cancel" @click="handleCancel">
          <div class="footer__icon">
            <span class="icon__cancel"></span>
          </div>
          <div class="button__text">
            <span>{{ $t('btn_btnCancel_0') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseConfirmDeleteModal',
  props: {
    modalData: {
      type: Object,
      default: () => ({
        headerTitle: '删除',
        bodyText: 'msg_ConfirmDel_0',
      }),
    },
    isShow: {
      type: Boolean,
      default: false,
    },
    pointerEvent: {
      type: PointerEvent,
      default: () => null,
    },
  },
  data() {
    return {
      isMoved: false,
      isFirstShow: true,
      extraPositionFromTop: 20,
      extraPositionFromLeft: -20,
    }
  },
  watch: {
    isShow: {
      handler(shown) {
        if (shown) {
          this.isFirstShow = true
        }

        const shouldSetDefaultPosition = shown && !this.isMoved
        if (shouldSetDefaultPosition) {
          const draggableElement = document.getElementById('modalDraggable')

          const positionFromTop =
            this.pointerEvent.clientY + this.extraPositionFromTop
          const positionFromLeft =
            this.pointerEvent.clientX + this.extraPositionFromLeft

          draggableElement.style.top = `${positionFromTop}px`
          draggableElement.style.left = `${positionFromLeft}px`
        }
      },
    },
  },
  mounted() {
    const draggableElement = document.getElementById('modalDraggable')
    this.draggable(draggableElement)
  },
  methods: {
    handleDelete() {
      this.$emit('delete')
    },

    handleCancel() {
      this.$emit('cancel')
    },

    handleClickOutsideModal() {
      if (this.isFirstShow) {
        return (this.isFirstShow = false)
      }

      this.handleCancel()
    },

    draggable(container) {
      const events = ['mousedown', 'touchstart']
      events.forEach((event) => {
        container.addEventListener(event, (e) => {
          const offsetX = e.clientX - parseInt(getComputedStyle(container).left)
          const offsetY = e.clientY - parseInt(getComputedStyle(container).top)

          const mouseMoveHandler = (e) => {
            container.style.top = e.clientY - offsetY + 'px'
            container.style.left = e.clientX - offsetX + 'px'
            this.isMoved = true
          }

          const reset = () => {
            removeEventListener('mousemove', mouseMoveHandler)
            removeEventListener('mouseup', reset)
          }

          addEventListener('mousemove', mouseMoveHandler)
          addEventListener('mouseup', reset)
        })
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-delete__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  z-index: 998;
}
.modal-delete-wrapper {
  position: fixed;
  width: 250px;
  height: 120px;
  top: 50%;
  left: 50%;
  padding: 2px;
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
  border-top: 2px solid #5180d8;
  display: flex;
  justify-content: flex-end;
  text-align: center;
  padding-top: 7px;
  margin: 0 2px;
  gap: 5px;
}
.footer__button {
  width: 66px;
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
.icon__close,
.icon__delete,
.icon__cancel {
  width: 16px;
  height: 16px;
  display: inline-block;
  background-image: url('@/assets/icon/ui-icon.png');
}

.icon__delete {
  background-position: -144px -128px;
}

.icon__close {
  background-position: -96px -128px;
}
.icon__cancel {
  background-position: 0 -128px;
}
.header__title,
.header__icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.header__icon {
  width: 18px;
  height: 18px;
  margin: auto 0;
  cursor: pointer;
  &:hover {
    background-color: #fdeaa6;
  }
}
.footer__icon,
.button__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.button__text {
  padding-left: 4px;
}
</style>
