package com.personalsite.util;

import com.vladsch.flexmark.html2md.converter.FlexmarkHtmlConverter;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class HtmlContentExtractor {

    private static final Pattern IMG_PATTERN = Pattern.compile("https?://[^\\s\"'<>]+\\.(jpg|jpeg|png|webp|gif)(\\?[^\\s\"'<>]*)?", Pattern.CASE_INSENSITIVE);

    public static class ExtractedContent {
        private String title;
        private String author;
        private String sourceName;
        private String coverImage;
        private String contentHtml;
        private String contentMarkdown;
        private List<String> imageUrls = new ArrayList<>();

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        public String getSourceName() { return sourceName; }
        public void setSourceName(String sourceName) { this.sourceName = sourceName; }
        public String getCoverImage() { return coverImage; }
        public void setCoverImage(String coverImage) { this.coverImage = coverImage; }
        public String getContentHtml() { return contentHtml; }
        public void setContentHtml(String contentHtml) { this.contentHtml = contentHtml; }
        public String getContentMarkdown() { return contentMarkdown; }
        public void setContentMarkdown(String contentMarkdown) { this.contentMarkdown = contentMarkdown; }
        public List<String> getImageUrls() { return imageUrls; }
    }

    public ExtractedContent extract(String html, String baseUrl) {
        Document doc = Jsoup.parse(html, baseUrl);
        ExtractedContent content = new ExtractedContent();

        content.setTitle(extractTitle(doc));
        content.setAuthor(extractAuthor(doc));
        content.setSourceName(detectSourceName(baseUrl));
        content.setCoverImage(extractCoverImage(doc, baseUrl));

        Element mainContent = extractMainContent(doc);
        if (mainContent != null) {
            // Collect image URLs before cleaning
            content.getImageUrls().addAll(collectImageUrls(mainContent, baseUrl));

            // Clean: remove scripts, styles, nav, footer, ads
            mainContent.select("script, style, nav, footer, .advertisement, .ad, .share, .comment, iframe, .related, .recommend").remove();

            // Resolve relative image URLs
            for (Element img : mainContent.select("img")) {
                String src = getImgSrc(img);
                if (src != null && !src.isEmpty()) {
                    String absUrl = toAbsoluteUrl(src, baseUrl);
                    img.attr("src", absUrl);
                    img.removeAttr("data-src");
                    img.removeAttr("data-lazy-src");
                    img.removeAttr("data-original");
                }
            }

            // Resolve relative link URLs
            for (Element a : mainContent.select("a[href]")) {
                String href = a.attr("href");
                if (href != null && !href.startsWith("#") && !href.startsWith("javascript:")) {
                    a.attr("href", toAbsoluteUrl(href, baseUrl));
                }
            }

            content.setContentHtml(mainContent.html());

            // Convert HTML to Markdown
            try {
                FlexmarkHtmlConverter converter = FlexmarkHtmlConverter.builder().build();
                String md = converter.convert(mainContent.html());
                content.setContentMarkdown(md);
            } catch (Exception e) {
                // Fallback: use plain text
                content.setContentMarkdown(mainContent.text());
            }
        } else {
            content.setContentHtml("");
            content.setContentMarkdown("");
        }

        // If no cover image found, use first image in content
        if (content.getCoverImage() == null && !content.getImageUrls().isEmpty()) {
            content.setCoverImage(content.getImageUrls().get(0));
        }

        return content;
    }

    private String extractTitle(Document doc) {
        // Priority: og:title -> article:title -> <h1> -> <title>
        String ogTitle = doc.select("meta[property=og:title]").attr("content");
        if (ogTitle != null && !ogTitle.isEmpty()) return ogTitle.trim();

        String articleTitle = doc.select("meta[name=article:title]").attr("content");
        if (articleTitle != null && !articleTitle.isEmpty()) return articleTitle.trim();

        Element h1 = doc.selectFirst("h1");
        if (h1 != null && !h1.text().trim().isEmpty()) return h1.text().trim();

        String title = doc.title();
        // Clean up title: remove site name suffix like " - SiteName"
        if (title.contains(" - ")) {
            title = title.substring(0, title.lastIndexOf(" - ")).trim();
        } else if (title.contains(" _ ")) {
            title = title.substring(0, title.lastIndexOf(" _ ")).trim();
        } else if (title.contains(" | ")) {
            title = title.substring(0, title.lastIndexOf(" | ")).trim();
        }
        return title.trim();
    }

    private String extractAuthor(Document doc) {
        // Priority: meta author -> WeChat nickname -> article:author
        String author = doc.select("meta[name=author]").attr("content");
        if (author != null && !author.isEmpty()) return author.trim();

        // WeChat specific
        Element wxAuthor = doc.selectFirst(".rich_media_meta_nickname, #js_name, .profile_nickname");
        if (wxAuthor != null && !wxAuthor.text().trim().isEmpty()) return wxAuthor.text().trim();

        String articleAuthor = doc.select("meta[property=article:author]").attr("content");
        if (articleAuthor != null && !articleAuthor.isEmpty()) return articleAuthor.trim();

        return null;
    }

    public String detectSourceName(String url) {
        if (url.contains("mp.weixin.qq.com")) return "微信公众号";
        if (url.contains("juejin.cn")) return "掘金";
        if (url.contains("csdn.net")) return "CSDN";
        if (url.contains("zhihu.com")) return "知乎";
        if (url.contains("jianshu.com")) return "简书";
        if (url.contains("cnblogs.com")) return "博客园";
        if (url.contains("segmentfault.com")) return "SegmentFault";
        if (url.contains("infoq.cn")) return "InfoQ";
        if (url.contains("toutiao.com")) return "头条";
        if (url.contains("36kr.com")) return "36氪";

        // Fallback: extract domain
        try {
            return new URL(url).getHost();
        } catch (MalformedURLException e) {
            return "未知来源";
        }
    }

    private String extractCoverImage(Document doc, String baseUrl) {
        // Priority: og:image -> twitter:image -> first large image
        String ogImage = doc.select("meta[property=og:image]").attr("content");
        if (ogImage != null && !ogImage.isEmpty()) return toAbsoluteUrl(ogImage, baseUrl);

        String twitterImage = doc.select("meta[name=twitter:image]").attr("content");
        if (twitterImage != null && !twitterImage.isEmpty()) return toAbsoluteUrl(twitterImage, baseUrl);

        return null;
    }

    private Element extractMainContent(Document doc) {
        // 1. WeChat: #js_content
        Element wx = doc.selectFirst("#js_content");
        if (wx != null) return wx;

        // 2. <article> tag
        Element article = doc.selectFirst("article");
        if (article != null) return article;

        // 3. Common content selectors
        String[] selectors = {
            ".article-content", ".post-content", ".entry-content",
            ".article_content", ".article-body", ".post-body",
            "#content", ".content", ".rich_media_content",
            ".markdown-body", ".article-detail"
        };
        for (String sel : selectors) {
            Element el = doc.selectFirst(sel);
            if (el != null && el.text().length() > 100) return el;
        }

        // 4. Fallback: find the element with most text
        Element body = doc.body();
        if (body == null) return null;

        Element best = null;
        int bestLen = 0;
        for (Element div : body.select("div, section, main")) {
            int textLen = div.text().length();
            // Prefer elements with more text but fewer child divs (less likely to be a container)
            int childDivs = div.select("div").size();
            int score = textLen - childDivs * 50;
            if (score > bestLen && textLen > 200) {
                bestLen = score;
                best = div;
            }
        }
        return best;
    }

    private String getImgSrc(Element img) {
        // Try data-src first (lazy loading, common in WeChat)
        String src = img.attr("data-src");
        if (src != null && !src.isEmpty()) return src;

        src = img.attr("data-lazy-src");
        if (src != null && !src.isEmpty()) return src;

        src = img.attr("data-original");
        if (src != null && !src.isEmpty()) return src;

        src = img.attr("src");
        if (src != null && !src.isEmpty()) return src;

        return null;
    }

    private List<String> collectImageUrls(Element content, String baseUrl) {
        Set<String> urls = new LinkedHashSet<>();
        for (Element img : content.select("img")) {
            String src = getImgSrc(img);
            if (src != null && !src.isEmpty()) {
                String absUrl = toAbsoluteUrl(src, baseUrl);
                if (absUrl != null && absUrl.startsWith("http")) {
                    urls.add(absUrl);
                }
            }
        }
        // Also find images in background-image styles
        for (Element el : content.select("[style]")) {
            String style = el.attr("style");
            Matcher m = IMG_PATTERN.matcher(style);
            while (m.find()) {
                urls.add(m.group());
            }
        }
        return new ArrayList<>(urls);
    }

    private String toAbsoluteUrl(String url, String baseUrl) {
        if (url == null || url.isEmpty()) return null;
        if (url.startsWith("data:")) return url;
        try {
            return new URL(new URL(baseUrl), url).toString();
        } catch (MalformedURLException e) {
            return url;
        }
    }
}
