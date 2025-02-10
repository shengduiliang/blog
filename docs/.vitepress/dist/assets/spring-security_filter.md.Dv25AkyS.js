import{_ as a}from"./chunks/httpSecurity.BOJSEaAH.js";import{_ as e}from"./chunks/login.CCIJhBNX.js";import{_ as p,c as i,a0 as l,o as r}from"./chunks/framework.P9qPzDnn.js";const n="/assets/architecture.C0hMV0uX.png",t="/assets/websecurity.D1dGzJ1r.png",c="/assets/httpbasic.DLzfV4hc.png",f=JSON.parse('{"title":"Spring Security启动流程与架构设计分析","description":"","frontmatter":{},"headers":[],"relativePath":"spring-security/filter.md","filePath":"spring-security/filter.md"}'),u={name:"spring-security/filter.md"};function b(o,s,m,d,h,g){return r(),i("div",null,s[0]||(s[0]=[l('<h1 id="spring-security启动流程与架构设计分析" tabindex="-1">Spring Security启动流程与架构设计分析 <a class="header-anchor" href="#spring-security启动流程与架构设计分析" aria-label="Permalink to &quot;Spring Security启动流程与架构设计分析&quot;">​</a></h1><p>在讲解基于表单认证等的认证流程之前，本人觉得有必要先讲解一下Spring Security的系统架构图，以及各种过滤器链的启动流程，这样子后面在讲解认证流程的时候，能更好理解一些。</p><h2 id="架构设计" tabindex="-1">架构设计 <a class="header-anchor" href="#架构设计" aria-label="Permalink to &quot;架构设计&quot;">​</a></h2><p>官方参照文档：<a href="https://docs.spring.io/spring-security/reference/servlet/architecture.html" target="_blank" rel="noreferrer">https://docs.spring.io/spring-security/reference/servlet/architecture.html</a></p><img src="'+n+`" width="500" alt="系统架构"><p>下面对最终的架构图结合Spring Security的源代码进行详细讲解。</p><h2 id="filterchain" tabindex="-1">FilterChain <a class="header-anchor" href="#filterchain" aria-label="Permalink to &quot;FilterChain&quot;">​</a></h2><p>Spring Security是基于Servlet的过滤器来实现的。当客户端向服务端发送请求的时候，会经过Servlet的一个个过滤器，就是上图的FilterChain。想要了解Servlet的过滤器，可以参照 <a href="https://juejin.cn/post/6878948441335660558" target="_blank" rel="noreferrer">https://juejin.cn/post/6878948441335660558</a> 。</p><p>在Spring Security初始化的过程中，会向Servlet中注册一个DelegatingFilterProxy过滤器，由该过滤器处理请求。具体注册的位置在AbstractSecurityWebApplicationInitializer</p><div class="language-AbstractSecurityWebApplicationInitializer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractSecurityWebApplicationInitializer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractSecurityWebApplicationInitializer</span></span>
<span class="line"><span>  implements WebApplicationInitializer {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public final void onStartup(ServletContext servletContext) {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    insertSpringSecurityFilterChain(servletContext);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void insertSpringSecurityFilterChain(ServletContext servletContext) {</span></span>
<span class="line"><span>    // springSecurityFilterChain</span></span>
<span class="line"><span>    String filterName = DEFAULT_FILTER_NAME;</span></span>
<span class="line"><span>    DelegatingFilterProxy springSecurityFilterChain = new DelegatingFilterProxy(filterName);</span></span>
<span class="line"><span>    String contextAttribute = getWebApplicationContextAttribute();</span></span>
<span class="line"><span>    if (contextAttribute != null) {</span></span>
<span class="line"><span>      springSecurityFilterChain.setContextAttribute(contextAttribute);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 注册DelegatingFilterProxy</span></span>
<span class="line"><span>    registerFilter(servletContext, true, filterName, springSecurityFilterChain);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br></div></div><p>AbstractSecurityWebApplicationInitializer集成了WebApplicationInitializer接口，在服务器启动的时候，会检测WebApplicationInitializer接口的实现类，并且自动调用onStartup方法来配置servletContext，这里向Servlet注册了一个DelegatingFilterProxy拦截器。注意上面的FilterName为springSecurityFilterChain，下文会用到。</p><h2 id="delegatingfilterproxy" tabindex="-1">DelegatingFilterProxy <a class="header-anchor" href="#delegatingfilterproxy" aria-label="Permalink to &quot;DelegatingFilterProxy&quot;">​</a></h2><p>由于Servlet在调用拦截器的时候，会自动调用拦截器的doFilter方法，我们直接看DelegatingFilterProxy的doFilter的doFilter方法。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DelegatingFilterProxy extends GenericFilterBean {</span></span>
<span class="line"><span>  public void doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain) throws ServletException, IOException {</span></span>
<span class="line"><span>    Filter delegateToUse = this.delegate;</span></span>
<span class="line"><span>    if (delegateToUse == null) {</span></span>
<span class="line"><span>      this.delegateLock.lock();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        delegateToUse = this.delegate;</span></span>
<span class="line"><span>        if (delegateToUse == null) {</span></span>
<span class="line"><span>          WebApplicationContext wac = this.findWebApplicationContext();</span></span>
<span class="line"><span>          if (wac == null) {</span></span>
<span class="line"><span>            throw new IllegalStateException(&quot;No WebApplicationContext found: no ContextLoaderListener or DispatcherServlet registered?&quot;);</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>          // 查找代理的拦截器</span></span>
<span class="line"><span>          delegateToUse = this.initDelegate(wac);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        this.delegate = delegateToUse;</span></span>
<span class="line"><span>      } finally {</span></span>
<span class="line"><span>        this.delegateLock.unlock();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 调用代理的拦截器</span></span>
<span class="line"><span>    this.invokeDelegate(delegateToUse, request, response, filterChain);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected Filter initDelegate(WebApplicationContext wac) throws ServletException {</span></span>
<span class="line"><span>    // 这里的targetBeanName就是上文提到的springSecurityFilterChain</span></span>
<span class="line"><span>    String targetBeanName = this.getTargetBeanName();</span></span>
<span class="line"><span>    Assert.state(targetBeanName != null, &quot;No target bean name set&quot;);</span></span>
<span class="line"><span>    // 通过WebApplicationContext的getBean获取拦截器</span></span>
<span class="line"><span>    Filter delegate = (Filter)wac.getBean(targetBeanName, Filter.class);</span></span>
<span class="line"><span>    if (this.isTargetFilterLifecycle()) {</span></span>
<span class="line"><span>      delegate.init(this.getFilterConfig());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return delegate;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 执行代理拦截器的doFilter方法</span></span>
<span class="line"><span>  protected void invokeDelegate(Filter delegate, ServletRequest request, ServletResponse response, FilterChain filterChain) throws ServletException, IOException {</span></span>
<span class="line"><span>    delegate.doFilter(request, response, filterChain);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br></div></div><p>具体调用的拦截器是什么呢，就是上面架构图的FilterChainProxy。</p><h2 id="filterchainproxy" tabindex="-1">FilterChainProxy <a class="header-anchor" href="#filterchainproxy" aria-label="Permalink to &quot;FilterChainProxy&quot;">​</a></h2><p>下面我们看看FilterChainProxy是什么时候注册到Spring中，成为Spring的一个Bean的。</p><p>打开之前Spring Boot为Spring Security自动配置的类SecurityAutoConfiguration，可以看到导入了SpringBootWebSecurityConfiguration类</p><div class="language-SecurityAutoConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityAutoConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@AutoConfiguration(before = UserDetailsServiceAutoConfiguration.class)</span></span>
<span class="line"><span>@ConditionalOnClass(DefaultAuthenticationEventPublisher.class)</span></span>
<span class="line"><span>@EnableConfigurationProperties(SecurityProperties.class)</span></span>
<span class="line"><span>@Import({ SpringBootWebSecurityConfiguration.class, SecurityDataConfiguration.class })</span></span>
<span class="line"><span>public class SecurityAutoConfiguration {</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>打开SpringBootWebSecurityConfiguration这个类，可以看到WebSecurityEnablerConfiguration上面实现了@EnableWebSecurity注解</p><div class="language-SpringBootWebSecurityConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SpringBootWebSecurityConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>@ConditionalOnWebApplication(type = Type.SERVLET)</span></span>
<span class="line"><span>class SpringBootWebSecurityConfiguration {</span></span>
<span class="line"><span>  @Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>	@ConditionalOnMissingBean(name = BeanIds.SPRING_SECURITY_FILTER_CHAIN)</span></span>
<span class="line"><span>	@ConditionalOnClass(EnableWebSecurity.class)</span></span>
<span class="line"><span>	@EnableWebSecurity</span></span>
<span class="line"><span>	static class WebSecurityEnablerConfiguration {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>继续看@EnableWebSecurity注解实现，可以看到导入了WebSecurityConfiguration这个类</p><div class="language-EnableWebSecurity vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">EnableWebSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Retention(RetentionPolicy.RUNTIME)</span></span>
<span class="line"><span>@Target(ElementType.TYPE)</span></span>
<span class="line"><span>@Documented</span></span>
<span class="line"><span>@Import({ WebSecurityConfiguration.class, SpringWebMvcImportSelector.class, OAuth2ImportSelector.class,</span></span>
<span class="line"><span>		HttpSecurityConfiguration.class, ObservationImportSelector.class })</span></span>
<span class="line"><span>@EnableGlobalAuthentication</span></span>
<span class="line"><span>public @interface EnableWebSecurity {</span></span>
<span class="line"><span>	boolean debug() default false;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>点进WebSecurityConfiguration这个类，可以看到这个类声明了一个Bean，Bean的名字就是springSecurityFilterChain。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class WebSecurityConfiguration implements ImportAware, BeanClassLoaderAware {</span></span>
<span class="line"><span>  @Bean(name = AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME)</span></span>
<span class="line"><span>  public Filter springSecurityFilterChain() throws Exception {</span></span>
<span class="line"><span>    boolean hasFilterChain = !this.securityFilterChains.isEmpty();</span></span>
<span class="line"><span>    // 如果没有过滤器链，默认构造一个，可以看到这里注册的httpSecurity跟自动配置的是同一个配置</span></span>
<span class="line"><span>    if (!hasFilterChain) {</span></span>
<span class="line"><span>      this.webSecurity.addSecurityFilterChainBuilder(() -&gt; {</span></span>
<span class="line"><span>        this.httpSecurity.authorizeHttpRequests((authorize) -&gt; authorize.anyRequest().authenticated());</span></span>
<span class="line"><span>        this.httpSecurity.formLogin(Customizer.withDefaults());</span></span>
<span class="line"><span>        this.httpSecurity.httpBasic(Customizer.withDefaults());</span></span>
<span class="line"><span>        return this.httpSecurity.build();</span></span>
<span class="line"><span>      });</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    for (SecurityFilterChain securityFilterChain : this.securityFilterChains) {</span></span>
<span class="line"><span>      this.webSecurity.addSecurityFilterChainBuilder(() -&gt; securityFilterChain);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    for (WebSecurityCustomizer customizer : this.webSecurityCustomizers) {</span></span>
<span class="line"><span>      customizer.customize(this.webSecurity);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 构建SecurityFilterChain</span></span>
<span class="line"><span>    return this.webSecurity.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>this.webSecurity.build()这里就是用于生成上面架构图右边的所有SecurityFilterChain。webSecurity也是在WebSecurityConfiguration里面进行配置的</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Autowired(required = false)</span></span>
<span class="line"><span>public void setFilterChainProxySecurityConfigurer(ObjectPostProcessor&lt;Object&gt; objectPostProcessor,</span></span>
<span class="line"><span>    ConfigurableListableBeanFactory beanFactory) throws Exception {</span></span>
<span class="line"><span>  // this.webSecurity赋值</span></span>
<span class="line"><span>  this.webSecurity = objectPostProcessor.postProcess(new WebSecurity(objectPostProcessor));</span></span>
<span class="line"><span>  if (this.debugEnabled != null) {</span></span>
<span class="line"><span>    this.webSecurity.debug(this.debugEnabled);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 扫描获取SecurityConfigurer列表</span></span>
<span class="line"><span>  List&lt;SecurityConfigurer&lt;Filter, WebSecurity&gt;&gt; webSecurityConfigurers = new AutowiredWebSecurityConfigurersIgnoreParents(</span></span>
<span class="line"><span>      beanFactory)</span></span>
<span class="line"><span>    .getWebSecurityConfigurers();</span></span>
<span class="line"><span>  // 对SecurityConfigurer进行排序</span></span>
<span class="line"><span>  webSecurityConfigurers.sort(AnnotationAwareOrderComparator.INSTANCE);</span></span>
<span class="line"><span>  Integer previousOrder = null;</span></span>
<span class="line"><span>  Object previousConfig = null;</span></span>
<span class="line"><span>  for (SecurityConfigurer&lt;Filter, WebSecurity&gt; config : webSecurityConfigurers) {</span></span>
<span class="line"><span>    Integer order = AnnotationAwareOrderComparator.lookupOrder(config);</span></span>
<span class="line"><span>    if (previousOrder != null &amp;&amp; previousOrder.equals(order)) {</span></span>
<span class="line"><span>      throw new IllegalStateException(&quot;@Order on WebSecurityConfigurers must be unique. Order of &quot; + order</span></span>
<span class="line"><span>          + &quot; was already used on &quot; + previousConfig + &quot;, so it cannot be used on &quot; + config + &quot; too.&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    previousOrder = order;</span></span>
<span class="line"><span>    previousConfig = config;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  // 把所有的webSecurityConfigurer放入webSecurity</span></span>
<span class="line"><span>  for (SecurityConfigurer&lt;Filter, WebSecurity&gt; webSecurityConfigurer : webSecurityConfigurers) {</span></span>
<span class="line"><span>    this.webSecurity.apply(webSecurityConfigurer);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  this.webSecurityConfigurers = webSecurityConfigurers;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br></div></div><p>可以看到上面使用了@Autowired，是Spring自动导入的。Spring Security6的webSecurityConfigurers列表是空的，所以可以认为这里只是构建了一个webSecurity赋值给this.webSecurity。</p><p>在spring security5.7之前，Spring Security的配置方式是下面这种。WebSecurityConfigurerAdapter就是继承了SecurityConfigurer，后面不用了。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class SecurityConfig extends WebSecurityConfigurerAdapter {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected void configure(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeRequests()</span></span>
<span class="line"><span>      .antMatchers(&quot;/vc.jpg&quot;).permitAll()</span></span>
<span class="line"><span>      .anyRequest().authenticated()</span></span>
<span class="line"><span>      .and()</span></span>
<span class="line"><span>      .formLogin()</span></span>
<span class="line"><span>      .loginPage(&quot;/mylogin.html&quot;)</span></span>
<span class="line"><span>      .loginProcessingUrl(&quot;/doLogin&quot;)</span></span>
<span class="line"><span>      .defaultSuccessUrl(&quot;/index.html&quot;)</span></span>
<span class="line"><span>      .failureForwardUrl(&quot;/mylogin.html&quot;)</span></span>
<span class="line"><span>      .usernameParameter(&quot;uname&quot;)</span></span>
<span class="line"><span>      .passwordParameter(&quot;passwd&quot;)</span></span>
<span class="line"><span>      .permitAll()</span></span>
<span class="line"><span>      .and()</span></span>
<span class="line"><span>      .csrf().disable();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><div class="info custom-block"><p class="custom-block-title">INFO</p><p>spring security抛弃WebSecurityConfigurerAdapter的说法如下：</p><ol><li>简化安全配置，降低开发者的学习曲线。</li><li>使配置更加模块化、显式化和可维护。</li><li>让 Spring Security 更加贴合 Spring 的现代配置风格。</li><li>提供更灵活的 API，适应复杂的安全需求。</li></ol></div><h2 id="websecurity" tabindex="-1">WebSecurity <a class="header-anchor" href="#websecurity" aria-label="Permalink to &quot;WebSecurity&quot;">​</a></h2><p>由于FilterChainProxy是通过WebSecurity#build方法构建的，所以我们来看看这个方法做了什么事情。</p><p>首先我们看看WebSecurity的类继承图</p><img src="`+t+`" width="500" alt="webSecurity继承图"><p>当执行WebSecurity#build方法的时候，实际上执行的是AbstractSecurityBuilder#build方法，查看该方法</p><div class="language-AbstractSecurityBuilder vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractSecurityBuilder</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractSecurityBuilder&lt;O&gt; implements SecurityBuilder&lt;O&gt; {</span></span>
<span class="line"><span>  private AtomicBoolean building = new AtomicBoolean();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>	public final O build() throws Exception {</span></span>
<span class="line"><span>    // 防止重复初始化</span></span>
<span class="line"><span>    if (this.building.compareAndSet(false, true)) {</span></span>
<span class="line"><span>      this.object = doBuild();</span></span>
<span class="line"><span>      return this.object;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    throw new AlreadyBuiltException(&quot;This object has already been built&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>调用了AbstractSecurityBuilder#doBuild方法，实际上执行的是AbstractConfiguredSecurityBuilder#doBuild方法，查看该方法</p><div class="language-AbstractConfiguredSecurityBuilder vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractConfiguredSecurityBuilder</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractConfiguredSecurityBuilder&lt;O, B extends SecurityBuilder&lt;O&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractSecurityBuilder&lt;O&gt; {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected final O doBuild() throws Exception {</span></span>
<span class="line"><span>    synchronized (this.configurers) {</span></span>
<span class="line"><span>      this.buildState = BuildState.INITIALIZING;</span></span>
<span class="line"><span>      beforeInit();</span></span>
<span class="line"><span>      // 执行所有SecurityConfigurer的init方法</span></span>
<span class="line"><span>      init();</span></span>
<span class="line"><span>      this.buildState = BuildState.CONFIGURING;</span></span>
<span class="line"><span>      beforeConfigure();</span></span>
<span class="line"><span>      // 执行所有SecurityConfigurer的configure方法</span></span>
<span class="line"><span>      configure();</span></span>
<span class="line"><span>      this.buildState = BuildState.BUILDING;</span></span>
<span class="line"><span>      // 核心方法performBuild</span></span>
<span class="line"><span>      O result = performBuild();</span></span>
<span class="line"><span>      this.buildState = BuildState.BUILT;</span></span>
<span class="line"><span>      return result;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>调用了AbstractConfiguredSecurityBuilder#performBuild方法，实际上是调用Web Security#performBuild方法, 这个函数很长，我们只关注本节相关的内容</p><div class="language-WebSecurity vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">WebSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class WebSecurity extends AbstractConfiguredSecurityBuilder&lt;Filter, WebSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;Filter&gt;, ApplicationContextAware, ServletContextAware {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected Filter performBuild() throws Exception {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    // 获取securityFilterChain的个数</span></span>
<span class="line"><span>    int chainSize = this.ignoredRequests.size() + this.securityFilterChainBuilders.size();</span></span>
<span class="line"><span>    // 初始化securityFilterChains</span></span>
<span class="line"><span>    List&lt;SecurityFilterChain&gt; securityFilterChains = new ArrayList&lt;&gt;(chainSize);</span></span>
<span class="line"><span>    List&lt;RequestMatcherEntry&lt;List&lt;WebInvocationPrivilegeEvaluator&gt;&gt;&gt; requestMatcherPrivilegeEvaluatorsEntries = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>    // 对于ignoredRequests的请求，构建一条过滤器，直接放行</span></span>
<span class="line"><span>    for (RequestMatcher ignoredRequest : this.ignoredRequests) {</span></span>
<span class="line"><span>      WebSecurity.this.logger.warn(&quot;You are asking Spring Security to ignore &quot; + ignoredRequest</span></span>
<span class="line"><span>          + &quot;. This is not recommended -- please use permitAll via HttpSecurity#authorizeHttpRequests instead.&quot;);</span></span>
<span class="line"><span>      // 针对每个ignoredRequest，构造一个DefaultSecurityFilterChain，默认全部放行</span></span>
<span class="line"><span>      SecurityFilterChain securityFilterChain = new DefaultSecurityFilterChain(ignoredRequest);</span></span>
<span class="line"><span>      securityFilterChains.add(securityFilterChain);</span></span>
<span class="line"><span>      requestMatcherPrivilegeEvaluatorsEntries</span></span>
<span class="line"><span>        .add(getRequestMatcherPrivilegeEvaluatorsEntry(securityFilterChain));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    DefaultSecurityFilterChain anyRequestFilterChain = null;</span></span>
<span class="line"><span>    // 对于用户配置的过滤器链，SecurityConfig中配置的过滤器，构建过滤器</span></span>
<span class="line"><span>    for (SecurityBuilder&lt;? extends SecurityFilterChain&gt; securityFilterChainBuilder : this.securityFilterChainBuilders) {</span></span>
<span class="line"><span>      // 构建securityFilterChain</span></span>
<span class="line"><span>      SecurityFilterChain securityFilterChain = securityFilterChainBuilder.build();</span></span>
<span class="line"><span>      ...</span></span>
<span class="line"><span>      if (securityFilterChain instanceof DefaultSecurityFilterChain defaultSecurityFilterChain) {</span></span>
<span class="line"><span>        if (defaultSecurityFilterChain.getRequestMatcher() instanceof AnyRequestMatcher) {</span></span>
<span class="line"><span>          anyRequestFilterChain = defaultSecurityFilterChain;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 加入到securityFilterChains</span></span>
<span class="line"><span>      securityFilterChains.add(securityFilterChain);</span></span>
<span class="line"><span>      requestMatcherPrivilegeEvaluatorsEntries</span></span>
<span class="line"><span>        .add(getRequestMatcherPrivilegeEvaluatorsEntry(securityFilterChain));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (this.privilegeEvaluator == null) {</span></span>
<span class="line"><span>      this.privilegeEvaluator = new RequestMatcherDelegatingWebInvocationPrivilegeEvaluator(</span></span>
<span class="line"><span>          requestMatcherPrivilegeEvaluatorsEntries);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 构建filterChainProxy</span></span>
<span class="line"><span>    FilterChainProxy filterChainProxy = new FilterChainProxy(securityFilterChains);</span></span>
<span class="line"><span>    if (this.httpFirewall != null) {</span></span>
<span class="line"><span>      filterChainProxy.setFirewall(this.httpFirewall);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (this.requestRejectedHandler != null) {</span></span>
<span class="line"><span>      filterChainProxy.setRequestRejectedHandler(this.requestRejectedHandler);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else if (!this.observationRegistry.isNoop()) {</span></span>
<span class="line"><span>      CompositeRequestRejectedHandler requestRejectedHandler = new CompositeRequestRejectedHandler(</span></span>
<span class="line"><span>          new ObservationMarkingRequestRejectedHandler(this.observationRegistry),</span></span>
<span class="line"><span>          new HttpStatusRequestRejectedHandler());</span></span>
<span class="line"><span>      filterChainProxy.setRequestRejectedHandler(requestRejectedHandler);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    filterChainProxy.setFilterChainDecorator(getFilterChainDecorator());</span></span>
<span class="line"><span>    filterChainProxy.afterPropertiesSet();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    Filter result = filterChainProxy;</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    // 返回filterChainProxy</span></span>
<span class="line"><span>    return result;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br></div></div><p>到现在为止，我们只要关心this.ignoredRequests跟this.securityFilterChainBuilders是怎么初始化的就可以了。</p><h2 id="securityfilterchain" tabindex="-1">SecurityFilterChain <a class="header-anchor" href="#securityfilterchain" aria-label="Permalink to &quot;SecurityFilterChain&quot;">​</a></h2><p>让我重新回看WebSecurityConfiguration中的springSecurityFilterChain这个Bean</p><div class="language-WebSecurityConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">WebSecurityConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class WebSecurityConfiguration implements ImportAware, BeanClassLoaderAware {</span></span>
<span class="line"><span>  @Bean(name = AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME)</span></span>
<span class="line"><span>  public Filter springSecurityFilterChain() throws Exception {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    // 遍历SecurityFilterChain，往WebSecurity中加入securityFilterChainBuilder</span></span>
<span class="line"><span>    for (SecurityFilterChain securityFilterChain : this.securityFilterChains) {</span></span>
<span class="line"><span>      this.webSecurity.addSecurityFilterChainBuilder(() -&gt; securityFilterChain);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 构建SecurityFilterChain</span></span>
<span class="line"><span>    return this.webSecurity.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>可以看到securityFilterChainBuilder#build返回的是一个SecurityFilterChain对象，这个对象是从哪里来的呢，找到WebSecurityConfiguration的securityFilterChains赋值的地方</p><div class="language-WebSecurityConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">WebSecurityConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class WebSecurityConfiguration implements ImportAware, BeanClassLoaderAware {</span></span>
<span class="line"><span>  // 通过Autowired注入securityFilterChains</span></span>
<span class="line"><span>  @Autowired(required = false)</span></span>
<span class="line"><span>  void setFilterChains(List&lt;SecurityFilterChain&gt; securityFilterChains) {</span></span>
<span class="line"><span>    this.securityFilterChains = securityFilterChains;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><div class="info custom-block"><p class="custom-block-title">INFO</p><p>这里注入的securityFilterChains是List类型，Spring框架会自动按照@Order注解进行排序，所以这里得到的就是有优先级的securityFilterChains了</p></div><h2 id="httpsecurity" tabindex="-1">HttpSecurity <a class="header-anchor" href="#httpsecurity" aria-label="Permalink to &quot;HttpSecurity&quot;">​</a></h2><p>查看SecurityFilterChain接口代码, 可以看到一共有两个方法。</p><div class="language-SecurityFilterChain vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityFilterChain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface SecurityFilterChain {</span></span>
<span class="line"><span>  // 请求的request是否可以用该过滤器</span></span>
<span class="line"><span>  boolean matches(HttpServletRequest request);</span></span>
<span class="line"><span>  // 获取该过滤器链中所有的过滤器</span></span>
<span class="line"><span>  List&lt;Filter&gt; getFilters();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>SecurityFilterChain这个接口只有一个实现类，就是DefaultSecurityFilterChain，查看这个类的代码</p><div class="language-DefaultSecurityFilterChain vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityFilterChain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class DefaultSecurityFilterChain implements SecurityFilterChain, BeanNameAware, BeanFactoryAware {</span></span>
<span class="line"><span>  public DefaultSecurityFilterChain(RequestMatcher requestMatcher, List&lt;Filter&gt; filters) {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>		this.requestMatcher = requestMatcher;</span></span>
<span class="line"><span>		this.filters = new ArrayList&lt;&gt;(filters);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>前面讲到WebSecurity#performBuild的时候，针对每个ignoredRequests构建了一个全部放行的DefaultSecurityFilterChain。</p><p>那么WebSecurityConfiguration中的securityFilterChains是在哪里赋值的，前面我们看到了是通过注入方式来获取的。重点来了，这个就是我们之前在SecurityConfig中构建出来的。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig  {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(withDefaults());</span></span>
<span class="line"><span>    http.httpBasic(withDefaults());</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>上面的代码是不是很熟悉，defaultSecurityFilterChain返回的就是一个SecurityFilterChain。我们查看HttpSecurity的继承关系图。</p><img src="`+a+`" width="500" alt="httpSecurity继承图"><p>可以看到HttpSecurity同样是继承AbstractConfiguredSecurityBuilder的，所以http.build()，我们直接看HttpSecurity#performBuild方法。</p><div class="language-HttpSecurity vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">HttpSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class HttpSecurity extends AbstractConfiguredSecurityBuilder&lt;DefaultSecurityFilterChain, HttpSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;DefaultSecurityFilterChain&gt;, HttpSecurityBuilder&lt;HttpSecurity&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected DefaultSecurityFilterChain performBuild() {</span></span>
<span class="line"><span>    ExpressionUrlAuthorizationConfigurer&lt;?&gt; expressionConfigurer = getConfigurer(</span></span>
<span class="line"><span>        ExpressionUrlAuthorizationConfigurer.class);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    // 针对过滤器链中的filter进行排序，根据@Order注解上的顺序</span></span>
<span class="line"><span>    this.filters.sort(OrderComparator.INSTANCE);</span></span>
<span class="line"><span>    List&lt;Filter&gt; sortedFilters = new ArrayList&lt;&gt;(this.filters.size());</span></span>
<span class="line"><span>    // 排序后的过滤器链</span></span>
<span class="line"><span>    for (Filter filter : this.filters) {</span></span>
<span class="line"><span>      sortedFilters.add(((OrderedFilter) filter).filter);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 构建DefaultSecurityFilterChain</span></span>
<span class="line"><span>    return new DefaultSecurityFilterChain(this.requestMatcher, sortedFilters);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><p>到这里，整个过滤器链的初始化流程就很明了了。可以看到WebSecurity是负责将所有的HttpSecurity构建出来的DefaultSecurityFilterChain放入到FilterChainProxy中的。</p><h2 id="ignoredrequests" tabindex="-1">IgnoredRequests <a class="header-anchor" href="#ignoredrequests" aria-label="Permalink to &quot;IgnoredRequests&quot;">​</a></h2><p>前面提到WebSecurity会针对所有的ignoredRequests构建一个默认放行的过滤器链。本节主要介绍ignoredRequests的构建流程</p><div class="language-WebSecurity vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">WebSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class WebSecurity extends AbstractConfiguredSecurityBuilder&lt;Filter, WebSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;Filter&gt;, ApplicationContextAware, ServletContextAware {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  private final List&lt;RequestMatcher&gt; ignoredRequests = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public class IgnoredRequestConfigurer extends AbstractRequestMatcherRegistry&lt;IgnoredRequestConfigurer&gt; {</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    protected IgnoredRequestConfigurer chainRequestMatchers(List&lt;RequestMatcher&gt; requestMatchers) {</span></span>
<span class="line"><span>      WebSecurity.this.ignoredRequests.addAll(requestMatchers);</span></span>
<span class="line"><span>      return this;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>IgnoredRequestConfigurer继承了AbstractRequestMatcherRegistry类，看看这个类跟IgnoredRequests相关的内容。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractRequestMatcherRegistry&lt;C&gt; {</span></span>
<span class="line"><span>  public C requestMatchers(String... patterns) {</span></span>
<span class="line"><span>    return requestMatchers(null, patterns);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public C requestMatchers(HttpMethod method, String... patterns) {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    return requestMatchers(matchers.toArray(new RequestMatcher[0]));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public C requestMatchers(RequestMatcher... requestMatchers) {</span></span>
<span class="line"><span>    Assert.state(!this.anyRequestConfigured, &quot;Can&#39;t configure requestMatchers after anyRequest&quot;);</span></span>
<span class="line"><span>    // 调用子类的chainRequestMatchers</span></span>
<span class="line"><span>    return chainRequestMatchers(Arrays.asList(requestMatchers));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>可以看到是在IgnoredRequestConfigurer#chainRequestMatchers中进行添加的，我们看看IgnoredRequestConfigurer中的构建流程。</p><div class="language-WebSecurity vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">WebSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class WebSecurity extends AbstractConfiguredSecurityBuilder&lt;Filter, WebSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;Filter&gt;, ApplicationContextAware, ServletContextAware {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {</span></span>
<span class="line"><span>    this.ignoredRequestRegistry = new IgnoredRequestConfigurer(applicationContext);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>由于WebSecurity继承了ApplicationContextAware接口，所以在spring初始化过程中，会调用setApplicationContext，在这里初始化了一个IgnoredRequestConfigurer。</p><p>我们要怎么添加ignoredRequests呢？回头看WebSecurityConfiguration的springSecurityFilterChain类。</p><div class="language-WebSecurityConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">WebSecurityConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class WebSecurityConfiguration implements ImportAware, BeanClassLoaderAware {</span></span>
<span class="line"><span>  	@Bean(name = AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME)</span></span>
<span class="line"><span>	public Filter springSecurityFilterChain() throws Exception {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>		for (WebSecurityCustomizer customizer : this.webSecurityCustomizers) {</span></span>
<span class="line"><span>			customizer.customize(this.webSecurity);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>		return this.webSecurity.build();</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	@Autowired(required = false)</span></span>
<span class="line"><span>	void setWebSecurityCustomizers(List&lt;WebSecurityCustomizer&gt; webSecurityCustomizers) {</span></span>
<span class="line"><span>		this.webSecurityCustomizers = webSecurityCustomizers;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>可以看到customizer.customize中传入了webSecurity参数，这样子我们可以调用WebSecurity的一些方法，而this.webSecurityCustomizers是通过注入进来的。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class WebSecurity extends AbstractConfiguredSecurityBuilder&lt;Filter, WebSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;Filter&gt;, ApplicationContextAware, ServletContextAware {</span></span>
<span class="line"><span>	public IgnoredRequestConfigurer ignoring() {</span></span>
<span class="line"><span>		return this.ignoredRequestRegistry;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>看看WebSecurity为IgnoredRequests提供了什么接口。IgnoredRequestConfigurer返回了ignoredRequestRegistry，就是上面的IgnoredRequestConfigurer。</p><p>所以如果我们如果需要定义某些链接不走spring security的过滤器链，可以实现一个WebSecurityCustomizer的bean就可以了。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class SecurityConfig {</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public WebSecurityCustomizer webSecurityCustomizer() {</span></span>
<span class="line"><span>    return (web) -&gt; web.ignoring().requestMatchers(&quot;/images/**&quot;, &quot;/js/**&quot;, &quot;/webjars/**&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>上面的配置就是默认放行所有的静态资源。</p><h2 id="demo" tabindex="-1">Demo <a class="header-anchor" href="#demo" aria-label="Permalink to &quot;Demo&quot;">​</a></h2><img src="`+n+`" width="500" alt="系统架构"><p>在本章节的最后，我们基于上面的这个架构图创建一个配置吧，上面包含了两个SecurityFilterChain</p><ul><li>一个过滤器链处理/api/，实现表单认证</li><li>一个过滤器链处理/**, 实现HttpBasic认证</li></ul><p>首先我们定义几个接口。新建一个HelloController，代码如下所示</p><div class="language-HelloController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">HelloController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@RestController</span></span>
<span class="line"><span>public class HelloController {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @GetMapping(&quot;/hello&quot;)</span></span>
<span class="line"><span>  public String hello() {</span></span>
<span class="line"><span>    return &quot;hello spring security&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @GetMapping(&quot;/api/hello&quot;)</span></span>
<span class="line"><span>  public String apiHello() {</span></span>
<span class="line"><span>    return &quot;hello api spring security&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @GetMapping(&quot;/basic&quot;)</span></span>
<span class="line"><span>  public String basic() {</span></span>
<span class="line"><span>    return &quot;hello basic spring security&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>然后定义SecurityConfig文件，具体代码如下所示</p><div class="language-DefaultSecurityConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public WebSecurityCustomizer webSecurityCustomizer() {</span></span>
<span class="line"><span>    return (web) -&gt; web.ignoring().requestMatchers(&quot;/hello&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.securityMatcher(&quot;/api/**&quot;, &quot;/login&quot;, &quot;/default-ui.css&quot;);</span></span>
<span class="line"><span>    http.authorizeHttpRequests(requests -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(Customizer.withDefaults());</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain basicSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests(requests -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.httpBasic(Customizer.withDefaults());</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><p>我们讲解一下上面这个配置文件</p><ul><li>针对/hello接口，直接放行</li><li>针对/api/**, /login，/default-ui.css接口，我们直接走表单登录，注意/default-ui.css这个文件表单登录页面用到</li><li>其他的接口，我们直接走HttpBasic校验</li></ul><p>在application.yml配置用户名为user，密码为password。启动项目，验证上面几个功能。</p><p>访问/api/hello接口，跳转表单登录页面，输入帐号密码，返回hello api spring security字符串</p><img src="`+e+'" width="500" alt="login"><p>访问/hello接口，直接返回hello spring security</p><p>访问/basic接口，跳出HttpBasic校验弹窗，输入帐号密码，返回hello basic spring security字符串</p><img src="'+c+`" width="500" alt="httpbasic"><p>详细代码，点击<a href="https://github.com/shengduiliang/spring-security-demo/tree/main/spring-security-filter-chain" target="_blank" rel="noreferrer">此处</a></p><h2 id="调试指南" tabindex="-1">调试指南 <a class="header-anchor" href="#调试指南" aria-label="Permalink to &quot;调试指南&quot;">​</a></h2><p>如果大家在使用Spring Security过程中遇到问题，实在不知道怎么排查，可以直接从FilterChainProxy开始排查，因为所有的请求都要通过FilterChainProxy#DoFilter。那接下来我们研究一下这块流程吧。</p><div class="language-FilterChainProxy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">FilterChainProxy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class FilterChainProxy extends GenericFilterBean {</span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>			throws IOException, ServletException {</span></span>
<span class="line"><span>		boolean clearContext = request.getAttribute(FILTER_APPLIED) == null;</span></span>
<span class="line"><span>		if (!clearContext) {</span></span>
<span class="line"><span>			doFilterInternal(request, response, chain);</span></span>
<span class="line"><span>			return;</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>		try {</span></span>
<span class="line"><span>			request.setAttribute(FILTER_APPLIED, Boolean.TRUE);</span></span>
<span class="line"><span>			doFilterInternal(request, response, chain);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	private void doFilterInternal(ServletRequest request, ServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>			throws IOException, ServletException {</span></span>
<span class="line"><span>		FirewalledRequest firewallRequest = this.firewall.getFirewalledRequest((HttpServletRequest) request);</span></span>
<span class="line"><span>		HttpServletResponse firewallResponse = this.firewall.getFirewalledResponse((HttpServletResponse) response);</span></span>
<span class="line"><span>    // 从所有的SecurityFilterChains找到对应的SecurityFilterChain</span></span>
<span class="line"><span>		List&lt;Filter&gt; filters = getFilters(firewallRequest);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>		this.filterChainDecorator.decorate(reset, filters).doFilter(firewallRequest, firewallResponse);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br></div></div><p>可以看到doFilter中调用doFilterInternal，先找到对应需要处理的SecurityFilterChain，然后调用this.filterChainDecorator.decorate(reset, filters).doFilter(firewallRequest, firewallResponse)进行处理。</p><p>我们先来看看getFilters的流程吧，代码如下所示</p><div class="language-FilterChainProxy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">FilterChainProxy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class FilterChainProxy extends GenericFilterBean {</span></span>
<span class="line"><span>  	private List&lt;Filter&gt; getFilters(HttpServletRequest request) {</span></span>
<span class="line"><span>		int count = 0;</span></span>
<span class="line"><span>		for (SecurityFilterChain chain : this.filterChains) {</span></span>
<span class="line"><span>      // 判断是否符合</span></span>
<span class="line"><span>			if (chain.matches(request)) {</span></span>
<span class="line"><span>				return chain.getFilters();</span></span>
<span class="line"><span>			}</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>		return null;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>可以看到是调用chain.matches(request)方法进行判断的，这里我们回看SecurityFilterChain接口代码, 就很清楚了。</p><div class="language-SecurityFilterChain vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityFilterChain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface SecurityFilterChain {</span></span>
<span class="line"><span>  // 请求的request是否可以用该过滤器</span></span>
<span class="line"><span>  boolean matches(HttpServletRequest request);</span></span>
<span class="line"><span>  // 获取该过滤器链中所有的过滤器</span></span>
<span class="line"><span>  List&lt;Filter&gt; getFilters();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>查看matches的具体实现</p><div class="language-DefaultSecurityFilterChain vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityFilterChain</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class DefaultSecurityFilterChain implements SecurityFilterChain, BeanNameAware, BeanFactoryAware {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>	public boolean matches(HttpServletRequest request) {</span></span>
<span class="line"><span>		return this.requestMatcher.matches(request);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>this.requestMatcher就是上面表单认证中的http.securityMatcher(&quot;/api/**&quot;, &quot;/login&quot;, &quot;/default-ui.css&quot;)生成的校验规则，这里不细讲了。</p><p>我们再看this.filterChainDecorator.decorate(reset, filters).doFilter(firewallRequest, firewallResponse)，这里其实就是将过滤器链里面的Fitlers利用装饰器封装一下，最终生成的是VirtualFilterChain，然后执行VirtualFilterChain的DoFilter方法。查看该方法</p><div class="language-FilterChainProxy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">FilterChainProxy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class FilterChainProxy extends GenericFilterBean {</span></span>
<span class="line"><span>	private static final class VirtualFilterChain implements FilterChain {</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>		public void doFilter(ServletRequest request, ServletResponse response) throws IOException, ServletException {</span></span>
<span class="line"><span>			if (this.currentPosition == this.size) {</span></span>
<span class="line"><span>				this.originalChain.doFilter(request, response);</span></span>
<span class="line"><span>				return;</span></span>
<span class="line"><span>			}</span></span>
<span class="line"><span>			this.currentPosition++;</span></span>
<span class="line"><span>			Filter nextFilter = this.additionalFilters.get(this.currentPosition - 1);</span></span>
<span class="line"><span>			if (logger.isTraceEnabled()) {</span></span>
<span class="line"><span>				String name = nextFilter.getClass().getSimpleName();</span></span>
<span class="line"><span>				logger.trace(LogMessage.format(&quot;Invoking %s (%d/%d)&quot;, name, this.currentPosition, this.size));</span></span>
<span class="line"><span>			}</span></span>
<span class="line"><span>			nextFilter.doFilter(request, response, this);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>VirtualFilterChain是FilterChainProxy的一个内部类。</p><p>如果遇到问题，可以从FilterChainProxy的DoFilter和VirtualFilterChain的DoFilter方法入手。</p><p>好了，关于Spring Security的架构设计和初始化流程就介绍到这里了。下一个章节我们开始讲解HttpSecurity是怎么构建出来架构图里面的每一条过滤器的。</p>`,110)]))}const v=p(u,[["render",b]]);export{f as __pageData,v as default};
