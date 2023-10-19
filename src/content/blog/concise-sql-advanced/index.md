---
title: SQL简明手册进阶篇
date: 2021-02-17 20:15:08
tags:
- 编程
- SQL
- MySQL
category: 
- 编程语言
- SQL
image: ./cover.jpg
---

# SQL 简明手册 进阶篇

## Toc

## SQL 数据库操作

### 创建数据库 CREATE DATABASE

```sql
CREATE DATABASE [IF NOT EXISTS] <数据库名称>;
```

数据库名称在RDBMS中必须是唯一的。

### 删除数据库 DROP DATABASE

```sql
DROP DATABASE [IF EXISTS] <数据库名称>;
```

### 重命名数据库 RENAME DATABASE

```sql
RENAME DATABASE [IF EXISTS] <旧名称> TO <新名称>;
-- 这是MySQL的语法，不同数据库管理系统可能有不同的语法
```

### 选择数据库 USE

选择当前要进行操作的数据库

```sql
USE <数据库名称>;
```

### 显示语句 SHOW

MySQL使用 `SHOW` 命令实际上就是对 `information_schema` 表执行 `SELECT` 。

```sql
SHOW DATABASES; -- 显示主机所有数据库
SHOW TABLES; -- 显示当前数据库的所有表
SHOW COLUMNS; -- 显示当前表的结构
DESCRIBE; -- 和SHOW COLUMNS等价
SHOW CREATE DATABASE|SCHEMA <数据库名>\G --显示创建某个数据库的命令
-- \G为按列打印 \g等同于;
SHOW CREATE TABLE <表名>\G -- 显示创建某个表的命令
SHOW INDEX FROM <表名>\G -- 显示某个表的索引
```

更多用法请参考官方手册：<https://dev.mysql.com/doc/refman/8.0/en/show.html>

## SQL 表操作

### 创建表 CREATE TABLE

```sql
CREATE TABLE [IF NOT EXISTS] <表名>(
    <字段1> <类型> <默认值> <字段约束>,
    <字段2> <类型> <默认值> <字段约束>,
    ...,
    <表约束>
);
```

### 更改表结构 ALTER TABLE

- 使用 `ADD` 子句添加新字段。
- 使用 `MODIFY` 子句修改字段的属性，例如：约束，默认值等。
- 使用 `DROP` 子句删除字段。

#### 添加新字段

```sql
ALTER TABLE [IF EXISTS] <表名>
ADD <新字段> <类型> <字段约束> [AFTER <已有字段>];
```

如果要在表中指定新字段的顺序，可以使用可选子句 `AFTER <已有字段>` ，使新字段添加在已有字段之后。默认添加在最后一列。

#### 修改字段属性

```sql
ALTER TABLE [IF EXISTS] <表名>
MODIFY <字段名> <类型> <默认值> <字段约束>;

-- 在MySQL中还可以使用CHANGE语法，可以直接重命名
ALTER TABLE [IF EXISTS] <表名>
CHANGE <旧字段名> <新段名> <类型> <默认值> <字段约束>;
```

应该修改没有数据的表的字段的属性。 因为更改已包含数据的表中字段的属性可能会导致永久性数据丢失。
例如，如果列的数据类型为VARCHAR，并且将其更改为 `INT` ，则数据库系统必须将数据从 `VARCHAR` 转换为 `INT` 。 如果转换失败，数据库系统可能会使用列的默认值，这可能与预期不符。

#### 删除字段

```sql
ALTER TABLE [IF EXISTS] <表名>
DROP <字段1>,
DROP <字段2>,
...;
```

### 删除表 DROP TABLE

```sql
DROP TABLE [IF EXISTS] <表名>;
```

为了防止删除不存在的表的错误，使用可选子句 `IF EXISTS` 。 如果使用 `IF EXISTS` 选项，如果删除一个不存在的表，数据库系统将不会抛出任何错误。 某些数据库系统会发出警告或通知。

### 清空表 TRUNCATE TABLE

`DELETE` 对删除百万行的大表效率较低，使用 `TRUNCATE` 更高效。

```sql
TRUNCATE TABLE [IF EXISTS] <表名>;
TRUNCATE TABLE [IF EXISTS] <表1>,<表2>,...;

TRUNCATE [IF EXISTS] <表名>;
-- 有些数据库（如MySQL）允许省略TABLE
```

### 重命名表 RENAME TABLE

```sql
RENAME TABLE [IF EXISTS] <旧表名> TO <新表名>;
-- 下面是一个等价的写法
ALTER TABLE [IF EXISTS] <旧表名> RENAME <新表名>;
```

## SQL 约束

### 主键约束

对于关系表，通过主键字段可以唯一区分不同的记录，任意两条记录的主键值不能相同，主键设定好后一般不要再修改，作为主键最好是完全业务无关的字段，我们一般把这个字段命名为 id。常见的可作为 id 字段的类型有自增整数类型、全局唯一 GUID 类型。

- 创建主键约束

```sql
-- 创建表时设置主键
CREATE TABLE <表名> (
    <字段1> <类型> PRIMARY KEY,
    <字段2> <类型>,
    ...
);

-- 使用表级约束
CREATE TABLE <表名> (
    <字段1> <类型>,
    <字段2> <类型>,
    ...
    PRIMARY KEY(字段1 [,字段2,...]) -- 可以设置多个字段为联合主键
);

-- 使用表级约束并对约束起名
CREATE TABLE <表名> (
    <字段1> <类型>,
    <字段2> <类型>,
    ...
    CONSTRAINT <约束名称> PRIMARY KEY(字段1 [,字段2,...])
);

-- 向已创的表添加主键约束
ALTER TABLE <表名>
ADD PRIMARY KEY (字段1 [,字段2,...]);

-- 添加约束时也可以起名
ALTER TABLE <表名>
ADD CONSTRAINT <约束名> PRIMARY KEY (字段1 [,字段2,...]);
```

- 删除主键约束

```sql
-- 有名称的约束都可以这样删除
ALTER TABLE <表名>
DROP CONSTRAINT <约束名>;

-- 或者直接这样
ALTER TABLE <表名>
DROP PRIMARY KEY;
```

### 外键约束

外键用来在两张关系表之间建立联系，将当前表一些值对应到另一张表的主键上，形成对应关系，这样就创建的两张表之间的链接，称第二张表的主键为当前表的外键。

- 创建外键约束

```sql
-- 定义表时创建外键约束
CREATE TABLE <表1> (
    <字段> <类型>,
    ...
    FOREIGN KEY (字段)
        REFERENCES <表2> (外键字段)
);

-- 为约束起名
CREATE TABLE <表1> (
    <字段> <类型>,
    ...
    CONSTRAINT <约束名称> FOREIGN KEY (字段)
        REFERENCES <表2> (外键字段)
);

-- 向已创的表添加外键约束
ALTER TABLE <表1>
ADD FOREIGN KEY (字段)
    REFERENCES <表2> (外键字段)

-- 添加约束时也可以起名
ALTER TABLE <表1>
ADD CONSTRAINT <约束名> FOREIGN KEY (字段)
    REFERENCES <表2> (外键字段);
```

- 删除外键约束

```sql
ALTER TABLE <表名>
DROP CONSTRAINT <约束名>;

-- 或者这样
ALTER TABLE <表名>
DROP FOREIGN KEY <约束名>; 
-- 如果创建时没有定义约束名，数据库系统会自动生成一个，可以用其他命令查询
```

### 唯一约束

唯一约束用来确保某个或某组字段在每个记录中都是唯一的。

- 创建唯一约束

```sql
-- 创建表时设置唯一约束
CREATE TABLE <表名> (
    <字段1> <类型> UNIQUE,
    <字段2> <类型>,
    ...
);

-- 使用表级约束
CREATE TABLE <表名> (
    <字段1> <类型>,
    <字段2> <类型>,
    ...
    UNIQUE(字段1 [,字段2,...]) -- 可以设置多个字段联合
);

-- 使用表级约束并对约束起名
CREATE TABLE <表名> (
    <字段1> <类型>,
    <字段2> <类型>,
    ...
    CONSTRAINT <约束名称> UNIQUE(字段1 [,字段2,...])
);

-- 向已创的表添加唯一约束
ALTER TABLE <表名>
ADD UNIQUE (字段1 [,字段2,...]);

-- 添加约束时也可以起名
ALTER TABLE <表名>
ADD CONSTRAINT <约束名> UNIQUE (字段1 [,字段2,...]);
```

- 删除唯一约束

```sql
ALTER TABLE <表名>
DROP CONSTRAINT <约束名>;

-- 或者这样
ALTER TABLE <表名>
DROP UNIQUE <约束名>; 
-- 如果创建时没有定义约束名，数据库系统会自动生成一个，可以用其他命令查询
```

### 非空约束

非空约束用来确保插入记录的某个字段不能为空（即 `NULL` ）

```sql
-- 创建约束，非空约束没有表级定义
CREATE TABLE <表名> (
    <字段1> <类型> NOT NULL,
    <字段2> <类型>,
    ...
);
-- 添加约束
ALTER TABLE <表名>
MODIFY <字段名> <类型> NOT NULL; -- 先要确保字段没有NULL值
-- 删除约束
ALTER TABLE <表名>
MODIFY <字段名> <类型> NULL;
```

### 默认约束

默认约束用来确定字段未指定时的默认值。

```sql
-- 创建约束，默认约束没有表级定义
CREATE TABLE <表名> (
    <字段1> <类型> DEFAULT <值>,
    <字段2> <类型>,
    ...
);
-- 添加约束
-- MySQL用法:
-- ALTER COLUMN这种语法仅见于修改DEFAULT值和一些其他不常用地方
ALTER TABLE <表名>
ALTER <字段名> SET DEFAULT <值>;
-- 删除约束
ALTER TABLE <表名>
ALTER <字段名> DROP DEFAULT;
-- 当然也可以通过MODIFY添加和删除
```

### 检查约束

检查约束允许我们自定义新添加值是否合法。MySQL 8.0.16 之前的版本是默认忽略检查约束的。

- 创建检查约束

```sql
-- 创建表时设置检查约束
CREATE TABLE <表名> (
    <字段1> <类型> CHECK(条件表达式),
    <字段2> <类型>,
    ...
);

-- 使用表级约束
CREATE TABLE <表名> (
    <字段1> <类型>,
    <字段2> <类型>,
    ...
    CHECK(条件表达式)
);

-- 使用表级约束并对约束起名
CREATE TABLE <表名> (
    <字段1> <类型>,
    <字段2> <类型>,
    ...
    CONSTRAINT <约束名称> CHECK(条件表达式)
);

-- 向已创的表添加检查约束
ALTER TABLE <表名>
ADD CHECK(条件表达式);

-- 添加约束时也可以起名
ALTER TABLE <表名>
ADD CONSTRAINT <约束名> CHECK(条件表达式);
```

- 删除检查约束

```sql
ALTER TABLE <表名>
DROP CONSTRAINT <约束名>;

-- 或者这样
ALTER TABLE <表名>
DROP CHECK <约束名>; 
-- 如果创建时没有定义约束名，数据库系统会自动生成一个，可以用其他命令查询
```

## SQL 索引

数据库索引或索引，有助于加速从表中检索数据。当从表查询数据时，首先MySQL会检查索引是否存在，然后MySQL使用索引来选择表的精确物理对应行，而不是扫描整个表。所有主键列都是表的主索引。对于数据量小的表不需要建立索引。

### 创建索引

- 创建表时创建索引

MySQL自动将声明为PRIMARY KEY，KEY，UNIQUE或INDEX的任何列添加到索引。

- 向已有表添加索引

```sql
CREATE [UNIQUE|FULLTEXT|SPATIAL] INDEX <索引名>
[USING BTREE|HASH|RTREE] 
ON <表> (<字段> [(长度)] [ASC | DESC],...)
```

UNIQUE索引会对字段创建唯一约束，FULLTEXT、SPATIAL索引仅由MyISAM存储引擎支持，其中FULLTEXT索引仅在数据类型为CHAR，VARCHAR或TEXT的列中接受，SPATIAL索引列值不能为NULL。

不同的存储引擎有不同的索引类型

| 存储引擎    | 允许的索引类型 |
| ----------- | -------------- |
| MyISAM      | BTREE, RTREE   |
| InnoDB      | BTREE          |
| MEMORY/HEAP | HASH, BTREE    |
| NDB         | HASH           |

### 删除索引

```sql
DROP INDEX <索引名> ON <表名>

-- 或者使用ALTER TABLE语法
ALTER TABLE <表名>
DROP INDEX <索引名>
```

## SQL 中的数据类型

以MySQL为例

### 整数

| 数据类型           | 字节数 | 最小值               | 最大值               |
| ------------------ | ------ | -------------------- | -------------------- |
| TINYINT            | 1      | -128                 | 127                  |
| SMALLINT           | 2      | -32768               | 32767                |
| MEDIUMINT          | 3      | -8388608             | 8388607              |
| INT                | 4      | -2147483648          | 2147483647           |
| BIGINT             | 8      | -9223372036854775808 | 9223372036854775807  |
| TINYINT UNSIGNED   | 1      | 0                    | 255                  |
| SMALLINT UNSIGNED  | 2      | 0                    | 65535                |
| MEDIUMINT UNSIGNED | 3      | 0                    | 16777215             |
| INT UNSIGNED       | 4      | 0                    | 4294967295           |
| BIGINT UNSIGNED    | 8      | 0                    | 18446744073709551616 |

可以指定整数的显示宽度`INT(N) UNSIGNED ZEROFILL`，宽度不足用0补全，宽度超过N则无视规则。注意只有设定了`UNSIGNED ZEROFILL` 才有效。

### 浮点数

| 数据类型 | 字节数 | 描述         |
| -------- | ------ | ------------ |
| FLOAT    | 4      | 单精度浮点型 |
| DOUBLE   | 8      | 双精度浮点型 |

可以设定浮点数小数位精度和有效数字精度 `FLOAT(P,D)` ：

- P是表示有效数字数的精度。 P范围为1〜65。
- D是表示小数点后的位数。D的范围是0~30。MySQL要求D<=P。

### 定点数

`DECIMAL` 数据类型用于在数据库中存储精确的数值。有 `UNSIGNED` 和 `ZEROFILL` 属性，也可以和浮点数一样设置小数位精度和有效数字精度，用法同浮点数。不指定精度默认为 `DECIMAL(10, 0)` 。

### 字符串

| 数据类型     | 长度             | 描述                                       |
| ------------ | ---------------- | ------------------------------------------ |
| CHAR(N)      | 0-255字节        | 定长字符串，用空格补全                     |
| VARCHAR(N)   | 0-65536字节      | 可变长字符串，最大长N，N最大值与字符集有关 |
| TINYTEXT     | 0-255字节        | 可变长字符串，数据储存在磁盘中             |
| TEXT         | 0-65535字节      | 可变长文本，数据储存在磁盘中               |
| MEDIUMTEXT   | 0-16777215字节   | 可变长文本，数据储存在磁盘中               |
| LONGTEXT     | 0-4294967295字节 | 可变长文本，数据储存在磁盘中               |
| TINYBLOB     | 0-255字节        | 二进制字符串，数据储存在磁盘中             |
| BLOB         | 0-65535字节      | 二进制字符串，数据储存在磁盘中             |
| MEDIUMBLOB   | 0-16777215字节   | 二进制字符串，数据储存在磁盘中             |
| LONGBLOB     | 0-4294967295字节 | 二进制字符串，数据储存在磁盘中             |
| SET(<列表>)  | 最多64个成员     | 集合（多选）类型                           |
| ENUM(<列表>) | 最多65535个成员  | 枚举（单选）类型，列表成员从1开始编号      |

### 日期

| 数据类型  | 字节数 | 格式                | 描述                      |
| --------- | ------ | ------------------- | ------------------------- |
| DATE      | 3      | yyyy-MM-dd          | 存储日期值                |
| TIME      | 3      | HH:mm:ss            | 存储时分秒                |
| YEAR      | 1      | yyyy                | 存储年                    |
| DATETIME  | 8      | yyyy-MM-dd HH:mm:ss | 存储日期+时间             |
| TIMESTAMP | 4      | yyyy-MM-dd HH:mm:ss | 存储日期+时间，可作时间戳 |

### 其他

| 数据类型           | 描述                    |
| ------------------ | ----------------------- |
| GEOMETRY           | 任何类型的空间值        |
| POINT              | 一个点(一对X-Y坐标)     |
| LINESTRING         | 曲线(一个或多个POINT值) |
| POLYGON            | 多边形                  |
| GEOMETRYCOLLECTION | GEOMETRY值的集合        |
| MULTILINESTRING    | LINESTRING值的集合      |
| MULTIPOINT         | POINT值的集合           |
| MULTIPOLYGON       | POLYGON值的集合         |
| JSON               | JSON数据类型            |

## 参考

1. <https://www.w3cschool.cn/sql/>
2. <https://www.runoob.com/sql/sql-tutorial.html>
3. <https://www.yiibai.com/sql/>
4. <https://www.yiibai.com/mysql/>
5. <https://dev.mysql.com/doc/refman/8.0/en/>
