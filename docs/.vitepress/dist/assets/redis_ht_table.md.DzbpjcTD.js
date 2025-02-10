import{_ as n,c as a,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const l="/assets/redisDb.D3M8FmF5.png",i="/assets/ht_table.BP2h7E3u.png",o=JSON.parse('{"title":"全局散列表","description":"","frontmatter":{},"headers":[],"relativePath":"redis/ht_table.md","filePath":"redis/ht_table.md"}'),r={name:"redis/ht_table.md"};function c(t,s,b,d,u,h){return e(),a("div",null,s[0]||(s[0]=[p('<h1 id="全局散列表" tabindex="-1">全局散列表 <a class="header-anchor" href="#全局散列表" aria-label="Permalink to &quot;全局散列表&quot;">​</a></h1><p>这篇文章给大家介绍Redis储存所有键值对的底层数据结构-散列表。</p><p>首先我们回顾一下Redis的数据结构存储原理，这里从redisDb开始画起。</p><img src="'+l+'" width="400" alt="redisDb"><p>由于redis默认有16个数据库，所以会有16个redisDb结构，</p><h2 id="散列表" tabindex="-1">散列表 <a class="header-anchor" href="#散列表" aria-label="Permalink to &quot;散列表&quot;">​</a></h2><p>现在我们画一下Redis对应的ht_table指向的数据结构。。</p><p><img src="'+i+`" alt="ht_table"></p><p>可以看到Redis是使用散列表来存储所有的键值对的。一个简单的散列表就是一个数组，数组中的每个元素就是一个哈希桶，当插入一个键值对的时候，会根据hash算法，然后找到一个桶来存放键值对，如果对应的哈希桶中已经有元素了，那么将会使用拉链法来增加元素，新增加的元素则作为表头。</p><p>下面我们结合源码查看一下，往redisDb插入一个键值对的实现在db.c, 代码如下：</p><div class="language-db.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">db.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void dbAdd(redisDb *db, robj *key, robj *val) {</span></span>
<span class="line"><span>  // 将key-&gt;ptr封装成一个sds</span></span>
<span class="line"><span>  sds copy = sdsdup(key-&gt;ptr);</span></span>
<span class="line"><span>  // 根据key获取到一个dictEntry，用来存放val，这里已经插入元素了</span></span>
<span class="line"><span>  dictEntry *de = dictAddRaw(db-&gt;dict, copy, NULL);</span></span>
<span class="line"><span>  // 讲val设置到dictEntry的val中</span></span>
<span class="line"><span>  dictSetVal(db-&gt;dict, de, val);</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>可以看到核心代码是dictAddRaw方法，我们继续跟进这个方法。</p><div class="language-dict.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">dict.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>dictEntry *dictAddRaw(dict *d, void *key, dictEntry **existing) {</span></span>
<span class="line"><span>  // dictHashKey对key做hash运算，查看是否需要扩容，返回key要插入的ht_table下标</span></span>
<span class="line"><span>  if ((index = _dictKeyIndex(d, key, dictHashKey(d,key), existing)) == -1)</span></span>
<span class="line"><span>      return NULL;</span></span>
<span class="line"><span>  // 分配dictEntry内存</span></span>
<span class="line"><span>  entry = zmalloc(sizeof(*entry) + metasize);</span></span>
<span class="line"><span>  if (metasize &gt; 0) {</span></span>
<span class="line"><span>      memset(dictMetadata(entry), 0, metasize);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 把dictEntry的next指针指向ht_table[htidx][index]</span></span>
<span class="line"><span>  entry-&gt;next = d-&gt;ht_table[htidx][index];</span></span>
<span class="line"><span>  // 把dictEntry放到d-&gt;ht_table[htidx][index]中</span></span>
<span class="line"><span>  d-&gt;ht_table[htidx][index] = entry;</span></span>
<span class="line"><span>  d-&gt;ht_used[htidx]++;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 设置dictEntry的key */</span></span>
<span class="line"><span>  dictSetKey(d, entry, key);</span></span>
<span class="line"><span>  return entry;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><h2 id="扩容和缩容" tabindex="-1">扩容和缩容 <a class="header-anchor" href="#扩容和缩容" aria-label="Permalink to &quot;扩容和缩容&quot;">​</a></h2><p>上面的哈希表数据结构有个很大的缺陷，因为是使用拉链法来处理哈希冲突的，所以如果插入的键值对，如果大量元素同时插入一个哈希桶，那么整个哈希表会慢慢退化成一个链表，这样在遍历元素的时候时间复杂度会变成O(n)。</p><h3 id="rehash机制" tabindex="-1">rehash机制 <a class="header-anchor" href="#rehash机制" aria-label="Permalink to &quot;rehash机制&quot;">​</a></h3><p>为了解决这个性能过低的问题，可以使用rehash操作来扩大hash表空间，为了讲解redis的rehash操作，我们回看dict的结构体定义。</p><div class="language-dict.h vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">dict.h</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>struct dict {</span></span>
<span class="line"><span>  /* 指向一个dictType的指针，表示字典的类型 */</span></span>
<span class="line"><span>  dictType *type;   </span></span>
<span class="line"><span>  /* 大小为2的散列表数组，记录实际的所有key-value。通常ht_table[0]用来存储数据，当进行rehash的时候使用ht_table[1]配合完成 /*</span></span>
<span class="line"><span>  dictEntry **ht_table[2];</span></span>
<span class="line"><span>  /* 两个散列表的使用情况，表示当前散列表已经使用的槽位数量 */</span></span>
<span class="line"><span>  unsigned long ht_used[2];  </span></span>
<span class="line"><span>  /* 正在rehash操作的索引位置，如果是-1，表明没有进行rehash操作 */</span></span>
<span class="line"><span>  long rehashidx;</span></span>
<span class="line"><span>  /* 大于0时表示停止rehash*/</span></span>
<span class="line"><span>  int16_t pauserehash;</span></span>
<span class="line"><span>  /* 两个散列表的大小，以2的指数形式存储 */</span></span>
<span class="line"><span>  signed char ht_size_exp[2];</span></span>
<span class="line"><span>};</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>可以看到dict定义了2个ht_table，接下来我们就看看redis的rehash操作流程。</p><ul><li>在正常服务请求阶段，所有的键值对写入ht_table[0]</li><li>当进行rehash的时候，所有的键值对从ht_table[0]迁移到ht_table[1]中，而新增的元素也被放入ht_table[1]，这个时候对元素的查询，将先从ht_table[0]读取，如果ht_table[0]找不到，再从ht_table[1]读取</li><li>迁移完成后，释放ht_table[0]的空间，然后将ht_table[1]的值赋值给ht_table[0]，后面就可以只从ht_table[0]进行读取和写入了。</li></ul><h3 id="扩容条件" tabindex="-1">扩容条件 <a class="header-anchor" href="#扩容条件" aria-label="Permalink to &quot;扩容条件&quot;">​</a></h3><p>了解这个rehash扩容机制后，我们结合源代码查看一下redis是怎么做的,回到刚才的dictAddRaw函数。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>dictEntry *dictAddRaw(dict *d, void *key, dictEntry **existing)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  /*扩容*/</span></span>
<span class="line"><span>  if ((index = _dictKeyIndex(d, key, dictHashKey(d,key), existing)) == -1)</span></span>
<span class="line"><span>      return NULL;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 判断是否是rehashing阶段，如果是则往ht_table[1]写，否则往ht_table[0]写</span></span>
<span class="line"><span>  htidx = dictIsRehashing(d) ? 1 : 0;</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  entry-&gt;next = d-&gt;ht_table[htidx][index];</span></span>
<span class="line"><span>  d-&gt;ht_table[htidx][index] = entry;</span></span>
<span class="line"><span>  d-&gt;ht_used[htidx]++;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* Set the hash entry fields. */</span></span>
<span class="line"><span>  dictSetKey(d, entry, key);</span></span>
<span class="line"><span>  return entry;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>我们跟进_dictKeyIndex这个函数查看代码</p><div class="language-dict.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">dict.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>static long _dictKeyIndex(dict *d, const void *key, uint64_t hash, dictEntry **existing)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  unsigned long idx, table;</span></span>
<span class="line"><span>  dictEntry *he;</span></span>
<span class="line"><span>  if (existing) *existing = NULL;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* Expand the hash table if needed */</span></span>
<span class="line"><span>  if (_dictExpandIfNeeded(d) == DICT_ERR)</span></span>
<span class="line"><span>      return -1;</span></span>
<span class="line"><span>  // 可以看到是遍历ht_table来查看一个key是否存在的</span></span>
<span class="line"><span>  for (table = 0; table &lt;= 1; table++) {</span></span>
<span class="line"><span>    idx = hash &amp; DICTHT_SIZE_MASK(d-&gt;ht_size_exp[table]);</span></span>
<span class="line"><span>    /* Search if this slot does not already contain the given key */</span></span>
<span class="line"><span>    he = d-&gt;ht_table[table][idx];</span></span>
<span class="line"><span>    while(he) {</span></span>
<span class="line"><span>      if (key==he-&gt;key || dictCompareKeys(d, key, he-&gt;key)) {</span></span>
<span class="line"><span>          if (existing) *existing = he;</span></span>
<span class="line"><span>          return -1;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      he = he-&gt;next;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果不是rehashing阶段，不用看ht_table[1]了</span></span>
<span class="line"><span>    if (!dictIsRehashing(d)) break;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return idx;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div><p>_dictExpandIfNeeded这个函数就是查看是否需要扩容的，我们看一下具体的逻辑是怎么样的</p><div class="language-dict.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">dict.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/* Expand the hash table if needed */</span></span>
<span class="line"><span>static int _dictExpandIfNeeded(dict *d)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  // 如果处于Rehashing阶段，那么就直接返回</span></span>
<span class="line"><span>  if (dictIsRehashing(d)) return DICT_OK;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 如果现在哈希桶的个数为0，说明还没有初始化，那么就rehash</span></span>
<span class="line"><span>  if (DICTHT_SIZE(d-&gt;ht_size_exp[0]) == 0) return dictExpand(d, DICT_HT_INITIAL_SIZE);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 判断是否需要扩容 */</span></span>
<span class="line"><span>  if ((dict_can_resize == DICT_RESIZE_ENABLE &amp;&amp;</span></span>
<span class="line"><span>      d-&gt;ht_used[0] &gt;= DICTHT_SIZE(d-&gt;ht_size_exp[0])) ||</span></span>
<span class="line"><span>    (dict_can_resize != DICT_RESIZE_FORBID &amp;&amp;</span></span>
<span class="line"><span>      d-&gt;ht_used[0] / DICTHT_SIZE(d-&gt;ht_size_exp[0]) &gt; dict_force_resize_ratio))</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    if (!dictTypeExpandAllowed(d))</span></span>
<span class="line"><span>        return DICT_OK;</span></span>
<span class="line"><span>    return dictExpand(d, d-&gt;ht_used[0] + 1);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return DICT_OK;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>可以看到有三种条件可以触发rehash，如下：</p><ul><li>ht_table[0]的大小为0</li><li>dict_can_resize == DICT_RESIZE_ENABLE，并且ht_table[0]承载的元素个数已经超过了ht_table[0]的大小，并且允许扩容</li><li>dict_can_resize != DICT_RESIZE_FORBID, 并且并且ht_table[0]承载的元素个数已经超过了ht_table[0]大小的dict_force_resize_ratio倍，其中dict_force_resize_ratio的默认值是5</li></ul><p>我们可以看一下dict_can_resize的赋值，全局搜索一下，可以看到是在dictSetResizeEnabled赋值的</p><div class="language-dict.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">dict.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void dictSetResizeEnabled(dictResizeEnable enable) {</span></span>
<span class="line"><span>  dict_can_resize = enable;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>再看看调用dictSetResizeEnabled的地方，</p><div class="language-server.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">server.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void updateDictResizePolicy(void) {</span></span>
<span class="line"><span>  if (server.in_fork_child != CHILD_TYPE_NONE)</span></span>
<span class="line"><span>    dictSetResizeEnabled(DICT_RESIZE_FORBID);</span></span>
<span class="line"><span>  else if (hasActiveChildProcess())</span></span>
<span class="line"><span>    dictSetResizeEnabled(DICT_RESIZE_AVOID);</span></span>
<span class="line"><span>  else</span></span>
<span class="line"><span>    dictSetResizeEnabled(DICT_RESIZE_ENABLE);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>可以看到如果是处于子线程创建的过程中，则禁止rehash，如果子线程在工作的过程中，则避免rehash，其他情况可以rehash</p><p>大概看一下hasActiveChildProcess的注释吧, 表明没有RDB保存或者AOF重写等子线程工作的时候。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/* Return true if there are active children processes doing RDB saving,</span></span>
<span class="line"><span> * AOF rewriting, or some side process spawned by a loaded module. */</span></span>
<span class="line"><span>int hasActiveChildProcess() {</span></span>
<span class="line"><span>    return server.child_pid != -1;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><h3 id="扩容大小" tabindex="-1">扩容大小 <a class="header-anchor" href="#扩容大小" aria-label="Permalink to &quot;扩容大小&quot;">​</a></h3><p>具体每次扩容扩容多大呢，我们直接回看_dictExpandIfNeeded函数。</p><div class="language-dict.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">dict.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/* Expand the hash table if needed */</span></span>
<span class="line"><span>static int _dictExpandIfNeeded(dict *d)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  // 如果处于Rehashing阶段，那么就直接返回</span></span>
<span class="line"><span>  if (dictIsRehashing(d)) return DICT_OK;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 如果现在哈希桶的个数为0，说明还没有初始化，那么就rehash</span></span>
<span class="line"><span>  if (DICTHT_SIZE(d-&gt;ht_size_exp[0]) == 0) return dictExpand(d, DICT_HT_INITIAL_SIZE);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* 判断是否需要扩容 */</span></span>
<span class="line"><span>  if ((dict_can_resize == DICT_RESIZE_ENABLE &amp;&amp;</span></span>
<span class="line"><span>      d-&gt;ht_used[0] &gt;= DICTHT_SIZE(d-&gt;ht_size_exp[0])) ||</span></span>
<span class="line"><span>    (dict_can_resize != DICT_RESIZE_FORBID &amp;&amp;</span></span>
<span class="line"><span>      d-&gt;ht_used[0] / DICTHT_SIZE(d-&gt;ht_size_exp[0]) &gt; dict_force_resize_ratio))</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>    if (!dictTypeExpandAllowed(d))</span></span>
<span class="line"><span>        return DICT_OK;</span></span>
<span class="line"><span>    return dictExpand(d, d-&gt;ht_used[0] + 1);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return DICT_OK;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>可以看到是调用dictExpand这个方法来扩容的，那么我们就看这个方法</p><div class="language-dict.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">dict.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int dictExpand(dict *d, unsigned long size) {</span></span>
<span class="line"><span>  return _dictExpand(d, size, NULL);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>int _dictExpand(dict *d, unsigned long size, int* malloc_failed) {</span></span>
<span class="line"><span>  // 可以看到新的size就是1 &lt;&lt; _dictNextExp(size)</span></span>
<span class="line"><span>  signed char new_ht_size_exp = _dictNextExp(size);</span></span>
<span class="line"><span>  size_t newsize = 1ul&lt;&lt;new_ht_size_exp;</span></span>
<span class="line"><span>  new_ht_table = zcalloc(newsize*sizeof(dictEntry*));</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>static signed char _dictNextExp(unsigned long size)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  // DICT_HT_INITIAL_SIZE: 2</span></span>
<span class="line"><span>  // DICT_HT_INITIAL_EXP为4</span></span>
<span class="line"><span>  if (size &lt;= DICT_HT_INITIAL_SIZE) return DICT_HT_INITIAL_EXP;</span></span>
<span class="line"><span>  if (size &gt;= LONG_MAX) return (8*sizeof(long)-1);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  return 8*sizeof(long) - __builtin_clzl(size-1);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>可以看到新的哈希桶的大小可以认为就是dictExpand传入的size值，这里给出说明：</p><ul><li>如果哈希桶没有元素，那么就初始化一个1的4次方，则是16个元素大小的哈希桶</li><li>如果哈希桶有元素，那么新的哈希桶的元素就是之前哈希桶的2倍</li></ul><div class="info custom-block"><p class="custom-block-title">INFO</p><p>如果是缩容，则每次分配的空间都是之前空间大小的一半</p></div><h3 id="渐进式rehash" tabindex="-1">渐进式rehash <a class="header-anchor" href="#渐进式rehash" aria-label="Permalink to &quot;渐进式rehash&quot;">​</a></h3><p>由于rehash操作是在主线程上进行，如果一次迁移所有的键值对，会影响redis的整体性能，所以redis采用了渐进式rehash的做法。</p><p>渐进式hash指的是每次rehash的时候会分批迁移ht_hable中哈希桶的元素，我们来看一下迁移函数的实现</p><div class="language-dict.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">dict.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>int dictRehash(dict *d, int n) {</span></span>
<span class="line"><span>  int empty_visits = n*10; /* Max number of empty buckets to visit. */</span></span>
<span class="line"><span>  unsigned long s0 = DICTHT_SIZE(d-&gt;ht_size_exp[0]);</span></span>
<span class="line"><span>  unsigned long s1 = DICTHT_SIZE(d-&gt;ht_size_exp[1]);</span></span>
<span class="line"><span>  if (dict_can_resize == DICT_RESIZE_FORBID || !dictIsRehashing(d)) return 0;</span></span>
<span class="line"><span>  if (dict_can_resize == DICT_RESIZE_AVOID &amp;&amp; </span></span>
<span class="line"><span>      ((s1 &gt; s0 &amp;&amp; s1 / s0 &lt; dict_force_resize_ratio) ||</span></span>
<span class="line"><span>        (s1 &lt; s0 &amp;&amp; s0 / s1 &lt; dict_force_resize_ratio)))</span></span>
<span class="line"><span>  {</span></span>
<span class="line"><span>      return 0;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  while(n-- &amp;&amp; d-&gt;ht_used[0] != 0) {</span></span>
<span class="line"><span>      dictEntry *de, *nextde;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      /* Note that rehashidx can&#39;t overflow as we are sure there are more</span></span>
<span class="line"><span>        * elements because ht[0].used != 0 */</span></span>
<span class="line"><span>      assert(DICTHT_SIZE(d-&gt;ht_size_exp[0]) &gt; (unsigned long)d-&gt;rehashidx);</span></span>
<span class="line"><span>      // 如果这些哈希桶都是空，那么在遍历完empty_visits大小数量的桶之后就会退出</span></span>
<span class="line"><span>      while(d-&gt;ht_table[0][d-&gt;rehashidx] == NULL) {</span></span>
<span class="line"><span>          d-&gt;rehashidx++;</span></span>
<span class="line"><span>          if (--empty_visits == 0) return 1;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      de = d-&gt;ht_table[0][d-&gt;rehashidx];</span></span>
<span class="line"><span>      /* Move all the keys in this bucket from the old to the new hash HT */</span></span>
<span class="line"><span>      // 把整个桶的元素迁移过去</span></span>
<span class="line"><span>      while(de) {</span></span>
<span class="line"><span>          uint64_t h;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>          nextde = de-&gt;next;</span></span>
<span class="line"><span>          /* Get the index in the new hash table */</span></span>
<span class="line"><span>          h = dictHashKey(d, de-&gt;key) &amp; DICTHT_SIZE_MASK(d-&gt;ht_size_exp[1]);</span></span>
<span class="line"><span>          de-&gt;next = d-&gt;ht_table[1][h];</span></span>
<span class="line"><span>          d-&gt;ht_table[1][h] = de;</span></span>
<span class="line"><span>          d-&gt;ht_used[0]--;</span></span>
<span class="line"><span>          d-&gt;ht_used[1]++;</span></span>
<span class="line"><span>          de = nextde;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      d-&gt;ht_table[0][d-&gt;rehashidx] = NULL;</span></span>
<span class="line"><span>      d-&gt;rehashidx++;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* Check if we already rehashed the whole table... */</span></span>
<span class="line"><span>  if (d-&gt;ht_used[0] == 0) {</span></span>
<span class="line"><span>      zfree(d-&gt;ht_table[0]);</span></span>
<span class="line"><span>      /* Copy the new ht onto the old one */</span></span>
<span class="line"><span>      d-&gt;ht_table[0] = d-&gt;ht_table[1];</span></span>
<span class="line"><span>      d-&gt;ht_used[0] = d-&gt;ht_used[1];</span></span>
<span class="line"><span>      d-&gt;ht_size_exp[0] = d-&gt;ht_size_exp[1];</span></span>
<span class="line"><span>      _dictReset(d, 1);</span></span>
<span class="line"><span>      d-&gt;rehashidx = -1;</span></span>
<span class="line"><span>      return 0;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /* More to rehash... */</span></span>
<span class="line"><span>  return 1;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br></div></div><p>我们看一下有哪些地方调用了dictRehash函数。可以看到有两个地方调用了</p><ul><li>在键值对的增删查改的时候，会调用dictRehash(d,1), 每次处理1个哈希桶</li><li>databasesCron -&gt; incrementallyRehash -&gt; dictRehashMilliseconds中，每次调用dictRehash(d,100)处理100个哈希桶</li></ul>`,50)]))}const _=n(r,[["render",c]]);export{o as __pageData,_ as default};
