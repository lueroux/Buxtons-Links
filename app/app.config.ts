export default defineAppConfig({
  title: 'Buxtons Links',
  documentation: 'https://docs.sink.cool',
  github: 'https://github.com/miantiao-me/sink',
  coffee: '',
  twitter: '',
  telegram: '',
  description: 'The Buxtons link shortener, with analytics.',
  image: '/banner.png',
  previewTTL: 300, // 5 minutes
  slugRegex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
  reserveSlug: [
    'dashboard',
  ],
})
