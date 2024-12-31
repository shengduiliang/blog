import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "shengduiliang",
  description: "shengduiliang的博客网站",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Spring Security', link: '/spring-security/start' },
    ],

    sidebar: [
      {
        text: 'Spring Security 6',
        items: [
          { text: '入门与使用', link: '/spring-security/start' },
          { text: '认证流程', link: '/spring-security/authencation' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/shengduiliang' }
    ]
  }
})
