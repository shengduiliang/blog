import{_ as n,c as a,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const l="/assets/rocketmq-install.Be054VtE.png",r="/assets/rocketmq-dashboard.Cqwt4_k6.png",i="/assets/broker-ip.CbbumVVu.png",k=JSON.parse('{"title":"SpringBoot接入rocketmq","description":"","frontmatter":{},"headers":[],"relativePath":"rocketmq/spring-boot-rocketmq.md","filePath":"rocketmq/spring-boot-rocketmq.md"}'),c={name:"rocketmq/spring-boot-rocketmq.md"};function b(t,s,o,m,u,d){return e(),a("div",null,s[0]||(s[0]=[p('<h1 id="springboot接入rocketmq" tabindex="-1">SpringBoot接入rocketmq <a class="header-anchor" href="#springboot接入rocketmq" aria-label="Permalink to &quot;SpringBoot接入rocketmq&quot;">​</a></h1><h2 id="安装rocketmq" tabindex="-1">安装Rocketmq <a class="header-anchor" href="#安装rocketmq" aria-label="Permalink to &quot;安装Rocketmq&quot;">​</a></h2><p>rocketmq的安装步骤可以参照rocketmq的<a href="https://rocketmq.apache.org/zh/" target="_blank" rel="noreferrer">官网</a></p><p><img src="'+l+`" alt="rocketmq-install"></p><p>可以参照这部分文档，由于本人比较热衷于使用docker来部署，并且rocketmq里面包含namesrv，broker，proxy等组件，所以直接使用docker-compose来安装了。</p><p>如果不用rocketmq的dashboard控制台的话，可以直接拷贝官网的docker-compose文件来安装。如果要使用dashboard的话，可以参照下面的docker-compose文件。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>version: &#39;3.8&#39;</span></span>
<span class="line"><span>services:</span></span>
<span class="line"><span>  namesrv:</span></span>
<span class="line"><span>    image: apache/rocketmq:5.3.1</span></span>
<span class="line"><span>    container_name: rmqnamesrv</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      - 9876:9876</span></span>
<span class="line"><span>    networks:</span></span>
<span class="line"><span>      - rocketmq</span></span>
<span class="line"><span>    command: sh mqnamesrv</span></span>
<span class="line"><span>  broker:</span></span>
<span class="line"><span>    image: apache/rocketmq:5.3.1</span></span>
<span class="line"><span>    container_name: rmqbroker</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      - 10909:10909</span></span>
<span class="line"><span>      - 10911:10911</span></span>
<span class="line"><span>      - 10912:10912</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      - NAMESRV_ADDR=rmqnamesrv:9876</span></span>
<span class="line"><span>    depends_on:</span></span>
<span class="line"><span>      - namesrv</span></span>
<span class="line"><span>    networks:</span></span>
<span class="line"><span>      - rocketmq</span></span>
<span class="line"><span>    command: sh mqbroker</span></span>
<span class="line"><span>  proxy:</span></span>
<span class="line"><span>    image: apache/rocketmq:5.3.1</span></span>
<span class="line"><span>    container_name: rmqproxy</span></span>
<span class="line"><span>    networks:</span></span>
<span class="line"><span>      - rocketmq</span></span>
<span class="line"><span>    depends_on:</span></span>
<span class="line"><span>      - broker</span></span>
<span class="line"><span>      - namesrv</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      - 8080:8080</span></span>
<span class="line"><span>      - 8081:8081</span></span>
<span class="line"><span>    restart: on-failure</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      - NAMESRV_ADDR=rmqnamesrv:9876</span></span>
<span class="line"><span>    command: sh mqproxy</span></span>
<span class="line"><span>  dashboard:</span></span>
<span class="line"><span>    image: apacherocketmq/rocketmq-dashboard:latest</span></span>
<span class="line"><span>    container_name: rmqdashboard</span></span>
<span class="line"><span>    networks:</span></span>
<span class="line"><span>      - rocketmq</span></span>
<span class="line"><span>    depends_on:</span></span>
<span class="line"><span>      - broker</span></span>
<span class="line"><span>      - namesrv</span></span>
<span class="line"><span>      - proxy</span></span>
<span class="line"><span>    restart: on-failure</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      - JAVA_OPTS=-Drocketmq.namesrv.addr=rmqnamesrv:9876</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      - 8082:8080</span></span>
<span class="line"><span>networks:</span></span>
<span class="line"><span>  rocketmq:</span></span>
<span class="line"><span>    driver: bridge</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br></div></div><p>执行docker-compose up -d启动即可。访问<a href="http://192.168.233.132:8082/" target="_blank" rel="noreferrer">rocketmq控制台</a>。</p><p><img src="`+r+'" alt="rocketmq-dashboard"></p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>官方没有提供ARM系统的docker镜像, 需要自己构建。</p></div><h3 id="问题修复" tabindex="-1">问题修复 <a class="header-anchor" href="#问题修复" aria-label="Permalink to &quot;问题修复&quot;">​</a></h3><p><strong>springboot客户端访问broker失败</strong></p><p>如果rocketmq的客户端跟broker是同一个局域网的话，上面的配置就可以了。但是如果不是同一个局域网的话，访问broker会报错，因为客户端通过namesrv获取到的broker ip是docker-compose里面的局域网ip，会访问失败。</p><p>查看rocketmq的源码，里面broker的ip地址配置字段有两个，如下所示:</p><p><img src="'+i+`" alt="broker-ip"></p><ul><li>brokerIP1：broker对外提供服务的IP地址，即生产者和消费者访问broker的地址</li><li>brokerIP2: broker向namesrv注册时的IP地址，用于namesrv和broker通信</li></ul><p>所以只要将brokerIP1设置为外网可以访问的地址即可。</p><p>如果需要改动这两个地址，只能通过配置文件来配置，所以docker-compose要做数据卷映射。创建broker.conf文件，然后启动的时候指定这个文件即可。docker-compose里面文件改动的部份如下所示：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>version: &#39;3.8&#39;</span></span>
<span class="line"><span>services:</span></span>
<span class="line"><span>  broker:</span></span>
<span class="line"><span>    image: apache/rocketmq:5.3.1</span></span>
<span class="line"><span>    container_name: rmqbroker</span></span>
<span class="line"><span>    ports:</span></span>
<span class="line"><span>      - 10909:10909</span></span>
<span class="line"><span>      - 10911:10911</span></span>
<span class="line"><span>      - 10912:10912</span></span>
<span class="line"><span>    # 映射文件</span></span>
<span class="line"><span>    volumes: </span></span>
<span class="line"><span>      - ./broker/conf/broker.conf:/opt/rocketmq/conf/broker.conf</span></span>
<span class="line"><span>    environment:</span></span>
<span class="line"><span>      - NAMESRV_ADDR=rmqnamesrv:9876</span></span>
<span class="line"><span>    depends_on:</span></span>
<span class="line"><span>      - namesrv</span></span>
<span class="line"><span>    networks:</span></span>
<span class="line"><span>      - rocketmq</span></span>
<span class="line"><span>    # 启动命令</span></span>
<span class="line"><span>    command: sh mqbroker -c /opt/rocketmq/conf/broker.conf</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>在当前目录下创建了./broker/conf/broker.conf这个文件，具体的配置如下所示：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>brokerClusterName = DefaultCluster</span></span>
<span class="line"><span>brokerName = broker-a</span></span>
<span class="line"><span>brokerId = 0</span></span>
<span class="line"><span>deleteWhen = 04</span></span>
<span class="line"><span>fileReservedTime = 48</span></span>
<span class="line"><span>brokerRole = ASYNC_MASTER</span></span>
<span class="line"><span>flushDiskType = ASYNC_FLUSH</span></span>
<span class="line"><span># 配置brokerIP1, 改成docker主机的IP</span></span>
<span class="line"><span>brokerIP1=106.52.101.174</span></span>
<span class="line"><span>#brokerIP2=106.52.101.174</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>重新启动docker-compose up -d即可。</p><h2 id="springboot接入rocketmq-1" tabindex="-1">springboot接入rocketmq <a class="header-anchor" href="#springboot接入rocketmq-1" aria-label="Permalink to &quot;springboot接入rocketmq&quot;">​</a></h2><p>springboot中引入rocketmq，只需要以下四步</p><h3 id="引入rocketmq依赖" tabindex="-1">引入rocketmq依赖 <a class="header-anchor" href="#引入rocketmq依赖" aria-label="Permalink to &quot;引入rocketmq依赖&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;!-- https://mvnrepository.com/artifact/org.apache.rocketmq/rocketmq-spring-boot-starter --&gt;</span></span>
<span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>    &lt;groupId&gt;org.apache.rocketmq&lt;/groupId&gt;</span></span>
<span class="line"><span>    &lt;artifactId&gt;rocketmq-spring-boot-starter&lt;/artifactId&gt;</span></span>
<span class="line"><span>    &lt;version&gt;xxxx&lt;/version&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><h3 id="添加rocketmq的配置" tabindex="-1">添加rocketmq的配置 <a class="header-anchor" href="#添加rocketmq的配置" aria-label="Permalink to &quot;添加rocketmq的配置&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>rocketmq:</span></span>
<span class="line"><span>    consumer:</span></span>
<span class="line"><span>        group: springboot_consumer_group</span></span>
<span class="line"><span>        # 一次拉取消息最大值，注意是拉取消息的最大值而非消费最大值</span></span>
<span class="line"><span>        pull-batch-size: 10</span></span>
<span class="line"><span>    name-server: 10.5.103.6:9876</span></span>
<span class="line"><span>    producer:</span></span>
<span class="line"><span>        # 发送同一类消息的设置为同一个group，保证唯一</span></span>
<span class="line"><span>        group: springboot_producer_group</span></span>
<span class="line"><span>        # 发送消息超时时间，默认3000</span></span>
<span class="line"><span>        sendMessageTimeout: 10000</span></span>
<span class="line"><span>        # 发送消息失败重试次数，默认2</span></span>
<span class="line"><span>        retryTimesWhenSendFailed: 2</span></span>
<span class="line"><span>        # 异步消息重试此处，默认2</span></span>
<span class="line"><span>        retryTimesWhenSendAsyncFailed: 2</span></span>
<span class="line"><span>        # 消息最大长度，默认1024 * 1024 * 4(默认4M)</span></span>
<span class="line"><span>        maxMessageSize: 4096</span></span>
<span class="line"><span>        # 压缩消息阈值，默认4k(1024 * 4)</span></span>
<span class="line"><span>        compressMessageBodyThreshold: 4096</span></span>
<span class="line"><span>        # 是否在内部发送失败时重试另一个broker，默认false</span></span>
<span class="line"><span>        retryNextServer: false</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><h3 id="发送消息" tabindex="-1">发送消息 <a class="header-anchor" href="#发送消息" aria-label="Permalink to &quot;发送消息&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@RestController</span></span>
<span class="line"><span>public class NormalProduceController {</span></span>
<span class="line"><span>  @Setter(onMethod_ = @Autowired)</span></span>
<span class="line"><span>  private RocketMQTemplate rocketmqTemplate;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @GetMapping(&quot;/test&quot;)</span></span>
<span class="line"><span>  public SendResult test() {</span></span>
<span class="line"><span>    Message&lt;String&gt; msg = MessageBuilder.withPayload(&quot;Hello,RocketMQ&quot;).build();</span></span>
<span class="line"><span>    SendResult sendResult = rocketmqTemplate.send(topic, msg);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h3 id="消费消息" tabindex="-1">消费消息 <a class="header-anchor" href="#消费消息" aria-label="Permalink to &quot;消费消息&quot;">​</a></h3><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Component</span></span>
<span class="line"><span>@RocketMQMessageListener(topic = &quot;your_topic_name&quot;, consumerGroup = &quot;your_consumer_group_name&quot;)</span></span>
<span class="line"><span>public class MyConsumer implements RocketMQListener&lt;String&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void onMessage(String message) {</span></span>
<span class="line"><span>    // 处理消息的逻辑</span></span>
<span class="line"><span>    System.out.println(&quot;Received message: &quot; + message);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>可以参照这篇文档：<a href="https://www.cnblogs.com/jianzh5/p/17301690.html" target="_blank" rel="noreferrer">https://www.cnblogs.com/jianzh5/p/17301690.html</a></p><h2 id="docker构建arm版本rocketmq" tabindex="-1">Docker构建ARM版本RocketMQ <a class="header-anchor" href="#docker构建arm版本rocketmq" aria-label="Permalink to &quot;Docker构建ARM版本RocketMQ&quot;">​</a></h2><p>由于本人用的是M4芯片ARM系统的MAC，没法使用官方提供的镜像，所以只能自己构建rocketmq的镜像了，比较令人欣慰的是，github上提供了rocketmq的构建Dockerfile, 需要的话可以点击<a href="https://github.com/apache/rocketmq-docker" target="_blank" rel="noreferrer">此处</a>, 首先克隆仓库下来，这里使用加速代理</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>git clone https://mirror.ghproxy.com/https://github.com/apache/rocketmq-docker.git</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>进入image-build目录，由于本人是在ubuntu上使用rocketmq的，所以使用Dockerfile-ubuntu这个Dockerfile，由于rocketmq最新的版本是5.3.1, 所以直接执行下面的指令即可。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>sh build-image.sh 5.3.1 ubuntu</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>注意，由于是国内环境，有些依赖会下不下来，由于我的电脑是可以访问外网的，所以直接配置代理为本机的IP, 修改了build-image.sh, 大家可以参考一下</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ubuntu@ubuntu:~/rocketmq/rocketmq-docker/image-build$ git diff build-image.sh</span></span>
<span class="line"><span>diff --git a/image-build/build-image.sh b/image-build/build-image.sh</span></span>
<span class="line"><span>index 57cac71..10ead7b 100755</span></span>
<span class="line"><span>--- a/image-build/build-image.sh</span></span>
<span class="line"><span>+++ b/image-build/build-image.sh</span></span>
<span class="line"><span>@@ -39,10 +39,10 @@ checkVersion $ROCKETMQ_VERSION</span></span>
<span class="line"><span> # Build rocketmq</span></span>
<span class="line"><span> case &quot;\${BASE_IMAGE}&quot; in</span></span>
<span class="line"><span>     alpine)</span></span>
<span class="line"><span>-        docker build --no-cache -f Dockerfile-alpine -t apache/rocketmq:\${ROCKETMQ_VERSION}-alpine --build-arg version=\${ROCKETMQ_VERSION} .</span></span>
<span class="line"><span>+        docker build --no-cache -f Dockerfile-alpine -t shengduiliang/rocketmq:\${ROCKETMQ_VERSION}-alpine --build-arg version=\${ROCKETMQ_VERSION} .</span></span>
<span class="line"><span>     ;;</span></span>
<span class="line"><span>     ubuntu)</span></span>
<span class="line"><span>-        docker build --no-cache -f Dockerfile-ubuntu -t apache/rocketmq:\${ROCKETMQ_VERSION} --build-arg version=\${ROCKETMQ_VERSION} .</span></span>
<span class="line"><span>+        docker build --no-cache -f Dockerfile-ubuntu -t shengduiliang/rocketmq:\${ROCKETMQ_VERSION} --build-arg version=\${ROCKETMQ_VERSION}  --build-arg http_proxy=http://192.168.233.132:7890 --build-arg https_proxy=http://192.168.233.132:7890 .</span></span>
<span class="line"><span>     ;;</span></span>
<span class="line"><span>     *)</span></span>
<span class="line"><span>         echo &quot;\${BASE_IMAGE} is not supported, supported base images: ubuntu, alpine&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>这里还改了构建之后的镜像名字，因为要上传到docker hub仓库。如果大家不愿意自己构建的话，可以<a href="https://hub.docker.com/r/shengduiliang/rocketmq" target="_blank" rel="noreferrer">点击</a>此处下载镜像。</p><p>rocketmq-dashboard的构建会麻烦一些，因为centos7已经不维护了，刚开始报镜像找不到，换了一个镜像仓库还是不行，看了一下Dockerfile，还好提供了ubuntu的构建，修改如下:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ubuntu@ubuntu:~/rocketmq/rocketmq-docker/image-build$ git diff build-image-dashboard.sh Dockerfile-centos-dashboard</span></span>
<span class="line"><span>diff --git a/image-build/Dockerfile-centos-dashboard b/image-build/Dockerfile-centos-dashboard</span></span>
<span class="line"><span>index 492809e..a42acf3 100644</span></span>
<span class="line"><span>--- a/image-build/Dockerfile-centos-dashboard</span></span>
<span class="line"><span>+++ b/image-build/Dockerfile-centos-dashboard</span></span>
<span class="line"><span>@@ -15,15 +15,18 @@</span></span>
<span class="line"><span> # limitations under the License.</span></span>
<span class="line"><span> #</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>-FROM centos:7</span></span>
<span class="line"><span>+# FROM centos:7</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>-RUN yum install -y java-1.8.0-openjdk-devel.x86_64 unzip openssl, which gnupg, wget \\</span></span>
<span class="line"><span>- &amp;&amp; yum clean all -y</span></span>
<span class="line"><span>+# RUN sed -i &#39;s/mirrorlist/#mirrorlist/g&#39; /etc/yum.repos.d/CentOS-*</span></span>
<span class="line"><span>+# RUN sed -i &#39;s|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g&#39; /etc/yum.repos.d/CentOS-*</span></span>
<span class="line"><span> </span></span>
<span class="line"><span>-# FROM openjdk:8-jdk</span></span>
<span class="line"><span>-# RUN apt-get update &amp;&amp; apt-get install -y --no-install-recommends \\</span></span>
<span class="line"><span>-#  bash libapr1 unzip telnet wget gnupg ca-certificates \\</span></span>
<span class="line"><span>-# &amp;&amp; rm -rf /var/lib/apt/lists/*</span></span>
<span class="line"><span>+# RUN yum install -y java-1.8.0-openjdk-devel.x86_64 unzip openssl, which gnupg, wget \\</span></span>
<span class="line"><span>+# &amp;&amp; yum clean all -y</span></span>
<span class="line"><span>+</span></span>
<span class="line"><span>+FROM openjdk:8-jdk</span></span>
<span class="line"><span>+RUN apt-get update &amp;&amp; apt-get install -y --no-install-recommends \\</span></span>
<span class="line"><span>+    bash libapr1 unzip telnet wget gnupg ca-certificates \\</span></span>
<span class="line"><span>+    &amp;&amp; rm -rf /var/lib/apt/lists/*</span></span>
<span class="line"><span> </span></span>
<span class="line"><span> ARG user=rocketmq</span></span>
<span class="line"><span> ARG group=rocketmq</span></span>
<span class="line"><span>@@ -40,7 +43,7 @@ ARG version</span></span>
<span class="line"><span> </span></span>
<span class="line"><span> # install maven 3.6.3</span></span>
<span class="line"><span> ARG MAVEN_VERSION=3.6.3</span></span>
<span class="line"><span>-ARG MAVEN_DOWNLOAD_URL=https://dlcdn.apache.org/maven/maven-3/\${MAVEN_VERSION}/binaries/apache-maven-\${MAVEN_VERSION}-bin.tar.gz</span></span>
<span class="line"><span>+ARG MAVEN_DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/\${MAVEN_VERSION}/apache-maven-\${MAVEN_VERSION}-bin.tar.gz</span></span>
<span class="line"><span> </span></span>
<span class="line"><span> RUN mkdir -p /usr/share/maven /usr/share/maven/ref &amp;&amp; \\</span></span>
<span class="line"><span>     wget -O /tmp/apache-maven.tar.gz \${MAVEN_DOWNLOAD_URL} --no-check-certificate &amp;&amp; \\</span></span>
<span class="line"><span>@@ -87,7 +90,8 @@ RUN mkdir bin; \\</span></span>
<span class="line"><span>     </span></span>
<span class="line"><span> RUN rm -rf /root/.m2/repository/*</span></span>
<span class="line"><span> RUN rm -rf /usr/share/maven</span></span>
<span class="line"><span>-RUN yum remove wget unzip openssl -y</span></span>
<span class="line"><span>+# RUN yum remove wget unzip openssl -y</span></span>
<span class="line"><span>+RUN apt-get remove wget unzip ca-certificates</span></span>
<span class="line"><span> </span></span>
<span class="line"><span> RUN chown -R \${uid}:\${gid} \${ROCKETMQ_DASHBOARD_HOME}</span></span>
<span class="line"><span> EXPOSE 8080</span></span>
<span class="line"><span>diff --git a/image-build/build-image-dashboard.sh b/image-build/build-image-dashboard.sh</span></span>
<span class="line"><span>old mode 100644</span></span>
<span class="line"><span>new mode 100755</span></span>
<span class="line"><span>index 22339c4..be1eb48</span></span>
<span class="line"><span>--- a/image-build/build-image-dashboard.sh</span></span>
<span class="line"><span>+++ b/image-build/build-image-dashboard.sh</span></span>
<span class="line"><span>@@ -39,7 +39,7 @@ checkVersion $ROCKETMQ_DASHBOARD_VERSION</span></span>
<span class="line"><span> # Build rocketmq</span></span>
<span class="line"><span> case &quot;\${BASE_IMAGE}&quot; in</span></span>
<span class="line"><span>     centos)</span></span>
<span class="line"><span>-        docker build --no-cache -f Dockerfile-centos-dashboard -t apache/rocketmq-dashboard:\${ROCKETMQ_DASHBOARD_VERSION}-centos --build-arg version=\${ROCKETMQ_DASHBOARD_VERSION} .</span></span>
<span class="line"><span>+        docker build --no-cache -f Dockerfile-centos-dashboard -t apache/rocketmq-dashboard:\${ROCKETMQ_DASHBOARD_VERSION}-centos --build-arg version=\${ROCKETMQ_DASHBOARD_VERSION}  --build-arg http_proxy=http://</span></span>
<span class="line"><span>192.168.233.132:7890 --build-arg https_proxy=http://192.168.233.132:7890 .</span></span>
<span class="line"><span>     ;;</span></span>
<span class="line"><span>     *)</span></span>
<span class="line"><span>         echo &quot;\${BASE_IMAGE} is not supported, supported base images: centos&quot;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br></div></div><p>注意，build-image-dashboard.sh里面的代理IP如果不是用这个要修改。这个镜像一样放到了<a href="https://hub.docker.com/repository/docker/shengduiliang/rocketmq-dashboard/general" target="_blank" rel="noreferrer">Dockerhub仓库</a></p>`,44)]))}const g=n(c,[["render",b]]);export{k as __pageData,g as default};
