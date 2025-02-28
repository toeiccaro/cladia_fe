<template>
    <div class="import-container">
      <!-- Button Import -->
      <!-- Modal Upload File -->
      <b-modal v-model="showModal" title="Import File" hide-footer>
        <div>
          <label for="fileInput">{{ $t("lbl_FileName_0") }}</label>
          <input
            id="fileInput"
            type="file"
            name="file"
            @change="uploadFile"
            class="file-input"
          />
  
          <div class="modal-footer mt-3">
            <b-button class="btn-cancel" @click="showModal = false">
              {{ $t("btn_btnCancel_0") }}
            </b-button>
            <b-button class="btn-ok" @click="importFile">
              {{ $t("btn_btnOK_0") }}
            </b-button>
          </div>
        </div>
      </b-modal>
  
      <!-- Spinner loading -->
      <div
        v-if="loading"
        class="spinner content d-flex justify-content-center align-items-center"
      >
        <b-spinner
          style="width: 3rem; height: 3rem"
          label="Loading..."
        ></b-spinner>
      </div>
    </div>
  </template>
  
  <script>
import api from '@/api/api'
import { SERVER_RESPONSE_CODE } from "@/constants";
import { downloadFileExcel } from "@/utils/utils"; // Import hàm tải file

  export default {
    data() {
      return {
        showModal: false,
        loading: false,
        file: null,
      };
    },
    methods: {
      uploadFile(event) {
        console.log("uploadFile", event.target.files)
        this.file = event.target.files[0];
        console.log("this.file=", this.file)
      },
  
      async importFile() {
  if (!this.file) {
    alert("Please select a file");
    return;
  }

  this.loading = true; // Bật loading trước khi gọi API

  try {
    const formData = new FormData();
    formData.append("file", this.file);

    console.log("Before API call, formData:", formData);

    // Gọi API với `responseType: "blob"`
    const response = await api("outwardOrderimportToExcel", formData);

    console.log("API response:", response);

    // Kiểm tra nếu API trả về dữ liệu dạng blob thì tải xuống
    if (response) {
      await new Promise((resolve) => {
        downloadFileExcel(response.data); // Gọi hàm tải file Excel
        resolve(); // Đảm bảo xử lý xong mới tiếp tục
      });

      alert(this.$t("msg_Successfully_0"));
      this.showModal = false;
    } else {
      console.error("Import failed:", response);
      alert(this.$t("msg_ImportFailed_0"));
    }
  } catch (error) {
    console.error("Error importing file:", error);
    alert(this.$t("msg_ImportFailed_0"));
  } finally {
    this.loading = false; // Tắt loading sau khi tải file xong
  }
}

    },
  };
  </script>
  
  <style scoped>
  .import-container {
    display: flex;
    align-items: center;
  }
  
  .import-btn {
    background-color: #007bff;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .file-input {
    width: 100%;
    padding: 5px;
    margin-top: 10px;
  }
  
  .modal-footer {
    display: flex;
    justify-content: space-between;
  }

  .btn-ok {
  background-color: green !important;
  border-color: green !important;
  color: white !important;
}

.btn-cancel {
  background-color: gray !important;
  border-color: gray !important;
  color: white !important;
}
  </style>
  