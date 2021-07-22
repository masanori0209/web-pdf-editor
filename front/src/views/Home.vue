<template>
  <div class="home">
    <transition-group tag="div" class="list" name="vue-anime-list">
      <Card
        v-for="(gif, idx) in gifImageList.data"
        :key="idx"
        :gif="gif"
      />
    </transition-group>
  </div>
</template>
<script>
import Card from '@/components/Card.vue'
export default {
  components: {
    Card,
  },
  props: {
    gifImageList: {
      type: Object,
      required: true
    }
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