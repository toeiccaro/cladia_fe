<template>
  <div>
    <ToolBar
      :list-tools="listToolBars"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <div class="select-language">
      <span>{{ $t('lbl_SelectLanguage_0') }}</span>
      <b-form-select
        v-model="languageId"
        :options="optionsLanguageName"
        class="select"
      ></b-form-select>
    </div>
    <div class="table-language">
      <table>
        <tbody>
          <tr>
            <th v-for="(header, index) in headersTable" :key="index">
              {{ header }}
            </th>
          </tr>
          <tr
            v-for="(item, index) in listKeyCodeLanguage"
            :key="`${item.keyCode}_${index}`"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ item.keyCode }}</td>
            <td>{{ item.langName }}</td>
            <td
              class="delete-language"
              @click="handleButtonDelete(item.languageId)"
            >
              x
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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
  </div>
</template>
<script>
import ToolBar from '@/components/UI/ToolBar'
import api from '~/api/api'

export default {
  components: { ToolBar },
  data() {
    return {
      loading: false,
      listToolBars: [
        {
          key: 'add',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'back',
          label: this.$t('btn_btnBack_0'),
          icon: '/images/back.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      languageId: 1,
      optionsLanguageName: [],
      headersTable: [
        'NO.',
        this.$t('lbl_KeyCode_0'),
        this.$t('lbl_LanguageName_0'),
        '',
      ],
      listKeyCodeLanguage: [],
    }
  },
  async created() {
    await Promise.all([this.getLanguageName(), this.getKeyCodeLanguage()])
  },
  methods: {
    changeActiveToolBar(key) {
      switch (key) {
        case 'add':
          return this.handleButtonAdd()
        case 'back':
          return this.$router.push({
            path: `/${this.$i18n.locale}/system-maintenance/language`,
          })
        case 'close':
          return this.$router.push(this.localePath({ path: '/' }))
        default:
          break
      }
    },
    async handleButtonAdd() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmAdd_0'))
        if (!confirm) {
          return
        }
        this.loading = true
        const payload = {
          isValid: 1,
          languageId: this.languageId,
        }
        const existLanguage = this.listKeyCodeLanguage.find(
          (item) => item.languageId === this.languageId
        )
        if (existLanguage) {
          window.alert(this.$t('msg_Exists_0'))
          return
        }
        const response = await api('saveLanguageName', payload)
        if (response && response?.status === 200) {
          await this.getKeyCodeLanguage()
        }
        this.loading = false
      } catch (error) {
      } finally {
        this.loading = false
      }
    },
    async handleButtonDelete(languageId) {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmDel_0'))
        if (!confirm) {
          return
        }
        this.loading = true
        const payload = {
          isValid: 0,
          languageId,
        }
        const listLanguageCannotDelete = ['1', '2', '3']
        if (listLanguageCannotDelete.includes(languageId)) {
          window.alert(this.$t('msg_SystmLanguage_0'))
          return
        }
        const response = await api('saveLanguageName', payload)
        if (response && response?.status === 200) {
          await this.getKeyCodeLanguage()
        }
        this.loading = false
      } catch (error) {}
    },

    async getLanguageName() {
      try {
        this.loading = true
        const response = await api('getOptionsLanguageName', this.$i18n.locale)
        this.optionsLanguageName = response?.data?.map((item) => {
          item.text = item.langName
          item.value = item.langId
          return item
        })
        this.loading = false
      } catch (error) {
      } finally {
        this.loading = false
      }
    },
    async getKeyCodeLanguage() {
      try {
        this.loading = true
        const response = await api('getKeyCodeLanguages', this.$i18n.locale)
        this.listKeyCodeLanguage = response?.data
        this.loading = false
      } catch (error) {
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.select-language {
  padding: 6px;
  text-indent: 20px;
  border: 1px solid #5180d8;
  margin-bottom: 5px;
  display: flex;
  align-items: center;

  .select {
    margin-left: 4px;
    height: 20px;
    font-size: 12px;
    border: 1px solid #aaa;
    background-color: #fff;
    border-radius: 2px;
    width: 200px;
  }
}
.table-language {
  table {
    width: 100%;
    border-collapse: collapse;
    th {
      line-height: 23px;
      margin-top: 1px;
      margin-bottom: 1px;
      text-align: center;
      border: 1px solid #5180d8;
      vertical-align: middle;
      background-color: #eff3ff;
    }
    td {
      line-height: 23px;
      border: 1px solid #5180d8;
      text-align: center;
    }
  }
}
.delete-language {
  color: #5180d8;
  text-decoration: underline;
  cursor: pointer;
}
</style>
