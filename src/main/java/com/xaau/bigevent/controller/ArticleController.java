package com.xaau.bigevent.controller;

import com.xaau.bigevent.pojo.Article;
import com.xaau.bigevent.pojo.PageBean;
import com.xaau.bigevent.pojo.Result;
import com.xaau.bigevent.service.ArticleService;
import com.xaau.bigevent.utils.ThreadLocalUtil;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/article")
public class ArticleController {

    @Autowired 
    private ArticleService articleService;

    @PostMapping 
    public Result add(@RequestBody @Validated Article article){

        //补充属性
        Map<String,Object> map = ThreadLocalUtil.get();
        Integer userId = (Integer) map.get("id");
        article.setCreateUser(userId);

        article.setCreateTime(LocalDateTime.now());
        article.setUpdateTime(LocalDateTime.now());

        articleService.add(article);
        return Result.success();

    }

    //@RequestParam(required = false):指该参数非必须
    @GetMapping 
    public Result<PageBean<Article>> list(
            Integer pageNum,
            Integer pageSize,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false)  String state
    ){

        PageBean<Article> pb = articleService.list(pageNum,pageSize,categoryId,state);
        return Result.success(pb);
    }

    @GetMapping("/detail")
    public Result<Article> detail(Integer id){

        Map<String,Object> map = ThreadLocalUtil.get();
        Integer userId = (Integer) map.get("id");
        Article article = articleService.detail(id, userId);

        return Result.success(article);

    }

    @PutMapping 
    public Result update(@RequestBody @Validated Article article){

        Map<String,Object> map = ThreadLocalUtil.get();
        Integer userId = (Integer) map.get("id");
        article.setUpdateTime(LocalDateTime.now());
        articleService.update(article,userId);
        return Result.success();

    }

    @DeleteMapping 
    public Result delete(Integer id){

        //获取当前用户Id
        Map<String,Object> map = ThreadLocalUtil.get();
        Integer userId = (Integer) map.get("id");
        articleService.delete(id,userId);
        return Result.success();

    }

}
