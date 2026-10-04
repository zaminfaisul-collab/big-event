package com.xaau.bigevent.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.xaau.bigevent.pojo.Category;
import com.xaau.bigevent.pojo.Result;
import com.xaau.bigevent.pojo.Category.Add;
import com.xaau.bigevent.pojo.Category.Update;
import com.xaau.bigevent.service.CategoryService;

@RestController 
@RequestMapping("/category")
public class CategoryController {

    @Autowired 
    private CategoryService categoryService;

    @PostMapping 
    public Result add(@RequestBody @Validated(Add.class)  Category category){

        categoryService.add(category);
        return Result.success();

    }

    @GetMapping 
    public Result<List<Category>> list(){

        List<Category> list = categoryService.list();
        return Result.success(list);

    }

    @GetMapping("/detail")
    public Result<Category> detail(Integer id){

        Category cs = categoryService.findById(id);
        return Result.success(cs);

    }

    @PutMapping
    public Result update(@RequestBody @Validated(Update.class) Category category){

        //获取更改时间
        category.setUpdateTime(LocalDateTime.now());

        categoryService.update(category);
        return Result.success();

    }

}
