import{_ as n,c as a,a0 as e,o as p}from"./chunks/framework.P9qPzDnn.js";const l="/assets/%E9%98%9F%E5%88%97%E5%AD%98%E5%82%A8%E6%9E%B6%E6%9E%84.BAdNxHGi.png",i="/assets/MappedFileQueue.H58ck8Bj.png",r="/assets/Mesage-Store.C28MBYzA.png",t="/assets/store-architecture.DQuj1s99.png",c="/assets/index-architecture.DMZR61Jq.png",u="/assets/index-store.1MeYGp08.png",b="/assets/broker-store.CZUxs_25.png",o="/assets/message-send.C9-5qOTT.png",m="/assets/transientStorePool.DZ7IL8o6.png",k=JSON.parse('{"title":"RocketMQ消息存储","description":"","frontmatter":{},"headers":[],"relativePath":"rocketmq/store.md","filePath":"rocketmq/store.md"}'),g={name:"rocketmq/store.md"};function d(h,s,f,C,M,S){return p(),a("div",null,s[0]||(s[0]=[e('<h1 id="rocketmq消息存储" tabindex="-1">RocketMQ消息存储 <a class="header-anchor" href="#rocketmq消息存储" aria-label="Permalink to &quot;RocketMQ消息存储&quot;">​</a></h1><h2 id="消息储存架构" tabindex="-1">消息储存架构 <a class="header-anchor" href="#消息储存架构" aria-label="Permalink to &quot;消息储存架构&quot;">​</a></h2><h3 id="元数据管理" tabindex="-1">元数据管理 <a class="header-anchor" href="#元数据管理" aria-label="Permalink to &quot;元数据管理&quot;">​</a></h3><p>为了提升整体的吞吐量跟整体的可用性，RocketMq服务器一般会为单个Topic创建多个分区，就是在每个Broker主从集群里面维护部分分区(Partition), 也就是队列(MessageQueue)。同一个Broker主从集群中每个Topic的队列数相同并且从0开始编号，不同Broker主从集群中的消息队列数量可以不一样。</p><p><img src="'+l+'" alt="队列存储架构"></p><ul><li>一个主题在Broker-1主副本上有4个队列，编号是0-3, 在Broker-1备副本上完全相同；在Broker-2上可能只有2个队列，编号是0-1</li><li>Broker上元数据中每个Topic的配置包含了几个核心属性，名称，读写队列数，权限和其他元数据标识</li><li>队列从0开始编号，扩缩队列都在尾部操作，比如24个队列缩分区到16，会留下编号为0-15的队列</li><li>Broker 还管理着当前节点上 Group 的相关信息和消费进度（位点），当消费进度更新时 并不会像 Topic Group 那样立刻持久化，而是使用一个定时任务做 CheckPoint。这个周期默认是 5 秒，所以当客户端有上下线，服务端主备切换或者正常发布时，可能会有秒级的消息重复，并观察到堆积量的短暂上升。</li></ul><h3 id="mmap文件存储" tabindex="-1">mmap文件存储 <a class="header-anchor" href="#mmap文件存储" aria-label="Permalink to &quot;mmap文件存储&quot;">​</a></h3><p>为了实现高效的写消息操作，RocketMQ使用顺序写盘的方法，通过append only将数据追加到文件末尾。利用NIO的FileChannel模型，通过使用偏移量的形式写入磁盘而不用read/write的系统调用，减少了数据在缓冲区之间拷贝的开销。但是这种实现机制有一些限制，单个mmap的文件不能太大（RocketMQ选择了1G），一旦超过这个这个容量，就会新建一个文件组成一个链表（MappedFileQueue），就可以用来存储消息了。</p><p><img src="'+i+'" alt="MappedFileQueue"></p><h3 id="消息储存格式" tabindex="-1">消息储存格式 <a class="header-anchor" href="#消息储存格式" aria-label="Permalink to &quot;消息储存格式&quot;">​</a></h3><p>RocketMQ 有一套相对复杂的消息存储编码用来将消息对象序列化，随后再将非定长的数据落到上述的真实的写入到文件中，存储格式中包括了索引队列的编号和位置。单条消息的存储格式如下：</p><p><img src="'+r+'" alt="Mesage-Store"></p><p>可以发现，单条消息本身元数据占用的存储空间为固定的描述信息和变长的 body 和 properties 部分，而消息的 payload 通常大于 2K，也就是说元数据带来的额外存储开销只增加了 5%-10% 左右。很明显，单条消息越大，存储本身额外的开销（比例）就相对的越少。</p><h3 id="存储架构设计" tabindex="-1">存储架构设计 <a class="header-anchor" href="#存储架构设计" aria-label="Permalink to &quot;存储架构设计&quot;">​</a></h3><p><img src="'+t+'" alt="store-architecture"></p><p>在数据写入 CommitLog 后，有一个后端的 ReputMessageService 服务 (也被称为 dispatch 线程) 会异步的构建多种索引（例如 ConsumeQueue 和 Index），满足不同形式的读取和查询诉求。在 RocketMQ 的模型下，消息本身存在的逻辑队列称为 MessageQueue，而对应的物理索引文件称为 ConsumeQueue。其中 dispatch 线程会源源不断的将消息从 CommitLog 取出，再拿出消息在 CommitLog 中的物理偏移量，消息长度以及 Tag Hash 等信息作为单条消息的索引，分发到对应的消费队列，构成了对 CommitLog 的引用 (Reference)。ConsumeQueue 中单条消息占用的索引空间只有 20B。当客户端尝试从服务端拉取消息时，会先读取索引并进行过滤，随后根据索引从 CommitLog 中获得真实的消息并返回。</p><h3 id="索引架构设计" tabindex="-1">索引架构设计 <a class="header-anchor" href="#索引架构设计" aria-label="Permalink to &quot;索引架构设计&quot;">​</a></h3><p><img src="'+c+'" alt="index-architecture"></p><p>RocketMQ 作为业务消息的首选，除了上文中 ReputMessageService 线程除了构建消费队列的索引外，还同时为每条消息根据 id, key 构建了索引到 IndexFile。这是方便快速快速定位目标消息而产生的，当然这个构建随机索引的能力是可以降级的，IndexFile文件结构如下：</p><p><img src="'+u+'" alt="index-store"></p><p>IndexFile 也是定长的，从单个文件的数据结构来说，这是实现了一种简单原生的哈希拉链机制。当一条新的消息索引进来时，首先使用 hash 算法命中黄色部分 500w 个 slot 中的一个，如果存在冲突就使用拉链解决，将最新索引数据的 next 指向上一条索引位置。同时将消息的索引数据 append 至文件尾部（绿色部分），这样便形成了一条当前 slot 按照时间存入的倒序的链表。这里其实也是一种 LSM compaction 在消息模型下的改进，降低了写放大。当用户按照 UniqueKey（MsgId）或者业务 Key 来进行查询时，会先从索引查询消息报存在 CommitLog 中的位置并取回数据返回客户端。</p><h3 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h3><p>这节的最后我们看看消息实际在目录上是怎么储存的。</p><img src="'+b+`" alt="broker-store" width="300"><ul><li>index目录: index目录就是储存索引文件的目录, 里面的每个文件400M</li><li>commitlog: commitlog目录就是储存具体消息内容的，每个文件的大小1G</li><li>consumequeue: consumequeue目录是用来储存消费队列的信息，每个主题是一个目录，每个主题目录下有多个目录，0/1/2那些是队列目录，里面的文件就是ConsumeQueue, 每个文件的大小5.7M</li></ul><h2 id="消息发送" tabindex="-1">消息发送 <a class="header-anchor" href="#消息发送" aria-label="Permalink to &quot;消息发送&quot;">​</a></h2><p>我们从Broker消息发送请求的方法开始梳理Rocketmq消息存储commitLog的存储流程, 首先我们看Broker注册消息发送的处理器。</p><div class="language-BrokerController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">BrokerController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void registerProcessor() {</span></span>
<span class="line"><span>  this.remotingServer.registerProcessor(RequestCode.SEND_MESSAGE, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>  this.remotingServer.registerProcessor(RequestCode.SEND_MESSAGE_V2, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>  this.remotingServer.registerProcessor(RequestCode.SEND_BATCH_MESSAGE, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>  this.remotingServer.registerProcessor(RequestCode.CONSUMER_SEND_MSG_BACK, sendMessageProcessor, this.sendMessageExecutor);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>可以看到所有的消息发送都是由sendMessageProcessor做处理的，我们跟进去看一下</p><div class="language-SendMessageProcessor vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SendMessageProcessor</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SendMessageProcessor extends AbstractSendMessageProcessor implements NettyRequestProcessor {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public RemotingCommand processRequest(ChannelHandlerContext ctx,</span></span>
<span class="line"><span>    RemotingCommand request) throws RemotingCommandException {</span></span>
<span class="line"><span>    switch (request.getCode()) {</span></span>
<span class="line"><span>      case RequestCode.CONSUMER_SEND_MSG_BACK:</span></span>
<span class="line"><span>        return this.consumerSendMsgBack(ctx, request);</span></span>
<span class="line"><span>      default:</span></span>
<span class="line"><span>        SendMessageRequestHeader requestHeader = parseRequestHeader(request);</span></span>
<span class="line"><span>        sendMessageContext = buildMsgContext(ctx, requestHeader, request);</span></span>
<span class="line"><span>        // 调用SendMessageHook</span></span>
<span class="line"><span>        this.executeSendMessageHookBefore(sendMessageContext);</span></span>
<span class="line"><span>        if (requestHeader.isBatch()) {</span></span>
<span class="line"><span>          response = this.sendBatchMessage(ctx, request, sendMessageContext, requestHeader, mappingContext,</span></span>
<span class="line"><span>                  (ctx1, response1) -&gt; executeSendMessageHookAfter(response1, ctx1));</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line highlighted"><span>          response = this.sendMessage(ctx, request, sendMessageContext, requestHeader, mappingContext,</span></span>
<span class="line highlighted"><span>                  (ctx12, response12) -&gt; executeSendMessageHookAfter(response12, ctx12));</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return response</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><p>可以看到根据批量消息跟普通消息调用了不同的sendMessage方法，我们只看普通消息的发送方法即可。</p><div class="language-SendMessageProcessor vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SendMessageProcessor</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public RemotingCommand sendMessage(final ChannelHandlerContext ctx, final RemotingCommand request, final SendMessageContext sendMessageContext,final SendMessageRequestHeader requestHeader, final TopicQueueMappingContext mappingContext, final SendMessageCallback sendMessageCallback) throws RemotingCommandException {</span></span>
<span class="line"><span>  // 检查消息是否可以写入Broker</span></span>
<span class="line"><span>  final RemotingCommand response = preSend(ctx, request, requestHeader);</span></span>
<span class="line"><span>  if (response.getCode() != -1) {</span></span>
<span class="line"><span>    return response;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  if (brokerController.getBrokerConfig().isAsyncSendEnable()) {</span></span>
<span class="line"><span>    // 发送事务消息，事务消息章节讲解</span></span>
<span class="line"><span>    if (sendTransactionPrepareMessage) {</span></span>
<span class="line"><span>      asyncPutMessageFuture = this.brokerController.getTransactionalMessageService().asyncPrepareMessage(msgInner);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      // 普通消息</span></span>
<span class="line highlighted"><span>      asyncPutMessageFuture = this.brokerController.getMessageStore().asyncPutMessage(msgInner);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    if (sendTransactionPrepareMessage) {</span></span>
<span class="line"><span>      putMessageResult = this.brokerController.getTransactionalMessageService().prepareMessage(msgInner);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      putMessageResult = this.brokerController.getMessageStore().putMessage(msgInner);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>brokerController.getBrokerConfig().isAsyncSendEnable()可以看到是根据BrokerConfig的asyncSendEnable这个配置</p><h3 id="消息检查" tabindex="-1">消息检查 <a class="header-anchor" href="#消息检查" aria-label="Permalink to &quot;消息检查&quot;">​</a></h3><p>在preSend中会对发送的消息进行一系列的检查，判断该消息是否可以写入Broker，这里大致跟者代码说明一下:</p><div class="language-SendMessageProcessor vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SendMessageProcessor</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private RemotingCommand preSend(ChannelHandlerContext ctx, RemotingCommand request,</span></span>
<span class="line"><span>                                SendMessageRequestHeader requestHeader) {</span></span>
<span class="line"><span>  // 如果Broker还没准备好，报错</span></span>
<span class="line"><span>  if (this.brokerController.getMessageStore().now() &lt; startTimestamp) {</span></span>
<span class="line"><span>    response.setCode(ResponseCode.SYSTEM_ERROR);</span></span>
<span class="line"><span>    response.setRemark(String.format(&quot;broker unable to service, until %s&quot;, UtilAll.timeMillisToHumanString2(startTimestamp)));</span></span>
<span class="line"><span>    return response;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  response.setCode(-1);</span></span>
<span class="line"><span>  super.msgCheck(ctx, requestHeader, request, response);</span></span>
<span class="line"><span>  return response;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>继续看一下msgCheck方法，代码如下：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>protected RemotingCommand msgCheck(final ChannelHandlerContext ctx,</span></span>
<span class="line"><span>                                    final SendMessageRequestHeader requestHeader, final RemotingCommand request,</span></span>
<span class="line"><span>                                    final RemotingCommand response) {</span></span>
<span class="line"><span>  // 如果Broker没有权限写消息，报错</span></span>
<span class="line"><span>  if (!PermName.isWriteable(this.brokerController.getBrokerConfig().getBrokerPermission())</span></span>
<span class="line"><span>          &amp;&amp; this.brokerController.getTopicConfigManager().isOrderTopic(requestHeader.getTopic())) {</span></span>
<span class="line"><span>    response.setCode(ResponseCode.NO_PERMISSION);</span></span>
<span class="line"><span>    return response;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 检查Topic的名字是否为空，是否存在非法字符，长度是否满足等</span></span>
<span class="line"><span>  TopicValidator.ValidateTopicResult result = TopicValidator.validateTopic(requestHeader.getTopic());</span></span>
<span class="line"><span>  if (!result.isValid()) {</span></span>
<span class="line"><span>    response.setCode(ResponseCode.SYSTEM_ERROR);</span></span>
<span class="line"><span>    return response;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 检查主题是否在禁止发送的主题里面，比如RMQ_SYS_SCHEDULE_TOPIC/RMQ_SYS_SELF_TEST_TOPIC等等</span></span>
<span class="line"><span>  if (TopicValidator.isNotAllowedSendTopic(requestHeader.getTopic())) {</span></span>
<span class="line"><span>    response.setCode(ResponseCode.NO_PERMISSION);</span></span>
<span class="line"><span>    return response;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 从topicConfigTable获取topicConfig</span></span>
<span class="line"><span>  TopicConfig topicConfig =</span></span>
<span class="line"><span>          this.brokerController.getTopicConfigManager().selectTopicConfig(requestHeader.getTopic());</span></span>
<span class="line"><span>  if (null == topicConfig) {</span></span>
<span class="line"><span>    // 检查是否可以创建该主题，这里会根据Broker的配置autoCreateTopicEnable来判定</span></span>
<span class="line"><span>    topicConfig = this.brokerController.getTopicConfigManager().createTopicInSendMessageMethod(</span></span>
<span class="line"><span>            requestHeader.getTopic(),</span></span>
<span class="line"><span>            requestHeader.getDefaultTopic(),</span></span>
<span class="line"><span>            RemotingHelper.parseChannelRemoteAddr(ctx.channel()),</span></span>
<span class="line"><span>            requestHeader.getDefaultTopicQueueNums(), topicSysFlag);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (null == topicConfig) {</span></span>
<span class="line"><span>      // 如果是重试主题，那么会新创建一个主题</span></span>
<span class="line"><span>      if (requestHeader.getTopic().startsWith(MixAll.RETRY_GROUP_TOPIC_PREFIX)) {</span></span>
<span class="line"><span>        topicConfig =</span></span>
<span class="line"><span>                this.brokerController.getTopicConfigManager().createTopicInSendMessageBackMethod(</span></span>
<span class="line"><span>                        requestHeader.getTopic(), 1, PermName.PERM_WRITE | PermName.PERM_READ,</span></span>
<span class="line"><span>                        topicSysFlag);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (null == topicConfig) {</span></span>
<span class="line"><span>      response.setCode(ResponseCode.TOPIC_NOT_EXIST);</span></span>
<span class="line"><span>      return response;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 判断queueId是否在Broker的queueId范围里面</span></span>
<span class="line"><span>  int queueIdInt = requestHeader.getQueueId();</span></span>
<span class="line"><span>  int idValid = Math.max(topicConfig.getWriteQueueNums(), topicConfig.getReadQueueNums());</span></span>
<span class="line"><span>  if (queueIdInt &gt;= idValid) {</span></span>
<span class="line"><span>    response.setCode(ResponseCode.SYSTEM_ERROR);</span></span>
<span class="line"><span>    return response;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return response;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br></div></div><p><strong>主动创建主题</strong></p><p>如果Broker的配置autoCreateTopicEnable打开了，那么Broker就支持创建新主题了。我们看看这个配置都做了什么，在Broker启动的时候，会根据这个属性往NameServer新建一个默认主题。</p><div class="language-TopicConfigManager vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">TopicConfigManager</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>protected void init() {</span></span>
<span class="line"><span>  protected void init() {</span></span>
<span class="line"><span>    TopicConfig defaultTopicConfig = getTopicConfig(defaultTopic);</span></span>
<span class="line"><span>    if (this.brokerController.getBrokerConfig().isAutoCreateTopicEnable()) {</span></span>
<span class="line"><span>      String topic = TopicValidator.AUTO_CREATE_TOPIC_KEY_TOPIC;</span></span>
<span class="line"><span>      TopicConfig topicConfig = new TopicConfig(topic);</span></span>
<span class="line"><span>      ....</span></span>
<span class="line"><span>      putTopicConfig(topicConfig);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>然后在上面的BrokerController#getTopicConfigManager#createTopicInSendMessageMethod会判断这个参数。</p><div class="language-TopicConfigManager vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">TopicConfigManager</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public TopicConfig createTopicInSendMessageMethod(final String topic, final String defaultTopic,</span></span>
<span class="line"><span>                                                  final String remoteAddress, final int clientDefaultTopicQueueNums, final int topicSysFlag) {</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  TopicConfig defaultTopicConfig = getTopicConfig(defaultTopic);</span></span>
<span class="line"><span>  if (defaultTopicConfig != null) {</span></span>
<span class="line"><span>    if (defaultTopic.equals(TopicValidator.AUTO_CREATE_TOPIC_KEY_TOPIC)) {</span></span>
<span class="line"><span>      if (!this.brokerController.getBrokerConfig().isAutoCreateTopicEnable()) {</span></span>
<span class="line"><span>        defaultTopicConfig.setPerm(PermName.PERM_READ | PermName.PERM_WRITE);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (PermName.isInherited(defaultTopicConfig.getPerm())) {</span></span>
<span class="line"><span>      ...</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      log.warn(&quot;Create new topic failed, because the default topic[{}] has no perm [{}] producer:[{}]&quot;,</span></span>
<span class="line"><span>        defaultTopic, defaultTopicConfig.getPerm(), remoteAddress);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>可以看到如果没有配置了autoCreateTopicEnable的话，defaultTopicConfig是空的，而如果配置了autoCreateTopicEnable，那么就会赋予defaultTopicConfig读写权限，否则无法写消息</p><h3 id="defaultmessagestore-asyncputmessage" tabindex="-1">DefaultMessageStore#asyncPutMessage <a class="header-anchor" href="#defaultmessagestore-asyncputmessage" aria-label="Permalink to &quot;DefaultMessageStore#asyncPutMessage&quot;">​</a></h3><p>好了，让我们回到BrokerController.getMessageStore()的putMessage跟asyncPutMessage这两个发送消息方法</p><div class="language-DefaultMessageStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMessageStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public PutMessageResult putMessage(MessageExtBrokerInner msg) {</span></span>
<span class="line"><span>  return waitForPutResult(asyncPutMessage(msg));</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>可以看到putMessage调用的也是asyncPutMessage, 所以我们只要看asyncPutMessage这个方法就好了。</p><div class="language-DefaultMessageStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMessageStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public CompletableFuture&lt;PutMessageResult&gt; asyncPutMessage(MessageExtBrokerInner msg) {</span></span>
<span class="line"><span>  // 执行所有的PutMessageHook</span></span>
<span class="line"><span>  for (PutMessageHook putMessageHook : putMessageHookList) {</span></span>
<span class="line"><span>    PutMessageResult handleResult = putMessageHook.executeBeforePutMessage(msg);</span></span>
<span class="line"><span>    if (handleResult != null) {</span></span>
<span class="line"><span>      return CompletableFuture.completedFuture(handleResult);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  ....</span></span>
<span class="line"><span>  long beginTime = this.getSystemClock().now();</span></span>
<span class="line highlighted"><span>  CompletableFuture&lt;PutMessageResult&gt; putResultFuture = this.commitLog.asyncPutMessage(msg);</span></span>
<span class="line"><span>  putResultFuture.thenAccept(result -&gt; {</span></span>
<span class="line"><span>    long elapsedTime = this.getSystemClock().now() - beginTime;</span></span>
<span class="line"><span>    this.storeStatsService.setPutMessageEntireTimeMax(elapsedTime);</span></span>
<span class="line"><span>    if (null == result || !result.isOk()) {</span></span>
<span class="line"><span>      this.storeStatsService.getPutMessageFailedTimes().add(1);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  return putResultFuture;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><h3 id="putmessagehook" tabindex="-1">PutMessageHook <a class="header-anchor" href="#putmessagehook" aria-label="Permalink to &quot;PutMessageHook&quot;">​</a></h3><p>PutMessageHook是在消息写入commitLog之前对消息进行一些处理，如果对事务消息进行处理，处理延迟消息等等，我们可以看一下这个接口的定义</p><div class="language-PutMessageHook vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">PutMessageHook</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface PutMessageHook {</span></span>
<span class="line"><span>  /* Name of the hook. */</span></span>
<span class="line"><span>  String hookName();</span></span>
<span class="line"><span>  /* Execute before put message. For example, Message verification or special message transform */</span></span>
<span class="line"><span>  PutMessageResult executeBeforePutMessage(MessageExt msg);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>具体有哪些钩子？在BrokerControlle初始化的时候会调用一个registerMessageStoreHook方法来注册钩子函数，这里列一下:</p><div class="language-BrokerController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">BrokerController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void registerMessageStoreHook() {</span></span>
<span class="line"><span>  // 获取messageStore的putMessage钩子列表</span></span>
<span class="line"><span>  List&lt;PutMessageHook&gt; putMessageHookList = messageStore.getPutMessageHookList();</span></span>
<span class="line"><span>  // 检查消息状态</span></span>
<span class="line"><span>  putMessageHookList.add(new PutMessageHook() {</span></span>
<span class="line"><span>    public PutMessageResult executeBeforePutMessage(MessageExt msg) {</span></span>
<span class="line"><span>      return HookUtils.checkBeforePutMessage(BrokerController.this, msg);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  // 处理innerbatch消息</span></span>
<span class="line"><span>  putMessageHookList.add(new PutMessageHook() {</span></span>
<span class="line"><span>    public PutMessageResult executeBeforePutMessage(MessageExt msg) {</span></span>
<span class="line"><span>      if (msg instanceof MessageExtBrokerInner) {</span></span>
<span class="line"><span>        return HookUtils.checkInnerBatch(BrokerController.this, msg);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>  // 处理延迟消息</span></span>
<span class="line"><span>  putMessageHookList.add(new PutMessageHook() {</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public PutMessageResult executeBeforePutMessage(MessageExt msg) {</span></span>
<span class="line"><span>      if (msg instanceof MessageExtBrokerInner) {</span></span>
<span class="line"><span>        return HookUtils.handleScheduleMessage(BrokerController.this, (MessageExtBrokerInner) msg);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br></div></div><p><strong>检查消息状态</strong></p><ul><li>如果broker的消息存储处于关闭状态，直接返回服务不可用</li><li>如果不允许重复复制，并且broker角色为slave，直接返回服务不可用</li><li>如果MessageStore不可写，直接返回服务不可用</li><li>非重试topic且topic超长，则直接返回消息非法</li><li>如果消息topic大于MAX_TOPIC_LENGTH(255)，则直接返回消息非法</li><li>消息体为空，直接返回消息非法</li><li>PageCache繁忙，直接返回服务不可用</li></ul><p><strong>处理innerbatch消息</strong></p><p>主要是检查消息的SysFlag跟消息的配置对不对得上，对不上就报错</p><p><strong>处理延迟消息</strong></p><p>等讲到延迟消息跟定时消息章节再讲解，主要会对消息的内容跟主题做一些转换</p><h3 id="commitlog-asyncputmessage" tabindex="-1">CommitLog#asyncPutMessage <a class="header-anchor" href="#commitlog-asyncputmessage" aria-label="Permalink to &quot;CommitLog#asyncPutMessage&quot;">​</a></h3><p>在DefaultMessageStore#asyncPutMessage中最终是调用CommitLog#asyncPutMessage发送消息的，我们再来看看这个方法:</p><div class="language-CommitLog vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitLog</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public CompletableFuture&lt;PutMessageResult&gt; asyncPutMessage(final MessageExtBrokerInner msg) {</span></span>
<span class="line"><span>  // 设置消息储存时间</span></span>
<span class="line"><span>  if (!defaultMessageStore.getMessageStoreConfig().isDuplicationEnable()) {</span></span>
<span class="line"><span>    msg.setStoreTimestamp(System.currentTimeMillis());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 设置消息CRC校验码</span></span>
<span class="line"><span>  msg.setBodyCRC(UtilAll.crc32(msg.getBody()));</span></span>
<span class="line"><span>  if (enabledAppendPropCRC) {</span></span>
<span class="line"><span>    // delete crc32 properties if exist</span></span>
<span class="line"><span>    msg.deleteProperty(MessageConst.PROPERTY_CRC32);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 设置消息版本号</span></span>
<span class="line"><span>  String topic = msg.getTopic();</span></span>
<span class="line"><span>  msg.setVersion(MessageVersion.MESSAGE_VERSION_V1);</span></span>
<span class="line"><span>  boolean autoMessageVersionOnTopicLen =</span></span>
<span class="line"><span>          this.defaultMessageStore.getMessageStoreConfig().isAutoMessageVersionOnTopicLen();</span></span>
<span class="line"><span>  if (autoMessageVersionOnTopicLen &amp;&amp; topic.length() &gt; Byte.MAX_VALUE) {</span></span>
<span class="line"><span>    msg.setVersion(MessageVersion.MESSAGE_VERSION_V2);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 设置消息产生的host</span></span>
<span class="line"><span>  InetSocketAddress bornSocketAddress = (InetSocketAddress) msg.getBornHost();</span></span>
<span class="line"><span>  if (bornSocketAddress.getAddress() instanceof Inet6Address) {</span></span>
<span class="line"><span>    msg.setBornHostV6Flag();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 设置消息储存的host</span></span>
<span class="line"><span>  InetSocketAddress storeSocketAddress = (InetSocketAddress) msg.getStoreHost();</span></span>
<span class="line"><span>  if (storeSocketAddress.getAddress() instanceof Inet6Address) {</span></span>
<span class="line"><span>    msg.setStoreHostAddressV6Flag();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 获取要写入的mappedFile文件</span></span>
<span class="line"><span>  PutMessageThreadLocal putMessageThreadLocal = this.putMessageThreadLocal.get();</span></span>
<span class="line"><span>  updateMaxMessageSize(putMessageThreadLocal);</span></span>
<span class="line"><span>  String topicQueueKey = generateKey(putMessageThreadLocal.getKeyBuilder(), msg);</span></span>
<span class="line"><span>  long elapsedTimeInLock = 0;</span></span>
<span class="line"><span>  MappedFile unlockMappedFile = null;</span></span>
<span class="line"><span>  MappedFile mappedFile = this.mappedFileQueue.getLastMappedFile();</span></span>
<span class="line"><span>  // 获取要写入的mappedFile文件的位置</span></span>
<span class="line"><span>  long currOffset;</span></span>
<span class="line"><span>  if (mappedFile == null) {</span></span>
<span class="line"><span>    currOffset = 0;</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    currOffset = mappedFile.getFileFromOffset() + mappedFile.getWrotePosition();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 主从相关配置</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    long beginLockTimestamp = this.defaultMessageStore.getSystemClock().now();</span></span>
<span class="line"><span>    this.beginTimeInLock = beginLockTimestamp;</span></span>
<span class="line"><span>    // 设置保存时间，为了确保全局顺序性</span></span>
<span class="line"><span>    if (!defaultMessageStore.getMessageStoreConfig().isDuplicationEnable()) {</span></span>
<span class="line"><span>      msg.setStoreTimestamp(beginLockTimestamp);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果mappedFile为空或者mappedFile已经满了，重新获取mappedFile</span></span>
<span class="line"><span>    if (null == mappedFile || mappedFile.isFull()) {</span></span>
<span class="line"><span>      mappedFile = this.mappedFileQueue.getLastMappedFile(0); // Mark: NewFile may be cause noise</span></span>
<span class="line"><span>      if (isCloseReadAhead()) {</span></span>
<span class="line"><span>        setFileReadMode(mappedFile, LibC.MADV_RANDOM);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 实际保存方法</span></span>
<span class="line highlighted"><span>    result = mappedFile.appendMessage(msg, this.appendMessageCallback, putMessageContext);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    // 获取保存结果做处理</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  PutMessageResult putMessageResult = new PutMessageResult(PutMessageStatus.PUT_OK, result);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // Statistics</span></span>
<span class="line"><span>  storeStatsService.getSinglePutMessageTopicTimesTotal(msg.getTopic()).add(result.getMsgNum());</span></span>
<span class="line"><span>  storeStatsService.getSinglePutMessageTopicSizeTotal(topic).add(result.getWroteBytes());</span></span>
<span class="line"><span>  // 同步刷盘等待刷盘结束跟主从处理</span></span>
<span class="line"><span>  return handleDiskFlushAndHA(putMessageResult, msg, needAckNums, needHandleHA);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br></div></div><p>好了，可以看到最终就是调用了MappedFile#appendMessage来保存消息的。</p><h3 id="总结-1" tabindex="-1">总结 <a class="header-anchor" href="#总结-1" aria-label="Permalink to &quot;总结&quot;">​</a></h3><p><img src="`+o+`" alt="message-send"></p><h2 id="消息存储" tabindex="-1">消息存储 <a class="header-anchor" href="#消息存储" aria-label="Permalink to &quot;消息存储&quot;">​</a></h2><ul><li>RocketMQ底层使用mmap文件格式来进行消息的存储的, 而负责单个mmap文件的操作逻辑的类就是DefaultMappedFile</li><li>由于每个mmap文件的大小是有限制的(RocketMQ默认是1G), 当一个mmap文件内容写满了之后，就要新建一个mmap文件来存储新的消息，这样多个mmap之间就组成了一个mmap文件链表，而负责管理这个链表的类就是MappedFileQueue</li><li>前面两个类只是负责文件的读写，刷新/清除操作等等，对于CommitLog，需要新增加一个类来管理每个mmap文件的格式定义以及读写消息等等，这个类就是CommitLog</li><li>为了扩展性，可能需要更换默认的存储实现(比如DLedger模式下使用DLedgerCommitLog)，所以在CommitLog之上再增加了一层，那就是DefaultMessageStore</li></ul><div class="info custom-block"><p class="custom-block-title">INFO</p><p>如果想了解DLedger模式，即自动主从切换模式, 可以点击<a href="https://rocketmq.apache.org/zh/docs/4.x/bestPractice/02dledger/" target="_blank" rel="noreferrer">此处</a>; Rocketmq5之后又推出了Controller模式，将主从集群的管理和协调交给Controller来做，点击<a href="https://rocketmq.apache.org/zh/docs/deploymentOperations/03autofailover/" target="_blank" rel="noreferrer">此处</a>。</p></div><h3 id="defaultmappedfile" tabindex="-1">DefaultMappedFile <a class="header-anchor" href="#defaultmappedfile" aria-label="Permalink to &quot;DefaultMappedFile&quot;">​</a></h3><p>RocketMQ用来实现最底层Mmap文件读写操作的具体实现类是DefaultMappedFile，先看看这个类的属性定义。</p><div class="language-DefaultMappedFile vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMappedFile</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 操作系统每页的大小，默认4K</span></span>
<span class="line"><span>public static final int OS_PAGE_SIZE = 1024 * 4;</span></span>
<span class="line"><span>public static final Unsafe UNSAFE = getUnsafe();</span></span>
<span class="line"><span>// 用来检查MappedFile中某个位置是否已经加载了</span></span>
<span class="line"><span>private static final Method IS_LOADED_METHOD;</span></span>
<span class="line"><span>// Unsafe使用的页面大小</span></span>
<span class="line"><span>public static final int UNSAFE_PAGE_SIZE = UNSAFE == null ? OS_PAGE_SIZE : UNSAFE.pageSize();</span></span>
<span class="line"><span>// 统计 RocketMQ 使用的所有内存映射文件的虚拟内存总量</span></span>
<span class="line"><span>protected static final AtomicLong TOTAL_MAPPED_VIRTUAL_MEMORY = new AtomicLong(0);</span></span>
<span class="line"><span>// RocketMQ 中已映射的文件数量</span></span>
<span class="line"><span>protected static final AtomicInteger TOTAL_MAPPED_FILES = new AtomicInteger(0);</span></span>
<span class="line"><span>// 当前写入的文件偏移位置</span></span>
<span class="line"><span>protected static final AtomicIntegerFieldUpdater&lt;DefaultMappedFile&gt; WROTE_POSITION_UPDATER;</span></span>
<span class="line"><span>// 已提交的文件偏移位置</span></span>
<span class="line"><span>protected static final AtomicIntegerFieldUpdater&lt;DefaultMappedFile&gt; COMMITTED_POSITION_UPDATER;</span></span>
<span class="line"><span>// 已刷盘的文件偏移位置</span></span>
<span class="line"><span>protected static final AtomicIntegerFieldUpdater&lt;DefaultMappedFile&gt; FLUSHED_POSITION_UPDATER;</span></span>
<span class="line"><span>// 当前文件中写入的位置</span></span>
<span class="line"><span>protected volatile int wrotePosition;</span></span>
<span class="line"><span>// 消息已经提交（即成功写入到文件并被确认）的偏移位置</span></span>
<span class="line"><span>protected volatile int committedPosition;</span></span>
<span class="line"><span>// 已刷盘（即成功持久化到磁盘）的偏移位置</span></span>
<span class="line"><span>protected volatile int flushedPosition;</span></span>
<span class="line"><span>// 当前文件的大小</span></span>
<span class="line"><span>protected int fileSize;</span></span>
<span class="line"><span>// 用于操作文件的通道，允许对文件进行读写操作</span></span>
<span class="line"><span>protected FileChannel fileChannel;</span></span>
<span class="line"><span>/* 如果使用了transientStorePool，那么先会将写入的数据放到writeBuffer，然后再刷新到transientStorePool */</span></span>
<span class="line"><span>protected ByteBuffer writeBuffer = null;</span></span>
<span class="line"><span>// 存暂时存储的数据。当内存足够时，可以将消息先存储到内存池中，待合适时机再写入磁盘，减少磁盘的 I/O 操作</span></span>
<span class="line"><span>protected TransientStorePool transientStorePool = null;</span></span>
<span class="line"><span>// 当前映射文件的文件名</span></span>
<span class="line"><span>protected String fileName;</span></span>
<span class="line"><span>// 文件中存储的消息的起始偏移量。即这个文件从哪个消息位置开始存储</span></span>
<span class="line"><span>protected long fileFromOffset;</span></span>
<span class="line"><span>// 当前映射文件对应的 File 对象，用于进行文件操作（例如打开、关闭文件）</span></span>
<span class="line"><span>protected File file;</span></span>
<span class="line"><span>// 通过内存映射技术映射到内存的字节缓冲区，用于高效地存取文件中的数据</span></span>
<span class="line"><span>protected MappedByteBuffer mappedByteBuffer;</span></span>
<span class="line"><span>// 当前文件的创建时间或最后修改时间，通常用于日志或文件管理</span></span>
<span class="line"><span>protected volatile long storeTimestamp = 0;</span></span>
<span class="line"><span>// 标识当前映射文件是否是队列中的第一个文件</span></span>
<span class="line"><span>protected boolean firstCreateInQueue = false;</span></span>
<span class="line"><span>// 记录上次刷新操作的时间。用于控制消息刷盘的频率，避免频繁的磁盘I/O操作</span></span>
<span class="line"><span>private long lastFlushTime = -1L;</span></span>
<span class="line"><span>// 某些情况下，映射文件可能需要被清理或重新映射，这个字段存储待清理的内存映射缓冲区</span></span>
<span class="line"><span>protected MappedByteBuffer mappedByteBufferWaitToClean = null;</span></span>
<span class="line"><span>// 最近一次内存映射的时间。它可能用于控制内存映射的频率，以优化性能</span></span>
<span class="line"><span>protected long swapMapTime = 0L;</span></span>
<span class="line"><span>// 记录自上次映射交换以来，mappedByteBuffer 被访问的次数。可以帮助决定何时重新映射文件或交换内存区域，以提高性能</span></span>
<span class="line"><span>protected long mappedByteBufferAccessCountSinceLastSwap = 0L;</span></span>
<span class="line"><span>/* 如果当前映射文件属于消费队列，记录该文件存储的第一个消息的时间戳 */</span></span>
<span class="line"><span>private long startTimestamp = -1;</span></span>
<span class="line"><span>/* 如果当前映射文件属于消费队列，记录该文件存储的最后一个消息的时间戳 */</span></span>
<span class="line"><span>private long stopTimestamp = -1;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br></div></div><p>DefaultMappedFile初始化就是在DefaultMappedFile的构造函数中执行的，代码如下:</p><div class="language-DefaultMappedFile vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMappedFile</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public DefaultMappedFile(final String fileName, final int fileSize) throws IOException {</span></span>
<span class="line"><span>    init(fileName, fileSize);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public void init(final String fileName, final int fileSize,</span></span>
<span class="line"><span>    final TransientStorePool transientStorePool) throws IOException {</span></span>
<span class="line"><span>    init(fileName, fileSize);</span></span>
<span class="line"><span>    this.writeBuffer = transientStorePool.borrowBuffer();</span></span>
<span class="line"><span>    this.transientStorePool = transientStorePool;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>private void init(final String fileName, final int fileSize) throws IOException {</span></span>
<span class="line"><span>  this.fileName = fileName;</span></span>
<span class="line"><span>  this.fileSize = fileSize;</span></span>
<span class="line"><span>  this.file = new File(fileName);</span></span>
<span class="line"><span>  this.fileFromOffset = Long.parseLong(this.file.getName());</span></span>
<span class="line"><span>  UtilAll.ensureDirOK(this.file.getParent());</span></span>
<span class="line"><span>  // 打开对应的文件，获取到fileChannel</span></span>
<span class="line"><span>  this.fileChannel = new RandomAccessFile(this.file, &quot;rw&quot;).getChannel();</span></span>
<span class="line"><span>  // 通过fileChannel获取到mmap内存映射buffer</span></span>
<span class="line"><span>  this.mappedByteBuffer = this.fileChannel.map(MapMode.READ_WRITE, 0, fileSize);</span></span>
<span class="line"><span>  TOTAL_MAPPED_VIRTUAL_MEMORY.addAndGet(fileSize);</span></span>
<span class="line"><span>  TOTAL_MAPPED_FILES.incrementAndGet();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>可以看到就是创建了一个mmap文件并且映射了Mmap操作; 我们看看是DefaultMappedFile是在哪里创建出来的。</p><div class="language-DefaultMappedFile vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMappedFile</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>protected MappedFile doCreateMappedFile(String nextFilePath, String nextNextFilePath) {</span></span>
<span class="line"><span>  MappedFile mappedFile = null;</span></span>
<span class="line"><span>  if (this.allocateMappedFileService != null) {</span></span>
<span class="line"><span>    mappedFile = this.allocateMappedFileService.putRequestAndReturnMappedFile(nextFilePath,</span></span>
<span class="line"><span>            nextNextFilePath, this.mappedFileSize);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    mappedFile = new DefaultMappedFile(nextFilePath, this.mappedFileSize);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  if (mappedFile != null) {</span></span>
<span class="line"><span>    if (this.mappedFiles.isEmpty()) {</span></span>
<span class="line"><span>      mappedFile.setFirstCreateInQueue(true);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.mappedFiles.add(mappedFile);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return mappedFile;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>可以看到如果存在AllocateMappedFileService，就调用allocateMappedFileService.putRequestAndReturnMappedFile来创建mappedFile，否则直接new一个mappedFile。</p><p>AllocateMappedFileService的逻辑就不细说了，看AllocateMappedFileService#putRequestAndReturnMappedFile-&gt;requestTable#putIfAbsent和AllocateMappedFileService#run -&gt; AllocateMappedFileService#mmapOperation里面关于MappedFile的new方法</p><h3 id="mappedfilequeue" tabindex="-1">MappedFileQueue <a class="header-anchor" href="#mappedfilequeue" aria-label="Permalink to &quot;MappedFileQueue&quot;">​</a></h3><p>当MappedFile文件有多个的时候，就要使用MappedFileQueue来管理MappedFile了，我们看一下这个类的属性。</p><div class="language-MappedFileQueue vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MappedFileQueue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 消息存储的根目录路径</span></span>
<span class="line"><span>protected final String storePath;</span></span>
<span class="line"><span>// 单个文件的存储大小</span></span>
<span class="line"><span>protected final int mappedFileSize;</span></span>
<span class="line"><span>// MappedFile文件集合</span></span>
<span class="line"><span>protected final CopyOnWriteArrayList&lt;MappedFile&gt; mappedFiles = new CopyOnWriteArrayList&lt;&gt;();</span></span>
<span class="line"><span>// 创建MappedFile服务类</span></span>
<span class="line"><span>protected final AllocateMappedFileService allocateMappedFileService;</span></span>
<span class="line"><span>// 当前刷盘指针</span></span>
<span class="line"><span>protected long flushedWhere = 0;</span></span>
<span class="line"><span>// 当前数据提交指针</span></span>
<span class="line"><span>protected long committedWhere = 0;</span></span>
<span class="line"><span>// 当前存储文件的创建时间或最后更新时间</span></span>
<span class="line"><span>protected volatile long storeTimestamp = 0;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>再看一下这个类是在哪里初始化的。</p><div class="language-CommitLog vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitLog</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public CommitLog(final DefaultMessageStore messageStore) {</span></span>
<span class="line"><span>  String storePath = messageStore.getMessageStoreConfig().getStorePathCommitLog();</span></span>
<span class="line"><span>  if (storePath.contains(MixAll.MULTI_PATH_SPLITTER)) {</span></span>
<span class="line"><span>    this.mappedFileQueue = new MultiPathMappedFileQueue(messageStore.getMessageStoreConfig(),</span></span>
<span class="line"><span>            messageStore.getMessageStoreConfig().getMappedFileSizeCommitLog(),</span></span>
<span class="line"><span>            messageStore.getAllocateMappedFileService(), this::getFullStorePaths);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    this.mappedFileQueue = new MappedFileQueue(storePath,</span></span>
<span class="line"><span>            messageStore.getMessageStoreConfig().getMappedFileSizeCommitLog(),</span></span>
<span class="line"><span>            messageStore.getAllocateMappedFileService());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>可以看到storePath跟mappedFileSize这两个参数都是可以进行配置的。</p><h3 id="commitlog" tabindex="-1">CommitLog <a class="header-anchor" href="#commitlog" aria-label="Permalink to &quot;CommitLog&quot;">​</a></h3><p>CommitLog就是用来定义消息储存格式以及消息保存的类，我们看一下这个类的属性都有什么。</p><div class="language-CommitLog vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitLog</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Message&#39;s MAGIC CODE daa320a7</span></span>
<span class="line"><span>public final static int MESSAGE_MAGIC_CODE = -626843481;</span></span>
<span class="line"><span>// End of file empty MAGIC CODE cbd43194</span></span>
<span class="line"><span>public final static int BLANK_MAGIC_CODE = -875286124;</span></span>
<span class="line"><span>// 用来计算 CRC32 校验值的存储所需的字节数，确保消息的一致性和完整性</span></span>
<span class="line"><span>// CRC32 Format: [PROPERTY_CRC32 + NAME_VALUE_SEPARATOR + 10-digit fixed-length string + PROPERTY_SEPARATOR]</span></span>
<span class="line"><span>public static final int CRC32_RESERVED_LEN = MessageConst.PROPERTY_CRC32.length() + 1 + 10 + 1;</span></span>
<span class="line"><span>// 处理消息存储的队列。它利用内存映射文件 (Memory-Mapped Files) 来优化文件的读写性能，支持快速的文件操作</span></span>
<span class="line"><span>protected final MappedFileQueue mappedFileQueue;</span></span>
<span class="line"><span>// DefaultMessageStore</span></span>
<span class="line"><span>protected final DefaultMessageStore defaultMessageStore;</span></span>
<span class="line"><span>// 默认的消息存储实现类。它负责消息的持久化和加载，并提供存储相关的接口，保证消息的可靠存储和检索</span></span>
<span class="line"><span>private final FlushManager flushManager;</span></span>
<span class="line"><span>// 负责检查“冷数据”, 监控存储中的数据是否符合“热/冷”数据的分类，可能会影响存储的管理和清理策略</span></span>
<span class="line"><span>private final ColdDataCheckService coldDataCheckService;</span></span>
<span class="line"><span>// 回调函数，用于处理消息的追加操作。在消息写入磁盘时，RocketMQ 会通过回调函数来控制如何将消息追加到文件中，确保数据一致性和高效写入</span></span>
<span class="line"><span>private final AppendMessageCallback appendMessageCallback;</span></span>
<span class="line"><span>// 线程局部变量，用于存储与当前线程相关的消息存储信息</span></span>
<span class="line"><span>private final ThreadLocal&lt;PutMessageThreadLocal&gt; putMessageThreadLocal;</span></span>
<span class="line"><span>// 确认偏移量是指消费者已经成功消费的消息的位移。在消息消费过程中，确认偏移量是用来确保消息被成功消费且不会重复消费的关键。</span></span>
<span class="line"><span>protected volatile long confirmOffset = -1L;</span></span>
<span class="line"><span>// 记录进入锁定状态的开始时间,它用于跟踪获取锁时的时间戳，可能用于分析锁的持有时间，以帮助进行性能调优和锁管理。</span></span>
<span class="line"><span>private volatile long beginTimeInLock = 0;</span></span>
<span class="line"><span>// 用于消息存储操作时的锁对象</span></span>
<span class="line"><span>protected final PutMessageLock putMessageLock;</span></span>
<span class="line"><span>// 消息是按主题（Topic）和队列（Queue）组织的，因此为了避免多个生产者或消费者并发访问同一个队列而产生冲突，TopicQueueLock 用来控制队列级别的锁，确保操作的顺序和一致性</span></span>
<span class="line"><span>protected final TopicQueueLock topicQueueLock;</span></span>
<span class="line"><span>// 保存了已经满载的存储路径。消息存储通常会分配多个存储路径（如文件目录），当某个路径的磁盘空间已满时，它会被标记为“满载”。这个集合帮助 RocketMQ 了解哪些存储路径已被占用，避免进一步写入</span></span>
<span class="line"><span>private volatile Set&lt;String&gt; fullStorePaths = Collections.emptySet();</span></span>
<span class="line"><span>// 监控磁盘刷写操作的工具，它帮助监控磁盘是否达到预期的写入性能或者是否出现异常</span></span>
<span class="line"><span>private final FlushDiskWatcher flushDiskWatcher;</span></span>
<span class="line"><span>// 消息提交日志（CommitLog）的大小，通常与文件分配和存储容量相关</span></span>
<span class="line"><span>protected int commitLogSize;</span></span>
<span class="line"><span>// 启用消息的 CRC 校验属性, 如果这个属性为 true，那么每条消息都会附带一个 CRC 校验值</span></span>
<span class="line"><span>private final boolean enabledAppendPropCRC;</span></span>
<span class="line"><span>// 多路分发机制，用于在多个消息消费者之间分发消息。它能够处理消息的负载均衡和分发逻辑，确保消息能够高效地分配到各个消费者上</span></span>
<span class="line"><span>protected final MultiDispatch multiDispatch;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br></div></div><p>CommitLog的初始化是在DefaultMessageStore中做处理的，具体代码如下:</p><div class="language-DefaultMessageStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMessageStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public DefaultMessageStore(final MessageStoreConfig messageStoreConfig, final BrokerStatsManager brokerStatsManager,</span></span>
<span class="line"><span>                            final MessageArrivingListener messageArrivingListener, final BrokerConfig brokerConfig, final ConcurrentMap&lt;String, TopicConfig&gt; topicConfigTable) throws IOException {</span></span>
<span class="line"><span>  if (messageStoreConfig.isEnableDLegerCommitLog()) {</span></span>
<span class="line"><span>    this.commitLog = new DLedgerCommitLog(this);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    this.commitLog = new CommitLog(this);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><h3 id="defaultmessagestore" tabindex="-1">DefaultMessageStore <a class="header-anchor" href="#defaultmessagestore" aria-label="Permalink to &quot;DefaultMessageStore&quot;">​</a></h3><p>这个类就是具体最终实现消息存储的类，包含了很多对存储文件操作的API，其他模块对消息实体的操作都是通过这个类来进行操作的。</p><p>我们看看这个类的一些属性，具体如下所示：</p><div class="language-DefaultMessageStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMessageStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 包含消息存储的相关参数，比如存储路径、CommitLog 文件大小、刷盘策略、消息存储的最大大小等</span></span>
<span class="line"><span>private final MessageStoreConfig messageStoreConfig;</span></span>
<span class="line"><span>// RocketMQ 的核心存储文件，所有消息都会首先写入 CommitLog 文件。commitLog 存储消息的持久化记录，是消息存储的主要组件</span></span>
<span class="line"><span>protected final CommitLog commitLog;</span></span>
<span class="line"><span>// 消费队列</span></span>
<span class="line"><span>protected final ConsumeQueueStoreInterface consumeQueueStore;</span></span>
<span class="line"><span>// 消费队列的刷盘服务，负责周期性地将消费队列数据刷写到磁盘，确保消费进度持久化</span></span>
<span class="line"><span>private final FlushConsumeQueueService flushConsumeQueueService;</span></span>
<span class="line"><span>// 清除commitlog文件服务</span></span>
<span class="line"><span>protected final CleanCommitLogService cleanCommitLogService;</span></span>
<span class="line"><span>// 定期清理已不再使用的CommitLog文件，RocketMQ 会在消息消费并持久化后，定期清理旧的 CommitLog 文件，释放磁盘空间。</span></span>
<span class="line"><span>private final CleanConsumeQueueService cleanConsumeQueueService;</span></span>
<span class="line"><span>// 用于修正消息的逻辑偏移量（例如，逻辑错误导致的偏移量不一致），确保消息消费的准确性和一致性</span></span>
<span class="line"><span>private final CorrectLogicOffsetService correctLogicOffsetService;</span></span>
<span class="line"><span>// 维护消息索引，RocketMQ 为提高消息查询效率，会生成索引文件</span></span>
<span class="line"><span>protected final IndexService indexService;</span></span>
<span class="line"><span>// 负责分配新的MappedFile文件，此服务确保新的文件在需要时得到分配，并且管理文件的生命周期</span></span>
<span class="line"><span>private final AllocateMappedFileService allocateMappedFileService;</span></span>
<span class="line"><span>// CommitLog消息分发，根据CommitLog文件构建ConsumeQueue，IndexFile文件</span></span>
<span class="line"><span>private ReputMessageService reputMessageService;</span></span>
<span class="line"><span>// 存储HA机制</span></span>
<span class="line"><span>private HAService haService;</span></span>
<span class="line"><span>// 压缩存储的组件。为了节省存储空间和提高性能，RocketMQ 会定期执行日志压缩操作，将旧的、无效的数据合并成更小的存储文件</span></span>
<span class="line"><span>private CompactionStore compactionStore;</span></span>
<span class="line"><span>// 启动和执行日志压缩操作。通过定期合并和删除无效数据，它优化了存储空间的使用和文件系统的性能</span></span>
<span class="line"><span>private CompactionService compactionService;</span></span>
<span class="line"><span>// 消息存储相关的统计信息，帮助监控和分析存储系统的运行状态和性能</span></span>
<span class="line"><span>private final StoreStatsService storeStatsService;</span></span>
<span class="line"><span>// 临时存储池，用于缓存消息数据。当内存足够时，消息数据会先存储在临时池中，然后再写入磁盘</span></span>
<span class="line"><span>private final TransientStorePool transientStorePool;</span></span>
<span class="line"><span>// 存储 RocketMQ 当前运行状态的标志，例如是否处于运行中、是否在执行任务等</span></span>
<span class="line"><span>protected final RunningFlags runningFlags = new RunningFlags();</span></span>
<span class="line"><span>// 获取系统的当前时间</span></span>
<span class="line"><span>private final SystemClock systemClock = new SystemClock();</span></span>
<span class="line"><span>// 调度线程池，用于定时执行任务。RocketMQ 使用它来定时执行一些任务，比如文件刷盘、清理过期文件、心跳检测等</span></span>
<span class="line"><span>private final ScheduledExecutorService scheduledExecutorService;</span></span>
<span class="line"><span>// Broker状态管理，如吞吐量、消息量等，帮助监控和分析 broker 的性能</span></span>
<span class="line"><span>private final BrokerStatsManager brokerStatsManager;</span></span>
<span class="line"><span>// 消息拉取长轮询模式到达监听器</span></span>
<span class="line"><span>private final MessageArrivingListener messageArrivingListener;</span></span>
<span class="line"><span>// 包含了 broker 的网络、存储、消息处理等各项参数。</span></span>
<span class="line"><span>private final BrokerConfig brokerConfig;</span></span>
<span class="line"><span>private volatile boolean shutdown = true;</span></span>
<span class="line"><span>// 批量消息到达通知</span></span>
<span class="line"><span>protected boolean notifyMessageArriveInBatch = false;</span></span>
<span class="line"><span>// 文件刷盘监测点</span></span>
<span class="line"><span>protected StoreCheckpoint storeCheckpoint;</span></span>
<span class="line"><span>// 存储定时消息。RocketMQ 支持定时消息功能，timerMessageStore 负责存储这些延迟投递的消息</span></span>
<span class="line"><span>private TimerMessageStore timerMessageStore;</span></span>
<span class="line"><span>// CommitLog文件转发</span></span>
<span class="line"><span>private final LinkedList&lt;CommitLogDispatcher&gt; dispatcherList;</span></span>
<span class="line"><span>// RocksDB存储</span></span>
<span class="line"><span>private RocksDBMessageStore rocksDBMessageStore;</span></span>
<span class="line"><span>private RandomAccessFile lockFile;</span></span>
<span class="line"><span>private FileLock lock;</span></span>
<span class="line"><span>boolean shutDownNormal = false;</span></span>
<span class="line"><span>// 最大拉取消息大小，用于控制消息消费时每次拉取的最大数据量</span></span>
<span class="line"><span>private final static int MAX_PULL_MSG_SIZE = 128 * 1024 * 1024;</span></span>
<span class="line"><span>// 可用的副本数量</span></span>
<span class="line"><span>private volatile int aliveReplicasNum = 1;</span></span>
<span class="line"><span>// Refer the MessageStore of MasterBroker in the same process.</span></span>
<span class="line"><span>// If current broker is master, this reference point to null or itself.</span></span>
<span class="line"><span>// If current broker is slave, this reference point to the store of master broker, and the two stores belong to</span></span>
<span class="line"><span>// different broker groups.</span></span>
<span class="line"><span>private MessageStore masterStoreInProcess = null;</span></span>
<span class="line"><span>private volatile long masterFlushedOffset = -1L;</span></span>
<span class="line"><span>private volatile long brokerInitMaxOffset = -1L;</span></span>
<span class="line"><span>// 存储 PutMessage 钩子列表，RocketMQ 支持在消息存储前后执行钩子操作</span></span>
<span class="line"><span>private List&lt;PutMessageHook&gt; putMessageHookList = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>// 发送消息回调的钩子，允许在消息发送后执行回调操作</span></span>
<span class="line"><span>private SendMessageBackHook sendMessageBackHook;</span></span>
<span class="line"><span>// 存储延迟消息的延迟级别和对应的延迟时间</span></span>
<span class="line"><span>private final ConcurrentSkipListMap&lt;Integer /* level */, Long/* delay timeMillis */&gt; delayLevelTable =</span></span>
<span class="line"><span>        new ConcurrentSkipListMap&lt;&gt;();</span></span>
<span class="line"><span>// 最大的延迟级别</span></span>
<span class="line"><span>private int maxDelayLevel;</span></span>
<span class="line"><span>// 统计当前持有的映射页面数</span></span>
<span class="line"><span>private final AtomicInteger mappedPageHoldCount = new AtomicInteger(0);</span></span>
<span class="line"><span>// 存储批量调度请求，处理多个请求的批量调度</span></span>
<span class="line"><span>private final ConcurrentLinkedQueue&lt;BatchDispatchRequest&gt; batchDispatchRequestQueue = new ConcurrentLinkedQueue&lt;&gt;();</span></span>
<span class="line"><span>// 顺序调度队列的大小</span></span>
<span class="line"><span>private int dispatchRequestOrderlyQueueSize = 16;</span></span>
<span class="line"><span>// 顺序调度队列 </span></span>
<span class="line"><span>private final DispatchRequestOrderlyQueue dispatchRequestOrderlyQueue = new DispatchRequestOrderlyQueue(dispatchRequestOrderlyQueueSize);</span></span>
<span class="line"><span>// 状态机版本号 </span></span>
<span class="line"><span>private long stateMachineVersion = 0L;</span></span>
<span class="line"><span>// 主题配置表</span></span>
<span class="line"><span>private ConcurrentMap&lt;String, TopicConfig&gt; topicConfigTable;</span></span>
<span class="line"><span>// 用于定期清理消费队列。它在后台定时执行任务，清理过期或无效的消费队列文件</span></span>
<span class="line"><span>private final ScheduledExecutorService scheduledCleanQueueExecutorService =</span></span>
<span class="line"><span>        ThreadUtils.newSingleThreadScheduledExecutor(new ThreadFactoryImpl(&quot;StoreCleanQueueScheduledThread&quot;));</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br></div></div><p>我们看看DefaultMessageStore是在哪里初始化的吧，具体代码如下所示:</p><div class="language-BrokerController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">BrokerController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public boolean initializeMessageStore() {</span></span>
<span class="line"><span>  DefaultMessageStore defaultMessageStore;</span></span>
<span class="line"><span>  if (this.messageStoreConfig.isEnableRocksDBStore()) {</span></span>
<span class="line"><span>    defaultMessageStore = new RocksDBMessageStore(this.messageStoreConfig, this.brokerStatsManager, this.messageArrivingListener, this.brokerConfig, topicConfigManager.getTopicConfigTable());</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    defaultMessageStore = new DefaultMessageStore(this.messageStoreConfig, this.brokerStatsManager, this.messageArrivingListener, this.brokerConfig, topicConfigManager.getTopicConfigTable());</span></span>
<span class="line"><span>    if (messageStoreConfig.isRocksdbCQDoubleWriteEnable()) {</span></span>
<span class="line"><span>      defaultMessageStore.enableRocksdbCQWrite();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h3 id="消息写入缓存" tabindex="-1">消息写入缓存 <a class="header-anchor" href="#消息写入缓存" aria-label="Permalink to &quot;消息写入缓存&quot;">​</a></h3><p>由于DefaultMessageStore#<a href="/rocketmq/store.html#defaultmessagestore-asyncputmessage">asyncPutMessage</a>在存储消息就只有三步</p><ul><li>调用putMessageHook钩子列表</li><li>调用commitLog#asyncPutMessage方法存储消息</li><li>存储消息完毕之后调用storeStatsService记录消息存储相关的统计信息</li></ul><p><strong>commitLog#asyncPutMessage</strong></p><p>我们直接从commitLog#asyncPutMessage开始看起，忽略具体代码细节，只讲流程实现。</p><div class="language-CommitLog vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitLog</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public CompletableFuture&lt;PutMessageResult&gt; asyncPutMessage(final MessageExtBrokerInner msg) {</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  // 从MappedFileQueue获取最新的MappedFile</span></span>
<span class="line"><span>  MappedFile mappedFile = this.mappedFileQueue.getLastMappedFile();</span></span>
<span class="line"><span>  long currOffset;</span></span>
<span class="line"><span>  // 如果mappedFile为空，说明现在是初始化状态</span></span>
<span class="line"><span>  if (mappedFile == null) {</span></span>
<span class="line"><span>    currOffset = 0;</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    // 记录当前的消息写位置</span></span>
<span class="line"><span>    currOffset = mappedFile.getFileFromOffset() + mappedFile.getWrotePosition();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 如果mappedFile为空，那么创建一个mappedFile</span></span>
<span class="line"><span>  if (null == mappedFile || mappedFile.isFull()) {</span></span>
<span class="line"><span>    mappedFile = this.mappedFileQueue.getLastMappedFile(0); // Mark: NewFile may be cause noise</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 存储消息</span></span>
<span class="line"><span>  result = mappedFile.appendMessage(msg, this.appendMessageCallback, putMessageContext);</span></span>
<span class="line"><span>  switch (result.getStatus()) {</span></span>
<span class="line"><span>    case PUT_OK:</span></span>
<span class="line"><span>      // 存储消息成功</span></span>
<span class="line"><span>      onCommitLogAppend(msg, result, mappedFile);</span></span>
<span class="line"><span>      break;</span></span>
<span class="line"><span>    case END_OF_FILE:</span></span>
<span class="line"><span>      // MappedFile文件已经满了，重新创建一个MappedFile</span></span>
<span class="line"><span>      onCommitLogAppend(msg, result, mappedFile);</span></span>
<span class="line"><span>      unlockMappedFile = mappedFile;</span></span>
<span class="line"><span>      // Create a new file, re-write the message</span></span>
<span class="line"><span>      mappedFile = this.mappedFileQueue.getLastMappedFile(0);</span></span>
<span class="line"><span>      // 重新保存</span></span>
<span class="line"><span>      result = mappedFile.appendMessage(msg, this.appendMessageCallback, putMessageContext);</span></span>
<span class="line"><span>      if (AppendMessageStatus.PUT_OK.equals(result.getStatus())) {</span></span>
<span class="line"><span>        onCommitLogAppend(msg, result, mappedFile);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      break;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  PutMessageResult putMessageResult = new PutMessageResult(PutMessageStatus.PUT_OK, result);</span></span>
<span class="line"><span>  // 同步发送等待刷盘结束，主从设备需要复制到从机</span></span>
<span class="line"><span>  return handleDiskFlushAndHA(putMessageResult, msg, needAckNums, needHandleHA);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br></div></div><p><strong>MappedFile#appendMessag</strong></p><p>MappedFile#appendMessag -&gt; DefaultMappedFile#appendMessag -&gt; DefaultMappedFile#appendMessagesInner, 我们看看这个方法</p><div class="language-DefaultMappedFile vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMappedFile</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public AppendMessageResult appendMessagesInner(final MessageExt messageExt, final AppendMessageCallback cb,</span></span>
<span class="line"><span>    PutMessageContext putMessageContext) {</span></span>
<span class="line"><span>  // 获取当前写位置</span></span>
<span class="line"><span>  int currentPos = WROTE_POSITION_UPDATER.get(this);</span></span>
<span class="line"><span>  if (currentPos &lt; this.fileSize) {</span></span>
<span class="line"><span>    // 获取读写buffer</span></span>
<span class="line"><span>    ByteBuffer byteBuffer = appendMessageBuffer().slice();</span></span>
<span class="line"><span>    byteBuffer.position(currentPos);</span></span>
<span class="line"><span>    AppendMessageResult result;</span></span>
<span class="line"><span>    if (messageExt instanceof MessageExtBatch &amp;&amp; !((MessageExtBatch) messageExt).isInnerBatch()) {</span></span>
<span class="line"><span>       // traditional batch message</span></span>
<span class="line"><span>      result = cb.doAppend(this.getFileFromOffset(), byteBuffer, this.fileSize - currentPos,</span></span>
<span class="line"><span>            (MessageExtBatch) messageExt, putMessageContext);</span></span>
<span class="line"><span>    } else if (messageExt instanceof MessageExtBrokerInner) {</span></span>
<span class="line"><span>      // traditional single message or newly introduced inner-batch message</span></span>
<span class="line"><span>      // 将消息追加到byteBuffer后面</span></span>
<span class="line"><span>      result = cb.doAppend(this.getFileFromOffset(), byteBuffer, this.fileSize - currentPos,</span></span>
<span class="line"><span>          (MessageExtBrokerInner) messageExt, putMessageContext);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      return new AppendMessageResult(AppendMessageStatus.UNKNOWN_ERROR);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    WROTE_POSITION_UPDATER.addAndGet(this, result.getWroteBytes());</span></span>
<span class="line"><span>    this.storeTimestamp = result.getStoreTimestamp();</span></span>
<span class="line"><span>    return result;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  log.error(&quot;MappedFile.appendMessage return null, wrotePosition: {} fileSize: {}&quot;, currentPos, this.fileSize);</span></span>
<span class="line"><span>  return new AppendMessageResult(AppendMessageStatus.UNKNOWN_ERROR);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><p>这里有个核心的方法就是第7行byteBuffer，我们看看里面的实现</p><div class="language-DefaultMappedFile vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMappedFile</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>protected ByteBuffer appendMessageBuffer() {</span></span>
<span class="line"><span>  this.mappedByteBufferAccessCountSinceLastSwap++;</span></span>
<span class="line"><span>  return writeBuffer != null ? writeBuffer : this.mappedByteBuffer;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>可以看到如果writeBuffer不为空，就会返回writeBuffer，否则才会返回mappedByteBuffer(即Mmap), 可以看到RocketMQ不全是使用MMAP来存储消息的。</p><div class="language-DefaultMappedFile vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMappedFile</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public void init(final String fileName, final int fileSize,</span></span>
<span class="line"><span>                  final TransientStorePool transientStorePool) throws IOException {</span></span>
<span class="line"><span>  init(fileName, fileSize);</span></span>
<span class="line"><span>  this.writeBuffer = transientStorePool.borrowBuffer();</span></span>
<span class="line"><span>  this.transientStorePool = transientStorePool;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>如果开启了transientStorePool, 在broker.conf中定义了transientStorePoolEnable这个参数，那么就会开启内存池，使用内存池来缓存消息。至于为什么要这么做，可以看一下这个图。</p><p><img src="`+m+`" alt="transientStorePool"></p><p>我们再看看transientStorePool初始化的地方，看看有什么配置</p><div class="language-DefaultMessageStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMessageStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public DefaultMessageStore(final MessageStoreConfig messageStoreConfig, final BrokerStatsManager brokerStatsManager,</span></span>
<span class="line"><span>                            final MessageArrivingListener messageArrivingListener, final BrokerConfig brokerConfig, final ConcurrentMap&lt;String, TopicConfig&gt; topicConfigTable) throws IOException {</span></span>
<span class="line"><span>  this.transientStorePool = new TransientStorePool(messageStoreConfig.getTransientStorePoolSize(), messageStoreConfig.getMappedFileSizeCommitLog());</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>可以看到有两个配置参数，可以broker.conf配置，如下所示</p><ul><li>transientStorePoolSize: transientStorePool的个数，默认是5个</li><li>mappedFileSizeCommitLog: 每个transientStorePool的大小，默认是1G，即CommitlLog的大小</li></ul><p>再看看transientStorePoolSize的初始化函数，如下所示</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public TransientStorePool(final int poolSize, final int fileSize) {</span></span>
<span class="line"><span>    this.poolSize = poolSize;</span></span>
<span class="line"><span>    this.fileSize = fileSize;</span></span>
<span class="line"><span>    this.availableBuffers = new ConcurrentLinkedDeque&lt;&gt;();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>public void init() {</span></span>
<span class="line"><span>  for (int i = 0; i &lt; poolSize; i++) {</span></span>
<span class="line"><span>    ByteBuffer byteBuffer = ByteBuffer.allocateDirect(fileSize);</span></span>
<span class="line"><span>    final long address = ((DirectBuffer) byteBuffer).address();</span></span>
<span class="line"><span>    Pointer pointer = new Pointer(address);</span></span>
<span class="line"><span>    LibC.INSTANCE.mlock(pointer, new NativeLong(fileSize));</span></span>
<span class="line"><span>    availableBuffers.offer(byteBuffer);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>如果使用了TransientStorePool，可以看到会额外占用 transientStorePoolSize * mappedFileSizeCommitLog大小的堆外内存，注意要预留内存空间</p></div><p><strong>CommitLog#doAppend</strong></p><p>接下来看具体的消息写入方法CommitLog#doAppend，代码如下所示:</p><div class="language-CommitLog vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitLog</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public AppendMessageResult doAppend(final long fileFromOffset, final ByteBuffer byteBuffer, final int maxBlank,</span></span>
<span class="line"><span>                                    final MessageExtBrokerInner msgInner, PutMessageContext putMessageContext) {</span></span>
<span class="line"><span>  // STORETIMESTAMP + STOREHOSTADDRESS + OFFSET &lt;br&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ByteBuffer preEncodeBuffer = msgInner.getEncodedBuff();</span></span>
<span class="line"><span>  final boolean isMultiDispatchMsg = CommitLog.isMultiDispatchMsg(messageStoreConfig, msgInner);</span></span>
<span class="line"><span>  if (isMultiDispatchMsg) {</span></span>
<span class="line"><span>    AppendMessageResult appendMessageResult = handlePropertiesForLmqMsg(preEncodeBuffer, msgInner);</span></span>
<span class="line"><span>    if (appendMessageResult != null) {</span></span>
<span class="line"><span>      return appendMessageResult;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  final int msgLen = preEncodeBuffer.getInt(0);</span></span>
<span class="line"><span>  preEncodeBuffer.position(0);</span></span>
<span class="line"><span>  preEncodeBuffer.limit(msgLen);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // PHY OFFSET</span></span>
<span class="line"><span>  long wroteOffset = fileFromOffset + byteBuffer.position();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  Supplier&lt;String&gt; msgIdSupplier = () -&gt; {</span></span>
<span class="line"><span>    int sysflag = msgInner.getSysFlag();</span></span>
<span class="line"><span>    int msgIdLen = (sysflag &amp; MessageSysFlag.STOREHOSTADDRESS_V6_FLAG) == 0 ? 4 + 4 + 8 : 16 + 4 + 8;</span></span>
<span class="line"><span>    ByteBuffer msgIdBuffer = ByteBuffer.allocate(msgIdLen);</span></span>
<span class="line"><span>    MessageExt.socketAddress2ByteBuffer(msgInner.getStoreHost(), msgIdBuffer);</span></span>
<span class="line"><span>    msgIdBuffer.clear();//because socketAddress2ByteBuffer flip the buffer</span></span>
<span class="line"><span>    msgIdBuffer.putLong(msgIdLen - 8, wroteOffset);</span></span>
<span class="line"><span>    return UtilAll.bytes2string(msgIdBuffer.array());</span></span>
<span class="line"><span>  };</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // Record ConsumeQueue information</span></span>
<span class="line"><span>  Long queueOffset = msgInner.getQueueOffset();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // this msg maybe an inner-batch msg.</span></span>
<span class="line"><span>  short messageNum = getMessageNum(msgInner);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // Transaction messages that require special handling</span></span>
<span class="line"><span>  final int tranType = MessageSysFlag.getTransactionValue(msgInner.getSysFlag());</span></span>
<span class="line"><span>  switch (tranType) {</span></span>
<span class="line"><span>    // Prepared and Rollback message is not consumed, will not enter the consume queue</span></span>
<span class="line"><span>    case MessageSysFlag.TRANSACTION_PREPARED_TYPE:</span></span>
<span class="line"><span>    case MessageSysFlag.TRANSACTION_ROLLBACK_TYPE:</span></span>
<span class="line"><span>      queueOffset = 0L;</span></span>
<span class="line"><span>      break;</span></span>
<span class="line"><span>    case MessageSysFlag.TRANSACTION_NOT_TYPE:</span></span>
<span class="line"><span>    case MessageSysFlag.TRANSACTION_COMMIT_TYPE:</span></span>
<span class="line"><span>    default:</span></span>
<span class="line"><span>      break;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // Determines whether there is sufficient free space</span></span>
<span class="line"><span>  if ((msgLen + END_FILE_MIN_BLANK_LENGTH) &gt; maxBlank) {</span></span>
<span class="line"><span>    this.msgStoreItemMemory.clear();</span></span>
<span class="line"><span>    // 1 TOTALSIZE</span></span>
<span class="line"><span>    this.msgStoreItemMemory.putInt(maxBlank);</span></span>
<span class="line"><span>    // 2 MAGICCODE</span></span>
<span class="line"><span>    this.msgStoreItemMemory.putInt(CommitLog.BLANK_MAGIC_CODE);</span></span>
<span class="line"><span>    // 3 The remaining space may be any value</span></span>
<span class="line"><span>    // Here the length of the specially set maxBlank</span></span>
<span class="line"><span>    final long beginTimeMills = CommitLog.this.defaultMessageStore.now();</span></span>
<span class="line"><span>    byteBuffer.put(this.msgStoreItemMemory.array(), 0, 8);</span></span>
<span class="line"><span>    return new AppendMessageResult(AppendMessageStatus.END_OF_FILE, wroteOffset,</span></span>
<span class="line"><span>            maxBlank, /* only wrote 8 bytes, but declare wrote maxBlank for compute write position */</span></span>
<span class="line"><span>            msgIdSupplier, msgInner.getStoreTimestamp(),</span></span>
<span class="line"><span>            queueOffset, CommitLog.this.defaultMessageStore.now() - beginTimeMills);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  int pos = 4     // 1 TOTALSIZE</span></span>
<span class="line"><span>          + 4     // 2 MAGICCODE</span></span>
<span class="line"><span>          + 4     // 3 BODYCRC</span></span>
<span class="line"><span>          + 4     // 4 QUEUEID</span></span>
<span class="line"><span>          + 4;    // 5 FLAG</span></span>
<span class="line"><span>  // 6 QUEUEOFFSET</span></span>
<span class="line"><span>  preEncodeBuffer.putLong(pos, queueOffset);</span></span>
<span class="line"><span>  pos += 8;</span></span>
<span class="line"><span>  // 7 PHYSICALOFFSET</span></span>
<span class="line"><span>  preEncodeBuffer.putLong(pos, fileFromOffset + byteBuffer.position());</span></span>
<span class="line"><span>  pos += 8;</span></span>
<span class="line"><span>  int ipLen = (msgInner.getSysFlag() &amp; MessageSysFlag.BORNHOST_V6_FLAG) == 0 ? 4 + 4 : 16 + 4;</span></span>
<span class="line"><span>  // 8 SYSFLAG, 9 BORNTIMESTAMP, 10 BORNHOST</span></span>
<span class="line"><span>  pos += 4 + 8 + ipLen;</span></span>
<span class="line"><span>  // 11 STORETIMESTAMP refresh store time stamp in lock</span></span>
<span class="line"><span>  preEncodeBuffer.putLong(pos, msgInner.getStoreTimestamp());</span></span>
<span class="line"><span>  if (enabledAppendPropCRC) {</span></span>
<span class="line"><span>    // 18 CRC32</span></span>
<span class="line"><span>    int checkSize = msgLen - crc32ReservedLength;</span></span>
<span class="line"><span>    ByteBuffer tmpBuffer = preEncodeBuffer.duplicate();</span></span>
<span class="line"><span>    tmpBuffer.limit(tmpBuffer.position() + checkSize);</span></span>
<span class="line"><span>    int crc32 = UtilAll.crc32(tmpBuffer);   // UtilAll.crc32 function will change the position to limit of the buffer</span></span>
<span class="line"><span>    tmpBuffer.limit(tmpBuffer.position() + crc32ReservedLength);</span></span>
<span class="line"><span>    MessageDecoder.createCrc32(tmpBuffer, crc32);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  final long beginTimeMills = CommitLog.this.defaultMessageStore.now();</span></span>
<span class="line"><span>  CommitLog.this.getMessageStore().getPerfCounter().startTick(&quot;WRITE_MEMORY_TIME_MS&quot;);</span></span>
<span class="line"><span>  // Write messages to the queue buffer</span></span>
<span class="line highlighted"><span>  byteBuffer.put(preEncodeBuffer);</span></span>
<span class="line"><span>  CommitLog.this.getMessageStore().getPerfCounter().endTick(&quot;WRITE_MEMORY_TIME_MS&quot;);</span></span>
<span class="line"><span>  msgInner.setEncodedBuff(null);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (isMultiDispatchMsg) {</span></span>
<span class="line"><span>    CommitLog.this.multiDispatch.updateMultiQueueOffset(msgInner);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  return new AppendMessageResult(AppendMessageStatus.PUT_OK, wroteOffset, msgLen, msgIdSupplier,</span></span>
<span class="line"><span>          msgInner.getStoreTimestamp(), queueOffset, CommitLog.this.defaultMessageStore.now() - beginTimeMills, messageNum);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br><span class="line-number">92</span><br><span class="line-number">93</span><br><span class="line-number">94</span><br><span class="line-number">95</span><br><span class="line-number">96</span><br><span class="line-number">97</span><br><span class="line-number">98</span><br><span class="line-number">99</span><br><span class="line-number">100</span><br><span class="line-number">101</span><br><span class="line-number">102</span><br><span class="line-number">103</span><br><span class="line-number">104</span><br><span class="line-number">105</span><br><span class="line-number">106</span><br><span class="line-number">107</span><br></div></div><p>可以看到就是封装了一个preEncodeBuffer，然后将preEncodeBuffer放入到byteBuffer里面，最后返回结果，很简单。具体的preEncodeBuffer封装不是重点，就不细讲了。</p><h2 id="消息刷盘" tabindex="-1">消息刷盘 <a class="header-anchor" href="#消息刷盘" aria-label="Permalink to &quot;消息刷盘&quot;">​</a></h2><p>前面消息写入缓存的时候最终只是调用了byteBuffer#put把消息写入到缓冲区里面就返回了，具体的消息是在什么时候写入到磁盘里面的。</p><h3 id="defaultflushmanager" tabindex="-1">DefaultFlushManager <a class="header-anchor" href="#defaultflushmanager" aria-label="Permalink to &quot;DefaultFlushManager&quot;">​</a></h3><p>这个是由CommitLog的一个服务 -&gt; flushManager进行处理的，我们看看flushManager这个类</p><div class="language-DefaultFlushManager vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultFlushManager</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class DefaultFlushManager implements FlushManager {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private final FlushCommitLogService flushCommitLogService;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  //If TransientStorePool enabled, we must flush message to FileChannel at fixed periods</span></span>
<span class="line"><span>  private final FlushCommitLogService commitRealTimeService;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public DefaultFlushManager() {</span></span>
<span class="line"><span>    if (FlushDiskType.SYNC_FLUSH == CommitLog.this.defaultMessageStore.getMessageStoreConfig().getFlushDiskType()) {</span></span>
<span class="line"><span>      this.flushCommitLogService = new CommitLog.GroupCommitService();</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      this.flushCommitLogService = new CommitLog.FlushRealTimeService();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.commitRealTimeService = new CommitLog.CommitRealTimeService();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>可以看到定义了两个CommitLogService，它们具体的作用如下所示:</p><ul><li>flushCommitLogService: CommitLog刷盘服务，如果是broker.conf中定义的flushDiskType是SYNC_FLUSH，就使用GroupCommitService，否则使用FlushRealTimeService</li><li>commitRealTimeService: 针对TransientStorePool模式，需要新增一个服务，将writebuffer的数据写入到fileChannel里面</li></ul><h3 id="groupcommitservice" tabindex="-1">GroupCommitService <a class="header-anchor" href="#groupcommitservice" aria-label="Permalink to &quot;GroupCommitService&quot;">​</a></h3><div class="language-GroupCommitService vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">GroupCommitService</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class GroupCommitService extends FlushCommitLogService {</span></span>
<span class="line"><span>  private volatile LinkedList&lt;GroupCommitRequest&gt; requestsWrite = new LinkedList&lt;&gt;();</span></span>
<span class="line"><span>  private volatile LinkedList&lt;GroupCommitRequest&gt; requestsRead = new LinkedList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void doCommit() {</span></span>
<span class="line"><span>    if (!this.requestsRead.isEmpty()) {</span></span>
<span class="line"><span>      for (GroupCommitRequest req : this.requestsRead) {</span></span>
<span class="line"><span>        boolean flushOK = CommitLog.this.mappedFileQueue.getFlushedWhere() &gt;= req.getNextOffset();</span></span>
<span class="line"><span>        for (int i = 0; i &lt; 1000 &amp;&amp; !flushOK; i++) {</span></span>
<span class="line"><span>          CommitLog.this.mappedFileQueue.flush(0);</span></span>
<span class="line"><span>          flushOK = CommitLog.this.mappedFileQueue.getFlushedWhere() &gt;= req.getNextOffset();</span></span>
<span class="line"><span>          if (flushOK) {</span></span>
<span class="line"><span>            break;</span></span>
<span class="line"><span>          } else {</span></span>
<span class="line"><span>            // When transientStorePoolEnable is true, the messages in writeBuffer may not be committed</span></span>
<span class="line"><span>            // to pageCache very quickly, and flushOk here may almost be false, so we can sleep 1ms to</span></span>
<span class="line"><span>            // wait for the messages to be committed to pageCache.</span></span>
<span class="line"><span>            try {</span></span>
<span class="line"><span>              Thread.sleep(1);</span></span>
<span class="line"><span>            } catch (InterruptedException ignored) {</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        req.wakeupCustomer(flushOK ? PutMessageStatus.PUT_OK : PutMessageStatus.FLUSH_DISK_TIMEOUT);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      long storeTimestamp = CommitLog.this.mappedFileQueue.getStoreTimestamp();</span></span>
<span class="line"><span>      if (storeTimestamp &gt; 0) {</span></span>
<span class="line"><span>        CommitLog.this.defaultMessageStore.getStoreCheckpoint().setPhysicMsgTimestamp(storeTimestamp);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      this.requestsRead = new LinkedList&lt;&gt;();</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      // Because of individual messages is set to not sync flush, it</span></span>
<span class="line"><span>      // will come to this process</span></span>
<span class="line"><span>      CommitLog.this.mappedFileQueue.flush(0);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void run() {</span></span>
<span class="line"><span>    while (!this.isStopped()) {</span></span>
<span class="line"><span>      // 注意此处可以被唤醒</span></span>
<span class="line"><span>      this.waitForRunning(10);</span></span>
<span class="line"><span>      this.doCommit();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // Under normal circumstances shutdown, wait for the arrival of the</span></span>
<span class="line"><span>    // request, and then flush</span></span>
<span class="line"><span>    Thread.sleep(10);</span></span>
<span class="line"><span>    this.swapRequests();</span></span>
<span class="line"><span>    this.doCommit();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br></div></div><p>可以看到同步刷盘服务GroupCommitService这个服务就是每隔10ms调用一次磁盘刷新，核心是调用CommitLog.this.mappedFileQueue.flush函数</p><h3 id="flushrealtimeservice" tabindex="-1">FlushRealTimeService <a class="header-anchor" href="#flushrealtimeservice" aria-label="Permalink to &quot;FlushRealTimeService&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class FlushRealTimeService extends FlushCommitLogService {</span></span>
<span class="line"><span>  private long lastFlushTimestamp = 0;</span></span>
<span class="line"><span>  private long printTimes = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void run() {</span></span>
<span class="line"><span>    CommitLog.log.info(this.getServiceName() + &quot; service started&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    while (!this.isStopped()) {</span></span>
<span class="line"><span>      // 定时刷盘 CommitLog，默认开启</span></span>
<span class="line"><span>      boolean flushCommitLogTimed = CommitLog.this.defaultMessageStore.getMessageStoreConfig().isFlushCommitLogTimed();</span></span>
<span class="line"><span>      // 刷盘间隔时间，默认 500ms</span></span>
<span class="line"><span>      int interval = CommitLog.this.defaultMessageStore.getMessageStoreConfig().getFlushIntervalCommitLog();</span></span>
<span class="line"><span>      // 每次刷盘页数，默认 4</span></span>
<span class="line"><span>      int flushPhysicQueueLeastPages = CommitLog.this.defaultMessageStore.getMessageStoreConfig().getFlushCommitLogLeastPages();</span></span>
<span class="line"><span>      // 强制物理刷盘间隔时间，默认 10s</span></span>
<span class="line"><span>      int flushPhysicQueueThoroughInterval =</span></span>
<span class="line"><span>              CommitLog.this.defaultMessageStore.getMessageStoreConfig().getFlushCommitLogThoroughInterval();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      boolean printFlushProgress = false;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // Print flush progress</span></span>
<span class="line"><span>      long currentTimeMillis = System.currentTimeMillis();</span></span>
<span class="line"><span>      if (currentTimeMillis &gt;= (this.lastFlushTimestamp + flushPhysicQueueThoroughInterval)) {</span></span>
<span class="line"><span>        this.lastFlushTimestamp = currentTimeMillis;</span></span>
<span class="line"><span>        flushPhysicQueueLeastPages = 0;</span></span>
<span class="line"><span>        printFlushProgress = (printTimes++ % 10) == 0;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 根据flushCommitLogTimed这个配置看是休眠还是可以被唤醒的</span></span>
<span class="line"><span>      if (flushCommitLogTimed) {</span></span>
<span class="line"><span>        Thread.sleep(interval);</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>        this.waitForRunning(interval);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      if (printFlushProgress) {</span></span>
<span class="line"><span>        this.printFlushProgress();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      long begin = System.currentTimeMillis();</span></span>
<span class="line"><span>      CommitLog.this.mappedFileQueue.flush(flushPhysicQueueLeastPages);</span></span>
<span class="line"><span>      long storeTimestamp = CommitLog.this.mappedFileQueue.getStoreTimestamp();</span></span>
<span class="line"><span>      if (storeTimestamp &gt; 0) {</span></span>
<span class="line"><span>        CommitLog.this.defaultMessageStore.getStoreCheckpoint().setPhysicMsgTimestamp(storeTimestamp);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      long past = System.currentTimeMillis() - begin;</span></span>
<span class="line"><span>      CommitLog.this.getMessageStore().getPerfCounter().flowOnce(&quot;FLUSH_DATA_TIME_MS&quot;, (int) past);</span></span>
<span class="line"><span>      if (past &gt; 500) {</span></span>
<span class="line"><span>        log.info(&quot;Flush data to disk costs {} ms&quot;, past);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // Normal shutdown, to ensure that all the flush before exit</span></span>
<span class="line"><span>    boolean result = false;</span></span>
<span class="line"><span>    for (int i = 0; i &lt; RETRY_TIMES_OVER &amp;&amp; !result; i++) {</span></span>
<span class="line"><span>      result = CommitLog.this.mappedFileQueue.flush(0);</span></span>
<span class="line"><span>      CommitLog.log.info(this.getServiceName() + &quot; service shutdown, retry &quot; + (i + 1) + &quot; times &quot; + (result ? &quot;OK&quot; : &quot;Not OK&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.printFlushProgress();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br></div></div><p>而异步刷盘服务会根据broker.conf的配置参数来执行刷新服务，总的来说就是每隔flushIntervalCommitLog(500ms)刷新flushCommitLogLeastPages个页（4 * 4K）。</p><h3 id="handlediskflushandha" tabindex="-1">handleDiskFlushAndHA <a class="header-anchor" href="#handlediskflushandha" aria-label="Permalink to &quot;handleDiskFlushAndHA&quot;">​</a></h3><p>看完上面两个服务，肯定会有疑问，就是上面的同步刷盘跟异步刷盘都是每隔一段时间执行的，那么如果生产者发送了消息，需要结果不就要等待这个间隔时间吗？这样等待结果会有延迟吧，当然不会，RocketMQ在每一次把消息写入到byteBuffer之后，都会唤醒一次flushCommitLogService服务，我们回看CommitLog#asyncPutMessage的最后一行代码</p><div class="language-CommitLog vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitLog</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public CompletableFuture&lt;PutMessageResult&gt; asyncPutMessage(final MessageExtBrokerInner msg) {</span></span>
<span class="line"><span>  // 同步刷盘等待刷盘结束跟主从处理</span></span>
<span class="line"><span>  return handleDiskFlushAndHA(putMessageResult, msg, needAckNums, needHandleHA);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>进入这个方法里面看看</p><div class="language-CommitLog vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitLog</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private CompletableFuture&lt;PutMessageResult&gt; handleDiskFlushAndHA(PutMessageResult putMessageResult,</span></span>
<span class="line"><span>                                                                  MessageExt messageExt, int needAckNums, boolean needHandleHA) {</span></span>
<span class="line"><span>  CompletableFuture&lt;PutMessageStatus&gt; flushResultFuture = handleDiskFlush(putMessageResult.getAppendMessageResult(), messageExt);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>private CompletableFuture&lt;PutMessageStatus&gt; handleDiskFlush(AppendMessageResult result, MessageExt messageExt) {</span></span>
<span class="line"><span>  return this.flushManager.handleDiskFlush(result, messageExt);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>可以看到调用了flushManager#handleDiskFlush函数，继续进去看看</p><div class="language-DefaultFlushManager vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultFlushManager</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public CompletableFuture&lt;PutMessageStatus&gt; handleDiskFlush(AppendMessageResult result, MessageExt messageExt) {</span></span>
<span class="line"><span>  // 如果是同步刷新</span></span>
<span class="line"><span>  if (FlushDiskType.SYNC_FLUSH == CommitLog.this.defaultMessageStore.getMessageStoreConfig().getFlushDiskType()) {</span></span>
<span class="line"><span>    final GroupCommitService service = (GroupCommitService) this.flushCommitLogService;</span></span>
<span class="line"><span>    // 查看消息是否要等待刷盘完毕</span></span>
<span class="line"><span>    if (messageExt.isWaitStoreMsgOK()) {</span></span>
<span class="line"><span>      // 等待刷盘完成</span></span>
<span class="line"><span>      GroupCommitRequest request = new GroupCommitRequest(result.getWroteOffset() + result.getWroteBytes(), CommitLog.this.defaultMessageStore.getMessageStoreConfig().getSyncFlushTimeout());</span></span>
<span class="line"><span>      flushDiskWatcher.add(request);</span></span>
<span class="line"><span>      service.putRequest(request);</span></span>
<span class="line"><span>      return request.future();</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      // 唤醒flushCommitLogService</span></span>
<span class="line"><span>      service.wakeup();</span></span>
<span class="line"><span>      return CompletableFuture.completedFuture(PutMessageStatus.PUT_OK);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // Asynchronous flush</span></span>
<span class="line"><span>  else {</span></span>
<span class="line"><span>    // 如果使用TransientStorePoolEnable，则将flushCommitLogService唤醒</span></span>
<span class="line"><span>    if (!CommitLog.this.defaultMessageStore.isTransientStorePoolEnable()) {</span></span>
<span class="line"><span>      flushCommitLogService.wakeup();</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      // 否则唤醒commitRealTimeService</span></span>
<span class="line"><span>      commitRealTimeService.wakeup();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return CompletableFuture.completedFuture(PutMessageStatus.PUT_OK);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br></div></div><p>如果是同步刷新，则走下面的逻辑：</p><ul><li>判断是否等等消息存储完成，这个在构建 Message 时默认是 true</li><li>然后创建 GroupCommitRequest，第一个参数是 nextOffset，第二个参数 syncFlushTimeout 同步超时时间默认是5秒。result 中 wroteOffset = fileFromOffset + byteBuffer.position()，也就是这条消息开始写入的物理偏移量。然后 nextOffset = wroteOffset + wroteBytes，就是说下一个偏移量 = 等于写入起始偏移量 + 写入的字节数，看的出来 nextOffset 其实就是写入消息后的偏移量位置。</li><li>然后将 GroupCommitRequest 添加到 FlushDiskWatcher 监视器中。</li><li>最后才是将 GroupCommitRequest 提交到 GroupCommitService 中，然后返回 Future 对象。这个 future 对象就是同步的关键，GroupCommitService 提交请求后，处理完请求会将flush结果通过 GroupCommitRequest 的 wakeupCustomer 来传递，future 就会同步拿到处理结果。</li></ul><p>如果是异步刷新，则走以下逻辑：</p><ul><li>如果未启用瞬时存储池技术，则调用 flushCommitLogService（FlushRealTimeService）唤醒方法</li><li>如果启用了瞬时存储池技术，则调用 commitLogService（CommitRealTimeService）唤醒方法。</li></ul><p><strong>flushDiskWatcher</strong></p><div class="language-FlushDiskWatcher vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">FlushDiskWatcher</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class FlushDiskWatcher extends ServiceThread {</span></span>
<span class="line"><span>  // 组提交请求阻塞队列</span></span>
<span class="line"><span>  private final LinkedBlockingQueue&lt;GroupCommitRequest&gt; commitRequests = new LinkedBlockingQueue&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void run() {</span></span>
<span class="line"><span>    while (!isStopped()) {</span></span>
<span class="line"><span>      GroupCommitRequest request = commitRequests.take();</span></span>
<span class="line"><span>      </span></span>
<span class="line"><span>      while (!request.future().isDone()) {</span></span>
<span class="line"><span>        long now = System.nanoTime();</span></span>
<span class="line"><span>        if (now - request.getDeadLine() &gt;= 0) {</span></span>
<span class="line"><span>            request.wakeupCustomer(PutMessageStatus.FLUSH_DISK_TIMEOUT);</span></span>
<span class="line"><span>            break;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        long sleepTime = (request.getDeadLine() - now) / 1_000_000;</span></span>
<span class="line"><span>        sleepTime = Math.min(10, sleepTime);</span></span>
<span class="line"><span>        if (sleepTime == 0) {</span></span>
<span class="line"><span>            request.wakeupCustomer(PutMessageStatus.FLUSH_DISK_TIMEOUT);</span></span>
<span class="line"><span>            break;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        Thread.sleep(sleepTime);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void add(GroupCommitRequest request) {</span></span>
<span class="line"><span>      commitRequests.add(request);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br></div></div><p>flushDiskWatcher的功能很简单，就是判断GroupCommitRequest是否超时了，超时就直接通知刷盘超时了。</p><h3 id="commitrealtimeservice" tabindex="-1">CommitRealTimeService <a class="header-anchor" href="#commitrealtimeservice" aria-label="Permalink to &quot;CommitRealTimeService&quot;">​</a></h3><p>在讲CommitRealTimeService之前，我们先对比一下使用FileChannel跟Mmap读写文件的不同，下面是一个伪代码。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private static void fileChannel(int size) throws IOException {</span></span>
<span class="line"><span>  init(size);</span></span>
<span class="line"><span>  RandomAccessFile rw = new RandomAccessFile(file, &quot;rw&quot;);</span></span>
<span class="line"><span>  static ByteBuffer buffer</span></span>
<span class="line"><span>  FileChannel channel = rw.getChannel();</span></span>
<span class="line"><span>  buffer.put(new byte[size]);</span></span>
<span class="line"><span>  channel.write(buffer);</span></span>
<span class="line"><span>  channel.force(false);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>private static void testMappedByteBuffer(int size) throws IOException {</span></span>
<span class="line"><span>  init(size);</span></span>
<span class="line"><span>  RandomAccessFile rw = new RandomAccessFile(file, &quot;rw&quot;);</span></span>
<span class="line"><span>  FileChannel channel = rw.getChannel();</span></span>
<span class="line"><span>  MappedByteBuffer map = channel.map(FileChannel.MapMode.READ_WRITE, 0, fileSize);</span></span>
<span class="line"><span>  map.put(new byte[size]);</span></span>
<span class="line"><span>  map.force();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><ul><li>先写入writeBuffer，再将writeBuffer写入到FileChannel再调用force()刷盘；</li><li>数据直接写入MappedByteBuffer， 调用force()刷盘；</li></ul><p>再回看CommitLog#doAppend是调用了byteBuffer.put(preEncodeBuffer); 而GroupCommitService里面是通过mappedFileQueue#flush-&gt;MappedFileQueue#flush-&gt;mappedFile#flush刷盘的，我们看看这个方法。</p><div class="language-DefaultMappedFile vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMappedFile</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public int flush(final int flushLeastPages) {</span></span>
<span class="line"><span>  //We only append data to fileChannel or mappedByteBuffer, never both.</span></span>
<span class="line"><span>  if (writeBuffer != null || this.fileChannel.position() != 0) {</span></span>
<span class="line"><span>    this.fileChannel.force(false);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    this.mappedByteBuffer.force();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>可以看到是调用了force方法。好像漏了什么步骤，没错，就是在启用TransientStorePoolEnable的时候少了一步：将writeBuffer写入到FileChannel。这一步操作就是FlushRealTimeService这个服务完成的，我们看看这个服务做了什么事情。</p><div class="language-CommitRealTimeService vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitRealTimeService</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class CommitRealTimeService extends FlushCommitLogService {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void run() {</span></span>
<span class="line"><span>    CommitLog.log.info(this.getServiceName() + &quot; service started&quot;);</span></span>
<span class="line"><span>    while (!this.isStopped()) {</span></span>
<span class="line"><span>      int interval = CommitLog.this.defaultMessageStore.getMessageStoreConfig().getCommitIntervalCommitLog();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      int commitDataLeastPages = CommitLog.this.defaultMessageStore.getMessageStoreConfig().getCommitCommitLogLeastPages();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      int commitDataThoroughInterval =</span></span>
<span class="line"><span>              CommitLog.this.defaultMessageStore.getMessageStoreConfig().getCommitCommitLogThoroughInterval();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      long begin = System.currentTimeMillis();</span></span>
<span class="line"><span>      if (begin &gt;= (this.lastCommitTimestamp + commitDataThoroughInterval)) {</span></span>
<span class="line"><span>        this.lastCommitTimestamp = begin;</span></span>
<span class="line"><span>        commitDataLeastPages = 0;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        // 核心方法是这一行</span></span>
<span class="line"><span>        boolean result = CommitLog.this.mappedFileQueue.commit(commitDataLeastPages);</span></span>
<span class="line"><span>        long end = System.currentTimeMillis();</span></span>
<span class="line"><span>        if (!result) {</span></span>
<span class="line"><span>          this.lastCommitTimestamp = end; // result = false means some data committed.</span></span>
<span class="line"><span>          CommitLog.this.flushManager.wakeUpFlush();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        CommitLog.this.getMessageStore().getPerfCounter().flowOnce(&quot;COMMIT_DATA_TIME_MS&quot;, (int) (end - begin));</span></span>
<span class="line"><span>        if (end - begin &gt; 500) {</span></span>
<span class="line"><span>          log.info(&quot;Commit data to file costs {} ms&quot;, end - begin);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        this.waitForRunning(interval);</span></span>
<span class="line"><span>      } catch (Throwable e) {</span></span>
<span class="line"><span>        CommitLog.log.error(this.getServiceName() + &quot; service has exception. &quot;, e);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    boolean result = false;</span></span>
<span class="line"><span>    for (int i = 0; i &lt; RETRY_TIMES_OVER &amp;&amp; !result; i++) {</span></span>
<span class="line"><span>      result = CommitLog.this.mappedFileQueue.commit(0);</span></span>
<span class="line"><span>      CommitLog.log.info(this.getServiceName() + &quot; service shutdown, retry &quot; + (i + 1) + &quot; times &quot; + (result ? &quot;OK&quot; : &quot;Not OK&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    CommitLog.log.info(this.getServiceName() + &quot; service end&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br></div></div><p>这个扫描的时间间隔是commitIntervalCommitLog，默认是200ms。可以看到调用了mappedFileQueue#commit方法，MappedFileQueue#commit-&gt;DefaultMappedFile#commit-&gt;DefaultMappedFile#commit0, 看看代码实现</p><div class="language-DefaultMappedFile vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMappedFile</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>protected void commit0() {</span></span>
<span class="line"><span>  int writePos = WROTE_POSITION_UPDATER.get(this);</span></span>
<span class="line"><span>  int lastCommittedPosition = COMMITTED_POSITION_UPDATER.get(this);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (writePos - lastCommittedPosition &gt; 0) {</span></span>
<span class="line"><span>    ByteBuffer byteBuffer = writeBuffer.slice();</span></span>
<span class="line"><span>    byteBuffer.position(lastCommittedPosition);</span></span>
<span class="line"><span>    byteBuffer.limit(writePos);</span></span>
<span class="line"><span>    this.fileChannel.position(lastCommittedPosition);</span></span>
<span class="line"><span>    // 核心代码</span></span>
<span class="line"><span>    this.fileChannel.write(byteBuffer);</span></span>
<span class="line"><span>    COMMITTED_POSITION_UPDATER.set(this, writePos);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>这里只是介绍消息刷盘的基本流程，如果想要更详细的可以点击<a href="https://juejin.cn/post/7280435431334297655" target="_blank" rel="noreferrer">此处</a></p><h2 id="更新消费队列与索引文件" tabindex="-1">更新消费队列与索引文件 <a class="header-anchor" href="#更新消费队列与索引文件" aria-label="Permalink to &quot;更新消费队列与索引文件&quot;">​</a></h2><p>消费队列文件，消息属性索引文件都是基于CommitLog构建的，当消息生产者提交的消息存储在CommitLog文件中时，ConsumeQueue, IndexFile需要及时更新，否则消息无法及时被消费，根据消息属性查找消息也会出现较大延迟。RocketMQ通过开启一个线程ReputMessageService来准时转发CommitLog文件更新时间，相应的任务处理器根据转发的消息及时更新ConsumeQueue，IndexFile文件。</p><div class="language-DefaultMessageStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMessageStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DefaultMessageStore implements MessageStore {</span></span>
<span class="line"><span>  if (!messageStoreConfig.isEnableBuildConsumeQueueConcurrently()) {</span></span>
<span class="line"><span>    this.reputMessageService = new ReputMessageService();</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    this.reputMessageService = new ConcurrentReputMessageService();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>如果配置文件中的enableBuildConsumeQueueConcurrently，那么就会初始化一个ConcurrentReputMessageService，否则就初始化一个ReputMessageService，而ConcurrentReputMessageService是继承ReputMessageService的。</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>ConcurrentReputMessageService就是为了避免ReputMessageService的性能问题，将其中的一些步骤交由线程池来处理，如果想了解这个机制，可以点击<a href="https://yu7y22ce7k.feishu.cn/docx/doxcnltrB7VzUKCqx0yxqMgJ4RM" target="_blank" rel="noreferrer">此处</a></p><ul><li>batchDispatchRequestThreadPoolNums: batchDispatchRequestThreadPool线程池线程数，默认16</li><li>enableBuildConsumeQueueConcurrently: 开启并行处理</li></ul></div><p>Broker在启动时会启动reputMessageService线程，并初始化一个参数reputFromOffset, 标明reputMessageService是从这个物理偏移量开始转发消息的。</p><div class="language-DefaultMessageStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMessageStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public void start() throws Exception {</span></span>
<span class="line"><span>  // 实现commitLog文件转发</span></span>
<span class="line"><span>  this.reputMessageService.setReputFromOffset(this.commitLog.getConfirmOffset());</span></span>
<span class="line"><span>  this.reputMessageService.start();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>CommitLog#getConfirmOffset方法很复杂，了解就好了。</p><div class="language-CommitLog vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitLog</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Fetch and compute the newest confirmOffset.</span></span>
<span class="line"><span>// Even if it is just inited.</span></span>
<span class="line"><span>public long getConfirmOffset() {</span></span>
<span class="line"><span>  if (this.defaultMessageStore.getBrokerConfig().isEnableControllerMode()) {</span></span>
<span class="line"><span>    if (this.defaultMessageStore.getMessageStoreConfig().getBrokerRole() != BrokerRole.SLAVE &amp;&amp; !this.defaultMessageStore.getRunningFlags().isFenced()) {</span></span>
<span class="line"><span>      if (((AutoSwitchHAService) this.defaultMessageStore.getHaService()).getLocalSyncStateSet().size() == 1</span></span>
<span class="line"><span>              || !this.defaultMessageStore.getMessageStoreConfig().isAllAckInSyncStateSet()) {</span></span>
<span class="line"><span>        return this.defaultMessageStore.getMaxPhyOffset();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // First time it will compute the confirmOffset.</span></span>
<span class="line"><span>      if (this.confirmOffset &lt; 0) {</span></span>
<span class="line"><span>        setConfirmOffset(((AutoSwitchHAService) this.defaultMessageStore.getHaService()).computeConfirmOffset());</span></span>
<span class="line"><span>        log.info(&quot;Init the confirmOffset to {}.&quot;, this.confirmOffset);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return this.confirmOffset;</span></span>
<span class="line"><span>  } else if (this.defaultMessageStore.getMessageStoreConfig().isDuplicationEnable()) {</span></span>
<span class="line"><span>    return this.confirmOffset;</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    return this.defaultMessageStore.isSyncDiskFlush()  ? getFlushedWhere() : getMaxOffset();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br></div></div><ul><li>控制器模式启用时：如果是主节点且没有封锁，且同步状态集合大小为 1 或未强制所有副本确认时，返回 maxPhyOffset。如果 confirmOffset 未初始化，则计算并初始化它。</li><li>控制器模式未启用时：如果启用了重复消息处理，直接返回 confirmOffset；否则根据是否启用同步刷盘来选择返回刷盘位置或最大偏移量。</li></ul><h3 id="reputmessageservice" tabindex="-1">ReputMessageService <a class="header-anchor" href="#reputmessageservice" aria-label="Permalink to &quot;ReputMessageService&quot;">​</a></h3><p>我们看看ReputMessageService的实现，代码如下所示：</p><div class="language-ReputMessageService vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ReputMessageService</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class ReputMessageService extends ServiceThread {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void run() {</span></span>
<span class="line"><span>    while (!this.isStopped()) {</span></span>
<span class="line"><span>      TimeUnit.MILLISECONDS.sleep(1);</span></span>
<span class="line"><span>      this.doReput();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>private void doReput() {</span></span>
<span class="line"><span>    // 初始化重新投递的起始偏移量为第一个 MappedFile 的 fileFromOffset</span></span>
<span class="line"><span>    if (this.reputFromOffset &lt; commitLog.getMinOffset()) {</span></span>
<span class="line"><span>        this.reputFromOffset = commitLog.getMinOffset();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // reputFromOffset &lt; 当前写入偏移量</span></span>
<span class="line"><span>    for (boolean doNext = true; this.isCommitLogAvailable() &amp;&amp; doNext; ) {</span></span>
<span class="line"><span>        // 从 CommitLog 读取所有消息</span></span>
<span class="line"><span>        SelectMappedBufferResult result = commitLog.getData(reputFromOffset);</span></span>
<span class="line"><span>        if (result != null) {</span></span>
<span class="line"><span>            this.reputFromOffset = result.getStartOffset();</span></span>
<span class="line"><span>            // 读取每一条消息</span></span>
<span class="line"><span>            for (int readSize = 0; readSize &lt; result.getSize() &amp;&amp; doNext; ) {</span></span>
<span class="line"><span>                // 检查消息是否合法，返回要分发的请求，依次读取每一条消息</span></span>
<span class="line"><span>                DispatchRequest dispatchRequest = commitLog.checkMessageAndReturnSize(result.getByteBuffer(), false, false);</span></span>
<span class="line"><span>                // 消息的大小</span></span>
<span class="line"><span>                int size = dispatchRequest.getBufferSize() == -1 ? dispatchRequest.getMsgSize() : dispatchRequest.getBufferSize();</span></span>
<span class="line"><span>                if (size &gt; 0) {</span></span>
<span class="line"><span>                    // 消息分发，分到到 ConsumeQueue 和 IndexService</span></span>
<span class="line"><span>                    DefaultMessageStore.this.doDispatch(dispatchRequest);</span></span>
<span class="line"><span>                    // 通知消息到达</span></span>
<span class="line"><span>                    if (BrokerRole.SLAVE != getMessageStoreConfig().getBrokerRole()</span></span>
<span class="line"><span>                            &amp;&amp; brokerConfig.isLongPollingEnable() &amp;&amp; messageArrivingListener != null) {</span></span>
<span class="line"><span>                        // 非 slave，启用了长轮询，消息到达监听器不为空</span></span>
<span class="line"><span>                        DefaultMessageStore.this.messageArrivingListener.arriving(....);</span></span>
<span class="line"><span>                        // 多路分发，分发到多个队列里</span></span>
<span class="line"><span>                        notifyMessageArrive4MultiQueue(dispatchRequest);</span></span>
<span class="line"><span>                    }</span></span>
<span class="line"><span>                    // 投递偏移量增加</span></span>
<span class="line"><span>                    this.reputFromOffset += size;</span></span>
<span class="line"><span>                    readSize += size;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                // 返回成功而且 size = 0，说明是读到文件末尾的空消息了，表示这个文件读到末尾了</span></span>
<span class="line"><span>                else if (size == 0) {</span></span>
<span class="line"><span>                    // 切换到下一个 MappedFile 继续</span></span>
<span class="line"><span>                    this.reputFromOffset = DefaultMessageStore.this.commitLog.rollNextFile(this.reputFromOffset);</span></span>
<span class="line"><span>                    // 读了整个结果，可以停止for循环了</span></span>
<span class="line"><span>                    readSize = result.getSize();</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            // 释放资源</span></span>
<span class="line"><span>            result.release();</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>            // 消息读完了，停止循环</span></span>
<span class="line"><span>            doNext = false;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br></div></div><p>可以看到每隔1ms执行一个doReput方法，doReput方法主要做了以下操作：</p><ul><li>调用commitLog#getData获取全部的CommitLog数据，返回result</li><li>遍历result里面的数据，依次读取每一条消息，返回一个DispatchRequest</li><li>对每个DispatchRequest，调用DefaultMessageStore.this.doDispatch(dispatchRequest)进行分发</li></ul><div class="language-DefaultMessageStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMessageStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public void doDispatch(DispatchRequest req) throws RocksDBException {</span></span>
<span class="line"><span>  for (CommitLogDispatcher dispatcher : this.dispatcherList) {</span></span>
<span class="line"><span>    dispatcher.dispatch(req);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>dispatcherList都有什么呢，回看DefaultMessageStore的构造函数</p><div class="language-DefaultMessageStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMessageStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public DefaultMessageStore(final MessageStoreConfig messageStoreConfig, final BrokerStatsManager brokerStatsManager,</span></span>
<span class="line"><span>                        final MessageArrivingListener messageArrivingListener, final BrokerConfig brokerConfig, final ConcurrentMap&lt;String, TopicConfig&gt; topicConfigTable) throws IOException {</span></span>
<span class="line"><span>  this.dispatcherList = new LinkedList&lt;&gt;();</span></span>
<span class="line"><span>  // 构建ConsumeQueue</span></span>
<span class="line"><span>  this.dispatcherList.addLast(new CommitLogDispatcherBuildConsumeQueue());</span></span>
<span class="line"><span>  // 构建Index</span></span>
<span class="line"><span>  this.dispatcherList.addLast(new CommitLogDispatcherBuildIndex());</span></span>
<span class="line"><span>  if (messageStoreConfig.isEnableCompaction()) {</span></span>
<span class="line"><span>    this.compactionStore = new CompactionStore(this);</span></span>
<span class="line"><span>    this.compactionService = new CompactionService(commitLog, this, compactionStore);</span></span>
<span class="line"><span>    this.dispatcherList.addLast(new CommitLogDispatcherCompaction(compactionService));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><h3 id="commitlogdispatcherbuildconsumequeue" tabindex="-1">CommitLogDispatcherBuildConsumeQueue <a class="header-anchor" href="#commitlogdispatcherbuildconsumequeue" aria-label="Permalink to &quot;CommitLogDispatcherBuildConsumeQueue&quot;">​</a></h3><p>这个就是将消息写到消费队列的dispatcher，我们看一下这个dispatcher做了什么事情。</p><div class="language-CommitLogDispatcherBuildConsumeQueue vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitLogDispatcherBuildConsumeQueue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class CommitLogDispatcherBuildConsumeQueue implements CommitLogDispatcher {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void dispatch(DispatchRequest request) throws RocksDBException {</span></span>
<span class="line"><span>    final int tranType = MessageSysFlag.getTransactionValue(request.getSysFlag());</span></span>
<span class="line"><span>    switch (tranType) {</span></span>
<span class="line"><span>      // 消息不是事务消息</span></span>
<span class="line"><span>      case MessageSysFlag.TRANSACTION_NOT_TYPE:</span></span>
<span class="line"><span>      // 事务消息已经提交。即该消息属于一个事务，并且事务已经成功提交，可以执行相关操作</span></span>
<span class="line"><span>      case MessageSysFlag.TRANSACTION_COMMIT_TYPE:</span></span>
<span class="line"><span>        putMessagePositionInfo(request);</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>      // 事务消息处于预备状态（即事务已准备好但尚未提交）</span></span>
<span class="line"><span>      case MessageSysFlag.TRANSACTION_PREPARED_TYPE:</span></span>
<span class="line"><span>      // 表示事务消息已经回滚</span></span>
<span class="line"><span>      case MessageSysFlag.TRANSACTION_ROLLBACK_TYPE:</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>跟进putMessagePositionInfo方法，具体代码如下所示</p><div class="language-DefaultMessageStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultMessageStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>protected void putMessagePositionInfo(DispatchRequest dispatchRequest) throws RocksDBException {</span></span>
<span class="line"><span>  this.consumeQueueStore.putMessagePositionInfoWrapper(dispatchRequest);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>跟进putMessagePositionInfoWrapper方法, 代码如下所示</p><div class="language-ConsumeQueueStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ConsumeQueueStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public void putMessagePositionInfoWrapper(DispatchRequest dispatchRequest) {</span></span>
<span class="line"><span>  // 根据topic和queueId查找消费队列，没有则新建</span></span>
<span class="line"><span>  ConsumeQueueInterface cq = this.findOrCreateConsumeQueue(dispatchRequest.getTopic(), dispatchRequest.getQueueId());</span></span>
<span class="line"><span>  // 向消费队列写入消息</span></span>
<span class="line"><span>  this.putMessagePositionInfoWrapper(cq, dispatchRequest);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p><strong>findOrCreateConsumeQueue</strong></p><p>根据 topic 和 queueId 查找消费队列，就是从 consumeQueueTable 表获取主题下的队列，如果没有就会创建一个新的Map放入 consumeQueueTable。接着从队列表里取出 ConsumeQueue，如果没有同样会创建一个新的 ConsumeQueue，从这里可以看出消费队列默认的存储路径是 ~/store/consumequeue/。</p><div class="language-ConsumeQueueStore vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ConsumeQueueStore</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Override</span></span>
<span class="line"><span>public ConsumeQueueInterface findOrCreateConsumeQueue(String topic, int queueId) {</span></span>
<span class="line"><span>  ConcurrentMap&lt;Integer, ConsumeQueueInterface&gt; map = consumeQueueTable.get(topic);</span></span>
<span class="line"><span>  if (null == map) {</span></span>
<span class="line"><span>    ConcurrentMap&lt;Integer, ConsumeQueueInterface&gt; newMap = new ConcurrentHashMap&lt;&gt;(128);</span></span>
<span class="line"><span>    ConcurrentMap&lt;Integer, ConsumeQueueInterface&gt; oldMap = consumeQueueTable.putIfAbsent(topic, newMap);</span></span>
<span class="line"><span>    if (oldMap != null) {</span></span>
<span class="line"><span>      map = oldMap;</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      map = newMap;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ConsumeQueueInterface logic = map.get(queueId);</span></span>
<span class="line"><span>  if (logic != null) {</span></span>
<span class="line"><span>    return logic;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ConsumeQueueInterface newLogic;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  Optional&lt;TopicConfig&gt; topicConfig = this.messageStore.getTopicConfig(topic);</span></span>
<span class="line"><span>  // TODO maybe the topic has been deleted.</span></span>
<span class="line"><span>  if (Objects.equals(CQType.BatchCQ, QueueTypeUtils.getCQType(topicConfig))) {</span></span>
<span class="line"><span>    newLogic = new BatchConsumeQueue(</span></span>
<span class="line"><span>            topic,</span></span>
<span class="line"><span>            queueId,</span></span>
<span class="line"><span>            getStorePathBatchConsumeQueue(this.messageStoreConfig.getStorePathRootDir()),</span></span>
<span class="line"><span>            this.messageStoreConfig.getMapperFileSizeBatchConsumeQueue(),</span></span>
<span class="line"><span>            this.messageStore);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    newLogic = new ConsumeQueue(</span></span>
<span class="line"><span>            topic,</span></span>
<span class="line"><span>            queueId,</span></span>
<span class="line"><span>            getStorePathConsumeQueue(this.messageStoreConfig.getStorePathRootDir()),</span></span>
<span class="line"><span>            this.messageStoreConfig.getMappedFileSizeConsumeQueue(),</span></span>
<span class="line"><span>            this.messageStore);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ConsumeQueueInterface oldLogic = map.putIfAbsent(queueId, newLogic);</span></span>
<span class="line"><span>  if (oldLogic != null) {</span></span>
<span class="line"><span>    logic = oldLogic;</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    logic = newLogic;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  return logic;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br></div></div><p>而 ConsumeQueue 对应的 MappedFile 文件大小是通过计算得来的，ConsumeQueue 存储是以20字节为一个存储单元（CQ_STORE_UNIT_SIZE），MappedFile 文件大小也必须是 20 的倍数，默认情况下一个 ConsumeQueue 文件可以存 30万 个单位数据，那么一个 MappedFile 文件大小就是 300000*20 。</p><div class="language-MessageStoreConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">MessageStoreConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// ConsumeQueue file size,default is 30W</span></span>
<span class="line"><span>private int mappedFileSizeConsumeQueue = 300000 * ConsumeQueue.CQ_STORE_UNIT_SIZE;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>public int getMappedFileSizeConsumeQueue() {</span></span>
<span class="line"><span>    int factor = (int) Math.ceil(this.mappedFileSizeConsumeQueue / (ConsumeQueue.CQ_STORE_UNIT_SIZE * 1.0));</span></span>
<span class="line"><span>    return (int) (factor * ConsumeQueue.CQ_STORE_UNIT_SIZE);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p><strong>putMessagePositionInfoWrapper</strong></p><p>调用栈: ConsumeQueueStore#putMessagePositionInfoWrapper-&gt;ConsumeQueue#putMessagePositionInfoWrapper-&gt;ConsumeQueue#putMessagePositionInfo</p><div class="language-ConsumeQueue vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ConsumeQueue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private boolean putMessagePositionInfo(final long offset, final int size, final long tagsCode,</span></span>
<span class="line"><span>                                        final long cqOffset) {</span></span>
<span class="line"><span>  this.byteBufferIndex.flip();</span></span>
<span class="line"><span>  this.byteBufferIndex.limit(CQ_STORE_UNIT_SIZE);</span></span>
<span class="line"><span>  this.byteBufferIndex.putLong(offset);</span></span>
<span class="line"><span>  this.byteBufferIndex.putInt(size);</span></span>
<span class="line"><span>  this.byteBufferIndex.putLong(tagsCode);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  final long expectLogicOffset = cqOffset * CQ_STORE_UNIT_SIZE;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  MappedFile mappedFile = this.mappedFileQueue.getLastMappedFile(expectLogicOffset);</span></span>
<span class="line"><span>  if (mappedFile != null) {</span></span>
<span class="line"><span>    this.setMaxPhysicOffset(offset + size);</span></span>
<span class="line"><span>    boolean appendResult;</span></span>
<span class="line"><span>    // 如果配置了putConsumeQueueDataByFileChannel，则使用FileChanne</span></span>
<span class="line"><span>    if (messageStore.getMessageStoreConfig().isPutConsumeQueueDataByFileChannel()) {</span></span>
<span class="line"><span>      appendResult = mappedFile.appendMessageUsingFileChannel(this.byteBufferIndex.array());</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      // 否则使用mappedFile</span></span>
<span class="line"><span>      appendResult = mappedFile.appendMessage(this.byteBufferIndex.array());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return appendResult;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return false;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><p>这里主要看一下储存格式，ConsumeQueue 是以 20 字节为一个存储单元，所以它用了一块 20字节的缓冲区 byteBufferIndex 来写数据，从这可以知道这20字节存储了消息的3个属性：</p><ul><li>offset：消息的物理偏移量，表示的是 commitlog 中的物理偏移量</li><li>size：消息的总大小</li><li>tagsCode：消息tag hash码</li></ul><p><strong>FlushConsumeQueueService</strong></p><p>ConsumeQueue的刷盘是由FlushConsumeQueueService这个线程进行处理的，大致看一下流程。</p><div class="language-FlushConsumeQueueService vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">FlushConsumeQueueService</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class FlushConsumeQueueService extends ServiceThread {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void run() {</span></span>
<span class="line"><span>    while (!this.isStopped()) {</span></span>
<span class="line"><span>      int interval = DefaultMessageStore.this.getMessageStoreConfig().getFlushIntervalConsumeQueue();</span></span>
<span class="line"><span>      this.waitForRunning(interval);</span></span>
<span class="line"><span>      this.doFlush(1);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.doFlush(RETRY_TIMES_OVER);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void doFlush(int retryTimes) {</span></span>
<span class="line"><span>    // 获取刷盘的页数</span></span>
<span class="line"><span>    int flushConsumeQueueLeastPages = DefaultMessageStore.this.getMessageStoreConfig().getFlushConsumeQueueLeastPages();</span></span>
<span class="line"><span>    if (retryTimes == RETRY_TIMES_OVER) {</span></span>
<span class="line"><span>      flushConsumeQueueLeastPages = 0;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    long logicsMsgTimestamp = 0;</span></span>
<span class="line"><span>    int flushConsumeQueueThoroughInterval = DefaultMessageStore.this.getMessageStoreConfig().getFlushConsumeQueueThoroughInterval();</span></span>
<span class="line"><span>    long currentTimeMillis = System.currentTimeMillis();</span></span>
<span class="line"><span>    if (currentTimeMillis &gt;= (this.lastFlushTimestamp + flushConsumeQueueThoroughInterval)) {</span></span>
<span class="line"><span>      this.lastFlushTimestamp = currentTimeMillis;</span></span>
<span class="line"><span>      flushConsumeQueueLeastPages = 0;</span></span>
<span class="line"><span>      logicsMsgTimestamp = DefaultMessageStore.this.getStoreCheckpoint().getLogicsMsgTimestamp();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ConcurrentMap&lt;String, ConcurrentMap&lt;Integer, ConsumeQueueInterface&gt;&gt; tables = DefaultMessageStore.this.getConsumeQueueTable();</span></span>
<span class="line"><span>    for (ConcurrentMap&lt;Integer, ConsumeQueueInterface&gt; maps : tables.values()) {</span></span>
<span class="line"><span>      for (ConsumeQueueInterface cq : maps.values()) {</span></span>
<span class="line"><span>        boolean result = false;</span></span>
<span class="line"><span>        for (int i = 0; i &lt; retryTimes &amp;&amp; !result; i++) {</span></span>
<span class="line"><span>          // 实际刷盘方法</span></span>
<span class="line"><span>          result = DefaultMessageStore.this.consumeQueueStore.flush(cq, flushConsumeQueueLeastPages);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (messageStoreConfig.isEnableCompaction()) {</span></span>
<span class="line"><span>      compactionStore.flush(flushConsumeQueueLeastPages);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (0 == flushConsumeQueueLeastPages) {</span></span>
<span class="line"><span>      if (logicsMsgTimestamp &gt; 0) {</span></span>
<span class="line"><span>        DefaultMessageStore.this.getStoreCheckpoint().setLogicsMsgTimestamp(logicsMsgTimestamp);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      DefaultMessageStore.this.getStoreCheckpoint().flush();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br></div></div><p>可以看到线程是每隔flushIntervalConsumeQueue(默认1秒)处理一次刷盘操作的。</p><h3 id="commitlogdispatcherbuildindex" tabindex="-1">CommitLogDispatcherBuildIndex <a class="header-anchor" href="#commitlogdispatcherbuildindex" aria-label="Permalink to &quot;CommitLogDispatcherBuildIndex&quot;">​</a></h3><div class="language-CommitLogDispatcherBuildIndex vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommitLogDispatcherBuildIndex</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class CommitLogDispatcherBuildIndex implements CommitLogDispatcher {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void dispatch(DispatchRequest request) {</span></span>
<span class="line"><span>    // 如果开启messageIndexEnable</span></span>
<span class="line"><span>    if (DefaultMessageStore.this.messageStoreConfig.isMessageIndexEnable()) {</span></span>
<span class="line"><span>      DefaultMessageStore.this.indexService.buildIndex(request);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div>`,200)]))}const T=n(g,[["render",d]]);export{k as __pageData,T as default};
