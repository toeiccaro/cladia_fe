<template>
  <div class="table__loader"></div>
</template>

<script>
export default {
  name: 'BaseTableLoader',
}
</script>

<style lang="scss" scoped>
.table__loader {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 999;

  &::before {
    content: 'Load...';
    position: absolute;
    background: #ffffff;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 5px;
    padding: 6px;
    text-align: center;
    font-weight: bold;
    color: #e17009;
    font-size: 12px;
    border: 2px solid #79b7e7;
    display: inline-block;
    z-index: 999;
  }
}
</style>
