package com.xaau.bigevent.pojo;

import lombok.Data;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Data
public class User {
    @NotNull 
    private Integer id;//主键ID
    private String username;//用户名
    @JsonIgnore //让springmvc在把当前对象换成json字符时忽略该数据
    private String password;//密码

    @NotEmpty 
    @Pattern(regexp = "\\S{1,10}") //正则表达式，5-16位非空字符
    private String nickname;//昵称

    @NotEmpty 
    @Email 
    private String email;//邮箱
    private String userPic;//用户头像地址
    private LocalDateTime createTime;//创建时间
    private LocalDateTime updateTime;//更新时间
}
