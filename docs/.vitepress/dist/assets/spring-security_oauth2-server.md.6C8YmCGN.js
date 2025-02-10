import{_ as s}from"./chunks/Oauth2-server-architecture.CFAPET59.js";import{_ as a,c as e,a0 as p,o as i}from"./chunks/framework.P9qPzDnn.js";const t="/assets/Oauth2-8080-login.BShIo68m.png",r="/assets/Oauth2-9000-login.CavIGp-G.png",l="/assets/Oauth2-8080-index.beMsCFIb.png",o="/assets/Oauth2-8080-index-message.BJcyse8j.png",c="/assets/oauth2-token-url.jc_AKGwG.png",u="/assets/access-token.P-wOYTJe.png",b="/assets/auth-secret.HdXVROeq.png",h="/assets/access_token.D5CDIbTE.png",z=JSON.parse('{"title":"OAuth2服务端认证流程","description":"","frontmatter":{},"headers":[],"relativePath":"spring-security/oauth2-server.md","filePath":"spring-security/oauth2-server.md"}'),d={name:"spring-security/oauth2-server.md"};function m(g,n,v,A,C,k){return i(),e("div",null,n[0]||(n[0]=[p(`<h1 id="oauth2服务端认证流程" tabindex="-1">OAuth2服务端认证流程 <a class="header-anchor" href="#oauth2服务端认证流程" aria-label="Permalink to &quot;OAuth2服务端认证流程&quot;">​</a></h1><p>上一节课演示了OAuth2客户端的认证流程，在大部分场景下，我们接触到的OAuth2都是开发客户端，比较接入QQ登录，Github登录，微信登录等。</p><p>这节课我们就基于Spring Authorization Server来搭建一个授权服务器与资源服务器。</p><h2 id="项目环境搭建" tabindex="-1">项目环境搭建 <a class="header-anchor" href="#项目环境搭建" aria-label="Permalink to &quot;项目环境搭建&quot;">​</a></h2><p>由于集成Spring Authorization Server这个项目太复杂了，所以这里就不一步一步新建项目，基于spring-authorization-server官网的Demo来，由于官网的demo是基于gradle的，所以这个就提供一个基于maven的<a href="https://github.com/WatermelonPlanet/spring-authorization-server-master" target="_blank" rel="noreferrer">开源项目</a>, 当然这个项目提供的资料已经很全面了，这篇文章说明一下spring-authorization-server的工作流程。</p><p>里面包含了三个项目，具体如下所示：</p><ul><li>demo-authorizationserver: 认证服务器，使用9000端口</li><li>demo-client: 客户端服务器. 就是上一节介绍的客户端，使用8080端口</li><li>messages-resource: 资源服务客户端想要访问的资源, 使用8090端口</li></ul><p>接下来我们改造一下这个项目，使它可以正常运行，主要修改三个项目的application.yml文件, 修改其中的192.168.56.1 IP地址为本机的IP地址。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>shengduiliang@liangchengduideMac-mini ~ % ifconfig | grep 192</span></span>
<span class="line"><span>	inet 192.168.1.30 netmask 0xffffff00 broadcast 192.168.1.255</span></span>
<span class="line"><span>	inet 192.168.233.1 netmask 0xffffff00 broadcast 192.168.233.255</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>如上面代码所示，修改为192.168.1.30，然后先启动demo-authorizationserver，正常运行后，再启动demo-client跟messages-resource这两个项目。</p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>不能将IP地址修改为127.0.0.1, 会造成Session冲突，授权服务器认证成功后，客户端获取不到Session信息</p></div><h2 id="项目演示" tabindex="-1">项目演示 <a class="header-anchor" href="#项目演示" aria-label="Permalink to &quot;项目演示&quot;">​</a></h2><p>项目启动成功后，我们访问 <a href="http://127.0.0.1:8080/index" target="_blank" rel="noreferrer">http://127.0.0.1:8080/index</a> 接口，会跳转到 <a href="http://127.0.0.1:8080/login" target="_blank" rel="noreferrer">http://127.0.0.1:8080/login</a> 页面，如下所示。</p><img src="`+t+'" width="300" alt="Oauth2-8080-login"><p>点击上面的 messaging-client-oidc 标签，跳转到 <a href="http://192.168.1.30:9000/login" target="_blank" rel="noreferrer">http://192.168.1.30:9000/login</a>, 即授权服务器的认证页面。</p><img src="'+r+'" width="300" alt="Oauth2-9000-login"><p>项目中默认给我们创建了一个用户，用户名是user1, 密码是password，输入用户名密码之后，点击登录按钮。</p><img src="'+l+'" width="400" alt="Oauth2-8080-index"><p>然后点击Authorze的下拉选项，选中Authorization Code认证，可以发现认证成功，显示了Message信息。</p><img src="'+o+'" width="500" alt="Oauth2-8080-index-message"><h2 id="系统架构图" tabindex="-1">系统架构图 <a class="header-anchor" href="#系统架构图" aria-label="Permalink to &quot;系统架构图&quot;">​</a></h2><p><img src="'+s+`" alt="oauth2-server-architecture"></p><ul><li>资源持有者： 用户</li><li>应用: demo-client</li><li>认证服务器: demo-authorizationserver</li><li>资源服务器: messages-resource</li></ul><p>接下来我们就跟着代码流程结合上面的系统架构图一步一步分析整个源码流程。</p><h2 id="认证服务器初始化流程" tabindex="-1">认证服务器初始化流程 <a class="header-anchor" href="#认证服务器初始化流程" aria-label="Permalink to &quot;认证服务器初始化流程&quot;">​</a></h2><p>这里先讲解一下认证服务器关于authorization-server的初始化流程，可以看到认证服务器跟Security相关的配置类有两个，AuthorizationServerConfig和DefaultSecurityConfig，DefaultSecurityConfig很好理解，就是我们之前Securtiy添加的登录表单这些的流程，我门主要看AuthorizationServerConfig这个配置。</p><h3 id="authorizationserverconfig" tabindex="-1">AuthorizationServerConfig <a class="header-anchor" href="#authorizationserverconfig" aria-label="Permalink to &quot;AuthorizationServerConfig&quot;">​</a></h3><div class="language-AuthorizationServerConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthorizationServerConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class AuthorizationServerConfig {</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  @Order(Ordered.HIGHEST_PRECEDENCE)</span></span>
<span class="line"><span>  public SecurityFilterChain authorizationServerSecurityFilterChain(</span></span>
<span class="line"><span>      HttpSecurity http, RegisteredClientRepository registeredClientRepository,</span></span>
<span class="line"><span>      AuthorizationServerSettings authorizationServerSettings) throws Exception {</span></span>
<span class="line"><span>    // 核心代码是这一行</span></span>
<span class="line"><span>    OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);</span></span>
<span class="line"><span>    ....</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>注意authorizationServerSecurityFilterChain上面加上了@Order(Ordered.HIGHEST_PRECEDENCE)这个注解，之前提到过过滤器也是会排序的，所以会优先走这个过滤器链，如果不满足再走其他的过滤器链。</p><p>我们看一下applyDefaultSecurity这个方法的实现，代码如下所示</p><h3 id="oauth2authorizationserverconfiguration" tabindex="-1">OAuth2AuthorizationServerConfiguration <a class="header-anchor" href="#oauth2authorizationserverconfiguration" aria-label="Permalink to &quot;OAuth2AuthorizationServerConfiguration&quot;">​</a></h3><div class="language-OAuth2AuthorizationServerConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationServerConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class OAuth2AuthorizationServerConfiguration {</span></span>
<span class="line"><span>  public static void applyDefaultSecurity(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    OAuth2AuthorizationServerConfigurer authorizationServerConfigurer =</span></span>
<span class="line"><span>        new OAuth2AuthorizationServerConfigurer();</span></span>
<span class="line"><span>    RequestMatcher endpointsMatcher = authorizationServerConfigurer</span></span>
<span class="line"><span>        .getEndpointsMatcher();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    http</span></span>
<span class="line"><span>      .securityMatcher(endpointsMatcher)</span></span>
<span class="line"><span>      .authorizeHttpRequests(authorize -&gt;</span></span>
<span class="line"><span>        authorize.anyRequest().authenticated()</span></span>
<span class="line"><span>      )</span></span>
<span class="line"><span>      .csrf(csrf -&gt; csrf.ignoringRequestMatchers(endpointsMatcher))</span></span>
<span class="line"><span>      .apply(authorizationServerConfigurer);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>securityMatcher这个方法晚点再看，可以看到就是往HttpSecurity注册了OAuth2AuthorizationServerConfigurer这个自动配置类。</p><h3 id="oauth2authorizationserverconfigurer" tabindex="-1">OAuth2AuthorizationServerConfigurer <a class="header-anchor" href="#oauth2authorizationserverconfigurer" aria-label="Permalink to &quot;OAuth2AuthorizationServerConfigurer&quot;">​</a></h3><p>我们看一下OAuth2AuthorizationServerConfigurer的init方法跟configure方法。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationServerConfigurer</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;OAuth2AuthorizationServerConfigurer, HttpSecurity&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void init(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    // 获取AuthorizationServer的配置，包括各种端点</span></span>
<span class="line"><span>    AuthorizationServerSettings authorizationServerSettings = OAuth2ConfigurerUtils.getAuthorizationServerSettings(httpSecurity);</span></span>
<span class="line"><span>    if (isOidcEnabled()) {</span></span>
<span class="line"><span>      配置OAuth2AuthorizationEndpointConfigurer的sessionRegistry</span></span>
<span class="line"><span>    } else {</span></span>
<span class="line"><span>      配置OAuth2AuthorizationEndpointConfigurer成的AuthorizationCodeRequestAuthenticationValidator</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.configurers.values().forEach(configurer -&gt; {</span></span>
<span class="line"><span>      configurer.init(httpSecurity);</span></span>
<span class="line"><span>      requestMatchers.add(configurer.getRequestMatcher());</span></span>
<span class="line"><span>    });</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void configure(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    this.configurers.values().forEach(configurer -&gt; configurer.configure(httpSecurity));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    AuthorizationServerSettings authorizationServerSettings = OAuth2ConfigurerUtils.getAuthorizationServerSettings(httpSecurity);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 添加authorizationServerContextFilter</span></span>
<span class="line"><span>    AuthorizationServerContextFilter authorizationServerContextFilter = new AuthorizationServerContextFilter(authorizationServerSettings);</span></span>
<span class="line"><span>    httpSecurity.addFilterAfter(postProcess(authorizationServerContextFilter), SecurityContextHolderFilter.class);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 获取JWKSource</span></span>
<span class="line"><span>    JWKSource&lt;com.nimbusds.jose.proc.SecurityContext&gt; jwkSource = OAuth2ConfigurerUtils.getJwkSource(httpSecurity);</span></span>
<span class="line"><span>    if (jwkSource != null) {</span></span>
<span class="line"><span>      NimbusJwkSetEndpointFilter jwkSetEndpointFilter = new NimbusJwkSetEndpointFilter(</span></span>
<span class="line"><span>          jwkSource, authorizationServerSettings.getJwkSetEndpoint());</span></span>
<span class="line"><span>      httpSecurity.addFilterBefore(postProcess(jwkSetEndpointFilter), AbstractPreAuthenticatedProcessingFilter.class);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br></div></div><p>可以看到核心的地方就是调用了OAuth2AuthorizationServerConfigurer的configurers的init和configure方法。我们看一下都有哪些</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationServerConfigurer</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;OAuth2AuthorizationServerConfigurer, HttpSecurity&gt; {</span></span>
<span class="line"><span>  private final Map&lt;Class&lt;? extends AbstractOAuth2Configurer&gt;, AbstractOAuth2Configurer&gt; configurers = createConfigurers();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	private Map&lt;Class&lt;? extends AbstractOAuth2Configurer&gt;, AbstractOAuth2Configurer&gt; createConfigurers() {</span></span>
<span class="line"><span>		Map&lt;Class&lt;? extends AbstractOAuth2Configurer&gt;, AbstractOAuth2Configurer&gt; configurers = new LinkedHashMap&lt;&gt;();</span></span>
<span class="line"><span>		configurers.put(OAuth2ClientAuthenticationConfigurer.class, new OAuth2ClientAuthenticationConfigurer(this::postProcess));</span></span>
<span class="line"><span>		configurers.put(OAuth2AuthorizationServerMetadataEndpointConfigurer.class, new OAuth2AuthorizationServerMetadataEndpointConfigurer(this::postProcess));</span></span>
<span class="line"><span>		configurers.put(OAuth2AuthorizationEndpointConfigurer.class, new OAuth2AuthorizationEndpointConfigurer(this::postProcess));</span></span>
<span class="line"><span>		configurers.put(OAuth2TokenEndpointConfigurer.class, new OAuth2TokenEndpointConfigurer(this::postProcess));</span></span>
<span class="line"><span>		configurers.put(OAuth2TokenIntrospectionEndpointConfigurer.class, new OAuth2TokenIntrospectionEndpointConfigurer(this::postProcess));</span></span>
<span class="line"><span>		configurers.put(OAuth2TokenRevocationEndpointConfigurer.class, new OAuth2TokenRevocationEndpointConfigurer(this::postProcess));</span></span>
<span class="line"><span>		configurers.put(OAuth2DeviceAuthorizationEndpointConfigurer.class, new OAuth2DeviceAuthorizationEndpointConfigurer(this::postProcess));</span></span>
<span class="line"><span>		configurers.put(OAuth2DeviceVerificationEndpointConfigurer.class, new OAuth2DeviceVerificationEndpointConfigurer(this::postProcess));</span></span>
<span class="line"><span>		return configurers;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>可以看到有很多configurer，后面的那些所有功能我们都要看这些配置类，这里简单讲解一些这些Configurer的用处</p><ul><li><strong>OAuth2ClientAuthenticationConfigurer</strong>: 配置OAuth2客户端身份验证端点，客户端通过这个端点进行身份验证，获取访问令牌（注意，是处理客户端的身份认证）</li><li>OAuth2AuthorizationServerMetadataEndpointConfigurer: 配置OAuth2授权服务器的元数据端点，客户端可以通过这个端点获取元数据的信息，比如说支持的授权类型，端点路径，令牌格式等信息</li><li><strong>OAuth2AuthorizationEndpointConfigurer</strong>: 用于配置 OAuth2 授权端点。这个端点处理用户的授权请求，允许用户授权客户端访问其资源。（注意，是处理用户的身份认证）</li><li>OAuth2TokenEndpointConfigurer: 用于配置 OAuth2 令牌端点。这个端点处理令牌请求，客户端可以通过它交换授权码或凭证来获得访问令牌或刷新令牌</li><li>OAuth2TokenIntrospectionEndpointConfigurer: 用于配置 OAuth2 令牌检查端点。客户端或资源服务器可以通过该端点验证访问令牌的有效性并获取相关信息（例如，令牌是否过期、所拥有的权限等）</li><li>OAuth2TokenRevocationEndpointConfigurer: 用于配置 OAuth2 令牌撤销端点。客户端或用户可以通过该端点撤销访问令牌或刷新令牌，从而使令牌失效。</li><li><strong>OAuth2DeviceAuthorizationEndpointConfigurer</strong>: 用于配置 OAuth2 设备授权端点。这个端点通常用于设备授权流程，适用于那些没有浏览器的设备（例如，智能电视），用户通过其他设备或浏览器来完成授权过程。</li><li>OAuth2DeviceVerificationEndpointConfigurer: 用于配置 OAuth2 设备验证端点。它用于验证设备是否成功完成授权，并提供设备与授权码的验证过程。</li></ul><h3 id="securitymatcher" tabindex="-1">securityMatcher <a class="header-anchor" href="#securitymatcher" aria-label="Permalink to &quot;securityMatcher&quot;">​</a></h3><p>看一下securityMatcher的构建过程，直接看刚才OAuth2AuthorizationServerConfigurer的init方法。</p><div class="language-OAuth2AuthorizationServerConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationServerConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationServerConfigurer</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;OAuth2AuthorizationServerConfigurer, HttpSecurity&gt; {</span></span>
<span class="line"><span>  this.configurers.values().forEach(configurer -&gt; {</span></span>
<span class="line"><span>    configurer.init(httpSecurity);</span></span>
<span class="line"><span>    requestMatchers.add(configurer.getRequestMatcher());</span></span>
<span class="line"><span>  });</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br></div></div><p>可以看到是遍历configurer的requestMatchers，然后添加进来的。具体是哪些接口，我们回看AuthorizationServerConfig这个配置，里面有一个bean。</p><div class="language-AuthorizationServerConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthorizationServerConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class AuthorizationServerConfig {</span></span>
<span class="line"><span>  //授权服务器的配置 很多class 你看它命名就知道了 想研究的可以点进去看一看</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public AuthorizationServerSettings authorizationServerSettings() {</span></span>
<span class="line"><span>    return AuthorizationServerSettings.builder().build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>点击这个builder进去看一下，可以看到下面的代码。</p><div class="language-AuthorizationServerSettings vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthorizationServerSettings</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class AuthorizationServerSettings extends AbstractSettings {</span></span>
<span class="line"><span>  public static Builder builder() {</span></span>
<span class="line"><span>    return new Builder()</span></span>
<span class="line"><span>        .authorizationEndpoint(&quot;/oauth2/authorize&quot;)</span></span>
<span class="line"><span>        .deviceAuthorizationEndpoint(&quot;/oauth2/device_authorization&quot;)</span></span>
<span class="line"><span>        .deviceVerificationEndpoint(&quot;/oauth2/device_verification&quot;)</span></span>
<span class="line"><span>        .tokenEndpoint(&quot;/oauth2/token&quot;)</span></span>
<span class="line"><span>        .jwkSetEndpoint(&quot;/oauth2/jwks&quot;)</span></span>
<span class="line"><span>        .tokenRevocationEndpoint(&quot;/oauth2/revoke&quot;)</span></span>
<span class="line"><span>        .tokenIntrospectionEndpoint(&quot;/oauth2/introspect&quot;)</span></span>
<span class="line"><span>        .oidcClientRegistrationEndpoint(&quot;/connect/register&quot;)</span></span>
<span class="line"><span>        .oidcUserInfoEndpoint(&quot;/userinfo&quot;)</span></span>
<span class="line"><span>        .oidcLogoutEndpoint(&quot;/connect/logout&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public AuthorizationServerSettings build() {</span></span>
<span class="line"><span>    return new AuthorizationServerSettings(getSettings());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>所以就是针对这些路径进行放行的, 下面解释一下这些端点的作用。</p><ul><li>/oauth2/authorize: 用于发起授权请求。客户端应用将用户重定向到此端点，用户在此端点进行身份验证并授权访问权限。用户输入凭证并授权后，授权服务器会将用户重定向回客户端应用，并附带一个授权码，客户端可以使用这个授权码换取访问令牌</li><li>/oauth2/device_authorization: 设备向授权服务器请求设备码，并提供给用户，用户在另一个设备上输入设备码进行授权。授权成功后，设备可以获得访问令牌</li><li>/oauth2/device_verification: 用于设备验证。设备在此端点验证是否已经获得授权,设备持续查询此端点，直到用户在其他设备上完成授权并确认设备身份</li><li>/oauth2/token: 客户端将授权码（或凭证）发送到此端点，授权服务器验证后，返回访问令牌（JWT 或其他格式）和刷新令牌</li><li>/oauth2/jwks: 此端点返回包含授权服务器公钥的 JSON 格式的数据，客户端可以使用这些公钥来验证令牌的有效性</li><li>/oauth2/revoke: 当客户端或用户决定不再使用某个令牌时，发送请求到此端点，授权服务器将撤销该令牌，令牌将不再有效</li><li>/oauth2/introspect: 资源服务器将令牌传递给此端点，授权服务器返回令牌的相关信息（如是否有效、过期时间、权限等），帮助资源服务器做出相应的权限判断</li><li>/connect/register: OpenID Connect 客户端注册端点。客户端可以通过此端点向授权服务器注册，获取客户端ID和客户端密钥等信息</li><li>/userinfo: OpenID Connect 用户信息端点。客户端可以使用访问令牌（Access Token）来请求用户的个人信息（如姓名、电子邮件等）</li><li>/connect/logout: 当用户想要登出时，客户端引导用户访问此端点，授权服务器会处理登出请求并结束用户的会话</li></ul><p>下面我们就来分析一下上面那个场景的具体流程。</p><h2 id="跳转登录页" tabindex="-1">跳转登录页 <a class="header-anchor" href="#跳转登录页" aria-label="Permalink to &quot;跳转登录页&quot;">​</a></h2><p>访问 <a href="http://127.0.0.1:8080/index" target="_blank" rel="noreferrer">http://127.0.0.1:8080/index</a> 接口，会跳转到 <a href="http://127.0.0.1:8080/login" target="_blank" rel="noreferrer">http://127.0.0.1:8080/login</a> 页面，有之前异常处理经验的就知道，访问index没有权限，客户端会把请求重定向到login页，而login页的生成是由DefaultLoginPageGeneratingFilter这个过滤器实现的，我们看看他的模板方法。</p><div class="language-DefaultLoginPageGeneratingFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultLoginPageGeneratingFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DefaultLoginPageGeneratingFilter extends GenericFilterBean {</span></span>
<span class="line"><span>  private String generateLoginPageHtml(HttpServletRequest request, boolean loginError, boolean logoutSuccess) {</span></span>
<span class="line"><span>    return HtmlTemplates.fromTemplate(LOGIN_PAGE_TEMPLATE)</span></span>
<span class="line"><span>      .withRawHtml(&quot;oauth2Login&quot;, renderOAuth2Login(loginError, logoutSuccess, errorMsg, contextPath))</span></span>
<span class="line"><span>      .render();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private String renderOAuth2Login(boolean loginError, boolean logoutSuccess, String errorMsg, String contextPath) {</span></span>
<span class="line"><span>    String oauth2Rows = this.oauth2AuthenticationUrlToClientName.entrySet()</span></span>
<span class="line"><span>      .stream()</span></span>
<span class="line"><span>      .map((urlToName) -&gt; renderOAuth2Row(contextPath, urlToName.getKey(), urlToName.getValue()))</span></span>
<span class="line"><span>      .collect(Collectors.joining(&quot;\\n&quot;));</span></span>
<span class="line"><span>    return HtmlTemplates.fromTemplate(OAUTH2_LOGIN_TEMPLATE).render();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>可以看到，登录页面就是遍历oauth2AuthenticationUrlToClientName列表, 然后渲染对应的列表项。</p><p>至于oauth2AuthenticationUrlToClientName列表是怎么来的， 可以看OAuth2LoginConfigurer -&gt; init -&gt; getLoginLinks, 是取授权码登录的ClientRegistration名字，查看demo-client的application.yml， 可以看到对应的ClientRegistration的有两个。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spring:</span></span>
<span class="line"><span>  security:</span></span>
<span class="line"><span>    oauth2:</span></span>
<span class="line"><span>      client:</span></span>
<span class="line"><span>        registration:</span></span>
<span class="line"><span>          messaging-client-oidc:</span></span>
<span class="line"><span>            redirect-uri: &quot;http://127.0.0.1:8080/login/oauth2/code/{registrationId}&quot;</span></span>
<span class="line"><span>            authorization-grant-type: authorization_code</span></span>
<span class="line"><span>            client-name: messaging-client-oidc</span></span>
<span class="line"><span>          messaging-client-authorization-code:</span></span>
<span class="line"><span>            redirect-uri: &quot;http://127.0.0.1:8080/authorized&quot;</span></span>
<span class="line"><span>            client-name: messaging-client-authorization-code</span></span>
<span class="line"><span>            authorization-grant-type: authorization_code</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><h2 id="请求登录授权" tabindex="-1">请求登录授权 <a class="header-anchor" href="#请求登录授权" aria-label="Permalink to &quot;请求登录授权&quot;">​</a></h2><p>用户点击messaging-client-oidc标签的按钮，就会访问 <a href="http://localhost:8080/oauth2/authorization/messaging-client-oidc" target="_blank" rel="noreferrer">http://localhost:8080/oauth2/authorization/messaging-client-oidc</a> 接口，然后由上一节讲到的OAuth2AuthorizationRequestRedirectFilter将客户端重定向到<a href="http://192.168.1.30:9000/oauth2/authorize" target="_blank" rel="noreferrer">http://192.168.1.30:9000/oauth2/authorize</a> 接口，这个具体的过程可以看上一节课的内容，这里跳转的链接样式</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>http://192.168.1.30:9000/oauth2/authorize?response_type=code&amp;client_id=messaging-client&amp;scope=openid%20profile&amp;state=9D0_3yCqlMCN26lc0QALd0QelQFffs2At9gJa3Frp_A%3D&amp;redirect_uri=http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc&amp;nonce=bjI8Gxk7zdkm9zstrr0D0-oAEnF879_0C5w5nxI6e-4</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>由于在demo-client在application.yml定义了provider，所以会获取认证服务器的/.well-known/openid-configuration来配置认证服务器的链接。</p><h2 id="跳转认证服务器认证" tabindex="-1">跳转认证服务器认证 <a class="header-anchor" href="#跳转认证服务器认证" aria-label="Permalink to &quot;跳转认证服务器认证&quot;">​</a></h2><p>我们先来看认证服务器demo-authorizationserver的实现，因为认证服务器也是需要对用户进行认证的，所以也会集成Spring Securtiy，我们看一下配置文件。</p><div class="language-DefaultSecurityConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultSecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@EnableWebSecurity</span></span>
<span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class DefaultSecurityConfig {</span></span>
<span class="line"><span>	// 过滤器链</span></span>
<span class="line"><span>	@Bean</span></span>
<span class="line"><span>	public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>		http</span></span>
<span class="line"><span>      .authorizeHttpRequests(authorize -&gt;//① 配置鉴权的</span></span>
<span class="line"><span>          authorize</span></span>
<span class="line"><span>              .requestMatchers(&quot;/assets/**&quot;, &quot;/webjars/**&quot;, &quot;/login&quot;,&quot;/oauth2/**&quot;,&quot;/oauth2/token&quot;).permitAll() //② 忽略鉴权的url</span></span>
<span class="line"><span>              .anyRequest().authenticated()//③ 排除忽略的其他url就需要鉴权了</span></span>
<span class="line"><span>      )</span></span>
<span class="line"><span>      .csrf(AbstractHttpConfigurer::disable)</span></span>
<span class="line"><span>      .formLogin(formLogin -&gt;</span></span>
<span class="line"><span>          formLogin</span></span>
<span class="line"><span>              .loginPage(&quot;/login&quot;)//④ 授权服务认证页面（可以配置相对和绝对地址，前后端分离的情况下填前端的url）</span></span>
<span class="line"><span>      )</span></span>
<span class="line"><span>      .oauth2Login(oauth2Login -&gt;</span></span>
<span class="line"><span>          oauth2Login</span></span>
<span class="line"><span>              .loginPage(&quot;/login&quot;)//⑤ oauth2的认证页面（也可配置绝对地址）</span></span>
<span class="line"><span>              .successHandler(authenticationSuccessHandler())//⑥ 登录成功后的处理</span></span>
<span class="line"><span>      );</span></span>
<span class="line"><span>		return http.build();</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><p>可以看到配置了一个表单登录跟一个Oauth2客户端，表单登录是给用户认证用的，而集成Oauth2客户端是因为这个项目自带了gitee登录和github登录。</p><p>很明显用户刚开始访问<a href="http://192.168.1.30:9000/oauth2/authorize" target="_blank" rel="noreferrer">http://192.168.1.30:9000/oauth2/authorize</a> 的时候是没有认证的，所以会跳转到demo-authorizationserver的登录页。</p><p>用户输入完帐号密码之后或者通过gitee等登录之后会重新访问访问该接口，这个时候用户就是认证过了，那么就会走认证服务器的相关流程了。</p><h2 id="认证服务器发送授权码" tabindex="-1">认证服务器发送授权码 <a class="header-anchor" href="#认证服务器发送授权码" aria-label="Permalink to &quot;认证服务器发送授权码&quot;">​</a></h2><p>认证服务器对/oauth2/authorize这个接口进行处理的过滤器是OAuth2AuthorizationEndpointFilter这个过滤器。我们先来看看这个过滤器是怎么加进来的，然后看一下这个过滤器的处理流程。</p><h3 id="oauth2authorizationendpointconfigurer" tabindex="-1">OAuth2AuthorizationEndpointConfigurer <a class="header-anchor" href="#oauth2authorizationendpointconfigurer" aria-label="Permalink to &quot;OAuth2AuthorizationEndpointConfigurer&quot;">​</a></h3><p>前面讲到OAuth2AuthorizationServerConfigurer会往HttpSecurity里面添加OAuth2AuthorizationEndpointConfigurer这个配置类，我们先简单看一下这个配置类。</p><div class="language-OAuth2AuthorizationEndpointConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationEndpointConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationEndpointConfigurer extends AbstractOAuth2Configurer {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  void init(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    AuthorizationServerSettings authorizationServerSettings = OAuth2ConfigurerUtils.getAuthorizationServerSettings(httpSecurity);</span></span>
<span class="line"><span>    // 放行/oauth2/authorize的GET方法和POST方法</span></span>
<span class="line"><span>    this.requestMatcher = new OrRequestMatcher(</span></span>
<span class="line"><span>      new AntPathRequestMatcher(authorizationServerSettings.getAuthorizationEndpoint(),HttpMethod.GET.name()),</span></span>
<span class="line"><span>      new AntPathRequestMatcher(authorizationServerSettings.getAuthorizationEndpoint(),HttpMethod.POST.name())</span></span>
<span class="line"><span>    );</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  void configure(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    // 注册authorizationEndpointFilter过滤器</span></span>
<span class="line"><span>    OAuth2AuthorizationEndpointFilter authorizationEndpointFilter = new OAuth2AuthorizationEndpointFilter(authenticationManager, authorizationServerSettings.getAuthorizationEndpoint());</span></span>
<span class="line"><span>    // 添加authorizationEndpointFilter过滤器</span></span>
<span class="line"><span>    httpSecurity.addFilterBefore(postProcess(authorizationEndpointFilter), AbstractPreAuthenticatedProcessingFilter.class);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><p>可以看到就是在OAuth2AuthorizationEndpointConfigurer这个配置类里面加入的。</p><h3 id="oauth2authorizationendpointfilter" tabindex="-1">OAuth2AuthorizationEndpointFilter <a class="header-anchor" href="#oauth2authorizationendpointfilter" aria-label="Permalink to &quot;OAuth2AuthorizationEndpointFilter&quot;">​</a></h3><p>我们进入这个过滤器的方法里面查看一下，具体代码如下:</p><div class="language-OAuth2AuthorizationEndpointFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationEndpointFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationEndpointFilter extends OncePerRequestFilter {</span></span>
<span class="line"><span>  </span></span>
<span class="line"><span>  private static final String DEFAULT_AUTHORIZATION_ENDPOINT_URI = &quot;/oauth2/authorize&quot;;</span></span>
<span class="line"><span>  private AuthenticationConverter authenticationConverter;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)</span></span>
<span class="line"><span>      throws ServletException, IOException {</span></span>
<span class="line"><span>    // 如果不是认证URL，直接放行</span></span>
<span class="line"><span>    if (!this.authorizationEndpointMatcher.matches(request)) {</span></span>
<span class="line"><span>      filterChain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 调用authenticationConverter的convert进行权限校验</span></span>
<span class="line"><span>    Authentication authentication = this.authenticationConverter.convert(request);</span></span>
<span class="line"><span>    if (!authenticationResult.isAuthenticated()) {</span></span>
<span class="line"><span>      filterChain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 认证请求</span></span>
<span class="line"><span>    Authentication authenticationResult = this.authenticationManager.authenticate(authentication);</span></span>
<span class="line"><span>    // 如果是OAuth2AuthorizationConsentAuthenticationToken，就跳转到授权界面</span></span>
<span class="line"><span>    if (authenticationResult instanceof OAuth2AuthorizationConsentAuthenticationToken) {</span></span>
<span class="line"><span>      sendAuthorizationConsent(request, response,</span></span>
<span class="line"><span>          (OAuth2AuthorizationCodeRequestAuthenticationToken) authentication,</span></span>
<span class="line"><span>          (OAuth2AuthorizationConsentAuthenticationToken) authenticationResult);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 成功认证操作</span></span>
<span class="line"><span>    this.sessionAuthenticationStrategy.onAuthentication(authenticationResult, request, response);</span></span>
<span class="line"><span>    this.authenticationSuccessHandler.onAuthenticationSuccess(request, response, authenticationResult);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br></div></div><h3 id="authenticationconverter" tabindex="-1">AuthenticationConverter <a class="header-anchor" href="#authenticationconverter" aria-label="Permalink to &quot;AuthenticationConverter&quot;">​</a></h3><p>可以看到核心的地方就是authenticationConverter，我们看看这个接口的实现，可以看到就只有一个convert方法，返回Authentication</p><div class="language-AuthenticationConverter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthenticationConverter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface AuthenticationConverter {</span></span>
<span class="line"><span>	Authentication convert(HttpServletRequest request);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>具体的authenticationConverter是什么呢，回看OAuth2AuthorizationEndpointConfigurer加入Filter的地方。</p><div class="language-OAuth2AuthorizationEndpointConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationEndpointConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationEndpointConfigurer extends AbstractOAuth2Configurer {</span></span>
<span class="line"><span>  private static List&lt;AuthenticationConverter&gt; createDefaultAuthenticationConverters() {</span></span>
<span class="line"><span>    List&lt;AuthenticationConverter&gt; authenticationConverters = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    authenticationConverters.add(new OAuth2AuthorizationCodeRequestAuthenticationConverter());</span></span>
<span class="line"><span>    authenticationConverters.add(new OAuth2AuthorizationConsentAuthenticationConverter());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return authenticationConverters;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  void configure(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    List&lt;AuthenticationConverter&gt; authenticationConverters = createDefaultAuthenticationConverters();</span></span>
<span class="line"><span>    if (!this.authorizationRequestConverters.isEmpty()) {</span></span>
<span class="line"><span>      authenticationConverters.addAll(0, this.authorizationRequestConverters);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    authorizationEndpointFilter.setAuthenticationConverter(</span></span>
<span class="line"><span>      new DelegatingAuthenticationConverter(authenticationConverters));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>可以看到加入两个AuthenticationConverter，这两个AuthenticationConverter看名字就知道干什么的</p><ul><li>OAuth2AuthorizationCodeRequestAuthenticationConverter: 处理授权码认证请求</li><li>OAuth2AuthorizationConsentAuthenticationConverter: 处理授权请求</li></ul><p>我们直接看OAuth2AuthorizationCodeRequestAuthenticationConverter的代码</p><div class="language-OAuth2AuthorizationCodeRequestAuthenticationConverter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationCodeRequestAuthenticationConverter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationCodeRequestAuthenticationConverter implements AuthenticationConverter {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Authentication convert(HttpServletRequest request) {</span></span>
<span class="line"><span>    // POST方法，有response_type参数并且code=openid</span></span>
<span class="line"><span>    if (!&quot;GET&quot;.equals(request.getMethod()) &amp;&amp; !OIDC_REQUEST_MATCHER.matches(request)) {</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    MultiValueMap&lt;String, String&gt; parameters = OAuth2EndpointUtils.getParameters(request);</span></span>
<span class="line"><span>    ...</span></span>
<span class="line"><span>    // 如果没有认证，那么就是匿名用户</span></span>
<span class="line"><span>    Authentication principal = SecurityContextHolder.getContext().getAuthentication();</span></span>
<span class="line"><span>		if (principal == null) {</span></span>
<span class="line"><span>			principal = ANONYMOUS_AUTHENTICATION;</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>    ...    // 参数校验</span></span>
<span class="line"><span>    // 返回一个构造的Token</span></span>
<span class="line"><span>    return new OAuth2AuthorizationCodeRequestAuthenticationToken(authorizationUri, clientId, principal,</span></span>
<span class="line"><span>      redirectUri, state, scopes, additionalParameters);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>可以看到其实AuthenticationConverter做的事情也不复杂，就是将请求转换对应的AuthenticationToken。</p><h3 id="oauth2authorizationcoderequestauthenticationprovider" tabindex="-1">OAuth2AuthorizationCodeRequestAuthenticationProvider <a class="header-anchor" href="#oauth2authorizationcoderequestauthenticationprovider" aria-label="Permalink to &quot;OAuth2AuthorizationCodeRequestAuthenticationProvider&quot;">​</a></h3><p>接下来我们看一下OAuth2AuthorizationEndpointFilter的认证方法，主要看OAuth2AuthorizationCodeRequestAuthenticationToken的验证方法，这个Token的验证类是OAuth2AuthorizationCodeRequestAuthenticationProvider。我们看一下认证方法。</p><div class="language-OAuth2AuthorizationCodeRequestAuthenticationProvider vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationCodeRequestAuthenticationProvider</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationCodeRequestAuthenticationProvider implements AuthenticationProvider {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Authentication authenticate(Authentication authentication) throws AuthenticationException {</span></span>
<span class="line"><span>    OAuth2AuthorizationCodeRequestAuthenticationToken authorizationCodeRequestAuthentication =</span></span>
<span class="line"><span>      (OAuth2AuthorizationCodeRequestAuthenticationToken) authentication;</span></span>
<span class="line"><span>    // 找到对应的registeredClient</span></span>
<span class="line"><span>    RegisteredClient registeredClient = this.registeredClientRepository.findByClientId(</span></span>
<span class="line"><span>      authorizationCodeRequestAuthentication.getClientId());</span></span>
<span class="line"><span>    // 检验authentication</span></span>
<span class="line"><span>    OAuth2AuthorizationCodeRequestAuthenticationContext authenticationContext =</span></span>
<span class="line"><span>      OAuth2AuthorizationCodeRequestAuthenticationContext.with(authorizationCodeRequestAuthentication)</span></span>
<span class="line"><span>        .registeredClient(registeredClient)</span></span>
<span class="line"><span>        .build();</span></span>
<span class="line"><span>    this.authenticationValidator.accept(authenticationContext);</span></span>
<span class="line"><span>    // 如果需要用户授权，就返回OAuth2AuthorizationConsentAuthenticationToken</span></span>
<span class="line"><span>    if (requireAuthorizationConsent(registeredClient, authorizationRequest, currentAuthorizationConsent)) {</span></span>
<span class="line"><span>      return new OAuth2AuthorizationConsentAuthenticationToken(authorizationRequest.getAuthorizationUri(),</span></span>
<span class="line"><span>        registeredClient.getClientId(), principal, state, currentAuthorizedScopes, null);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 生成授权码</span></span>
<span class="line"><span>    OAuth2TokenContext tokenContext = createAuthorizationCodeTokenContext(</span></span>
<span class="line"><span>        authorizationCodeRequestAuthentication, registeredClient, null, authorizationRequest.getScopes());</span></span>
<span class="line"><span>    OAuth2AuthorizationCode authorizationCode = this.authorizationCodeGenerator.generate(tokenContext);</span></span>
<span class="line"><span>    // 保存授权码信息</span></span>
<span class="line"><span>    OAuth2Authorization authorization = authorizationBuilder(registeredClient, principal, authorizationRequest)</span></span>
<span class="line"><span>        .authorizedScopes(authorizationRequest.getScopes())</span></span>
<span class="line"><span>        .token(authorizationCode)</span></span>
<span class="line"><span>        .build();</span></span>
<span class="line"><span>    this.authorizationService.save(authorization);</span></span>
<span class="line"><span>    // 返回OAuth2AuthorizationCodeRequestAuthenticationToken</span></span>
<span class="line"><span>    return new OAuth2AuthorizationCodeRequestAuthenticationToken(authorizationRequest.getAuthorizationUri(),</span></span>
<span class="line"><span>        registeredClient.getClientId(), principal, authorizationCode, redirectUri,</span></span>
<span class="line"><span>        authorizationRequest.getState(), authorizationRequest.getScopes());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br></div></div><p>可以看到这个Provider可以扩展的点主要有三个：</p><ul><li>registeredClientRepository: 这个就是存储客户端应用的信息，只有客户端可信，我们才会认证成功</li><li>authorizationConsentService: 保存客户端权限的信息</li><li>authorizationService: 保存授权码Token的方法</li></ul><p>我们看看这三个对象在哪里赋值的，回到OAuth2AuthorizationEndpointConfigurer配置类，查看方法。</p><div class="language-OAuth2AuthorizationEndpointConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationEndpointConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationEndpointConfigurer extends AbstractOAuth2Configurer {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  void init(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    List&lt;AuthenticationProvider&gt; authenticationProviders = createDefaultAuthenticationProviders(httpSecurity);</span></span>
<span class="line"><span>    if (!this.authenticationProviders.isEmpty()) {</span></span>
<span class="line"><span>      authenticationProviders.addAll(0, this.authenticationProviders);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    authenticationProviders.forEach(authenticationProvider -&gt;</span></span>
<span class="line"><span>      httpSecurity.authenticationProvider(postProcess(authenticationProvider)));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private List&lt;AuthenticationProvider&gt; createDefaultAuthenticationProviders(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    List&lt;AuthenticationProvider&gt; authenticationProviders = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    OAuth2AuthorizationCodeRequestAuthenticationProvider authorizationCodeRequestAuthenticationProvider =</span></span>
<span class="line"><span>        new OAuth2AuthorizationCodeRequestAuthenticationProvider(</span></span>
<span class="line"><span>            OAuth2ConfigurerUtils.getRegisteredClientRepository(httpSecurity),</span></span>
<span class="line"><span>            OAuth2ConfigurerUtils.getAuthorizationService(httpSecurity),</span></span>
<span class="line"><span>            OAuth2ConfigurerUtils.getAuthorizationConsentService(httpSecurity));</span></span>
<span class="line"><span>    if (this.authorizationCodeRequestAuthenticationValidator != null) {</span></span>
<span class="line"><span>      authorizationCodeRequestAuthenticationProvider.setAuthenticationValidator(</span></span>
<span class="line"><span>          new OAuth2AuthorizationCodeRequestAuthenticationValidator()</span></span>
<span class="line"><span>              .andThen(this.authorizationCodeRequestAuthenticationValidator));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    authenticationProviders.add(authorizationCodeRequestAuthenticationProvider);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return authenticationProviders;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br></div></div><p>具体怎么获取的那三个方法这里就不细讲了，主要是先通过httpSecurity.getSharedObject获取，如果没有，再通过ApplicationContext中直接获取对应bean，具体的可以跟一下代码。</p><p>在认证服务器的demo里面，在AuthorizationServerConfig给我们配置了这几个实现，看一下代码。</p><div class="language-AuthorizationServerConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthorizationServerConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class AuthorizationServerConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  //这个是oauth2的授权信息(包含了用户、token等其他信息) 这个也是可以扩展的 OAuth2AuthorizationService也是一个实现类</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public OAuth2AuthorizationService authorizationService(JdbcTemplate jdbcTemplate,</span></span>
<span class="line"><span>                                RegisteredClientRepository registeredClientRepository) {</span></span>
<span class="line"><span>    return new JdbcOAuth2AuthorizationService(jdbcTemplate, registeredClientRepository);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  //这个是oauth2授权记录的持久化存储方式 看 JdbcOAuth2AuthorizationConsentService 就知道是基于数据库的了,当然也可以进行扩展 基于redis 后面再将 你可以看看 JdbcOAuth2AuthorizationConsentService的是一个实现</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public OAuth2AuthorizationConsentService authorizationConsentService(JdbcTemplate jdbcTemplate,</span></span>
<span class="line"><span>                                      RegisteredClientRepository registeredClientRepository) {</span></span>
<span class="line"><span>    // Will be used by the ConsentController</span></span>
<span class="line"><span>    return new JdbcOAuth2AuthorizationConsentService(jdbcTemplate, registeredClientRepository);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public RegisteredClientRepository registeredClientRepository(JdbcTemplate jdbcTemplate) {</span></span>
<span class="line"><span>    RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())</span></span>
<span class="line"><span>        .clientId(&quot;messaging-client&quot;)</span></span>
<span class="line"><span>        .clientSecret(&quot;{noop}secret&quot;)</span></span>
<span class="line"><span>        .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)</span></span>
<span class="line"><span>        .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)</span></span>
<span class="line"><span>        .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)</span></span>
<span class="line"><span>        .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)</span></span>
<span class="line"><span>        .redirectUri(&quot;http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc&quot;)</span></span>
<span class="line"><span>        .redirectUri(&quot;http://127.0.0.1:8080/authorized&quot;)</span></span>
<span class="line"><span>        .postLogoutRedirectUri(&quot;http://127.0.0.1:8080/logged-out&quot;)</span></span>
<span class="line"><span>        .scope(OidcScopes.OPENID)</span></span>
<span class="line"><span>        .scope(OidcScopes.PROFILE)</span></span>
<span class="line"><span>        .scope(&quot;message.read&quot;)</span></span>
<span class="line"><span>        .scope(&quot;message.write&quot;)</span></span>
<span class="line"><span>        .clientSettings(ClientSettings.builder().requireAuthorizationConsent(true).build())//requireAuthorizationConsent(true) 授权页是有的 如果是false是没有的</span></span>
<span class="line"><span>        .build();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    RegisteredClient deviceClient = RegisteredClient.withId(UUID.randomUUID().toString())</span></span>
<span class="line"><span>        .clientId(&quot;device-messaging-client&quot;)</span></span>
<span class="line"><span>        .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)</span></span>
<span class="line"><span>        .authorizationGrantType(AuthorizationGrantType.DEVICE_CODE)</span></span>
<span class="line"><span>        .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)</span></span>
<span class="line"><span>        .scope(&quot;message.read&quot;)</span></span>
<span class="line"><span>        .scope(&quot;message.write&quot;)</span></span>
<span class="line"><span>        .build();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // Save registered client&#39;s in db as if in-memory</span></span>
<span class="line"><span>    JdbcRegisteredClientRepository registeredClientRepository = new JdbcRegisteredClientRepository(jdbcTemplate);</span></span>
<span class="line"><span>    registeredClientRepository.save(registeredClient);</span></span>
<span class="line"><span>    registeredClientRepository.save(deviceClient);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return registeredClientRepository;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  //此时基于H2数据库(内存数据库) 需要使用mysql 就注释掉就可以了 demo这个地方我们用内存跑就行了 省事</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public EmbeddedDatabase embeddedDatabase() {</span></span>
<span class="line"><span>    // @formatter:off</span></span>
<span class="line"><span>    return new EmbeddedDatabaseBuilder()</span></span>
<span class="line"><span>        .generateUniqueName(true)</span></span>
<span class="line"><span>        .setType(EmbeddedDatabaseType.H2)</span></span>
<span class="line"><span>        .setScriptEncoding(&quot;UTF-8&quot;)</span></span>
<span class="line"><span>        .addScript(&quot;org/springframework/security/oauth2/server/authorization/oauth2-authorization-schema.sql&quot;)</span></span>
<span class="line"><span>        .addScript(&quot;org/springframework/security/oauth2/server/authorization/oauth2-authorization-consent-schema.sql&quot;)</span></span>
<span class="line"><span>        .addScript(&quot;org/springframework/security/oauth2/server/authorization/client/oauth2-registered-client-schema.sql&quot;)</span></span>
<span class="line"><span>        .build();</span></span>
<span class="line"><span>    // @formatter:on</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br></div></div><p>可以看到先声明了两个registeredClient，然后保存到H2数据库中，并且返回这个RegisteredClientRepository。</p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>RegisteredClient实际就是我们的客户端应用，举个之前的github登录的场景，我们先要在github上注册一个应用，然后获取AppId跟AppSecret，而我们注册到github的信息，就是一个RegisteredClient</p></div><h2 id="客户端使用授权码获取token" tabindex="-1">客户端使用授权码获取Token <a class="header-anchor" href="#客户端使用授权码获取token" aria-label="Permalink to &quot;客户端使用授权码获取Token&quot;">​</a></h2><p>认证服务器在验证用户的授权登录信息成功之后，就会把用户重定向到客户端的认证路径，具体路径如下所示：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc?code=C0gkjqDsrvzA2fbNJXbPuM1o-HHS81Q8PYeJCGyvI-96TXLqj5mrc6cKBoE0qpm8oiPZC2trByJQvNxoGUD8whFazQb5KzT8425p1jPpgXn2Pw43PwvUudesbMxE-s1_&amp;state=i-2nKneuUffJixaWGncKnkehrvBoJ6SdbEKCJ9sgVCQ%3D</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>具体客户端怎么处理这个请求的，可以看Oauth2客户端认证流程，用于这个OIDC模式，所以用的Provider是OidcAuthorizationCodeAuthenticationProvider。 这里主要讲一下客户端向认证服务器获取Token的URL，如下所示:</p><img src="`+c+`" alt="oauth2-token-url"><h2 id="认证服务器返回token" tabindex="-1">认证服务器返回Token <a class="header-anchor" href="#认证服务器返回token" aria-label="Permalink to &quot;认证服务器返回Token&quot;">​</a></h2><p>认证服务器对/oauth2/token这个URL进行处理的是OAuth2TokenEndpointFilter这个Filter。按照惯例，我们先看一下这个Filter是在哪里加进来的，然后看一下这个Filter的处理逻辑。</p><p>前面讲到OAuth2AuthorizationServerConfigurer会往HttpSecurity里面添加OAuth2TokenEndpointConfigurer这个配置类，我们先简单看一下这个配置类。</p><h3 id="oauth2tokenendpointconfigurer" tabindex="-1">OAuth2TokenEndpointConfigurer <a class="header-anchor" href="#oauth2tokenendpointconfigurer" aria-label="Permalink to &quot;OAuth2TokenEndpointConfigurer&quot;">​</a></h3><div class="language-OAuth2TokenEndpointConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2TokenEndpointConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2TokenEndpointConfigurer extends AbstractOAuth2Configurer {</span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	void configure(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    // 注册OAuth2TokenEndpointFilter过滤器</span></span>
<span class="line"><span>    OAuth2TokenEndpointFilter tokenEndpointFilter = new OAuth2TokenEndpointFilter(authenticationManager, authorizationServerSettings.getTokenEndpoint());</span></span>
<span class="line"><span>    // 添加OAuth2TokenEndpointFilter过滤器</span></span>
<span class="line"><span>    httpSecurity.addFilterAfter(postProcess(tokenEndpointFilter), AuthorizationFilter.class);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><h3 id="oauth2tokenendpointfilter" tabindex="-1">OAuth2TokenEndpointFilter <a class="header-anchor" href="#oauth2tokenendpointfilter" aria-label="Permalink to &quot;OAuth2TokenEndpointFilter&quot;">​</a></h3><p>那我们来看一下OAuth2TokenEndpointFilter的处理过程，代码如下所示:</p><div class="language-OAuth2TokenEndpointFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2TokenEndpointFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2TokenEndpointFilter extends OncePerRequestFilter {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)</span></span>
<span class="line"><span>      throws ServletException, IOException {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    if (!this.tokenEndpointMatcher.matches(request)) {</span></span>
<span class="line"><span>      filterChain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    Authentication authorizationGrantAuthentication = this.authenticationConverter.convert(request);</span></span>
<span class="line"><span>          OAuth2AccessTokenAuthenticationToken accessTokenAuthentication =</span></span>
<span class="line"><span>    (OAuth2AccessTokenAuthenticationToken) this.authenticationManager.authenticate(authorizationGrantAuthentication);</span></span>
<span class="line"><span>    this.authenticationSuccessHandler.onAuthenticationSuccess(request, response, accessTokenAuthentication);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>可以看到流程跟之前的OAuth2AuthorizationEndpointFilter是差不多的。主要是authenticationConverter，authenticationProvider，以及authenticationSuccessHandler不一样。</p><h3 id="authenticationconverter-1" tabindex="-1">AuthenticationConverter <a class="header-anchor" href="#authenticationconverter-1" aria-label="Permalink to &quot;AuthenticationConverter&quot;">​</a></h3><p>那我们接下来就看看OAuth2TokenEndpointFilter有哪些AuthenticationConverter, 回到OAuth2TokenEndpointConfigurer的代码。</p><div class="language-AbstractOAuth2Configurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AbstractOAuth2Configurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2TokenEndpointConfigurer extends AbstractOAuth2Configurer {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  void configure(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    List&lt;AuthenticationConverter&gt; authenticationConverters = createDefaultAuthenticationConverters();</span></span>
<span class="line"><span>    if (!this.accessTokenRequestConverters.isEmpty()) {</span></span>
<span class="line"><span>      authenticationConverters.addAll(0, this.accessTokenRequestConverters);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.accessTokenRequestConvertersConsumer.accept(authenticationConverters);</span></span>
<span class="line"><span>    tokenEndpointFilter.setAuthenticationConverter(</span></span>
<span class="line"><span>        new DelegatingAuthenticationConverter(authenticationConverters));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static List&lt;AuthenticationConverter&gt; createDefaultAuthenticationConverters() {</span></span>
<span class="line"><span>    List&lt;AuthenticationConverter&gt; authenticationConverters = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    authenticationConverters.add(new OAuth2AuthorizationCodeAuthenticationConverter());</span></span>
<span class="line"><span>    authenticationConverters.add(new OAuth2RefreshTokenAuthenticationConverter());</span></span>
<span class="line"><span>    authenticationConverters.add(new OAuth2ClientCredentialsAuthenticationConverter());</span></span>
<span class="line"><span>    authenticationConverters.add(new OAuth2DeviceCodeAuthenticationConverter());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return authenticationConverters;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><p>可以看到声明了4个AuthenticationConverter，具体代码就不讲解了，这四个Converter分别处理四种授权模式：</p><ul><li>OAuth2AuthorizationCodeAuthenticationConverter: 处理授权码模式</li><li>OAuth2RefreshTokenAuthenticationConverter: 处理令牌授权模式</li><li>OAuth2ClientCredentialsAuthenticationConverter: 处理客户端凭证授权模式</li><li>OAuth2DeviceCodeAuthenticationConverter: 处理设备码模式</li></ul><h3 id="authenticationprovider" tabindex="-1">AuthenticationProvider <a class="header-anchor" href="#authenticationprovider" aria-label="Permalink to &quot;AuthenticationProvider&quot;">​</a></h3><p>接下来看看OAuth2TokenEndpointFilter的AuthenticationProvider有哪些，回到OAuth2TokenEndpointConfigurer的代码</p><div class="language-OAuth2TokenEndpointConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2TokenEndpointConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2TokenEndpointConfigurer extends AbstractOAuth2Configurer {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  void init(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>        List&lt;AuthenticationProvider&gt; authenticationProviders = createDefaultAuthenticationProviders(httpSecurity);</span></span>
<span class="line"><span>    if (!this.authenticationProviders.isEmpty()) {</span></span>
<span class="line"><span>      authenticationProviders.addAll(0, this.authenticationProviders);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.authenticationProvidersConsumer.accept(authenticationProviders);</span></span>
<span class="line"><span>    authenticationProviders.forEach(authenticationProvider -&gt;</span></span>
<span class="line"><span>        httpSecurity.authenticationProvider(postProcess(authenticationProvider)));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static List&lt;AuthenticationProvider&gt; createDefaultAuthenticationProviders(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    List&lt;AuthenticationProvider&gt; authenticationProviders = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    OAuth2AuthorizationService authorizationService = OAuth2ConfigurerUtils.getAuthorizationService(httpSecurity);</span></span>
<span class="line"><span>    OAuth2TokenGenerator&lt;? extends OAuth2Token&gt; tokenGenerator = OAuth2ConfigurerUtils.getTokenGenerator(httpSecurity);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    OAuth2AuthorizationCodeAuthenticationProvider authorizationCodeAuthenticationProvider =</span></span>
<span class="line"><span>        new OAuth2AuthorizationCodeAuthenticationProvider(authorizationService, tokenGenerator);</span></span>
<span class="line"><span>    SessionRegistry sessionRegistry = httpSecurity.getSharedObject(SessionRegistry.class);</span></span>
<span class="line"><span>    if (sessionRegistry != null) {</span></span>
<span class="line"><span>      authorizationCodeAuthenticationProvider.setSessionRegistry(sessionRegistry);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    authenticationProviders.add(authorizationCodeAuthenticationProvider);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    OAuth2RefreshTokenAuthenticationProvider refreshTokenAuthenticationProvider =</span></span>
<span class="line"><span>        new OAuth2RefreshTokenAuthenticationProvider(authorizationService, tokenGenerator);</span></span>
<span class="line"><span>    authenticationProviders.add(refreshTokenAuthenticationProvider);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    OAuth2ClientCredentialsAuthenticationProvider clientCredentialsAuthenticationProvider =</span></span>
<span class="line"><span>        new OAuth2ClientCredentialsAuthenticationProvider(authorizationService, tokenGenerator);</span></span>
<span class="line"><span>    authenticationProviders.add(clientCredentialsAuthenticationProvider);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    OAuth2DeviceCodeAuthenticationProvider deviceCodeAuthenticationProvider =</span></span>
<span class="line"><span>        new OAuth2DeviceCodeAuthenticationProvider(authorizationService, tokenGenerator);</span></span>
<span class="line"><span>    authenticationProviders.add(deviceCodeAuthenticationProvider);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return authenticationProviders;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br></div></div><p>可以看到就是加入4个AuthenticationProvider，分别对应前面的那四种授权模式，我们就抽出授权码认证模式的来看一下它的处理流程。</p><div class="language-OAuth2AuthorizationCodeAuthenticationProvider vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationCodeAuthenticationProvider</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationCodeAuthenticationProvider implements AuthenticationProvider {</span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	public Authentication authenticate(Authentication authentication) throws AuthenticationException {</span></span>
<span class="line"><span>    // 通过Code获取前面授权码认证的信息</span></span>
<span class="line"><span>		OAuth2Authorization authorization = this.authorizationService.findByToken(</span></span>
<span class="line"><span>			authorizationCodeAuthentication.getCode(), AUTHORIZATION_CODE_TOKEN_TYPE);</span></span>
<span class="line"><span>    // 获取Token信息</span></span>
<span class="line"><span>    OAuth2Authorization.Token&lt;OAuth2AuthorizationCode&gt; authorizationCode =</span></span>
<span class="line"><span>      authorization.getToken(OAuth2AuthorizationCode.class);</span></span>
<span class="line"><span>    // 获取认证请求</span></span>
<span class="line"><span>    OAuth2AuthorizationRequest authorizationRequest = authorization.getAttribute(</span></span>
<span class="line"><span>      OAuth2AuthorizationRequest.class.getName());</span></span>
<span class="line"><span>    // 获取认证用户的信息</span></span>
<span class="line"><span>    Authentication principal = authorization.getAttribute(Principal.class.getName());</span></span>
<span class="line"><span>    // 生成AccessToken </span></span>
<span class="line"><span>		OAuth2TokenContext tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.ACCESS_TOKEN).build();</span></span>
<span class="line"><span>		OAuth2Token generatedAccessToken = this.tokenGenerator.generate(tokenContext);</span></span>
<span class="line"><span>    OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER,</span></span>
<span class="line"><span>      generatedAccessToken.getTokenValue(), generatedAccessToken.getIssuedAt(),</span></span>
<span class="line"><span>      generatedAccessToken.getExpiresAt(), tokenContext.getAuthorizedScopes());</span></span>
<span class="line"><span>    if (generatedAccessToken instanceof ClaimAccessor) {</span></span>
<span class="line"><span>			authorizationBuilder.token(accessToken, (metadata) -&gt;</span></span>
<span class="line"><span>					metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, ((ClaimAccessor) generatedAccessToken).getClaims()));</span></span>
<span class="line"><span>		} else {</span></span>
<span class="line"><span>			authorizationBuilder.accessToken(accessToken);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>    // 生成refreshToken</span></span>
<span class="line"><span>    tokenContext = tokenContextBuilder.tokenType(OAuth2TokenType.REFRESH_TOKEN).build();</span></span>
<span class="line"><span>    OAuth2Token generatedRefreshToken = this.tokenGenerator.generate(tokenContext);</span></span>
<span class="line"><span>    authorizationBuilder.refreshToken(refreshToken);</span></span>
<span class="line"><span>    // 生成idToken  </span></span>
<span class="line"><span>    tokenContext = tokenContextBuilder</span></span>
<span class="line"><span>      .tokenType(ID_TOKEN_TOKEN_TYPE)</span></span>
<span class="line"><span>      .authorization(authorizationBuilder.build())	// ID token customizer may need access to the access token and/or refresh token</span></span>
<span class="line"><span>      .build();</span></span>
<span class="line"><span>    // @formatter:on</span></span>
<span class="line"><span>    // 构建OAuth2Token</span></span>
<span class="line"><span>    OAuth2Token generatedIdToken = this.tokenGenerator.generate(tokenContext);</span></span>
<span class="line"><span>    idToken = new OidcIdToken(generatedIdToken.getTokenValue(), generatedIdToken.getIssuedAt(),</span></span>
<span class="line"><span>      generatedIdToken.getExpiresAt(), ((Jwt) generatedIdToken).getClaims());</span></span>
<span class="line"><span>		authorizationBuilder.token(idToken, (metadata) -&gt;</span></span>
<span class="line"><span>       metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, idToken.getClaims()));</span></span>
<span class="line"><span>    // 构建authorization</span></span>
<span class="line"><span>    authorization = authorizationBuilder.build();</span></span>
<span class="line"><span>    // 保存authorization</span></span>
<span class="line"><span>    this.authorizationService.save(authorization);</span></span>
<span class="line"><span>    return new OAuth2AccessTokenAuthenticationToken(</span></span>
<span class="line"><span>			registeredClient, clientPrincipal, accessToken, refreshToken, additionalParameters);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br></div></div><p>这里核心的点就是tokenGenerator这个Token生成器。我们看看这个tokenGenerator是什么。</p><div class="language-OAuth2TokenEndpointConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2TokenEndpointConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2TokenEndpointConfigurer extends AbstractOAuth2Configurer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static List&lt;AuthenticationProvider&gt; createDefaultAuthenticationProviders(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    List&lt;AuthenticationProvider&gt; authenticationProviders = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    OAuth2AuthorizationService authorizationService = OAuth2ConfigurerUtils.getAuthorizationService(httpSecurity);</span></span>
<span class="line"><span>    OAuth2TokenGenerator&lt;? extends OAuth2Token&gt; tokenGenerator = OAuth2ConfigurerUtils.getTokenGenerator(httpSecurity);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br></div></div><p>可以看到是通过OAuth2ConfigurerUtils#getTokenGenerator获取的，我们看看这个方法。</p><div class="language-OAuth2ConfigurerUtils vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2ConfigurerUtils</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>final class OAuth2ConfigurerUtils {</span></span>
<span class="line"><span>  @SuppressWarnings(&quot;unchecked&quot;)</span></span>
<span class="line"><span>  static OAuth2TokenGenerator&lt;? extends OAuth2Token&gt; getTokenGenerator(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>    // 首先从httpSecurity里面呢</span></span>
<span class="line"><span>    OAuth2TokenGenerator&lt;? extends OAuth2Token&gt; tokenGenerator = httpSecurity.getSharedObject(OAuth2TokenGenerator.class);</span></span>
<span class="line"><span>    if (tokenGenerator == null) {</span></span>
<span class="line"><span>      // 从ApplicationContext里面拿</span></span>
<span class="line"><span>      tokenGenerator = getOptionalBean(httpSecurity, OAuth2TokenGenerator.class);</span></span>
<span class="line"><span>      if (tokenGenerator == null) {</span></span>
<span class="line"><span>        // jwtGenerator</span></span>
<span class="line"><span>        JwtGenerator jwtGenerator = getJwtGenerator(httpSecurity);</span></span>
<span class="line"><span>        // accessTokenGenerator</span></span>
<span class="line"><span>        OAuth2AccessTokenGenerator accessTokenGenerator = new OAuth2AccessTokenGenerator();</span></span>
<span class="line"><span>        OAuth2TokenCustomizer&lt;OAuth2TokenClaimsContext&gt; accessTokenCustomizer = getAccessTokenCustomizer(httpSecurity);</span></span>
<span class="line"><span>        if (accessTokenCustomizer != null) {</span></span>
<span class="line"><span>          accessTokenGenerator.setAccessTokenCustomizer(accessTokenCustomizer);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        // refreshTokenGenerator</span></span>
<span class="line"><span>        OAuth2RefreshTokenGenerator refreshTokenGenerator = new OAuth2RefreshTokenGenerator();</span></span>
<span class="line"><span>        if (jwtGenerator != null) {</span></span>
<span class="line"><span>          tokenGenerator = new DelegatingOAuth2TokenGenerator(</span></span>
<span class="line"><span>              jwtGenerator, accessTokenGenerator, refreshTokenGenerator);</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>          tokenGenerator = new DelegatingOAuth2TokenGenerator(</span></span>
<span class="line"><span>              accessTokenGenerator, refreshTokenGenerator);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      httpSecurity.setSharedObject(OAuth2TokenGenerator.class, tokenGenerator);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return tokenGenerator;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br></div></div><p>这里我门跟一下jwtGenerator的获取过程，跟进getJwtGenerator里面查看。</p><div class="language-OAuth2ConfigurerUtils vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2ConfigurerUtils</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>private static JwtGenerator getJwtGenerator(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>  JwtGenerator jwtGenerator = httpSecurity.getSharedObject(JwtGenerator.class);</span></span>
<span class="line"><span>  if (jwtGenerator == null) {</span></span>
<span class="line"><span>    JwtEncoder jwtEncoder = getJwtEncoder(httpSecurity);</span></span>
<span class="line"><span>    if (jwtEncoder != null) {</span></span>
<span class="line"><span>      jwtGenerator = new JwtGenerator(jwtEncoder);</span></span>
<span class="line"><span>      OAuth2TokenCustomizer&lt;JwtEncodingContext&gt; jwtCustomizer = getJwtCustomizer(httpSecurity);</span></span>
<span class="line"><span>      if (jwtCustomizer != null) {</span></span>
<span class="line"><span>        jwtGenerator.setJwtCustomizer(jwtCustomizer);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      httpSecurity.setSharedObject(JwtGenerator.class, jwtGenerator);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return jwtGenerator;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>private static JwtEncoder getJwtEncoder(HttpSecurity httpSecurity) {</span></span>
<span class="line"><span>  JwtEncoder jwtEncoder = httpSecurity.getSharedObject(JwtEncoder.class);</span></span>
<span class="line"><span>  if (jwtEncoder == null) {</span></span>
<span class="line"><span>    jwtEncoder = getOptionalBean(httpSecurity, JwtEncoder.class);</span></span>
<span class="line"><span>    if (jwtEncoder == null) {</span></span>
<span class="line"><span>      JWKSource&lt;SecurityContext&gt; jwkSource = getJwkSource(httpSecurity);</span></span>
<span class="line"><span>      if (jwkSource != null) {</span></span>
<span class="line"><span>        jwtEncoder = new NimbusJwtEncoder(jwkSource);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (jwtEncoder != null) {</span></span>
<span class="line"><span>      httpSecurity.setSharedObject(JwtEncoder.class, jwtEncoder);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return jwtEncoder;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br></div></div><p>可以看到其实最终的就是返回了一个NimbusJwtEncoder，里面有好多配置是可以我们自定义的，这里我们回看AuthorizationServerConfig的配置</p><div class="language-AuthorizationServerConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthorizationServerConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class AuthorizationServerConfig {</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public OAuth2TokenCustomizer&lt;JwtEncodingContext&gt; idTokenCustomizer() {</span></span>
<span class="line"><span>    return new FederatedIdentityIdTokenCustomizer();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public JWKSource&lt;SecurityContext&gt; jwkSource() {</span></span>
<span class="line"><span>    RSAKey rsaKey = Jwks.generateRsa();</span></span>
<span class="line"><span>    JWKSet jwkSet = new JWKSet(rsaKey);</span></span>
<span class="line"><span>    return (jwkSelector, securityContext) -&gt; jwkSelector.select(jwkSet);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  public JwtDecoder jwtDecoder(JWKSource&lt;SecurityContext&gt; jwkSource) {</span></span>
<span class="line"><span>    return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br></div></div><p>可以看到自定了jwtCustomizer, JWKSource, JwtDecoder，这部分可以扩展出很多跟JWT相关的功能配置，后面再看看有没有必要讲一下。</p><h2 id="token格式" tabindex="-1">Token格式 <a class="header-anchor" href="#token格式" aria-label="Permalink to &quot;Token格式&quot;">​</a></h2><p>好了，整一个认证流程这里就讲完了，我们看看最终返回的Token是怎么样的吧。这里我们使用ApiFox来给大家看一下，主要是从认证服务器获取Code码之后，再调一个认证接口获取token。</p><p>我们先关掉demo-client和messages-resource项目，只保留认证服务器项目。然后浏览器访问以下地址。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>http://127.0.0.1:9000/oauth2/authorize?client_id=messaging-client&amp;response_type=code&amp;scope=message.read&amp;redirect_uri=http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>在认证服务器登录成功之后会跳转以下地址。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc?code=HlzwpVevk3WyDp5Lk3Fu0mRsHE3ffJgwPWs9KaQe3CJNj-aYmFkopUrqEZmwnIkxCKvPJu8rzfL5xE1fNmPex1lT_XOo48T8ENyoNH6us_m4ni85gSZG9l7Ts6ZBTAFS</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>我们主要要获取code后面的那串字符串，然后打开Apifox，新建一个接口。</p><img src="`+u+'" alt="access-token"><ul><li>URL: <a href="http://127.0.0.1:9000/oauth2/token" target="_blank" rel="noreferrer">http://127.0.0.1:9000/oauth2/token</a></li><li>grant_type: authorization_code</li><li>redirect_uri: <a href="http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc" target="_blank" rel="noreferrer">http://127.0.0.1:8080/login/oauth2/code/messaging-client-oidc</a></li><li>code: 前面的Code</li></ul><p>注意，Auth那里要填写客户端的名字跟密码。</p><img src="'+b+'" width="500" alt="auth-secret"><p>具体看AuthorizationServerConfig中的RegisteredClientRepository定义的clientId跟clientSecret</p><p>然后我们上JWT的官网看看access_token跟refresh_token都是什么信息，具体网站点击<a href="https://jwt.io/" target="_blank" rel="noreferrer">此处</a></p><img src="'+h+`" width="500" alt="access_token"><p>如果了解ID Token的就知道框框里面的就是一个ID Token的格式。</p><p>注意refreshToken不是一个JWT格式的数据（虽然也可以），只是用来刷新access_token的令牌。</p><h2 id="获取message信息" tabindex="-1">获取Message信息 <a class="header-anchor" href="#获取message信息" aria-label="Permalink to &quot;获取Message信息&quot;">​</a></h2><p>这里讲一下项目演示那里，点击Authorze的下拉选项，选中Authorization Code认证，可以发现认证成功，显示了Message信息，这个流程。</p><p>可以看到访问<a href="http://127.0.0.1:8080/authorize?grant_type=authorization_code" target="_blank" rel="noreferrer">http://127.0.0.1:8080/authorize?grant_type=authorization_code</a> 这个接口，这是Demo-Client的一个Controller，我们看一下代码。</p><div class="language-AuthorizationController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">AuthorizationController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Controller</span></span>
<span class="line"><span>public class AuthorizationController {</span></span>
<span class="line"><span>	public AuthorizationController(WebClient webClient,</span></span>
<span class="line"><span>			@Value(&quot;\${messages.base-uri}&quot;) String messagesBaseUri) {</span></span>
<span class="line"><span>		this.webClient = webClient;</span></span>
<span class="line"><span>		this.messagesBaseUri = messagesBaseUri;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @GetMapping(value = &quot;/authorize&quot;, params = &quot;grant_type=authorization_code&quot;)</span></span>
<span class="line"><span>  public String authorizationCodeGrant(Model model,</span></span>
<span class="line"><span>      @RegisteredOAuth2AuthorizedClient(&quot;messaging-client-authorization-code&quot;)</span></span>
<span class="line"><span>          OAuth2AuthorizedClient authorizedClient) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String[] messages = this.webClient</span></span>
<span class="line"><span>        .get()</span></span>
<span class="line"><span>        .uri(this.messagesBaseUri)</span></span>
<span class="line"><span>        .attributes(oauth2AuthorizedClient(authorizedClient))</span></span>
<span class="line"><span>        .retrieve()</span></span>
<span class="line"><span>        .bodyToMono(String[].class)</span></span>
<span class="line"><span>        .block();</span></span>
<span class="line"><span>    model.addAttribute(&quot;messages&quot;, messages);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return &quot;index&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><p>其中messagesBaseUri是从配置文件中注入进来的，就是messages.base-uri的值，我们看一下是什么, 这里就是资源服务器的信息</p><div class="language-application.yml vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">application.yml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>messages:</span></span>
<span class="line"><span>  base-uri: http://127.0.0.1:8090/messages</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>注意oauth2AuthorizedClient已经带有accessToken的信息了，所以访问资源服务器会带上accessToken。</p><h2 id="资源服务器" tabindex="-1">资源服务器 <a class="header-anchor" href="#资源服务器" aria-label="Permalink to &quot;资源服务器&quot;">​</a></h2><p>资源服务器要做的功能很简单，就是有用户访问资源服务器的时候，校验用户的accessToken是否有效，如果有效且有权限那么就返回对应的资源。</p><h3 id="oauth2resourceserverconfigurer" tabindex="-1">OAuth2ResourceServerConfigurer <a class="header-anchor" href="#oauth2resourceserverconfigurer" aria-label="Permalink to &quot;OAuth2ResourceServerConfigurer&quot;">​</a></h3><p>我们看一下资源服务器的配置文件，具体如下所示</p><div class="language-ResourceServerConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ResourceServerConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@EnableWebSecurity</span></span>
<span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>public class ResourceServerConfig {</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests(authorizeHttpRequests-&gt;authorizeHttpRequests.anyRequest().authenticated())</span></span>
<span class="line"><span>    http.oauth2ResourceServer(oauth2ResourceServer-&gt;oauth2ResourceServer.jwt(Customizer.withDefaults()));</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>可以看到调用了oauth2ResourceServer这个方法，我们看一下这个方法。</p><div class="language-HttpSecurity vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">HttpSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public HttpSecurity oauth2ResourceServer(Customizer&lt;OAuth2ResourceServerConfigurer&lt;HttpSecurity&gt;&gt; oauth2ResourceServerCustomizer) throws Exception {</span></span>
<span class="line"><span>  OAuth2ResourceServerConfigurer&lt;HttpSecurity&gt; configurer = (OAuth2ResourceServerConfigurer)this.getOrApply(new OAuth2ResourceServerConfigurer(this.getContext()));</span></span>
<span class="line"><span>  this.postProcess(configurer);</span></span>
<span class="line"><span>  oauth2ResourceServerCustomizer.customize(configurer);</span></span>
<span class="line"><span>  return this;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>可以看到引入了OAuth2ResourceServerConfigurer这个配置类，我们看看这个配置类做了什么事情。</p><div class="language-OAuth2ResourceServerConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2ResourceServerConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2ResourceServerConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;OAuth2ResourceServerConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void configure(H http) {</span></span>
<span class="line"><span>    BearerTokenResolver bearerTokenResolver = getBearerTokenResolver();</span></span>
<span class="line"><span>    this.requestMatcher.setBearerTokenResolver(bearerTokenResolver);</span></span>
<span class="line"><span>    BearerTokenAuthenticationFilter filter = new BearerTokenAuthenticationFilter(resolver);</span></span>
<span class="line"><span>    filter.setBearerTokenResolver(bearerTokenResolver);</span></span>
<span class="line"><span>    filter.setAuthenticationEntryPoint(this.authenticationEntryPoint);</span></span>
<span class="line"><span>    filter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());</span></span>
<span class="line"><span>    http.addFilter(filter);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>可以看到是往过滤器中加入了BearerTokenAuthenticationFilter这个过滤器。</p><h3 id="bearertokenauthenticationfilter" tabindex="-1">BearerTokenAuthenticationFilter <a class="header-anchor" href="#bearertokenauthenticationfilter" aria-label="Permalink to &quot;BearerTokenAuthenticationFilter&quot;">​</a></h3><p>接下来我们看一下BearerTokenAuthenticationFilter这个过滤器做的事情。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class BearerTokenAuthenticationFilter extends OncePerRequestFilter {</span></span>
<span class="line"><span>  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {</span></span>
<span class="line"><span>    String token;</span></span>
<span class="line"><span>    // 解析Token</span></span>
<span class="line"><span>    token = this.bearerTokenResolver.resolve(request);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 如果Token为空，则放行</span></span>
<span class="line"><span>    if (token == null) {</span></span>
<span class="line"><span>      filterChain.doFilter(request, response);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 构建BearerTokenAuthenticationToken</span></span>
<span class="line"><span>    BearerTokenAuthenticationToken authenticationRequest = new BearerTokenAuthenticationToken(token);</span></span>
<span class="line"><span>    authenticationRequest.setDetails(this.authenticationDetailsSource.buildDetails(request));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    AuthenticationManager authenticationManager = this.authenticationManagerResolver.resolve(request);</span></span>
<span class="line"><span>    // 认证请求</span></span>
<span class="line"><span>    Authentication authenticationResult = authenticationManager.authenticate(authenticationRequest);</span></span>
<span class="line"><span>    SecurityContext context = this.securityContextHolderStrategy.createEmptyContext();</span></span>
<span class="line"><span>    context.setAuthentication(authenticationResult);</span></span>
<span class="line"><span>    this.securityContextHolderStrategy.setContext(context);</span></span>
<span class="line"><span>    this.securityContextRepository.saveContext(context, request, response);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br></div></div><p>可以看到其实校验流程跟之前提到的那些过滤差不多，我们看看BearerTokenAuthenticationToken对应的Provider</p><div class="language-OAuth2ResourceServerConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2ResourceServerConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2ResourceServerConfigurer&lt;H extends HttpSecurityBuilder&lt;H&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractHttpConfigurer&lt;OAuth2ResourceServerConfigurer&lt;H&gt;, H&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void init(H http) {</span></span>
<span class="line"><span>    .....</span></span>
<span class="line"><span>    AuthenticationProvider authenticationProvider = getAuthenticationProvider();</span></span>
<span class="line"><span>    if (authenticationProvider != null) {</span></span>
<span class="line"><span>      http.authenticationProvider(authenticationProvider);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  AuthenticationProvider getAuthenticationProvider() {</span></span>
<span class="line"><span>    if (this.jwtConfigurer != null) {</span></span>
<span class="line"><span>      return this.jwtConfigurer.getAuthenticationProvider();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    if (this.opaqueTokenConfigurer != null) {</span></span>
<span class="line"><span>      return this.opaqueTokenConfigurer.getAuthenticationProvider();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  AuthenticationProvider getAuthenticationProvider() {</span></span>
<span class="line"><span>    if (this.authenticationManager != null) {</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    JwtDecoder decoder = getJwtDecoder();</span></span>
<span class="line"><span>    Converter&lt;Jwt, ? extends AbstractAuthenticationToken&gt; jwtAuthenticationConverter = getJwtAuthenticationConverter();</span></span>
<span class="line"><span>    JwtAuthenticationProvider provider = new JwtAuthenticationProvider(decoder);</span></span>
<span class="line"><span>    provider.setJwtAuthenticationConverter(jwtAuthenticationConverter);</span></span>
<span class="line"><span>    return postProcess(provider);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  Converter&lt;Jwt, ? extends AbstractAuthenticationToken&gt; getJwtAuthenticationConverter() {</span></span>
<span class="line"><span>    if (this.jwtAuthenticationConverter == null) {</span></span>
<span class="line"><span>      if (this.context.getBeanNamesForType(JwtAuthenticationConverter.class).length &gt; 0) {</span></span>
<span class="line"><span>        this.jwtAuthenticationConverter = this.context.getBean(JwtAuthenticationConverter.class);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      else {</span></span>
<span class="line"><span>        this.jwtAuthenticationConverter = new JwtAuthenticationConverter();</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return this.jwtAuthenticationConverter;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br></div></div><p>由于我们在ResourceServerConfig中配置jwt，所以用的是jwtConfigurer, 用的JwtAuthenticationProvider，我们大致看一下逻辑就好了。</p><div class="language-JwtAuthenticationProvider vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">JwtAuthenticationProvider</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class JwtAuthenticationProvider implements AuthenticationProvider {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Authentication authenticate(Authentication authentication) throws AuthenticationException {</span></span>
<span class="line"><span>    BearerTokenAuthenticationToken bearer = (BearerTokenAuthenticationToken) authentication;</span></span>
<span class="line"><span>    Jwt jwt = getJwt(bearer);</span></span>
<span class="line"><span>    AbstractAuthenticationToken token = this.jwtAuthenticationConverter.convert(jwt);</span></span>
<span class="line"><span>    if (token.getDetails() == null) {</span></span>
<span class="line"><span>      token.setDetails(bearer.getDetails());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    this.logger.debug(&quot;Authenticated token&quot;);</span></span>
<span class="line"><span>    return token;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>可以看到其实就是用JwtAuthenticationConverter来对authentication进行认证。大家有兴趣的话就追一下JwtAuthenticationConverter的代码吧，上面有讲过Converter的原理了。</p><h2 id="jwt公钥的获取" tabindex="-1">JWT公钥的获取 <a class="header-anchor" href="#jwt公钥的获取" aria-label="Permalink to &quot;JWT公钥的获取&quot;">​</a></h2><p>了解JWT的都知道，认证服务器用私钥加密数据，资源服务器要用公钥来解密，资源服务器要怎么获取公钥，大家可能会说，很简单啊，我在生成JTW公私钥的时候，把公钥拷给资源服务器不就好啦，但是如果资源服务器很多的情况，手动复制很容易出错的啊。</p><p>之前提到认证服务器的端点信息时有一个URL，&quot;/oauth2/jwks&quot;，可以通过这个URL直接从认证服务器拉取公钥，是不是很简单。</p><p>我们看看资源服务器是在启动阶段拉取这个信息的。</p><p>查看spring boot的自动配置文件，可以看到引入了下面这个依赖</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>一步一步点进去看看。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Import({ Oauth2ResourceServerConfiguration.JwtConfiguration.class,</span></span>
<span class="line"><span>		Oauth2ResourceServerConfiguration.OpaqueTokenConfiguration.class })</span></span>
<span class="line"><span>public class OAuth2ResourceServerAutoConfiguration {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>由于我们是使用JWT的，所以看JwtConfiguration这个配置。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>class Oauth2ResourceServerConfiguration {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>	@ConditionalOnClass(JwtDecoder.class)</span></span>
<span class="line"><span>	@Import({ OAuth2ResourceServerJwtConfiguration.JwtDecoderConfiguration.class,</span></span>
<span class="line"><span>			OAuth2ResourceServerJwtConfiguration.OAuth2SecurityFilterChainConfiguration.class })</span></span>
<span class="line"><span>	static class JwtConfiguration {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>查看JwtDecoderConfiguration这个配置类</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>@ConditionalOnMissingBean(JwtDecoder.class)</span></span>
<span class="line"><span>static class JwtDecoderConfiguration {</span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  @ConditionalOnProperty(name = &quot;spring.security.oauth2.resourceserver.jwt.jwk-set-uri&quot;)</span></span>
<span class="line"><span>  JwtDecoder jwtDecoderByJwkKeySetUri(ObjectProvider&lt;JwkSetUriJwtDecoderBuilderCustomizer&gt; customizers) {</span></span>
<span class="line"><span>    // 创建nimbusJwtDecoder</span></span>
<span class="line"><span>    JwkSetUriJwtDecoderBuilder builder = NimbusJwtDecoder.withJwkSetUri(this.properties.getJwkSetUri())</span></span>
<span class="line"><span>      .jwsAlgorithms(this::jwsAlgorithms);</span></span>
<span class="line"><span>    customizers.orderedStream().forEach((customizer) -&gt; customizer.customize(builder));</span></span>
<span class="line"><span>    NimbusJwtDecoder nimbusJwtDecoder = builder.build();</span></span>
<span class="line"><span>    String issuerUri = this.properties.getIssuerUri();</span></span>
<span class="line"><span>    Supplier&lt;OAuth2TokenValidator&lt;Jwt&gt;&gt; defaultValidator = (issuerUri != null)</span></span>
<span class="line"><span>        ? () -&gt; JwtValidators.createDefaultWithIssuer(issuerUri) : JwtValidators::createDefault;</span></span>
<span class="line"><span>    nimbusJwtDecoder.setJwtValidator(getValidators(defaultValidator));</span></span>
<span class="line"><span>    return nimbusJwtDecoder;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>可以看到这里返回了nimbusJwtDecoder解码的Bean，并且引入了spring.security.oauth2.resourceserver.jwt.jwk-set-uri这个配置，很明显就是在这里拉取的，具体流程这里就不细讲了，跟前面拉取认证过滤器的流程差不多，我们看看配置文件jwt.jwk-set-uri的定义</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spring:</span></span>
<span class="line"><span>  security:</span></span>
<span class="line"><span>    oauth2:</span></span>
<span class="line"><span>      resourceserver:</span></span>
<span class="line"><span>        jwt:</span></span>
<span class="line"><span>          issuer-uri: http://192.168.1.30:9000</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>这里的获取是在第一次Provider认证的时候获取的，有点懒加载的意思, 具体在哪里放到JwtAuthenticationProvider中的，可以看一下JwtAuthenticationProvider的初始化函数。</p><div class="language-OAuth2ResourceServerConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2ResourceServerConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>AuthenticationProvider getAuthenticationProvider() {</span></span>
<span class="line"><span>  if (this.authenticationManager != null) {</span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line highlighted"><span>  JwtDecoder decoder = getJwtDecoder();</span></span>
<span class="line"><span>  Converter&lt;Jwt, ? extends AbstractAuthenticationToken&gt; jwtAuthenticationConverter = getJwtAuthenticationConverter();</span></span>
<span class="line"><span>  JwtAuthenticationProvider provider = new JwtAuthenticationProvider(decoder);</span></span>
<span class="line"><span>  provider.setJwtAuthenticationConverter(jwtAuthenticationConverter);</span></span>
<span class="line"><span>  return postProcess(provider);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div>`,187)]))}const O=a(d,[["render",m]]);export{z as __pageData,O as default};
