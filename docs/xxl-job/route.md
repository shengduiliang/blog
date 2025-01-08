# 路由选择策略

上一篇我们在介绍定时任务执行流程的时候，在processTrigger章节有提到了路由策略如果不是分片广播策略，那么就会根据定时任务设置的路由选择策略选取执行器的地址。

``` XxlJobTrigger
public class XxlJobTrigger {
  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {
    ExecutorRouteStrategyEnum executorRouteStrategyEnum = ExecutorRouteStrategyEnum.match(jobInfo.getExecutorRouteStrategy(), null); 

    // 3、init address
    String address = null;
    ReturnT<String> routeAddressResult = null;
    if (group.getRegistryList()!=null && !group.getRegistryList().isEmpty()) {
      if (ExecutorRouteStrategyEnum.SHARDING_BROADCAST == executorRouteStrategyEnum) {
        if (index < group.getRegistryList().size()) {
          address = group.getRegistryList().get(index);
        } else {
          address = group.getRegistryList().get(0);
        }
      } else {
        routeAddressResult = executorRouteStrategyEnum.getRouter().route(triggerParam, group.getRegistryList());
        if (routeAddressResult.getCode() == ReturnT.SUCCESS_CODE) {
          address = routeAddressResult.getContent();
        }
      }
    } else {
      routeAddressResult = new ReturnT<String>(ReturnT.FAIL_CODE, I18nUtil.getString("jobconf_trigger_address_empty"));
    }
  }
}
```

这章内容我们就来讲解一下XXL-JOB的路由选取策略，保证在多个执行器地址中选择其中一个地址来执行定时任务。

## ExecutorRouteStrategyEnum

想要了解XXL-JOB的路由选取策略，ExecutorRouteStrategyEnum这个类是必须了解的内容，代码如下所示:

``` ExecutorRouteStrategyEnum
public enum ExecutorRouteStrategyEnum {
  FIRST(I18nUtil.getString("jobconf_route_first"), new ExecutorRouteFirst()),
  LAST(I18nUtil.getString("jobconf_route_last"), new ExecutorRouteLast()),
  ROUND(I18nUtil.getString("jobconf_route_round"), new ExecutorRouteRound()),
  RANDOM(I18nUtil.getString("jobconf_route_random"), new ExecutorRouteRandom()),
  CONSISTENT_HASH(I18nUtil.getString("jobconf_route_consistenthash"), new ExecutorRouteConsistentHash()),
  LEAST_FREQUENTLY_USED(I18nUtil.getString("jobconf_route_lfu"), new ExecutorRouteLFU()),
  LEAST_RECENTLY_USED(I18nUtil.getString("jobconf_route_lru"), new ExecutorRouteLRU()),
  FAILOVER(I18nUtil.getString("jobconf_route_failover"), new ExecutorRouteFailover()),
  BUSYOVER(I18nUtil.getString("jobconf_route_busyover"), new ExecutorRouteBusyover()),
  SHARDING_BROADCAST(I18nUtil.getString("jobconf_route_shard"), null);

  public ExecutorRouter getRouter() {
    return router;
  }

  public static ExecutorRouteStrategyEnum match(String name, ExecutorRouteStrategyEnum defaultItem){
    if (name != null) {
        for (ExecutorRouteStrategyEnum item: ExecutorRouteStrategyEnum.values()) {
            if (item.name().equals(name)) {
                return item;
            }
        }
    }
    return defaultItem;
  }
}
```

可以看到除了SHARDING_BROADCAST分片广播策略之外，还有9种路由策略，下面做一下解释：

- FIRST（第一个）：固定选择第一个机器；
- LAST（最后一个）：固定选择最后一个机器；
- ROUND（轮询）： 轮训策略；
- RANDOM（随机）：随机选择在线的机器；
- CONSISTENT_HASH（一致性HASH）：每个任务按照Hash算法固定选择某一台机器，且所有任务均匀散列在不同机器上。
- LEAST_FREQUENTLY_USED（最不经常使用）：使用频率最低的机器优先被选举；
- LEAST_RECENTLY_USED（最近最久未使用）：最久未使用的机器优先被选举；
- FAILOVER（故障转移）：按照顺序依次进行心跳检测，第一个心跳检测成功的机器选定为目标执行器并发起调度；
- BUSYOVER（忙碌转移）：按照顺序依次进行空闲检测，第一个空闲检测成功的机器选定为目标执行器并发起调度；
- SHARDING_BROADCAST(分片广播)：广播触发对应集群中所有机器执行一次任务，同时系统自动传递分片参数；可根据分片参数开发分片任务；

下面让我们逐个分析上面这就中路由策略。

## ExecutorRouteFirst

FIRST策略比较简单，直接看代码，就是选择地址列表中的第一个地址。

``` ExecutorRouteFirst
public class ExecutorRouteFirst extends ExecutorRouter {
  @Override
  public ReturnT<String> route(TriggerParam triggerParam, List<String> addressList){
      return new ReturnT<String>(addressList.get(0));
  }
}
```

## ExecutorRouteLast

LAST策略也比较简单，直接看代码，就是选择地址列表中的最后一个地址。

``` ExecutorRouteLast
public class ExecutorRouteLast extends ExecutorRouter {

  @Override
  public ReturnT<String> route(TriggerParam triggerParam, List<String> addressList) {
    return new ReturnT<String>(addressList.get(addressList.size()-1));
  }

}
```

## ExecutorRouteRound

ROUND策略就是先随机选择一个Index，然后通过Index对地址列表的元素进行取余，获取执行器的地址，后面累加1取余, 代码如下。

``` ExecutorRouteRound
public class ExecutorRouteRound extends ExecutorRouter {

  private static ConcurrentMap<Integer, AtomicInteger> routeCountEachJob = new ConcurrentHashMap<>();
  private static long CACHE_VALID_TIME = 0;

  private static int count(int jobId) {
    // cache clear
    if (System.currentTimeMillis() > CACHE_VALID_TIME) {
      routeCountEachJob.clear();
      // 每隔24小时清空一次routeCountEachJob
      CACHE_VALID_TIME = System.currentTimeMillis() + 1000*60*60*24;
    }

    // 从routeCountEachJob获取count
    AtomicInteger count = routeCountEachJob.get(jobId);
    if (count == null || count.get() > 1000000) {
      // 初始化时主动Random一次，缓解首次压力
      count = new AtomicInteger(new Random().nextInt(100));
    } else {
      // count++
      count.addAndGet(1);
    }
    routeCountEachJob.put(jobId, count);
    return count.get();
  }

  @Override
  public ReturnT<String> route(TriggerParam triggerParam, List<String> addressList) {
    // 获取到count后，对addressList.size()取余
    String address = addressList.get(count(triggerParam.getJobId()) % addressList.size());
    return new ReturnT<String>(address);
  }

}
```

## ExecutorRouteRandom

RANDOM策略也比较简单，生成一个0到地址列表元素个数之间的数值，然后将该数值作为下标拿到执行器地址即可。

```
public class ExecutorRouteRandom extends ExecutorRouter {
  private static Random localRandom = new Random();
  @Override
  public ReturnT<String> route(TriggerParam triggerParam, List<String> addressList) {
    String address = addressList.get(localRandom.nextInt(addressList.size()));
    return new ReturnT<String>(address);
  }
}
```

## ExecutorRouteConsistentHash

CONSISTENT_HASH（一致性HASH）：每个任务按照Hash算法固定选择某一台机器，且所有任务均匀散列在不同机器上。

``` ExecutorRouteConsistentHash
public class ExecutorRouteConsistentHash extends ExecutorRouter {

  private static int VIRTUAL_NODE_NUM = 100;

  public String hashJob(int jobId, List<String> addressList) {

    // ------A1------A2-------A3------
    // -----------J1------------------
    TreeMap<Long, String> addressRing = new TreeMap<Long, String>();
    for (String address: addressList) {
      for (int i = 0; i < VIRTUAL_NODE_NUM; i++) {
        long addressHash = hash("SHARD-" + address + "-NODE-" + i);
        addressRing.put(addressHash, address);
      }
    }

    long jobHash = hash(String.valueOf(jobId));
    SortedMap<Long, String> lastRing = addressRing.tailMap(jobHash);
    // 如果不为空，获取地址
    if (!lastRing.isEmpty()) {
      return lastRing.get(lastRing.firstKey());
    }
    // 否则取第一个元素上的地址
    return addressRing.firstEntry().getValue();
  }

  @Override
  public ReturnT<String> route(TriggerParam triggerParam, List<String> addressList) {
    String address = hashJob(triggerParam.getJobId(), addressList);
    return new ReturnT<String>(address);
  }

}
```

CONSISTENT_HASH（一致性哈希算法）对地址列表中的每个地址做100次哈希运算，根据hash值从虚拟节点与执行器地址对应关系获取对应的执行器地址返回。

## ExecutorRouteLFU

LEAST_FREQUENTLY_USED（最不经常使用）：使用频率最低的机器优先被选举。

``` ExecutorRouteLFU
public class ExecutorRouteLFU extends ExecutorRouter {

  // ConcurrentMap的key是JobId， value是HashMap
  // HashMap的key是address, value是address使用的次数
  private static ConcurrentMap<Integer, HashMap<String, Integer>> jobLfuMap = new ConcurrentHashMap<Integer, HashMap<String, Integer>>();
  private static long CACHE_VALID_TIME = 0;

  public String route(int jobId, List<String> addressList) {

    // cache clear
    if (System.currentTimeMillis() > CACHE_VALID_TIME) {
      jobLfuMap.clear();
      CACHE_VALID_TIME = System.currentTimeMillis() + 1000*60*60*24;
    }

    // lfu item init
    HashMap<String, Integer> lfuItemMap = jobLfuMap.get(jobId);     // Key排序可以用TreeMap+构造入参Compare；Value排序暂时只能通过ArrayList；
    if (lfuItemMap == null) {
      lfuItemMap = new HashMap<String, Integer>();
      jobLfuMap.putIfAbsent(jobId, lfuItemMap);   // 避免重复覆盖
    }

    // put new
    for (String address: addressList) {
      if (!lfuItemMap.containsKey(address) || lfuItemMap.get(address) >1000000 ) {
        lfuItemMap.put(address, new Random().nextInt(addressList.size()));  // 初始化时主动Random一次，缓解首次压力
      }
    }
    // remove old
    List<String> delKeys = new ArrayList<>();
    for (String existKey: lfuItemMap.keySet()) {
      if (!addressList.contains(existKey)) {
        delKeys.add(existKey);
      }
    }
    if (delKeys.size() > 0) {
      for (String delKey: delKeys) {
        lfuItemMap.remove(delKey);
      }
    }

    // load least userd count address
    // 根据使用的次数排序
    List<Map.Entry<String, Integer>> lfuItemList = new ArrayList<Map.Entry<String, Integer>>(lfuItemMap.entrySet());
    Collections.sort(lfuItemList, new Comparator<Map.Entry<String, Integer>>() {
      @Override
      public int compare(Map.Entry<String, Integer> o1, Map.Entry<String, Integer> o2) {
        return o1.getValue().compareTo(o2.getValue());
      }
    });

    Map.Entry<String, Integer> addressItem = lfuItemList.get(0);
    String minAddress = addressItem.getKey();
    // 次数+1
    addressItem.setValue(addressItem.getValue() + 1);

    return addressItem.getKey();
  }

  @Override
  public ReturnT<String> route(TriggerParam triggerParam, List<String> addressList) {
    String address = route(triggerParam.getJobId(), addressList);
    return new ReturnT<String>(address);
  }
}
```

这里采用了一个ConcurrentHashMap，其中key是jobId，value是一个HashMap。HashMap的key是对应的address，val是这个address使用的次数。

每次从ConcurrentHashMap中获取对应任务的hashmap，然后根据address的使用次数从小到大进行排序，然后获取到的第0个地址就是要用到的地址。

## ExecutorRouteLRU

LEAST_RECENTLY_USED（最近最久未使用）：最久未使用的机器优先被选举。

``` ExecutorRouteLRU
public class ExecutorRouteLRU extends ExecutorRouter {

  private static ConcurrentMap<Integer, LinkedHashMap<String, String>> jobLRUMap = new ConcurrentHashMap<Integer, LinkedHashMap<String, String>>();
  private static long CACHE_VALID_TIME = 0;

  public String route(int jobId, List<String> addressList) {

    // cache clear
    if (System.currentTimeMillis() > CACHE_VALID_TIME) {
      jobLRUMap.clear();
      CACHE_VALID_TIME = System.currentTimeMillis() + 1000*60*60*24;
    }

    // init lru
    LinkedHashMap<String, String> lruItem = jobLRUMap.get(jobId);
    if (lruItem == null) {
      /**
       * LinkedHashMap
       *      a、accessOrder：true=访问顺序排序（get/put时排序）；false=插入顺序排期；
       *      b、removeEldestEntry：新增元素时将会调用，返回true时会删除最老元素；可封装LinkedHashMap并重写该方法，比如定义最大容量，超出是返回true即可实现固定长度的LRU算法；
       */
      lruItem = new LinkedHashMap<String, String>(16, 0.75f, true);
      jobLRUMap.putIfAbsent(jobId, lruItem);
    }

    // put new
    for (String address: addressList) {
      if (!lruItem.containsKey(address)) {
        lruItem.put(address, address);
      }
    }
    // remove old
    List<String> delKeys = new ArrayList<>();
    for (String existKey: lruItem.keySet()) {
      if (!addressList.contains(existKey)) {
        delKeys.add(existKey);
      }
    }
    if (delKeys.size() > 0) {
      for (String delKey: delKeys) {
        lruItem.remove(delKey);
      }
    }

    // load
    String eldestKey = lruItem.entrySet().iterator().next().getKey();
    String eldestValue = lruItem.get(eldestKey);
    return eldestValue;
  }

  @Override
  public ReturnT<String> route(TriggerParam triggerParam, List<String> addressList) {
    String address = route(triggerParam.getJobId(), addressList);
    return new ReturnT<String>(address);
  }
}
```

这里也用到了ConcurrentHashMap存储，key是任务id，val是一个linkHashMap，按照访问顺序进行排序的，所以每次选取时，直接拿entryKey的元素即可。

## ExecutorRouteFailover

FAILOVER（故障转移）：按照顺序依次进行心跳检测，第一个心跳检测成功的机器选定为目标执行器并发起调度；

```
public class ExecutorRouteFailover extends ExecutorRouter {

  @Override
  public ReturnT<String> route(TriggerParam triggerParam, List<String> addressList) {

    StringBuffer beatResultSB = new StringBuffer();
    for (String address : addressList) {
      // beat
      ReturnT<String> beatResult = null;
      try {
        // 获取当前address的心跳检测结果
        ExecutorBiz executorBiz = XxlJobScheduler.getExecutorBiz(address);
        // 会发送请求
        beatResult = executorBiz.beat();
      } catch (Exception e) {
        logger.error(e.getMessage(), e);
        beatResult = new ReturnT<String>(ReturnT.FAIL_CODE, ""+e );
      }
      beatResultSB.append( (beatResultSB.length()>0)?"<br><br>":"")
              .append(I18nUtil.getString("jobconf_beat") + "：")
              .append("<br>address：").append(address)
              .append("<br>code：").append(beatResult.getCode())
              .append("<br>msg：").append(beatResult.getMsg());

      // 如果心跳检测成功，则返回该地址
      if (beatResult.getCode() == ReturnT.SUCCESS_CODE) {
        beatResult.setMsg(beatResultSB.toString());
        beatResult.setContent(address);
        return beatResult;
      }
    }
    return new ReturnT<String>(ReturnT.FAIL_CODE, beatResultSB.toString());

  }
}
```

ExecutorRouteFailover是失败转移路由，route方法遍历执行器地址，然后发送心跳给执行器服务，如果心跳正常，则成功返回该执行器地址，否则返回失败码。


## ExecutorRouteBusyover

BUSYOVER（忙碌转移）：按照顺序依次进行空闲检测，第一个空闲检测成功的机器选定为目标执行器并发起调度。

``` ExecutorRouteBusyover
public class ExecutorRouteBusyover extends ExecutorRouter {

  @Override
  public ReturnT<String> route(TriggerParam triggerParam, List<String> addressList) {
    StringBuffer idleBeatResultSB = new StringBuffer();
    for (String address : addressList) {
      // beat
      ReturnT<String> idleBeatResult = null;
      try {
        ExecutorBiz executorBiz = XxlJobScheduler.getExecutorBiz(address);
        // 检测是否空闲，会发送请求
        idleBeatResult = executorBiz.idleBeat(new IdleBeatParam(triggerParam.getJobId()));
      } catch (Exception e) {
        logger.error(e.getMessage(), e);
        idleBeatResult = new ReturnT<String>(ReturnT.FAIL_CODE, ""+e );
      }
      idleBeatResultSB.append( (idleBeatResultSB.length()>0)?"<br><br>":"")
              .append(I18nUtil.getString("jobconf_idleBeat") + "：")
              .append("<br>address：").append(address)
              .append("<br>code：").append(idleBeatResult.getCode())
              .append("<br>msg：").append(idleBeatResult.getMsg());

      // beat success
      // 如果检测空闲成功，则返回
      if (idleBeatResult.getCode() == ReturnT.SUCCESS_CODE) {
        idleBeatResult.setMsg(idleBeatResultSB.toString());
        idleBeatResult.setContent(address);
        return idleBeatResult;
      }
    }

    return new ReturnT<String>(ReturnT.FAIL_CODE, idleBeatResultSB.toString());
  }
}
```

ExecutorRouteBusyover是忙碌转移路由器，route方法首先遍历执行器地址列表，然后对执行器地址进行空闲检测，当任务线程没有在执行定时任务时，将返回空闲检测成功，将该执行器地址返回。