<template>
  <Card class="w-full max-w-sm">
    <CardHeader>
      <CardTitle>
        <h1 class="text-2xl font-medium text-balance">
          {{ $t('login.title') }}
        </h1>
      </CardTitle>
    </CardHeader>
    <CardContent class="grid gap-4">
      <LoginForm />
    </CardContent>
  </Card>
</template>
