(function(e){function t(t){for(var i,r,c=t[0],o=t[1],u=t[2],d=0,f=[];d<c.length;d++)r=c[d],Object.prototype.hasOwnProperty.call(a,r)&&a[r]&&f.push(a[r][0]),a[r]=0;for(i in o)Object.prototype.hasOwnProperty.call(o,i)&&(e[i]=o[i]);l&&l(t);while(f.length)f.shift()();return s.push.apply(s,u||[]),n()}function n(){for(var e,t=0;t<s.length;t++){for(var n=s[t],i=!0,c=1;c<n.length;c++){var o=n[c];0!==a[o]&&(i=!1)}i&&(s.splice(t--,1),e=r(r.s=n[0]))}return e}var i={},a={index:0},s=[];function r(t){if(i[t])return i[t].exports;var n=i[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=i,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)r.d(n,i,function(t){return e[t]}.bind(null,i));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="/layout_sandbox/";var c=window["webpackJsonp"]=window["webpackJsonp"]||[],o=c.push.bind(c);c.push=t,c=c.slice();for(var u=0;u<c.length;u++)t(c[u]);var l=o;s.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"06b2":function(e,t,n){"use strict";n("7701")},1:function(e,t){},"1e20":function(e,t,n){},"56d7":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var i=n("2b0e"),a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},[n("Header",{on:{searchAPI:e.searchAPI,trendAPI:e.trendAPI}}),n("div",{staticClass:"main"},[n("SideMenu"),n("Body",[n("b-loading",{attrs:{"is-full-page":!0,"can-cancel":!1},model:{value:e.isLoading,callback:function(t){e.isLoading=t},expression:"isLoading"}}),n("transition",[n("router-view",{attrs:{gifImageList:e.gifImageList}})],1)],1)],1)],1)},s=[],r=(n("841c"),n("ac1f"),function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("header",{staticClass:"main-header"},[i("div",{staticClass:"logo"},[i("img",{attrs:{src:n("cf05")}}),e.isMinimum?e._e():i("h1",[e._v("GIF SEARCH")])]),i("div",{staticClass:"search"},[i("input",{directives:[{name:"model",rawName:"v-model",value:e.search,expression:"search"}],staticClass:"input",attrs:{type:"search",placeholder:"検索"},domProps:{value:e.search},on:{input:function(t){t.target.composing||(e.search=t.target.value)}}}),i("button",{staticClass:"button mdi mdi-image-search-outline is-primary",on:{click:e.searchClick}})]),e.isMinimum?e._e():i("div",{staticClass:"nav-info"},[i("a",{staticClass:"mdi mdi-cloud-refresh",on:{click:e.trendClick}})])])}),c=[],o={data:function(){return{search:"",isMinimum:!(window.innerWidth>640)}},created:function(){window.addEventListener("resize",this.changeSize)},destroyed:function(){window.removeEventListener("resize",this.changeSize)},methods:{searchClick:function(){this.$emit("searchAPI",this.search)},changeSize:function(){this.isMinimum=!(window.innerWidth>720)},trendClick:function(){this.$emit("trendAPI")}}},u=o,l=(n("b468"),n("2877")),d=Object(l["a"])(u,r,c,!1,null,"312cce16",null),f=d.exports,m=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"side-menu",style:e.menuSize},[n("div",{staticClass:"menu-box"},[n("a",{staticClass:"menu-btn mdi mdi-menu",on:{click:function(t){return e.menuWindowChange()}}})]),n("div",{staticClass:"navbar"},[n("ul",e._l(e.categories,(function(t,i){return n("li",{key:i},[n("router-link",{attrs:{to:"?category="+t.name}},[n("b-icon",{class:{icon:!e.isMinimum},attrs:{icon:t.icon}}),n("span",[e._v(e._s(e.isMinimum?"":t.name))])],1)],1)})),0)])])},g=[],A={data:function(){return{isMinimum:!(window.innerWidth>640),categories:[{name:"Trend",icon:"star-outline"},{name:"Sports",icon:"baseball"},{name:"Game",icon:"gamepad-variant-outline"},{name:"News",icon:"newspaper-variant-multiple-outline"},{name:"Art",icon:"book-multiple-outline"}]}},created:function(){window.addEventListener("resize",this.changeSize)},destroyed:function(){window.removeEventListener("resize",this.changeSize)},computed:{menuSize:function(){return{width:this.isMinimum?"64px":"200px"}}},methods:{menuWindowChange:function(){this.isMinimum=!this.isMinimum},changeSize:function(){this.isMinimum=!(window.innerWidth>640)}}},p=A,h=(n("06b2"),Object(l["a"])(p,m,g,!1,null,"244021ef",null)),b=h.exports,v=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"main-body"},[e._t("default")],2)},B=[],w=(n("9ddd"),{}),C=Object(l["a"])(w,v,B,!1,null,"000352f3",null),y=C.exports,P={components:{Header:f,SideMenu:b,Body:y},data:function(){return{gifImageList:{},isLoading:!0}},watch:{$route:function(){this.searchAPI(this.$route.query.category)}},methods:{searchAPI:function(e){var t=this;this.isLoading=!0,this.gifImageList={},this.$gf.search(e,{sort:"relevant",lang:"es",limit:30,type:"stickers"}).then((function(e){t.gifImageList=e,t.isLoading=!1}))},trendAPI:function(){var e=this;this.isLoading=!0,this.gifImageList={},this.$gf.trending({limit:30}).then((function(t){e.gifImageList=t,e.isLoading=!1}))}},mounted:function(){this.trendAPI()}},L=P,J=(n("5c0b"),Object(l["a"])(L,a,s,!1,null,null,null)),x=J.exports,M=n("8c4f"),O=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"home"},[n("transition-group",{staticClass:"list",attrs:{tag:"div",name:"vue-anime-list"}},e._l(e.gifImageList.data,(function(e,t){return n("Card",{key:t,attrs:{gif:e}})})),1)],1)},z=[],k=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"card custom"},[n("div",{staticClass:"card-image"},[n("figure",{staticClass:"image"},[n("img",{staticClass:"img",attrs:{src:e.gif.images.original.url,alt:"GIF"}})]),n("p",{staticClass:"card-title"},[e._v(e._s(e.gif.title))])])])},E=[],Q={props:{gif:{type:Object,required:!0}}},D=Q,V=(n("b2cb"),Object(l["a"])(D,k,E,!1,null,"27c75926",null)),q=V.exports,S={components:{Card:q},props:{gifImageList:{type:Object,required:!0}}},U=S,T=(n("ba79"),Object(l["a"])(U,O,z,!1,null,"2d8b7f6e",null)),j=T.exports;i["a"].use(M["a"]);var W=[{path:"/",name:"Home",component:j,meta:{title:"GIF SEARCH",desc:"GIF APIを使った遊び場"}}],Y=new M["a"]({mode:"history",base:"/layout_sandbox/",routes:W}),I=Y,N=n("289d"),G=n("bc3a"),H=n.n(G),K=n("b60e");i["a"].use(N["a"]),i["a"].config.productionTip=!1,i["a"].prototype.$axios=H.a.create({xsrfCookieName:"csrftoken",xsrfHeaderName:"X-CSRFToken","Content-Type":"application/json"}),i["a"].prototype.$gf=new K["GiphyFetch"]("sptbf1tstfTsUW56KcFRNTZuU02yb6k5"),new i["a"]({router:I,render:function(e){return e(x)}}).$mount("#app")},"5c0b":function(e,t,n){"use strict";n("9c0c")},"5f4d":function(e,t,n){},7701:function(e,t,n){},"9c0c":function(e,t,n){},"9ddd":function(e,t,n){"use strict";n("fd08")},b2cb:function(e,t,n){"use strict";n("d2bf")},b468:function(e,t,n){"use strict";n("1e20")},ba79:function(e,t,n){"use strict";n("5f4d")},cf05:function(e,t){e.exports="data:image/png;base64,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"},d2bf:function(e,t,n){},fd08:function(e,t,n){}});
//# sourceMappingURL=index.16a77b77.js.map