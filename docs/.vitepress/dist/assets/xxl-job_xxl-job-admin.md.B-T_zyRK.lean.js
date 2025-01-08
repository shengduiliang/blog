import{_ as s,c as n,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const i="/assets/xxl-job-admin-dir.UekDaYLo.png",u=JSON.parse('{"title":"xxl-job-admin目录结构与配置","description":"","frontmatter":{},"headers":[],"relativePath":"xxl-job/xxl-job-admin.md","filePath":"xxl-job/xxl-job-admin.md"}'),l={name:"xxl-job/xxl-job-admin.md"};function t(o,a,r,c,d,h){return e(),n("div",null,a[0]||(a[0]=[p('<h1 id="xxl-job-admin目录结构与配置" tabindex="-1">xxl-job-admin目录结构与配置 <a class="header-anchor" href="#xxl-job-admin目录结构与配置" aria-label="Permalink to &quot;xxl-job-admin目录结构与配置&quot;">​</a></h1><p>XXL-JOB 是一个分布式任务调度平台，xxl-job-admin 是其核心管理模块，提供了任务的管理、调度、监控等功能，这个章节梳理一下xxl-job-admin目录结构与配置。</p><h2 id="目录结构" tabindex="-1">目录结构 <a class="header-anchor" href="#目录结构" aria-label="Permalink to &quot;目录结构&quot;">​</a></h2><img src="'+i+`" width="400" alt="xxl-job-admin-dir"><p>可以看到xxl-job-admin的目录结构如上图所示，下面做一下解释：</p><ul><li>controller: 控制器目录，用来处理前端发过来的请求</li><li>core: 核心包，后面对其解释</li><li>dao: mybatis的对象实体目录</li><li>service: 服务目录</li><li>i18n: 国际化相关的配置，记录每个地址的文本</li><li>mybatis-mapper: mybatis的mapper文件目录</li><li>static: 静态资源目录，即控制台的网页代码</li><li>application.properties: 项目配置文件</li><li>lobback.xml: 日志配置文件</li></ul><p>主要介绍一下core核心包目录代码，具体如下所示:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>shengduiliang@liangchengduideMac-mini core % tree -L 2</span></span>
<span class="line"><span>.</span></span>
<span class="line"><span>├── alarm  // 报警相关的代码实现</span></span>
<span class="line"><span>│   ├── JobAlarm.java</span></span>
<span class="line"><span>│   ├── JobAlarmer.java</span></span>
<span class="line"><span>│   └── impl</span></span>
<span class="line"><span>├── complete // 任务完成的相关实现</span></span>
<span class="line"><span>│   └── XxlJobCompleter.java</span></span>
<span class="line"><span>├── conf // XxlJobAdminConfig的配置文件</span></span>
<span class="line"><span>│   └── XxlJobAdminConfig.java</span></span>
<span class="line"><span>├── cron // CRON相关文件</span></span>
<span class="line"><span>│   └── CronExpression.java</span></span>
<span class="line"><span>├── exception // 异常定义</span></span>
<span class="line"><span>│   └── XxlJobException.java</span></span>
<span class="line"><span>├── model // 定义XxlJob的实体</span></span>
<span class="line"><span>│   ├── XxlJobGroup.java</span></span>
<span class="line"><span>│   ├── XxlJobInfo.java</span></span>
<span class="line"><span>│   ├── XxlJobLog.java</span></span>
<span class="line"><span>│   ├── XxlJobLogGlue.java</span></span>
<span class="line"><span>│   ├── XxlJobLogReport.java</span></span>
<span class="line"><span>│   ├── XxlJobRegistry.java</span></span>
<span class="line"><span>│   └── XxlJobUser.java</span></span>
<span class="line"><span>├── old</span></span>
<span class="line"><span>│   ├── RemoteHttpJobBean.java</span></span>
<span class="line"><span>│   ├── XxlJobDynamicScheduler.java</span></span>
<span class="line"><span>│   └── XxlJobThreadPool.java</span></span>
<span class="line"><span>├── route // 路由，包括路由选择策略（核心）</span></span>
<span class="line"><span>│   ├── ExecutorRouteStrategyEnum.java</span></span>
<span class="line"><span>│   ├── ExecutorRouter.java</span></span>
<span class="line"><span>│   └── strategy</span></span>
<span class="line"><span>├── scheduler // 任务调度器（核心）</span></span>
<span class="line"><span>│   ├── MisfireStrategyEnum.java</span></span>
<span class="line"><span>│   ├── ScheduleTypeEnum.java</span></span>
<span class="line"><span>│   └── XxlJobScheduler.java</span></span>
<span class="line"><span>├── thread // 线程池配置（核心）</span></span>
<span class="line"><span>│   ├── JobCompleteHelper.java</span></span>
<span class="line"><span>│   ├── JobFailMonitorHelper.java</span></span>
<span class="line"><span>│   ├── JobLogReportHelper.java</span></span>
<span class="line"><span>│   ├── JobRegistryHelper.java</span></span>
<span class="line"><span>│   ├── JobScheduleHelper.java</span></span>
<span class="line"><span>│   └── JobTriggerPoolHelper.java</span></span>
<span class="line"><span>├── trigger // 触发器，包括手动触发等，看TriggerTypeEnum（核心）</span></span>
<span class="line"><span>│   ├── TriggerTypeEnum.java</span></span>
<span class="line"><span>│   └── XxlJobTrigger.java</span></span>
<span class="line"><span>└── util // 工具类文件</span></span>
<span class="line"><span>    ├── CookieUtil.java</span></span>
<span class="line"><span>    ├── FtlUtil.java</span></span>
<span class="line"><span>    ├── I18nUtil.java</span></span>
<span class="line"><span>    ├── JacksonUtil.java</span></span>
<span class="line"><span>    └── LocalCacheUtil.java</span></span></code></pre></div><h2 id="项目配置" tabindex="-1">项目配置 <a class="header-anchor" href="#项目配置" aria-label="Permalink to &quot;项目配置&quot;">​</a></h2><p>接下来介绍一下xxl-job-admin的配置文件，查看application.properties文件，由于这个文件内容比较多，这里分块介绍。</p><h3 id="web相关" tabindex="-1">Web相关 <a class="header-anchor" href="#web相关" aria-label="Permalink to &quot;Web相关&quot;">​</a></h3><div class="language-application.properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>### web</span></span>
<span class="line"><span>server.port=8080  // 指定监听端口</span></span>
<span class="line"><span>server.servlet.context-path=/xxl-job-admin // 指定context-path，就是控制台的路径</span></span></code></pre></div><h3 id="actuator相关" tabindex="-1">actuator相关 <a class="header-anchor" href="#actuator相关" aria-label="Permalink to &quot;actuator相关&quot;">​</a></h3><div class="language-application.properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>management.server.servlet.context-path=/actuator // 性能监控路径，/xxl-job-admin/actuator</span></span>
<span class="line"><span>management.health.mail.enabled=false // 启用或禁用通过邮件发送健康检查状态的通知。</span></span></code></pre></div><h3 id="freemarker相关" tabindex="-1">freemarker相关 <a class="header-anchor" href="#freemarker相关" aria-label="Permalink to &quot;freemarker相关&quot;">​</a></h3><p>模板解析相关，忽略即可</p><div class="language-application.properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spring.freemarker.templateLoaderPath=classpath:/templates/</span></span>
<span class="line"><span>spring.freemarker.suffix=.ftl</span></span>
<span class="line"><span>spring.freemarker.charset=UTF-8</span></span>
<span class="line"><span>spring.freemarker.request-context-attribute=request</span></span>
<span class="line"><span>spring.freemarker.settings.number_format=0.##########</span></span>
<span class="line"><span>spring.freemarker.settings.new_builtin_class_resolver=safer</span></span></code></pre></div><h3 id="mybatis相关" tabindex="-1">mybatis相关 <a class="header-anchor" href="#mybatis相关" aria-label="Permalink to &quot;mybatis相关&quot;">​</a></h3><div class="language-application.properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>mybatis.mapper-locations=classpath:/mybatis-mapper/*Mapper.xml // mybatis Mapper文件</span></span></code></pre></div><h3 id="datasource相关" tabindex="-1">datasource相关 <a class="header-anchor" href="#datasource相关" aria-label="Permalink to &quot;datasource相关&quot;">​</a></h3><div class="language-application.properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>### xxl-job, datasource</span></span>
<span class="line"><span>spring.datasource.url=jdbc:mysql://159.75.179.234:3306/xxl_job?useUnicode=true&amp;characterEncoding=UTF-8&amp;autoReconnect=true&amp;serverTimezone=Asia/Shanghai</span></span>
<span class="line"><span>spring.datasource.username=********</span></span>
<span class="line"><span>spring.datasource.password=******</span></span>
<span class="line"><span>spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver</span></span>
<span class="line"><span></span></span>
<span class="line"><span>### datasource-pool 默认使用hikari</span></span>
<span class="line"><span>spring.datasource.type=com.zaxxer.hikari.HikariDataSource</span></span>
<span class="line"><span>spring.datasource.hikari.minimum-idle=10</span></span>
<span class="line"><span>spring.datasource.hikari.maximum-pool-size=30</span></span>
<span class="line"><span>spring.datasource.hikari.auto-commit=true</span></span>
<span class="line"><span>spring.datasource.hikari.idle-timeout=30000</span></span>
<span class="line"><span>spring.datasource.hikari.pool-name=HikariCP</span></span>
<span class="line"><span>spring.datasource.hikari.max-lifetime=900000</span></span>
<span class="line"><span>spring.datasource.hikari.connection-timeout=10000</span></span>
<span class="line"><span>spring.datasource.hikari.connection-test-query=SELECT 1</span></span>
<span class="line"><span>spring.datasource.hikari.validation-timeout=1000</span></span></code></pre></div><h3 id="email告警相关" tabindex="-1">Email告警相关 <a class="header-anchor" href="#email告警相关" aria-label="Permalink to &quot;Email告警相关&quot;">​</a></h3><div class="language-application.properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spring.mail.host=smtp.qq.com</span></span>
<span class="line"><span>spring.mail.port=25</span></span>
<span class="line"><span>spring.mail.username=xxx@qq.com</span></span>
<span class="line"><span>spring.mail.from=xxx@qq.com</span></span>
<span class="line"><span>spring.mail.password=xxx</span></span>
<span class="line"><span>spring.mail.properties.mail.smtp.auth=true</span></span>
<span class="line"><span>spring.mail.properties.mail.smtp.starttls.enable=true</span></span>
<span class="line"><span>spring.mail.properties.mail.smtp.starttls.required=true</span></span>
<span class="line"><span>spring.mail.properties.mail.smtp.socketFactory.class=javax.net.ssl.SSLSocketFactory</span></span></code></pre></div><h3 id="access-token相关" tabindex="-1">ACCESS_TOKEN相关 <a class="header-anchor" href="#access-token相关" aria-label="Permalink to &quot;ACCESS_TOKEN相关&quot;">​</a></h3><div class="language-application.properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>xxl.job.accessToken=default_token // 指定token</span></span></code></pre></div><h3 id="i18n相关" tabindex="-1">i18n相关 <a class="header-anchor" href="#i18n相关" aria-label="Permalink to &quot;i18n相关&quot;">​</a></h3><div class="language-application.properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>xxl.job.i18n=zh_CN // 指定中文</span></span></code></pre></div><h3 id="trigger相关" tabindex="-1">trigger相关 <a class="header-anchor" href="#trigger相关" aria-label="Permalink to &quot;trigger相关&quot;">​</a></h3><div class="language-application.properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>xxl.job.triggerpool.fast.max=200  // 快任务线程池大小</span></span>
<span class="line"><span>xxl.job.triggerpool.slow.max=100  // 慢任务线程池大小</span></span></code></pre></div><h3 id="日志相关" tabindex="-1">日志相关 <a class="header-anchor" href="#日志相关" aria-label="Permalink to &quot;日志相关&quot;">​</a></h3><div class="language-application.properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>### xxl-job, log retention days</span></span>
<span class="line"><span>xxl.job.logretentiondays=30 // 日志默认保留30天</span></span></code></pre></div>`,31)]))}const b=s(l,[["render",t]]);export{u as __pageData,b as default};
