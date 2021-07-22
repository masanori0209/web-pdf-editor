<template>
  <div id="app">
    <!-- ヘッダー部 -->
    <Header
      @searchAPI="searchAPI"
      @trendAPI="trendAPI"
    />
    <!-- サイドメニュー部 -->
    <div class="main">
      <SideMenu/>
      <!-- ボディ部 -->
      <Body>
        <b-loading :is-full-page="true" v-model="isLoading" :can-cancel="false"></b-loading>
        <transition>
          <router-view
            :gifImageList="gifImageList"
          />
        </transition>
      </Body>
    </div>
  </div>
</template>
<script>
import Header from '@/components/Header.vue'
import SideMenu from '@/components/SideMenu.vue'
import Body from '@/components/Body.vue'
export default {
  components: {
    Header,
    SideMenu,
    Body
  },
  data () {
    return {
      gifImageList: {},
      isLoading: true
    }
  },
  watch: {
    $route () {
      this.searchAPI(this.$route.query.category)
    }
  },
  methods: {
    searchAPI (text) {
      this.isLoading = true
      this.gifImageList = {}
      this.$gf.search(text,
        {
          sort: 'relevant',
          lang: 'es',
          limit: 30,
          type: 'stickers'
        }).then((d) => {
          this.gifImageList = d
          this.isLoading = false
        })
    },
    trendAPI () {
      this.isLoading = true
      this.gifImageList = {}
      this.$gf.trending({ limit: 30 }).then((d) => {
        this.gifImageList = d
        this.isLoading = false
      })
    }
  },
  mounted () {
    this.trendAPI()
  }
}
</script>
<style lang="scss">
@import 'https://cdn.jsdelivr.net/npm/@mdi/font@5.8.55/css/materialdesignicons.min.css';
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500&display=swap');

#app {
  font-family: 'Noto Sans JP', Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  overflow: hidden;
  .main {
    height: calc(100vh - 64px);
    width: -webkit-fill-available;
    display: flex;
  }
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
}

::-webkit-scrollbar-track {
  border-radius: 8px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, .1);
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 50, .5);
  border-radius: 8px;
  box-shadow:0 0 0 1px rgba(255, 255, 255, .3);
}

.main-body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}


// Import Bulma's core
@import "~bulma/sass/utilities/_all";

// Set your colors
$primary: #375b98;
$primary-light: findLightColor($primary);
$primary-dark: findDarkColor($primary);
$primary-invert: findColorInvert($primary);

// Lists and maps
$custom-colors: null !default;
$custom-shades: null !default;

// Setup $colors to use as bulma classes (e.g. 'is-twitter')
$colors: mergeColorMaps(
    (
        "white": (
            $white,
            $black,
        ),
        "black": (
            $black,
            $white,
        ),
        "light": (
            $light,
            $light-invert,
        ),
        "dark": (
            $dark,
            $dark-invert,
        ),
        "primary": (
            $primary,
            $primary-invert,
            $primary-light,
            $primary-dark,
        ),
        "link": (
            $link,
            $link-invert,
            $link-light,
            $link-dark,
        ),
        "info": (
            $info,
            $info-invert,
            $info-light,
            $info-dark,
        ),
        "success": (
            $success,
            $success-invert,
            $success-light,
            $success-dark,
        ),
        "warning": (
            $warning,
            $warning-invert,
            $warning-light,
            $warning-dark,
        ),
        "danger": (
            $danger,
            $danger-invert,
            $danger-light,
            $danger-dark,
        ),
    ),
    $custom-colors
);

// Import Bulma and Buefy styles
@import "~bulma";
@import "~buefy/src/scss/buefy";

.v-enter-active {
  transition: all .8s ease;
}

.v-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}

.v-enter, .v-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

img {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
