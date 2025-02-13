import{_ as s,c as a,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const l="/assets/xxl-job-executor-sample-executer-project.B7uFHMvr.png",d=JSON.parse('{"title":"执行器初始化流程","description":"","frontmatter":{},"headers":[],"relativePath":"xxl-job/executor.md","filePath":"xxl-job/executor.md"}'),r={name:"xxl-job/executor.md"};function i(t,n,c,b,u,o){return e(),a("div",null,n[0]||(n[0]=[p('<h1 id="执行器初始化流程" tabindex="-1">执行器初始化流程 <a class="header-anchor" href="#执行器初始化流程" aria-label="Permalink to &quot;执行器初始化流程&quot;">​</a></h1><p>前面详细分析了xxl-job-admin的流程，从这章开始，我们分析xxl-job的执行器流程。我们之前运行的是xxl-job-executor-sample-springboot这个项目，所以我们就从这个项目开始分析。</p><img src="'+l+`" width="400" alt="xxl-job-executor-sample-executer-project"><p>这个项目的结构还是很简单的，主要看XxlJobConfig和SampleXxlJob。SampleXxlJob是使用XxlJobConfig配置扫描的，直接看XxlJobConfig文件代码吧。</p><div class="language-XxlJobConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class XxlJobConfig {</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public XxlJobSpringExecutor xxlJobExecutor() {</span></span>
<span class="line"><span>    // 注意，这些属性都是通过application.properties注入的</span></span>
<span class="line"><span>    XxlJobSpringExecutor xxlJobSpringExecutor = new XxlJobSpringExecutor();</span></span>
<span class="line"><span>    xxlJobSpringExecutor.setAdminAddresses(adminAddresses);</span></span>
<span class="line"><span>    xxlJobSpringExecutor.setAppname(appname);</span></span>
<span class="line"><span>    xxlJobSpringExecutor.setAddress(address);</span></span>
<span class="line"><span>    xxlJobSpringExecutor.setIp(ip);</span></span>
<span class="line"><span>    xxlJobSpringExecutor.setPort(port);</span></span>
<span class="line"><span>    xxlJobSpringExecutor.setAccessToken(accessToken);</span></span>
<span class="line"><span>    xxlJobSpringExecutor.setLogPath(logPath);</span></span>
<span class="line"><span>    xxlJobSpringExecutor.setLogRetentionDays(logRetentionDays);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return xxlJobSpringExecutor;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><h2 id="xxljobspringexecutor" tabindex="-1">xxlJobSpringExecutor <a class="header-anchor" href="#xxljobspringexecutor" aria-label="Permalink to &quot;xxlJobSpringExecutor&quot;">​</a></h2><p>可以看到声明了一个Bean，名字叫做xxlJobSpringExecutor，接下来我们这个类的代码。</p><div class="language-XxlJobSpringExecutor vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobSpringExecutor</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobSpringExecutor extends XxlJobExecutor implements ApplicationContextAware, SmartInitializingSingleton, DisposableBean {</span></span>
<span class="line"><span>  // start</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void afterSingletonsInstantiated() {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 初始化JobHandlerMethod，把有XxlJob注解的方法提取出来</span></span>
<span class="line"><span>    initJobHandlerMethodRepository(applicationContext);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 刷新GlueFactory</span></span>
<span class="line"><span>    GlueFactory.refreshInstance(1);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 启动XxlJobSpringExecutor</span></span>
<span class="line"><span>    super.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // ---------------------- applicationContext ----------------------</span></span>
<span class="line"><span>  private static ApplicationContext applicationContext;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {</span></span>
<span class="line"><span>    XxlJobSpringExecutor.applicationContext = applicationContext;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><p>由于XxlJobSpringExecutor继承了SmartInitializingSingleton接口，所以会调用afterSingletonsInstantiated方法</p><h2 id="jobhandler初始化" tabindex="-1">JobHandler初始化 <a class="header-anchor" href="#jobhandler初始化" aria-label="Permalink to &quot;JobHandler初始化&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobSpringExecutor extends XxlJobExecutor implements ApplicationContextAware, SmartInitializingSingleton, DisposableBean {</span></span>
<span class="line"><span>  private void initJobHandlerMethodRepository(ApplicationContext applicationContext) {</span></span>
<span class="line"><span>    if (applicationContext == null) {</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 获取applicationContext所有的bean</span></span>
<span class="line"><span>    String[] beanDefinitionNames = applicationContext.getBeanNamesForType(Object.class, false, true);</span></span>
<span class="line"><span>    for (String beanDefinitionName : beanDefinitionNames) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // get bean</span></span>
<span class="line"><span>      Object bean = null;</span></span>
<span class="line"><span>      Lazy onBean = applicationContext.findAnnotationOnBean(beanDefinitionName, Lazy.class);</span></span>
<span class="line"><span>      // 有Lazy注解的先跳过</span></span>
<span class="line"><span>      if (onBean!=null){</span></span>
<span class="line"><span>        logger.debug(&quot;xxl-job annotation scan, skip @Lazy Bean:{}&quot;, beanDefinitionName);</span></span>
<span class="line"><span>        continue;</span></span>
<span class="line"><span>      }else {</span></span>
<span class="line"><span>        bean = applicationContext.getBean(beanDefinitionName);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // filter method</span></span>
<span class="line"><span>      Map&lt;Method, XxlJob&gt; annotatedMethods = null;   // referred to ：org.springframework.context.event.EventListenerMethodProcessor.processBean</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        // 获取bean上具有XxlJob注解的所有方法</span></span>
<span class="line"><span>        annotatedMethods = MethodIntrospector.selectMethods(bean.getClass(),</span></span>
<span class="line"><span>                new MethodIntrospector.MetadataLookup&lt;XxlJob&gt;() {</span></span>
<span class="line"><span>                  @Override</span></span>
<span class="line"><span>                  public XxlJob inspect(Method method) {</span></span>
<span class="line"><span>                    return AnnotatedElementUtils.findMergedAnnotation(method, XxlJob.class);</span></span>
<span class="line"><span>                  }</span></span>
<span class="line"><span>                });</span></span>
<span class="line"><span>      } catch (Throwable ex) {</span></span>
<span class="line"><span>        logger.error(&quot;xxl-job method-jobhandler resolve error for bean[&quot; + beanDefinitionName + &quot;].&quot;, ex);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      if (annotatedMethods==null || annotatedMethods.isEmpty()) {</span></span>
<span class="line"><span>        continue;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // generate and regist method job handler</span></span>
<span class="line"><span>      for (Map.Entry&lt;Method, XxlJob&gt; methodXxlJobEntry : annotatedMethods.entrySet()) {</span></span>
<span class="line"><span>        Method executeMethod = methodXxlJobEntry.getKey();</span></span>
<span class="line"><span>        XxlJob xxlJob = methodXxlJobEntry.getValue();</span></span>
<span class="line"><span>        // 注册JobHandler方法</span></span>
<span class="line"><span>        registJobHandler(xxlJob, bean, executeMethod);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br></div></div><p>可以看到这个方法就是扫描所有具有XxlJob注解的方法，然后注册这些方法。接下来看registJobHandler这个方法的实现。</p><div class="language-XxlJobExecutor vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobExecutor</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobExecutor  {</span></span>
<span class="line"><span>  private static ConcurrentMap&lt;String, IJobHandler&gt; jobHandlerRepository = new ConcurrentHashMap&lt;String, IJobHandler&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected void registJobHandler(XxlJob xxlJob, Object bean, Method executeMethod) {</span></span>
<span class="line"><span>    Class&lt;?&gt; clazz = bean.getClass();</span></span>
<span class="line"><span>    String name = xxlJob.value();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    initMethod = clazz.getDeclaredMethod(xxlJob.init());</span></span>
<span class="line"><span>    initMethod.setAccessible(true);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    destroyMethod = clazz.getDeclaredMethod(xxlJob.destroy());</span></span>
<span class="line"><span>    destroyMethod.setAccessible(true);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // registry jobhandler</span></span>
<span class="line"><span>    registJobHandler(name, new MethodJobHandler(bean, executeMethod, initMethod, destroyMethod));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static IJobHandler registJobHandler(String name, IJobHandler jobHandler){</span></span>
<span class="line"><span>    return jobHandlerRepository.put(name, jobHandler);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>可以看到registJobHandler就是往jobHandlerRepository写到jobHandlerRepository里面，key就是xxlJob.value, value就是MethodJobHandler，这个类是封装了JobHandler的一个类。</p><h2 id="gluefactory初始化" tabindex="-1">GlueFactory初始化 <a class="header-anchor" href="#gluefactory初始化" aria-label="Permalink to &quot;GlueFactory初始化&quot;">​</a></h2><p>接下来看一下GlueFactory#refreshInstance这个方法，主要是用来处理GLUE类型的定时任务的，GLUE任务就是一段可以执行的代码。</p><div class="language-GlueFactory vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">GlueFactory</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class GlueFactory {</span></span>
<span class="line"><span>  public static void refreshInstance(int type){</span></span>
<span class="line"><span>		if (type == 0) {</span></span>
<span class="line"><span>			glueFactory = new GlueFactory();</span></span>
<span class="line"><span>		} else if (type == 1) {</span></span>
<span class="line"><span>			glueFactory = new SpringGlueFactory();</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>由于是Spring环境，默认使用SpringGlueFactory。简单看一下GlueFactory这个工厂类的方法吧，这里就不细讲了。</p><div class="language-GlueFactory vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">GlueFactory</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class GlueFactory {</span></span>
<span class="line"><span>  // 通过codeSource获取class实例并执行</span></span>
<span class="line"><span>  public IJobHandler loadNewInstance(String codeSource) throws Exception;</span></span>
<span class="line"><span>  private Class&lt;?&gt; getCodeSourceClass(String codeSource);</span></span>
<span class="line"><span>  public void injectService(Object instance);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><h2 id="执行器初始化" tabindex="-1">执行器初始化 <a class="header-anchor" href="#执行器初始化" aria-label="Permalink to &quot;执行器初始化&quot;">​</a></h2><div class="language-XxlJobExecutor vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobExecutor</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobExecutor  {</span></span>
<span class="line"><span>  public void start() throws Exception {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 初始化log的文件路径</span></span>
<span class="line"><span>    XxlJobFileAppender.initLogPath(logPath);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 初始化admin控制台的地址</span></span>
<span class="line"><span>    initAdminBizList(adminAddresses, accessToken);</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 启动日志清理线程</span></span>
<span class="line"><span>    JobLogFileCleanThread.getInstance().start(logRetentionDays);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 初始化CallbackThread线程</span></span>
<span class="line"><span>    TriggerCallbackThread.getInstance().start();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 初始化客户端服务器，基于netty</span></span>
<span class="line"><span>    initEmbedServer(address, ip, port, appname, accessToken);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><h3 id="初始化执行器服务" tabindex="-1">初始化执行器服务 <a class="header-anchor" href="#初始化执行器服务" aria-label="Permalink to &quot;初始化执行器服务&quot;">​</a></h3><p>我们看一下initEmbedServer的执行方法，代码如下:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobExecutor  {</span></span>
<span class="line"><span>  private void initEmbedServer(String address, String ip, int port, String appname, String accessToken) throws Exception {</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // fill ip port</span></span>
<span class="line"><span>    port = port&gt;0?port: NetUtil.findAvailablePort(9999);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // start</span></span>
<span class="line"><span>    embedServer = new EmbedServer();</span></span>
<span class="line"><span>    embedServer.start(address, port, appname, accessToken);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>可以看到初始化了一个EmbedServer类，并且调用了EmbedServer的start方法，我们具体看一下对应的方法代码。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class EmbedServer {</span></span>
<span class="line"><span>  public void start(final String address, final int port, final String appname, final String accessToken) {</span></span>
<span class="line"><span>    executorBiz = new ExecutorBizImpl();</span></span>
<span class="line"><span>    thread = new Thread(new Runnable() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span>        // param</span></span>
<span class="line"><span>        EventLoopGroup bossGroup = new NioEventLoopGroup();</span></span>
<span class="line"><span>        EventLoopGroup workerGroup = new NioEventLoopGroup();</span></span>
<span class="line"><span>        ThreadPoolExecutor bizThreadPool = new ThreadPoolExecutor(</span></span>
<span class="line"><span>                0,</span></span>
<span class="line"><span>                200,</span></span>
<span class="line"><span>                60L,</span></span>
<span class="line"><span>                TimeUnit.SECONDS,</span></span>
<span class="line"><span>                new LinkedBlockingQueue&lt;Runnable&gt;(2000),</span></span>
<span class="line"><span>                new ThreadFactory() {</span></span>
<span class="line"><span>                  @Override</span></span>
<span class="line"><span>                  public Thread newThread(Runnable r) {</span></span>
<span class="line"><span>                    return new Thread(r, &quot;xxl-job, EmbedServer bizThreadPool-&quot; + r.hashCode());</span></span>
<span class="line"><span>                  }</span></span>
<span class="line"><span>                },</span></span>
<span class="line"><span>                new RejectedExecutionHandler() {</span></span>
<span class="line"><span>                  @Override</span></span>
<span class="line"><span>                  public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {</span></span>
<span class="line"><span>                    throw new RuntimeException(&quot;xxl-job, EmbedServer bizThreadPool is EXHAUSTED!&quot;);</span></span>
<span class="line"><span>                  }</span></span>
<span class="line"><span>                });</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          // start server</span></span>
<span class="line"><span>          ServerBootstrap bootstrap = new ServerBootstrap();</span></span>
<span class="line"><span>          bootstrap.group(bossGroup, workerGroup)</span></span>
<span class="line"><span>                  .channel(NioServerSocketChannel.class)</span></span>
<span class="line"><span>                  .childHandler(new ChannelInitializer&lt;SocketChannel&gt;() {</span></span>
<span class="line"><span>                    @Override</span></span>
<span class="line"><span>                    public void initChannel(SocketChannel channel) throws Exception {</span></span>
<span class="line"><span>                      channel.pipeline()</span></span>
<span class="line"><span>                              .addLast(new IdleStateHandler(0, 0, 30 * 3, TimeUnit.SECONDS))  // beat 3N, close if idle</span></span>
<span class="line"><span>                              .addLast(new HttpServerCodec())</span></span>
<span class="line"><span>                              .addLast(new HttpObjectAggregator(5 * 1024 * 1024))  // merge request &amp; reponse to FULL</span></span>
<span class="line"><span>                              .addLast(new EmbedHttpServerHandler(executorBiz, accessToken, bizThreadPool));</span></span>
<span class="line"><span>                    }</span></span>
<span class="line"><span>                  })</span></span>
<span class="line"><span>                  .childOption(ChannelOption.SO_KEEPALIVE, true);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // bind</span></span>
<span class="line"><span>          ChannelFuture future = bootstrap.bind(port).sync();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          logger.info(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job remoting server start success, nettype = {}, port = {}&quot;, EmbedServer.class, port);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // 向服务端注册执行器</span></span>
<span class="line"><span>          startRegistry(appname, address);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // wait util stop</span></span>
<span class="line"><span>          future.channel().closeFuture().sync();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        } catch (InterruptedException e) {</span></span>
<span class="line"><span>          logger.info(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job remoting server stop.&quot;);</span></span>
<span class="line"><span>        } catch (Exception e) {</span></span>
<span class="line"><span>          logger.error(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job remoting server error.&quot;, e);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    thread.setDaemon(true);    // daemon, service jvm, user thread leave &gt;&gt;&gt; daemon leave &gt;&gt;&gt; jvm leave</span></span>
<span class="line"><span>    thread.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br></div></div><p>可以看到初始化了一个线程池，并且使用netty建立了一个服务器。核心地方我们查看EmbedHttpServerHandler这个处理类</p><h3 id="embedhttpserverhandler" tabindex="-1">EmbedHttpServerHandler <a class="header-anchor" href="#embedhttpserverhandler" aria-label="Permalink to &quot;EmbedHttpServerHandler&quot;">​</a></h3><div class="language-EmbedHttpServerHandler vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">EmbedHttpServerHandler</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public static class EmbedHttpServerHandler extends SimpleChannelInboundHandler&lt;FullHttpRequest&gt; {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected void channelRead0(final ChannelHandlerContext ctx, FullHttpRequest msg) throws Exception {</span></span>
<span class="line"><span>    // request parse</span></span>
<span class="line"><span>    //final byte[] requestBytes = ByteBufUtil.getBytes(msg.content());    // byteBuf.toString(io.netty.util.CharsetUtil.UTF_8);</span></span>
<span class="line"><span>    String requestData = msg.content().toString(CharsetUtil.UTF_8);</span></span>
<span class="line"><span>    String uri = msg.uri();</span></span>
<span class="line"><span>    HttpMethod httpMethod = msg.method();</span></span>
<span class="line"><span>    boolean keepAlive = HttpUtil.isKeepAlive(msg);</span></span>
<span class="line"><span>    String accessTokenReq = msg.headers().get(XxlJobRemotingUtil.XXL_JOB_ACCESS_TOKEN);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // invoke</span></span>
<span class="line"><span>    bizThreadPool.execute(new Runnable() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span>        // do invoke</span></span>
<span class="line"><span>        Object responseObj = process(httpMethod, uri, requestData, accessTokenReq);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // to json</span></span>
<span class="line"><span>        String responseJson = GsonTool.toJson(responseObj);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // write response</span></span>
<span class="line"><span>        writeResponse(ctx, keepAlive, responseJson);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private Object process(HttpMethod httpMethod, String uri, String requestData, String accessTokenReq) {</span></span>
<span class="line"><span>    // valid</span></span>
<span class="line"><span>    if (HttpMethod.POST != httpMethod) {</span></span>
<span class="line"><span>      return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;invalid request, HttpMethod not support.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (uri == null || uri.trim().length() == 0) {</span></span>
<span class="line"><span>      return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;invalid request, uri-mapping empty.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (accessToken != null</span></span>
<span class="line"><span>            &amp;&amp; accessToken.trim().length() &gt; 0</span></span>
<span class="line"><span>            &amp;&amp; !accessToken.equals(accessTokenReq)) {</span></span>
<span class="line"><span>      return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;The access token is wrong.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // services mapping</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      switch (uri) {</span></span>
<span class="line"><span>        case &quot;/beat&quot;:</span></span>
<span class="line"><span>          return executorBiz.beat();</span></span>
<span class="line"><span>        case &quot;/idleBeat&quot;:</span></span>
<span class="line"><span>          IdleBeatParam idleBeatParam = GsonTool.fromJson(requestData, IdleBeatParam.class);</span></span>
<span class="line"><span>          return executorBiz.idleBeat(idleBeatParam);</span></span>
<span class="line"><span>        case &quot;/run&quot;:</span></span>
<span class="line"><span>          TriggerParam triggerParam = GsonTool.fromJson(requestData, TriggerParam.class);</span></span>
<span class="line"><span>          return executorBiz.run(triggerParam);</span></span>
<span class="line"><span>        case &quot;/kill&quot;:</span></span>
<span class="line"><span>          KillParam killParam = GsonTool.fromJson(requestData, KillParam.class);</span></span>
<span class="line"><span>          return executorBiz.kill(killParam);</span></span>
<span class="line"><span>        case &quot;/log&quot;:</span></span>
<span class="line"><span>          LogParam logParam = GsonTool.fromJson(requestData, LogParam.class);</span></span>
<span class="line"><span>          return executorBiz.log(logParam);</span></span>
<span class="line"><span>        default:</span></span>
<span class="line"><span>          return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;invalid request, uri-mapping(&quot; + uri + &quot;) not found.&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    } catch (Exception e) {</span></span>
<span class="line"><span>      logger.error(e.getMessage(), e);</span></span>
<span class="line"><span>      return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;request error:&quot; + ThrowableUtil.toString(e));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br></div></div><p>可以看到用刚才创建的线程池来处理admin下发的请求。</p><p>我们主要看/run分支的代码，可以看到调用了executorBiz#run方法，这个对应的实现是ExecutorBizImpl，我们看一下实现：</p><div class="language-ExecutorBizImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorBizImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorBizImpl implements ExecutorBiz {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; run(TriggerParam triggerParam) {</span></span>
<span class="line"><span>    // load old：jobHandler + jobThread</span></span>
<span class="line"><span>    JobThread jobThread = XxlJobExecutor.loadJobThread(triggerParam.getJobId());</span></span>
<span class="line"><span>    IJobHandler jobHandler = jobThread!=null?jobThread.getHandler():null;</span></span>
<span class="line"><span>    String removeOldReason = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // valid：jobHandler + jobThread</span></span>
<span class="line"><span>    GlueTypeEnum glueTypeEnum = GlueTypeEnum.match(triggerParam.getGlueType());</span></span>
<span class="line"><span>    if (GlueTypeEnum.BEAN == glueTypeEnum) {</span></span>
<span class="line"><span>      // 通过triggerParam的executor获取执行器方法</span></span>
<span class="line"><span>      IJobHandler newJobHandler = XxlJobExecutor.loadJobHandler(triggerParam.getExecutorHandler());</span></span>
<span class="line"><span>    } else if (GlueTypeEnum.GLUE_GROOVY == glueTypeEnum) {</span></span>
<span class="line"><span>      IJobHandler originJobHandler = GlueFactory.getInstance().loadNewInstance(triggerParam.getGlueSource());</span></span>
<span class="line"><span>      jobHandler = new GlueJobHandler(originJobHandler, triggerParam.getGlueUpdatetime());</span></span>
<span class="line"><span>    } else if (glueTypeEnum!=null &amp;&amp; glueTypeEnum.isScript()) {</span></span>
<span class="line"><span>      jobHandler = new ScriptJobHandler(triggerParam.getJobId(), triggerParam.getGlueUpdatetime(), triggerParam.getGlueSource(), GlueTypeEnum.match(triggerParam.getGlueType()));</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;glueType[&quot; + triggerParam.getGlueType() + &quot;] is not valid.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 如果jobThread不为空，表明同一个jobId已经有工作线程在处理了</span></span>
<span class="line"><span>    if (jobThread != null) {</span></span>
<span class="line"><span>      ExecutorBlockStrategyEnum blockStrategy = ExecutorBlockStrategyEnum.match(triggerParam.getExecutorBlockStrategy(), null);</span></span>
<span class="line"><span>      // 丢弃</span></span>
<span class="line"><span>      if (ExecutorBlockStrategyEnum.DISCARD_LATER == blockStrategy) {</span></span>
<span class="line"><span>        // discard when running</span></span>
<span class="line"><span>        if (jobThread.isRunningOrHasQueue()) {</span></span>
<span class="line"><span>          return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;block strategy effect：&quot;+ExecutorBlockStrategyEnum.DISCARD_LATER.getTitle());</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      } else if (ExecutorBlockStrategyEnum.COVER_EARLY == blockStrategy) {</span></span>
<span class="line"><span>        // kill running jobThread</span></span>
<span class="line"><span>        // 覆盖之前的</span></span>
<span class="line"><span>        if (jobThread.isRunningOrHasQueue()) {</span></span>
<span class="line"><span>          removeOldReason = &quot;block strategy effect：&quot; + ExecutorBlockStrategyEnum.COVER_EARLY.getTitle();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          jobThread = null;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>        // just queue trigger</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // replace thread (new or exists invalid)</span></span>
<span class="line"><span>    if (jobThread == null) {</span></span>
<span class="line"><span>      jobThread = XxlJobExecutor.registJobThread(triggerParam.getJobId(), jobHandler, removeOldReason);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // push data to queue</span></span>
<span class="line"><span>    ReturnT&lt;String&gt; pushResult = jobThread.pushTriggerQueue(triggerParam);</span></span>
<span class="line"><span>    return pushResult;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br></div></div><p>可以看到是从XxlJobExecutor拿到jobId对应的jobThread，然后将triggerParam参数放入到jobThread里面。看一下jobThread#pushTriggerQueue的方法</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobThread extends Thread {</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; pushTriggerQueue(TriggerParam triggerParam) {</span></span>
<span class="line"><span>    // 如果已经存在了对应的logId</span></span>
<span class="line"><span>    if (triggerLogIdSet.contains(triggerParam.getLogId())) {</span></span>
<span class="line"><span>      logger.info(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; repeate trigger job, logId:{}&quot;, triggerParam.getLogId());</span></span>
<span class="line"><span>      return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;repeate trigger job, logId:&quot; + triggerParam.getLogId());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 添加triggerParam</span></span>
<span class="line"><span>    triggerLogIdSet.add(triggerParam.getLogId());</span></span>
<span class="line"><span>    triggerQueue.add(triggerParam);</span></span>
<span class="line"><span>    return ReturnT.SUCCESS;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>最后让我们看一下jobThread的核心方法start。</p><div class="language-JobThread vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobThread</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobThread extends Thread {</span></span>
<span class="line"><span>	public void run() {</span></span>
<span class="line"><span>    while(!toStop){</span></span>
<span class="line"><span>      //1、从队列中触发参数</span></span>
<span class="line"><span>      triggerParam = triggerQueue.poll(3L, TimeUnit.SECONDS);</span></span>
<span class="line"><span>      if (triggerParam != null) {</span></span>
<span class="line"><span>        //2、如果存在执行超时时间并大于0，则在规定的时间异步执行，否则立即执行</span></span>
<span class="line"><span>        if (triggerParam.getExecutorTimeout() &gt; 0) {</span></span>
<span class="line"><span>          FutureTask&lt;Boolean&gt; futureTask = new FutureTask&lt;Boolean&gt;(new Callable&lt;Boolean&gt;() {</span></span>
<span class="line"><span>            @Override</span></span>
<span class="line"><span>            public Boolean call() throws Exception {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                // init job context</span></span>
<span class="line"><span>                XxlJobContext.setXxlJobContext(xxlJobContext);</span></span>
<span class="line"><span>                //处理器执行方法</span></span>
<span class="line"><span>                handler.execute();</span></span>
<span class="line"><span>                return true;</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>          });</span></span>
<span class="line"><span>          futureThread = new Thread(futureTask);</span></span>
<span class="line"><span>          futureThread.start();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          //等待结果</span></span>
<span class="line"><span>          Boolean tempResult = futureTask.get(triggerParam.getExecutorTimeout(), TimeUnit.SECONDS);</span></span>
<span class="line"><span>        }else{</span></span>
<span class="line"><span>            // just execute 立即执行</span></span>
<span class="line"><span>            handler.execute();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>        // 如果空闲的次数超过30次，则销毁jobThread</span></span>
<span class="line"><span>        if (idleTimes &gt; 30) {</span></span>
<span class="line"><span>          if(triggerQueue.size() == 0) {	// avoid concurrent trigger causes jobId-lost</span></span>
<span class="line"><span>            XxlJobExecutor.removeJobThread(jobId, &quot;excutor idel times over limit.&quot;);</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br></div></div><p>上述将任务执行的代码省略了很多，只将核心的代码抽取出来。任务的执行是不断执行的，只有当任务停止了（toStop设置为ture），才跳出while循环。首先从triggerQueue队列中弹出触发参数，如果存在执行超时时间并大于0，则在规定的时间异步调用handler的execute方法执行任务，否则立即调用handler的execute方法执行任务。</p><p>handler#execute的代码比较简单，这里就不详细讲了。</p><h2 id="执行器注册" tabindex="-1">执行器注册 <a class="header-anchor" href="#执行器注册" aria-label="Permalink to &quot;执行器注册&quot;">​</a></h2><p>最后讲一下执行器的注册流程，在netty服务器初始化的代码中，可以看到一行注册执行器的代码。</p><div class="language-EmbedServer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">EmbedServer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class EmbedServer {</span></span>
<span class="line"><span>  public void start(final String address, final int port, final String appname, final String accessToken) {</span></span>
<span class="line"><span>    startRegistry(appname, address);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void startRegistry(final String appname, final String address) {</span></span>
<span class="line"><span>    // start registry</span></span>
<span class="line"><span>    ExecutorRegistryThread.getInstance().start(appname, address);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>我们看一下ExecutorRegistryThread的源码，如下所示</p><div class="language-ExecutorRegistryThread vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorRegistryThread</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorRegistryThread {</span></span>
<span class="line"><span>  public void start(final String appname, final String address) {</span></span>
<span class="line"><span>    registryThread = new Thread();</span></span>
<span class="line"><span>    registryThread.setDaemon(true);</span></span>
<span class="line"><span>    registryThread.setName(&quot;xxl-job, executor ExecutorRegistryThread&quot;);</span></span>
<span class="line"><span>    registryThread.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>可以看到注册了一个守护线程registryThread，我们看看这个线程做了什么事情</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>registryThread = new Thread(new Runnable() {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void run() {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // registry</span></span>
<span class="line"><span>    while (!toStop) {</span></span>
<span class="line"><span>      RegistryParam registryParam = new RegistryParam(RegistryConfig.RegistType.EXECUTOR.name(), appname, address);</span></span>
<span class="line"><span>      for (AdminBiz adminBiz: XxlJobExecutor.getAdminBizList()) {</span></span>
<span class="line"><span>        ReturnT&lt;String&gt; registryResult = adminBiz.registry(registryParam);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 休眠30秒</span></span>
<span class="line"><span>      TimeUnit.SECONDS.sleep(RegistryConfig.BEAT_TIMEOUT);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // registry remove</span></span>
<span class="line"><span>    RegistryParam registryParam = new RegistryParam(RegistryConfig.RegistType.EXECUTOR.name(), appname, address);</span></span>
<span class="line"><span>    for (AdminBiz adminBiz: XxlJobExecutor.getAdminBizList()) {</span></span>
<span class="line"><span>        ReturnT&lt;String&gt; registryResult = adminBiz.registryRemove(registryParam);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>可以看到主要是每隔30秒，遍历adminBizList，然后调用adminBiz.registry注册和adminBiz.registryRemove移除注册。</p><p>对应的实现类是AdminBizClient，查看实现代码, 前面讲过postBody的实现，这里就不细说了。</p><div class="language-AdminBizClient vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AdminBizClient</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class AdminBizClient implements AdminBiz {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; registry(RegistryParam registryParam) {</span></span>
<span class="line"><span>    return XxlJobRemotingUtil.postBody(addressUrl + &quot;api/registry&quot;, accessToken, timeout, registryParam, String.class);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; registryRemove(RegistryParam registryParam) {</span></span>
<span class="line"><span>    return XxlJobRemotingUtil.postBody(addressUrl + &quot;api/registryRemove&quot;, accessToken, timeout, registryParam, String.class);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div>`,48)]))}const g=s(r,[["render",i]]);export{d as __pageData,g as default};
