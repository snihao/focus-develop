package com.focus.common.interceptor;

import jakarta.annotation.Resource;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * @Description: 拦截器配置
 * @Author: ni_hao
 * @Date: 2025/07/28 下午 1:28
 */
@Configuration
public class FocusWebConfig implements WebMvcConfigurer {
    @Resource
    private FocusSignInterceptor focusSignInterceptor;

    @Resource
    private FocusLoginUserArgumentResolver focusLoginUserArgumentResolver;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(focusSignInterceptor)
                .addPathPatterns("/**");
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(focusLoginUserArgumentResolver);
    }
}
