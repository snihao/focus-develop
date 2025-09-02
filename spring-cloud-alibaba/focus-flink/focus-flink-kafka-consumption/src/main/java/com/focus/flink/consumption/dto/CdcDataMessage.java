package com.focus.flink.consumption.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

/**
 * CDC数据消息模型 - 对应Debezium CDC输出的JSON格式
 *
 * @author focus
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CdcDataMessage {

    /**
     * 变更前的数据
     */
    @JsonProperty("before")
    private Map<String, Object> before;

    /**
     * 变更后的数据
     */
    @JsonProperty("after")
    private Map<String, Object> after;

    /**
     * 操作类型: c-insert, u-update, d-delete, r-read
     */
    @JsonProperty("op")
    private String operation;

    /**
     * 时间戳
     */
    @JsonProperty("ts_ms")
    private Long timestamp;

    /**
     * 数据库信息
     */
    @JsonProperty("source")
    private SourceInfo source;

    /**
     * 事务信息
     */
    @JsonProperty("transaction")
    private Object transaction;

    /**
     * 数据源信息
     */
    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SourceInfo {
        
        @JsonProperty("version")
        private String version;
        
        @JsonProperty("connector")
        private String connector;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("ts_ms")
        private Long timestamp;
        
        @JsonProperty("snapshot")
        private String snapshot;
        
        @JsonProperty("db")
        private String database;
        
        @JsonProperty("table")
        private String table;
        
        @JsonProperty("server_id")
        private Long serverId;
        
        @JsonProperty("gtid")
        private String gtid;
        
        @JsonProperty("file")
        private String file;
        
        @JsonProperty("pos")
        private Long position;
        
        @JsonProperty("row")
        private Integer row;
        
        @JsonProperty("thread")
        private Long thread;
        
        @JsonProperty("query")
        private String query;
    }
}
