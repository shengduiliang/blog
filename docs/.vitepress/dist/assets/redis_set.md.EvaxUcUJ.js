import{_ as n,c as a,a0 as e,o as p}from"./chunks/framework.P9qPzDnn.js";const l="/assets/intset.CuOz8lL8.png",o=JSON.parse('{"title":"Sets实现原理与实战","description":"","frontmatter":{},"headers":[],"relativePath":"redis/set.md","filePath":"redis/set.md"}'),i={name:"redis/set.md"};function t(r,s,c,b,u,d){return p(),a("div",null,s[0]||(s[0]=[e(`<h1 id="sets实现原理与实战" tabindex="-1">Sets实现原理与实战 <a class="header-anchor" href="#sets实现原理与实战" aria-label="Permalink to &quot;Sets实现原理与实战&quot;">​</a></h1><p>如果需要存储多个元素，并且要求不能出现重复数据，无须考虑数据的有序性，可以使用Sets。Sets还支持在集合之间做交集，并集，差集操作，比如统计元素的聚合结果。</p><ul><li>统计多个元素的共有数据(交集)</li><li>统计多个元素的所有元素(并集)</li><li>对于两个集合，统计其中的一个独有元素(差集)</li></ul><p>常见的使用场景如下:</p><ul><li>社交软件中共同关注：通过交集实现</li><li>每日新增关注数：对近两天的总注册用户集合取差值</li><li>打标签：为自己收藏的每一篇文章打标签</li></ul><h2 id="sets用法" tabindex="-1">Sets用法 <a class="header-anchor" href="#sets用法" aria-label="Permalink to &quot;Sets用法&quot;">​</a></h2><ul><li>添加元素: SADD key value</li><li>删除元素: SREM key value</li><li>获取集合元素: SMEMBER key</li><li>随机获取一个元素: SPOP key [number]</li><li>取交集, 把key1和key2的交集放到destination: SINTERSTORE destination key1 key2 [key3 ...]</li><li>取并集, 返回key1和key2的并集: SUNION key1 key2</li><li>取差集, 返回key1和key2的差集: SDIFF key1 key2</li></ul><h2 id="底层数据结构" tabindex="-1">底层数据结构 <a class="header-anchor" href="#底层数据结构" aria-label="Permalink to &quot;底层数据结构&quot;">​</a></h2><p>Sets的底层数据结构有两种，具体如下：</p><ul><li>intset: 如果元素内容都是64位以内的十进制整数，并且元素不超过 set-max-intset-entries的，默认为512</li><li>散列表: 其余使用全局散列表的结构</li></ul><p>散列表的实现可以点击<a href="/redis/ht_table.html">此处</a>查看，接下来我们看看intset的实现。</p><h3 id="intset" tabindex="-1">intset <a class="header-anchor" href="#intset" aria-label="Permalink to &quot;intset&quot;">​</a></h3><p>首先我们看一下intset的结构体是怎么样的，结构体定义如下:</p><div class="language-intset.h vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">intset.h</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>typedef struct intset {</span></span>
<span class="line"><span>  uint32_t encoding;</span></span>
<span class="line"><span>  // content数组长度</span></span>
<span class="line"><span>  uint32_t length;</span></span>
<span class="line"><span>  // 存放intset整数集合的数组</span></span>
<span class="line"><span>  int8_t contents[];</span></span>
<span class="line"><span>} intset;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>其中encoding是比较重要，决定数组的类型，一共有三种不同的值。</p><ul><li>INTSET_ENC_INT16: 每2个字节一个元素</li><li>INTSET_ENC_INT32: 每4个字节一个元素</li><li>INTSET_ENC_INT64: 每8个字节一个元素</li></ul><img src="`+l+`" width="500" alt="intset"><p>intset的结构体设计图如上所示，有几个特性:</p><ul><li>每次新增元素都会重新扩容</li><li>encoding编码升级都会重新分配空间</li><li>encoding编码不会降级</li><li>intset的content是有序的，可以二分查找</li></ul><h2 id="源码讲解" tabindex="-1">源码讲解 <a class="header-anchor" href="#源码讲解" aria-label="Permalink to &quot;源码讲解&quot;">​</a></h2><p>下面我们看一下Sets的源码，SADD对应指令的方法是saddCommand，看执行方法</p><div class="language-t_set.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">t_set.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void saddCommand(client *c) {</span></span>
<span class="line"><span>  robj *set;</span></span>
<span class="line"><span>  int j, added = 0;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 查看key是否存在</span></span>
<span class="line"><span>  set = lookupKeyWrite(c-&gt;db,c-&gt;argv[1]);</span></span>
<span class="line"><span>  if (checkType(c,set,OBJ_SET)) return;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 不存在，创建key</span></span>
<span class="line"><span>  if (set == NULL) {</span></span>
<span class="line"><span>      set = setTypeCreate(c-&gt;argv[2]-&gt;ptr);</span></span>
<span class="line"><span>      dbAdd(c-&gt;db,c-&gt;argv[1],set);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 添加元素</span></span>
<span class="line"><span>  for (j = 2; j &lt; c-&gt;argc; j++) {</span></span>
<span class="line"><span>      if (setTypeAdd(set,c-&gt;argv[j]-&gt;ptr)) added++;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 添加成功，发送成功通知</span></span>
<span class="line"><span>  if (added) {</span></span>
<span class="line"><span>      signalModifiedKey(c,c-&gt;db,c-&gt;argv[1]);</span></span>
<span class="line"><span>      notifyKeyspaceEvent(NOTIFY_SET,&quot;sadd&quot;,c-&gt;argv[1],c-&gt;db-&gt;id);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  server.dirty += added;</span></span>
<span class="line"><span>  addReplyLongLong(c,added);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>可以看到核心的方法是setTypeAdd，那么我们跟进去看一下:</p><div class="language-t_set.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">t_set.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int setTypeAdd(robj *subject, sds value) {</span></span>
<span class="line"><span>  long long llval;</span></span>
<span class="line"><span>  // 如果已经是使用hashtable的话，直接添加元素</span></span>
<span class="line"><span>  if (subject-&gt;encoding == OBJ_ENCODING_HT) {</span></span>
<span class="line"><span>    .....</span></span>
<span class="line"><span>  } else if (subject-&gt;encoding == OBJ_ENCODING_INTSET) {</span></span>
<span class="line"><span>    // 是数字类型</span></span>
<span class="line"><span>    if (isSdsRepresentableAsLongLong(value,&amp;llval) == C_OK) {</span></span>
<span class="line"><span>        uint8_t success = 0;</span></span>
<span class="line"><span>        subject-&gt;ptr = intsetAdd(subject-&gt;ptr,llval,&amp;success);</span></span>
<span class="line"><span>        if (success) {</span></span>
<span class="line"><span>            // 根据set_max_intset_entries判断是否要切换成hashtable</span></span>
<span class="line"><span>            size_t max_entries = server.set_max_intset_entries;</span></span>
<span class="line"><span>            /* limit to 1G entries due to intset internals. */</span></span>
<span class="line"><span>            if (max_entries &gt;= 1&lt;&lt;30) max_entries = 1&lt;&lt;30;</span></span>
<span class="line"><span>            if (intsetLen(subject-&gt;ptr) &gt; max_entries)</span></span>
<span class="line"><span>                setTypeConvert(subject,OBJ_ENCODING_HT);</span></span>
<span class="line"><span>            return 1;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      // 转化成hashtable</span></span>
<span class="line"><span>        /* Failed to get integer from object, convert to regular set. */</span></span>
<span class="line"><span>        setTypeConvert(subject,OBJ_ENCODING_HT);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        /* The set *was* an intset and this value is not integer</span></span>
<span class="line"><span>          * encodable, so dictAdd should always work. */</span></span>
<span class="line"><span>        serverAssert(dictAdd(subject-&gt;ptr,sdsdup(value),NULL) == DICT_OK);</span></span>
<span class="line"><span>        return 1;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>      serverPanic(&quot;Unknown set encoding&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return 0;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br></div></div><p>由于hashtable的插入之前已经讲过了，所以这里讲一下intsetAdd这个方法，执行intset的插入的方法。</p><div class="language-intset.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">intset.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>intset *intsetAdd(intset *is, int64_t value, uint8_t *success) {</span></span>
<span class="line"><span>  // 获取编码</span></span>
<span class="line"><span>  uint8_t valenc = _intsetValueEncoding(value);</span></span>
<span class="line"><span>  uint32_t pos;</span></span>
<span class="line"><span>  if (success) *success = 1;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 如果需要升级编码，则升级编码</span></span>
<span class="line"><span>  if (valenc &gt; intrev32ifbe(is-&gt;encoding)) {</span></span>
<span class="line"><span>    /* This always succeeds, so we don&#39;t need to curry *success. */</span></span>
<span class="line"><span>    return intsetUpgradeAndAdd(is,value);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>  // 二分查找是否已经存在元素了</span></span>
<span class="line"><span>    if (intsetSearch(is,value,&amp;pos)) {</span></span>
<span class="line"><span>      if (success) *success = 0;</span></span>
<span class="line"><span>      return is;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 重新分配空间</span></span>
<span class="line"><span>    is = intsetResize(is,intrev32ifbe(is-&gt;length)+1);</span></span>
<span class="line"><span>    if (pos &lt; intrev32ifbe(is-&gt;length)) intsetMoveTail(is,pos,pos+1);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 设置值</span></span>
<span class="line"><span>  _intsetSet(is,pos,value);</span></span>
<span class="line"><span>  // 获取当前长度</span></span>
<span class="line"><span>  is-&gt;length = intrev32ifbe(intrev32ifbe(is-&gt;length)+1);</span></span>
<span class="line"><span>  return is;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div><p>可以看到插入元素很简单。</p>`,27)]))}const g=n(i,[["render",t]]);export{o as __pageData,g as default};
