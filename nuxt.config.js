import path from 'path'
import fs from 'fs'

let nuxtConfig = {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Clàdia',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
      {
        name: 'google-site-verification',
        content: 'ZAbIhKnbBTIj7ALrzH5Eo7vX-NbF7pkosEcHdXqBCdw',
      },
      // { httpEquiv: "Content-Security-Policy", content: "default-src 'self'; img-src https://*; child-src 'none';"}
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/index.png' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['~/assets/main.scss'],
  styleResources: {
    scss: ['~/assets/variables.scss'],
  },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/vue-auto-complete.js',
    '~/plugins/vue-date-picker.js',
    '~/directives/index.js',
    '~/plugins/event-bus.js',
    '~/plugins/vue-grid.js',
    '~/plugins/vue-qr-code.js',
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    // '@nuxtjs/eslint-module',
    '@nuxt/postcss8',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    '@nuxtjs/i18n',
    '@nuxtjs/style-resources',
    'bootstrap-vue/nuxt',
    '@nuxtjs/dotenv',
    // '@nuxtjs/auth-next',
  ],
  i18n: {
    locales: [
      {
        code: 'japanese',
        file: 'languageLoader.js',
      },
      {
        code: 'vietnamese',
        file: 'languageLoader.js',
      },
      {
        code: 'english',
        file: 'languageLoader.js',
      },
      {
        code: 'chinese_simplified',
        file: 'languageLoader.js',
      },
      {
        code: 'chinese_traditional',
        file: 'languageLoader.js',
      },
      {
        code: 'danish',
        file: 'languageLoader.js',
      },
      {
        code: 'korean',
        file: 'languageLoader.js',
      },
      {
        code: 'thai',
        file: 'languageLoader.js',
      },
      {
        code: 'french',
        file: 'languageLoader.js',
      },
      {
        code: 'BahasaIndonesia',
        file: 'languageLoader.js',
      },
    ],

    defaultLocale: 'japanese',
    langDir: 'lang/',
    lazy: true,
    strategy: 'prefix',
  },
  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
    babel: {
      plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        ['@babel/plugin-proposal-private-methods', { loose: true }],
        ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
      ],
      compact: true,
    },
  },
}

if (process.env.HTTPS_ENABLED) {
  nuxtConfig = {
    // The server property: Using HTTPS configuration
    server: {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'server.crt'))
      }
    },
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,
  
    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
      title: 'Clàdia',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' },
        {
          name: 'google-site-verification',
          content: 'ZAbIhKnbBTIj7ALrzH5Eo7vX-NbF7pkosEcHdXqBCdw',
        },
        // { httpEquiv: "Content-Security-Policy", content: "default-src 'self'; img-src https://*; child-src 'none';"}
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/index.png' }],
    },
  
    // Global CSS: https://go.nuxtjs.dev/config-css
    css: ['~/assets/main.scss'],
    styleResources: {
      scss: ['~/assets/variables.scss'],
    },
  
    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
      '~/plugins/vue-auto-complete.js',
      '~/plugins/vue-date-picker.js',
      '~/directives/index.js',
      '~/plugins/event-bus.js',
      '~/plugins/vue-grid.js',
      '~/plugins/vue-qr-code.js',
    ],
  
    // Auto import components: https://go.nuxtjs.dev/config-components
    components: true,
  
    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
      // https://go.nuxtjs.dev/eslint
      // '@nuxtjs/eslint-module',
      '@nuxt/postcss8',
    ],
  
    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
      // https://go.nuxtjs.dev/axios
      '@nuxtjs/axios',
      '@nuxtjs/i18n',
      '@nuxtjs/style-resources',
      'bootstrap-vue/nuxt',
      '@nuxtjs/dotenv',
      // '@nuxtjs/auth-next',
    ],
    i18n: {
      locales: [
        {
          code: 'japanese',
          file: 'languageLoader.js',
        },
        {
          code: 'vietnamese',
          file: 'languageLoader.js',
        },
        {
          code: 'english',
          file: 'languageLoader.js',
        },
        {
          code: 'chinese_simplified',
          file: 'languageLoader.js',
        },
        {
          code: 'chinese_traditional',
          file: 'languageLoader.js',
        },
        {
          code: 'danish',
          file: 'languageLoader.js',
        },
        {
          code: 'korean',
          file: 'languageLoader.js',
        },
        {
          code: 'thai',
          file: 'languageLoader.js',
        },
        {
          code: 'french',
          file: 'languageLoader.js',
        },
        {
          code: 'BahasaIndonesia',
          file: 'languageLoader.js',
        },
      ],
  
      defaultLocale: 'japanese',
      langDir: 'lang/',
      lazy: true,
      strategy: 'prefix',
    },
    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {},
  
    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
      postcss: {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      },
      babel: {
        plugins: [
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          ['@babel/plugin-proposal-private-methods', { loose: true }],
          ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
        ],
        compact: true,
      },
    },
  }
}

export default nuxtConfig
