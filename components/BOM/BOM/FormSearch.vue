<template>
  <div>
    <table cellpadding="0" cellspacing="0" class="edit">
      <tbody>
        <tr>
          <td class="label">
            <span id="ItemCode1">{{ $t('lbl_ItemCode_0') }}</span>
          </td>
          <td class="input">
            <input
              :value="getPayloadBom.itemCode"
              name="txtItemCode"
              type="text"
              maxlength="256"
              @input="
                (event) =>
                  updatePayloadBom({
                    data: event.target.value,
                    path: 'itemCode',
                  })
              "
              @keyup.enter="searchBom"
            />
          </td>
          <td class="info"></td>
          <td class="label">
            <span id="ItemName1">{{ $t('lbl_ItemName_0') }}</span>
          </td>
          <td class="input">
            <input
              :value="getPayloadBom.itemName"
              name="txtItemName"
              type="text"
              maxlength="256"
              @input="
                (event) =>
                  updatePayloadBom({
                    data: event.target.value,
                    path: 'itemName',
                  })
              "
              @keyup.enter="searchBom"
            />
          </td>
          <td class="info">&nbsp;</td>
          <td class="label">
            <span id="ItemType">{{ $t('lbl_ItemType_0') }}</span>
          </td>
          <td class="input">
            <b-form-select
              :value="getPayloadBom.itemType"
              :options="itemTypeOptions"
              class="select"
              @change="
                (event) => updatePayloadBom({ data: event, path: 'itemType' })
              "
            />
          </td>
          <td class="info"></td>
          <td class="info"></td>
          <td class="label"></td>
          <td class="input"></td>
          <td class="info"></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import api from '@/api/api'

export default {
  data() {
    return {
      itemTypeOptions: [],
    }
  },
  computed: {
    ...mapGetters('filterSort', ['getPayloadBom']),
  },
  async created() {
    await this.getItemTypeFromAPI()
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_BOM: 'filterSort/UPDATE_PAYLOAD_BOM',
    }),
    searchBom() {
      this.$emit('search')
    },
    updatePayloadBom({ data, path }) {
      this.UPDATE_PAYLOAD_BOM({
        path,
        data,
      })
    },
    async getItemTypeFromAPI() {
      const res = await api('getItemType')
      if (res) {
        this.itemTypeOptions = res.data.map((item) => {
          return {
            text: this.$t(item.key),
            value: item.keyId,
          }
        })
        this.itemTypeOptions.unshift({
          text: '',
          value: '',
        })
      }
    },
  },
}
</script>
<style lang="scss" scoped>
table {
  width: 100%;
}
table.edit {
  width: 100%;
  background: #ebeff6;
  td.input {
    width: 20% !important;
    .select {
      font-size: 12px;
      border: 1px solid #aaa;
      background-color: #fff !important;
      border-radius: 2px;
    }
  }
  td input {
    width: 100%;
    padding: 2px;
    height: 20px;
  }
  td.label {
    padding: 2px;
    width: 10% !important;
  }
}
</style>
