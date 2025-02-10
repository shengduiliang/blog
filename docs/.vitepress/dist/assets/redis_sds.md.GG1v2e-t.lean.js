import{_ as n,c as a,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const l="/assets/string.BDNjyOwl.png",i="/assets/sds.BQ5duqKg.png",r="/assets/redisObject.DYqiO2FU.png",c="/assets/embstr.B-MpMuxR.png",_=JSON.parse('{"title":"字符串实现原理","description":"","frontmatter":{},"headers":[],"relativePath":"redis/sds.md","filePath":"redis/sds.md"}'),t={name:"redis/sds.md"};function b(u,s,d,m,o,g){return e(),a("div",null,s[0]||(s[0]=[p('<h1 id="字符串实现原理" tabindex="-1">字符串实现原理 <a class="header-anchor" href="#字符串实现原理" aria-label="Permalink to &quot;字符串实现原理&quot;">​</a></h1><p>字符串类型的使用场景最为广泛，例如计数器，缓存，分布式锁以及存储登录后的用户信息，key保存token，value存储登录用户对象的JSON字符串等。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>SET username shengduiliang</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>C语言原生支持字符串类型，如下所示</p><img src="'+l+'" width="300" alt="string"><p>原生字符串有以下缺点:</p><ul><li>原生字符串需要手动检查和分配字符串空间，要获取字符串长度需要遍历整个字符串</li><li>原生字符串是以\\0作为字符串作为结束符的，没有办法存储二进制数据，比如bitmap/图片</li><li>字符串的扩容和缩容很麻烦</li></ul><p>所以redis基于C语言的原生字符串重新封装了一个字符串的结构---SDS</p><h2 id="sds结构体" tabindex="-1">SDS结构体 <a class="header-anchor" href="#sds结构体" aria-label="Permalink to &quot;SDS结构体&quot;">​</a></h2><img src="'+i+`" width="500" alt="sds"><p>SDS结构体的组成如上所示，需要注意的是也遵循以空字符&quot;\\0&quot;结尾的惯例，但是最后这个空字符不算入SDS的长度len中。</p><p>SDS结构体有5种类型，分别是sdshdr5，sdshdr8，sdshdr16，sdshdr32，sdshdr64。sdshdr5已经不同了，所以我们主要了解剩下几种，这里以sdshdr8为例，代码如下:</p><div class="language-sds.h vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">sds.h</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>struct __attribute__ ((__packed__)) sdshdr8 {</span></span>
<span class="line"><span>  uint8_t len; /* used */</span></span>
<span class="line"><span>  uint8_t alloc; /* excluding the header and null terminator */</span></span>
<span class="line"><span>  unsigned char flags; /* 3 lsb of type, 5 unused bits */</span></span>
<span class="line"><span>  char buf[];</span></span>
<span class="line"><span>};</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>注意上面结构体前面的__attribute__ ((__packed__)), 这句代码的作用是告诉编译器，不要使用字节对齐的方式（默认按8字节对齐），而是采用紧凑的方法来分配内存。</p><h2 id="字符串编码格式" tabindex="-1">字符串编码格式 <a class="header-anchor" href="#字符串编码格式" aria-label="Permalink to &quot;字符串编码格式&quot;">​</a></h2><p>Redis对字符串类型使用了三种编码格式来存储，分别是int，embstr和raw类型。</p><ul><li>int编码: 8字节的长整型，值是数字类型且数字的长度小于20。（这个没用到SDS结构体）</li><li>embstr编码: 长度小于等于44字节的字符串。</li><li>raw编码： 长度大于44字节的字符串。</li></ul><p>为什么会有三种编码形式呢？都是为了内存效率考虑的, 下面就来讲解一下。</p><p><strong>int编码</strong></p><p>前面第二篇文章介绍redis的所有键值对的值都是使用redisObject对象来存储的，这里重新放一下。</p><img src="`+r+'" width="500" alt="redisObject"><p>redisObject一共占用的内存大小为 (4(type) + 4(encoding) + 24(lru)) / 8 + 4(int占用4个字节) + 8(void *类型占用8个字节)，刚好16个字节，内存对齐。</p><p>但是如果ptr直接用来存储数字的话，可以存放8字节的数字，可以放多大的数呢？Math.pow(2, 64) = 18446744073709552000。刚好20位数字，所以可以直接用一个redisObject存储就可以了。</p><p><strong>embstr编码</strong></p><p>对于内存分配来说，分配连续的内存会比分散的内存效率更高，这就是embstr编码要考虑，在embstr编码中，redisObject跟SDS结构体是相邻的，如下图所示</p><img src="'+c+`" width="300" alt="embstr"><p>redisObject占用了16个字节，而SDS结构体占用的内存大小为1(len) + 1(alloc) + 1(flags) + 8(buf) + 1(&quot;\\0&quot;) = 12个字节。</p><p>如果分配一个64个字节的内存，那么可以算出字符串长度为 64 - 16 - 12 = 44个字节。</p><p><strong>raw编码</strong></p><p>这种编码形式就不细说了，redisObject跟SDS结构分别分配空间，即分配两次空间。</p><p><strong>源码分析</strong></p><p>接下来我们查看一下字符串的设置流程。上节课我们知道了一个命令是怎么查找对应的处理函数的，这里重新讲一下，后面就不讲了。</p><p>我们打开commands.c文件，搜索set字符好，可以找到对应的执行命令，然后点击查看即可。</p><div class="language-command.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">command.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>{&quot;set&quot;,&quot;Set the string value of a key&quot;,...,SET_History,SET_tips,setCommand,...}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>可以看到setCommand在t_string.c文件下面，查看代码。</p><div class="language-t_string.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">t_string.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void setCommand(client *c) {</span></span>
<span class="line"><span>  robj *expire = NULL;</span></span>
<span class="line"><span>  int unit = UNIT_SECONDS;</span></span>
<span class="line"><span>  int flags = OBJ_NO_FLAGS;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 检查额外的参数</span></span>
<span class="line"><span>  if (parseExtendedStringArgumentsOrReply(c,&amp;flags,&amp;unit,&amp;expire,COMMAND_SET) != C_OK) {</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 重新编码，核心函数</span></span>
<span class="line"><span>  c-&gt;argv[2] = tryObjectEncoding(c-&gt;argv[2]);</span></span>
<span class="line"><span>  // 实际设置命令</span></span>
<span class="line"><span>  setGenericCommand(c,flags,c-&gt;argv[1],c-&gt;argv[2],expire,unit,NULL,NULL);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>主要看tryObjectEncoding函数，点击代码查看。</p><div class="language-object.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">object.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>robj *tryObjectEncoding(robj *o) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 如果长度小于20并且可以转化成数字</span></span>
<span class="line"><span>  if (len &lt;= 20 &amp;&amp; string2l(s,len,&amp;value)) {</span></span>
<span class="line"><span>    // 数值小于10000，从share内存池返回</span></span>
<span class="line"><span>    if ((server.maxmemory == 0 ||</span></span>
<span class="line"><span>    !(server.maxmemory_policy &amp; MAXMEMORY_FLAG_NO_SHARED_INTEGERS)) &amp;&amp;</span></span>
<span class="line"><span>    value &gt;= 0 &amp;&amp;</span></span>
<span class="line"><span>    value &lt; OBJ_SHARED_INTEGERS)</span></span>
<span class="line"><span>    {</span></span>
<span class="line"><span>      decrRefCount(o);</span></span>
<span class="line"><span>      incrRefCount(shared.integers[value]);</span></span>
<span class="line"><span>      return shared.integers[value];</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      if (o-&gt;encoding == OBJ_ENCODING_RAW) {</span></span>
<span class="line"><span>        // 释放o-&gt;ptr</span></span>
<span class="line"><span>        sdsfree(o-&gt;ptr);</span></span>
<span class="line"><span>        o-&gt;encoding = OBJ_ENCODING_INT;</span></span>
<span class="line"><span>        // 可以看到直接是把value当成指针</span></span>
<span class="line"><span>        o-&gt;ptr = (void*) value;</span></span>
<span class="line"><span>        return o;</span></span>
<span class="line"><span>      } else if (o-&gt;encoding == OBJ_ENCODING_EMBSTR) {</span></span>
<span class="line"><span>        decrRefCount(o);</span></span>
<span class="line"><span>        // 重新构造一个robj</span></span>
<span class="line"><span>        return createStringObjectFromLongLongForValue(value);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 如果字符串长度小于或等于44，创建embstr对象</span></span>
<span class="line"><span>  if (len &lt;= OBJ_ENCODING_EMBSTR_SIZE_LIMIT) {</span></span>
<span class="line"><span>    robj *emb;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (o-&gt;encoding == OBJ_ENCODING_EMBSTR) return o;</span></span>
<span class="line"><span>    emb = createEmbeddedStringObject(s,sdslen(s));</span></span>
<span class="line"><span>    decrRefCount(o);</span></span>
<span class="line"><span>    return emb;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 尝试优化SDS字符串对象的空间</span></span>
<span class="line"><span>  trimStringObjectIfNeeded(o);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br></div></div><p>raw编码SDS的创建是在readQueryFromClient-&gt;processInputBuffer-&gt;processMultibulkBuffer-&gt;createStringObject中</p><h2 id="空间预分配" tabindex="-1">空间预分配 <a class="header-anchor" href="#空间预分配" aria-label="Permalink to &quot;空间预分配&quot;">​</a></h2><p>在需要对SDS的空间进行扩容时，不仅仅分配所需的空间，还会分配额外的空间，减少内存重分配次数</p><ul><li>如果字符串长度小于 1MB，则采用 加倍扩展 策略，新分配的内存大小为当前字符串长度的 2 22 倍。</li><li>如果字符串长度超过 1MB，则每次额外分配 1MB 的空间。</li></ul><p>根据查找的资料，SDS的扩缩容实现在_sdsMakeRoomFor这个函数里面，查看实现方法。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>sds _sdsMakeRoomFor(sds s, size_t addlen, int greedy) {</span></span>
<span class="line"><span>  ... sds.c</span></span>
<span class="line"><span>  len = sdslen(s);</span></span>
<span class="line"><span>  sh = (char*)s-sdsHdrSize(oldtype);</span></span>
<span class="line"><span>  reqlen = newlen = (len+addlen);</span></span>
<span class="line"><span>  assert(newlen &gt; len);   /* Catch size_t overflow */</span></span>
<span class="line"><span>  // 有足够的空间，直接返回</span></span>
<span class="line"><span>  if (avail &gt;= addlen) return s;</span></span>
<span class="line"><span>  if (greedy == 1) {</span></span>
<span class="line"><span>    // 小于1MB时，翻倍</span></span>
<span class="line"><span>    if (newlen &lt; SDS_MAX_PREALLOC)</span></span>
<span class="line"><span>      newlen *= 2;</span></span>
<span class="line"><span>    else</span></span>
<span class="line"><span>      // 大于1M时，增加1M大小</span></span>
<span class="line"><span>      //#define SDS_MAX_PREALLOC (1024*1024)</span></span>
<span class="line"><span>      newlen += SDS_MAX_PREALLOC;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  return s;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>这个方法的调用在readQueryFromClient方法中的sdsMakeRoomFor()</p><h2 id="惰性删除" tabindex="-1">惰性删除 <a class="header-anchor" href="#惰性删除" aria-label="Permalink to &quot;惰性删除&quot;">​</a></h2><p>当对SDS进行缩短操作时，程序并不会回收多余的内存空间，留给后面使用。</p><div class="language-sds.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">sds.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void sdsupdatelen(sds s) {</span></span>
<span class="line"><span>  int reallen = strlen(s);</span></span>
<span class="line"><span>  sdssetlen(s, reallen);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>static inline void sdssetlen(sds s, size_t newlen) {</span></span>
<span class="line"><span>  unsigned char flags = s[-1];</span></span>
<span class="line"><span>  switch(flags&amp;SDS_TYPE_MASK) {</span></span>
<span class="line"><span>    case SDS_TYPE_5:</span></span>
<span class="line"><span>      {</span></span>
<span class="line"><span>          unsigned char *fp = ((unsigned char*)s)-1;</span></span>
<span class="line"><span>          *fp = SDS_TYPE_5 | (newlen &lt;&lt; SDS_TYPE_BITS);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      break;</span></span>
<span class="line"><span>    case SDS_TYPE_8:</span></span>
<span class="line"><span>        SDS_HDR(8,s)-&gt;len = newlen;</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>    case SDS_TYPE_16:</span></span>
<span class="line"><span>        SDS_HDR(16,s)-&gt;len = newlen;</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>    case SDS_TYPE_32:</span></span>
<span class="line"><span>        SDS_HDR(32,s)-&gt;len = newlen;</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>    case SDS_TYPE_64:</span></span>
<span class="line"><span>        SDS_HDR(64,s)-&gt;len = newlen;</span></span>
<span class="line"><span>        break;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><p>可以从上面源码中看到，在更新字符串长度的过程中并没有涉及到内存的重分配策略，只是简单的修改sdshdr头中的Len字段。</p>`,49)]))}const S=n(t,[["render",b]]);export{_ as __pageData,S as default};
