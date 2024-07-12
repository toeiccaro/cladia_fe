<template>
  <div>
    <Dashboard />
  </div>
</template>

<script>
import Dashboard from '@/pages/dashboard/index.vue'

export default {
  name: 'IndexPage',

  components: {
    Dashboard,
  },

  middleware: ['authenticated'],
}
</script>

<style scoped>
.base-menu-container {
  position: relative;
  top: 0;
}
</style>
