import{_ as a,c as n,a0 as e,o as p}from"./chunks/framework.P9qPzDnn.js";const t="/assets/login.BAhQU6zF.png",i="/assets/spring-boot-autoconfig.C9gxBGbB.png",b=JSON.parse('{"title":"Spring Security入门与使用","description":"","frontmatter":{},"headers":[],"relativePath":"spring-security/start.md","filePath":"spring-security/start.md"}'),r={name:"spring-security/start.md"};function l(o,s,c,g,d,u){return p(),n("div",null,s[0]||(s[0]=[e(`<h1 id="spring-security入门与使用" tabindex="-1">Spring Security入门与使用 <a class="header-anchor" href="#spring-security入门与使用" aria-label="Permalink to &quot;Spring Security入门与使用&quot;">​</a></h1><h2 id="快速入门" tabindex="-1">快速入门 <a class="header-anchor" href="#快速入门" aria-label="Permalink to &quot;快速入门&quot;">​</a></h2><p>在Spring Boot中使用Spring Security非常方便，创建一个新的Spring Boot 3项目，我门只需要引入Spring Web和Spring Security依赖即可，具体代码如下所示</p><div class="language-pom.xml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">pom.xml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>  &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;</span></span>
<span class="line"><span>  &lt;artifactId&gt;spring-boot-starter-security&lt;/artifactId&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span>
<span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>  &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;</span></span>
<span class="line"><span>  &lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span></code></pre></div><p>然后在项目中提供一个用户测试的/hello测试接口，代码如下所示：</p><div class="language-HelloController.java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">HelloController.java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@RestController</span></span>
<span class="line"><span>public class HelloController {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @GetMapping(&quot;/hello&quot;)</span></span>
<span class="line"><span>  public String hello() {</span></span>
<span class="line"><span>    return &quot;hello spring security&quot;;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>启动项目，然后访问 /hello 接口，会自动跳转到登陆页面，如下图所示。</p><img src="`+t+'" width="300" height="200" alt="登录页面"><p>默认的用户名是user，默认的登录密码是一个随机生成的UUID字符串，在项目启动日志中可以看到登录密码。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Using generated security password: 767e16d9-f511-472d-846c-a033d2b5ddf4</span></span></code></pre></div><h2 id="修改用户名密码" tabindex="-1">修改用户名密码 <a class="header-anchor" href="#修改用户名密码" aria-label="Permalink to &quot;修改用户名密码&quot;">​</a></h2><p>首先我们看一下为什么直接引入Spring Security的依赖就可以使用默认的用户来进行登录。首先我们看一下Spring Boot的自动配置文件。</p><p><img src="'+i+`" alt="spring-boot-autoconfigure"></p><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>注意，spring boot 2的自动配置文件spring.factories文件。</p></div><p>在里面搜索security的类，可以看到自动配置了UserDetailsServiceAutoConfiguration这个类</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration</span></span></code></pre></div><p>点击这个类，如果我们没有自定义自己的UserDetailsService，框架会我们配置一个InMemoryUserDetailsManager。</p><div class="language-UserDetailsServiceAutoConfiguration.java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">UserDetailsServiceAutoConfiguration.java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Bean</span></span>
<span class="line"><span>public InMemoryUserDetailsManager inMemoryUserDetailsManager(SecurityProperties properties,</span></span>
<span class="line"><span>    ObjectProvider&lt;PasswordEncoder&gt; passwordEncoder) {</span></span>
<span class="line"><span>  SecurityProperties.User user = properties.getUser();</span></span>
<span class="line"><span>  List&lt;String&gt; roles = user.getRoles();</span></span>
<span class="line"><span>  return new InMemoryUserDetailsManager(User.withUsername(user.getName())</span></span>
<span class="line"><span>    .password(getOrDeducePassword(user, passwordEncoder.getIfAvailable()))</span></span>
<span class="line"><span>    .roles(StringUtils.toStringArray(roles))</span></span>
<span class="line"><span>    .build());</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到User是从properties.getUser()里面获取的，properties是一个SecurityProperties类，这是一个配置类。</p><div class="language-SecurityProperties.java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">SecurityProperties.java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@ConfigurationProperties(prefix = &quot;spring.security&quot;)</span></span>
<span class="line"><span>public class SecurityProperties {</span></span>
<span class="line"><span>  private final User user = new User();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public User getUser() {</span></span>
<span class="line"><span>		return this.user;</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到如果没有在application.yml定义user属性的话，自动new了一个User对象。</p><p>查看User对象定义。</p><div class="language-SecurityProperties.java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">SecurityProperties.java</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public static class User {</span></span>
<span class="line"><span>  private String name = &quot;user&quot;;</span></span>
<span class="line"><span>  private String password = UUID.randomUUID().toString();</span></span>
<span class="line"><span>  private List&lt;String&gt; roles = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这个就是前面登录使用默认登录的用户密码。</p><p>可以看到SecurityProperties使用了ConfigurationProperties注解，如果要修改默认的用户密码，只需要在application.yml定义用户的账号密码就可以了。</p><div class="language-application.yml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">application.yml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>spring:</span></span>
<span class="line"><span>  security:</span></span>
<span class="line"><span>    user:</span></span>
<span class="line"><span>      name: user</span></span>
<span class="line"><span>      password: password</span></span>
<span class="line"><span>      roles: USER,ADMIN</span></span></code></pre></div><p>roles代表用户的权限，此处不做详解，后面讲到权限管理时会细说。重启项目，重新访问hello接口，跳转登录页面，用户名输入user，密码输入password，登录成功。</p>`,27)]))}const v=a(r,[["render",l]]);export{b as __pageData,v as default};
