<template>
  <div class="d-flex header-container">
    <div class="header-logo"></div>
    <div class="header-language">
      <span class="title">{{ $t('lbl_ChangeLanguage_0') }}</span>
      <b-form-select
        v-model="lang"
        class="filter-input"
        :options="langs"
        @input="getLang(lang)"
      >
      </b-form-select>
      <!-- <span class="logout" @click="handleLogout">{{ $t('btn_Logout_0') }}</span> -->
      <BIconGear class="user-setting"></BIconGear>
      <BIconBell class="icon-notification" />
      <b-dropdown right size="lg" variant="link" no-caret>
        <template #button-content>
          <BIconPersonCircle class="user-icon text-white"></BIconPersonCircle>
        </template>
        <b-dropdown-item
          v-for="(item, index) in profileDropList"
          :key="index + Date.now()"
          @click="() => item.action()"
        >
          <span> {{ item.text }}</span>
        </b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>
<script>
import { BIconPersonCircle, BIconGear, BIconBell } from 'bootstrap-vue'
import cookies from 'vue-cookies'
import api from '@/api/api'
export default {
  name: 'TheHeader',
  components: { BIconPersonCircle, BIconGear, BIconBell },
  data() {
    return {
      asyncShow: false,
      syncLabel: '',
      syncLoading: false,
      isOpen: false,
      lang: this.$i18n.locale,
      langs: [],
      toastMessage: '',
      syncState: '',
    }
  },
  computed: {
    profileDropList() {
      return [
        {
          text: this.$t('lbl_PersonalProfile_0'),
          action: () => this.$router.push(this.localePath('/profile')),
        },
        {
          text: this.$t('lbl_SystemData_PasswordEdit_0'),
          action: () => this.$router.push(this.localePath('/edit-password')),
        },
        {
          text: this.$t('btn_Logout_0'),
          path: '/logout',
          action: () => this.handleLogout(),
        },
      ]
    },
    user() {
      if (this.$store.state.userInfo) {
        return this.$store.state.userInfo
      } else {
        return null
      }
    },
    isAdmin() {
      return this.user && this.userGroupID === 1
    },
    curTab() {
      return this.$store.state.tab
    },
  },

  created() {
    this.getLanguageText()
  },
  mounted() {
    this.$root.$on('bv::dropdown::hide', (bvEvent) => {
      this.asyncShow = false
    })
    this.$root.$on('bv::modal::show', (bvEvent, timezone) => {
      this.timezone = this.timezoneComputed
    })
  },
  methods: {
    // eslint-disable-next-line require-await
    async logout() {
      this.syncLoading = true
      await this.$store.dispatch('logout')
      this.syncLoading = false
    },
    onDropdownHide() {
      this.asyncShow = !this.asyncShow
    },
    async confirmSetting() {
      const res = await api('updateUserInfo', { timezoneId: this.timezone })
      if (res.success) {
        this.$store.dispatch('setUserInfo', res.data.data)
        this.timezoneComputed = this.timezone
        if (this.settingTimeZoneBeforeSync) {
          this.settingTimeZoneBeforeSync = false
        }
      }
    },
    async getLanguageText() {
      const res = await api('getLanguage')
      if (res) {
        const langs = res.map((element) => {
          return {
            text: this.$t(`${element.displayName}`),
            value: element.languageName.toLowerCase(),
          }
        })
        this.langs = langs
      }
    },
    getLang(lang) {
      const confirm = window.confirm(this.$t('msg_IsChangeLanguage_0'))
      if (confirm) {
        this.$store.commit('base/SET_LANGUAGE', this.lang)
        this.getLanguageText()
        this.$router.push(this.switchLocalePath(lang))
      }
    },
    // eslint-disable-next-line require-await
    async handleLogout() {
      cookies.remove('JWT_TOKEN')
      cookies.remove('REFRESH_TOKEN')
      localStorage.removeItem('company')
      this.$router.push(this.localePath({ path: '/login' }))
    },
  },
}
</script>

<style scoped lang="scss">
::v-deep .dropdown-toggle {
  padding: 0 !important;
}
.logout {
  font-size: 14px;
  cursor: pointer;
  color: #2a4ea2;
  text-align: right;
  font-weight: bold;
}

.header-container {
  height: 50px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  background-image: url('../../static/headbg.png');
  background-repeat: repeat-x;
  .header-logo {
    background-image: url('../../static/logo.jpg');
    background-repeat: no-repeat;
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 50px;
  }
  .header-language {
    position: absolute;
    right: 18px;
    top: 15px;
    height: 25px;
    padding: 5px;
    display: flex;
    color: #fff;
    align-items: center;
    .title {
      font-size: 12px;
      color: #fff;
      margin-right: 4px;
    }
    .logout {
      margin-left: 8px;
      font-size: 12px;
      color: #fff;
      cursor: pointer;
    }
    .icon-notification {
      height: 20px;
      width: 20px;
      margin-left: 8px;
    }
  }
}
.user-info {
  font-size: 14px;
  margin: auto;
}

.user-info p {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.icon {
  width: 50px;
}

.dropdown {
  border-radius: 50%;
}

.modal-header {
  padding: 10px !important;
}

.modal-header > .close {
  padding: 10px !important;
  padding-right: 16px !important;
}

.dropdown-menu {
  width: auto;
}

.badge-primary {
  background-color: #2a4ea2 !important;
}
.select-input {
  width: 150px;
  height: 24px;
  font-size: 12px;
  border: solid 1px #b5b8c8;
  color: #222222;
}
.slide-fade-enter-active {
  transition: all 0.2s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(100%);
}
.user-setting {
  width: 20px;
  height: 20px;
  margin-left: 16px;
}
.user-icon {
  width: 28px;
  height: 28px;
  margin-left: 16px;
}
.filter-input {
  height: 20px;
  padding: 0px 0px 0px 5px;
  font-size: 12px;
  border-radius: unset;
  width: 150px;
}
</style>
