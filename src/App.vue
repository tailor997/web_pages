<template>
  <div class="min-h-screen bg-[#f5f5f5] py-6 px-4 md:py-10 md:px-6">
    <div class="app-shell stack-gap w-full md:w-3/5 mx-auto bg-white rounded-2xl shadow-xl p-4 md:p-6 fade-in">
      <!-- 标题 -->
      <h1 class="text-xl md:text-3xl font-bold text-center text-gray-800 mb-4 md:mb-8">准时约</h1>

      <!-- 控制面板 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 mt-6 md:mt-8 mb-8 md:mb-12 w-full">
        <!-- 计算选择区域 -->
        <div class="w-full h-full flex flex-col space-y-2 md:space-y-4 mx-auto">
          <!-- 起始时间 -->
          <!-- 间距：确保卡片与相邻元素有8-16px垂直间隔 -->
          <div 
            class="card-gap p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-gradient-to-br from-white to-sky-50"
            @click="onCardClick('startTime')"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-700">起始时间</h3>
              <div class="flex items-center gap-4">
                <PxButton 
                  class="calc-btn"
                  :type="calculateTarget === 'startTime' ? 'success' : 'primary'"
                  size="default"
                  @click.stop="calculateTarget = 'startTime'"
                >计算</PxButton>
              </div>
            </div>
            <!-- <p class="text-gray-700 font-mono text-lg mb-2">{{ startText }}</p> -->
            
            <div class="space-y-4">
              <PxDropdown
                :items="hoursItems"
                trigger="click"
                effect="dark"
                :hideOnClick="true"
                :splitButton="true"
                @command="cmd => { startTime.hour = Number(cmd); calculateTime() }"
              >
                <template #default>{{ startTime.hour.toString().padStart(2,'0') }}</template>
              </PxDropdown>
              <PxDropdown
                :items="minutesItems"
                trigger="click"
                effect="dark"
                :hideOnClick="true"
                :splitButton="true"
                @command="cmd => { startTime.minute = Number(cmd); calculateTime() }"
              >
                <template #default>{{ startTime.minute.toString().padStart(2,'0') }}</template>
              </PxDropdown>
            </div>
          </div>

          <!-- 预约时间时长 -->
          <!-- 间距：确保卡片与相邻元素有8-16px垂直间隔 -->
          <div 
            class="card-gap p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-gradient-to-br from-white to-violet-50"
            @click="onCardClick('appointmentDuration')"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-700">预约时间时长</h3>
              <div class="flex items-center gap-4">
                <PxButton 
                  class="calc-btn"
                  :type="calculateTarget === 'appointmentDuration' ? 'success' : 'primary'"
                  size="default"
                  @click.stop="calculateTarget = 'appointmentDuration'"
                >计算</PxButton>
              </div>
            </div>
            
            <div class="space-y-4">
              <PxDropdown
                :items="hoursItems"
                trigger="click"
                effect="dark"
                :hideOnClick="true"
                :splitButton="true"
                @command="cmd => { appointmentDuration.hour = Number(cmd); calculateTime() }"
              >
                <template #default>{{ appointmentDuration.hour.toString().padStart(2,'0') }}</template>
              </PxDropdown>
              <PxDropdown
                :items="minutesItems"
                trigger="click"
                effect="dark"
                :hideOnClick="true"
                :splitButton="true"
                @command="cmd => { appointmentDuration.minute = Number(cmd); calculateTime() }"
              >
                <template #default>{{ appointmentDuration.minute.toString().padStart(2,'0') }}</template>
              </PxDropdown>
            </div>
          </div>

          <!-- 行动时长 -->
          <!-- 间距：确保卡片与相邻元素有8-16px垂直间隔 -->
          <div 
            class="card-gap p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-gradient-to-br from-white to-rose-50"
            @click="onCardClick('actionDuration')"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-700">行动时长</h3>
              <div class="flex items-center gap-4">
                <PxButton 
                  class="calc-btn"
                  :type="calculateTarget === 'actionDuration' ? 'success' : 'primary'"
                  size="default"
                  @click.stop="calculateTarget = 'actionDuration'"
                >计算</PxButton>
              </div>
            </div>
            
            <div class="space-y-4">
              <PxDropdown
                :items="hoursItems"
                trigger="click"
                effect="dark"
                :hideOnClick="true"
                :splitButton="true"
                @command="cmd => { actionDuration.hour = Number(cmd); calculateTime() }"
              >
                <template #default>{{ actionDuration.hour.toString().padStart(2,'0') }}</template>
              </PxDropdown>
              <PxDropdown
                :items="minutesItems"
                trigger="click"
                effect="dark"
                :hideOnClick="true"
                :splitButton="true"
                @command="cmd => { actionDuration.minute = Number(cmd); calculateTime() }"
              >
                <template #default>{{ actionDuration.minute.toString().padStart(2,'0') }}</template>
              </PxDropdown>
            </div>
          </div>

          <!-- 结束时间 -->
          <!-- 间距：确保卡片与相邻元素有8-16px垂直间隔 -->
          <div 
            class="card-gap p-3 rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer bg-gradient-to-br from-white to-emerald-50"
            @click="onCardClick('endTime')"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-700">结束时间</h3>
              <div class="flex items-center gap-4">
                <PxButton 
                  class="calc-btn"
                  :type="calculateTarget === 'endTime' ? 'success' : 'primary'"
                  size="default"
                  @click.stop="calculateTarget = 'endTime'"
                >计算</PxButton>
              </div>
            </div>
            <!-- <PxText type="primary" class="mb-2">{{ startText }}</PxText> -->
            
            <div class="space-y-4">
              <PxDropdown
                :items="hoursItems"
                trigger="click"
                effect="dark"
                :hideOnClick="true"
                :splitButton="true"
                @command="cmd => { endTime.hour = Number(cmd); calculateTime() }"
              >
                <template #default>{{ endTime.hour.toString().padStart(2,'0') }}</template>
              </PxDropdown>
              <PxDropdown
                :items="minutesItems"
                trigger="click"
                effect="dark"
                :hideOnClick="true"
                :splitButton="true"
                @command="cmd => { endTime.minute = Number(cmd); calculateTime() }"
              >
                <template #default>{{ endTime.minute.toString().padStart(2,'0') }}</template>
              </PxDropdown>
            </div>
          </div>
        </div>
        <!-- 右侧内容区域（预留） -->
        <div class="flex-1 h-full mx-auto max-w-xl"></div>
      </div>

      <!-- 底部按钮区 -->
      <div class="mt-12 py-4 flex justify-center">
        <PxButton type="primary" size="large" @click="resetTime">重置</PxButton>
      </div>

      <!-- 项目名与说明 -->
      <div class="mx-auto text-center my-6 md:my-8">
        <div class="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-100 to-indigo-100 text-indigo-700 font-bold text-3xl md:text-4xl tracking-widest"></div>
        <p class="mt-2 text-gray-600">点击计算后，选中项将基于其余三项自动计算</p>
      </div>

      <!-- 状态信息 -->
      <div class="hidden md:block bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
        <h4 class="text-sm font-semibold text-blue-800 mb-2">使用说明</h4>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• 选择要计算的时间目标，系统将自动计算</li>
          <li>• 点击时间显示可展开/收起滚轮选择器</li>
          <li>• 滚动滚轮可以快速调整时间值</li>
          <li>• 时间轴清晰展示各时间节点的关系</li>
          <li>• 支持模态滚轮弹窗，遮罩或ESC关闭</li>
        </ul>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { PxDropdown, PxText } from '@mmt817/pixel-ui/dist/es/index.js'


// 计算目标选择（默认计算结束时间）
const calculateTarget = ref('endTime') // 可选值：startTime, appointmentDuration, actionDuration, endTime

// 下拉无需全局弹层状态

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

// 下拉项
const hoursItems = computed(() => Array.from({ length: 24 }, (_, i) => ({ command: i, label: i.toString().padStart(2, '0') })))
const minutesItems = computed(() => Array.from({ length: 60 }, (_, i) => ({ command: i, label: i.toString().padStart(2, '0') })))

// 计算结束时间（分钟级）
const calculateEndTime = () => {
  const startMinutes = startTime.value.hour * 60 + startTime.value.minute
  const appointmentMinutes = appointmentDuration.value.hour * 60 + appointmentDuration.value.minute
  const actionMinutes = actionDuration.value.hour * 60 + actionDuration.value.minute
  
  let totalMinutes = startMinutes + appointmentMinutes + actionMinutes
  totalMinutes = totalMinutes % (24 * 60)
  
  endTime.value.hour = Math.floor(totalMinutes / 60)
  endTime.value.minute = totalMinutes % 60
}

// 计算行动时长（分钟级）
const calculateActionDuration = () => {
  const startMinutes = startTime.value.hour * 60 + startTime.value.minute
  const endMinutes = endTime.value.hour * 60 + endTime.value.minute
  const appointmentMinutes = appointmentDuration.value.hour * 60 + appointmentDuration.value.minute
  
  let actionMinutes = endMinutes - startMinutes - appointmentMinutes
  if (actionMinutes < 0) actionMinutes += 24 * 60
  
  actionDuration.value.hour = Math.floor(actionMinutes / 60)
  actionDuration.value.minute = actionMinutes % 60
}

// 计算预约时长（分钟级）
const calculateAppointmentDuration = () => {
  const startMinutes = startTime.value.hour * 60 + startTime.value.minute
  const endMinutes = endTime.value.hour * 60 + endTime.value.minute
  const actionMinutes = actionDuration.value.hour * 60 + actionDuration.value.minute
  
  let appointmentMinutes = endMinutes - startMinutes - actionMinutes
  if (appointmentMinutes < 0) appointmentMinutes += 24 * 60
  
  appointmentDuration.value.hour = Math.floor(appointmentMinutes / 60)
  appointmentDuration.value.minute = appointmentMinutes % 60
}

// 计算起始时间（分钟级）
const calculateStartTime = () => {
  const endMinutes = endTime.value.hour * 60 + endTime.value.minute
  const appointmentMinutes = appointmentDuration.value.hour * 60 + appointmentDuration.value.minute
  const actionMinutes = actionDuration.value.hour * 60 + actionDuration.value.minute
  
  let startMinutes = endMinutes - appointmentMinutes - actionMinutes
  if (startMinutes < 0) startMinutes += 24 * 60
  
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


// 卡片点击不再触发弹层，仅用于焦点管理
const onCardClick = (target) => {}


// 监听时间变化，实现自动计算
watch([startTime, appointmentDuration, actionDuration], calculateEndTime, { deep: true })

// 组件挂载时初始化
onMounted(() => {
  calculateEndTime()
})

// HH:mm 显示
const formatHHmm = (h, m) => h.toString().padStart(2, '0') + ':' + m.toString().padStart(2, '0')
const startText = computed(() => formatHHmm(startTime.value.hour, startTime.value.minute))
const endText = computed(() => formatHHmm(endTime.value.hour, endTime.value.minute))
</script>

<style scoped>
/* 卡片间距：确保四个时间选择卡片与相邻元素之间保持一致的垂直间距（移动端8px，桌面端16px） */
.card-gap {
  margin-top: 8px;
  margin-bottom: 8px;
}
@media (min-width: 768px) {
  .card-gap {
    margin-top: 16px;
    margin-bottom: 16px;
  }
}
</style>
