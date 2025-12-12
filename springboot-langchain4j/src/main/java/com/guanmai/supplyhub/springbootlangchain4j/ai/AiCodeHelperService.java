package com.guanmai.supplyhub.springbootlangchain4j.ai;
import dev.langchain4j.service.*;
import reactor.core.publisher.Flux;

/**
 * @author zi-wei
 * @create 2025/12/12 11:39
 */
public interface AiCodeHelperService {

    @SystemMessage(fromResource = "system-prompt.txt")
    String chat(String userMessage);

    @SystemMessage(fromResource = "system-prompt.txt")
    String interviewSearch(String userMessage);

    // 流式对话
    Flux<String> chatStream(@MemoryId int memoryId, @UserMessage String userMessage);

}
