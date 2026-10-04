package com.xaau.bigevent.service;

import java.util.List;

import com.xaau.bigevent.pojo.Category;

public interface CategoryService {

    //新增文章分类
    void add(Category category);

    //查询文章
    List<Category> list();

    //根据ID获取文章分类详情
    Category findById(Integer id);

    //更新数据
    void update(Category category);
    
}
