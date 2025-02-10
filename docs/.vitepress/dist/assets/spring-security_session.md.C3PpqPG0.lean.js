import{_ as n,c as a,a0 as e,o as p}from"./chunks/framework.P9qPzDnn.js";const t="/assets/getAuthentication.oXiSqZfb.png",i="/assets/SecurityContextHolder-SecurityContext-Authentication.Crh-PGAV.png",l="/assets/strategy.C3ytTukw.png",r="/assets/Servlet3SecurityContextHolderAwareRequestWrapper.V27FFCar.png",c="/assets/SecurityContextRepository.B5wOAIyv.png",o="/assets/SessionAuthenticationStrategy.CV5g9HhY.png",u="/assets/session-share.CLUTnIcY.png",x=JSON.parse('{"title":"用户会话管理","description":"","frontmatter":{},"headers":[],"relativePath":"spring-security/session.md","filePath":"spring-security/session.md"}'),b={name:"spring-security/session.md"};function m(d,s,g,h,S,y){return p(),a("div",null,s[0]||(s[0]=[e(`<h1 id="用户会话管理" tabindex="-1">用户会话管理 <a class="header-anchor" href="#用户会话管理" aria-label="Permalink to &quot;用户会话管理&quot;">​</a></h1><p>用户登录成功后，是怎么保存用户的会话信息的呢？在代码中我们怎么样获取用户的认证信息呢？还有用户怎么样可以做到多设备登录等。这些是本章讲解的内容。</p><p>跟之前一样，我们还是基于Spring Security的配置文件开始讲起。</p><div class="language-DefaultSecurityConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig  {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(withDefaults());</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><h2 id="用户登录数据获取" tabindex="-1">用户登录数据获取 <a class="header-anchor" href="#用户登录数据获取" aria-label="Permalink to &quot;用户登录数据获取&quot;">​</a></h2><p>登录成功之后，在后续的业务逻辑中，开发者有可能需要获取登录成功的用户对象，如果不使用任何框架，可以将用户数据保存到HttpSession中，然后从HttpSession获取。</p><p>在Spring Security中，用户信息还是保存在HttpSession中，但是为了方便使用，Spring Security对用户信息进行了封装。有两种方式可以对用户的登录数据进行获取。</p><ul><li>从SecurityContextHolder中获取</li><li>从当前请求对象中获取</li></ul><p>上一篇认证流程有提到，最终用户认证的信息是保存在Authentication中的, 用户登录成功后获取到用户登录数据也是这个，这里重新放一遍:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface Authentication extends Principal, Serializable {</span></span>
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
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>而基于表单登录的Authentication实现类是UsernamePasswordAuthenticationToken</p><h3 id="securitycontextholder" tabindex="-1">SecurityContextHolder <a class="header-anchor" href="#securitycontextholder" aria-label="Permalink to &quot;SecurityContextHolder&quot;">​</a></h3><p>先演示一下登录成功后怎么从SecurityContextHolder中获取用户的认证信息。新建一个Controller，名字叫做UserController，代码如下：</p><div class="language-UserController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">UserController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@RestController</span></span>
<span class="line"><span>public class UserController {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @GetMapping(&quot;/user&quot;)</span></span>
<span class="line"><span>  public UsernamePasswordAuthenticationToken userInfo() {</span></span>
<span class="line"><span>    return (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>启动项目，登录成功后，访问/user接口, 就会给我们返回用户的认证信息，如下图所示:</p><img src="`+t+'" width="400" alt="getAuthentication"><p>可以看到SecurityContextHolder.getContext()是一个静态方法，返回SecurityContext, 由此我们可以推断出SecurityContextHolder，SecurityContext，Authentication三者的关系</p><img src="'+i+`" width="350" alt="SecurityContextHolder-SecurityContext-Authentication三者的关系"><p>我们还是从SecurityContextHolder这个类开始看起吧，先看getContext，具体代码如下:</p><div class="language-SecurityContextHolder vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityContextHolder</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SecurityContextHolder {</span></span>
<span class="line"><span>  private static SecurityContextHolderStrategy strategy;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	public static SecurityContext getContext() {</span></span>
<span class="line"><span>		return strategy.getContext();</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>可以看到是调用了strategy.getContext返回的，那么strategy是在哪里赋值的呢？继续看代码</p><div class="language-SecurityContextHolder vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityContextHolder</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SecurityContextHolder {</span></span>
<span class="line"><span>  public static final String SYSTEM_PROPERTY = &quot;spring.security.strategy&quot;;</span></span>
<span class="line"><span>  private static String strategyName = System.getProperty(SYSTEM_PROPERTY);</span></span>
<span class="line"><span>  static {</span></span>
<span class="line"><span>    initialize();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static void initialize() {</span></span>
<span class="line"><span>    initializeStrategy();</span></span>
<span class="line"><span>    initializeCount++;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static void initializeStrategy() {</span></span>
<span class="line"><span>    if (MODE_PRE_INITIALIZED.equals(strategyName)) {</span></span>
<span class="line"><span>      Assert.state(strategy != null, &quot;When using &quot; + MODE_PRE_INITIALIZED</span></span>
<span class="line"><span>          + &quot;, setContextHolderStrategy must be called with the fully constructed strategy&quot;);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (!StringUtils.hasText(strategyName)) {</span></span>
<span class="line"><span>      // Set default</span></span>
<span class="line"><span>      strategyName = MODE_THREADLOCAL;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (strategyName.equals(MODE_THREADLOCAL)) {</span></span>
<span class="line"><span>      strategy = new ThreadLocalSecurityContextHolderStrategy();</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (strategyName.equals(MODE_INHERITABLETHREADLOCAL)) {</span></span>
<span class="line"><span>      strategy = new InheritableThreadLocalSecurityContextHolderStrategy();</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (strategyName.equals(MODE_GLOBAL)) {</span></span>
<span class="line"><span>      strategy = new GlobalSecurityContextHolderStrategy();</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // Try to load a custom strategy</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      Class&lt;?&gt; clazz = Class.forName(strategyName);</span></span>
<span class="line"><span>      Constructor&lt;?&gt; customStrategy = clazz.getConstructor();</span></span>
<span class="line"><span>      strategy = (SecurityContextHolderStrategy) customStrategy.newInstance();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    catch (Exception ex) {</span></span>
<span class="line"><span>      ReflectionUtils.handleReflectionException(ex);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br></div></div><p>可以看到主要的strategy有三种：</p><ul><li>MODE_THREADLOCAL: 将SecurityContext存放在ThreadLocal中，可以实现单线程共享，默认策略</li><li>MODE_INHERITABLETHREADLOCAL: 将SecurityContext存放在Inheritable ThreadLocal中，可以实现子线程共享，看需要配置</li><li>MODE_GLOBAL: 将SecurityContext存放到一个变量中，全局共享，基本用不到，在多用户环境下会有冲突</li></ul><p>可以看到默认的strategy是通过System.getProperty加载的，我们可以通过配置系统变量来修改默认的存储策略。</p><p><img src="`+l+`" alt="strategy"></p><p>打开IDEA的项目配置，然后在虚拟机选项里面修改strategy即可，比如设置为MODE_INHERITABLETHREADLOCAL</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>-Dspring.security.strategy=MODE_INHERITABLETHREADLOCAL</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h3 id="securitycontextholderstrategy" tabindex="-1">SecurityContextHolderStrategy <a class="header-anchor" href="#securitycontextholderstrategy" aria-label="Permalink to &quot;SecurityContextHolderStrategy&quot;">​</a></h3><p>可以看到strategy的类的SecurityContextHolderStrategy，我们看一下这个接口的定义:</p><div class="language-SecurityContextHolderStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityContextHolderStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface SecurityContextHolderStrategy {</span></span>
<span class="line"><span>  // 清除SecurityContext</span></span>
<span class="line"><span>  void clearContext();</span></span>
<span class="line"><span>  // 获取SecurityContext</span></span>
<span class="line"><span>  SecurityContext getContext();</span></span>
<span class="line"><span>  // 获取DeferredContext</span></span>
<span class="line"><span>  default Supplier&lt;SecurityContext&gt; getDeferredContext() {</span></span>
<span class="line"><span>    return this::getContext;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  //设置SecurityContext</span></span>
<span class="line"><span>  void setContext(SecurityContext context);</span></span>
<span class="line"><span>  default void setDeferredContext(Supplier&lt;SecurityContext&gt; deferredContext) {</span></span>
<span class="line"><span>    setContext(deferredContext.get());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  SecurityContext createEmptyContext();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>这里说一下DeferredContext，看名字就知道SecurityContext存起来，暂时不返回，等用到的时候再返回。后面分析请求进来初始化SecurityContext的时候会用到。</p><p>我们先看看上面三种策略对应的SecurityContextHolderStrategy的实现类吧。</p><p>先看MODE_THREADLOCAL策略对应的ThreadLocalSecurityContextHolderStrategy，直接看关键的地方就可以了，其他的地方实现都是一样的。</p><div class="language-ThreadLocalSecurityContextHolderStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ThreadLocalSecurityContextHolderStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>final class ThreadLocalSecurityContextHolderStrategy implements SecurityContextHolderStrategy {</span></span>
<span class="line"><span>	private static final ThreadLocal&lt;Supplier&lt;SecurityContext&gt;&gt; contextHolder = new ThreadLocal&lt;&gt;();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>可以看到是存在ThreadLocal中的。所以是线程共享的。</p><p>再看MODE_INHERITABLETHREADLOCAL对应的InheritableThreadLocalSecurityContextHolderStrategy，代码如下</p><div class="language-InheritableThreadLocalSecurityContextHolderStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">InheritableThreadLocalSecurityContextHolderStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>final class InheritableThreadLocalSecurityContextHolderStrategy implements SecurityContextHolderStrategy {</span></span>
<span class="line"><span>	private static final ThreadLocal&lt;Supplier&lt;SecurityContext&gt;&gt; contextHolder = new InheritableThreadLocal&lt;&gt;();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>可以看到是存在InheritableThreadLocal，学过InheritableThreadLocal的都知道，这里的值会跟着子线程的创建传递给子线程的InheritableThreadLocal。所以是子线程共享的。</p><p>最后我们看一下GlobalSecurityContextHolderStrategy，代码如下</p><div class="language-GlobalSecurityContextHolderStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">GlobalSecurityContextHolderStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>final class GlobalSecurityContextHolderStrategy implements SecurityContextHolderStrategy {</span></span>
<span class="line"><span>	private static SecurityContext contextHolder;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>可以看到就是保存在静态变量里面的，这个策略基本不用，相当于某一时刻，所有用户共享一个认证信息了。</p><p>好了，讨论完SecurityContextHolder，我们看一下SecurityContext是在哪个过滤器里面赋值的。</p><h3 id="securitycontext" tabindex="-1">SecurityContext <a class="header-anchor" href="#securitycontext" aria-label="Permalink to &quot;SecurityContext&quot;">​</a></h3><p>查看SecurityContext的接口声明，可以看到只有获取Authentication跟设置Authentication的方法</p><div class="language-SecurityContext vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityContext</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface SecurityContext extends Serializable {</span></span>
<span class="line"><span>	Authentication getAuthentication();</span></span>
<span class="line"><span>	void setAuthentication(Authentication authentication);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>这个接口默认使用的实现类是SecurityContextImpl。</p><h3 id="securitycontextholderfilter" tabindex="-1">SecurityContextHolderFilter <a class="header-anchor" href="#securitycontextholderfilter" aria-label="Permalink to &quot;SecurityContextHolderFilter&quot;">​</a></h3><p>接下来我们看看Authentication是怎么放入SecurityContextHolder中的。首先我们来看HttpSecurity Bean的声明函数</p><div class="language-HttpSecurityConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">HttpSecurityConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>class HttpSecurityConfiguration {</span></span>
<span class="line"><span>  @Bean(HTTPSECURITY_BEAN_NAME)</span></span>
<span class="line"><span>  @Scope(&quot;prototype&quot;)</span></span>
<span class="line"><span>  HttpSecurity httpSecurity() throws Exception {</span></span>
<span class="line"><span>    http.securityContext(withDefaults());</span></span>
<span class="line"><span>    return http;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>上面只调重点的说，可以看到http引入了securityContext这了函数，这个函数往HttpSecurity中加入了SecurityContextConfigurer。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class HttpSecurity extends AbstractConfiguredSecurityBuilder&lt;DefaultSecurityFilterChain, HttpSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;DefaultSecurityFilterChain&gt;, HttpSecurityBuilder&lt;HttpSecurity&gt; {</span></span>
<span class="line"><span>  public HttpSecurity securityContext(Customizer&lt;SecurityContextConfigurer&lt;HttpSecurity&gt;&gt; securityContextCustomizer)</span></span>
<span class="line"><span>      throws Exception {</span></span>
<span class="line"><span>    securityContextCustomizer.customize(getOrApply(new SecurityContextConfigurer&lt;&gt;()));</span></span>
<span class="line"><span>    return HttpSecurity.this;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>按照惯例，我们看看SecurityContextConfigurer的configure方法</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class SecurityContextConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;SecurityContextConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span>  private boolean requireExplicitSave = true;</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	@SuppressWarnings(&quot;unchecked&quot;)</span></span>
<span class="line"><span>	public void configure(H http) {</span></span>
<span class="line"><span>    SecurityContextRepository securityContextRepository = getSecurityContextRepository();</span></span>
<span class="line"><span>    if (this.requireExplicitSave) {</span></span>
<span class="line"><span>      SecurityContextHolderFilter securityContextHolderFilter = postProcess(</span></span>
<span class="line"><span>          new SecurityContextHolderFilter(securityContextRepository));</span></span>
<span class="line"><span>      securityContextHolderFilter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());</span></span>
<span class="line"><span>      http.addFilter(securityContextHolderFilter);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      SecurityContextPersistenceFilter securityContextFilter = new SecurityContextPersistenceFilter(</span></span>
<span class="line"><span>          securityContextRepository);</span></span>
<span class="line"><span>      securityContextFilter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());</span></span>
<span class="line"><span>      SessionManagementConfigurer&lt;?&gt; sessionManagement = http.getConfigurer(SessionManagementConfigurer.class);</span></span>
<span class="line"><span>      SessionCreationPolicy sessionCreationPolicy = (sessionManagement != null)</span></span>
<span class="line"><span>          ? sessionManagement.getSessionCreationPolicy() : null;</span></span>
<span class="line"><span>      if (SessionCreationPolicy.ALWAYS == sessionCreationPolicy) {</span></span>
<span class="line"><span>        securityContextFilter.setForceEagerSessionCreation(true);</span></span>
<span class="line"><span>        http.addFilter(postProcess(new ForceEagerSessionCreationFilter()));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      securityContextFilter = postProcess(securityContextFilter);</span></span>
<span class="line"><span>      http.addFilter(securityContextFilter);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br></div></div><p>SecurityContextRepository本节后面讲Session的时候会用到。可以看到this.requireExplicitSave默认是true，往过滤器中加入了SecurityContextHolderFilter这个过滤器。</p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>SecurityContextPersistenceFilter在Spring Security6中被标注为@Deprecated</p></div><p>接下来我们看一下SecurityContextHolderFilter这个过滤器的实现,看doFilter方法。</p><div class="language-SecurityContextHolderFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityContextHolderFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SecurityContextHolderFilter extends GenericFilterBean {</span></span>
<span class="line"><span>  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>      throws ServletException, IOException {</span></span>
<span class="line"><span>    if (request.getAttribute(FILTER_APPLIED) != null) {</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    request.setAttribute(FILTER_APPLIED, Boolean.TRUE);</span></span>
<span class="line"><span>    // 可以看到SecurityContext是从this.securityContextRepository中获取的,然后放入到securityContextHolderStrategy中</span></span>
<span class="line"><span>    Supplier&lt;SecurityContext&gt; deferredContext = this.securityContextRepository.loadDeferredContext(request);</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      this.securityContextHolderStrategy.setDeferredContext(deferredContext);</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    finally {</span></span>
<span class="line"><span>      this.securityContextHolderStrategy.clearContext();</span></span>
<span class="line"><span>      request.removeAttribute(FILTER_APPLIED);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>好了，到这，大家应该明白SecurityContextHolder.getContext().getAuthentication()是怎么获取的了。注意返回的是deferredContext，这个有懒加载的意思。我们就拿ThreadLocalSecurityContextHolderStrategy来看。</p><div class="language-ThreadLocalSecurityContextHolderStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ThreadLocalSecurityContextHolderStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>final class ThreadLocalSecurityContextHolderStrategy implements SecurityContextHolderStrategy {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public SecurityContext getContext() {</span></span>
<span class="line"><span>    return getDeferredContext().get();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Supplier&lt;SecurityContext&gt; getDeferredContext() {</span></span>
<span class="line"><span>    Supplier&lt;SecurityContext&gt; result = contextHolder.get();</span></span>
<span class="line"><span>    if (result == null) {</span></span>
<span class="line"><span>      SecurityContext context = createEmptyContext();</span></span>
<span class="line"><span>      result = () -&gt; context;</span></span>
<span class="line"><span>      contextHolder.set(result);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return result;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>可以看到在getContext的时候才会把SecurityContext放到contextHolder中。</p><h3 id="从请求对象中获取" tabindex="-1">从请求对象中获取 <a class="header-anchor" href="#从请求对象中获取" aria-label="Permalink to &quot;从请求对象中获取&quot;">​</a></h3><p>除了SecurityContextHolder，还有另一种方式可以获取用户的Authentication-从请求中获取。在UserController中新建一个接口</p><div class="language-UserController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">UserController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@RestController</span></span>
<span class="line"><span>public class UserController {</span></span>
<span class="line"><span>  @GetMapping(&quot;/authentication&quot;)</span></span>
<span class="line"><span>  public Authentication authentication(Authentication authentication) {</span></span>
<span class="line"><span>    return authentication;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>登录成功后，访问/authentication接口一样可以获取Authentication。</p><p>了解Servlet的都知道，Controller方法的参数都是当前请求HttpServletRequest带来的。而HttpServletRequest遵循Servlet规范，要我们看看这个接口跟用户相关的方法</p><div class="language-HttpServletRequest vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">HttpServletRequest</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface HttpServletRequest extends ServletRequest {</span></span>
<span class="line"><span>  String getRemoteUser();</span></span>
<span class="line"><span>  boolean isUserInRole(String role);</span></span>
<span class="line"><span>  java.security.Principal getUserPrincipal();</span></span>
<span class="line"><span>  boolean authenticate(HttpServletResponse response) throws IOException, ServletException;</span></span>
<span class="line"><span>  void login(String username, String password) throws ServletException;</span></span>
<span class="line"><span>  void logout() throws ServletException;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>默认的实现RequestFacade。不过为了实现直接获取Authentication，Spring Security利用装饰器模式，重新封装了一个类Servlet3SecurityContextHolderAwareRequestWrapper</p><img src="`+r+`" width="300" alt="Servlet3SecurityContextHolderAwareRequestWrapper"><p>让我们看看Servlet3SecurityContextHolderAwareRequestWrapper跟用户登录信息相关的实现，代码如下</p><div class="language-SecurityContextHolderAwareRequestWrapper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityContextHolderAwareRequestWrapper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SecurityContextHolderAwareRequestWrapper extends HttpServletRequestWrapper {</span></span>
<span class="line"><span>  private Authentication getAuthentication() {</span></span>
<span class="line"><span>    // 是不是很熟悉，不就是我们刚开始获取Authentication的吗？SecurityContextHolder.getContext().getAuthentication()</span></span>
<span class="line"><span>    Authentication auth = this.securityContextHolderStrategy.getContext().getAuthentication();</span></span>
<span class="line"><span>    return (this.trustResolver.isAuthenticated(auth)) ? auth : null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public String getRemoteUser() {</span></span>
<span class="line"><span>    Authentication auth = getAuthentication();</span></span>
<span class="line"><span>    if ((auth == null) || (auth.getPrincipal() == null)) {</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (auth.getPrincipal() instanceof UserDetails) {</span></span>
<span class="line"><span>      return ((UserDetails) auth.getPrincipal()).getUsername();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (auth instanceof AbstractAuthenticationToken) {</span></span>
<span class="line"><span>      return auth.getName();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return auth.getPrincipal().toString();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Principal getUserPrincipal() {</span></span>
<span class="line"><span>    Authentication auth = getAuthentication();</span></span>
<span class="line"><span>    if ((auth == null) || (auth.getPrincipal() == null)) {</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return auth;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  private boolean isGranted(String role) {</span></span>
<span class="line"><span>    Authentication auth = getAuthentication();</span></span>
<span class="line"><span>    if (this.rolePrefix != null &amp;&amp; role != null &amp;&amp; !role.startsWith(this.rolePrefix)) {</span></span>
<span class="line"><span>      role = this.rolePrefix + role;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if ((auth == null) || (auth.getPrincipal() == null)) {</span></span>
<span class="line"><span>      return false;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    Collection&lt;? extends GrantedAuthority&gt; authorities = auth.getAuthorities();</span></span>
<span class="line"><span>    if (authorities == null) {</span></span>
<span class="line"><span>      return false;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    for (GrantedAuthority grantedAuthority : authorities) {</span></span>
<span class="line"><span>      if (role.equals(grantedAuthority.getAuthority())) {</span></span>
<span class="line"><span>        return true;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return false;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean isUserInRole(String role) {</span></span>
<span class="line"><span>    return isGranted(role);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br></div></div><p>可以看到，这些有关用户登录的数据都可以在Controller中直接获取。在Spring Security的过滤器中，有一个SecurityContextHolderAwareRequestFilter的过滤器，会对HttpServletRequest进行包装，查看代码。</p><div class="language-SecurityContextHolderAwareRequestFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityContextHolderAwareRequestFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SecurityContextHolderAwareRequestFilter extends GenericFilterBean {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)</span></span>
<span class="line"><span>			throws IOException, ServletException {</span></span>
<span class="line"><span>		chain.doFilter(this.requestFactory.create((HttpServletRequest) req, (HttpServletResponse) res), res);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>	public void afterPropertiesSet() throws ServletException {</span></span>
<span class="line"><span>		super.afterPropertiesSet();</span></span>
<span class="line"><span>		updateFactory();</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	private void updateFactory() {</span></span>
<span class="line"><span>		String rolePrefix = this.rolePrefix;</span></span>
<span class="line"><span>		this.requestFactory = createServlet3Factory(rolePrefix);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>可以看到在调用doFilter的时候，传下去了一个requestFactory创建的HttpServletRequest，而requestFactory是通过createServlet3Factory创建的，查看代码。</p><div class="language-SecurityContextHolderAwareRequestFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityContextHolderAwareRequestFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SecurityContextHolderAwareRequestFilter extends GenericFilterBean {</span></span>
<span class="line"><span>  private HttpServletRequestFactory createServlet3Factory(String rolePrefix) {</span></span>
<span class="line"><span>    HttpServlet3RequestFactory factory = new HttpServlet3RequestFactory(rolePrefix, this.securityContextRepository);</span></span>
<span class="line"><span>    factory.setTrustResolver(this.trustResolver);</span></span>
<span class="line"><span>    factory.setAuthenticationEntryPoint(this.authenticationEntryPoint);</span></span>
<span class="line"><span>    factory.setAuthenticationManager(this.authenticationManager);</span></span>
<span class="line"><span>    factory.setLogoutHandlers(this.logoutHandlers);</span></span>
<span class="line"><span>    factory.setSecurityContextHolderStrategy(this.securityContextHolderStrategy);</span></span>
<span class="line"><span>    return factory;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>跟进HttpServlet3RequestFactory的create方法。代码如下:</p><div class="language-HttpServlet3RequestFactory vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">HttpServlet3RequestFactory</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>final class HttpServlet3RequestFactory implements HttpServletRequestFactory {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public HttpServletRequest create(HttpServletRequest request, HttpServletResponse response) {</span></span>
<span class="line"><span>    Servlet3SecurityContextHolderAwareRequestWrapper wrapper = new Servlet3SecurityContextHolderAwareRequestWrapper(</span></span>
<span class="line"><span>        request, this.rolePrefix, response);</span></span>
<span class="line"><span>    wrapper.setSecurityContextHolderStrategy(this.securityContextHolderStrategy);</span></span>
<span class="line"><span>    return wrapper;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>好了，Servlet3SecurityContextHolderAwareRequestWrapper的创建到此为止。接下来我们看一下SecurityContextHolderAwareRequestFilter是怎么加入过滤器中的。</p><p>按照惯例我们查看HttpSecurity Bean的声明函数。</p><div class="language-HttpSecurityConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">HttpSecurityConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>class HttpSecurityConfiguration {</span></span>
<span class="line"><span>  @Bean(HTTPSECURITY_BEAN_NAME)</span></span>
<span class="line"><span>  @Scope(&quot;prototype&quot;)</span></span>
<span class="line"><span>  HttpSecurity httpSecurity() throws Exception {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    HttpSecurity http = new HttpSecurity(this.objectPostProcessor, authenticationBuilder, createSharedObjects());</span></span>
<span class="line"><span>    http.servletApi(withDefaults());</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>点击servletApi进去查看，往HttpSecurity注入了ServletApiConfigurer，很好，我们来看ServletApiConfigurer的configure函数。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class ServletApiConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;ServletApiConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span>  private SecurityContextHolderAwareRequestFilter securityContextRequestFilter = new SecurityContextHolderAwareRequestFilter();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void configure(H http) {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    http.addFilter(this.securityContextRequestFilter);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>好了，分析到这里为止，至于Controller中怎么可以直接使用Authentication这个类的，这里是Spring的内容，后面会新出一个课程讲解。</p><h3 id="authentication保存" tabindex="-1">Authentication保存 <a class="header-anchor" href="#authentication保存" aria-label="Permalink to &quot;Authentication保存&quot;">​</a></h3><p>那么Authentication是什么时候写入到SecurityContext中的呢，既然我们知道了是用户认证成功之后才会有Authentication的，那我们直接看认证成功的地方。前面提到过，用户的认证有一个抽象类Filter，在里面做认证以及认证成功处理。之前有个地方没有细讲，这里直接看代码。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractAuthenticationProcessingFilter extends GenericFilterBean</span></span>
<span class="line"><span>		implements ApplicationEventPublisherAware, MessageSourceAware {</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>      throws IOException, ServletException {</span></span>
<span class="line"><span>    if (!requiresAuthentication(request, response)) {</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      ...</span></span>
<span class="line"><span>      // 认证成功，执行后续操作</span></span>
<span class="line"><span>      successfulAuthentication(request, response, chain, authenticationResult);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,</span></span>
<span class="line"><span>      Authentication authResult) throws IOException, ServletException {</span></span>
<span class="line"><span>    // 在这里写入</span></span>
<span class="line"><span>    SecurityContext context = this.securityContextHolderStrategy.createEmptyContext();</span></span>
<span class="line"><span>    context.setAuthentication(authResult);</span></span>
<span class="line"><span>    this.securityContextHolderStrategy.setContext(context);</span></span>
<span class="line"><span>    this.securityContextRepository.saveContext(context, request, response);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>SecurityContextHolderStrategy是在AbstractAuthenticationFilterConfigurer中配置的</p><div class="language-AbstractAuthenticationFilterConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractAuthenticationFilterConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractAuthenticationFilterConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;, T extends AbstractAuthenticationFilterConfigurer&lt;B, T, F&gt;, F extends AbstractAuthenticationProcessingFilter&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;T, B&gt; {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void configure(B http) throws Exception {</span></span>
<span class="line"><span>    this.authFilter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected SecurityContextHolderStrategy getSecurityContextHolderStrategy() {</span></span>
<span class="line"><span>    if (this.securityContextHolderStrategy != null) {</span></span>
<span class="line"><span>      return this.securityContextHolderStrategy;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ApplicationContext context = getBuilder().getSharedObject(ApplicationContext.class);</span></span>
<span class="line"><span>    String[] names = context.getBeanNamesForType(SecurityContextHolderStrategy.class);</span></span>
<span class="line"><span>    if (names.length == 1) {</span></span>
<span class="line"><span>      this.securityContextHolderStrategy = context.getBean(SecurityContextHolderStrategy.class);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      this.securityContextHolderStrategy = SecurityContextHolder.getContextHolderStrategy();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return this.securityContextHolderStrategy;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br></div></div><h2 id="用户会话信息保存" tabindex="-1">用户会话信息保存 <a class="header-anchor" href="#用户会话信息保存" aria-label="Permalink to &quot;用户会话信息保存&quot;">​</a></h2><p>在用户调用登录接口成功之后，服务端和浏览器之间会建立一个会话（session），浏览器每次发送请求时都会携带一个SessionId，服务端则根据这个SessionId来判断用户身份。当浏览器关闭后，服务端的Session并不会自动销毁，需要开发者手动在服务端调用Session销毁方法，或者等Session过期。</p><p>前面提到，用户数据保存到HttpSession中，然后从HttpSession获取的，那么Spring Security是怎么使用HttpSession的呢？</p><h3 id="abstractauthenticationprocessingfilter" tabindex="-1">AbstractAuthenticationProcessingFilter <a class="header-anchor" href="#abstractauthenticationprocessingfilter" aria-label="Permalink to &quot;AbstractAuthenticationProcessingFilter&quot;">​</a></h3><p>既然是用户登录成功之后，才会把用户的信息写入到Session里面的，所以我们直接从用户认证成功的地方开始看起。</p><div class="language-AbstractAuthenticationProcessingFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractAuthenticationProcessingFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractAuthenticationProcessingFilter extends GenericFilterBean</span></span>
<span class="line"><span>		implements ApplicationEventPublisherAware, MessageSourceAware {</span></span>
<span class="line"><span>	private SessionAuthenticationStrategy sessionStrategy = new NullAuthenticatedSessionStrategy();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>      throws IOException, ServletException {</span></span>
<span class="line"><span>    if (!requiresAuthentication(request, response)) {</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      ...</span></span>
<span class="line"><span>      // 认证成功，执行后续操作</span></span>
<span class="line"><span>      successfulAuthentication(request, response, chain, authenticationResult);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,</span></span>
<span class="line"><span>      Authentication authResult) throws IOException, ServletException {</span></span>
<span class="line"><span>    SecurityContext context = this.securityContextHolderStrategy.createEmptyContext();</span></span>
<span class="line"><span>    context.setAuthentication(authResult);</span></span>
<span class="line"><span>    this.securityContextHolderStrategy.setContext(context);</span></span>
<span class="line"><span>    // 封装SecurityContext，保存用户认证信息到securityContextRepository中</span></span>
<span class="line"><span>    this.securityContextRepository.saveContext(context, request, response);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><p>Spring Security中使用securityContextRepository来保存SecurityContext, 然后前面在介绍SecurityContextHolderFilter的doFilter实现时，有从securityContextRepository获取用户信息的调用，如下所示:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SecurityContextHolderFilter extends GenericFilterBean {</span></span>
<span class="line"><span>  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>      throws ServletException, IOException {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    // 可以看到SecurityContext是从this.securityContextRepository中获取的,然后放入到securityContextHolderStrategy中</span></span>
<span class="line"><span>    Supplier&lt;SecurityContext&gt; deferredContext = this.securityContextRepository.loadDeferredContext(request);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>我们先来看一下securityContextRepository的声明，代码如下所示:</p><div class="language-SecurityContextRepository vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityContextRepository</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface SecurityContextRepository {</span></span>
<span class="line"><span>  @Deprecated</span></span>
<span class="line"><span>  SecurityContext loadContext(HttpRequestResponseHolder requestResponseHolder);</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  // 加载DeferredContext</span></span>
<span class="line"><span>  default DeferredSecurityContext loadDeferredContext(HttpServletRequest request) {</span></span>
<span class="line"><span>    Supplier&lt;SecurityContext&gt; supplier = () -&gt; loadContext(new HttpRequestResponseHolder(request, null));</span></span>
<span class="line"><span>    return new SupplierDeferredSecurityContext(SingletonSupplier.of(supplier),</span></span>
<span class="line"><span>        SecurityContextHolder.getContextHolderStrategy());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 保存SecurityContext</span></span>
<span class="line"><span>  void saveContext(SecurityContext context, HttpServletRequest request, HttpServletResponse response);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  boolean containsContext(HttpServletRequest request);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p><img src="`+c+`" alt="SecurityContextRepository"></p><p>可以看到实现类有5个，下面介绍一下常用的几个实现类：</p><ul><li>HttpSessionSecurityContextRepository: 将SecurityContext保存在HttpSession中</li><li>RequestAttributeSecurityContextRepository: 将SecurityContext保存在RequestAttribute，这个感觉在微服务架构中很有用</li><li>DelegatingSecurityContextRepository: 复合Repository，可以嵌套SecurityContextRepository</li></ul><p>而SecurityContextRepository的默认类就是DelegatingSecurityContextRepository。前面说到HttpSecurity会引入以下这个SecurityContextConfigurer，看里面的configure方法。</p><div class="language-SecurityContextConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityContextConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class SecurityContextConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;SecurityContextConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void configure(H http) {</span></span>
<span class="line"><span>    SecurityContextRepository securityContextRepository = getSecurityContextRepository();</span></span>
<span class="line"><span>    if (this.requireExplicitSave) {</span></span>
<span class="line"><span>      SecurityContextHolderFilter securityContextHolderFilter = postProcess(</span></span>
<span class="line"><span>          new SecurityContextHolderFilter(securityContextRepository));</span></span>
<span class="line"><span>      securityContextHolderFilter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());</span></span>
<span class="line"><span>      http.addFilter(securityContextHolderFilter);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  SecurityContextRepository getSecurityContextRepository() {</span></span>
<span class="line"><span>    SecurityContextRepository securityContextRepository = getBuilder()</span></span>
<span class="line"><span>      .getSharedObject(SecurityContextRepository.class);</span></span>
<span class="line"><span>    // 如果securityContextRepository为空，则初始化一个</span></span>
<span class="line"><span>    // 包括RequestAttributeSecurityContextRepository跟HttpSessionSecurityContextRepository</span></span>
<span class="line"><span>    if (securityContextRepository == null) {</span></span>
<span class="line"><span>      securityContextRepository = new DelegatingSecurityContextRepository(</span></span>
<span class="line"><span>          new RequestAttributeSecurityContextRepository(), new HttpSessionSecurityContextRepository());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return securityContextRepository;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><p>如果使用了SessionManagement，SecurityContextRepository是在SessionManagementConfigurer的init方法中声明的。SessionManagement在下一节用户会话并发管理会讲到。</p><div class="language-SessionManagementConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SessionManagementConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class SessionManagementConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;SessionManagementConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void init(H http) {</span></span>
<span class="line"><span>    SecurityContextRepository securityContextRepository = http.getSharedObject(SecurityContextRepository.class);</span></span>
<span class="line"><span>    boolean stateless = isStateless();</span></span>
<span class="line"><span>    if (securityContextRepository == null) {</span></span>
<span class="line"><span>      if (stateless) {</span></span>
<span class="line"><span>        http.setSharedObject(SecurityContextRepository.class, new RequestAttributeSecurityContextRepository());</span></span>
<span class="line"><span>        this.sessionManagementSecurityContextRepository = new NullSecurityContextRepository();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      else {</span></span>
<span class="line"><span>        HttpSessionSecurityContextRepository httpSecurityRepository = new HttpSessionSecurityContextRepository();</span></span>
<span class="line"><span>        httpSecurityRepository.setDisableUrlRewriting(!this.enableSessionUrlRewriting);</span></span>
<span class="line"><span>        httpSecurityRepository.setAllowSessionCreation(isAllowSessionCreation());</span></span>
<span class="line"><span>        AuthenticationTrustResolver trustResolver = http.getSharedObject(AuthenticationTrustResolver.class);</span></span>
<span class="line"><span>        if (trustResolver != null) {</span></span>
<span class="line"><span>          httpSecurityRepository.setTrustResolver(trustResolver);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        this.sessionManagementSecurityContextRepository = httpSecurityRepository;</span></span>
<span class="line"><span>        // 可以看到一样是这个DelegatingSecurityContextRepository</span></span>
<span class="line"><span>        DelegatingSecurityContextRepository defaultRepository = new DelegatingSecurityContextRepository(</span></span>
<span class="line"><span>            httpSecurityRepository, new RequestAttributeSecurityContextRepository());</span></span>
<span class="line"><span>        http.setSharedObject(SecurityContextRepository.class, defaultRepository);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      this.sessionManagementSecurityContextRepository = securityContextRepository;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br></div></div><p>我们看一下DelegatingSecurityContextRepository的loadDeferredContext和saveContext方法。</p><div class="language-DelegatingSecurityContextRepository vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DelegatingSecurityContextRepository</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class DelegatingSecurityContextRepository implements SecurityContextRepository {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void saveContext(SecurityContext context, HttpServletRequest request, HttpServletResponse response) {</span></span>
<span class="line"><span>    for (SecurityContextRepository delegate : this.delegates) {</span></span>
<span class="line"><span>      delegate.saveContext(context, request, response);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public DeferredSecurityContext loadDeferredContext(HttpServletRequest request) {</span></span>
<span class="line"><span>    DeferredSecurityContext deferredSecurityContext = null;</span></span>
<span class="line"><span>    for (SecurityContextRepository delegate : this.delegates) {</span></span>
<span class="line"><span>      if (deferredSecurityContext == null) {</span></span>
<span class="line"><span>        deferredSecurityContext = delegate.loadDeferredContext(request);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      else {</span></span>
<span class="line"><span>        DeferredSecurityContext next = delegate.loadDeferredContext(request);</span></span>
<span class="line"><span>        deferredSecurityContext = new DelegatingDeferredSecurityContext(deferredSecurityContext, next);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return deferredSecurityContext;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>可以看到saveContext是遍历RequestAttributeSecurityContextRepository和HttpSessionSecurityContextRepository的saveContext方法 loadDeferredContext是遍历调用RequestAttributeSecurityContextRepository和HttpSessionSecurityContextRepository的loadDeferredContext方法。</p><p>我们这里只看HttpSessionSecurityContextRepository的实现吧。代码如下所示:</p><div class="language-HttpSessionSecurityContextRepository vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">HttpSessionSecurityContextRepository</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class HttpSessionSecurityContextRepository implements SecurityContextRepository {</span></span>
<span class="line"><span>  private SecurityContext readSecurityContextFromSession(HttpSession httpSession) {</span></span>
<span class="line"><span>    if (httpSession == null) {</span></span>
<span class="line"><span>      this.logger.trace(&quot;No HttpSession currently exists&quot;);</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // Session exists, so try to obtain a context from it.</span></span>
<span class="line"><span>    // 从httpSession获取SecurityContext</span></span>
<span class="line"><span>    Object contextFromSession = httpSession.getAttribute(this.springSecurityContextKey);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    return (SecurityContext) contextFromSession;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public DeferredSecurityContext loadDeferredContext(HttpServletRequest request) {</span></span>
<span class="line"><span>    Supplier&lt;SecurityContext&gt; supplier = () -&gt; readSecurityContextFromSession(request.getSession(false));</span></span>
<span class="line"><span>    return new SupplierDeferredSecurityContext(supplier, this.securityContextHolderStrategy);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void saveContext(SecurityContext context, HttpServletRequest request, HttpServletResponse response) {</span></span>
<span class="line"><span>    SaveContextOnUpdateOrErrorResponseWrapper responseWrapper = WebUtils.getNativeResponse(response,</span></span>
<span class="line"><span>        SaveContextOnUpdateOrErrorResponseWrapper.class);</span></span>
<span class="line"><span>    if (responseWrapper == null) {</span></span>
<span class="line"><span>      // 保存context到HttpSession中</span></span>
<span class="line"><span>      saveContextInHttpSession(context, request);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    responseWrapper.saveContext(context);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void saveContextInHttpSession(SecurityContext context, HttpServletRequest request) {</span></span>
<span class="line"><span>    if (isTransient(context) || isTransient(context.getAuthentication())) {</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    SecurityContext emptyContext = generateNewContext();</span></span>
<span class="line"><span>    if (emptyContext.equals(context)) {</span></span>
<span class="line"><span>      HttpSession session = request.getSession(false);</span></span>
<span class="line"><span>      removeContextFromSession(context, session);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      boolean createSession = this.allowSessionCreation;</span></span>
<span class="line"><span>      HttpSession session = request.getSession(createSession);</span></span>
<span class="line"><span>      setContextInSession(context, session);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br></div></div><h2 id="用户会话并发管理" tabindex="-1">用户会话并发管理 <a class="header-anchor" href="#用户会话并发管理" aria-label="Permalink to &quot;用户会话并发管理&quot;">​</a></h2><p>前面提到用户的认证信息是保存在HttpSession中的，浏览器通过在每次发送请求的时候发送一个SessionId，服务器端根据这个SessionId来判断用户的身份。当浏览器关闭后，服务端的Session不会销毁，需要在调用服务端接口销毁，或者等待Session过期。这些是Servlet的规范，不细讲。</p><p>会话并发管理是在当前系统中，同一个用户可以创建多少个会话，如果一个设备对应一个会话，那么也可以理解为同一个用户可以在多少台设备上进行登录，默认情况下，用户可以登录的设备是没有限制。仔细想想也知道，认证信息是保存在HttpSession中的，而HttpSession是根据SessionId区分，每个请求的SessionId不一样，只要存储同一个用户的认证信息就好了。</p><p>不过如果开发者想要限制用户的登录设备数的话，也可以设置，并且很简单。我们直接基于本节开头的DefaultSecurityConfig配置改造。具体代码如下：</p><div class="language-DefaultSecurityConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(Customizer.withDefaults());</span></span>
<span class="line"><span>    // 将用户的会话并发数设置为最大次数为1</span></span>
<span class="line"><span>    http.sessionManagement(sessionManagement -&gt; sessionManagement.maximumSessions(1));</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>启动项目，然后用chrome登录用户，访问/user接口，可以看到返回了一下信息</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>{&quot;authorities&quot;:[],&quot;details&quot;:{&quot;remoteAddress&quot;:&quot;0:0:0:0:0:0:0:1&quot;,&quot;sessionId&quot;:&quot;AA19F62AD0B34F3220A680A48F599263&quot;},&quot;authenticated&quot;:true,&quot;principal&quot;:{&quot;password&quot;:null,&quot;username&quot;:&quot;user&quot;,&quot;authorities&quot;:[],&quot;accountNonExpired&quot;:true,&quot;accountNonLocked&quot;:true,&quot;credentialsNonExpired&quot;:true,&quot;enabled&quot;:true},&quot;credentials&quot;:null,&quot;name&quot;:&quot;user&quot;}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>我们用另外一个浏览器，比如safari，登录用户，访问/user接口，也可以看到上面的信息。</p><p>好了，这个时候回到chrome，重新访问/user接口，可以发现会话过期了。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>This session has been expired (possibly due to multiple concurrent logins being attempted as the same user).</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>这是一种后来者把之前的用户踢出去的做法，当然，也可以设置成后面的用户不可以登录，配置改成下面的就可以了。</p><div class="language-DefaultSecurityConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(Customizer.withDefaults());</span></span>
<span class="line"><span>    http.sessionManagement(sessionManagement -&gt; sessionManagement.maximumSessions(1).maxSessionsPreventsLogin(true));</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><h3 id="sessionmanagementconfigurer" tabindex="-1">SessionManagementConfigurer <a class="header-anchor" href="#sessionmanagementconfigurer" aria-label="Permalink to &quot;SessionManagementConfigurer&quot;">​</a></h3><p>从http.sessionManagement开始看起，我们可以看到引入了SessionManagementConfigurer这个类</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class HttpSecurity extends AbstractConfiguredSecurityBuilder&lt;DefaultSecurityFilterChain, HttpSecurity&gt;</span></span>
<span class="line"><span>		implements SecurityBuilder&lt;DefaultSecurityFilterChain&gt;, HttpSecurityBuilder&lt;HttpSecurity&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public HttpSecurity sessionManagement(</span></span>
<span class="line"><span>      Customizer&lt;SessionManagementConfigurer&lt;HttpSecurity&gt;&gt; sessionManagementCustomizer) throws Exception {</span></span>
<span class="line"><span>    sessionManagementCustomizer.customize(getOrApply(new SessionManagementConfigurer&lt;&gt;()));</span></span>
<span class="line"><span>    return HttpSecurity.this;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>查看SessionManagementConfigurer的init方法和configure方法，先看init方法</p><div class="language-SessionManagementConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SessionManagementConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class SessionManagementConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;SessionManagementConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private boolean isStateless() {</span></span>
<span class="line"><span>    SessionCreationPolicy sessionPolicy = getSessionCreationPolicy();</span></span>
<span class="line"><span>    return SessionCreationPolicy.STATELESS == sessionPolicy;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private boolean isAllowSessionCreation() {</span></span>
<span class="line"><span>    SessionCreationPolicy sessionPolicy = getSessionCreationPolicy();</span></span>
<span class="line"><span>    return SessionCreationPolicy.ALWAYS == sessionPolicy || SessionCreationPolicy.IF_REQUIRED == sessionPolicy;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void init(H http) {</span></span>
<span class="line"><span>    // 获取SecurityContextRepository实例</span></span>
<span class="line"><span>    SecurityContextRepository securityContextRepository = http.getSharedObject(SecurityContextRepository.class);</span></span>
<span class="line"><span>    boolean stateless = isStateless();</span></span>
<span class="line"><span>    // 如果没有SecurityContextRepository实例，则创建</span></span>
<span class="line"><span>    if (securityContextRepository == null) {</span></span>
<span class="line"><span>      // 如果是stateless，就啥都不干</span></span>
<span class="line"><span>      if (stateless) {</span></span>
<span class="line"><span>        http.setSharedObject(SecurityContextRepository.class, new RequestAttributeSecurityContextRepository());</span></span>
<span class="line"><span>        this.sessionManagementSecurityContextRepository = new NullSecurityContextRepository();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      else {</span></span>
<span class="line"><span>        HttpSessionSecurityContextRepository httpSecurityRepository = new HttpSessionSecurityContextRepository();</span></span>
<span class="line"><span>        httpSecurityRepository.setDisableUrlRewriting(!this.enableSessionUrlRewriting);</span></span>
<span class="line"><span>        httpSecurityRepository.setAllowSessionCreation(isAllowSessionCreation());</span></span>
<span class="line"><span>        AuthenticationTrustResolver trustResolver = http.getSharedObject(AuthenticationTrustResolver.class);</span></span>
<span class="line"><span>        if (trustResolver != null) {</span></span>
<span class="line"><span>          httpSecurityRepository.setTrustResolver(trustResolver);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        this.sessionManagementSecurityContextRepository = httpSecurityRepository;</span></span>
<span class="line"><span>        DelegatingSecurityContextRepository defaultRepository = new DelegatingSecurityContextRepository(</span></span>
<span class="line"><span>            httpSecurityRepository, new RequestAttributeSecurityContextRepository());</span></span>
<span class="line"><span>        http.setSharedObject(SecurityContextRepository.class, defaultRepository);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      this.sessionManagementSecurityContextRepository = securityContextRepository;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    RequestCache requestCache = http.getSharedObject(RequestCache.class);</span></span>
<span class="line"><span>    if (requestCache == null) {</span></span>
<span class="line"><span>      if (stateless) {</span></span>
<span class="line"><span>        http.setSharedObject(RequestCache.class, new NullRequestCache());</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 获取sessionAuthenticationStrategy</span></span>
<span class="line"><span>    http.setSharedObject(SessionAuthenticationStrategy.class, getSessionAuthenticationStrategy(http));</span></span>
<span class="line"><span>    http.setSharedObject(InvalidSessionStrategy.class, getInvalidSessionStrategy());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br></div></div><p>这里简单介绍一下HttpSession的创建时机吧，在Spring Security中，一共有四种</p><ul><li>ALWAYS: 如果HttpSession不存在，则创建</li><li>NEVER: 从不创建HttpSession，但是如果HttpSession已经存在了，则会使用它</li><li>IF_REQUIRED: 当有需要时，会创建HttpSession，默认是这个</li><li>STATELESS: 从不创建HttpSession，也不使用HttpSession。这适合无状态认证方式</li></ul><p>再看configure方法。代码如下所示:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class SessionManagementConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;SessionManagementConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void configure(H http) {</span></span>
<span class="line"><span>    // 构建SessionManagementFilter</span></span>
<span class="line"><span>    SessionManagementFilter sessionManagementFilter = createSessionManagementFilter(http);</span></span>
<span class="line"><span>    if (sessionManagementFilter != null) {</span></span>
<span class="line"><span>      http.addFilter(sessionManagementFilter);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果配置了maximumSessions，则构建ConcurrentSessionFilter</span></span>
<span class="line"><span>    if (isConcurrentSessionControlEnabled()) {</span></span>
<span class="line"><span>      ConcurrentSessionFilter concurrentSessionFilter = createConcurrencyFilter(http);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      concurrentSessionFilter = postProcess(concurrentSessionFilter);</span></span>
<span class="line"><span>      http.addFilter(concurrentSessionFilter);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果不允许enableSessionUrlRewriting，则构建DisableEncodeUrlFilter</span></span>
<span class="line"><span>    if (!this.enableSessionUrlRewriting) {</span></span>
<span class="line"><span>      http.addFilter(new DisableEncodeUrlFilter());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果sessionPolicy是SessionCreationPolicy.ALWAYS，则构建ForceEagerSessionCreationFilter</span></span>
<span class="line"><span>    if (this.sessionPolicy == SessionCreationPolicy.ALWAYS) {</span></span>
<span class="line"><span>      http.addFilter(new ForceEagerSessionCreationFilter());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>接下来一步一步将会话并发管理控制。</p><h3 id="sessionauthenticationstrategy" tabindex="-1">SessionAuthenticationStrategy <a class="header-anchor" href="#sessionauthenticationstrategy" aria-label="Permalink to &quot;SessionAuthenticationStrategy&quot;">​</a></h3><p>首先要做会话管理，肯定是记录每个登录用户的会话信息的，在Spring Security中，这个会话信息的类是SessionInformation。具体如下所示:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SessionInformation implements Serializable {</span></span>
<span class="line"><span>  // 最近一次请求的时间</span></span>
<span class="line"><span>  private Date lastRequest;</span></span>
<span class="line"><span>  // 用户信息</span></span>
<span class="line"><span>  private final Object principal;</span></span>
<span class="line"><span>  // 会话ID</span></span>
<span class="line"><span>  private final String sessionId;</span></span>
<span class="line"><span>  // 是否过期</span></span>
<span class="line"><span>  private boolean expired = false;</span></span>
<span class="line"><span>  public void refreshLastRequest() {</span></span>
<span class="line"><span>    this.lastRequest = new Date();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  ...</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><h3 id="sessionregistry" tabindex="-1">SessionRegistry <a class="header-anchor" href="#sessionregistry" aria-label="Permalink to &quot;SessionRegistry&quot;">​</a></h3><p>SessionRegistry是一个接口，用来维护SessionInformation实例，该接口只有一个实现类SessionRegistryImpl，所以我们直接看SessionRegistryImpl。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SessionRegistryImpl implements SessionRegistry, ApplicationListener&lt;AbstractSessionEvent&gt; {</span></span>
<span class="line"><span>  // &lt;principal:Object,SessionIdSet&gt;</span></span>
<span class="line"><span>  private final ConcurrentMap&lt;Object, Set&lt;String&gt;&gt; principals;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // &lt;sessionId:Object,SessionInformation&gt;</span></span>
<span class="line"><span>  private final Map&lt;String, SessionInformation&gt; sessionIds;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void registerNewSession(String sessionId, Object principal) {</span></span>
<span class="line"><span>    if (getSessionInformation(sessionId) != null) {</span></span>
<span class="line"><span>      removeSessionInformation(sessionId);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.sessionIds.put(sessionId, new SessionInformation(principal, sessionId, new Date()));</span></span>
<span class="line"><span>    this.principals.compute(principal, (key, sessionsUsedByPrincipal) -&gt; {</span></span>
<span class="line"><span>      if (sessionsUsedByPrincipal == null) {</span></span>
<span class="line"><span>        sessionsUsedByPrincipal = new CopyOnWriteArraySet&lt;&gt;();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      sessionsUsedByPrincipal.add(sessionId);</span></span>
<span class="line"><span>      this.logger.trace(LogMessage.format(&quot;Sessions used by &#39;%s&#39; : %s&quot;, principal, sessionsUsedByPrincipal));</span></span>
<span class="line"><span>      return sessionsUsedByPrincipal;</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void removeSessionInformation(String sessionId) {</span></span>
<span class="line"><span>    SessionInformation info = getSessionInformation(sessionId);</span></span>
<span class="line"><span>    if (info == null) {</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.sessionIds.remove(sessionId);</span></span>
<span class="line"><span>    this.principals.computeIfPresent(info.getPrincipal(), (key, sessionsUsedByPrincipal) -&gt; {</span></span>
<span class="line"><span>      sessionsUsedByPrincipal.remove(sessionId);</span></span>
<span class="line"><span>      if (sessionsUsedByPrincipal.isEmpty()) {</span></span>
<span class="line"><span>        // No need to keep object in principals Map anymore</span></span>
<span class="line"><span>        this.logger.debug(LogMessage.format(&quot;Removing principal %s from registry&quot;, info.getPrincipal()));</span></span>
<span class="line"><span>        sessionsUsedByPrincipal = null;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      return sessionsUsedByPrincipal;</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br></div></div><p>这个类主要定义了两个属性，介绍一下用处</p><ul><li>principals: 保存当前用户与SessionId之间的关系，也就是当前用户的会话id</li><li>sessionIds: 保存SessionId与SessionInformation之间的关系</li></ul><p>当用户登录成功后，会执行会话保存操作，传入当前请求的SessionId和当前登录主体的principal对象，如果SessionId已经存在，则先移除后，在保存新的。</p><h3 id="sessionauthenticationstrategy-1" tabindex="-1">SessionAuthenticationStrategy <a class="header-anchor" href="#sessionauthenticationstrategy-1" aria-label="Permalink to &quot;SessionAuthenticationStrategy&quot;">​</a></h3><p>SessionAuthenticationStrategy是一个接口，当用户登录成功后，会调用这个接口的onAuthentication方法。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface SessionAuthenticationStrategy {</span></span>
<span class="line"><span>	void onAuthentication(Authentication authentication, HttpServletRequest request, HttpServletResponse response)</span></span>
<span class="line"><span>			throws SessionAuthenticationException;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p><img src="`+o+`" alt="SessionAuthenticationStrategy"></p><p>实现类有好多，介绍几个用的比较多的：</p><ul><li>CsrfAuthenticationStrategy： 与CSRF有关，负责在身份验证成功后删除旧的CsrfToken并生成一个新的CsrfToken</li><li>ConcurrentSessionControlAuthenticationStrategy: 用来处理HttpSession并发问题</li><li>RegisterSessionAuthenticationStrategy: 认证成功后将HttpSession信息保存在SessionRegistry中</li><li>CompositeSessionAuthenticationStrategy: 复合策略，保存了很多其他的SessionAuthenticationStrategy，默认可以说就是这个。</li></ul><p>我们直接看ConcurrentSessionControlAuthenticationStrategy的代码，具体代码如下所示</p><div class="language-ConcurrentSessionControlAuthenticationStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ConcurrentSessionControlAuthenticationStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ConcurrentSessionControlAuthenticationStrategy</span></span>
<span class="line"><span>		implements MessageSourceAware, SessionAuthenticationStrategy {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void onAuthentication(Authentication authentication, HttpServletRequest request,</span></span>
<span class="line"><span>      HttpServletResponse response) {</span></span>
<span class="line"><span>    // 获取当前项目允许的最大session数</span></span>
<span class="line"><span>    int allowedSessions = getMaximumSessionsForThisUser(authentication);</span></span>
<span class="line"><span>    // 如果是-1，说明没有限制</span></span>
<span class="line"><span>    if (allowedSessions == -1) {</span></span>
<span class="line"><span>      // We permit unlimited logins</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 获取当前所有的SessionInformation</span></span>
<span class="line"><span>    List&lt;SessionInformation&gt; sessions = this.sessionRegistry.getAllSessions(authentication.getPrincipal(), false);</span></span>
<span class="line"><span>    int sessionCount = sessions.size();</span></span>
<span class="line"><span>    // 如果没达到允许的session数上限，直接返回</span></span>
<span class="line"><span>    if (sessionCount &lt; allowedSessions) {</span></span>
<span class="line"><span>      // They haven&#39;t got too many login sessions running at present</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果相等</span></span>
<span class="line"><span>    if (sessionCount == allowedSessions) {</span></span>
<span class="line"><span>      // 当前的session在已有的session会话中，直接返回</span></span>
<span class="line"><span>      HttpSession session = request.getSession(false);</span></span>
<span class="line"><span>      if (session != null) {</span></span>
<span class="line"><span>        // Only permit it though if this request is associated with one of the</span></span>
<span class="line"><span>        // already registered sessions</span></span>
<span class="line"><span>        for (SessionInformation si : sessions) {</span></span>
<span class="line"><span>          if (si.getSessionId().equals(session.getId())) {</span></span>
<span class="line"><span>            return;</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // If the session is null, a new one will be created by the parent class,</span></span>
<span class="line"><span>      // exceeding the allowed number</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 是否运行后来者占用前面用户的花花</span></span>
<span class="line"><span>    allowableSessionsExceeded(sessions, allowedSessions, this.sessionRegistry);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  protected void allowableSessionsExceeded(List&lt;SessionInformation&gt; sessions, int allowableSessions,</span></span>
<span class="line"><span>      SessionRegistry registry) throws SessionAuthenticationException {</span></span>
<span class="line"><span>    if (this.exceptionIfMaximumExceeded || (sessions == null)) {</span></span>
<span class="line"><span>      throw new SessionAuthenticationException(</span></span>
<span class="line"><span>          this.messages.getMessage(&quot;ConcurrentSessionControlAuthenticationStrategy.exceededAllowed&quot;,</span></span>
<span class="line"><span>              new Object[] { allowableSessions }, &quot;Maximum sessions of {0} for this principal exceeded&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // Determine least recently used sessions, and mark them for invalidation</span></span>
<span class="line"><span>    // 根据上次请求时间进行排序，计算出需要过期的session，调用其的过期方法</span></span>
<span class="line"><span>    sessions.sort(Comparator.comparing(SessionInformation::getLastRequest));</span></span>
<span class="line"><span>    int maximumSessionsExceededBy = sessions.size() - allowableSessions + 1;</span></span>
<span class="line"><span>    List&lt;SessionInformation&gt; sessionsToBeExpired = sessions.subList(0, maximumSessionsExceededBy);</span></span>
<span class="line"><span>    for (SessionInformation session : sessionsToBeExpired) {</span></span>
<span class="line"><span>      session.expireNow();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br></div></div><p>RegisterSessionAuthenticationStrategy的代码如下所示。</p><div class="language-RegisterSessionAuthenticationStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">RegisterSessionAuthenticationStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class RegisterSessionAuthenticationStrategy implements SessionAuthenticationStrategy {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private final SessionRegistry sessionRegistry;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void onAuthentication(Authentication authentication, HttpServletRequest request,</span></span>
<span class="line"><span>      HttpServletResponse response) {</span></span>
<span class="line"><span>    this.sessionRegistry.registerNewSession(request.getSession().getId(), authentication.getPrincipal());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>可以看到很简单，直接往sessionRegistry注册一个新的session。</p><p>CompositeSessionAuthenticationStrategy的代码如下所示。</p><div class="language-CompositeSessionAuthenticationStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CompositeSessionAuthenticationStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class CompositeSessionAuthenticationStrategy implements SessionAuthenticationStrategy {</span></span>
<span class="line"><span>  private final List&lt;SessionAuthenticationStrategy&gt; delegateStrategies;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void onAuthentication(Authentication authentication, HttpServletRequest request,</span></span>
<span class="line"><span>      HttpServletResponse response) throws SessionAuthenticationException {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    for (SessionAuthenticationStrategy delegate : this.delegateStrategies) {</span></span>
<span class="line"><span>      ...</span></span>
<span class="line"><span>      delegate.onAuthentication(authentication, request, response);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>可以看到，直接遍历它维护的SessionAuthenticationStrategy的onAuthentication方法。</p><p>我们回到AbstractAuthenticationProcessingFilter认证成功的地方，可以看到在认证成功后会调用所属的SessionAuthenticationStrategy的onAuthentication方法。</p><div class="language-AbstractAuthenticationProcessingFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractAuthenticationProcessingFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractAuthenticationProcessingFilter extends GenericFilterBean</span></span>
<span class="line"><span>		implements ApplicationEventPublisherAware, MessageSourceAware {</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>  private SessionAuthenticationStrategy sessionStrategy = new NullAuthenticatedSessionStrategy();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>			throws IOException, ServletException {</span></span>
<span class="line"><span>    Authentication authenticationResult = attemptAuthentication(request, response);</span></span>
<span class="line"><span>    if (authenticationResult == null) {</span></span>
<span class="line"><span>      // return immediately as subclass has indicated that it hasn&#39;t completed</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.sessionStrategy.onAuthentication(authenticationResult, request, response);</span></span>
<span class="line"><span>    // Authentication success</span></span>
<span class="line"><span>    if (this.continueChainBeforeSuccessfulAuthentication) {</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    successfulAuthentication(request, response, chain, authenticationResult);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>sessionStrategy默认是个NullAuthenticatedSessionStrategy什么都不干，我们看看是在哪里赋值的。如果看了表单认证那个章节，就大概可以猜出是在AbstractAuthenticationFilterConfigurer里面配置的。</p><div class="language-AbstractAuthenticationFilterConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractAuthenticationFilterConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractAuthenticationFilterConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;, T extends AbstractAuthenticationFilterConfigurer&lt;B, T, F&gt;, F extends AbstractAuthenticationProcessingFilter&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;T, B&gt; {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void configure(B http) throws Exception {</span></span>
<span class="line"><span>    SessionAuthenticationStrategy sessionAuthenticationStrategy = http</span></span>
<span class="line"><span>      .getSharedObject(SessionAuthenticationStrategy.class);</span></span>
<span class="line"><span>    if (sessionAuthenticationStrategy != null) {</span></span>
<span class="line"><span>      this.authFilter.setSessionAuthenticationStrategy(sessionAuthenticationStrategy);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>SessionAuthenticationStrategy.class是在哪里呢，由于本节是session会话管理，直接看SessionManagementConfigurer。</p><div class="language-SessionManagementConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SessionManagementConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class SessionManagementConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;SessionManagementConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void init(H http) {</span></span>
<span class="line"><span>    http.setSharedObject(SessionAuthenticationStrategy.class, getSessionAuthenticationStrategy(http));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private SessionAuthenticationStrategy getSessionAuthenticationStrategy(H http) {</span></span>
<span class="line"><span>    if (this.sessionAuthenticationStrategy != null) {</span></span>
<span class="line"><span>      return this.sessionAuthenticationStrategy;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    List&lt;SessionAuthenticationStrategy&gt; delegateStrategies = this.sessionAuthenticationStrategies;</span></span>
<span class="line"><span>    SessionAuthenticationStrategy defaultSessionAuthenticationStrategy;</span></span>
<span class="line"><span>    if (this.providedSessionAuthenticationStrategy == null) {</span></span>
<span class="line"><span>      // If the user did not provide a SessionAuthenticationStrategy</span></span>
<span class="line"><span>      // then default to sessionFixationAuthenticationStrategy</span></span>
<span class="line"><span>      defaultSessionAuthenticationStrategy = postProcess(this.sessionFixationAuthenticationStrategy);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      defaultSessionAuthenticationStrategy = this.providedSessionAuthenticationStrategy;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 如果开启会话并发控制</span></span>
<span class="line"><span>    if (isConcurrentSessionControlEnabled()) {</span></span>
<span class="line"><span>      SessionRegistry sessionRegistry = getSessionRegistry(http);</span></span>
<span class="line"><span>      // ConcurrentSessionControlAuthenticationStrategy</span></span>
<span class="line"><span>      ConcurrentSessionControlAuthenticationStrategy concurrentSessionControlStrategy = new ConcurrentSessionControlAuthenticationStrategy(</span></span>
<span class="line"><span>          sessionRegistry);</span></span>
<span class="line"><span>      concurrentSessionControlStrategy.setMaximumSessions(this.maximumSessions);</span></span>
<span class="line"><span>      concurrentSessionControlStrategy.setExceptionIfMaximumExceeded(this.maxSessionsPreventsLogin);</span></span>
<span class="line"><span>      concurrentSessionControlStrategy = postProcess(concurrentSessionControlStrategy);</span></span>
<span class="line"><span>      // RegisterSessionAuthenticationStrategy</span></span>
<span class="line"><span>      RegisterSessionAuthenticationStrategy registerSessionStrategy = new RegisterSessionAuthenticationStrategy(</span></span>
<span class="line"><span>          sessionRegistry);</span></span>
<span class="line"><span>      registerSessionStrategy = postProcess(registerSessionStrategy);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>      delegateStrategies.addAll(Arrays.asList(concurrentSessionControlStrategy,</span></span>
<span class="line"><span>          defaultSessionAuthenticationStrategy, registerSessionStrategy));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      delegateStrategies.add(defaultSessionAuthenticationStrategy);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // CompositeSessionAuthenticationStrategy</span></span>
<span class="line"><span>    this.sessionAuthenticationStrategy = postProcess(</span></span>
<span class="line"><span>        new CompositeSessionAuthenticationStrategy(delegateStrategies));</span></span>
<span class="line"><span>    return this.sessionAuthenticationStrategy;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br></div></div><h3 id="sessionmanagementfilter" tabindex="-1">SessionManagementFilter <a class="header-anchor" href="#sessionmanagementfilter" aria-label="Permalink to &quot;SessionManagementFilter&quot;">​</a></h3><p>和会话并发管理相关的过滤器有两个，sessionManagementFilter和ConcurrentSessionFilter。我们分别看一下吧。</p><div class="language-sessionManagementFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">sessionManagementFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class SessionManagementFilter extends GenericFilterBean {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>      throws IOException, ServletException {</span></span>
<span class="line"><span>    // 如果已经配置了FILTER_APPLIED，直接跳过，第二次进来过滤器</span></span>
<span class="line"><span>    if (request.getAttribute(FILTER_APPLIED) != null) {</span></span>
<span class="line"><span>      chain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    request.setAttribute(FILTER_APPLIED, Boolean.TRUE);</span></span>
<span class="line"><span>    // 如果securityContextRepository获取不到这个request的会话，有可能不是通过正常认证流程认证的</span></span>
<span class="line"><span>    if (!this.securityContextRepository.containsContext(request)) {</span></span>
<span class="line"><span>      // 获取authentication</span></span>
<span class="line"><span>      Authentication authentication = this.securityContextHolderStrategy.getContext().getAuthentication();</span></span>
<span class="line"><span>      if (this.trustResolver.isAuthenticated(authentication)) {</span></span>
<span class="line"><span>        // The user has been authenticated during the current request, so call the</span></span>
<span class="line"><span>        // session strategy</span></span>
<span class="line"><span>        // 调用sessionAuthenticationStrategy的认证方法</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>          this.sessionAuthenticationStrategy.onAuthentication(authentication, request, response);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        catch (SessionAuthenticationException ex) {</span></span>
<span class="line"><span>          // The session strategy can reject the authentication</span></span>
<span class="line"><span>          this.logger.debug(&quot;SessionAuthenticationStrategy rejected the authentication object&quot;, ex);</span></span>
<span class="line"><span>          this.securityContextHolderStrategy.clearContext();</span></span>
<span class="line"><span>          this.failureHandler.onAuthenticationFailure(request, response, ex);</span></span>
<span class="line"><span>          return;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // Eagerly save the security context to make it available for any possible</span></span>
<span class="line"><span>        // re-entrant requests which may occur before the current request</span></span>
<span class="line"><span>        // completes. SEC-1396.</span></span>
<span class="line"><span>        this.securityContextRepository.saveContext(this.securityContextHolderStrategy.getContext(), request,</span></span>
<span class="line"><span>            response);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 如果是匿名访问，即未通过认证的，直接进行会话失效处理</span></span>
<span class="line"><span>      else {</span></span>
<span class="line"><span>        // No security context or authentication present. Check for a session</span></span>
<span class="line"><span>        // timeout</span></span>
<span class="line"><span>        if (request.getRequestedSessionId() != null &amp;&amp; !request.isRequestedSessionIdValid()) {</span></span>
<span class="line"><span>          if (this.logger.isDebugEnabled()) {</span></span>
<span class="line"><span>            this.logger.debug(LogMessage.format(&quot;Request requested invalid session id %s&quot;,</span></span>
<span class="line"><span>                request.getRequestedSessionId()));</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>          if (this.invalidSessionStrategy != null) {</span></span>
<span class="line"><span>            this.invalidSessionStrategy.onInvalidSessionDetected(request, response);</span></span>
<span class="line"><span>            return;</span></span>
<span class="line"><span>          }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    chain.doFilter(request, response);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br></div></div><p>我们再看看ConcurrentSessionFilter这个过滤器，代码如下所示：</p><div class="language-ConcurrentSessionFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ConcurrentSessionFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class ConcurrentSessionFilter extends GenericFilterBean {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)</span></span>
<span class="line"><span>      throws IOException, ServletException {</span></span>
<span class="line"><span>    HttpSession session = request.getSession(false);</span></span>
<span class="line"><span>    if (session != null) {</span></span>
<span class="line"><span>      SessionInformation info = this.sessionRegistry.getSessionInformation(session.getId());</span></span>
<span class="line"><span>      if (info != null) {</span></span>
<span class="line"><span>        if (info.isExpired()) {</span></span>
<span class="line"><span>          // Expired - abort processing</span></span>
<span class="line"><span>          this.logger.debug(LogMessage</span></span>
<span class="line"><span>            .of(() -&gt; &quot;Requested session ID &quot; + request.getRequestedSessionId() + &quot; has expired.&quot;));</span></span>
<span class="line"><span>          doLogout(request, response);</span></span>
<span class="line"><span>          this.sessionInformationExpiredStrategy</span></span>
<span class="line"><span>            .onExpiredSessionDetected(new SessionInformationExpiredEvent(info, request, response, chain));</span></span>
<span class="line"><span>          return;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // Non-expired - update last request date/time</span></span>
<span class="line"><span>        this.sessionRegistry.refreshLastRequest(info.getSessionId());</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    chain.doFilter(request, response);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br></div></div><p>可以看到，会从sessionRegistry获取会话信息，然后查看当前会话是否已经过期，如果已经过期了，则调用doLogout登出，并且调用会话过期方法。否则刷新最后一次访问时间。</p><h2 id="会话固定攻击" tabindex="-1">会话固定攻击 <a class="header-anchor" href="#会话固定攻击" aria-label="Permalink to &quot;会话固定攻击&quot;">​</a></h2><p>会话固定攻击指的是攻击者通过访问应用程序来创建会话，然后诱导用户以相同的会话ID登录（通常指的是将会话ID放在请求链接中，然后诱导用户去点击），进而获得用户的权限。</p><ul><li>攻击者登录网站，服务端给攻击者分配了一个SessionId</li><li>攻击者利用自己的SessionId构造一个网站链接，并将该链接发给受害者</li><li>受害者用和攻击者相同的SessionId进行登录，这时攻击者的SessionId在服务端就存储受害者的信息了</li><li>攻击者利用SessionId获取受害者的信息，冒充受害者操作</li></ul><p>在这个过程中，如果网站支持URL重写，那么攻击会更简单。用户如果在浏览器中禁用了cookie，那么sessionid也就用不了，有的服务器就支持把sessionid放到请求地址中，类似下面</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>http://www.javaboy.org;jsessionid=xxxx</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>攻击者构造一个这样的地址很简单</p><p>Spring Security从三方面防范会话固定攻击：</p><ul><li>Spring Security自带Http防火墙，如果sessionid放在地址栏中，这个请求会被拦截</li><li>在Http相应的Set-Cookie字段中设置httpOnly，避免通过XSS攻击获取Cookie中的会话信息</li><li>既然会话固定攻击是由于SessionId不变导致的，所以可以在用户登录成功后，改变SessionId就可以了。</li></ul><p>关于第三种方案，Spring Security支持一种会话策略，名字叫做ChangeSessionIdAuthenticationStrategy, 配置起来也很简单。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(Customizer.withDefaults());</span></span>
<span class="line"><span>    http.sessionManagement(sessionManagement -&gt; sessionManagement.maximumSessions(1).maxSessionsPreventsLogin(true));</span></span>
<span class="line"><span>    // 下面这行</span></span>
<span class="line"><span>    http.sessionManagement(sessionManagement -&gt; sessionManagement.sessionFixation().changeSessionId());</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>sessionFixation有几种策略，不同的策略对应不同的SessionAuthenticationStrategy</p><ul><li>changeSessionId： 默认策略，只改变SessionId</li><li>none: 不做任何处理</li><li>migrateSession: 登录成功后，创建一个新的HttpSession对象，并将旧的对象拷贝过来</li><li>newSession: 登录成功后，创建一个新的HttpSession对象，拷贝一些属性</li></ul><p>我们大致看一下ChangeSessionIdAuthenticationStrategy吧，源码实现很简单。</p><div class="language-ChangeSessionIdAuthenticationStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ChangeSessionIdAuthenticationStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class ChangeSessionIdAuthenticationStrategy extends AbstractSessionFixationProtectionStrategy {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	HttpSession applySessionFixation(HttpServletRequest request) {</span></span>
<span class="line"><span>		request.changeSessionId();</span></span>
<span class="line"><span>		return request.getSession();</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>由于ChangeSessionIdAuthenticationStrategy继承了AbstractSessionFixationProtectionStrategy，所以看AbstractSessionFixationProtectionStrategy的onAuthentication。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public abstract class AbstractSessionFixationProtectionStrategy</span></span>
<span class="line"><span>		implements SessionAuthenticationStrategy, ApplicationEventPublisherAware {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void onAuthentication(Authentication authentication, HttpServletRequest request,</span></span>
<span class="line"><span>      HttpServletResponse response) {</span></span>
<span class="line"><span>    boolean hadSessionAlready = request.getSession(false) != null;</span></span>
<span class="line"><span>    if (!hadSessionAlready &amp;&amp; !this.alwaysCreateSession) {</span></span>
<span class="line"><span>      // Session fixation isn&#39;t a problem if there&#39;s no session</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // Create new session if necessary</span></span>
<span class="line"><span>    HttpSession session = request.getSession();</span></span>
<span class="line"><span>    if (hadSessionAlready &amp;&amp; request.isRequestedSessionIdValid()) {</span></span>
<span class="line"><span>      String originalSessionId;</span></span>
<span class="line"><span>      String newSessionId;</span></span>
<span class="line"><span>      Object mutex = WebUtils.getSessionMutex(session);</span></span>
<span class="line"><span>      synchronized (mutex) {</span></span>
<span class="line"><span>        // We need to migrate to a new session</span></span>
<span class="line"><span>        originalSessionId = session.getId();</span></span>
<span class="line"><span>        // 此处调用ChangeSessionIdAuthenticationStrategy方法</span></span>
<span class="line"><span>        session = applySessionFixation(request);</span></span>
<span class="line"><span>        newSessionId = session.getId();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      onSessionChange(originalSessionId, session, authentication);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><p>具体代码点击<a href="https://github.com/shengduiliang/spring-security-demo/tree/main/spring-security-session" target="_blank" rel="noreferrer">此处</a></p><h2 id="session共享方案" tabindex="-1">Session共享方案 <a class="header-anchor" href="#session共享方案" aria-label="Permalink to &quot;Session共享方案&quot;">​</a></h2><p>目前的会话管理是单机上的会话管理，如果当前是集群环境，那么储存在单机上的管理方案就会失效，因为目前的会话信息都是保存在单个JVM进程里面的。</p><p>有三种解决方案：</p><ul><li>Session复制：多个服务之间互相复制session信息，这样每个服务都有一份了，tomcat的IP组播方案支持这种方式，但是很耗费资源</li><li>Session粘滞：通过一致性hash算法，每次打到一台机子上，但是无法解决集群中的会话并发管理问题</li><li>Session共享：直接把session信息存储到三方数据库里面，然后用到了从第三方数据库里面查。</li></ul><p>推荐第三种，目前用的比较多的就是spring-session，下面做一个案例</p><img src="`+u+`" width="500" alt="session-share"><p>新建一个Spring Boot项目，添加以下依赖，包括redis，spring session，web，spring security</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>  &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;</span></span>
<span class="line"><span>  &lt;artifactId&gt;spring-boot-starter-data-redis&lt;/artifactId&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span>
<span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>  &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;</span></span>
<span class="line"><span>  &lt;artifactId&gt;spring-boot-starter-security&lt;/artifactId&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span>
<span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>  &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;</span></span>
<span class="line"><span>  &lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span>
<span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>  &lt;groupId&gt;org.springframework.session&lt;/groupId&gt;</span></span>
<span class="line"><span>  &lt;artifactId&gt;spring-session-data-redis&lt;/artifactId&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>修改application.yml, 添加redis的配置：</p><div class="language-application.yml vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">application.yml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spring:</span></span>
<span class="line"><span>  application:</span></span>
<span class="line"><span>    name: spring-security-redis-session</span></span>
<span class="line"><span>  security:</span></span>
<span class="line"><span>    user:</span></span>
<span class="line"><span>      name: user</span></span>
<span class="line"><span>      password: password</span></span>
<span class="line"><span>  data:</span></span>
<span class="line"><span>    redis:</span></span>
<span class="line"><span>      host: 127.0.0.1</span></span>
<span class="line"><span>      port: 6379</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br></div></div><p>新增一个SecurityConfig，代码如下：</p><div class="language-DefaultSecurityConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>@EnableRedisIndexedHttpSession</span></span>
<span class="line"><span>public class DefaultSecurityConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Resource</span></span>
<span class="line"><span>  private FindByIndexNameSessionRepository sessionRepository;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(Customizer.withDefaults());</span></span>
<span class="line"><span>    http.sessionManagement(</span></span>
<span class="line"><span>            sessionManagement -&gt; sessionManagement.maximumSessions(1).sessionRegistry(sessionRegistry())</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public SessionRegistry sessionRegistry() {</span></span>
<span class="line"><span>    return new SpringSessionBackedSessionRegistry&lt;&gt;(sessionRepository);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br></div></div><p>然后复制一个UserController，代码如下:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@RestController</span></span>
<span class="line"><span>public class UserController {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @GetMapping(&quot;/user&quot;)</span></span>
<span class="line"><span>  public UsernamePasswordAuthenticationToken userInfo() {</span></span>
<span class="line"><span>    return (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>启动项目，访问/user接口，跳转登录页面，登录成功后，访问/user正常。这时我们直接看redis数据库，会发现多了一些KEY，类似下面的，则运行成功。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spring:session:expirations:1735938180000</span></span>
<span class="line"><span>spring:session:index:org.springframework.session.FindByIndexNameSessionRepository.PRINCIPAL_NAME_INDEX_NAME:user</span></span>
<span class="line"><span>spring:session:sessions:08cd7505-a8de-4473-9623-0c2ef7fe7a3b</span></span>
<span class="line"><span>spring:session:sessions:expires:08cd7505-a8de-4473-9623-0c2ef7fe7a3b</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>具体代码，点击<a href="https://github.com/shengduiliang/spring-security-demo/tree/main/spring-security-redis-session" target="_blank" rel="noreferrer">此处</a></p>`,201)]))}const v=n(b,[["render",m]]);export{x as __pageData,v as default};
