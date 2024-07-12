<template>
  <div class="d-flex align-items-center justify-content-center mt-4">
    <h1 v-if="error.statusCode === 404">404 Page not found</h1>
    <h1 v-else>An error occurred</h1>
  </div>
</template>

<script>
export default {
  // you can set a custom layout for the error page
  layout: 'default',
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
}
</script>
