-- V1__init_schema.sql
-- Personal Site initial schema

CREATE TABLE IF NOT EXISTS admin (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL,
    password    VARCHAR(255) NOT NULL,
    nickname    VARCHAR(50)  NOT NULL,
    avatar      VARCHAR(500) DEFAULT NULL,
    email       VARCHAR(100) DEFAULT NULL,
    status      TINYINT      NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL,
    slug        VARCHAR(80)  NOT NULL,
    description VARCHAR(300) DEFAULT NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    slug         VARCHAR(250) NOT NULL,
    summary      VARCHAR(500) DEFAULT NULL,
    content      LONGTEXT     NOT NULL,
    cover_image  VARCHAR(500) DEFAULT NULL,
    category_id  BIGINT       NOT NULL,
    author_id    BIGINT       NOT NULL,
    status       TINYINT      NOT NULL DEFAULT 1 COMMENT '1=published 0=draft',
    is_top       TINYINT      NOT NULL DEFAULT 0 COMMENT '1=top 0=normal',
    view_count   INT          NOT NULL DEFAULT 0,
    word_count   INT          NOT NULL DEFAULT 0,
    published_at DATETIME     DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_slug (slug),
    INDEX idx_category_id (category_id),
    INDEX idx_status_published (status, published_at DESC),
    INDEX idx_is_top (is_top),
    CONSTRAINT fk_article_category FOREIGN KEY (category_id) REFERENCES category(id),
    CONSTRAINT fk_article_author   FOREIGN KEY (author_id)   REFERENCES admin(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tag (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(30) NOT NULL,
    slug       VARCHAR(50) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_slug (slug),
    UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_tag (
    article_id BIGINT NOT NULL,
    tag_id     BIGINT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    INDEX idx_tag_id (tag_id),
    CONSTRAINT fk_at_article FOREIGN KEY (article_id) REFERENCES article(id) ON DELETE CASCADE,
    CONSTRAINT fk_at_tag     FOREIGN KEY (tag_id)     REFERENCES tag(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_config (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key   VARCHAR(100) NOT NULL,
    config_value TEXT         DEFAULT NULL,
    description  VARCHAR(200) DEFAULT NULL,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin: admin / admin123 (BCrypt encoded)
INSERT INTO admin (username, password, nickname, email) VALUES
('admin', '$2a$10$1dj3C8KHzuxlCC/kmJUKH.oBvdcTU1EBTdQ9Y/yoNDeNow9mcK..e', 'Admin', 'admin@huangml.com');

-- Default site configs
INSERT INTO site_config (config_key, config_value, description) VALUES
('site_title', 'HuangML', 'Site title'),
('site_subtitle', 'Tech / Life / Thoughts', 'Site subtitle'),
('site_description', 'A personal blog sharing tech and life', 'SEO description'),
('site_keywords', 'blog,tech,life,personal', 'SEO keywords'),
('site_logo', '', 'Logo URL'),
('site_footer', '© 2026 HuangML. All Rights Reserved', 'Footer text'),
('about_content', '## About Me\n\nWelcome to my personal site!', 'About page markdown content'),
('icp_number', '', 'ICP number');

-- Default categories
INSERT INTO category (name, slug, description, sort_order) VALUES
('Tech Notes', 'tech-notes', 'Technical articles and learning notes', 10),
('Life Essays', 'life-essays', 'Life thoughts and daily sharing', 5);
