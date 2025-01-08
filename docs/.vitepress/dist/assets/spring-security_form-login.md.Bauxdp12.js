import{_ as n}from"./chunks/spring-boot-autoconfig.aJnSyLZV.js";import{_ as a,c as t,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const i="/assets/FormLoginConfigurer.C2rrfT1X.png",l="/assets/AbstractAuthenticationFilterConfigurer.D-kQuRP5.png",r="/assets/AbstractHttpConfigurer.BoqgwdzC.png",o="/assets/custom-form-login.CPPFwimR.png",c="/assets/success-handler.rsiuUX1Q.png",q=JSON.parse('{"title":"Spring Security表单登录","description":"","frontmatter":{},"headers":[],"relativePath":"spring-security/form-login.md","filePath":"spring-security/form-login.md"}'),u={name:"spring-security/form-login.md"};function g(h,s,d,m,f,b){return e(),t("div",null,s[0]||(s[0]=[p('<h1 id="spring-security表单登录" tabindex="-1">Spring Security表单登录 <a class="header-anchor" href="#spring-security表单登录" aria-label="Permalink to &quot;Spring Security表单登录&quot;">​</a></h1><p>本文主要针对默认的表单登录流程进行简单介绍，并且探究一下可以基于默认的表单登录流程扩展出哪些功能。</p><h2 id="过滤器链初始化" tabindex="-1">过滤器链初始化 <a class="header-anchor" href="#过滤器链初始化" aria-label="Permalink to &quot;过滤器链初始化&quot;">​</a></h2><p>首先我们继续来看spring boot关于spring security的自动配置文件，打开spring boot的配置文件</p><p><img src="'+n+`" alt="spring-boot-autoconfigure"></p><p>在里面搜索security的类，可以看到自动配置了SecurityAutoConfiguration这个类</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration</span></span></code></pre></div><p>点进这个类查看，代码如下所示：</p><div class="language-SecurityAutoConfiguration vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">SecurityAutoConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@AutoConfiguration(before = UserDetailsServiceAutoConfiguration.class)</span></span>
<span class="line"><span>@ConditionalOnClass(DefaultAuthenticationEventPublisher.class)</span></span>
<span class="line"><span>@EnableConfigurationProperties(SecurityProperties.class)</span></span>
<span class="line"><span>@Import({ SpringBootWebSecurityConfiguration.class, SecurityDataConfiguration.class })</span></span>
<span class="line"><span>public class SecurityAutoConfiguration {</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到导入了SpringBootWebSecurityConfiguration.class, SecurityDataConfiguration.class这两个类，本文主要查看SpringBootWebSecurityConfiguration这个类。可以看到这个类默认定义出来了一个SecurityFilterChain，这个就是一个请求进来需要走的Filter链条</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>@ConditionalOnWebApplication(type = Type.SERVLET)</span></span>
<span class="line"><span>class SpringBootWebSecurityConfiguration {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>	@ConditionalOnDefaultWebSecurity</span></span>
<span class="line"><span>	static class SecurityFilterChainConfiguration {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>		@Bean</span></span>
<span class="line"><span>		@Order(SecurityProperties.BASIC_AUTH_ORDER)</span></span>
<span class="line"><span>		SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>			http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>			http.formLogin(withDefaults());</span></span>
<span class="line"><span>			http.httpBasic(withDefaults());</span></span>
<span class="line"><span>			return http.build();</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这里大概分析一下这个SecurityFilterChain做了什么事情</p><ul><li>http.authorizeHttpRequests: 指定所有通过这个过滤器的请求都要经过认证（authenticated）</li><li>http.formLogin: 启用表单认证组件</li><li>http.httpBasic: 启用httpBasic认证</li></ul><p>由于本文主要讨论表单登录，所以我们详细看http.formLogin做了些什么。</p><h2 id="formlogin功能分析" tabindex="-1">formLogin功能分析 <a class="header-anchor" href="#formlogin功能分析" aria-label="Permalink to &quot;formLogin功能分析&quot;">​</a></h2><p>点击http.formLogin, 具体代码如下所示：</p><div class="language-HttpSecurity vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">HttpSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public HttpSecurity formLogin(Customizer&lt;FormLoginConfigurer&lt;HttpSecurity&gt;&gt; formLoginCustomizer) throws Exception {</span></span>
<span class="line"><span>	formLoginCustomizer.customize(getOrApply(new FormLoginConfigurer&lt;&gt;()));</span></span>
<span class="line"><span>	return HttpSecurity.this;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到往httpSecurity里面引入了FormLoginConfigurer这个配置类，点击进去：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class FormLoginConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt; extends</span></span>
<span class="line"><span>		AbstractAuthenticationFilterConfigurer&lt;H, FormLoginConfigurer&lt;H&gt;, UsernamePasswordAuthenticationFilter&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	/**</span></span>
<span class="line"><span>	 * Creates a new instance</span></span>
<span class="line"><span>	 * @see HttpSecurity#formLogin()</span></span>
<span class="line"><span>	 */</span></span>
<span class="line"><span>	public FormLoginConfigurer() {</span></span>
<span class="line"><span>		super(new UsernamePasswordAuthenticationFilter(), null);</span></span>
<span class="line"><span>		usernameParameter(&quot;username&quot;);</span></span>
<span class="line"><span>		passwordParameter(&quot;password&quot;);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到继承了AbstractAuthenticationFilterConfigurer这个类。我们先看看FormLoginConfigurer提供了哪些方法, 点击Alt + 7，我们只看Public的方法</p><img src="`+i+'" width="500" alt="FormLoginConfigurer"><ul><li>loginPage：指定登录的页面，即上一篇中我们登录的页面，默认 /login.html</li><li>usernameParameter: 指定username的parameter名字，就是前端上传的username对应的key</li><li>passwordParameter: 指定password的parameter名字，就是前端上传的password对应的kty</li><li>failureForwardUrl: 登录失败后跳转的url，服务端跳转</li><li>successForwardUrl: 登录成功后跳转的url，服务端跳转</li></ul><p>然后再看AbstractAuthenticationFilterConfigurer的公开方法</p><img src="'+l+'" width="500" alt="AbstractAuthenticationFilterConfigurer"><ul><li>defaultSuccessUrl: 登录成功后跳转的url，客户端跳转</li><li>loginProcessingUrl: 处理登录请求的url，即向这个url发送登录认证请求</li><li>failureHandler: 登录失败的处理接口</li><li>successHandler: 登录成功的处理接口</li><li>permitAll: 对于登录相关的页面放行，无需认证，不然用户无法提交认证请求</li><li>failureUrl: 登录失败后挑战的url，客户端跳转</li></ul><p>AbstractAuthenticationFilterConfigurer继承了AbstractHttpConfigurer这个抽象类，查看该类的公开方法。</p><img src="'+r+`" width="500" alt="AbstractHttpConfigurer"><ul><li>disable: 关闭相关的认证流程</li></ul><p>综上可以看出，其实Spring Security的表单登录可以修改的地方包括下面几种：</p><ul><li>定义登录的页面，处理登录请求的页面</li><li>定义登录失败的处理</li><li>定义登录成功的处理</li></ul><p>下面让我们基于上一节的那个项目，分别对上面几种进行修改说明。在项目中新建一个DefaultSecurityConfig文件, 自定义一个SecurityFilterChain。代码如下所示</p><div class="language-DefaultSecurityConfig vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(withDefaults());</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>启动项目，正常登录。</p><h2 id="登录页面和登录请求url" tabindex="-1">登录页面和登录请求URL <a class="header-anchor" href="#登录页面和登录请求url" aria-label="Permalink to &quot;登录页面和登录请求URL&quot;">​</a></h2><p>在resources/static目录下面新建一个login.html文件，输入以下代码：</p><div class="language-myLogin.html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">myLogin.html</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;!DOCTYPE html&gt;</span></span>
<span class="line"><span>&lt;html lang=&quot;en&quot;&gt;</span></span>
<span class="line"><span>&lt;head&gt;</span></span>
<span class="line"><span>    &lt;meta charset=&quot;UTF-8&quot;&gt;</span></span>
<span class="line"><span>    &lt;title&gt;登录页面&lt;/title&gt;</span></span>
<span class="line"><span>&lt;/head&gt;</span></span>
<span class="line"><span>&lt;body&gt;</span></span>
<span class="line"><span>&lt;form action=&quot;/doLogin&quot; method=&quot;post&quot;&gt;</span></span>
<span class="line"><span>    用户名：&lt;input type=&quot;text&quot; name=&quot;username&quot;/&gt;&lt;br&gt;</span></span>
<span class="line"><span>    密码： &lt;input type=&quot;password&quot; name=&quot;password&quot;/&gt;&lt;br&gt;</span></span>
<span class="line"><span>    &lt;input type=&quot;submit&quot; value=&quot;登录&quot;/&gt;</span></span>
<span class="line"><span>&lt;/form&gt;</span></span>
<span class="line"><span>&lt;/body&gt;</span></span>
<span class="line"><span>&lt;/html&gt;</span></span></code></pre></div><p>注意上面提交认证请求的URL是/doLogin，修改DefaultSecurityConfig的代码，如下所示</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class DefaultSecurityConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.formLogin(</span></span>
<span class="line"><span>            formLogin -&gt; formLogin.loginPage(&quot;/login.html&quot;)</span></span>
<span class="line"><span>                    .loginProcessingUrl(&quot;/doLogin&quot;)</span></span>
<span class="line"><span>                    .permitAll()</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>    http.csrf(AbstractHttpConfigurer::disable);</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>注意，需要把csrf校验关闭，不然登录认证请求提交会无效，还会跳转登录页面。具体原因在CSRF源码章节讲解。</p><p>启动项目，用浏览器打开/hello路径，会跳转登录页面。</p><img src="`+o+`" width="500" alt="custom-form-login"><h2 id="请求成功与请求失败回调" tabindex="-1">请求成功与请求失败回调 <a class="header-anchor" href="#请求成功与请求失败回调" aria-label="Permalink to &quot;请求成功与请求失败回调&quot;">​</a></h2><p>当登录认证成功后，会根据以下配置执行认证成功流程</p><ul><li>successHandler: 登录成功的处理接口</li><li>successForwardUrl: 登录成功后跳转的url，服务端跳转</li><li>defaultSuccessUrl: 登录成功后跳转的url，客户端跳转</li></ul><p>优先级顺序：successHandler &gt; successForwardUrl &gt; defaultSuccessUrl</p><p>当登录认证失败后，会根据以下配置执行认证失败流程</p><ul><li>failureHandler: 登录失败的处理接口</li><li>failureForwardUrl: 登录失败后跳转的url，服务端跳转</li></ul><p>优先级顺序: failureHandler &gt; failureForwardUrl</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>为什么没有defaultfailureUrl呢，按我的理解是，设置defaultSuccessUrl 是因为它有一个特殊的逻辑分支：当用户之前访问了需要认证的资源时，会优先重定向到那个资源，但是登录失败不用。</p></div><p>由于现在前后端分离的项目比较多，所以本节内容以successHandler作为示例。</p><p>在DefaultSecurityConfig同级目录下，新建一个文件，名字为CustomerHandler，代码如下所示：</p><div class="language-CustomerHandler vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">CustomerHandler</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class CustomerHandler {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	// 登录成功流程</span></span>
<span class="line"><span>	public static void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {</span></span>
<span class="line"><span>		HashMap&lt;String, Object&gt; resp = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>		resp.put(&quot;status&quot;, 200);</span></span>
<span class="line"><span>		resp.put(&quot;msg&quot;, &quot;登录成功&quot;);</span></span>
<span class="line"><span>		response.setHeader(HttpHeaders.CONTENT_TYPE, &quot;application/json;charset=UTF-8&quot;);</span></span>
<span class="line"><span>		response.getWriter().write(new ObjectMapper().writeValueAsString(resp));</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	// 登录失败流程</span></span>
<span class="line"><span>	public static void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, Exception exception) throws IOException {</span></span>
<span class="line"><span>		HashMap&lt;String, Object&gt; resp = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>		resp.put(&quot;status&quot;, 401);</span></span>
<span class="line"><span>		resp.put(&quot;msg&quot;, &quot;用户名或者密码错误&quot;);</span></span>
<span class="line"><span>		response.setHeader(HttpHeaders.CONTENT_TYPE, &quot;application/json;charset=UTF-8&quot;);</span></span>
<span class="line"><span>		response.getWriter().write(new ObjectMapper().writeValueAsString(resp));</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>修改DefaultSecurityConfig的配置，内容如下所示：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Bean</span></span>
<span class="line"><span>SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>	http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>	http.formLogin(</span></span>
<span class="line"><span>		formLogin -&gt; formLogin.loginPage(&quot;/login.html&quot;)</span></span>
<span class="line"><span>						.loginProcessingUrl(&quot;/doLogin&quot;)</span></span>
<span class="line"><span>						.permitAll()</span></span>
<span class="line"><span>						.successHandler(CustomerHandler::onAuthenticationSuccess)</span></span>
<span class="line"><span>						.failureHandler(CustomerHandler::onAuthenticationFailure)</span></span>
<span class="line"><span>	);</span></span>
<span class="line"><span>	http.csrf(AbstractHttpConfigurer::disable);</span></span>
<span class="line"><span>	return http.build();</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>重新启动项目，浏览器访问登录页面，输入帐号密码，登录。</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>可以基于successHandler，实现使用JWT等认证流程，后续会讲解JWT继承流程</p></div><img src="`+c+'" width="500" alt="success-handler"><p>相关源码查看点击<a href="https://github.com/shengduiliang/spring-security-demo/tree/main/spring-security-form-login" target="_blank" rel="noreferrer">此处</a></p>',58)]))}const S=a(u,[["render",g]]);export{q as __pageData,S as default};
