<template>
  <div class="home">
    <b-steps
      v-model="step">
      <b-step-item step="1" label="Account">
        <PDFUpload
          :parameter="parameter"
          :deleteFile="deleteFile"
          :uploadFile="uploadFile"
        />
      </b-step-item>
      <b-step-item step="2" label="Profile">
        <PDFEditor
          :parameter="parameter"
          :deleteFile="deleteFile"
          :uploadFile="uploadFile"
        />
      </b-step-item>
      <b-step-item step="3" label="Finish">
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
import PDFUpload   from '@/components/PDFUpload.vue'
import PDFEditor   from '@/components/PDFEditor.vue'
import PDFDownload from '@/components/PDFDownload.vue'
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