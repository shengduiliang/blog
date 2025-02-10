import{_ as n,c as e,a0 as a,o as p}from"./chunks/framework.P9qPzDnn.js";const r="/assets/Executor-Modal.0b2OoOCj.png",d=JSON.parse('{"title":"rocketmq网络请求处理","description":"","frontmatter":{},"headers":[],"relativePath":"rocketmq/netty-modal.md","filePath":"rocketmq/netty-modal.md"}'),l={name:"rocketmq/netty-modal.md"};function i(t,s,c,o,u,b){return p(),e("div",null,s[0]||(s[0]=[a('<h1 id="rocketmq网络请求处理" tabindex="-1">rocketmq网络请求处理 <a class="header-anchor" href="#rocketmq网络请求处理" aria-label="Permalink to &quot;rocketmq网络请求处理&quot;">​</a></h1><p>这篇文章就来梳理一下RocketMq的网络请求流程，RocketMq底层是使用Netty来进行请求收发的，这里就不讲解Netty的使用细节了，这里提供两个资料</p><ul><li>RocketMq的Netty模型: <a href="https://juejin.cn/post/7103437918366089230" target="_blank" rel="noreferrer">https://juejin.cn/post/7103437918366089230</a></li><li>Netty服务端与客户端通信代码: <a href="https://juejin.cn/post/6844904122441809934" target="_blank" rel="noreferrer">https://juejin.cn/post/6844904122441809934</a></li></ul><p>RocketMQ中的Broker跟NameServer都要实现请求的收发，都有Netty服务器和客户端</p><ul><li>Netty服务器的实现在NettyRemotingServer，配置文件是NettyServerConfig</li><li>Netty客户端的实现在NettyRemotingClient，配置文件是NettyClientConfig</li></ul><h2 id="nettyserver网络请求模型" tabindex="-1">NettyServer网络请求模型 <a class="header-anchor" href="#nettyserver网络请求模型" aria-label="Permalink to &quot;NettyServer网络请求模型&quot;">​</a></h2><p><img src="'+r+`" alt="Executor-Modal"></p><p>rocketmq使用四个线程池，分别进行不同的处理，线程池分别对应数字：1 + N + M1 + M2。</p><ul><li>一个 Reactor 主线程（eventLoopGroupBoss，即为上面的1）负责监听 TCP 网络连接请求，建立好连接，创建SocketChannel，并注册到 selector 上。</li><li>Metty拿到网络数据后，再丢给Worker线程池（eventLoopGroupSelector，即为上面的“N”，源码中默认设置为 3）。</li><li>在真正执行业务逻辑之前需要进行 SSL 验证、编解码、空闲检查、网络连接管理，这些工作交给defaultEventExecutorGroup（即为上面的“M1”，源码中默认设置为8）去做。</li><li>而处理业务操作放在业务线程池中执行，根据 RomotingCommand 的业务请求码 code 去processorTable 这个本地缓存变量中找到对应的 processor，然后封装成 task 任务后，提交给对应的业务 processor 处理线程池来执行（sendMessageExecutor，以发送消息为例，即为上面的 “M2”）。</li></ul><p>注意，M2线程池不止只有一个，而是根据业务来的，rocketmq会区分不同的业务使用不同的线程池，这里只是一个示例。</p><h2 id="nettyserver初始化" tabindex="-1">NettyServer初始化 <a class="header-anchor" href="#nettyserver初始化" aria-label="Permalink to &quot;NettyServer初始化&quot;">​</a></h2><p>这节简单介绍一下NettyServer是怎么启动的，以及怎么处理请求分发的，因为NettyServer的代码是共用的，Broker跟NameServer的区别只是在处理业务的逻辑不一样，这里直接以NameServer的代码举例。回到NamesrvStartup类里面的parseCommandlineAndConfigFile解析配置方法，里面代码如下所示</p><div class="language-NamesrvStartup vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvStartup</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public static void parseCommandlineAndConfigFile(String[] args) throws Exception {</span></span>
<span class="line"><span>  // 初始化nettyServer配置</span></span>
<span class="line"><span>  nettyServerConfig = new NettyServerConfig();</span></span>
<span class="line"><span>  nettyServerConfig.setListenPort(9876);</span></span>
<span class="line"><span>  // 用配置文件的配置覆盖nettyServerConfig</span></span>
<span class="line"><span>  MixAll.properties2Object(properties, nettyServerConfig);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>我们看一下NettyServerConfig的配置属性，具体如下所示：</p><p><strong>网络监听相关配置</strong></p><ul><li>bindAddress: Netty服务器监听的网络地址，默认0.0.0.0</li><li>listenPort: Netty服务器监听的具体端口，默认0, 随机分配，NameServer使用9876端口</li></ul><p><strong>线程池配置</strong></p><ul><li>serverWorkerThreads: 业务线程池的线程数, 处理具体的业务逻辑(如请求解析、响应处理等), 默认为8</li><li>serverCallbackExecutorThreads: 公共任务线程池的线程数, 即一个业务请求没有线程池处理，就会分配到这个线程池上，默认为0，即未单独配置线程池</li><li>serverSelectorThreads: I/O线程池的线程数, 解析网络请求，并将请求转发给业务线程池处理, 默认为3</li><li>serverNettyWorkerGroupEnable: 是否启用Netty的Worker Group(工作线程组), 默认为true</li></ul><p><strong>并发度相关配置</strong></p><ul><li>serverOnewaySemaphoreValue: 限制单向消息发送的最大并发度, 默认为256</li><li>serverAsyncSemaphoreValue: 限制异步消息发送的最大并发度, 默认为64</li></ul><p><strong>网络连接相关配置</strong></p><ul><li>serverChannelMaxIdleTimeSeconds: 如果连接的空闲时间超过该值，连接会被关闭，防止资源浪费, 默认为120秒，就是IdleStateHandler的检测超时时间</li><li>serverSocketSndBufSize: Socket发送缓冲区大小，影响数据发送性能, 读取JVM配置com.rocketmq.remoting.socket.sndbuf.size, 默认0</li><li>serverSocketRcvBufSize: Socket接收缓冲区大小，影响数据接收性能, 读取JVM配置com.rocketmq.remoting.socket.rcvbuf.size, 默认0</li><li>writeBufferHighWaterMark: 写缓冲区的高水位标记, 超过该值时暂停写操作，避免过度消耗内存, 读取JVM配置com.rocketmq.remoting.write.buffer.high.water.mark, 默认0</li><li>writeBufferLowWaterMark: 写缓冲区的低水位标记，低于该值时恢复写操作，读取JVM配置com.rocketmq.remoting.write.buffer.low.water.mark，默认0</li><li>serverSocketBacklog: 限制连接队列的大小，即未被 accept 的连接数, 读取JVM配置com.rocketmq.remoting.socket.backlog，默认1024</li></ul><p><strong>缓存与内存管理</strong></p><ul><li>serverPooledByteBufAllocatorEnable: 是否开启ByteBuffer的内存池，默认为true</li></ul><p><strong>优雅关闭与关闭等待</strong></p><ul><li>enableShutdownGracefully: 是否支持优雅关闭，默认为false</li><li>shutdownWaitTimeSeconds: 在关闭过程中，最多等待完成任务的时间，默认为30秒</li></ul><p><strong>高性能网络模型</strong></p><ul><li>useEpollNativeSelector: 是否启用Epoll模型，Linux环境建议使用</li></ul><h2 id="nettyserver启动" tabindex="-1">NettyServer启动 <a class="header-anchor" href="#nettyserver启动" aria-label="Permalink to &quot;NettyServer启动&quot;">​</a></h2><p>在NamesrvStartup#start中会调用NamesrvStartup#initiateNetworkComponents，里面初始化nettyServer跟nettyClient</p><div class="language-NamesrvStartup vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvStartup</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private void initiateNetworkComponents() {</span></span>
<span class="line"><span>  this.remotingServer = new NettyRemotingServer(this.nettyServerConfig, this.brokerHousekeepingService);</span></span>
<span class="line"><span>  this.remotingClient = new NettyRemotingClient(this.nettyClientConfig);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>可以看到就是传入了前面解析出来的nettyServerConfig配置, 这里大致给一下NettyRemotingServer的构造方法代码吧。</p><div class="language-NettyRemotingServer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingServer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public NettyRemotingServer(final NettyServerConfig nettyServerConfig,</span></span>
<span class="line"><span>  final ChannelEventListener channelEventListener) {</span></span>
<span class="line"><span>  super(nettyServerConfig.getServerOnewaySemaphoreValue(), nettyServerConfig.getServerAsyncSemaphoreValue());</span></span>
<span class="line"><span>  this.serverBootstrap = new ServerBootstrap();</span></span>
<span class="line"><span>  this.nettyServerConfig = nettyServerConfig;</span></span>
<span class="line"><span>  this.channelEventListener = channelEventListener;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  this.publicExecutor = buildPublicExecutor(nettyServerConfig);</span></span>
<span class="line"><span>  this.scheduledExecutorService = buildScheduleExecutor();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  this.eventLoopGroupBoss = buildBossEventLoopGroup();</span></span>
<span class="line"><span>  this.eventLoopGroupSelector = buildEventLoopGroupSelector();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  loadSslContext();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>在NamesrvStartup#start最终会调用controller#start方法，看看这个方法的实现</p><div class="language-NamesrvController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void start() throws Exception {</span></span>
<span class="line"><span>  this.remotingServer.start();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>可以看到调用了remotingServer的start方法，进入这个方法里面看看</p><div class="language-NettyRemotingServer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingServer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class NettyRemotingServer extends NettyRemotingAbstract implements RemotingServer {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void start() {</span></span>
<span class="line"><span>    this.defaultEventExecutorGroup = new DefaultEventExecutorGroup(nettyServerConfig.getServerWorkerThreads(),</span></span>
<span class="line"><span>            new ThreadFactoryImpl(&quot;NettyServerCodecThread_&quot;));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    prepareSharableHandlers();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    serverBootstrap.group(this.eventLoopGroupBoss, this.eventLoopGroupSelector)</span></span>
<span class="line"><span>      .channel(useEpoll() ? EpollServerSocketChannel.class : NioServerSocketChannel.class)</span></span>
<span class="line"><span>      .option(ChannelOption.SO_BACKLOG, 1024)</span></span>
<span class="line"><span>      .option(ChannelOption.SO_REUSEADDR, true)</span></span>
<span class="line"><span>      .childOption(ChannelOption.SO_KEEPALIVE, false)</span></span>
<span class="line"><span>      .childOption(ChannelOption.TCP_NODELAY, true)</span></span>
<span class="line"><span>      .localAddress(new InetSocketAddress(this.nettyServerConfig.getBindAddress(),</span></span>
<span class="line"><span>              this.nettyServerConfig.getListenPort()))</span></span>
<span class="line"><span>      .childHandler(new ChannelInitializer&lt;SocketChannel&gt;() {</span></span>
<span class="line"><span>        @Override</span></span>
<span class="line"><span>        public void initChannel(SocketChannel ch) {</span></span>
<span class="line"><span>          // 实际处理方法</span></span>
<span class="line"><span>          configChannel(ch);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    addCustomConfig(serverBootstrap);</span></span>
<span class="line"><span>    ChannelFuture sync = serverBootstrap.bind().sync();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><p>好了，在这里我们就可以分析前面的那些线程池实现了。</p><p><strong>Reactor主线程</strong></p><p>跟进eventLoopGroupBoss的实现，调用了buildBossEventLoopGroup方法。</p><div class="language-NettyRemotingServer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingServer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private EventLoopGroup buildBossEventLoopGroup() {</span></span>
<span class="line"><span>  if (useEpoll()) {</span></span>
<span class="line"><span>    return new EpollEventLoopGroup(1, new ThreadFactoryImpl(&quot;NettyEPOLLBoss_&quot;));</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    return new NioEventLoopGroup(1, new ThreadFactoryImpl(&quot;NettyNIOBoss_&quot;));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>可以看到初始化了只有1个线程的线程池</p><p><strong>Worker线程</strong></p><p>跟进eventLoopGroupSelector的实现，调用了buildEventLoopGroupSelector方法。</p><div class="language-NettyRemotingServer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingServer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private EventLoopGroup buildEventLoopGroupSelector() {</span></span>
<span class="line"><span>  if (useEpoll()) {</span></span>
<span class="line"><span>    return new EpollEventLoopGroup(nettyServerConfig.getServerSelectorThreads(), new ThreadFactoryImpl(&quot;NettyServerEPOLLSelector_&quot;));</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    return new NioEventLoopGroup(nettyServerConfig.getServerSelectorThreads(), new ThreadFactoryImpl(&quot;NettyServerNIOSelector_&quot;));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>可以看到这个线程池的线程个数就是上面nettyServerConfig里的serverSelectorThreads</p><p>继续跟进具体的请求处理方法configChannel，代码如下所示</p><div class="language-NettyRemotingServer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingServer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>protected ChannelPipeline configChannel(SocketChannel ch) {</span></span>
<span class="line"><span>  return ch.pipeline()</span></span>
<span class="line"><span>    .addLast(nettyServerConfig.isServerNettyWorkerGroupEnable() ? defaultEventExecutorGroup : null,</span></span>
<span class="line"><span>            HANDSHAKE_HANDLER_NAME, new HandshakeHandler())</span></span>
<span class="line"><span>    .addLast(nettyServerConfig.isServerNettyWorkerGroupEnable() ? defaultEventExecutorGroup : null,</span></span>
<span class="line"><span>            encoder,</span></span>
<span class="line"><span>            new NettyDecoder(),</span></span>
<span class="line"><span>            distributionHandler,</span></span>
<span class="line"><span>            new IdleStateHandler(0, 0,</span></span>
<span class="line"><span>                    nettyServerConfig.getServerChannelMaxIdleTimeSeconds()),</span></span>
<span class="line"><span>            connectionManageHandler,</span></span>
<span class="line"><span>            serverHandler</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p><strong>工作组线程</strong></p><p>如果启用了serverNettyWorkerGroupEnable，那么将会用defaultEventExecutorGroup来处理握手操作和解析请求，跟进defaultEventExecutorGroup的实现，就在NettyRemotingServer#start方法里面。</p><div class="language-NettyRemotingServer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingServer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public void start() {</span></span>
<span class="line"><span>  this.defaultEventExecutorGroup = new DefaultEventExecutorGroup(nettyServerConfig.getServerWorkerThreads(),</span></span>
<span class="line"><span>    new ThreadFactoryImpl(&quot;NettyServerCodecThread_&quot;));</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>可以看到初始化了一个线程池，线程个数就是nettyServerConfig的serverWorkerThreads个数</p><h2 id="nettyserver处理请求" tabindex="-1">NettyServer处理请求 <a class="header-anchor" href="#nettyserver处理请求" aria-label="Permalink to &quot;NettyServer处理请求&quot;">​</a></h2><p>接下来进入Netty处理请求的核心Handler，即serverHandler, 看一下做了什么。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@ChannelHandler.Sharable</span></span>
<span class="line"><span>public class NettyServerHandler extends SimpleChannelInboundHandler&lt;RemotingCommand&gt; {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected void channelRead0(ChannelHandlerContext ctx, RemotingCommand msg) {</span></span>
<span class="line"><span>    int localPort = RemotingHelper.parseSocketAddressPort(ctx.channel().localAddress());</span></span>
<span class="line"><span>    NettyRemotingAbstract remotingAbstract = NettyRemotingServer.this.remotingServerTable.get(localPort);</span></span>
<span class="line"><span>    if (localPort != -1 &amp;&amp; remotingAbstract != null) {</span></span>
<span class="line"><span>      # 主要调用了这个方法</span></span>
<span class="line"><span>      remotingAbstract.processMessageReceived(ctx, msg);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // The related remoting server has been shutdown, so close the connected channel</span></span>
<span class="line"><span>    RemotingHelper.closeChannel(ctx.channel());</span></span>
<span class="line"><span>  } </span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>进入remotingAbstract#processMessageReceived方法，代码如下</p><div class="language-NettyRemotingAbstract vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingAbstract</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void processMessageReceived(ChannelHandlerContext ctx, RemotingCommand msg) {</span></span>
<span class="line"><span>  if (msg != null) {</span></span>
<span class="line"><span>    switch (msg.getType()) {</span></span>
<span class="line"><span>      case REQUEST_COMMAND:</span></span>
<span class="line"><span>        processRequestCommand(ctx, msg);</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      case RESPONSE_COMMAND:</span></span>
<span class="line"><span>        processResponseCommand(ctx, msg);</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      default:</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>由于现在是处理请求，所以会调用processRequestCommand方法，进入这个方法:</p><div class="language-NettyRemotingAbstract vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingAbstract</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void processRequestCommand(final ChannelHandlerContext ctx, final RemotingCommand cmd) {</span></span>
<span class="line"><span>  // 先从processorTable中获取对应的处理函数</span></span>
<span class="line"><span>  final Pair&lt;NettyRequestProcessor, ExecutorService&gt; matched = this.processorTable.get(cmd.getCode());</span></span>
<span class="line"><span>  // 如果processorTable中没有，那么就从defaultRequestProcessorPair中获取</span></span>
<span class="line"><span>  final Pair&lt;NettyRequestProcessor, ExecutorService&gt; pair = null == matched ? this.defaultRequestProcessorPair : matched;</span></span>
<span class="line"><span>  Runnable run = buildProcessRequestHandler(ctx, cmd, pair, opaque);</span></span>
<span class="line"><span>  final RequestTask requestTask = new RequestTask(run, ctx.channel(), cmd);</span></span>
<span class="line"><span>  //async execute task, current thread return directly</span></span>
<span class="line"><span>  pair.getObject2().submit(requestTask);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>接下来看看processorTable跟defaultRequestProcessorPair都是什么，有什么内容。</p><div class="language-NettyRemotingAbstract vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingAbstract</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>protected final HashMap&lt;Integer/* request code */, Pair&lt;NettyRequestProcessor, ExecutorService&gt;&gt; processorTable =</span></span>
<span class="line"><span>  new HashMap&lt;&gt;(64);</span></span>
<span class="line"><span>protected Pair&lt;NettyRequestProcessor, ExecutorService&gt; defaultRequestProcessorPair;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>接下来看一下是在哪里往这两个属性里面放入对象的，具体实现是在NettyRemotingServer这个类中，</p><div class="language-NettyRemotingServer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingServer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public void registerProcessor(int requestCode, NettyRequestProcessor processor, ExecutorService executor) {</span></span>
<span class="line"><span>  ExecutorService executorThis = executor;</span></span>
<span class="line"><span>  if (null == executor) {</span></span>
<span class="line"><span>    executorThis = this.publicExecutor;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  Pair&lt;NettyRequestProcessor, ExecutorService&gt; pair = new Pair&lt;&gt;(processor, executorThis);</span></span>
<span class="line"><span>  this.processorTable.put(requestCode, pair);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Override</span></span>
<span class="line"><span>public void registerDefaultProcessor(NettyRequestProcessor processor, ExecutorService executor) {</span></span>
<span class="line"><span>  this.defaultRequestProcessorPair = new Pair&lt;&gt;(processor, executor);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p><strong>业务线程池</strong></p><p>具体NameServer是在哪里注册processor的呢，回看NameSrvController#registerProcessor方法</p><div class="language-NameSrvController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NameSrvController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private void registerProcessor() {</span></span>
<span class="line"><span>  if (namesrvConfig.isClusterTest()) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.remotingServer.registerDefaultProcessor(new ClusterTestRequestProcessor(this, namesrvConfig.getProductEnvName()), this.defaultExecutor);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    // Support get route info only temporarily</span></span>
<span class="line"><span>    ClientRequestProcessor clientRequestProcessor = new ClientRequestProcessor(this);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.GET_ROUTEINFO_BY_TOPIC, clientRequestProcessor, this.clientRequestExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerDefaultProcessor(new DefaultRequestProcessor(this), this.defaultExecutor);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>好了，看看这连个线程池的声明。</p><div class="language-NamesrvController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NamesrvController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private void initiateThreadExecutors() {</span></span>
<span class="line"><span>  this.defaultThreadPoolQueue = new LinkedBlockingQueue&lt;&gt;(this.namesrvConfig.getDefaultThreadPoolQueueCapacity());</span></span>
<span class="line"><span>  this.defaultExecutor = ThreadUtils.newThreadPoolExecutor(this.namesrvConfig.getDefaultThreadPoolNums(), this.namesrvConfig.getDefaultThreadPoolNums(), 1000 * 60, TimeUnit.MILLISECONDS, this.defaultThreadPoolQueue, new ThreadFactoryImpl(&quot;RemotingExecutorThread_&quot;));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  this.clientRequestThreadPoolQueue = new LinkedBlockingQueue&lt;&gt;(this.namesrvConfig.getClientRequestThreadPoolQueueCapacity());</span></span>
<span class="line"><span>  this.clientRequestExecutor = ThreadUtils.newThreadPoolExecutor(this.namesrvConfig.getClientRequestThreadPoolNums(), this.namesrvConfig.getClientRequestThreadPoolNums(), 1000 * 60, TimeUnit.MILLISECONDS, this.clientRequestThreadPoolQueue, new ThreadFactoryImpl(&quot;ClientRequestExecutorThread_&quot;));</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>由于业务处理是具体的项目实现的，所以对应的线程也由对应的项目来创建，这两个线程池的参数定义可以回看《NameServer初始化流程与路由机制》章节</p><p>具体的请求处理方法，只要看ClientRequestProcessor跟DefaultRequestProcessor的实现就好了。看registerProcessor的实现，很明显前端发送GET_ROUTEINFO_BY_TOPIC请求的时候就是clientRequestProcessor做处理的，其他的是DefaultRequestProcessor做处理的</p><h2 id="nettyclient初始化" tabindex="-1">NettyClient初始化 <a class="header-anchor" href="#nettyclient初始化" aria-label="Permalink to &quot;NettyClient初始化&quot;">​</a></h2><p>NettyClient的初始化跟NettyServer的初始化是同一个地方，所以我们直接看NettyClient都有哪些配置吧。</p><p><strong>客户端线程池和资源配置</strong></p><ul><li>clientWorkerThreads: 客户端的工作线程池线程数，主要负责处理 I/O 操作和业务逻辑的调度, 默认值NettySystemConfig.clientWorkerSize(4)</li><li>clientCallbackExecutorThreads: 客户端回调线程池线程数，用于处理异步回调任务, 默认值CPU核心线程数(Runtime.getRuntime().availableProcessors())</li><li>disableCallbackExecutor: 是否禁用回调线程池，如果启用，回调操作可能直接在 I/O 线程中执行</li><li>clientOnewaySemaphoreValue: 限制客户端可以同时发送的单向消息数量, 默认值NettySystemConfig.CLIENT_ONEWAY_SEMAPHORE_VALUE(65535)</li><li>clientAsyncSemaphoreValue: 限制客户端可以同时发送的异步消息数量, 默认值COM_ROCKETMQ_REMOTING_CLIENT_ASYNC_SEMAPHORE_VALUE(65535)</li></ul><p><strong>超时和连接管理</strong></p><ul><li>connectTimeoutMillis: 客户端与服务端建立连接的超时时间, 默认值COM_ROCKETMQ_REMOTING_CLIENT_CONNECT_TIMEOUT(3秒)</li><li>channelNotActiveInterval: 定期检查通道是否活跃，便于及时清理无效连接，默认值1000*60(1分钟)</li><li>clientChannelMaxIdleTimeSeconds: 客户端通道的最大空闲时间（秒），超过此时间将触发IdleStateEvent, 默认值NettySystemConfig.clientChannelMaxIdleTimeSeconds（120秒）</li><li>clientCloseSocketIfTimeout: 在连接超时时是否主动关闭套接字, 提高资源回收效率，避免死连接, 默认值NettySystemConfig.clientCloseSocketIfTimeout(true)</li></ul><p><strong>缓冲区与内存管理</strong></p><ul><li>clientSocketSndBufSize和clientSocketRcvBufSize: 客户端套接字的发送和接收缓冲区大小</li><li>clientPooledByteBufAllocatorEnable: 是否启用ByteBuffer池化, 默认为false</li><li>writeBufferHighWaterMark 和 writeBufferLowWaterMark: 写缓冲区的高水位和低水位阈值</li></ul><p><strong>其他配置</strong></p><ul><li>isScanAvailableNameSrv: 如果启用，客户端会定期刷新和检查 NameServer 的可用性, 默认为true</li><li>useTLS: 是否启用TLS加密通信</li><li>socksProxyConfig: 配置了代理，客户端会通过代理发送请求</li><li>maxReconnectIntervalTimeSeconds, 客户端重来的最大时间间隔，默认60秒</li><li>maxReconnectIntervalTimeSeconds: 当服务器发送GOAWAY信息是，是否允许重连, 默认为true</li><li>enableTransparentRetry 是否启用透明重传，传输失败时，自动尝试发送请求，默认为true</li></ul><h2 id="nettyclient启动" tabindex="-1">NettyClient启动 <a class="header-anchor" href="#nettyclient启动" aria-label="Permalink to &quot;NettyClient启动&quot;">​</a></h2><p>我们直接看NettyRemotingClient#start方法吧。</p><div class="language-NettyRemotingClient vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingClient</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public void start() {</span></span>
<span class="line"><span>  if (this.defaultEventExecutorGroup == null) {</span></span>
<span class="line"><span>      this.defaultEventExecutorGroup = new DefaultEventExecutorGroup(</span></span>
<span class="line"><span>          nettyClientConfig.getClientWorkerThreads(),</span></span>
<span class="line"><span>          new ThreadFactoryImpl(&quot;NettyClientWorkerThread_&quot;));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  Bootstrap handler = this.bootstrap.group(this.eventLoopGroupWorker).channel(NioSocketChannel.class)</span></span>
<span class="line"><span>    .option(ChannelOption.TCP_NODELAY, true)</span></span>
<span class="line"><span>    .option(ChannelOption.SO_KEEPALIVE, false)</span></span>
<span class="line"><span>    .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, nettyClientConfig.getConnectTimeoutMillis())</span></span>
<span class="line"><span>    .handler(new ChannelInitializer&lt;SocketChannel&gt;() {</span></span>
<span class="line"><span>        @Override</span></span>
<span class="line"><span>        public void initChannel(SocketChannel ch) throws Exception {</span></span>
<span class="line"><span>            ChannelPipeline pipeline = ch.pipeline();</span></span>
<span class="line"><span>            if (nettyClientConfig.isUseTLS()) {</span></span>
<span class="line"><span>                if (null != sslContext) {</span></span>
<span class="line"><span>                    pipeline.addFirst(defaultEventExecutorGroup, &quot;sslHandler&quot;, sslContext.newHandler(ch.alloc()));</span></span>
<span class="line"><span>                    LOGGER.info(&quot;Prepend SSL handler&quot;);</span></span>
<span class="line"><span>                } else {</span></span>
<span class="line"><span>                    LOGGER.warn(&quot;Connections are insecure as SSLContext is null!&quot;);</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            ch.pipeline().addLast(</span></span>
<span class="line"><span>                nettyClientConfig.isDisableNettyWorkerGroup() ? null : defaultEventExecutorGroup,</span></span>
<span class="line"><span>                new NettyEncoder(),</span></span>
<span class="line"><span>                new NettyDecoder(),</span></span>
<span class="line"><span>                new IdleStateHandler(0, 0, nettyClientConfig.getClientChannelMaxIdleTimeSeconds()),</span></span>
<span class="line"><span>                new NettyConnectManageHandler(),</span></span>
<span class="line"><span>                new NettyClientHandler());</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 定时扫描ResponseTable，清除没有用的请求</span></span>
<span class="line"><span>  TimerTask timerTaskScanResponseTable = new TimerTask() {</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public void run(Timeout timeout) {</span></span>
<span class="line"><span>      NettyRemotingClient.this.scanResponseTable();</span></span>
<span class="line"><span>      timer.newTimeout(this, 1000, TimeUnit.MILLISECONDS);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>  this.timer.newTimeout(timerTaskScanResponseTable, 1000 * 3, TimeUnit.MILLISECONDS);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 定时扫描可用的NameSrv</span></span>
<span class="line"><span>  if (nettyClientConfig.isScanAvailableNameSrv()) {</span></span>
<span class="line"><span>      int connectTimeoutMillis = this.nettyClientConfig.getConnectTimeoutMillis();</span></span>
<span class="line"><span>      TimerTask timerTaskScanAvailableNameSrv = new TimerTask() {</span></span>
<span class="line"><span>          @Override</span></span>
<span class="line"><span>          public void run(Timeout timeout) {</span></span>
<span class="line"><span>            NettyRemotingClient.this.scanAvailableNameSrv();</span></span>
<span class="line"><span>            timer.newTimeout(this, connectTimeoutMillis, TimeUnit.MILLISECONDS);</span></span>
<span class="line"><span>      };</span></span>
<span class="line"><span>      this.timer.newTimeout(timerTaskScanAvailableNameSrv, 0, TimeUnit.MILLISECONDS);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br></div></div><h3 id="nettyclient发送请求" tabindex="-1">NettyClient发送请求 <a class="header-anchor" href="#nettyclient发送请求" aria-label="Permalink to &quot;NettyClient发送请求&quot;">​</a></h3><p>直接跟进NettyRemotingClient#invokeSync -&gt; invokeSyncImpl -&gt; invokeSyncImpl -&gt; invoke0 -&gt; channel.writeAndFlush(request)流程，这条流程不复杂，下节课讲消息发送的时候再讲吧。</p><p>这里主要讲一下channel的连接建立。</p><div class="language-NettyRemotingClient vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingClient</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public RemotingCommand invokeSync(String addr, final RemotingCommand request, long timeoutMillis) {</span></span>
<span class="line"><span>  final Channel channel = this.getAndCreateChannel(addr);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>调用路径为: getAndCreateChannel -&gt; getAndCreateChannelAsync -&gt; createChannelAsync -&gt; createChannel, 看看createChannel的实现</p><div class="language-NettyRemotingClient vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingClient</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private ChannelWrapper createChannel(String addr) {</span></span>
<span class="line"><span>    String[] hostAndPort = getHostAndPort(addr);</span></span>
<span class="line"><span>    // 建立连接</span></span>
<span class="line"><span>    ChannelFuture channelFuture = fetchBootstrap(addr)</span></span>
<span class="line"><span>        .connect(hostAndPort[0], Integer.parseInt(hostAndPort[1]));</span></span>
<span class="line"><span>    LOGGER.info(&quot;createChannel: begin to connect remote host[{}] asynchronously&quot;, addr);</span></span>
<span class="line"><span>    // 封装ChannelWrapper</span></span>
<span class="line"><span>    ChannelWrapper cw = new ChannelWrapper(addr, channelFuture);</span></span>
<span class="line"><span>    this.channelTables.put(addr, cw);</span></span>
<span class="line"><span>    this.channelWrapperTables.put(channelFuture.channel(), cw);</span></span>
<span class="line"><span>    return cw;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><h2 id="补充" tabindex="-1">补充 <a class="header-anchor" href="#补充" aria-label="Permalink to &quot;补充&quot;">​</a></h2><p>NameServer的业务请求入口代码是这两个</p><div class="language-NameSrvController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NameSrvController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private void registerProcessor() {</span></span>
<span class="line"><span>  // GET_ROUTEINFO_BY_TOPIC请求由clientRequestProcessor处理</span></span>
<span class="line"><span>  this.remotingServer.registerProcessor(RequestCode.GET_ROUTEINFO_BY_TOPIC, clientRequestProcessor, this.clientRequestExecutor);</span></span>
<span class="line"><span>  // 其它请求由DefaultRequestProcessor处理</span></span>
<span class="line"><span>  this.remotingServer.registerDefaultProcessor(new DefaultRequestProcessor(this), this.defaultExecutor);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>Broker的业务处理入口代码是这个</p><div class="language-BrokerController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">BrokerController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void registerProcessor() {</span></span>
<span class="line"><span>    /*</span></span>
<span class="line"><span>      * SendMessageProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    sendMessageProcessor.registerSendMessageHook(sendMessageHookList);</span></span>
<span class="line"><span>    sendMessageProcessor.registerConsumeMessageHook(consumeMessageHookList);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.SEND_MESSAGE, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.SEND_MESSAGE_V2, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.SEND_BATCH_MESSAGE, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.CONSUMER_SEND_MSG_BACK, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.SEND_MESSAGE, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.SEND_MESSAGE_V2, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.SEND_BATCH_MESSAGE, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.CONSUMER_SEND_MSG_BACK, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * PullMessageProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.PULL_MESSAGE, this.pullMessageProcessor, this.pullMessageExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.LITE_PULL_MESSAGE, this.pullMessageProcessor, this.litePullMessageExecutor);</span></span>
<span class="line"><span>    this.pullMessageProcessor.registerConsumeMessageHook(consumeMessageHookList);</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * PeekMessageProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.PEEK_MESSAGE, this.peekMessageProcessor, this.pullMessageExecutor);</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * PopMessageProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.POP_MESSAGE, this.popMessageProcessor, this.pullMessageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * AckMessageProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.ACK_MESSAGE, this.ackMessageProcessor, this.ackMessageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.ACK_MESSAGE, this.ackMessageProcessor, this.ackMessageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.BATCH_ACK_MESSAGE, this.ackMessageProcessor, this.ackMessageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.BATCH_ACK_MESSAGE, this.ackMessageProcessor, this.ackMessageExecutor);</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * ChangeInvisibleTimeProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.CHANGE_MESSAGE_INVISIBLETIME, this.changeInvisibleTimeProcessor, this.ackMessageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.CHANGE_MESSAGE_INVISIBLETIME, this.changeInvisibleTimeProcessor, this.ackMessageExecutor);</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * notificationProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.NOTIFICATION, this.notificationProcessor, this.pullMessageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * pollingInfoProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.POLLING_INFO, this.pollingInfoProcessor, this.pullMessageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * ReplyMessageProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    replyMessageProcessor.registerSendMessageHook(sendMessageHookList);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.SEND_REPLY_MESSAGE, replyMessageProcessor, replyMessageExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.SEND_REPLY_MESSAGE_V2, replyMessageProcessor, replyMessageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.SEND_REPLY_MESSAGE, replyMessageProcessor, replyMessageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.SEND_REPLY_MESSAGE_V2, replyMessageProcessor, replyMessageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * QueryMessageProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    NettyRequestProcessor queryProcessor = new QueryMessageProcessor(this);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.QUERY_MESSAGE, queryProcessor, this.queryMessageExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.VIEW_MESSAGE_BY_ID, queryProcessor, this.queryMessageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.QUERY_MESSAGE, queryProcessor, this.queryMessageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.VIEW_MESSAGE_BY_ID, queryProcessor, this.queryMessageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * ClientManageProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.HEART_BEAT, clientManageProcessor, this.heartbeatExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.UNREGISTER_CLIENT, clientManageProcessor, this.clientManageExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.CHECK_CLIENT_CONFIG, clientManageProcessor, this.clientManageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.HEART_BEAT, clientManageProcessor, this.heartbeatExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.UNREGISTER_CLIENT, clientManageProcessor, this.clientManageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.CHECK_CLIENT_CONFIG, clientManageProcessor, this.clientManageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * ConsumerManageProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    ConsumerManageProcessor consumerManageProcessor = new ConsumerManageProcessor(this);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.GET_CONSUMER_LIST_BY_GROUP, consumerManageProcessor, this.consumerManageExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.UPDATE_CONSUMER_OFFSET, consumerManageProcessor, this.consumerManageExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.QUERY_CONSUMER_OFFSET, consumerManageProcessor, this.consumerManageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.GET_CONSUMER_LIST_BY_GROUP, consumerManageProcessor, this.consumerManageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.UPDATE_CONSUMER_OFFSET, consumerManageProcessor, this.consumerManageExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.QUERY_CONSUMER_OFFSET, consumerManageProcessor, this.consumerManageExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * QueryAssignmentProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.QUERY_ASSIGNMENT, queryAssignmentProcessor, loadBalanceExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.QUERY_ASSIGNMENT, queryAssignmentProcessor, loadBalanceExecutor);</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.SET_MESSAGE_REQUEST_MODE, queryAssignmentProcessor, loadBalanceExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.SET_MESSAGE_REQUEST_MODE, queryAssignmentProcessor, loadBalanceExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * EndTransactionProcessor</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    this.remotingServer.registerProcessor(RequestCode.END_TRANSACTION, endTransactionProcessor, this.endTransactionExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerProcessor(RequestCode.END_TRANSACTION, endTransactionProcessor, this.endTransactionExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /*</span></span>
<span class="line"><span>      * Default</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    AdminBrokerProcessor adminProcessor = new AdminBrokerProcessor(this);</span></span>
<span class="line"><span>    this.remotingServer.registerDefaultProcessor(adminProcessor, this.adminBrokerExecutor);</span></span>
<span class="line"><span>    this.fastRemotingServer.registerDefaultProcessor(adminProcessor, this.adminBrokerExecutor);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /*</span></span>
<span class="line"><span>      * Initialize the mapping of request codes to request headers.</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    RequestHeaderRegistry.getInstance().initialize();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br><span class="line-number">92</span><br><span class="line-number">93</span><br><span class="line-number">94</span><br><span class="line-number">95</span><br><span class="line-number">96</span><br><span class="line-number">97</span><br><span class="line-number">98</span><br><span class="line-number">99</span><br><span class="line-number">100</span><br><span class="line-number">101</span><br><span class="line-number">102</span><br><span class="line-number">103</span><br><span class="line-number">104</span><br><span class="line-number">105</span><br><span class="line-number">106</span><br><span class="line-number">107</span><br><span class="line-number">108</span><br><span class="line-number">109</span><br><span class="line-number">110</span><br><span class="line-number">111</span><br><span class="line-number">112</span><br><span class="line-number">113</span><br><span class="line-number">114</span><br><span class="line-number">115</span><br><span class="line-number">116</span><br><span class="line-number">117</span><br><span class="line-number">118</span><br><span class="line-number">119</span><br><span class="line-number">120</span><br><span class="line-number">121</span><br><span class="line-number">122</span><br><span class="line-number">123</span><br></div></div><p>可以看到Broker有很多，后面可能会讲到这些请求的处理。</p>`,95)]))}const g=n(l,[["render",i]]);export{d as __pageData,g as default};
