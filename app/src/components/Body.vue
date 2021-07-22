<template>
  <div class="main-body">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.main-body{
  height: calc(100vh - 64px);
  flex: 1;
  overflow: scroll;
}
</style>