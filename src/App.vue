<template>
  <div class="h-screen overflow-hidden bg-[#121212] py-3 px-2 md:py-8 md:px-4">
    <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-6 fade-in">
      <!-- 标题 -->
      <h1 class="text-xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-8">时间计算与可视化</h1>

      <!-- 控制面板 -->
      <div class="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-8">
        <!-- 时间参数控制 -->
        <div class="space-y-6">
          <!-- 起始时间 -->
          <div 
            class="p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-gradient-to-br from-white to-sky-50"
            :class="showRoller.startTime ? 'ring-2 ring-sky-400 shadow-md' : ''"
            @click="onCardClick('startTime')"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-700">起始时间</h3>
              <div class="flex items-center gap-2">
                <button 
                  class="px-2 py-1 rounded-lg text-xs font-medium transition bg-sky-100 text-sky-700 hover:bg-sky-200"
                  :class="calculateTarget === 'startTime' ? 'ring-1 ring-sky-500' : ''"
                  @click.stop="calculateTarget = 'startTime'; closeAllRollers()"
                >计算</button>
              </div>
            </div>
            
            <div class="flex items-center gap-2 mb-2">
              <div 
                class="time-block" 
                :class="{ 'block-disabled': calculateTarget === 'startTime' }"
              >
                {{ startTime.hour.toString().padStart(2, '0') }}
              </div>
              <span class="text-gray-500 text-sm">:</span>
              <div 
                class="time-block" 
                :class="{ 'block-disabled': calculateTarget === 'startTime' }"
              >
                {{ startTime.minute.toString().padStart(2, '0') }}
              </div>
            </div>
            
            <!-- 滚轮选择器，条件显示 -->
            <!-- 滚轮改为模态弹窗显示 -->
          </div>

          <!-- 预约时间时长 -->
          <div 
            class="p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-gradient-to-br from-white to-violet-50"
            :class="showRoller.appointmentDuration ? 'ring-2 ring-violet-400 shadow-md' : ''"
            @click="onCardClick('appointmentDuration')"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-700">预约时间时长</h3>
              <div class="flex items-center gap-2">
                <button 
                  class="px-2 py-1 rounded-lg text-xs font-medium transition bg-violet-100 text-violet-700 hover:bg-violet-200"
                  :class="calculateTarget === 'appointmentDuration' ? 'ring-1 ring-violet-500' : ''"
                  @click.stop="calculateTarget = 'appointmentDuration'; closeAllRollers()"
                >计算</button>
              </div>
            </div>
            
            <div class="flex items-center gap-2 mb-2">
              <div 
                class="time-block" 
                :class="{ 'block-disabled': calculateTarget === 'appointmentDuration' }"
              >
                {{ appointmentDuration.hour.toString().padStart(2, '0') }}
              </div>
              <span class="text-gray-500 text-sm">时</span>
              <div 
                class="time-block" 
                :class="{ 'block-disabled': calculateTarget === 'appointmentDuration' }"
              >
                {{ appointmentDuration.minute.toString().padStart(2, '0') }}
              </div>
              <span class="text-gray-500 text-sm">分</span>
            </div>
            
            <!-- 滚轮选择器，条件显示 -->
            <!-- 滚轮改为模态弹窗显示 -->
          </div>

          <!-- 行动时长 -->
          <div 
            class="p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-gradient-to-br from-white to-rose-50"
            :class="showRoller.actionDuration ? 'ring-2 ring-rose-400 shadow-md' : ''"
            @click="onCardClick('actionDuration')"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-700">行动时长</h3>
              <div class="flex items-center gap-2">
                <button 
                  class="px-2 py-1 rounded-lg text-xs font-medium transition bg-rose-100 text-rose-700 hover:bg-rose-200"
                  :class="calculateTarget === 'actionDuration' ? 'ring-1 ring-rose-500' : ''"
                  @click.stop="calculateTarget = 'actionDuration'; closeAllRollers()"
                >计算</button>
              </div>
            </div>
            
            <div class="flex items-center gap-2 mb-2">
              <div 
                class="time-block" 
                :class="{ 'block-disabled': calculateTarget === 'actionDuration' }"
              >
                {{ actionDuration.hour.toString().padStart(2, '0') }}
              </div>
              <span class="text-gray-500 text-sm">时</span>
              <div 
                class="time-block" 
                :class="{ 'block-disabled': calculateTarget === 'actionDuration' }"
              >
                {{ actionDuration.minute.toString().padStart(2, '0') }}
              </div>
              <span class="text-gray-500 text-sm">分</span>
            </div>
            
            <!-- 滚轮选择器，条件显示 -->
            <!-- 滚轮改为模态弹窗显示 -->
          </div>

          <!-- 结束时间 -->
          <div 
            class="p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-gradient-to-br from-white to-emerald-50"
            :class="showRoller.endTime ? 'ring-2 ring-emerald-400 shadow-md' : ''"
            @click="onCardClick('endTime')"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-700">结束时间</h3>
              <div class="flex items-center gap-2">
                <button 
                  class="px-2 py-1 rounded-lg text-xs font-medium transition bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  :class="calculateTarget === 'endTime' ? 'ring-1 ring-emerald-500' : ''"
                  @click.stop="calculateTarget = 'endTime'; closeAllRollers()"
                >计算</button>
              </div>
            </div>
            
            <div class="flex items-center gap-2 mb-2">
              <div 
                class="time-block" 
                :class="{ 'block-disabled': calculateTarget === 'endTime' }"
              >
                {{ endTime.hour.toString().padStart(2, '0') }}
              </div>
              <span class="text-gray-500 text-sm">:</span>
              <div 
                class="time-block" 
                :class="{ 'block-disabled': calculateTarget === 'endTime' }"
              >
                {{ endTime.minute.toString().padStart(2, '0') }}
              </div>
            </div>
            
            <!-- 滚轮选择器，条件显示 -->
            <!-- 滚轮改为模态弹窗显示 -->
          </div>
        </div>

        <!-- 可视化时间轴 -->
        <div class="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">时间轴可视化</h3>
          <time-line 
            :start-time="startTime"
            :end-time="endTime"
            :appointment-duration="appointmentDuration"
            :action-duration="actionDuration"
            :time-format="timeFormat"
          />
        </div>
      </div>

      <!-- 功能按钮区 -->
      <div class="fixed bottom-0 left-0 right-0 z-10">
        <div class="mx-auto max-w-4xl mb-2 px-2">
          <div class="flex flex-wrap justify-between items-center gap-3 md:gap-4 bg-white/95 backdrop-blur p-3 md:p-4 rounded-xl shadow-lg border border-gray-100">
            <div class="flex items-center gap-4">
              <button 
                @click="resetTime" 
                class="px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow transform hover:-translate-y-0.5"
              >
                重置
              </button>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500">当前系统时间</p>
              <p class="text-xl font-semibold text-blue-600">{{ currentSystemTime }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 状态信息 -->
      <div class="hidden md:block bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
        <h4 class="text-sm font-semibold text-blue-800 mb-2">使用说明</h4>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• 选择要计算的时间目标，系统将自动计算</li>
          <li>• 点击时间显示可展开/收起滚轮选择器</li>
          <li>• 滚动滚轮可以快速调整时间值</li>
          <li>• 时间轴清晰展示各时间节点的关系</li>
          <li>• 支持12/24小时制切换</li>
        </ul>
      </div>
    </div>
  </div>
  <div v-if="Object.values(showRoller).some(Boolean)" class="roller-overlay">
    <div class="roller-mask" @click="closeAllRollers"></div>
    <div class="roller-sheet">
      <div class="max-w-4xl mx-auto p-4 flex items-start gap-4">
        <div 
          class="ml-auto px-3 py-1 rounded-lg bg-[#2A2A2A] text-gray-300 hover:bg-[#333] cursor-pointer select-none transition"
          role="button"
          tabindex="0"
          @click="closeAllRollers"
          @keydown.enter="closeAllRollers"
          @keydown.space.prevent="closeAllRollers"
        >关闭</div>
        <div v-if="showRoller.startTime" class="flex items-center gap-3 w-full">
          <time-roller 
            v-model="startTime.hour" 
            :min="0" 
            :max="23" 
            :step="1"
            @update:model-value="calculateTime"
            :disabled="calculateTarget === 'startTime'"
          />
          <div class="text-2xl font-semibold text-gray-400">:</div>
          <time-roller 
            v-model="startTime.minute" 
            :min="0" 
            :max="59" 
            :step="1"
            @update:model-value="calculateTime"
            :disabled="calculateTarget === 'startTime'"
          />
        </div>
        <div v-if="showRoller.appointmentDuration" class="flex items-center gap-3 w-full">
          <time-roller 
            v-model="appointmentDuration.hour" 
            :min="0" 
            :max="23" 
            :step="1"
            @update:model-value="calculateTime"
            :disabled="calculateTarget === 'appointmentDuration'"
          />
          <div class="text-xl font-semibold text-gray-400">时</div>
          <time-roller 
            v-model="appointmentDuration.minute" 
            :min="0" 
            :max="59" 
            :step="1"
            @update:model-value="calculateTime"
            :disabled="calculateTarget === 'appointmentDuration'"
          />
          <div class="text-xl font-semibold text-gray-400">分</div>
        </div>
        <div v-if="showRoller.actionDuration" class="flex items-center gap-3 w-full">
          <time-roller 
            v-model="actionDuration.hour" 
            :min="0" 
            :max="23" 
            :step="1"
            @update:model-value="calculateTime"
            :disabled="calculateTarget === 'actionDuration'"
          />
          <div class="text-xl font-semibold text-gray-400">时</div>
          <time-roller 
            v-model="actionDuration.minute" 
            :min="0" 
            :max="59" 
            :step="1"
            @update:model-value="calculateTime"
            :disabled="calculateTarget === 'actionDuration'"
          />
          <div class="text-xl font-semibold text-gray-400">分</div>
        </div>
        <div v-if="showRoller.endTime" class="flex items-center gap-3 w-full">
          <time-roller 
            v-model="endTime.hour" 
            :min="0" 
            :max="23" 
            :step="1"
            @update:model-value="calculateTime"
            :disabled="calculateTarget === 'endTime'"
          />
          <div class="text-2xl font-semibold text-gray-400">:</div>
          <time-roller 
            v-model="endTime.minute" 
            :min="0" 
            :max="59" 
            :step="1"
            @update:model-value="calculateTime"
            :disabled="calculateTarget === 'endTime'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import TimeRoller from './components/TimeRoller.vue'
import TimeLine from './components/TimeLine.vue'

// 时间格式
const timeFormat = ref('24h')

// 当前系统时间
const currentSystemTime = ref('')

// 计算目标选择（默认计算结束时间）
const calculateTarget = ref('endTime') // 可选值：startTime, appointmentDuration, actionDuration, endTime

// 滚轮显示状态
const showRoller = ref({
  startTime: false,
  appointmentDuration: false,
  actionDuration: false,
  endTime: false
})

// 起始时间
const startTime = ref({
  hour: new Date().getHours(),
  minute: new Date().getMinutes()
})

// 预约时间时长
const appointmentDuration = ref({
  hour: 0,
  minute: 0
})

// 行动时长
const actionDuration = ref({
  hour: 0,
  minute: 45
})

// 结束时间
const endTime = ref({
  hour: 0,
  minute: 0
})

// 计算结束时间
const calculateEndTime = () => {
  const startMinutes = startTime.value.hour * 60 + startTime.value.minute
  const appointmentMinutes = appointmentDuration.value.hour * 60 + appointmentDuration.value.minute
  const actionMinutes = actionDuration.value.hour * 60 + actionDuration.value.minute
  
  let totalMinutes = startMinutes + appointmentMinutes + actionMinutes
  totalMinutes = totalMinutes % (24 * 60) // 处理超过24小时的情况
  
  endTime.value.hour = Math.floor(totalMinutes / 60)
  endTime.value.minute = totalMinutes % 60
}

// 计算行动时长
const calculateActionDuration = () => {
  const startMinutes = startTime.value.hour * 60 + startTime.value.minute
  const endMinutes = endTime.value.hour * 60 + endTime.value.minute
  const appointmentMinutes = appointmentDuration.value.hour * 60 + appointmentDuration.value.minute
  
  let actionMinutes = endMinutes - startMinutes - appointmentMinutes
  if (actionMinutes < 0) actionMinutes += 24 * 60 // 处理跨天情况
  
  actionDuration.value.hour = Math.floor(actionMinutes / 60)
  actionDuration.value.minute = actionMinutes % 60
}

// 计算预约时长
const calculateAppointmentDuration = () => {
  const startMinutes = startTime.value.hour * 60 + startTime.value.minute
  const endMinutes = endTime.value.hour * 60 + endTime.value.minute
  const actionMinutes = actionDuration.value.hour * 60 + actionDuration.value.minute
  
  let appointmentMinutes = endMinutes - startMinutes - actionMinutes
  if (appointmentMinutes < 0) appointmentMinutes += 24 * 60 // 处理跨天情况
  
  appointmentDuration.value.hour = Math.floor(appointmentMinutes / 60)
  appointmentDuration.value.minute = appointmentMinutes % 60
}

// 计算起始时间
const calculateStartTime = () => {
  const endMinutes = endTime.value.hour * 60 + endTime.value.minute
  const appointmentMinutes = appointmentDuration.value.hour * 60 + appointmentDuration.value.minute
  const actionMinutes = actionDuration.value.hour * 60 + actionDuration.value.minute
  
  let startMinutes = endMinutes - appointmentMinutes - actionMinutes
  if (startMinutes < 0) startMinutes += 24 * 60 // 处理跨天情况
  
  startTime.value.hour = Math.floor(startMinutes / 60)
  startTime.value.minute = startMinutes % 60
}

// 时间计算逻辑
const calculateTime = () => {
  // 根据用户选择的目标进行计算
  switch (calculateTarget.value) {
    case 'startTime':
      calculateStartTime()
      break
    case 'appointmentDuration':
      calculateAppointmentDuration()
      break
    case 'actionDuration':
      calculateActionDuration()
      break
    case 'endTime':
    default:
      calculateEndTime()
      break
  }
}

// 重置时间
const resetTime = () => {
  const now = new Date()
  startTime.value = {
    hour: now.getHours(),
    minute: now.getMinutes()
  }
  appointmentDuration.value = {
    hour: 0,
    minute: 0
  }
  actionDuration.value = {
    hour: 0,
    minute: 45
  }
  calculateEndTime()
}

// 切换时间格式
const toggleTimeFormat = () => {
  timeFormat.value = timeFormat.value === '24h' ? '12h' : '24h'
}

// 切换滚轮显示状态
const toggleRoller = (target) => {
  // 只有非计算目标才能显示滚轮
  if (calculateTarget.value !== target) {
    showRoller.value[target] = !showRoller.value[target]
  }
}

const onTimeBlockClick = (target) => {
  if (calculateTarget.value !== target) {
    showRoller.value[target] = !showRoller.value[target]
  }
}

const onCardClick = (target) => {
  if (calculateTarget.value === target) return
  closeAllRollers()
  showRoller.value[target] = true
}
// 关闭所有滚轮
const closeAllRollers = () => {
  for (const key in showRoller.value) {
    showRoller.value[key] = false
  }
}

// 更新当前系统时间
const updateSystemTime = () => {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  currentSystemTime.value = `${hours}:${minutes}:${seconds}`
}

// 监听时间变化，实现自动计算
watch([startTime, appointmentDuration, actionDuration], calculateEndTime)

// 组件挂载时初始化
onMounted(() => {
  updateSystemTime()
  calculateEndTime()
  // 每秒更新系统时间
  setInterval(updateSystemTime, 1000)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllRollers()
  })
})
</script>

<style scoped>
/* 组件特定样式 */
</style>
