import{_ as s}from"./chunks/login-process.LvMmYs3u.js";import{_ as a,c as e,a0 as t,o as p}from"./chunks/framework.P9qPzDnn.js";const x=JSON.parse('{"title":"异常处理","description":"","frontmatter":{},"headers":[],"relativePath":"spring-security/exception.md","filePath":"spring-security/exception.md"}'),i={name:"spring-security/exception.md"};function l(c,n,o,r,u,h){return p(),e("div",null,n[0]||(n[0]=[t('<h1 id="异常处理" tabindex="-1">异常处理 <a class="header-anchor" href="#异常处理" aria-label="Permalink to &quot;异常处理&quot;">​</a></h1><p>这里回看一下第一章的登录流程分析。</p><p><img src="'+s+`" alt="登录流程"></p><p>之前有提到过如果用户的请求未经过认证，会在AuthorizationFilter中被拦截，然后抛出AccessDeniedException异常，然后异常会被ExceptionTranslationFilter捕获，重定向到登录页面。本章节就来详细分析这个流程。</p><p>通过查看FilterOrderRegistration的过滤器链顺序，我们可以知道AuthorizationFilter的优先级排倒数第二，ExceptionTranslationFilter排倒数第四，所以可以知道如果前面的过滤器没有异常，必然最后会经过这两个过滤器。</p><h2 id="exceptionhandlingconfigurer" tabindex="-1">ExceptionHandlingConfigurer <a class="header-anchor" href="#exceptionhandlingconfigurer" aria-label="Permalink to &quot;ExceptionHandlingConfigurer&quot;">​</a></h2><div class="language-HttpSecurityConfiguration vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">HttpSecurityConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>class HttpSecurityConfiguration {</span></span>
<span class="line"><span>  @Bean(HTTPSECURITY_BEAN_NAME)</span></span>
<span class="line"><span>  @Scope(&quot;prototype&quot;)</span></span>
<span class="line"><span>  HttpSecurity httpSecurity() throws Exception {</span></span>
<span class="line"><span>    HttpSecurity http = new HttpSecurity(this.objectPostProcessor, authenticationBuilder, createSharedObjects());</span></span>
<span class="line"><span>    http.exceptionHandling(withDefaults())</span></span>
<span class="line"><span>    return http;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>先看httpSecurity Bean的声明函数，可以看到调用了exceptionHandling，而这个方法引入了ExceptionHandlingConfigurer。</p><div class="language-HttpSecurity vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">HttpSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class HttpSecurity extends AbstractConfiguredSecurityBuilder&lt;DefaultSecurityFilterChain, HttpSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;DefaultSecurityFilterChain&gt;, HttpSecurityBuilder&lt;HttpSecurity&gt; {</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>  public HttpSecurity exceptionHandling(</span></span>
<span class="line"><span>			Customizer&lt;ExceptionHandlingConfigurer&lt;HttpSecurity&gt;&gt; exceptionHandlingCustomizer) throws Exception {</span></span>
<span class="line"><span>		exceptionHandlingCustomizer.customize(getOrApply(new ExceptionHandlingConfigurer&lt;&gt;()));</span></span>
<span class="line"><span>		return HttpSecurity.this;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>按照惯例，我们看一下ExceptionHandlingConfigurer的方法，由于该类没有实现init方法，直接看configure方法</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class ExceptionHandlingConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;ExceptionHandlingConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	public void configure(H http) {</span></span>
<span class="line"><span>		AuthenticationEntryPoint entryPoint = getAuthenticationEntryPoint(http);</span></span>
<span class="line"><span>		ExceptionTranslationFilter exceptionTranslationFilter = new ExceptionTranslationFilter(entryPoint,</span></span>
<span class="line"><span>				getRequestCache(http));</span></span>
<span class="line"><span>		AccessDeniedHandler deniedHandler = getAccessDeniedHandler(http);</span></span>
<span class="line"><span>		exceptionTranslationFilter.setAccessDeniedHandler(deniedHandler);</span></span>
<span class="line"><span>		exceptionTranslationFilter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());</span></span>
<span class="line"><span>		exceptionTranslationFilter = postProcess(exceptionTranslationFilter);</span></span>
<span class="line"><span>		http.addFilter(exceptionTranslationFilter);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  AuthenticationEntryPoint getAuthenticationEntryPoint(H http) {</span></span>
<span class="line"><span>    AuthenticationEntryPoint entryPoint = this.authenticationEntryPoint;</span></span>
<span class="line"><span>    if (entryPoint == null) {</span></span>
<span class="line"><span>      entryPoint = createDefaultEntryPoint(http);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return entryPoint;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到往过滤器中加入了一个异常过滤器：ExceptionTranslationFilter</p><h2 id="exceptiontranslationfilter" tabindex="-1">ExceptionTranslationFilter <a class="header-anchor" href="#exceptiontranslationfilter" aria-label="Permalink to &quot;ExceptionTranslationFilter&quot;">​</a></h2><p>Spring Security中的异常处理主要是在ExceptionTranslationFilter中完成的，该过滤器主要处理AuthenticationException和AccessDeniedException异常，其他的异常则继续抛出。我们先来看看代码</p><div class="language-ExceptionTranslationFilter vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ExceptionTranslationFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExceptionTranslationFilter extends GenericFilterBean implements MessageSourceAware {</span></span>
<span class="line"><span>  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>      throws IOException, ServletException {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    catch (IOException ex) {</span></span>
<span class="line"><span>      throw ex;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    catch (Exception ex) {</span></span>
<span class="line"><span>      // Try to extract a SpringSecurityException from the stacktrace</span></span>
<span class="line"><span>      Throwable[] causeChain = this.throwableAnalyzer.determineCauseChain(ex);</span></span>
<span class="line"><span>      // 看是不是AuthenticationException</span></span>
<span class="line"><span>      RuntimeException securityException = (AuthenticationException) this.throwableAnalyzer</span></span>
<span class="line"><span>        .getFirstThrowableOfType(AuthenticationException.class, causeChain);</span></span>
<span class="line"><span>      // 如果不是AuthenticationException，看是不是AccessDeniedException</span></span>
<span class="line"><span>      if (securityException == null) {</span></span>
<span class="line"><span>        securityException = (AccessDeniedException) this.throwableAnalyzer</span></span>
<span class="line"><span>          .getFirstThrowableOfType(AccessDeniedException.class, causeChain);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 如果都不是，重新抛出去</span></span>
<span class="line"><span>      if (securityException == null) {</span></span>
<span class="line"><span>        rethrow(ex);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 如果已经响应客户端，则抛出ServletException异常</span></span>
<span class="line"><span>      if (response.isCommitted()) {</span></span>
<span class="line"><span>        throw new ServletException(&quot;Unable to handle the Spring Security Exception &quot;</span></span>
<span class="line"><span>            + &quot;because the response is already committed.&quot;, ex);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 处理AuthenticationException或者AccessDeniedException</span></span>
<span class="line"><span>      handleSpringSecurityException(request, response, chain, securityException);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void handleSpringSecurityException(HttpServletRequest request, HttpServletResponse response,</span></span>
<span class="line"><span>      FilterChain chain, RuntimeException exception) throws IOException, ServletException {</span></span>
<span class="line"><span>    if (exception instanceof AuthenticationException) {</span></span>
<span class="line"><span>      handleAuthenticationException(request, response, chain, (AuthenticationException) exception);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else if (exception instanceof AccessDeniedException) {</span></span>
<span class="line"><span>      handleAccessDeniedException(request, response, chain, (AccessDeniedException) exception);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="authenticationexception" tabindex="-1">AuthenticationException <a class="header-anchor" href="#authenticationexception" aria-label="Permalink to &quot;AuthenticationException&quot;">​</a></h3><p>我们先看处理AuthenticationException(认证异常)的流程。</p><div class="language-ExceptionTranslationFilter vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ExceptionTranslationFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExceptionTranslationFilter extends GenericFilterBean implements MessageSourceAware {</span></span>
<span class="line"><span>  private void handleAuthenticationException(HttpServletRequest request, HttpServletResponse response,</span></span>
<span class="line"><span>        FilterChain chain, AuthenticationException exception) throws ServletException, IOException {</span></span>
<span class="line"><span>      this.logger.trace(&quot;Sending to authentication entry point since authentication failed&quot;, exception);</span></span>
<span class="line"><span>      sendStartAuthentication(request, response, chain, exception);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected void sendStartAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,</span></span>
<span class="line"><span>      AuthenticationException reason) throws ServletException, IOException {</span></span>
<span class="line"><span>    // SEC-112: Clear the SecurityContextHolder&#39;s Authentication, as the</span></span>
<span class="line"><span>    // existing Authentication is no longer considered valid</span></span>
<span class="line"><span>    SecurityContext context = this.securityContextHolderStrategy.createEmptyContext();</span></span>
<span class="line"><span>    this.securityContextHolderStrategy.setContext(context);</span></span>
<span class="line"><span>    this.requestCache.saveRequest(request, response);</span></span>
<span class="line"><span>    this.authenticationEntryPoint.commence(request, response, reason);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>主要做了三件事，清除请求中的认证主体，保存当前请求，调用authenticationEntryPoint.commence的失败认证方法。我们看看authenticationEntryPoint是在哪里初始化的。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class ExceptionHandlingConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;ExceptionHandlingConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private AuthenticationEntryPoint authenticationEntryPoint;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>  public void configure(H http) {</span></span>
<span class="line"><span>    AuthenticationEntryPoint entryPoint = getAuthenticationEntryPoint(http);</span></span>
<span class="line"><span>    ExceptionTranslationFilter exceptionTranslationFilter = new ExceptionTranslationFilter(entryPoint,</span></span>
<span class="line"><span>      getRequestCache(http));</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public ExceptionHandlingConfigurer&lt;H&gt; authenticationEntryPoint(AuthenticationEntryPoint authenticationEntryPoint) {</span></span>
<span class="line"><span>    this.authenticationEntryPoint = authenticationEntryPoint;</span></span>
<span class="line"><span>    return this;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  AuthenticationEntryPoint getAuthenticationEntryPoint(H http) {</span></span>
<span class="line"><span>    AuthenticationEntryPoint entryPoint = this.authenticationEntryPoint;</span></span>
<span class="line"><span>    if (entryPoint == null) {</span></span>
<span class="line"><span>      entryPoint = createDefaultEntryPoint(http);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return entryPoint;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private LinkedHashMap&lt;RequestMatcher, AuthenticationEntryPoint&gt; defaultEntryPointMappings = new LinkedHashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public ExceptionHandlingConfigurer&lt;H&gt; defaultAuthenticationEntryPointFor(AuthenticationEntryPoint entryPoint,</span></span>
<span class="line"><span>      RequestMatcher preferredMatcher) {</span></span>
<span class="line"><span>    this.defaultEntryPointMappings.put(preferredMatcher, entryPoint);</span></span>
<span class="line"><span>    return this;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private AuthenticationEntryPoint createDefaultEntryPoint(H http) {</span></span>
<span class="line"><span>    if (this.defaultEntryPointMappings.isEmpty()) {</span></span>
<span class="line"><span>      return new Http403ForbiddenEntryPoint();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (this.defaultEntryPointMappings.size() == 1) {</span></span>
<span class="line"><span>      return this.defaultEntryPointMappings.values().iterator().next();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    DelegatingAuthenticationEntryPoint entryPoint = new DelegatingAuthenticationEntryPoint(</span></span>
<span class="line"><span>        this.defaultEntryPointMappings);</span></span>
<span class="line"><span>    entryPoint.setDefaultEntryPoint(this.defaultEntryPointMappings.values().iterator().next());</span></span>
<span class="line"><span>    return entryPoint;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到有两种方法可以定义。</p><ul><li>如果this.authenticationEntryPoint存在，那么返回this.authenticationEntryPoint，通过authenticationEntryPoint配置</li><li>如果this.authenticationEntryPoint不存在，则基于defaultEntryPointMappings构建一个复合DelegatingAuthenticationEntryPoint，这个可以耦合很多个authenticationEntryPoint，从中筛选。</li></ul><p>让我们查看DelegatingAuthenticationEntryPoint的处理方法，代码如下。</p><div class="language-DelegatingAuthenticationEntryPoint vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">DelegatingAuthenticationEntryPoint</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DelegatingAuthenticationEntryPoint implements AuthenticationEntryPoint, InitializingBean {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void commence(HttpServletRequest request, HttpServletResponse response,</span></span>
<span class="line"><span>      AuthenticationException authException) throws IOException, ServletException {</span></span>
<span class="line"><span>    for (RequestMatcher requestMatcher : this.entryPoints.keySet()) {</span></span>
<span class="line"><span>      logger.debug(LogMessage.format(&quot;Trying to match using %s&quot;, requestMatcher));</span></span>
<span class="line"><span>      if (requestMatcher.matches(request)) {</span></span>
<span class="line"><span>        AuthenticationEntryPoint entryPoint = this.entryPoints.get(requestMatcher);</span></span>
<span class="line"><span>        logger.debug(LogMessage.format(&quot;Match found! Executing %s&quot;, entryPoint));</span></span>
<span class="line"><span>        entryPoint.commence(request, response, authException);</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    logger.debug(LogMessage.format(&quot;No match found. Using default entry point %s&quot;, this.defaultEntryPoint));</span></span>
<span class="line"><span>    // No EntryPoint matched, use defaultEntryPoint</span></span>
<span class="line"><span>    this.defaultEntryPoint.commence(request, response, authException);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到会遍历entryPoints集合中entryPoint的的matches函数，如果复合，就调用entryPoint的commence方法。为了扩展性，还是推荐使用第二种方法。</p><ul><li>表单登录在AbstractAuthenticationFilterConfigurer#registerAuthenticationEntryPoint中会向defaultEntryPointMappings加入一个LoginUrlAuthenticationEntryPoint，自动跳转到登录页面</li><li>HttpBasic在HttpBasicConfigurer#registerDefaultEntryPoint中向defaultEntryPointMappings加入一个BasicAuthenticationEntryPoint，返回认证请求</li></ul><p>由于现在基本上都是前后端分离相关，我们写一个返回认证失败的请求。直接拿之前的代码做修改。</p><p>新增一个CustomerHandler文件，用来处理异常认证请求。代码如下</p><div class="language-CustomerHandler vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">CustomerHandler</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class CustomerHandler {</span></span>
<span class="line"><span>  public static void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {</span></span>
<span class="line"><span>    ObjectMapper objectMapper = BeanUtil.getBean(ObjectMapper.class);</span></span>
<span class="line"><span>    CustomResponseImpl failureResponse = new CustomResponseImpl();</span></span>
<span class="line"><span>    failureResponse.setCode(&quot;401&quot;);</span></span>
<span class="line"><span>    failureResponse.setMsg(&quot;没有权限访问该路径，请登录后重试&quot;);</span></span>
<span class="line"><span>    response.setHeader(HttpHeaders.CONTENT_TYPE, &quot;application/json;charset=UTF-8&quot;);</span></span>
<span class="line"><span>    response.getWriter().write(objectMapper.writeValueAsString(failureResponse));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>SecurityConfig文件代码如下:</p><div class="language-DefaultSecurityConfig vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig {</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests(requests -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(Customizer.withDefaults());</span></span>
<span class="line"><span>    http.exceptionHandling(exceptionHandling -&gt; exceptionHandling.authenticationEntryPoint(CustomerHandler::commence));</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>启动项目，打开浏览器直接访问/user接口，窗口直接返回认证失败的错误信息。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>{&quot;msg&quot;:&quot;没有权限访问该路径，请登录后重试&quot;,&quot;status&quot;:401}</span></span></code></pre></div><p>具体代码，点击<a href="https://github.com/shengduiliang/spring-security-demo/tree/main/spring-security-exception-handler" target="_blank" rel="noreferrer">此处</a></p><h3 id="accessdeniedexception" tabindex="-1">AccessDeniedException <a class="header-anchor" href="#accessdeniedexception" aria-label="Permalink to &quot;AccessDeniedException&quot;">​</a></h3><p>我们再看一下AccessDeniedException的处理，</p><div class="language-ExceptionTranslationFilter vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ExceptionTranslationFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ExceptionTranslationFilter extends GenericFilterBean implements MessageSourceAware {</span></span>
<span class="line"><span>  private void handleAccessDeniedException(HttpServletRequest request, HttpServletResponse response,</span></span>
<span class="line"><span>      FilterChain chain, AccessDeniedException exception) throws ServletException, IOException {</span></span>
<span class="line"><span>    Authentication authentication = this.securityContextHolderStrategy.getContext().getAuthentication();</span></span>
<span class="line"><span>    boolean isAnonymous = this.authenticationTrustResolver.isAnonymous(authentication);</span></span>
<span class="line"><span>    // 如果是匿名用户，或者是通过Remember登录的，则调用AuthenticationException处理</span></span>
<span class="line"><span>    if (isAnonymous || this.authenticationTrustResolver.isRememberMe(authentication)) {</span></span>
<span class="line"><span>      if (logger.isTraceEnabled()) {</span></span>
<span class="line"><span>        logger.trace(LogMessage.format(&quot;Sending %s to authentication entry point since access is denied&quot;,</span></span>
<span class="line"><span>            authentication), exception);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      sendStartAuthentication(request, response, chain,</span></span>
<span class="line"><span>          new InsufficientAuthenticationException(</span></span>
<span class="line"><span>              this.messages.getMessage(&quot;ExceptionTranslationFilter.insufficientAuthentication&quot;,</span></span>
<span class="line"><span>                  &quot;Full authentication is required to access this resource&quot;)));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      if (logger.isTraceEnabled()) {</span></span>
<span class="line"><span>        logger.trace(</span></span>
<span class="line"><span>            LogMessage.format(&quot;Sending %s to access denied handler since access is denied&quot;, authentication),</span></span>
<span class="line"><span>            exception);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 否则调用accessDeniedHandler.handle</span></span>
<span class="line"><span>      this.accessDeniedHandler.handle(request, response, exception);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>由于accessDeniedHandler的处理跟authenticationEntryPoint类似，可以直接参照源码解读。</p><h2 id="authorizationfilter" tabindex="-1">AuthorizationFilter <a class="header-anchor" href="#authorizationfilter" aria-label="Permalink to &quot;AuthorizationFilter&quot;">​</a></h2><p>那么ExceptionTranslationFilter捕获的异常是在哪里获取的呢，是在ExceptionTranslationFilter抛出的。查看AuthorizationFilter的doFilter</p><div class="language-AuthorizationFilter vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">AuthorizationFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class AuthorizationFilter extends GenericFilterBean {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)</span></span>
<span class="line"><span>      throws ServletException, IOException {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    HttpServletRequest request = (HttpServletRequest) servletRequest;</span></span>
<span class="line"><span>    HttpServletResponse response = (HttpServletResponse) servletResponse;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (this.observeOncePerRequest &amp;&amp; isApplied(request)) {</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (skipDispatch(request)) {</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String alreadyFilteredAttributeName = getAlreadyFilteredAttributeName();</span></span>
<span class="line"><span>    request.setAttribute(alreadyFilteredAttributeName, Boolean.TRUE);</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      AuthorizationResult result = this.authorizationManager.authorize(this::getAuthentication, request);</span></span>
<span class="line"><span>      this.eventPublisher.publishAuthorizationEvent(this::getAuthentication, request, result);</span></span>
<span class="line"><span>      // 如果权限异常，那么抛出AuthorizationDeniedException</span></span>
<span class="line"><span>      if (result != null &amp;&amp; !result.isGranted()) {</span></span>
<span class="line"><span>        throw new AuthorizationDeniedException(&quot;Access Denied&quot;, result);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    finally {</span></span>
<span class="line"><span>      request.removeAttribute(alreadyFilteredAttributeName);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>AuthorizationFilter是在AuthorizeHttpRequestsConfigurer中加入的，但是AuthorizeHttpRequestsConfigurer是在什么时候加入的还需梳理。</p>`,42)]))}const y=a(i,[["render",l]]);export{x as __pageData,y as default};
