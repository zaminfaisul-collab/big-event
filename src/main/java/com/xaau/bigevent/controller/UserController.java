package com.xaau.bigevent.controller;

import com.xaau.bigevent.pojo.Result;
import com.xaau.bigevent.pojo.User;
import com.xaau.bigevent.service.UserService;
import com.xaau.bigevent.utils.JwtUtil;
import com.xaau.bigevent.utils.Md5Util;
import com.xaau.bigevent.utils.ThreadLocalUtil;

import org.springframework.util.StringUtils;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.URL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
@Validated
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public Result register(@Pattern(regexp = "\\S{5,16}") String username, @Pattern(regexp = "\\S{5,16}")String password) {

        //查询用户
        User user =  userService.findByUserName(username);
        if(user==null){
            //没有占用
            //注册
            userService.register(username,password);
            return Result.success();
        }else {
            //被占用
            return Result.error("用户名已被占用");
        }

    }

    @PostMapping("/login")
    public Result<String> login(@Pattern(regexp = "\\S{5,16}") String username, @Pattern(regexp = "\\S{5,16}")String password) {

        //根据用户名查询用户
        User LoginUser = userService.findByUserName(username);
        // 判断该用户是否存在
        if(LoginUser==null){
            return Result.error("用户名错误");
        }
        //判断密码是否正确 LoginUser对象中的password是密文
        if(Md5Util.getMD5String(password).equals(LoginUser.getPassword())) {
            //登陆成功
            Map<String, Object> claims = new HashMap<>();
            claims.put("id", LoginUser.getId());
            claims.put("username", LoginUser.getUsername());
            String token = JwtUtil.genToken(claims);
            return Result.success(token);
        }
        return Result.error("密码错误");

    }

    @GetMapping("/userInfo")
    public Result<User> userInfo(/*@RequestHeader("Authorization") String token*/) {

        // //解析token
        // Map<String, Object> claims = JwtUtil.parseToken(token);
        // //获取用户名
        // String nameString = (String) claims.get("username");

        //获取ThreadLocal中的map对象
        Map<String, Object> map = ThreadLocalUtil.get();
        //获取用户名
        String nameString = (String) map.get("username");

        //根据用户名查询用户信息
        User user = userService.findByUserName(nameString);
        return Result.success(user);

    }

    @PutMapping ("/update")//使用@Validated注解使校验语句生效
    public Result update(@RequestBody  @Validated User user){

        userService.update(user);
        return Result.success();

    }

    @PatchMapping("/updateAvatar")
    public Result updateAvatar(@RequestParam @URL String avatarUrl){
        
        Map<String, Object> map = ThreadLocalUtil.get();
        Integer id = (Integer) map.get("id");
        userService.updateAvatar(avatarUrl,id);
        return Result.success();

    }

    @PatchMapping("/updatePwd")
    public Result updatePwd(@RequestBody Map<String,String> parms){

        //参数校验
        String oldPwd = parms.get("old_pwd");
        String newPwd = parms.get("new_pwd");
        String rePwd = parms.get("re_pwd");

        if(!StringUtils.hasLength(oldPwd) || !StringUtils.hasLength(newPwd) || !StringUtils.hasLength(rePwd)){
            return Result.error("缺少必要参数");
        }

        //判断填写的原密码和数据库中密码一致
        Map<String, Object> map = ThreadLocalUtil.get();
        String username = (String) map.get("username");
        User LoginUser = userService.findByUserName(username);
        String password = LoginUser.getPassword();
        if(!password.equals(Md5Util.getMD5String(oldPwd))){
            return Result.error("原密码填写不正确");
        }

        //判断两次填写的新密码一致
        if(!newPwd.equals(rePwd)){
            return Result.error("两次输入的新密码不一致");
        }

        //进行更改密码操作
        userService.updatePwd(newPwd);
        return Result.success();
    }

}
