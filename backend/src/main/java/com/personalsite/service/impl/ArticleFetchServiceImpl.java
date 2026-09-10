package com.personalsite.service.impl;

import com.personalsite.common.BusinessException;
import com.personalsite.dto.ArticleCreateDTO;
import com.personalsite.dto.ArticleFetchDTO;
import com.personalsite.service.ArticleFetchService;
import com.personalsite.service.ArticleService;
import com.personalsite.util.HtmlContentExtractor;
import com.personalsite.vo.ArticleFetchResultVO;
import com.personalsite.vo.ArticleVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleFetchServiceImpl implements ArticleFetchService {

    private final HtmlContentExtractor extractor;
    private final ArticleService articleService;

    @Value("${app.upload.path}")
    private String uploadPath;

    @Value("${app.upload.url-prefix}")
    private String urlPrefix;

    private static final int IMAGE_DOWNLOAD_TIMEOUT = 10_000;
    private static final Pattern MD_IMG_PATTERN = Pattern.compile("!\\[([^\\]]*)]\\(([^)]+)\\)");
    private static final Pattern HTML_IMG_PATTERN = Pattern.compile("<img[^>]+src=[\"']([^\"']+)[\"']", Pattern.CASE_INSENSITIVE);

    @Override
    public ArticleFetchResultVO fetchAndParse(String url) {
        validateUrl(url);

        String html = fetchHtml(url);
        HtmlContentExtractor.ExtractedContent extracted = extractor.extract(html, url);

        ArticleFetchResultVO result = new ArticleFetchResultVO();
        result.setTitle(extracted.getTitle());
        result.setAuthor(extracted.getAuthor());
        result.setSourceName(extracted.getSourceName());
        result.setSourceUrl(url);
        result.setCoverImage(extracted.getCoverImage());
        result.setContent(extracted.getContentMarkdown());
        result.setImages(extracted.getImageUrls());
        result.setDownloadedImages(0);

        // Generate summary
        String content = extracted.getContentMarkdown();
        if (content != null && content.length() > 200) {
            result.setSummary(content.substring(0, 200).replaceAll("[#*`()\\]>\\-\n]", " ").trim() + "...");
        } else {
            result.setSummary(content != null ? content.replaceAll("[#*`()\\]>\\-\n]", " ").trim() : "");
        }

        return result;
    }

    @Override
    public ArticleVO downloadImagesAndSave(ArticleFetchResultVO fetchResult, Long categoryId, Integer status, Long authorId) {
        String content = fetchResult.getContent();

        // Download images and replace URLs
        int downloaded = 0;
        List<String> imageUrls = fetchResult.getImages();
        if (imageUrls != null && !imageUrls.isEmpty()) {
            Map<String, String> urlMapping = new LinkedHashMap<>();
            for (String imgUrl : imageUrls) {
                try {
                    String localUrl = downloadImage(imgUrl, fetchResult.getSourceUrl());
                    if (localUrl != null) {
                        urlMapping.put(imgUrl, localUrl);
                        downloaded++;
                    }
                } catch (Exception e) {
                    log.warn("Failed to download image: {}, error: {}", imgUrl, e.getMessage());
                }
            }

            // Replace image URLs in content
            for (Map.Entry<String, String> entry : urlMapping.entrySet()) {
                content = content.replace(entry.getKey(), entry.getValue());
            }
        }

        // Also handle cover image
        String coverImage = fetchResult.getCoverImage();
        if (coverImage != null && coverImage.startsWith("http")) {
            try {
                String localCover = downloadImage(coverImage, fetchResult.getSourceUrl());
                if (localCover != null) {
                    coverImage = localCover;
                }
            } catch (Exception e) {
                log.warn("Failed to download cover image: {}", e.getMessage());
            }
        }

        // Generate slug from title
        String slug = generateSlug(fetchResult.getTitle());

        // Build ArticleCreateDTO
        ArticleCreateDTO dto = new ArticleCreateDTO();
        dto.setTitle(fetchResult.getTitle());
        dto.setSlug(slug);
        dto.setContent(content);
        dto.setSummary(fetchResult.getSummary());
        dto.setCoverImage(coverImage);
        dto.setCategoryId(categoryId);
        dto.setStatus(status != null ? status : 0); // Default to draft
        dto.setSourceUrl(fetchResult.getSourceUrl());
        dto.setSourceName(fetchResult.getSourceName());
        dto.setSourceAuthor(fetchResult.getAuthor());

        fetchResult.setDownloadedImages(downloaded);

        return articleService.createArticle(dto, authorId);
    }

    private String fetchHtml(String url) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            headers.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
            headers.set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            throw new BusinessException("Failed to fetch URL: " + e.getMessage());
        }
    }

    private String downloadImage(String imageUrl, String referer) {
        if (imageUrl == null || imageUrl.startsWith("data:")) return null;

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            if (referer != null && referer.contains("mp.weixin.qq.com")) {
                headers.set("Referer", "https://mp.weixin.qq.com/");
            }

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<byte[]> response = restTemplate.exchange(imageUrl, HttpMethod.GET, entity, byte[].class);

            byte[] bytes = response.getBody();
            if (bytes == null || bytes.length == 0) return null;

            // Detect extension from Content-Type
            String contentType = response.getHeaders().getContentType() != null
                    ? response.getHeaders().getContentType().toString() : "";
            String ext = detectExtension(contentType, imageUrl);

            // Save to uploads/collected/yyyy/MM/
            String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
            String fileName = UUID.randomUUID().toString() + ext;
            String relativePath = "collected/" + datePath + "/" + fileName;

            Path dir = Paths.get(uploadPath, "collected", datePath);
            Files.createDirectories(dir);
            Path target = dir.resolve(fileName);
            Files.write(target, bytes);

            return urlPrefix + "/" + relativePath;
        } catch (Exception e) {
            log.warn("Image download failed: {} - {}", imageUrl, e.getMessage());
            return null;
        }
    }

    private String detectExtension(String contentType, String url) {
        if (contentType.contains("png")) return ".png";
        if (contentType.contains("webp")) return ".webp";
        if (contentType.contains("gif")) return ".gif";
        if (url.toLowerCase().contains(".png")) return ".png";
        if (url.toLowerCase().contains(".webp")) return ".webp";
        if (url.toLowerCase().contains(".gif")) return ".gif";
        return ".jpg";
    }

    private void validateUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            throw new BusinessException("URL is required");
        }
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new BusinessException("URL must start with http:// or https://");
        }
        try {
            URL u = new URL(url);
            String host = u.getHost();
            // Block private IP ranges (SSRF protection)
            if (host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("172.")
                    || host.equals("localhost") || host.equals("127.0.0.1") || host.startsWith("0.")) {
                throw new BusinessException("Internal URLs are not allowed");
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Invalid URL: " + e.getMessage());
        }
    }

    private String generateSlug(String title) {
        if (title == null || title.isEmpty()) return "article-" + System.currentTimeMillis();
        String slug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\u4e00-\\u9fff]+", "-")
                .replaceAll("^-|-$", "");
        if (slug.isEmpty()) slug = "article-" + System.currentTimeMillis();
        if (slug.length() > 200) slug = slug.substring(0, 200);
        return slug;
    }
}
