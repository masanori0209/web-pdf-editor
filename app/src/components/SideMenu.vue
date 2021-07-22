<template>
  <div class="side-menu" :style="menuSize">
    <div class="menu-box">
      <a
        class="menu-btn mdi mdi-menu"
        @click="menuWindowChange()"
      ></a>
    </div>
    <div class="navbar">
      <ul>
        <li v-for="(category, idx) in categories" :key="idx">
          <router-link
            :to="'?category=' + category.name">
            <b-icon :class="{'icon': !isMinimum}" :icon="category.icon"></b-icon>
            <span>{{isMinimum ? '' : category.name}}</span>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      isMinimum: window.innerWidth > 640 ? false : true,
      categories: [
        {
          name: "Trend",
          icon: "star-outline",
        },
        {
          name: "Sports",
          icon: "baseball",
        },
        {
          name: "Game",
          icon: "gamepad-variant-outline",
        },
        {
          name: "News",
          icon: "newspaper-variant-multiple-outline",
        },
        {
          name: "Art",
          icon: "book-multiple-outline",
        },
      ]
    }
  },
  created() {
    window.addEventListener("resize", this.changeSize);
  } ,
  destroyed() {
    window.removeEventListener("resize", this.changeSize);
  },
  computed: {
    menuSize () {
      return {
        width: this.isMinimum ? '64px' : '200px'
      }
    }
  },
  methods: {
    menuWindowChange () {
      this.isMinimum = !this.isMinimum
    },
    changeSize () {
      this.isMinimum = window.innerWidth > 640 ? false : true
    }
  }
}
</script>
<style lang="scss" scoped>
.side-menu{
  height: calc(100vh - 64px);
  width: 200px;
  transition: 0.5s;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  .menu-box {
    display: flex;
    justify-content: flex-end;
    padding: 0 12px;
    .menu-btn {
      font-size: 32px;
    }
  }
  .navbar {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    ul {
      width: 100%;
      li {
        font-size: 24px;
        padding: 8px 12px;
        transition: 0.5s;
        a {
          display: flex;
          align-items: center;
        }
        .icon {
          margin-right: 8px;
        }
      }
      li:hover {
        background: lightcoral;
      }
    }
  }
}
</style>
