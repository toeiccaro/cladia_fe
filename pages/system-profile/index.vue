<template>
  <div class="system-profile-page sys-align-center">
    <div class="width-100 d-flex">
      <div class="col-6">
        <div class="sys-align-center mb-10">
          <div class="mr-10">Name:</div>
          <div>{{ name }}</div>
        </div>
        <div class="sys-align-center mb-10">
          <div class="mr-10">Address:</div>
          <div>{{ address }}</div>
        </div>
        <div class="sys-align-center mb-10">
          <div class="mr-10">Tel:</div>
          <div>{{ phone }}</div>
        </div>
        <div class="sys-align-center mb-10">
          <div class="mr-10">Fax:</div>
          <div>{{ fax }}</div>
        </div>
        <div class="sys-align-center">
          <div class="mr-10">Mail:</div>
          <div>{{ mail }}</div>
        </div>
      </div>
      <div class="col-6 sys-flex-center">
        <div>
          <div class="image mb-10 sys-flex-center">
            <img v-if="file && file.imageUrl" :src="file.imageUrl" />
            <img
              v-else
              src="@/static/cladia_logpic.png"
              alt="Clàdia"
              class="login-logo"
            />
          </div>
          <div class="tool">
            <input
              id="inputFile"
              type="file"
              accept="image/*"
              @change="onChange"
            />
            <div class="sys-flex-center">
              <div class="d-flex">
                <div class="mr-50 cursor-pointer" @click="upload">Upload</div>
                <div class="cursor-pointer" @click="clear">Clear</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  middleware: ['authenticated'],
  data() {
    return {
      name: 'ITS',
      phone: 'Japan',
      mail: '00000000',
      fax: 'abc',
      address: 'its@gmail.com',
      file: {
        file: null,
        image: null,
        imageUrl: null,
        name: null,
      },
    }
  },
  methods: {
    upload() {
      document.getElementById('inputFile').click()
    },
    onChange(e) {
      const file = e.target.files[0]
      this.image = file
      this.file.imageUrl = URL.createObjectURL(file)
    },
    clear() {
      this.file.imageUrl = null
    },
  },
}
</script>
<style lang="scss" scoped>
.system-profile-page {
  font-size: 20px;
  padding: 60px 24px;
  height: unset !important;
  .mr-10 {
    margin-right: 10px;
  }
  .mr-50 {
    margin-right: 50px;
  }
  .image {
    max-width: 1000px;
    max-height: 1000px;
    border-radius: 5px;
    padding: 10px;
  }
  .cursor-pointer {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 36px;
    border: 1px solid #bababa;
    border-radius: 5px;
  }
}
#inputFile {
  display: none;
}
</style>
