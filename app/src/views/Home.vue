<template>
  <div class="home">
    <transition-group tag="div" class="list" name="vue-anime-list">
      <PDFEditor/>
    </transition-group>
  </div>
</template>
<script>
import PDFEditor from '@/components/PDFEditor.vue'
export default {
  components: {
    PDFEditor,
  },
}
</script>
<style lang="scss" scoped>
.home, .list {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}
.vue-anime-list {
  &-enter-active {
    opacity: 0;
    transform: translateX(50px);
    transition: {
      property       : transform, opacity;
      duration       : 0.6s;
      timing-function: cubic-bezier(0.77, 0, 0.175, 1);
    }
  }
  &-enter-to {
    opacity: 1;
    transform: translateX(0);
  }
  &-leave-active{
    opacity: 1;
    transform: translateX(0);
    transition: {
      property       : transform, opacity;
      duration       : 0.6s;
      timing-function: cubic-bezier(0.77, 0, 0.175, 1);
    }
  }
  &-leave-to{
    opacity: 0;
    transform: translateX(50px);
  }
  &-move{
    transition: {
      property       : transform;
      duration       : 0.6s;
      timing-function: cubic-bezier(0.77, 0, 0.175, 1);
    }
  }
}
</style>