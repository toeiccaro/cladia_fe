<template>
  <b-modal id="notAuthenticated" v-model="notPermisson" hide-header centered @hide="backHome">
    <div class="d-flex align-items-center overeflow-wrap-any">
      <img src="@/static/index.png" alt="Cladia" class="icon mr-3" />
      <span class="p-0">{{ $t('msg_AccessDenied_0') }}</span>
    </div>
    <template #modal-footer="">
      <div class="base-dialog-button" @click="backHome">
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
      backHome() {
        this.$router.push(this.localePath({path: '/'}))
      }
  }
}
</script>
