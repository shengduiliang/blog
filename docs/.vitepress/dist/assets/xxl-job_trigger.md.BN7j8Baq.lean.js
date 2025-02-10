import{_ as s,c as a,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const g=JSON.parse('{"title":"定时任务执行流程","description":"","frontmatter":{},"headers":[],"relativePath":"xxl-job/trigger.md","filePath":"xxl-job/trigger.md"}'),l={name:"xxl-job/trigger.md"};function r(i,n,t,c,u,o){return e(),a("div",null,n[0]||(n[0]=[p(`<h1 id="定时任务执行流程" tabindex="-1">定时任务执行流程 <a class="header-anchor" href="#定时任务执行流程" aria-label="Permalink to &quot;定时任务执行流程&quot;">​</a></h1><p>上一章我们分析了xxl-job是通过时间轮算法来调度定时任务的, 并且最后我们知道调用定时任务执行是通过下面这个方法。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>JobTriggerPoolHelper.trigger()</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>这章分析一下定时任务是怎么被触发执行的。</p><h2 id="trigger" tabindex="-1">trigger <a class="header-anchor" href="#trigger" aria-label="Permalink to &quot;trigger&quot;">​</a></h2><p>我们看一下JobTriggerPoolHelper的trigger方法，代码如下：</p><div class="language-JobTriggerPoolHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobTriggerPoolHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobTriggerPoolHelper {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // job timeout count</span></span>
<span class="line"><span>  private volatile long minTim = System.currentTimeMillis()/60000;     // ms &gt; min</span></span>
<span class="line"><span>  private volatile ConcurrentMap&lt;Integer, AtomicInteger&gt; jobTimeoutCountMap = new ConcurrentHashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static void trigger(int jobId, TriggerTypeEnum triggerType, int failRetryCount, String executorShardingParam, String executorParam, String addressList) {</span></span>
<span class="line"><span>    helper.addTrigger(jobId, triggerType, failRetryCount, executorShardingParam, executorParam, addressList);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void addTrigger(final int jobId,</span></span>
<span class="line"><span>                         final TriggerTypeEnum triggerType,</span></span>
<span class="line"><span>                         final int failRetryCount,</span></span>
<span class="line"><span>                         final String executorShardingParam,</span></span>
<span class="line"><span>                         final String executorParam,</span></span>
<span class="line"><span>                         final String addressList) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // choose thread pool</span></span>
<span class="line"><span>    // 默认使用fastTriggerPool</span></span>
<span class="line"><span>    ThreadPoolExecutor triggerPool_ = fastTriggerPool;</span></span>
<span class="line"><span>    AtomicInteger jobTimeoutCount = jobTimeoutCountMap.get(jobId);</span></span>
<span class="line"><span>    // 如果jobTimeout的次数大于10，则使用slowTriggerPool</span></span>
<span class="line"><span>    if (jobTimeoutCount!=null &amp;&amp; jobTimeoutCount.get() &gt; 10) {      // job-timeout 10 times in 1 min</span></span>
<span class="line"><span>      triggerPool_ = slowTriggerPool;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // trigger</span></span>
<span class="line"><span>    triggerPool_.execute(new Runnable() {</span></span>
<span class="line"><span>      @Override</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        long start = System.currentTimeMillis();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          // do trigger</span></span>
<span class="line"><span>          XxlJobTrigger.trigger(jobId, triggerType, failRetryCount, executorShardingParam, executorParam, addressList);</span></span>
<span class="line"><span>        } catch (Exception e) {</span></span>
<span class="line"><span>          logger.error(e.getMessage(), e);</span></span>
<span class="line"><span>        } finally {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // check timeout-count-map</span></span>
<span class="line"><span>          long minTim_now = System.currentTimeMillis()/60000;</span></span>
<span class="line"><span>          if (minTim != minTim_now) {</span></span>
<span class="line"><span>            minTim = minTim_now;</span></span>
<span class="line"><span>            jobTimeoutCountMap.clear();</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // incr timeout-count-map</span></span>
<span class="line"><span>          long cost = System.currentTimeMillis()-start;</span></span>
<span class="line"><span>          if (cost &gt; 500) {       // ob-timeout threshold 500ms</span></span>
<span class="line"><span>            // 放入jobTimeoutCountMap</span></span>
<span class="line"><span>            AtomicInteger timeoutCount = jobTimeoutCountMap.putIfAbsent(jobId, new AtomicInteger(1));</span></span>
<span class="line"><span>            if (timeoutCount != null) {</span></span>
<span class="line"><span>              timeoutCount.incrementAndGet();</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br></div></div><p>可以看到是从fastTriggerPool和slowTriggerPool选择一个线程池来执行，默认使用fastTriggerPool，如果定时任务超时失败的次数超过10次，会选择slowTriggerPool。然后使用XxlJobTrigger.trigger调度任务，如果任务超时失败，就把失败的次数加1。</p><p>fastTriggerPool和slowTriggerPool这两个线程池的创建时间可以点击<a href="/xxl-job/xxl-job-admin-schedule.html#触发器线程池创建">此处</a>。</p><p>可以看到核心是XxlJobTrigger#trigger，继续查看该方法, 代码如下。</p><div class="language-XxlJobTrigger vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobTrigger</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobTrigger {</span></span>
<span class="line"><span>  public static void trigger(int jobId,</span></span>
<span class="line"><span>                             TriggerTypeEnum triggerType,</span></span>
<span class="line"><span>                             int failRetryCount,</span></span>
<span class="line"><span>                             String executorShardingParam,</span></span>
<span class="line"><span>                             String executorParam,</span></span>
<span class="line"><span>                             String addressList) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 获取定时任务</span></span>
<span class="line"><span>    XxlJobInfo jobInfo = XxlJobAdminConfig.getAdminConfig().getXxlJobInfoDao().loadById(jobId);</span></span>
<span class="line"><span>    if (jobInfo == null) {</span></span>
<span class="line"><span>      logger.warn(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; trigger fail, jobId invalid，jobId={}&quot;, jobId);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果执行参数不为空，则设置执行参数</span></span>
<span class="line"><span>    if (executorParam != null) {</span></span>
<span class="line"><span>      jobInfo.setExecutorParam(executorParam);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 获取失败重试次数</span></span>
<span class="line"><span>    int finalFailRetryCount = failRetryCount &gt;= 0 ? failRetryCount : jobInfo.getExecutorFailRetryCount();</span></span>
<span class="line"><span>    // 获取执行器</span></span>
<span class="line"><span>    XxlJobGroup group = XxlJobAdminConfig.getAdminConfig().getXxlJobGroupDao().load(jobInfo.getJobGroup());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 获取执行器下绑定的address列表</span></span>
<span class="line"><span>    if (addressList!=null &amp;&amp; addressList.trim().length()&gt;0) {</span></span>
<span class="line"><span>      group.setAddressType(1);</span></span>
<span class="line"><span>      group.setAddressList(addressList.trim());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // sharding param</span></span>
<span class="line"><span>    int[] shardingParam = null;</span></span>
<span class="line"><span>    if (executorShardingParam!=null){</span></span>
<span class="line"><span>      String[] shardingArr = executorShardingParam.split(&quot;/&quot;);</span></span>
<span class="line"><span>      if (shardingArr.length==2 &amp;&amp; isNumeric(shardingArr[0]) &amp;&amp; isNumeric(shardingArr[1])) {</span></span>
<span class="line"><span>        shardingParam = new int[2];</span></span>
<span class="line"><span>        shardingParam[0] = Integer.valueOf(shardingArr[0]);</span></span>
<span class="line"><span>        shardingParam[1] = Integer.valueOf(shardingArr[1]);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 如果是分片广播，则所有的Registry并行执行</span></span>
<span class="line"><span>    if (ExecutorRouteStrategyEnum.SHARDING_BROADCAST == ExecutorRouteStrategyEnum.match(jobInfo.getExecutorRouteStrategy(), null)</span></span>
<span class="line"><span>            &amp;&amp; group.getRegistryList()!=null &amp;&amp; !group.getRegistryList().isEmpty()</span></span>
<span class="line"><span>            &amp;&amp; shardingParam==null) {</span></span>
<span class="line"><span>      for (int i = 0; i &lt; group.getRegistryList().size(); i++) {</span></span>
<span class="line"><span>        processTrigger(group, jobInfo, finalFailRetryCount, triggerType, i, group.getRegistryList().size());</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      // 其余的选择一个Registry执行</span></span>
<span class="line"><span>      if (shardingParam == null) {</span></span>
<span class="line"><span>        shardingParam = new int[]{0, 1};</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      processTrigger(group, jobInfo, finalFailRetryCount, triggerType, shardingParam[0], shardingParam[1]);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br></div></div><p>根据任务ID从数据库中获取要执行的任务，然后判断路由策略，如果是分片广播，遍历地址列表，触发所有的机器，否则只触发一台机器。分片广播是要触发所有的机器并行处理任务。</p><h2 id="processtrigger" tabindex="-1">processTrigger <a class="header-anchor" href="#processtrigger" aria-label="Permalink to &quot;processTrigger&quot;">​</a></h2><p>接下来我们看一下processTrigger方法，这个方法的代码比较长，让我们一步一步分析。</p><ul><li>获取阻塞策略，路由策略以及分片广播参数等</li></ul><div class="language-XxlJobTrigger vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobTrigger</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobTrigger {</span></span>
<span class="line"><span>  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {</span></span>
<span class="line"><span>    // 获取阻塞策略</span></span>
<span class="line"><span>    ExecutorBlockStrategyEnum blockStrategy = ExecutorBlockStrategyEnum.match(jobInfo.getExecutorBlockStrategy(), ExecutorBlockStrategyEnum.SERIAL_EXECUTION);  // block strategy</span></span>
<span class="line"><span>    // 获取路由策略</span></span>
<span class="line"><span>    ExecutorRouteStrategyEnum executorRouteStrategyEnum = ExecutorRouteStrategyEnum.match(jobInfo.getExecutorRouteStrategy(), null);    // route strategy</span></span>
<span class="line"><span>    // 分片广播</span></span>
<span class="line"><span>    String shardingParam = (ExecutorRouteStrategyEnum.SHARDING_BROADCAST==executorRouteStrategyEnum)?String.valueOf(index).concat(&quot;/&quot;).concat(String.valueOf(total)):null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><ul><li>保存任务日志</li></ul><div class="language-XxlJobTrigger vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobTrigger</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobTrigger {</span></span>
<span class="line"><span>  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {</span></span>
<span class="line"><span>    // 1、save log-id</span></span>
<span class="line"><span>    XxlJobLog jobLog = new XxlJobLog();</span></span>
<span class="line"><span>    jobLog.setJobGroup(jobInfo.getJobGroup());</span></span>
<span class="line"><span>    jobLog.setJobId(jobInfo.getId());</span></span>
<span class="line"><span>    jobLog.setTriggerTime(new Date());</span></span>
<span class="line"><span>    XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().save(jobLog);</span></span>
<span class="line"><span>    logger.debug(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job trigger start, jobId:{}&quot;, jobLog.getId());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><ul><li>初始化触发参数</li></ul><div class="language-XxlJobTrigger vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobTrigger</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobTrigger {</span></span>
<span class="line"><span>  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {</span></span>
<span class="line"><span>    // 2、init trigger-param</span></span>
<span class="line"><span>    TriggerParam triggerParam = new TriggerParam();</span></span>
<span class="line"><span>    triggerParam.setJobId(jobInfo.getId());</span></span>
<span class="line"><span>    triggerParam.setExecutorHandler(jobInfo.getExecutorHandler());</span></span>
<span class="line"><span>    triggerParam.setExecutorParams(jobInfo.getExecutorParam());</span></span>
<span class="line"><span>    triggerParam.setExecutorBlockStrategy(jobInfo.getExecutorBlockStrategy());</span></span>
<span class="line"><span>    triggerParam.setExecutorTimeout(jobInfo.getExecutorTimeout());</span></span>
<span class="line"><span>    triggerParam.setLogId(jobLog.getId());</span></span>
<span class="line"><span>    triggerParam.setLogDateTime(jobLog.getTriggerTime().getTime());</span></span>
<span class="line"><span>    triggerParam.setGlueType(jobInfo.getGlueType());</span></span>
<span class="line"><span>    triggerParam.setGlueSource(jobInfo.getGlueSource());</span></span>
<span class="line"><span>    triggerParam.setGlueUpdatetime(jobInfo.getGlueUpdatetime().getTime());</span></span>
<span class="line"><span>    triggerParam.setBroadcastIndex(index);</span></span>
<span class="line"><span>    triggerParam.setBroadcastTotal(total);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><ul><li>初始化执行器的地址：如果路由策略是分片广播，执行地址就为第index的地址，否则从通过路由策略获取执行地址。(核心)</li></ul><div class="language-XxlJobTrigger vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobTrigger</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobTrigger {</span></span>
<span class="line"><span>  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {</span></span>
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
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><ul><li>触发远程执行器，即触发远程的定时任务(核心)</li></ul><div class="language-XxlJobTrigger vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobTrigger</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobTrigger {</span></span>
<span class="line"><span>  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {</span></span>
<span class="line"><span>    // 4、trigger remote executor</span></span>
<span class="line"><span>    ReturnT&lt;String&gt; triggerResult = null;</span></span>
<span class="line"><span>    if (address != null) {</span></span>
<span class="line"><span>      triggerResult = runExecutor(triggerParam, address);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      triggerResult = new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, null);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><ul><li>设置触发信息并保存触发日志</li></ul><div class="language-XxlJobTrigger vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobTrigger</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobTrigger {</span></span>
<span class="line"><span>  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {</span></span>
<span class="line"><span>    // 5、collection trigger info</span></span>
<span class="line"><span>    StringBuffer triggerMsgSb = new StringBuffer();</span></span>
<span class="line"><span>    triggerMsgSb.append(I18nUtil.getString(&quot;jobconf_trigger_type&quot;)).append(&quot;：&quot;).append(triggerType.getTitle());</span></span>
<span class="line"><span>    triggerMsgSb.append(&quot;&lt;br&gt;&quot;).append(I18nUtil.getString(&quot;jobconf_trigger_admin_adress&quot;)).append(&quot;：&quot;).append(IpUtil.getIp());</span></span>
<span class="line"><span>    triggerMsgSb.append(&quot;&lt;br&gt;&quot;).append(I18nUtil.getString(&quot;jobconf_trigger_exe_regtype&quot;)).append(&quot;：&quot;)</span></span>
<span class="line"><span>            .append( (group.getAddressType() == 0)?I18nUtil.getString(&quot;jobgroup_field_addressType_0&quot;):I18nUtil.getString(&quot;jobgroup_field_addressType_1&quot;) );</span></span>
<span class="line"><span>    triggerMsgSb.append(&quot;&lt;br&gt;&quot;).append(I18nUtil.getString(&quot;jobconf_trigger_exe_regaddress&quot;)).append(&quot;：&quot;).append(group.getRegistryList());</span></span>
<span class="line"><span>    triggerMsgSb.append(&quot;&lt;br&gt;&quot;).append(I18nUtil.getString(&quot;jobinfo_field_executorRouteStrategy&quot;)).append(&quot;：&quot;).append(executorRouteStrategyEnum.getTitle());</span></span>
<span class="line"><span>    if (shardingParam != null) {</span></span>
<span class="line"><span>      triggerMsgSb.append(&quot;(&quot;+shardingParam+&quot;)&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    triggerMsgSb.append(&quot;&lt;br&gt;&quot;).append(I18nUtil.getString(&quot;jobinfo_field_executorBlockStrategy&quot;)).append(&quot;：&quot;).append(blockStrategy.getTitle());</span></span>
<span class="line"><span>    triggerMsgSb.append(&quot;&lt;br&gt;&quot;).append(I18nUtil.getString(&quot;jobinfo_field_timeout&quot;)).append(&quot;：&quot;).append(jobInfo.getExecutorTimeout());</span></span>
<span class="line"><span>    triggerMsgSb.append(&quot;&lt;br&gt;&quot;).append(I18nUtil.getString(&quot;jobinfo_field_executorFailRetryCount&quot;)).append(&quot;：&quot;).append(finalFailRetryCount);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    triggerMsgSb.append(&quot;&lt;br&gt;&lt;br&gt;&lt;span style=\\&quot;color:#00c0ef;\\&quot; &gt; &gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&quot;+ I18nUtil.getString(&quot;jobconf_trigger_run&quot;) +&quot;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt; &lt;/span&gt;&lt;br&gt;&quot;)</span></span>
<span class="line"><span>            .append((routeAddressResult!=null&amp;&amp;routeAddressResult.getMsg()!=null)?routeAddressResult.getMsg()+&quot;&lt;br&gt;&lt;br&gt;&quot;:&quot;&quot;).append(triggerResult.getMsg()!=null?triggerResult.getMsg():&quot;&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 6、save log trigger-info</span></span>
<span class="line"><span>    jobLog.setExecutorAddress(address);</span></span>
<span class="line"><span>    jobLog.setExecutorHandler(jobInfo.getExecutorHandler());</span></span>
<span class="line"><span>    jobLog.setExecutorParam(jobInfo.getExecutorParam());</span></span>
<span class="line"><span>    jobLog.setExecutorShardingParam(shardingParam);</span></span>
<span class="line"><span>    jobLog.setExecutorFailRetryCount(finalFailRetryCount);</span></span>
<span class="line"><span>    //jobLog.setTriggerTime();</span></span>
<span class="line"><span>    jobLog.setTriggerCode(triggerResult.getCode());</span></span>
<span class="line"><span>    jobLog.setTriggerMsg(triggerMsgSb.toString());</span></span>
<span class="line"><span>    XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().updateTriggerInfo(jobLog);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br></div></div><h2 id="runexecutor" tabindex="-1">runExecutor <a class="header-anchor" href="#runexecutor" aria-label="Permalink to &quot;runExecutor&quot;">​</a></h2><p>主要看一下runExecutor方法，这个是实际的调度执行方法，代码如下</p><div class="language-XxlJobTrigger vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobTrigger</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobTrigger {</span></span>
<span class="line"><span>  public static ReturnT&lt;String&gt; runExecutor(TriggerParam triggerParam, String address){</span></span>
<span class="line"><span>    ReturnT&lt;String&gt; runResult = null;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      ExecutorBiz executorBiz = XxlJobScheduler.getExecutorBiz(address);</span></span>
<span class="line"><span>      runResult = executorBiz.run(triggerParam);</span></span>
<span class="line"><span>    } catch (Exception e) {</span></span>
<span class="line"><span>      logger.error(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job trigger error, please check if the executor[{}] is running.&quot;, address, e);</span></span>
<span class="line"><span>      runResult = new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, ThrowableUtil.toString(e));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    StringBuffer runResultSB = new StringBuffer(I18nUtil.getString(&quot;jobconf_trigger_run&quot;) + &quot;：&quot;);</span></span>
<span class="line"><span>    runResultSB.append(&quot;&lt;br&gt;address：&quot;).append(address);</span></span>
<span class="line"><span>    runResultSB.append(&quot;&lt;br&gt;code：&quot;).append(runResult.getCode());</span></span>
<span class="line"><span>    runResultSB.append(&quot;&lt;br&gt;msg：&quot;).append(runResult.getMsg());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    runResult.setMsg(runResultSB.toString());</span></span>
<span class="line"><span>    return runResult;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>runExecutor通过XxlJobScheduler#getExecutorBiz获取到ExecutorBiz，然后调用executorBiz.run方法，等待返回结果，然后将结果返回。</p><p>ExecutorBiz有两个实现类，ExecutorBizClient和ExecutorBizImpl，xxl-job-admin使用的是ExecutorBizClient，查看ExecutorBizClient#run方法</p><div class="language-ExecutorBizClient vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ExecutorBizClient</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExecutorBizClient implements ExecutorBiz {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; run(TriggerParam triggerParam) {</span></span>
<span class="line"><span>      return XxlJobRemotingUtil.postBody(addressUrl + &quot;run&quot;, accessToken, timeout, triggerParam, String.class);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>ExecutorBizClient的run方法比较简单，就是通过XxlJobRemotingUtil发送一个请求，触发执行器里面的机器执行，然后把结果返回来。</p><h2 id="postbody" tabindex="-1">postBody <a class="header-anchor" href="#postbody" aria-label="Permalink to &quot;postBody&quot;">​</a></h2><p>最后我们还是看一下XxlJobRemotingUtil#postBody方法吧， 具体代码如下：</p><div class="language-XxlJobRemotingUtil vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">XxlJobRemotingUtil</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class XxlJobRemotingUtil {</span></span>
<span class="line"><span>  public static ReturnT postBody(String url, String accessToken, int timeout, Object requestObj, Class returnTargClassOfT) {</span></span>
<span class="line"><span>    HttpURLConnection connection = null;</span></span>
<span class="line"><span>    BufferedReader bufferedReader = null;</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      // connection</span></span>
<span class="line"><span>      URL realUrl = new URL(url);</span></span>
<span class="line"><span>      connection = (HttpURLConnection) realUrl.openConnection();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // trust-https</span></span>
<span class="line"><span>      boolean useHttps = url.startsWith(&quot;https&quot;);</span></span>
<span class="line"><span>      if (useHttps) {</span></span>
<span class="line"><span>        HttpsURLConnection https = (HttpsURLConnection) connection;</span></span>
<span class="line"><span>        trustAllHosts(https);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      ...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      if(accessToken!=null &amp;&amp; accessToken.trim().length()&gt;0){</span></span>
<span class="line"><span>        connection.setRequestProperty(XXL_JOB_ACCESS_TOKEN, accessToken);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // do connection</span></span>
<span class="line"><span>      connection.connect();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // write requestBody</span></span>
<span class="line"><span>      if (requestObj != null) {</span></span>
<span class="line"><span>        String requestBody = GsonTool.toJson(requestObj);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        DataOutputStream dataOutputStream = new DataOutputStream(connection.getOutputStream());</span></span>
<span class="line"><span>        dataOutputStream.write(requestBody.getBytes(&quot;UTF-8&quot;));</span></span>
<span class="line"><span>        dataOutputStream.flush();</span></span>
<span class="line"><span>        dataOutputStream.close();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      /*byte[] requestBodyBytes = requestBody.getBytes(&quot;UTF-8&quot;);</span></span>
<span class="line"><span>      connection.setRequestProperty(&quot;Content-Length&quot;, String.valueOf(requestBodyBytes.length));</span></span>
<span class="line"><span>      OutputStream outwritestream = connection.getOutputStream();</span></span>
<span class="line"><span>      outwritestream.write(requestBodyBytes);</span></span>
<span class="line"><span>      outwritestream.flush();</span></span>
<span class="line"><span>      outwritestream.close();*/</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // valid StatusCode</span></span>
<span class="line"><span>      int statusCode = connection.getResponseCode();</span></span>
<span class="line"><span>      if (statusCode != 200) {</span></span>
<span class="line"><span>        return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, &quot;xxl-job remoting fail, StatusCode(&quot;+ statusCode +&quot;) invalid. for url : &quot; + url);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // result</span></span>
<span class="line"><span>      bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream(), &quot;UTF-8&quot;));</span></span>
<span class="line"><span>      StringBuilder result = new StringBuilder();</span></span>
<span class="line"><span>      String line;</span></span>
<span class="line"><span>      while ((line = bufferedReader.readLine()) != null) {</span></span>
<span class="line"><span>        result.append(line);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      String resultJson = result.toString();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // parse returnT</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        ReturnT returnT = GsonTool.fromJson(resultJson, ReturnT.class, returnTargClassOfT);</span></span>
<span class="line"><span>        return returnT;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br></div></div><p>可以看到是构造了一个HttpURLConnection发起了一个HTTP请求，然后利用GsonTool解析返回结果。</p>`,37)]))}const m=s(l,[["render",r]]);export{g as __pageData,m as default};
