package com.xaau.bigevent.service;

import java.util.Map;

import com.xaau.bigevent.pojo.User;

public interface UserService {

    //根据用户名查询用户
    User findByUserName(String username);

    //注册
    void register(String username, String password);

    //更新用户信息
    void update(User user);

    //更新用户头像
    void updateAvatar(String avatarUrl, Integer id);

    //更改用户密码
    void updatePwd(String newPwd);
}
