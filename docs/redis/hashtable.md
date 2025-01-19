# 散列表

散列表是一种键值对数据结构，底层结构有两种:

- dict数据结构：跟全局散列表的构造一样
- listpack(7.0版本之前使用ziplist)数据结构

由于这两种数据结构前面都有讲到，所以这里只讲一下这两种数据结构的使用情况

使用listpack存储数据的情况如下：

- 每个键值对对象的key跟value的字符串的字节数都小于hash-max-listpack-value（默认为64）
- 键值对的数量小于hash-max-listpack-entries的值（默认为512）

其他情况都使用dict，可以从listpack转变成dict，但是不能从dict转变成listpack