<template>
  <div class="login-container" :class="dark ? 'dark' : 'light'">
    <div class="d-flex p-2 pt-3 top-header">
      <div class="header"></div>
      <div class="change-language"></div>
      <nuxt-link
        class="col-6 d-flex align-items-center p-0"
        :to="localePath('/login')"
      >
      </nuxt-link>
      <div class="dark-mode">
        <DarkMode />
      </div>
    </div>
    <nuxt />
    <div class="footer bg-slate-200" :class="{ 'bg-slate-900': dark }">
      <p>Copyright © 2012, ITS System Service, All Rights Reserved</p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DarkMode from '@/components/UI/DarkModeToggle.vue'
export default {
  name: 'Auth',
  components: {
    DarkMode,
  },
  middleware: ['notAuthenticated'],
  computed: {
    ...mapGetters(['dark']),
  },
}
</script>

<style scoped lang="scss">
@media screen and (max-width: 320px) {
  .footer {
    font-size: 9px !important;
  }
}
.footer {
  position: fixed;
  bottom: 0px;
  display: flex;
  width: 100%;
  font-size: 12px;
  justify-content: center;
  margin: 0 auto;
  color: #fff;
  z-index: 10;
  white-space: nowrap;
}
.bg-slate-900 {
  background-color: rgb(15 23 42) !important;
}
.bg-slate-200 {
  background-color: rgb(54, 77, 157);
}
.top-header {
  position: absolute;
  background-size: cover;
  top: 0;
  left: 0;
  width: 100%;
  height: 54px;
  background-image: url('../static/logo.jpg');
  background-repeat: no-repeat;
}
.header {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 400px;
  height: 0px;
  background-image: url('../static/logo.jpg');
  background-repeat: no-repeat;
}
.change-language {
  position: absolute;
  right: 18px;
  top: 20px;
  height: 25px;
  color: White;
  padding: 5px;
}
.login-container {
  position: relative;
  height: 100vh;
}
.dark-mode {
  z-index: 200;
  position: absolute;
  top: 64px;
  right: 0;
  padding-right: 24px;
}
@media screen and (max-width: 570px) {
  .top-header {
    height: 40px;
    z-index: 10;
  }
}
@media screen and (max-width: 400px) {
  .top-header {
    height: 35px;
    z-index: 10;
  }
  .dark-mode {
    padding-right: 5px;
    top: 27px;
  }
}
</style>
