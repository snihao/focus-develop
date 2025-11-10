package com.focus.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.focus.common.exception.FocusException;
import com.focus.common.util.FocusResult;
import com.focus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequiredArgsConstructor
@RequestMapping("user")
public class UserController {
    private final UserService userService;

    // 测试登录，浏览器访问： http://localhost:1955/user/login?username=focus&password=123456
    @GetMapping("login")
    public FocusResult<?> login(String username, String password) throws FocusException {
        return FocusResult.success(userService.login(username, password));
    }

    // 测试登录状态，浏览器访问： http://localhost:1955/user/eqUserId
    @GetMapping("eqUserId")
    public String eqUserId() {
        long uid = StpUtil.getLoginIdAsLong();
        return "当前用户ID：" + uid;
    }

    // 测试登录状态，浏览器访问： http://localhost:1955/user/logout
    @GetMapping("logout")
    public String logout() {
        StpUtil.logout();
        return "成功退出登录";
    }
}
