# big-event

基于 Spring Boot 的练手项目，用于学习后端开发。

## 技术栈
Spring Boot 3.x / MyBatis / MySQL / JWT

## 功能
- 用户注册登录
- 文章与分类的增删改查
- 文件上传（阿里云 OSS）

## 本地运行
1. 建库 big_event，导入 SQL
2. 配置 application.yml 里的数据库连接
3. 设置环境变量 OSS_ACCESS_KEY_ID / OSS_ACCESS_KEY_SECRET
4. mvnw spring-boot:run

## 前端
frontend/ 目录，node server.mjs 启动