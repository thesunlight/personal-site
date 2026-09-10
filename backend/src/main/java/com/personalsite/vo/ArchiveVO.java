package com.personalsite.vo;

import lombok.Data;
import java.util.List;

@Data
public class ArchiveVO {
    private int year;
    private List<MonthArchive> months;

    @Data
    public static class MonthArchive {
        private int month;
        private List<ArchiveItem> articles;
    }

    @Data
    public static class ArchiveItem {
        private Long id;
        private String title;
        private String slug;
        private String categoryName;
        private String categorySlug;
        private String publishedAt;
    }
}
