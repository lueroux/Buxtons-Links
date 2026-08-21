<script setup lang="ts">
import { Download } from '@lucide/vue'
import QRCodeStyling from 'qr-code-styling'

const props = withDefaults(defineProps<{
  data: string
  image?: string
}>(), {
  image: '',
})

const color = ref('#000000')
const showLogo = ref(true)

const presets = [
  { key: 'black', value: '#000000' },
  { key: 'dark', value: '#252525' },
  { key: 'green', value: '#94be57' },
  { key: 'white', value: '#ffffff' },
]

const isPreset = computed(() => presets.some(preset => preset.value === color.value))

const options = {
  width: 256,
  height: 256,
  data: props.data,
  type: 'svg' as const,
  margin: 10,
  qrOptions: { typeNumber: 0 as const, mode: 'Byte' as const, errorCorrectionLevel: 'Q' as const },
  imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 2 },
  dotsOptions: { type: 'dots' as const, color: color.value },
  backgroundOptions: { color: '#ffffff' },
  image: props.image,
  cornersSquareOptions: { type: 'extra-rounded' as const, color: color.value },
  cornersDotOptions: { type: 'dot' as const, color: color.value },
}

const qrCode = new QRCodeStyling(options)
const qrCodeEl = useTemplateRef<HTMLElement>('qrCodeEl')

function updateQR() {
  qrCode.update({
    dotsOptions: { type: 'dots' as const, color: color.value },
    cornersSquareOptions: { type: 'extra-rounded' as const, color: color.value },
    cornersDotOptions: { type: 'dot' as const, color: color.value },
    image: showLogo.value ? props.image : '',
  })
}

watch(color, updateQR)
watch(showLogo, updateQR)

function downloadQRCode() {
  const slug = props.data.split('/').pop()
  qrCode.download({
    extension: 'png',
    name: `qr_${slug}`,
  })
}

onMounted(() => {
  if (qrCodeEl.value) {
    qrCode.append(qrCodeEl.value as unknown as HTMLElement)
  }
})
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <div
      ref="qrCodeEl"
      :data-text="data"
      role="img"
      :aria-label="$t('links.qr.text_alternative', { url: data })"
      class="rounded-lg border border-border bg-white p-1 shadow-sm"
    />
    <div class="flex w-full flex-wrap items-center justify-center gap-3">
      <div class="flex flex-wrap items-center justify-center gap-2">
        <button
          v-for="preset in presets"
          :key="preset.key"
          type="button"
          class="
            size-9 rounded-full border border-input ring-offset-background
            transition-shadow
            focus-visible:ring-2 focus-visible:ring-ring
            focus-visible:ring-offset-2 focus-visible:outline-none
          "
          :class="{ 'ring-2 ring-ring ring-offset-2': color === preset.value, 'border-border/50': preset.value === '#ffffff' }"
          :style="{ backgroundColor: preset.value }"
          :title="$t(`links.qr.color_${preset.key}`)"
          :aria-label="$t(`links.qr.color_${preset.key}`)"
          @click="color = preset.value"
        />

        <label
          class="
            relative size-9 cursor-pointer overflow-hidden rounded-full border
            border-input ring-offset-background
            focus-within:ring-2 focus-within:ring-ring
            focus-within:ring-offset-2 focus-within:outline-none
          "
          :class="{ 'ring-2 ring-ring ring-offset-2': !isPreset }"
          :title="$t('links.qr.color_custom')"
        >
          <input
            v-model="color"
            type="color"
            class="absolute inset-0 size-full cursor-pointer opacity-0"
            :aria-label="$t('links.qr.color_custom')"
          >
          <span
            class="pointer-events-none absolute inset-0"
            :style="{ backgroundColor: color }"
          />
        </label>
      </div>

      <Label class="inline-flex cursor-pointer items-center gap-2 text-sm">
        <Switch v-model:checked="showLogo" :aria-label="$t('links.qr.show_logo')" />
        {{ $t('links.qr.show_logo') }}
      </Label>

      <Button
        variant="outline"
        size="sm"
        class="
          min-h-11
          lg:min-h-8
        "
        @click="downloadQRCode"
      >
        <Download aria-hidden="true" class="mr-2 size-4" />
        {{ $t('links.download_qr_code') }}
      </Button>
    </div>
  </div>
</template>
