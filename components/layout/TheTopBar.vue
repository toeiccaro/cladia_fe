<template>
  <div class="top-bar">
    <div class="top-bar--left">
      <div
        id="topLogo"
        :style="{ 'background-image': `url(${showUserInformation.logo})` }"
      ></div>
      <div id="idCompanyName">
        <span>{{ showUserInformation.companyName }}</span>
        <span class="ml-1">»</span>
        <span class="">{{ `【${topBar.title}】` }}</span>
        <span>»</span>
        <span class="">{{ `【${topBar.path}】` }}</span>
        <template v-if="topBar.key && !topBar.keyChildren">
          <span>-</span>
          <span>{{ `【${topBar.key}】` }}</span>
        </template>
        <template v-if="topBar.keyChildren">
          <span>-</span>
          <span>{{ `【${topBar.keyChildren}】` }}</span>
        </template>
      </div>
      <div id="idModule"></div>
    </div>
    <div class="top-bar--right">
      <span class="mr-2">{{
        `${$t('lbl_LoginUser_0')}: ${showUserInformation.loginName}`
      }}</span>
      <span>{{ `${$t('lbl_LoginTime_0')}: ${loginTime}` }}</span>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex'
import cookies from 'vue-cookies'
import api from '@/api/api'
import dateTime from '@/mixins/dateTime'
import systemMixin from '@/mixins/system'
import { SERVER_RESPONSE_CODE } from '~/constants'

export default {
  mixins: [dateTime, systemMixin],
  data() {
    return {
      showUserInformation: JSON.parse(localStorage.getItem('company')) || {},
      lang: this.$i18n.locale,
    }
  },
  async fetch() {
    try {
      const res = await api('getUserInfo')
      const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK
      if (validResponse) {
        const companyLocal = {
          companyName: res?.data?.companyName,
          currencyID: res?.data?.currencyID,
          logo: res?.data?.logo,
          loginName: res?.data?.loginName,
        }
        localStorage.setItem('company', JSON.stringify(companyLocal))
        this.SET_USER_INFO(res.data)
      }
    } catch (err) {
      console.error(err)
    }
  },
  computed: {
    ...mapGetters({
      userInfo: 'getUserInfo',
    }),

    pathList() {
      return this.$route.fullPath.split('/')
    },
    fullPath() {
      return this.$route.fullPath.replaceAll(`${this.lang}/`, '')
    },
    topBar() {
      const obj = {}
      obj.path = ''
      obj.title = ''
      if (this.pathList.length === 2) {
        return {
          path: this.$t('lbl_Dashboard_0'),
          title: this.$t('lbl_Routine_0'),
          key: 'RW010',
        }
      }
      const lang = this.$i18n.locale
      const routePath = this.$route.fullPath.replace(`${lang}/`, '')
      this.sidebarOptions.forEach((itemSidebar, indexSidebar) => {
        itemSidebar.options.forEach((item) => {
          if (
            item.path !== '/' &&
            (item.path === routePath || routePath.includes(item.path))
          ) {
            obj.path = item.text
            obj.title = itemSidebar.title
            obj.key = item.key
            if (item.options && item.options.length > 0) {
              item.options.forEach((_el) => {
                if (routePath.includes(_el.path)) obj.keyChildren = _el.key
              })
            }
          }
        })
      })
      return obj
    },
    loginTime() {
      const timeLoginStamp = cookies.get('LOGIN_TIME')
      if (timeLoginStamp) {
        return this.convertDateTillSecond(timeLoginStamp * 1)
      }
      return ''
    },
  },
  watch: {
    userInfo: {
      deep: true,
      handler(data) {
        if (!data) {
          return
        }
        this.showUserInformation = data
      },
    },
  },
  created() {
    this.$bus.$on('refresh-top-bar', async () => {
      await this.$fetch()
      this.$forceUpdate()
    })
  },
  methods: {
    ...mapMutations({
      SET_USER_INFO: 'SET_USER_INFO',
    }),
  },
}
</script>
<style lang="scss" scoped>
.top-bar {
  height: 26px;
  right: 0px;
  text-align: left;
  color: Black;
  background-color: #eff3ff;
  background-repeat: repeat;
  padding-top: 3px;
  padding-right: 18px;
  text-indent: 18px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .top-bar--left {
    float: left;
    display: flex;
    align-items: center;
    #topLogo {
      border-radius: 50%;
      height: 26px;
      width: 26px;
      margin-left: 24px;
      background-position: center center;
      background-repeat: no-repeat;
      background-size: cover;
    }
  }
  .top-bar--right {
    float: right;
  }
}
</style>
