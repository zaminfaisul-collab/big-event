package com.xaau.bigevent.service;

import com.xaau.bigevent.pojo.Article;
import com.xaau.bigevent.pojo.PageBean;

public interface ArticleService {

    //新增文章
    void add(Article article);

    //条件分页列表查询
    PageBean<Article> list(Integer pageNum, Integer pageSize, Integer categoryId, String state);

    //获取文章分类详情
    Article detail(Integer id,Integer userId);

    //更新文章
    void update(Article article, Integer userId);

    //删除文章
    void delete(Integer id, Integer userId);

}
