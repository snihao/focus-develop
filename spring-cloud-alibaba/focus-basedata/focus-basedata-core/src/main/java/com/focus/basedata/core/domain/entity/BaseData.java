package com.focus.basedata.core.domain.entity;

import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.focus.framework.mybatis.entity.BaseEntity;
import lombok.Data;

/**
 * 基础数据实体
 *
 * @author zi-wei
 * @create 2025/1/8
 */
@Data
@TableName("sys_base_data")
public class BaseData extends BaseEntity {

    /**
     * 数据类型
     */
    private String type;

    /**
     * 数据编码
     */
    private String code;

    /**
     * 数据名称
     */
    private String name;

    /**
     * 数据值
     */
    private String value;

    /**
     * 描述
     */
    private String description;

    /**
     * 排序
     */
    private Integer sort;

    /**
     * 状态（0：禁用，1：启用）
     */
    private Integer status;

    /**
     * 版本
     */
    private Long version;

    /**
     * 逻辑删除标识（0：未删除，1：已删除）
     */
    @TableLogic
    private Integer deleteStatus;
}
