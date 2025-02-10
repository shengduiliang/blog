import{_ as s,c as a,a0 as e,o as i}from"./chunks/framework.P9qPzDnn.js";const p="/assets/github-developers.DqViBNmk.png",t="/assets/new-github-oauth-app.CFuM6V_d.png",l="/assets/oauth2_login_demo.DJyRyVGU.png",r="/assets/github-login.LF_HT-Mh.png",o="/assets/github-authetication.CNxlosm8.png",u="/assets/oauth2-github-arch.DV39lixE.png",v=JSON.parse('{"title":"OAuth2客户端认证流程","description":"","frontmatter":{},"headers":[],"relativePath":"spring-security/oauth2-client.md","filePath":"spring-security/oauth2-client.md"}'),c={name:"spring-security/oauth2-client.md"};function b(h,n,d,g,m,A){return i(),a("div",null,n[0]||(n[0]=[e('<h1 id="oauth2客户端认证流程" tabindex="-1">OAuth2客户端认证流程 <a class="header-anchor" href="#oauth2客户端认证流程" aria-label="Permalink to &quot;OAuth2客户端认证流程&quot;">​</a></h1><h2 id="github授权登录" tabindex="-1">Github授权登录 <a class="header-anchor" href="#github授权登录" aria-label="Permalink to &quot;Github授权登录&quot;">​</a></h2><p>通过一个Github授权登录来体验一下OAuth2认证流程</p><h3 id="创建github-oauth-apps" tabindex="-1">创建Github OAuth Apps <a class="header-anchor" href="#创建github-oauth-apps" aria-label="Permalink to &quot;创建Github OAuth Apps&quot;">​</a></h3><p>首先，我们要把第三方应用的注册信息注册到github上，打开github的<a href="https://github.com/settings/developers" target="_blank" rel="noreferrer">开发者设置</a>, 选择OAuth Apps选项。</p><img src="'+p+'" alt="github-develops" style="border:1px solid;"><p>可以看到我这里已经有一个OAuth App了，如果想要创建一个，那么点击右上角的New OAuth App按钮创建一个应用。</p><img src="'+t+'" width="400" alt="new-github-oauth-app" style="border:1px solid;"><p>创建完应用之后就可以回到开发者设置那里查看已经注册的OAuth Apps了，这里有一个，点击oauth2_login_demo, 进入App页面</p><img src="'+l+`" width="500" alt="oauth2_login_demo" style="border:1px solid;"><p>主要看Client ID，还有Client Secrets，注意Client Secrets只有第一次生成的时候可以看到，所以生成的时候要保存好。</p><h3 id="创建spring-security项目" tabindex="-1">创建Spring Security项目 <a class="header-anchor" href="#创建spring-security项目" aria-label="Permalink to &quot;创建Spring Security项目&quot;">​</a></h3><p>新建一个Spring Boot项目，依赖项加入Web，Spring Security和OAuth2 Client依赖，在pom.xml里面可以查看引入的依赖项：</p><div class="language-pom.xml vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">pom.xml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>  &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;</span></span>
<span class="line"><span>  &lt;artifactId&gt;spring-boot-starter-oauth2-client&lt;/artifactId&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span>
<span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>  &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;</span></span>
<span class="line"><span>  &lt;artifactId&gt;spring-boot-starter-security&lt;/artifactId&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span>
<span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>  &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;</span></span>
<span class="line"><span>  &lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>新建一个HelloController，添加一个hello接口</p><div class="language-HelloController vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">HelloController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@RestController</span></span>
<span class="line"><span>public class HelloController {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @GetMapping(&quot;/hello&quot;)</span></span>
<span class="line"><span>  public Authentication hello() {</span></span>
<span class="line"><span>    return SecurityContextHolder.getContext().getAuthentication();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>SecurityConfig的配置如下所示：</p><div class="language-SecurityConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class SecurityConfig {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Bean</span></span>
<span class="line"><span>  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>    http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>    http.oauth2Login(Customizer.withDefaults());</span></span>
<span class="line"><span>    return http.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br></div></div><p>然后我们修改application.properties文件，加入github的配置，很简单，加入下面两个即可，注意是复制github上的Client ID跟Client Secrets</p><div class="language-application.properties vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">application.properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spring.application.name=spring-security-oauth2</span></span>
<span class="line"><span>spring.security.oauth2.client.registration.github.client-id=Ov23liPU4842Pd5Ui38g</span></span>
<span class="line"><span>spring.security.oauth2.client.registration.github.client-secret=15ec180843aa59464e41e2db68207f63f5af6464</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>启动项目，然后访问hello接口, 可以看到跳转到了github的授权网页，然后输入github的用户名跟密码进行授权。</p><img src="`+r+'" width="300" alt="github-login" style="border:1px solid;"><p>授权成功后就会跳转到hello接口，可以看到返回如下，表示获取用户的认证信息成功。</p><img src="'+o+'" width="500" alt="github-authetication" style="border:1px solid;"><h2 id="整体登录结构图" tabindex="-1">整体登录结构图 <a class="header-anchor" href="#整体登录结构图" aria-label="Permalink to &quot;整体登录结构图&quot;">​</a></h2><p><img src="'+u+`" alt="oauth2-github-arch"></p><h2 id="securityconfig" tabindex="-1">SecurityConfig <a class="header-anchor" href="#securityconfig" aria-label="Permalink to &quot;SecurityConfig&quot;">​</a></h2><p>首先我们看Spring Security的配置文件，具体代码如下所示:</p><div class="language-SecurityConfig vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">SecurityConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Bean</span></span>
<span class="line"><span>SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {</span></span>
<span class="line"><span>  http.authorizeHttpRequests((requests) -&gt; requests.anyRequest().authenticated());</span></span>
<span class="line"><span>  http.oauth2Login(Customizer.withDefaults());</span></span>
<span class="line"><span>  return http.build();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>可以看到调用了oauth2Login这个方法，我们进去看一下，代码如下：</p><div class="language-HttpSecurity vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">HttpSecurity</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public HttpSecurity oauth2Login(Customizer&lt;OAuth2LoginConfigurer&lt;HttpSecurity&gt;&gt; oauth2LoginCustomizer)</span></span>
<span class="line"><span>    throws Exception {</span></span>
<span class="line"><span>  oauth2LoginCustomizer.customize(getOrApply(new OAuth2LoginConfigurer&lt;&gt;()));</span></span>
<span class="line"><span>  return HttpSecurity.this;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>可以看到引入了OAuth2LoginConfigurer这个配置类。</p><h2 id="oauth2loginconfigurer" tabindex="-1">OAuth2LoginConfigurer <a class="header-anchor" href="#oauth2loginconfigurer" aria-label="Permalink to &quot;OAuth2LoginConfigurer&quot;">​</a></h2><p>首先我们查看一下这个配置类会往Spring Security注入什么过滤器，老规矩看他的init方法跟configure方法。</p><div class="language-OAuth2LoginConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2LoginConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2LoginConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractAuthenticationFilterConfigurer&lt;B, OAuth2LoginConfigurer&lt;B&gt;, OAuth2LoginAuthenticationFilter&gt; {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void init(B http) throws Exception {</span></span>
<span class="line"><span>    OAuth2LoginAuthenticationFilter authenticationFilter = new OAuth2LoginAuthenticationFilter(</span></span>
<span class="line"><span>    OAuth2ClientConfigurerUtils.getClientRegistrationRepository(this.getBuilder()),</span></span>
<span class="line"><span>    OAuth2ClientConfigurerUtils.getAuthorizedClientRepository(this.getBuilder()), this.loginProcessingUrl);</span></span>
<span class="line"><span>    authenticationFilter.setSecurityContextHolderStrategy(getSecurityContextHolderStrategy());</span></span>
<span class="line"><span>    // 设置认证过滤器OAuth2LoginAuthenticationFilter，将OAuth2LoginAuthenticationFilter设置为AbstractAuthenticationFilterConfigurer的authFilter</span></span>
<span class="line"><span>    this.setAuthenticationFilter(authenticationFilter);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void configure(B http) throws Exception {</span></span>
<span class="line"><span>    OAuth2AuthorizationRequestRedirectFilter authorizationRequestFilter;</span></span>
<span class="line"><span>    http.addFilter(this.postProcess(authorizationRequestFilter));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br></div></div><p>这里讲一下这两个过滤器的作用：</p><ul><li>OAuth2LoginAuthenticationFilter: OAuth2登录认证过滤器，在这个类对用户进行认证操作。</li><li>OAuth2AuthorizationRequestRedirectFilter: 这个过滤器负责将用户跳转到github授权。</li></ul><h2 id="clientregistrationrepository" tabindex="-1">ClientRegistrationRepository <a class="header-anchor" href="#clientregistrationrepository" aria-label="Permalink to &quot;ClientRegistrationRepository&quot;">​</a></h2><p>在讲解上面两个过滤器之前，先给大家讲解授权服务器信息保存的内容。</p><p>可以看到我们配置了Github登录的Client ID跟Client Secrets后，就可以帮我跳转Github进行授权了，那么Spring Security是怎么知道Github的授权地址，用户接口，令牌这些信息的呢。</p><h3 id="commonoauth2provider" tabindex="-1">CommonOAuth2Provider <a class="header-anchor" href="#commonoauth2provider" aria-label="Permalink to &quot;CommonOAuth2Provider&quot;">​</a></h3><p>由于授权地址，用户接口，令牌这些信息这些信息一般都不会变化，所以Spring Security将一些常用的第三方登录如Github, Google, Facebook的信息收集起来，保存在一个枚举类CommonOAuth2Provider中，当我们在application.properties里面配置Github的信息的时候，会自动选择这个枚举类里面的Github的设置，看一下这块代码</p><div class="language-CommonOAuth2Provider vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">CommonOAuth2Provider</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public enum CommonOAuth2Provider {</span></span>
<span class="line"><span>  GITHUB {</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public Builder getBuilder(String registrationId) {</span></span>
<span class="line"><span>      ClientRegistration.Builder builder = getBuilder(registrationId,</span></span>
<span class="line"><span>          ClientAuthenticationMethod.CLIENT_SECRET_BASIC, DEFAULT_REDIRECT_URL);</span></span>
<span class="line"><span>      builder.scope(&quot;read:user&quot;);</span></span>
<span class="line"><span>      builder.authorizationUri(&quot;https://github.com/login/oauth/authorize&quot;);</span></span>
<span class="line"><span>      builder.tokenUri(&quot;https://github.com/login/oauth/access_token&quot;);</span></span>
<span class="line"><span>      builder.userInfoUri(&quot;https://api.github.com/user&quot;);</span></span>
<span class="line"><span>      builder.userNameAttributeName(&quot;id&quot;);</span></span>
<span class="line"><span>      builder.clientName(&quot;GitHub&quot;);</span></span>
<span class="line"><span>      return builder;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  },</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>可以看到是返回来一个ClientRegistration.Builder, 很显然调用了他的builder方法之后，会返回一个ClientRegistration对象。</p><h3 id="clientregistration" tabindex="-1">ClientRegistration <a class="header-anchor" href="#clientregistration" aria-label="Permalink to &quot;ClientRegistration&quot;">​</a></h3><p>接下来我们看看ClientRegistration这个类的定义，代码如下：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class ClientRegistration implements Serializable {</span></span>
<span class="line"><span>  // 区分ClientRegistration，如Github就是github</span></span>
<span class="line"><span>  private String registrationId;</span></span>
<span class="line"><span>  private String clientId;</span></span>
<span class="line"><span>  private String clientSecret;</span></span>
<span class="line"><span>  // 权限认证方法</span></span>
<span class="line"><span>  private ClientAuthenticationMethod clientAuthenticationMethod;</span></span>
<span class="line"><span>  // 权限认证的方式</span></span>
<span class="line"><span>  private AuthorizationGrantType authorizationGrantType;</span></span>
<span class="line"><span>  // 认证成功后跳转的url</span></span>
<span class="line"><span>  private String redirectUri;</span></span>
<span class="line"><span>  // 跟授权服务器（github）获取的权限</span></span>
<span class="line"><span>  private Set&lt;String&gt; scopes = Collections.emptySet();</span></span>
<span class="line"><span>  private ProviderDetails providerDetails = new ProviderDetails();</span></span>
<span class="line"><span>  private String clientName;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><h3 id="clientregistrationrepository-1" tabindex="-1">ClientRegistrationRepository <a class="header-anchor" href="#clientregistrationrepository-1" aria-label="Permalink to &quot;ClientRegistrationRepository&quot;">​</a></h3><p>接下来我们就看一下我们在application.properties中配置的Github信息是怎么起作用的，打开spring boot关于spring security的自动配置文件</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>可以看到引入OAuth2ClientAutoConfiguration这个类，然后我们进到这个配置类看看</p><div class="language-OAuth2ClientAutoConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2ClientAutoConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Import({ OAuth2ClientRegistrationRepositoryConfiguration.class, OAuth2WebSecurityConfiguration.class })</span></span>
<span class="line"><span>public class OAuth2ClientAutoConfiguration {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>可以看到引入了OAuth2ClientRegistrationRepositoryConfiguration跟OAuth2WebSecurityConfiguration这两个配置类，这里我们看OAuth2ClientRegistrationRepositoryConfiguration</p><div class="language-OAuth2ClientRegistrationRepositoryConfiguration vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2ClientRegistrationRepositoryConfiguration</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration(proxyBeanMethods = false)</span></span>
<span class="line"><span>@EnableConfigurationProperties(OAuth2ClientProperties.class)</span></span>
<span class="line"><span>@Conditional(ClientsConfiguredCondition.class)</span></span>
<span class="line"><span>class OAuth2ClientRegistrationRepositoryConfiguration {</span></span>
<span class="line"><span>	@Bean</span></span>
<span class="line"><span>	@ConditionalOnMissingBean(ClientRegistrationRepository.class)</span></span>
<span class="line"><span>	InMemoryClientRegistrationRepository clientRegistrationRepository(OAuth2ClientProperties properties) {</span></span>
<span class="line"><span>		List&lt;ClientRegistration&gt; registrations = new ArrayList&lt;&gt;(</span></span>
<span class="line"><span>				new OAuth2ClientPropertiesMapper(properties).asClientRegistrations().values());</span></span>
<span class="line"><span>		return new InMemoryClientRegistrationRepository(registrations);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>可以看到注入了一个InMemoryClientRegistrationRepository的Bean。我们先看一下这个InMemoryClientRegistrationRepository的定义:</p><div class="language-InMemoryClientRegistrationRepository vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">InMemoryClientRegistrationRepository</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class InMemoryClientRegistrationRepository</span></span>
<span class="line"><span>		implements ClientRegistrationRepository, Iterable&lt;ClientRegistration&gt; {</span></span>
<span class="line"><span>  private final Map&lt;String, ClientRegistration&gt; registrations;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>可以看到实现了ClientRegistrationRepository这个接口，我们看这个接口</p><div class="language-ClientRegistrationRepository vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ClientRegistrationRepository</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface ClientRegistrationRepository {</span></span>
<span class="line"><span>  ClientRegistration findByRegistrationId(String registrationId);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>就只有一个方法，获取ClientRegistration，可以知道如果我们想要拿到ClientRegistration，可以实现这个接口的方法。InMemoryClientRegistrationRepository就是将ClientRegistration的信息保存在内存上的一个Map里面，然后从内存中查找。我们回看InMemoryClientRegistrationRepository这个bean的声明。</p><h3 id="inmemoryclientregistrationrepository" tabindex="-1">InMemoryClientRegistrationRepository <a class="header-anchor" href="#inmemoryclientregistrationrepository" aria-label="Permalink to &quot;InMemoryClientRegistrationRepository&quot;">​</a></h3><p>可以看到参数中注入了OAuth2ClientProperties这个属性，我们看看这个类的定义，如下所示:</p><div class="language-OAuth2ClientProperties vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2ClientProperties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@ConfigurationProperties(prefix = &quot;spring.security.oauth2.client&quot;)</span></span>
<span class="line"><span>public class OAuth2ClientProperties implements InitializingBean {</span></span>
<span class="line"><span>  // provider信息，如果需要获取token，需要该信息，先不讲</span></span>
<span class="line"><span>  private final Map&lt;String, Provider&gt; provider = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>  private final Map&lt;String, Registration&gt; registration = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>可以看到其实我们在application.properties中定义的github的信息会放入这里。</p><p>在InMemoryClientRegistrationRepository方法里面，调用了new OAuth2ClientPropertiesMapper(properties).asClientRegistrations().values()获取ClientRegistration的列表，因为ClientRegistration不止一个，然后基于这个列表构建出来一个InMemoryClientRegistrationRepository对象。</p><h3 id="oauth2clientpropertiesmapper" tabindex="-1">OAuth2ClientPropertiesMapper <a class="header-anchor" href="#oauth2clientpropertiesmapper" aria-label="Permalink to &quot;OAuth2ClientPropertiesMapper&quot;">​</a></h3><p>我们接下来看一下这个类，简单看一下代码实现:</p><div class="language-OAuth2ClientPropertiesMapper vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2ClientPropertiesMapper</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2ClientPropertiesMapper {</span></span>
<span class="line"><span>  private final OAuth2ClientProperties properties;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public Map&lt;String, ClientRegistration&gt; asClientRegistrations() {</span></span>
<span class="line"><span>    Map&lt;String, ClientRegistration&gt; clientRegistrations = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>    this.properties.getRegistration()</span></span>
<span class="line"><span>      .forEach((key, value) -&gt; clientRegistrations.put(key,</span></span>
<span class="line"><span>          getClientRegistration(key, value, this.properties.getProvider())));</span></span>
<span class="line"><span>    return clientRegistrations;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static ClientRegistration getClientRegistration(String registrationId,</span></span>
<span class="line"><span>      OAuth2ClientProperties.Registration properties, Map&lt;String, Provider&gt; providers) {</span></span>
<span class="line"><span>    Builder builder = getBuilderFromIssuerIfPossible(registrationId, properties.getProvider(), providers);</span></span>
<span class="line"><span>    if (builder == null) {</span></span>
<span class="line"><span>      // 这里是核心</span></span>
<span class="line"><span>      builder = getBuilder(registrationId, properties.getProvider(), providers);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 在这里调用ClientRegistration.Builder的build方法</span></span>
<span class="line"><span>    return builder.build();    </span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static Builder getBuilder(String registrationId, String configuredProviderId,</span></span>
<span class="line"><span>      Map&lt;String, Provider&gt; providers) {</span></span>
<span class="line"><span>    String providerId = (configuredProviderId != null) ? configuredProviderId : registrationId;</span></span>
<span class="line"><span>    CommonOAuth2Provider provider = getCommonProvider(providerId);</span></span>
<span class="line"><span>    Builder builder = (provider != null) ? provider.getBuilder(registrationId)</span></span>
<span class="line"><span>        : ClientRegistration.withRegistrationId(registrationId);</span></span>
<span class="line"><span>    if (providers.containsKey(providerId)) {</span></span>
<span class="line"><span>      return getBuilder(builder, providers.get(providerId));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return builder;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static CommonOAuth2Provider getCommonProvider(String providerId) {</span></span>
<span class="line"><span>    try {</span></span>
<span class="line"><span>      return ApplicationConversionService.getSharedInstance().convert(providerId, CommonOAuth2Provider.class);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    catch (ConversionException ex) {</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br></div></div><p>首先调用了getBuilderFromIssuerIfPossible这个方法获取builder，如果builder不为空则返回这个builder。至于什么情况下会使用这个builder呢？如果我们在配置文件中定义了provider属性，如下所示</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spring</span></span>
<span class="line"><span>  security:</span></span>
<span class="line"><span>    oauth2:</span></span>
<span class="line"><span>      client:</span></span>
<span class="line"><span>        registration:</span></span>
<span class="line"><span>          messaging-client-oidc:</span></span>
<span class="line"><span>            provider: spring</span></span>
<span class="line"><span>            client-id: messaging-client</span></span>
<span class="line"><span>            client-secret: secret</span></span>
<span class="line"><span>            authorization-grant-type: authorization_code</span></span>
<span class="line"><span>            redirect-uri: &quot;http://127.0.0.1:8080/login/oauth2/code/{registrationId}&quot;</span></span>
<span class="line"><span>            scope: openid, profile</span></span>
<span class="line"><span>            client-name: messaging-client-oidc</span></span>
<span class="line"><span>        provider:</span></span>
<span class="line"><span>          spring:</span></span>
<span class="line"><span>            issuer-uri: http://192.168.1.30:9000</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>可以看到messaging-client-oidc指定了spring这个provider，而spring有issuer-uri，那么构建出来的认证服务器的一些配置就通过拉取provider的/.well-known/openid-configuration接口获取了，具体流程路径列出来，不细讲，getBuilderFromIssuerIfPossible -&gt; fromIssuerLocation -&gt; getBuilder -&gt; oidc(uri)</p><p>如果没有配置provider属性，那么则走下面的流程，getCommonProvider的流程比较复杂，我们只需要看返回值就是我们之前提到的CommonOAuth2Provider就好。</p><h3 id="扩展点" tabindex="-1">扩展点 <a class="header-anchor" href="#扩展点" aria-label="Permalink to &quot;扩展点&quot;">​</a></h3><p>我们可以实现自己的ClientRegistrationRepository类，是扩展其他的授权服务器的信息以及定义ClientRegistration的保存策略，比如保存到数据库中，直接从数据库里面获取</p><h2 id="authenticationentrypoint" tabindex="-1">AuthenticationEntryPoint <a class="header-anchor" href="#authenticationentrypoint" aria-label="Permalink to &quot;AuthenticationEntryPoint&quot;">​</a></h2><p>首先我们看用户是怎么跳转到/oauth2/authorization/github这个URL，学过了异常处理那块内容的都可以猜出个大概，就是OAuth2LoginConfigurer注册了一个AuthenticationEntryPoint。那我们就看看注册了什么。</p><div class="language-OAuth2LoginConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2LoginConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2LoginConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractAuthenticationFilterConfigurer&lt;B, OAuth2LoginConfigurer&lt;B&gt;, OAuth2LoginAuthenticationFilter&gt; {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void init(B http) throws Exception {</span></span>
<span class="line"><span>    // 如果定义了loginPage, 那么直接跳转loginPage</span></span>
<span class="line"><span>    if (this.loginPage != null) {</span></span>
<span class="line"><span>      // Set custom login page</span></span>
<span class="line"><span>      super.loginPage(this.loginPage);</span></span>
<span class="line"><span>      super.init(http);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      // 看定义了多少个clientRegistrations, 如果只有一个，那么就用对应的url作为登录页面入口, 现在只有github，所以只有github</span></span>
<span class="line"><span>      Map&lt;String, String&gt; loginUrlToClientName = this.getLoginLinks();</span></span>
<span class="line"><span>      if (loginUrlToClientName.size() == 1) {</span></span>
<span class="line"><span>        // Setup auto-redirect to provider login page</span></span>
<span class="line"><span>        // when only 1 client is configured</span></span>
<span class="line"><span>        this.updateAuthenticationDefaults();</span></span>
<span class="line"><span>        this.updateAccessDefaults(http);</span></span>
<span class="line"><span>        String providerLoginPage = loginUrlToClientName.keySet().iterator().next();</span></span>
<span class="line"><span>        this.registerAuthenticationEntryPoint(http, this.getLoginEntryPoint(http, providerLoginPage));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      else {</span></span>
<span class="line"><span>        super.init(http);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><p>直接看getLoginEntryPoint方法，代码如下：</p><div class="language-OAuth2LoginConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2LoginConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2LoginConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractAuthenticationFilterConfigurer&lt;B, OAuth2LoginConfigurer&lt;B&gt;, OAuth2LoginAuthenticationFilter&gt; {</span></span>
<span class="line"><span>  private AuthenticationEntryPoint getLoginEntryPoint(B http, String providerLoginPage) {</span></span>
<span class="line"><span>    .....</span></span>
<span class="line"><span>    LinkedHashMap&lt;RequestMatcher, AuthenticationEntryPoint&gt; entryPoints = new LinkedHashMap&lt;&gt;();</span></span>
<span class="line"><span>    // 在这里根据构建了providerLoginPage构建了重定向页面</span></span>
<span class="line"><span>    entryPoints.put(new AndRequestMatcher(notXRequestedWith, new NegatedRequestMatcher(defaultLoginPageMatcher),</span></span>
<span class="line"><span>        formLoginNotEnabled), new LoginUrlAuthenticationEntryPoint(providerLoginPage));</span></span>
<span class="line"><span>    DelegatingAuthenticationEntryPoint loginEntryPoint = new DelegatingAuthenticationEntryPoint(entryPoints);</span></span>
<span class="line"><span>    loginEntryPoint.setDefaultEntryPoint(this.getAuthenticationEntryPoint());</span></span>
<span class="line"><span>    return loginEntryPoint;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><h2 id="oauth2authorizationrequestredirectfilter" tabindex="-1">OAuth2AuthorizationRequestRedirectFilter <a class="header-anchor" href="#oauth2authorizationrequestredirectfilter" aria-label="Permalink to &quot;OAuth2AuthorizationRequestRedirectFilter&quot;">​</a></h2><p>接下来我们看一下这个跳转URL过滤器OAuth2AuthorizationRequestRedirectFilter的实现，打开代码，由于OAuth2AuthorizationRequestRedirectFilter继承了OncePerRequestFilter，查看doFilterInternal方法，具体如下所示:</p><div class="language-OAuth2AuthorizationRequestRedirectFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationRequestRedirectFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class OAuth2AuthorizationRequestRedirectFilter extends OncePerRequestFilter {</span></span>
<span class="line"><span>  private OAuth2AuthorizationRequestResolver authorizationRequestResolver;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)</span></span>
<span class="line"><span>			throws ServletException, IOException {</span></span>
<span class="line"><span>    OAuth2AuthorizationRequest authorizationRequest = this.authorizationRequestResolver.resolve(request);</span></span>
<span class="line"><span>    if (authorizationRequest != null) {</span></span>
<span class="line"><span>      this.sendRedirectForAuthorization(request, response, authorizationRequest);</span></span>
<span class="line"><span>      return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    filterChain.doFilter(request, response);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>核心代码比较简单，就是看一下this.authorizationRequestResolver.resolve(request)的返回值有没有，如果则跳转，没有就放行。</p><h3 id="oauth2authorizationrequestresolver" tabindex="-1">OAuth2AuthorizationRequestResolver <a class="header-anchor" href="#oauth2authorizationrequestresolver" aria-label="Permalink to &quot;OAuth2AuthorizationRequestResolver&quot;">​</a></h3><p>我们看一下这个接口的定义，具体如下：</p><div class="language-OAuth2AuthorizationRequestResolver vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationRequestResolver</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public interface OAuth2AuthorizationRequestResolver {</span></span>
<span class="line"><span>  // 根据请求获取OAuth2AuthorizationRequest</span></span>
<span class="line"><span>  OAuth2AuthorizationRequest resolve(HttpServletRequest request);</span></span>
<span class="line"><span>  // 根据请求和clientRegistrationId获取OAuth2AuthorizationRequest</span></span>
<span class="line"><span>  OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>我们看看OAuth2AuthorizationRequestRedirectFilter中是在在哪里定义的</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class OAuth2AuthorizationRequestRedirectFilter extends OncePerRequestFilter {</span></span>
<span class="line"><span>  public OAuth2AuthorizationRequestRedirectFilter(ClientRegistrationRepository clientRegistrationRepository) {</span></span>
<span class="line"><span>		this(clientRegistrationRepository, DEFAULT_AUTHORIZATION_REQUEST_BASE_URI);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public OAuth2AuthorizationRequestRedirectFilter(ClientRegistrationRepository clientRegistrationRepository,</span></span>
<span class="line"><span>			String authorizationRequestBaseUri) {</span></span>
<span class="line"><span>		this.authorizationRequestResolver = new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository,</span></span>
<span class="line"><span>				authorizationRequestBaseUri);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	public OAuth2AuthorizationRequestRedirectFilter(OAuth2AuthorizationRequestResolver authorizationRequestResolver) {</span></span>
<span class="line"><span>		Assert.notNull(authorizationRequestResolver, &quot;authorizationRequestResolver cannot be null&quot;);</span></span>
<span class="line"><span>		this.authorizationRequestResolver = authorizationRequestResolver;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p>在这里明了了，是在构造函数里面配置的，那么我们回看OAuth2LoginConfigurer的configure方法</p><div class="language-OAuth2LoginConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2LoginConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2LoginConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractAuthenticationFilterConfigurer&lt;B, OAuth2LoginConfigurer&lt;B&gt;, OAuth2LoginAuthenticationFilter&gt; {</span></span>
<span class="line"><span>  public void configure(B http) throws Exception {</span></span>
<span class="line"><span>    OAuth2AuthorizationRequestRedirectFilter authorizationRequestFilter;</span></span>
<span class="line"><span>    if (this.authorizationEndpointConfig.authorizationRequestResolver != null) {</span></span>
<span class="line"><span>      authorizationRequestFilter = new OAuth2AuthorizationRequestRedirectFilter(</span></span>
<span class="line"><span>          this.authorizationEndpointConfig.authorizationRequestResolver);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      // 默认走这个分支</span></span>
<span class="line"><span>      String authorizationRequestBaseUri = this.authorizationEndpointConfig.authorizationRequestBaseUri;</span></span>
<span class="line"><span>      if (authorizationRequestBaseUri == null) {</span></span>
<span class="line"><span>        authorizationRequestBaseUri = OAuth2AuthorizationRequestRedirectFilter.DEFAULT_AUTHORIZATION_REQUEST_BASE_URI;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      authorizationRequestFilter = new OAuth2AuthorizationRequestRedirectFilter(</span></span>
<span class="line"><span>          OAuth2ClientConfigurerUtils.getClientRegistrationRepository(this.getBuilder()),</span></span>
<span class="line"><span>          authorizationRequestBaseUri);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    http.addFilter(this.postProcess(authorizationRequestFilter));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>默认调用OAuth2AuthorizationRequestRedirectFilter使用的是OAuth2ClientConfigurerUtils.getClientRegistrationRepository()，我们进去看一下。</p><div class="language-OAuth2ClientConfigurerUtils vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2ClientConfigurerUtils</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>final class OAuth2ClientConfigurerUtils {</span></span>
<span class="line"><span>  static &lt;B extends HttpSecurityBuilder&lt;B&gt;&gt; ClientRegistrationRepository getClientRegistrationRepository(B builder) {</span></span>
<span class="line"><span>    ClientRegistrationRepository clientRegistrationRepository = builder</span></span>
<span class="line"><span>      .getSharedObject(ClientRegistrationRepository.class);</span></span>
<span class="line"><span>    if (clientRegistrationRepository == null) {</span></span>
<span class="line"><span>      // 从SpringContext获取clientRegistrationRepository</span></span>
<span class="line"><span>      // 就是刚才自动配置的InMemoryClientRegistrationRepository</span></span>
<span class="line"><span>      clientRegistrationRepository = getClientRegistrationRepositoryBean(builder);</span></span>
<span class="line"><span>      builder.setSharedObject(ClientRegistrationRepository.class, clientRegistrationRepository);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return clientRegistrationRepository;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br></div></div><p>可以看到只是传一个ClientRegistrationRepository参数，默认使用DefaultOAuth2AuthorizationRequestResolver这个resolver，我们看看这个类的实现</p><div class="language-DefaultOAuth2AuthorizationRequestResolver vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultOAuth2AuthorizationRequestResolver</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class DefaultOAuth2AuthorizationRequestResolver implements OAuth2AuthorizationRequestResolver {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {</span></span>
<span class="line"><span>    // 获取registrationId</span></span>
<span class="line"><span>    String registrationId = resolveRegistrationId(request);</span></span>
<span class="line"><span>    if (registrationId == null) {</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 获取redirectUriAction</span></span>
<span class="line"><span>    String redirectUriAction = getAction(request, &quot;login&quot;);</span></span>
<span class="line"><span>    return resolve(request, registrationId, redirectUriAction);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private OAuth2AuthorizationRequest resolve(HttpServletRequest request, String registrationId,</span></span>
<span class="line"><span>    String redirectUriAction) {</span></span>
<span class="line"><span>    if (registrationId == null) {</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 从clientRegistrationRepository获取clientRegistration</span></span>
<span class="line"><span>    ClientRegistration clientRegistration = this.clientRegistrationRepository.findByRegistrationId(registrationId);</span></span>
<span class="line"><span>    // 获取OAuth2AuthorizationRequest的builder</span></span>
<span class="line"><span>    OAuth2AuthorizationRequest.Builder builder = getBuilder(clientRegistration);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String redirectUriStr = expandRedirectUri(request, clientRegistration, redirectUriAction);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // @formatter:off</span></span>
<span class="line"><span>    builder.clientId(clientRegistration.getClientId())</span></span>
<span class="line"><span>      .authorizationUri(clientRegistration.getProviderDetails().getAuthorizationUri())</span></span>
<span class="line"><span>      .redirectUri(redirectUriStr)</span></span>
<span class="line"><span>      .scopes(clientRegistration.getScopes())</span></span>
<span class="line"><span>      .state(DEFAULT_STATE_GENERATOR.generateKey());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    this.authorizationRequestCustomizer.accept(builder);</span></span>
<span class="line"><span>    // 调用OAuth2AuthorizationRequest.Builder的build方法</span></span>
<span class="line"><span>    return builder.build();</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br></div></div><p>OAuth2AuthorizationRequest.Builder就只有一个实现类，我们看看他的builder方法。</p><div class="language-OAuth2AuthorizationRequest vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationRequest</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2AuthorizationRequest implements Serializable {</span></span>
<span class="line"><span>  public String getAuthorizationRequestUri() {</span></span>
<span class="line"><span>    return this.authorizationRequestUri;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  public static final class Builder {</span></span>
<span class="line"><span>    public OAuth2AuthorizationRequest build() {</span></span>
<span class="line"><span>      Assert.hasText(this.authorizationUri, &quot;authorizationUri cannot be empty&quot;);</span></span>
<span class="line"><span>      Assert.hasText(this.clientId, &quot;clientId cannot be empty&quot;);</span></span>
<span class="line"><span>      OAuth2AuthorizationRequest authorizationRequest = new OAuth2AuthorizationRequest();</span></span>
<span class="line"><span>      authorizationRequest.authorizationUri = this.authorizationUri;</span></span>
<span class="line"><span>      authorizationRequest.authorizationGrantType = this.authorizationGrantType;</span></span>
<span class="line"><span>      authorizationRequest.responseType = this.responseType;</span></span>
<span class="line"><span>      authorizationRequest.clientId = this.clientId;</span></span>
<span class="line"><span>      authorizationRequest.redirectUri = this.redirectUri;</span></span>
<span class="line"><span>      authorizationRequest.state = this.state;</span></span>
<span class="line"><span>      authorizationRequest.scopes = Collections.unmodifiableSet((Set)(CollectionUtils.isEmpty(this.scopes) ? Collections.emptySet() : new LinkedHashSet(this.scopes)));</span></span>
<span class="line"><span>      authorizationRequest.additionalParameters = Collections.unmodifiableMap(this.additionalParameters);</span></span>
<span class="line"><span>      authorizationRequest.attributes = Collections.unmodifiableMap(this.attributes);</span></span>
<span class="line"><span>      authorizationRequest.authorizationRequestUri = StringUtils.hasText(this.authorizationRequestUri) ? this.authorizationRequestUri : this.buildAuthorizationRequestUri();</span></span>
<span class="line"><span>      return authorizationRequest;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><p>这个的返回值就是OAuth2AuthorizationRequestRedirectFilter中构建的authorizationRequest对象。</p><h3 id="redirectstrategy" tabindex="-1">RedirectStrategy <a class="header-anchor" href="#redirectstrategy" aria-label="Permalink to &quot;RedirectStrategy&quot;">​</a></h3><p>接下来我们看看OAuth2AuthorizationRequestRedirectFilter中的跳转方法。</p><div class="language-OAuth2AuthorizationRequestRedirectFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationRequestRedirectFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class OAuth2AuthorizationRequestRedirectFilter extends OncePerRequestFilter {</span></span>
<span class="line"><span>  private void sendRedirectForAuthorization(HttpServletRequest request, HttpServletResponse response,</span></span>
<span class="line"><span>      OAuth2AuthorizationRequest authorizationRequest) throws IOException {</span></span>
<span class="line"><span>    // 如果是授权码模式，保存authorizationRequest，因为要在后面的授权服务器回调中获取</span></span>
<span class="line"><span>    if (AuthorizationGrantType.AUTHORIZATION_CODE.equals(authorizationRequest.getGrantType())) {</span></span>
<span class="line"><span>      this.authorizationRequestRepository.saveAuthorizationRequest(authorizationRequest, request, response);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 调用authorizationRedirectStrategy的跳转方法</span></span>
<span class="line"><span>    this.authorizationRedirectStrategy.sendRedirect(request, response,</span></span>
<span class="line"><span>        authorizationRequest.getAuthorizationRequestUri());</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br></div></div><p>看看authorizationRedirectStrategy的配置方式, 代码如下：</p><div class="language-OAuth2AuthorizationRequestRedirectFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2AuthorizationRequestRedirectFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class OAuth2AuthorizationRequestRedirectFilter extends OncePerRequestFilter {</span></span>
<span class="line"><span>	private RedirectStrategy authorizationRedirectStrategy = new DefaultRedirectStrategy();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public void setAuthorizationRedirectStrategy(RedirectStrategy authorizationRedirectStrategy) {</span></span>
<span class="line"><span>    Assert.notNull(authorizationRedirectStrategy, &quot;authorizationRedirectStrategy cannot be null&quot;);</span></span>
<span class="line"><span>    this.authorizationRedirectStrategy = authorizationRedirectStrategy;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>默认是使用DefaultRedirectStrategy来进行跳转的，看一下对应的跳转方法。</p><div class="language-DefaultRedirectStrategy vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">DefaultRedirectStrategy</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class DefaultRedirectStrategy implements RedirectStrategy {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>	public void sendRedirect(HttpServletRequest request, HttpServletResponse response, String url) throws IOException {</span></span>
<span class="line"><span>    String redirectUrl = calculateRedirectUrl(request.getContextPath(), url);</span></span>
<span class="line"><span>    redirectUrl = response.encodeRedirectURL(redirectUrl);</span></span>
<span class="line"><span>    if (this.statusCode == HttpStatus.FOUND) {</span></span>
<span class="line"><span>      response.sendRedirect(redirectUrl);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    else {</span></span>
<span class="line"><span>      response.setHeader(HttpHeaders.LOCATION, redirectUrl);</span></span>
<span class="line"><span>      response.setStatus(this.statusCode.value());</span></span>
<span class="line"><span>      response.getWriter().flush();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br></div></div><p>this.statusCode == HttpStatus.FOUND默认为true，没找到地方对其修改，可以看到直接跳转。</p><h3 id="扩展点-1" tabindex="-1">扩展点 <a class="header-anchor" href="#扩展点-1" aria-label="Permalink to &quot;扩展点&quot;">​</a></h3><ul><li>authorizationRequestResolver: 根据自己定义的格式返回授权服务器的URL</li><li>authorizationRequestRepository: 可以自定义，目前保存在HttpSession中，可以保存到Spring-Session中</li><li>authorizationRedirectStrategy: 可以自定义重定向逻辑</li></ul><p>最终跳转的github授权服务器的URL如下所示:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>https://github.com/login/oauth/authorize?response_type=code&amp;client_id=Ov23liPU4842Pd5Ui38g&amp;scope=read:user&amp;state=yPt93W_v_KyjBqAskW6TURRrS4Y_V-c30ySbx0DGF18%3D&amp;redirect_uri=http://localhost:8080/login/oauth2/code/github</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h2 id="oauth2loginauthenticationfilter" tabindex="-1">OAuth2LoginAuthenticationFilter <a class="header-anchor" href="#oauth2loginauthenticationfilter" aria-label="Permalink to &quot;OAuth2LoginAuthenticationFilter&quot;">​</a></h2><p>注意上面的最后的redirect_uri的值，具体如下所示:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>redirect_uri=http://localhost:8080/login/oauth2/code/github</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>当用户在github中授权之后，会让前端重定向到redirect_uri接口，具体的示例如下所示:</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>http://localhost:8080/login/oauth2/code/github?code=d7b00ee2b4de58320fd9&amp;state=yPt93W_v_KyjBqAskW6TURRrS4Y_V-c30ySbx0DGF18%3D</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h3 id="oauth2loginauthenticationfilter-1" tabindex="-1">OAuth2LoginAuthenticationFilter <a class="header-anchor" href="#oauth2loginauthenticationfilter-1" aria-label="Permalink to &quot;OAuth2LoginAuthenticationFilter&quot;">​</a></h3><p>具体对这个URL做处理的是这个过滤器：OAuth2LoginAuthenticationFilter，由于这个过滤器继承了AbstractAuthenticationProcessingFilter这个方法，我们直接看它的attemptAuthentication方法。</p><div class="language-OAuth2LoginAuthenticationFilter vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2LoginAuthenticationFilter</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class OAuth2LoginAuthenticationFilter extends AbstractAuthenticationProcessingFilter {</span></span>
<span class="line"><span>  // 可以看到是对/login/oauth2/code/*&quot;这些URL做处理的</span></span>
<span class="line"><span>  public static final String DEFAULT_FILTER_PROCESSES_URI = &quot;/login/oauth2/code/*&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>  public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)</span></span>
<span class="line"><span>      throws AuthenticationException {</span></span>
<span class="line"><span>    MultiValueMap&lt;String, String&gt; params = OAuth2AuthorizationResponseUtils.toMultiMap(request.getParameterMap());</span></span>
<span class="line"><span>    // 对请求参数进行校验，如果不包含state和code参数，报错</span></span>
<span class="line"><span>    if (!OAuth2AuthorizationResponseUtils.isAuthorizationResponse(params)) {</span></span>
<span class="line"><span>			OAuth2Error oauth2Error = new OAuth2Error(OAuth2ErrorCodes.INVALID_REQUEST);</span></span>
<span class="line"><span>			throw new OAuth2AuthenticationException(oauth2Error, oauth2Error.toString());</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>    // 获取之前在OAuth2AuthorizationRequestRedirectFilter中保存的授权请求，如果为空，则报错</span></span>
<span class="line"><span>    OAuth2AuthorizationRequest authorizationRequest = this.authorizationRequestRepository</span></span>
<span class="line"><span>      .removeAuthorizationRequest(request, response);</span></span>
<span class="line"><span>    if (authorizationRequest == null) {</span></span>
<span class="line"><span>      ...</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 从authorizationRequest获取到registrationId</span></span>
<span class="line"><span>    String registrationId = authorizationRequest.getAttribute(OAuth2ParameterNames.REGISTRATION_ID);</span></span>
<span class="line"><span>    // 获取clientRegistration, 如果clientRegistration为空，则报错</span></span>
<span class="line"><span>    ClientRegistration clientRegistration = this.clientRegistrationRepository.findByRegistrationId(registrationId);</span></span>
<span class="line"><span>    if (clientRegistration == null) {</span></span>
<span class="line"><span>      ....</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 重新构建authorizationResponse，跟请求差不多</span></span>
<span class="line"><span>    String redirectUri = UriComponentsBuilder.fromHttpUrl(UrlUtils.buildFullRequestUrl(request))</span></span>
<span class="line"><span>        .replaceQuery(null)</span></span>
<span class="line"><span>        .build()</span></span>
<span class="line"><span>        .toUriString();</span></span>
<span class="line"><span>    // @formatter:on</span></span>
<span class="line"><span>    OAuth2AuthorizationResponse authorizationResponse = OAuth2AuthorizationResponseUtils.convert(params,</span></span>
<span class="line"><span>        redirectUri);</span></span>
<span class="line"><span>    Object authenticationDetails = this.authenticationDetailsSource.buildDetails(request);</span></span>
<span class="line"><span>    // 构建OAuth2LoginAuthenticationToken</span></span>
<span class="line"><span>    OAuth2LoginAuthenticationToken authenticationRequest = new OAuth2LoginAuthenticationToken(clientRegistration,</span></span>
<span class="line"><span>        new OAuth2AuthorizationExchange(authorizationRequest, authorizationResponse));</span></span>
<span class="line"><span>    authenticationRequest.setDetails(authenticationDetails);</span></span>
<span class="line"><span>    // 调取认证方法，认证成功后，返回OAuth2LoginAuthenticationToken</span></span>
<span class="line"><span>    OAuth2LoginAuthenticationToken authenticationResult = (OAuth2LoginAuthenticationToken) this</span></span>
<span class="line"><span>      .getAuthenticationManager()</span></span>
<span class="line"><span>      .authenticate(authenticationRequest);</span></span>
<span class="line"><span>    // 转化OAuth2LoginAuthenticationToken</span></span>
<span class="line"><span>    OAuth2AuthenticationToken oauth2Authentication = this.authenticationResultConverter</span></span>
<span class="line"><span>      .convert(authenticationResult);</span></span>
<span class="line"><span>    oauth2Authentication.setDetails(authenticationDetails);</span></span>
<span class="line"><span>    OAuth2AuthorizedClient authorizedClient = new OAuth2AuthorizedClient(</span></span>
<span class="line"><span>        authenticationResult.getClientRegistration(), oauth2Authentication.getName(),</span></span>
<span class="line"><span>        authenticationResult.getAccessToken(), authenticationResult.getRefreshToken());</span></span>
<span class="line"><span>    // 保存authorizedClient信息</span></span>
<span class="line"><span>    this.authorizedClientRepository.saveAuthorizedClient(authorizedClient, oauth2Authentication, request, response);</span></span>
<span class="line"><span>    return oauth2Authentication;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br></div></div><p>核心主要看认证方法，对OAuth2LoginAuthenticationToken执行认证的是OAuth2LoginAuthenticationProvider，具体注册这个Provider的方法在OAuth2LoginConfigurer中。</p><div class="language-OAuth2LoginConfigurer vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2LoginConfigurer</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public final class OAuth2LoginConfigurer&lt;B extends HttpSecurityBuilder&lt;B&gt;&gt;</span></span>
<span class="line"><span>		extends AbstractAuthenticationFilterConfigurer&lt;B, OAuth2LoginConfigurer&lt;B&gt;, OAuth2LoginAuthenticationFilter&gt; {</span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	public void init(B http) throws Exception {</span></span>
<span class="line"><span>    OAuth2UserService&lt;OAuth2UserRequest, OAuth2User&gt; oauth2UserService = getOAuth2UserService();</span></span>
<span class="line"><span>    OAuth2LoginAuthenticationProvider oauth2LoginAuthenticationProvider = new OAuth2LoginAuthenticationProvider(</span></span>
<span class="line"><span>        accessTokenResponseClient, oauth2UserService);</span></span>
<span class="line"><span>    GrantedAuthoritiesMapper userAuthoritiesMapper = this.getGrantedAuthoritiesMapper();</span></span>
<span class="line"><span>    if (userAuthoritiesMapper != null) {</span></span>
<span class="line"><span>      oauth2LoginAuthenticationProvider.setAuthoritiesMapper(userAuthoritiesMapper);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    http.authenticationProvider(this.postProcess(oauth2LoginAuthenticationProvider));</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br></div></div><p>接下来我们看OAuth2LoginAuthenticationProvider的认证方法，如下所示:</p><div class="language-OAuth2LoginAuthenticationProvider vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">OAuth2LoginAuthenticationProvider</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class OAuth2LoginAuthenticationProvider implements AuthenticationProvider {</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public Authentication authenticate(Authentication authentication) throws AuthenticationException {</span></span>
<span class="line"><span>    OAuth2LoginAuthenticationToken loginAuthenticationToken = (OAuth2LoginAuthenticationToken) authentication;</span></span>
<span class="line"><span>    if (loginAuthenticationToken.getAuthorizationExchange().getAuthorizationRequest().getScopes().contains(&quot;openid&quot;)) {</span></span>
<span class="line"><span>      // 如果是OpenId Connect认证，交给OidcAuthorizationCodeAuthenticationProvider处理</span></span>
<span class="line"><span>      return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    OAuth2AuthorizationCodeAuthenticationToken authorizationCodeAuthenticationToken;</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 根据授权码Code向https://github.com/login/oauth/access_token获取access_token</span></span>
<span class="line"><span>    authorizationCodeAuthenticationToken = (OAuth2AuthorizationCodeAuthenticationToken) this.authorizationCodeAuthenticationProvider</span></span>
<span class="line"><span>      .authenticate(</span></span>
<span class="line"><span>          new OAuth2AuthorizationCodeAuthenticationToken(loginAuthenticationToken.getClientRegistration(),</span></span>
<span class="line"><span>              loginAuthenticationToken.getAuthorizationExchange()));</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 提取出来accessToken对象</span></span>
<span class="line"><span>    OAuth2AccessToken accessToken = authorizationCodeAuthenticationToken.getAccessToken();</span></span>
<span class="line"><span>    Map&lt;String, Object&gt; additionalParameters = authorizationCodeAuthenticationToken.getAdditionalParameters();</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 根据accessToken对象，向https://api.github.com/user获取用户信息</span></span>
<span class="line"><span>    OAuth2User oauth2User = this.userService.loadUser(new OAuth2UserRequest(</span></span>
<span class="line"><span>        loginAuthenticationToken.getClientRegistration(), accessToken, additionalParameters));</span></span>
<span class="line"><span>    Collection&lt;? extends GrantedAuthority&gt; mappedAuthorities = this.authoritiesMapper</span></span>
<span class="line"><span>      .mapAuthorities(oauth2User.getAuthorities());</span></span>
<span class="line"><span>    </span></span>
<span class="line"><span>    // 根据返回的oauth2User对象重新构建OAuth2LoginAuthenticationToken</span></span>
<span class="line"><span>    OAuth2LoginAuthenticationToken authenticationResult = new OAuth2LoginAuthenticationToken(</span></span>
<span class="line"><span>        loginAuthenticationToken.getClientRegistration(), loginAuthenticationToken.getAuthorizationExchange(),</span></span>
<span class="line"><span>        oauth2User, mappedAuthorities, accessToken, authorizationCodeAuthenticationToken.getRefreshToken());</span></span>
<span class="line"><span>    authenticationResult.setDetails(loginAuthenticationToken.getDetails());</span></span>
<span class="line"><span>    return authenticationResult;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean supports(Class&lt;?&gt; authentication) {</span></span>
<span class="line"><span>    return OAuth2LoginAuthenticationToken.class.isAssignableFrom(authentication);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br></div></div><h3 id="扩展点-2" tabindex="-1">扩展点 <a class="header-anchor" href="#扩展点-2" aria-label="Permalink to &quot;扩展点&quot;">​</a></h3><ul><li>authorizationRequestRepository: 可以自定义，目前保存在HttpSession中，可以保存到Spring-Session中</li><li>oauth2UserService: 获取了accessToken之后，可以自定义oauth2UserService的逻辑去获取用户信息</li></ul><h2 id="补充" tabindex="-1">补充 <a class="header-anchor" href="#补充" aria-label="Permalink to &quot;补充&quot;">​</a></h2><p>如果大家想要适配国内的第三方认证库，可以参考JustAuth这个框架，可以看他的简介说明。</p><p>🏆Gitee 最有价值开源项目 🚀💯 小而全而美的第三方登录开源组件。目前已支持Github、Gitee、微博、钉钉、百度、Coding、腾讯云开发者平台、OSChina、支付宝、QQ、微信、淘宝、Google、Facebook、抖音、领英、小米、微软、今日头条、Teambition、StackOverflow、Pinterest、人人、华为、企业微信、酷家乐、Gitlab、美团、饿了么、推特、飞书、京东、阿里云、喜马拉雅、Amazon、Slack和 Line 等第三方平台的授权登录。 Login, so easy!</p><p>官方网站点击<a href="https://www.justauth.cn/" target="_blank" rel="noreferrer">此处</a></p>`,126)]))}const C=s(c,[["render",b]]);export{v as __pageData,C as default};
