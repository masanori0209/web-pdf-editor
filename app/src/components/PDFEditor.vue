<template>
  <div class="card custom">
  </div>
</template>
<script>
export default {
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