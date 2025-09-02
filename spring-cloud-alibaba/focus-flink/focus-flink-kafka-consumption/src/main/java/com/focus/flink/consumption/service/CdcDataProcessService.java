package com.focus.flink.consumption.service;

import cn.hutool.core.util.ReflectUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.focus.flink.consumption.domain.entity.FlinkBasicsTest2;
import com.focus.flink.consumption.dto.CdcDataMessage;
import com.focus.flink.consumption.repository.FlinkBasicsTest2Repository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * CDC数据处理服务 - 优化版
 * <p>
 * 功能：
 * 1. 灵活的字段映射和类型转换
 * 2. 智能的数据同步策略
 * 3. 性能优化的缓存机制
 * 4. 详细的操作日志记录
 *
 * @author focus
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CdcDataProcessService {

    private final FlinkBasicsTest2Repository repository;

    // 缓存实体字段映射关系，提高性能
    private static final Map<Class<?>, Map<String, Field>> FIELD_CACHE = new ConcurrentHashMap<>();

    // 支持的时间格式
    private static final List<DateTimeFormatter> DATE_FORMATTERS = Arrays.asList(
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS"),
            DateTimeFormatter.ISO_LOCAL_DATE_TIME
    );

    // CDC字段到实体字段的映射关系
    private static final Map<String, String> FIELD_MAPPING = new HashMap<>();

    static {
        // 源表字段 -> 目标表字段
        FIELD_MAPPING.put("id", "sourceId");           // 源表ID映射到sourceId字段（如果有的话）
        FIELD_MAPPING.put("name", "name");             // 名称字段直接映射
        FIELD_MAPPING.put("create_by", "createBy");    // 下划线转驼峰
        FIELD_MAPPING.put("create_time", "createTime");
        FIELD_MAPPING.put("update_by", "updateBy");
        FIELD_MAPPING.put("update_time", "updateTime");
        FIELD_MAPPING.put("version", "version");
    }

    /**
     * 处理CDC数据消息
     *
     * @param cdcMessage CDC消息
     */
    @Transactional(rollbackFor = Exception.class)
    public void processCdcMessage(CdcDataMessage cdcMessage) {
        try {
            String operation = cdcMessage.getOperation();
            log.info("开始处理CDC操作: {}", operation);

            switch (operation) {
                case "c": // Create - INSERT
                    handleInsert(cdcMessage);
                    break;
                case "u": // Update - UPDATE
                    handleUpdate(cdcMessage);
                    break;
                case "d": // Delete - DELETE
                    handleDelete(cdcMessage);
                    break;
                case "r": // Read - 快照读取
                    handleSnapshot(cdcMessage);
                    break;
                default:
                    log.warn("未知的CDC操作类型: {}", operation);
            }
        } catch (Exception e) {
            log.error("处理CDC消息失败: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 处理INSERT操作
     */
    private void handleInsert(CdcDataMessage cdcMessage) {
        Map<String, Object> afterData = cdcMessage.getAfter();
        if (afterData == null || afterData.isEmpty()) {
            log.warn("INSERT操作缺少after数据");
            return;
        }

        Long sourceId = extractSourceId(afterData);
        FlinkBasicsTest2 entity = mapToEntity(afterData);

        boolean success = repository.save(entity);
        if (success) {
            log.info("同步INSERT数据成功 - 源表ID: {}, 目标表ID: {}, 名称: {}",
                    sourceId, entity.getId(), entity.getName());
        } else {
            log.error("同步INSERT数据失败 - 源表ID: {}", sourceId);
        }
    }

    /**
     * 处理UPDATE操作 - 智能更新策略
     */
    private void handleUpdate(CdcDataMessage cdcMessage) {
        Map<String, Object> beforeData = cdcMessage.getBefore();
        Map<String, Object> afterData = cdcMessage.getAfter();

        if (afterData == null || afterData.isEmpty()) {
            log.warn("UPDATE操作缺少after数据");
            return;
        }

        Long sourceId = extractSourceId(afterData);

        // 根据name字段查找现有记录（因为我们的表结构简单）
        String id = getStringValue(afterData, "id");
        FlinkBasicsTest2 existingEntity = findExistingEntityById(id);

        if (existingEntity != null) {
            // 更新现有记录
            updateEntityFields(existingEntity, afterData);
            boolean success = repository.updateById(existingEntity);
            if (success) {
                log.info("同步UPDATE数据成功 - 源表ID: {}, 目标表ID: {}, 名称: {}",
                        sourceId, existingEntity.getId(), existingEntity.getName());
            } else {
                log.error("同步UPDATE数据失败 - 源表ID: {}", sourceId);
            }
        } else {
            // 如果找不到对应记录，创建新记录
            FlinkBasicsTest2 newEntity = mapToEntity(afterData);
            boolean success = repository.save(newEntity);
            if (success) {
                log.info("UPDATE操作创建新记录成功 - 源表ID: {}, 目标表ID: {}, 名称: {}",
                        sourceId, newEntity.getId(), newEntity.getName());
            } else {
                log.error("UPDATE操作创建新记录失败 - 源表ID: {}", sourceId);
            }
        }

        // 记录变更详情
        logDataChanges(beforeData, afterData);
    }

    /**
     * 处理DELETE操作
     */
    private void handleDelete(CdcDataMessage cdcMessage) {
        Map<String, Object> beforeData = cdcMessage.getBefore();
        if (beforeData == null || beforeData.isEmpty()) {
            log.warn("DELETE操作缺少before数据");
            return;
        }

        Long sourceId = extractSourceId(beforeData);
        String id = getStringValue(beforeData, "id");
        FlinkBasicsTest2 existingEntity = findExistingEntityById(id);

        if (existingEntity != null) {
            // 物理删除
            boolean success = repository.removeById(existingEntity.getId());
            if (success) {
                log.info("同步DELETE数据成功 - 源表ID: {}, 目标表ID: {}, 名称: {}",
                        sourceId, existingEntity.getId(), existingEntity.getName());
            } else {
                log.error("同步DELETE数据失败 - 源表ID: {}", sourceId);
            }
        } else {
        }
    }

    /**
     * 处理快照读取操作
     */
    private void handleSnapshot(CdcDataMessage cdcMessage) {
        Map<String, Object> afterData = cdcMessage.getAfter();
        if (afterData == null || afterData.isEmpty()) {
            log.warn("快照读取操作缺少after数据");
            return;
        }

        Long sourceId = extractSourceId(afterData);
        String id = getStringValue(afterData, "id");

        // 检查是否已存在，避免重复插入快照数据
        FlinkBasicsTest2 existingEntity = findExistingEntityById(id);
        if (existingEntity == null) {
            FlinkBasicsTest2 entity = mapToEntity(afterData);
            boolean success = repository.save(entity);
            if (success) {
                log.info("同步快照数据成功 - 源表ID: {}, 目标表ID: {}, 名称: {}",
                        sourceId, entity.getId(), entity.getName());
            } else {
                log.error("同步快照数据失败 - 源表ID: {}", sourceId);
            }
        } else {
            log.debug("快照数据已存在，跳过 - 源表ID: {}, 目标表ID: {}", sourceId, existingEntity.getId());
        }
    }

    /**
     * 智能字段映射 - 根据字段名和类型自动填充实体对象
     *
     * @param data 源数据
     * @return 实体对象
     */
    private FlinkBasicsTest2 mapToEntity(Map<String, Object> data) {
        FlinkBasicsTest2 entity = new FlinkBasicsTest2();

        // 获取实体类字段缓存
        Map<String, Field> fieldMap = getFieldMap(FlinkBasicsTest2.class);

        // 遍历源数据，进行字段映射
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String sourceField = entry.getKey();
            Object value = entry.getValue();

            if (value == null) {
                continue;
            }

            // 获取目标字段名
            String targetField = FIELD_MAPPING.getOrDefault(sourceField, toCamelCase(sourceField));
            Field field = fieldMap.get(targetField);

            if (field != null) {
                try {
                    // 类型转换并设置值
                    Object convertedValue = convertValue(value, field.getType());
                    if (convertedValue != null) {
                        ReflectUtil.setFieldValue(entity, field, convertedValue);
                        log.debug("字段映射成功: {} -> {} = {}", sourceField, targetField, convertedValue);
                    }
                } catch (Exception e) {
                    log.warn("字段映射失败: {} -> {}, 值: {}, 错误: {}",
                            sourceField, targetField, value, e.getMessage());
                }
            }
        }

        return entity;
    }

    /**
     * 更新实体字段
     */
    private void updateEntityFields(FlinkBasicsTest2 entity, Map<String, Object> data) {
        Map<String, Field> fieldMap = getFieldMap(FlinkBasicsTest2.class);

        for (Map.Entry<String, Object> entry : data.entrySet()) {
            String sourceField = entry.getKey();
            Object value = entry.getValue();

            if (value == null) {
                continue;
            }

            String targetField = FIELD_MAPPING.getOrDefault(sourceField, toCamelCase(sourceField));
            Field field = fieldMap.get(targetField);

            if (field != null && !"id".equals(targetField)) { // 不更新主键
                try {
                    Object convertedValue = convertValue(value, field.getType());
                    if (convertedValue != null) {
                        ReflectUtil.setFieldValue(entity, field, convertedValue);
                        log.debug("字段更新成功: {} -> {} = {}", sourceField, targetField, convertedValue);
                    }
                } catch (Exception e) {
                    log.warn("字段更新失败: {} -> {}, 值: {}, 错误: {}",
                            sourceField, targetField, value, e.getMessage());
                }
            }
        }
    }

    /**
     * 类型转换
     */
    private Object convertValue(Object value, Class<?> targetType) {
        if (value == null) {
            return null;
        }

        // 如果类型已经匹配，直接返回
        if (targetType.isAssignableFrom(value.getClass())) {
            return value;
        }

        String strValue = value.toString();

        try {
            if (targetType == String.class) {
                return strValue;
            } else if (targetType == Long.class || targetType == long.class) {
                return Long.parseLong(strValue);
            } else if (targetType == Integer.class || targetType == int.class) {
                return Integer.parseInt(strValue);
            } else if (targetType == Double.class || targetType == double.class) {
                return Double.parseDouble(strValue);
            } else if (targetType == BigDecimal.class) {
                return new BigDecimal(strValue);
            } else if (targetType == LocalDateTime.class) {
                return parseDateTime(strValue);
            } else if (targetType == Boolean.class || targetType == boolean.class) {
                return Boolean.parseBoolean(strValue) || "1".equals(strValue);
            }
        } catch (Exception e) {
            log.warn("类型转换失败: {} -> {}, 值: {}", value.getClass().getSimpleName(),
                    targetType.getSimpleName(), value);
        }

        return null;
    }

    /**
     * 解析时间字符串
     */
    private LocalDateTime parseDateTime(String dateStr) {
        if (StrUtil.isBlank(dateStr)) {
            return null;
        }

        // 处理空格为T的情况
        String normalizedStr = dateStr.replace(" ", "T");

        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDateTime.parse(normalizedStr, formatter);
            } catch (DateTimeParseException ignored) {
                // 继续尝试下一个格式
            }
        }

        log.warn("无法解析时间字符串: {}", dateStr);
        return null;
    }

    /**
     * 获取字段映射缓存
     */
    private Map<String, Field> getFieldMap(Class<?> clazz) {
        return FIELD_CACHE.computeIfAbsent(clazz, k -> {
            Map<String, Field> fieldMap = new HashMap<>();
            Field[] fields = ReflectUtil.getFields(k);
            for (Field field : fields) {
                field.setAccessible(true);
                fieldMap.put(field.getName(), field);
            }
            return fieldMap;
        });
    }

    /**
     * 下划线转驼峰
     */
    private String toCamelCase(String str) {
        if (StrUtil.isBlank(str)) {
            return str;
        }
        return StrUtil.toCamelCase(str);
    }

    /**
     * 提取源表ID
     */
    private Long extractSourceId(Map<String, Object> data) {
        Object id = data.get("id");
        if (id instanceof Number) {
            return ((Number) id).longValue();
        }
        try {
            return Long.parseLong(id.toString());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 根据名称查找现有实体
     */
    private FlinkBasicsTest2 findExistingEntityById(String id) {
        if (StrUtil.isBlank(id)) {
            return null;
        }
        return repository.getOne(new LambdaQueryWrapper<FlinkBasicsTest2>()
                .eq(FlinkBasicsTest2::getId, id), false);
    }

    /**
     * 记录数据变更详情
     */
    private void logDataChanges(Map<String, Object> beforeData, Map<String, Object> afterData) {
        if (log.isDebugEnabled() && beforeData != null && afterData != null) {
            Set<String> allKeys = new HashSet<>();
            allKeys.addAll(beforeData.keySet());
            allKeys.addAll(afterData.keySet());

            List<String> changes = new ArrayList<>();
            for (String key : allKeys) {
                Object beforeValue = beforeData.get(key);
                Object afterValue = afterData.get(key);

                if (!Objects.equals(beforeValue, afterValue)) {
                    changes.add(String.format("%s: %s -> %s", key, beforeValue, afterValue));
                }
            }

            if (!changes.isEmpty()) {
                log.debug("数据变更详情: {}", String.join(", ", changes));
            }
        }
    }

    /**
     * 安全地从Map中获取字符串值
     */
    private String getStringValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value != null ? value.toString() : null;
    }
}
