# 调度中心启动流程

本章节我们一起进入xxl-job的调度器启动流程，讲解一下xxl-job的启动流程。

打开xxl-job-admin的com/xxl/job/admin/conf目录下的XxlJobAdminConfig，具体代码如下:

```XxlJobAdminConfig
@Component
public class XxlJobAdminConfig implements InitializingBean, DisposableBean {

  private static XxlJobAdminConfig adminConfig = null;
  public static XxlJobAdminConfig getAdminConfig() {
    return adminConfig;
  }

  private XxlJobScheduler xxlJobScheduler;

  @Override
  public void afterPropertiesSet() throws Exception {
    adminConfig = this;
    // 新建调度器
    xxlJobScheduler = new XxlJobScheduler();
    // 调度器初始化
    xxlJobScheduler.init();
  }

  @Override
  public void destroy() throws Exception {
    xxlJobScheduler.destroy();
  }
}
```

可以看到XxlJobAdminConfig继承了InitializingBean，在spring初始化过程中会调用afterPropertiesSet方法，调用xxlJobScheduler#init方法。

```
public class XxlJobScheduler  {
  private static final Logger logger = LoggerFactory.getLogger(XxlJobScheduler.class);
  public void init() throws Exception {
    // init i18n
    // 加载国际化资源文件
    initI18n();
    // admin trigger pool start
    // 定义一个快任务线程池，一个慢任务线程池
    JobTriggerPoolHelper.toStart();
    // admin registry monitor run
    // 注册中心监控线程，定时更新执行器信息
    JobRegistryHelper.getInstance().start();
    // admin fail-monitor run
    // 任务失败重试处理，每10ms处理一次
    JobFailMonitorHelper.getInstance().start();
    // admin lose-monitor run ( depend on JobTriggerPoolHelper )
    // 扫描失败的任务，每60ms处理一次
    JobCompleteHelper.getInstance().start();
    // admin log report start
    // 清除过期日志
    JobLogReportHelper.getInstance().start();
    // start-schedule  ( depend on JobTriggerPoolHelper )
    // 启动调度器
    JobScheduleHelper.getInstance().start();
    logger.info(">>>>>>>>> init xxl-job admin success.");
  }
}
```

可以看到xxlJobScheduler#init一共做了如下几件事：
- 国际化初始化
- 触发器线程池创建（核心）
- 注册监控器启动（核心）
- 失败监控器启动（核心）
- 丢失监控器启动（核心）
- 日志任务启动
- JobSchedule调度器启动（核心）

## 国际化资源初始化

首先我们看看国际化资源初始化的initI18n方法，具体代码如下所示：

``` XxlJobScheduler
public class XxlJobScheduler  {
  private void initI18n(){
    for (ExecutorBlockStrategyEnum item:ExecutorBlockStrategyEnum.values()) {
      item.setTitle(I18nUtil.getString("jobconf_block_".concat(item.name())));
    }
  }
}
```

ExecutorBlockStrategyEnum是执行阻塞策略枚举，主要有单机串行、丢弃后续调度、覆盖之前调度三种策略，initI18n方法就是设置执行策略的title值。

可以看到是调用I18nUtil#getString获取的，具体代码如下：

```
public class I18nUtil {
  private static Properties prop = null;
  public static Properties loadI18nProp(){
    if (prop != null) {
      return prop;
    }
    try {
      // build i18n prop
      String i18n = XxlJobAdminConfig.getAdminConfig().getI18n();
      String i18nFile = MessageFormat.format("i18n/message_{0}.properties", i18n);

      // load prop
      Resource resource = new ClassPathResource(i18nFile);
      EncodedResource encodedResource = new EncodedResource(resource,"UTF-8");
      // 加载i18n的资源属性
      prop = PropertiesLoaderUtils.loadProperties(encodedResource);
    } catch (IOException e) {
      logger.error(e.getMessage(), e);
    }
    return prop;
  }

  public static String getString(String key) {
    return loadI18nProp().getProperty(key);
  }
}
```

I18nUtil.getString方法就是根据配置读取resources/il8n/目录下的其中一个文件，该目录下有message_en.properties、message_zh_CN.properties、message_zh_TC.properties三个文件，分别为英语、中文简体、中文繁体的属性文件。具体选取哪个文件是根据XxlJobAdminConfig.getAdminConfig().getI18n()获取的，我们看一下这个值是怎么取的。

```
@Component
public class XxlJobAdminConfig implements InitializingBean, DisposableBean {
  // 后面就不放这行代码了，大家知道XxlJobAdminConfig.getAdminConfig()就是返回XxlJobAdminConfig对象就好了
  private static XxlJobAdminConfig adminConfig = null;
  public static XxlJobAdminConfig getAdminConfig() {
    return adminConfig;
  }

  @Value("${xxl.job.i18n}")
  private String i18n;

  public String getI18n() {
    if (!Arrays.asList("zh_CN", "zh_TC", "en").contains(i18n)) {
      return "zh_CN";
    }
    return i18n;
  }
}
```

可以看到就是从application.properties文件中获取到的xxl.job.i18n，如果没有，默认是zh_CN，而上章的默认配置也是zh_CN。

最后看一下PropertiesLoaderUtils#loadProperties的解析过程。

``` PropertiesLoaderUtils
public abstract class PropertiesLoaderUtils {
  public static Properties loadProperties(EncodedResource resource) throws IOException {
    Properties props = new Properties();
    fillProperties(props, resource);
    return props;
  }

  public static void fillProperties(Properties props, EncodedResource resource) throws IOException {
    fillProperties(props, resource, ResourcePropertiesPersister.INSTANCE);
  }

    static void fillProperties(Properties props, EncodedResource resource, PropertiesPersister persister) throws IOException {
    InputStream stream = null;
    Reader reader = null;

    try {
      String filename = resource.getResource().getFilename();
      // 如果resource文件以".xml"结尾，走这里
      if (filename != null && filename.endsWith(".xml")) {
        if (shouldIgnoreXml) {
          throw new UnsupportedOperationException("XML support disabled");
        }

        stream = resource.getInputStream();
        persister.loadFromXml(props, stream);
      } else if (resource.requiresReader()) {
        // message_zh_CN.properties默认走这里
        reader = resource.getReader();
        persister.load(props, reader);
      // 其他的走这里
      } else {
        stream = resource.getInputStream();
        persister.load(props, stream);
      }
    }
  }
}
```

## 触发器线程池创建

JobTriggerPoolHelper#toStart其实就是创建了两个线程池，一个快线程池，一个慢线程池。

```
public class JobTriggerPoolHelper {
  
  // ---------------------- helper ----------------------
  private static JobTriggerPoolHelper helper = new JobTriggerPoolHelper();

  public static void toStart() {
    helper.start();
  }

  public void start(){
    fastTriggerPool = new ThreadPoolExecutor(
            10,
            XxlJobAdminConfig.getAdminConfig().getTriggerPoolFastMax(),
            60L,
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<Runnable>(1000),
            new ThreadFactory() {
              @Override
              public Thread newThread(Runnable r) {
                return new Thread(r, "xxl-job, admin JobTriggerPoolHelper-fastTriggerPool-" + r.hashCode());
              }
            });

    slowTriggerPool = new ThreadPoolExecutor(
            10,
            XxlJobAdminConfig.getAdminConfig().getTriggerPoolSlowMax(),
            60L,
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<Runnable>(2000),
            new ThreadFactory() {
              @Override
              public Thread newThread(Runnable r) {
                return new Thread(r, "xxl-job, admin JobTriggerPoolHelper-slowTriggerPool-" + r.hashCode());
              }
            });
  }
}
```

fastTriggerPool为快速线程池、slowTriggerPool为慢速线程池，都是采用阻塞队列LinkedBlockingQueue，快速线程池的阻塞队列大小为1000，慢速线程池的阻塞队列大小为2000。快速线程池、慢速线程池在什么时候被用来调度任务呢？默认是用快速调度器调度任务的，当缓存中等待被调度的同一个任务的数量大于10的时候，就用慢速调度器调度任务。而这两个线程池的最大线程数是由XxlJobAdminConfig.getAdminConfig()决定的，我们看看这两个配置。

```
@Component
public class XxlJobAdminConfig implements InitializingBean, DisposableBean {
  @Value("${xxl.job.triggerpool.fast.max}")
  private int triggerPoolFastMax;

  @Value("${xxl.job.triggerpool.slow.max}")
  private int triggerPoolSlowMax;

  // 快线程池的线程数最小是200
  public int getTriggerPoolFastMax() {
    if (triggerPoolFastMax < 200) {
      return 200;
    }
    return triggerPoolFastMax;
  }

  // 慢线程池的线程数最小是100
  public int getTriggerPoolSlowMax() {
    if (triggerPoolSlowMax < 100) {
      return 100;
    }
    return triggerPoolSlowMax;
  }
}
```

这两个配置就是在application.properties中定义的，默认配置如下：

``` application.properties
## xxl-job, triggerpool max size
xxl.job.triggerpool.fast.max=200
xxl.job.triggerpool.slow.max=100
```

## 注册中心监控线程启动

JobRegistryHelper.getInstance().start()就是调度了JobRegistryHelper#start方法

```
public class JobRegistryHelper {
  private static JobRegistryHelper instance = new JobRegistryHelper();
	public static JobRegistryHelper getInstance(){
		return instance;
	}
}
```

JobRegistryHelper#start创建了一个线程是跟一个守护线程，先看线程池。

``` JobRegistryHelper
public class JobRegistryHelper {
  public void start() {
    // for registry or remove
    registryOrRemoveThreadPool = new ThreadPoolExecutor(
            2,
            10,
            30L,
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<Runnable>(2000),
            new ThreadFactory() {
              @Override
              public Thread newThread(Runnable r) {
                return new Thread(r, "xxl-job, admin JobRegistryMonitorHelper-registryOrRemoveThreadPool-" + r.hashCode());
              }
            },
            new RejectedExecutionHandler() {
              @Override
              public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
                r.run();
                logger.warn(">>>>>>>>>>> xxl-job, registry or remove too fast, match threadpool rejected handler(run now).");
              }
            });
  }
}
```

看注释可以看出来是处理执行器的注册跟注册移除的。接下来查看守护线程。

``` JobRegistryHelper
public class JobRegistryHelper {
  public void start() {
    // for monitor
    // 创建一个守护线程 registryMonitorThread
    registryMonitorThread = new Thread(new Runnable() {
      @Override
      public void run() {
        // 每30S执行一次
        while (!toStop) {
          try {
            // auto registry group
            // 查询执行器地址类型是自动注册的执行器信息表
            List<XxlJobGroup> groupList = XxlJobAdminConfig.getAdminConfig().getXxlJobGroupDao().findByAddressType(0);
            if (groupList!=null && !groupList.isEmpty()) {

              // remove dead address (admin/executor)
              // 查找xxl_job_registry表中超时了90秒的注册信息
              List<Integer> ids = XxlJobAdminConfig.getAdminConfig().getXxlJobRegistryDao().findDead(RegistryConfig.DEAD_TIMEOUT, new Date());
              // 如果超时 ids 集合不为空，则直接删除这些数据
              if (ids!=null && ids.size()>0) {
                XxlJobAdminConfig.getAdminConfig().getXxlJobRegistryDao().removeDead(ids);
              }

              // fresh online address (admin/executor)
              // 查询所有未过期的注册信息，将注册类型为EXECUTOR的XxlJobRegistry集合改装成appname=>设置触发器的ip地址
              HashMap<String, List<String>> appAddressMap = new HashMap<String, List<String>>();
              List<XxlJobRegistry> list = XxlJobAdminConfig.getAdminConfig().getXxlJobRegistryDao().findAll(RegistryConfig.DEAD_TIMEOUT, new Date());
              if (list != null) {
                for (XxlJobRegistry item: list) {
                  if (RegistryConfig.RegistType.EXECUTOR.name().equals(item.getRegistryGroup())) {
                    String appname = item.getRegistryKey();
                    List<String> registryList = appAddressMap.get(appname);
                    if (registryList == null) {
                      registryList = new ArrayList<String>();
                    }

                    if (!registryList.contains(item.getRegistryValue())) {
                      registryList.add(item.getRegistryValue());
                    }
                    appAddressMap.put(appname, registryList);
                  }
                }
              }

              // fresh group address
              for (XxlJobGroup group: groupList) {
                List<String> registryList = appAddressMap.get(group.getAppname());
                String addressListStr = null;
                if (registryList!=null && !registryList.isEmpty()) {
                  Collections.sort(registryList);
                  StringBuilder addressListSB = new StringBuilder();
                  for (String item:registryList) {
                    addressListSB.append(item).append(",");
                  }
                  addressListStr = addressListSB.toString();
                  addressListStr = addressListStr.substring(0, addressListStr.length()-1);
                }
                group.setAddressList(addressListStr);
                group.setUpdateTime(new Date());

                XxlJobAdminConfig.getAdminConfig().getXxlJobGroupDao().update(group);
              }
            }
          } catch (Exception e) {
            if (!toStop) {
              logger.error(">>>>>>>>>>> xxl-job, job registry monitor thread error:{}", e);
            }
          }
          try {
            // public static final int BEAT_TIMEOUT = 30;
            TimeUnit.SECONDS.sleep(RegistryConfig.BEAT_TIMEOUT);
          } catch (InterruptedException e) {
            if (!toStop) {
              logger.error(">>>>>>>>>>> xxl-job, job registry monitor thread error:{}", e);
            }
          }
        }
        logger.info(">>>>>>>>>>> xxl-job, job registry monitor thread stop");
      }
    });
    registryMonitorThread.setDaemon(true);
    registryMonitorThread.setName("xxl-job, admin JobRegistryMonitorHelper-registryMonitorThread");
    registryMonitorThread.start();
  }
}
```

注册监控器线程registryMonitorThread，调度任务注册线程池用来执行调度任务的注册，注册监控器线程用来监控执行器的机器是否下线。然后将registryMonitorThread设置为守护线程，最后启动registryMonitorThread线程，开始监控执行器的机器。

registryMonitorThread的run()方法一直执行，直到服务停止，主要做了两件事，第一将已经下线的执行器的记录从数据库中删除，第二将还在线的执行器机器记录重新设置执行器地址以及更新执行器的时间，然后更新数据库的记录。怎么判定执行器已经下线了？如果数据库中的update_time字段小于当前时间减去死亡期限，那么说明已经执行器在死亡期限没有进行更新时间，就判定已经下线了。执行器在启动的时候，会启动一个执行器线程不断的执行注册任务，执行器任务会更新update_time字段。

## 失败监控器启动

接下来看JobFailMonitorHelper.getInstance().start()方法。

``` JobFailMonitorHelper
public class JobFailMonitorHelper {
  public void start(){
    monitorThread = new Thread(new Runnable() {
      @Override
      public void run() {

        // monitor
        // 每10ms执行一次
        while (!toStop) {
          try {
            // 找到1000个失败的日志
            List<Long> failLogIds = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().findFailJobLogIds(1000);
            if (failLogIds!=null && !failLogIds.isEmpty()) {
              for (long failLogId: failLogIds) {

                // lock log
                // 更新日志告警状态，由0变成-1
                // 告警状态：0-默认、-1=锁定状态、1-无需告警、2-告警成功、3-告警失败
                int lockRet = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().updateAlarmStatus(failLogId, 0, -1);
                if (lockRet < 1) {
                  // 更新失败
                  continue;
                }
                // 查找失败日志
                XxlJobLog log = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().load(failLogId);
                // 根据失败日志查找任务
                XxlJobInfo info = XxlJobAdminConfig.getAdminConfig().getXxlJobInfoDao().loadById(log.getJobId());

                // 1、fail retry monitor
                // 失败重试次数大于0
                if (log.getExecutorFailRetryCount() > 0) {
                  // 开始调度任务
                  JobTriggerPoolHelper.trigger(log.getJobId(), TriggerTypeEnum.RETRY, (log.getExecutorFailRetryCount()-1), log.getExecutorShardingParam(), log.getExecutorParam(), null);
                  String retryMsg = "<br><br><span style=\"color:#F39C12;\" > >>>>>>>>>>>"+ I18nUtil.getString("jobconf_trigger_type_retry") +"<<<<<<<<<<< </span><br>";
                  log.setTriggerMsg(log.getTriggerMsg() + retryMsg);
                  // 记录重试日志
                  XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().updateTriggerInfo(log);
                }

                // 2、fail alarm monitor
                int newAlarmStatus = 0;		// 告警状态：0-默认、-1=锁定状态、1-无需告警、2-告警成功、3-告警失败
                if (info != null) {
                  // 发送告警信息
                  boolean alarmResult = XxlJobAdminConfig.getAdminConfig().getJobAlarmer().alarm(info, log);
                  newAlarmStatus = alarmResult?2:3;
                } else {
                  // 如果任务不存在，无需告警
                  newAlarmStatus = 1;
                }

                // 更新告警状态
                XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().updateAlarmStatus(failLogId, -1, newAlarmStatus);
              }
            }

          } catch (Exception e) {
            if (!toStop) {
              logger.error(">>>>>>>>>>> xxl-job, job fail monitor thread error:{}", e);
            }
          }

          try {
              TimeUnit.SECONDS.sleep(10);
          } catch (Exception e) {
              if (!toStop) {
                  logger.error(e.getMessage(), e);
              }
          }
        }
        logger.info(">>>>>>>>>>> xxl-job, job fail monitor thread stop");
      }
    });
    monitorThread.setDaemon(true);
    monitorThread.setName("xxl-job, admin JobFailMonitorHelper");
    monitorThread.start();
  }
}
```

run方法一直运行，直到线程停止。run方法的首先从数据库中获取失败的调度任务日志列表，每次最多一千条。遍历失败的调度任务日志列表，首先将失败的调度任务日志进行锁定，暂停给告警邮件发送告警信息。如果调度任务的失败重试次数大于0，触发任务执行，更新任务日志信息。当邮件不为空时，触发告警信息，最后将锁定的日志状态更新为告警状态。

## 丢失监控器启动

接下来查看JobCompleteHelper.getInstance().start()方法。这个方法声明了一个线程池和一个守护线程，我们先来看线程池的配置。

``` JobCompleteHelper
public class JobCompleteHelper {
  public void start(){
    // for callback
    callbackThreadPool = new ThreadPoolExecutor(
        2,
        20,
        30L,
        TimeUnit.SECONDS,
        new LinkedBlockingQueue<Runnable>(3000),
        new ThreadFactory() {
          @Override
          public Thread newThread(Runnable r) {
            return new Thread(r, "xxl-job, admin JobLosedMonitorHelper-callbackThreadPool-" + r.hashCode());
          }
        },
        new RejectedExecutionHandler() {
          @Override
          public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
            r.run();
            logger.warn(">>>>>>>>>>> xxl-job, callback too fast, match threadpool rejected handler(run now).");
          }
    });
  }

  
  // ---------------------- helper ----------------------
  public ReturnT<String> callback(List<HandleCallbackParam> callbackParamList) {

    callbackThreadPool.execute(new Runnable() {
      @Override
      public void run() {
        for (HandleCallbackParam handleCallbackParam: callbackParamList) {
          ReturnT<String> callbackResult = callback(handleCallbackParam);
          logger.debug(">>>>>>>>> JobApiController.callback {}, handleCallbackParam={}, callbackResult={}",
              (callbackResult.getCode()== ReturnT.SUCCESS_CODE?"success":"fail"), handleCallbackParam, callbackResult);
        }
      }
    });

    return ReturnT.SUCCESS;
  }
}
```

这个线程池是用来处理日志回调服务的，即“执行器”在接收到任务执行请求后，执行任务，在执行结束之后会将执行结果回调通知“调度中心”, 执行器调用/api/callback就会调用该线程池, 具体看接口处理流程，这里不细说。接下来看守护线程。

``` JobCompleteHelper
public class JobCompleteHelper {
  public void start() {
    // for monitor
    monitorThread = new Thread(new Runnable() {

      @Override
      public void run() {

        // wait for JobTriggerPoolHelper-init, 休眠50ms
        TimeUnit.MILLISECONDS.sleep(50);

        // monitor
        while (!toStop) {
          try {
            // 任务结果丢失处理：调度记录停留在 "运行中" 状态超过10min，且对应执行器心跳注册失败不在线，则将本地调度主动标记失败；
            Date losedTime = DateUtil.addMinutes(new Date(), -10);
            List<Long> losedJobIds  = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().findLostJobIds(losedTime);

            if (losedJobIds!=null && losedJobIds.size()>0) {
              for (Long logId: losedJobIds) {

                XxlJobLog jobLog = new XxlJobLog();
                jobLog.setId(logId);

                jobLog.setHandleTime(new Date());
                // 更新为失败状态
                jobLog.setHandleCode(ReturnT.FAIL_CODE);
                jobLog.setHandleMsg( I18nUtil.getString("joblog_lost_fail") );

                XxlJobCompleter.updateHandleInfoAndFinish(jobLog);
              }

            }
          }
          // 休眠60S
          TimeUnit.SECONDS.sleep(60);
        }
      }
    });
    monitorThread.setDaemon(true);
    monitorThread.setName("xxl-job, admin JobLosedMonitorHelper");
    monitorThread.start();
  }
}
```

monitorThread就是每分钟扫描一下调度记录，如果调度记录运行中状态超时且执行器不在线，则标记为失败状态。


## 日志任务启动

JobLogReportHelper.getInstance().start()是一个清除日志服务，对过期的日志任务进行清除。

``` JobLogReportHelper
public class JobLogReportHelper {
  public void start(){
    logrThread = new Thread(new Runnable() {
      @Override
      public void run() {
        // last clean log time
        long lastCleanLogTime = 0;
        while (!toStop) {
          // 1、log-report refresh: refresh log report in 3 days
          // 更新日志运行报告，包括执行时间，运行中的任务数，成功数，失败数等
          try {
            for (int i = 0; i < 3; i++) {
              // today
              ...

              // refresh log-report every minute
              XxlJobLogReport xxlJobLogReport = new XxlJobLogReport();
              xxlJobLogReport.setTriggerDay(todayFrom);
              xxlJobLogReport.setRunningCount(0);
              xxlJobLogReport.setSucCount(0);
              xxlJobLogReport.setFailCount(0);

              Map<String, Object> triggerCountMap = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().findLogReport(todayFrom, todayTo);
              if (triggerCountMap!=null && triggerCountMap.size()>0) {
                  int triggerDayCount = triggerCountMap.containsKey("triggerDayCount")?Integer.valueOf(String.valueOf(triggerCountMap.get("triggerDayCount"))):0;
                  int triggerDayCountRunning = triggerCountMap.containsKey("triggerDayCountRunning")?Integer.valueOf(String.valueOf(triggerCountMap.get("triggerDayCountRunning"))):0;
                  int triggerDayCountSuc = triggerCountMap.containsKey("triggerDayCountSuc")?Integer.valueOf(String.valueOf(triggerCountMap.get("triggerDayCountSuc"))):0;
                  int triggerDayCountFail = triggerDayCount - triggerDayCountRunning - triggerDayCountSuc;

                  xxlJobLogReport.setRunningCount(triggerDayCountRunning);
                  xxlJobLogReport.setSucCount(triggerDayCountSuc);
                  xxlJobLogReport.setFailCount(triggerDayCountFail);
              }

              // do refresh
              int ret = XxlJobAdminConfig.getAdminConfig().getXxlJobLogReportDao().update(xxlJobLogReport);
              if (ret < 1) {
                  XxlJobAdminConfig.getAdminConfig().getXxlJobLogReportDao().save(xxlJobLogReport);
              }
            }

          } catch (Exception e) {
              if (!toStop) {
                  logger.error(">>>>>>>>>>> xxl-job, job log report thread error:{}", e);
              }
          }

          // 2、log-clean: switch open & once each day
          // 清除过期日志，如果上次日志清除的时间到现在大于24小时
          if (XxlJobAdminConfig.getAdminConfig().getLogretentiondays()>0
                  && System.currentTimeMillis() - lastCleanLogTime > 24*60*60*1000) {
            // expire-time
            Calendar expiredDay = Calendar.getInstance();
            expiredDay.add(Calendar.DAY_OF_MONTH, -1 * XxlJobAdminConfig.getAdminConfig().getLogretentiondays());
            expiredDay.set(Calendar.HOUR_OF_DAY, 0);
            expiredDay.set(Calendar.MINUTE, 0);
            expiredDay.set(Calendar.SECOND, 0);
            expiredDay.set(Calendar.MILLISECOND, 0);
            Date clearBeforeTime = expiredDay.getTime();

            // clean expired log
            List<Long> logIds = null;
            do {
                logIds = XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().findClearLogIds(0, 0, clearBeforeTime, 0, 1000);
                if (logIds!=null && logIds.size()>0) {
                    XxlJobAdminConfig.getAdminConfig().getXxlJobLogDao().clearLog(logIds);
                }
            } while (logIds!=null && logIds.size()>0);

            // update clean time
            lastCleanLogTime = System.currentTimeMillis();
          }
          // 休眠1分钟
          TimeUnit.MINUTES.sleep(1);

        }
        logger.info(">>>>>>>>>>> xxl-job, job log report thread stop");
      }
    });
    logrThread.setDaemon(true);
    logrThread.setName("xxl-job, admin JobLogReportHelper");
    logrThread.start();
  }  
}
```

## JobSchedule调度器启动

JobScheduleHelper.getInstance().start()，这个方法比较核心，下一篇文章讲解。