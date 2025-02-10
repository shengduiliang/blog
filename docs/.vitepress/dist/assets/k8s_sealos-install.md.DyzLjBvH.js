import{_ as a,c as n,a0 as e,o as p}from"./chunks/framework.P9qPzDnn.js";const l="/assets/sealos-release.REdIVfCd.png",i="/assets/sealos-install-error.DaLPrClb.png",h=JSON.parse('{"title":"sealos安装k8s 1.27","description":"","frontmatter":{},"headers":[],"relativePath":"k8s/sealos-install.md","filePath":"k8s/sealos-install.md"}'),t={name:"k8s/sealos-install.md"};function r(c,s,o,d,u,b){return p(),n("div",null,s[0]||(s[0]=[e(`<h1 id="sealos安装k8s-1-27" tabindex="-1">sealos安装k8s 1.27 <a class="header-anchor" href="#sealos安装k8s-1-27" aria-label="Permalink to &quot;sealos安装k8s 1.27&quot;">​</a></h1><p>本文档展示使用sealos来安装k8s集群，具体的安装步骤可以查看以下链接：</p><p><a href="https://sealos.run/docs/5.0.0/developer-guide/lifecycle-management/quick-start/deploy-kubernetes" target="_blank" rel="noreferrer">https://sealos.run/docs/5.0.0/developer-guide/lifecycle-management/quick-start/deploy-kubernetes</a></p><p>由于本人用的虚拟机是ARM ubuntu，根据官网的操作步骤有一些坑，所以这里展示安装步骤</p><table tabindex="0"><thead><tr><th>主机名</th><th>配置</th><th>ip地址</th></tr></thead><tbody><tr><td>k8s-master</td><td>2C4G</td><td>192.168.233.129</td></tr><tr><td>k8s-slave01</td><td>2C4G</td><td>192.168.233.130</td></tr><tr><td>k8s-slave02</td><td>2C4G</td><td>192.168.233.131</td></tr></tbody></table><h2 id="hostname配置" tabindex="-1">hostname配置 <a class="header-anchor" href="#hostname配置" aria-label="Permalink to &quot;hostname配置&quot;">​</a></h2><p>调整每台机子的主机名</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>sudo hostnamectl set-hostname k8s-slave02</span></span>
<span class="line"><span>sudo hostnamectl set-hostname k8s-slave01</span></span>
<span class="line"><span>sudo hostnamectl set-hostname k8s-master</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h2 id="host配置" tabindex="-1">host配置 <a class="header-anchor" href="#host配置" aria-label="Permalink to &quot;host配置&quot;">​</a></h2><p>每台主机都配置其他主机的host，修改/etc/hosts文件，在后面加上以下信息</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>192.168.233.129 k8s-master</span></span>
<span class="line"><span>192.168.233.130 k8s-slave01</span></span>
<span class="line"><span>192.168.233.131 k8s-slave02</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h2 id="下载sealos" tabindex="-1">下载sealos <a class="header-anchor" href="#下载sealos" aria-label="Permalink to &quot;下载sealos&quot;">​</a></h2><p>试了sealos教程的二进制自动下载跟包管理工具安装，都没有用，所以最终选择了用sealos的二进制手动下载，先到sealos官网查看sealos的最新版本，<a href="https://github.com/labring/sealos/releases%E3%80%82%E6%B3%A8%E6%84%8F%E4%BB%A5%E4%B8%8B%E6%93%8D%E4%BD%9C%E9%83%BD%E5%9C%A8%E4%B8%BB%E6%9C%BA%E4%B8%8A%E6%89%A7%E8%A1%8C%E3%80%82" target="_blank" rel="noreferrer">https://github.com/labring/sealos/releases。注意以下操作都在主机上执行。</a></p><p><img src="`+l+`" alt="sealos-release"></p><p>如上图，最新的版本为5.0.1，右键复制链接，先下载文件包</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>wget https://mirror.ghproxy.com/https://github.com/labring/sealos/releases/download/v5.0.1/sealos_5.0.1_linux_arm64.tar.gz</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>解压缩，然后将sealos复制到bin目录</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>tar zxvf sealos_5.0.1_linux_arm64.tar.gz &amp;&amp; sudo chmod +x sealos &amp;&amp; sudo mv sealos /usr/bin</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h2 id="安装sealos" tabindex="-1">安装sealos <a class="header-anchor" href="#安装sealos" aria-label="Permalink to &quot;安装sealos&quot;">​</a></h2><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>sealos run registry.cn-shanghai.aliyuncs.com/labring/kubernetes:v1.27.7 registry.cn-shanghai.aliyuncs.com/labring/helm:v3.9.4 registry.cn-shanghai.aliyuncs.com/labring/cilium:v1.13.4 \\</span></span>
<span class="line"><span>     --masters 192.168.64.2,192.168.64.22,192.168.64.20 \\</span></span>
<span class="line"><span>     --nodes 192.168.64.21,192.168.64.19 -p [your-ssh-passwd]</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>官网上的这条指令有问题，不支持-p参数了，会报错</p><p><img src="`+i+`" alt="sealos-install-error"></p><p>要换成以下指令，先配置一主一从的</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>sudo sealos run registry.cn-shanghai.aliyuncs.com/labring/kubernetes:v1.27.7 registry.cn-shanghai.aliyuncs.com/labring/helm:v3.9.4 registry.cn-shanghai.aliyuncs.com/labring/cilium:v1.13.4 \\</span></span>
<span class="line"><span>     --masters 192.168.233.129 \\</span></span>
<span class="line"><span>     --nodes 192.168.233.130 --passwd 525342 --user=&#39;ubuntu&#39;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>要是--user指定从机1的用户名，--passwd指定从机1的密码。</p><p>期间会遇到缺少两个插件的问题，安装对应的插件重试即可</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>sudo apt install fuse-overlayfs</span></span>
<span class="line"><span>sudo apt install uidmap</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><p>重新执行安装语句，等到安装完成，出现以下语句表示主机成功了。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>To start using your cluster, you need to run the following as a regular user:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  mkdir -p $HOME/.kube</span></span>
<span class="line"><span>  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config</span></span>
<span class="line"><span>  sudo chown $(id -u):$(id -g) $HOME/.kube/config</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Alternatively, if you are the root user, you can run:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  export KUBECONFIG=/etc/kubernetes/admin.conf</span></span>
<span class="line"><span></span></span>
<span class="line"><span>You should now deploy a pod network to the cluster.</span></span>
<span class="line"><span>Run &quot;kubectl apply -f [podnetwork].yaml&quot; with one of the options listed at:</span></span>
<span class="line"><span>  https://kubernetes.io/docs/concepts/cluster-administration/addons/</span></span>
<span class="line"><span></span></span>
<span class="line"><span>You can now join any number of control-plane nodes by copying certificate authorities</span></span>
<span class="line"><span>and service account keys on each node and then running the following as root:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  kubeadm join apiserver.cluster.local:6443 --token &lt;value withheld&gt; \\</span></span>
<span class="line"><span>        --discovery-token-ca-cert-hash sha256:73ba5798f05398ea28e8fe30f065ab367b60154ef89e61ee7e6fb2ad9804b2a3 \\</span></span>
<span class="line"><span>        --control-plane --certificate-key &lt;value withheld&gt;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br></div></div><p>出现以下语句表示从机安装成功了</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>2024-11-24T16:46:16 info succeeded in creating a new cluster, enjoy it!</span></span>
<span class="line"><span>2024-11-24T16:46:16 info </span></span>
<span class="line"><span>      ___           ___           ___           ___       ___           ___</span></span>
<span class="line"><span>     /\\  \\         /\\  \\         /\\  \\         /\\__\\     /\\  \\         /\\  \\</span></span>
<span class="line"><span>    /::\\  \\       /::\\  \\       /::\\  \\       /:/  /    /::\\  \\       /::\\  \\</span></span>
<span class="line"><span>   /:/\\ \\  \\     /:/\\:\\  \\     /:/\\:\\  \\     /:/  /    /:/\\:\\  \\     /:/\\ \\  \\</span></span>
<span class="line"><span>  _\\:\\~\\ \\  \\   /::\\~\\:\\  \\   /::\\~\\:\\  \\   /:/  /    /:/  \\:\\  \\   _\\:\\~\\ \\  \\</span></span>
<span class="line"><span> /\\ \\:\\ \\ \\__\\ /:/\\:\\ \\:\\__\\ /:/\\:\\ \\:\\__\\ /:/__/    /:/__/ \\:\\__\\ /\\ \\:\\ \\ \\__\\</span></span>
<span class="line"><span> \\:\\ \\:\\ \\/__/ \\:\\~\\:\\ \\/__/ \\/__\\:\\/:/  / \\:\\  \\    \\:\\  \\ /:/  / \\:\\ \\:\\ \\/__/</span></span>
<span class="line"><span>  \\:\\ \\:\\__\\    \\:\\ \\:\\__\\        \\::/  /   \\:\\  \\    \\:\\  /:/  /   \\:\\ \\:\\__\\</span></span>
<span class="line"><span>   \\:\\/:/  /     \\:\\ \\/__/        /:/  /     \\:\\  \\    \\:\\/:/  /     \\:\\/:/  /</span></span>
<span class="line"><span>    \\::/  /       \\:\\__\\         /:/  /       \\:\\__\\    \\::/  /       \\::/  /</span></span>
<span class="line"><span>     \\/__/         \\/__/         \\/__/         \\/__/     \\/__/         \\/__/</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                  Website: https://www.sealos.io/</span></span>
<span class="line"><span>                  Address: github.com/labring/sealos</span></span>
<span class="line"><span>                  Version: 5.0.1-2b74a1281</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div><p>设置k8s的kube文件路径，在上面主机部分输出可以找到。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>  mkdir -p $HOME/.kube</span></span>
<span class="line"><span>  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config</span></span>
<span class="line"><span>  sudo chown $(id -u):$(id -g) $HOME/.kube/config</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><p>然后执行kubectl get nodes查看节点状态</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ubuntu@k8s-master:~$ kubectl get nodes</span></span>
<span class="line"><span>NAME          STATUS     ROLES           AGE    VERSION</span></span>
<span class="line"><span>k8s-master    Ready      control-plane   109s   v1.27.7</span></span>
<span class="line"><span>k8s-slave01   NotReady   &lt;none&gt;          85s    v1.27.7</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>等到一段时间过后重新查看</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ubuntu@k8s-master:~$ kubectl get nodes</span></span>
<span class="line"><span>NAME          STATUS   ROLES           AGE     VERSION</span></span>
<span class="line"><span>k8s-master    Ready    control-plane   5m57s   v1.27.7</span></span>
<span class="line"><span>k8s-slave01   Ready    &lt;none&gt;          5m33s   v1.27.7</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><p>一主一从安装完毕</p><h2 id="增加k8s节点" tabindex="-1">增加k8s节点 <a class="header-anchor" href="#增加k8s节点" aria-label="Permalink to &quot;增加k8s节点&quot;">​</a></h2><p>增加node节点</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>sudo sealos add --nodes 192.168.233.131 --passwd 525342 --user=&#39;ubuntu&#39;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>至此，三节点集群搭建完成</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ubuntu@k8s-master:~$ kubectl get nodes</span></span>
<span class="line"><span>NAME          STATUS   ROLES           AGE   VERSION</span></span>
<span class="line"><span>k8s-master    Ready    control-plane   41m   v1.27.7</span></span>
<span class="line"><span>k8s-slave01   Ready    &lt;none&gt;          40m   v1.27.7</span></span>
<span class="line"><span>k8s-slave02   Ready    &lt;none&gt;          79s   v1.27.7</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br></div></div><p>增加master节点</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>sudo sealos add --masters 192.168.233.131 --passwd 525342 --user=&#39;ubuntu&#39;</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div>`,45)]))}const g=a(t,[["render",r]]);export{h as __pageData,g as default};
