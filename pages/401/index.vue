<template>
  <b-modal id="notAuthenticated" v-model="notPermisson" hide-header centered @hide="logout">
    <div class="d-flex align-items-center overeflow-wrap-any">
      <img src="@/static/index.png" alt="Cladia" class="icon mr-3" />
      <span class="p-0">{{ $t('msg_Hasexpired_0') }}</span>
    </div>
    <template #modal-footer="">
      <div class="base-dialog-button" @click="logout">
        {{ $t('btn_btnOK_0') }}
      </div>
    </template>
  </b-modal>
</template>

<script>
export default {
  name:'Permisson',
  layout: 'none',
  data() {
      return {
          notPermisson: true
      }
  },
  methods: {
      logout() {
        this.$store.dispatch('logout')
      }
  }
}
</script>
