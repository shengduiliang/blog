import{_ as s,c as a,a0 as p,o as e}from"./chunks/framework.P9qPzDnn.js";const l="/assets/NVMe.Dq8mAM5f.png",u="/assets/%E8%B0%83%E6%95%B4%E7%A3%81%E7%9B%98.DPcGWARN.png",v=JSON.parse('{"title":"vmware-funsion ubuntu扩容磁盘","description":"","frontmatter":{},"headers":[],"relativePath":"k8s/vmware-funsion-ubuntu-disk-dilatation.md","filePath":"k8s/vmware-funsion-ubuntu-disk-dilatation.md"}'),i={name:"k8s/vmware-funsion-ubuntu-disk-dilatation.md"};function r(t,n,b,c,m,o){return e(),a("div",null,n[0]||(n[0]=[p(`<h1 id="vmware-funsion-ubuntu扩容磁盘" tabindex="-1">vmware-funsion ubuntu扩容磁盘 <a class="header-anchor" href="#vmware-funsion-ubuntu扩容磁盘" aria-label="Permalink to &quot;vmware-funsion ubuntu扩容磁盘&quot;">​</a></h1><p>在使用ubuntu安装minikube的时候，发现磁盘空间不够用，查看磁盘空间大小：</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ubuntu@ubuntu:~$ lsblk</span></span>
<span class="line"><span>NAME                      MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS</span></span>
<span class="line"><span>sr0                        11:0    1 1024M  0 rom  </span></span>
<span class="line"><span>nvme0n1                   259:0    0   20G  0 disk </span></span>
<span class="line"><span>├─nvme0n1p1               259:1    0  953M  0 part /boot/efi</span></span>
<span class="line"><span>├─nvme0n1p2               259:2    0  1.8G  0 part /boot</span></span>
<span class="line"><span>└─nvme0n1p3               259:3    0 17.3G  0 part </span></span>
<span class="line"><span>  └─ubuntu--vg-ubuntu--lv 252:0    0   10G  0 lvm  /</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><p>发现ubuntu--vg-ubuntu--lv只有10G，于是准备扩容磁盘。将ubuntu--vg-ubuntu--lv扩容到50G</p><h2 id="调整虚拟机磁盘空间大小" tabindex="-1">调整虚拟机磁盘空间大小 <a class="header-anchor" href="#调整虚拟机磁盘空间大小" aria-label="Permalink to &quot;调整虚拟机磁盘空间大小&quot;">​</a></h2><p>打开虚拟机设置</p><p><img src="`+l+'" alt="alt text"></p><p>调整磁盘空间大小到50G，注意需要虚拟机关机</p><p><img src="'+u+`" alt="调整磁盘空间大小"></p><h2 id="调整ubuntu文件系统大小" tabindex="-1">调整ubuntu文件系统大小 <a class="header-anchor" href="#调整ubuntu文件系统大小" aria-label="Permalink to &quot;调整ubuntu文件系统大小&quot;">​</a></h2><p>先将nvme0n1扩容到50G</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ubuntu@ubuntu:~/clash$ sudo parted /dev/nvme0n1</span></span>
<span class="line"><span>GNU Parted 3.6</span></span>
<span class="line"><span>Using /dev/nvme0n1</span></span>
<span class="line"><span>Welcome to GNU Parted! Type &#39;help&#39; to view a list of commands.</span></span>
<span class="line"><span>(parted) print                                                            </span></span>
<span class="line"><span>Model: VMware Virtual NVMe Disk (nvme)</span></span>
<span class="line"><span>Disk /dev/nvme0n1: 53.7GB</span></span>
<span class="line"><span>Sector size (logical/physical): 512B/512B</span></span>
<span class="line"><span>Partition Table: gpt</span></span>
<span class="line"><span>Disk Flags: </span></span>
<span class="line"><span></span></span>
<span class="line"><span>Number  Start   End     Size    File system  Name  Flags</span></span>
<span class="line"><span> 1      1049kB  1000MB  999MB   fat32              boot, esp</span></span>
<span class="line"><span> 2      1000MB  2879MB  1879MB  ext4</span></span>
<span class="line"><span> 3      2879MB  21.5GB  18.6GB</span></span>
<span class="line"><span>                                                        </span></span>
<span class="line"><span>(parted) resizepart 3                                                     </span></span>
<span class="line"><span>End?  [21.5GB]? 100%                                                      </span></span>
<span class="line"><span>(parted)                                                                  </span></span>
<span class="line"><span>(parted) quit                                                             </span></span>
<span class="line"><span>Information: You may need to update /etc/fstab.</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br></div></div><p>扩展物理卷： 确保物理卷已经正确使用整个 nvme0n1p3 分区。</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ubuntu@ubuntu:~/clash$ sudo pvresize /dev/nvme0n1p3</span></span>
<span class="line"><span>  Physical volume &quot;/dev/nvme0n1p3&quot; changed</span></span>
<span class="line"><span>  1 physical volume(s) resized or updated / 0 physical volume(s) not resized</span></span>
<span class="line"><span>ubuntu@ubuntu:~/clash$ sudo pvs</span></span>
<span class="line"><span>  PV             VG        Fmt  Attr PSize   PFree </span></span>
<span class="line"><span>  /dev/nvme0n1p3 ubuntu-vg lvm2 a--  &lt;47.32g 30.00g</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br></div></div><p>扩展ubuntu--vg-ubuntu--lv</p><div class="language- vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>ubuntu@ubuntu:~/clash$ sudo lvextend -l +100%FREE /dev/ubuntu-vg/ubuntu-lv</span></span>
<span class="line"><span>  Size of logical volume ubuntu-vg/ubuntu-lv changed from &lt;17.32 GiB (4433 extents) to &lt;47.32 GiB (12113 extents).</span></span>
<span class="line"><span>  Logical volume ubuntu-vg/ubuntu-lv successfully resized.</span></span>
<span class="line"><span>ubuntu@ubuntu:~/clash$ sudo resize2fs /dev/ubuntu-vg/ubuntu-lv</span></span>
<span class="line"><span>resize2fs 1.47.0 (5-Feb-2023)</span></span>
<span class="line"><span>Filesystem at /dev/ubuntu-vg/ubuntu-lv is mounted on /; on-line resizing required</span></span>
<span class="line"><span>old_desc_blocks = 3, new_desc_blocks = 6</span></span>
<span class="line"><span>The filesystem on /dev/ubuntu-vg/ubuntu-lv is now 12403712 (4k) blocks long.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>ubuntu@ubuntu:~/clash$ lsblk</span></span>
<span class="line"><span>NAME                      MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS</span></span>
<span class="line"><span>sr0                        11:0    1 1024M  0 rom  </span></span>
<span class="line"><span>nvme0n1                   259:0    0   50G  0 disk </span></span>
<span class="line"><span>├─nvme0n1p1               259:1    0  953M  0 part /boot/efi</span></span>
<span class="line"><span>├─nvme0n1p2               259:2    0  1.8G  0 part /boot</span></span>
<span class="line"><span>└─nvme0n1p3               259:3    0 47.3G  0 part </span></span>
<span class="line"><span>  └─ubuntu--vg-ubuntu--lv 252:0    0 47.3G  0 lvm  /</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br></div></div>`,16)]))}const h=s(i,[["render",r]]);export{v as __pageData,h as default};
