package com.xaau.bigevent.controller;

import java.io.IOException;
import java.util.UUID;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.xaau.bigevent.pojo.Result;
import com.xaau.bigevent.utils.AliOssUtil;

@RestController 
public class FileUploadController {

    @PostMapping("upload")
    public Result<String> upload(MultipartFile file) throws Exception, IOException{

        //接收前端传来的文件并存储到本地
        //获取原文件名
        String originaFilename = file.getOriginalFilename();
        //生成唯一文件名（防止重名导致文件覆盖）
        String filename = UUID.randomUUID().toString()+originaFilename.substring(originaFilename.lastIndexOf("."));
        // file.transferTo(new File("D:\\userPic"+filename));
        String url = AliOssUtil.upload(filename, file.getInputStream());

        return Result.success(url);

    }

}
