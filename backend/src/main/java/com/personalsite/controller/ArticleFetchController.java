package com.personalsite.controller;

import com.personalsite.common.Result;
import com.personalsite.dto.ArticleFetchDTO;
import com.personalsite.service.ArticleFetchService;
import com.personalsite.vo.ArticleFetchResultVO;
import com.personalsite.vo.ArticleVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/article-fetch")
@RequiredArgsConstructor
public class ArticleFetchController {

    private final ArticleFetchService fetchService;

    /**
     * POST /api/article-fetch/parse
     * Fetch and parse a URL, return extracted content preview
     */
    @PostMapping("/parse")
    public Result<ArticleFetchResultVO> parse(@Valid @RequestBody ArticleFetchDTO dto) {
        return Result.ok(fetchService.fetchAndParse(dto.getUrl()));
    }

    /**
     * POST /api/article-fetch/save
     * Download images and save the fetched article
     */
    @PostMapping("/save")
    public Result<ArticleVO> save(@RequestBody ArticleFetchSaveRequest req, Authentication auth) {
        Long authorId = (Long) auth.getPrincipal();
        ArticleFetchResultVO result = new ArticleFetchResultVO();
        result.setTitle(req.getTitle());
        result.setContent(req.getContent());
        result.setSummary(req.getSummary());
        result.setAuthor(req.getAuthor());
        result.setSourceName(req.getSourceName());
        result.setCoverImage(req.getCoverImage());
        result.setSourceUrl(req.getSourceUrl());
        result.setImages(req.getImages());

        return Result.ok(fetchService.downloadImagesAndSave(
                result, req.getCategoryId(), req.getStatus(), authorId));
    }

    @lombok.Data
    public static class ArticleFetchSaveRequest {
        private String title;
        private String content;
        private String summary;
        private String author;
        private String sourceName;
        private String coverImage;
        private String sourceUrl;
        private Long categoryId;
        private Integer status;
        private java.util.List<String> images;
    }
}
