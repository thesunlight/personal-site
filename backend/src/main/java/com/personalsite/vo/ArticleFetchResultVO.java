package com.personalsite.vo;

import lombok.Data;
import java.util.List;

@Data
public class ArticleFetchResultVO {
    private String title;
    private String content;         // Markdown content
    private String summary;
    private String author;
    private String sourceName;
    private String coverImage;
    private String sourceUrl;
    private List<String> images;    // original image URLs found in content
    private int downloadedImages;   // number of images downloaded to local
}
