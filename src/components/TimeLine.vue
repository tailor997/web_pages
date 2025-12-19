<template>
  <div class="timeline-container">
    <!-- 时间轴背景 -->
    <div class="timeline-bar"></div>
    
    <!-- 行动时长段 -->
    <div 
      class="timeline-period" 
      style="
        left: 0%;
        width: calc(100% * ({{ actionDurationMinutes }} / {{ totalDurationMinutes }}));
        background-color: rgba(239, 68, 68, 0.3);
      "
    ></div>
    
    <!-- 预约时长段 -->
    <div 
      class="timeline-period" 
      style="
        left: calc(100% * ({{ actionDurationMinutes }} / {{ totalDurationMinutes }}));
        width: calc(100% * ({{ appointmentDurationMinutes }} / {{ totalDurationMinutes }}));
        background-color: rgba(59, 130, 246, 0.3);
      "
    ></div>
    
    <!-- 起始时间标记 -->
    <div 
      class="timeline-marker" 
      style="
        left: 0%;
        background-color: #ef4444;
      "
      :title="formatTime(startTime)"
    ></div>
    <div class="timeline-label timeline-label-start" style="left: 0%">
      {{ formatTime(startTime) }}
      <span class="text-xs text-gray-500 ml-1">(开始)</span>
    </div>
    
    <!-- 行动结束/预约开始标记 -->
    <div 
      class="timeline-marker" 
      style="
        left: calc(100% * ({{ actionDurationMinutes }} / {{ totalDurationMinutes }}));
        background-color: #f59e0b;
      "
      :title="formatTime(actionEndTime)"
    ></div>
    <div 
      class="timeline-label timeline-label-current" 
      style="left: calc(100% * ({{ actionDurationMinutes }} / {{ totalDurationMinutes }}))"
    >
      {{ formatTime(actionEndTime) }}
      <span class="text-xs text-gray-500 ml-1">(行动结束)</span>
    </div>
    
    <!-- 预约结束/结束时间标记 -->
    <div 
      class="timeline-marker" 
      style="
        left: 100%;
        background-color: #10b981;
      "
      :title="formatTime(endTime)"
    ></div>
    <div class="timeline-label timeline-label-future" style="left: 100%">
      {{ formatTime(endTime) }}
      <span class="text-xs text-gray-500 ml-1">(结束)</span>
    </div>
    
    <!-- 时间轴刻度 -->
    <div 
      v-for="tick in timelineTicks" 
      :key="tick"
      class="absolute top-1/2 -translate-y-1/2 w-px h-4 bg-gray-400"
      :style="{ left: `${tick.position}%` }"
    >
      <div 
        class="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap"
      >
        {{ tick.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  startTime: {
    type: Object,
    required: true
  },
  endTime: {
    type: Object,
    required: true
  },
  appointmentDuration: {
    type: Object,
    required: true
  },
  actionDuration: {
    type: Object,
    required: true
  },
  timeFormat: {
    type: String,
    default: '24h'
  }
})

// 计算总分钟数
const appointmentDurationMinutes = computed(() => {
  return props.appointmentDuration.hour * 60 + props.appointmentDuration.minute
})

const actionDurationMinutes = computed(() => {
  return props.actionDuration.hour * 60 + props.actionDuration.minute
})

const totalDurationMinutes = computed(() => {
  return appointmentDurationMinutes.value + actionDurationMinutes.value
})

// 计算行动结束时间
const actionEndTime = computed(() => {
  const totalMinutes = props.startTime.hour * 60 + props.startTime.minute + actionDurationMinutes.value
  return {
    hour: Math.floor(totalMinutes / 60) % 24,
    minute: totalMinutes % 60
  }
})

// 格式化时间
const formatTime = (timeObj) => {
  let { hour, minute } = timeObj
  let period = ''
  
  if (props.timeFormat === '12h') {
    period = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12 || 12
  }
  
  const formattedHour = hour.toString().padStart(2, '0')
  const formattedMinute = minute.toString().padStart(2, '0')
  
  return props.timeFormat === '12h' 
    ? `${formattedHour}:${formattedMinute} ${period}`
    : `${formattedHour}:${formattedMinute}`
}

// 生成时间轴刻度
const timelineTicks = computed(() => {
  const ticks = []
  const totalMinutes = totalDurationMinutes.value
  
  // 根据总时长决定刻度数量
  let tickInterval = 15 // 默认15分钟一个刻度
  if (totalMinutes > 240) tickInterval = 30 // 超过4小时，30分钟一个刻度
  if (totalMinutes > 480) tickInterval = 60 // 超过8小时，1小时一个刻度
  
  // 生成刻度
  for (let i = 0; i <= totalMinutes; i += tickInterval) {
    const position = (i / totalMinutes) * 100
    const tickTime = {
      hour: Math.floor((props.startTime.hour * 60 + props.startTime.minute + i) / 60) % 24,
      minute: (props.startTime.minute + i) % 60
    }
    
    ticks.push({
      position,
      label: formatTime(tickTime)
    })
  }
  
  // 确保结束时间有刻度
  const lastTick = ticks[ticks.length - 1]
  if (lastTick && Math.abs(lastTick.position - 100) > 0.1) {
    ticks.push({
      position: 100,
      label: formatTime(props.endTime)
    })
  }
  
  return ticks
})
</script>

<style scoped>
/* 组件特定样式已在全局style.css中定义 */
</style>
