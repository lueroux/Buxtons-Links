<script setup lang="ts">
import { ChevronDown, Download } from '@lucide/vue'
import QRCodeStyling from 'qr-code-styling'

const props = withDefaults(defineProps<{
  data: string
  image?: string
}>(), {
  image: '',
})

const downloadFormats = ['png', 'jpeg', 'svg'] as const

const color = ref('#000000')
const showLogo = ref(true)

const presets = [
  { key: 'black', value: '#000000' },
  { key: 'dark', value: '#252525' },
  { key: 'green', value: '#94be57' },
  { key: 'white', value: '#ffffff' },
]

const isPreset = computed(() => presets.some(preset => preset.value === color.value))

const qrCode = shallowRef<QRCodeStyling | null>(null)
const qrCodeEl = useTemplateRef<HTMLElement>('qrCodeEl')

function buildQR() {
  const options = {
    width: 256,
    height: 256,
    data: props.data,
    type: 'svg' as const,
    margin: 10,
    qrOptions: { typeNumber: 0 as const, mode: 'Byte' as const, errorCorrectionLevel: 'Q' as const },
    dotsOptions: { type: 'dots' as const, color: color.value },
    backgroundOptions: { color: '#ffffff' },
    cornersSquareOptions: { type: 'extra-rounded' as const, color: color.value },
    cornersDotOptions: { type: 'dot' as const, color: color.value },
    image: showLogo.value && props.image ? props.image : '',
    imageOptions: showLogo.value && props.image
      ? { hideBackgroundDots: true, imageSize: 0.4, margin: 2 }
      : { hideBackgroundDots: false, imageSize: 0, margin: 0 },
  }

  qrCode.value = new QRCodeStyling(options)

  if (qrCodeEl.value) {
    qrCodeEl.value.innerHTML = ''
    qrCode.value.append(qrCodeEl.value as unknown as HTMLElement)
  }
}

watch(color, buildQR)
watch(showLogo, buildQR)
watch(() => props.image, buildQR)

function downloadQRCode(extension: typeof downloadFormats[number]) {
  const slug = props.data.split('/').pop()
  qrCode.value?.download({
    extension,
    name: `qr_${slug}`,
  })
}

onMounted(buildQR)
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

      <div class="inline-flex items-center gap-2 text-sm">
        <Switch
          id="qr-show-logo"
          v-model="showLogo"
          :aria-label="$t('links.qr.show_logo')"
        />
        <Label for="qr-show-logo" class="cursor-pointer font-medium">
          {{ $t('links.qr.show_logo') }}
        </Label>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="sm"
            class="
              min-h-11
              lg:min-h-8
            "
          >
            <Download aria-hidden="true" class="mr-2 size-4" />
            {{ $t('links.download_qr_code') }}
            <ChevronDown aria-hidden="true" class="ml-2 size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="format in downloadFormats"
            :key="format"
            @click="downloadQRCode(format)"
          >
            {{ format.toUpperCase() }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
</template>
