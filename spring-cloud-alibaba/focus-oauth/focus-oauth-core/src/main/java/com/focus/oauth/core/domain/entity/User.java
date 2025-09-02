package com.focus.oauth.core.domain.entity;

import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.focus.framework.mybatis.entity.BaseEntity;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户实体
 *
 * @author zi-wei
 * @create 2025/1/8
 */
@Data
@TableName("sys_user")
public class User extends BaseEntity {

    /**
     * 用户名
     */
    private String username;

    /**
     * 密码
     */
    private String password;

    /**
     * 昵称
     */
    private String nickname;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 手机号
     */
    private String phone;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 性别（0：女，1：男）
     */
    private Integer gender;

    /**
     * 状态（0：禁用，1：启用）
     */
    private Integer status;

    /**
     * 最后登录时间
     */
    private LocalDateTime lastLoginTime;

    /**
     * 版本
     */
    private Long version;

    /**
     * 逻辑删除标识（0：未删除，1：已删除）
     */
    @TableLogic
    private Integer deleteStatus;
}
