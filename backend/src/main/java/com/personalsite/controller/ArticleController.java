package com.personalsite.controller;

import com.personalsite.common.PageResult;
import com.personalsite.common.Result;
import com.personalsite.dto.ArticleCreateDTO;
import com.personalsite.dto.ArticleUpdateDTO;
import com.personalsite.service.ArticleService;
import com.personalsite.vo.ArticleDetailVO;
import com.personalsite.vo.ArticleVO;
import com.personalsite.vo.ArchiveVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public Result<PageResult<ArticleVO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) String keyword) {
        return Result.ok(articleService.getArticlePage(page, size, 1, categoryId, tagId, keyword));
    }

    @GetMapping("/all")
    public Result<PageResult<ArticleVO>> listAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            Authentication auth) {
        return Result.ok(articleService.getArticlePage(page, size, null, categoryId, null, keyword));
    }

    @GetMapping("/{slug}")
    public Result<ArticleDetailVO> detail(@PathVariable String slug) {
        return Result.ok(articleService.getArticleDetail(slug));
    }

    @GetMapping("/top")
    public Result<List<ArticleVO>> top() {
        return Result.ok(articleService.getTopArticles());
    }

    @GetMapping("/archives")
    public Result<List<ArchiveVO>> archives() {
        return Result.ok(articleService.getArchives());
    }

    @PostMapping
    public Result<ArticleVO> create(Authentication auth, @Valid @RequestBody ArticleCreateDTO dto) {
        Long authorId = (Long) auth.getPrincipal();
        return Result.ok(articleService.createArticle(dto, authorId));
    }

    @PutMapping("/{id}")
    public Result<ArticleVO> update(@PathVariable Long id, @RequestBody ArticleUpdateDTO dto) {
        return Result.ok(articleService.updateArticle(id, dto));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return Result.ok();
    }

    @PutMapping("/{id}/top")
    public Result<Void> toggleTop(@PathVariable Long id) {
        articleService.toggleTop(id);
        return Result.ok();
    }

    @PutMapping("/{id}/status")
    public Result<Void> toggleStatus(@PathVariable Long id) {
        articleService.toggleStatus(id);
        return Result.ok();
    }
}
