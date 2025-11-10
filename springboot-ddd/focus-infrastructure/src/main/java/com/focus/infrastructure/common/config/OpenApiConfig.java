package com.focus.infrastructure.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @Description: 配置OpenAPI
 * @Author: ni_hao
 * @Date: 2025/11/10 下午 3:37
 */
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI openApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("专注开发")
                        .description("api管理")
                        .contact(new Contact().name("focus").email("focus@qq.com"))
                        .version("1.0"));
    }
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("user接口")
                .pathsToMatch("/user/**")
                .addOpenApiCustomizer(openApi -> {
                    openApi.info(new Info()
                            .description("用户接口")
                            .contact(new Contact()
                                    .name("focus")
                                    .email("focus@qq.com")));
                })
                .build();
    }

}
