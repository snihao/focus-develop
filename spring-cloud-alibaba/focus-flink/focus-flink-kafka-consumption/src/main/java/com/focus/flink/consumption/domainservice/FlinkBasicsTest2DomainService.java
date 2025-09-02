package com.focus.flink.consumption.domainservice;

import cn.hutool.core.bean.BeanUtil;
import com.focus.flink.consumption.domain.entity.FlinkBasicsTest2;
import com.focus.flink.consumption.domain.vo.FlinkBasicsTest2Vo;
import com.focus.flink.consumption.repository.FlinkBasicsTest2Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Flink基础测试表2领域服务
 *
 * @author focus
 */
@Service
@RequiredArgsConstructor
public class FlinkBasicsTest2DomainService {
    
    private final FlinkBasicsTest2Repository flinkBasicsTest2Repository;

    /**
     * 查询列表
     *
     * @return 列表数据
     */
    public List<FlinkBasicsTest2Vo> queryList() {
        List<FlinkBasicsTest2> list = flinkBasicsTest2Repository.list();
        return BeanUtil.copyToList(list, FlinkBasicsTest2Vo.class);
    }

    /**
     * 根据ID查询
     *
     * @param id 主键ID
     * @return 数据对象
     */
    public FlinkBasicsTest2Vo queryById(Long id) {
        FlinkBasicsTest2 entity = flinkBasicsTest2Repository.getById(id);
        return BeanUtil.copyProperties(entity, FlinkBasicsTest2Vo.class);
    }

    /**
     * 保存数据
     *
     * @param entity 实体对象
     * @return 是否成功
     */
    public boolean save(FlinkBasicsTest2 entity) {
        return flinkBasicsTest2Repository.save(entity);
    }

    /**
     * 更新数据
     *
     * @param entity 实体对象
     * @return 是否成功
     */
    public boolean updateById(FlinkBasicsTest2 entity) {
        return flinkBasicsTest2Repository.updateById(entity);
    }

    /**
     * 删除数据
     *
     * @param id 主键ID
     * @return 是否成功
     */
    public boolean removeById(Long id) {
        return flinkBasicsTest2Repository.removeById(id);
    }
}
