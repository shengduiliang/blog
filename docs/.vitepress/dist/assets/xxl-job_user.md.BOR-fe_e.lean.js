import{_ as n,c as a,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const l="/assets/login-page.BYVKMErW.png",i="/assets/cookie.N92ZOY1b.png",t="/assets/permission-limit.DLXNeoHd.png",h=JSON.parse('{"title":"用户管理与权限校验","description":"","frontmatter":{},"headers":[],"relativePath":"xxl-job/user.md","filePath":"xxl-job/user.md"}'),o={name:"xxl-job/user.md"};function r(c,s,u,d,g,m){return e(),a("div",null,s[0]||(s[0]=[p('<h1 id="用户管理与权限校验" tabindex="-1">用户管理与权限校验 <a class="header-anchor" href="#用户管理与权限校验" aria-label="Permalink to &quot;用户管理与权限校验&quot;">​</a></h1><p>这节课我们来讲解XXL-JOB的用户管理与权限校验。启动xxl-job-admin项目，在浏览器中访问 <a href="http://localhost:8080/xxl-job-admin" target="_blank" rel="noreferrer">http://localhost:8080/xxl-job-admin</a> ,如果用户没有登录，默认会跳转登录页面, 页面如下所示：</p><img src="'+l+'" width="400" alt="login-page"><p>默认的帐号密码是admin/123456, 输入帐号密码后，登录成功，进入首页。</p><p>我们点开F12控制台查看接口，在登录接口上, 会返回一个cookie，后面的请求都带上了cookie。</p><p><img src="'+i+`" alt="cookie"></p><h2 id="权限校验" tabindex="-1">权限校验 <a class="header-anchor" href="#权限校验" aria-label="Permalink to &quot;权限校验&quot;">​</a></h2><p>打开xxl-job-admin的WebMvcConfig.java代码，可以看到往WebMvc上添加了两个拦截器</p><div class="language-WebMvcConfig vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">WebMvcConfig</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class WebMvcConfig implements WebMvcConfigurer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /**</span></span>
<span class="line"><span>    * 权限拦截器</span></span>
<span class="line"><span>    */</span></span>
<span class="line"><span>  @Resource</span></span>
<span class="line"><span>  private PermissionInterceptor permissionInterceptor;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /**</span></span>
<span class="line"><span>    * cookie拦截</span></span>
<span class="line"><span>    */</span></span>
<span class="line"><span>  @Resource</span></span>
<span class="line"><span>  private CookieInterceptor cookieInterceptor;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  /**</span></span>
<span class="line"><span>    * 添加拦截器，用于权限校验和cookie添加</span></span>
<span class="line"><span>    * @param registry</span></span>
<span class="line"><span>    */</span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public void addInterceptors(InterceptorRegistry registry) {</span></span>
<span class="line"><span>      registry.addInterceptor(permissionInterceptor).addPathPatterns(&quot;/**&quot;);</span></span>
<span class="line"><span>      registry.addInterceptor(cookieInterceptor).addPathPatterns(&quot;/**&quot;);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="permissioninterceptor" tabindex="-1">PermissionInterceptor <a class="header-anchor" href="#permissioninterceptor" aria-label="Permalink to &quot;PermissionInterceptor&quot;">​</a></h3><p>首先我们来看PermissionInterceptor的代码，主要是用户的权限做校验。</p><div class="language-PermissionInterceptor vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">PermissionInterceptor</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class PermissionInterceptor implements AsyncHandlerInterceptor {</span></span>
<span class="line"><span>  @Resource</span></span>
<span class="line"><span>  private LoginService loginService;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @Override</span></span>
<span class="line"><span>  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {</span></span>
<span class="line"><span>    // 如果不属于HandlerMethod, 即Controller方法，则直接跳过</span></span>
<span class="line"><span>    if (!(handler instanceof HandlerMethod)) {</span></span>
<span class="line"><span>      return true;	// proceed with the next interceptor</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // if need login</span></span>
<span class="line"><span>    // 默认需要登录，不需要管理员权限</span></span>
<span class="line"><span>    boolean needLogin = true;</span></span>
<span class="line"><span>    boolean needAdminuser = false;</span></span>
<span class="line"><span>    HandlerMethod method = (HandlerMethod)handler;</span></span>
<span class="line"><span>    // 查看是否有PermissionLimit注解</span></span>
<span class="line"><span>    PermissionLimit permission = method.getMethodAnnotation(PermissionLimit.class);</span></span>
<span class="line"><span>    // 存在permission注解，则拿permission注解中的内容</span></span>
<span class="line"><span>    if (permission!=null) {</span></span>
<span class="line"><span>      needLogin = permission.limit();</span></span>
<span class="line"><span>      needAdminuser = permission.adminuser();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // 需要登录，则查看用户是否已经登录</span></span>
<span class="line"><span>    if (needLogin) {</span></span>
<span class="line"><span>      XxlJobUser loginUser = loginService.ifLogin(request, response);</span></span>
<span class="line"><span>      if (loginUser == null) {</span></span>
<span class="line"><span>        response.setStatus(302);</span></span>
<span class="line"><span>        response.setHeader(&quot;location&quot;, request.getContextPath()+&quot;/toLogin&quot;);</span></span>
<span class="line"><span>        return false;</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 需要管理员，判断是否是管理员</span></span>
<span class="line"><span>      if (needAdminuser &amp;&amp; loginUser.getRole()!=1) {</span></span>
<span class="line"><span>        throw new RuntimeException(I18nUtil.getString(&quot;system_permission_limit&quot;));</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      // 设置loginUser到request中</span></span>
<span class="line"><span>      request.setAttribute(LoginService.LOGIN_IDENTITY_KEY, loginUser);	// set loginUser, with request</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    return true;	// proceed with the next interceptor</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>接下来看一下loginService.ifLogin的逻辑，具体代码如下：</p><div class="language-LoginService vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">LoginService</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Service</span></span>
<span class="line"><span>public class LoginService {</span></span>
<span class="line"><span>  public XxlJobUser ifLogin(HttpServletRequest request, HttpServletResponse response){</span></span>
<span class="line"><span>    // 获取cookie</span></span>
<span class="line"><span>    String cookieToken = CookieUtil.getValue(request, LOGIN_IDENTITY_KEY);</span></span>
<span class="line"><span>    if (cookieToken != null) {</span></span>
<span class="line"><span>      XxlJobUser cookieUser = null;</span></span>
<span class="line"><span>      try {</span></span>
<span class="line"><span>        // 解析出来cookieToken中携带的用户信息</span></span>
<span class="line"><span>        cookieUser = parseToken(cookieToken);</span></span>
<span class="line"><span>      } catch (Exception e) {</span></span>
<span class="line"><span>        logout(request, response);</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>      if (cookieUser != null) {</span></span>
<span class="line"><span>        // 检查是否存在当前用户</span></span>
<span class="line"><span>        XxlJobUser dbUser = xxlJobUserDao.loadByUserName(cookieUser.getUsername());</span></span>
<span class="line"><span>        if (dbUser != null) {</span></span>
<span class="line"><span>            if (cookieUser.getPassword().equals(dbUser.getPassword())) {</span></span>
<span class="line"><span>                return dbUser;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>      }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    return null;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>Cookie是怎么返回给前端的呢，我们看一下login接口，代码如下：</p><div class="language-IndexController vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">IndexController</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Controller</span></span>
<span class="line"><span>public class IndexController {</span></span>
<span class="line"><span>  @RequestMapping(value=&quot;login&quot;, method=RequestMethod.POST)</span></span>
<span class="line"><span>	@ResponseBody</span></span>
<span class="line"><span>	@PermissionLimit(limit=false)</span></span>
<span class="line"><span>	public ReturnT&lt;String&gt; loginDo(HttpServletRequest request, HttpServletResponse response, String userName, String password, String ifRemember){</span></span>
<span class="line"><span>      // 如果ifRemember是&quot;on&quot;, 则把cookie的过期时间设置为无限大</span></span>
<span class="line"><span>      boolean ifRem = (ifRemember!=null &amp;&amp; ifRemember.trim().length()&gt;0 &amp;&amp; &quot;on&quot;.equals(ifRemember))?true:false;</span></span>
<span class="line"><span>      return loginService.login(request, response, userName, password, ifRem);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到是调用了loginService.login的方法，具体代码如下：</p><div class="language-LoginService vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">LoginService</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Service</span></span>
<span class="line"><span>public class LoginService {</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; login(HttpServletRequest request, HttpServletResponse response, String username, String password, boolean ifRemember){</span></span>
<span class="line"><span>    // param</span></span>
<span class="line"><span>    if (username==null || username.trim().length()==0 || password==null || password.trim().length()==0){</span></span>
<span class="line"><span>        return new ReturnT&lt;String&gt;(500, I18nUtil.getString(&quot;login_param_empty&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // valid passowrd</span></span>
<span class="line"><span>    XxlJobUser xxlJobUser = xxlJobUserDao.loadByUserName(username);</span></span>
<span class="line"><span>    if (xxlJobUser == null) {</span></span>
<span class="line"><span>        return new ReturnT&lt;String&gt;(500, I18nUtil.getString(&quot;login_param_unvalid&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    String passwordMd5 = DigestUtils.md5DigestAsHex(password.getBytes());</span></span>
<span class="line"><span>    if (!passwordMd5.equals(xxlJobUser.getPassword())) {</span></span>
<span class="line"><span>        return new ReturnT&lt;String&gt;(500, I18nUtil.getString(&quot;login_param_unvalid&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // 生成cookie</span></span>
<span class="line"><span>    String loginToken = makeToken(xxlJobUser);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // do login</span></span>
<span class="line"><span>    CookieUtil.set(response, LOGIN_IDENTITY_KEY, loginToken, ifRemember);</span></span>
<span class="line"><span>    return ReturnT.SUCCESS;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>查看CookieUtil#set方法，具体代码如下:</p><div class="language-CookieUtil vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">CookieUtil</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>public class CookieUtil {</span></span>
<span class="line"><span>  // 默认缓存时间,单位/秒, 2H</span></span>
<span class="line"><span>	private static final int COOKIE_MAX_AGE = Integer.MAX_VALUE;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private static void set(HttpServletResponse response, String key, String value, String domain, String path, int maxAge, boolean isHttpOnly) {</span></span>
<span class="line"><span>		Cookie cookie = new Cookie(key, value);</span></span>
<span class="line"><span>		if (domain != null) {</span></span>
<span class="line"><span>			cookie.setDomain(domain);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>		cookie.setPath(path);</span></span>
<span class="line"><span>		cookie.setMaxAge(maxAge);</span></span>
<span class="line"><span>		cookie.setHttpOnly(isHttpOnly);</span></span>
<span class="line"><span>		response.addCookie(cookie);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	public static void set(HttpServletResponse response, String key, String value, boolean ifRemember) {</span></span>
<span class="line"><span>      // 主要看ifRemember</span></span>
<span class="line"><span>      int age = ifRemember?COOKIE_MAX_AGE:-1;</span></span>
<span class="line"><span>      set(response, key, value, null, COOKIE_PATH, age, true);</span></span>
<span class="line"><span>	}</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="cookieinterceptor" tabindex="-1">CookieInterceptor <a class="header-anchor" href="#cookieinterceptor" aria-label="Permalink to &quot;CookieInterceptor&quot;">​</a></h3><p>CookieInterceptor的代码很简单，查看modelAndView是否为空，如果不为空，设置一些cookie参数和I18n的参数，modelAndView就是返回的页面视图。</p><div class="language-CookieInterceptor vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">CookieInterceptor</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Component</span></span>
<span class="line"><span>public class CookieInterceptor implements AsyncHandlerInterceptor {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	@Override</span></span>
<span class="line"><span>	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,</span></span>
<span class="line"><span>			ModelAndView modelAndView) throws Exception {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>		// cookie</span></span>
<span class="line"><span>		if (modelAndView!=null &amp;&amp; request.getCookies()!=null &amp;&amp; request.getCookies().length&gt;0) {</span></span>
<span class="line"><span>			HashMap&lt;String, Cookie&gt; cookieMap = new HashMap&lt;String, Cookie&gt;();</span></span>
<span class="line"><span>			for (Cookie ck : request.getCookies()) {</span></span>
<span class="line"><span>				cookieMap.put(ck.getName(), ck);</span></span>
<span class="line"><span>			}</span></span>
<span class="line"><span>			modelAndView.addObject(&quot;cookieMap&quot;, cookieMap);</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>		// static method</span></span>
<span class="line"><span>		if (modelAndView != null) {</span></span>
<span class="line"><span>			modelAndView.addObject(&quot;I18nUtil&quot;, FtlUtil.generateStaticModel(I18nUtil.class.getName()));</span></span>
<span class="line"><span>		}</span></span>
<span class="line"><span>	}	</span></span>
<span class="line"><span>}</span></span></code></pre></div><h3 id="permissionlimit" tabindex="-1">PermissionLimit <a class="header-anchor" href="#permissionlimit" aria-label="Permalink to &quot;PermissionLimit&quot;">​</a></h3><div class="language-PermissionLimit vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">PermissionLimit</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Target(ElementType.METHOD)</span></span>
<span class="line"><span>@Retention(RetentionPolicy.RUNTIME)</span></span>
<span class="line"><span>public @interface PermissionLimit {</span></span>
<span class="line"><span>	</span></span>
<span class="line"><span>	/**</span></span>
<span class="line"><span>	 * 登录拦截 (默认拦截)</span></span>
<span class="line"><span>	 */</span></span>
<span class="line"><span>	boolean limit() default true;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>	/**</span></span>
<span class="line"><span>	 * 要求管理员权限</span></span>
<span class="line"><span>	 *</span></span>
<span class="line"><span>	 * @return</span></span>
<span class="line"><span>	 */</span></span>
<span class="line"><span>	boolean adminuser() default false;</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>这里补充一下PermissionLimit这个注解吧，前面PermissionInterceptor会提取这个注解的属性，判断是否需要登录和鉴权。</p><p><img src="`+t+`" alt="permission-limit"></p><p>全局搜一下，可以看到有4个接口是不需要登录的，具体如下：</p><ul><li>/toLogin: 登录页</li><li>/login: 登录接口</li><li>/logout: 注销接口</li><li>/api/{uri}: 调度中心的接口，包括任务回调/执行器注册/执行器注册摘除接口，注意需要XXL_JOB_ACCESS_TOKEN</li></ul><h2 id="用户管理" tabindex="-1">用户管理 <a class="header-anchor" href="#用户管理" aria-label="Permalink to &quot;用户管理&quot;">​</a></h2><p>主要讲解一下用户新增接口跟删除接口吧，这块很简单，直接过就可以了。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>@Controller</span></span>
<span class="line"><span>@RequestMapping(&quot;/user&quot;)</span></span>
<span class="line"><span>public class JobUserController {</span></span>
<span class="line"><span>  @RequestMapping(&quot;/add&quot;)</span></span>
<span class="line"><span>  @ResponseBody</span></span>
<span class="line"><span>  @PermissionLimit(adminuser = true)</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; add(XxlJobUser xxlJobUser) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // valid username</span></span>
<span class="line"><span>    if (!StringUtils.hasText(xxlJobUser.getUsername())) {</span></span>
<span class="line"><span>        return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, I18nUtil.getString(&quot;system_please_input&quot;)+I18nUtil.getString(&quot;user_username&quot;) );</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    xxlJobUser.setUsername(xxlJobUser.getUsername().trim());</span></span>
<span class="line"><span>    if (!(xxlJobUser.getUsername().length()&gt;=4 &amp;&amp; xxlJobUser.getUsername().length()&lt;=20)) {</span></span>
<span class="line"><span>        return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, I18nUtil.getString(&quot;system_lengh_limit&quot;)+&quot;[4-20]&quot; );</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // valid password</span></span>
<span class="line"><span>    if (!StringUtils.hasText(xxlJobUser.getPassword())) {</span></span>
<span class="line"><span>        return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, I18nUtil.getString(&quot;system_please_input&quot;)+I18nUtil.getString(&quot;user_password&quot;) );</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    xxlJobUser.setPassword(xxlJobUser.getPassword().trim());</span></span>
<span class="line"><span>    if (!(xxlJobUser.getPassword().length()&gt;=4 &amp;&amp; xxlJobUser.getPassword().length()&lt;=20)) {</span></span>
<span class="line"><span>        return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, I18nUtil.getString(&quot;system_lengh_limit&quot;)+&quot;[4-20]&quot; );</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    // md5 password, md5加密</span></span>
<span class="line"><span>    xxlJobUser.setPassword(DigestUtils.md5DigestAsHex(xxlJobUser.getPassword().getBytes()));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // check repeat</span></span>
<span class="line"><span>    XxlJobUser existUser = xxlJobUserDao.loadByUserName(xxlJobUser.getUsername());</span></span>
<span class="line"><span>    if (existUser != null) {</span></span>
<span class="line"><span>        return new ReturnT&lt;String&gt;(ReturnT.FAIL_CODE, I18nUtil.getString(&quot;user_username_repeat&quot;) );</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // write</span></span>
<span class="line"><span>    xxlJobUserDao.save(xxlJobUser);</span></span>
<span class="line"><span>    return ReturnT.SUCCESS;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  @RequestMapping(&quot;/remove&quot;)</span></span>
<span class="line"><span>  @ResponseBody</span></span>
<span class="line"><span>  @PermissionLimit(adminuser = true)</span></span>
<span class="line"><span>  public ReturnT&lt;String&gt; remove(HttpServletRequest request, int id) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    // avoid opt login seft</span></span>
<span class="line"><span>    XxlJobUser loginUser = PermissionInterceptor.getLoginUser(request);</span></span>
<span class="line"><span>    if (loginUser.getId() == id) {</span></span>
<span class="line"><span>        return new ReturnT&lt;String&gt;(ReturnT.FAIL.getCode(), I18nUtil.getString(&quot;user_update_loginuser_limit&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    xxlJobUserDao.delete(id);</span></span>
<span class="line"><span>    return ReturnT.SUCCESS;</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span></code></pre></div><p>可以看到这两个接口都需要管理员权限。</p>`,33)]))}const k=n(o,[["render",r]]);export{h as __pageData,k as default};
