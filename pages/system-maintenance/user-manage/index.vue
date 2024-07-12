<template>
  <div>
    <TableUserManage></TableUserManage>
  </div>
</template>
<script>
import TableUserManage from '~/components/System-Setting/UserManage/TableUserManage.vue'

export default {
  components: { TableUserManage },
  middleware: ['authenticated'],
}
</script>
