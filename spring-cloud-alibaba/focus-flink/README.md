# Focus Flink CDC 项目

## 项目概述

本项目实现了独立的 MySQL 数据变更捕获（CDC）作业，将数据实时同步到 Kafka。采用标准的Flink应用架构，无Spring Boot依赖，确保最佳性能和稳定性。

## 功能特性

- ✅ MySQL Binlog 实时监听
- ✅ 数据变更自动捕获（INSERT、UPDATE、DELETE）
- ✅ 数据实时推送到 Kafka
- ✅ 精确一次语义保证
- ✅ 故障自动恢复
- ✅ Web UI 监控界面
- ✅ 纯Flink架构，无序列化问题

## 技术栈

- Apache Flink 1.17.2
- Flink CDC Connector 2.4.2
- Apache Kafka
- MySQL 8.0+

## 项目结构

```
focus-flink/
├── focus-flink-core/                      # Flink CDC核心模块
│   ├── src/main/java/
│   │   └── com/focus/flink/core/
│   │       ├── job/
│   │       │   ├── FlinkCdcStandaloneJob.java    # 主要作业类
│   │       │   └── CdcDataProcessor.java         # 数据处理器
│   │       └── model/
│   │           └── FlinkBasicsTest.java          # 数据模型
│   └── pom.xml
├── focus-flink-kafka-consumption/         # Kafka消费模块
│   ├── src/main/java/
│   │   └── com/focus/flink/consumption/
│   │       ├── consumer/                         # Kafka消费者
│   │       ├── service/                          # 业务服务
│   │       ├── entity/                           # 数据实体
│   │       ├── repository/                       # 数据访问层
│   │       ├── controller/                       # REST控制器
│   │       └── config/                           # 配置类
│   ├── src/main/resources/
│   │   └── application.yml                       # 配置文件
│   └── pom.xml
├── pom.xml                             # 父POM
└── README.md
```

## 快速开始

### 1. 环境准备

#### MySQL 配置

在 MySQL 配置文件 `my.cnf` 中添加以下配置：

```ini
[mysqld]
# 启用 binlog
log-bin=mysql-bin
# 设置 server-id（必须唯一）
server-id=1
# 设置 binlog 格式为 ROW（CDC 需要）
binlog-format=ROW
# 设置 binlog 行镜像为 FULL（推荐）
binlog-row-image=FULL
# 设置 binlog 过期时间（7天）
binlog-expire-logs-seconds=604800
```

配置完成后重启 MySQL 服务：

```bash
# Linux/Mac
sudo service mysql restart
# 或
sudo systemctl restart mysql

# Windows
net stop mysql
net start mysql
```

#### 验证 MySQL binlog 配置

```sql
-- 检查 binlog 是否启用
SHOW VARIABLES LIKE 'log_bin';

-- 检查 binlog 格式
SHOW VARIABLES LIKE 'binlog_format';

-- 检查 binlog 行镜像
SHOW VARIABLES LIKE 'binlog_row_image';

-- 查看当前 binlog 状态
SHOW MASTER STATUS;
```

#### 创建测试表

1. **执行 `sql/create_table.sql` 脚本**（源表）：

```sql
USE focus_admin;

CREATE TABLE IF NOT EXISTS t_flink_basics_test (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    name VARCHAR(255) DEFAULT NULL COMMENT '测试名称',
    create_by BIGINT DEFAULT NULL COMMENT '创建者',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by BIGINT DEFAULT NULL COMMENT '更新者',
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    version BIGINT DEFAULT 0 COMMENT '版本',
    deleted INT DEFAULT 0 COMMENT '逻辑删除标识（0：未删除，1：已删除）',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Flink基础测试表';
```

2. **执行 `sql/create_table_2.sql` 脚本**（目标表）：

```sql
CREATE TABLE IF NOT EXISTS t_flink_basics_test_2 (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    original_id BIGINT DEFAULT NULL COMMENT '原始ID（来自CDC数据）',
    name VARCHAR(255) DEFAULT NULL COMMENT '测试名称',
    -- ... 其他字段与源表一致
    cdc_operation VARCHAR(10) DEFAULT NULL COMMENT 'CDC操作类型',
    process_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '数据处理时间',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='CDC数据存储表';
```

#### Kafka 准备

确保 Kafka 已启动，并创建目标主题：

```bash
# 创建主题（如果不存在）
kafka-topics.sh --create --topic test-topic --bootstrap-server localhost:9092 --partitions 3 --replication-factor 1

# 查看主题
kafka-topics.sh --list --bootstrap-server localhost:9092
```

### 2. 配置参数

在 `FlinkCdcStandaloneJob.java` 中修改连接参数：

```java
// MySQL配置
String hostname = "localhost";
int port = 3306;
String username = "root";
String password = "your_password";    // 修改为你的密码
String database = "focus_admin";
String table = "t_flink_basics_test";

// Kafka配置
String bootstrapServers = "localhost:9092";
String topic = "test-topic";
```

### 3. 启动应用

#### 方式一：使用启动脚本（推荐）

```bash
# Linux/Mac
chmod +x run.sh
./run.sh

# Windows
run.bat
```

#### 方式二：命令行启动

```bash
# 编译项目
mvn clean compile -DskipTests

# 启动作业
java -cp "focus-flink-core/target/classes:$(mvn dependency:build-classpath -Dmdep.outputFile=/dev/stdout -q)" \
     com.focus.flink.core.job.FlinkCdcStandaloneJob
```

#### 方式三：IDE 直接运行

在 IDE 中直接运行 `FlinkCdcStandaloneJob.main()` 方法

### 4. 验证功能

#### 启动成功标志

应用启动后，你应该看到类似的日志：

```
2024-XX-XX XX:XX:XX INFO  FlinkCdcStandaloneJob - === 启动独立Flink CDC作业 ===
2024-XX-XX XX:XX:XX INFO  FlinkCdcStandaloneJob - Flink环境配置完成 - 并行度: 1, 检查点间隔: 60000ms
2024-XX-XX XX:XX:XX INFO  FlinkCdcStandaloneJob - MySQL CDC Source配置完成 - 数据库: focus_admin, 表: t_flink_basics_test
2024-XX-XX XX:XX:XX INFO  FlinkCdcStandaloneJob - Kafka Sink配置完成 - 服务器: localhost:9092, 主题: test-topic
2024-XX-XX XX:XX:XX INFO  FlinkCdcStandaloneJob - Flink CDC作业配置完成，开始执行...
2024-XX-XX XX:XX:XX INFO  FlinkCdcStandaloneJob - Flink Web UI: http://localhost:8081
```

#### 访问 Flink Web UI

打开浏览器访问：http://localhost:8081

在 Web UI 中你可以看到：
- 任务运行状态
- 数据处理量统计
- 检查点信息
- 任务拓扑图

#### 测试数据变更

在 MySQL 中执行以下 SQL 来测试 CDC 功能：

```sql
-- 插入数据
INSERT INTO t_flink_basics_test (name, create_by) VALUES ('新测试数据', 1);

-- 更新数据
UPDATE t_flink_basics_test SET name = '更新后的数据' WHERE id = 1;

-- 删除数据
DELETE FROM t_flink_basics_test WHERE id = 2;
```

#### 查看 Kafka 消息

使用 Kafka 消费者工具查看消息：

```bash
kafka-console-consumer.sh --topic test-topic --from-beginning --bootstrap-server localhost:9092
```

你应该能看到类似的CDC数据：

```json
{
  "before": null,
  "after": {
    "id": 4,
    "name": "新测试数据",
    "create_by": 1,
    "create_time": "2024-01-01T10:00:00Z",
    ...
  },
  "op": "c",
  "ts_ms": 1640995200000,
  ...
}
```

### 5. 监控和运维

#### 日志查看

- 应用日志会输出详细的运行信息
- Flink任务日志可在Web UI的Task Managers页面查看

#### 常见问题排查

1. **Flink 任务启动失败**
   - 检查 MySQL binlog 配置
   - 确认数据库连接信息正确
   - 查看详细错误日志

2. **没有接收到 CDC 数据**
   - 确认 MySQL 表存在且有数据变更
   - 检查 binlog 格式是否为 ROW
   - 验证 Kafka 主题是否存在

3. **性能问题**
   - 调整并行度配置
   - 优化检查点间隔
   - 监控资源使用情况

#### 日志控制

项目使用Logback进行日志管理，通过`logback.xml`配置文件控制日志输出：

- **屏蔽Debezium调试信息**：设置`io.debezium.connector.base.ChangeEventQueue=ERROR`级别
- **控制Flink内部日志**：设置`org.apache.flink.shaded=WARN`级别
- **控制Kafka日志**：设置`org.apache.kafka=WARN`级别
- **应用日志**：保持INFO级别显示核心信息

现在会看到干净的日志输出：
```
14:30:01.234 [main] INFO  FlinkCdcStandaloneJob - === 启动独立Flink CDC作业 ===
14:30:02.123 [main] INFO  FlinkCdcStandaloneJob - MySQL CDC Source配置完成 - 数据库: focus_admin, 表: t_flink_basics_test
14:30:03.456 [CDC-Thread] INFO  CdcDataProcessor - ✓ 捕获到INSERT操作
14:30:04.789 [CDC-Thread] INFO  CdcDataProcessor - ✓ 捕获到UPDATE操作
```

优势：
- ✅ 使用成熟的Logback日志框架
- ✅ 配置文件自动加载，无需复杂的JVM参数
- ✅ 完全屏蔽`no records available yet, sleeping...`调试信息
- ✅ 干净的控制台输出，不再有红色错误信息

#### 停止应用

- IDE 中直接停止运行
- 命令行中使用 `Ctrl+C`
- 在Flink Web UI中取消作业

## 配置参数说明

| 参数 | 位置 | 描述 | 默认值 |
|------|------|------|--------|
| hostname | createMySqlSource() | MySQL 主机地址 | localhost |
| port | createMySqlSource() | MySQL 端口 | 3306 |
| username | createMySqlSource() | MySQL 用户名 | root |
| password | createMySqlSource() | MySQL 密码 | JZ8Qrd,ZlkPHs |
| database | createMySqlSource() | 监听的数据库 | focus_admin |
| table | createMySqlSource() | 监听的表 | t_flink_basics_test |
| bootstrapServers | createKafkaSink() | Kafka 服务器地址 | localhost:9092 |
| topic | createKafkaSink() | Kafka 主题 | test-topic |
| parallelism | setupEnvironment() | 并行度 | 1 |
| checkpointInterval | setupEnvironment() | 检查点间隔(ms) | 60000 |

## 生产部署

### 打包部署

```bash
# 打包
mvn clean package -DskipTests

# 复制依赖
mvn dependency:copy-dependencies -DoutputDirectory=target/lib

# 运行
java -cp "target/classes:target/lib/*" com.focus.flink.core.job.FlinkCdcStandaloneJob
```

### Flink 集群部署

```bash
# 打包为fat jar
mvn clean package -DskipTests

# 提交到Flink集群
flink run focus-flink-core/target/focus-flink-core-*.jar
```

## 许可证

[待定]

## Kafka消费模块说明

### 启动Kafka消费应用

项目包含一个额外的Spring Boot模块用于消费CDC数据：

```bash
# Windows
start-kafka-consumption.bat

# Linux/Mac
chmod +x start-kafka-consumption.sh
./start-kafka-consumption.sh

# 或者
cd focus-flink-kafka-consumption
mvn spring-boot:run
```

### 功能特性

- **自动消费CDC数据**：从test-topic主题消费Flink CDC输出的数据
- **数据转换存储**：将CDC数据转换后存储到`t_flink_basics_test_2`表
- **操作类型处理**：支持INSERT、UPDATE、DELETE、快照读取操作
- **REST API监控**：提供应用状态和数据统计接口
- **手动确认机制**：确保消息处理的可靠性

### API接口

- 健康检查：http://localhost:10015/api/monitor/health
- 应用状态：http://localhost:10015/api/monitor/status  
- 数据统计：http://localhost:10015/api/monitor/statistics

### 数据流向

```
MySQL (t_flink_basics_test) 
    ↓ (binlog)
Flink CDC 
    ↓ (JSON to Kafka)
test-topic 
    ↓ (consume & transform)
Spring Boot消费者 
    ↓ (save to database)
MySQL (t_flink_basics_test_2)
```

## 联系方式

如有问题，请联系开发团队。
