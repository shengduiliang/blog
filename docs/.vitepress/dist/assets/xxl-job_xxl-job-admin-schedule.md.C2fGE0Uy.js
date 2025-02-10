import{_ as s,c as a,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const m=JSON.parse('{"title":"调度中心启动流程","description":"","frontmatter":{},"headers":[],"relativePath":"xxl-job/xxl-job-admin-schedule.md","filePath":"xxl-job/xxl-job-admin-schedule.md"}'),l={name:"xxl-job/xxl-job-admin-schedule.md"};function r(i,n,c,b,t,o){return e(),a("div",null,n[0]||(n[0]=[p(`<h1 id="调度中心启动流程" tabindex="-1">调度中心启动流程 <a class="header-anchor" href="#调度中心启动流程" aria-label="Permalink to &quot;调度中心启动流程&quot;">​</a></h1><p>本章节我们一起进入xxl-job的调度器启动流程，讲解一下xxl-job的启动流程。</p><p>打开xxl-job-admin的com/xxl/job/admin/conf目录下的XxlJobAdminConfig，具体代码如下:</p><div class="language-XxlJobAdminConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobAdminConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Component</span></span>
<span class="line"><span>public class XxlJobAdminConfig implements InitializingBean, DisposableBean {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static XxlJobAdminConfig adminConfig = null;</span></span>
<span class="line"><span>  public static XxlJobAdminConfig getAdminConfig() {</span></span>
<span class="line"><span>    return adminConfig;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private XxlJobScheduler xxlJobScheduler;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void afterPropertiesSet() throws Exception {</span></span>
<span class="line"><span>    adminConfig = this;</span></span>
<span class="line"><span>    // 新建调度器</span></span>
<span class="line"><span>    xxlJobScheduler = new XxlJobScheduler();</span></span>
<span class="line"><span>    // 调度器初始化</span></span>
<span class="line"><span>    xxlJobScheduler.init();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void destroy() throws Exception {</span></span>
<span class="line"><span>    xxlJobScheduler.destroy();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>可以看到XxlJobAdminConfig继承了InitializingBean，在spring初始化过程中会调用afterPropertiesSet方法，调用xxlJobScheduler#init方法。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobScheduler  {</span></span>
<span class="line"><span>  private static final Logger logger = LoggerFactory.getLogger(XxlJobScheduler.class);</span></span>
<span class="line"><span>  public void init() throws Exception {</span></span>
<span class="line"><span>    // init i18n</span></span>
<span class="line"><span>    // 加载国际化资源文件</span></span>
<span class="line"><span>    initI18n();</span></span>
<span class="line"><span>    // admin trigger pool start</span></span>
<span class="line"><span>    // 定义一个快任务线程池，一个慢任务线程池</span></span>
<span class="line"><span>    JobTriggerPoolHelper.toStart();</span></span>
<span class="line"><span>    // admin registry monitor run</span></span>
<span class="line"><span>    // 注册中心监控线程，定时更新执行器信息</span></span>
<span class="line"><span>    JobRegistryHelper.getInstance().start();</span></span>
<span class="line"><span>    // admin fail-monitor run</span></span>
<span class="line"><span>    // 任务失败重试处理，每10ms处理一次</span></span>
<span class="line"><span>    JobFailMonitorHelper.getInstance().start();</span></span>
<span class="line"><span>    // admin lose-monitor run ( depend on JobTriggerPoolHelper )</span></span>
<span class="line"><span>    // 扫描失败的任务，每60ms处理一次</span></span>
<span class="line"><span>    JobCompleteHelper.getInstance().start();</span></span>
<span class="line"><span>    // admin log report start</span></span>
<span class="line"><span>    // 清除过期日志</span></span>
<span class="line"><span>    JobLogReportHelper.getInstance().start();</span></span>
<span class="line"><span>    // start-schedule  ( depend on JobTriggerPoolHelper )</span></span>
<span class="line"><span>    // 启动调度器</span></span>
<span class="line"><span>    JobScheduleHelper.getInstance().start();</span></span>
<span class="line"><span>    logger.info(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; init xxl-job admin success.&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>可以看到xxlJobScheduler#init一共做了如下几件事：</p><ul><li>国际化初始化</li><li>触发器线程池创建（核心）</li><li>注册监控器启动（核心）</li><li>失败监控器启动（核心）</li><li>丢失监控器启动（核心）</li><li>日志任务启动</li><li>JobSchedule调度器启动（核心）</li></ul><h2 id="国际化资源初始化" tabindex="-1">国际化资源初始化 <a class="header-anchor" href="#国际化资源初始化" aria-label="Permalink to &quot;国际化资源初始化&quot;">​</a></h2><p>首先我们看看国际化资源初始化的initI18n方法，具体代码如下所示：</p><div class="language-XxlJobScheduler vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobScheduler</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobScheduler  {</span></span>
<span class="line"><span>  private void initI18n(){</span></span>
<span class="line"><span>    for (ExecutorBlockStrategyEnum item:ExecutorBlockStrategyEnum.values()) {</span></span>
<span class="line"><span>      item.setTitle(I18nUtil.getString(&quot;jobconf_block_&quot;.concat(item.name())));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>ExecutorBlockStrategyEnum是执行阻塞策略枚举，主要有单机串行、丢弃后续调度、覆盖之前调度三种策略，initI18n方法就是设置执行策略的title值。</p><p>可以看到是调用I18nUtil#getString获取的，具体代码如下：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class I18nUtil {</span></span>
<span class="line"><span>  private static Properties prop = null;</span></span>
<span class="line"><span>  public static Properties loadI18nProp(){</span></span>
<span class="line"><span>    if (prop != null) {</span></span>
<span class="line"><span>      return prop;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      // build i18n prop</span></span>
<span class="line"><span>      String i18n = XxlJobAdminConfig.getAdminConfig().getI18n();</span></span>
<span class="line"><span>      String i18nFile = MessageFormat.format(&quot;i18n/message_{0}.properties&quot;, i18n);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // load prop</span></span>
<span class="line"><span>      Resource resource = new ClassPathResource(i18nFile);</span></span>
<span class="line"><span>      EncodedResource encodedResource = new EncodedResource(resource,&quot;UTF-8&quot;);</span></span>
<span class="line"><span>      // 加载i18n的资源属性</span></span>
<span class="line"><span>      prop = PropertiesLoaderUtils.loadProperties(encodedResource);</span></span>
<span class="line"><span>    } catch (IOException e) {</span></span>
<span class="line"><span>      logger.error(e.getMessage(), e);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return prop;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static String getString(String key) {</span></span>
<span class="line"><span>    return loadI18nProp().getProperty(key);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div><p>I18nUtil.getString方法就是根据配置读取resources/il8n/目录下的其中一个文件，该目录下有message_en.properties、message_zh_CN.properties、message_zh_TC.properties三个文件，分别为英语、中文简体、中文繁体的属性文件。具体选取哪个文件是根据XxlJobAdminConfig.getAdminConfig().getI18n()获取的，我们看一下这个值是怎么取的。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Component</span></span>
<span class="line"><span>public class XxlJobAdminConfig implements InitializingBean, DisposableBean {</span></span>
<span class="line"><span>  // 后面就不放这行代码了，大家知道XxlJobAdminConfig.getAdminConfig()就是返回XxlJobAdminConfig对象就好了</span></span>
<span class="line"><span>  private static XxlJobAdminConfig adminConfig = null;</span></span>
<span class="line"><span>  public static XxlJobAdminConfig getAdminConfig() {</span></span>
<span class="line"><span>    return adminConfig;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Value(&quot;\${xxl.job.i18n}&quot;)</span></span>
<span class="line"><span>  private String i18n;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public String getI18n() {</span></span>
<span class="line"><span>    if (!Arrays.asList(&quot;zh_CN&quot;, &quot;zh_TC&quot;, &quot;en&quot;).contains(i18n)) {</span></span>
<span class="line"><span>      return &quot;zh_CN&quot;;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return i18n;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>可以看到就是从application.properties文件中获取到的xxl.job.i18n，如果没有，默认是zh_CN，而上章的默认配置也是zh_CN。</p><p>最后看一下PropertiesLoaderUtils#loadProperties的解析过程。</p><div class="language-PropertiesLoaderUtils vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">PropertiesLoaderUtils</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class PropertiesLoaderUtils {</span></span>
<span class="line"><span>  public static Properties loadProperties(EncodedResource resource) throws IOException {</span></span>
<span class="line"><span>    Properties props = new Properties();</span></span>
<span class="line"><span>    fillProperties(props, resource);</span></span>
<span class="line"><span>    return props;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void fillProperties(Properties props, EncodedResource resource) throws IOException {</span></span>
<span class="line"><span>    fillProperties(props, resource, ResourcePropertiesPersister.INSTANCE);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    static void fillProperties(Properties props, EncodedResource resource, PropertiesPersister persister) throws IOException {</span></span>
<span class="line"><span>    InputStream stream = null;</span></span>
<span class="line"><span>    Reader reader = null;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      String filename = resource.getResource().getFilename();</span></span>
<span class="line"><span>      // 如果resource文件以&quot;.xml&quot;结尾，走这里</span></span>
<span class="line"><span>      if (filename != null &amp;&amp; filename.endsWith(&quot;.xml&quot;)) {</span></span>
<span class="line"><span>        if (shouldIgnoreXml) {</span></span>
<span class="line"><span>          throw new UnsupportedOperationException(&quot;XML support disabled&quot;);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        stream = resource.getInputStream();</span></span>
<span class="line"><span>        persister.loadFromXml(props, stream);</span></span>
<span class="line"><span>      } else if (resource.requiresReader()) {</span></span>
<span class="line"><span>        // message_zh_CN.properties默认走这里</span></span>
<span class="line"><span>        reader = resource.getReader();</span></span>
<span class="line"><span>        persister.load(props, reader);</span></span>
<span class="line"><span>      // 其他的走这里</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>        stream = resource.getInputStream();</span></span>
<span class="line"><span>        persister.load(props, stream);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br></div></div><h2 id="触发器线程池创建" tabindex="-1">触发器线程池创建 <a class="header-anchor" href="#触发器线程池创建" aria-label="Permalink to &quot;触发器线程池创建&quot;">​</a></h2><p>JobTriggerPoolHelper#toStart其实就是创建了两个线程池，一个快线程池，一个慢线程池。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobTriggerPoolHelper {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // ---------------------- helper ----------------------</span></span>
<span class="line"><span>  private static JobTriggerPoolHelper helper = new JobTriggerPoolHelper();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void toStart() {</span></span>
<span class="line"><span>    helper.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void start(){</span></span>
<span class="line"><span>    fastTriggerPool = new ThreadPoolExecutor(</span></span>
<span class="line"><span>            10,</span></span>
<span class="line"><span>            XxlJobAdminConfig.getAdminConfig().getTriggerPoolFastMax(),</span></span>
<span class="line"><span>            60L,</span></span>
<span class="line"><span>            TimeUnit.SECONDS,</span></span>
<span class="line"><span>            new LinkedBlockingQueue&lt;Runnable&gt;(1000),</span></span>
<span class="line"><span>            new ThreadFactory() {</span></span>
<span class="line"><span>              @Override</span></span>
<span class="line"><span>              public Thread newThread(Runnable r) {</span></span>
<span class="line"><span>                return new Thread(r, &quot;xxl-job, admin JobTriggerPoolHelper-fastTriggerPool-&quot; + r.hashCode());</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>            });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    slowTriggerPool = new ThreadPoolExecutor(</span></span>
<span class="line"><span>            10,</span></span>
<span class="line"><span>            XxlJobAdminConfig.getAdminConfig().getTriggerPoolSlowMax(),</span></span>
<span class="line"><span>            60L,</span></span>
<span class="line"><span>            TimeUnit.SECONDS,</span></span>
<span class="line"><span>            new LinkedBlockingQueue&lt;Runnable&gt;(2000),</span></span>
<span class="line"><span>            new ThreadFactory() {</span></span>
<span class="line"><span>              @Override</span></span>
<span class="line"><span>              public Thread newThread(Runnable r) {</span></span>
<span class="line"><span>                return new Thread(r, &quot;xxl-job, admin JobTriggerPoolHelper-slowTriggerPool-&quot; + r.hashCode());</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>            });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br></div></div><p>fastTriggerPool为快速线程池、slowTriggerPool为慢速线程池，都是采用阻塞队列LinkedBlockingQueue，快速线程池的阻塞队列大小为1000，慢速线程池的阻塞队列大小为2000。快速线程池、慢速线程池在什么时候被用来调度任务呢？默认是用快速调度器调度任务的，当缓存中等待被调度的同一个任务的数量大于10的时候，就用慢速调度器调度任务。而这两个线程池的最大线程数是由XxlJobAdminConfig.getAdminConfig()决定的，我们看看这两个配置。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Component</span></span>
<span class="line"><span>public class XxlJobAdminConfig implements InitializingBean, DisposableBean {</span></span>
<span class="line"><span>  @Value(&quot;\${xxl.job.triggerpool.fast.max}&quot;)</span></span>
<span class="line"><span>  private int triggerPoolFastMax;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Value(&quot;\${xxl.job.triggerpool.slow.max}&quot;)</span></span>
<span class="line"><span>  private int triggerPoolSlowMax;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 快线程池的线程数最小是200</span></span>
<span class="line"><span>  public int getTriggerPoolFastMax() {</span></span>
<span class="line"><span>    if (triggerPoolFastMax &lt; 200) {</span></span>
<span class="line"><span>      return 200;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return triggerPoolFastMax;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 慢线程池的线程数最小是100</span></span>
<span class="line"><span>  public int getTriggerPoolSlowMax() {</span></span>
<span class="line"><span>    if (triggerPoolSlowMax &lt; 100) {</span></span>
<span class="line"><span>      return 100;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return triggerPoolSlowMax;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>这两个配置就是在application.properties中定义的，默认配置如下：</p><div class="language-application.properties vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>## xxl-job, triggerpool max size</span></span>
<span class="line"><span>xxl.job.triggerpool.fast.max=200</span></span>
<span class="line"><span>xxl.job.triggerpool.slow.max=100</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h2 id="注册中心监控线程启动" tabindex="-1">注册中心监控线程启动 <a class="header-anchor" href="#注册中心监控线程启动" aria-label="Permalink to &quot;注册中心监控线程启动&quot;">​</a></h2><p>JobRegistryHelper.getInstance().start()就是调度了JobRegistryHelper#start方法</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobRegistryHelper {</span></span>
<span class="line"><span>  private static JobRegistryHelper instance = new JobRegistryHelper();</span></span>
<span class="line"><span>	public static JobRegistryHelper getInstance(){</span></span>
<span class="line"><span>		return instance;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>JobRegistryHelper#start创建了一个线程是跟一个守护线程，先看线程池。</p><div class="language-JobRegistryHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobRegistryHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobRegistryHelper {</span></span>
<span class="line"><span>  public void start() {</span></span>
<span class="line"><span>    // for registry or remove</span></span>
<span class="line"><span>    registryOrRemoveThreadPool = new ThreadPoolExecutor(</span></span>
<span class="line"><span>            2,</span></span>
<span class="line"><span>            10,</span></span>
<span class="line"><span>            30L,</span></span>
<span class="line"><span>            TimeUnit.SECONDS,</span></span>
<span class="line"><span>            new LinkedBlockingQueue&lt;Runnable&gt;(2000),</span></span>
<span class="line"><span>            new ThreadFactory() {</span></span>
<span class="line"><span>              @Override</span></span>
<span class="line"><span>              public Thread newThread(Runnable r) {</span></span>
<span class="line"><span>                return new Thread(r, &quot;xxl-job, admin JobRegistryMonitorHelper-registryOrRemoveThreadPool-&quot; + r.hashCode());</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>            },</span></span>
<span class="line"><span>            new RejectedExecutionHandler() {</span></span>
<span class="line"><span>              @Override</span></span>
<span class="line"><span>              public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {</span></span>
<span class="line"><span>                r.run();</span></span>
<span class="line"><span>                logger.warn(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, registry or remove too fast, match threadpool rejected handler(run now).&quot;);</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>            });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>看注释可以看出来是处理执行器的注册跟注册移除的。接下来查看守护线程。</p><div class="language-JobRegistryHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobRegistryHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobRegistryHelper {</span></span>
<span class="line"><span>  public void start() {</span></span>
<span class="line"><span>    // for monitor</span></span>
<span class="line"><span>    // 创建一个守护线程 registryMonitorThread</span></span>
<span class="line"><span>    registryMonitorThread = new Thread(new Runnable() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span>        // 每30S执行一次</span></span>
<span class="line"><span>        while (!toStop) {</span></span>
<span class="line"><span>          try {</span></span>
<span class="line"><span>            // auto registry group</span></span>
<span class="line"><span>            // 查询执行器地址类型是自动注册的执行器信息表</span></span>
<span class="line"><span>            List&lt;XxlJobGroup&gt; groupList = XxlJobAdminConfig.getAdminConfig().getXxlJobGroupDao().findByAddressType(0);</span></span>
<span class="line"><span>            if (groupList!=null &amp;&amp; !groupList.isEmpty()) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>              // remove dead address (admin/executor)</span></span>
<span class="line"><span>              // 查找xxl_job_registry表中超时了90秒的注册信息</span></span>
<span class="line"><span>              List&lt;Integer&gt; ids = XxlJobAdminConfig.getAdminConfig().getXxlJobRegistryDao().findDead(RegistryConfig.DEAD_TIMEOUT, new Date());</span></span>
<span class="line"><span>              // 如果超时 ids 集合不为空，则直接删除这些数据</span></span>
<span class="line"><span>              if (ids!=null &amp;&amp; ids.size()&gt;0) {</span></span>
<span class="line"><span>                XxlJobAdminConfig.getAdminConfig().getXxlJobRegistryDao().removeDead(ids);</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>              // fresh online address (admin/executor)</span></span>
<span class="line"><span>              // 查询所有未过期的注册信息，将注册类型为EXECUTOR的XxlJobRegistry集合改装成appname=&gt;设置触发器的ip地址</span></span>
<span class="line"><span>              HashMap&lt;String, List&lt;String&gt;&gt; appAddressMap = new HashMap&lt;String, List&lt;String&gt;&gt;();</span></span>
<span class="line"><span>              List&lt;XxlJobRegistry&gt; list = XxlJobAdminConfig.getAdminConfig().getXxlJobRegistryDao().findAll(RegistryConfig.DEAD_TIMEOUT, new Date());</span></span>
<span class="line"><span>              if (list != null) {</span></span>
<span class="line"><span>                for (XxlJobRegistry item: list) {</span></span>
<span class="line"><span>                  if (RegistryConfig.RegistType.EXECUTOR.name().equals(item.getRegistryGroup())) {</span></span>
<span class="line"><span>                    String appname = item.getRegistryKey();</span></span>
<span class="line"><span>                    List&lt;String&gt; registryList = appAddressMap.get(appname);</span></span>
<span class="line"><span>                    if (registryList == null) {</span></span>
<span class="line"><span>                      registryList = new ArrayList&lt;String&gt;();</span></span>
<span class="line"><span>                    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                    if (!registryList.contains(item.getRegistryValue())) {</span></span>
<span class="line"><span>                      registryList.add(item.getRegistryValue());</span></span>
<span class="line"><span>                    }</span></span>
<span class="line"><span>                    appAddressMap.put(appname, registryList);</span></span>
<span class="line"><span>                  }</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>              // fresh group address</span></span>
<span class="line"><span>              for (XxlJobGroup group: groupList) {</span></span>
<span class="line"><span>                List&lt;String&gt; registryList = appAddressMap.get(group.getAppname());</span></span>
<span class="line"><span>                String addressListStr = null;</span></span>
<span class="line"><span>                if (registryList!=null &amp;&amp; !registryList.isEmpty()) {</span></span>
<span class="line"><span>                  Collections.sort(registryList);</span></span>
<span class="line"><span>                  StringBuilder addressListSB = new StringBuilder();</span></span>
<span class="line"><span>                  for (String item:registryList) {</span></span>
<span class="line"><span>                    addressListSB.append(item).append(&quot;,&quot;);</span></span>
<span class="line"><span>                  }</span></span>
<span class="line"><span>                  addressListStr = addressListSB.toString();</span></span>
<span class="line"><span>                  addressListStr = addressListStr.substring(0, addressListStr.length()-1);</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                group.setAddressList(addressListStr);</span></span>
<span class="line"><span>                group.setUpdateTime(new Date());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                XxlJobAdminConfig.getAdminConfig().getXxlJobGroupDao().update(group);</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>          } catch (Exception e) {</span></span>
<span class="line"><span>            if (!toStop) {</span></span>
<span class="line"><span>              logger.error(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, job registry monitor thread error:{}&quot;, e);</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>          try {</span></span>
<span class="line"><span>            // public static final int BEAT_TIMEOUT = 30;</span></span>
<span class="line"><span>            TimeUnit.SECONDS.sleep(RegistryConfig.BEAT_TIMEOUT);</span></span>
<span class="line"><span>          } catch (InterruptedException e) {</span></span>
<span class="line"><span>            if (!toStop) {</span></span>
<span class="line"><span>              logger.error(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, job registry monitor thread error:{}&quot;, e);</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        logger.info(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, job registry monitor thread stop&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    registryMonitorThread.setDaemon(true);</span></span>
<span class="line"><span>    registryMonitorThread.setName(&quot;xxl-job, admin JobRegistryMonitorHelper-registryMonitorThread&quot;);</span></span>
<span class="line"><span>    registryMonitorThread.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br></div></div><p>注册监控器线程registryMonitorThread，调度任务注册线程池用来执行调度任务的注册，注册监控器线程用来监控执行器的机器是否下线。然后将registryMonitorThread设置为守护线程，最后启动registryMonitorThread线程，开始监控执行器的机器。</p><p>registryMonitorThread的run()方法一直执行，直到服务停止，主要做了两件事，第一将已经下线的执行器的记录从数据库中删除，第二将还在线的执行器机器记录重新设置执行器地址以及更新执行器的时间，然后更新数据库的记录。怎么判定执行器已经下线了？如果数据库中的update_time字段小于当前时间减去死亡期限，那么说明已经执行器在死亡期限没有进行更新时间，就判定已经下线了。执行器在启动的时候，会启动一个执行器线程不断的执行注册任务，执行器任务会更新update_time字段。</p><h2 id="失败监控器启动" tabindex="-1">失败监控器启动 <a class="header-anchor" href="#失败监控器启动" aria-label="Permalink to &quot;失败监控器启动&quot;">​</a></h2><p>接下来看JobFailMonitorHelper.getInstance().start()方法。</p><div class="language-JobFailMonitorHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobFailMonitorHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobFailMonitorHelper {</span></span>
<span class="line"><span>  public void start(){</span></span>
<span class="line"><span>    monitorThread = new Thread(new Runnable() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // monitor</span></span>
<span class="line"><span>        // 每10ms执行一次</span></span>
<span class="line"><span>        while (!toStop) {</span></span>
<span class="line"><span>          try {</span></span>
<span class="line"><span>            // 找到1000个失败的日志</span></span>
<span class="line"><span>            List&lt;Long&gt; failLogIds = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().findFailJobLogIds(1000);</span></span>
<span class="line"><span>            if (failLogIds!=null &amp;&amp; !failLogIds.isEmpty()) {</span></span>
<span class="line"><span>              for (long failLogId: failLogIds) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                // lock log</span></span>
<span class="line"><span>                // 更新日志告警状态，由0变成-1</span></span>
<span class="line"><span>                // 告警状态：0-默认、-1=锁定状态、1-无需告警、2-告警成功、3-告警失败</span></span>
<span class="line"><span>                int lockRet = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().updateAlarmStatus(failLogId, 0, -1);</span></span>
<span class="line"><span>                if (lockRet &lt; 1) {</span></span>
<span class="line"><span>                  // 更新失败</span></span>
<span class="line"><span>                  continue;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                // 查找失败日志</span></span>
<span class="line"><span>                XxlJobLog log = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().load(failLogId);</span></span>
<span class="line"><span>                // 根据失败日志查找任务</span></span>
<span class="line"><span>                XxlJobInfo info = XxlJobAdminConfig.getAdminConfig().getXxlJobInfoDao().loadById(log.getJobId());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                // 1、fail retry monitor</span></span>
<span class="line"><span>                // 失败重试次数大于0</span></span>
<span class="line"><span>                if (log.getExecutorFailRetryCount() &gt; 0) {</span></span>
<span class="line"><span>                  // 开始调度任务</span></span>
<span class="line"><span>                  JobTriggerPoolHelper.trigger(log.getJobId(), TriggerTypeEnum.RETRY, (log.getExecutorFailRetryCount()-1), log.getExecutorShardingParam(), log.getExecutorParam(), null);</span></span>
<span class="line"><span>                  String retryMsg = &quot;&lt;br&gt;&lt;br&gt;&lt;span style=\\&quot;color:#F39C12;\\&quot; &gt; &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&quot;+ I18nUtil.getString(&quot;jobconf_trigger_type_retry&quot;) +&quot;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt; &lt;/span&gt;&lt;br&gt;&quot;;</span></span>
<span class="line"><span>                  log.setTriggerMsg(log.getTriggerMsg() + retryMsg);</span></span>
<span class="line"><span>                  // 记录重试日志</span></span>
<span class="line"><span>                  XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().updateTriggerInfo(log);</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                // 2、fail alarm monitor</span></span>
<span class="line"><span>                int newAlarmStatus = 0;		// 告警状态：0-默认、-1=锁定状态、1-无需告警、2-告警成功、3-告警失败</span></span>
<span class="line"><span>                if (info != null) {</span></span>
<span class="line"><span>                  // 发送告警信息</span></span>
<span class="line"><span>                  boolean alarmResult = XxlJobAdminConfig.getAdminConfig().getJobAlarmer().alarm(info, log);</span></span>
<span class="line"><span>                  newAlarmStatus = alarmResult?2:3;</span></span>
<span class="line"><span>                } else {</span></span>
<span class="line"><span>                  // 如果任务不存在，无需告警</span></span>
<span class="line"><span>                  newAlarmStatus = 1;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                // 更新告警状态</span></span>
<span class="line"><span>                XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().updateAlarmStatus(failLogId, -1, newAlarmStatus);</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          } catch (Exception e) {</span></span>
<span class="line"><span>            if (!toStop) {</span></span>
<span class="line"><span>              logger.error(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, job fail monitor thread error:{}&quot;, e);</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          try {</span></span>
<span class="line"><span>              TimeUnit.SECONDS.sleep(10);</span></span>
<span class="line"><span>          } catch (Exception e) {</span></span>
<span class="line"><span>              if (!toStop) {</span></span>
<span class="line"><span>                  logger.error(e.getMessage(), e);</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        logger.info(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, job fail monitor thread stop&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    monitorThread.setDaemon(true);</span></span>
<span class="line"><span>    monitorThread.setName(&quot;xxl-job, admin JobFailMonitorHelper&quot;);</span></span>
<span class="line"><span>    monitorThread.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br></div></div><p>run方法一直运行，直到线程停止。run方法的首先从数据库中获取失败的调度任务日志列表，每次最多一千条。遍历失败的调度任务日志列表，首先将失败的调度任务日志进行锁定，暂停给告警邮件发送告警信息。如果调度任务的失败重试次数大于0，触发任务执行，更新任务日志信息。当邮件不为空时，触发告警信息，最后将锁定的日志状态更新为告警状态。</p><h2 id="丢失监控器启动" tabindex="-1">丢失监控器启动 <a class="header-anchor" href="#丢失监控器启动" aria-label="Permalink to &quot;丢失监控器启动&quot;">​</a></h2><p>接下来查看JobCompleteHelper.getInstance().start()方法。这个方法声明了一个线程池和一个守护线程，我们先来看线程池的配置。</p><div class="language-JobCompleteHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobCompleteHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobCompleteHelper {</span></span>
<span class="line"><span>  public void start(){</span></span>
<span class="line"><span>    // for callback</span></span>
<span class="line"><span>    callbackThreadPool = new ThreadPoolExecutor(</span></span>
<span class="line"><span>        2,</span></span>
<span class="line"><span>        20,</span></span>
<span class="line"><span>        30L,</span></span>
<span class="line"><span>        TimeUnit.SECONDS,</span></span>
<span class="line"><span>        new LinkedBlockingQueue&lt;Runnable&gt;(3000),</span></span>
<span class="line"><span>        new ThreadFactory() {</span></span>
<span class="line"><span>          @Override</span></span>
<span class="line"><span>          public Thread newThread(Runnable r) {</span></span>
<span class="line"><span>            return new Thread(r, &quot;xxl-job, admin JobLosedMonitorHelper-callbackThreadPool-&quot; + r.hashCode());</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        },</span></span>
<span class="line"><span>        new RejectedExecutionHandler() {</span></span>
<span class="line"><span>          @Override</span></span>
<span class="line"><span>          public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {</span></span>
<span class="line"><span>            r.run();</span></span>
<span class="line"><span>            logger.warn(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, callback too fast, match threadpool rejected handler(run now).&quot;);</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // ---------------------- helper ----------------------</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; callback(List&lt;HandleCallbackParam&gt; callbackParamList) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    callbackThreadPool.execute(new Runnable() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span>        for (HandleCallbackParam handleCallbackParam: callbackParamList) {</span></span>
<span class="line"><span>          ReturnT&lt;String&gt; callbackResult = callback(handleCallbackParam);</span></span>
<span class="line"><span>          logger.debug(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; JobApiController.callback {}, handleCallbackParam={}, callbackResult={}&quot;,</span></span>
<span class="line"><span>              (callbackResult.getCode()== ReturnT.SUCCESS_CODE?&quot;success&quot;:&quot;fail&quot;), handleCallbackParam, callbackResult);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return ReturnT.SUCCESS;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br></div></div><p>这个线程池是用来处理日志回调服务的，即“执行器”在接收到任务执行请求后，执行任务，在执行结束之后会将执行结果回调通知“调度中心”, 执行器调用/api/callback就会调用该线程池, 具体看接口处理流程，这里不细说。接下来看守护线程。</p><div class="language-JobCompleteHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobCompleteHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobCompleteHelper {</span></span>
<span class="line"><span>  public void start() {</span></span>
<span class="line"><span>    // for monitor</span></span>
<span class="line"><span>    monitorThread = new Thread(new Runnable() {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // wait for JobTriggerPoolHelper-init, 休眠50ms</span></span>
<span class="line"><span>        TimeUnit.MILLISECONDS.sleep(50);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        // monitor</span></span>
<span class="line"><span>        while (!toStop) {</span></span>
<span class="line"><span>          try {</span></span>
<span class="line"><span>            // 任务结果丢失处理：调度记录停留在 &quot;运行中&quot; 状态超过10min，且对应执行器心跳注册失败不在线，则将本地调度主动标记失败；</span></span>
<span class="line"><span>            Date losedTime = DateUtil.addMinutes(new Date(), -10);</span></span>
<span class="line"><span>            List&lt;Long&gt; losedJobIds  = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().findLostJobIds(losedTime);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            if (losedJobIds!=null &amp;&amp; losedJobIds.size()&gt;0) {</span></span>
<span class="line"><span>              for (Long logId: losedJobIds) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                XxlJobLog jobLog = new XxlJobLog();</span></span>
<span class="line"><span>                jobLog.setId(logId);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                jobLog.setHandleTime(new Date());</span></span>
<span class="line"><span>                // 更新为失败状态</span></span>
<span class="line"><span>                jobLog.setHandleCode(ReturnT.FAIL_CODE);</span></span>
<span class="line"><span>                jobLog.setHandleMsg( I18nUtil.getString(&quot;joblog_lost_fail&quot;) );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                XxlJobCompleter.updateHandleInfoAndFinish(jobLog);</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>          // 休眠60S</span></span>
<span class="line"><span>          TimeUnit.SECONDS.sleep(60);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    monitorThread.setDaemon(true);</span></span>
<span class="line"><span>    monitorThread.setName(&quot;xxl-job, admin JobLosedMonitorHelper&quot;);</span></span>
<span class="line"><span>    monitorThread.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br></div></div><p>monitorThread就是每分钟扫描一下调度记录，如果调度记录运行中状态超时且执行器不在线，则标记为失败状态。</p><h2 id="日志任务启动" tabindex="-1">日志任务启动 <a class="header-anchor" href="#日志任务启动" aria-label="Permalink to &quot;日志任务启动&quot;">​</a></h2><p>JobLogReportHelper.getInstance().start()是一个清除日志服务，对过期的日志任务进行清除。</p><div class="language-JobLogReportHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobLogReportHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobLogReportHelper {</span></span>
<span class="line"><span>  public void start(){</span></span>
<span class="line"><span>    logrThread = new Thread(new Runnable() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span>        // last clean log time</span></span>
<span class="line"><span>        long lastCleanLogTime = 0;</span></span>
<span class="line"><span>        while (!toStop) {</span></span>
<span class="line"><span>          // 1、log-report refresh: refresh log report in 3 days</span></span>
<span class="line"><span>          // 更新日志运行报告，包括执行时间，运行中的任务数，成功数，失败数等</span></span>
<span class="line"><span>          try {</span></span>
<span class="line"><span>            for (int i = 0; i &lt; 3; i++) {</span></span>
<span class="line"><span>              // today</span></span>
<span class="line"><span>              ...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>              // refresh log-report every minute</span></span>
<span class="line"><span>              XxlJobLogReport xxlJobLogReport = new XxlJobLogReport();</span></span>
<span class="line"><span>              xxlJobLogReport.setTriggerDay(todayFrom);</span></span>
<span class="line"><span>              xxlJobLogReport.setRunningCount(0);</span></span>
<span class="line"><span>              xxlJobLogReport.setSucCount(0);</span></span>
<span class="line"><span>              xxlJobLogReport.setFailCount(0);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>              Map&lt;String, Object&gt; triggerCountMap = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().findLogReport(todayFrom, todayTo);</span></span>
<span class="line"><span>              if (triggerCountMap!=null &amp;&amp; triggerCountMap.size()&gt;0) {</span></span>
<span class="line"><span>                  int triggerDayCount = triggerCountMap.containsKey(&quot;triggerDayCount&quot;)?Integer.valueOf(String.valueOf(triggerCountMap.get(&quot;triggerDayCount&quot;))):0;</span></span>
<span class="line"><span>                  int triggerDayCountRunning = triggerCountMap.containsKey(&quot;triggerDayCountRunning&quot;)?Integer.valueOf(String.valueOf(triggerCountMap.get(&quot;triggerDayCountRunning&quot;))):0;</span></span>
<span class="line"><span>                  int triggerDayCountSuc = triggerCountMap.containsKey(&quot;triggerDayCountSuc&quot;)?Integer.valueOf(String.valueOf(triggerCountMap.get(&quot;triggerDayCountSuc&quot;))):0;</span></span>
<span class="line"><span>                  int triggerDayCountFail = triggerDayCount - triggerDayCountRunning - triggerDayCountSuc;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                  xxlJobLogReport.setRunningCount(triggerDayCountRunning);</span></span>
<span class="line"><span>                  xxlJobLogReport.setSucCount(triggerDayCountSuc);</span></span>
<span class="line"><span>                  xxlJobLogReport.setFailCount(triggerDayCountFail);</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>              // do refresh</span></span>
<span class="line"><span>              int ret = XxlJobAdminConfig.getAdminConfig().getXxlJobLogReportDao().update(xxlJobLogReport);</span></span>
<span class="line"><span>              if (ret &lt; 1) {</span></span>
<span class="line"><span>                  XxlJobAdminConfig.getAdminConfig().getXxlJobLogReportDao().save(xxlJobLogReport);</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          } catch (Exception e) {</span></span>
<span class="line"><span>              if (!toStop) {</span></span>
<span class="line"><span>                  logger.error(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, job log report thread error:{}&quot;, e);</span></span>
<span class="line"><span>              }</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // 2、log-clean: switch open &amp; once each day</span></span>
<span class="line"><span>          // 清除过期日志，如果上次日志清除的时间到现在大于24小时</span></span>
<span class="line"><span>          if (XxlJobAdminConfig.getAdminConfig().getLogretentiondays()&gt;0</span></span>
<span class="line"><span>                  &amp;&amp; System.currentTimeMillis() - lastCleanLogTime &gt; 24*60*60*1000) {</span></span>
<span class="line"><span>            // expire-time</span></span>
<span class="line"><span>            Calendar expiredDay = Calendar.getInstance();</span></span>
<span class="line"><span>            expiredDay.add(Calendar.DAY_OF_MONTH, -1 * XxlJobAdminConfig.getAdminConfig().getLogretentiondays());</span></span>
<span class="line"><span>            expiredDay.set(Calendar.HOUR_OF_DAY, 0);</span></span>
<span class="line"><span>            expiredDay.set(Calendar.MINUTE, 0);</span></span>
<span class="line"><span>            expiredDay.set(Calendar.SECOND, 0);</span></span>
<span class="line"><span>            expiredDay.set(Calendar.MILLISECOND, 0);</span></span>
<span class="line"><span>            Date clearBeforeTime = expiredDay.getTime();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            // clean expired log</span></span>
<span class="line"><span>            List&lt;Long&gt; logIds = null;</span></span>
<span class="line"><span>            do {</span></span>
<span class="line"><span>                logIds = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().findClearLogIds(0, 0, clearBeforeTime, 0, 1000);</span></span>
<span class="line"><span>                if (logIds!=null &amp;&amp; logIds.size()&gt;0) {</span></span>
<span class="line"><span>                    XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().clearLog(logIds);</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            } while (logIds!=null &amp;&amp; logIds.size()&gt;0);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            // update clean time</span></span>
<span class="line"><span>            lastCleanLogTime = System.currentTimeMillis();</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>          // 休眠1分钟</span></span>
<span class="line"><span>          TimeUnit.MINUTES.sleep(1);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        logger.info(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, job log report thread stop&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>    logrThread.setDaemon(true);</span></span>
<span class="line"><span>    logrThread.setName(&quot;xxl-job, admin JobLogReportHelper&quot;);</span></span>
<span class="line"><span>    logrThread.start();</span></span>
<span class="line"><span>  }  </span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br></div></div><h2 id="jobschedule调度器启动" tabindex="-1">JobSchedule调度器启动 <a class="header-anchor" href="#jobschedule调度器启动" aria-label="Permalink to &quot;JobSchedule调度器启动&quot;">​</a></h2><p>JobScheduleHelper.getInstance().start()，这个方法比较核心，下一篇文章讲解。</p>`,50)]))}const g=s(l,[["render",r]]);export{m as __pageData,g as default};
