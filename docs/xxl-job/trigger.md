# 定时任务执行流程

上一章我们分析了xxl-job是通过时间轮算法来调度定时任务的, 并且最后我们知道调用定时任务执行是通过下面这个方法。

```
JobTriggerPoolHelper.trigger()
```

这章分析一下定时任务是怎么被触发执行的。

## trigger

我们看一下JobTriggerPoolHelper的trigger方法，代码如下：

``` JobTriggerPoolHelper
public class JobTriggerPoolHelper {

  // job timeout count
  private volatile long minTim = System.currentTimeMillis()/60000;     // ms > min
  private volatile ConcurrentMap<Integer, AtomicInteger> jobTimeoutCountMap = new ConcurrentHashMap<>();

  public static void trigger(int jobId, TriggerTypeEnum triggerType, int failRetryCount, String executorShardingParam, String executorParam, String addressList) {
    helper.addTrigger(jobId, triggerType, failRetryCount, executorShardingParam, executorParam, addressList);
  }

  public void addTrigger(final int jobId,
                         final TriggerTypeEnum triggerType,
                         final int failRetryCount,
                         final String executorShardingParam,
                         final String executorParam,
                         final String addressList) {

    // choose thread pool
    // 默认使用fastTriggerPool
    ThreadPoolExecutor triggerPool_ = fastTriggerPool;
    AtomicInteger jobTimeoutCount = jobTimeoutCountMap.get(jobId);
    // 如果jobTimeout的次数大于10，则使用slowTriggerPool
    if (jobTimeoutCount!=null && jobTimeoutCount.get() > 10) {      // job-timeout 10 times in 1 min
      triggerPool_ = slowTriggerPool;
    }

    // trigger
    triggerPool_.execute(new Runnable() {
      @Override
      public void run() {

        long start = System.currentTimeMillis();

        try {
          // do trigger
          XxlJobTrigger.trigger(jobId, triggerType, failRetryCount, executorShardingParam, executorParam, addressList);
        } catch (Exception e) {
          logger.error(e.getMessage(), e);
        } finally {

          // check timeout-count-map
          long minTim_now = System.currentTimeMillis()/60000;
          if (minTim != minTim_now) {
            minTim = minTim_now;
            jobTimeoutCountMap.clear();
          }

          // incr timeout-count-map
          long cost = System.currentTimeMillis()-start;
          if (cost > 500) {       // ob-timeout threshold 500ms
            // 放入jobTimeoutCountMap
            AtomicInteger timeoutCount = jobTimeoutCountMap.putIfAbsent(jobId, new AtomicInteger(1));
            if (timeoutCount != null) {
              timeoutCount.incrementAndGet();
            }
          }
        }
      }
    });
  }
}
```

可以看到是从fastTriggerPool和slowTriggerPool选择一个线程池来执行，默认使用fastTriggerPool，如果定时任务超时失败的次数超过10次，会选择slowTriggerPool。然后使用XxlJobTrigger.trigger调度任务，如果任务超时失败，就把失败的次数加1。

fastTriggerPool和slowTriggerPool这两个线程池的创建时间可以点击[此处](/xxl-job/xxl-job-admin-schedule.html#%E8%A7%A6%E5%8F%91%E5%99%A8%E7%BA%BF%E7%A8%8B%E6%B1%A0%E5%88%9B%E5%BB%BA)。

可以看到核心是XxlJobTrigger#trigger，继续查看该方法, 代码如下。

``` XxlJobTrigger
public class XxlJobTrigger {
  public static void trigger(int jobId,
                             TriggerTypeEnum triggerType,
                             int failRetryCount,
                             String executorShardingParam,
                             String executorParam,
                             String addressList) {

    // 获取定时任务
    XxlJobInfo jobInfo = XxlJobAdminConfig.getAdminConfig().getXxlJobInfoDao().loadById(jobId);
    if (jobInfo == null) {
      logger.warn(">>>>>>>>>>>> trigger fail, jobId invalid，jobId={}", jobId);
      return;
    }
    // 如果执行参数不为空，则设置执行参数
    if (executorParam != null) {
      jobInfo.setExecutorParam(executorParam);
    }
    // 获取失败重试次数
    int finalFailRetryCount = failRetryCount >= 0 ? failRetryCount : jobInfo.getExecutorFailRetryCount();
    // 获取执行器
    XxlJobGroup group = XxlJobAdminConfig.getAdminConfig().getXxlJobGroupDao().load(jobInfo.getJobGroup());

    // 获取执行器下绑定的address列表
    if (addressList!=null && addressList.trim().length()>0) {
      group.setAddressType(1);
      group.setAddressList(addressList.trim());
    }

    // sharding param
    int[] shardingParam = null;
    if (executorShardingParam!=null){
      String[] shardingArr = executorShardingParam.split("/");
      if (shardingArr.length==2 && isNumeric(shardingArr[0]) && isNumeric(shardingArr[1])) {
        shardingParam = new int[2];
        shardingParam[0] = Integer.valueOf(shardingArr[0]);
        shardingParam[1] = Integer.valueOf(shardingArr[1]);
      }
    }

    // 如果是分片广播，则所有的Registry并行执行
    if (ExecutorRouteStrategyEnum.SHARDING_BROADCAST == ExecutorRouteStrategyEnum.match(jobInfo.getExecutorRouteStrategy(), null)
            && group.getRegistryList()!=null && !group.getRegistryList().isEmpty()
            && shardingParam==null) {
      for (int i = 0; i < group.getRegistryList().size(); i++) {
        processTrigger(group, jobInfo, finalFailRetryCount, triggerType, i, group.getRegistryList().size());
      }
    } else {
      // 其余的选择一个Registry执行
      if (shardingParam == null) {
        shardingParam = new int[]{0, 1};
      }
      processTrigger(group, jobInfo, finalFailRetryCount, triggerType, shardingParam[0], shardingParam[1]);
    }
  }
}
```

根据任务ID从数据库中获取要执行的任务，然后判断路由策略，如果是分片广播，遍历地址列表，触发所有的机器，否则只触发一台机器。分片广播是要触发所有的机器并行处理任务。

## processTrigger

接下来我们看一下processTrigger方法，这个方法的代码比较长，让我们一步一步分析。

- 获取阻塞策略，路由策略以及分片广播参数等

```XxlJobTrigger
public class XxlJobTrigger {
  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {
    // 获取阻塞策略
    ExecutorBlockStrategyEnum blockStrategy = ExecutorBlockStrategyEnum.match(jobInfo.getExecutorBlockStrategy(), ExecutorBlockStrategyEnum.SERIAL_EXECUTION);  // block strategy
    // 获取路由策略
    ExecutorRouteStrategyEnum executorRouteStrategyEnum = ExecutorRouteStrategyEnum.match(jobInfo.getExecutorRouteStrategy(), null);    // route strategy
    // 分片广播
    String shardingParam = (ExecutorRouteStrategyEnum.SHARDING_BROADCAST==executorRouteStrategyEnum)?String.valueOf(index).concat("/").concat(String.valueOf(total)):null;
  }
}
```

- 保存任务日志

```XxlJobTrigger
public class XxlJobTrigger {
  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {
    // 1、save log-id
    XxlJobLog jobLog = new XxlJobLog();
    jobLog.setJobGroup(jobInfo.getJobGroup());
    jobLog.setJobId(jobInfo.getId());
    jobLog.setTriggerTime(new Date());
    XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().save(jobLog);
    logger.debug(">>>>>>>>>>> xxl-job trigger start, jobId:{}", jobLog.getId());
  }
}
```

- 初始化触发参数

```XxlJobTrigger
public class XxlJobTrigger {
  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {
    // 2、init trigger-param
    TriggerParam triggerParam = new TriggerParam();
    triggerParam.setJobId(jobInfo.getId());
    triggerParam.setExecutorHandler(jobInfo.getExecutorHandler());
    triggerParam.setExecutorParams(jobInfo.getExecutorParam());
    triggerParam.setExecutorBlockStrategy(jobInfo.getExecutorBlockStrategy());
    triggerParam.setExecutorTimeout(jobInfo.getExecutorTimeout());
    triggerParam.setLogId(jobLog.getId());
    triggerParam.setLogDateTime(jobLog.getTriggerTime().getTime());
    triggerParam.setGlueType(jobInfo.getGlueType());
    triggerParam.setGlueSource(jobInfo.getGlueSource());
    triggerParam.setGlueUpdatetime(jobInfo.getGlueUpdatetime().getTime());
    triggerParam.setBroadcastIndex(index);
    triggerParam.setBroadcastTotal(total);
  }
}
```

- 初始化执行器的地址：如果路由策略是分片广播，执行地址就为第index的地址，否则从通过路由策略获取执行地址。(核心)

```XxlJobTrigger
public class XxlJobTrigger {
  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {
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

- 触发远程执行器，即触发远程的定时任务(核心)

```XxlJobTrigger
public class XxlJobTrigger {
  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {
    // 4、trigger remote executor
    ReturnT<String> triggerResult = null;
    if (address != null) {
      triggerResult = runExecutor(triggerParam, address);
    } else {
      triggerResult = new ReturnT<String>(ReturnT.FAIL_CODE, null);
    }
  }
}
```

- 设置触发信息并保存触发日志

``` XxlJobTrigger
public class XxlJobTrigger {
  private static void processTrigger(XxlJobGroup group, XxlJobInfo jobInfo, int finalFailRetryCount, TriggerTypeEnum triggerType, int index, int total) {
    // 5、collection trigger info
    StringBuffer triggerMsgSb = new StringBuffer();
    triggerMsgSb.append(I18nUtil.getString("jobconf_trigger_type")).append("：").append(triggerType.getTitle());
    triggerMsgSb.append("<br>").append(I18nUtil.getString("jobconf_trigger_admin_adress")).append("：").append(IpUtil.getIp());
    triggerMsgSb.append("<br>").append(I18nUtil.getString("jobconf_trigger_exe_regtype")).append("：")
            .append( (group.getAddressType() == 0)?I18nUtil.getString("jobgroup_field_addressType_0"):I18nUtil.getString("jobgroup_field_addressType_1") );
    triggerMsgSb.append("<br>").append(I18nUtil.getString("jobconf_trigger_exe_regaddress")).append("：").append(group.getRegistryList());
    triggerMsgSb.append("<br>").append(I18nUtil.getString("jobinfo_field_executorRouteStrategy")).append("：").append(executorRouteStrategyEnum.getTitle());
    if (shardingParam != null) {
      triggerMsgSb.append("("+shardingParam+")");
    }
    triggerMsgSb.append("<br>").append(I18nUtil.getString("jobinfo_field_executorBlockStrategy")).append("：").append(blockStrategy.getTitle());
    triggerMsgSb.append("<br>").append(I18nUtil.getString("jobinfo_field_timeout")).append("：").append(jobInfo.getExecutorTimeout());
    triggerMsgSb.append("<br>").append(I18nUtil.getString("jobinfo_field_executorFailRetryCount")).append("：").append(finalFailRetryCount);

    triggerMsgSb.append("<br><br><span style=\"color:#00c0ef;\" > >>>>>>>>>>>"+ I18nUtil.getString("jobconf_trigger_run") +"<<<<<<<<<<< </span><br>")
            .append((routeAddressResult!=null&&routeAddressResult.getMsg()!=null)?routeAddressResult.getMsg()+"<br><br>":"").append(triggerResult.getMsg()!=null?triggerResult.getMsg():"");

    // 6、save log trigger-info
    jobLog.setExecutorAddress(address);
    jobLog.setExecutorHandler(jobInfo.getExecutorHandler());
    jobLog.setExecutorParam(jobInfo.getExecutorParam());
    jobLog.setExecutorShardingParam(shardingParam);
    jobLog.setExecutorFailRetryCount(finalFailRetryCount);
    //jobLog.setTriggerTime();
    jobLog.setTriggerCode(triggerResult.getCode());
    jobLog.setTriggerMsg(triggerMsgSb.toString());
    XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().updateTriggerInfo(jobLog);
  }
}
```

## runExecutor

主要看一下runExecutor方法，这个是实际的调度执行方法，代码如下

``` XxlJobTrigger
public class XxlJobTrigger {
  public static ReturnT<String> runExecutor(TriggerParam triggerParam, String address){
    ReturnT<String> runResult = null;
    try {
      ExecutorBiz executorBiz = XxlJobScheduler.getExecutorBiz(address);
      runResult = executorBiz.run(triggerParam);
    } catch (Exception e) {
      logger.error(">>>>>>>>>>> xxl-job trigger error, please check if the executor[{}] is running.", address, e);
      runResult = new ReturnT<String>(ReturnT.FAIL_CODE, ThrowableUtil.toString(e));
    }

    StringBuffer runResultSB = new StringBuffer(I18nUtil.getString("jobconf_trigger_run") + "：");
    runResultSB.append("<br>address：").append(address);
    runResultSB.append("<br>code：").append(runResult.getCode());
    runResultSB.append("<br>msg：").append(runResult.getMsg());

    runResult.setMsg(runResultSB.toString());
    return runResult;
  }
}
```

runExecutor通过XxlJobScheduler#getExecutorBiz获取到ExecutorBiz，然后调用executorBiz.run方法，等待返回结果，然后将结果返回。

ExecutorBiz有两个实现类，ExecutorBizClient和ExecutorBizImpl，xxl-job-admin使用的是ExecutorBizClient，查看ExecutorBizClient#run方法

``` ExecutorBizClient
public class ExecutorBizClient implements ExecutorBiz {
  @Override
  public ReturnT<String> run(TriggerParam triggerParam) {
      return XxlJobRemotingUtil.postBody(addressUrl + "run", accessToken, timeout, triggerParam, String.class);
  }
}
```

ExecutorBizClient的run方法比较简单，就是通过XxlJobRemotingUtil发送一个请求，触发执行器里面的机器执行，然后把结果返回来。

## postBody

最后我们还是看一下XxlJobRemotingUtil#postBody方法吧， 具体代码如下：

``` XxlJobRemotingUtil
public class XxlJobRemotingUtil {
  public static ReturnT postBody(String url, String accessToken, int timeout, Object requestObj, Class returnTargClassOfT) {
    HttpURLConnection connection = null;
    BufferedReader bufferedReader = null;
    try {
      // connection
      URL realUrl = new URL(url);
      connection = (HttpURLConnection) realUrl.openConnection();

      // trust-https
      boolean useHttps = url.startsWith("https");
      if (useHttps) {
        HttpsURLConnection https = (HttpsURLConnection) connection;
        trustAllHosts(https);
      }

      ...

      if(accessToken!=null && accessToken.trim().length()>0){
        connection.setRequestProperty(XXL_JOB_ACCESS_TOKEN, accessToken);
      }

      // do connection
      connection.connect();

      // write requestBody
      if (requestObj != null) {
        String requestBody = GsonTool.toJson(requestObj);

        DataOutputStream dataOutputStream = new DataOutputStream(connection.getOutputStream());
        dataOutputStream.write(requestBody.getBytes("UTF-8"));
        dataOutputStream.flush();
        dataOutputStream.close();
      }

      /*byte[] requestBodyBytes = requestBody.getBytes("UTF-8");
      connection.setRequestProperty("Content-Length", String.valueOf(requestBodyBytes.length));
      OutputStream outwritestream = connection.getOutputStream();
      outwritestream.write(requestBodyBytes);
      outwritestream.flush();
      outwritestream.close();*/

      // valid StatusCode
      int statusCode = connection.getResponseCode();
      if (statusCode != 200) {
        return new ReturnT<String>(ReturnT.FAIL_CODE, "xxl-job remoting fail, StatusCode("+ statusCode +") invalid. for url : " + url);
      }

      // result
      bufferedReader = new BufferedReader(new InputStreamReader(connection.getInputStream(), "UTF-8"));
      StringBuilder result = new StringBuilder();
      String line;
      while ((line = bufferedReader.readLine()) != null) {
        result.append(line);
      }
      String resultJson = result.toString();

      // parse returnT
      try {
        ReturnT returnT = GsonTool.fromJson(resultJson, ReturnT.class, returnTargClassOfT);
        return returnT;
      }
    }
  }
}
```

可以看到是构造了一个HttpURLConnection发起了一个HTTP请求，然后利用GsonTool解析返回结果。