package com.xaau.bigevent.utils;

import java.io.InputStream;

import com.aliyun.sdk.service.oss2.OSSClient;
import com.aliyun.sdk.service.oss2.credentials.StaticCredentialsProvider;
import com.aliyun.sdk.service.oss2.models.PutObjectRequest;
import com.aliyun.sdk.service.oss2.transport.BinaryData;

public class AliOssUtil {

    private static final String REGION = "cn-hangzhou";
    private static final String BUCKET = "big-event-xaau";
    private static final String ACCESSKEYID = System.getenv("OSS_ACCESS_KEY_ID");
    private static final String ACCESSKESECRET = System.getenv("OSS_ACCESS_KEY_SECRET");

    public static String upload(String filename,InputStream inputStream) throws Exception {

        String url = "";

        StaticCredentialsProvider credentialsProvider =
                new StaticCredentialsProvider(ACCESSKEYID, ACCESSKESECRET);

        try (OSSClient client = OSSClient.newBuilder()
                .credentialsProvider(credentialsProvider)
                .region(REGION)
                .build();) {
            
                client.putObject(PutObjectRequest.newBuilder()
                        .bucket(BUCKET)
                        .key(filename)
                        .body(BinaryData.fromStream(inputStream))
                        .build());

                //https://<bucket名称>.oss-<region>.aliyuncs.com/<objectKey>
                url = "https://"+BUCKET+".oss-"+REGION+".aliyuncs.com/"+filename;

        }

        return url;
    }

}  
