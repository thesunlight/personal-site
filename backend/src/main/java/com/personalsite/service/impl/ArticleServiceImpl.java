package com.personalsite.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.personalsite.common.BusinessException;
import com.personalsite.common.PageResult;
import com.personalsite.dto.ArticleCreateDTO;
import com.personalsite.dto.ArticleUpdateDTO;
import com.personalsite.entity.Article;
import com.personalsite.entity.ArticleTag;
import com.personalsite.mapper.ArticleMapper;
import com.personalsite.mapper.ArticleTagMapper;
import com.personalsite.service.ArticleService;
import com.personalsite.vo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private final ArticleMapper articleMapper;
    private final ArticleTagMapper articleTagMapper;

    @Override
    public PageResult<ArticleVO> getArticlePage(int page, int size, Integer status, Long categoryId, Long tagId, String keyword) {
        // If filtering by tag, first get article IDs for that tag
        if (tagId != null) {
            List<ArticleTag> ats = articleTagMapper.selectList(
                    new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getTagId, tagId));
            List<Long> articleIds = ats.stream().map(ArticleTag::getArticleId).collect(Collectors.toList());
            if (articleIds.isEmpty()) {
                return new PageResult<>(Collections.emptyList(), 0, page, size);
            }
            // Add to query via IDs
            Page<ArticleVO> pageParam = new Page<>(page, size);
            var result = articleMapper.selectArticlePage(pageParam, status, categoryId, keyword);
            // Filter by tag article IDs
            List<Long> finalIds = articleIds;
            List<ArticleVO> filtered = result.getRecords().stream()
                    .filter(a -> finalIds.contains(a.getId())).collect(Collectors.toList());
            result.setRecords(filtered);
            result.setTotal(filtered.size());
            fillTags(result.getRecords());
            return new PageResult<>(filtered, result.getTotal(), page, size);
        }

        Page<ArticleVO> pageParam = new Page<>(page, size);
        var result = articleMapper.selectArticlePage(pageParam, status, categoryId, keyword);
        fillTags(result.getRecords());
        return new PageResult<>(result.getRecords(), result.getTotal(), page, size);
    }

    @Override
    public ArticleDetailVO getArticleDetail(String slug) {
        ArticleVO av = articleMapper.selectBySlug(slug);
        if (av == null) throw new BusinessException(404, "Article not found");

        // Increment view count
        Article article = articleMapper.selectById(av.getId());
        article.setViewCount(article.getViewCount() + 1);
        articleMapper.updateById(article);
        av.setViewCount(article.getViewCount());

        ArticleDetailVO vo = new ArticleDetailVO();
        vo.setId(av.getId());
        vo.setTitle(av.getTitle());
        vo.setSlug(av.getSlug());
        vo.setSummary(av.getSummary());
        vo.setContent(article.getContent());
        vo.setCoverImage(av.getCoverImage());
        vo.setSourceUrl(article.getSourceUrl());
        vo.setSourceName(article.getSourceName());
        vo.setSourceAuthor(article.getSourceAuthor());
        vo.setStatus(av.getStatus());
        vo.setIsTop(av.getIsTop());
        vo.setViewCount(av.getViewCount());
        vo.setWordCount(av.getWordCount());
        vo.setPublishedAt(av.getPublishedAt());
        vo.setCreatedAt(av.getCreatedAt());
        vo.setCategoryId(article.getCategoryId());
        vo.setCategoryName(av.getCategoryName());
        vo.setCategorySlug(av.getCategorySlug());
        vo.setTags(articleTagMapper.selectTagsByArticleId(av.getId()));

        // Prev article
        Article prev = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, 1)
                .lt(Article::getPublishedAt, av.getPublishedAt())
                .orderByDesc(Article::getPublishedAt).last("LIMIT 1"));
        if (prev != null) {
            ArticleVO prevVO = new ArticleVO();
            prevVO.setId(prev.getId());
            prevVO.setTitle(prev.getTitle());
            prevVO.setSlug(prev.getSlug());
            vo.setPrevArticle(prevVO);
        }

        // Next article
        Article next = articleMapper.selectOne(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, 1)
                .gt(Article::getPublishedAt, av.getPublishedAt())
                .orderByAsc(Article::getPublishedAt).last("LIMIT 1"));
        if (next != null) {
            ArticleVO nextVO = new ArticleVO();
            nextVO.setId(next.getId());
            nextVO.setTitle(next.getTitle());
            nextVO.setSlug(next.getSlug());
            vo.setNextArticle(nextVO);
        }

        return vo;
    }

    @Override
    public List<ArticleVO> getTopArticles() {
        Page<ArticleVO> pageParam = new Page<>(1, 5);
        var result = articleMapper.selectArticlePage(pageParam, 1, null, null);
        List<ArticleVO> tops = result.getRecords().stream()
                .filter(a -> a.getIsTop() == 1).collect(Collectors.toList());
        fillTags(tops);
        return tops;
    }

    @Override
    public List<ArchiveVO> getArchives() {
        List<Article> articles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, 1).orderByDesc(Article::getPublishedAt));

        Map<Integer, Map<Integer, List<Article>>> grouped = articles.stream()
                .filter(a -> a.getPublishedAt() != null)
                .collect(Collectors.groupingBy(a -> a.getPublishedAt().getYear(),
                        Collectors.groupingBy(a -> a.getPublishedAt().getMonthValue())));

        List<ArchiveVO> result = new ArrayList<>();
        grouped.entrySet().stream().sorted((a, b) -> b.getKey() - a.getKey()).forEach(yearEntry -> {
            ArchiveVO archive = new ArchiveVO();
            archive.setYear(yearEntry.getKey());
            List<ArchiveVO.MonthArchive> months = new ArrayList<>();
            yearEntry.getValue().entrySet().stream().sorted((a, b) -> b.getKey() - a.getKey()).forEach(monthEntry -> {
                ArchiveVO.MonthArchive ma = new ArchiveVO.MonthArchive();
                ma.setMonth(monthEntry.getKey());
                List<ArchiveVO.ArchiveItem> items = monthEntry.getValue().stream().map(a -> {
                    ArchiveVO.ArchiveItem item = new ArchiveVO.ArchiveItem();
                    item.setId(a.getId());
                    item.setTitle(a.getTitle());
                    item.setSlug(a.getSlug());
                    item.setPublishedAt(a.getPublishedAt().toString());
                    return item;
                }).collect(Collectors.toList());
                ma.setArticles(items);
                months.add(ma);
            });
            archive.setMonths(months);
            result.add(archive);
        });
        return result;
    }

    @Override
    @Transactional
    public ArticleVO createArticle(ArticleCreateDTO dto, Long authorId) {
        Article article = new Article();
        article.setTitle(dto.getTitle());
        article.setSlug(dto.getSlug());
        article.setSummary(dto.getSummary() != null ? dto.getSummary() : generateSummary(dto.getContent()));
        article.setContent(dto.getContent());
        article.setCoverImage(dto.getCoverImage());
        article.setSourceUrl(dto.getSourceUrl());
        article.setSourceName(dto.getSourceName());
        article.setSourceAuthor(dto.getSourceAuthor());
        article.setCategoryId(dto.getCategoryId());
        article.setAuthorId(authorId);
        article.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        article.setIsTop(dto.getIsTop() != null ? dto.getIsTop() : 0);
        article.setViewCount(0);
        article.setWordCount(dto.getContent().length());
        if (article.getStatus() == 1) {
            article.setPublishedAt(LocalDateTime.now());
        }
        articleMapper.insert(article);
        saveTags(article.getId(), dto.getTagIds());
        return articleMapper.selectBySlug(article.getSlug());
    }

    @Override
    @Transactional
    public ArticleVO updateArticle(Long id, ArticleUpdateDTO dto) {
        Article article = articleMapper.selectById(id);
        if (article == null) throw new BusinessException("Article not found");

        if (dto.getTitle() != null) article.setTitle(dto.getTitle());
        if (dto.getSlug() != null) article.setSlug(dto.getSlug());
        if (dto.getSummary() != null) article.setSummary(dto.getSummary());
        if (dto.getContent() != null) {
            article.setContent(dto.getContent());
            article.setWordCount(dto.getContent().length());
        }
        if (dto.getCoverImage() != null) article.setCoverImage(dto.getCoverImage());
        if (dto.getSourceUrl() != null) article.setSourceUrl(dto.getSourceUrl());
        if (dto.getSourceName() != null) article.setSourceName(dto.getSourceName());
        if (dto.getSourceAuthor() != null) article.setSourceAuthor(dto.getSourceAuthor());
        if (dto.getCategoryId() != null) article.setCategoryId(dto.getCategoryId());
        if (dto.getIsTop() != null) article.setIsTop(dto.getIsTop());

        if (dto.getStatus() != null && !dto.getStatus().equals(article.getStatus())) {
            article.setStatus(dto.getStatus());
            if (dto.getStatus() == 1 && article.getPublishedAt() == null) {
                article.setPublishedAt(LocalDateTime.now());
            }
        }

        articleMapper.updateById(article);
        if (dto.getTagIds() != null) {
            articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>()
                    .eq(ArticleTag::getArticleId, id));
            saveTags(id, dto.getTagIds());
        }
        String slug = article.getSlug();
        ArticleVO vo = articleMapper.selectBySlug(slug);
        if (vo != null) {
            vo.setTags(articleTagMapper.selectTagsByArticleId(id));
        }
        return vo;
    }

    @Override
    @Transactional
    public void deleteArticle(Long id) {
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>()
                .eq(ArticleTag::getArticleId, id));
        articleMapper.deleteById(id);
    }

    @Override
    public void toggleTop(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) throw new BusinessException("Article not found");
        article.setIsTop(article.getIsTop() == 1 ? 0 : 1);
        articleMapper.updateById(article);
    }

    @Override
    public void toggleStatus(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) throw new BusinessException("Article not found");
        article.setStatus(article.getStatus() == 1 ? 0 : 1);
        if (article.getStatus() == 1 && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        articleMapper.updateById(article);
    }

    @Override
    public int getTotalCount() {
        return Math.toIntExact(articleMapper.selectCount(
                new LambdaQueryWrapper<Article>().eq(Article::getStatus, 1)));
    }

    @Override
    public long getTotalViews() {
        List<Article> articles = articleMapper.selectList(
                new LambdaQueryWrapper<Article>().select(Article::getViewCount));
        return articles.stream().mapToLong(a -> a.getViewCount() != null ? a.getViewCount() : 0).sum();
    }

    private void saveTags(Long articleId, List<Long> tagIds) {
        if (tagIds == null || tagIds.isEmpty()) return;
        for (Long tagId : tagIds) {
            ArticleTag at = new ArticleTag();
            at.setArticleId(articleId);
            at.setTagId(tagId);
            articleTagMapper.insert(at);
        }
    }

    private void fillTags(List<ArticleVO> articles) {
        for (ArticleVO a : articles) {
            a.setTags(articleTagMapper.selectTagsByArticleId(a.getId()));
        }
    }

    private String generateSummary(String content) {
        if (content == null) return "";
        String clean = content.replaceAll("[#*`()\\]>-]", "").trim();
        return clean.length() > 200 ? clean.substring(0, 200) + "..." : clean;
    }
}
