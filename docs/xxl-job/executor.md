# 执行器初始化流程

前面详细分析了xxl-job-admin的流程，从这章开始，我们分析xxl-job的执行器流程。我们之前运行的是xxl-job-executor-sample-springboot这个项目，所以我们就从这个项目开始分析。

<img src="./figures/xxl-job-executor-sample-executer-project.png" width = "400" alt="xxl-job-executor-sample-executer-project" />

这个项目的结构还是很简单的，主要看XxlJobConfig和SampleXxlJob。SampleXxlJob是使用XxlJobConfig配置扫描的，直接看XxlJobConfig文件代码吧。

``` XxlJobConfig
@Configuration
public class XxlJobConfig {
  @Bean
  public XxlJobSpringExecutor xxlJobExecutor() {
    // 注意，这些属性都是通过application.properties注入的
    XxlJobSpringExecutor xxlJobSpringExecutor = new XxlJobSpringExecutor();
    xxlJobSpringExecutor.setAdminAddresses(adminAddresses);
    xxlJobSpringExecutor.setAppname(appname);
    xxlJobSpringExecutor.setAddress(address);
    xxlJobSpringExecutor.setIp(ip);
    xxlJobSpringExecutor.setPort(port);
    xxlJobSpringExecutor.setAccessToken(accessToken);
    xxlJobSpringExecutor.setLogPath(logPath);
    xxlJobSpringExecutor.setLogRetentionDays(logRetentionDays);

    return xxlJobSpringExecutor;
  }
}
```

## xxlJobSpringExecutor

可以看到声明了一个Bean，名字叫做xxlJobSpringExecutor，接下来我们这个类的代码。

``` XxlJobSpringExecutor
public class XxlJobSpringExecutor extends XxlJobExecutor implements ApplicationContextAware, SmartInitializingSingleton, DisposableBean {
  // start
  @Override
  public void afterSingletonsInstantiated() {

    // 初始化JobHandlerMethod，把有XxlJob注解的方法提取出来
    initJobHandlerMethodRepository(applicationContext);

    // 刷新GlueFactory
    GlueFactory.refreshInstance(1);

    // 启动XxlJobSpringExecutor
    super.start();
  }

  // ---------------------- applicationContext ----------------------
  private static ApplicationContext applicationContext;

  @Override
  public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
    XxlJobSpringExecutor.applicationContext = applicationContext;
  }
}

```

由于XxlJobSpringExecutor继承了SmartInitializingSingleton接口，所以会调用afterSingletonsInstantiated方法

## JobHandler初始化

```
public class XxlJobSpringExecutor extends XxlJobExecutor implements ApplicationContextAware, SmartInitializingSingleton, DisposableBean {
  private void initJobHandlerMethodRepository(ApplicationContext applicationContext) {
    if (applicationContext == null) {
      return;
    }
    // 获取applicationContext所有的bean
    String[] beanDefinitionNames = applicationContext.getBeanNamesForType(Object.class, false, true);
    for (String beanDefinitionName : beanDefinitionNames) {

      // get bean
      Object bean = null;
      Lazy onBean = applicationContext.findAnnotationOnBean(beanDefinitionName, Lazy.class);
      // 有Lazy注解的先跳过
      if (onBean!=null){
        logger.debug("xxl-job annotation scan, skip @Lazy Bean:{}", beanDefinitionName);
        continue;
      }else {
        bean = applicationContext.getBean(beanDefinitionName);
      }

      // filter method
      Map<Method, XxlJob> annotatedMethods = null;   // referred to ：org.springframework.context.event.EventListenerMethodProcessor.processBean
      try {
        // 获取bean上具有XxlJob注解的所有方法
        annotatedMethods = MethodIntrospector.selectMethods(bean.getClass(),
                new MethodIntrospector.MetadataLookup<XxlJob>() {
                  @Override
                  public XxlJob inspect(Method method) {
                    return AnnotatedElementUtils.findMergedAnnotation(method, XxlJob.class);
                  }
                });
      } catch (Throwable ex) {
        logger.error("xxl-job method-jobhandler resolve error for bean[" + beanDefinitionName + "].", ex);
      }
      if (annotatedMethods==null || annotatedMethods.isEmpty()) {
        continue;
      }

      // generate and regist method job handler
      for (Map.Entry<Method, XxlJob> methodXxlJobEntry : annotatedMethods.entrySet()) {
        Method executeMethod = methodXxlJobEntry.getKey();
        XxlJob xxlJob = methodXxlJobEntry.getValue();
        // 注册JobHandler方法
        registJobHandler(xxlJob, bean, executeMethod);
      }

    }
  }
}
```

可以看到这个方法就是扫描所有具有XxlJob注解的方法，然后注册这些方法。接下来看registJobHandler这个方法的实现。

``` XxlJobExecutor
public class XxlJobExecutor  {
  private static ConcurrentMap<String, IJobHandler> jobHandlerRepository = new ConcurrentHashMap<String, IJobHandler>();

  protected void registJobHandler(XxlJob xxlJob, Object bean, Method executeMethod) {
    Class<?> clazz = bean.getClass();
    String name = xxlJob.value();

    initMethod = clazz.getDeclaredMethod(xxlJob.init());
    initMethod.setAccessible(true);

    destroyMethod = clazz.getDeclaredMethod(xxlJob.destroy());
    destroyMethod.setAccessible(true);

    // registry jobhandler
    registJobHandler(name, new MethodJobHandler(bean, executeMethod, initMethod, destroyMethod));
  }

  public static IJobHandler registJobHandler(String name, IJobHandler jobHandler){
    return jobHandlerRepository.put(name, jobHandler);
  }
}
```

可以看到registJobHandler就是往jobHandlerRepository写到jobHandlerRepository里面，key就是xxlJob.value, value就是MethodJobHandler，这个类是封装了JobHandler的一个类。

## GlueFactory初始化

接下来看一下GlueFactory#refreshInstance这个方法，主要是用来处理GLUE类型的定时任务的，GLUE任务就是一段可以执行的代码。

``` GlueFactory
public class GlueFactory {
  public static void refreshInstance(int type){
		if (type == 0) {
			glueFactory = new GlueFactory();
		} else if (type == 1) {
			glueFactory = new SpringGlueFactory();
		}
	}
}
```

由于是Spring环境，默认使用SpringGlueFactory。简单看一下GlueFactory这个工厂类的方法吧，这里就不细讲了。

``` GlueFactory
public class GlueFactory {
  // 通过codeSource获取class实例并执行
  public IJobHandler loadNewInstance(String codeSource) throws Exception;
  private Class<?> getCodeSourceClass(String codeSource);
  public void injectService(Object instance);
}
```

## 执行器初始化

``` XxlJobExecutor
public class XxlJobExecutor  {
  public void start() throws Exception {

    // 初始化log的文件路径
    XxlJobFileAppender.initLogPath(logPath);

    // 初始化admin控制台的地址
    initAdminBizList(adminAddresses, accessToken);


    // 启动日志清理线程
    JobLogFileCleanThread.getInstance().start(logRetentionDays);

    // 初始化CallbackThread线程
    TriggerCallbackThread.getInstance().start();

    // 初始化客户端服务器，基于netty
    initEmbedServer(address, ip, port, appname, accessToken);
  }
}
```

### 初始化执行器服务

我们看一下initEmbedServer的执行方法，代码如下:

```
public class XxlJobExecutor  {
  private void initEmbedServer(String address, String ip, int port, String appname, String accessToken) throws Exception {
    
    // fill ip port
    port = port>0?port: NetUtil.findAvailablePort(9999);

    // start
    embedServer = new EmbedServer();
    embedServer.start(address, port, appname, accessToken);
  }
}
```

可以看到初始化了一个EmbedServer类，并且调用了EmbedServer的start方法，我们具体看一下对应的方法代码。

```
public class EmbedServer {
  public void start(final String address, final int port, final String appname, final String accessToken) {
    executorBiz = new ExecutorBizImpl();
    thread = new Thread(new Runnable() {
      @Override
      public void run() {
        // param
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        ThreadPoolExecutor bizThreadPool = new ThreadPoolExecutor(
                0,
                200,
                60L,
                TimeUnit.SECONDS,
                new LinkedBlockingQueue<Runnable>(2000),
                new ThreadFactory() {
                  @Override
                  public Thread newThread(Runnable r) {
                    return new Thread(r, "xxl-job, EmbedServer bizThreadPool-" + r.hashCode());
                  }
                },
                new RejectedExecutionHandler() {
                  @Override
                  public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
                    throw new RuntimeException("xxl-job, EmbedServer bizThreadPool is EXHAUSTED!");
                  }
                });
        try {
          // start server
          ServerBootstrap bootstrap = new ServerBootstrap();
          bootstrap.group(bossGroup, workerGroup)
                  .channel(NioServerSocketChannel.class)
                  .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    public void initChannel(SocketChannel channel) throws Exception {
                      channel.pipeline()
                              .addLast(new IdleStateHandler(0, 0, 30 * 3, TimeUnit.SECONDS))  // beat 3N, close if idle
                              .addLast(new HttpServerCodec())
                              .addLast(new HttpObjectAggregator(5 * 1024 * 1024))  // merge request & reponse to FULL
                              .addLast(new EmbedHttpServerHandler(executorBiz, accessToken, bizThreadPool));
                    }
                  })
                  .childOption(ChannelOption.SO_KEEPALIVE, true);

          // bind
          ChannelFuture future = bootstrap.bind(port).sync();

          logger.info(">>>>>>>>>>> xxl-job remoting server start success, nettype = {}, port = {}", EmbedServer.class, port);

          // 向服务端注册执行器
          startRegistry(appname, address);

          // wait util stop
          future.channel().closeFuture().sync();

        } catch (InterruptedException e) {
          logger.info(">>>>>>>>>>> xxl-job remoting server stop.");
        } catch (Exception e) {
          logger.error(">>>>>>>>>>> xxl-job remoting server error.", e);
        }
      }
    });
    thread.setDaemon(true);    // daemon, service jvm, user thread leave >>> daemon leave >>> jvm leave
    thread.start();
  }
}
```

可以看到初始化了一个线程池，并且使用netty建立了一个服务器。核心地方我们查看EmbedHttpServerHandler这个处理类

### EmbedHttpServerHandler

``` EmbedHttpServerHandler
public static class EmbedHttpServerHandler extends SimpleChannelInboundHandler<FullHttpRequest> {
  @Override
  protected void channelRead0(final ChannelHandlerContext ctx, FullHttpRequest msg) throws Exception {
    // request parse
    //final byte[] requestBytes = ByteBufUtil.getBytes(msg.content());    // byteBuf.toString(io.netty.util.CharsetUtil.UTF_8);
    String requestData = msg.content().toString(CharsetUtil.UTF_8);
    String uri = msg.uri();
    HttpMethod httpMethod = msg.method();
    boolean keepAlive = HttpUtil.isKeepAlive(msg);
    String accessTokenReq = msg.headers().get(XxlJobRemotingUtil.XXL_JOB_ACCESS_TOKEN);

    // invoke
    bizThreadPool.execute(new Runnable() {
      @Override
      public void run() {
        // do invoke
        Object responseObj = process(httpMethod, uri, requestData, accessTokenReq);

        // to json
        String responseJson = GsonTool.toJson(responseObj);

        // write response
        writeResponse(ctx, keepAlive, responseJson);
      }
    });
  }

    private Object process(HttpMethod httpMethod, String uri, String requestData, String accessTokenReq) {
    // valid
    if (HttpMethod.POST != httpMethod) {
      return new ReturnT<String>(ReturnT.FAIL_CODE, "invalid request, HttpMethod not support.");
    }
    if (uri == null || uri.trim().length() == 0) {
      return new ReturnT<String>(ReturnT.FAIL_CODE, "invalid request, uri-mapping empty.");
    }
    if (accessToken != null
            && accessToken.trim().length() > 0
            && !accessToken.equals(accessTokenReq)) {
      return new ReturnT<String>(ReturnT.FAIL_CODE, "The access token is wrong.");
    }

    // services mapping
    try {
      switch (uri) {
        case "/beat":
          return executorBiz.beat();
        case "/idleBeat":
          IdleBeatParam idleBeatParam = GsonTool.fromJson(requestData, IdleBeatParam.class);
          return executorBiz.idleBeat(idleBeatParam);
        case "/run":
          TriggerParam triggerParam = GsonTool.fromJson(requestData, TriggerParam.class);
          return executorBiz.run(triggerParam);
        case "/kill":
          KillParam killParam = GsonTool.fromJson(requestData, KillParam.class);
          return executorBiz.kill(killParam);
        case "/log":
          LogParam logParam = GsonTool.fromJson(requestData, LogParam.class);
          return executorBiz.log(logParam);
        default:
          return new ReturnT<String>(ReturnT.FAIL_CODE, "invalid request, uri-mapping(" + uri + ") not found.");
      }
    } catch (Exception e) {
      logger.error(e.getMessage(), e);
      return new ReturnT<String>(ReturnT.FAIL_CODE, "request error:" + ThrowableUtil.toString(e));
    }
  }
}
```

可以看到用刚才创建的线程池来处理admin下发的请求。

我们主要看/run分支的代码，可以看到调用了executorBiz#run方法，这个对应的实现是ExecutorBizImpl，我们看一下实现：

``` ExecutorBizImpl
public class ExecutorBizImpl implements ExecutorBiz {
  @Override
  public ReturnT<String> run(TriggerParam triggerParam) {
    // load old：jobHandler + jobThread
    JobThread jobThread = XxlJobExecutor.loadJobThread(triggerParam.getJobId());
    IJobHandler jobHandler = jobThread!=null?jobThread.getHandler():null;
    String removeOldReason = null;

    // valid：jobHandler + jobThread
    GlueTypeEnum glueTypeEnum = GlueTypeEnum.match(triggerParam.getGlueType());
    if (GlueTypeEnum.BEAN == glueTypeEnum) {
      // 通过triggerParam的executor获取执行器方法
      IJobHandler newJobHandler = XxlJobExecutor.loadJobHandler(triggerParam.getExecutorHandler());
    } else if (GlueTypeEnum.GLUE_GROOVY == glueTypeEnum) {
      IJobHandler originJobHandler = GlueFactory.getInstance().loadNewInstance(triggerParam.getGlueSource());
      jobHandler = new GlueJobHandler(originJobHandler, triggerParam.getGlueUpdatetime());
    } else if (glueTypeEnum!=null && glueTypeEnum.isScript()) {
      jobHandler = new ScriptJobHandler(triggerParam.getJobId(), triggerParam.getGlueUpdatetime(), triggerParam.getGlueSource(), GlueTypeEnum.match(triggerParam.getGlueType()));
    } else {
      return new ReturnT<String>(ReturnT.FAIL_CODE, "glueType[" + triggerParam.getGlueType() + "] is not valid.");
    }

    // 如果jobThread不为空，表明同一个jobId已经有工作线程在处理了
    if (jobThread != null) {
      ExecutorBlockStrategyEnum blockStrategy = ExecutorBlockStrategyEnum.match(triggerParam.getExecutorBlockStrategy(), null);
      // 丢弃
      if (ExecutorBlockStrategyEnum.DISCARD_LATER == blockStrategy) {
        // discard when running
        if (jobThread.isRunningOrHasQueue()) {
          return new ReturnT<String>(ReturnT.FAIL_CODE, "block strategy effect："+ExecutorBlockStrategyEnum.DISCARD_LATER.getTitle());
        }
      } else if (ExecutorBlockStrategyEnum.COVER_EARLY == blockStrategy) {
        // kill running jobThread
        // 覆盖之前的
        if (jobThread.isRunningOrHasQueue()) {
          removeOldReason = "block strategy effect：" + ExecutorBlockStrategyEnum.COVER_EARLY.getTitle();

          jobThread = null;
        }
      } else {
        // just queue trigger
      }
    }

    // replace thread (new or exists invalid)
    if (jobThread == null) {
      jobThread = XxlJobExecutor.registJobThread(triggerParam.getJobId(), jobHandler, removeOldReason);
    }

    // push data to queue
    ReturnT<String> pushResult = jobThread.pushTriggerQueue(triggerParam);
    return pushResult;
  }
}
```

可以看到是从XxlJobExecutor拿到jobId对应的jobThread，然后将triggerParam参数放入到jobThread里面。看一下jobThread#pushTriggerQueue的方法

```
public class JobThread extends Thread {
  public ReturnT<String> pushTriggerQueue(TriggerParam triggerParam) {
    // 如果已经存在了对应的logId
    if (triggerLogIdSet.contains(triggerParam.getLogId())) {
      logger.info(">>>>>>>>>>> repeate trigger job, logId:{}", triggerParam.getLogId());
      return new ReturnT<String>(ReturnT.FAIL_CODE, "repeate trigger job, logId:" + triggerParam.getLogId());
    }

    // 添加triggerParam
    triggerLogIdSet.add(triggerParam.getLogId());
    triggerQueue.add(triggerParam);
    return ReturnT.SUCCESS;
  }
}
```

最后让我们看一下jobThread的核心方法start。

``` JobThread
public class JobThread extends Thread {
	public void run() {
    while(!toStop){
      //1、从队列中触发参数
      triggerParam = triggerQueue.poll(3L, TimeUnit.SECONDS);
      if (triggerParam != null) {
        //2、如果存在执行超时时间并大于0，则在规定的时间异步执行，否则立即执行
        if (triggerParam.getExecutorTimeout() > 0) {
          FutureTask<Boolean> futureTask = new FutureTask<Boolean>(new Callable<Boolean>() {
            @Override
            public Boolean call() throws Exception {

                // init job context
                XxlJobContext.setXxlJobContext(xxlJobContext);
                //处理器执行方法
                handler.execute();
                return true;
              }
          });
          futureThread = new Thread(futureTask);
          futureThread.start();

          //等待结果
          Boolean tempResult = futureTask.get(triggerParam.getExecutorTimeout(), TimeUnit.SECONDS);
        }else{
            // just execute 立即执行
            handler.execute();
        }
      } else {
        // 如果空闲的次数超过30次，则销毁jobThread
        if (idleTimes > 30) {
          if(triggerQueue.size() == 0) {	// avoid concurrent trigger causes jobId-lost
            XxlJobExecutor.removeJobThread(jobId, "excutor idel times over limit.");
          }
        }
      }
    }
  }
}
```

上述将任务执行的代码省略了很多，只将核心的代码抽取出来。任务的执行是不断执行的，只有当任务停止了（toStop设置为ture），才跳出while循环。首先从triggerQueue队列中弹出触发参数，如果存在执行超时时间并大于0，则在规定的时间异步调用handler的execute方法执行任务，否则立即调用handler的execute方法执行任务。

handler#execute的代码比较简单，这里就不详细讲了。

## 执行器注册

最后讲一下执行器的注册流程，在netty服务器初始化的代码中，可以看到一行注册执行器的代码。

``` EmbedServer
public class EmbedServer {
  public void start(final String address, final int port, final String appname, final String accessToken) {
    startRegistry(appname, address);
  }

  public void startRegistry(final String appname, final String address) {
    // start registry
    ExecutorRegistryThread.getInstance().start(appname, address);
  }
}
```

我们看一下ExecutorRegistryThread的源码，如下所示

```ExecutorRegistryThread
public class ExecutorRegistryThread {
  public void start(final String appname, final String address) {
    registryThread = new Thread();
    registryThread.setDaemon(true);
    registryThread.setName("xxl-job, executor ExecutorRegistryThread");
    registryThread.start();
  }
}
```

可以看到注册了一个守护线程registryThread，我们看看这个线程做了什么事情

```
registryThread = new Thread(new Runnable() {
  @Override
  public void run() {

    // registry
    while (!toStop) {
      RegistryParam registryParam = new RegistryParam(RegistryConfig.RegistType.EXECUTOR.name(), appname, address);
      for (AdminBiz adminBiz: XxlJobExecutor.getAdminBizList()) {
        ReturnT<String> registryResult = adminBiz.registry(registryParam);
      }
      // 休眠30秒
      TimeUnit.SECONDS.sleep(RegistryConfig.BEAT_TIMEOUT);
    }

    // registry remove
    RegistryParam registryParam = new RegistryParam(RegistryConfig.RegistType.EXECUTOR.name(), appname, address);
    for (AdminBiz adminBiz: XxlJobExecutor.getAdminBizList()) {
        ReturnT<String> registryResult = adminBiz.registryRemove(registryParam);
    }
  }
});
```

可以看到主要是每隔30秒，遍历adminBizList，然后调用adminBiz.registry注册和adminBiz.registryRemove移除注册。

对应的实现类是AdminBizClient，查看实现代码, 前面讲过postBody的实现，这里就不细说了。

``` AdminBizClient
public class AdminBizClient implements AdminBiz {
  @Override
  public ReturnT<String> registry(RegistryParam registryParam) {
    return XxlJobRemotingUtil.postBody(addressUrl + "api/registry", accessToken, timeout, registryParam, String.class);
  }

  @Override
  public ReturnT<String> registryRemove(RegistryParam registryParam) {
    return XxlJobRemotingUtil.postBody(addressUrl + "api/registryRemove", accessToken, timeout, registryParam, String.class);
  }
}
```

