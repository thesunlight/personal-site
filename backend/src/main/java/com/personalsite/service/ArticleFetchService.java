package com.personalsite.service;

import com.personalsite.dto.ArticleFetchDTO;
import com.personalsite.vo.ArticleFetchResultVO;
import com.personalsite.vo.ArticleVO;

public interface ArticleFetchService {

    /**
     * Fetch and parse an article URL, return preview result (images not yet downloaded)
     */
    ArticleFetchResultVO fetchAndParse(String url);

    /**
     * Download images in content to local, replace URLs, and save as article
     */
    ArticleVO downloadImagesAndSave(ArticleFetchResultVO fetchResult, Long categoryId, Integer status, Long authorId);
}
