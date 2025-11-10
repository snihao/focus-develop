package com.focus.common.interceptor;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @Description: 无需签名校验注解
 * @Author: ni_hao
 * @Date: 2025/07/28 下午 1:23
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface FocusNoSignCheck {
}
