package com.guanmai.supplyhub.springbootlangchain4j;

import com.guanmai.supplyhub.springbootlangchain4j.ai.AiCodeHelperService;
import jakarta.annotation.Resource;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Log4j2
class SpringbootLangchain4jApplicationTests {

    @Resource
    private AiCodeHelperService aiCodeHelperService;

    @Test
    void contextLoads() {
        String chat = aiCodeHelperService.chat("土豆还有那些别名");
        log.info(chat);
//        String chat2 = aiCodeHelperService.chat("你知道我叫什么吗");
//        log.info(chat2);
    }

    @Test
    void interviewSearch() {
        String chat = aiCodeHelperService.interviewSearch("有那些常见的计算机网络面试题");
        log.info(chat);
    }

}
