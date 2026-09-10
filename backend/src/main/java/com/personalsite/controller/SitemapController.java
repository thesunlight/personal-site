package com.personalsite.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personalsite.entity.Article;
import com.personalsite.mapper.ArticleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final ArticleMapper articleMapper;

    @Value("${app.sitemap.base-url:https://huangml.com}")
    private String baseUrl;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        List<Article> articles = articleMapper.selectList(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getStatus, 1)
                        .orderByDesc(Article::getPublishedAt));

        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");

        // Home page
        sb.append("<url><loc>").append(baseUrl).append("/</loc>");
        sb.append("<changefreq>daily</changefreq><priority>1.0</priority></url>");

        // Static pages
        for (String p : new String[]{"/archives", "/about"}) {
            sb.append("<url><loc>").append(baseUrl).append(p).append("</loc>");
            sb.append("<changefreq>weekly</changefreq><priority>0.8</priority></url>");
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (Article a : articles) {
            sb.append("<url><loc>").append(baseUrl).append("/articles/").append(a.getSlug()).append("</loc>");
            if (a.getUpdatedAt() != null) {
                sb.append("<lastmod>").append(a.getUpdatedAt().format(fmt)).append("</lastmod>");
            }
            sb.append("<changefreq>monthly</changefreq><priority>0.6</priority></url>");
        }

        sb.append("</urlset>");
        return sb.toString();
    }
}
