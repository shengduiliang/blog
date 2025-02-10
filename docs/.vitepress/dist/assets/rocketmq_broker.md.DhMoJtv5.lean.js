import{_ as s,c as a,a0 as r,o as e}from"./chunks/framework.P9qPzDnn.js";const l="/assets/broker-dir.DCuvjLHq.png",m=JSON.parse('{"title":"Broker启动流程","description":"","frontmatter":{},"headers":[],"relativePath":"rocketmq/broker.md","filePath":"rocketmq/broker.md"}'),p={name:"rocketmq/broker.md"};function o(t,n,i,c,b,u){return e(),a("div",null,n[0]||(n[0]=[r('<h1 id="broker启动流程" tabindex="-1">Broker启动流程 <a class="header-anchor" href="#broker启动流程" aria-label="Permalink to &quot;Broker启动流程&quot;">​</a></h1><p>从这节课开始，我们就进入Rocketmq的核心部分--Broker的讲解，这也是整个Rocketmq当中最复杂的一部份内容了，绝大部分消息队列的特性都在这个模块中, 我们先看目录结构。</p><img src="'+l+`" alt="broker-dir" width="400"><h2 id="入口代码分析" tabindex="-1">入口代码分析 <a class="header-anchor" href="#入口代码分析" aria-label="Permalink to &quot;入口代码分析&quot;">​</a></h2><p>Broker的启动类是BrokerStartup，我们直接看这个类的入口函数</p><div class="language-BrokerStartup vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">BrokerStartup</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class BrokerStartup {</span></span>
<span class="line"><span>  public static void main(String[] args) {</span></span>
<span class="line"><span>    start(createBrokerController(args));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static BrokerController createBrokerController(String[] args) {</span></span>
<span class="line"><span>    // 注册controller</span></span>
<span class="line"><span>    BrokerController controller = buildBrokerController(args);</span></span>
<span class="line"><span>    // 初始化controller</span></span>
<span class="line"><span>    boolean initResult = controller.initialize();</span></span>
<span class="line"><span>    // 注册shutdown hook</span></span>
<span class="line"><span>    Runtime.getRuntime().addShutdownHook(new Thread(buildShutdownHook(controller)));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static BrokerController start(BrokerController controller) {</span></span>
<span class="line"><span>    controller.start();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>启动流程跟之前分析的NameServer的启动流程有点类似</p><ul><li>解析Broker配置文件，创建BrokerController, 初始化BrokerController</li><li>启动BrokerController</li></ul><h2 id="解析" tabindex="-1">解析 <a class="header-anchor" href="#解析" aria-label="Permalink to &quot;解析&quot;">​</a></h2>`,9)]))}const k=s(p,[["render",o]]);export{m as __pageData,k as default};
