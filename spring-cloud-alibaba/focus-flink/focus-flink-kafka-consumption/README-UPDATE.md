# Flink Kafka 消费模块 - 结构更新说明

## 更新概述

根据新的表结构 `t_flink_basics_test_2`，将项目从 JPA 迁移到 MyBatis-Plus，并按照 `focus-demo-core` 模块的分层结构重新组织代码。

## 新表结构

```sql
CREATE TABLE `t_flink_basics_test_2` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'id',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_cs_0900_ai_ci DEFAULT NULL COMMENT '名称',
  `create_by` bigint DEFAULT NULL COMMENT '创建人',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新人',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `version` bigint DEFAULT NULL COMMENT '版本号',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_cs_0900_ai_ci;
```

## 主要更改

### 1. 依赖更新
- **移除**: `spring-boot-starter-data-jpa`
- **添加**: `focus-mybatis-plus` 和 `focus-web`

### 2. 代码分层结构 (参考 focus-demo-core)
```
src/main/java/com/focus/flink/consumption/
├── application/                    # 应用服务层
│   └── FlinkBasicsTest2ApplicationService.java
├── controller/                     # 控制器层
│   ├── FlinkBasicsTest2Controller.java
│   └── MonitorController.java
├── domain/                         # 领域对象
│   ├── entity/
│   │   └── FlinkBasicsTest2.java
│   ├── req/
│   │   └── FlinkBasicsTest2Req.java
│   └── vo/
│       └── FlinkBasicsTest2Vo.java
├── domainservice/                  # 领域服务层
│   └── FlinkBasicsTest2DomainService.java
├── repository/                     # 数据访问层
│   ├── mapper/
│   │   └── FlinkBasicsTest2Mapper.java
│   └── FlinkBasicsTest2Repository.java
├── consumer/                       # Kafka消费者
├── service/                        # CDC数据处理服务
├── config/                         # 配置类
└── dto/                           # 数据传输对象
```

### 3. 实体类更新
- **继承**: `BaseEntity` (包含 id, createBy, createTime, updateBy, updateTime, version)
- **简化**: 只保留业务字段 `name`
- **注解**: 使用 `@TableName("t_flink_basics_test_2")`

### 4. 配置更新
- **MyBatis-Plus配置**: 替换 JPA 配置
- **Mapper扫描**: 添加 `@MapperScan` 注解
- **逻辑删除**: 配置 deleted 字段

### 5. CDC数据处理逻辑更新
- **简化**: 移除原来的 `originalId` 跟踪逻辑
- **记录**: 每个CDC操作都创建新记录，便于审计
- **字段映射**: 只映射 `name` 字段，其他字段由 MyBatis-Plus 自动处理

## API 接口

### RESTful API
- `GET /flink/basicsTest2/list` - 查询列表
- `GET /flink/basicsTest2/{id}` - 根据ID查询
- `POST /flink/basicsTest2` - 创建数据
- `PUT /flink/basicsTest2/{id}` - 更新数据
- `DELETE /flink/basicsTest2/{id}` - 删除数据

## 配置说明

### MyBatis-Plus配置
```yaml
mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
      id-type: auto
  mapper-locations: classpath*:mapper/**/*.xml
```

## 迁移完成的功能

1. ✅ MyBatis-Plus 集成
2. ✅ 分层架构重构
3. ✅ 实体类简化
4. ✅ CDC 数据处理逻辑更新
5. ✅ RESTful API 接口
6. ✅ 配置文件更新
7. ✅ Mapper 扫描配置
8. ✅ 智能字段映射和类型转换
9. ✅ 高性能缓存机制
10. ✅ 灵活的同步策略

## CdcDataProcessService 优化特性

### 🚀 核心优化功能

1. **智能字段映射**
   - 自动驼峰命名转换（create_by -> createBy）
   - 可配置的字段映射关系
   - 支持复杂数据类型转换

2. **高性能缓存机制**
   - 实体字段反射缓存，提升性能
   - 避免重复的反射操作

3. **灵活的同步策略**
   - INSERT: 直接插入新记录
   - UPDATE: 智能查找并更新现有记录，找不到则新增
   - DELETE: 物理删除对应记录
   - SNAPSHOT: 去重插入快照数据

4. **强大的类型转换**
   - 支持 String, Long, Integer, Double, BigDecimal
   - 智能 LocalDateTime 解析（多种时间格式）
   - Boolean 类型转换

5. **详细的日志记录**
   - 操作成功/失败日志
   - 数据变更详情记录
   - 字段映射过程跟踪

### 📋 字段映射配置

```java
// 源表字段 -> 目标表字段
FIELD_MAPPING.put("id", "sourceId");           
FIELD_MAPPING.put("name", "name");             
FIELD_MAPPING.put("create_by", "createBy");    
FIELD_MAPPING.put("create_time", "createTime");
FIELD_MAPPING.put("update_by", "updateBy");
FIELD_MAPPING.put("update_time", "updateTime");
FIELD_MAPPING.put("version", "version");
```

### 🔧 支持的时间格式

- `yyyy-MM-dd HH:mm:ss`
- `yyyy-MM-dd'T'HH:mm:ss`
- `yyyy-MM-dd'T'HH:mm:ss.SSS`
- ISO_LOCAL_DATE_TIME

## 使用说明

1. 确保数据库中存在 `t_flink_basics_test_2` 表
2. 启动应用：`mvn spring-boot:run`
3. 访问 API 接口进行测试
4. 查看 CDC 数据处理日志
5. 监控同步状态和性能指标
