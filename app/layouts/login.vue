<script setup lang="ts">
const { title } = useAppConfig()
</script>

<template>
  <div class="flex min-h-svh flex-col overflow-x-clip">
    <a
      href="#main-content"
      class="
        fixed top-4 left-4 z-50 -translate-y-24 rounded-md bg-background px-4
        py-2 text-sm font-medium shadow-lg
        focus:translate-y-0
        focus-visible:ring-2 focus-visible:ring-ring
      "
    >
      {{ $t('layouts.links.skip_to_content') }}
    </a>

    <header>
      <div
        class="
          fixed z-20 w-full border-b bg-background/80
          pt-[env(safe-area-inset-top)] text-foreground backdrop-blur-3xl
        "
      >
        <div
          class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
        >
          <NuxtLink
            to="/"
            :title="title"
            :aria-label="$t('layouts.links.home_aria_label')"
            class="flex items-center space-x-2"
          >
            <span class="flex size-8 items-center justify-center rounded-full">
              <img
                src="/buxtons-links.png"
                :alt="`${title} Logo`"
                width="32"
                height="32"
                class="size-full rounded-full"
              >
            </span>
            <span class="text-xl font-black">{{ title }}</span>
          </NuxtLink>

          <SwitchTheme />
        </div>
      </div>
    </header>

    <main
      id="main-content"
      class="
        flex flex-1 flex-col items-center justify-center px-6 py-16
        pt-[calc(5rem+env(safe-area-inset-top))]
      "
    >
      <slot />
    </main>
  </div>
</template>
