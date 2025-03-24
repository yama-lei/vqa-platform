<template>
  <div class="video-player-container">
    <video
      ref="videoPlayer"
      class="video-js vjs-default-skin vjs-big-play-centered"
      controls
      preload="auto"
      width="100%"
      height="100%"
    ></video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

const videoPlayer = ref(null)
let player = null

// 初始化视频播放器
const initializePlayer = () => {
  if (videoPlayer.value) {
    player = videojs(videoPlayer.value, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      sources: [{
        src: props.src,
        type: getVideoType(props.src)
      }],
      ...props.options
    })
  }
}

// 根据文件扩展名获取视频类型
const getVideoType = (src) => {
  const extension = src.split('.').pop().toLowerCase()
  switch (extension) {
    case 'mp4':
      return 'video/mp4'
    case 'webm':
      return 'video/webm'
    case 'ogg':
      return 'video/ogg'
    default:
      return 'video/mp4'
  }
}

// 监听src变化，重新加载视频
watch(() => props.src, (newSrc) => {
  if (player) {
    player.src({
      src: newSrc,
      type: getVideoType(newSrc)
    })
  }
})

onMounted(() => {
  initializePlayer()
})

onBeforeUnmount(() => {
  if (player) {
    player.dispose()
  }
})
</script>

<style scoped>
.video-player-container {
  width: 100%;
  height: 100%;
}
</style> 