-- V4: Knowledge base tables (文档知识库)

-- Knowledge base projects (open source docs repos)
CREATE TABLE IF NOT EXISTS kb_project (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL COMMENT '项目名称',
    slug         VARCHAR(80)  NOT NULL COMMENT 'URL slug',
    github_repo  VARCHAR(200) DEFAULT NULL COMMENT 'GitHub仓库 (e.g., langchain-ai/langchain)',
    docs_path    VARCHAR(200) DEFAULT 'docs/' COMMENT '文档目录路径',
    branch       VARCHAR(50)  DEFAULT 'main' COMMENT '分支名',
    description  VARCHAR(500) DEFAULT NULL COMMENT '项目描述',
    logo_url     VARCHAR(500) DEFAULT NULL COMMENT '项目Logo URL',
    source_url   VARCHAR(300) DEFAULT NULL COMMENT '官方文档URL',
    doc_count    INT          NOT NULL DEFAULT 0 COMMENT '文档数量',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Knowledge base documents
CREATE TABLE IF NOT EXISTS kb_document (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id   BIGINT       NOT NULL,
    title        VARCHAR(300) NOT NULL,
    slug         VARCHAR(250) NOT NULL COMMENT 'URL slug',
    path         VARCHAR(500) DEFAULT NULL COMMENT '文件在仓库中的路径',
    content      LONGTEXT     DEFAULT NULL COMMENT '原始Markdown内容',
    content_zh   LONGTEXT     DEFAULT NULL COMMENT '中文翻译内容',
    summary      VARCHAR(500) DEFAULT NULL,
    parent_id    BIGINT       DEFAULT NULL COMMENT '父文档ID (用于目录层级)',
    order_index  INT          NOT NULL DEFAULT 0,
    source_url   VARCHAR(500) DEFAULT NULL COMMENT '原文链接',
    word_count   INT          NOT NULL DEFAULT 0,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_project_slug (project_id, slug),
    INDEX idx_project_id (project_id),
    INDEX idx_parent_id (parent_id),
    CONSTRAINT fk_kb_doc_project FOREIGN KEY (project_id) REFERENCES kb_project(id) ON DELETE CASCADE,
    CONSTRAINT fk_kb_doc_parent  FOREIGN KEY (parent_id)  REFERENCES kb_document(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Translation task tracking
CREATE TABLE IF NOT EXISTS kb_translation (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id  BIGINT       NOT NULL,
    model        VARCHAR(50)  NOT NULL DEFAULT 'deepseek-chat',
    status       VARCHAR(20)  NOT NULL DEFAULT 'pending' COMMENT 'pending/translating/done/failed',
    error_msg    VARCHAR(500) DEFAULT NULL,
    token_count  INT          DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME     DEFAULT NULL,
    INDEX idx_document_id (document_id),
    INDEX idx_status (status),
    CONSTRAINT fk_kb_trans_doc FOREIGN KEY (document_id) REFERENCES kb_document(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
