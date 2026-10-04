package com.xaau.bigevent.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.xaau.bigevent.interceptors.LoginInterceptor;

@Configuration 
public class WebConfig implements WebMvcConfigurer {

    @Autowired 
    private LoginInterceptor loginInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/**") //拦截所有请求
                .excludePathPatterns("/user/login", "/user/register"); //放行登录和注册请求
    }

}
