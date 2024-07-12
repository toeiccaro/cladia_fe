<template>
  <div class="add-completion-work">
    <PageAddCompletionReport />
  </div>
</template>
<script>
import PageAddCompletionReport from '~/components/Production/CompletionReport/PageAddCompletionReport.vue';
export default {
  components: { PageAddCompletionReport },
  middleware: ['authenticated'],
}
</script>
<style lang="scss" scoped>
.add-completion-work {
  background: #fff 50% bottom repeat-x;
  color: #222;
  position: relative;
  padding: 0.2em 0.2em 0;
  zoom: 1;
  font-family: Lucida Grande, Lucida Sans, Arial, sans-serif;
  font-size: 1.1em;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
