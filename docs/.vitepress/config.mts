import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  markdown: {
    lineNumbers: true
  },
  title: "shengduiliang",
  description: "shengduiliang的博客网站",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Spring Security', link: '/spring-security/start' },
      { text: 'xxl-job', link: '/xxl-job/start'},
      { text: 'redis', link: '/redis/start'}
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
          { text: 'OAtuh2认证', link: '/spring-security/oauth2-start' },
          { text: 'OAtuh2客户端认证流程', link: '/spring-security/oauth2-client' },
          { text: 'OAtuh2服务端认证流程', link: '/spring-security/oauth2-server' },
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
      },
      {
        collapsed: true, // 侧边栏折叠
        text: 'redis 7',
        items: [
          { text: '源码环境的搭建', link: '/redis/start' },
          { text: '架构设计', link: '/redis/architecture' },
          { text: 'I/O多线程网络驱动模型', link: '/redis/main' },
          { text: '全局散列表', link: '/redis/ht_table'},
          { text: '字符串实现原理', link: '/redis/sds'},
          { text: 'List实现原理与实战', link: '/redis/list'},
          { text: 'Sets实现原理与实战', link: '/redis/set'},
          { text: '散列表实现原理与实战', link: '/redis/hashtable'}
        ]
      },
      {
        collapsed: true, // 侧边栏折叠
        text: 'rocketmq',
        items: [
          { text: '源码环境的搭建', link: '/rocketmq/start' },
          { text: 'SpringBoot接入rocketmq', link: '/rocketmq/spring-boot-rocketmq'}
        ]
      },
      {
        collapsed: true, // 侧边栏折叠
        text: 'k8s',
        items: [
          { text: 'ubuntu安装k8s(1.30)', link: '/k8s/install' },
          { text: 'sealos安装k8s(1.27)', link: '/k8s/sealos-install' },
          { text: 'vmware-ubuntu磁盘扩容', link: '/k8s/vmware-funsion-ubuntu-disk-dilatation' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/shengduiliang' }
    ]
  },
  ignoreDeadLinks: true
})
