import{_ as s,c as a,a0 as e,o as p}from"./chunks/framework.P9qPzDnn.js";const i="/assets/FormLoginConfigurerExtends.Dlwc-2-Y.png",l="/assets/UsernamePasswordAuthenticationFilter.1FTCGBpV.png",t="/assets/AuthenticationManager.C__AW3xx.png",r="/assets/Authentication.B6jtmhgZ.png",c="/assets/DaoAuthenticationProvider.Elwhzr_C.png",u="/assets/abstractauthenticationprocessingfilter.BgCovxf1.png",o="/assets/AuthenticationProviders.B9K8N4WQ.png",b="/assets/providermanagers-parent.EjbwfLnF.png",m="/assets/UserDetailsService.BOFkPIbG.png",h="/assets/GlobalAuthenticationConfigurerAdapter.Cbffe-nT.png",d="/assets/AuthenticationManagerBuilder.D0tjyD5g.png",x=JSON.parse('{"title":"认证流程分析","description":"","frontmatter":{},"headers":[],"relativePath":"spring-security/authentication.md","filePath":"spring-security/authentication.md"}'),g={name:"spring-security/authentication.md"};function A(v,n,f,C,P,S){return p(),a("div",null,n[0]||(n[0]=[e(`<h1 id="认证流程分析" tabindex="-1">认证流程分析 <a class="header-anchor" href="#认证流程分析" aria-label="Permalink to &quot;认证流程分析&quot;">​</a></h1><p>本文将基于分析表单登录认证流程对Spring Security的认证流程梳理一遍。跟之前一样，我们还是基于Spring Security的配置文件开始讲起。</p><div class="language-DefaultSecurityConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig  {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(withDefaults());</span></span>
<span class="line"><span>    http.httpBasic(withDefaults());</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h2 id="formloginconfigurer" tabindex="-1">FormLoginConfigurer <a class="header-anchor" href="#formloginconfigurer" aria-label="Permalink to &quot;FormLoginConfigurer&quot;">​</a></h2><p><img src="`+i+`" alt="FormLoginConfigurer继承图"></p><p>前面有提到过，http.httpBasic其实是往HttpSecurit加入了FormLoginConfigurer这个configurer，而在HttpSecurity的build过程中，密切相关的是configurer#init跟configurer#configure方法，当然还有构造方法，所以我们先分析这三个接口。</p><p>首先看FormLoginConfigurer的初始化方法</p><div class="language-FormLoginConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">FormLoginConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class FormLoginConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt; extends</span></span>
<span class="line"><span>		AbstractAuthenticationFilterConfigurer&lt;H, FormLoginConfigurer&lt;H&gt;, UsernamePasswordAuthenticationFilter&gt; {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  public FormLoginConfigurer() {</span></span>
<span class="line"><span>    // 可以看到，这里声明了一个UsernamePasswordAuthenticationFilter</span></span>
<span class="line"><span>    super(new UsernamePasswordAuthenticationFilter(), null);</span></span>
<span class="line"><span>    usernameParameter(&quot;username&quot;);</span></span>
<span class="line"><span>    passwordParameter(&quot;password&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>查看父类AbstractAuthenticationFilterConfigurer的构造函数，代码如下</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractAuthenticationFilterConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;, T extends AbstractAuthenticationFilterConfigurer&lt;B, T, F&gt;, F extends AbstractAuthenticationProcessingFilter&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;T, B&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private F authFilter;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 指定登录页面</span></span>
<span class="line"><span>  protected AbstractAuthenticationFilterConfigurer() {</span></span>
<span class="line"><span>    setLoginPage(&quot;/login&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected AbstractAuthenticationFilterConfigurer(F authenticationFilter, String defaultLoginProcessingUrl) {</span></span>
<span class="line"><span>    this();</span></span>
<span class="line"><span>    // 将之前的UsernamePasswordAuthenticationFilter赋予this.authFilter</span></span>
<span class="line"><span>    this.authFilter = authenticationFilter;</span></span>
<span class="line"><span>    // 指定默认的登录处理url</span></span>
<span class="line"><span>    if (defaultLoginProcessingUrl != null) {</span></span>
<span class="line"><span>      loginProcessingUrl(defaultLoginProcessingUrl);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public T loginProcessingUrl(String loginProcessingUrl) {</span></span>
<span class="line"><span>    this.loginProcessingUrl = loginProcessingUrl;</span></span>
<span class="line"><span>    // 设置登录请求URL的requestMatcher</span></span>
<span class="line"><span>    this.authFilter.setRequiresAuthenticationRequestMatcher(createLoginProcessingUrlMatcher(loginProcessingUrl));</span></span>
<span class="line"><span>    return getSelf();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>注意UsernamePasswordAuthenticationFilter是重点，这个就是在过滤链中负责用户登录的过滤器。</p><p>接下来我们看AbstractAuthenticationFilterConfigurer的init函数，看一下做了什么事情。</p><div class="language-AbstractAuthenticationFilterConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractAuthenticationFilterConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractAuthenticationFilterConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;, T extends AbstractAuthenticationFilterConfigurer&lt;B, T, F&gt;, F extends AbstractAuthenticationProcessingFilter&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;T, B&gt; {</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void init(B http) throws Exception {</span></span>
<span class="line"><span>    updateAuthenticationDefaults();</span></span>
<span class="line"><span>    updateAccessDefaults(http);</span></span>
<span class="line"><span>    registerDefaultAuthenticationEntryPoint(http);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected final void updateAuthenticationDefaults() {</span></span>
<span class="line"><span>    // 如果loginProcessingUrl为空，那么就将loginPage设置为loginProcessingUrl</span></span>
<span class="line"><span>		if (this.loginProcessingUrl == null) {</span></span>
<span class="line"><span>			loginProcessingUrl(this.loginPage);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>    // 如果没有failureHandler，就把failureUrl设置为loginPage + &quot;?error&quot;</span></span>
<span class="line"><span>		if (this.failureHandler == null) {</span></span>
<span class="line"><span>			failureUrl(this.loginPage + &quot;?error&quot;);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>		LogoutConfigurer&lt;B&gt; logoutConfigurer = getBuilder().getConfigurer(LogoutConfigurer.class);</span></span>
<span class="line"><span>    // 查看是否有LogoutConfigurer，如果不为空，且不是自定义的登出，就把logoutSuccessUrl设置为this.loginPage + &quot;?logout&quot;</span></span>
<span class="line"><span>    if (logoutConfigurer != null &amp;&amp; !logoutConfigurer.isCustomLogoutSuccess()) {</span></span>
<span class="line"><span>			logoutConfigurer.logoutSuccessUrl(this.loginPage + &quot;?logout&quot;);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected final void updateAccessDefaults(B http) {</span></span>
<span class="line"><span>    // 如果this.permitAll为true，会对this.loginPage, this.loginProcessingUrl, this.failureUrl默认放行</span></span>
<span class="line"><span>    if (this.permitAll) {</span></span>
<span class="line"><span>      PermitAllSupport.permitAll(http, this.loginPage, this.loginProcessingUrl, this.failureUrl);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 后面再讲</span></span>
<span class="line"><span>  protected final void registerDefaultAuthenticationEntryPoint(B http) {</span></span>
<span class="line"><span>    registerAuthenticationEntryPoint(http, this.authenticationEntryPoint);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br></div></div><p>可以看到init方法主要是对loginPage，loginProcessUrl，failureUrl，logoutSuccessUrl等进行配置和放行。</p><p>我们再看看里面的configure方法，看看做了什么。</p><div class="language-AbstractAuthenticationFilterConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractAuthenticationFilterConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractAuthenticationFilterConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;, T extends AbstractAuthenticationFilterConfigurer&lt;B, T, F&gt;, F extends AbstractAuthenticationProcessingFilter&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;T, B&gt; {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void configure(B http) throws Exception {</span></span>
<span class="line"><span>    PortMapper portMapper = http.getSharedObject(PortMapper.class);</span></span>
<span class="line"><span>    if (portMapper != null) {</span></span>
<span class="line"><span>      this.authenticationEntryPoint.setPortMapper(portMapper);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    RequestCache requestCache = http.getSharedObject(RequestCache.class);</span></span>
<span class="line"><span>    if (requestCache != null) {</span></span>
<span class="line"><span>      this.defaultSuccessHandler.setRequestCache(requestCache);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 设置AuthenticationManager，这个在HttpSecurity的beforeConfigure初始化</span></span>
<span class="line"><span>    this.authFilter.setAuthenticationManager(http.getSharedObject(AuthenticationManager.class));</span></span>
<span class="line"><span>    this.authFilter.setAuthenticationSuccessHandler(this.successHandler);</span></span>
<span class="line"><span>    this.authFilter.setAuthenticationFailureHandler(this.failureHandler);</span></span>
<span class="line"><span>    if (this.authenticationDetailsSource != null) {</span></span>
<span class="line"><span>      this.authFilter.setAuthenticationDetailsSource(this.authenticationDetailsSource);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 获取Session认证策略，后面讲Session会话的时候会讲到</span></span>
<span class="line"><span>    SessionAuthenticationStrategy sessionAuthenticationStrategy = http</span></span>
<span class="line"><span>      .getSharedObject(SessionAuthenticationStrategy.class);</span></span>
<span class="line"><span>    if (sessionAuthenticationStrategy != null) {</span></span>
<span class="line"><span>      this.authFilter.setSessionAuthenticationStrategy(sessionAuthenticationStrategy);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果开启了rememberMeServices，配置rememberMeServices</span></span>
<span class="line"><span>    RememberMeServices rememberMeServices = http.getSharedObject(RememberMeServices.class);</span></span>
<span class="line"><span>    if (rememberMeServices != null) {</span></span>
<span class="line"><span>      this.authFilter.setRememberMeServices(rememberMeServices);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 设置securityContextRepository仓库，后面会提到</span></span>
<span class="line"><span>    SecurityContextConfigurer securityContextConfigurer = http.getConfigurer(SecurityContextConfigurer.class);</span></span>
<span class="line"><span>    if (securityContextConfigurer != null &amp;&amp; securityContextConfigurer.isRequireExplicitSave()) {</span></span>
<span class="line"><span>      SecurityContextRepository securityContextRepository = securityContextConfigurer</span></span>
<span class="line"><span>        .getSecurityContextRepository();</span></span>
<span class="line"><span>      this.authFilter.setSecurityContextRepository(securityContextRepository);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 配置securityContextHolderStrategy，后面Session章节会讲到</span></span>
<span class="line"><span>    this.authFilter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());</span></span>
<span class="line"><span>    F filter = postProcess(this.authFilter);</span></span>
<span class="line"><span>    http.addFilter(filter);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br></div></div><p>可以看到configure方法主要是对UsernamePasswordAuthenticationFilter做了一些设置和初始化。这里有必要说一下AbstractAuthenticationFilterConfigurer，因为后面如果我们要自定义自己的认证逻辑，很大可能会继承这个类来做。</p><h2 id="usernamepasswordauthenticationfilter" tabindex="-1">UsernamePasswordAuthenticationFilter <a class="header-anchor" href="#usernamepasswordauthenticationfilter" aria-label="Permalink to &quot;UsernamePasswordAuthenticationFilter&quot;">​</a></h2><p>上面我们知道了FormLoginConfigurer主要是往过SecurityFilterChain加入UsernamePasswordAuthenticationFilter这个过滤器。</p><p><img src="`+l+`" alt="UsernamePasswordAuthenticationFilter"></p><p>由于SecurityFilterChain在遍历每个Filter的时候，都会调用每个Filter的doFilter方法。所以我们直接看doFilter，这个方法是在UsernamePasswordAuthenticationFilter的父类AbstractAuthenticationProcessingFilter进行声明的。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractAuthenticationProcessingFilter extends GenericFilterBean</span></span>
<span class="line"><span>		implements ApplicationEventPublisherAware, MessageSourceAware {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>      throws IOException, ServletException {</span></span>
<span class="line"><span>    doFilter((HttpServletRequest) request, (HttpServletResponse) response, chain);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>      throws IOException, ServletException {</span></span>
<span class="line"><span>    // 如果不需要认证，直接跳过，执行下一个过滤器</span></span>
<span class="line"><span>    if (!requiresAuthentication(request, response)) {</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      // 获取一个经过认证的Authentication对象</span></span>
<span class="line"><span>      Authentication authenticationResult = attemptAuthentication(request, response);</span></span>
<span class="line"><span>      // 如果结果为空，直接返回</span></span>
<span class="line"><span>      if (authenticationResult == null) {</span></span>
<span class="line"><span>        // return immediately as subclass has indicated that it hasn&#39;t completed</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 调用sessionStrategy来处理session并发问题，session会话章节会讲到</span></span>
<span class="line"><span>      this.sessionStrategy.onAuthentication(authenticationResult, request, response);</span></span>
<span class="line"><span>      // Authentication success</span></span>
<span class="line"><span>      // 判断过滤器链还需不需要往下走，默认不需要</span></span>
<span class="line"><span>      if (this.continueChainBeforeSuccessfulAuthentication) {</span></span>
<span class="line"><span>        chain.doFilter(request, response);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      //成功认证，对应的逻辑会在Seesion章节讲解</span></span>
<span class="line"><span>      successfulAuthentication(request, response, chain, authenticationResult);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    catch (InternalAuthenticationServiceException failed) {</span></span>
<span class="line"><span>      this.logger.error(&quot;An internal error occurred while trying to authenticate the user.&quot;, failed);</span></span>
<span class="line"><span>      // 认证失败</span></span>
<span class="line"><span>      unsuccessfulAuthentication(request, response, failed);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    catch (AuthenticationException ex) {</span></span>
<span class="line"><span>      // Authentication failed</span></span>
<span class="line"><span>      unsuccessfulAuthentication(request, response, ex);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected boolean requiresAuthentication(HttpServletRequest request, HttpServletResponse response) {</span></span>
<span class="line"><span>    if (this.requiresAuthenticationRequestMatcher.matches(request)) {</span></span>
<span class="line"><span>      return true;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    return false;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,</span></span>
<span class="line"><span>      Authentication authResult) throws IOException, ServletException {</span></span>
<span class="line"><span>    SecurityContext context = this.securityContextHolderStrategy.createEmptyContext();</span></span>
<span class="line"><span>    context.setAuthentication(authResult);</span></span>
<span class="line"><span>    this.securityContextHolderStrategy.setContext(context);</span></span>
<span class="line"><span>    this.securityContextRepository.saveContext(context, request, response);</span></span>
<span class="line"><span>    if (this.logger.isDebugEnabled()) {</span></span>
<span class="line"><span>      this.logger.debug(LogMessage.format(&quot;Set SecurityContextHolder to %s&quot;, authResult));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.rememberMeServices.loginSuccess(request, response, authResult);</span></span>
<span class="line"><span>    if (this.eventPublisher != null) {</span></span>
<span class="line"><span>      this.eventPublisher.publishEvent(new InteractiveAuthenticationSuccessEvent(authResult, this.getClass()));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.successHandler.onAuthenticationSuccess(request, response, authResult);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br></div></div><p>可以看到，主要是调用子类的attemptAuthentication，即UsernamePasswordAuthenticationFilter，接下来看这个方法:</p><div class="language-UsernamePasswordAuthenticationFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">UsernamePasswordAuthenticationFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class UsernamePasswordAuthenticationFilter extends AbstractAuthenticationProcessingFilter {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)</span></span>
<span class="line"><span>      throws AuthenticationException {</span></span>
<span class="line"><span>    // 校验请求方法是否正确，只接受POST请求</span></span>
<span class="line"><span>    if (this.postOnly &amp;&amp; !request.getMethod().equals(&quot;POST&quot;)) {</span></span>
<span class="line"><span>      throw new AuthenticationServiceException(&quot;Authentication method not supported: &quot; + request.getMethod());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 获取parameter中的username</span></span>
<span class="line"><span>    String username = obtainUsername(request);</span></span>
<span class="line"><span>    username = (username != null) ? username.trim() : &quot;&quot;;</span></span>
<span class="line"><span>    // 获取parameter中的password</span></span>
<span class="line"><span>    String password = obtainPassword(request);</span></span>
<span class="line"><span>    password = (password != null) ? password : &quot;&quot;;</span></span>
<span class="line"><span>    // 构造一个未经过认证的UsernamePasswordAuthenticationToken</span></span>
<span class="line"><span>    UsernamePasswordAuthenticationToken authRequest = UsernamePasswordAuthenticationToken.unauthenticated(username,</span></span>
<span class="line"><span>        password);</span></span>
<span class="line"><span>    // Allow subclasses to set the &quot;details&quot; property</span></span>
<span class="line"><span>    setDetails(request, authRequest);</span></span>
<span class="line"><span>    // 认证请求，返回一个经过认证的UsernamePasswordAuthenticationToken</span></span>
<span class="line"><span>    return this.getAuthenticationManager().authenticate(authRequest);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>  @Nullable</span></span>
<span class="line"><span>  protected String obtainUsername(HttpServletRequest request) {</span></span>
<span class="line"><span>    return request.getParameter(this.usernameParameter);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected AuthenticationManager getAuthenticationManager() {</span></span>
<span class="line"><span>    return this.authenticationManager;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br></div></div><p>可以看到现在主要调用this.getAuthenticationManager().authenticate(authRequest)来进行验证。</p><p>接下来就讲解Spring Security关于认证相关的类和请求了。</p><h2 id="authenticationmanager" tabindex="-1">AuthenticationManager <a class="header-anchor" href="#authenticationmanager" aria-label="Permalink to &quot;AuthenticationManager&quot;">​</a></h2><p>AuthenticationManager是一个认证管理器，它定义了Spring Security要怎么处理认证操作。可以看到AuthenticationManager在认证成功之后会返回一个Authentication对象。这个对象会保存在SecurityContextHoler中（后面章节会讲到，现在可以理解为, 认证成功之后， 要找一个地方保存用户信息，用户再次请求，需要找到该认证信息, 确认用户身份）。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@FunctionalInterface</span></span>
<span class="line"><span>public interface AuthenticationManager {</span></span>
<span class="line"><span>	Authentication authenticate(Authentication authentication) throws AuthenticationException;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><img src="`+t+`" alt="AuthenticationManager"><p>默认的实现类为ProviderManager。这个类是在HttpSecurity的beforeConfigure方法初始化的。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class HttpSecurity extends AbstractConfiguredSecurityBuilder&lt;DefaultSecurityFilterChain, HttpSecurity&gt;</span></span>
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
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>在HttpSecurity继承FormLoginConfigurer，可以看里面的configure方法，是在AbstractAuthenticationFilterConfigurer中实现的。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>\`\`\` AbstractAuthenticationFilterConfigurer</span></span>
<span class="line"><span>public abstract class AbstractAuthenticationFilterConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;, T extends AbstractAuthenticationFilterConfigurer&lt;B, T, F&gt;, F extends AbstractAuthenticationProcessingFilter&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;T, B&gt; {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void configure(B http) throws Exception {</span></span>
<span class="line"><span>    this.authFilter.setAuthenticationManager(http.getSharedObject(AuthenticationManager.class));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h2 id="providermanager" tabindex="-1">ProviderManager <a class="header-anchor" href="#providermanager" aria-label="Permalink to &quot;ProviderManager&quot;">​</a></h2><p>可以看到UsernamePasswordAuthenticationFilter是调用AuthenticationManager的authenticate方法进行注册的。所以我们直接看ProviderManager#authenticate。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ProviderManager implements AuthenticationManager, MessageSourceAware, InitializingBean {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private List&lt;AuthenticationProvider&gt; providers = Collections.emptyList();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Authentication authenticate(Authentication authentication) throws AuthenticationException {</span></span>
<span class="line"><span>    Class&lt;? extends Authentication&gt; toTest = authentication.getClass();</span></span>
<span class="line"><span>    AuthenticationException lastException = null;</span></span>
<span class="line"><span>    AuthenticationException parentException = null;</span></span>
<span class="line"><span>    Authentication result = null;</span></span>
<span class="line"><span>    Authentication parentResult = null;</span></span>
<span class="line"><span>    int currentPosition = 0;</span></span>
<span class="line"><span>    int size = this.providers.size();</span></span>
<span class="line"><span>    // 遍历this.providers</span></span>
<span class="line"><span>    for (AuthenticationProvider provider : getProviders()) {</span></span>
<span class="line"><span>      // 如果不支持认证则跳过</span></span>
<span class="line"><span>      if (!provider.supports(toTest)) {</span></span>
<span class="line"><span>        continue;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        // 认证</span></span>
<span class="line"><span>        result = provider.authenticate(authentication);</span></span>
<span class="line"><span>        // 结果不为空，说明认证成功, 将认证信息保存到result</span></span>
<span class="line"><span>        if (result != null) {</span></span>
<span class="line"><span>          copyDetails(authentication, result);</span></span>
<span class="line"><span>          break;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      catch (AccountStatusException | InternalAuthenticationServiceException ex) {</span></span>
<span class="line"><span>        prepareException(ex, authentication);</span></span>
<span class="line"><span>        // SEC-546: Avoid polling additional providers if auth failure is due to</span></span>
<span class="line"><span>        // invalid account status</span></span>
<span class="line"><span>        throw ex;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      catch (AuthenticationException ex) {</span></span>
<span class="line"><span>        lastException = ex;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果认证结果为空，并且ProviderManager有父类，调用父类的authenticate方法</span></span>
<span class="line"><span>    if (result == null &amp;&amp; this.parent != null) {</span></span>
<span class="line"><span>      // Allow the parent to try.</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        parentResult = this.parent.authenticate(authentication);</span></span>
<span class="line"><span>        result = parentResult;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      catch (ProviderNotFoundException ex) {</span></span>
<span class="line"><span>        // ignore as we will throw below if no other exception occurred prior to</span></span>
<span class="line"><span>        // calling parent and the parent</span></span>
<span class="line"><span>        // may throw ProviderNotFound even though a provider in the child already</span></span>
<span class="line"><span>        // handled the request</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      catch (AuthenticationException ex) {</span></span>
<span class="line"><span>        parentException = ex;</span></span>
<span class="line"><span>        lastException = ex;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果认证结果不为空</span></span>
<span class="line"><span>    if (result != null) {</span></span>
<span class="line"><span>      // 擦除用户的凭证，可以认为是用户的密码</span></span>
<span class="line"><span>      if (this.eraseCredentialsAfterAuthentication &amp;&amp; (result instanceof CredentialsContainer)) {</span></span>
<span class="line"><span>        // Authentication is complete. Remove credentials and other secret data</span></span>
<span class="line"><span>        // from authentication</span></span>
<span class="line"><span>        ((CredentialsContainer) result).eraseCredentials();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // If the parent AuthenticationManager was attempted and successful then it</span></span>
<span class="line"><span>      // will publish an AuthenticationSuccessEvent</span></span>
<span class="line"><span>      // This check prevents a duplicate AuthenticationSuccessEvent if the parent</span></span>
<span class="line"><span>      // AuthenticationManager already published it</span></span>
<span class="line"><span>      // 发布认证成功时间</span></span>
<span class="line"><span>      if (parentResult == null) {</span></span>
<span class="line"><span>        this.eventPublisher.publishAuthenticationSuccess(result);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      return result;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 认证失败，返回异常</span></span>
<span class="line"><span>    // Parent was null, or didn&#39;t authenticate (or throw an exception).</span></span>
<span class="line"><span>    if (lastException == null) {</span></span>
<span class="line"><span>      lastException = new ProviderNotFoundException(this.messages.getMessage(&quot;ProviderManager.providerNotFound&quot;,</span></span>
<span class="line"><span>          new Object[] { toTest.getName() }, &quot;No AuthenticationProvider found for {0}&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (parentException == null) {</span></span>
<span class="line"><span>      prepareException(lastException, authentication);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    throw lastException;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br></div></div><p>可以看到是遍历providers，找到合适的provider进行校验。</p><h2 id="authentication" tabindex="-1">Authentication <a class="header-anchor" href="#authentication" aria-label="Permalink to &quot;Authentication&quot;">​</a></h2><p>可以看到查找provider是根据Authentication来查找的，解析一下这个类。Authentication类就是用来存放用户的认证信息。具体代码如下所示：</p><div class="language-Authentication vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">Authentication</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface Authentication extends Principal, Serializable {</span></span>
<span class="line"><span>  // 获取用户权限</span></span>
<span class="line"><span>  Collection&lt;? extends GrantedAuthority&gt; getAuthorities();</span></span>
<span class="line"><span>  // 获取用户凭证，一般是用户密码</span></span>
<span class="line"><span>  Object getCredentials();</span></span>
<span class="line"><span>  // 用户的详细信息</span></span>
<span class="line"><span>  Object getDetails();</span></span>
<span class="line"><span>  // 获取用户信息，可能是一个用户名，也可以是用户对象，可以认为是唯一标记用户的对象</span></span>
<span class="line"><span>  Object getPrincipal();</span></span>
<span class="line"><span>  // 是否已经认证</span></span>
<span class="line"><span>  boolean isAuthenticated();</span></span>
<span class="line"><span>  // 设置认证信息</span></span>
<span class="line"><span>  void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>可以看到只要获取到了Authentication对象，就可以获取到登录用户的详细信息。不同的认证方法对应不同的认证信息，比如用户/密码登录，OAuth2登录，RememberMe登录等，认证信息是不一样的，所以针对不同的认证方式会有不同的Authentication实现，既然Authentication都不一样了，具体认证的AuthenticationProvider也要不一样，这就很好理解了。</p><p><img src="`+r+`" alt="Authentication"></p><p>SpringSecurity默认提供了15个Authentication的实现。我们大概讲一下几个比较重要的：</p><ul><li>RememberMeAuthenticationToken: 如果使用RememberMe的方式，用户的信息保存在RememberMeAuthenticationToken中</li><li>UsernamePasswordAuthenticationToken: 如果使用FormLogin的方式，用户的信息保存在UsernamePasswordAuthenticationToken中</li></ul><p>这里每一种实现，都会有对应的AuthenticationProvider做验证，比如UsernamePasswordAuthenticationToken使用的是DaoAuthenticationProvider</p><h2 id="authenticationprovider" tabindex="-1">AuthenticationProvider <a class="header-anchor" href="#authenticationprovider" aria-label="Permalink to &quot;AuthenticationProvider&quot;">​</a></h2><p>可以看到AuthenticationProvider接口就只有两个方法。</p><div class="language-AuthenticationProvider vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthenticationProvider</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface AuthenticationProvider {</span></span>
<span class="line"><span>  // 认证方法</span></span>
<span class="line"><span>  Authentication authenticate(Authentication authentication) throws AuthenticationException;</span></span>
<span class="line"><span>  // 是否支持认证</span></span>
<span class="line"><span>  boolean supports(Class&lt;?&gt; authentication);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><img src="`+c+`" width="400" alt="DaoAuthenticationProvider"><p>接下来我们分析DaoAuthenticationProvider对于AuthenticationProvider的实现，具体实现是在AbstractUserDetailsAuthenticationProvider中</p><div class="language-AbstractUserDetailsAuthenticationProvider vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractUserDetailsAuthenticationProvider</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractUserDetailsAuthenticationProvider</span></span>
<span class="line"><span>		implements AuthenticationProvider, InitializingBean, MessageSourceAware {</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>	public boolean supports(Class&lt;?&gt; authentication) {</span></span>
<span class="line"><span>		return (UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication));</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Authentication authenticate(Authentication authentication) throws AuthenticationException {</span></span>
<span class="line"><span>    // 获取用户名字</span></span>
<span class="line"><span>    String username = determineUsername(authentication);</span></span>
<span class="line"><span>    boolean cacheWasUsed = true;</span></span>
<span class="line"><span>    // 从缓存里面拿user，默认不使用缓存</span></span>
<span class="line"><span>    UserDetails user = this.userCache.getUserFromCache(username);</span></span>
<span class="line"><span>    if (user == null) {</span></span>
<span class="line"><span>      cacheWasUsed = false;</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        // 调用DaoAuthenticationProvider的retrieveUser获取用户</span></span>
<span class="line"><span>        user = retrieveUser(username, (UsernamePasswordAuthenticationToken) authentication);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      catch (UsernameNotFoundException ex) {</span></span>
<span class="line"><span>        this.logger.debug(&quot;Failed to find user &#39;&quot; + username + &quot;&#39;&quot;);</span></span>
<span class="line"><span>        if (!this.hideUserNotFoundExceptions) {</span></span>
<span class="line"><span>          throw ex;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        throw new BadCredentialsException(this.messages</span></span>
<span class="line"><span>          .getMessage(&quot;AbstractUserDetailsAuthenticationProvider.badCredentials&quot;, &quot;Bad credentials&quot;));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      Assert.notNull(user, &quot;retrieveUser returned null - a violation of the interface contract&quot;);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      // 校验用户状态，比如账户是否被锁定，账户是否可用，账户是否过期等等</span></span>
<span class="line"><span>      this.preAuthenticationChecks.check(user);</span></span>
<span class="line"><span>      // 校验密码，DaoAuthenticationProvider实现</span></span>
<span class="line"><span>      additionalAuthenticationChecks(user, (UsernamePasswordAuthenticationToken) authentication);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    catch (AuthenticationException ex) {</span></span>
<span class="line"><span>      if (!cacheWasUsed) {</span></span>
<span class="line"><span>        throw ex;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // There was a problem, so try again after checking</span></span>
<span class="line"><span>      // we&#39;re using latest data (i.e. not from the cache)</span></span>
<span class="line"><span>      cacheWasUsed = false;</span></span>
<span class="line"><span>      user = retrieveUser(username, (UsernamePasswordAuthenticationToken) authentication);</span></span>
<span class="line"><span>      this.preAuthenticationChecks.check(user);</span></span>
<span class="line"><span>      additionalAuthenticationChecks(user, (UsernamePasswordAuthenticationToken) authentication);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.postAuthenticationChecks.check(user);</span></span>
<span class="line"><span>    if (!cacheWasUsed) {</span></span>
<span class="line"><span>      this.userCache.putUserInCache(user);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    Object principalToReturn = user;</span></span>
<span class="line"><span>    if (this.forcePrincipalAsString) {</span></span>
<span class="line"><span>      principalToReturn = user.getUsername();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 创建成功的Authentication</span></span>
<span class="line"><span>    return createSuccessAuthentication(principalToReturn, authentication, user);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected Authentication createSuccessAuthentication(Object principal, Authentication authentication,</span></span>
<span class="line"><span>			UserDetails user) {</span></span>
<span class="line"><span>		UsernamePasswordAuthenticationToken result = UsernamePasswordAuthenticationToken.authenticated(principal,</span></span>
<span class="line"><span>				authentication.getCredentials(), this.authoritiesMapper.mapAuthorities(user.getAuthorities()));</span></span>
<span class="line"><span>		result.setDetails(authentication.getDetails());</span></span>
<span class="line"><span>		this.logger.debug(&quot;Authenticated user&quot;);</span></span>
<span class="line"><span>		return result;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br></div></div><p>接下来我们查看DaoAuthenticationProvider对应方法的实现</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DaoAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected final UserDetails retrieveUser(String username, UsernamePasswordAuthenticationToken authentication)</span></span>
<span class="line"><span>      throws AuthenticationException {</span></span>
<span class="line"><span>    // 预防prepareTimingAttackProtection攻击</span></span>
<span class="line"><span>    prepareTimingAttackProtection();</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      // 获取UserDetail</span></span>
<span class="line"><span>      UserDetails loadedUser = this.getUserDetailsService().loadUserByUsername(username);</span></span>
<span class="line"><span>      if (loadedUser == null) {</span></span>
<span class="line"><span>        throw new InternalAuthenticationServiceException(</span></span>
<span class="line"><span>            &quot;UserDetailsService returned null, which is an interface contract violation&quot;);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      return loadedUser;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    catch (UsernameNotFoundException ex) {</span></span>
<span class="line"><span>      mitigateAgainstTimingAttack(authentication);</span></span>
<span class="line"><span>      throw ex;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    catch (InternalAuthenticationServiceException ex) {</span></span>
<span class="line"><span>      throw ex;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    catch (Exception ex) {</span></span>
<span class="line"><span>      throw new InternalAuthenticationServiceException(ex.getMessage(), ex);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  @SuppressWarnings(&quot;deprecation&quot;)</span></span>
<span class="line"><span>  protected void additionalAuthenticationChecks(UserDetails userDetails,</span></span>
<span class="line"><span>      UsernamePasswordAuthenticationToken authentication) throws AuthenticationException {</span></span>
<span class="line"><span>    // 获取用户凭证</span></span>
<span class="line"><span>    if (authentication.getCredentials() == null) {</span></span>
<span class="line"><span>      this.logger.debug(&quot;Failed to authenticate since no credentials provided&quot;);</span></span>
<span class="line"><span>      throw new BadCredentialsException(this.messages</span></span>
<span class="line"><span>        .getMessage(&quot;AbstractUserDetailsAuthenticationProvider.badCredentials&quot;, &quot;Bad credentials&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    String presentedPassword = authentication.getCredentials().toString();</span></span>
<span class="line"><span>    // 对比用户信息的凭证跟传上来的凭证是否一致，使用passwordEncoder对比的</span></span>
<span class="line"><span>    if (!this.passwordEncoder.matches(presentedPassword, userDetails.getPassword())) {</span></span>
<span class="line"><span>      this.logger.debug(&quot;Failed to authenticate since password does not match stored value&quot;);</span></span>
<span class="line"><span>      throw new BadCredentialsException(this.messages</span></span>
<span class="line"><span>        .getMessage(&quot;AbstractUserDetailsAuthenticationProvider.badCredentials&quot;, &quot;Bad credentials&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br></div></div><p>好了，表单登录的基本流程到这里结束了。</p><h2 id="认证流程总结" tabindex="-1">认证流程总结 <a class="header-anchor" href="#认证流程总结" aria-label="Permalink to &quot;认证流程总结&quot;">​</a></h2><p>接下来对Spring Security的认证过程做一个总结</p><p><img src="`+u+'" alt="abstractauthenticationprocessingfilter"></p><p>当请求经过Spring Security的SecurityFilterChain后，认证过滤器AbstractAuthenticationProcessingFilter会生成一个Authentication对象，将这个对象交给AuthenticationManager进行认证，认证成功则会走认证成功逻辑，失败则走失败认证逻辑</p><p><img src="'+o+'" alt="AuthenticationProviders"></p><p>默认的AuthenticationManager实现是ProviderManager， ProviderManager会遍历自己管理的AuthenticationProvider列表，对Authentication对象进行认证，认证成功返回成功的Authentication对象</p><p><img src="'+b+`" alt="providermanagers-parent.png"></p><p>如果ProviderManager认证失败，会将认证转交给自己的父类AuthenticationManager进行认证。</p><h2 id="补充" tabindex="-1">补充 <a class="header-anchor" href="#补充" aria-label="Permalink to &quot;补充&quot;">​</a></h2><p>在DaoAuthenticationProvider的retrieveUser方法中，用到了UserDetailsService这个类，在调用this.getUserDetailsService().loadUserByUsername(username)的时候;</p><p>很容易看出这是获取用户信息的，我们看一下UserDetailsService的定义：</p><div class="language-UserDetailsService vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">UserDetailsService</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface UserDetailsService {</span></span>
<span class="line"><span>	UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>查看UserDetailsService有哪些实现类，可以看到默认有6种，主要是下面两种：</p><ul><li>InMemoryUserDetailsManager: 把用户信息放在内存上进行查询</li><li>JdbcUserDetailsManager: 使用JDBC从数据库中获取用户信息</li></ul><p><img src="`+m+`" alt="UserDetailsService"></p><p>看了第一节配置用户信息那部分，很容易就知道DaoAuthenticationProvider的UserDetailsService默认就是自动配置的那个InMemoryUserDetailsManager。</p><div class="language-UserDetailsServiceAutoConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">UserDetailsServiceAutoConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Bean</span></span>
<span class="line"><span>public InMemoryUserDetailsManager inMemoryUserDetailsManager(SecurityProperties properties,</span></span>
<span class="line"><span>    ObjectProvider&lt;PasswordEncoder&gt; passwordEncoder) {</span></span>
<span class="line"><span>  SecurityProperties.User user = properties.getUser();</span></span>
<span class="line"><span>  List&lt;String&gt; roles = user.getRoles();</span></span>
<span class="line"><span>  return new InMemoryUserDetailsManager(User.withUsername(user.getName())</span></span>
<span class="line"><span>    .password(getOrDeducePassword(user, passwordEncoder.getIfAvailable()))</span></span>
<span class="line"><span>    .roles(StringUtils.toStringArray(roles))</span></span>
<span class="line"><span>    .build());</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>那么这个UserDetailsService是怎么设置到DaoAuthenticationProvider的呢？</p><p>还有一个问题, 我们知道ProviderManager是在HttpSecurity的beforeConfigure中初始化，DaoAuthenticationProvider又是什么时候注册到ProviderManager里面的呢？</p><p>之前分析过，Spring Boot继承Spring Security的时候会自动注入@EnableWebSecurity这个注解，我们重新看一下这个注解</p><div class="language-EnableWebSecurity vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">EnableWebSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Import({ WebSecurityConfiguration.class, SpringWebMvcImportSelector.class, OAuth2ImportSelector.class,</span></span>
<span class="line"><span>		HttpSecurityConfiguration.class, ObservationImportSelector.class })</span></span>
<span class="line"><span>@EnableGlobalAuthentication</span></span>
<span class="line"><span>public @interface EnableWebSecurity {</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>可以看到引入@EnableGlobalAuthentication这个注解，查看这个注解</p><div class="language-EnableGlobalAuthentication vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">EnableGlobalAuthentication</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Import(AuthenticationConfiguration.class)</span></span>
<span class="line"><span>public @interface EnableGlobalAuthentication {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>可以看到引入了AuthenticationConfiguration.class这个类，看名字就知道是认证配置的类，那我们就详细来了解一下这个类。</p><div class="language-AuthenticationConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthenticationConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>@Import(ObjectPostProcessorConfiguration.class)</span></span>
<span class="line"><span>public class AuthenticationConfiguration {</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public AuthenticationManagerBuilder authenticationManagerBuilder(ObjectPostProcessor&lt;Object&gt; objectPostProcessor,</span></span>
<span class="line"><span>      ApplicationContext context) {</span></span>
<span class="line"><span>    LazyPasswordEncoder defaultPasswordEncoder = new LazyPasswordEncoder(context);</span></span>
<span class="line"><span>    AuthenticationEventPublisher authenticationEventPublisher = getAuthenticationEventPublisher(context);</span></span>
<span class="line"><span>    DefaultPasswordEncoderAuthenticationManagerBuilder result = new DefaultPasswordEncoderAuthenticationManagerBuilder(</span></span>
<span class="line"><span>        objectPostProcessor, defaultPasswordEncoder);</span></span>
<span class="line"><span>    if (authenticationEventPublisher != null) {</span></span>
<span class="line"><span>      result.authenticationEventPublisher(authenticationEventPublisher);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return result;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public static GlobalAuthenticationConfigurerAdapter enableGlobalAuthenticationAutowiredConfigurer(</span></span>
<span class="line"><span>      ApplicationContext context) {</span></span>
<span class="line"><span>    return new EnableGlobalAuthenticationAutowiredConfigurer(context);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public static InitializeUserDetailsBeanManagerConfigurer initializeUserDetailsBeanManagerConfigurer(</span></span>
<span class="line"><span>      ApplicationContext context) {</span></span>
<span class="line"><span>    return new InitializeUserDetailsBeanManagerConfigurer(context);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public static InitializeAuthenticationProviderBeanManagerConfigurer initializeAuthenticationProviderBeanManagerConfigurer(</span></span>
<span class="line"><span>      ApplicationContext context) {</span></span>
<span class="line"><span>    return new InitializeAuthenticationProviderBeanManagerConfigurer(context);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Autowired(required = false)</span></span>
<span class="line"><span>  public void setGlobalAuthenticationConfigurers(List&lt;GlobalAuthenticationConfigurerAdapter&gt; configurers) {</span></span>
<span class="line"><span>    configurers.sort(AnnotationAwareOrderComparator.INSTANCE);</span></span>
<span class="line"><span>    this.globalAuthConfigurers = configurers;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br></div></div><p>可以看到声明了好几个Bean，下面说明一下这几个Bean。</p><ul><li>AuthenticationManagerBuilder: AuthenticationManager构建器，返回一个AuthenticationManagerBuilder，用来构造AuthenticationManager，默认实现是DefaultPasswordEncoderAuthenticationManagerBuilder。</li><li>GlobalAuthenticationConfigurerAdapter: 返回一个EnableGlobalAuthenticationAutowiredConfigurer，可以认为什么都不干，不重要</li><li>InitializeUserDetailsBeanManagerConfigurer：看这个Bean的名字就知道跟UserDetailsService有关了，后面分析</li><li>InitializeAuthenticationProviderBeanManagerConfigurer: 看这个Bean的名字就知道跟AuthenticationProvider有关了，后面分析</li></ul><p>InitializeUserDetailsBeanManagerConfigurer跟InitializeAuthenticationProviderBeanManagerConfigurer都继承了GlobalAuthenticationConfigurerAdapter这个类</p><img src="`+h+`" width="300" alt="GlobalAuthenticationConfigurerAdapter"><p>看继承图，是不是很熟悉，肯定有init跟configure方法。刚好注入这两个类的是setGlobalAuthenticationConfigurers，把它们赋给globalAuthConfigurers。</p><p>接下来我们回看声明HttpSecurity Bean的代码。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>class HttpSecurityConfiguration {</span></span>
<span class="line"><span>  @Bean(HTTPSECURITY_BEAN_NAME)</span></span>
<span class="line"><span>  @Scope(&quot;prototype&quot;)</span></span>
<span class="line"><span>  HttpSecurity httpSecurity() throws Exception {</span></span>
<span class="line"><span>    LazyPasswordEncoder passwordEncoder = new LazyPasswordEncoder(this.context);</span></span>
<span class="line"><span>    // 重新声明一个DefaultPasswordEncoderAuthenticationManagerBuilder</span></span>
<span class="line"><span>    AuthenticationManagerBuilder authenticationBuilder = new DefaultPasswordEncoderAuthenticationManagerBuilder(</span></span>
<span class="line"><span>        this.objectPostProcessor, passwordEncoder);</span></span>
<span class="line"><span>    // 把上面AuthenticationConfiguration声明的AuthenticationManagerBuilder设置为authenticationBuilder的parent</span></span>
<span class="line"><span>    authenticationBuilder.parentAuthenticationManager(authenticationManager());</span></span>
<span class="line"><span>    authenticationBuilder.authenticationEventPublisher(getAuthenticationEventPublisher());</span></span>
<span class="line"><span>    HttpSecurity http = new HttpSecurity(this.objectPostProcessor, authenticationBuilder, createSharedObjects());</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private AuthenticationManager authenticationManager() throws Exception {</span></span>
<span class="line"><span>    return this.authenticationConfiguration.getAuthenticationManager();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Autowired</span></span>
<span class="line"><span>  void setAuthenticationConfiguration(AuthenticationConfiguration authenticationConfiguration) {</span></span>
<span class="line"><span>    this.authenticationConfiguration = authenticationConfiguration;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><p>authenticationManager()实际调用的是上面声明的AuthenticationConfiguration的getAuthenticationManager方法，我们查看这个方法。</p><div class="language-AuthenticationConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthenticationConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class AuthenticationConfiguration {</span></span>
<span class="line"><span>  public AuthenticationManager getAuthenticationManager() throws Exception {</span></span>
<span class="line"><span>    // 如果已经初始化，直接返回</span></span>
<span class="line"><span>    if (this.authenticationManagerInitialized) {</span></span>
<span class="line"><span>      return this.authenticationManager;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 获取AuthenticationManagerBuilder，就是AuthenticationConfiguration声明的DefaultPasswordEncoderAuthenticationManagerBuilder</span></span>
<span class="line"><span>    AuthenticationManagerBuilder authBuilder = this.applicationContext.getBean(AuthenticationManagerBuilder.class);</span></span>
<span class="line"><span>    if (this.buildingAuthenticationManager.getAndSet(true)) {</span></span>
<span class="line"><span>      return new AuthenticationManagerDelegator(authBuilder);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 直接把this.globalAuthConfigurer apply到AuthenticationManagerBuilder</span></span>
<span class="line"><span>    // InitializeUserDetailsBeanManagerConfigurer跟InitializeAuthenticationProviderBeanManagerConfigurer</span></span>
<span class="line"><span>    for (GlobalAuthenticationConfigurerAdapter config : this.globalAuthConfigurers) {</span></span>
<span class="line"><span>      authBuilder.apply(config);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 执行AuthenticationManagerBuilder构建函数</span></span>
<span class="line"><span>    this.authenticationManager = authBuilder.build();</span></span>
<span class="line"><span>    if (this.authenticationManager == null) {</span></span>
<span class="line"><span>      this.authenticationManager = getAuthenticationManagerBean();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.authenticationManagerInitialized = true;</span></span>
<span class="line"><span>    return this.authenticationManager;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><p>查看AuthenticationManagerBuilder的继承图，是不是很熟悉。</p><img src="`+d+`" width="300" alt="AuthenticationManagerBuilder"><p>容易看出，authBuilder.build()会遍历globalAuthConfigurers，执行init方法跟configure方法。</p><h3 id="initializeuserdetailsbeanmanagerconfigurer" tabindex="-1">InitializeUserDetailsBeanManagerConfigurer <a class="header-anchor" href="#initializeuserdetailsbeanmanagerconfigurer" aria-label="Permalink to &quot;InitializeUserDetailsBeanManagerConfigurer&quot;">​</a></h3><p>先看InitializeUserDetailsBeanManagerConfigurer，具体代码如下</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Order(InitializeUserDetailsBeanManagerConfigurer.DEFAULT_ORDER)</span></span>
<span class="line"><span>class InitializeUserDetailsBeanManagerConfigurer extends GlobalAuthenticationConfigurerAdapter {</span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	public void init(AuthenticationManagerBuilder auth) throws Exception {</span></span>
<span class="line"><span>		auth.apply(new InitializeUserDetailsManagerConfigurer());</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  class InitializeUserDetailsManagerConfigurer extends GlobalAuthenticationConfigurerAdapter {</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public void configure(AuthenticationManagerBuilder auth) throws Exception {</span></span>
<span class="line"><span>      // 获取所有UserDetailsService的BeanName</span></span>
<span class="line"><span>      String[] beanNames = InitializeUserDetailsBeanManagerConfigurer.this.context</span></span>
<span class="line"><span>        .getBeanNamesForType(UserDetailsService.class);</span></span>
<span class="line"><span>      if (auth.isConfigured()) {</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      if (beanNames.length == 0) {</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      else if (beanNames.length &gt; 1) {</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 获取第1个UserDetailsService</span></span>
<span class="line"><span>      UserDetailsService userDetailsService = InitializeUserDetailsBeanManagerConfigurer.this.context</span></span>
<span class="line"><span>        .getBean(beanNames[0], UserDetailsService.class);</span></span>
<span class="line"><span>      PasswordEncoder passwordEncoder = getBeanOrNull(PasswordEncoder.class);</span></span>
<span class="line"><span>      UserDetailsPasswordService passwordManager = getBeanOrNull(UserDetailsPasswordService.class);</span></span>
<span class="line"><span>      CompromisedPasswordChecker passwordChecker = getBeanOrNull(CompromisedPasswordChecker.class);</span></span>
<span class="line"><span>      // 初始化一个DaoAuthenticationProvider</span></span>
<span class="line"><span>      DaoAuthenticationProvider provider;</span></span>
<span class="line"><span>      if (passwordEncoder != null) {</span></span>
<span class="line"><span>        provider = new DaoAuthenticationProvider(passwordEncoder);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      else {</span></span>
<span class="line"><span>        provider = new DaoAuthenticationProvider();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 设置DaoAuthenticationProvider的userDetailsService为上面拿到的userDetailsService</span></span>
<span class="line"><span>      provider.setUserDetailsService(userDetailsService);</span></span>
<span class="line"><span>      if (passwordManager != null) {</span></span>
<span class="line"><span>        provider.setUserDetailsPasswordService(passwordManager);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      if (passwordChecker != null) {</span></span>
<span class="line"><span>        provider.setCompromisedPasswordChecker(passwordChecker);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      provider.afterPropertiesSet();</span></span>
<span class="line"><span>      // 把DaoAuthenticationProvider加入到AuthenticationManagerBuilder中</span></span>
<span class="line"><span>      auth.authenticationProvider(provider);</span></span>
<span class="line"><span>      this.logger.info(LogMessage.format(</span></span>
<span class="line"><span>          &quot;Global AuthenticationManager configured with UserDetailsService bean with name %s&quot;, beanNames[0]));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br></div></div><p>可以看出来，这里是初始化了DaoAuthenticationProvider，并把UserDetailsService设置到DaoAuthenticationProvider。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Order(InitializeAuthenticationProviderBeanManagerConfigurer.DEFAULT_ORDER)</span></span>
<span class="line"><span>class InitializeAuthenticationProviderBeanManagerConfigurer extends GlobalAuthenticationConfigurerAdapter {</span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	public void init(AuthenticationManagerBuilder auth) throws Exception {</span></span>
<span class="line"><span>		auth.apply(new InitializeAuthenticationProviderManagerConfigurer());</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  class InitializeAuthenticationProviderManagerConfigurer extends GlobalAuthenticationConfigurerAdapter {</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>		public void configure(AuthenticationManagerBuilder auth) {</span></span>
<span class="line"><span>			if (auth.isConfigured()) {</span></span>
<span class="line"><span>				return;</span></span>
<span class="line"><span>			}</span></span>
<span class="line"><span>			String[] beanNames = InitializeAuthenticationProviderBeanManagerConfigurer.this.context</span></span>
<span class="line"><span>				.getBeanNamesForType(AuthenticationProvider.class);</span></span>
<span class="line"><span>			if (beanNames.length == 0) {</span></span>
<span class="line"><span>				return;</span></span>
<span class="line"><span>			}</span></span>
<span class="line"><span>			else if (beanNames.length &gt; 1) {</span></span>
<span class="line"><span>				return;</span></span>
<span class="line"><span>			}</span></span>
<span class="line"><span>			AuthenticationProvider authenticationProvider = InitializeAuthenticationProviderBeanManagerConfigurer.this.context</span></span>
<span class="line"><span>				.getBean(beanNames[0], AuthenticationProvider.class);</span></span>
<span class="line"><span>			auth.authenticationProvider(authenticationProvider);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>这里就是从spring中获取AuthenticationProvider的Bean，注册到AuthenticationManagerBuilder。</p><p>最后让我们看一下DefaultPasswordEncoderAuthenticationManagerBuilder的performBuild方法，该类继承了AuthenticationManagerBuilder</p><div class="language-AuthenticationManagerBuilder vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthenticationManagerBuilder</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class AuthenticationManagerBuilder</span></span>
<span class="line"><span>		extends AbstractConfiguredSecurityBuilder&lt;AuthenticationManager, AuthenticationManagerBuilder&gt;</span></span>
<span class="line"><span>		implements ProviderManagerBuilder&lt;AuthenticationManagerBuilder&gt; {</span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	protected ProviderManager performBuild() throws Exception {</span></span>
<span class="line"><span>		if (!isConfigured()) {</span></span>
<span class="line"><span>			this.logger.debug(&quot;No authenticationProviders and no parentAuthenticationManager defined. Returning null.&quot;);</span></span>
<span class="line"><span>			return null;</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>		ProviderManager providerManager = new ProviderManager(this.authenticationProviders,</span></span>
<span class="line"><span>				this.parentAuthenticationManager);</span></span>
<span class="line"><span>		if (this.eraseCredentials != null) {</span></span>
<span class="line"><span>			providerManager.setEraseCredentialsAfterAuthentication(this.eraseCredentials);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>		if (this.eventPublisher != null) {</span></span>
<span class="line"><span>			providerManager.setAuthenticationEventPublisher(this.eventPublisher);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>		providerManager = postProcess(providerManager);</span></span>
<span class="line"><span>		return providerManager;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>可以看到就是返回了一个providerManager，这个就是HttpSecurity里面的providerManager的父类providerManager。</p><p>而HttpSecurity里面的providerManager之前提过了是在HttpSecurity的beforeConfigure构建的。</p>`,102)]))}const y=s(g,[["render",A]]);export{x as __pageData,y as default};
