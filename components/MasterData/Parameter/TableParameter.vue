<template>
  <div class="table-parameter d-flex position-relative">
    <div class="parameter-type__table">
      <BaseTableDraggable
        v-if="!isLoadingTable"
        class="parameter-type__table-body"
        :header="parameterTypeHeaderMapping"
        :data="parameterTypeDataTableMapping"
        :disabled-filter="false"
        @filter="searchKeyCodeName"
        @row="handleChooseParameterType"
      >
      </BaseTableDraggable>
    </div>
    <div class="parameter-detail__table">
      <BaseTableDraggable
        v-if="!isLoadingTable"
        ref="tableParameterDetail"
        class="parameter-detail__table-body"
        :header="headerMapping"
        :data="dataTableMapping"
        :initial-filters="payloadParameter"
        :update-filters-function="UPDATE_PAYLOAD_PARAMETER"
        :sort-key="sortKey"
        :is-ascending="isAscending"
        @row="handleSelectRow"
        @filter="filterAndSort"
        @sort="filterAndSort"
        @saveData="saveData"
      >
      </BaseTableDraggable>

      <BasePagination
        v-if="!isLoadingTable"
        :total="total"
        :per-page="perPage"
        :current-page="currentPage"
        :number-item="dataTable.length"
        class="table-parameter--footer"
        @changePage="(value) => setCurrentPage(value)"
        @changePerPage="(value) => changePerPage(value)"
      ></BasePagination>
    </div>

    <BaseTableLoader v-if="loading || isLoadingTable" />
  </div>
</template>
<script>
import { mapMutations, mapGetters } from "vuex";
import systemMixins from "@/mixins/system";
import dateTimeMixins from "@/mixins/dateTime";
import { SERVER_RESPONSE_CODE } from "@/constants";
import api from "@/api/api";
import BasePagination from "~/components/UI/BasePagination";
import BaseTableDraggable from "~/components/MasterData/Parameter/BaseTableDraggable";
import BaseTableLoader from "~/components/loaders/BaseTableLoader";

export default {
  name: "TableParameter",
  components: { BaseTableDraggable, BasePagination, BaseTableLoader },
  mixins: [systemMixins, dateTimeMixins],
  data() {
    return {
      loading: false,
      dataTable: [],
      dataHeader: [],
      scolumnHides: [],
      total: 0,
      currentPage: 1,
      perPage: 30,
      sortKey: "",
      isAscending: false,
      isLoadingTable: false,
      parameterTypeDataTable: [],
      parameterTypeDataHeader: [
        {
          key: "name",
          name: "",
          width: 155,
        },
      ],
      lang: this.$i18n.locale,
      parameterType: "",
      chosenParameter: "",
    };
  },
  async fetch() {
    try {
      this.loading = true;
      this.UPDATE_PAYLOAD_PARAMETER({
        language: this.lang,
      });
      await this.getData();
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  },
  computed: {
    ...mapGetters({
      payloadParameter: "filterSort/getPayloadParameter",
    }),

    parameterTypeHeaderMapping() {
      const header = [
        {
          key: "index",
          name: "",
          width: 30,
        },
      ];

      this.parameterTypeDataHeader.forEach((item, index) => {
        const headerItem = {
          key: item.key,
          filter: "input",
          width: item.width,
          fieldName: item.name,
          fieldOrder: index,
        };
        header.push(headerItem);
      });
      return header;
    },

    parameterTypeDataTableMapping() {
      const data = this.parameterTypeDataTable.map((item, index) => {
        const obj = {
          index: {
            value: this.perPage * (this.currentPage - 1) + index + 1,
            align: "center",
            type: "index",
          },
          keyRow: item.receiptNO,
        };
        this.parameterTypeDataHeader.forEach((headerItem, headerIndex) => {
          const mappingFieldName = this.mappingProperty(item, headerItem.key);
          obj[mappingFieldName] = {
            value: this.$t(item[mappingFieldName]),
            keyName: item[mappingFieldName],
          };
        });
        return obj;
      });
      return data;
    },

    dataTableMapping() {
      const data = this.dataTable.map((item, index) => {
        const obj = {
          index: {
            value: this.perPage * (this.currentPage - 1) + index + 1,
            align: "center",
            type: "index",
          },
          parameterDetailId: item.parameterDetailId,
          parameterTypeId: item.parameterTypeId,
          isUpdate: item.isUpdate,
          isNew: item.isNew,
        };
        this.scolumnHides.forEach((headerItem, headerIndex) => {
          const fieldKey = headerItem.fieldName;

          obj[fieldKey] = {
            value: item[fieldKey],
          };
        });
        return obj;
      });
      return data;
    },

    getMappingHeader() {
      const result = [
        {
          key: "index",
          name: "",
          width: 40,
        },
      ];

      this.dataHeader.forEach((item, index) => {
        const headerItem = {
          key: item.languageName,
          filter: "input",
          name: this.$t(item.displayName),
          width: 150,
          fieldName: item.languageName,
          fieldOrder: index,
        };

        result.push(headerItem);
      });
      return result;
    },

    getMappingHeaderScolumnHides() {
      const result = [
        {
          key: "index",
          name: "",
          width: 40,
        },
      ];
      this.scolumnHides.forEach((item, index) => {
        const headerItem = {
          key: item.fieldName,
          filter: "input",
          name: this.$t(`lan_${item.fieldName}_0`),
          width: 150,
          fieldName: item.fieldName,
          fieldOrder: index,
        };

        result.push(headerItem);
      });
      return result;
    },

    headerMapping() {
      return this.scolumnHides?.length > 0
        ? this.getMappingHeaderScolumnHides
        : this.getMappingHeader;
    },
  },
  created() {
    const payload = {
      language: this.lang,
      pageNo: 1,
      pageSize: 30,
    };

    this.SET_PAYLOAD_PARAMETER(payload);
  },
  methods: {
    ...mapMutations({
      UPDATE_PAYLOAD_PARAMETER: "filterSort/UPDATE_PAYLOAD_PARAMETER",
      SET_PAYLOAD_PARAMETER: "filterSort/SET_PAYLOAD_PARAMETER",
    }),

    handleSelectRow(data) {
      this.$emit("handleSelectRow", data);
    },

    handleChooseParameterType(data) {
      this.chosenParameter = data;
      this.$emit("resetChosenRowIndex");
      this.SET_PAYLOAD_PARAMETER({
        pageSize: 30,
        pageNo: 1,
      });
      this.resetFiltersTable();
      this.fetchLanguageData();
    },

    async fetchLanguageData() {
      try {
        this.loading = true;
        this.$refs.tableParameterDetail.activeRow = null;
        this.parameterType = this.chosenParameter?.item?.name?.keyName;
        const payload = {
          ...this.payloadParameter,
          language: this.lang,
          keyCode: this.parameterType,
        };

        const res = await api(this.shouldShowCodeField() ? "getFinanceSettingLanguage" :"getParameterLanguage" , payload)
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK;
        if (validResponse) {
          this.dataTable = res.data?.tableContent?.content
          this.scolumnHides = res.data?.scolumnHides;
          this.total = res.data.tableContent?.totalElements;
        }

        this.$emit("resetData");
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    changePerPage(value) {
      this.perPage = Number(value);
      this.currentPage = 1;
      this.SET_PAYLOAD_PARAMETER({
        pageSize: this.perPage,
        pageNo: this.currentPage,
      });

      this.fetchLanguageData();
    },

    setCurrentPage(value) {
      this.currentPage = Number(value);
      this.SET_PAYLOAD_PARAMETER({
        pageNo: this.currentPage,
      });
      this.fetchLanguageData();
    },

    async getData() {
      try {
        this.isLoadingTable = true;
        const [languageResponse, paramTypeResponse] = await Promise.all([
          api("getLanguage"),
          this.shouldShowCodeField() 
          ? api("getFinanceSettingKeyCodeName") 
          : api("getParameterKeyCodeName"),
        ]);

        if (languageResponse.length) {
          this.dataHeader = languageResponse;
        }

        const validParamTypeResponse =
          paramTypeResponse &&
          paramTypeResponse.status === SERVER_RESPONSE_CODE.OK;

        if (validParamTypeResponse) {
          const data = paramTypeResponse.data || [];
          this.parameterTypeDataTable = data.map((item) => ({
            name: item,
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        this.isLoadingTable = false;
      }
    },

    async filterAndSort({ sortParams, filterParams }, type) {
      try {
        this.sortKey = sortParams.sortKey;
        this.isAscending = !sortParams.isAscending;

        const finalFilterParams = {};

        const ACTION_FILTER = "filter";
        if (type === ACTION_FILTER) {
          this.currentPage = 1;
        }

        const finalPayloadParams = {
          pageNo: this.currentPage,
          pageSize: this.perPage,
          sortByColumn: this.sortKey,
          sortAscOrDesc: this.isAscending ? "ASC" : "DESC",
          language: this.lang,
          keyCode: this.parameterType,
        };

        for (const property in filterParams) {
          if (filterParams[property]) {
            finalFilterParams[property] = filterParams[property];
          }
        }

        this.loading = true;

        const finalApiPayload = Object.assign(
          {},
          finalFilterParams,
          finalPayloadParams
        );

        this.SET_PAYLOAD_PARAMETER(finalApiPayload);
        const res =  this.shouldShowCodeField() 
        ? await api("getFinanceSettingLanguage", this.payloadParameter) 
        : await api("getParameterLanguage", this.payloadParameter);

        this.loading = false;
        const validResponse = res && res.status === SERVER_RESPONSE_CODE.OK;
        if (validResponse) {
          this.dataTable = res.data.tableContent?.content || [];
          this.total = res.data.tableContent?.totalElements;
        }
      } catch (err) {
        window.alert(err?.data?.response?.data?.message);
      }
    },

    mappingProperty(item, fieldName) {
      for (const property in item) {
        if (property.toLowerCase() === fieldName.toLowerCase()) {
          return property;
        }
      }
      return "";
    },

    saveData() {
      this.$emit("saveData");
    },

    async searchKeyCodeName({ sortParams, filterParams }) {
      const { name } = filterParams;
      const language = this.$i18n.locale;
      const res = await api(this.shouldShowCodeField() ? "searchKeyCodeNameFinanceSetting" : "searchKeyCodeName", {
        searchValue: name,
        language,
      });
      const { status, data } = res;
      if (status === SERVER_RESPONSE_CODE.OK) {
        this.parameterTypeDataTable = data.map((item) => ({
          name: item,
        }));
        this.dataTable = [];
      }
    },

    resetFiltersTable() {
      this.sortKey = "";
      this.isAscending = false;
      for (const filter in this.$refs.tableParameterDetail.filters) {
        this.$refs.tableParameterDetail.filters[filter] = "";
      }
    },

    shouldShowCodeField() {
      return this.$route.name.includes("finance");
    },
  },
};
</script>
<style lang="scss" scoped>
.table-parameter {
  height: calc(100% - 70px);
  gap: 3px;
  .parameter-detail__table {
    width: 100%;
  }
  .parameter-type__table-body,
  .parameter-detail__table-body {
    width: 100%;
  }
  .parameter-type__table-body {
    height: 100%;
  }
  .parameter-detail__table-body {
    height: calc(100% - 26px);
  }
  .table-parameter--footer {
    color: #000000;
    background: #eff3ff 50% 50% repeat-x;
    border: 1px solid #5180d8;
    border-top: 0;
  }
}
.parameter-type__table {
  width: 206px;
}
</style>
