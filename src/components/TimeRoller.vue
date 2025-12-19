<template>
  <div 
    class="roller-container" 
    @wheel="handleWheel"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div 
      class="roller-wheel" 
      ref="wheelRef"
      :style="{ transform: `translateY(${wheelPosition}px)` }"
    >
      <div 
        v-for="item in rollerItems" 
        :key="item"
        class="roller-item"
        :class="{ active: item === modelValue }"
      >
        {{ formatItem(item) }}
      </div>
    </div>
    <div class="roller-indicator"></div>
    <div class="roller-mask"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 59
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:model-value'])

// Refs
const wheelRef = ref(null)
const wheelPosition = ref(0)
const touchStartY = ref(0)
const touchStartPosition = ref(0)
const isDragging = ref(false)

// 计算滚轮项
const rollerItems = computed(() => {
  const items = []
  // 生成扩展的滚轮项，便于滚动
  const extendCount = 5
  const totalItems = (props.max - props.min + 1) / props.step
  
  // 添加前面的扩展项
  for (let i = 0; i < extendCount; i++) {
    const value = props.min - (extendCount - i) * props.step
    items.push(value)
  }
  
  // 添加主要项
  for (let i = props.min; i <= props.max; i += props.step) {
    items.push(i)
  }
  
  // 添加后面的扩展项
  for (let i = 0; i < extendCount; i++) {
    const value = props.max + (i + 1) * props.step
    items.push(value)
  }
  
  return items
})

// 格式化显示
const formatItem = (item) => {
  let displayValue = item
  
  // 处理循环显示（如小时0-23，分钟0-59）
  if (item < props.min) {
    displayValue = props.max + (item - props.min + props.step)
  } else if (item > props.max) {
    displayValue = props.min + (item - props.max - props.step)
  }
  
  // 补零处理
  return displayValue.toString().padStart(2, '0')
}

// 计算每个项的高度
const itemHeight = 40

// 更新滚轮位置
const updateWheelPosition = () => {
  // 找到当前值在rollerItems中的索引
  const currentIndex = rollerItems.value.findIndex(item => item === props.modelValue)
  if (currentIndex !== -1) {
    wheelPosition.value = -currentIndex * itemHeight + itemHeight
  }
}

// 处理滚轮事件
const handleWheel = (e) => {
  if (props.disabled) return
  e.preventDefault()
  
  let newValue = props.modelValue
  
  if (e.deltaY < 0) {
    // 向上滚动，值增加
    newValue = Math.min(props.max, newValue + props.step)
  } else {
    // 向下滚动，值减少
    newValue = Math.max(props.min, newValue - props.step)
  }
  
  emit('update:model-value', newValue)
}

// 处理触摸开始
const handleTouchStart = (e) => {
  if (props.disabled) return
  isDragging.value = true
  touchStartY.value = e.touches[0].clientY
  touchStartPosition.value = wheelPosition.value
}

// 处理触摸移动
const handleTouchMove = (e) => {
  if (props.disabled || !isDragging.value) return
  
  e.preventDefault()
  const currentY = e.touches[0].clientY
  const deltaY = currentY - touchStartY.value
  
  // 临时更新位置，提供视觉反馈
  wheelPosition.value = touchStartPosition.value + deltaY
}

// 处理触摸结束
const handleTouchEnd = () => {
  if (props.disabled || !isDragging.value) return
  
  isDragging.value = false
  
  // 计算应该选中的项
  const scrollDistance = wheelPosition.value - touchStartPosition.value
  const itemsScrolled = Math.round(scrollDistance / itemHeight)
  
  let newValue = props.modelValue - itemsScrolled * props.step
  
  // 边界处理
  if (newValue < props.min) {
    newValue = props.min
  } else if (newValue > props.max) {
    newValue = props.max
  }
  
  emit('update:model-value', newValue)
}

// 监听值变化，更新滚轮位置
watch(() => props.modelValue, () => {
  nextTick(() => {
    updateWheelPosition()
  })
})

// 组件挂载时初始化
onMounted(() => {
  nextTick(() => {
    updateWheelPosition()
  })
})
</script>

<style scoped>
/* 组件特定样式已在全局style.css中定义 */
</style>