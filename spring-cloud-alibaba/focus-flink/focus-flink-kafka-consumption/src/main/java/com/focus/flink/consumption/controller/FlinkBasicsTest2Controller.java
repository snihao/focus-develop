package com.focus.flink.consumption.controller;

import com.focus.flink.consumption.application.FlinkBasicsTest2ApplicationService;
import com.focus.flink.consumption.domain.req.FlinkBasicsTest2Req;
import com.focus.flink.consumption.domain.vo.FlinkBasicsTest2Vo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * Flink基础测试表2控制器
 *
 * @author focus
 */
@RestController
@RequestMapping("/flink/basicsTest2")
@RequiredArgsConstructor
public class FlinkBasicsTest2Controller {
    
    private final FlinkBasicsTest2ApplicationService flinkBasicsTest2ApplicationService;

    /**
     * 查询列表
     *
     * @return 列表数据
     */
    @GetMapping("/list")
    public List<FlinkBasicsTest2Vo> queryList() {
        return flinkBasicsTest2ApplicationService.queryList();
    }

    /**
     * 根据ID查询
     *
     * @param id 主键ID
     * @return 数据对象
     */
    @GetMapping("/{id}")
    public FlinkBasicsTest2Vo queryById(@PathVariable Long id) {
        return flinkBasicsTest2ApplicationService.queryById(id);
    }

    /**
     * 创建数据
     *
     * @param req 请求对象
     * @return 是否成功
     */
    @PostMapping
    public boolean create(@Valid @RequestBody FlinkBasicsTest2Req req) {
        return flinkBasicsTest2ApplicationService.create(req);
    }

    /**
     * 更新数据
     *
     * @param id 主键ID
     * @param req 请求对象
     * @return 是否成功
     */
    @PutMapping("/{id}")
    public boolean update(@PathVariable Long id, @Valid @RequestBody FlinkBasicsTest2Req req) {
        return flinkBasicsTest2ApplicationService.update(id, req);
    }

    /**
     * 删除数据
     *
     * @param id 主键ID
     * @return 是否成功
     */
    @DeleteMapping("/{id}")
    public boolean delete(@PathVariable Long id) {
        return flinkBasicsTest2ApplicationService.delete(id);
    }
}
