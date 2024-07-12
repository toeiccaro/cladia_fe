<!-- eslint-disable array-callback-return -->
<template>
  <div class="side-bar-left position-relative">
    <!-- <menu-item
      v-for="sidebar in menuSidebar"
      :key="sidebar.key"
      :menu-item="sidebar"
      :get-menu-sidebar="getMenuSidebar"
    ></menu-item> -->

    <div v-for="sidebar in menuSidebar" :key="sidebar.key">
      <div
        class="bg-cladia sidebar-head d-flex align-items-center"
        @click="getMenuSidebar(sidebar, undefined, true)"
      >
        <component :is="sidebar.icon"></component>
        <div class="word__nobreak">
          {{ $t(sidebar.text) }}
        </div>
      </div>

      <div
        v-if="sidebarSelect === sidebar.value"
        class="sidebar-item__container"
        :style="{
          minHeight: `calc(100vh - ${menuSidebar.length * 26 + 4 + 83}px)`,
        }"
      >
        <div
          v-for="item in sidebar.options"
          :key="item.key"
          class="sidebar-item word__nobreak d-flex align-items-center"
          :class="{
            'has-children': hasChildren(item),
            'is-shown': menuItemStatus[item.key],
            'sidebar-item_active': shouldActiveSidebarItem(item),
          }"
        >
          <div
            class="d-flex w-100 position-relative"
            @click.stop.prevent="onClickSidebarItem(item)"
            @click="getMenuSidebar(item, 'keyActive', true)"
          >
            <nuxt-link
              :to="localePath(item.path)"
              class="w-100 menu-item-link"
              @click.native="handleClearStatePage(item)"
            >
              <div class="d-flex align-items-center icon__menu">
                <b-icon-caret-right
                  v-if="hasChildren(item)"
                  class="icon word__nobreak"
                  :class="{ 'icon--rotate': menuItemStatus[item.key] }"
                ></b-icon-caret-right>
              </div>
              <div class="d-flex justify-start">
                <span>{{ $t(item.text) }}</span>
              </div>
            </nuxt-link>
          </div>

          <div
            :key="refreshMenuItemKey"
            class="sub-menu panel bg-white width-100"
          >
            <div
              v-for="element in item.options"
              :key="element.key"
              class="sub-menu--item"
              :class="{
                'sidebar-item_active': shouldActiveSidebarItem(element),
              }"
              @click="
                getMenuSidebar(
                  { ...element, value: item.value },
                  'keyActive',
                  true
                )
              "
            >
              <nuxt-link
                :to="{ path: localePath(element.path), query: element.query }"
                class="d-flex align-items-center"
              >
                <b-icon-caret-right></b-icon-caret-right>
                <span>{{ $t(element.text) }}</span>
              </nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="hook__resize position-absolute"
      @click="
        (event) => {
          event.stopPropagation()
          isOpenSidebar = !isOpenSidebar
          $emit('toggle-sidebar', isOpenSidebar)
        }
      "
    ></div>
  </div>
</template>

<script>
import { split } from 'lodash'
import { BIconCaretRight } from 'bootstrap-vue'
import { mapGetters, mapMutations } from 'vuex'
import systemMixin from '@/mixins/system'
import api from '@/api/api'
import MenuItem from '@/components/layout/MenuItem.vue'
import { SERVER_RESPONSE_CODE } from '~/constants'

export default {
  name: 'SideBar',
  components: {
    MenuItem,
    BIconCaretRight,
  },
  mixins: [systemMixin],
  data() {
    return {
      lang: this.$i18n.locale,
      isOpenSidebar: true,
      sidebarSelect: 'Routine Work',
      menuItemStatus: {},
      refreshMenuItemKey: Math.random() * 10000,
      loading: false,
      currentActivatingRoute: localStorage.getItem('currentActivatingRoute'),
      keyType: localStorage.getItem('keyType'),
    }
  },

  async fetch() {
    try {
      await this.getMenuSidebar({ key: '' })
      await this.activateSelectedItem()
    } catch (err) {
      console.error(err)
    }
  },

  computed: {
    ...mapGetters({
      getKeyRouter: 'filterSort/getKeyRouter',
    }),

    ...mapGetters('base', {
      menuSidebar: 'getMenuSidebar',
    }),

    path() {
      return this.$route.path
    },
    sidebarSelectFind() {
      let check = {}
      for (const item of this.sidebarOptions) {
        if (Object.keys(check).length) {
          break
        }

        for (const _el of item.options) {
          const itemQueryActive = _el?.options?.find(
            (child) =>
              child.query?.type === Number(this.$route.query?.type) ||
              child.query?.type === this.$route.query?.type
          )

          const isIndexPage =
            this.$route.path === `/${this.lang}` && _el.path === '/'
          const isExactlyMatch = this.pathClone === this.getFullPathRoute(_el)
          const isMostMatchPath =
            this.pathClone.includes(_el.path) && _el.path !== '/'

          const matchedRoute = isIndexPage || isExactlyMatch || isMostMatchPath

          if (matchedRoute) {
            check = {
              ..._el,
              value: item.value,
              keyParent: item.key,
              isUpdateStorage: true,
            }
            break
          }

          if (
            this.currentActivatingRoute.includes(_el.path) &&
            itemQueryActive
          ) {
            check = {
              ...itemQueryActive,
              value: item.value,
              keyParent: item.key,
              keyParentOfChild: _el.key,
              isQuery: true,
              isUpdateStorage: true,
            }
          }
        }
      }

      return check
    },
    pathClone() {
      return this.$route.fullPath.replaceAll(`${this.lang}/`, '')
    },
  },
  watch: {
    '$route.path': {
      handler(old, val) {
        if (val === `/${this.lang}`) {
          this.openSidebar(this.menuSidebar[0].value)
        }
        if (this.isSameParentPath(old, val)) return
        this.activateSelectedItem()
      },
    },

    sidebarSelectFind: {
      deep: true,
      handler(value) {
        this.setStorageData(value)
      },
    },
  },
  created() {
    this.openSidebar(this.sidebarSelectFind?.value)
    if (this.path === `/${this.lang}/`) {
      this.openSidebar(this.menuSidebar[0].key)
    }
  },
  methods: {
    ...mapMutations({
      SET_PAYLOAD_KEY_ROUTER: 'filterSort/SET_PAYLOAD_KEY_ROUTER',
      SET_STATUS_PAYLOAD_LIST: 'SET_STATUS_PAYLOAD_LIST',
      SET_PAYLOAD_BOM: 'filterSort/SET_PAYLOAD_BOM',
      SET_ACTIVE_BUTTON_TOOLBAR: 'base/SET_ACTIVE_BUTTON_TOOLBAR',
    }),

    async activateSelectedItem() {
      if (this.sidebarSelectFind?.key) {
        await Promise.all([
          this.getMenuSidebar(this.sidebarSelectFind, 'keyParent'),

          this.getMenuSidebar(this.sidebarSelectFind, 'keyActive'),
          this.sidebarSelectFind?.isQuery &&
            this.getMenuSidebar(this.sidebarSelectFind, 'keyParentOfChild'),
        ])
      } else if (this.menuSidebar[0]?.key) {
        await this.getMenuSidebar(this.menuSidebar[0], '')
      }
    },
    shouldActiveSidebarItem(item) {
      const isIndexPage =
        this.$route.path === `/${this.lang}` && item.path === '/'

      const isExactlyMatch = this.pathClone === this.getFullPathRoute(item)

      const isActivated =
        this.currentActivatingRoute === this.getFullPathRoute(item)

      return isIndexPage || isExactlyMatch || isActivated
    },
    handleClearStatePage(value) {
      if (this.getKeyRouter === 'SM030') {
        this.SET_STATUS_PAYLOAD_LIST({ pageNo: 1, pageSize: 30 })
      }
      if (value.key !== this.getKeyRouter) {
        this.SET_PAYLOAD_BOM({})
        this.SET_PAYLOAD_KEY_ROUTER(value.key)
        this.$store.commit('filterSort/IS_DIFFERENT_ROUTE', true)
      } else {
        this.$store.commit('filterSort/IS_DIFFERENT_ROUTE', false)
      }
    },
    openSidebar(value) {
      this.sidebarSelect = value
      this.closeAllChildrenOptions()
    },
    openChildrenOption(key) {
      for (const prop in this.menuItemStatus) {
        if (prop === key) {
          continue
        }
        this.menuItemStatus[prop] = false
      }

      this.menuItemStatus[key] = !this.menuItemStatus[key]
      ++this.refreshMenuItemKey
    },
    closeAllChildrenOptions() {
      for (const prop in this.menuItemStatus) {
        this.menuItemStatus[prop] = false
      }
      ++this.refreshMenuItemKey
    },
    hasChildren(item) {
      return item.isChildren === 1
    },

    onClickSidebarItem(item) {
      this.hasChildren(item)
        ? this.openChildrenOption(item.key)
        : this.closeAllChildrenOptions()
    },

    async getMenuSidebar(itemMenu, keyActive, isClicked) {
      this.sidebarSelect = itemMenu.value
      try {
        this.loading = true

        const shouldUpdateStorage = itemMenu.isUpdateStorage || isClicked
        if (shouldUpdateStorage) {
          this.setStorageData(itemMenu)
        }

        let params = ''

        if (itemMenu.isQuery && keyActive === 'keyParentOfChild') {
          params = itemMenu.keyParentOfChild
        } else if (keyActive === 'keyParent') {
          params = itemMenu?.keyParent
        } else {
          params = itemMenu?.key
        }
        const response = await api('getMenuSidebar', { key: params })
        if (response.status === 200) {
          let result = JSON.parse(JSON.stringify(this.menuSidebar))
          result.forEach((item) => {
            if (item.key === params) {
              item.options = response.data
              item.options.forEach((child) => {
                child.selected = this.$route.path.includes(child.path)
                child.value = item.value
              })
            }

            item.options.forEach((element) => {
              if (element.key === params) {
                element.options = response.data
                element.options.forEach((child) => {
                  child.selected = this.$route.path.includes(child.path)
                  child.value = item.element
                })
              }
            })
          })

          if (!params) result = response.data
          this.$store.commit('base/SET_MENU_SIDEBAR', result)
          if (itemMenu.isQuery && keyActive === 'keyParentOfChild') {
            this.openChildrenOption(itemMenu.keyParentOfChild)
          }

          if (keyActive === 'keyActive') {
            await this.getActiveButtonToolBar({
              keyCode: itemMenu.key,
            })
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    getFullPathRoute(item = {}) {
      let itemPath = item.path
      if (item.query) {
        const searchParams = new URLSearchParams(item.query)
        itemPath = `${itemPath}?${searchParams.toString()}`
      }
      return itemPath || ''
    },
    async getActiveButtonToolBar(keyCode) {
      const response = await api('getActiveButtonByKeyCode', keyCode)

      const validResponse =
        response && response.status === SERVER_RESPONSE_CODE.OK

      if (!validResponse) {
        return
      }

      this.SET_ACTIVE_BUTTON_TOOLBAR(response?.data)
      const authorizationData = response?.data || {}

      const isDetailPage = this.pathClone.includes('detail')
      const isAddPage = this.pathClone.includes('add')
      const canNotEdit =
        (isDetailPage || isAddPage) && !authorizationData.isEdit
      const canNotRun = !authorizationData.isRun

      const isForbidden = canNotRun || canNotEdit
      isForbidden && this.$router.push(this.localePath('/403'))
    },
    setStorageData(menuItem) {
      if (!Object.keys(menuItem).length || !menuItem) {
        return
      }

      const currentRoute = this.getFullPathRoute(menuItem)
      localStorage.setItem('currentActivatingRoute', currentRoute)
      localStorage.setItem('keyType', menuItem.key)

      this.currentActivatingRoute = currentRoute
      this.keyType = menuItem.key
    },
    isSameParentPath(prevPath, currPath) {
      const prevParentPath = split(prevPath, '/', 4).join('/')
      const currParentPath = split(currPath, '/', 4).join('/')
      return prevParentPath === currParentPath
    },
  },
}
</script>
<style lang="scss" scoped>
.hook__resize {
  width: 2px;
  height: 100%;
  top: 0;
  right: -1px;
  cursor: e-resize;
}
.side-bar-left {
  width: 180px;
  height: 100%;
  transition: all 0.3s linear;
}

.sidebar__expanded {
  transform: translateX(0);
}

.sidebar__hidden {
  transform: translateX(-190px);
}

.sidebar-head {
  text-align: left;
  text-indent: 18px;
  color: #ffffff;
  cursor: pointer;
  height: 26px;
  line-height: 26px;
  font-size: 14px;
  font-weight: bold;
  display: block;
  background-color: #2a4ea1;
  margin-top: 1px;
  padding: 1px;
}

.sidebar-item__container {
  border: 1px solid #5180d8;
  overflow: auto;
  margin-bottom: 1px;
}
.is-shown {
  height: fit-content !important;
}
.sidebar-item {
  height: 24px;
  line-height: 24px;
  text-align: left;
  text-indent: 18px;
  font-size: 12px;
  cursor: pointer;
  display: block;
  margin-top: 1px;
  margin-bottom: 1px;
  border-bottom: 1px dotted #5180d8;
  font-weight: bold;
  .menu_sidebar {
    position: relative;
    .icon {
      position: absolute;
    }
  }
  &_active {
    background: #fdeaa6;
  }
}

.menu-item-link:hover {
  color: green;
}
.has-children {
  flex-direction: column;
  align-items: flex-start !important;
}

.icon--rotate {
  transform: rotate(90deg);
}

.active {
  background-color: yellow;
  color: green;
}
.sub-menu {
  flex-direction: column;
  display: flex;
  padding-left: 24px;
}
.word__nobreak {
  overflow: hidden;
  word-break: keep-all;
  white-space: nowrap;
}
.icon__menu {
  position: absolute;
  left: 0;
  height: 100%;
  top: 0;
}

a.nuxt-link-active {
  font-weight: bold;
}
</style>
