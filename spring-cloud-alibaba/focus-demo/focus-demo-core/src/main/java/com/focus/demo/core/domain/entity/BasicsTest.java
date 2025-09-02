package com.focus.demo.core.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.focus.framework.mybatis.entity.BaseEntity;
import lombok.Data;

/**
 * 基础测试表
 *
 * @author zi-wei
 * @create 2025/6/6 11:08
 */
@Data
@TableName("d_basics_test")
public class BasicsTest extends BaseEntity {

    /**
     * 测试名称
     */
    private String name;
}
