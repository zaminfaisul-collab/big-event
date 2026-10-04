package com.xaau.bigevent.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.xaau.bigevent.pojo.Category;

@Mapper 
public interface CategoryMapper {

    //新增文章分类
    @Insert("insert into category(category_name,category_alias,create_user,create_time,update_time) "+
            "values(#{categoryName},#{categoryAlias},#{createUser},#{createTime},#{updateTime})")
    void add(Category category);

    //查询文章
    @Select("select * from category where create_user=#{userId}")
    List<Category> list(Integer userId);

    //根据ID获取文章分类详情
    @Select("select * from category where id=#{id}")
    Category findById(Integer id);

    //更改数据
    @Update("update category set category_name=#{categoryName},category_alias=#{categoryAlias},update_time=#{updateTime} where id=#{id}")
    void update(Category category);

}
