export interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
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
