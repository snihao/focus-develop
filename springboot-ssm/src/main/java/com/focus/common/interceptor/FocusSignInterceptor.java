package com.focus.common.interceptor;

import cn.hutool.crypto.SecureUtil;
import com.focus.common.constant.FocusRedisCode;
import com.focus.common.constant.FocusResultCode;
import com.focus.common.exception.FocusException;
import com.focus.common.util.FocusRedisUtil;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Objects;

/**
 * @Description: 签名拦截器
 * @Author: ni_hao
 * @Date: 2025/07/28 下午 1:23
 */
@Component
public class FocusSignInterceptor implements HandlerInterceptor {

    @Value("${focus.sign}")
    private Boolean sign;
    private static final String SECRET_KEY = "a05ed3cfc27746dc532405a7bdd75f52c2971ccd9dc520b3c780ce4f4bbdee0b";
    private static final long EXPIRE_TIME = 5 * 60 * 1000;
    private static final long SIGN_REPLAY_EXPIRE_TIME = 60 * 60 * 1000;
    @Resource
    private FocusRedisUtil redisUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws FocusException {
        if (!sign) return true;
        if (handler instanceof HandlerMethod handlerMethod) {
            FocusNoSignCheck signAnnotation = handlerMethod.getMethodAnnotation(FocusNoSignCheck.class);
            if (!Objects.isNull(signAnnotation)) return true;
        }
        String sign = request.getHeader("x-Sign");
        String timestamp = request.getHeader("x-Timestamp");
        String nonce = request.getHeader("x-Nonce");
        if (sign == null || timestamp == null || nonce == null) {
            throw new FocusException(FocusResultCode.PERMISSION_EXCEPTION);
        }
        if (redisUtil.get(FocusRedisCode.SIGN_REPLAY.value() + nonce) != null) {
            throw new FocusException(FocusResultCode.PERMISSION_EXCEPTION);
        }
        redisUtil.set(FocusRedisCode.SIGN_REPLAY.value() + nonce, 1, SIGN_REPLAY_EXPIRE_TIME);
        if (System.currentTimeMillis() - Long.parseLong(timestamp) > EXPIRE_TIME) {
            throw new FocusException(FocusResultCode.PERMISSION_EXCEPTION);
        }
        String serverSign = generateSign(request, timestamp, nonce);
        if (!serverSign.equals(sign)) {
            throw new FocusException(FocusResultCode.PERMISSION_EXCEPTION);
        }
        return true;
    }

    private String generateSign(HttpServletRequest request, String timestamp, String nonce) {
        String sb = "URL=" + request.getRequestURL() +
                "&Method=" + request.getMethod() +
                "&Timestamp=" + timestamp +
                "&Nonce=" + nonce;
        return SecureUtil.sha256(SECRET_KEY + sb);
    }
}
