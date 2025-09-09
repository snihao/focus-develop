package com.focus.common.exception;

import com.focus.common.constant.FocusResultCode;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * @Description:自定义异常类
 * @Author: ni_hao
 * @Date: 2025-06-18 14:47
 */
@EqualsAndHashCode(callSuper = true)
@Data
public class FocusException extends Exception{
    private String msg;
    private String code;

    public FocusException(String msg) {
        this.msg = msg;
        this.code = FocusResultCode.SYSTEM_ERROR.code();
    }

    public FocusException(FocusResultCode resultCode) {
        this.msg = resultCode.tips();
        this.code = resultCode.code();
    }

    public FocusException(String msg, String code) {
        this.msg = msg;
        this.code = code;
    }
}
