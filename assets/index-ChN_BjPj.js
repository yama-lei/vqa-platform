const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/MainLayout-JpXt8dsL.js","assets/_plugin-vue_export-helper-DlAUqK2U.js","assets/vendor-DQ4wclxO.js","assets/vendor-Cndv9k3-.css","assets/MainLayout-BpASrkGP.css","assets/index-DQCg7CS7.js","assets/index-COF4zv8d.css","assets/index-FmZC8PLL.js","assets/oss-B6tvshPE.js","assets/index-BGpYNiXn.css","assets/index-DsQYrlV_.js","assets/index-CL29k6ng.css","assets/index-BLf_ygva.js","assets/index-Pvw0aaby.css","assets/index-CuyGUUiw.js","assets/index-DyD9yXQ6.css","assets/NotFound-PbETNisd.js","assets/NotFound-jS3wT0C5.css"])))=>i.map(i=>d[i]);
import{c as y,a as d,w as P,u as g,z as L,r as _,o as O,b as A,d as w,E as R,e as b,i as I}from"./vendor-DQ4wclxO.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))u(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const t of o.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&u(t)}).observe(document,{childList:!0,subtree:!0});function l(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function u(e){if(e.ep)return;e.ep=!0;const o=l(e);fetch(e.href,o)}})();const V={class:"app-container"},T={__name:"App",setup(a){return(n,l)=>{const u=_("router-view"),e=_("el-config-provider");return O(),y("div",V,[d(e,{locale:g(L)},{default:P(()=>[d(u)]),_:1},8,["locale"])])}}},D="modulepreload",S=function(a){return"/"+a},f={},c=function(n,l,u){let e=Promise.resolve();if(l&&l.length>0){document.getElementsByTagName("link");const t=document.querySelector("meta[property=csp-nonce]"),r=(t==null?void 0:t.nonce)||(t==null?void 0:t.getAttribute("nonce"));e=Promise.allSettled(l.map(s=>{if(s=S(s),s in f)return;f[s]=!0;const p=s.endsWith(".css"),h=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${h}`))return;const i=document.createElement("link");if(i.rel=p?"stylesheet":D,p||(i.as="script"),i.crossOrigin="",i.href=s,r&&i.setAttribute("nonce",r),document.head.appendChild(i),p)return new Promise((E,v)=>{i.addEventListener("load",E),i.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${s}`)))})}))}function o(t){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=t,window.dispatchEvent(r),!r.defaultPrevented)throw t}return e.then(t=>{for(const r of t||[])r.status==="rejected"&&o(r.reason);return n().catch(o)})},C=[{path:"/",component:()=>c(()=>import("./MainLayout-JpXt8dsL.js"),__vite__mapDeps([0,1,2,3,4])),children:[{path:"/",name:"Home",component:()=>c(()=>import("./index-DQCg7CS7.js"),__vite__mapDeps([5,2,3,1,6])),meta:{title:"首页"}},{path:"/resources",name:"Resources",component:()=>c(()=>import("./index-FmZC8PLL.js"),__vite__mapDeps([7,2,3,8,1,9])),meta:{title:"资源中心"}},{path:"/model",name:"Model",component:()=>c(()=>import("./index-DsQYrlV_.js"),__vite__mapDeps([10,2,3,1,11])),meta:{title:"模型对话"}},{path:"/upload",name:"Upload",component:()=>c(()=>import("./index-BLf_ygva.js"),__vite__mapDeps([12,2,3,8,1,13])),meta:{title:"文件上传"}},{path:"/learning",name:"Learning",component:()=>c(()=>import("./index-CuyGUUiw.js"),__vite__mapDeps([14,2,3,1,15])),meta:{title:"学习空间"}}]},{path:"/:pathMatch(.*)*",name:"NotFound",component:()=>c(()=>import("./NotFound-PbETNisd.js"),__vite__mapDeps([16,2,3,1,17]))}],N=A({history:createWebHashHistory(),routes:C}),m=w(T);for(const[a,n]of Object.entries(R))m.component(a,n);m.use(b());m.use(N);m.use(I);m.mount("#app");
