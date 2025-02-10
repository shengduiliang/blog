import{_ as n,c as a,a0 as p,o as l}from"./chunks/framework.P9qPzDnn.js";const e="/assets/linkList.DspHwNzn.png",i="/assets/ZipList.CHaEXkhx.png",c="/assets/%E8%BF%9E%E9%94%81%E6%9B%B4%E6%96%B0.t38oWAlO.png",r="/assets/quicklist.003oaqXP.png",t="/assets/listpack.CTal3QhI.png",b="/assets/listpackEntry.8tTTjpC0.png",q=JSON.parse('{"title":"List实现原理与实战","description":"","frontmatter":{},"headers":[],"relativePath":"redis/list.md","filePath":"redis/list.md"}'),u={name:"redis/list.md"};function d(m,s,o,k,h,g){return l(),a("div",null,s[0]||(s[0]=[p(`<h1 id="list实现原理与实战" tabindex="-1">List实现原理与实战 <a class="header-anchor" href="#list实现原理与实战" aria-label="Permalink to &quot;List实现原理与实战&quot;">​</a></h1><p>Redis的List是一种线性的有序结构，按照元素被推入列表中的顺序存储元素，满足先进先出的需求。可以拿来作为消息队列跟栈使用。</p><p>让我们一起来看看Redis的List底层存储结构的演进路线，最后再看一下redis7.0之后List的存储结构。</p><h2 id="linkedlist-ziplist" tabindex="-1">LinkedList + ZipList <a class="header-anchor" href="#linkedlist-ziplist" aria-label="Permalink to &quot;LinkedList + ZipList&quot;">​</a></h2><p>在Redis3.2之前，Lists的底层数据结构由linkedList或者ziplist实现，我们先看看这两种数据结构。</p><h3 id="linkedlist" tabindex="-1">LinkedList <a class="header-anchor" href="#linkedlist" aria-label="Permalink to &quot;LinkedList&quot;">​</a></h3><p>LinkedList是一种内存实现的链表，具体实现代码如下:</p><div class="language-adlist.h vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">adlist.h</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>typedef struct list {</span></span>
<span class="line"><span>  // 指向链表的头节点</span></span>
<span class="line"><span>  listNode *head;</span></span>
<span class="line"><span>  // 指向链表的尾节点</span></span>
<span class="line"><span>  listNode *tail;</span></span>
<span class="line"><span>  void *(*dup)(void *ptr);</span></span>
<span class="line"><span>  void (*free)(void *ptr);</span></span>
<span class="line"><span>  int (*match)(void *ptr, void *key);</span></span>
<span class="line"><span>  // 链表中节点的长度</span></span>
<span class="line"><span>  unsigned long len;</span></span>
<span class="line"><span>} list;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>其中每个listNode节点的结构如下所示：</p><div class="language-adlist.h vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">adlist.h</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>typedef struct listNode {</span></span>
<span class="line"><span>  // 前驱节点</span></span>
<span class="line"><span>  struct listNode *prev;</span></span>
<span class="line"><span>  // 后驱节点</span></span>
<span class="line"><span>  struct listNode *next;</span></span>
<span class="line"><span>  // 指向节点的值</span></span>
<span class="line"><span>  void *value;</span></span>
<span class="line"><span>} listNode;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>下面给出一幅图介绍一下这个结构。</p><p><img src="`+e+'" alt="linkList"></p><p>这种数据结构有以下好处:</p><ul><li>双端：每个节点都有前驱节点和后驱节点，所以可以获取前后节点</li><li>无环：可以遍历整个链表</li><li>有头节点和尾节点：可以直接获取头节点和尾结点</li><li>使用Len来记录节点的数量：可以直接获取节点数量</li></ul><p>但是这种数据结构有很大的缺点:</p><ul><li>每个节点都有前驱节点和后驱节点，所以很耗空间</li><li>listNode在内存中是不连续的，遍历效率低下</li></ul><h3 id="ziplist" tabindex="-1">ZipList <a class="header-anchor" href="#ziplist" aria-label="Permalink to &quot;ZipList&quot;">​</a></h3><p>为了解决上面的问题，Redis引入了ZipList的数据结构, 当数据量很小的时候使用ZipList来存储。</p><p><img src="'+i+'" alt="ZipList"></p><p>这是一个内存紧凑的数据结构，占用一块连续的内存空间，能够提升内存效率。我们大致看一下数据结构的组成就好了。</p><ul><li>ziplist总字节数：ziplist占用的总字节数</li><li>最后一个元素的偏移量：可以直接查找最后的元素</li><li>ziplist元素数量</li><li>所有ziplist的节点：注意就是存储了前一项的长度，跟当前项的长度，所以也是可以从头部和尾部开始查找的</li><li>结束符</li></ul><p>补充一下encoding编码，ziplist为了省空间，会根据数据类型是int还是字符串来分配不同的储存类型。</p><p>zipList虽然内存紧凑，但是也有以下的缺点：</p><ul><li>不能保存过多的节点数据，否则查询性能会大大降低</li><li>插入元素有连锁更新的问题，每次插入一个元素，都要遍历后面所有的元素修改前一项的长度。</li></ul><p><strong>连锁更新</strong></p><p><img src="'+c+`" alt="连锁更新"></p><p>这里需要讲解一下，每个ziplist的节点都存储了前一个元素的长度</p><ul><li>如果前一个元素的长度小于254，那么就用一个字节存储</li><li>如果前一个元素的长度大于等于254，需要用一个标识（1个字节）标识，后面4字节记录长度</li></ul><p>当插入entryA的时候，entryB的前一个元素可能会变化，那么记录前一个元素长度的标记会变化，就是entryB的长度会变化，那么会更新entryC，以此类推。</p><h3 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h3><p>Redis3.2之前，当Lists对象满足以下两个条件的时候，将使用ziplist存储，否则用linklist</p><ul><li>链表中每个元素的占用的字节数小于64</li><li>链表的元素数据小于512个</li></ul><h2 id="quicklist-ziplist" tabindex="-1">QuickList + ZipList <a class="header-anchor" href="#quicklist-ziplist" aria-label="Permalink to &quot;QuickList + ZipList&quot;">​</a></h2><p>连锁更新会导致多次重新分配Ziplist的内存空间，直接影响zipList的查询性能，所以在redis3.2中，引入了quicklist这个数据结构。</p><p>让我门看一下quicklist这个数据结构的代码</p><div class="language-quicklist.h vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">quicklist.h</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>typedef struct quicklist {</span></span>
<span class="line"><span>  // 指向头节点的指针</span></span>
<span class="line"><span>  quicklistNode *head;</span></span>
<span class="line"><span>  // 指向尾节点的直接</span></span>
<span class="line"><span>  quicklistNode *tail;</span></span>
<span class="line"><span>  // entry个数</span></span>
<span class="line"><span>  unsigned long count;</span></span>
<span class="line"><span>  // zipList的个数</span></span>
<span class="line"><span>  unsigned long len;</span></span>
<span class="line"><span>  signed int fill : QL_FILL_BITS;       /* fill factor for individual nodes */</span></span>
<span class="line"><span>  unsigned int compress : QL_COMP_BITS; /* depth of end nodes not to compress;0=off */</span></span>
<span class="line"><span>  unsigned int bookmark_count: QL_BM_BITS;</span></span>
<span class="line"><span>  // 给元素加标签，实现随机访问的效果</span></span>
<span class="line"><span>  quicklistBookmark bookmarks[];</span></span>
<span class="line"><span>} quicklist;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>下面看看quicklistNode的定义:</p><div class="language-quicklist.h vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">quicklist.h</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>typedef struct quicklistNode {</span></span>
<span class="line"><span>  // 前驱节点</span></span>
<span class="line"><span>  struct quicklistNode *prev;</span></span>
<span class="line"><span>  // 后驱节点</span></span>
<span class="line"><span>  struct quicklistNode *next;</span></span>
<span class="line"><span>  // 执行ziplist的指针</span></span>
<span class="line"><span>  unsigned char *entry;</span></span>
<span class="line"><span>  size_t sz;             /* entry size in bytes */</span></span>
<span class="line"><span>  unsigned int count : 16;     /* count of items in listpack */</span></span>
<span class="line"><span>  unsigned int encoding : 2;   /* RAW==1 or LZF==2 */</span></span>
<span class="line"><span>  unsigned int container : 2;  /* PLAIN==1 or PACKED==2 */</span></span>
<span class="line"><span>  unsigned int recompress : 1; /* was this node previous compressed? */</span></span>
<span class="line"><span>  unsigned int attempted_compress : 1; /* node can&#39;t compress; too small */</span></span>
<span class="line"><span>  unsigned int dont_compress : 1; /* prevent compression of entry that will be used later */</span></span>
<span class="line"><span>  unsigned int extra : 9; /* more bits to steal for future usage */</span></span>
<span class="line"><span>} quicklistNode;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>下面这幅图给出quickList的结构。</p><p><img src="`+r+'" alt="quicklist"></p><p>quicklist是ziplist的升级版，优化的关键点在于控制每个ziplist的大小或者元素</p><ul><li>每个quicklistNode的ziplist过小，会退化成linklist</li><li>每个quicklistNode的ziplist过大，连锁更新的问题没有解决</li></ul><p>redis提供了list-max-ziplist-size -2，当list-max-ziplist-size为负数时会限制每个quicklistNode的ziplist内存大小，超过这个大小就会使用linklist储存，这只是替换每个quicklistNode里面的ziplist。</p><ul><li>-5: 每个quicklistNode的ziplist大小限制为64kb</li><li>-4: 每个quicklistNode的ziplist大小限制为32kb</li><li>-3: 每个quicklistNode的ziplist大小限制为16kb (可能不推荐)</li><li>-2: 每个quicklistNode的ziplist大小限制为8kb （不错）</li><li>-1: 每个quicklistNode的ziplist大小限制为4kb （不错）</li></ul><p>但是这个结构也有问题，由于用户上报了一个问题，但是作者没有找到原因，怀疑是ziplist的连锁更新导致的。于是设置出了新的数据类型。</p><h2 id="quicklist-listpack" tabindex="-1">Quicklist + ListPack <a class="header-anchor" href="#quicklist-listpack" aria-label="Permalink to &quot;Quicklist + ListPack&quot;">​</a></h2><p>redis7.0之后采用Quicklist + ListPack的方式进行储存List的数据。其实listpack的数据结构跟ziplist很像，可以大致看一下。</p><p><img src="'+t+'" alt="listpack"></p><p>可以看到没有指向头尾指针节点，但是listpack也是支持从前往后，或者从后往前遍历的。</p><p>接下来就是listpack跟ziplist的最大不同了，listpack不是记录前一个元素的长度，而是记录当前元素的长度。这样在插入元素的时候，不用更新后面的数据的长度了。</p><p><img src="'+b+`" alt="listpackEntry"></p><h2 id="源码分析" tabindex="-1">源码分析 <a class="header-anchor" href="#源码分析" aria-label="Permalink to &quot;源码分析&quot;">​</a></h2><p>接下来，我们就看一下List数据结构的实现，通过Quicklist + ListPack的方式实现。以LPUSH执行为例，查表可以知道使用的是lpushCommand方法处理。</p><div class="language-t_list.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">t_list.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void lpushCommand(client *c) {</span></span>
<span class="line"><span>  pushGenericCommand(c,LIST_HEAD,0);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>void pushGenericCommand(client *c, int where, int xx) {</span></span>
<span class="line"><span>  int j;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 查找需要写的key是否存在</span></span>
<span class="line"><span>  robj *lobj = lookupKeyWrite(c-&gt;db, c-&gt;argv[1]);</span></span>
<span class="line"><span>  // 如果key存在，判断类型是否正常</span></span>
<span class="line"><span>  if (checkType(c,lobj,OBJ_LIST)) return;</span></span>
<span class="line"><span>  // 如果不存在</span></span>
<span class="line"><span>  if (!lobj) {</span></span>
<span class="line"><span>    if (xx) {</span></span>
<span class="line"><span>        addReply(c, shared.czero);</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 新建一个quicklist对象  </span></span>
<span class="line"><span>    lobj = createQuicklistObject();</span></span>
<span class="line"><span>    // 可以看到这里跟list-max-ziplist-size很像，就是查看是否要新建listpackNode的</span></span>
<span class="line"><span>    quicklistSetOptions(lobj-&gt;ptr, server.list_max_listpack_size,</span></span>
<span class="line"><span>                        server.list_compress_depth);</span></span>
<span class="line"><span>    // 添加到数据库中</span></span>
<span class="line"><span>    dbAdd(c-&gt;db,c-&gt;argv[1],lobj);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 插入元素</span></span>
<span class="line"><span>  for (j = 2; j &lt; c-&gt;argc; j++) {</span></span>
<span class="line"><span>      listTypePush(lobj,c-&gt;argv[j],where);</span></span>
<span class="line"><span>      server.dirty++;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 响应请求</span></span>
<span class="line"><span>  addReplyLongLong(c, listTypeLength(lobj));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  char *event = (where == LIST_HEAD) ? &quot;lpush&quot; : &quot;rpush&quot;;</span></span>
<span class="line"><span>  signalModifiedKey(c,c-&gt;db,c-&gt;argv[1]);</span></span>
<span class="line"><span>  notifyKeyspaceEvent(NOTIFY_LIST,event,c-&gt;argv[1],c-&gt;db-&gt;id);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br></div></div><p>可以先看一下createQuicklistObject是怎么创建quicklist的</p><div class="language-object.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">object.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>robj *createQuicklistObject(void) {</span></span>
<span class="line"><span>  quicklist *l = quicklistCreate();</span></span>
<span class="line"><span>  robj *o = createObject(OBJ_LIST,l);</span></span>
<span class="line"><span>  o-&gt;encoding = OBJ_ENCODING_QUICKLIST;</span></span>
<span class="line"><span>  return o;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>quicklist *quicklistCreate(void) {</span></span>
<span class="line"><span>  struct quicklist *quicklist;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  quicklist = zmalloc(sizeof(*quicklist));</span></span>
<span class="line"><span>  quicklist-&gt;head = quicklist-&gt;tail = NULL;</span></span>
<span class="line"><span>  quicklist-&gt;len = 0;</span></span>
<span class="line"><span>  quicklist-&gt;count = 0;</span></span>
<span class="line"><span>  quicklist-&gt;compress = 0;</span></span>
<span class="line"><span>  quicklist-&gt;fill = -2;</span></span>
<span class="line"><span>  quicklist-&gt;bookmark_count = 0;</span></span>
<span class="line"><span>  return quicklist;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><p>可以看到只是初始化了一个quicklist结构体，前面提到所有的val都是用redisObject存储的，所以基于quicklist创建了一个redisObject。</p><p>再看元素插入的代码。</p><div class="language-t_list.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">t_list.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void listTypePush(robj *subject, robj *value, int where) {</span></span>
<span class="line"><span>  if (subject-&gt;encoding == OBJ_ENCODING_QUICKLIST) {</span></span>
<span class="line"><span>    // 插入为止是队头还是队尾</span></span>
<span class="line"><span>    int pos = (where == LIST_HEAD) ? QUICKLIST_HEAD : QUICKLIST_TAIL;</span></span>
<span class="line"><span>    if (value-&gt;encoding == OBJ_ENCODING_INT) {</span></span>
<span class="line"><span>        char buf[32];</span></span>
<span class="line"><span>        ll2string(buf, 32, (long)value-&gt;ptr);</span></span>
<span class="line"><span>        quicklistPush(subject-&gt;ptr, buf, strlen(buf), pos);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>        quicklistPush(subject-&gt;ptr, value-&gt;ptr, sdslen(value-&gt;ptr), pos);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>      serverPanic(&quot;Unknown list encoding&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>跟进quicklistPush的实现</p><div class="language-quicklist.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">quicklist.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>void quicklistPush(quicklist *quicklist, void *value, const size_t sz,</span></span>
<span class="line"><span>                   int where) {</span></span>
<span class="line"><span>  if (where == QUICKLIST_HEAD) {</span></span>
<span class="line"><span>      quicklistPushHead(quicklist, value, sz);</span></span>
<span class="line"><span>  } else if (where == QUICKLIST_TAIL) {</span></span>
<span class="line"><span>      quicklistPushTail(quicklist, value, sz);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>int quicklistPushHead(quicklist *quicklist, void *value, size_t sz) {</span></span>
<span class="line"><span>    quicklistNode *orig_head = quicklist-&gt;head;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  if (unlikely(isLargeElement(sz))) {</span></span>
<span class="line"><span>      __quicklistInsertPlainNode(quicklist, quicklist-&gt;head, value, sz, 0);</span></span>
<span class="line"><span>      return 1;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  //  根据list_max_listpack_size决定是否要新建元素</span></span>
<span class="line"><span>  if (likely(</span></span>
<span class="line"><span>          _quicklistNodeAllowInsert(quicklist-&gt;head, quicklist-&gt;fill, sz))) {</span></span>
<span class="line"><span>      // 插入元素</span></span>
<span class="line"><span>      quicklist-&gt;head-&gt;entry = lpPrepend(quicklist-&gt;head-&gt;entry, value, sz);</span></span>
<span class="line"><span>      quicklistNodeUpdateSz(quicklist-&gt;head);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>      quicklistNode *node = quicklistCreateNode();</span></span>
<span class="line"><span>      // 插入元素</span></span>
<span class="line"><span>      node-&gt;entry = lpPrepend(lpNew(0), value, sz);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      quicklistNodeUpdateSz(node);</span></span>
<span class="line"><span>      _quicklistInsertNodeBefore(quicklist, quicklist-&gt;head, node);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  quicklist-&gt;count++;</span></span>
<span class="line"><span>  quicklist-&gt;head-&gt;count++;</span></span>
<span class="line"><span>  return (orig_head != quicklist-&gt;head);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br></div></div><p>跟进插入元素实现。</p><div class="language-listpack.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">listpack.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>/* Append the specified element &#39;s&#39; of length &#39;slen&#39; at the head of the listpack. */</span></span>
<span class="line"><span>unsigned char *lpPrepend(unsigned char *lp, unsigned char *s, uint32_t slen) {</span></span>
<span class="line"><span>  unsigned char *p = lpFirst(lp);</span></span>
<span class="line"><span>  if (!p) return lpAppend(lp, s, slen);</span></span>
<span class="line"><span>  return lpInsert(lp, s, NULL, slen, p, LP_BEFORE, NULL);</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>unsigned char *lpAppend(unsigned char *lp, unsigned char *ele, uint32_t size) {</span></span>
<span class="line"><span>  uint64_t listpack_bytes = lpGetTotalBytes(lp);</span></span>
<span class="line"><span>  unsigned char *eofptr = lp + listpack_bytes - 1;</span></span>
<span class="line"><span>  return lpInsert(lp,ele,NULL,size,eofptr,LP_BEFORE,NULL);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>可以看到lpAppend底层也是调用了lpInsert实现，接下来看这个函数的实现</p><div class="language-listpack.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">listpack.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>unsigned char *lpInsert(unsigned char *lp, unsigned char *elestr, unsigned char *eleint,</span></span>
<span class="line"><span>                        uint32_t size, unsigned char *p, int where, unsigned char **newp)</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>  if (!delete) {</span></span>
<span class="line"><span>    // 如果是LP_ENCODING_INT编码，直接考本</span></span>
<span class="line"><span>    if (enctype == LP_ENCODING_INT) {</span></span>
<span class="line"><span>        memcpy(dst,eleint,enclen);</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>        lpEncodeString(dst,elestr,size);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    dst += enclen;</span></span>
<span class="line"><span>    memcpy(dst,backlen,backlen_size);</span></span>
<span class="line"><span>    dst += backlen_size;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>可以看到直接是写到listpack的内存里面，注意就是针对listpack的entry结构体，redis是没有定义结构体的，我们看lpEncodeString的实现：</p><div class="language-listpack.c vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">listpack.c</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>static inline void lpEncodeString(unsigned char *buf, unsigned char *s, uint32_t len) {</span></span>
<span class="line"><span>  if (len &lt; 64) {</span></span>
<span class="line"><span>    buf[0] = len | LP_ENCODING_6BIT_STR;</span></span>
<span class="line"><span>    // 拷贝内容</span></span>
<span class="line"><span>    memcpy(buf+1,s,len);</span></span>
<span class="line"><span>  } else if (len &lt; 4096) {</span></span>
<span class="line"><span>    buf[0] = (len &gt;&gt; 8) | LP_ENCODING_12BIT_STR;</span></span>
<span class="line"><span>    buf[1] = len &amp; 0xff;</span></span>
<span class="line"><span>    memcpy(buf+2,s,len);</span></span>
<span class="line"><span>  } else {</span></span>
<span class="line"><span>    buf[0] = LP_ENCODING_32BIT_STR;</span></span>
<span class="line"><span>    buf[1] = len &amp; 0xff;</span></span>
<span class="line"><span>    buf[2] = (len &gt;&gt; 8) &amp; 0xff;</span></span>
<span class="line"><span>    buf[3] = (len &gt;&gt; 16) &amp; 0xff;</span></span>
<span class="line"><span>    buf[4] = (len &gt;&gt; 24) &amp; 0xff;</span></span>
<span class="line"><span>    memcpy(buf+5,s,len);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>可以看到对于不同长度的val，有不同的编码实现，这里就不细讲了。</p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>虽然redis7.0已经不用LinkedList来存储Lists数据了，但是LinkedList还用在其他地方，比如事件循环，发布订阅机制等</p></div>`,69)]))}const L=n(u,[["render",d]]);export{q as __pageData,L as default};
