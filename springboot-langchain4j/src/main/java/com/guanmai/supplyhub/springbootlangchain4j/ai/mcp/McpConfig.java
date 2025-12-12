package com.guanmai.supplyhub.springbootlangchain4j.ai.mcp;

import dev.langchain4j.mcp.McpToolProvider;
import dev.langchain4j.mcp.client.DefaultMcpClient;
import dev.langchain4j.mcp.client.McpClient;
import dev.langchain4j.mcp.client.transport.McpTransport;
import dev.langchain4j.mcp.client.transport.http.StreamableHttpMcpTransport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class McpConfig {

    @Value("${bigmodel.api-key}")
    private String apiKey;

    //    @Bean
    public McpToolProvider mcpToolProvider() {
        McpTransport transport = StreamableHttpMcpTransport.builder()
                // 配置 SSE 接口地址（包含 Authorization 头）
                .url("https://open.bigmodel.cn/api/mcp/web_search/sse?Authorization=" + apiKey)
                // 开启请求/响应日志（替代原 transport 的日志配置）
                .logRequests(true)
                .logResponses(true)
                .build();

        // 创建 MCP 客户端
        McpClient mcpClient = new DefaultMcpClient.Builder()
                .key("yupiMcpClient")
                .transport(transport)
                .build();
        // 从 MCP 客户端获取工具
        McpToolProvider toolProvider = McpToolProvider.builder()
                .mcpClients(mcpClient)
                .build();
        return toolProvider;
    }
}
