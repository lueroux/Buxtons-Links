<script setup lang="ts">
import { parseQuery, parseURL, withQuery } from 'ufo'
import { UrlSchema } from '#shared/schemas/link'

interface UtmFormValues {
  source: string
  medium: string
  campaign: string
  term: string
  content: string
}

const props = defineProps<{
  url: string
  formId: string
}>()

const emit = defineEmits<{
  apply: [url: string]
}>()
const utmValues = reactive<UtmFormValues>(createEmptyUtmValues())

const sourceOptions = [
  { label: 'Google', value: 'google' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'X / Twitter', value: 'twitter' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Newsletter', value: 'newsletter' },
  { label: 'Website', value: 'website' },
]

const sourceOtherValue = 'other'

const mediumOptions = [
  { label: 'Cost Per Click', value: 'cpc' },
  { label: 'Social', value: 'social' },
  { label: 'Email', value: 'email' },
  { label: 'Paid Social', value: 'paid-social' },
  { label: 'Affiliate', value: 'affiliate' },
  { label: 'Referral', value: 'referral' },
  { label: 'Display', value: 'display' },
]

const selectedSourcePreset = computed(() => {
  if (!utmValues.source)
    return ''
  const matched = sourceOptions.find(option => option.value === utmValues.source)
  return matched ? matched.value : sourceOtherValue
})

const isCustomSource = computed(() => selectedSourcePreset.value === sourceOtherValue)
const customSource = ref('')

function formatUtmValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
}

function onSourcePresetUpdate(value: string) {
  if (value === sourceOtherValue) {
    utmValues.source = formatUtmValue(customSource.value)
  }
  else {
    utmValues.source = value
    customSource.value = ''
  }
}

function onCustomSourceInput(value: string) {
  customSource.value = formatUtmValue(value)
  if (isCustomSource.value)
    utmValues.source = customSource.value
}

const validatedUrl = computed(() => {
  const result = UrlSchema.safeParse(props.url)
  return result.success ? result.data : undefined
})

const previewUrl = computed(() => {
  if (!validatedUrl.value)
    return ''

  return withQuery(validatedUrl.value, buildUtmQuery(utmValues))
})

const validatedPreviewUrl = computed(() => {
  if (!previewUrl.value)
    return undefined

  const result = UrlSchema.safeParse(previewUrl.value)
  return result.success ? result.data : undefined
})

syncUtmValues(props.url)

watch(() => props.url, (url) => {
  if (url !== previewUrl.value)
    syncUtmValues(url)
})

watch(validatedPreviewUrl, (url) => {
  if (url && url !== props.url)
    emit('apply', url)
})

function createEmptyUtmValues(): UtmFormValues {
  return {
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  }
}

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function normalizeUtmValue(value: string) {
  const trimmed = value.trim()
  return trimmed || undefined
}

function buildUtmQuery(values: UtmFormValues) {
  return {
    utm_source: normalizeUtmValue(values.source),
    utm_medium: normalizeUtmValue(values.medium),
    utm_campaign: normalizeUtmValue(values.campaign),
    utm_term: normalizeUtmValue(values.term),
    utm_content: normalizeUtmValue(values.content),
  }
}

function syncUtmValues(url: string) {
  Object.assign(utmValues, createEmptyUtmValues())
  customSource.value = ''

  const result = UrlSchema.safeParse(url)
  if (!result.success)
    return

  const { search } = parseURL(result.data)
  const query = parseQuery(search)

  utmValues.source = getQueryValue(query.utm_source)
  utmValues.medium = getQueryValue(query.utm_medium)
  utmValues.campaign = getQueryValue(query.utm_campaign)
  utmValues.term = getQueryValue(query.utm_term)
  utmValues.content = getQueryValue(query.utm_content)

  if (utmValues.source && !sourceOptions.some(option => option.value === utmValues.source))
    customSource.value = utmValues.source
}

function clearUtmValues() {
  Object.assign(utmValues, createEmptyUtmValues())
  customSource.value = ''
}
</script>

<template>
  <section
    :id="formId"
    class="w-full space-y-5"
    :aria-label="$t('links.form.utm_builder')"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h3 class="font-medium">
          {{ $t('links.form.utm_builder') }}
        </h3>
        <p class="text-sm text-muted-foreground">
          {{ $t('links.form.utm_description') }}
        </p>
      </div>
      <Button type="button" variant="ghost" size="sm" @click="clearUtmValues">
        {{ $t('links.form.utm_clear') }}
      </Button>
    </div>

    <div class="w-full space-y-5">
      <FieldGroup>
        <div
          class="
            grid gap-4
            md:grid-cols-2
          "
        >
          <Field>
            <FieldLabel :for="`${formId}-utm-source`">
              {{ $t('links.form.utm_source') }}
            </FieldLabel>
            <FieldDescription :id="`${formId}-utm-source-hint`">
              {{ $t('links.form.utm_source_description') }}
            </FieldDescription>
            <Select
              :model-value="selectedSourcePreset"
              @update:model-value="onSourcePresetUpdate($event as string)"
            >
              <SelectTrigger
                :id="`${formId}-utm-source`"
                name="utm_source"
                :aria-describedby="`${formId}-utm-source-hint`"
              >
                <SelectValue :placeholder="$t('links.form.utm_select_source')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in sourceOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  <span class="block">{{ option.label }}</span>
                  <span class="block text-xs text-muted-foreground">{{ option.value }}</span>
                </SelectItem>
                <SelectSeparator />
                <SelectItem :value="sourceOtherValue">
                  {{ $t('links.form.utm_source_other') }}
                </SelectItem>
              </SelectContent>
            </Select>

            <div
              v-if="isCustomSource"
              class="mt-3"
            >
              <Input
                :id="`${formId}-utm-source-custom`"
                :model-value="customSource"
                name="utm_source_custom"
                :placeholder="$t('links.form.utm_source_other_placeholder')"
                autocomplete="off"
                @update:model-value="onCustomSourceInput($event as string)"
              />
            </div>
          </Field>

          <Field>
            <FieldLabel :for="`${formId}-utm-medium`">
              {{ $t('links.form.utm_medium') }}
            </FieldLabel>
            <FieldDescription :id="`${formId}-utm-medium-hint`">
              {{ $t('links.form.utm_medium_description') }}
            </FieldDescription>
            <Select
              :model-value="utmValues.medium"
              @update:model-value="utmValues.medium = formatUtmValue($event as string)"
            >
              <SelectTrigger
                :id="`${formId}-utm-medium`"
                name="utm_medium"
                :aria-describedby="`${formId}-utm-medium-hint`"
              >
                <SelectValue :placeholder="$t('links.form.utm_select_medium')" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in mediumOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  <span class="block">{{ option.label }}</span>
                  <span class="block text-xs text-muted-foreground">{{ option.value }}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field>
          <FieldLabel :for="`${formId}-utm-campaign`">
            {{ $t('links.form.utm_campaign') }}
          </FieldLabel>
          <FieldDescription :id="`${formId}-utm-campaign-hint`">
            {{ $t('links.form.utm_campaign_description') }}
          </FieldDescription>
          <Input
            :id="`${formId}-utm-campaign`"
            :model-value="utmValues.campaign"
            name="utm_campaign"
            :aria-describedby="`${formId}-utm-campaign-hint`"
            placeholder="spring_sale_2024"
            autocomplete="off"
            @update:model-value="utmValues.campaign = formatUtmValue($event as string)"
          />
        </Field>

        <div
          class="
            grid gap-4
            md:grid-cols-2
          "
        >
          <Field>
            <FieldLabel :for="`${formId}-utm-term`">
              {{ $t('links.form.utm_term') }}
            </FieldLabel>
            <FieldDescription :id="`${formId}-utm-term-hint`">
              {{ $t('links.form.utm_term_description') }}
            </FieldDescription>
            <Input
              :id="`${formId}-utm-term`"
              :model-value="utmValues.term"
              name="utm_term"
              :aria-describedby="`${formId}-utm-term-hint`"
              placeholder="running_shoes"
              autocomplete="off"
              @update:model-value="utmValues.term = formatUtmValue($event as string)"
            />
          </Field>

          <Field>
            <FieldLabel :for="`${formId}-utm-content`">
              {{ $t('links.form.utm_content') }}
            </FieldLabel>
            <FieldDescription :id="`${formId}-utm-content-hint`">
              {{ $t('links.form.utm_content_description') }}
            </FieldDescription>
            <Input
              :id="`${formId}-utm-content`"
              :model-value="utmValues.content"
              name="utm_content"
              :aria-describedby="`${formId}-utm-content-hint`"
              placeholder="hero_button"
              autocomplete="off"
              @update:model-value="utmValues.content = formatUtmValue($event as string)"
            />
          </Field>
        </div>

        <Field>
          <div class="space-y-2">
            <FieldLabel>{{ $t('links.form.utm_preview') }}</FieldLabel>
            <div
              class="
                rounded-md border bg-muted/50 p-3 font-mono text-xs/5 break-all
                sm:text-sm
              "
              :class="!previewUrl && 'text-muted-foreground'"
            >
              {{ previewUrl || $t('links.form.utm_invalid_url') }}
            </div>
          </div>
        </Field>
      </FieldGroup>
    </div>
  </section>
</template>
