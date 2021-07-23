<template>
  <header class="main-header">
    <div class="logo">
      <img src="@/assets/logo.png">
      <h1 v-if="!isMinimum">P-EDIT</h1>
    </div>
    <div class="nav-info" v-if="!isMinimum">
      <a @click="debugClick" class="mdi mdi-cloud-refresh"></a>
    </div>
  </header>
</template>
<script>
export default {
  props: {
    debugClick: {
      type: Function,
      require: true
    }
  },
  data () {
    return {
      search: "",
      isMinimum: window.innerWidth > 640 ? false : true
    }
  },
  created () {
    window.addEventListener("resize", this.changeSize);
  },
  destroyed() {
    window.removeEventListener("resize", this.changeSize);
  },
  methods: {
    changeSize () {
      this.isMinimum = window.innerWidth > 720 ? false : true
    },
  }
}
</script>
<style lang="scss" scoped>
.main-header{
  height: 64px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #375b98;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  .logo {
    display: flex;
    align-items: center;
    h1 {
      margin-left: 8px;
      font-size: 30px;
      font-weight: 700;
      color: white;
    }
    img {
      height: 48px;
      width: 48px;
    }
  }
  .search {
    display: flex;
    input {
      height: 40px;
      width: 48vw;
      min-width: 200px;
      max-width: 600px;
      border-radius: 0;
    }
    button {
      border-radius: 0;
    }
  }
  .nav-info {
    a {
      font-size: 32px;
    }
  }
}
</style>