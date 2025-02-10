import{_ as s,c as a,a0 as e,o as p}from"./chunks/framework.P9qPzDnn.js";const r="/assets/rocketmq-cluster-nameserver.Cuk96db5.png",l="/assets/route-info-manager.Qru6LWh3.png",i="/assets/nameserver-route-info.BWxSF8wu.png",v=JSON.parse('{"title":"NameServer初始化流程与路由","description":"","frontmatter":{},"headers":[],"relativePath":"rocketmq/nameserver.md","filePath":"rocketmq/nameserver.md"}'),t={name:"rocketmq/nameserver.md"};function o(c,n,b,u,m,d){return p(),a("div",null,n[0]||(n[0]=[e('<h1 id="nameserver初始化流程与路由" tabindex="-1">NameServer初始化流程与路由 <a class="header-anchor" href="#nameserver初始化流程与路由" aria-label="Permalink to &quot;NameServer初始化流程与路由&quot;">​</a></h1><p><img src="'+r+`" alt="rocketmq-cluster-nameserver"></p><p>前面提到NameServer就相当于Rockermq集群中的注册中心，用来存储RocketMq集群中所有的Broker服务器地址列表，具体的流程如下所示:</p><ul><li>Broker消息服务器在启动时会向所有的NameServer注册自己的信息，然后生产者和消费者从NameServer中获取Broker的信息。</li><li>NameServer跟每一台Broker保持长连接，并间隔30s检查Broker是否存活，如果检测到Broker宕机，则从路由注册表中将其移除。</li></ul><p>路由变化不会马上通知到消息生产者，而是会在生产者实际发送信息的时候利用容错机制实现消息发送的高可用性。</p><p>为了保证NameServer设计的简单，NameServer之间不共享信息，互不通信，所以NameServer之间的路由信息有可能是不一致的。</p><h2 id="nameserver入口代码分析" tabindex="-1">NameServer入口代码分析 <a class="header-anchor" href="#nameserver入口代码分析" aria-label="Permalink to &quot;NameServer入口代码分析&quot;">​</a></h2><p>NameServer的启动类是NamesrvStartup，我们直接看这个类的入口函数。</p><div class="language-NamesrvStartup vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvStartup</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class NamesrvStartup {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    // 主处理函数</span></span>
<span class="line"><span>    main0(args);</span></span>
<span class="line"><span>    // controllerManager相关</span></span>
<span class="line"><span>    controllerManagerMain();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  public static NamesrvController main0(String[] args) {</span></span>
<span class="line"><span>    // 解析nameserver的配置</span></span>
<span class="line"><span>    parseCommandlineAndConfigFile(args);</span></span>
<span class="line"><span>    // 创建和启动nameserver服务器</span></span>
<span class="line"><span>    createAndStartNamesrvController();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  public static ControllerManager controllerManagerMain() {</span></span>
<span class="line"><span>    // 如果isEnableControllerInNamesrv, 创建和启动ControllerManager</span></span>
<span class="line"><span>    if (namesrvConfig.isEnableControllerInNamesrv()) {</span></span>
<span class="line"><span>      return createAndStartControllerManager();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>可以看到主要做了两件事情，具体如下：</p><ul><li>解析配置文件，并且创建和启动Nameserver服务器</li><li>如果配置了主备自动切换模式，就调用createAndStartControllerManager，点击<a href="https://rocketmq.apache.org/zh/docs/deploymentOperations/03autofailover/" target="_blank" rel="noreferrer">此处</a>了解</li></ul><h2 id="解析nameserver配置" tabindex="-1">解析nameserver配置 <a class="header-anchor" href="#解析nameserver配置" aria-label="Permalink to &quot;解析nameserver配置&quot;">​</a></h2><p>我们先来看看parseCommandlineAndConfigFile解析nameServ配置的流程，具体代码如下所示:</p><div class="language-NamesrvStartup vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvStartup</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public static void parseCommandlineAndConfigFile(String[] args) throws Exception {</span></span>
<span class="line"><span>  // 设置系统环境变量 rocketmq.remoting.version=475</span></span>
<span class="line"><span>  System.setProperty(RemotingCommand.REMOTING_VERSION_KEY, Integer.toString(MQVersion.CURRENT_VERSION));</span></span>
<span class="line"><span>  // 解析命令行参数</span></span>
<span class="line"><span>  Options options = ServerUtil.buildCommandlineOptions(new Options());</span></span>
<span class="line"><span>  CommandLine commandLine = ServerUtil.parseCmdLine(&quot;mqnamesrv&quot;, args, buildCommandlineOptions(options), new DefaultParser());</span></span>
<span class="line"><span>  // 初始化NameServer, nettyServernettyClient和的配置</span></span>
<span class="line"><span>  namesrvConfig = new NamesrvConfig();</span></span>
<span class="line"><span>  nettyServerConfig = new NettyServerConfig();</span></span>
<span class="line"><span>  nettyClientConfig = new NettyClientConfig();</span></span>
<span class="line"><span>  // 指定监听端口为9876</span></span>
<span class="line"><span>  nettyServerConfig.setListenPort(9876);</span></span>
<span class="line"><span>  // 如果有配置文件，则将配置文件的属性解析出来</span></span>
<span class="line"><span>  if (commandLine.hasOption(&#39;c&#39;)) {</span></span>
<span class="line"><span>    String file = commandLine.getOptionValue(&#39;c&#39;);</span></span>
<span class="line"><span>    InputStream in = new BufferedInputStream(Files.newInputStream(Paths.get(file)));</span></span>
<span class="line"><span>    properties = new Properties();</span></span>
<span class="line"><span>    properties.load(in);</span></span>
<span class="line"><span>    // 解析配置文件的属性</span></span>
<span class="line"><span>    MixAll.properties2Object(properties, namesrvConfig);</span></span>
<span class="line"><span>    MixAll.properties2Object(properties, nettyServerConfig);</span></span>
<span class="line"><span>    MixAll.properties2Object(properties, nettyClientConfig);</span></span>
<span class="line"><span>    if (namesrvConfig.isEnableControllerInNamesrv()) {</span></span>
<span class="line"><span>      # 主备自动切换模式下的逻辑，后续单开一篇说明</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    namesrvConfig.setConfigStorePath(file);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 将命令行的参数写入到namesrvConfig中</span></span>
<span class="line"><span>  MixAll.properties2Object(ServerUtil.commandLine2Properties(commandLine), namesrvConfig);</span></span>
<span class="line"><span>  // 打印namesrvConfig配置和nettyServerConfig配置</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br></div></div><p>可以看到主要是是解析namesrvConfig，nettyServerConfig和nettyClientConfig这三个配置，优先级顺序：命令行参数 &gt; 配置文件参数 &gt; 默认参数。</p><p>nettyServerConfig和nettyClientConfig这两个配置Broker也会用到，到时单开一篇讲解，我们主要看一下nameserver提供了什么参数给我们配置。</p><p><strong>文件路径相关</strong></p><ul><li>rocketmqHome: RocketMQ主目录，通过系统属性ROCKETMQ_HOME_PROPERTY(JVM属性)或环境变量ROCKETMQ_HOME_ENV 获取</li><li>kvConfigPath: kv配置文件路径，包含顺序消息主题的配置信息, 默认用户主目录/namesrv/kvConfig.json</li><li>configStorePath: 存储NameServer的默认配置文件路径, 默认为用户主目录/namesrv/namesrv.properties</li></ul><p><strong>环境与模式</strong></p><ul><li>productEnvName: 定义当前运行环境的名称，默认值为&quot;center&quot;</li><li>clusterTest: 用于标识是否处于集群测试模式，默认值为false</li><li>orderMessageEnable: 是否支持顺序消息的发送，默认值为false</li><li>returnOrderTopicConfigToBroker: 是否将顺序主题的配置信息返回给Broker，默认值为true</li></ul><p><strong>线程池和任务队列</strong></p><ul><li>clientRequestThreadPoolNums: 用于处理客户端请求（如GET_ROUTEINTO_BY_TOPIC）的线程池大小，默认值为8</li><li>defaultThreadPoolNums: 用于处理Broker或operation请求的线程池大小，默认值为16</li><li>clientRequestThreadPoolQueueCapacity: 客户端请求线程池的任务队列容量，默认值为50000</li><li>defaultThreadPoolQueueCapacity: Broker或operation请求线程池的任务队列容量，默认值为10000</li></ul><p><strong>心跳与超时相关</strong></p><ul><li>scanNotActiveBrokerInterval: 周期性扫描非活跃Broker的时间间隔，默认值为5000ms（5秒）</li><li>unRegisterBrokerQueueCapacity: 用于注销Broker的任务队列容量，默认值为3000</li></ul><p><strong>主从模式与高可用</strong></p><ul><li>supportActingMaster: 是否支持“代理主节点”模式, 当主节点不可用时，Slave节点可以作为代理主节点提供有限功能支持, 包括：消息队列锁定/解锁、查询偏移量、获取最早消息存储时间等, 默认为false</li></ul><p><strong>主题配置相关</strong></p><ul><li>enableAllTopicList: 是否启用所有主题列表的功能，默认值为true</li><li>enableTopicList: 是否启用主题列表功能，默认值为true</li><li>notifyMinBrokerIdChanged: 是否在Broker最小id发生变化时发送通知，默认值为false</li><li>enableControllerInNamesrv: 是否启用主备自动切换模式</li></ul><p><strong>服务等待相关</strong></p><ul><li>needWaitForService: 是否需要等待服务启动完成，默认值为false</li><li>waitSecondsForService: 等待服务启动完成的时间（秒），默认值为45秒</li></ul><p><strong>主题注册与删除相关</strong></p><ul><li>deleteTopicWithBrokerRegistration: 是否在Broker注册时删除不存在于注册信息中的主题, 同时启用此标志和Broker配置中的enableSingleTopicRegister以避免意外丢失主题路由信息, 不支持静态主题，默认值为false</li></ul><p><strong>配置黑名单</strong></p><ul><li>configBlackList: 配置更新的黑名单，黑名单中的配置不能通过命令更新，必须通过重启进程更新。默认值：configBlackList;configStorePath;kvConfigPath</li></ul><h2 id="namesrvcontroller的创建" tabindex="-1">NamesrvController的创建 <a class="header-anchor" href="#namesrvcontroller的创建" aria-label="Permalink to &quot;NamesrvController的创建&quot;">​</a></h2><p>接下来我们就进入createAndStartNamesrvController这个方法查看，代码如下:</p><div class="language-NamesrvStartup vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvStartup</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public static NamesrvController createAndStartNamesrvController() throws Exception {</span></span>
<span class="line"><span>  // 创建命名服务控制器</span></span>
<span class="line"><span>  NamesrvController controller = createNamesrvController();</span></span>
<span class="line"><span>  // 启动控制器</span></span>
<span class="line"><span>  start(controller);</span></span>
<span class="line"><span>  // 打印NettyServer的信息</span></span>
<span class="line"><span>  NettyServerConfig serverConfig = controller.getNettyServerConfig();</span></span>
<span class="line"><span>  String tip = String.format(&quot;The Name Server boot success. serializeType=%s, address %s:%d&quot;, RemotingCommand.getSerializeTypeConfigInThisServer(), serverConfig.getBindAddress(), serverConfig.getListenPort());</span></span>
<span class="line"><span>  return controller;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>可以看到核心就是createNamesrvController和start方法。</p><h3 id="createnamesrvcontroller" tabindex="-1">createNamesrvController <a class="header-anchor" href="#createnamesrvcontroller" aria-label="Permalink to &quot;createNamesrvController&quot;">​</a></h3><div class="language-NamesrvStartup vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvStartup</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public static NamesrvController createNamesrvController() {</span></span>
<span class="line"><span>  // 构建NamesrvController对象</span></span>
<span class="line"><span>  final NamesrvController controller = new NamesrvController(namesrvConfig, nettyServerConfig, nettyClientConfig);</span></span>
<span class="line"><span>  // 将properties，即配置文件的信息记录起来防止丢失</span></span>
<span class="line"><span>  controller.getConfiguration().registerConfig(properties);</span></span>
<span class="line"><span>  return controller;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>查看NamesrvController的构造方法，代码如下：</p><div class="language-NamesrvController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class NamesrvController {</span></span>
<span class="line"><span>  public NamesrvController(NamesrvConfig namesrvConfig, NettyServerConfig nettyServerConfig, NettyClientConfig nettyClientConfig) {</span></span>
<span class="line"><span>    this.namesrvConfig = namesrvConfig;</span></span>
<span class="line"><span>    this.nettyServerConfig = nettyServerConfig;</span></span>
<span class="line"><span>    this.nettyClientConfig = nettyClientConfig;</span></span>
<span class="line"><span>    this.kvConfigManager = new KVConfigManager(this);</span></span>
<span class="line"><span>    this.brokerHousekeepingService = new BrokerHousekeepingService(this);</span></span>
<span class="line"><span>    this.routeInfoManager = new RouteInfoManager(namesrvConfig, this);</span></span>
<span class="line"><span>    this.configuration = new Configuration(LOGGER, this.namesrvConfig, this.nettyServerConfig);</span></span>
<span class="line"><span>    // 根据namesrvConfig中的configStorePath属性设置配置文件的存储路径</span></span>
<span class="line"><span>    this.configuration.setStorePathFromConfig(this.namesrvConfig, &quot;configStorePath&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>下面这个表格简单介绍一下上面这些属性的作用。</p><table tabindex="0"><thead><tr><th>配置</th><th>功能</th><th>主要用途</th></tr></thead><tbody><tr><td>NamesrvConfig</td><td>NameServer 的核心配置项</td><td>初始化 NameServer 行为，如线程池、存储路径等</td></tr><tr><td>NettyServerConfig</td><td>配置 Netty 服务端参数</td><td>启动 Netty 服务，处理 Broker 和客户端的请求</td></tr><tr><td>NettyClientConfig</td><td>配置 Netty 客户端参数</td><td>NameServer 与其他组件通信时使用</td></tr><tr><td>kvConfigManager</td><td>管理动态 KV 配置</td><td>提供可修改、可持久化的动态配置管理功能</td></tr><tr><td>brokerHousekeepingService</td><td>维护 Broker 的状态</td><td>监控 Broker 状态，清理不活跃的 Broker 信息</td></tr><tr><td>routeInfoManager</td><td>管理路由信息</td><td>提供 Topic 和 Broker 的映射关系，支持客户端路由发现</td></tr><tr><td>configuration</td><td>管理和持久化 NameServer 的配置信息</td><td>统一配置管理，支持动态更新和持久化</td></tr></tbody></table><h3 id="createnamesrvcontroller-start" tabindex="-1">createNamesrvController#start <a class="header-anchor" href="#createnamesrvcontroller-start" aria-label="Permalink to &quot;createNamesrvController#start&quot;">​</a></h3><p>接下来我们看一下start方法的流程，代码如下所示：</p><div class="language-NamesrvStartup vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvStartup</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public static NamesrvController start(final NamesrvController controller) throws Exception {</span></span>
<span class="line"><span>  // 初始化NamesrvController</span></span>
<span class="line"><span>  boolean initResult = controller.initialize();</span></span>
<span class="line"><span>  // 配置JVM关闭钩子</span></span>
<span class="line"><span>  Runtime.getRuntime().addShutdownHook(new ShutdownHookThread(log, (Callable&lt;Void&gt;) () -&gt; {</span></span>
<span class="line"><span>    controller.shutdown();</span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  }));</span></span>
<span class="line"><span>  // 启动controller</span></span>
<span class="line"><span>  controller.start();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>JVM关闭钩子好理解，就是往JVM注册了一个钩子，JVM关闭的时候将controller关掉。</p><p>启动controller的逻辑也很简单，所以在这里先讲了。</p><div class="language-NamesrvController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void start() throws Exception {</span></span>
<span class="line"><span>  // 启动netty服务器</span></span>
<span class="line"><span>  this.remotingServer.start();</span></span>
<span class="line"><span>  // 在由操作系统选择可用端口的测试场景中，就是有些系统监听端口可能会变，将监听端口重新设置到nettyServerConfig</span></span>
<span class="line"><span>  if (0 == nettyServerConfig.getListenPort()) {</span></span>
<span class="line"><span>      nettyServerConfig.setListenPort(this.remotingServer.localListenPort());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 启动netty客户端</span></span>
<span class="line"><span>  this.remotingClient.updateNameServerAddressList(Collections.singletonList(NetworkUtil.getLocalAddress()</span></span>
<span class="line"><span>      + &quot;:&quot; + nettyServerConfig.getListenPort()));</span></span>
<span class="line"><span>  this.remotingClient.start();</span></span>
<span class="line"><span>  if (this.fileWatchService != null) {</span></span>
<span class="line"><span>      this.fileWatchService.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 启动路由管理服务</span></span>
<span class="line"><span>  this.routeInfoManager.start();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><h2 id="namesrvcontroller的初始化" tabindex="-1">NamesrvController的初始化 <a class="header-anchor" href="#namesrvcontroller的初始化" aria-label="Permalink to &quot;NamesrvController的初始化&quot;">​</a></h2><p>接下来我们就要进到controller#initialize方法了，查看具体的代码</p><div class="language-NamesrvController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public boolean initialize() {</span></span>
<span class="line"><span>  // 加载KV配置</span></span>
<span class="line"><span>  loadConfig();</span></span>
<span class="line"><span>  // 将remotingServer和remotingClient new出来</span></span>
<span class="line"><span>  initiateNetworkComponents();</span></span>
<span class="line"><span>  // 线程池，处理请求</span></span>
<span class="line"><span>  initiateThreadExecutors();</span></span>
<span class="line"><span>  // 注册处理器, 客户端的请求在这里处理</span></span>
<span class="line"><span>  registerProcessor();</span></span>
<span class="line"><span>  // 启动定时任务</span></span>
<span class="line"><span>  startScheduleService();</span></span>
<span class="line"><span>  // 初始化SSL配置</span></span>
<span class="line"><span>  initiateSslContext();</span></span>
<span class="line"><span>  // 初始化RPC hooks</span></span>
<span class="line"><span>  initiateRpcHooks();</span></span>
<span class="line"><span>  return true;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>我们先看一下initiateThreadExecutors初始化线程池的，就是根据之前namesrvConfig中线程池和任务队列相关的队列初始化线程池。</p><div class="language-NamesrvController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private void initiateThreadExecutors() {</span></span>
<span class="line"><span>  this.defaultThreadPoolQueue = new LinkedBlockingQueue&lt;&gt;(this.namesrvConfig.getDefaultThreadPoolQueueCapacity());</span></span>
<span class="line"><span>  this.defaultExecutor = ThreadUtils.newThreadPoolExecutor(this.namesrvConfig.getDefaultThreadPoolNums(), this.namesrvConfig.getDefaultThreadPoolNums(), 1000 * 60, TimeUnit.MILLISECONDS, this.defaultThreadPoolQueue, new ThreadFactoryImpl(&quot;RemotingExecutorThread_&quot;));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  this.clientRequestThreadPoolQueue = new LinkedBlockingQueue&lt;&gt;(this.namesrvConfig.getClientRequestThreadPoolQueueCapacity());</span></span>
<span class="line"><span>  this.clientRequestExecutor = ThreadUtils.newThreadPoolExecutor(this.namesrvConfig.getClientRequestThreadPoolNums(), this.namesrvConfig.getClientRequestThreadPoolNums(), 1000 * 60, TimeUnit.MILLISECONDS, this.clientRequestThreadPoolQueue, new ThreadFactoryImpl(&quot;ClientRequestExecutorThread_&quot;));</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><h2 id="namesrvcontroller定时任务" tabindex="-1">NamesrvController定时任务 <a class="header-anchor" href="#namesrvcontroller定时任务" aria-label="Permalink to &quot;NamesrvController定时任务&quot;">​</a></h2><p>接下来我们看NamesrvController的定时任务，主要有三个</p><div class="language-NamesrvController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private void startScheduleService() {</span></span>
<span class="line"><span>  // 每隔scanNotActiveBrokerInterval毫秒扫描一次Broker，默认为5000，移除不激活状态的broker</span></span>
<span class="line"><span>  this.scanExecutorService.scheduleAtFixedRate(NamesrvController.this.routeInfoManager::scanNotActiveBroker,</span></span>
<span class="line"><span>      5, this.namesrvConfig.getScanNotActiveBrokerInterval(), TimeUnit.MILLISECONDS);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 每隔10分打印一次kv配置</span></span>
<span class="line"><span>  this.scheduledExecutorService.scheduleAtFixedRate(NamesrvController.this.kvConfigManager::printAllPeriodically,</span></span>
<span class="line"><span>      1, 10, TimeUnit.MINUTES);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 每隔1S打印一次水印</span></span>
<span class="line"><span>  this.scheduledExecutorService.scheduleAtFixedRate(() -&gt; {</span></span>
<span class="line"><span>    NamesrvController.this.printWaterMark();</span></span>
<span class="line"><span>  }, 10, 1, TimeUnit.SECONDS);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><h2 id="路由注册和故障退出" tabindex="-1">路由注册和故障退出 <a class="header-anchor" href="#路由注册和故障退出" aria-label="Permalink to &quot;路由注册和故障退出&quot;">​</a></h2><p>NameServer主要作用是为消息生产者和消息消费者提供关于主题Topic的路由信息，那么NameServer需要存储路由的基础信息，还要能够管理Broker节点，包括路由注册跟路由剔除等功能。</p><h3 id="路由元信息" tabindex="-1">路由元信息 <a class="header-anchor" href="#路由元信息" aria-label="Permalink to &quot;路由元信息&quot;">​</a></h3><p>路由的元信息保存在RouteInfoManager这个类里面，我们先看看都有什么。</p><div class="language-RouteInfoManager vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">RouteInfoManager</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public RouteInfoManager(final NamesrvConfig namesrvConfig, NamesrvController namesrvController) {</span></span>
<span class="line"><span>  // 存储Topic和队列的映射关系，用于客户端路由发现</span></span>
<span class="line"><span>  this.topicQueueTable = new ConcurrentHashMap&lt;&gt;(1024);</span></span>
<span class="line"><span>  // 存储Broker名称与地址的映射关系，用于定位Broker地址</span></span>
<span class="line"><span>  this.brokerAddrTable = new ConcurrentHashMap&lt;&gt;(128);</span></span>
<span class="line"><span>  // 存储集群和 Broker 的对应关系，用于按集群管理 Broker</span></span>
<span class="line"><span>  this.clusterAddrTable = new ConcurrentHashMap&lt;&gt;(32);</span></span>
<span class="line"><span>  // 存储 Broker 的存活状态信息，用于心跳检测和状态管理</span></span>
<span class="line"><span>  this.brokerLiveTable = new ConcurrentHashMap&lt;&gt;(256);</span></span>
<span class="line"><span>  // 存储 FilterServer 信息，用于消息过滤</span></span>
<span class="line"><span>  this.filterServerTable = new ConcurrentHashMap&lt;&gt;(256);</span></span>
<span class="line"><span>  // 存储 Topic 队列的映射关系，用于分布式环境下的队列管理</span></span>
<span class="line"><span>  this.topicQueueMappingInfoTable = new ConcurrentHashMap&lt;&gt;(1024);</span></span>
<span class="line"><span>  // 管理 Broker 的批量注销，清理路由信息</span></span>
<span class="line"><span>  this.unRegisterService = new BatchUnregistrationService(this, namesrvConfig);</span></span>
<span class="line"><span>  this.namesrvConfig = namesrvConfig;</span></span>
<span class="line"><span>  this.namesrvController = namesrvController;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>下图是比较重要的几个对象的结构图。</p><img src="`+l+`" width="550" alt="route-info-manager"><h3 id="路由信息的注册" tabindex="-1">路由信息的注册 <a class="header-anchor" href="#路由信息的注册" aria-label="Permalink to &quot;路由信息的注册&quot;">​</a></h3><p>由于路由信息的注册是在Broker端执行的，这里讲一下Brokder端注册的代码，入口在BrokerController#start方法，里面定义了一个定时任务。</p><div class="language-BrokerController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">BrokerController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void start() throws Exception {</span></span>
<span class="line"><span>  if (!isIsolated &amp;&amp; !this.messageStoreConfig.isEnableDLegerCommitLog() &amp;&amp; !this.messageStoreConfig.isDuplicationEnable()) {</span></span>
<span class="line"><span>    this.registerBrokerAll(true, false, true);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  scheduledFutures.add(this.scheduledExecutorService.scheduleAtFixedRate(new AbstractBrokerRunnable(this.getBrokerIdentity()) {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run0() {</span></span>
<span class="line"><span>        BrokerController.this.registerBrokerAll(true, false, brokerConfig.isForceRegister());</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>  }, 1000 * 10, Math.max(10000, Math.min(brokerConfig.getRegisterNameServerPeriod(), 60000)), TimeUnit.MILLISECONDS));</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>Broker在启动的时候会向集群所有的NameServer发送心跳包，每隔30秒(可以配置)向集群所有的NameServer发送心跳包。可以搜一下代码，还有很多地方调用了registerBrokerAll这个方法，5.3.1版本有16处，能力有限，有些场景我也不清楚。</p><p>调用栈如下: registerBrokerAll -&gt; doRegisterBrokerAll -&gt; brokerOuterAPI#registerBrokerAll, 可以稍微看一下这个方法。</p><div class="language-brokerOuterAPI# vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">brokerOuterAPI#</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public List&lt;RegisterBrokerResult&gt; registerBrokerAll() {</span></span>
<span class="line"><span>  for (final String namesrvAddr : nameServerAddressList) {</span></span>
<span class="line"><span>    brokerOuterExecutor.execute(new AbstractBrokerRunnable(brokerIdentity) {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run0() {</span></span>
<span class="line"><span>        RegisterBrokerResult result = registerBroker(namesrvAddr, oneway, timeoutMills, requestHeader, body);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>NameServer收到请求之后，会执行RouteInfoManager#registerBroker方法。这个方法很长，一步一步来吧。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>this.lock.writeLock().lockInterruptibly();</span></span>
<span class="line"><span>//init or update the cluster info</span></span>
<span class="line"><span>Set&lt;String&gt; brokerNames = ConcurrentHashMapUtils.computeIfAbsent((ConcurrentHashMap&lt;String, Set&lt;String&gt;&gt;) this.clusterAddrTable, clusterName, k -&gt; new HashSet&lt;&gt;());</span></span>
<span class="line"><span>brokerNames.add(brokerName);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>先加上写锁，防止并发修改RouteInfoManager中的路由表。然后将brokerName加入到clusterAddrTable中。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>BrokerData brokerData = this.brokerAddrTable.get(brokerName);</span></span>
<span class="line"><span>if (null == brokerData) {</span></span>
<span class="line"><span>  registerFirst = true;</span></span>
<span class="line"><span>  brokerData = new BrokerData(clusterName, brokerName, new HashMap&lt;&gt;());</span></span>
<span class="line"><span>  this.brokerAddrTable.put(brokerName, brokerData);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>更新brokerAddrTable里面的的BrokerData信息。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>if (namesrvConfig.isDeleteTopicWithBrokerRegistration() &amp;&amp; topicQueueMappingInfoMap.isEmpty()) {</span></span>
<span class="line"><span>  final Set&lt;String&gt; oldTopicSet = topicSetOfBrokerName(brokerName);</span></span>
<span class="line"><span>  final Set&lt;String&gt; newTopicSet = tcTable.keySet();</span></span>
<span class="line"><span>  final Sets.SetView&lt;String&gt; toDeleteTopics = Sets.difference(oldTopicSet, newTopicSet);</span></span>
<span class="line"><span>  for (final String toDeleteTopic : toDeleteTopics) {</span></span>
<span class="line"><span>      Map&lt;String, QueueData&gt; queueDataMap = topicQueueTable.get(toDeleteTopic);</span></span>
<span class="line"><span>      final QueueData removedQD = queueDataMap.remove(brokerName);</span></span>
<span class="line"><span>      if (queueDataMap.isEmpty()) {</span></span>
<span class="line"><span>          log.info(&quot;deleteTopic, remove the topic all queue {}&quot;, toDeleteTopic);</span></span>
<span class="line"><span>          topicQueueTable.remove(toDeleteTopic);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>在动态管理Topic路由信息时，NameServer会根据Broker的上报信息动态调整路由配置。如果某些Topic不再由当前Broker提供服务，那么需要从NameServer的tcTable（通常表示Topic路由表，topicQueueTable）中移除这些不再存在的Topic，以避免客户端访问失效的路由信息。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>for (Map.Entry&lt;String, TopicConfig&gt; entry : tcTable.entrySet()) {</span></span>
<span class="line"><span>  if (registerFirst || this.isTopicConfigChanged(clusterName, brokerAddr,</span></span>
<span class="line"><span>    topicConfigWrapper.getDataVersion(), brokerName,</span></span>
<span class="line"><span>    entry.getValue().getTopicName())) {</span></span>
<span class="line"><span>    final TopicConfig topicConfig = entry.getValue();</span></span>
<span class="line"><span>    // In Slave Acting Master mode, Namesrv will regard the surviving Slave with the smallest brokerId as the &quot;agent&quot; Master, and modify the brokerPermission to read-only.</span></span>
<span class="line"><span>    if (isPrimeSlave &amp;&amp; brokerData.isEnableActingMaster()) {</span></span>
<span class="line"><span>      // Wipe write perm for prime slave</span></span>
<span class="line"><span>      topicConfig.setPerm(topicConfig.getPerm() &amp; (~PermName.PERM_WRITE));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.createAndUpdateQueueData(brokerName, topicConfig);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>如果是注册Broker或者Topic的配置改变了，就要创建或更新Topic的路由元数据，填充topicQueueTable，就是为默认主题自动注册理由信息，其中包含MixAll.DEFAULT_TOPIC的路由信息。当生产者发送Topic时，如果Topic还未创建并且BrokerConfig的autoCreateTopicEnable为true时，就会返回MixAll.DEFAULT_TOPIC的路由信息。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>if (this.isBrokerTopicConfigChanged(clusterName, brokerAddr, topicConfigWrapper.getDataVersion()) || registerFirst) {</span></span>
<span class="line"><span>  //the topicQueueMappingInfoMap should never be null, but can be empty</span></span>
<span class="line"><span>  for (Map.Entry&lt;String, TopicQueueMappingInfo&gt; entry : topicQueueMappingInfoMap.entrySet()) {</span></span>
<span class="line"><span>    if (!topicQueueMappingInfoTable.containsKey(entry.getKey())) {</span></span>
<span class="line"><span>        topicQueueMappingInfoTable.put(entry.getKey(), new HashMap&lt;&gt;());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //Note asset brokerName equal entry.getValue().getBname()</span></span>
<span class="line"><span>    //here use the mappingDetail.bname</span></span>
<span class="line"><span>    topicQueueMappingInfoTable.get(entry.getKey()).put(entry.getValue().getBname(), entry.getValue());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>如果Broker中的TopicConfig发生变化了，那么就要更新对应的topicQueueMappingInfoTable</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>BrokerAddrInfo brokerAddrInfo = new BrokerAddrInfo(clusterName, brokerAddr);</span></span>
<span class="line"><span>BrokerLiveInfo prevBrokerLiveInfo = this.brokerLiveTable.put(brokerAddrInfo,</span></span>
<span class="line"><span>        new BrokerLiveInfo(</span></span>
<span class="line"><span>                System.currentTimeMillis(),</span></span>
<span class="line"><span>                timeoutMillis == null ? DEFAULT_BROKER_CHANNEL_EXPIRED_TIME : timeoutMillis,</span></span>
<span class="line"><span>                topicConfigWrapper == null ? new DataVersion() : topicConfigWrapper.getDataVersion(),</span></span>
<span class="line"><span>                channel,</span></span>
<span class="line"><span>                haServerAddr));</span></span>
<span class="line"><span>if (null == prevBrokerLiveInfo) {</span></span>
<span class="line"><span>  log.info(&quot;new broker registered, {} HAService: {}&quot;, brokerAddrInfo, haServerAddr);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>更新brokerLiveTable的信息，包括Broker的存活时间和过期时间等</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>if (filterServerList != null) {</span></span>
<span class="line"><span>  if (filterServerList.isEmpty()) {</span></span>
<span class="line"><span>    this.filterServerTable.remove(brokerAddrInfo);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    this.filterServerTable.put(brokerAddrInfo, filterServerList);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>更新filterServerTable信息，注册Broker的过滤器Server地址列表，一个Broker上会关联多个FilterServer消息过滤服务器</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>if (MixAll.MASTER_ID != brokerId) {</span></span>
<span class="line"><span>  String masterAddr = brokerData.getBrokerAddrs().get(MixAll.MASTER_ID);</span></span>
<span class="line"><span>  if (masterAddr != null) {</span></span>
<span class="line"><span>    BrokerAddrInfo masterAddrInfo = new BrokerAddrInfo(clusterName, masterAddr);</span></span>
<span class="line"><span>    BrokerLiveInfo masterLiveInfo = this.brokerLiveTable.get(masterAddrInfo);</span></span>
<span class="line"><span>    if (masterLiveInfo != null) {</span></span>
<span class="line"><span>      result.setHaServerAddr(masterLiveInfo.getHaServerAddr());</span></span>
<span class="line"><span>      result.setMasterAddr(masterAddr);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>如果这个Broker是从节点，就要更新他的主节点信息更新对应的Addr信息</p><h3 id="路由故障退出" tabindex="-1">路由故障退出 <a class="header-anchor" href="#路由故障退出" aria-label="Permalink to &quot;路由故障退出&quot;">​</a></h3><p>Rocket有两个触发点会触发路由删除。</p><ul><li>NameServer会定时扫描brokerLiveTable中检测上次心跳包与当前系统时间的时间差，如果时间差大于timeoutMillis(默认120秒)，就会移除这个Broker</li><li>Broker在正常退出的时候，会执行unregistereBroker方法</li></ul><p>我们直接看第一种方式, 可以回看前面，定时任务的执行方法是routeInfoManager::scanNotActiveBroker</p><div class="language-routeInfoManager vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">routeInfoManager</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void scanNotActiveBroker() {</span></span>
<span class="line"><span>  for (Entry&lt;BrokerAddrInfo, BrokerLiveInfo&gt; next : this.brokerLiveTable.entrySet()) {</span></span>
<span class="line"><span>    // 获取上次更新的时间戳</span></span>
<span class="line"><span>    long last = next.getValue().getLastUpdateTimestamp();</span></span>
<span class="line"><span>    // 获取超时时间戳</span></span>
<span class="line"><span>    long timeoutMillis = next.getValue().getHeartbeatTimeoutMillis();</span></span>
<span class="line"><span>    // 如果超时，关闭通道</span></span>
<span class="line"><span>    if ((last + timeoutMillis) &lt; System.currentTimeMillis()) {</span></span>
<span class="line"><span>      RemotingHelper.closeChannel(next.getValue().getChannel());</span></span>
<span class="line"><span>      log.warn(&quot;The broker channel expired, {} {}ms&quot;, next.getKey(), timeoutMillis);</span></span>
<span class="line"><span>      this.onChannelDestroy(next.getKey());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>可以看到逻辑是很简单的，发现过期之后就会调用RemotingHelper.closeChannel关闭通道，并且调用this.onChannelDestroy方法，跟进onChannelDestroy方法</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void onChannelDestroy(BrokerAddrInfo brokerAddrInfo) {</span></span>
<span class="line"><span>  UnRegisterBrokerRequestHeader unRegisterRequest = new UnRegisterBrokerRequestHeader();</span></span>
<span class="line"><span>  boolean needUnRegister = false;</span></span>
<span class="line"><span>  if (brokerAddrInfo != null) {</span></span>
<span class="line"><span>    this.lock.readLock().lockInterruptibly();</span></span>
<span class="line"><span>    // 判断是否需要UnRegister，就是就是看brokerAddrTable有没有brokerAddrInfo，有就返回true</span></span>
<span class="line"><span>    needUnRegister = setupUnRegisterRequest(unRegisterRequest, brokerAddrInfo);</span></span>
<span class="line"><span>    this.lock.readLock().unlock();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (needUnRegister) {</span></span>
<span class="line"><span>    boolean result = this.submitUnRegisterBrokerRequest(unRegisterRequest);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>submitUnRegisterBrokerRequest-&gt;BatchUnregistrationService#submit放入一个队列，看BatchUnregistrationService#run, 取出来unregistrationRequests然后调用routeInfoManager#unRegisterBroker方法, 大致看一下这个方法的实现</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>BrokerAddrInfo brokerAddrInfo = new BrokerAddrInfo(clusterName, brokerAddr);</span></span>
<span class="line"><span>BrokerLiveInfo brokerLiveInfo = this.brokerLiveTable.remove(brokerAddrInfo);</span></span>
<span class="line"><span>this.filterServerTable.remove(brokerAddrInfo);</span></span>
<span class="line"><span>BrokerData brokerData = this.brokerAddrTable.get(brokerName);</span></span>
<span class="line"><span>if (null != brokerData) {</span></span>
<span class="line"><span>  boolean removed = brokerData.getBrokerAddrs().entrySet().removeIf(item -&gt; item.getValue().equals(brokerAddr));</span></span>
<span class="line"><span>  if (brokerData.getBrokerAddrs().isEmpty()) {</span></span>
<span class="line"><span>    this.brokerAddrTable.remove(brokerName);</span></span>
<span class="line"><span>  } else if (isMinBrokerIdChanged) {</span></span>
<span class="line"><span>    needNotifyBrokerMap.put(brokerName, new BrokerStatusChangeInfo(</span></span>
<span class="line"><span>            brokerData.getBrokerAddrs(), brokerAddr, null));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>Set&lt;String&gt; nameSet = this.clusterAddrTable.get(clusterName);</span></span>
<span class="line"><span>boolean removed = nameSet.remove(brokerName);</span></span>
<span class="line"><span>this.clusterAddrTable.remove(clusterName);</span></span>
<span class="line"><span>// 清除Topic信息</span></span>
<span class="line"><span>cleanTopicByUnRegisterRequests(removedBroker, reducedBroker);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>可以看到其实就是移除brokerLiveTable，filterServerTable，brokerAddrTable，clusterAddrTable里面的信息以及Topic信息，很好理解，就不细讲了</p><h2 id="路由发现" tabindex="-1">路由发现 <a class="header-anchor" href="#路由发现" aria-label="Permalink to &quot;路由发现&quot;">​</a></h2><p>RocketMq的路由发现是非实时的，当Topic路由发生变化之后不会主动推送给客户端，而是由客户端来进行拉取的。</p><p>我们回到controller#initialize方法，里面调用了registerProcessor方法，看这个方法的实现</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private void registerProcessor() {</span></span>
<span class="line"><span>  if (namesrvConfig.isClusterTest()) {</span></span>
<span class="line"><span>    this.remotingServer.registerDefaultProcessor(new ClusterTestRequestProcessor(this, namesrvConfig.getProductEnvName()), this.defaultExecutor);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    // 走这个分支，暂时支持获取Topic信息</span></span>
<span class="line"><span>    // Support get route info only temporarily</span></span>
<span class="line"><span>    ClientRequestProcessor clientRequestProcessor = new ClientRequestProcessor(this);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.GET_ROUTEINFO_BY_TOPIC, clientRequestProcessor, this.clientRequestExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerDefaultProcessor(new DefaultRequestProcessor(this), this.defaultExecutor);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>可以看到RequestCode.GET_ROUTEINFO_BY_TOPIC这个请求会使用ClientRequestProcessor，看它的processRequest方法</p><div class="language-NamesrvController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ClientRequestProcessor implements NettyRequestProcessor {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public RemotingCommand processRequest(final ChannelHandlerContext ctx,</span></span>
<span class="line"><span>    final RemotingCommand request) throws Exception {</span></span>
<span class="line"><span>    return this.getRouteInfoByTopic(ctx, request);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public RemotingCommand getRouteInfoByTopic(ChannelHandlerContext ctx,</span></span>
<span class="line"><span>                                          RemotingCommand request) throws RemotingCommandException {</span></span>
<span class="line"><span>    // 如果namesrv还没有ready，返回错误码</span></span>
<span class="line"><span>    if (namesrvController.getNamesrvConfig().isNeedWaitForService() &amp;&amp; !namesrvReady) {</span></span>
<span class="line"><span>      log.warn(&quot;name server not ready. request code {} &quot;, request.getCode());</span></span>
<span class="line"><span>      response.setCode(ResponseCode.SYSTEM_ERROR);</span></span>
<span class="line"><span>      response.setRemark(&quot;name server not ready&quot;);</span></span>
<span class="line"><span>      return response;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 调用RouteInfoManager().pickupTopicRouteData方法</span></span>
<span class="line"><span>    TopicRouteData topicRouteData = this.namesrvController.getRouteInfoManager().pickupTopicRouteData(requestHeader.getTopic());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 如果NamesrvConfig支持顺序消息，则从KvConfig中拉取NAMESPACE_ORDER_TOPIC_CONFIG配置信息</span></span>
<span class="line"><span>    if (this.namesrvController.getNamesrvConfig().isOrderMessageEnable()) {</span></span>
<span class="line"><span>      String orderTopicConf =</span></span>
<span class="line"><span>              this.namesrvController.getKvConfigManager().getKVConfig(NamesrvUtil.NAMESPACE_ORDER_TOPIC_CONFIG,</span></span>
<span class="line"><span>                      requestHeader.getTopic());</span></span>
<span class="line"><span>      topicRouteData.setOrderTopicConf(orderTopicConf);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br></div></div><p>pickupTopicRouteData的细节我们就不看了，看看TopicRouteData这个类包含了什么信息。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class TopicRouteData extends RemotingSerializable {</span></span>
<span class="line"><span>  // 顺序消息配置</span></span>
<span class="line"><span>  private String orderTopicConf;</span></span>
<span class="line"><span>  // topic队列元数据</span></span>
<span class="line"><span>  private List&lt;QueueData&gt; queueDatas;</span></span>
<span class="line"><span>  // broker元数据</span></span>
<span class="line"><span>  private List&lt;BrokerData&gt; brokerDatas;</span></span>
<span class="line"><span>  // broker上过滤服务器地址列表</span></span>
<span class="line"><span>  private HashMap&lt;String/* brokerAddr */, List&lt;String&gt;/* Filter Server */&gt; filterServerTable;</span></span>
<span class="line"><span>  //It could be null or empty</span></span>
<span class="line"><span>  private Map&lt;String/*brokerName*/, TopicQueueMappingInfo&gt; topicQueueMappingByBroker;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>上面的路由发现，路由注册和路由剔除的流程可以用下图概括</p><img src="`+i+'" width="550" alt="nameserver-route-info">',109)]))}const h=s(t,[["render",o]]);export{v as __pageData,h as default};
