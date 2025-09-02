package com.focus.flink.core.job;

import com.ververica.cdc.connectors.mysql.source.MySqlSource;
import com.ververica.cdc.debezium.JsonDebeziumDeserializationSchema;
import lombok.extern.slf4j.Slf4j;
import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.restartstrategy.RestartStrategies;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.api.common.time.Time;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.connector.kafka.sink.KafkaRecordSerializationSchema;
import org.apache.flink.connector.kafka.sink.KafkaSink;
import org.apache.flink.runtime.state.hashmap.HashMapStateBackend;
import org.apache.flink.streaming.api.CheckpointingMode;
import org.apache.flink.streaming.api.datastream.DataStreamSource;
import org.apache.flink.streaming.api.datastream.SingleOutputStreamOperator;
import org.apache.flink.streaming.api.environment.CheckpointConfig;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;

/**
 * 独立的Flink CDC作业 - 标准的Flink应用启动方式
 * <p>
 * 使用方式：
 * 1. 直接运行main方法
 * 2. 打包成jar后使用 flink run 命令提交到Flink集群
 *
 * @author focus
 */
public class FlinkCdcStandaloneJob {

    private static final Logger log = LoggerFactory.getLogger(FlinkCdcStandaloneJob.class);

        public static void main(String[] args) throws Exception {
        log.info("=== 启动独立Flink CDC作业 ===");
        log.info("Java版本: {}", System.getProperty("java.version"));
        log.info("Flink版本: 1.17.2");

        // 1. 创建执行环境
        log.info("正在创建Flink执行环境...");
        Configuration config = new Configuration();
        config.setString("web.submit.enable", "true");
        config.setString("web.port", "8081");

        StreamExecutionEnvironment env = StreamExecutionEnvironment.createLocalEnvironmentWithWebUI(config);

        // 2. 配置环境
        log.info("正在配置Flink环境参数...");
        setupEnvironment(env);

        // 3. 创建MySQL CDC Source
        log.info("正在创建MySQL CDC Source...");
        MySqlSource<String> mySqlSource = createMySqlSource();

        // 4. 创建数据流
        log.info("正在构建数据流管道...");
        DataStreamSource<String> sourceStream = env.fromSource(
                mySqlSource,
                WatermarkStrategy.noWatermarks(),
                "MySQL-CDC-Source"
        );

        // 5. 数据处理
        SingleOutputStreamOperator<String> processedStream = sourceStream
                .map(new CdcDataProcessor())
                .name("CDC-Data-Processor");

        // 6. 创建Kafka Sink
        log.info("正在创建Kafka Sink...");
        KafkaSink<String> kafkaSink = createKafkaSink();

        // 7. 输出到Kafka
        processedStream.sinkTo(kafkaSink).name("Kafka-Sink");

        // 8. 启动作业
        log.info("=== Flink CDC作业启动完成 ===");
        log.info("监控地址: http://localhost:8081");
        log.info("正在开始监听MySQL binlog变更...");
        log.info("提示：可以通过Ctrl+C停止作业");

        env.execute("MySQL-CDC-to-Kafka-Job");
    }

    /**
     * 配置Flink执行环境
     */
    private static void setupEnvironment(StreamExecutionEnvironment env) {
        // 设置并行度
        env.setParallelism(1);

        // 启用检查点
        env.enableCheckpointing(60000, CheckpointingMode.EXACTLY_ONCE);

        // 检查点配置
        CheckpointConfig checkpointConfig = env.getCheckpointConfig();
        checkpointConfig.setMinPauseBetweenCheckpoints(500);
        checkpointConfig.setCheckpointTimeout(60000);
        checkpointConfig.setMaxConcurrentCheckpoints(1);
        checkpointConfig.setExternalizedCheckpointCleanup(
                CheckpointConfig.ExternalizedCheckpointCleanup.RETAIN_ON_CANCELLATION);

        // 状态后端
        env.setStateBackend(new HashMapStateBackend());

        // 重启策略
        env.setRestartStrategy(RestartStrategies.fixedDelayRestart(
                3, // 重启次数
                Time.of(10, java.util.concurrent.TimeUnit.SECONDS) // 重启间隔
        ));

        log.info("Flink环境配置完成 - 并行度: 1, 检查点间隔: 60000ms");
    }

    /**
     * 创建MySQL CDC Source
     */
    private static MySqlSource<String> createMySqlSource() {
        // 这里使用硬编码配置，实际使用时可以从配置文件或命令行参数读取
        String hostname = "localhost";
        int port = 3306;
        String username = "root";
        String password = "JZ8Qrd,ZlkPHs";
        String database = "focus_admin";
        String table = "t_flink_basics_test";
        String tableList = database + "." + table;

        MySqlSource<String> source = MySqlSource.<String>builder()
                .hostname(hostname)
                .port(port)
                .databaseList(database)
                .tableList(tableList)
                .username(username)
                .password(password)
                .serverTimeZone("Asia/Shanghai")
                .serverId("5400-5499")
                .connectTimeout(Duration.ofMillis(30000))
                .connectMaxRetries(3)
                .deserializer(new JsonDebeziumDeserializationSchema())
                .includeSchemaChanges(true) // 包含schema变更
                .scanNewlyAddedTableEnabled(false) // 不扫描新增的表
                .build();

        log.info("MySQL CDC Source配置完成 - 数据库: {}, 表: {}", database, table);
        return source;
    }

    /**
     * 创建Kafka Sink
     */
    private static KafkaSink<String> createKafkaSink() {
        // 这里使用硬编码配置，实际使用时可以从配置文件或命令行参数读取
        String bootstrapServers = "localhost:9092";
        String topic = "test-topic";

        KafkaSink<String> sink = KafkaSink.<String>builder()
                .setBootstrapServers(bootstrapServers)
                .setRecordSerializer(
                        KafkaRecordSerializationSchema.builder()
                                .setTopic(topic)
                                .setValueSerializationSchema(new SimpleStringSchema())
                                .build()
                )
                .build();

        log.info("Kafka Sink配置完成 - 服务器: {}, 主题: {}", bootstrapServers, topic);
        return sink;
    }
}
