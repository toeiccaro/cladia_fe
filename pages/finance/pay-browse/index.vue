<template>
  <div>
    {{this.$t('lbl_Finance_PayBrowse_0')}}
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  components: {
  },
  middleware: ['authenticated'],
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters({
    }),
    
  },
  watch: {
    
  },

  methods: {
  }
}
</script>
