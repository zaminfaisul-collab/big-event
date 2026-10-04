package com.xaau.bigevent.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.xaau.bigevent.mapper.ArticleMapper;
import com.xaau.bigevent.pojo.Article;
import com.xaau.bigevent.pojo.PageBean;
import com.xaau.bigevent.service.ArticleService;
import com.xaau.bigevent.utils.ThreadLocalUtil;

@Service 
public class ArticelSerciceImpl implements ArticleService{

    @Autowired 
    private ArticleMapper articleMapper;
    
    @Override
    public void add(Article article) {

        articleMapper.add(article);

    }

    @Override
    public PageBean<Article> list(Integer pageNum, Integer pageSize, Integer categoryId, String state) {

        //1.new一个PageBean对象
        PageBean<Article> pb = new PageBean<>();

        //2.开启分页查询 PageHelper
        PageHelper.startPage(pageNum,pageSize);

        //3.调用Mapper
        Map<String,Object> map = ThreadLocalUtil.get();
        Integer userId = (Integer) map.get("id");
        List<Article> as = articleMapper.list(userId,categoryId,state);
        Page<Article> p = (Page<Article>) as;

        //把数据填充到pb中
        pb.setTotal(p.getTotal());
        pb.setItems(p.getResult());
        return pb;

    }

    @Override
    public Article detail(Integer id,Integer userId) {

        Article article = articleMapper.detail(id,userId);
        return article;
        
    }

    @Override
    public void update(Article article, Integer userId) {

        articleMapper.update(article,userId);
        
    }

    @Override
    public void delete(Integer id, Integer userId) {

        articleMapper.delete(id,userId);
        
    }

}
