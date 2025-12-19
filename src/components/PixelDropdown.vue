<template>
  <div class="px-dropdown" :class="{ 'px-open': isOpen, 'px-disabled': disabled }">
    <div
      class="px-trigger ui-div-button ui-rounded ui-adaptive"
      role="combobox"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-disabled="disabled ? 'true' : 'false'"
      tabindex="0"
      @click="toggle"
      @touchstart.prevent="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
      @keydown.down.prevent="openAndFocusNext"
      @keydown.up.prevent="openAndFocusPrev"
    >
      <span class="px-label">{{ displayValue }}</span>
      <svg class="px-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 10l5 5 5-5" fill="currentColor"></path>
      </svg>
    </div>
    <transition name="px-slide">
      <div
        v-if="isOpen"
        class="px-menu"
        role="listbox"
        :aria-activedescendant="`opt-${activeIndex}`"
      >
        <div
          v-for="(opt, idx) in options"
          :key="opt"
          :id="`opt-${idx}`"
          class="px-option"
          :class="{ 'px-active': idx === activeIndex, 'px-selected': opt === modelValue }"
          role="option"
          :aria-selected="opt === modelValue ? 'true' : 'false'"
          tabindex="-1"
          @click="select(opt)"
          @mousemove="activeIndex = idx"
        >
          {{ format(opt) }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 59 },
  step: { type: Number, default: 1 },
  disabled: { type: Boolean, default: false },
  pad: { type: Boolean, default: true },
})
const emit = defineEmits(['update:model-value'])

const isOpen = ref(false)
const activeIndex = ref(0)

const options = computed(() => {
  const arr = []
  for (let i = props.min; i <= props.max; i += props.step) arr.push(i)
  return arr
})

const displayValue = computed(() => format(props.modelValue))

const format = (n) => {
  const s = n.toString()
  return props.pad ? s.padStart(2, '0') : s
}

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  syncActiveIndex()
}

const openAndFocusNext = () => {
  if (props.disabled) return
  if (!isOpen.value) isOpen.value = true
  activeIndex.value = Math.min(activeIndex.value + 1, options.value.length - 1)
}
const openAndFocusPrev = () => {
  if (props.disabled) return
  if (!isOpen.value) isOpen.value = true
  activeIndex.value = Math.max(activeIndex.value - 1, 0)
}

const select = (opt) => {
  emit('update:model-value', opt)
  isOpen.value = false
}

const syncActiveIndex = () => {
  const idx = options.value.indexOf(props.modelValue)
  activeIndex.value = idx >= 0 ? idx : 0
}

watch(() => props.modelValue, syncActiveIndex)
onMounted(syncActiveIndex)
</script>

<style scoped>
.px-dropdown { width: 100%; }
.px-trigger { justify-content: space-between; padding: 8px 12px; }
.px-label { font-weight: 600; letter-spacing: 0.02em; }
.px-icon { margin-left: 8px; }
.px-menu {
  margin-top: 6px;
  max-height: 180px;
  overflow: auto;
  background: var(--color-card);
  border: 1px solid #2f3640;
  border-radius: var(--ui-radius);
  box-shadow: 0 6px 12px rgba(0,0,0,0.35);
}
.px-option {
  padding: 8px 12px;
  font-size: 14px;
  color: var(--color-text);
  transition: background 200ms ease;
  cursor: pointer;
}
.px-option:hover, .px-active {
  background: #2A2A2A;
}
.px-selected {
  color: #e0f2fe;
  font-weight: 700;
}
.px-disabled .px-trigger { opacity: 0.5; pointer-events: none; }

.px-slide-enter-active, .px-slide-leave-active { transition: all 200ms ease; }
.px-slide-enter-from, .px-slide-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
