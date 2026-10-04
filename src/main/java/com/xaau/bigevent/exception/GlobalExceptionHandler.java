package com.xaau.bigevent.exception;

import com.xaau.bigevent.pojo.Result;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = Exception.class)
    public Result handleException(Exception e) {

        e.printStackTrace();
        return Result.error(StringUtils.hasText(e.getMessage()) ? e.getMessage() : "操作失败");

    }

}
