package com.focus.flink.consumption;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

/**
 * Flink Kafka消费应用启动类
 * 
 * @author focus
 */
@SpringBootApplication
@EnableKafka
@MapperScan("com.focus.flink.consumption.repository.mapper")
public class FocusFlinkKafkaConsumptionApplication {

    public static void main(String[] args) {
        SpringApplication.run(FocusFlinkKafkaConsumptionApplication.class, args);
        System.out.println("=== Flink Kafka消费模块启动完成 ===");
    }
}
