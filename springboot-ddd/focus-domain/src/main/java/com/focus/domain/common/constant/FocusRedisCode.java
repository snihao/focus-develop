package com.focus.domain.common.constant;

public enum FocusRedisCode {
    SIGN_REPLAY("签名重放", "sign:replay:");
    private final String tips;
    private final String value;

    FocusRedisCode(String tips, String value) {
        this.tips = tips;
        this.value = value;
    }

    public String tips() {
        return tips;
    }

    public String value() {
        return value;
    }
}
