export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  status: number;
  isTop: number;
  viewCount: number;
  wordCount: number;
  publishedAt: string;
  createdAt: string;
  categoryName: string;
  categorySlug: string;
  tags: Tag[];
}

export interface ArticleDetail extends Article {
  content: string;
  categoryId: number;
  sourceAuthor: string | null;
  prevArticle: { id: number; title: string; slug: string } | null;
  nextArticle: { id: number; title: string; slug: string } | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  articleCount: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  articleCount?: number;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

export interface LoginVO {
  token: string;
  admin: AdminVO;
}

export interface AdminVO {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
}

export interface ArchiveYear {
  year: number;
  months: ArchiveMonth[];
}

export interface ArchiveMonth {
  month: number;
  articles: ArchiveItem[];
}

export interface ArchiveItem {
  id: number;
  title: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  publishedAt: string;
}

export interface SiteConfig {
  configs: Record<string, string>;
}

export interface DashboardStats {
  articleCount: number;
  categoryCount: number;
  tagCount: number;
  totalViews: number;
}

export interface ArticleFetchResult {
  title: string;
  content: string;
  summary: string;
  author: string;
  sourceName: string;
  coverImage: string;
  sourceUrl: string;
  images: string[];
  downloadedImages: number;
}

export interface KbProject {
  id: number;
  name: string;
  slug: string;
  githubRepo: string | null;
  description: string | null;
  logoUrl: string | null;
  sourceUrl: string | null;
  docCount: number;
  createdAt: string;
}

export interface KbDocument {
  id: number;
  projectId: number;
  title: string;
  slug: string;
  path: string | null;
  summary: string | null;
  parentId: number | null;
  orderIndex: number;
  sourceUrl: string | null;
  wordCount: number;
  content?: string;
  contentZh?: string;
  children?: KbDocument[];
}
