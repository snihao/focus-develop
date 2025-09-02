package com.focus.flink.consumption.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.focus.framework.mybatis.entity.BaseEntity;
import lombok.Data;

/**
 * 基础测试表2实体 - 用于存储处理后的CDC数据
 *
 * @author focus
 */
@Data
@TableName("t_flink_basics_test_2")
public class FlinkBasicsTest2 extends BaseEntity {

    /**
     * 测试名称
     */
    private String name;
}
