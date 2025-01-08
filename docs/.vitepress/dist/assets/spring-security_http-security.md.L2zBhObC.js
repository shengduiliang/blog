import{_ as n}from"./chunks/httpSecurity.BOJSEaAH.js";import{_ as a,c as t,a0 as e,o as p}from"./chunks/framework.P9qPzDnn.js";const i="/assets/configurer.LWPFpSHL.png",r="/assets/http-security-configurer-2.vYWEjbh7.png",l="/assets/http-security-configurer-1.DvrlIstZ.png",c="/assets/filter-chains.CLKKDpZR.png",C=JSON.parse('{"title":"SecurityFilterChain构建流程","description":"","frontmatter":{},"headers":[],"relativePath":"spring-security/http-security.md","filePath":"spring-security/http-security.md"}'),o={name:"spring-security/http-security.md"};function u(d,s,g,h,y,f){return p(),t("div",null,s[0]||(s[0]=[e(`<h1 id="securityfilterchain构建流程" tabindex="-1">SecurityFilterChain构建流程 <a class="header-anchor" href="#securityfilterchain构建流程" aria-label="Permalink to &quot;SecurityFilterChain构建流程&quot;">​</a></h1><p>这个章节我们讲解一下HttpSecurity是怎么构建出来FilterChainProxy里面的每一个SecurityFilterChain的。我们从Spring Security的配置文件开始讲起。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig  {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(withDefaults());</span></span>
<span class="line"><span>    http.httpBasic(withDefaults());</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>经过了前面几章的讲解，相信大家对上面的代码很熟悉，就是拿到HttpSecurity对象，然后调用里面的build方法，返回一条SecurityFilterChain。</p><h2 id="httpsecurity导入" tabindex="-1">HttpSecurity导入 <a class="header-anchor" href="#httpsecurity导入" aria-label="Permalink to &quot;HttpSecurity导入&quot;">​</a></h2><p>我们可以看到defaultSecurityFilterChain中的http是通过Spring注入进来，所以我们先找到这个Bean注册的地方。先看Spring Boot关于Spring Security的自动配置文件</p><div class="language-SecurityAutoConfiguration vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">SecurityAutoConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Import({ SpringBootWebSecurityConfiguration.class, SecurityDataConfiguration.class })</span></span>
<span class="line"><span>public class SecurityAutoConfiguration {</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>导入了SpringBootWebSecurityConfiguration这个类，查看代码。</p><div class="language-SpringBootWebSecurityConfiguration vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">SpringBootWebSecurityConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>@ConditionalOnWebApplication(type = Type.SERVLET)</span></span>
<span class="line"><span>class SpringBootWebSecurityConfiguration {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	@EnableWebSecurity</span></span>
<span class="line"><span>	static class WebSecurityEnablerConfiguration {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到WebSecurityEnablerConfiguration声明了@EnableWebSecurity这个注解，查看该注解。</p><div class="language-EnableWebSecurity vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">EnableWebSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Import({ WebSecurityConfiguration.class, SpringWebMvcImportSelector.class, OAuth2ImportSelector.class,</span></span>
<span class="line"><span>		HttpSecurityConfiguration.class, ObservationImportSelector.class })</span></span>
<span class="line"><span>@EnableGlobalAuthentication</span></span>
<span class="line"><span>public @interface EnableWebSecurity {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到导入了HttpSecurityConfiguration这个类, 点击进去查看该类的代码。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>class HttpSecurityConfiguration {</span></span>
<span class="line"><span>  @Bean(HTTPSECURITY_BEAN_NAME)</span></span>
<span class="line"><span>	@Scope(&quot;prototype&quot;)</span></span>
<span class="line"><span>	HttpSecurity httpSecurity() throws Exception {</span></span>
<span class="line"><span>		LazyPasswordEncoder passwordEncoder = new LazyPasswordEncoder(this.context);</span></span>
<span class="line"><span>		AuthenticationManagerBuilder authenticationBuilder = new DefaultPasswordEncoderAuthenticationManagerBuilder(</span></span>
<span class="line"><span>				this.objectPostProcessor, passwordEncoder);</span></span>
<span class="line"><span>		authenticationBuilder.parentAuthenticationManager(authenticationManager());</span></span>
<span class="line"><span>		authenticationBuilder.authenticationEventPublisher(getAuthenticationEventPublisher());</span></span>
<span class="line"><span>		HttpSecurity http = new HttpSecurity(this.objectPostProcessor, authenticationBuilder, createSharedObjects());</span></span>
<span class="line"><span>		WebAsyncManagerIntegrationFilter webAsyncManagerIntegrationFilter = new WebAsyncManagerIntegrationFilter();</span></span>
<span class="line"><span>		webAsyncManagerIntegrationFilter.setSecurityContextHolderStrategy(this.securityContextHolderStrategy);</span></span>
<span class="line"><span>		// @formatter:off</span></span>
<span class="line"><span>		http</span></span>
<span class="line"><span>			.csrf(withDefaults()) // 开启csrf检验</span></span>
<span class="line"><span>			.addFilter(webAsyncManagerIntegrationFilter) // 将WebAsyncManager与Spring Security上下文继承</span></span>
<span class="line"><span>			.exceptionHandling(withDefaults()) // 异常处理</span></span>
<span class="line"><span>			.headers(withDefaults()) </span></span>
<span class="line"><span>			.sessionManagement(withDefaults()) // 会话管理</span></span>
<span class="line"><span>			.securityContext(withDefaults()) // spring security 上下文管理</span></span>
<span class="line"><span>			.requestCache(withDefaults())</span></span>
<span class="line"><span>			.anonymous(withDefaults())</span></span>
<span class="line"><span>			.servletApi(withDefaults())</span></span>
<span class="line"><span>			.apply(new DefaultLoginPageConfigurer&lt;&gt;()); // 生成默认的登录页面</span></span>
<span class="line"><span>		http.logout(withDefaults()); // logout处理流程</span></span>
<span class="line"><span>		// @formatter:on</span></span>
<span class="line"><span>		applyCorsIfAvailable(http);</span></span>
<span class="line"><span>		applyDefaultConfigurers(http);</span></span>
<span class="line"><span>		return http;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到这个类声明一个HttpSecurity Bean, 这个Bean就是我们上面在DefaultSecurityConfig导入的HttpSecurity，另外我们可以看到这是一个原型Bean，也就是说我们每次注入HttpSecurity，得到的对象都是不一样的，这样就可以用来构建多条SecurityFilterChain了。我们可以看到这里的http默认执行了很多函数，这里的函数大多数会往过滤器中加入过滤器。</p><h2 id="httpsecurity初始化流程" tabindex="-1">HttpSecurity初始化流程 <a class="header-anchor" href="#httpsecurity初始化流程" aria-label="Permalink to &quot;HttpSecurity初始化流程&quot;">​</a></h2><p>上一篇文章我们粗略的讲解了http.build()逻辑，会针对过滤器链中的filter进行排序，并且构建出来一条SecurityFilterChain。这里给大家详细地讲解一下http.build()流程。</p><img src="`+n+`" width="500" alt="httpSecurity继承图"><p>由于HttpSecurity继承了AbstractConfiguredSecurityBuilder这个抽象类，并且http.build()会执行AbstractConfiguredSecurityBuilder的doBuild方法，那么我们来看这个方法。</p><div class="language-AbstractConfiguredSecurityBuilder vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">AbstractConfiguredSecurityBuilder</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractConfiguredSecurityBuilder&lt;O, B extends SecurityBuilder&lt;O&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractSecurityBuilder&lt;O&gt; {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected final O doBuild() throws Exception {</span></span>
<span class="line"><span>    synchronized (this.configurers) {</span></span>
<span class="line"><span>      this.buildState = BuildState.INITIALIZING;</span></span>
<span class="line"><span>      // HttpSercurity没有实现这个方法，不用考虑</span></span>
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
<span class="line"><span>}</span></span></code></pre></div><ol><li><p>HttpSecurity没有实现beforeInit方法，不用考虑</p></li><li><p>init方法，这里会调用HttpSecurity所有的SecurityConfigurer的init方法实现，具体代码如下</p></li></ol><div class="language-AbstractConfiguredSecurityBuilder vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">AbstractConfiguredSecurityBuilder</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractConfiguredSecurityBuilder&lt;O, B extends SecurityBuilder&lt;O&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractSecurityBuilder&lt;O&gt; {</span></span>
<span class="line"><span>	private void init() throws Exception {</span></span>
<span class="line"><span>		Collection&lt;SecurityConfigurer&lt;O, B&gt;&gt; configurers = getConfigurers();</span></span>
<span class="line"><span>		for (SecurityConfigurer&lt;O, B&gt; configurer : configurers) {</span></span>
<span class="line"><span>			configurer.init((B) this);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>		for (SecurityConfigurer&lt;O, B&gt; configurer : this.configurersAddedInInitializing) {</span></span>
<span class="line"><span>			configurer.init((B) this);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这些configurers都是什么呢，还记得我们在Security中声明的http.formLogin(withDefaults())吗，查看代码实现:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public HttpSecurity formLogin(Customizer&lt;FormLoginConfigurer&lt;HttpSecurity&gt;&gt; formLoginCustomizer) throws Exception {</span></span>
<span class="line"><span>  formLoginCustomizer.customize(getOrApply(new FormLoginConfigurer&lt;&gt;()));</span></span>
<span class="line"><span>  return HttpSecurity.this;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这里的FormLoginConfigurer就是一个SecurityConfigurer。</p><ol start="3"><li>beforeConfigure, 这里调用了HttpSecurity的beforeConfigure方法，具体是忘Http Security写入了一个authenticationManager的对象，这个对象是用来做权限校验的，下一章节会讲到。</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class HttpSecurity extends AbstractConfiguredSecurityBuilder&lt;DefaultSecurityFilterChain, HttpSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;DefaultSecurityFilterChain&gt;, HttpSecurityBuilder&lt;HttpSecurity&gt; {</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected void beforeConfigure() throws Exception {</span></span>
<span class="line"><span>    if (this.authenticationManager != null) {</span></span>
<span class="line"><span>      setSharedObject(AuthenticationManager.class, this.authenticationManager);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      ObjectPostProcessor&lt;AuthenticationManager&gt; postProcessor = getAuthenticationManagerPostProcessor();</span></span>
<span class="line"><span>      AuthenticationManager manager = getAuthenticationRegistry().build();</span></span>
<span class="line"><span>      if (manager != null) {</span></span>
<span class="line"><span>        setSharedObject(AuthenticationManager.class, postProcessor.postProcess(manager));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><ol start="4"><li>调用configure方法，这里会调用HttpSecurity所有的SecurityConfigurer的configure方法实现，具体代码如下所示：</li></ol><div class="language-AbstractConfiguredSecurityBuilder vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">AbstractConfiguredSecurityBuilder</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractConfiguredSecurityBuilder&lt;O, B extends SecurityBuilder&lt;O&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractSecurityBuilder&lt;O&gt; {</span></span>
<span class="line"><span>	private void configure() throws Exception {</span></span>
<span class="line"><span>		Collection&lt;SecurityConfigurer&lt;O, B&gt;&gt; configurers = getConfigurers();</span></span>
<span class="line"><span>		for (SecurityConfigurer&lt;O, B&gt; configurer : configurers) {</span></span>
<span class="line"><span>			configurer.configure((B) this);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><ol start="5"><li>performBuild方法，这个上一篇文章已经讲过了，是用来构建SecurityFilterChain的。</li></ol><h2 id="securityconfigurer" tabindex="-1">SecurityConfigurer <a class="header-anchor" href="#securityconfigurer" aria-label="Permalink to &quot;SecurityConfigurer&quot;">​</a></h2><p>上面我们知道了，HttpSecurity#build主要是调用SecurityConfigurer#init和SecurityConfigurer#configure方法的。为了方便理解，这里拿HttpBasic的configurer给大家演示一下（表单登录的有点复杂，下一篇会讲到）。</p><p>首先看一下引入，http.httpBasic(withDefaults()), 这个函数会往http中注册一个HttpBasicConfigurer。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public HttpSecurity httpBasic(Customizer&lt;HttpBasicConfigurer&lt;HttpSecurity&gt;&gt; httpBasicCustomizer) throws Exception {</span></span>
<span class="line"><span>  httpBasicCustomizer.customize(getOrApply(new HttpBasicConfigurer&lt;&gt;()));</span></span>
<span class="line"><span>  return HttpSecurity.this;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>再看一下HttpBasicConfigurer的具体实现</p><div class="language-HttpBasicConfigurer vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">HttpBasicConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class HttpBasicConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;HttpBasicConfigurer&lt;B&gt;, B&gt; {</span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	public void init(B http) {</span></span>
<span class="line"><span>		registerDefaults(http);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	private void registerDefaults(B http) {</span></span>
<span class="line"><span>    ContentNegotiationStrategy contentNegotiationStrategy = http.getSharedObject(ContentNegotiationStrategy.class);</span></span>
<span class="line"><span>    if (contentNegotiationStrategy == null) {</span></span>
<span class="line"><span>      contentNegotiationStrategy = new HeaderContentNegotiationStrategy();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    MediaTypeRequestMatcher restMatcher = new MediaTypeRequestMatcher(contentNegotiationStrategy,</span></span>
<span class="line"><span>        MediaType.APPLICATION_ATOM_XML, MediaType.APPLICATION_FORM_URLENCODED, MediaType.APPLICATION_JSON,</span></span>
<span class="line"><span>        MediaType.APPLICATION_OCTET_STREAM, MediaType.APPLICATION_XML, MediaType.MULTIPART_FORM_DATA,</span></span>
<span class="line"><span>        MediaType.TEXT_XML);</span></span>
<span class="line"><span>    restMatcher.setIgnoredMediaTypes(Collections.singleton(MediaType.ALL));</span></span>
<span class="line"><span>    MediaTypeRequestMatcher allMatcher = new MediaTypeRequestMatcher(contentNegotiationStrategy, MediaType.ALL);</span></span>
<span class="line"><span>    allMatcher.setUseEquals(true);</span></span>
<span class="line"><span>    RequestMatcher notHtmlMatcher = new NegatedRequestMatcher(</span></span>
<span class="line"><span>        new MediaTypeRequestMatcher(contentNegotiationStrategy, MediaType.TEXT_HTML));</span></span>
<span class="line"><span>    RequestMatcher restNotHtmlMatcher = new AndRequestMatcher(Arrays.asList(notHtmlMatcher, restMatcher));</span></span>
<span class="line"><span>    RequestMatcher preferredMatcher = new OrRequestMatcher(</span></span>
<span class="line"><span>        Arrays.asList(X_REQUESTED_WITH, restNotHtmlMatcher, allMatcher));</span></span>
<span class="line"><span>    registerDefaultEntryPoint(http, preferredMatcher);</span></span>
<span class="line"><span>    registerDefaultLogoutSuccessHandler(http, preferredMatcher);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void configure(B http) {</span></span>
<span class="line"><span>    AuthenticationManager authenticationManager = http.getSharedObject(AuthenticationManager.class);</span></span>
<span class="line"><span>    BasicAuthenticationFilter basicAuthenticationFilter = new BasicAuthenticationFilter(authenticationManager,</span></span>
<span class="line"><span>        this.authenticationEntryPoint);</span></span>
<span class="line"><span>    if (this.authenticationDetailsSource != null) {</span></span>
<span class="line"><span>      basicAuthenticationFilter.setAuthenticationDetailsSource(this.authenticationDetailsSource);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (this.securityContextRepository != null) {</span></span>
<span class="line"><span>      basicAuthenticationFilter.setSecurityContextRepository(this.securityContextRepository);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    RememberMeServices rememberMeServices = http.getSharedObject(RememberMeServices.class);</span></span>
<span class="line"><span>    if (rememberMeServices != null) {</span></span>
<span class="line"><span>      basicAuthenticationFilter.setRememberMeServices(rememberMeServices);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    basicAuthenticationFilter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());</span></span>
<span class="line"><span>    basicAuthenticationFilter = postProcess(basicAuthenticationFilter);</span></span>
<span class="line"><span>    http.addFilter(basicAuthenticationFilter);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><ul><li>init方法，往http里面注册一些属性和钩子函数</li><li>configure，往http里面添加过滤器，并且配置过滤器的属性</li></ul><p>到这里明白了吧，过滤器链的构建其实就是往HttpSecurity注册各种configurer，然后调用configurer.configure添加过滤器，最终基于这些过滤器，构建出来一条过滤器链。</p><p><img src="`+i+'" alt="configurer"></p><p>可以看到，Spring Security大概定义了33个configurer配置类。可以按需使用这些配置器。</p><p><img src="'+r+'" alt="http-security-configurer-2.png"><img src="'+l+`" alt="http-security-configurer-1"></p><p>这两张图大致是一些Configure的一些说明，仅供参考。</p><h2 id="filter优先级说明" tabindex="-1">Filter优先级说明 <a class="header-anchor" href="#filter优先级说明" aria-label="Permalink to &quot;Filter优先级说明&quot;">​</a></h2><p>在HttpSecurity#performBuild中，构建过滤器链的时候，会对过滤器链进行排序，然后再构建DefaultSecurityFilterChain的。</p><div class="language-HttpSecurity vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">HttpSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class HttpSecurity extends AbstractConfiguredSecurityBuilder&lt;DefaultSecurityFilterChain, HttpSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;DefaultSecurityFilterChain&gt;, HttpSecurityBuilder&lt;HttpSecurity&gt; {</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>  private List&lt;OrderedFilter&gt; filters = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected DefaultSecurityFilterChain performBuild() {</span></span>
<span class="line"><span>    ExpressionUrlAuthorizationConfigurer&lt;?&gt; expressionConfigurer = getConfigurer(</span></span>
<span class="line"><span>        ExpressionUrlAuthorizationConfigurer.class);</span></span>
<span class="line"><span>    AuthorizeHttpRequestsConfigurer&lt;?&gt; httpConfigurer = getConfigurer(AuthorizeHttpRequestsConfigurer.class);</span></span>
<span class="line"><span>    boolean oneConfigurerPresent = expressionConfigurer == null ^ httpConfigurer == null;</span></span>
<span class="line"><span>    // OrderComparator.INSTANCE指根据Order排序</span></span>
<span class="line"><span>    this.filters.sort(OrderComparator.INSTANCE);</span></span>
<span class="line"><span>    List&lt;Filter&gt; sortedFilters = new ArrayList&lt;&gt;(this.filters.size());</span></span>
<span class="line"><span>    for (Filter filter : this.filters) {</span></span>
<span class="line"><span>      sortedFilters.add(((OrderedFilter) filter).filter);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return new DefaultSecurityFilterChain(this.requestMatcher, sortedFilters);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>我们看一下OrderedFilter的构造, 可以看到除了filter，还有一个order属性</p><div class="language-OrderedFilter vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">OrderedFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private static final class OrderedFilter implements Ordered, Filter {</span></span>
<span class="line"><span>  private final Filter filter;</span></span>
<span class="line"><span>  private final int order;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>具体order是在哪里赋值的呢，肯定是在添加过滤器的时候，我们回看http Security的添加过滤器方法。</p><div class="language-HttpSecurity vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">HttpSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class HttpSecurity extends AbstractConfiguredSecurityBuilder&lt;DefaultSecurityFilterChain, HttpSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;DefaultSecurityFilterChain&gt;, HttpSecurityBuilder&lt;HttpSecurity&gt; {</span></span>
<span class="line"><span>  private FilterOrderRegistration filterOrders = new FilterOrderRegistration();</span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	public HttpSecurity addFilter(Filter filter) {</span></span>
<span class="line"><span>		Integer order = this.filterOrders.getOrder(filter.getClass());</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>		this.filters.add(new OrderedFilter(filter, order));</span></span>
<span class="line"><span>		return this;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到是从FilterOrderRegistration中获取的，所以我们直接看FilterOrderRegistration，这也是默认过滤器的优先级。</p><div class="language-FilterOrderRegistration vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">FilterOrderRegistration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>final class FilterOrderRegistration {</span></span>
<span class="line"><span>  	FilterOrderRegistration() {</span></span>
<span class="line"><span>		Step order = new Step(INITIAL_ORDER, ORDER_STEP);</span></span>
<span class="line"><span>		put(DisableEncodeUrlFilter.class, order.next());</span></span>
<span class="line"><span>		put(ForceEagerSessionCreationFilter.class, order.next());</span></span>
<span class="line"><span>		put(ChannelProcessingFilter.class, order.next());</span></span>
<span class="line"><span>		order.next(); // gh-8105</span></span>
<span class="line"><span>		put(WebAsyncManagerIntegrationFilter.class, order.next());</span></span>
<span class="line"><span>		put(SecurityContextHolderFilter.class, order.next());</span></span>
<span class="line"><span>		put(SecurityContextPersistenceFilter.class, order.next());</span></span>
<span class="line"><span>		put(HeaderWriterFilter.class, order.next());</span></span>
<span class="line"><span>		put(CorsFilter.class, order.next());</span></span>
<span class="line"><span>		put(CsrfFilter.class, order.next());</span></span>
<span class="line"><span>		put(LogoutFilter.class, order.next());</span></span>
<span class="line"><span>		this.filterToOrder.put(</span></span>
<span class="line"><span>				&quot;org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestRedirectFilter&quot;,</span></span>
<span class="line"><span>				order.next());</span></span>
<span class="line"><span>		this.filterToOrder.put(</span></span>
<span class="line"><span>				&quot;org.springframework.security.saml2.provider.service.web.Saml2WebSsoAuthenticationRequestFilter&quot;,</span></span>
<span class="line"><span>				order.next());</span></span>
<span class="line"><span>		put(GenerateOneTimeTokenFilter.class, order.next());</span></span>
<span class="line"><span>		put(X509AuthenticationFilter.class, order.next());</span></span>
<span class="line"><span>		put(AbstractPreAuthenticatedProcessingFilter.class, order.next());</span></span>
<span class="line"><span>		this.filterToOrder.put(&quot;org.springframework.security.cas.web.CasAuthenticationFilter&quot;, order.next());</span></span>
<span class="line"><span>		this.filterToOrder.put(&quot;org.springframework.security.oauth2.client.web.OAuth2LoginAuthenticationFilter&quot;,</span></span>
<span class="line"><span>				order.next());</span></span>
<span class="line"><span>		this.filterToOrder.put(</span></span>
<span class="line"><span>				&quot;org.springframework.security.saml2.provider.service.web.authentication.Saml2WebSsoAuthenticationFilter&quot;,</span></span>
<span class="line"><span>				order.next());</span></span>
<span class="line"><span>		put(UsernamePasswordAuthenticationFilter.class, order.next());</span></span>
<span class="line"><span>		order.next(); // gh-8105</span></span>
<span class="line"><span>		put(DefaultResourcesFilter.class, order.next());</span></span>
<span class="line"><span>		put(DefaultLoginPageGeneratingFilter.class, order.next());</span></span>
<span class="line"><span>		put(DefaultLogoutPageGeneratingFilter.class, order.next());</span></span>
<span class="line"><span>		put(DefaultOneTimeTokenSubmitPageGeneratingFilter.class, order.next());</span></span>
<span class="line"><span>		put(ConcurrentSessionFilter.class, order.next());</span></span>
<span class="line"><span>		put(DigestAuthenticationFilter.class, order.next());</span></span>
<span class="line"><span>		this.filterToOrder.put(</span></span>
<span class="line"><span>				&quot;org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter&quot;,</span></span>
<span class="line"><span>				order.next());</span></span>
<span class="line"><span>		put(BasicAuthenticationFilter.class, order.next());</span></span>
<span class="line"><span>		put(AuthenticationFilter.class, order.next());</span></span>
<span class="line"><span>		put(RequestCacheAwareFilter.class, order.next());</span></span>
<span class="line"><span>		put(SecurityContextHolderAwareRequestFilter.class, order.next());</span></span>
<span class="line"><span>		put(JaasApiIntegrationFilter.class, order.next());</span></span>
<span class="line"><span>		put(RememberMeAuthenticationFilter.class, order.next());</span></span>
<span class="line"><span>		put(AnonymousAuthenticationFilter.class, order.next());</span></span>
<span class="line"><span>		this.filterToOrder.put(&quot;org.springframework.security.oauth2.client.web.OAuth2AuthorizationCodeGrantFilter&quot;,</span></span>
<span class="line"><span>				order.next());</span></span>
<span class="line"><span>		put(SessionManagementFilter.class, order.next());</span></span>
<span class="line"><span>		put(ExceptionTranslationFilter.class, order.next());</span></span>
<span class="line"><span>		put(FilterSecurityInterceptor.class, order.next());</span></span>
<span class="line"><span>		put(AuthorizationFilter.class, order.next());</span></span>
<span class="line"><span>		put(SwitchUserFilter.class, order.next());</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>下面是一个示例Demo中Filter的顺序图</p><img src="`+c+'" width="500" alt="filter-chains">',52)]))}const m=a(o,[["render",u]]);export{C as __pageData,m as default};
