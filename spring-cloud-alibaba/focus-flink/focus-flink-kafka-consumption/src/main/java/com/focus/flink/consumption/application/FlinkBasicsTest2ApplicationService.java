package com.focus.flink.consumption.application;

import cn.hutool.core.bean.BeanUtil;
import com.focus.flink.consumption.domain.entity.FlinkBasicsTest2;
import com.focus.flink.consumption.domain.req.FlinkBasicsTest2Req;
import com.focus.flink.consumption.domain.vo.FlinkBasicsTest2Vo;
import com.focus.flink.consumption.domainservice.FlinkBasicsTest2DomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Flink基础测试表2应用服务
 *
 * @author focus
 */
@Service
@RequiredArgsConstructor
public class FlinkBasicsTest2ApplicationService {
    
    private final FlinkBasicsTest2DomainService flinkBasicsTest2DomainService;

    /**
     * 查询列表
     *
     * @return 列表数据
     */
    public List<FlinkBasicsTest2Vo> queryList() {
        return flinkBasicsTest2DomainService.queryList();
    }

    /**
     * 根据ID查询
     *
     * @param id 主键ID
     * @return 数据对象
     */
    public FlinkBasicsTest2Vo queryById(Long id) {
        return flinkBasicsTest2DomainService.queryById(id);
    }

    /**
     * 创建数据
     *
     * @param req 请求对象
     * @return 是否成功
     */
    public boolean create(FlinkBasicsTest2Req req) {
        FlinkBasicsTest2 entity = BeanUtil.copyProperties(req, FlinkBasicsTest2.class);
        return flinkBasicsTest2DomainService.save(entity);
    }

    /**
     * 更新数据
     *
     * @param id 主键ID
     * @param req 请求对象
     * @return 是否成功
     */
    public boolean update(Long id, FlinkBasicsTest2Req req) {
        FlinkBasicsTest2 entity = BeanUtil.copyProperties(req, FlinkBasicsTest2.class);
        entity.setId(id);
        return flinkBasicsTest2DomainService.updateById(entity);
    }

    /**
     * 删除数据
     *
     * @param id 主键ID
     * @return 是否成功
     */
    public boolean delete(Long id) {
        return flinkBasicsTest2DomainService.removeById(id);
    }
}
