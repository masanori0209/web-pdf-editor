<template>
  <div class="home">
    <b-steps
      :has-navigation="false"
      v-model="step">
      <b-step-item step="1" label="Upload">
        <PDFUpload
          :parameter="parameter"
          :deleteFile="deleteFile"
          :uploadFile="uploadFile"
        />
      </b-step-item>
      <b-step-item step="2" label="Edit">
        <PDFEditor
          :parameter="parameter"
          :deleteFile="deleteFile"
          :uploadFile="uploadFile"
        />
      </b-step-item>
      <b-step-item step="3" label="Download">
        <PDFDownload
          :parameter="parameter"
          :deleteFile="deleteFile"
          :uploadFile="uploadFile"
        />
      </b-step-item>
    </b-steps>
  </div>
</template>
<script>
import PDFUpload      from '@/components/PDFUpload.vue'
import PDFEditor      from '@/components/PDFEditor.vue'
import PDFDownload    from '@/components/PDFDownload.vue'
import fileUploadView from '@/wasmAPI'
export default {
  components: {
    PDFUpload,
    PDFEditor,
    PDFDownload,
  },
  data () {
    return {
      step: 0,
      parameter: {
        beforePdf: null,
        afterPdf: null,
      }
    }
  },
  methods: {
    deleteFile () {
      this.parameter = {
        beforePdf: null,
        afterPdf: null,
      }
    },
    uploadFile () {
      fileUploadView(this.parameter)
      this.step++
    }
  }
}
</script>
<style lang="scss" scoped>
.home {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  padding: 32px;
}
</style>