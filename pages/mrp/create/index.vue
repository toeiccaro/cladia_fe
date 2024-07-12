<template>
  <CreateMRP />
</template>

<script>
import CreateMRP from '~/components/MRP/Create/CreateMRP.vue'

export default {
  components: {
    CreateMRP
  },
  middleware: ['authenticated'],
}
</script>
