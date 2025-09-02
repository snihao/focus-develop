package com.focus.demo.core.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;

/**
 * @author zi-wei
 * @create 2025/6/7 14:45
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(indexName = "poetry_index")
public class ElasticPoetry {

    /**
     * id
     */
    private String id;

    /**
     * 标题
     */
    private String title;

    /**
     * 作者
     */
    private String author;

    /**
     * 朝代
     */
    private String dynasty;

    /**
     * 内容
     */
    private String content;

}
