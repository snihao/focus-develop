package com.focus.flink.core.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 基础测试表实体
 *
 * @author focus
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlinkBasicsTest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    private Long id;

    /**
     * 测试名称
     */
    private String name;

    /**
     * 创建者
     */
    private Long createBy;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新者
     */
    private Long updateBy;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    /**
     * 版本
     */
    private Long version;

    /**
     * 逻辑删除标识（0：未删除，1：已删除）
     */
    private Integer deleted;
}
