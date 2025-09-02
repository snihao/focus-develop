-- ========================================
-- 基础测试表（d_basics_test）
-- ========================================
DROP TABLE IF EXISTS `d_basics_test`;
CREATE TABLE `d_basics_test` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) NOT NULL COMMENT '测试名称',
  `create_by` bigint DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `version` bigint DEFAULT '0' COMMENT '版本号（用于乐观锁）',
  `deleted` tinyint DEFAULT '0' COMMENT '逻辑删除标识（0：未删除，1：已删除）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='基础测试表';

-- 插入测试数据
INSERT INTO `d_basics_test` (`id`, `name`, `create_by`, `update_by`) VALUES
(1, '测试数据1', 1, 1),
(2, '测试数据2', 1, 1),
(3, '测试数据3', 1, 1);