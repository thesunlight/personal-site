package com.personalsite.controller;

import com.personalsite.common.Result;
import com.personalsite.service.ArticleService;
import com.personalsite.service.CategoryService;
import com.personalsite.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ArticleService articleService;
    private final CategoryService categoryService;
    private final TagService tagService;

    @GetMapping("/stats")
    public Result<Map<String, Object>> stats() {
        return Result.ok(Map.of(
                "articleCount", articleService.getTotalCount(),
                "categoryCount", categoryService.getTotalCount(),
                "tagCount", tagService.getTotalCount(),
                "totalViews", articleService.getTotalViews()
        ));
    }
}
