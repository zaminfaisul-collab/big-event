package com.xaau.bigevent.service.impl;

import com.xaau.bigevent.mapper.UserMapper;
import com.xaau.bigevent.pojo.User;

import com.xaau.bigevent.service.UserService;
import com.xaau.bigevent.utils.Md5Util;
import com.xaau.bigevent.utils.ThreadLocalUtil;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public User findByUserName(String username) {
        User user =  userMapper.findByUserName(username);
        return user;
    }

    @Override
    public void register(String username, String password) {
        //加密
        String md5String = Md5Util.getMD5String(password);
        //添加
        userMapper.add(username,md5String);
    }

    @Override
    public void update(User user) {
        
        user.setUpdateTime(LocalDateTime.now());
        userMapper.update(user);

    }

    @Override
    public void updateAvatar(String avatarUrl, Integer id) {

        userMapper.updateAvatar(avatarUrl,id);

    }

    @Override
    public void updatePwd(String newPwd) {

        //加密新密码
        String md5NewPwd = Md5Util.getMD5String(newPwd);
        //ThreadLocal中获取当前id，传给Mapper层
        Map<String,Object> map = ThreadLocalUtil.get();
        Integer id = (Integer) map.get("id");
        userMapper.updatePwd(md5NewPwd,id);

    }
}
