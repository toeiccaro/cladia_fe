<template>
  <div v-if="showModal && !loading" class="modal-container">
    <div class="modal-item-master" @click="closeModal"></div>

    <div class="modal-content">
      <div class="bg-cladia d-flex align-items-center justify-content-between">
        <div class="text-white pl-2">{{ $t('lbl_columnset_0') }}</div>
        <div class="text-white pr-2 cursor-pointer" @click="closeModal">x</div>
      </div>

      <tool-bar
        :list-tools="listToolBars"
        @changeActiveToolBar="changeActiveToolBar"
      ></tool-bar>

      <div class="table-wrapper">
        <table class="table-set-column">
          <thead class="table-header">
            <tr>
              <th v-for="header in headers" :key="header.key">
                {{ header.name }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="column in listColumnHidden" :key="column.id">
              <td v-for="header in headers" :key="header.key">
                <template v-if="header.key === 'IsHidden'">
                  <b-form-checkbox v-model="column.hidden" />
                </template>

                <template v-else-if="header.key === 'FieldWide'">
                  <span>{{ column.fieldWide }}</span>
                </template>

                <template v-else>
                  <span>{{ column.labelName }}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
import ToolBar from '@/components/UI/ToolBar.vue'
import api from '~/api/api'

export default {
  name: 'BaseSetColumn',

  components: {
    ToolBar,
  },

  props: {
    columnHides: {
      type: Array,
      default: () => [],
    },

    getScolumnHides: {
      type: Function,
      default: () => {},
    },
  },

  data() {
    return {
      headers: [
        {
          key: 'FieldText',
          name: this.$t('lbl_FieldText_0'),
        },
        {
          key: 'FieldWide',
          name: this.$t('lbl_Wide_0'),
        },
        {
          key: 'IsHidden',
          name: this.$t('lbl_Hidden_0'),
        },
      ],
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
      listColumnHidden: [],
    }
  },

  computed: {},

  watch: {
    columnHides: {
      handler(value) {
        this.listColumnHidden = this.convertLabelName(
          JSON.parse(JSON.stringify(value))
        )
      },
      deep: true,
    },

    showModal: {
      handler(value) {
        if (!value) {
          this.listColumnHidden = this.convertLabelName(
            JSON.parse(JSON.stringify(this.columnHides))
          )
        }
      },
    },
  },

  methods: {
    closeModal() {
      this.showModal = false
    },
    convertLabelName(data) {
      const result = []
      data.forEach((item) => {
        switch (item.fieldName) {
          case 'Product Name':
            item.labelName = this.$t('lbl_ItemName_0')
            break
          case 'Detail Memo':
            item.labelName = this.$t('lbl_MemoDTL_0')
            break
          case 'InQuantity':
            item.labelName = this.$t('lbl_InQuantity _0')
            break
          case 'ID':
            item.labelName = 'ID'
            break
          case 'Return Quantity':
            item.labelName = this.$t('lbl_RtQuantity_0')
            break
          case 'SOLine Number':
            item.labelName = this.$t('lbl_SOLineID_0')
            break
          case 'ReceiptQuantity':
            item.labelName = this.$t('lbl_ReceiptQty_0')
            break
          case 'LotNO':
            item.labelName = this.$t('lbl_LotNo_0')
            break
          default:
            item.labelName = this.$t(
              `lbl_${item.fieldName.replace(/ +/g, '')}_0`
            )
            break
        }
        result.push(item)
      })
      return result
    },
    async changeActiveToolBar(key) {
      if (key === 'close') {
        return this.closeModal()
      }
      const confirm = window.confirm(this.$t('msg_ConfirmSave_0'))
      if (confirm) {
        try {
          this.loading = true
          await api('updateColumn', this.listColumnHidden)
          this.getScolumnHides()

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
  },
}
</script>

<style lang="scss" scoped>
.modal-container {
  top: 0;
  left: 50%;
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

.table-wrapper {
  height: 100%;
  overflow: auto;
  position: relative;

  .table-set-column {
    width: 100%;
    border: 1px solid #5180d8;
    border-top: 0;
    border-collapse: collapse;

    thead {
      position: sticky;
      top: 0;
      z-index: 999;

      th:not(last-child) {
        border-right: 1px solid #5180d8;
      }
    }

    tbody {
      tr:first-child td {
        border-top: 0 !important;
      }
    }

    table {
      border-collapse: collapse;
    }

    th,
    td {
      text-align: center;
    }

    td {
      border: 1px solid #5180d8;
    }

    .table-header {
      font-size: 12px;
      font-weight: bold;
      background: #eff3ff;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 1px solid #5180d8;
        border-left: 0;
        border-right: 0;
      }
    }
  }
}
</style>
