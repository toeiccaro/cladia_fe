<template>
  <div class="bussiness-card">
    <div>
      <table
        role="table"
        aria-busy="false"
        aria-colcount="3"
        class="table b-table"
        responsive
      >
        <caption v-if="!data.length">
          {{
            $t('msg_InputDetails_0')
          }}
        </caption>
        <thead role="rowgroup" class="">
          <tr role="row" class="header-2">
            <th
              v-for="(item, index) in fields"
              :key="index"
              :style="{ width: item.fieldWide }"
            >
              <div
                v-if="item.name && item.name == 'checkbox'"
                class="text-align-center"
              >
                <b-checkbox></b-checkbox>
              </div>
              <div v-else>{{ item.name }}</div>
            </th>
          </tr>
        </thead>
        <tbody v-if="data && data.length" role="rowgroup">
          <!---->
          <tr
            v-for="(item, index) in data"
            :key="`card${index}`"
            class="table-tr"
            role="row"
            :class="{ 'active-tr': currentIndex === index }"
            @click="currentIndex = index"
          >
            <td aria-colindex="1" role="cell" class="text-align-center">
              <b-checkbox></b-checkbox>
            </td>
            <td aria-colindex="2" role="cell" class="">
              {{ item.id }}
            </td>
            <td aria-colindex="3" role="cell" class="">
              {{ item.companyName }}
            </td>
            <td aria-colindex="4" role="cell" class="">
              {{ item.name }}
            </td>
            <td aria-colindex="5" role="cell" class="">
              {{ item.department }}
            </td>
            <td aria-colindex="6" role="cell" class="">
              {{ item.post }}
            </td>
            <td aria-colindex="7" role="cell" class="">
              {{ item.tel }}
            </td>
            <td aria-colindex="8" role="cell" class="">
              {{ item.fax }}
            </td>
            <td aria-colindex="9" role="cell" class="">
              {{ item.phone }}
            </td>
            <td aria-colindex="10" role="cell" class="">
              {{ item.email }}
            </td>
            <td aria-colindex="11" role="cell" class="">
              {{ item.isEnable }}
            </td>
            <td aria-colindex="12" role="cell" class="">
              {{ item.memo }}
            </td>
          </tr>
        </tbody>
        <!---->
      </table>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      demo: '',
      currentIndex: -1,
      fields: [
        {
          key: 'index',
          name: 'checkbox',
          fieldWide: '60px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'ID',
          name: 'ID',
          fieldWide: '60px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'ID',
          name: this.$t('lbl_CompanyName_0'),
          fieldWide: '130px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'name',
          name: this.$t('lbl_Name_0'),
          fieldWide: '100px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'department',
          name: this.$t('lbl_DepartID_0'),
          fieldWide: '100px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'post',
          name: this.$t('lbl_PostCode_0'),
          fieldWide: '100px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'tel',
          name: this.$t('lbl_Tel_0'),
          fieldWide: '100px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'fax',
          name: this.$t('lbl_Fax_0'),
          fieldWide: '100px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'phone',
          name: this.$t('lbl_Phone_0'),
          fieldWide: '100px',
          secondHeader: '',
          value: '',
        },

        {
          key: 'email',
          name: this.$t('lbl_Email_0'),
          fieldWide: '100px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'isEnable',
          name: this.$t('lbl_IsEnable_0'),
          fieldWide: '100px',
          secondHeader: '',
          value: '',
        },
        {
          key: 'memo',
          name: this.$t('lbl_Memo_0'),
          fieldWide: '100px',
          secondHeader: '',
          value: '',
        },
      ],
    }
  },
  methods: {},
}
</script>
<style lang="scss" scoped>
.table {
  border-collapse: collapse;
}
.table tbody td {
  padding: 4px 3px 4px 3px;
  border: unset;
}
.bussiness-card {
  font-size: 12px;
  padding: 1rem 1.4rem;
  line-height: 25px;
}
.w-100 {
  width: 100px !important;
}
.w-300 {
  width: 300px;
}
.w-60 {
  width: 60px;
}
.btn .b-icon.bi {
  display: none !important;
}
.dropdown {
  border-radius: unset !important;
}
.table thead tr:first-child th {
  padding: 3px 0px;
  padding-left: unset;
}
.table thead tr:last-child th {
  padding: unset;
}
.header-1 {
  background: #0e76bc;
}
.record {
  font-size: 12px;
  line-height: 25px;
}
.header-2 {
  background: #bcdbf3;
}
.text-align-center {
  text-align: center;
}
.text-area-insite-th {
  height: 38px;
}
.container-btn {
  display: flex;
  align-items: center;
  width: 100%;
  .header-btn {
    width: 100px;
    padding: 5px 0px;
    cursor: pointer;
  }
}
.table-header {
  display: flex;
  align-items: center;
}
input {
  width: 100%;
}
.input-date-picker {
  width: 300px;
}

.table-tr {
  cursor: pointer;
}

.table-tr:nth-child(even) {
  background-color: #f6fbfe;
}

.active-tr {
  background-color: #fbec88 !important;
}
caption {
  color: #000000;
  margin-top: 25px;
}
</style>
