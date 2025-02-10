import{_ as s}from"./chunks/multi-process.z1xDw6ff.js";import{_ as a,c as p,a0 as e,o as l}from"./chunks/framework.P9qPzDnn.js";const i="/assets/reactor.CfNC6Dna.png",r="/assets/%E5%8D%95%E7%BA%BF%E7%A8%8B%E6%A8%A1%E5%9E%8B.D1OjOIXX.png",v=JSON.parse('{"title":"I/O多线程网络驱动模型","description":"","frontmatter":{},"headers":[],"relativePath":"redis/main.md","filePath":"redis/main.md"}'),c={name:"redis/main.md"};function t(b,n,d,o,u,m){return l(),p("div",null,n[0]||(n[0]=[e(`<h1 id="i-o多线程网络驱动模型" tabindex="-1">I/O多线程网络驱动模型 <a class="header-anchor" href="#i-o多线程网络驱动模型" aria-label="Permalink to &quot;I/O多线程网络驱动模型&quot;">​</a></h1><p>本系列文章从Redis的多线程驱动模型讲起，顺便讲解一下Redis是怎么处理客户端发过来的请求的，这样在后续讲解Redis的其他部份的源码实现会容易理解一些。</p><h2 id="redis网络i-o模型" tabindex="-1">Redis网络I/O模型 <a class="header-anchor" href="#redis网络i-o模型" aria-label="Permalink to &quot;Redis网络I/O模型&quot;">​</a></h2><p>常用的SELECT/POLL/EPOLL模型的介绍，网上的资料已经讲烂了，这里就不过多介绍了，有需要的朋友可以点击<a href="https://www.cnblogs.com/jtea/p/16969386.html" target="_blank" rel="noreferrer">这个</a>查看。由于我们是开发程序员，所以这里总结一下这几种IO模型的区别。</p><table tabindex="0"><thead><tr><th></th><th>select</th><th>poll</th><th>epoll</th></tr></thead><tbody><tr><td>性能</td><td>高并发连接数时性能很差</td><td>高并发连接数时性能很差</td><td>性能基本没有变化</td></tr><tr><td>连接数</td><td>一般1024</td><td>无限制</td><td>无限制</td></tr><tr><td>数据结构</td><td>bitmap</td><td>数组</td><td>红黑树</td></tr><tr><td>内在处理机制</td><td>线性轮询</td><td>线性轮询</td><td>直接遍历事件</td></tr><tr><td>时间复杂度</td><td>O(n)</td><td>O(n)</td><td>O(1)</td></tr></tbody></table><p>Redis支持网络I/O模型有以下几种</p><ul><li>evport: 用于 Solaris 操作系统上的事件驱动I/O模型, 与select这些I/O多路复用的模型很想，能够高效地监控多个文件描述符的事件</li><li>kqueue: 用于 macOS/FreeBSD 操作系统上的事件驱动I/O模型</li><li>epoll: 用于 Linux 操作系统上的事件驱动I/O模型</li><li>select: 如果上面几种都不支持，会用select事件驱动I/O模型</li></ul><p>具体的代码如下所示：</p><div class="language-ae.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ae.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>#ifdef HAVE_EVPORT</span></span>
<span class="line"><span>#include &quot;ae_evport.c&quot;</span></span>
<span class="line"><span>#else</span></span>
<span class="line"><span>    #ifdef HAVE_EPOLL</span></span>
<span class="line"><span>    #include &quot;ae_epoll.c&quot;</span></span>
<span class="line"><span>    #else</span></span>
<span class="line"><span>        #ifdef HAVE_KQUEUE</span></span>
<span class="line"><span>        #include &quot;ae_kqueue.c&quot;</span></span>
<span class="line"><span>#include &quot;server.h&quot;</span></span>
<span class="line"><span>#else</span></span>
<span class="line"><span>        #include &quot;ae_select.c&quot;</span></span>
<span class="line"><span>        #endif</span></span>
<span class="line"><span>    #endif</span></span>
<span class="line"><span>#endif</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>由于常用的还是epoll模型，所以这里简单地介绍一下epoll的几个API，具体Epoll的使用可以查看<a href="https://blog.csdn.net/fantasyYXQ/article/details/132315574" target="_blank" rel="noreferrer">这个</a>.</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 等待监听的所有fd相应事件的产生</span></span>
<span class="line"><span>int epoll_wait(int epfd, struct epoll_event * events, int maxevents, int timeout); </span></span>
<span class="line"><span>// 注册特定文件描述符，将其添加到 epoll 实例的interest list中</span></span>
<span class="line"><span>int epoll_ctl(int epfd, int op, int fd, struct epoll_event *_Nullable event);</span></span>
<span class="line"><span>// 创建一个新的 epoll 实例，自 Linux 2.6.8 起，size 参数将被忽略，但必须大于 0</span></span>
<span class="line"><span>int epoll_create(int size);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><h2 id="reactor模型" tabindex="-1">Reactor模型 <a class="header-anchor" href="#reactor模型" aria-label="Permalink to &quot;Reactor模型&quot;">​</a></h2><p>Reactor模型是网络服务器用来处理高并发网络I/O请求的一种编程模型。</p><p><img src="`+i+`" alt="reactor"></p><p>首先我们来看一下客户端和服务端的交互过程中，不同类请求在服务器端引发的待处理事件：</p><ul><li>当一个客户端要和服务器端进行交互时，客户端会想服务器端发送连接请求，用来建立连接，这就对应了服务器端的一个<strong>连接事件</strong></li><li>一旦连接建立后，客户端会给服务器端发送读请求，以便读取数据。服务器端在处理读请求时，需要向客户端写回数据，这对应了服务器端的<strong>写事件</strong></li><li>无论客户端给服务器端发送读或写请求，服务器端都需要从客户端读取请求内容，这些读写请求的读取对应了服务器端的<strong>读事件</strong></li></ul><p>在Reactor模型中，主要由reactor/acceptor/handler三个关键角色来处理上面三种事件。</p><ul><li>连接事件由acceptor来处理，负责接收连接；acceptor接收完请求后，会创建handler，用于网络上对后续读写事件的处理</li><li>读写事件由handler处理</li><li>最后，在高并发场景下，连接事件，读写事件会同时发生，需要有一个角色专门监听和分配事件，这就是reactor要做的事。当有连接请求的时候，reactor将产生的连接事件交由acceptor处理；当有读写请求时，reactor将读写事件交由handler处理。</li></ul><h2 id="reactor模型实现" tabindex="-1">Reactor模型实现 <a class="header-anchor" href="#reactor模型实现" aria-label="Permalink to &quot;Reactor模型实现&quot;">​</a></h2><p>Redis的网络框架实现Reactor模型，并且自行开发实现了一个事件驱动框架，对应的代码实现是ae.c，对应的头文件是ae.h。</p><p>Redis为了实现事件驱动框架，响应的定义了事件的数据结构，框架主循环函数，事件捕获分发函数，事件和handler注册函数。</p><h3 id="aefileevent" tabindex="-1">aeFileEvent <a class="header-anchor" href="#aefileevent" aria-label="Permalink to &quot;aeFileEvent&quot;">​</a></h3><p>Redis事件驱动框架有两类事件: IO事件和时间事件，分别对应了客户端发送的网络请求和Redis自身的周期性操作。由于本篇介绍的是IO驱动模型，所以我们直接看IO事件的定义</p><div class="language-ae.h vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ae.h</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/* File event structure */</span></span>
<span class="line"><span>typedef struct aeFileEvent {</span></span>
<span class="line"><span>  // 事件类型源码，用来区分是什么事件</span></span>
<span class="line"><span>  int mask; /* one of AE_(READABLE|WRITABLE|BARRIER) */</span></span>
<span class="line"><span>  // AE_READABLE事件处理函数, 读事件处理函数</span></span>
<span class="line"><span>  aeFileProc *rfileProc;</span></span>
<span class="line"><span>  // AE_WRITABLE事件处理函数, 写事件处理函数</span></span>
<span class="line"><span>  aeFileProc *wfileProc;</span></span>
<span class="line"><span>  // 指向客户端私有数据的指针</span></span>
<span class="line"><span>  void *clientData;</span></span>
<span class="line"><span>} aeFileEvent;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>Redis在ae.h文件中，还定义了支撑款架运行的主要函数，包括框架主循环的aeMain函数，负责事件捕获与分发的aeProcessEvents函数，以及负责事件的handler注册的aeCreateFileEvent函数。</p><div class="language-ae.h vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ae.h</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int aeCreateFileEvent(aeEventLoop *eventLoop, int fd, int mask, aeFileProc *proc, void *clientData);</span></span>
<span class="line"><span>void aeMain(aeEventLoop *eventLoop);</span></span>
<span class="line"><span>int aeProcessEvents(aeEventLoop *eventLoop, int flags);</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h3 id="事件注册-aecreatefileevent函数" tabindex="-1">事件注册：aeCreateFileEvent函数 <a class="header-anchor" href="#事件注册-aecreatefileevent函数" aria-label="Permalink to &quot;事件注册：aeCreateFileEvent函数&quot;">​</a></h3><p>Redis启动后，服务器程序server.c的main函数调用initServer来初始化事件的监听，以及响应的事件处理函数。</p><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void initServer(void) {</span></span>
<span class="line"><span>  server.el = aeCreateEventLoop(server.maxclients+CONFIG_FDSET_INCR);</span></span>
<span class="line"><span>  listenToPort(server.port,&amp;server.ipfd);</span></span>
<span class="line"><span>  createSocketAcceptHandler(&amp;server.ipfd, acceptTcpHandler);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>看一下createSocketAcceptHandler的实现，代码如下:</p><div class="language-ae.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ae.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int createSocketAcceptHandler(socketFds *sfd, aeFileProc *accept_handler) {</span></span>
<span class="line"><span>  int j;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  for (j = 0; j &lt; sfd-&gt;count; j++) {</span></span>
<span class="line"><span>    // AE_READABLE就是客户端的连接事件, accept_handler就是用来处理TCP连接请求</span></span>
<span class="line"><span>    if (aeCreateFileEvent(server.el, sfd-&gt;fd[j], AE_READABLE, accept_handler,NULL) == AE_ERR) {</span></span>
<span class="line"><span>      /* Rollback */</span></span>
<span class="line"><span>      for (j = j-1; j &gt;= 0; j--) aeDeleteFileEvent(server.el, sfd-&gt;fd[j], AE_READABLE);</span></span>
<span class="line"><span>      return C_ERR;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return C_OK;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>可以看到是由aeCreateFileEvent来实现事件和处理函数的注册的，可以看一下具体的实现实现：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int aeCreateFileEvent(aeEventLoop *eventLoop, int fd, int mask,</span></span>
<span class="line"><span>        aeFileProc *proc, void *clientData)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  aeFileEvent *fe = &amp;eventLoop-&gt;events[fd];</span></span>
<span class="line"><span>  if (aeApiAddEvent(eventLoop, fd, mask) == -1)</span></span>
<span class="line"><span>      return AE_ERR;</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  if (mask &amp; AE_READABLE) fe-&gt;rfileProc = proc;</span></span>
<span class="line"><span>  if (mask &amp; AE_WRITABLE) fe-&gt;wfileProc = proc;</span></span>
<span class="line"><span>  fe-&gt;clientData = clientData;</span></span>
<span class="line"><span>  if (fd &gt; eventLoop-&gt;maxfd)</span></span>
<span class="line"><span>    eventLoop-&gt;maxfd = fd;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>可以看到调用aeApiAddEvent来注册事件，aeApiAddEvent调用的就是具体的实现接口，如果使用epoll，那么实现如下：</p><div class="language-ae_epoll.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ae_epoll.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>static int aeApiAddEvent(aeEventLoop *eventLoop, int fd, int mask) {</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  if (epoll_ctl(state-&gt;epfd,op,fd,&amp;ee) == -1) return -1;</span></span>
<span class="line"><span>  return 0;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>可以看到是通过epoll_ctl来注册监听的事件和响应的处理函数的。</p><h3 id="事件捕获与分发-aeprocessevents函数" tabindex="-1">事件捕获与分发：aeProcessEvents函数 <a class="header-anchor" href="#事件捕获与分发-aeprocessevents函数" aria-label="Permalink to &quot;事件捕获与分发：aeProcessEvents函数&quot;">​</a></h3><p>在server.c的main函数的最后，会调用aeMain函数开始执行事件驱动框架，我们看一下代码。</p><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void aeMain(aeEventLoop *eventLoop) {</span></span>
<span class="line"><span>  eventLoop-&gt;stop = 0;</span></span>
<span class="line"><span>  while (!eventLoop-&gt;stop) {</span></span>
<span class="line"><span>    // AE_ALL_EVENTS (AE_FILE_EVENTS|AE_TIME_EVENTS)</span></span>
<span class="line"><span>    aeProcessEvents(eventLoop, AE_ALL_EVENTS|</span></span>
<span class="line"><span>                                AE_CALL_BEFORE_SLEEP|</span></span>
<span class="line"><span>                                AE_CALL_AFTER_SLEEP);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>接下来我们进入aeProcessEvents函数看一下：</p><div class="language-ae.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ae.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int aeProcessEvents(aeEventLoop *eventLoop, int flags)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  // 若没有事件处理，则立即返回，根据传入的参数，不会返回0的</span></span>
<span class="line"><span>  if (!(flags &amp; AE_TIME_EVENTS) &amp;&amp; !(flags &amp; AE_FILE_EVENTS)) return 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  //如果有IO事件发生，或者紧急的时间时间发生，则开始处理</span></span>
<span class="line"><span>  if (eventLoop-&gt;maxfd != -1 || ((flags &amp; AE_TIME_EVENTS) &amp;&amp; !(flags &amp; AE_DONT_WAIT))) {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 查看是否有时间事件，如果，则调用processTimeEvents</span></span>
<span class="line"><span>  if (flags &amp; AE_TIME_EVENTS)</span></span>
<span class="line"><span>      processed += processTimeEvents(eventLoop);</span></span>
<span class="line"><span>  // 返回已经处理的文件或者事件</span></span>
<span class="line"><span>  return processed;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>我们主要关注第二个分支事件，有IO事件发生的场景，看代码。</p><div class="language-ae.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ae.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int aeProcessEvents(aeEventLoop *eventLoop, int flags) {</span></span>
<span class="line"><span>  //如果有IO事件发生，或者紧急的时间时间发生，则开始处理</span></span>
<span class="line"><span>  if (eventLoop-&gt;maxfd != -1 || ((flags &amp; AE_TIME_EVENTS) &amp;&amp; !(flags &amp; AE_DONT_WAIT))) {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    numevents = aeApiPoll(eventLoop, tvp);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    for (j = 0; j &lt; numevents; j++) {</span></span>
<span class="line"><span>      // 处理读事件</span></span>
<span class="line"><span>      if (!invert &amp;&amp; fe-&gt;mask &amp; mask &amp; AE_READABLE) {</span></span>
<span class="line"><span>        fe-&gt;rfileProc(eventLoop,fd,fe-&gt;clientData,mask);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      // 处理写事件</span></span>
<span class="line"><span>      if (fe-&gt;mask &amp; mask &amp; AE_WRITABLE) {</span></span>
<span class="line"><span>        fe-&gt;wfileProc(eventLoop,fd,fe-&gt;clientData,mask);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      /* 如果读写事件翻转, 处理读事件*/</span></span>
<span class="line"><span>      if (invert) {</span></span>
<span class="line"><span>        fe-&gt;rfileProc(eventLoop,fd,fe-&gt;clientData,mask);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>主要是通过aeApiPoll函数来捕获事件的，Redis是依赖于操作系统底层提供的IO多路复用机制，来捕获事件，检查是否有新的连接，读写事件发生。</p><p>这个代码的实现是Redis根据不同的操作系统进行了一层封装，由于我们讨论的是epoll，可以看一下epoll的实现</p><div class="language-ae_epoll.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ae_epoll.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>static int aeApiPoll(aeEventLoop *eventLoop, struct timeval *tvp) {</span></span>
<span class="line"><span>  aeApiState *state = eventLoop-&gt;apidata;</span></span>
<span class="line"><span>  int retval, numevents = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 调用epoll_wait获取监听到的事件</span></span>
<span class="line"><span>  retval = epoll_wait(state-&gt;epfd,state-&gt;events,eventLoop-&gt;setsize,</span></span>
<span class="line"><span>          tvp ? (tvp-&gt;tv_sec*1000 + (tvp-&gt;tv_usec + 999)/1000) : -1);</span></span>
<span class="line"><span>  if (retval &gt; 0) {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    numevents = retval;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return numevents;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>aeProcessEvents中我们可以看到调用aeApiPoll获取完事件之后，会遍历事件，进行响应的处理，对于AE_READABLE事件，执行fe-&gt;rfileProc; 对于AE_WRITABLE，执行fe-&gt;wfileProc。</p><p>我们回看createSocketAcceptHandler方法的执行，可以看到，对于新进来的请求，事件处理函数都是acceptTcpHandler。</p><h3 id="handler注册" tabindex="-1">Handler注册 <a class="header-anchor" href="#handler注册" aria-label="Permalink to &quot;Handler注册&quot;">​</a></h3><p>接下来我们看一下acceptTcpHandler的实现，代码如下所示：</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void acceptTcpHandler(aeEventLoop *el, int fd, void *privdata, int mask) {</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  while(max--) {</span></span>
<span class="line"><span>    // 调用accept来获取对应的链接</span></span>
<span class="line"><span>    cfd = anetTcpAccept(server.neterr, fd, cip, sizeof(cip), &amp;cport);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    acceptCommonHandler(connCreateAcceptedSocket(cfd),0,cip);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>anetTcpAccept底层是通过accept来接收连接的，这里不展开，我们看acceptCommonHandler函数</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>static void acceptCommonHandler(connection *conn, int flags, char *ip) {</span></span>
<span class="line"><span>  /*</span></span>
<span class="line"><span>    * 连接状态检查</span></span>
<span class="line"><span>    */</span></span>
<span class="line"><span>  if (connGetState(conn) != CONN_STATE_ACCEPTING) {</span></span>
<span class="line"><span>    return</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /*</span></span>
<span class="line"><span>  * 连接数限制检查，确保当前连接数和集群连接数只和不会超出最大连接数限制</span></span>
<span class="line"><span>  */</span></span>
<span class="line"><span>  if (listLength(server.clients) + getClusterConnectionsCount()</span></span>
<span class="line"><span>      &gt;= server.maxclients) {</span></span>
<span class="line"><span>    return</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  /* 新建一个连接 */</span></span>
<span class="line"><span>  if ((c = createClient(conn)) == NULL) {</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // conn-&gt;type-&gt;accept(conn, accept_handler)</span></span>
<span class="line"><span>  if (connAccept(conn, clientAcceptHandler) == C_ERR) {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><p>我们先看createClient方法，新建一个连接的, 代码如下。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>client *createClient(connection *conn) {</span></span>
<span class="line"><span>  if (conn) {</span></span>
<span class="line"><span>    connEnableTcpNoDelay(conn);</span></span>
<span class="line"><span>    if (server.tcpkeepalive)</span></span>
<span class="line"><span>        connKeepAlive(conn,server.tcpkeepalive);</span></span>
<span class="line"><span>    // conn-&gt;type-&gt;set_read_handler(conn, func)</span></span>
<span class="line"><span>    connSetReadHandler(conn, readQueryFromClient);</span></span>
<span class="line"><span>    connSetPrivateData(conn, c);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>可以看到connSetReadHandler是调用了conn-&gt;type-&gt;set_read_handler这个方法，我们看一下这个方法是在哪里赋值的。回看acceptTcpHandler方法里面的acceptCommonHandler的参数connCreateAcceptedSocket(cfd), 查看具体的代码实现</p><div class="language-connection.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">connection.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>connection *connCreateAcceptedSocket(int fd) {</span></span>
<span class="line"><span>  connection *conn = connCreateSocket();</span></span>
<span class="line"><span>  conn-&gt;fd = fd;</span></span>
<span class="line"><span>  conn-&gt;state = CONN_STATE_ACCEPTING;</span></span>
<span class="line"><span>  return conn;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>connection *connCreateSocket() {</span></span>
<span class="line"><span>  connection *conn = zcalloc(sizeof(connection));</span></span>
<span class="line"><span>  conn-&gt;type = &amp;CT_Socket;</span></span>
<span class="line"><span>  conn-&gt;fd = -1;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  return conn;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>可以看到conn-&gt;type指向了CT_Socket，查看CT_Socket的实现</p><div class="language-connection.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">connection.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ConnectionType CT_Socket = {</span></span>
<span class="line"><span>  .ae_handler = connSocketEventHandler,</span></span>
<span class="line"><span>  .set_read_handler = connSocketSetReadHandler,</span></span>
<span class="line"><span>};</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>可以看到是connSocketSetReadHandler，查看代码实现。</p><div class="language-connection.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">connection.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>static int connSocketSetReadHandler(connection *conn, ConnectionCallbackFunc func) {</span></span>
<span class="line"><span>  if (func == conn-&gt;read_handler) return C_OK;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  conn-&gt;read_handler = func;</span></span>
<span class="line"><span>  if (!conn-&gt;read_handler)</span></span>
<span class="line"><span>    aeDeleteFileEvent(server.el,conn-&gt;fd,AE_READABLE);</span></span>
<span class="line"><span>  else</span></span>
<span class="line"><span>    if (aeCreateFileEvent(server.el,conn-&gt;fd,</span></span>
<span class="line"><span>      AE_READABLE,conn-&gt;type-&gt;ae_handler,conn) == AE_ERR) return C_ERR;</span></span>
<span class="line"><span>  return C_OK;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>可以看到这里也是调用aeCreateFileEvent方法来注册事件的。所以在上面aeProcessEvents的循环捕获中也捕获这些请求的读写事件，并且调用对应的handler，而对于这些请求的handler，就是readQueryFromClient。</p><h2 id="多线程i-o模型" tabindex="-1">多线程I/O模型 <a class="header-anchor" href="#多线程i-o模型" aria-label="Permalink to &quot;多线程I/O模型&quot;">​</a></h2><p>接下来开始讲解Redis的请求执行流程。在redis6.0之前，redis使用的是单线程处理模型，也就是说请求的获取，解析，执行，内容返回等都是由一个顺序串行的主线程处理的。</p><p><img src="`+r+'" alt="单线程模型"></p><p>关于为什么redis6.0之前redis是单线程模型的，官方的解释如下：</p><ul><li>Redis的性能瓶颈主要在于内存和网络I/O，而不是CPU。</li><li>通过Pipeline，Redis每秒可以处理一百万个请求，应用程序使用的命令复杂度是O(n)或O(lgN)，不会占用太多CPU。</li><li>单线程模型代码可维护性比较高，不用考虑并行代码的不确定性，还有线程切换，加锁读写，死锁等造成的性能问题。</li></ul><p>但是随着底层网络硬件性能的提升，Redis的性能逐渐体现在网络I/O的读写上，单个线程处理网络读/写速度跟不上底层网络硬件执行的速度，主线程在网络读/写请求处理上花费的时间占比比较大，所有在redis6.0以后，redis采用多个I/O进程来处理网络请求，但是执行的时候还是由主线程来处理。</p><p><img src="'+s+`" alt="多线程模型"></p><h3 id="多线程开启" tabindex="-1">多线程开启 <a class="header-anchor" href="#多线程开启" aria-label="Permalink to &quot;多线程开启&quot;">​</a></h3><p>Redis的多线程模型默认是关闭的，如果要开启多线程模型，需要修改redis.conf配置文件中的配置，主要由两个</p><div class="language-redis.conf vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">redis.conf</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>io-threads 4 # IO线程数, 包含主线程</span></span>
<span class="line"><span>io-threads-do-reads yes # 开启IO多线程</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>好了，接下来我们从源码分析一下redis的多线程模型。首先我们来看一下多线程处理模型的第一步，将请求放到读请求队列中。</p><h3 id="请求接收" tabindex="-1">请求接收 <a class="header-anchor" href="#请求接收" aria-label="Permalink to &quot;请求接收&quot;">​</a></h3><p>在前面我们知道，客户端发过来的请求是在readQueryFromClient进行处理的，所以我们查看这个函数，这个函数非常核心且重要，我们先一步步来看。</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void readQueryFromClient(connection *conn) {</span></span>
<span class="line"><span>  if (postponeClientRead(c)) return;</span></span>
<span class="line"><span>  // 如果不走IO多线程，则直接处理</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>int postponeClientRead(client *c) {</span></span>
<span class="line"><span>  if (server.io_threads_active &amp;&amp;</span></span>
<span class="line"><span>    server.io_threads_do_reads &amp;&amp;</span></span>
<span class="line"><span>    !ProcessingEventsWhileBlocked &amp;&amp;</span></span>
<span class="line"><span>    !(c-&gt;flags &amp; (CLIENT_MASTER|CLIENT_SLAVE|CLIENT_BLOCKED)) &amp;&amp;</span></span>
<span class="line"><span>    io_threads_op == IO_THREADS_OP_IDLE)</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    listAddNodeHead(server.clients_pending_read,c);</span></span>
<span class="line"><span>    c-&gt;pending_read_list_node = listFirst(server.clients_pending_read);</span></span>
<span class="line"><span>    return 1;</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>      return 0;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>可以看到如果是多线程的话，会把请求直接放到读请求队列clients_pending_read中。这里看一下这几个判断条件</p><ul><li>server.io_threads_active: 是否启用了多线程，注意这个值是redis的内部值，不可以通过配置修改，当请求很多时会自动开启，看startThreadedIO函数。</li><li>server.io_threads_do_reads: redis.conf中的io-threads-do-reads值</li><li>!ProcessingEventsWhileBlocked: Redis没有在处理阻塞事件, 比如在处理BLOCK类型的命令</li><li>!(c-&gt;flags &amp; (CLIENT_MASTER|CLIENT_SLAVE|CLIENT_BLOCKED)): 客户端既不是主服务器，也不是从服务器，也没有处于阻塞状态。即，客户端处于正常的非阻塞状态</li><li>io_threads_op: IO_THREADS_OP_IDLE表示当前处于空闲状态</li></ul><h3 id="读请求分发" tabindex="-1">读请求分发 <a class="header-anchor" href="#读请求分发" aria-label="Permalink to &quot;读请求分发&quot;">​</a></h3><p>接下来看读请求分发流程，我们回到aeProcessEvents函数在处理读写事件的地方，代码具体如下:</p><div class="language-ae.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ae.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int aeProcessEvents(aeEventLoop *eventLoop, int flags) {</span></span>
<span class="line"><span>  if (eventLoop-&gt;beforesleep != NULL &amp;&amp; flags &amp; AE_CALL_BEFORE_SLEEP)</span></span>
<span class="line"><span>    eventLoop-&gt;beforesleep(eventLoop);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* Call the multiplexing API, will return only on timeout or when</span></span>
<span class="line"><span>  * some event fires. */</span></span>
<span class="line"><span>  numevents = aeApiPoll(eventLoop, tvp);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* After sleep callback. */</span></span>
<span class="line"><span>  if (eventLoop-&gt;aftersleep != NULL &amp;&amp; flags &amp; AE_CALL_AFTER_SLEEP)</span></span>
<span class="line"><span>    eventLoop-&gt;aftersleep(eventLoop);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>可以看到调用eventLoop-&gt;beforesleep方法，这个方法的注册在server.c的initServer方法里面</p><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void initServer(void) {</span></span>
<span class="line"><span>  /* Register before and after sleep handlers (note this needs to be done</span></span>
<span class="line"><span>  * before loading persistence since it is used by processEventsWhileBlocked. */</span></span>
<span class="line"><span>  aeSetBeforeSleepProc(server.el,beforeSleep);</span></span>
<span class="line"><span>  aeSetAfterSleepProc(server.el,afterSleep);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>查看beforeSleep方法，只看跟这节课相关的方法。</p><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void beforeSleep(struct aeEventLoop *eventLoop) {</span></span>
<span class="line"><span>  /* 在这处理读请求事件 */</span></span>
<span class="line"><span>  /* We should handle pending reads clients ASAP after event loop. */</span></span>
<span class="line"><span>  handleClientsWithPendingReadsUsingThreads();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 在这处理写请求事件 */</span></span>
<span class="line"><span>  /* Handle writes with pending output buffers. */</span></span>
<span class="line"><span>  handleClientsWithPendingWritesUsingThreads();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>先看handleClientsWithPendingReadsUsingThreads，进入这个方法。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int handleClientsWithPendingReadsUsingThreads(void) {</span></span>
<span class="line"><span>  // 如果没有启用多线程，那么就直接返回</span></span>
<span class="line"><span>  if (!server.io_threads_active || !server.io_threads_do_reads) return 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 在这里将clients_pending_read的请求任务按照轮询算法分发给所有的I/O线程 */</span></span>
<span class="line"><span>  listRewind(server.clients_pending_read,&amp;li);</span></span>
<span class="line"><span>  while((ln = listNext(&amp;li))) {</span></span>
<span class="line"><span>    client *c = listNodeValue(ln);</span></span>
<span class="line"><span>    int target_id = item_id % server.io_threads_num;</span></span>
<span class="line"><span>    listAddNodeTail(io_threads_list[target_id],c);</span></span>
<span class="line"><span>    item_id++;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 启动I/O线程, 将io_threads_op设置为IO_THREADS_OP_READ读状态*/</span></span>
<span class="line"><span>  io_threads_op = IO_THREADS_OP_READ;</span></span>
<span class="line"><span>  for (int j = 1; j &lt; server.io_threads_num; j++) {</span></span>
<span class="line"><span>      int count = listLength(io_threads_list[j]);</span></span>
<span class="line"><span>      setIOPendingCount(j, count);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 主线程处理io_threads_list[0]的请求 */</span></span>
<span class="line"><span>  listRewind(io_threads_list[0],&amp;li);</span></span>
<span class="line"><span>  while((ln = listNext(&amp;li))) {</span></span>
<span class="line"><span>      client *c = listNodeValue(ln);</span></span>
<span class="line"><span>      readQueryFromClient(c-&gt;conn);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  listEmpty(io_threads_list[0]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 等待所有的I/O线程解析成功 */</span></span>
<span class="line"><span>  while(1) {</span></span>
<span class="line"><span>      unsigned long pending = 0;</span></span>
<span class="line"><span>      for (int j = 1; j &lt; server.io_threads_num; j++)</span></span>
<span class="line"><span>          pending += getIOPendingCount(j);</span></span>
<span class="line"><span>      if (pending == 0) break;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br></div></div><p>到这为止我们就看到了，任务是会轮询分发给所有的io_threads_list队列的，然后由各个I/O线程处理</p><h3 id="i-o线程初始化" tabindex="-1">I/O线程初始化 <a class="header-anchor" href="#i-o线程初始化" aria-label="Permalink to &quot;I/O线程初始化&quot;">​</a></h3><p>让我们回到server.c中的main函数，可以看到里面调用了initServerLast方法。</p><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int main(int argc, char **argv) {</span></span>
<span class="line"><span>  InitServerLast();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>void InitServerLast() {</span></span>
<span class="line"><span>  // I/O线程初始化</span></span>
<span class="line"><span>  initThreadedIO();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>接下来我们查看initThreadedIO的实现，代码如下所示</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void initThreadedIO(void) {</span></span>
<span class="line"><span>  /* We start with threads not active. */</span></span>
<span class="line"><span>  server.io_threads_active = 0; </span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* Indicate that io-threads are currently idle */</span></span>
<span class="line"><span>  io_threads_op = IO_THREADS_OP_IDLE;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* Don&#39;t spawn any thread if the user selected a single thread:</span></span>
<span class="line"><span>    * we&#39;ll handle I/O directly from the main thread. */</span></span>
<span class="line"><span>  if (server.io_threads_num == 1) return;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (server.io_threads_num &gt; IO_THREADS_MAX_NUM) {</span></span>
<span class="line"><span>      serverLog(LL_WARNING,&quot;Fatal: too many I/O threads configured. &quot;</span></span>
<span class="line"><span>                            &quot;The maximum number is %d.&quot;, IO_THREADS_MAX_NUM);</span></span>
<span class="line"><span>      exit(1);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* Spawn and initialize the I/O threads. */</span></span>
<span class="line"><span>  for (int i = 0; i &lt; server.io_threads_num; i++) {</span></span>
<span class="line"><span>      /* Things we do for all the threads including the main thread. */</span></span>
<span class="line"><span>      io_threads_list[i] = listCreate();</span></span>
<span class="line"><span>      /* 线程号为0的是主线程 */</span></span>
<span class="line"><span>      if (i == 0) continue; /* Thread 0 is the main thread. */</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      /* Things we do only for the additional threads. */</span></span>
<span class="line"><span>      pthread_t tid;</span></span>
<span class="line"><span>      pthread_mutex_init(&amp;io_threads_mutex[i],NULL);</span></span>
<span class="line"><span>      setIOPendingCount(i, 0);</span></span>
<span class="line"><span>      pthread_mutex_lock(&amp;io_threads_mutex[i]); /* Thread will be stopped. */</span></span>
<span class="line"><span>      // 创建线程，每个线程执行IOThreadMain</span></span>
<span class="line"><span>      if (pthread_create(&amp;tid,NULL,IOThreadMain,(void*)(long)i) != 0) {</span></span>
<span class="line"><span>          serverLog(LL_WARNING,&quot;Fatal: Can&#39;t initialize IO thread.&quot;);</span></span>
<span class="line"><span>          exit(1);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      io_threads[i] = tid;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br></div></div><p>接下来我们看每个I/O线程做的事情，代码如下所示:</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void *IOThreadMain(void *myid) {</span></span>
<span class="line"><span>  for (int j = 0; j &lt; 1000000; j++) {</span></span>
<span class="line"><span>    if (getIOPendingCount(id) != 0) break;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  listRewind(io_threads_list[id],&amp;li);</span></span>
<span class="line"><span>  while((ln = listNext(&amp;li))) {</span></span>
<span class="line"><span>      client *c = listNodeValue(ln);</span></span>
<span class="line"><span>      if (io_threads_op == IO_THREADS_OP_WRITE) {</span></span>
<span class="line"><span>          writeToClient(c,0);</span></span>
<span class="line"><span>      // 刚才在梳理handleClientsWithPendingReadsUsingThreads的时候是IO_THREADS_OP_READ</span></span>
<span class="line"><span>      } else if (io_threads_op == IO_THREADS_OP_READ) {</span></span>
<span class="line"><span>          readQueryFromClient(c-&gt;conn);</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>          serverPanic(&quot;io_threads_op value is unknown&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  listEmpty(io_threads_list[id]);</span></span>
<span class="line"><span>  setIOPendingCount(id, 0);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>所以所有的I/O线程都是执行readQueryFromClient这个函数来解析请求，那我们继续看这个时间段，会做些什么。</p><h3 id="解析请求" tabindex="-1">解析请求 <a class="header-anchor" href="#解析请求" aria-label="Permalink to &quot;解析请求&quot;">​</a></h3><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void readQueryFromClient(connection *conn) {</span></span>
<span class="line"><span>  nread = connRead(c-&gt;conn, c-&gt;querybuf+qblen, readlen);</span></span>
<span class="line"><span>  /* There is more data in the client input buffer, continue parsing it</span></span>
<span class="line"><span>    * and check if there is a full command to execute. */</span></span>
<span class="line"><span>  if (processInputBuffer(c) == C_ERR)</span></span>
<span class="line"><span>    c = NULL;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>可以看到就是从客户端读取数据，然后调用processInputBuffer方法处理，接下来看这个函数。</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int processInputBuffer(client *c) {</span></span>
<span class="line"><span>  /* 现在是IO_THREADS_OP_READ状态，所以直接跳出去*/</span></span>
<span class="line"><span>  if (io_threads_op != IO_THREADS_OP_IDLE) {</span></span>
<span class="line"><span>    serverAssert(io_threads_op == IO_THREADS_OP_READ);</span></span>
<span class="line"><span>    c-&gt;flags |= CLIENT_PENDING_COMMAND;</span></span>
<span class="line"><span>    break;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 执行命令 */</span></span>
<span class="line"><span>  if (processCommandAndResetClient(c) == C_ERR) {</span></span>
<span class="line"><span>    /* If the client is no longer valid, we avoid exiting this</span></span>
<span class="line"><span>      * loop and trimming the client buffer later. So we return</span></span>
<span class="line"><span>      * ASAP in that case. */</span></span>
<span class="line"><span>    return C_ERR;</span></span>
<span class="line"><span>  } </span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>可以看到如果是IO_THREADS_OP_READ状态时，所有的I/O线程只是负责获取请求的数据。</p><h3 id="请求解析与处理" tabindex="-1">请求解析与处理 <a class="header-anchor" href="#请求解析与处理" aria-label="Permalink to &quot;请求解析与处理&quot;">​</a></h3><p>让我们回到handleClientsWithPendingReadsUsingThreads方法，看接下来做的事情</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int handleClientsWithPendingReadsUsingThreads(void) {</span></span>
<span class="line"><span>  io_threads_op = IO_THREADS_OP_IDLE;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* Run the list of clients again to process the new buffers. */</span></span>
<span class="line"><span>  while(listLength(server.clients_pending_read)) {</span></span>
<span class="line"><span>    ln = listFirst(server.clients_pending_read);</span></span>
<span class="line"><span>    client *c = listNodeValue(ln);</span></span>
<span class="line"><span>    listDelNode(server.clients_pending_read,ln);</span></span>
<span class="line"><span>    c-&gt;pending_read_list_node = NULL;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /* Once io-threads are idle we can update the client in the mem usage */</span></span>
<span class="line"><span>    updateClientMemUsageAndBucket(c);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /* 执行请求 */</span></span>
<span class="line"><span>    if (processPendingCommandAndInputBuffer(c) == C_ERR) {</span></span>
<span class="line"><span>      /* If the client is no longer valid, we avoid</span></span>
<span class="line"><span>        * processing the client later. So we just go</span></span>
<span class="line"><span>        * to the next. */</span></span>
<span class="line"><span>      continue;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /* 如果readQueryFromClient()产生了回复并且没有放到待处理的写队列中，这些需要我们处理 */</span></span>
<span class="line"><span>    if (!(c-&gt;flags &amp; CLIENT_PENDING_WRITE) &amp;&amp; clientHasPendingReplies(c))</span></span>
<span class="line"><span>      putClientInPendingWriteQueue(c);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div><p>可以看到调用processPendingCommandAndInputBuffer这个函数，让我们看这个函数的实现</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int processPendingCommandAndInputBuffer(client *c) {</span></span>
<span class="line"><span>  if (c-&gt;flags &amp; CLIENT_PENDING_COMMAND) {</span></span>
<span class="line"><span>    c-&gt;flags &amp;= ~CLIENT_PENDING_COMMAND;</span></span>
<span class="line"><span>    if (processCommandAndResetClient(c) == C_ERR) {</span></span>
<span class="line"><span>        return C_ERR;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 如果客户端有更多数据，对其进行处理 */</span></span>
<span class="line"><span>  if (c-&gt;querybuf &amp;&amp; sdslen(c-&gt;querybuf) &gt; 0) {</span></span>
<span class="line"><span>    return processInputBuffer(c);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>可以看到processInputBuffer跟processPendingCommandAndInputBuffer都会调用processCommandAndResetClient这个方法，看函数名字就知道是处理命令的了。</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int processCommandAndResetClient(client *c) {</span></span>
<span class="line"><span>  // 根据请求的数据查找执行的方法并且执行</span></span>
<span class="line"><span>  if (processCommand(c) == C_OK) {</span></span>
<span class="line"><span>    commandProcessed(c);</span></span>
<span class="line"><span>    /* Update the client&#39;s memory to include output buffer growth following the</span></span>
<span class="line"><span>      * processed command. */</span></span>
<span class="line"><span>    updateClientMemUsageAndBucket(c);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>重点查看processCommand方法，忽略掉一部分代码。</p><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int processCommand(client *c) {</span></span>
<span class="line"><span>  /* Exec the command */</span></span>
<span class="line"><span>  // 事务命令</span></span>
<span class="line"><span>  if (c-&gt;flags &amp; CLIENT_MULTI &amp;&amp;</span></span>
<span class="line"><span>      c-&gt;cmd-&gt;proc != execCommand &amp;&amp;</span></span>
<span class="line"><span>      c-&gt;cmd-&gt;proc != discardCommand &amp;&amp;</span></span>
<span class="line"><span>      c-&gt;cmd-&gt;proc != multiCommand &amp;&amp;</span></span>
<span class="line"><span>      c-&gt;cmd-&gt;proc != watchCommand &amp;&amp;</span></span>
<span class="line"><span>      c-&gt;cmd-&gt;proc != quitCommand &amp;&amp;</span></span>
<span class="line"><span>      c-&gt;cmd-&gt;proc != resetCommand)</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>      queueMultiCommand(c, cmd_flags);</span></span>
<span class="line"><span>      addReply(c,shared.queued);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    // 执行命令</span></span>
<span class="line"><span>    call(c,CMD_CALL_FULL);</span></span>
<span class="line"><span>    c-&gt;woff = server.master_repl_offset;</span></span>
<span class="line"><span>    if (listLength(server.ready_keys) &amp;&amp; !isInsideYieldingLongCommand())</span></span>
<span class="line"><span>        handleClientsBlockedOnKeys();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>查看call方法，这里会调用c-&gt;cmd-&gt;proc()执行命令。</p><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void call(client *c, int flags) {</span></span>
<span class="line"><span>  c-&gt;cmd-&gt;proc(c);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h3 id="返回结果" tabindex="-1">返回结果 <a class="header-anchor" href="#返回结果" aria-label="Permalink to &quot;返回结果&quot;">​</a></h3><p>执行完命令之后，如果有数据返回，会把数据放到client_pending_write写队列中。这里以String的GET命令为例.</p><div class="language-t_string.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">t_string.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int getGenericCommand(client *c) {</span></span>
<span class="line"><span>  robj *o;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if ((o = lookupKeyReadOrReply(c,c-&gt;argv[1],shared.null[c-&gt;resp])) == NULL)</span></span>
<span class="line"><span>      return C_OK;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (checkType(c,o,OBJ_STRING)) {</span></span>
<span class="line"><span>      return C_ERR;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 返回结果</span></span>
<span class="line"><span>  addReplyBulk(c,o);</span></span>
<span class="line"><span>  return C_OK;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>查看addReplyBulk方法，代码如下:</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void addReplyBulk(client *c, robj *obj) {</span></span>
<span class="line"><span>  addReplyBulkLen(c,obj);</span></span>
<span class="line"><span>  addReply(c,obj);</span></span>
<span class="line"><span>  addReply(c,shared.crlf);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* Add the object &#39;obj&#39; string representation to the client output buffer. */</span></span>
<span class="line"><span>void addReply(client *c, robj *obj) {</span></span>
<span class="line"><span>  if (prepareClientToWrite(c) != C_OK) return;</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>int prepareClientToWrite(client *c) {</span></span>
<span class="line"><span>  if (!clientHasPendingReplies(c) &amp;&amp; io_threads_op == IO_THREADS_OP_IDLE)</span></span>
<span class="line"><span>    putClientInPendingWriteQueue(c);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>void putClientInPendingWriteQueue(client *c) {</span></span>
<span class="line"><span>  if (!(c-&gt;flags &amp; CLIENT_PENDING_WRITE) &amp;&amp;</span></span>
<span class="line"><span>    (c-&gt;replstate == REPL_STATE_NONE ||</span></span>
<span class="line"><span>      (c-&gt;replstate == SLAVE_STATE_ONLINE &amp;&amp; !c-&gt;repl_start_cmd_stream_on_ack)))</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    c-&gt;flags |= CLIENT_PENDING_WRITE;</span></span>
<span class="line"><span>    /* 在这里放到clients_pending_write中</span></span>
<span class="line"><span>    listAddNodeHead(server.clients_pending_write,c);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>好了，handleClientsWithPendingReadsUsingThreads到这里结束。</p><h3 id="写请求分发" tabindex="-1">写请求分发 <a class="header-anchor" href="#写请求分发" aria-label="Permalink to &quot;写请求分发&quot;">​</a></h3><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void beforeSleep(struct aeEventLoop *eventLoop) {</span></span>
<span class="line"><span>  /* 在这处理读请求事件 */</span></span>
<span class="line"><span>  /* We should handle pending reads clients ASAP after event loop. */</span></span>
<span class="line"><span>  handleClientsWithPendingReadsUsingThreads();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 在这处理写请求事件 */</span></span>
<span class="line"><span>  /* Handle writes with pending output buffers. */</span></span>
<span class="line"><span>  handleClientsWithPendingWritesUsingThreads();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>I/O多线程是在handleClientsWithPendingWritesUsingThreads里面处理写请求分发的，我们点进这个函数查看。</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int handleClientsWithPendingWritesUsingThreads(void) {</span></span>
<span class="line"><span>  /* 如果没有使用I/O多线程，走这里，由主线程把请求返回去*/</span></span>
<span class="line"><span>  if (server.io_threads_num == 1 || stopThreadedIOIfNeeded()) {</span></span>
<span class="line"><span>      return handleClientsWithPendingWrites();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 可以看到是在这边判断是不是要使用多线程的，如果需要多线程则启动 */</span></span>
<span class="line"><span>  if (!server.io_threads_active) startThreadedIO();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  listRewind(server.clients_pending_write,&amp;li);</span></span>
<span class="line"><span>  int item_id = 0;</span></span>
<span class="line"><span>  while((ln = listNext(&amp;li))) {</span></span>
<span class="line"><span>    client *c = listNodeValue(ln);</span></span>
<span class="line"><span>    c-&gt;flags &amp;= ~CLIENT_PENDING_WRITE;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /* 如果需要关闭连接，则走这里*/</span></span>
<span class="line"><span>    if (c-&gt;flags &amp; CLIENT_CLOSE_ASAP) {</span></span>
<span class="line"><span>        listDelNode(server.clients_pending_write, ln);</span></span>
<span class="line"><span>        continue;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /* 由主线程发送所有副本的缓冲区 */</span></span>
<span class="line"><span>    if (getClientType(c) == CLIENT_TYPE_SLAVE) {</span></span>
<span class="line"><span>        listAddNodeTail(io_threads_list[0],c);</span></span>
<span class="line"><span>        continue;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /* 按轮询算法分发写请求 */</span></span>
<span class="line"><span>    int target_id = item_id % server.io_threads_num;</span></span>
<span class="line"><span>    listAddNodeTail(io_threads_list[target_id],c);</span></span>
<span class="line"><span>    item_id++;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>    /* 唤醒I/O线程 */</span></span>
<span class="line"><span>    io_threads_op = IO_THREADS_OP_WRITE;</span></span>
<span class="line"><span>    for (int j = 1; j &lt; server.io_threads_num; j++) {</span></span>
<span class="line"><span>      int count = listLength(io_threads_list[j]);</span></span>
<span class="line"><span>      setIOPendingCount(j, count);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /* 主线程负责o_threads_list[0]的写请求 */</span></span>
<span class="line"><span>    listRewind(io_threads_list[0],&amp;li);</span></span>
<span class="line"><span>    while((ln = listNext(&amp;li))) {</span></span>
<span class="line"><span>      client *c = listNodeValue(ln);</span></span>
<span class="line"><span>      writeToClient(c,0);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    listEmpty(io_threads_list[0]);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /* 等待所有的I/O线程处理完成 */</span></span>
<span class="line"><span>    while(1) {</span></span>
<span class="line"><span>        unsigned long pending = 0;</span></span>
<span class="line"><span>        for (int j = 1; j &lt; server.io_threads_num; j++)</span></span>
<span class="line"><span>            pending += getIOPendingCount(j);</span></span>
<span class="line"><span>        if (pending == 0) break;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /* 将I/O线程变成空闲状态 */</span></span>
<span class="line"><span>    io_threads_op = IO_THREADS_OP_IDLE;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br></div></div><p>好了，我们看一下I/O线程的处理方法。</p><div class="language-networking.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">networking.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void *IOThreadMain(void *myid) {</span></span>
<span class="line"><span>  for (int j = 0; j &lt; 1000000; j++) {</span></span>
<span class="line"><span>    if (getIOPendingCount(id) != 0) break;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  listRewind(io_threads_list[id],&amp;li);</span></span>
<span class="line"><span>  while((ln = listNext(&amp;li))) {</span></span>
<span class="line"><span>      client *c = listNodeValue(ln);</span></span>
<span class="line"><span>      /* 现在是IO_THREADS_OP_WRITE状态 */</span></span>
<span class="line"><span>      if (io_threads_op == IO_THREADS_OP_WRITE) {</span></span>
<span class="line"><span>          writeToClient(c,0);</span></span>
<span class="line"><span>      } else if (io_threads_op == IO_THREADS_OP_READ) {</span></span>
<span class="line"><span>          readQueryFromClient(c-&gt;conn);</span></span>
<span class="line"><span>      } else {</span></span>
<span class="line"><span>          serverPanic(&quot;io_threads_op value is unknown&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  listEmpty(io_threads_list[id]);</span></span>
<span class="line"><span>  setIOPendingCount(id, 0);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>至于writeToClient就不分析了，就是把数据返回给客户端。</p><h2 id="命令解析处理" tabindex="-1">命令解析处理 <a class="header-anchor" href="#命令解析处理" aria-label="Permalink to &quot;命令解析处理&quot;">​</a></h2><p>在本章的最后，梳理一下是怎么根据一个请求找到对应的命令处理函数来处理的。</p><p>所有的命令以及处理函数都是封装在command.c文件中的redisCommandTable，这里列出来一部分。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>struct redisCommand redisCommandTable[] = {</span></span>
<span class="line"><span>/* bitmap */</span></span>
<span class="line"><span>{&quot;bitcount&quot;,&quot;Count set bits in a string&quot;,&quot;O(N)&quot;,&quot;2.6.0&quot;,CMD_DOC_NONE,NULL,NULL,COMMAND_GROUP_BITMAP,BITCOUNT_History,BITCOUNT_tips,bitcountCommand,-2,CMD_READONLY,ACL_CATEGORY_BITMAP,{{NULL,CMD_KEY_RO|CMD_KEY_ACCESS,KSPEC_BS_INDEX,.bs.index={1},KSPEC_FK_RANGE,.fk.range={0,1,0}}},.args=BITCOUNT_Args},</span></span>
<span class="line"><span>{&quot;bitfield&quot;,&quot;Perform arbitrary bitfield integer operations on strings&quot;,&quot;O(1) for each subcommand specified&quot;,&quot;3.2.0&quot;,CMD_DOC_NONE,NULL,NULL,COMMAND_GROUP_BITMAP,BITFIELD_History,BITFIELD_tips,bitfieldCommand,-2,CMD_WRITE|CMD_DENYOOM,ACL_CATEGORY_BITMAP,{{&quot;This command allows both access and modification of the key&quot;,CMD_KEY_RW|CMD_KEY_UPDATE|CMD_KEY_ACCESS|CMD_KEY_VARIABLE_FLAGS,KSPEC_BS_INDEX,.bs.index={1},KSPEC_FK_RANGE,.fk.range={0,1,0}}},bitfieldGetKeys,.args=BITFIELD_Args},</span></span>
<span class="line"><span>{&quot;bitfield_ro&quot;,&quot;Perform arbitrary bitfield integer operations on strings. Read-only variant of BITFIELD&quot;,&quot;O(1) for each subcommand specified&quot;,&quot;6.0.0&quot;,CMD_DOC_NONE,NULL,NULL,COMMAND_GROUP_BITMAP,BITFIELD_RO_History,BITFIELD_RO_tips,bitfieldroCommand,-2,CMD_READONLY|CMD_FAST,ACL_CATEGORY_BITMAP,{{NULL,CMD_KEY_RO|CMD_KEY_ACCESS,KSPEC_BS_INDEX,.bs.index={1},KSPEC_FK_RANGE,.fk.range={0,1,0}}},.args=BITFIELD_RO_Args},</span></span>
<span class="line"><span>{&quot;bitop&quot;,&quot;Perform bitwise operations between strings&quot;,&quot;O(N)&quot;,&quot;2.6.0&quot;,CMD_DOC_NONE,NULL,NULL,COMMAND_GROUP_BITMAP,BITOP_History,BITOP_tips,bitopCommand,-4,CMD_WRITE|CMD_DENYOOM,ACL_CATEGORY_BITMAP,{{NULL,CMD_KEY_OW|CMD_KEY_UPDATE,KSPEC_BS_INDEX,.bs.index={2},KSPEC_FK_RANGE,.fk.range={0,1,0}},{NULL,CMD_KEY_RO|CMD_KEY_ACCESS,KSPEC_BS_INDEX,.bs.index={3},KSPEC_FK_RANGE,.fk.range={-1,1,0}}},.args=BITOP_Args},</span></span>
<span class="line"><span>{&quot;bitpos&quot;,&quot;Find first bit set or clear in a string&quot;,&quot;O(N)&quot;,&quot;2.8.7&quot;,CMD_DOC_NONE,NULL,NULL,COMMAND_GROUP_BITMAP,BITPOS_History,BITPOS_tips,bitposCommand,-3,CMD_READONLY,ACL_CATEGORY_BITMAP,{{NULL,CMD_KEY_RO|CMD_KEY_ACCESS,KSPEC_BS_INDEX,.bs.index={1},KSPEC_FK_RANGE,.fk.range={0,1,0}}},.args=BITPOS_Args},</span></span>
<span class="line"><span>{&quot;getbit&quot;,&quot;Returns the bit value at offset in the string value stored at key&quot;,&quot;O(1)&quot;,&quot;2.2.0&quot;,CMD_DOC_NONE,NULL,NULL,COMMAND_GROUP_BITMAP,GETBIT_History,GETBIT_tips,getbitCommand,3,CMD_READONLY|CMD_FAST,ACL_CATEGORY_BITMAP,{{NULL,CMD_KEY_RO|CMD_KEY_ACCESS,KSPEC_BS_INDEX,.bs.index={1},KSPEC_FK_RANGE,.fk.range={0,1,0}}},.args=GETBIT_Args},</span></span>
<span class="line"><span>{&quot;setbit&quot;,&quot;Sets or clears the bit at offset in the string value stored at key&quot;,&quot;O(1)&quot;,&quot;2.2.0&quot;,CMD_DOC_NONE,NULL,NULL,COMMAND_GROUP_BITMAP,SETBIT_History,SETBIT_tips,setbitCommand,4,CMD_WRITE|CMD_DENYOOM,ACL_CATEGORY_BITMAP,{{NULL,CMD_KEY_RW|CMD_KEY_ACCESS|CMD_KEY_UPDATE,KSPEC_BS_INDEX,.bs.index={1},KSPEC_FK_RANGE,.fk.range={0,1,0}}},.args=SETBIT_Args},</span></span>
<span class="line"><span>/* cluster */</span></span>
<span class="line"><span>.....</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>可以看到bitcount对应的处理函数是bitcountCommand。</p><p>接下来我们查看server.c中main函数的initServerConfig方法，可以看到调用了populateCommandTable方法</p><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int main(int argc, char **argv) {</span></span>
<span class="line"><span>  initServerConfig();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>void initServerConfig(void) {</span></span>
<span class="line"><span>  populateCommandTable();</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>void populateCommandTable(void) {</span></span>
<span class="line"><span>  for (j = 0;; j++) {</span></span>
<span class="line"><span>    c = redisCommandTable + j;</span></span>
<span class="line"><span>    retval1 = dictAdd(server.commands, sdsdup(c-&gt;fullname), c);</span></span>
<span class="line"><span>    /* Populate an additional dictionary that will be unaffected</span></span>
<span class="line"><span>      * by rename-command statements in redis.conf. */</span></span>
<span class="line"><span>    retval2 = dictAdd(server.orig_commands, sdsdup(c-&gt;fullname), c);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>可以看到是封装到了server.orig_commands跟server.commands中。</p><p>回到前面分析到的请求执行的方法processCommand。</p><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int processCommand(client *c) {</span></span>
<span class="line"><span>  /* Now lookup the command and check ASAP about trivial error conditions</span></span>
<span class="line"><span>  * such as wrong arity, bad command name and so forth. */</span></span>
<span class="line"><span>  c-&gt;cmd = c-&gt;lastcmd = c-&gt;realcmd = lookupCommand(c-&gt;argv,c-&gt;argc);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/* 可以看到是这个函数里面查找执行方法的，后面的就不细讲了 */</span></span>
<span class="line"><span>struct redisCommand *lookupCommand(robj **argv, int argc) {</span></span>
<span class="line"><span>  return lookupCommandLogic(server.commands,argv,argc,0);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>总的来说，如果想要找到一个命令的实现方法，直接看command.c就好了。</p>`,136)]))}const _=a(c,[["render",t]]);export{v as __pageData,_ as default};
