<template>
  <section class="section">
    <!-- アップロードフォーム -->
    <b-field>
      <b-upload
        v-model="parameter.beforePdf"
        drag-drop>
        <section class="section">
          <div class="content has-text-centered">
            <p>
              <b-icon
                  icon="upload"
                  size="is-large">
              </b-icon>
            </p>
            <p>ドラッグ＆ドロップもしくはこちらをクリックして下さい</p>
          </div>
        </section>
      </b-upload>
      <div class="block" v-if="!isEmptyFile">
        <span
          class="tag is-primary">
          {{parameter.beforePdf.name}}
          <button class="delete is-small"
              type="button"
              @click="deleteFile()">
          </button>
        </span>
      </div>
    </b-field>
    <div class="block">
      <b-button
        type="is-primary"
        @click="uploadFile()"
        icon-left="head-sync-outline"
        :disabled="isEmptyFile">
        {{'ファイルアップロード'}}
      </b-button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PDFUpload',
  props: {
    parameter: {
      type: Object,
      require: true
    },
    deleteFile: {
      type: Function,
      require: true
    },
    uploadFile: {
      type: Function,
      require: true
    },
  },
  computed: {
    isEmptyFile () {
      return this.parameter.beforePdf === null
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
