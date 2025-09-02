package com.focus.flink.core.job;

import org.apache.flink.api.common.functions.MapFunction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * CDC数据处理器 - 可序列化的MapFunction实现
 *
 * @author focus
 */
public class CdcDataProcessor implements MapFunction<String, String> {

    private static final long serialVersionUID = 1L;
    private static final Logger log = LoggerFactory.getLogger(CdcDataProcessor.class);

    private static long processCount = 0;
    private static long lastLogTime = System.currentTimeMillis();

    @Override
    public String map(String value) throws Exception {
        processCount++;

        // 每处理1000条记录或每10秒输出一次统计信息
        long currentTime = System.currentTimeMillis();
        if (processCount % 1000 == 0 || (currentTime - lastLogTime) > 10000) {
            log.info("已处理CDC记录数: {}", processCount);
            lastLogTime = currentTime;
        }

        // 统计操作类型（只在重要操作时记录）
        if (value.contains("\"op\":\"c\"")) {
            log.info("✓ 捕获到INSERT操作");
        } else if (value.contains("\"op\":\"u\"")) {
            log.info("✓ 捕获到UPDATE操作");
        } else if (value.contains("\"op\":\"d\"")) {
            log.info("✓ 捕获到DELETE操作");
        } else if (value.contains("\"op\":\"r\"")) {
            log.debug("读取快照数据"); // 快照数据通常很多，用debug级别
        }

        // 这里可以添加自定义的数据处理逻辑
        // 比如数据过滤、格式转换、字段映射等

        return value;
    }
}
