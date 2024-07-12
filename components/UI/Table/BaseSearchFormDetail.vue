<template>
  <tr class="search-form">
    <td v-for="item in listSearch" v-show="!item.hidden" :key="item.key">
      <input
        v-if="
          item.filter === 'input' ||
          item.filter === 'autocomplete' ||
          item.filter === 'datetime'
        "
        v-model="searchFormTemp[item.key]"
        :maxLength="item?.maxLength || '256'"
        type="text"
        :style="{
          opacity: '1 !important',
        }"
      />

      <input
        v-else-if="item.filter === 'number'"
        v-model="searchFormTemp[item.key]"
        type="text"
        :maxLength="item?.maxLength || '30'"
        class="number"
        oninput="this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');"
        :style="{
          opacity: '1 !important',
        }"
      />

      <!-- case headerFiler is select & dataTable is checkbox -->
      <b-form-select
        v-else-if=" item.filter === 'checkbox' && item.headerFilter === 'select'"
        v-model="searchFormTemp[item.key]"
        :options="item.options"
        class="select"
        :style="{
          opacity: '1 !important',
        }"
      ></b-form-select>

      <input
        v-else-if="item.filter === 'checkbox' && item.key !== 'checkbox'"
        v-model="searchFormTemp[item.key]"
        type="checkbox"
        :style="{
          opacity: '1 !important',
        }"
      />

      <b-form-select
        v-else-if="item.filter === 'select'"
        v-model="searchFormTemp[item.key]"
        :options="item.options"
        class="select"
        :style="{
          opacity: '1 !important',
        }"
      ></b-form-select>
    </td>

    <div
      v-if="loading"
      class="spinner content d-flex justify-content-center align-items-center"
    >
      <b-spinner
        b-spinner
        style="width: 3rem; height: 3rem"
        label="Loading..."
      ></b-spinner>
    </div>
  </tr>
</template>

<script>
import systemMixins from '@/mixins/system'
import api from '@/api/api'

export default {
  components: {},

  mixins: [systemMixins],

  props: {
    listSearch: {
      type: Array,
      default: () => [],
    },

    listItemCode: {
      type: Array,
      default: () => [],
    },

    searchForm: {
      type: Object,
      default: () => ({}),
    },

    tableType: {
      type: String,
      default: () => '',
    },

    customerId: {
      type: Number,
      default: () => null,
    },
  },

  data() {
    return {
      searchFormTemp: JSON.parse(JSON.stringify(this.searchForm)),
      loading: false,
    }
  },

  watch: {
    searchFormTemp: {
      handler(value) {
        if (this.customerId && this.getItemCode()?.itemId && value.quantity) {
          this.getPriceOrder({
            itemID: this.getItemCode()?.itemId,
            quantity: value.quantity,
          })
        }
        this.emitForm()
      },
      deep: true,
      immediate: true,
    },

    'searchFormTemp.quantity': {
      handler(value) {
        const quantity = this.parseStringToFloat(value)
        const price = this.parseStringToFloat(this.searchFormTemp.price)
        const amount = quantity * price
        this.searchFormTemp.amount = amount || null
      },
    },

    'searchFormTemp.price': {
      handler(value) {
        const price = this.parseStringToFloat(value)
        const quantity = this.parseStringToFloat(this.searchFormTemp.quantity)
        const amount = quantity * price
        this.searchFormTemp.amount = amount || null
      },
    },
  },

  methods: {
    getItemCode() {
      const item = this.listItemCode.find(
        (item) => item && item.key === this.searchFormTemp.itemCode
      )

      if (item) return item
      return null
    },

    async getPriceOrder({ itemID, quantity }) {
      const params = {
        customerID: this.customerId,
        itemID,
        quantity,
      }

      try {
        this.loading = true
        const response = await api('getPriceOrder', params)
        if (response.status === 200) {
          this.searchFormTemp.price = response?.data
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    emitForm() {
      this.$emit('changeSearchForm', this.searchFormTemp)
    },
  },
}
</script>

<style lang="scss" scoped>
.search-form {
  background-color: #0e76bc;
  position: sticky;
  top: 28px;
  left: 0;
  z-index: 2;
  cursor: pointer;

  td {
    padding: 4px;
    border-left: 1px solid #5180d8;
  }

  input {
    width: 100%;
    border: 1px solid #aaa;
    height: 20px;
    border-radius: 2px;
    padding: 2px;
  }

  input[type='checkbox'] {
    height: 13px;
  }

  .select {
    height: 20px;
    font-size: 12px;
    border: 1px solid #aaa;
    background-color: #fff;
    border-radius: 2px;
    padding: 0 8px;
  }

  .input-disabled {
    cursor: no-drop;
  }
  .number {
    text-align: right;
  }
}
</style>
