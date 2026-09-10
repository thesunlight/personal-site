package com.personalsite.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.personalsite.entity.Article;
import com.personalsite.vo.ArticleVO;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface ArticleMapper extends BaseMapper<Article> {

    @Select("<script>" +
            "SELECT a.*, c.name AS category_name, c.slug AS category_slug " +
            "FROM article a LEFT JOIN category c ON a.category_id = c.id " +
            "<where>" +
            "<if test='status != null'> AND a.status = #{status}</if>" +
            "<if test='categoryId != null'> AND a.category_id = #{categoryId}</if>" +
            "<if test='keyword != null and keyword.length() > 0'> AND (a.title LIKE CONCAT('%',#{keyword},'%') OR a.summary LIKE CONCAT('%',#{keyword},'%'))</if>" +
            "</where>" +
            " ORDER BY a.is_top DESC, a.published_at DESC" +
            "</script>")
    IPage<ArticleVO> selectArticlePage(Page<ArticleVO> page,
                                        @Param("status") Integer status,
                                        @Param("categoryId") Long categoryId,
                                        @Param("keyword") String keyword);

    @Select("SELECT a.*, c.name AS category_name, c.slug AS category_slug " +
            "FROM article a LEFT JOIN category c ON a.category_id = c.id " +
            "WHERE a.slug = #{slug}")
    ArticleVO selectBySlug(@Param("slug") String slug);

    @Select("SELECT COUNT(*) FROM article WHERE category_id = #{categoryId} AND status = 1")
    int countByCategory(@Param("categoryId") Long categoryId);

    @Select("SELECT COUNT(DISTINCT article_id) FROM article_tag at2 INNER JOIN article a ON at2.article_id = a.id WHERE at2.tag_id = #{tagId} AND a.status = 1")
    int countByTag(@Param("tagId") Long tagId);
}
