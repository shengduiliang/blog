import{_ as s,c as a,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const l="/assets/scheduleThread._ZicOhLA.png",i="/assets/timer-wheel.CyYtWtZT.png",d=JSON.parse('{"title":"定时任务调度","description":"","frontmatter":{},"headers":[],"relativePath":"xxl-job/task-schedule.md","filePath":"xxl-job/task-schedule.md"}'),r={name:"xxl-job/task-schedule.md"};function c(b,n,t,u,m,o){return e(),a("div",null,n[0]||(n[0]=[p(`<h1 id="定时任务调度" tabindex="-1">定时任务调度 <a class="header-anchor" href="#定时任务调度" aria-label="Permalink to &quot;定时任务调度&quot;">​</a></h1><p>上一篇分析了调度中心启动流程分析，调度中心启动过程中会启动调度任务。这一篇文章主要深入调度任务的启动源码。</p><p>我们从上节最后的那行代码JobScheduleHelper#getInstance#start方法讲起，查看该方法，可以看到定义了scheduleThread跟ringThread两个守护线程，代码如下:</p><div class="language-JobScheduleHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobScheduleHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobScheduleHelper {</span></span>
<span class="line"><span>  public void start() {</span></span>
<span class="line"><span>    // scheduleThread</span></span>
<span class="line"><span>    scheduleThread = new Thread();</span></span>
<span class="line"><span>    scheduleThread.setDaemon(true);</span></span>
<span class="line"><span>    scheduleThread.setName(&quot;xxl-job, admin JobScheduleHelper#scheduleThread&quot;);</span></span>
<span class="line"><span>    scheduleThread.start();</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>    // ringThread</span></span>
<span class="line"><span>    ringThread = new Thread();</span></span>
<span class="line"><span>    ringThread.setDaemon(true);</span></span>
<span class="line"><span>    ringThread.setName(&quot;xxl-job, admin JobScheduleHelper#ringThread&quot;);</span></span>
<span class="line"><span>    ringThread.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><h2 id="schedulethread" tabindex="-1">scheduleThread <a class="header-anchor" href="#schedulethread" aria-label="Permalink to &quot;scheduleThread&quot;">​</a></h2><p>我们先看一下scheduleThread#run方法的处理逻辑，代码如下：</p><div class="language-JobScheduleHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobScheduleHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>scheduleThread = new Thread(new Runnable() {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void run() {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 让当前线程休眠到下一个5s的时间，比如当前时间是12:00:00.345，则会休眠到12:00:05</span></span>
<span class="line"><span>    TimeUnit.MILLISECONDS.sleep(5000 - System.currentTimeMillis()%1000 );</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // pre-read count: treadpool-size * trigger-qps (each trigger cost 50ms, qps = 1000/50 = 20)</span></span>
<span class="line"><span>    // 下次执行时间在未来5秒以内的所有任务数，一次最多取（triggerPoolFastMax 200 +triggerPoolSlowMax 100）* 20条，最少6000条</span></span>
<span class="line"><span>    int preReadCount = (XxlJobAdminConfig.getAdminConfig().getTriggerPoolFastMax() + XxlJobAdminConfig.getAdminConfig().getTriggerPoolSlowMax()) * 20;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    while (!scheduleThreadToStop) {</span></span>
<span class="line"><span>      boolean preReadSuc = true;</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        //设置手动提交</span></span>
<span class="line"><span>        conn = XxlJobAdminConfig.getAdminConfig().getDataSource().getConnection();</span></span>
<span class="line"><span>        connAutoCommit = conn.getAutoCommit();</span></span>
<span class="line"><span>        conn.setAutoCommit(false);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        //获取任务调度锁表内数据信息,加写锁</span></span>
<span class="line"><span>        preparedStatement = conn.prepareStatement(  &quot;select * from xxl_job_lock where lock_name = &#39;schedule_lock&#39; for update&quot; );</span></span>
<span class="line"><span>        preparedStatement.execute();</span></span>
<span class="line"><span>        // 1、pre read</span></span>
<span class="line"><span>        long nowTime = System.currentTimeMillis();</span></span>
<span class="line"><span>        // 获取当前时间后5秒，同时最多负载的分页数</span></span>
<span class="line"><span>        List&lt;XxlJobInfo&gt; scheduleList = XxlJobAdminConfig.getAdminConfig().getXxlJobInfoDao().scheduleJobQuery(nowTime + PRE_READ_MS, preReadCount);</span></span>
<span class="line"><span>        if (scheduleList!=null &amp;&amp; scheduleList.size()&gt;0) {</span></span>
<span class="line"><span>            ...</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>            preReadSuc = false;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      } finally {</span></span>
<span class="line"><span>        if (null != preparedStatement) {</span></span>
<span class="line"><span>            preparedStatement.close();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // tx stop</span></span>
<span class="line"><span>      ...</span></span>
<span class="line"><span>      long cost = System.currentTimeMillis()-start;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // Wait seconds, align second</span></span>
<span class="line"><span>      if (cost &lt; 1000) {  // scan-overtime, not wait</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          // pre-read period: success &gt; scan each second; fail &gt; skip this period;</span></span>
<span class="line"><span>          TimeUnit.MILLISECONDS.sleep((preReadSuc?1000:PRE_READ_MS) - System.currentTimeMillis()%1000);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }  </span></span>
<span class="line"><span>  }    </span></span>
<span class="line"><span>});</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br></div></div><p>这段线程主要是不断循环，然后对xxl_job_lock加写锁，然后获取未来5秒之内的所有任务，如果有任务则对任务进行处理，具体处理逻辑看后面。这里有个地方要重点说明一下，xxl-job在集群部署时，如何避免多个服务器同时调度任务呢？做法就是先对xxl_job_lock加写锁，只有加写锁成功才可以获取定时任务来处理，从而避免多个服务器同时调度任务；</p><ul><li>通过setAutoCommit(false)，关闭自动提交</li><li>通过select lock for update语句，其他事务无法获取到锁，显示排她锁。</li><li>进行定时调度任务的逻辑（这部分代码省略，在下面进行分析）</li><li>最后在finally块中commit()提交事务，并且setAutoCommit，释放for update的排他锁。</li></ul><p>上面代码，我们忽略了处理定时任务的细节，这里我们补上，看看xxl-job是怎么处理任务的。</p><div class="language-JobScheduleHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobScheduleHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobScheduleHelper {</span></span>
<span class="line"><span>  public void start() {</span></span>
<span class="line"><span>    ....</span></span>
<span class="line"><span>    if (scheduleList!=null &amp;&amp; scheduleList.size()&gt;0) {</span></span>
<span class="line"><span>    // 2、push time-ring</span></span>
<span class="line"><span>      for (XxlJobInfo jobInfo: scheduleList) {</span></span>
<span class="line"><span>        // time-ring jump</span></span>
<span class="line"><span>        // 当前时间超过触发时间5秒后</span></span>
<span class="line"><span>        if (nowTime &gt; jobInfo.getTriggerNextTime() + PRE_READ_MS) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // 2.1、trigger-expire &gt; 5s：pass &amp;&amp; make next-trigger-time</span></span>
<span class="line"><span>          logger.warn(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, schedule misfire, jobId = &quot; + jobInfo.getId());</span></span>
<span class="line"><span>          // 1、misfire match</span></span>
<span class="line"><span>          // - 调度过期策略：</span></span>
<span class="line"><span>          // - 忽略：调度过期后，忽略过期的任务，从当前时间开始重新计算下次触发时间； DO_NOTHING</span></span>
<span class="line"><span>          // - 立即执行一次：调度过期后，立即执行一次，并从当前时间开始重新计算下次触发时间；FIRE_ONCE_NOW</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          MisfireStrategyEnum misfireStrategyEnum = MisfireStrategyEnum.match(jobInfo.getMisfireStrategy(), MisfireStrategyEnum.DO_NOTHING);</span></span>
<span class="line"><span>          if (MisfireStrategyEnum.FIRE_ONCE_NOW == misfireStrategyEnum) {</span></span>
<span class="line"><span>            // FIRE_ONCE_NOW 》 trigger</span></span>
<span class="line"><span>            JobTriggerPoolHelper.trigger(jobInfo.getId(), TriggerTypeEnum.MISFIRE, -1, null, null, null);</span></span>
<span class="line"><span>            logger.debug(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, schedule push trigger : jobId = &quot; + jobInfo.getId() );</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // 2、fresh next</span></span>
<span class="line"><span>          // 更新下次执行时间</span></span>
<span class="line"><span>          refreshNextValidTime(jobInfo, new Date());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        } else if (nowTime &gt; jobInfo.getTriggerNextTime()) {</span></span>
<span class="line"><span>          // 当前时间大于了下次执行时间，并且小于下次执行时间+5s，说明肯定要执行这个业务逻辑了</span></span>
<span class="line"><span>          // 2.2、trigger-expire &lt; 5s：direct-trigger &amp;&amp; make next-trigger-time</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          // 1、开始发执行路由规则定位到具体的节点执行</span></span>
<span class="line"><span>          JobTriggerPoolHelper.trigger(jobInfo.getId(), TriggerTypeEnum.CRON, -1, null, null, null);</span></span>
<span class="line"><span>          logger.debug(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, schedule push trigger : jobId = &quot; + jobInfo.getId() );</span></span>
<span class="line"><span>          // 2、执行完之后刷新下次执行的时间</span></span>
<span class="line"><span>          refreshNextValidTime(jobInfo, new Date());</span></span>
<span class="line"><span>          // next-trigger-time in 5s, pre-read again</span></span>
<span class="line"><span>          if (jobInfo.getTriggerStatus()==1 &amp;&amp; nowTime + PRE_READ_MS &gt; jobInfo.getTriggerNextTime()) {</span></span>
<span class="line"><span>            // 1、make ring second</span></span>
<span class="line"><span>            int ringSecond = (int)((jobInfo.getTriggerNextTime()/1000)%60);</span></span>
<span class="line"><span>            // 2、push time ring</span></span>
<span class="line"><span>            pushTimeRing(ringSecond, jobInfo.getId());</span></span>
<span class="line"><span>            // 3、fresh next</span></span>
<span class="line"><span>            refreshNextValidTime(jobInfo, new Date(jobInfo.getTriggerNextTime()));</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>          // 2.3、trigger-pre-read：time-ring trigger &amp;&amp; make next-trigger-time</span></span>
<span class="line"><span>          // 未来五秒以内执行的所有任务添加到ringData</span></span>
<span class="line"><span>          int ringSecond = (int)((jobInfo.getTriggerNextTime()/1000)%60);</span></span>
<span class="line"><span>          // 2、push time ring</span></span>
<span class="line"><span>          pushTimeRing(ringSecond, jobInfo.getId());</span></span>
<span class="line"><span>          // 3、fresh next</span></span>
<span class="line"><span>          refreshNextValidTime(jobInfo, new Date(jobInfo.getTriggerNextTime()));</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 3、update trigger info</span></span>
<span class="line"><span>      for (XxlJobInfo jobInfo: scheduleList) {</span></span>
<span class="line"><span>        XxlJobAdminConfig.getAdminConfig().getXxlJobInfoDao().scheduleUpdate(jobInfo);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br></div></div><p>xxl_job_info表是记录定时任务的表，里面有个trigger_next_time（Long）字段，表示下一次任务被触发的时间，任务每被触发一次都要更新trigger_next_time字段，这样就知道任务何时被触发。定时任务的实现分成下面几步：</p><ul><li>从数据库中读取5秒内需要执行的任务，并遍历任务。</li><li>如果当前时间超过下一次触发时间5秒，获取此时调度任务已经过期的调度策略的配置，默认是什么也做策略。如果配置是立即执行一次策略，那么就立即触发定时任务，否则什么也不做。最后更新下一次触发时间。</li><li>如果当前时间超过下一次触发时间，但并没有超过5秒，立即触发一次任务，然后更新下一次触发时间。如果任务正在运行并且更新以后的触发时间在当前时间5秒内，将任务放进时间轮，然后再次更新下一次触发时间。因为触发时间太短了所以就放进时间轮中，供下一次触发。</li><li>如果不是上面的两种情况，则计算时间轮，将任务放进时间轮中，最后更新下一次触发时间。</li><li>更新调度任务信息保存到数据库中，更新trigger_next_time字段。</li></ul><p>最后我们总结一下scheduleThread的代码流程。</p><p><img src="`+l+'" alt="scheduleThread"></p><h2 id="ringthread" tabindex="-1">ringThread <a class="header-anchor" href="#ringthread" aria-label="Permalink to &quot;ringThread&quot;">​</a></h2><p>在了解ringThread之前，大家有必要了解一下时间轮算法，如果想对时间轮算法不熟悉的话，可以点击<a href="https://www.bilibili.com/video/BV1ry4y1k7E6/?spm_id_from=333.337.search-card.all.click&amp;vd_source=a9e3a92001a310c0b5dad25cc5899f99" target="_blank" rel="noreferrer">此处</a>查看。</p><img src="'+i+`" width="600" alt="timer-wheel"><p>这里简单地讲一下xxl-job的时间轮算法，xxl-job使用了一个Map维护了一个分钟级别的时间轮，共有60个桶，然后每隔1秒钟前进一个刻度，并且取出该刻度的任务来处理。</p><div class="language-JobScheduleHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobScheduleHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class JobScheduleHelper {</span></span>
<span class="line"><span>  private volatile static Map&lt;Integer, List&lt;Integer&gt;&gt; ringData = new ConcurrentHashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void start() {</span></span>
<span class="line"><span>    scheduleThread = new Thread(new Runnable() {</span></span>
<span class="line"><span>      public void run() {</span></span>
<span class="line"><span>        ...</span></span>
<span class="line"><span>        // 1、make ring second</span></span>
<span class="line"><span>        int ringSecond = (int)((jobInfo.getTriggerNextTime()/1000)%60);</span></span>
<span class="line"><span>        // 2、push time ring</span></span>
<span class="line"><span>        pushTimeRing(ringSecond, jobInfo.getId());</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    })</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>可以看到scheduleThread在处理当前时间大于下次触发时间的时候，是直接放入ringData当中的，而放入ringData的key就是获取任务下次触发的时间对60取余。</p><p>我们看看ringThread的处理逻辑，代码如下:</p><div class="language-JobScheduleHelper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JobScheduleHelper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ringThread = new Thread(new Runnable() {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void run() {</span></span>
<span class="line"><span>    while (!ringThreadToStop) {</span></span>
<span class="line"><span>      // align second, 在每个整秒执行</span></span>
<span class="line"><span>      TimeUnit.MILLISECONDS.sleep(1000 - System.currentTimeMillis() % 1000);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        // second data</span></span>
<span class="line"><span>        List&lt;Integer&gt; ringItemData = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>        // 避免处理耗时太长，跨过刻度，向前校验一个刻度；</span></span>
<span class="line"><span>        // 获取当前的秒数</span></span>
<span class="line"><span>        int nowSecond = Calendar.getInstance().get(Calendar.SECOND);   </span></span>
<span class="line"><span>        // 取两个刻度</span></span>
<span class="line"><span>        for (int i = 0; i &lt; 2; i++) {</span></span>
<span class="line"><span>          List&lt;Integer&gt; tmpData = ringData.remove( (nowSecond+60-i)%60 );</span></span>
<span class="line"><span>          if (tmpData != null) {</span></span>
<span class="line"><span>            ringItemData.addAll(tmpData);</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // ring trigger</span></span>
<span class="line"><span>        logger.debug(&quot;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt;&gt; xxl-job, time-ring beat : &quot; + nowSecond + &quot; = &quot; + Arrays.asList(ringItemData) );</span></span>
<span class="line"><span>        if (ringItemData.size() &gt; 0) {</span></span>
<span class="line"><span>          // do trigger</span></span>
<span class="line"><span>          for (int jobId: ringItemData) {</span></span>
<span class="line"><span>            // do trigger，执行定时任务</span></span>
<span class="line"><span>            JobTriggerPoolHelper.trigger(jobId, TriggerTypeEnum.CRON, -1, null, null, null);</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>          // clear</span></span>
<span class="line"><span>          ringItemData.clear();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>});</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br></div></div><p>这块代码很好理解，ringThread线程的run方法首先获取当前的时间（秒数），然后从时间轮内移出当前秒数前2个秒数的任务列表，遍历任务列表触发任务的执行，最后清空已经执行的任务列表。这里获取当前秒数前2个秒数的任务列表是因为避免处理时间太长导致错失了调度。</p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>如果ringThread线程被阻塞了很长时间，导致每次执行的时间超过了2秒，那么有可能会丢任务，还好的就是这是一个循环的时间轮，1min后可以再次被扫描到执行。</p></div><p>在上面的代码中，有一个很重要的方法，就是触发执行器处理定时任务，代码如下，下个章节我们分析这个方法的执行逻辑。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>JobTriggerPoolHelper.trigger();</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div>`,27)]))}const h=s(r,[["render",c]]);export{d as __pageData,h as default};
