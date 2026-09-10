package com.personalsite.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.personalsite.entity.ArticleTag;
import com.personalsite.vo.TagVO;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

public interface ArticleTagMapper extends BaseMapper<ArticleTag> {

    @Select("SELECT t.id, t.name, t.slug FROM tag t " +
            "INNER JOIN article_tag at2 ON t.id = at2.tag_id " +
            "WHERE at2.article_id = #{articleId}")
    List<TagVO> selectTagsByArticleId(@Param("articleId") Long articleId);
}
