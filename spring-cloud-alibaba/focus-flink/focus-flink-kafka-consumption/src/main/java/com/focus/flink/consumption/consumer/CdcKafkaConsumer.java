package com.focus.flink.consumption.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.focus.flink.consumption.dto.CdcDataMessage;
import com.focus.flink.consumption.service.CdcDataProcessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

/**
 * CDC数据Kafka消费者
 *
 * @author focus
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CdcKafkaConsumer {

    private final CdcDataProcessService cdcDataProcessService;
    private final ObjectMapper objectMapper;

    private static long messageCount = 0;

    /**
     * 消费来自test-topic的CDC数据
     */
    @KafkaListener(
            topics = "test-topic",
            groupId = "flink-cdc-consumption-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeCdcData(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset,
            Acknowledgment acknowledgment) {

        messageCount++;
        
        try {
            log.info("=== 接收到CDC消息 #{} ===", messageCount);
            log.info("主题: {}, 分区: {}, 偏移量: {}", topic, partition, offset);
            
            // 解析JSON消息
            CdcDataMessage cdcMessage = objectMapper.readValue(message, CdcDataMessage.class);
            
            // 记录操作类型
            String operation = cdcMessage.getOperation();
            String operationDesc = getOperationDescription(operation);
            log.info("CDC操作: {} ({})", operation, operationDesc);
            
            // 处理CDC数据
            cdcDataProcessService.processCdcMessage(cdcMessage);
            
            // 手动确认消息
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }
            
            log.info("CDC消息处理完成 #{}", messageCount);
            log.info("========================");
            
        } catch (Exception e) {
            log.error("处理CDC消息失败 #{}: {}", messageCount, e.getMessage(), e);
            log.error("原始消息内容: {}", message);
            
            // 根据业务需求决定是否确认消息
            // 这里选择确认消息以避免重复处理，但记录错误
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }
        }
    }

    /**
     * 获取操作描述
     */
    private String getOperationDescription(String operation) {
        if (operation == null) return "未知";
        
        switch (operation) {
            case "c":
                return "新增";
            case "u":
                return "更新";
            case "d":
                return "删除";
            case "r":
                return "快照读取";
            default:
                return "未知操作";
        }
    }

    /**
     * 获取消息处理统计
     */
    public static long getMessageCount() {
        return messageCount;
    }
}
