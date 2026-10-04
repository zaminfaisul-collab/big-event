package com.xaau.bigevent;

import java.nio.file.Paths;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import com.aliyun.sdk.service.oss2.OSSClient;
import com.aliyun.sdk.service.oss2.credentials.StaticCredentialsProvider;
import com.aliyun.sdk.service.oss2.models.PutObjectRequest;
import com.aliyun.sdk.service.oss2.transport.BinaryData;

public class QuickStart {
    public static void main(String[] args) throws Exception {
        String region = "cn-hangzhou";
        String bucket = "big-event-xaau";
        String key = "pic.png";
        String accessKeyId = System.getenv("OSS_ACCESS_KEY_ID");
        String accessKeySecret = System.getenv("OSS_ACCESS_KEY_SECRET");

        StaticCredentialsProvider credentialsProvider =
                new StaticCredentialsProvider(accessKeyId, accessKeySecret);

        Path filePath = Paths.get("D:/userPic/001.png");
        try (OSSClient client = OSSClient.newBuilder()
                .credentialsProvider(credentialsProvider)
                .region(region)
                .build();
            InputStream inputStream = Files.newInputStream(filePath)) {
            
                client.putObject(PutObjectRequest.newBuilder()
                        .bucket(bucket)
                        .key(key)
                        .body(BinaryData.fromStream(inputStream))
                        .build());
                System.out.println("Object uploaded");
  
        }

        System.out.println("Quick start completed");
    }
}