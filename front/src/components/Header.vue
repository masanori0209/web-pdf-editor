<template>
  <header class="main-header">
    <div class="logo">
      <img src="@/assets/logo.png">
      <h1 v-if="!isMinimum">GIF SEARCH</h1>
    </div>
    <div class="search">
      <input class="input" type="search" v-model="search" placeholder="検索"/>
      <button
        class="button mdi mdi-image-search-outline is-primary"
        @click="searchClick"
      >
      </button>
    </div>
    <div class="nav-info" v-if="!isMinimum">
      <a @click="trendClick" class="mdi mdi-cloud-refresh"></a>
    </div>
  </header>
</template>
<script>
export default {
  data () {
    return {
      search: "",
      isMinimum: window.innerWidth > 640 ? false : true
    }
  },
  created() {
    window.addEventListener("resize", this.changeSize);
} ,
  destroyed() {
    window.removeEventListener("resize", this.changeSize);
  },
  methods: {
    searchClick () {
      this.$emit("searchAPI", this.search)
    },
    changeSize () {
      this.isMinimum = window.innerWidth > 720 ? false : true
    },
    trendClick () {
      this.$emit("trendAPI")
    }
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
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  .logo {
    display: flex;
    align-items: center;
    h1 {
      margin-left: 8px;
      font-size: 30px;
      font-weight: 700;
      color: #375b98;
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