package com.focus.flink.consumption.domain.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Flink基础测试表2请求对象
 *
 * @author focus
 */
@Data
public class FlinkBasicsTest2Req {
    
    /**
     * 测试名称
     */
    @NotBlank(message = "测试名称不能为空")
    private String name;
}
