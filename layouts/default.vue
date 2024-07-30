<template>
  <div>
    <the-header class="header-container"></the-header>
    <TheTopBar></TheTopBar>
    <div class="main-container">
      <div
        class="d-flex sidebar__transition position-relative h-100"
        :class="is_expand_sidebar ? '' : 'sidebar__status--hidden'"
      >
        <TheSideBar @toggle-sidebar="openSideBar" />
        <div
          class="main-frame-right px-1 h-100"
          :style="{
            width: is_expand_sidebar
              ? `calc(100% - 215px)`
              : `calc(100% - 20px)`,
          }"
        >
          <nuxt class="sub-frame" />
        </div>
      </div>
    </div>
    <BaseLoading v-if="loading" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import TheHeader from '~/components/layout/TheHeader.vue'
import TheTopBar from '~/components/layout/TheTopBar.vue'
import TheSideBar from '~/components/layout/TheSideBar.vue'
import BaseLoading from '@/components/UI/Loading/BaseLoading.vue'

export default {
  name: 'Default',
  components: {
    TheHeader,
    TheTopBar,
    TheSideBar,
    BaseLoading,
  },
  middleware: ['authenticated'],
  data() {
    return {
      notAuthenticated: false,
      is_expand_sidebar: true,
    }
  },
  head() {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale,
      },
    }
  },
  computed: {
    ...mapGetters({
      loading: 'base/getLoading',
    }),
  },
  methods: {
    openSideBar(data) {
      this.is_expand_sidebar = data
      this.$store.commit('SET_EXPAND_SIDEBAR', data)
    },
  },
}
</script>

<style lang="scss" scoped>
.header-container {
  position: sticky;
  background-color: #fff;
  z-index: 999;
}
.sidebar__transition {
  transition: all 0.5s linear;
}
.sidebar__status--hidden {
  .side-bar-left {
    min-width: 20px;
    width: 20px;
  }
}
.main-container {
  height: calc(100vh - 78px);
}
.main-frame-right {
  transition: all 0.5s linear;
  width: 100%;
  transition: all 0.5s linear;
  .sub-frame {
    height: 100%;
    min-height: 400px;
    overflow-y: auto;
    background: #fff;
  }
}
</style>
