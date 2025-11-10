package com.focus.api.common.exception;

import cn.dev33.satoken.exception.NotLoginException;
import com.focus.api.common.util.FocusResult;
import com.focus.domain.common.constant.FocusResultCode;
import com.focus.domain.common.exception.FocusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;

/**
 * 异常统一处理
 */
@ControllerAdvice
public class ControllerException {
    private static final Logger logger = LoggerFactory.getLogger(ControllerException.class);

    /**
     * 系统异常处理
     */
    @ResponseBody
    @ExceptionHandler(value = Exception.class)
    public FocusResult<?> exceptionHandler(Exception e) {
        logger.error("系统异常:{}", e.getMessage(), e);
        return FocusResult.error("系统异常");
    }

    /**
     * Sa-Token 未登录异常处理
     */
    @ResponseBody
    @ExceptionHandler(value = NotLoginException.class)
    public FocusResult<?> notLoginExceptionHandler(NotLoginException e) {
        return FocusResult.error(FocusResultCode.PERMISSION_EXCEPTION.code(), e.getMessage());
    }

    /**
     * 参数校验异常
     */
    @ResponseBody
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public FocusResult<?> methodExceptionHandler(MethodArgumentNotValidException e) {
        return FocusResult.error(Objects.requireNonNull(e.getBindingResult().getFieldError()).getDefaultMessage());
    }

    /**
     * 限流异常处理
     */
    @ResponseBody
    @ExceptionHandler(value = ResponseStatusException.class)
    public FocusResult<?> reExceptionHandler(ResponseStatusException e) {
        return FocusResult.error(e.getReason(), e.getStatusCode().toString());
    }

    /**
     * 业务异常处理
     */
    @ResponseBody
    @ExceptionHandler(value = FocusException.class)
    public FocusResult<?> nhExceptionHandler(FocusException e) {
        if (Objects.isNull(e.getCode())) return FocusResult.error(e.getMsg());
        StackTraceElement element = e.getStackTrace()[0];
        String methodPath = element.getClassName() + "." + element.getMethodName();
        logger.error("业务异常[发生在{}]: {} , {}", methodPath, e.getCode(), e.getMsg());
        return FocusResult.error(e.getMsg(), e.getCode());
    }

}
