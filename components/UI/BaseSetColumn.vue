<template>
  <div
    v-if="showModal && !loading"
    class="modal-container"
    :style="{
      width: calculateContainerWidth,
    }"
  >
    <div class="modal-item-master" @click="closeModal"></div>
    <div class="modal-content">
      <div class="bg-cladia d-flex align-items-center justify-content-between">
        <div class="text-white pl-2">{{ $t('lbl_columnset_0') }}</div>
        <div class="text-white pr-2 cursor-pointer" @click="closeModal">x</div>
      </div>
      <ToolBar
        :list-tools="listToolBars"
        @changeActiveToolBar="changeActiveToolBar"
      ></ToolBar>
      <BaseTable
        disabled-filter
        :header="header"
        :ratio="ratio"
        :body="dataMapping"
        class="base-set-column"
      >
        <slot v-for="(item, index) in dataMapping" :slot="'IsHidden-' + index">
          <div
            :key="`IsHidden${index}`"
            class="d-flex align-items-center justify-content-center h-100 w-100"
          >
            <input
              v-model="data[index].hidden"
              type="checkbox"
              :disabled="data[index].disable"
              @change="changeHidden($event)"
            />
          </div>
        </slot>
      </BaseTable>
    </div>
  </div>
  <div
    v-else-if="loading"
    class="spinner content d-flex justify-content-center align-items-center"
  >
    <b-spinner
      b-spinner
      style="width: 3rem; height: 3rem"
      label="Loading..."
    ></b-spinner>
  </div>
</template>

<script>
import { BIconArrowUp, BIconArrowDown } from 'bootstrap-vue'
import { mapGetters } from 'vuex'
import ToolBar from '../UI/ToolBar.vue'
import api from '~/api/api'
import BaseTable from '~/components/UI/BaseTable.vue'

export default {
  name: 'BaseSetColumn',
  // eslint-disable-next-line vue/no-unused-components
  components: { BaseTable, BIconArrowUp, BIconArrowDown, ToolBar },
  props: {
    labelMapping: {
      type: Object,
      required: false,
      default: () => {},
    },
    body: {
      type: Object,
      required: false,
      default: () => {},
    },
    fullWidth: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      loading: false,
      showModal: false,
      listToolBars: [
        {
          key: 'save',
          label: this.$t('btn_btnSave_0'),
          icon: require('@/static/images/save.png'),
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: require('@/static/images/close.png'),
        },
      ],
      data: [],
      ratio: ['40%', '20%', '20%', '20%'],
      header: [
        {
          key: 'FieldText',
          name: this.$t('lbl_FieldText_0'),
        },
        {
          key: 'FieldWide',
          name: this.$t('lbl_Wide_0'),
        },
        {
          key: 'Order',
          name: '表示順',
        },
        {
          key: 'IsHidden',
          name: this.$t('lbl_Hidden_0'),
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['getDataColumnHides', 'getStatusExpandSideBar']),
    calculateContainerWidth() {
      if (this.fullWidth) {
        return '100%'
      }

      if (this.getStatusExpandSideBar) {
        return 'calc(100% - 215px)'
      }

      return 'calc(100% - 20px)'
    },
    dataMapping() {
      return this.data.map((item, index) => {
        return {
          FieldText: {
            orderByList: 0,
            value:
              this.labelMapping && this.labelMapping[item.fieldName]
                ? this.labelMapping[item.fieldName]
                : this.$t(`lbl_${item.fieldName}_0`),
            text: 'center',
          },
          FieldWide: {
            orderByList: 1,
            value: item.fieldWide,
            text: 'right',
          },
          Order: {
            orderByList: 2,
            value: index + 1,
            text: 'right',
          },
          IsHidden: {
            orderByList: 3,
            value: item.hidden,
            text: 'center',
            type: 'slot',
          },
        }
      })
    },
  },
  watch: {
    getDataColumnHides: {
      handler(val) {
        if (val && val.length > 0) {
          this.initDataColumn()
        }
      },
    },
  },
  created() {
    this.initDataColumn()
  },

  methods: {
    initDataColumn() {
      const dataSColumn = JSON.parse(JSON.stringify(this.getDataColumnHides))
      this.data = dataSColumn
        ? dataSColumn?.sort((a, b) => a.fieldOrder - b.fieldOrder)
        : dataSColumn?.sort((a, b) => a.fieldOrder - b.fieldOrder)
    },
    changeHidden(event) {},
    async changeActiveToolBar(key) {
      if (key === 'close') {
        return this.closeModal()
      }
      // eslint-disable-next-line no-use-before-define
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        try {
          this.loading = true
          await api('updateColumn', this.data)

          this.$emit('on-close')
          this.$emit('reloadSet')
          this.showModal = false
        } catch (err) {
          console.error(err)
        } finally {
          this.loading = false
        }
      }
    },
    closeModal() {
      this.showModal = false
      this.initDataColumn()
    },
  },
}
</script>

<style lang="scss" scoped>
.modal-container {
  top: 0;
  position: fixed;
  height: 100vh;
  z-index: 2;
}
.modal-item-master {
  position: absolute;
  top: 0;
  left: 0;
  background: rgb(204, 204, 204);
  opacity: 0.6;
  width: 100%;
  height: 100%;
  z-index: 1;
}
input {
  cursor: pointer;
}
.modal-content {
  background-color: white;
  z-index: 2;
  width: 380px;
  height: 420px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgb(42, 78, 161);
  padding: 1px;
}
.base-set-column {
  width: auto !important;
}
a.move-arrow:-webkit-any-link {
  color: -webkit-link;
  cursor: pointer;
  text-decoration: underline;
}
</style>
