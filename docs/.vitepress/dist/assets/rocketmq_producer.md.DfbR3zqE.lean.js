import{_ as n,c as a,a0 as e,o as p}from"./chunks/framework.P9qPzDnn.js";const l="/assets/messageQueue.U04cb-ho.png",d=JSON.parse('{"title":"生产者启动和消息发送流程","description":"","frontmatter":{},"headers":[],"relativePath":"rocketmq/producer.md","filePath":"rocketmq/producer.md"}'),i={name:"rocketmq/producer.md"};function r(t,s,c,u,b,o){return p(),a("div",null,s[0]||(s[0]=[e(`<h1 id="生产者启动和消息发送流程" tabindex="-1">生产者启动和消息发送流程 <a class="header-anchor" href="#生产者启动和消息发送流程" aria-label="Permalink to &quot;生产者启动和消息发送流程&quot;">​</a></h1><p>本章节主要介绍Rocketmq中Producer的启动流程以及消息发送的流程。</p><h2 id="消息发送方式" tabindex="-1">消息发送方式 <a class="header-anchor" href="#消息发送方式" aria-label="Permalink to &quot;消息发送方式&quot;">​</a></h2><p>RocketMQ支持3种消息发送方式：同步(sync), 异步(async), 单向(oneway)。</p><ul><li>同步: 发送者向MQ发送消息时，同步等待，直到消息服务器返回发送结果</li></ul><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Message&lt;String&gt; msg = MessageBuilder.withPayload(&quot;Hello,RocketMQ&quot;).build();</span></span>
<span class="line"><span>rocketmqTemplate.convertAndSend(&quot;Hello&quot;, msg);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><ul><li>异步: 发送者向MQ发送消息时，指定消息发送成功后的回调函数，然后调用消息发送API之后，立即返回，消息发送者线程不阻塞，直到消息发送成功或者发送失败的回调任务在一个新的线程中执行</li></ul><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Message&lt;String&gt; msg = MessageBuilder.withPayload(&quot;Hello,RocketMQ oneway&quot;).build();</span></span>
<span class="line"><span>rocketmqTemplate.asyncSend(&quot;Hello&quot;, msg, new SendCallback() {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void onSuccess(SendResult sendResult) {</span></span>
<span class="line"><span>    System.out.println(sendResult);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void onException(Throwable e) {</span></span>
<span class="line"><span>    System.out.println(e.getMessage());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><ul><li>单向: 发送者只管向MQ发送消息，直接返回，不在乎消息是否成功在消息服务器上存储</li></ul><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Message&lt;String&gt; msg = MessageBuilder.withPayload(&quot;Hello,RocketMQ oneway&quot;).build();</span></span>
<span class="line"><span>rocketmqTemplate.sendOneWay(&quot;Hello&quot;, msg);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>上面代码中的Message跟Producer里面的Message不是同一个类，rocketmq-spring-boot-starter重新定义了一个Message，并且会在实际发送的时候转化为Producer内部的Message类, 这篇文章不分析这个</p></div><h2 id="producer发送消息demo" tabindex="-1">Producer发送消息Demo <a class="header-anchor" href="#producer发送消息demo" aria-label="Permalink to &quot;Producer发送消息Demo&quot;">​</a></h2><p>下面我们看一个Rocketmq原生的Producer发送消息的案例，可以参考这个类org.apache.rocketmq.example.quickstart.Producer, 代码有删减</p><div class="language-Producer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">Producer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class Producer {</span></span>
<span class="line"><span>  public static final String PRODUCER_GROUP = &quot;please_rename_unique_group_name&quot;;</span></span>
<span class="line"><span>  public static final String DEFAULT_NAMESRVADDR = &quot;127.0.0.1:9876&quot;;</span></span>
<span class="line"><span>  public static final String TOPIC = &quot;TopicTest&quot;;</span></span>
<span class="line"><span>  public static final String TAG = &quot;TagA&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void main(String[] args) throws MQClientException, InterruptedException {</span></span>
<span class="line"><span>    // 初始化Producer</span></span>
<span class="line highlighted"><span>    DefaultMQProducer producer = new DefaultMQProducer(PRODUCER_GROUP); </span></span>
<span class="line"><span>    producer.setNamesrvAddr(DEFAULT_NAMESRVADDR);</span></span>
<span class="line"><span>    // 启动Producer</span></span>
<span class="line highlighted"><span>    producer.start();</span></span>
<span class="line"><span>    Message msg = new Message(TOPIC, TAG, (&quot;Hello RocketMQ &quot; + i).getBytes(RemotingHelper.DEFAULT_CHARSET));</span></span>
<span class="line"><span>    // 发送消息</span></span>
<span class="line highlighted"><span>    SendResult sendResult = producer.send(msg, 20 * 1000)</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><h2 id="producer初始化" tabindex="-1">Producer初始化 <a class="header-anchor" href="#producer初始化" aria-label="Permalink to &quot;Producer初始化&quot;">​</a></h2><p>可以看到上面第9行新建了一个DefaultMQProducer对象，那么我们就来看看这个类做了什么。</p><h3 id="defaultmqproducer" tabindex="-1">DefaultMQProducer <a class="header-anchor" href="#defaultmqproducer" aria-label="Permalink to &quot;DefaultMQProducer&quot;">​</a></h3><div class="language-DefaultMQProducer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public DefaultMQProducer(final String producerGroup, RPCHook rpcHook, final List&lt;String&gt; topics,</span></span>
<span class="line"><span>    boolean enableMsgTrace, final String customizedTraceTopic) {</span></span>
<span class="line"><span>    this.producerGroup = producerGroup;</span></span>
<span class="line"><span>    this.rpcHook = rpcHook;</span></span>
<span class="line"><span>    this.topics = topics;</span></span>
<span class="line"><span>    this.enableTrace = enableMsgTrace;</span></span>
<span class="line"><span>    this.traceTopic = customizedTraceTopic;</span></span>
<span class="line"><span>    defaultMQProducerImpl = new DefaultMQProducerImpl(this, rpcHook);</span></span>
<span class="line"><span>    produceAccumulator = MQClientManager.getInstance().getOrCreateProduceAccumulator(this);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>可以看到就是赋值了producerGroup, rpcHook，topics这些属性，然后初始化了一个DefaultMQProducerImpl对象，这个对象看名字就知道是具体的实现类了。</p><h3 id="defaultmqproducer核心属性" tabindex="-1">DefaultMQProducer核心属性 <a class="header-anchor" href="#defaultmqproducer核心属性" aria-label="Permalink to &quot;DefaultMQProducer核心属性&quot;">​</a></h3><p>我们看看DefaultMQProducer这个类有什么可以配置的, 这里说明一下。</p><p><strong>主题队列</strong></p><ul><li><strong>producerGroup</strong>: 生产者组的名字，Broker在回查事务消息的时候会随机选择生产者组当中的任何一个生产者发起事务回查请求</li><li>topics: 指定事务生产者需要初始化的主题</li><li>createTopicKey: 用于测试Demo，在测试或者演示程序中自动创建主题的关键字，默认为AUTO_CREATE_TOPIC_KEY_TOPIC(TBW102)</li><li><strong>defaultTopicQueueNums</strong>: 创建每个默认主题中的队列数量, 默认为4</li></ul><p><strong>消息发送</strong></p><ul><li><strong>sendMsgTimeout</strong>: 消息发送的超时时间，默认3秒</li><li><strong>compressMsgBodyOverHowmuch</strong>: 消息体超过此阈值就会进行压缩，默认1024 * 4(4K)</li><li><strong>retryTimesWhenSendFailed</strong>: 同步模式下发送失败的最大重试次数, 默认为2</li><li><strong>retryTimesWhenSendAsyncFailed</strong>: 异步模式下发送失败时的最大重试次数，默认为2</li><li><strong>retryAnotherBrokerWhenNotStoreOK</strong>: 消息未成功存储时是否尝试其他Broker，默认为false</li><li><strong>maxMessageSize</strong>: 消息体的最大允许大小，默认为1024 * 1024 * 4(4MB)</li></ul><p><strong>异步发送控制</strong></p><ul><li>traceDispatcher: 异步传输的接口，默认为null</li><li>autoBatch: 是否开启自动批量发送消息的开关</li><li>produceAccumulator: 自动批量发送消息的累积器实例</li><li>enableBackpressureForAsyncMode: 是否在异步发送流量过大时启用阻塞机制, 默认false</li><li>backPressureForAsyncSendNum: 异步发送时最大允许的正在发送的消息数量，默认10000</li><li>backPressureForAsyncSendSize: 异步发送时最大允许的正在发送的消息总大小, 默认100 * 1024 * 1024(100MB)</li><li><strong>rpcHook</strong>: RPC 调用的钩子接口，用于处理调用前后的自定义逻辑</li><li>backPressureForAsyncSendNumLock: 确保backPressureForAsyncSendNum属性在运行时修改时是线程安全的</li><li>backPressureForAsyncSendSizeLock: 确保 backPressureForAsyncSendSize 属性在运行时修改时是线程安全的</li></ul><p><strong>压缩算法</strong></p><ul><li><strong>compressLevel</strong>: 压缩算法的压缩级别, 默认为5</li><li>compressType: 压缩算法的类型，默认为ZLIB</li><li>compressor: 压缩算法的具体实现，由compressType决定</li></ul><h3 id="clientconfig客户端配置" tabindex="-1">ClientConfig客户端配置 <a class="header-anchor" href="#clientconfig客户端配置" aria-label="Permalink to &quot;ClientConfig客户端配置&quot;">​</a></h3><p>由于DefaultMQProducer继承了ClientConfig这个类，可以看一下ClientConfig的属性都有什么，主要是用来管理客户端与RocketMQ集群之间的各种功能配置的。</p><p><strong>网络配置</strong></p><ul><li>namesrvAddr: 指定NameServer的地址列表，用于客户端连接和获取主题路由信息，默认值NameServerAddressUtils.getNameServerAddresses()</li><li>clientIP: 客户端本机的IP地址, 默认值NetworkUtil.getLocalAddress()</li><li>instanceName: 用于标识客户端实例的名称，最后有唯一性，默认值System.getProperty(&quot;rocketmq.client.name&quot;, &quot;DEFAULT&quot;)</li><li>accessChannel: 指定访问渠道，主要区分本地部署和云服务</li><li>socksProxyConfig: 配置SOCKS代理，用于跨网络访问</li></ul><p><strong>线程和性能配置</strong></p><ul><li>clientCallbackExecutorThreads: 回调线程池的线程数，用于处理异步操作的回调任务, 默认与CPU核心数一致</li><li>pollNameServerInterval: 定期从 NameServer 拉取路由信息的间隔时间, 默认30S</li><li>heartbeatBrokerInterval: 与Broker之间发送心跳包的间隔时间, 用于维持连接，通知Broker客户端的存活状态, 默认30秒</li><li>persistConsumerOffsetInterval: 消费者定期持久化消费进度的时间间隔, 防止因异常导致消费进度丢失, 默认5秒</li><li>pullTimeDelayMillsWhenException: 在拉取消息发生异常时，延迟下一次拉取的时间</li></ul><p><strong>功能开关和行为控制</strong></p><ul><li>enableTrace: 开启后，可以记录消息的流转过程，用于监控和问题排查, 默认为false</li><li>traceTopic: 指定消息追踪的主题名。如果未设置，将使用默认的追踪主题</li><li>decodeReadBody: 指定是否解码读取的消息体, 默认值System.getProperty(DECODE_READ_BODY, &quot;true&quot;)</li><li>decodeDecompressBody: 当消息被压缩时，该选项决定是否在客户端进行解压, 默认值System.getProperty(DECODE_DECOMPRESS_BODY, &quot;true&quot;)</li><li>vipChannelEnabled: VIP 通道是 RocketMQ 的一种优化机制，通过专用端口提高性能, System.getProperty(SEND_MESSAGE_WITH_VIP_CHANNEL_PROPERTY, &quot;false&quot;)</li><li>useTLS: 是否启用TLS加密，默认为false</li><li>unitMode和unitName: 支持多租户的功能</li><li>enableStreamRequestType: 是否启用流式请求类型, 默认为false</li><li>sendLatencyEnable: 是否开启发送延迟容错机制, 不要在顺序消息（Order Message）场景下开启，否则可能破坏顺序性, 默认为false</li><li>enableHeartbeatChannelEventListener: 在心跳检测失败时触发事件处理逻辑, 默认值为true</li><li>startDetectorEnable: 开启后，在客户端启动时进行一系列检测，如网络连接和配置验证, 默认为false</li></ul><p><strong>超时和检测相关</strong></p><ul><li>mqClientApiTimeout: 指定客户端API调用的超时时间, 默认3秒</li><li>detectTimeout: 检测操作的超时时间，通常用于快速检查机制，默认200毫秒</li><li>detectInterval: 检测操作的间隔时间，默认2*1000(2秒)</li></ul><p><strong>语言和环境</strong></p><ul><li>language: 指定客户端使用的编程语言, 主要用于服务端统计和标识客户端来源, 默认值JAVA</li></ul><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>可以看出来ClientConfig是生产者跟消费者都要用到的</p></div><h3 id="defaultmqproducerimpl" tabindex="-1">DefaultMQProducerImpl <a class="header-anchor" href="#defaultmqproducerimpl" aria-label="Permalink to &quot;DefaultMQProducerImpl&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public DefaultMQProducerImpl(final DefaultMQProducer defaultMQProducer, RPCHook rpcHook) {</span></span>
<span class="line"><span>  this.defaultMQProducer = defaultMQProducer;</span></span>
<span class="line"><span>  this.rpcHook = rpcHook;</span></span>
<span class="line"><span>  // 初始化异步发送线程池</span></span>
<span class="line"><span>  this.asyncSenderThreadPoolQueue = new LinkedBlockingQueue&lt;&gt;(50000);</span></span>
<span class="line"><span>  this.defaultAsyncSenderExecutor = new ThreadPoolExecutor(Runtime.getRuntime().availableProcessors(), Runtime.getRuntime().availableProcessors(),1000 * 60,TimeUnit.MILLISECONDS,this.asyncSenderThreadPoolQueue,new ThreadFactoryImpl(&quot;AsyncSenderExecutor_&quot;));</span></span>
<span class="line"><span>  semaphoreAsyncSendNum = new Semaphore(Math.max(defaultMQProducer.getBackPressureForAsyncSendNum(), 10), true);</span></span>
<span class="line"><span>  semaphoreAsyncSendSize = new Semaphore(Math.max(defaultMQProducer.getBackPressureForAsyncSendSize(), 1024 * 1024), true);</span></span>
<span class="line"><span>  ServiceDetector serviceDetector = new ServiceDetector() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public boolean detect(String endpoint, long timeoutMillis) {</span></span>
<span class="line"><span>        MessageQueue mq = new MessageQueue(candidateTopic.get(), null, 0);</span></span>
<span class="line"><span>        mQClientFactory.getMQClientAPIImpl().getMaxOffset(endpoint, mq, timeoutMillis);</span></span>
<span class="line"><span>        return true;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span>  this.mqFaultStrategy = new MQFaultStrategy(defaultMQProducer.cloneClientConfig(), new Resolver() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public String resolve(String name) {</span></span>
<span class="line"><span>          return DefaultMQProducerImpl.this.mQClientFactory.findBrokerAddressInPublish(name);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>  }, serviceDetector);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><h3 id="defaultmqproducerimpl核心属性" tabindex="-1">DefaultMQProducerImpl核心属性 <a class="header-anchor" href="#defaultmqproducerimpl核心属性" aria-label="Permalink to &quot;DefaultMQProducerImpl核心属性&quot;">​</a></h3><p>我们看看DefaultMQProducerImpl这个类有什么属性, 这里说明一下。</p><p><strong>消息发布管理</strong></p><ul><li>topicPublishInfoTable: 用于存储主题与其发布信息之间的关系, TopicPublishInfo包含了与主题相关的路由和消息发布信息</li></ul><p><strong>钩子扩展相关</strong></p><ul><li>sendMessageHookList: 存储发送消息的钩子列表，用于在消息发送之前或之后执行一些自定义逻辑。</li><li>endTransactionHookList: 存储事务结束的钩子列表, 用于在事务消息提交或回滚后执行额外的逻辑</li><li>rpcHook: 用于在 RPC 调用之前和之后执行自定义逻辑, 常用于处理认证、日志记录或其他与 RPC 相关的操作</li><li>checkForbiddenHookList: 存储检查是否禁止某些操作的钩子列表,在执行操作之前进行权限或逻辑验证</li></ul><p><strong>异步发送相关</strong></p><ul><li>asyncSenderThreadPoolQueue: 异步消息发送线程池的任务队列, 默认队列大小50000</li><li>defaultAsyncSenderExecutor: 默认的异步消息发送线程池, 默认最大线程数跟最小线程数都是CPU核数</li><li>asyncSenderExecutor: 异步消息发送线程池的实现，自定义自己的异步发送队列线程池</li><li>semaphoreAsyncSendNum: 限制异步发送消息时的最大并发消息数量</li><li>semaphoreAsyncSendSize: 限制异步发送消息时的最大消息大小总量</li></ul><p><strong>事务消息相关</strong></p><ul><li>endTransactionHookList: 存储事务结束的钩子列表, 用于在事务消息提交或回滚后执行额外的逻辑</li><li>checkRequestQueue: 用于存储校验任务（如事务校验）的任务队列, 默认大小3000</li><li>checkExecutor: 执行校验任务（如事务检查）的线程池， 默认最大线程数跟最小线程数都是1</li></ul><p><strong>容错策略相关</strong></p><ul><li>mqFaultStrategy: 消息队列的容错策略, 用于处理在Broker不可用或其他故障情况下的消息发送策略选择</li></ul><h2 id="producer启动" tabindex="-1">Producer启动 <a class="header-anchor" href="#producer启动" aria-label="Permalink to &quot;Producer启动&quot;">​</a></h2><p>接下来我们看一下Producer发送消息Demo中第12行代码生产者的启动流程，具体为DefaultMQProducer#start方法。</p><div class="language-DefaultMQProducer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override </span></span>
<span class="line"><span>public void start() throws MQClientException {</span></span>
<span class="line"><span>  this.setProducerGroup(withNamespace(this.producerGroup));</span></span>
<span class="line highlighted"><span>  this.defaultMQProducerImpl.start();</span></span>
<span class="line"><span>  if (this.produceAccumulator != null) {</span></span>
<span class="line highlighted"><span>    this.produceAccumulator.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  if (enableTrace) {</span></span>
<span class="line"><span>    AsyncTraceDispatcher dispatcher = new AsyncTraceDispatcher(producerGroup, TraceDispatcher.Type.PRODUCE, getTraceMsgBatchNum(), traceTopic, rpcHook);</span></span>
<span class="line"><span>    traceDispatcher = dispatcher;</span></span>
<span class="line"><span>    this.defaultMQProducerImpl.registerSendMessageHook(</span></span>
<span class="line"><span>            new SendMessageTraceHookImpl(traceDispatcher));</span></span>
<span class="line"><span>    this.defaultMQProducerImpl.registerEndTransactionHook(</span></span>
<span class="line"><span>            new EndTransactionTraceHookImpl(traceDispatcher));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  if (null != traceDispatcher) {</span></span>
<span class="line"><span>    ((AsyncTraceDispatcher) traceDispatcher).getTraceProducer().setUseTLS(isUseTLS());</span></span>
<span class="line highlighted"><span>    traceDispatcher.start(this.getNamesrvAddr(), this.getAccessChannel());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>可以看到核心做了三件事，具体如下</p><ul><li>调用defaultMQProducerImpl的start方法</li><li>如果启用监控功能，就注册两个钩子，分别在消息发送跟事务消息结束的时候调用钩子将消息放到traceDispatcher里面</li><li>启用traceDispatcher的start方法，启用traceDispatcher</li></ul><p>traceDispatcher是一种异步追踪分发器，用于处理消息追踪 (Message Trace) 的功能, 点击<a href="https://www.jianshu.com/p/c722cbfe96d9" target="_blank" rel="noreferrer">这里</a></p><ul><li>当消息生产者生产消息时，AsyncTraceDispatcher 会捕获相关的追踪数据（例如消息的唯一 ID、发送时间、目标队列等）</li><li>收集到的追踪数据会被异步发送到<strong>traceTopic</strong>，这样可以减少对正常业务逻辑的干扰</li><li>消息追踪数据存储在traceTopic后，可以通过专门的分析工具进行消费和分析，方便排查问题或监控性能。</li></ul><h3 id="defaultmqproducerimpl-start" tabindex="-1">defaultMQProducerImpl#start <a class="header-anchor" href="#defaultmqproducerimpl-start" aria-label="Permalink to &quot;defaultMQProducerImpl#start&quot;">​</a></h3><p>接下来看看defaultMQProducerImpl#start这个方法做的事情。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 检查producerGroup是否合法</span></span>
<span class="line"><span>this.checkConfig();</span></span>
<span class="line"><span>// 修改生产者的InstanceNameToPID</span></span>
<span class="line"><span>if (!this.defaultMQProducer.getProducerGroup().equals(MixAll.CLIENT_INNER_PRODUCER_GROUP)) {</span></span>
<span class="line"><span>  this.defaultMQProducer.changeInstanceNameToPID();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>// 创建MQClientInstance实例，有则返回，无则创建</span></span>
<span class="line"><span>this.mQClientFactory = MQClientManager.getInstance().getOrCreateMQClientInstance(this.defaultMQProducer, rpcHook);</span></span>
<span class="line"><span>// 向mQClientInstance注册生产者</span></span>
<span class="line"><span>boolean registerOK = mQClientFactory.registerProducer(this.defaultMQProducer.getProducerGroup(), this);</span></span>
<span class="line"><span>// 启动mQClientFactory</span></span>
<span class="line"><span>mQClientFactory.start();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><ul><li>首先检查配置是否有效；如果不是默认的ProducerGroup，则将其转化为PID</li><li>创建mQClientFactory，注意整个JVM只有一个MQClientManager实例，维护的是一个ConcurrentMap&lt;String/* clientId */, MQClientInstance&gt;表，根据ClientId来区分mQClientFactory，我们看看获取ClientId的方法。<div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public String buildMQClientId() {</span></span>
<span class="line"><span>  StringBuilder sb = new StringBuilder();</span></span>
<span class="line"><span>  sb.append(this.getClientIP());</span></span>
<span class="line"><span>  sb.append(&quot;@&quot;);</span></span>
<span class="line"><span>  sb.append(this.getInstanceName());</span></span>
<span class="line"><span>  if (!UtilAll.isBlank(this.unitName)) {</span></span>
<span class="line"><span>      sb.append(&quot;@&quot;);</span></span>
<span class="line"><span>      sb.append(this.unitName);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  if (enableStreamRequestType) {</span></span>
<span class="line"><span>      sb.append(&quot;@&quot;);</span></span>
<span class="line"><span>      sb.append(RequestType.STREAM);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return sb.toString();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div>可以看到是用了InstanceName，为了避免唯一性问题，如果使用的不是默认的生产者组话，会将InstanceName转化成为PID</li></ul><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 初始化主题路由</span></span>
<span class="line"><span>this.initTopicRoute();</span></span>
<span class="line"><span>// 启动消息队列的容错策略的检查</span></span>
<span class="line"><span>this.mqFaultStrategy.startDetector();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><ul><li>将生产者组注册到mQClientFactory中，并且启动mQClientFactory</li></ul><h3 id="mqclientfactory-start" tabindex="-1">mQClientFactory#start <a class="header-anchor" href="#mqclientfactory-start" aria-label="Permalink to &quot;mQClientFactory#start&quot;">​</a></h3><div class="language-MQClientFactory vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQClientFactory</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void start() throws MQClientException {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  synchronized (this) {</span></span>
<span class="line"><span>    switch (this.serviceState) {</span></span>
<span class="line"><span>      case CREATE_JUST:</span></span>
<span class="line"><span>        this.serviceState = ServiceState.START_FAILED;</span></span>
<span class="line"><span>        // 如果没有配置NameServer，则拉取NameServer的地址</span></span>
<span class="line"><span>        if (null == this.clientConfig.getNamesrvAddr()) {</span></span>
<span class="line"><span>          this.mQClientAPIImpl.fetchNameServerAddr();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // 启动remotingClient, 即netty客户端</span></span>
<span class="line"><span>        this.mQClientAPIImpl.start();</span></span>
<span class="line"><span>        // 启动定时任务</span></span>
<span class="line"><span>        this.startScheduledTask();</span></span>
<span class="line"><span>        // 启动pullMessage的服务</span></span>
<span class="line"><span>        this.pullMessageService.start();</span></span>
<span class="line"><span>        // 启动重平衡服务</span></span>
<span class="line"><span>        this.rebalanceService.start();</span></span>
<span class="line"><span>        // 启动PushMessage服务</span></span>
<span class="line"><span>        this.defaultMQProducer.getDefaultMQProducerImpl().start(false);</span></span>
<span class="line"><span>        log.info(&quot;the client factory [{}] start OK&quot;, this.clientId);</span></span>
<span class="line"><span>        this.serviceState = ServiceState.RUNNING;</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      case START_FAILED:</span></span>
<span class="line"><span>        throw new MQClientException(&quot;The Factory object[&quot; + this.getClientId() + &quot;] has been created before, and failed.&quot;, null);</span></span>
<span class="line"><span>      default:</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br></div></div><p>这个是客户端启动的核心方法，做了很多事情，我们先看整体代码, 下面一个一个分析，有些复杂的跟后面相关的内容就先留着。</p><h3 id="拉取nameserver地址" tabindex="-1">拉取NameServer地址 <a class="header-anchor" href="#拉取nameserver地址" aria-label="Permalink to &quot;拉取NameServer地址&quot;">​</a></h3><div class="language-MQClientAPIImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQClientAPIImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public String fetchNameServerAddr() {</span></span>
<span class="line highlighted"><span>  String addrs = this.topAddressing.fetchNSAddr();</span></span>
<span class="line"><span>  if (!UtilAll.isBlank(addrs)) {</span></span>
<span class="line"><span>      if (!addrs.equals(this.nameSrvAddr)) {</span></span>
<span class="line"><span>          log.info(&quot;name server address changed, old=&quot; + this.nameSrvAddr + &quot;, new=&quot; + addrs);</span></span>
<span class="line"><span>          this.updateNameServerAddressList(addrs);</span></span>
<span class="line"><span>          this.nameSrvAddr = addrs;</span></span>
<span class="line"><span>          return nameSrvAddr;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return nameSrvAddr;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>主要通过topAddressing.fetchNSAddr, 默认会去 <a href="http://jmenv.tbsite.net:8080/rocketmq/nsaddr" target="_blank" rel="noreferrer">http://jmenv.tbsite.net:8080/rocketmq/nsaddr</a> 拉取NameServer地址，具体可以参照<a href="https://rocketmq.apache.org/zh/docs/4.x/parameterConfiguration/01local/" target="_blank" rel="noreferrer">这里</a></p><h3 id="启动mqclient" tabindex="-1">启动MQClient <a class="header-anchor" href="#启动mqclient" aria-label="Permalink to &quot;启动MQClient&quot;">​</a></h3><p>this.mQClientAPIImpl#start里面调用了remotingClient#start，remotingClient就是一个NettyClient, 我们大致看一下MQClientAPIImpl初始化remotingClient的地方。</p><div class="language-MQClientAPIImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQClientAPIImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public MQClientAPIImpl(final NettyClientConfig nettyClientConfig,</span></span>
<span class="line"><span>                        final ClientRemotingProcessor clientRemotingProcessor,</span></span>
<span class="line"><span>                        RPCHook rpcHook, final ClientConfig clientConfig, final ChannelEventListener channelEventListener) {</span></span>
<span class="line"><span>  this.clientConfig = clientConfig;</span></span>
<span class="line"><span>  topAddressing = new DefaultTopAddressing(MixAll.getWSAddr(), clientConfig.getUnitName());</span></span>
<span class="line"><span>  topAddressing.registerChangeCallBack(this);</span></span>
<span class="line"><span>  this.remotingClient = new NettyRemotingClient(nettyClientConfig, channelEventListener);</span></span>
<span class="line"><span>  this.clientRemotingProcessor = clientRemotingProcessor;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  this.remotingClient.registerRPCHook(new NamespaceRpcHook(clientConfig));</span></span>
<span class="line"><span>  // Inject stream rpc hook first to make reserve field signature</span></span>
<span class="line"><span>  if (clientConfig.isEnableStreamRequestType()) {</span></span>
<span class="line"><span>    this.remotingClient.registerRPCHook(new StreamTypeRPCHook());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  this.remotingClient.registerRPCHook(rpcHook);</span></span>
<span class="line"><span>  this.remotingClient.registerRPCHook(new DynamicalExtFieldRPCHook());</span></span>
<span class="line"><span>  this.remotingClient.registerProcessor(RequestCode.CHECK_TRANSACTION_STATE, this.clientRemotingProcessor, null);</span></span>
<span class="line"><span>  this.remotingClient.registerProcessor(RequestCode.NOTIFY_CONSUMER_IDS_CHANGED, this.clientRemotingProcessor, null);</span></span>
<span class="line"><span>  this.remotingClient.registerProcessor(RequestCode.RESET_CONSUMER_CLIENT_OFFSET, this.clientRemotingProcessor, null);</span></span>
<span class="line"><span>  this.remotingClient.registerProcessor(RequestCode.GET_CONSUMER_STATUS_FROM_CLIENT, this.clientRemotingProcessor, null);</span></span>
<span class="line"><span>  this.remotingClient.registerProcessor(RequestCode.GET_CONSUMER_RUNNING_INFO, this.clientRemotingProcessor, null);</span></span>
<span class="line"><span>  this.remotingClient.registerProcessor(RequestCode.CONSUME_MESSAGE_DIRECTLY, this.clientRemotingProcessor, null);</span></span>
<span class="line"><span>  this.remotingClient.registerProcessor(RequestCode.PUSH_REPLY_MESSAGE_TO_CLIENT, this.clientRemotingProcessor, null);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>也是定义了一系列的业务处理函数，看起来还是消费者用得会比较多。</p><h3 id="启动定时任务" tabindex="-1">启动定时任务 <a class="header-anchor" href="#启动定时任务" aria-label="Permalink to &quot;启动定时任务&quot;">​</a></h3><p>MQClientInstance定义的定时任务有五个，我们先看一下代码，然后再说明一下这些定时任务做了什么。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private void startScheduledTask() {</span></span>
<span class="line"><span>  // 获取nameserver地址</span></span>
<span class="line"><span>  if (null == this.clientConfig.getNamesrvAddr()) {</span></span>
<span class="line"><span>    this.scheduledExecutorService.scheduleAtFixedRate(() -&gt; {</span></span>
<span class="line"><span>      MQClientInstance.this.mQClientAPIImpl.fetchNameServerAddr()</span></span>
<span class="line"><span>    }, 1000 * 10, 1000 * 60 * 2, TimeUnit.MILLISECONDS);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 更新topic信息</span></span>
<span class="line"><span>  this.scheduledExecutorService.scheduleAtFixedRate(() -&gt; {</span></span>
<span class="line"><span>    MQClientInstance.this.updateTopicRouteInfoFromNameServer();</span></span>
<span class="line"><span>  }, 10, this.clientConfig.getPollNameServerInterval(), TimeUnit.MILLISECONDS);</span></span>
<span class="line"><span>  // 发送心跳到broker，</span></span>
<span class="line"><span>  this.scheduledExecutorService.scheduleAtFixedRate(() -&gt; {</span></span>
<span class="line"><span>      MQClientInstance.this.cleanOfflineBroker();</span></span>
<span class="line"><span>      MQClientInstance.this.sendHeartbeatToAllBrokerWithLock();</span></span>
<span class="line"><span>  }, 1000, this.clientConfig.getHeartbeatBrokerInterval(), TimeUnit.MILLISECONDS);</span></span>
<span class="line"><span>  // 持久化消费的Offset</span></span>
<span class="line"><span>  this.scheduledExecutorService.scheduleAtFixedRate(() -&gt; {</span></span>
<span class="line"><span>    MQClientInstance.this.persistAllConsumerOffset();</span></span>
<span class="line"><span>  }, 1000 * 10, this.clientConfig.getPersistConsumerOffsetInterval(), TimeUnit.MILLISECONDS);</span></span>
<span class="line"><span>  // 调整线程池</span></span>
<span class="line"><span>  this.scheduledExecutorService.scheduleAtFixedRate(() -&gt; {</span></span>
<span class="line"><span>    MQClientInstance.this.adjustThreadPool();</span></span>
<span class="line"><span>  }, 1, 1, TimeUnit.MINUTES);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><ul><li>如果用户没有定义clientConfig的nameServer地址的话，每隔两分钟刷新一遍</li><li>每隔pollNameServerInterval(默认30秒)从NameServer当中更新一遍TopicRoute的信息</li><li>每隔heartbeatBrokerInterval(默认30秒)发送一次心跳给Broker，并且清理不在线的Broker</li><li>每隔PersistConsumerOffsetInterval(默认5秒)持久化一遍ConsumerOffset</li><li>每分钟调整一遍线程池的corePoolSize</li></ul><h3 id="pullmessage服务和pushmessage服务" tabindex="-1">pullMessage服务和PushMessage服务 <a class="header-anchor" href="#pullmessage服务和pushmessage服务" aria-label="Permalink to &quot;pullMessage服务和PushMessage服务&quot;">​</a></h3><p>消费者消费消息的章节再讲</p><h3 id="重平衡服务" tabindex="-1">重平衡服务 <a class="header-anchor" href="#重平衡服务" aria-label="Permalink to &quot;重平衡服务&quot;">​</a></h3><p>消费者重平衡章节再讲</p><h2 id="producer消息发送" tabindex="-1">Producer消息发送 <a class="header-anchor" href="#producer消息发送" aria-label="Permalink to &quot;Producer消息发送&quot;">​</a></h2><p>接下来我们梳理一下Producer的消息发送流程，DefaultMQProducer#send -&gt; DefaultMQProducerImpl#send -&gt; DefaultMQProducerImpl#sendDefaultImpl, 直接从这个方法开始看起。</p><h3 id="消息校验" tabindex="-1">消息校验 <a class="header-anchor" href="#消息校验" aria-label="Permalink to &quot;消息校验&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>this.makeSureStateOK();</span></span>
<span class="line"><span>Validators.checkMessage(msg, this.defaultMQProducer);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>首先检查一下MQProducer是处于运行状态，然后检查消息是否符合规范，比如主题是否为空，长度是否正常(小于127)，是否包含不合法字符, 是否禁止发送的主题；消息体不能为空，长度是否满足要求(小于4M)等等</p><h3 id="查找topic的路由信息" tabindex="-1">查找Topic的路由信息 <a class="header-anchor" href="#查找topic的路由信息" aria-label="Permalink to &quot;查找Topic的路由信息&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>TopicPublishInfo topicPublishInfo = this.tryToFindTopicPublishInfo(msg.getTopic());</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>跟进tryToFindTopicPublishInfo这个方法里面看一下，代码如下</p><div class="language-DefaultMQProducerImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducerImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private TopicPublishInfo tryToFindTopicPublishInfo(final String topic) {</span></span>
<span class="line"><span>  TopicPublishInfo topicPublishInfo = this.topicPublishInfoTable.get(topic);</span></span>
<span class="line"><span>  if (null == topicPublishInfo || !topicPublishInfo.ok()) {</span></span>
<span class="line"><span>    this.topicPublishInfoTable.putIfAbsent(topic, new TopicPublishInfo());</span></span>
<span class="line"><span>    // 从nameserver获取topic路由信息</span></span>
<span class="line"><span>    this.mQClientFactory.updateTopicRouteInfoFromNameServer(topic);</span></span>
<span class="line"><span>    topicPublishInfo = this.topicPublishInfoTable.get(topic);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (topicPublishInfo.isHaveTopicRouterInfo() || topicPublishInfo.ok()) {</span></span>
<span class="line"><span>    return topicPublishInfo;</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    this.mQClientFactory.updateTopicRouteInfoFromNameServer(topic, true, this.defaultMQProducer);</span></span>
<span class="line"><span>    topicPublishInfo = this.topicPublishInfoTable.get(topic);</span></span>
<span class="line"><span>    return topicPublishInfo;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><ul><li>首先看topicPublishInfoTable是否已经有这个Topic的路由信息了，如果有直接返回</li><li>如果没有，则调用updateTopicRouteInfoFromNameServer(topic)从NameServer查找这个主题的路由信息</li><li>如果NameServer没有这个主题的路由信息，那么就会调用updateTopicRouteInfoFromNameServer(topic, true, this.defaultMQProducer)获取默认的主题路由信息, 默认的主题是TBW102</li></ul><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>如果是新的主题，只是在本地生成了一个新的主题路由信息，具体是否可以创建主题要看Broker的配置，如果Broker的autoCreateTopicEnable为true，就可以自动创建主题。</p></div><p><strong>updateTopicRouteInfoFromNameServer</strong></p><p>大致看一下updateTopicRouteInfoFromNameServer这个方法做的事情吧。</p><div class="language-DefaultMQProducerImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducerImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public boolean updateTopicRouteInfoFromNameServer(final String topic, boolean isDefault,</span></span>
<span class="line"><span>                                                  DefaultMQProducer defaultMQProducer) {</span></span>
<span class="line"><span>  if (isDefault &amp;&amp; defaultMQProducer != null) {</span></span>
<span class="line"><span>    // 获取默认的主题TBW102的路由信息</span></span>
<span class="line"><span>    topicRouteData = this.mQClientAPIImpl.getDefaultTopicRouteInfoFromNameServer(clientConfig.getMqClientApiTimeout());</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    // 获取传进来的主题的路由信息</span></span>
<span class="line"><span>    topicRouteData = this.mQClientAPIImpl.getTopicRouteInfoFromNameServer(topic, clientConfig.getMqClientApiTimeout());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  TopicRouteData old = this.topicRouteTable.get(topic);</span></span>
<span class="line"><span>  boolean changed = topicRouteData.topicRouteDataChanged(old);</span></span>
<span class="line"><span>  if (changed) {</span></span>
<span class="line"><span>    // 更新topicEndPointsTable</span></span>
<span class="line"><span>    topicEndPointsTable.put(topic, mqEndPoints);</span></span>
<span class="line"><span>    // 更新topicPublishInfoTable，所以在tryToFindTopicPublishInfo中调用了这个方法之后topicPublishInfoTable会更新</span></span>
<span class="line"><span>    impl.updateTopicPublishInfo(topic, publishInfo);</span></span>
<span class="line"><span>    if (!consumerTable.isEmpty()) {</span></span>
<span class="line"><span>      // 消费者也更新路由信息</span></span>
<span class="line"><span>      impl.updateTopicSubscribeInfo(topic, subscribeInfo);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 放入topicRouteTable</span></span>
<span class="line"><span>    this.topicRouteTable.put(topic, cloneTopicRouteData);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>目前有两个地方会拉取刷新主题的路由信息</p><ul><li>每隔30S会刷新所有主题的路由信息(只有这里会刷新所有的路由信息)</li><li>在发送信息的时候如果本地没有保存主题的路由信息，会拉取该主题的路由信息</li></ul><h3 id="选择消息队列" tabindex="-1">选择消息队列 <a class="header-anchor" href="#选择消息队列" aria-label="Permalink to &quot;选择消息队列&quot;">​</a></h3><div class="language-DefaultMQProducerImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducerImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int times = 0;</span></span>
<span class="line"><span>// 如果是同步消息发送，timesTotal就是1+retryTimesWhenSendFailed配置的次数</span></span>
<span class="line"><span>int timesTotal = communicationMode == CommunicationMode.SYNC ? 1 + this.defaultMQProducer.getRetryTimesWhenSendFailed() : 1;</span></span>
<span class="line"><span>for (; times &lt; timesTotal; times++) {</span></span>
<span class="line"><span>  String lastBrokerName = null == mq ? null : mq.getBrokerName();</span></span>
<span class="line"><span>  if (times &gt; 0) {</span></span>
<span class="line"><span>    resetIndex = true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  MessageQueue mqSelected = this.selectOneMessageQueue(topicPublishInfo, lastBrokerName, resetIndex);</span></span>
<span class="line"><span>  mq = mqSelected;</span></span>
<span class="line"><span>  beginTimestampPrev = System.currentTimeMillis();</span></span>
<span class="line"><span>  sendResult = this.sendKernelImpl(msg, mq, communicationMode, sendCallback, topicPublishInfo, timeout - costTime);</span></span>
<span class="line"><span>  this.updateFaultItem(mq.getBrokerName(), endTimestamp - beginTimestampPrev, false, true);</span></span>
<span class="line"><span>  .....</span></span>
<span class="line"><span>  # 发送失败重新走发送循环</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>调用栈selectOneMessageQueue-&gt;this.mqFaultStrategy#selectOneMessageQueue, mqFaultStrategy只有一个实现类MQFaultStrategy，查看MQFaultStrategy#selectOneMessageQueue方法。</p><div class="language-MQFaultStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQFaultStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public MessageQueue selectOneMessageQueue(final TopicPublishInfo tpInfo, final String lastBrokerName, final boolean resetIndex) {</span></span>
<span class="line"><span>  BrokerFilter brokerFilter = threadBrokerFilter.get();</span></span>
<span class="line"><span>  brokerFilter.setLastBrokerName(lastBrokerName);</span></span>
<span class="line"><span>  // 是否启用Broker故障延迟机制，默认为false</span></span>
<span class="line"><span>  if (this.sendLatencyFaultEnable) {</span></span>
<span class="line"><span>    if (resetIndex) {</span></span>
<span class="line"><span>        tpInfo.resetIndex();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 注释1</span></span>
<span class="line"><span>    MessageQueue mq = tpInfo.selectOneMessageQueue(availableFilter, brokerFilter);</span></span>
<span class="line"><span>    if (mq != null) {</span></span>
<span class="line"><span>        return mq;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 注释2</span></span>
<span class="line"><span>    mq = tpInfo.selectOneMessageQueue(reachableFilter, brokerFilter);</span></span>
<span class="line"><span>    if (mq != null) {</span></span>
<span class="line"><span>        return mq;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return tpInfo.selectOneMessageQueue();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 注释3</span></span>
<span class="line"><span>  MessageQueue mq = tpInfo.selectOneMessageQueue(brokerFilter);</span></span>
<span class="line"><span>  if (mq != null) {</span></span>
<span class="line"><span>      return mq;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return tpInfo.selectOneMessageQueue();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>我们先分析一下上面这些代码涉及的选择队列的方法跟一些过滤器</p><p><strong>selectOneMessageQueue</strong></p><div class="language-TopicPublishInfo vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">TopicPublishInfo</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public MessageQueue selectOneMessageQueue() {</span></span>
<span class="line"><span>    int index = this.sendWhichQueue.incrementAndGet();</span></span>
<span class="line"><span>    int pos = index % this.messageQueueList.size();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return this.messageQueueList.get(pos);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>没有参数的这个selectOneMessageQueue方法很好理解，就是轮询算法。</p><div class="language-TopicPublishInfo vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">TopicPublishInfo</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public MessageQueue selectOneMessageQueue(QueueFilter ...filter) {</span></span>
<span class="line"><span>  return selectOneMessageQueue(this.messageQueueList, this.sendWhichQueue, filter);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>private MessageQueue selectOneMessageQueue(List&lt;MessageQueue&gt; messageQueueList, ThreadLocalIndex sendQueue, QueueFilter ...filter) {</span></span>
<span class="line"><span>  if (messageQueueList == null || messageQueueList.isEmpty()) {</span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 调用QueueFilter的filter方法，队列满足就返回</span></span>
<span class="line"><span>  if (filter != null &amp;&amp; filter.length != 0) {</span></span>
<span class="line"><span>    for (int i = 0; i &lt; messageQueueList.size(); i++) {</span></span>
<span class="line"><span>      int index = Math.abs(sendQueue.incrementAndGet() % messageQueueList.size());</span></span>
<span class="line"><span>      MessageQueue mq = messageQueueList.get(index);</span></span>
<span class="line"><span>      boolean filterResult = true;</span></span>
<span class="line"><span>      for (QueueFilter f: filter) {</span></span>
<span class="line"><span>        Preconditions.checkNotNull(f);</span></span>
<span class="line"><span>        filterResult &amp;= f.filter(mq);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      if (filterResult) {</span></span>
<span class="line"><span>        return mq;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 没有Filter, 就跟selectOneMessageQueue()一样了</span></span>
<span class="line"><span>  int index = Math.abs(sendQueue.incrementAndGet() % messageQueueList.size());</span></span>
<span class="line"><span>  return messageQueueList.get(index);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br></div></div><p>注释1，注释2，注释3用的都是这个方法来发送的，解释一下这几个参数。</p><ul><li>messageQueueList: 消息队列列表，就是上面从NameServer里面拉取的路由信息, 里面包含了主题，BrokerName跟queueId，queueId在每个Broker里都是从0开始的</li></ul><img src="`+l+`" alt="messageQueue"><ul><li>sendWhichQueue: 一个ThreadLocal变量，保存上一次发送的队列序号</li><li>filter: 就是用来筛选队列的过滤器</li></ul><p><strong>brokerFilter</strong></p><div class="language-MQFaultStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQFaultStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public static class BrokerFilter implements QueueFilter {</span></span>
<span class="line"><span>  private String lastBrokerName;</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean filter(MessageQueue mq) {</span></span>
<span class="line"><span>    if (lastBrokerName != null) {</span></span>
<span class="line"><span>        return !mq.getBrokerName().equals(lastBrokerName);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>BrokerFilter的filter方法很简单，就是看是不是上次发送的BrokerName，如果是的话则过滤掉，因为之前往这个Broker发送信息已经失败了</p><p><strong>availableFilter</strong></p><div class="language-MQFaultStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQFaultStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private QueueFilter availableFilter = new QueueFilter() {</span></span>
<span class="line"><span>  @Override public boolean filter(MessageQueue mq) {</span></span>
<span class="line"><span>    return latencyFaultTolerance.isAvailable(mq.getBrokerName());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>latencyFaultTolerance的具体实现是LatencyFaultToleranceImpl，很明显就是看这个Broker是否可用的。如果想探究细节可以往下看，不然就可以拉到下一个reachableFilter过滤器了。</p><p>我们看一下他的isAvailable方法。</p><div class="language-LatencyFaultToleranceImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">LatencyFaultToleranceImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public boolean isAvailable(final String name) {</span></span>
<span class="line"><span>  final FaultItem faultItem = this.faultItemTable.get(name);</span></span>
<span class="line"><span>  if (faultItem != null) {</span></span>
<span class="line"><span>      return faultItem.isAvailable();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return true;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>可以看到是从faultItemTable中通过BrokerName获取了一个FaultItem，看一下FaultItem都有什么。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class FaultItem implements Comparable&lt;FaultItem&gt; {</span></span>
<span class="line"><span>  private final String name;</span></span>
<span class="line"><span>  /* 当前的延迟时间 */</span></span>
<span class="line"><span>  private volatile long currentLatency;</span></span>
<span class="line"><span>  /* 从startTimestamp开始该FaultItem可用*/</span></span>
<span class="line"><span>  private volatile long startTimestamp;</span></span>
<span class="line"><span>  private volatile long checkStamp;</span></span>
<span class="line"><span>  /* 是否可达 */</span></span>
<span class="line"><span>  private volatile boolean reachableFlag;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>我们看看是在哪里往faultItemTable更新FaultItem的，具体代码如下所示</p><div class="language-LatencyFaultToleranceImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">LatencyFaultToleranceImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public void updateFaultItem(final String name, final long currentLatency, final long notAvailableDuration,</span></span>
<span class="line"><span>                            final boolean reachable) {</span></span>
<span class="line"><span>  FaultItem old = this.faultItemTable.get(name);</span></span>
<span class="line"><span>  // 如果之前没有则创建</span></span>
<span class="line"><span>  if (null == old) {</span></span>
<span class="line"><span>    final FaultItem faultItem = new FaultItem(name);</span></span>
<span class="line"><span>    faultItem.setCurrentLatency(currentLatency);</span></span>
<span class="line"><span>    faultItem.updateNotAvailableDuration(notAvailableDuration);</span></span>
<span class="line"><span>    faultItem.setReachable(reachable);</span></span>
<span class="line"><span>    old = this.faultItemTable.putIfAbsent(name, faultItem);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 如果之前有则更新</span></span>
<span class="line"><span>  if (null != old) {</span></span>
<span class="line"><span>    old.setCurrentLatency(currentLatency);</span></span>
<span class="line"><span>    old.updateNotAvailableDuration(notAvailableDuration);</span></span>
<span class="line"><span>    old.setReachable(reachable);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>具体是在哪里调用updateFaultItem的呢，回看DefaultMQProducerImpl#sendDefaultImpl发送信息的方法，在调用消息发送之后，不管成功还是失败都会调用。</p><div class="language-DefaultMQProducerImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducerImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>this.updateFaultItem(mq.getBrokerName(), endTimestamp - beginTimestampPrev, false, true);</span></span>
<span class="line"><span>this.updateFaultItem(mq.getBrokerName(), endTimestamp - beginTimestampPrev, false, true);</span></span>
<span class="line"><span>this.updateFaultItem(mq.getBrokerName(), endTimestamp - beginTimestampPrev, true, false);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>代码调用栈: DefaultMQProducerImpl#updateFaultItem -&gt; MqFaultStrategy#updateFaultItem, 我们看看这个的实现</p><div class="language-MQFaultStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQFaultStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void updateFaultItem(final String brokerName, final long currentLatency, boolean isolation,</span></span>
<span class="line"><span>                            final boolean reachable) {</span></span>
<span class="line"><span>  if (this.sendLatencyFaultEnable) {</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>      * RemotingException跟MQBrokerException的isolation是true，currentLatency为10000，其余的为currentLatency</span></span>
<span class="line"><span>      * 返回this.notAvailableDuration[index]</span></span>
<span class="line"><span>      */</span></span>
<span class="line"><span>    long duration = computeNotAvailableDuration(isolation ? 10000 : currentLatency);</span></span>
<span class="line"><span>    this.latencyFaultTolerance.updateFaultItem(brokerName, currentLatency, duration, reachable);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span>  *     private long[] latencyMax = {50L, 100L, 550L, 1800L, 3000L, 5000L, 15000L};</span></span>
<span class="line"><span>  *     private long[] notAvailableDuration = {0L, 0L, 2000L, 5000L, 6000L, 10000L, 30000L};</span></span>
<span class="line"><span>  *     从latencyMax的最后开始查找，找到小于currentLatency的index，返回notAvailableDuration[index]</span></span>
<span class="line"><span>  *     如果找不到，则返回0</span></span>
<span class="line"><span>  */</span></span>
<span class="line"><span>private long computeNotAvailableDuration(final long currentLatency) {</span></span>
<span class="line"><span>  for (int i = latencyMax.length - 1; i &gt;= 0; i--) {</span></span>
<span class="line"><span>    if (currentLatency &gt;= latencyMax[i]) {</span></span>
<span class="line"><span>      return this.notAvailableDuration[i];</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  return 0;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>根据延迟时间在latencyMax从后往前找到一个等级，然后根据这个等级获取对应的notAvailableDuration。</p><p>好了，这个时候我们再回看availableFilter#filter里面的isAvailable方法, 其实就是看一下当前时间是否大于startTimestamp</p><div class="language-LatencyFaultToleranceImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">LatencyFaultToleranceImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void updateNotAvailableDuration(long notAvailableDuration) {</span></span>
<span class="line"><span>  if (notAvailableDuration &gt; 0 &amp;&amp; System.currentTimeMillis() + notAvailableDuration &gt; this.startTimestamp) {</span></span>
<span class="line"><span>    this.startTimestamp = System.currentTimeMillis() + notAvailableDuration;</span></span>
<span class="line"><span>    log.info(name + &quot; will be isolated for &quot; + notAvailableDuration + &quot; ms.&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public boolean isAvailable() {</span></span>
<span class="line"><span>  return System.currentTimeMillis() &gt;= startTimestamp;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>而startTimestamp就是前面LatencyFaultToleranceImpl#updateFaultItem根据computeNotAvailableDuration计算出来的不可用时间+updateFaultItem的时间</p><p><strong>reachableFilter</strong></p><div class="language-MQFaultStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQFaultStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private QueueFilter reachableFilter = new QueueFilter() {</span></span>
<span class="line"><span>  @Override public boolean filter(MessageQueue mq) {</span></span>
<span class="line"><span>    return latencyFaultTolerance.isReachable(mq.getBrokerName());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>};</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>这个过滤器也很简单，就是看消息队列是否可达的。具体实现如下所示:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public boolean isReachable(final String name) {</span></span>
<span class="line"><span>  final FaultItem faultItem = this.faultItemTable.get(name);</span></span>
<span class="line"><span>  if (faultItem != null) {</span></span>
<span class="line"><span>    return faultItem.isReachable();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return true;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public class FaultItem implements Comparable&lt;FaultItem&gt; {</span></span>
<span class="line"><span>  public boolean isReachable() {</span></span>
<span class="line"><span>    return reachableFlag;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>这个条件跟上一个可用的条件相比会简单一些，具体这个值的更新上面availableFilter的代码分析已经讲到了，跟进一下就好了。</p><h3 id="消息队列选择总结" tabindex="-1">消息队列选择总结 <a class="header-anchor" href="#消息队列选择总结" aria-label="Permalink to &quot;消息队列选择总结&quot;">​</a></h3><p>有了以上分析，选择消息队列的策略就很简单了</p><ol><li>查看是否启用Broker故障延迟机制，如果没有开启故障延迟策略走第4步，否则走第2步</li><li>根据消息队列列表找到第一个Broker可用的消息队列，找到了直接返回，否则走下一步</li><li>根据消息队列列表找到第一个Broker可达的消息队列，找到了直接返回，否则走下一步</li><li>根据轮询方法在消息队列列表里面找下一个消息队列返回</li></ol><p>每一次发送消息失败或者成功都会更新消息队列列表里面Broker的可达/可用信息</p><div class="language-MQFaultStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQFaultStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public MessageQueue selectOneMessageQueue(final TopicPublishInfo tpInfo, final String lastBrokerName, final boolean resetIndex) {</span></span>
<span class="line"><span>  if (resetIndex) {</span></span>
<span class="line"><span>    tpInfo.resetIndex();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>注意MQFaultStrategy#selectOneMessageQueue方法里面在开启故障延迟的时候会根据resetIndex重置一下tpInfo选择的消息队列的下标，这是一个随机数，这样可以每次选择的时候随机一下，具体什么时候传入resetIndex，就是看当前发送的消息是不是重试的，如果是重试的，那么就重置一下。</p><h3 id="自定义消息选择策略" tabindex="-1">自定义消息选择策略 <a class="header-anchor" href="#自定义消息选择策略" aria-label="Permalink to &quot;自定义消息选择策略&quot;">​</a></h3><p>前面讲的消息队列是Rocketmq自己默认的消息队列选择策略，那么我们可以定义自己的路由选择策略吗？答案是有的。我们回看Provider发送消息的方法。</p><div class="language-DefaultMQProducer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public SendResult send(Message msg, MessageQueueSelector selector, Object arg)</span></span>
<span class="line"><span>        throws MQClientException, RemotingException, MQBrokerException, InterruptedException {</span></span>
<span class="line"><span>  msg.setTopic(withNamespace(msg.getTopic()));</span></span>
<span class="line highlighted"><span>  MessageQueue mq = this.defaultMQProducerImpl.invokeMessageQueueSelector(msg, selector, arg, this.getSendMsgTimeout());</span></span>
<span class="line"><span>  mq = queueWithNamespace(mq);</span></span>
<span class="line"><span>  if (this.getAutoBatch() &amp;&amp; !(msg instanceof MessageBatch)) {</span></span>
<span class="line"><span>    return sendByAccumulator(msg, mq, null);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    return sendDirect(msg, mq, null);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public SendResult sendDirect(Message msg, MessageQueue mq,</span></span>
<span class="line"><span>                              SendCallback sendCallback) throws MQClientException, RemotingException, InterruptedException, MQBrokerException {</span></span>
<span class="line"><span>  if (mq == null) {</span></span>
<span class="line"><span>    return this.defaultMQProducerImpl.send(msg);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    return this.defaultMQProducerImpl.send(msg, mq);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>看看invokeMessageQueueSelector方法</p><div class="language-DefaultMQProducerImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducerImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public MessageQueue invokeMessageQueueSelector(Message msg, MessageQueueSelector selector, Object arg,</span></span>
<span class="line"><span>        final long timeout) throws MQClientException, RemotingTooMuchRequestException {</span></span>
<span class="line"><span>  List&lt;MessageQueue&gt; messageQueueList =</span></span>
<span class="line"><span>          mQClientFactory.getMQAdminImpl().parsePublishMessageQueues(topicPublishInfo.getMessageQueueList());</span></span>
<span class="line"><span>  Message userMessage = MessageAccessor.cloneMessage(msg);</span></span>
<span class="line highlighted"><span>  String userTopic = NamespaceUtil.withoutNamespace(userMessage.getTopic(), mQClientFactory.getClientConfig().getNamespace());</span></span>
<span class="line"><span>  userMessage.setTopic(userTopic);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  mq = mQClientFactory.getClientConfig().queueWithNamespace(selector.select(messageQueueList, userMessage, arg));</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>可以看到流程跟默认的发送消息函数也是差不多的，都是先获取Topic的消息队列信息，然后选择队列，不同的地方有两个。</p><ul><li>如果使用的MessageQueueSelector没有找到消息队列的话，也会走默认的消息发送流程，用rocketmq的默认消息队列选择策略</li><li>如果使用的MessageQueueSelector消息队列找到消息队列就往这个消息队列发，但是发送消息之后不会更新这个消息队列所在的Broker的信息了</li></ul><p>Rocketmq也默认给我提供了几个MessageQueueSelector，这里大致说一下:</p><ul><li>SelectMessageQueueByHash: 根据DefaultMQProducer#send传入的arg生成一个hash值，然后对消息列表取余</li><li>SelectMessageQueueByMachineRoom: 这个默认返回空，所以还是会走默认的消息队列选择方式，可以继承这个selector做扩展</li><li>SelectMessageQueueByRandom: 随机选择策略</li></ul><p>如果我们想要实现自己的selector，只要实现MessageQueueSelector这个接口就好了。</p><div class="language-MessageQueueSelector vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MessageQueueSelector</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface MessageQueueSelector {</span></span>
<span class="line"><span>    MessageQueue select(final List&lt;MessageQueue&gt; mqs, final Message msg, final Object arg);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h3 id="消息发送" tabindex="-1">消息发送 <a class="header-anchor" href="#消息发送" aria-label="Permalink to &quot;消息发送&quot;">​</a></h3><p>不管是同步消息，异步消息还是OneWay消息，核心的方法就是DefaultMQProducerImpl#sendKernelImpl方法。</p><div class="language-DefaultMQProducerImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducerImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private SendResult sendKernelImpl(</span></span>
<span class="line"><span>  final Message msg,   // 消息体</span></span>
<span class="line"><span>  final MessageQueue mq, // 消息队列</span></span>
<span class="line"><span>  final CommunicationMode communicationMode, // 消息发送模式，同步，异步，oneway</span></span>
<span class="line"><span>  final SendCallback sendCallback, // 异步发送回调函数</span></span>
<span class="line"><span>  final TopicPublishInfo topicPublishInfo, // 主题信息</span></span>
<span class="line"><span>  final long timeout // 超时时间</span></span>
<span class="line"><span>)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p><strong>获取Broker地址</strong></p><div class="language-DefaultMQProducerImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducerImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>long beginStartTime = System.currentTimeMillis();</span></span>
<span class="line"><span>String brokerName = this.mQClientFactory.getBrokerNameFromMessageQueue(mq);</span></span>
<span class="line"><span>String brokerAddr = this.mQClientFactory.findBrokerAddressInPublish(brokerName);</span></span>
<span class="line"><span>if (null == brokerAddr) {</span></span>
<span class="line"><span>  tryToFindTopicPublishInfo(mq.getTopic());</span></span>
<span class="line"><span>  brokerName = this.mQClientFactory.getBrokerNameFromMessageQueue(mq);</span></span>
<span class="line"><span>  brokerAddr = this.mQClientFactory.findBrokerAddressInPublish(brokerName);</span></span>
<span class="line highlighted"><span>  brokerAddr = MixAll.brokerVIPChannel(this.defaultMQProducer.isSendMessageWithVIPChannel(), brokerAddr);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>如果前面的ClientConfig配置了vipChannelEnabled这个参数，那么就会转化一下BrokerAddr，RocketMQ通常使用broker默认端口减2来实现VIP通道</p><p><strong>处理消息</strong></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>if (!(msg instanceof MessageBatch)) {</span></span>
<span class="line"><span>  MessageClientIDSetter.setUniqID(msg);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>boolean topicWithNamespace = false;</span></span>
<span class="line"><span>if (null != this.mQClientFactory.getClientConfig().getNamespace()) {</span></span>
<span class="line"><span>  msg.setInstanceId(this.mQClientFactory.getClientConfig().getNamespace());</span></span>
<span class="line"><span>  topicWithNamespace = true;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>int sysFlag = 0;</span></span>
<span class="line"><span>boolean msgBodyCompressed = false;</span></span>
<span class="line"><span>if (this.tryToCompressMessage(msg)) {</span></span>
<span class="line"><span>  sysFlag |= MessageSysFlag.COMPRESSED_FLAG;</span></span>
<span class="line"><span>  sysFlag |= this.defaultMQProducer.getCompressType().getCompressionFlag();</span></span>
<span class="line"><span>  msgBodyCompressed = true;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>final String tranMsg = msg.getProperty(MessageConst.PROPERTY_TRANSACTION_PREPARED);</span></span>
<span class="line"><span>if (Boolean.parseBoolean(tranMsg)) {</span></span>
<span class="line"><span>  sysFlag |= MessageSysFlag.TRANSACTION_PREPARED_TYPE;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><ul><li>如果是批量消息，设置全局唯一ID；设置topicWithNamespace</li><li>如果消息大小超过compressMsgBodyOverHowmuch(4K), 则压缩消息</li><li>如果是事务消息，则将sysFlag设置为MessageSysFlag.TRANSACTION_PREPARED_TYPE</li></ul><p><strong>调用Hook</strong></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>if (hasCheckForbiddenHook()) {</span></span>
<span class="line"><span>  CheckForbiddenContext checkForbiddenContext = new CheckForbiddenContext();</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  this.executeCheckForbiddenHook(checkForbiddenContext);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>if (this.hasSendMessageHook()) {</span></span>
<span class="line"><span>  context = new SendMessageContext();</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  this.executeSendMessageHookBefore(context);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>调用禁止发送钩子，跟发送消息钩子</p><p><strong>处理请求头</strong></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SendMessageRequestHeader requestHeader = new SendMessageRequestHeader();</span></span>
<span class="line"><span>requestHeader.setProducerGroup(this.defaultMQProducer.getProducerGroup());</span></span>
<span class="line"><span>requestHeader.setTopic(msg.getTopic());</span></span>
<span class="line"><span>requestHeader.setDefaultTopic(this.defaultMQProducer.getCreateTopicKey());</span></span>
<span class="line"><span>requestHeader.setDefaultTopicQueueNums(this.defaultMQProducer.getDefaultTopicQueueNums());</span></span>
<span class="line"><span>requestHeader.setQueueId(mq.getQueueId());</span></span>
<span class="line"><span>requestHeader.setSysFlag(sysFlag);</span></span>
<span class="line"><span>requestHeader.setBornTimestamp(System.currentTimeMillis());</span></span>
<span class="line"><span>requestHeader.setFlag(msg.getFlag());</span></span>
<span class="line"><span>requestHeader.setProperties(MessageDecoder.messageProperties2String(msg.getProperties()));</span></span>
<span class="line"><span>requestHeader.setReconsumeTimes(0);</span></span>
<span class="line"><span>requestHeader.setUnitMode(this.isUnitMode());</span></span>
<span class="line"><span>requestHeader.setBatch(msg instanceof MessageBatch);</span></span>
<span class="line"><span>requestHeader.setBrokerName(brokerName);</span></span>
<span class="line"><span>if (requestHeader.getTopic().startsWith(MixAll.RETRY_GROUP_TOPIC_PREFIX)) {</span></span>
<span class="line"><span>  String reconsumeTimes = MessageAccessor.getReconsumeTime(msg);</span></span>
<span class="line"><span>  if (reconsumeTimes != null) {</span></span>
<span class="line"><span>    requestHeader.setReconsumeTimes(Integer.valueOf(reconsumeTimes));</span></span>
<span class="line"><span>    MessageAccessor.clearProperty(msg, MessageConst.PROPERTY_RECONSUME_TIME);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  String maxReconsumeTimes = MessageAccessor.getMaxReconsumeTimes(msg);</span></span>
<span class="line"><span>  if (maxReconsumeTimes != null) {</span></span>
<span class="line"><span>    requestHeader.setMaxReconsumeTimes(Integer.valueOf(maxReconsumeTimes));</span></span>
<span class="line"><span>    MessageAccessor.clearProperty(msg, MessageConst.PROPERTY_MAX_RECONSUME_TIMES);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>构建消息发送请求包，主要包含如下信息：生产者组，主题名称，默认创建主题Key，该主题在单个Broker默认队列数，队列ID，消息系统标识，消息发送时间，消息标记，消息扩散属性，消息重试次数，是否是批量消息等等</p><p><strong>发送信息</strong></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>switch (communicationMode) {</span></span>
<span class="line"><span>  case ASYNC:</span></span>
<span class="line"><span>    sendResult = this.mQClientFactory.getMQClientAPIImpl().sendMessage(</span></span>
<span class="line"><span>          brokerAddr,</span></span>
<span class="line"><span>          brokerName,</span></span>
<span class="line"><span>          tmpMessage,</span></span>
<span class="line"><span>          requestHeader,</span></span>
<span class="line"><span>          timeout - costTimeAsync,</span></span>
<span class="line"><span>          communicationMode,</span></span>
<span class="line"><span>          sendCallback,</span></span>
<span class="line"><span>          topicPublishInfo,</span></span>
<span class="line"><span>          this.mQClientFactory,</span></span>
<span class="line"><span>          this.defaultMQProducer.getRetryTimesWhenSendAsyncFailed(),</span></span>
<span class="line"><span>          context,</span></span>
<span class="line"><span>          this);</span></span>
<span class="line"><span>  case ONEWAY:</span></span>
<span class="line"><span>  case SYNC:</span></span>
<span class="line"><span>    long costTimeSync = System.currentTimeMillis() - beginStartTime;</span></span>
<span class="line"><span>    if (timeout &lt; costTimeSync) {</span></span>
<span class="line"><span>      throw new RemotingTooMuchRequestException(&quot;sendKernelImpl call timeout&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    sendResult = this.mQClientFactory.getMQClientAPIImpl().sendMessage(</span></span>
<span class="line"><span>            brokerAddr,</span></span>
<span class="line"><span>            brokerName,</span></span>
<span class="line"><span>            msg,</span></span>
<span class="line"><span>            requestHeader,</span></span>
<span class="line"><span>            timeout - costTimeSync,</span></span>
<span class="line"><span>            communicationMode,</span></span>
<span class="line"><span>            context,</span></span>
<span class="line"><span>            this); </span></span>
<span class="line"><span>  default:</span></span>
<span class="line"><span>    assert false;</span></span>
<span class="line"><span>    break;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br></div></div><p>根据communicationMode调用this.mQClientFactory.getMQClientAPIImpl().sendMessage发送消息</p><p><strong>调用Hook</strong></p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>if (this.hasSendMessageHook()) {</span></span>
<span class="line"><span>  context.setSendResult(sendResult);</span></span>
<span class="line"><span>  this.executeSendMessageHookAfter(context);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>调用相应的发送下消息的钩子</p><h3 id="消息发送请求" tabindex="-1">消息发送请求 <a class="header-anchor" href="#消息发送请求" aria-label="Permalink to &quot;消息发送请求&quot;">​</a></h3><p>让我进入mQClientFactory.getMQClientAPIImpl().sendMessage方法看一下</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public SendResult sendMessage(</span></span>
<span class="line"><span>  final String addr,  // 地址</span></span>
<span class="line"><span>  final String brokerName, // Broker的名字</span></span>
<span class="line"><span>  final Message msg, // 消息</span></span>
<span class="line"><span>  final SendMessageRequestHeader requestHeader,</span></span>
<span class="line"><span>  final long timeoutMillis, // 超时时间</span></span>
<span class="line"><span>  final CommunicationMode communicationMode,</span></span>
<span class="line"><span>  final SendCallback sendCallback, // 发送消息回调函数</span></span>
<span class="line"><span>  final TopicPublishInfo topicPublishInfo,</span></span>
<span class="line"><span>  final MQClientInstance instance,</span></span>
<span class="line"><span>  final int retryTimesWhenSendFailed, // 异步发送超时重试</span></span>
<span class="line"><span>  final SendMessageContext context,</span></span>
<span class="line"><span>  final DefaultMQProducerImpl producer</span></span>
<span class="line"><span>)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>看一下具体的代码实现, 如下所示</p><div class="language-MQClientAPIImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQClientAPIImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>long beginStartTime = System.currentTimeMillis();</span></span>
<span class="line"><span>RemotingCommand request = null;</span></span>
<span class="line"><span>String msgType = msg.getProperty(MessageConst.PROPERTY_MESSAGE_TYPE);</span></span>
<span class="line"><span>boolean isReply = msgType != null &amp;&amp; msgType.equals(MixAll.REPLY_MESSAGE_FLAG);</span></span>
<span class="line"><span>request = RemotingCommand.createRequestCommand(RequestCode.SEND_MESSAGE, requestHeader);</span></span>
<span class="line"><span>request.setBody(msg.getBody());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>switch (communicationMode) {</span></span>
<span class="line"><span>  case ONEWAY:</span></span>
<span class="line"><span>    this.remotingClient.invokeOneway(addr, request, timeoutMillis);</span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  case ASYNC:</span></span>
<span class="line"><span>    this.sendMessageAsync(addr, brokerName, msg, timeoutMillis - costTimeAsync, request, sendCallback, topicPublishInfo, instance,</span></span>
<span class="line"><span>            retryTimesWhenSendFailed, times, context, producer);</span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  case SYNC:</span></span>
<span class="line"><span>    return this.sendMessageSync(addr, brokerName, msg, timeoutMillis - costTimeSync, request);</span></span>
<span class="line"><span>  default:</span></span>
<span class="line"><span>    assert false;</span></span>
<span class="line"><span>    break;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>return null;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br></div></div><p>我们直接看sendMessageAsync的实现, 具体代码如下所示:</p><div class="language-MQClientAPIImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MQClientAPIImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private void sendMessageAsync(final String addr, ...) {</span></span>
<span class="line"><span>  final long beginStartTime = System.currentTimeMillis();</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    this.remotingClient.invokeAsync(addr, request, timeoutMillis, new InvokeCallback() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void operationSucceed(RemotingCommand response) {</span></span>
<span class="line"><span>        long cost = System.currentTimeMillis() - beginStartTime;</span></span>
<span class="line"><span>        if (null == sendCallback) {</span></span>
<span class="line"><span>          context.getProducer().executeSendMessageHookAfter(context);</span></span>
<span class="line"><span>          producer.updateFaultItem(brokerName, System.currentTimeMillis() - beginStartTime, false, true);</span></span>
<span class="line"><span>          return;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          SendResult sendResult = MQClientAPIImpl.this.processSendResponse(brokerName, msg, response, addr);</span></span>
<span class="line"><span>          // 调用SendMessageHookAfter钩子</span></span>
<span class="line"><span>          context.getProducer().executeSendMessageHookAfter(context);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        sendCallback.onSuccess(sendResult);</span></span>
<span class="line"><span>        producer.updateFaultItem(brokerName, System.currentTimeMillis() - beginStartTime, false, true);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void operationFail(Throwable throwable) {</span></span>
<span class="line"><span>        producer.updateFaultItem(brokerName, System.currentTimeMillis() - beginStartTime, true, true);</span></span>
<span class="line"><span>        // 异步发送重试会在这里处理</span></span>
<span class="line"><span>        onExceptionImpl(brokerName, msg, timeoutMillis - cost, request, sendCallback, topicPublishInfo, instance,</span></span>
<span class="line"><span>                  retryTimesWhenSendFailed, times, ex, context, needRetry, producer);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  } </span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br></div></div><p>可以看到调用了remotingClient#invokeAsync方法，几种消息发送分别对应RemotingClient里面的这几个方法</p><div class="language-RemotingClient vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">RemotingClient</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>RemotingCommand invokeSync(final String addr, final RemotingCommand request,</span></span>
<span class="line"><span>    final long timeoutMillis) throws InterruptedException, RemotingConnectException,</span></span>
<span class="line"><span>    RemotingSendRequestException, RemotingTimeoutException;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>void invokeAsync(final String addr, final RemotingCommand request, final long timeoutMillis,</span></span>
<span class="line"><span>    final InvokeCallback invokeCallback) throws InterruptedException, RemotingConnectException,</span></span>
<span class="line"><span>    RemotingTooMuchRequestException, RemotingTimeoutException, RemotingSendRequestException;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>void invokeOneway(final String addr, final RemotingCommand request, final long timeoutMillis)</span></span>
<span class="line"><span>    throws InterruptedException, RemotingConnectException, RemotingTooMuchRequestException,</span></span>
<span class="line"><span>    RemotingTimeoutException, RemotingSendRequestException;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>相对来说invokeAsync比较复杂，我们就讲解这个吧。具体实现如下所示:</p><div class="language-NettyRemotingClient vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingClient</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public void invokeAsync(String addr, RemotingCommand request, long timeoutMillis, InvokeCallback invokeCallback)</span></span>
<span class="line"><span>    throws InterruptedException, RemotingConnectException, RemotingTooMuchRequestException, RemotingTimeoutException,</span></span>
<span class="line"><span>    RemotingSendRequestException {</span></span>
<span class="line"><span>    final ChannelFuture channelFuture = this.getAndCreateChannelAsync(addr);</span></span>
<span class="line"><span>    channelFuture.addListener(future -&gt; {</span></span>
<span class="line"><span>        if (future.isSuccess()) {</span></span>
<span class="line"><span>          this.invokeAsyncImpl(channel, request, timeoutMillis - costTime, new InvokeCallbackWrapper(invokeCallback, addr));</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>继续跟进invokeAsyncImpl方法，具体如下所示</p><div class="language-NettyRemotingAbstract vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">NettyRemotingAbstract</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void invokeAsyncImpl(final Channel channel, final RemotingCommand request, final long timeoutMillis,</span></span>
<span class="line"><span>    final InvokeCallback invokeCallback) {</span></span>
<span class="line"><span>  invokeImpl(channel, request, timeoutMillis)</span></span>
<span class="line"><span>      .whenComplete((v, t) -&gt; {</span></span>
<span class="line"><span>          if (t == null) {</span></span>
<span class="line"><span>              invokeCallback.operationComplete(v);</span></span>
<span class="line"><span>          } else {</span></span>
<span class="line"><span>              ResponseFuture responseFuture = new ResponseFuture(channel, request.getOpaque(), request, timeoutMillis, null, null);</span></span>
<span class="line"><span>              responseFuture.setCause(t);</span></span>
<span class="line"><span>              invokeCallback.operationComplete(responseFuture);</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>      })</span></span>
<span class="line"><span>      .thenAccept(responseFuture -&gt; invokeCallback.operationSucceed(responseFuture.getResponseCommand()))</span></span>
<span class="line"><span>      .exceptionally(t -&gt; {</span></span>
<span class="line"><span>          invokeCallback.operationFail(t);</span></span>
<span class="line"><span>          return null;</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>invokeCallback就是我们的sendCallback，不过封装过了，有netty跟多线程经验的还是很好理解这个过程的，具体invokeImpl做了什么，可以参照<a href="http://localhost:5173/rocketmq/netty-modal.html#nettyclient%E5%8F%91%E9%80%81%E8%AF%B7%E6%B1%82" target="_blank" rel="noreferrer">此处</a></p><h2 id="批量消息发送" tabindex="-1">批量消息发送 <a class="header-anchor" href="#批量消息发送" aria-label="Permalink to &quot;批量消息发送&quot;">​</a></h2><p>批量消息发送是将同一主题的多条消息一起打包发送到消息服务器，减少网络的调用次数，提高网络传输效率。下面看看批量消息发送的用法。</p><div class="language-DefaultMQProducer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public SendResult send(</span></span>
<span class="line"><span>        Collection&lt;Message&gt; msgs) throws MQClientException, RemotingException, MQBrokerException, InterruptedException {</span></span>
<span class="line"><span>  return this.defaultMQProducerImpl.send(batch(msgs));</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>可以看到调用了DefaultMQProducerImpl.send，跟前面的消息发送一模一样，明显就是将msg封装成了一个Message类，我们看一下batch方法</p><div class="language-DefaultMQProducerImpl vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducerImpl</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private MessageBatch batch(Collection&lt;Message&gt; msgs) throws MQClientException {</span></span>
<span class="line"><span>  MessageBatch msgBatch;</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    msgBatch = MessageBatch.generateFromList(msgs);</span></span>
<span class="line"><span>    for (Message message : msgBatch) {</span></span>
<span class="line"><span>      Validators.checkMessage(message, this);</span></span>
<span class="line"><span>      MessageClientIDSetter.setUniqID(message);</span></span>
<span class="line"><span>      message.setTopic(withNamespace(message.getTopic()));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    MessageClientIDSetter.setUniqID(msgBatch);</span></span>
<span class="line"><span>    msgBatch.setBody(msgBatch.encode());</span></span>
<span class="line"><span>  } catch (Exception e) {</span></span>
<span class="line"><span>    throw new MQClientException(&quot;Failed to initiate the MessageBatch&quot;, e);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  msgBatch.setTopic(withNamespace(msgBatch.getTopic()));</span></span>
<span class="line"><span>  return msgBatch;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>可以看到返回了MessageBatch这个类，这里的封装过程就不细看了。我们看一下MessageBatch</p><div class="language-MessageBatch vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MessageBatch</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class MessageBatch extends Message implements Iterable&lt;Message&gt; {</span></span>
<span class="line"><span>  private static final long serialVersionUID = 621335151046335557L;</span></span>
<span class="line"><span>  private final List&lt;Message&gt; messages;</span></span>
<span class="line"><span>  public byte[] encode() {</span></span>
<span class="line"><span>    return MessageDecoder.encodeMessages(messages);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>可以看到MessageBatch就只有messages一个属性，并且继承了Message, 有什么不同呢，回看上面的msgBatch.setBody(msgBatch.encode())，调用了encode方法。</p><div class="language-MessageDecoder vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MessageDecoder</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public static byte[] encodeMessages(List&lt;Message&gt; messages) {</span></span>
<span class="line"><span>  //TO DO refactor, accumulate in one buffer, avoid copies</span></span>
<span class="line"><span>  List&lt;byte[]&gt; encodedMessages = new ArrayList&lt;&gt;(messages.size());</span></span>
<span class="line"><span>  int allSize = 0;</span></span>
<span class="line"><span>  for (Message message : messages) {</span></span>
<span class="line highlighted"><span>      byte[] tmp = encodeMessage(message);</span></span>
<span class="line"><span>      encodedMessages.add(tmp);</span></span>
<span class="line"><span>      allSize += tmp.length;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  byte[] allBytes = new byte[allSize];</span></span>
<span class="line"><span>  int pos = 0;</span></span>
<span class="line"><span>  for (byte[] bytes : encodedMessages) {</span></span>
<span class="line"><span>      System.arraycopy(bytes, 0, allBytes, pos, bytes.length);</span></span>
<span class="line"><span>      pos += bytes.length;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return allBytes;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public static byte[] encodeMessage(Message message) {</span></span>
<span class="line"><span>  //only need flag, body, properties</span></span>
<span class="line"><span>  byte[] body = message.getBody();</span></span>
<span class="line"><span>  int bodyLen = body.length;</span></span>
<span class="line"><span>  String properties = messageProperties2String(message.getProperties());</span></span>
<span class="line"><span>  byte[] propertiesBytes = properties.getBytes(CHARSET_UTF8);</span></span>
<span class="line"><span>  //note properties length must not more than Short.MAX</span></span>
<span class="line"><span>  short propertiesLength = (short) propertiesBytes.length;</span></span>
<span class="line"><span>  int storeSize = 4 // 1 TOTALSIZE</span></span>
<span class="line"><span>      + 4 // 2 MAGICCOD</span></span>
<span class="line"><span>      + 4 // 3 BODYCRC</span></span>
<span class="line"><span>      + 4 // 4 FLAG</span></span>
<span class="line"><span>      + 4 + bodyLen // 4 BODY</span></span>
<span class="line"><span>      + 2 + propertiesLength;</span></span>
<span class="line"><span>  ByteBuffer byteBuffer = ByteBuffer.allocate(storeSize);</span></span>
<span class="line"><span>  // 1 TOTALSIZE</span></span>
<span class="line"><span>  byteBuffer.putInt(storeSize);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 2 MAGICCODE</span></span>
<span class="line"><span>  byteBuffer.putInt(0);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 3 BODYCRC</span></span>
<span class="line"><span>  byteBuffer.putInt(0);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 4 FLAG</span></span>
<span class="line"><span>  int flag = message.getFlag();</span></span>
<span class="line"><span>  byteBuffer.putInt(flag);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 5 BODY</span></span>
<span class="line"><span>  byteBuffer.putInt(bodyLen);</span></span>
<span class="line"><span>  byteBuffer.put(body);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 6 properties</span></span>
<span class="line"><span>  byteBuffer.putShort(propertiesLength);</span></span>
<span class="line"><span>  byteBuffer.put(propertiesBytes);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  return byteBuffer.array();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br></div></div><p>这块细节我们就不看了，就是按照固定的编码格式编码数据，然后消息服务器按照这个编码格式解码就好了。</p><h2 id="消息批量发送" tabindex="-1">消息批量发送 <a class="header-anchor" href="#消息批量发送" aria-label="Permalink to &quot;消息批量发送&quot;">​</a></h2><p>RocketMq还提供了消息的分区和批次发送管理，跟前面的批量发送有些不一样，我们先来看看发送消息的实现。</p><div class="language-DefaultMQProducer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMQProducer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public SendResult send(</span></span>
<span class="line"><span>        Message msg) throws MQClientException, RemotingException, MQBrokerException, InterruptedException {</span></span>
<span class="line"><span>  msg.setTopic(withNamespace(msg.getTopic()));</span></span>
<span class="line"><span>  if (this.getAutoBatch() &amp;&amp; !(msg instanceof MessageBatch)) {</span></span>
<span class="line highlighted"><span>    return sendByAccumulator(msg, null, null);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    return sendDirect(msg, null, null);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public SendResult sendByAccumulator(Message msg, MessageQueue mq,</span></span>
<span class="line"><span>                                    SendCallback sendCallback) throws MQClientException, RemotingException, InterruptedException, MQBrokerException {</span></span>
<span class="line"><span>  // check whether it can batch</span></span>
<span class="line"><span>  if (!canBatch(msg)) {</span></span>
<span class="line"><span>    return sendDirect(msg, mq, sendCallback);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    Validators.checkMessage(msg, this);</span></span>
<span class="line"><span>    MessageClientIDSetter.setUniqID(msg);</span></span>
<span class="line"><span>    if (sendCallback == null) {</span></span>
<span class="line highlighted"><span>      return this.produceAccumulator.send(msg, mq, this);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      this.produceAccumulator.send(msg, mq, sendCallback, this);</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>可以看到只有消息，不设置超时时间的话，就会判断是否自动Batch，满足条件就会调用sendByAccumulator，否则就会直接发送，直接发送跟前面消息发送的一样，不细说。</p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>想要使用这个功能，要设置Producer的autoBatch属性为true</p></div><h3 id="produceaccumulator" tabindex="-1">ProduceAccumulator <a class="header-anchor" href="#produceaccumulator" aria-label="Permalink to &quot;ProduceAccumulator&quot;">​</a></h3><p>同步消息跟异步消息的处理不一样，我们直接看同步信息吧, 异步消息比同步消息类似，也会简单一些。</p><div class="language-ProduceAccumulator vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ProduceAccumulator</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SendResult send(Message msg, MessageQueue mq,</span></span>
<span class="line"><span>    DefaultMQProducer defaultMQProducer) throws InterruptedException, MQBrokerException, RemotingException, MQClientException {</span></span>
<span class="line"><span>    AggregateKey partitionKey = new AggregateKey(msg, mq);</span></span>
<span class="line"><span>    while (true) {</span></span>
<span class="line"><span>        MessageAccumulation batch = getOrCreateSyncSendBatch(partitionKey, defaultMQProducer);</span></span>
<span class="line"><span>        int index = batch.add(msg);</span></span>
<span class="line"><span>        if (index == -1) {</span></span>
<span class="line"><span>          syncSendBatchs.remove(partitionKey, batch);</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>          return batch.sendResults[index];</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><ul><li>首先获取一个MessageAccumulation，可以认为就是一个待发送的消息队列，根据partitionKey获取，如果没有就创建</li><li>将消息放入消息队列，获取返回值</li><li>如果index=-1, 就调用remove方式移除MessageAccumulation，注意这是一个while循环，然后重新创建一个。为什么要移除呢? 因为如果index=-1，说明这个消息队列里面的消息正在发送，不能再放消息了。</li><li>如果index!=-1, 就返回发送结果</li></ul><h3 id="messageaccumulation" tabindex="-1">MessageAccumulation <a class="header-anchor" href="#messageaccumulation" aria-label="Permalink to &quot;MessageAccumulation&quot;">​</a></h3><p>我们进去batch#add方法看看，代码如下:</p><div class="language-MessageAccumulation vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MessageAccumulation</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public int add(</span></span>
<span class="line"><span>    Message msg) throws InterruptedException, MQBrokerException, RemotingException, MQClientException {</span></span>
<span class="line"><span>    int ret = -1;</span></span>
<span class="line"><span>    // 获取锁</span></span>
<span class="line"><span>    synchronized (this.closed) {</span></span>
<span class="line"><span>      // 如果close为true，说明这个累加器在发送消息</span></span>
<span class="line"><span>      if (this.closed.get()) {</span></span>
<span class="line"><span>          return ret;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      ret = this.count++;</span></span>
<span class="line"><span>      // 添加消息</span></span>
<span class="line"><span>      this.messages.add(msg);</span></span>
<span class="line"><span>      messagesSize.addAndGet(msg.getBody().length);</span></span>
<span class="line"><span>      String msgKeys = msg.getKeys();</span></span>
<span class="line"><span>      if (msgKeys != null) {</span></span>
<span class="line"><span>          this.keys.addAll(Arrays.asList(msgKeys.split(MessageConst.KEY_SEPARATOR)));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 等待消息发送完成</span></span>
<span class="line"><span>    synchronized (this) {</span></span>
<span class="line"><span>      while (!this.closed.get()) {</span></span>
<span class="line"><span>        if (readyToSend()) {</span></span>
<span class="line"><span>          // 发送消息</span></span>
<span class="line"><span>          this.send();</span></span>
<span class="line"><span>          break;</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>          // 等待</span></span>
<span class="line"><span>          this.wait();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      return ret;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>private boolean readyToSend() {</span></span>
<span class="line"><span>  // holdSize大于32 * 1024或者holdMs大于10ms</span></span>
<span class="line"><span>  if (this.messagesSize.get() &gt; holdSize</span></span>
<span class="line"><span>    || System.currentTimeMillis() &gt;= this.createTime + holdMs) {</span></span>
<span class="line"><span>    return true;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return false;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br></div></div><p>这里有一个疑问，如果readyToSend返回false不就睡眠等待了么？在那唤醒呢？</p><h3 id="guardforsyncsendservice" tabindex="-1">GuardForSyncSendService <a class="header-anchor" href="#guardforsyncsendservice" aria-label="Permalink to &quot;GuardForSyncSendService&quot;">​</a></h3><p>在ProduceAccumulator初始化的时候声明了两个Service, 我们看看</p><div class="language-ProduceAccumulator vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ProduceAccumulator</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public ProduceAccumulator(String instanceName) {</span></span>
<span class="line"><span>  this.instanceName = instanceName;</span></span>
<span class="line"><span>  // 处理同步消息的</span></span>
<span class="line"><span>  this.guardThreadForSyncSend = new GuardForSyncSendService(this.instanceName);</span></span>
<span class="line"><span>  // 处理异步消息</span></span>
<span class="line"><span>  this.guardThreadForAsyncSend = new GuardForAsyncSendService(this.instanceName);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>void start() {</span></span>
<span class="line"><span>  guardThreadForSyncSend.start();</span></span>
<span class="line"><span>  guardThreadForAsyncSend.start();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>我们看看guardThreadForSyncSend做了什么事。</p><div class="language-GuardForSyncSendService vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">GuardForSyncSendService</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private class GuardForSyncSendService extends ServiceThread  {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void run() {</span></span>
<span class="line"><span>    while (!this.isStopped()) {</span></span>
<span class="line"><span>      this.doWork();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void doWork() throws InterruptedException {</span></span>
<span class="line"><span>    Collection&lt;MessageAccumulation&gt; values = syncSendBatchs.values();</span></span>
<span class="line"><span>    final int sleepTime = Math.max(1, holdMs / 2);</span></span>
<span class="line"><span>    for (MessageAccumulation v : values) {</span></span>
<span class="line"><span>      v.wakeup();</span></span>
<span class="line"><span>      synchronized (v) {</span></span>
<span class="line"><span>        synchronized (v.closed) {</span></span>
<span class="line"><span>          // 如果没有消息，移除</span></span>
<span class="line"><span>          if (v.messagesSize.get() == 0) {</span></span>
<span class="line"><span>            v.closed.set(true);</span></span>
<span class="line"><span>            syncSendBatchs.remove(v.aggregateKey, v);</span></span>
<span class="line"><span>          } else {</span></span>
<span class="line"><span>            // 唤醒这个累加器</span></span>
<span class="line highlighted"><span>            v.notify();</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    Thread.sleep(sleepTime);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br></div></div><p>好了，我们看一下这个累加器的send的方法，如下所示:</p><div class="language-MessageAccumulation vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MessageAccumulation</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private void send() throws InterruptedException, MQClientException, MQBrokerException, RemotingException {</span></span>
<span class="line"><span>  // 可以看到在这里会将closed设置为true</span></span>
<span class="line"><span>  synchronized (this.closed) {</span></span>
<span class="line"><span>    if (this.closed.getAndSet(true)) {</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 包装成一个MessageBatch</span></span>
<span class="line"><span>  MessageBatch messageBatch = this.batch();</span></span>
<span class="line"><span>  SendResult sendResult = null;</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    if (defaultMQProducer != null) {</span></span>
<span class="line"><span>      // 直接发送消息</span></span>
<span class="line"><span>      sendResult = defaultMQProducer.sendDirect(messageBatch, aggregateKey.mq, null);</span></span>
<span class="line"><span>      // 将结果保存在sendResults里面</span></span>
<span class="line"><span>      this.splitSendResults(sendResult);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      throw new IllegalArgumentException(&quot;defaultMQProducer is null, can not send message&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  } finally {</span></span>
<span class="line"><span>    // 将currentlyHoldSize设置为0</span></span>
<span class="line"><span>    currentlyHoldSize.addAndGet(-messagesSize.get());</span></span>
<span class="line"><span>    // 唤醒所有等待的线程</span></span>
<span class="line"><span>    this.notifyAll();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div><p>好了，同步消息的批量发送就到这里了。</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>异步消息的批量发送类似，区别就是往MessageAccumulation添加时先看看可不可以发送，可以发送就发送，不可以就直接返回。然后在GuardForAsyncSendService中检查是否可以发送消息，如果可以的话就发送</p></div>`,225)]))}const g=n(i,[["render",r]]);export{d as __pageData,g as default};
