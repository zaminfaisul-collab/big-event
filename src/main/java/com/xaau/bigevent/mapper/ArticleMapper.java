package com.xaau.bigevent.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.xaau.bigevent.pojo.Article;

public interface ArticleMapper {

    //新增文章
    @Insert("insert into article(title,content,cover_img,state,category_id,create_user,create_time,update_time) "+
            "values(#{title},#{content},#{coverImg},#{state},#{categoryId},#{createUser},#{createTime},#{updateTime})"
    )
    void add(Article article);

    //条件分页列表查询
    List<Article> list(Integer userId, Integer categoryId, String state);

    //获取文章分类详情
    @Select("select * from article where id=#{id} and create_user=#{userId}")
    Article detail(Integer id, Integer userId);

    //更新文章
    @Update("update article set title=#{article.title},content=#{article.content},cover_img=#{article.coverImg},state=#{article.state},category_id=#{article.categoryId},update_time=#{article.updateTime} "+
            "where id=#{article.id} and create_user=#{userId}")
    void update(Article article, Integer userId);

    //删除文章
    @Delete("delete from article where id=#{id} and create_user=#{userId}")
    void delete(Integer id, Integer userId);

}
