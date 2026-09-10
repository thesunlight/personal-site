package com.personalsite.service;

import com.personalsite.common.PageResult;
import com.personalsite.dto.ArticleCreateDTO;
import com.personalsite.dto.ArticleUpdateDTO;
import com.personalsite.vo.ArticleDetailVO;
import com.personalsite.vo.ArticleVO;
import com.personalsite.vo.ArchiveVO;

import java.util.List;

public interface ArticleService {
    PageResult<ArticleVO> getArticlePage(int page, int size, Integer status, Long categoryId, Long tagId, String keyword);
    ArticleDetailVO getArticleDetail(String slug);
    List<ArticleVO> getTopArticles();
    List<ArchiveVO> getArchives();
    ArticleVO createArticle(ArticleCreateDTO dto, Long authorId);
    ArticleVO updateArticle(Long id, ArticleUpdateDTO dto);
    void deleteArticle(Long id);
    void toggleTop(Long id);
    void toggleStatus(Long id);
    int getTotalCount();
    long getTotalViews();
}
