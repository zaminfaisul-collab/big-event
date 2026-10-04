package com.xaau.bigevent.anno;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import com.xaau.bigevent.validation.StateValidation;

import jakarta.validation.Payload;

import jakarta.validation.Constraint;

@Documented//元注解
@Target({ElementType.FIELD})//元注解，该注解在何处生效
@Retention(RetentionPolicy.RUNTIME)//元注解，决定该注解会保留到什么阶段
@Constraint(validatedBy = {StateValidation.class})//校验规则导入
public @interface State {

    //提示校验失败后的错误信息
    String message() default "state的属性只能是 已发布|草稿";

    //指定分组
	Class<?>[] groups() default { };

    //负载 获取到state注解的附加信息
	Class<? extends Payload>[] payload() default { };

}
