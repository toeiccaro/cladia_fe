<template>
  <div>
    <ToolBar
      :list-tools="listToolBarsCheckAuthority"
      @changeActiveToolBar="changeActiveToolBar"
    ></ToolBar>
    <TablePayBrowse
      ref="tablePayBrowse"
      @handleDetailId="handleDetailId"
      @changeLayout="changeLayout"
    />
    <BaseSetColumn
      ref="modalSetColumn"
      @reloadSet="functionReload"
    ></BaseSetColumn>
    <BaseModalDetails ref="modalDetail" :order-no="currentOrderNo" />
    <BaseModalComposite
      ref="modalComposite"
      :selected-items="selectedItems"
      @refresh-data-table="refreshTableData"
    />
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
import { SERVER_RESPONSE_CODE } from '@/constants';
import api from '@/api/api';
import { downloadFileExcel } from '@/utils/utils';
import ToolBar from '@/components/UI/ToolBar';
import TableReceiveBrowse from '@/components/Finance/ReceiveBrowse/TableReceiveBrowse';
import TablePayBrowse from '@/components/Finance/PayBrowse/TablePayBrowse';
import BaseModalDetails from '@/components/Finance/ReceiveBrowse/BaseModalDetails';
import BaseModalComposite from '@/components/Finance/ReceiveBrowse/BaseModalComposite';
import BaseSetColumn from '~/components/UI/BaseSetColumn.vue';

export default {
  components: {
    TablePayBrowse,
    TableReceiveBrowse,
    ToolBar,
    BaseModalDetails,
    BaseModalComposite,
    BaseSetColumn,
  },
  middleware: ['authenticated'],
  data() {
    return {
      listToolBars: [
        {
          key: 'addPayBrowser',
          label: this.$t('btn_btnAdd_0'),
          icon: '/images/add.png',
        },
        {
          key: 'refresh',
          label: this.$t('btn_btnRefresh_0'),
          icon: '/images/refresh.png',
        },
        {
          key: 'export',
          label: this.$t('btn_btnExport_0'),
          icon: '/images/export.png',
          type: 'menu',
          items: [
            {
              text: 'btn_btnPaged_0',
              action: () => this.exportByPage(),
            },

            {
              text: 'btn_btnFiltered_0',
              action: () => this.exportAll(),
            },
          ],
        },
        {
          key: 'check',
          label: this.$t('btn_btnCheck_0'),
          icon: '/images/check.png',
        },
        {
          key: 'unCheck',
          label: this.$t('btn_btnUnCheck_0'),
          icon: '/images/uncheck.png',
        },
        {
          key: 'setOrder',
          label: this.$t('btn_btnSet_0'),
          icon: '/images/set.png',
        },
        {
          key: 'close',
          label: this.$t('btn_btnClose_0'),
          icon: '/images/close.png',
        },
      ],
      currentOrderNo: '',
      loading: false,
      payloadApi: {
        data: {
          pageNo: 1,
          pageSize: 30,
        },
      },
      dataLayout: {},
      listDataColumn: [],
      listColumnChange: [],
      selectedItems: [],
    };
  },
  computed: {
    ...mapGetters({
      activeButtonToolBar: 'base/getActiveButtonToolBar',
    }),
    listToolBarsCheckAuthority() {
      return this.listToolBars.map((item) => {
        switch (item.key) {
          case 'check':
            item.disabled = !this.activeButtonToolBar?.isCheck;
            break;
          case 'unCheck':
            item.disabled = !this.activeButtonToolBar?.isCheck;
            break;
          case 'export':
            item.disabled = !this.activeButtonToolBar?.isExport;
            break;
          default:
            break;
        }
        return item;
      });
    },
  },
  watch: {
    'dataLayout.headerData': {
      immediate: true,
      deep: true,
      handler(val) {
        this.listColumnChange = [];
        this.dataLayout?.headerData?.forEach((headerItem, index) => {
          for (const columnItem of this.listDataColumn) {
            if (headerItem.fieldName !== columnItem.fieldName) {
              continue;
            }

            this.listColumnChange.push({
              fieldWide: headerItem.width.toString(),
              fieldName: headerItem.fieldName,
              id: columnItem.id,
              fieldOrder: index - 1,
              gridName: columnItem.gridName,
              hidden: columnItem.hidden,
              loginId: columnItem.loginId,
            });
          }
        });
      },
    },
  },

  methods: {
    functionReload() {
      this.$bus.$emit('refresh-filter-data');
      return this.$refs.tablePayBrowse.refresh();
    },
    async refreshTableData() {
      await this.$refs.tablePayBrowse?.getData();
    },
    async exportByPage() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmExport_0'));
        if (confirm) {
          const payload = {
            ...this.$refs.tablePayBrowse?.queryPayload,
            exportAllData: false,
          };
          await this.handleExportExcel(payload);
        }
      } catch (err) {
        console.error(err);
      }
    },
    async exportAll() {
      try {
        const confirm = window.confirm(this.$t('msg_ConfirmExport_0'));
        if (confirm) {
          const payload = {
            ...this.$refs.tablePayBrowse.queryPayload,
            exportAllData: true,
          };
          await this.handleExportExcel(payload);
        }
      } catch (err) {
        console.error(err);
      }
    },
    async handleExportExcel(payload) {
      try {
        this.loading = true;
        const response = await api('exportPayBrowse', payload);
        const successResponse =
          response?.status === SERVER_RESPONSE_CODE.OK && response?.data;

        if (successResponse) {
          downloadFileExcel(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async changeActiveToolBar(key) {
      if (key === 'addPayBrowser') {
        return this.$router.push(
          this.localePath({ path: '/finance/pay-browse/add' })
        );
      }
      if (key === 'refresh') {
        return location.reload();
      }

      if (key === 'close') {
        return this.$router.push(this.localePath({ path: '/' }));
      }

      if (key === 'check') {
        const listCheckbox = this.$refs.tablePayBrowse?.listCheckbox || [];
        const hasNoSelected = listCheckbox.every((item) => !item.value);

        if (hasNoSelected) {
          return window.alert(this.$t('msg_NoSelected_0'));
        }

        const confirm = window.confirm(this.$t('msg_ConfirmCheck_0'));
        if (!confirm) {
          return;
        }

        const checkPayBrowsePromises = listCheckbox.map(async (item) => {
          if (item.value) {
            return await api('checkPayBrowses', { payId: item.id });
          }
        });

        await Promise.all(checkPayBrowsePromises);
        await this.$refs.tablePayBrowse?.getData();

        window.alert(this.$t('msg_IsChecked_0'));
      }

      if (key === 'unCheck') {
        const listCheckbox = this.$refs.tablePayBrowse?.listCheckbox || [];
        const hasNoSelected = listCheckbox.every((item) => !item.value);

        if (hasNoSelected) {
          return window.alert(this.$t('msg_NoSelected_0'));
        }

        const confirm = window.confirm(this.$t('msg_ConfirmUncheck_0'));
        if (!confirm) {
          return;
        }

        const unCheckPayBrowsePromises = listCheckbox.map(async (item) => {
          if (item.value) {
            return await api('unCheckPayBrowses', { payId: item.id });
          }
        });

        await Promise.all(unCheckPayBrowsePromises);
        await this.$refs.tablePayBrowse?.getData();

        window.alert(this.$t('msg_IsUnChecked_0'));
      }

      if (key === 'setOrder') {
        this.$refs.modalSetColumn.showModal = true;
      }
    },
    handleDetailId(data) {
      this.currentOrderNo = data?.orderNO?.value;
    },
    changeLayout(data, listDataColumn) {
      this.dataLayout = data;
      this.listDataColumn = listDataColumn;
    },
  },
};
</script>
