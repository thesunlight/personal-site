-- V3: Add source fields for article collection (好文收录)
ALTER TABLE article
  ADD COLUMN source_url    VARCHAR(1000) DEFAULT NULL COMMENT '原文链接URL' AFTER cover_image,
  ADD COLUMN source_name   VARCHAR(200)  DEFAULT NULL COMMENT '来源名称（如：微信公众号、掘金）' AFTER source_url,
  ADD COLUMN source_author VARCHAR(200)  DEFAULT NULL COMMENT '原文作者' AFTER source_name;

ALTER TABLE article ADD INDEX idx_source_url (source_url(255));
