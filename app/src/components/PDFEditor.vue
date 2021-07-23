<template>
  <div class="card custom">
    <div class="card-image">
      <figure class="image">
        <img class="img" :src="gif.images.original.url" alt="GIF">
      </figure>
      <p class="card-title">{{gif.title}}</p>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    gif: {
      type: Object,
      required: true
    }
  },
}
</script>
<style lang="scss" scoped>
.custom {
  height: 250px;
  width: 300px;
  margin: 8px;
  transition: 0.5s;
}
.custom:hover {
  transform: scale(1.02);
}
.img {
  width: 300px;
  height: 210px;
  object-fit: cover;
}
.card-title {
  padding: 8px;
  width: 300px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>