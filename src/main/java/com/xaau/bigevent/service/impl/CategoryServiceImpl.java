package com.xaau.bigevent.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.xaau.bigevent.mapper.CategoryMapper;
import com.xaau.bigevent.pojo.Category;
import com.xaau.bigevent.pojo.Result;
import com.xaau.bigevent.service.CategoryService;
import com.xaau.bigevent.utils.ThreadLocalUtil;

@Service 
public class CategoryServiceImpl implements CategoryService{

    @Autowired 
    private CategoryMapper categoryMapper;

    @Override
    public void add(Category category) {

        //获取当前用户id，用来操作
        Map<String, Object> map = ThreadLocalUtil.get();
        Integer userId = (Integer) map.get("id");
        category.setCreateUser(userId);
        //获取创建时间以及修改时间
        category.setCreateTime(LocalDateTime.now());
        category.setUpdateTime(LocalDateTime.now());

        categoryMapper.add(category);

    }

    @Override
    public List<Category> list() {

        Map<String,Object> map = ThreadLocalUtil.get();
        Integer userId = (Integer) map.get("id");
        return categoryMapper.list(userId);
        
    }

    @Override
    public Category findById(Integer id) {

        return categoryMapper.findById(id);

    }

    @Override
    public void update(Category category) {

        categoryMapper.update(category);

    }
    
}
