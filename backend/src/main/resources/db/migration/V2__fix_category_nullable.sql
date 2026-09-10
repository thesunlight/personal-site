-- Fix: category_id should be nullable so articles can be saved without a category
ALTER TABLE article MODIFY COLUMN category_id bigint NULL;
