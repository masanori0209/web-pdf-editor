<template>
  <div class="home">
    <template v-if="step===0">
      <PDFUpload
        :parameter="parameter"
        :deleteFile="deleteFile"
        :uploadFile="uploadFile"
      />
    </template>
    <template v-else-if="step===1">
      <PDFEditor
        :parameter="parameter"
        :deleteFile="deleteFile"
        :uploadFile="uploadFile"
      />
    </template>
    <template v-else>
      <PDFDownload
        :parameter="parameter"
        :deleteFile="deleteFile"
        :uploadFile="uploadFile"
      />
    </template>
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
}
</style>