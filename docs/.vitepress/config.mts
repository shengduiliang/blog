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
      { text: 'xxl-job', link: '/xxl-job/start'}
    ],

    sidebar: [
      {
        collapsed: true, // 侧边栏折叠
        text: 'Spring Security 6',
        items: [
          { text: '入门与使用', link: '/spring-security/start' },
          { text: '表单登录认证', link: '/spring-security/form-login' },
          { text: '架构分析(核心)', link: '/spring-security/filter' },
          { text: 'SecurityFilterChain构建流程', link: '/spring-security/http-security' },
          { text: '认证流程分析', link: '/spring-security/authentication' },
          { text: '用户会话管理', link: '/spring-security/session' },
          { text: '异常处理', link: '/spring-security/exception' },
          { text: 'RememberMe', link: '/spring-security/remember-me' },
          { text: '权限管理', link: '/spring-security/authorities' },
          { text: 'OAtuh2认证流程', link: '/spring-security/oauth2' },
        ]
      },
      {
        collapsed: true, // 侧边栏折叠
        text: 'xxl-job',
        items: [
          { text: '入门与使用', link: '/xxl-job/start' },
          { text: 'xxl-job概念详解', link: '/xxl-job/xxl-job-concept' },
          { text: 'xxl-job-admin目录结构与配置', link: '/xxl-job/xxl-job-admin' },
          { text: '用户管理与权限校验', link: '/xxl-job/user' },
          { text: '调度中心启动流程', link: '/xxl-job/xxl-job-admin-schedule' },
          { text: '定时任务调度器', link: '/xxl-job/task-schedule' },
          { text: '定时任务执行流程', link: '/xxl-job/trigger' },
          { text: '路由选择策略', link: '/xxl-job/route' },
          { text: '执行器初始化流程', link: '/xxl-job/executor' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/shengduiliang' }
    ]
  },
  ignoreDeadLinks: true
})
