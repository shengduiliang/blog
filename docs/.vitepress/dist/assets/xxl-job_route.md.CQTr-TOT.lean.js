import{_ as n,c as a,a0 as e,o as p}from"./chunks/framework.P9qPzDnn.js";const m=JSON.parse('{"title":"路由选择策略","description":"","frontmatter":{},"headers":[],"relativePath":"xxl-job/route.md","filePath":"xxl-job/route.md"}'),l={name:"xxl-job/route.md"};function r(t,s,i,c,u,b){return p(),a("div",null,s[0]||(s[0]=[e(`<h1 id="路由选择策略" tabindex="-1">路由选择策略 <a class="header-anchor" href="#路由选择策略" aria-label="Permalink to &quot;路由选择策略&quot;">​</a></h1><p>上一篇我们在介绍定时任务执行流程的时候，在processTrigger章节有提到了路由策略如果不是分片广播策略，那么就会根据定时任务设置的路由选择策略选取执行器的地址。</p><div class="language-XxlJobTrigger vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobTrigger</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobTrigger {</span></span>
<span class="line"><span>  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {</span></span>
<span class="line"><span>    ExecutorRouteStrategyEnum executorRouteStrategyEnum = ExecutorRouteStrategyEnum.match(jobInfo.getExecutorRouteStrategy(), null); </span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 3、init address</span></span>
<span class="line"><span>    String address = null;</span></span>
<span class="line"><span>    ReturnT&lt;String&gt; routeAddressResult = null;</span></span>
<span class="line"><span>    if (group.getRegistryList()!=null &amp;&amp; !group.getRegistryList().isEmpty()) {</span></span>
<span class="line"><span>      if (ExecutorRouteStrategyEnum.SHARDING_BROADCAST == executorRouteStrategyEnum) {</span></span>
<span class="line"><span>        if (index &lt; group.getRegistryList().size()) {</span></span>
<span class="line"><span>          address = group.getRegistryList().get(index);</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>          address = group.getRegistryList().get(0);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>        routeAddressResult = executorRouteStrategyEnum.getRouter().route(triggerParam, group.getRegistryList());</span></span>
<span class="line"><span>        if (routeAddressResult.getCode() == ReturnT.SUCCESS_CODE) {</span></span>
<span class="line"><span>          address = routeAddressResult.getContent();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      routeAddressResult = new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, I18nUtil.getString(&quot;jobconf_trigger_address_empty&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><p>这章内容我们就来讲解一下XXL-JOB的路由选取策略，保证在多个执行器地址中选择其中一个地址来执行定时任务。</p><h2 id="executorroutestrategyenum" tabindex="-1">ExecutorRouteStrategyEnum <a class="header-anchor" href="#executorroutestrategyenum" aria-label="Permalink to &quot;ExecutorRouteStrategyEnum&quot;">​</a></h2><p>想要了解XXL-JOB的路由选取策略，ExecutorRouteStrategyEnum这个类是必须了解的内容，代码如下所示:</p><div class="language-ExecutorRouteStrategyEnum vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorRouteStrategyEnum</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public enum ExecutorRouteStrategyEnum {</span></span>
<span class="line"><span>  FIRST(I18nUtil.getString(&quot;jobconf_route_first&quot;), new ExecutorRouteFirst()),</span></span>
<span class="line"><span>  LAST(I18nUtil.getString(&quot;jobconf_route_last&quot;), new ExecutorRouteLast()),</span></span>
<span class="line"><span>  ROUND(I18nUtil.getString(&quot;jobconf_route_round&quot;), new ExecutorRouteRound()),</span></span>
<span class="line"><span>  RANDOM(I18nUtil.getString(&quot;jobconf_route_random&quot;), new ExecutorRouteRandom()),</span></span>
<span class="line"><span>  CONSISTENT_HASH(I18nUtil.getString(&quot;jobconf_route_consistenthash&quot;), new ExecutorRouteConsistentHash()),</span></span>
<span class="line"><span>  LEAST_FREQUENTLY_USED(I18nUtil.getString(&quot;jobconf_route_lfu&quot;), new ExecutorRouteLFU()),</span></span>
<span class="line"><span>  LEAST_RECENTLY_USED(I18nUtil.getString(&quot;jobconf_route_lru&quot;), new ExecutorRouteLRU()),</span></span>
<span class="line"><span>  FAILOVER(I18nUtil.getString(&quot;jobconf_route_failover&quot;), new ExecutorRouteFailover()),</span></span>
<span class="line"><span>  BUSYOVER(I18nUtil.getString(&quot;jobconf_route_busyover&quot;), new ExecutorRouteBusyover()),</span></span>
<span class="line"><span>  SHARDING_BROADCAST(I18nUtil.getString(&quot;jobconf_route_shard&quot;), null);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public ExecutorRouter getRouter() {</span></span>
<span class="line"><span>    return router;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static ExecutorRouteStrategyEnum match(String name, ExecutorRouteStrategyEnum defaultItem){</span></span>
<span class="line"><span>    if (name != null) {</span></span>
<span class="line"><span>        for (ExecutorRouteStrategyEnum item: ExecutorRouteStrategyEnum.values()) {</span></span>
<span class="line"><span>            if (item.name().equals(name)) {</span></span>
<span class="line"><span>                return item;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return defaultItem;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>可以看到除了SHARDING_BROADCAST分片广播策略之外，还有9种路由策略，下面做一下解释：</p><ul><li>FIRST（第一个）：固定选择第一个机器；</li><li>LAST（最后一个）：固定选择最后一个机器；</li><li>ROUND（轮询）： 轮训策略；</li><li>RANDOM（随机）：随机选择在线的机器；</li><li>CONSISTENT_HASH（一致性HASH）：每个任务按照Hash算法固定选择某一台机器，且所有任务均匀散列在不同机器上。</li><li>LEAST_FREQUENTLY_USED（最不经常使用）：使用频率最低的机器优先被选举；</li><li>LEAST_RECENTLY_USED（最近最久未使用）：最久未使用的机器优先被选举；</li><li>FAILOVER（故障转移）：按照顺序依次进行心跳检测，第一个心跳检测成功的机器选定为目标执行器并发起调度；</li><li>BUSYOVER（忙碌转移）：按照顺序依次进行空闲检测，第一个空闲检测成功的机器选定为目标执行器并发起调度；</li><li>SHARDING_BROADCAST(分片广播)：广播触发对应集群中所有机器执行一次任务，同时系统自动传递分片参数；可根据分片参数开发分片任务；</li></ul><p>下面让我们逐个分析上面这就中路由策略。</p><h2 id="executorroutefirst" tabindex="-1">ExecutorRouteFirst <a class="header-anchor" href="#executorroutefirst" aria-label="Permalink to &quot;ExecutorRouteFirst&quot;">​</a></h2><p>FIRST策略比较简单，直接看代码，就是选择地址列表中的第一个地址。</p><div class="language-ExecutorRouteFirst vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorRouteFirst</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorRouteFirst extends ExecutorRouter {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; route(TriggerParam triggerParam, List&lt;String&gt; addressList){</span></span>
<span class="line"><span>      return new ReturnT&lt;String&gt;(addressList.get(0));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><h2 id="executorroutelast" tabindex="-1">ExecutorRouteLast <a class="header-anchor" href="#executorroutelast" aria-label="Permalink to &quot;ExecutorRouteLast&quot;">​</a></h2><p>LAST策略也比较简单，直接看代码，就是选择地址列表中的最后一个地址。</p><div class="language-ExecutorRouteLast vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorRouteLast</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorRouteLast extends ExecutorRouter {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; route(TriggerParam triggerParam, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span>    return new ReturnT&lt;String&gt;(addressList.get(addressList.size()-1));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><h2 id="executorrouteround" tabindex="-1">ExecutorRouteRound <a class="header-anchor" href="#executorrouteround" aria-label="Permalink to &quot;ExecutorRouteRound&quot;">​</a></h2><p>ROUND策略就是先随机选择一个Index，然后通过Index对地址列表的元素进行取余，获取执行器的地址，后面累加1取余, 代码如下。</p><div class="language-ExecutorRouteRound vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorRouteRound</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorRouteRound extends ExecutorRouter {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static ConcurrentMap&lt;Integer, AtomicInteger&gt; routeCountEachJob = new ConcurrentHashMap&lt;&gt;();</span></span>
<span class="line"><span>  private static long CACHE_VALID_TIME = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static int count(int jobId) {</span></span>
<span class="line"><span>    // cache clear</span></span>
<span class="line"><span>    if (System.currentTimeMillis() &gt; CACHE_VALID_TIME) {</span></span>
<span class="line"><span>      routeCountEachJob.clear();</span></span>
<span class="line"><span>      // 每隔24小时清空一次routeCountEachJob</span></span>
<span class="line"><span>      CACHE_VALID_TIME = System.currentTimeMillis() + 1000*60*60*24;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 从routeCountEachJob获取count</span></span>
<span class="line"><span>    AtomicInteger count = routeCountEachJob.get(jobId);</span></span>
<span class="line"><span>    if (count == null || count.get() &gt; 1000000) {</span></span>
<span class="line"><span>      // 初始化时主动Random一次，缓解首次压力</span></span>
<span class="line"><span>      count = new AtomicInteger(new Random().nextInt(100));</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      // count++</span></span>
<span class="line"><span>      count.addAndGet(1);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    routeCountEachJob.put(jobId, count);</span></span>
<span class="line"><span>    return count.get();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; route(TriggerParam triggerParam, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span>    // 获取到count后，对addressList.size()取余</span></span>
<span class="line"><span>    String address = addressList.get(count(triggerParam.getJobId()) % addressList.size());</span></span>
<span class="line"><span>    return new ReturnT&lt;String&gt;(address);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br></div></div><h2 id="executorrouterandom" tabindex="-1">ExecutorRouteRandom <a class="header-anchor" href="#executorrouterandom" aria-label="Permalink to &quot;ExecutorRouteRandom&quot;">​</a></h2><p>RANDOM策略也比较简单，生成一个0到地址列表元素个数之间的数值，然后将该数值作为下标拿到执行器地址即可。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorRouteRandom extends ExecutorRouter {</span></span>
<span class="line"><span>  private static Random localRandom = new Random();</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; route(TriggerParam triggerParam, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span>    String address = addressList.get(localRandom.nextInt(addressList.size()));</span></span>
<span class="line"><span>    return new ReturnT&lt;String&gt;(address);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><h2 id="executorrouteconsistenthash" tabindex="-1">ExecutorRouteConsistentHash <a class="header-anchor" href="#executorrouteconsistenthash" aria-label="Permalink to &quot;ExecutorRouteConsistentHash&quot;">​</a></h2><p>CONSISTENT_HASH（一致性HASH）：每个任务按照Hash算法固定选择某一台机器，且所有任务均匀散列在不同机器上。</p><div class="language-ExecutorRouteConsistentHash vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorRouteConsistentHash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorRouteConsistentHash extends ExecutorRouter {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static int VIRTUAL_NODE_NUM = 100;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public String hashJob(int jobId, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // ------A1------A2-------A3------</span></span>
<span class="line"><span>    // -----------J1------------------</span></span>
<span class="line"><span>    TreeMap&lt;Long, String&gt; addressRing = new TreeMap&lt;Long, String&gt;();</span></span>
<span class="line"><span>    for (String address: addressList) {</span></span>
<span class="line"><span>      for (int i = 0; i &lt; VIRTUAL_NODE_NUM; i++) {</span></span>
<span class="line"><span>        long addressHash = hash(&quot;SHARD-&quot; + address + &quot;-NODE-&quot; + i);</span></span>
<span class="line"><span>        addressRing.put(addressHash, address);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    long jobHash = hash(String.valueOf(jobId));</span></span>
<span class="line"><span>    SortedMap&lt;Long, String&gt; lastRing = addressRing.tailMap(jobHash);</span></span>
<span class="line"><span>    // 如果不为空，获取地址</span></span>
<span class="line"><span>    if (!lastRing.isEmpty()) {</span></span>
<span class="line"><span>      return lastRing.get(lastRing.firstKey());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 否则取第一个元素上的地址</span></span>
<span class="line"><span>    return addressRing.firstEntry().getValue();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; route(TriggerParam triggerParam, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span>    String address = hashJob(triggerParam.getJobId(), addressList);</span></span>
<span class="line"><span>    return new ReturnT&lt;String&gt;(address);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br></div></div><p>CONSISTENT_HASH（一致性哈希算法）对地址列表中的每个地址做100次哈希运算，根据hash值从虚拟节点与执行器地址对应关系获取对应的执行器地址返回。</p><h2 id="executorroutelfu" tabindex="-1">ExecutorRouteLFU <a class="header-anchor" href="#executorroutelfu" aria-label="Permalink to &quot;ExecutorRouteLFU&quot;">​</a></h2><p>LEAST_FREQUENTLY_USED（最不经常使用）：使用频率最低的机器优先被选举。</p><div class="language-ExecutorRouteLFU vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorRouteLFU</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorRouteLFU extends ExecutorRouter {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // ConcurrentMap的key是JobId， value是HashMap</span></span>
<span class="line"><span>  // HashMap的key是address, value是address使用的次数</span></span>
<span class="line"><span>  private static ConcurrentMap&lt;Integer, HashMap&lt;String, Integer&gt;&gt; jobLfuMap = new ConcurrentHashMap&lt;Integer, HashMap&lt;String, Integer&gt;&gt;();</span></span>
<span class="line"><span>  private static long CACHE_VALID_TIME = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public String route(int jobId, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // cache clear</span></span>
<span class="line"><span>    if (System.currentTimeMillis() &gt; CACHE_VALID_TIME) {</span></span>
<span class="line"><span>      jobLfuMap.clear();</span></span>
<span class="line"><span>      CACHE_VALID_TIME = System.currentTimeMillis() + 1000*60*60*24;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // lfu item init</span></span>
<span class="line"><span>    HashMap&lt;String, Integer&gt; lfuItemMap = jobLfuMap.get(jobId);     // Key排序可以用TreeMap+构造入参Compare；Value排序暂时只能通过ArrayList；</span></span>
<span class="line"><span>    if (lfuItemMap == null) {</span></span>
<span class="line"><span>      lfuItemMap = new HashMap&lt;String, Integer&gt;();</span></span>
<span class="line"><span>      jobLfuMap.putIfAbsent(jobId, lfuItemMap);   // 避免重复覆盖</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // put new</span></span>
<span class="line"><span>    for (String address: addressList) {</span></span>
<span class="line"><span>      if (!lfuItemMap.containsKey(address) || lfuItemMap.get(address) &gt;1000000 ) {</span></span>
<span class="line"><span>        lfuItemMap.put(address, new Random().nextInt(addressList.size()));  // 初始化时主动Random一次，缓解首次压力</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // remove old</span></span>
<span class="line"><span>    List&lt;String&gt; delKeys = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>    for (String existKey: lfuItemMap.keySet()) {</span></span>
<span class="line"><span>      if (!addressList.contains(existKey)) {</span></span>
<span class="line"><span>        delKeys.add(existKey);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (delKeys.size() &gt; 0) {</span></span>
<span class="line"><span>      for (String delKey: delKeys) {</span></span>
<span class="line"><span>        lfuItemMap.remove(delKey);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // load least userd count address</span></span>
<span class="line"><span>    // 根据使用的次数排序</span></span>
<span class="line"><span>    List&lt;Map.Entry&lt;String, Integer&gt;&gt; lfuItemList = new ArrayList&lt;Map.Entry&lt;String, Integer&gt;&gt;(lfuItemMap.entrySet());</span></span>
<span class="line"><span>    Collections.sort(lfuItemList, new Comparator&lt;Map.Entry&lt;String, Integer&gt;&gt;() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public int compare(Map.Entry&lt;String, Integer&gt; o1, Map.Entry&lt;String, Integer&gt; o2) {</span></span>
<span class="line"><span>        return o1.getValue().compareTo(o2.getValue());</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    Map.Entry&lt;String, Integer&gt; addressItem = lfuItemList.get(0);</span></span>
<span class="line"><span>    String minAddress = addressItem.getKey();</span></span>
<span class="line"><span>    // 次数+1</span></span>
<span class="line"><span>    addressItem.setValue(addressItem.getValue() + 1);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return addressItem.getKey();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; route(TriggerParam triggerParam, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span>    String address = route(triggerParam.getJobId(), addressList);</span></span>
<span class="line"><span>    return new ReturnT&lt;String&gt;(address);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br></div></div><p>这里采用了一个ConcurrentHashMap，其中key是jobId，value是一个HashMap。HashMap的key是对应的address，val是这个address使用的次数。</p><p>每次从ConcurrentHashMap中获取对应任务的hashmap，然后根据address的使用次数从小到大进行排序，然后获取到的第0个地址就是要用到的地址。</p><h2 id="executorroutelru" tabindex="-1">ExecutorRouteLRU <a class="header-anchor" href="#executorroutelru" aria-label="Permalink to &quot;ExecutorRouteLRU&quot;">​</a></h2><p>LEAST_RECENTLY_USED（最近最久未使用）：最久未使用的机器优先被选举。</p><div class="language-ExecutorRouteLRU vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorRouteLRU</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorRouteLRU extends ExecutorRouter {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static ConcurrentMap&lt;Integer, LinkedHashMap&lt;String, String&gt;&gt; jobLRUMap = new ConcurrentHashMap&lt;Integer, LinkedHashMap&lt;String, String&gt;&gt;();</span></span>
<span class="line"><span>  private static long CACHE_VALID_TIME = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public String route(int jobId, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // cache clear</span></span>
<span class="line"><span>    if (System.currentTimeMillis() &gt; CACHE_VALID_TIME) {</span></span>
<span class="line"><span>      jobLRUMap.clear();</span></span>
<span class="line"><span>      CACHE_VALID_TIME = System.currentTimeMillis() + 1000*60*60*24;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // init lru</span></span>
<span class="line"><span>    LinkedHashMap&lt;String, String&gt; lruItem = jobLRUMap.get(jobId);</span></span>
<span class="line"><span>    if (lruItem == null) {</span></span>
<span class="line"><span>      /**</span></span>
<span class="line"><span>       * LinkedHashMap</span></span>
<span class="line"><span>       *      a、accessOrder：true=访问顺序排序（get/put时排序）；false=插入顺序排期；</span></span>
<span class="line"><span>       *      b、removeEldestEntry：新增元素时将会调用，返回true时会删除最老元素；可封装LinkedHashMap并重写该方法，比如定义最大容量，超出是返回true即可实现固定长度的LRU算法；</span></span>
<span class="line"><span>       */</span></span>
<span class="line"><span>      lruItem = new LinkedHashMap&lt;String, String&gt;(16, 0.75f, true);</span></span>
<span class="line"><span>      jobLRUMap.putIfAbsent(jobId, lruItem);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // put new</span></span>
<span class="line"><span>    for (String address: addressList) {</span></span>
<span class="line"><span>      if (!lruItem.containsKey(address)) {</span></span>
<span class="line"><span>        lruItem.put(address, address);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // remove old</span></span>
<span class="line"><span>    List&lt;String&gt; delKeys = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>    for (String existKey: lruItem.keySet()) {</span></span>
<span class="line"><span>      if (!addressList.contains(existKey)) {</span></span>
<span class="line"><span>        delKeys.add(existKey);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (delKeys.size() &gt; 0) {</span></span>
<span class="line"><span>      for (String delKey: delKeys) {</span></span>
<span class="line"><span>        lruItem.remove(delKey);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // load</span></span>
<span class="line"><span>    String eldestKey = lruItem.entrySet().iterator().next().getKey();</span></span>
<span class="line"><span>    String eldestValue = lruItem.get(eldestKey);</span></span>
<span class="line"><span>    return eldestValue;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; route(TriggerParam triggerParam, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span>    String address = route(triggerParam.getJobId(), addressList);</span></span>
<span class="line"><span>    return new ReturnT&lt;String&gt;(address);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br></div></div><p>这里也用到了ConcurrentHashMap存储，key是任务id，val是一个linkHashMap，按照访问顺序进行排序的，所以每次选取时，直接拿entryKey的元素即可。</p><h2 id="executorroutefailover" tabindex="-1">ExecutorRouteFailover <a class="header-anchor" href="#executorroutefailover" aria-label="Permalink to &quot;ExecutorRouteFailover&quot;">​</a></h2><p>FAILOVER（故障转移）：按照顺序依次进行心跳检测，第一个心跳检测成功的机器选定为目标执行器并发起调度；</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorRouteFailover extends ExecutorRouter {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; route(TriggerParam triggerParam, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    StringBuffer beatResultSB = new StringBuffer();</span></span>
<span class="line"><span>    for (String address : addressList) {</span></span>
<span class="line"><span>      // beat</span></span>
<span class="line"><span>      ReturnT&lt;String&gt; beatResult = null;</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        // 获取当前address的心跳检测结果</span></span>
<span class="line"><span>        ExecutorBiz executorBiz = XxlJobScheduler.getExecutorBiz(address);</span></span>
<span class="line"><span>        // 会发送请求</span></span>
<span class="line"><span>        beatResult = executorBiz.beat();</span></span>
<span class="line"><span>      } catch (Exception e) {</span></span>
<span class="line"><span>        logger.error(e.getMessage(), e);</span></span>
<span class="line"><span>        beatResult = new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;&quot;+e );</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      beatResultSB.append( (beatResultSB.length()&gt;0)?&quot;&lt;br&gt;&lt;br&gt;&quot;:&quot;&quot;)</span></span>
<span class="line"><span>              .append(I18nUtil.getString(&quot;jobconf_beat&quot;) + &quot;：&quot;)</span></span>
<span class="line"><span>              .append(&quot;&lt;br&gt;address：&quot;).append(address)</span></span>
<span class="line"><span>              .append(&quot;&lt;br&gt;code：&quot;).append(beatResult.getCode())</span></span>
<span class="line"><span>              .append(&quot;&lt;br&gt;msg：&quot;).append(beatResult.getMsg());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 如果心跳检测成功，则返回该地址</span></span>
<span class="line"><span>      if (beatResult.getCode() == ReturnT.SUCCESS_CODE) {</span></span>
<span class="line"><span>        beatResult.setMsg(beatResultSB.toString());</span></span>
<span class="line"><span>        beatResult.setContent(address);</span></span>
<span class="line"><span>        return beatResult;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, beatResultSB.toString());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br></div></div><p>ExecutorRouteFailover是失败转移路由，route方法遍历执行器地址，然后发送心跳给执行器服务，如果心跳正常，则成功返回该执行器地址，否则返回失败码。</p><h2 id="executorroutebusyover" tabindex="-1">ExecutorRouteBusyover <a class="header-anchor" href="#executorroutebusyover" aria-label="Permalink to &quot;ExecutorRouteBusyover&quot;">​</a></h2><p>BUSYOVER（忙碌转移）：按照顺序依次进行空闲检测，第一个空闲检测成功的机器选定为目标执行器并发起调度。</p><div class="language-ExecutorRouteBusyover vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorRouteBusyover</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorRouteBusyover extends ExecutorRouter {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; route(TriggerParam triggerParam, List&lt;String&gt; addressList) {</span></span>
<span class="line"><span>    StringBuffer idleBeatResultSB = new StringBuffer();</span></span>
<span class="line"><span>    for (String address : addressList) {</span></span>
<span class="line"><span>      // beat</span></span>
<span class="line"><span>      ReturnT&lt;String&gt; idleBeatResult = null;</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        ExecutorBiz executorBiz = XxlJobScheduler.getExecutorBiz(address);</span></span>
<span class="line"><span>        // 检测是否空闲，会发送请求</span></span>
<span class="line"><span>        idleBeatResult = executorBiz.idleBeat(new IdleBeatParam(triggerParam.getJobId()));</span></span>
<span class="line"><span>      } catch (Exception e) {</span></span>
<span class="line"><span>        logger.error(e.getMessage(), e);</span></span>
<span class="line"><span>        idleBeatResult = new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;&quot;+e );</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      idleBeatResultSB.append( (idleBeatResultSB.length()&gt;0)?&quot;&lt;br&gt;&lt;br&gt;&quot;:&quot;&quot;)</span></span>
<span class="line"><span>              .append(I18nUtil.getString(&quot;jobconf_idleBeat&quot;) + &quot;：&quot;)</span></span>
<span class="line"><span>              .append(&quot;&lt;br&gt;address：&quot;).append(address)</span></span>
<span class="line"><span>              .append(&quot;&lt;br&gt;code：&quot;).append(idleBeatResult.getCode())</span></span>
<span class="line"><span>              .append(&quot;&lt;br&gt;msg：&quot;).append(idleBeatResult.getMsg());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // beat success</span></span>
<span class="line"><span>      // 如果检测空闲成功，则返回</span></span>
<span class="line"><span>      if (idleBeatResult.getCode() == ReturnT.SUCCESS_CODE) {</span></span>
<span class="line"><span>        idleBeatResult.setMsg(idleBeatResultSB.toString());</span></span>
<span class="line"><span>        idleBeatResult.setContent(address);</span></span>
<span class="line"><span>        return idleBeatResult;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, idleBeatResultSB.toString());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br></div></div><p>ExecutorRouteBusyover是忙碌转移路由器，route方法首先遍历执行器地址列表，然后对执行器地址进行空闲检测，当任务线程没有在执行定时任务时，将返回空闲检测成功，将该执行器地址返回。</p>`,43)]))}const d=n(l,[["render",r]]);export{m as __pageData,d as default};
