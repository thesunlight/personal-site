import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

export type Lang = 'zh' | 'en';

const en: Record<string, string> = {
  'nav.home': 'Home',
  'nav.articles': 'Articles',
  'nav.archives': 'Archives',
  'nav.about': 'About',
  'common.search': 'Search...',
  'common.copy': 'Copy',
  'common.copied': 'Copied!',
  'common.prev': 'Prev',
  'common.next': 'Next',
  'common.loading': 'Loading...',
  'common.views': 'views',
  'common.words': 'words',
  'common.pinned': 'Pinned',
  'common.categories': 'Categories',
  'common.tags': 'Tags',
  'common.toc': 'Table of Contents',
  'common.edit': 'Edit',
  'common.previous': 'Previous',
  'common.noArticles': 'No articles yet.',
  'home.pinned': 'Pinned',
  'home.latest': 'Latest',
  'articles.title': 'Articles',
  'archive.title': 'Archives',
  'about.title': 'About',
  'search.title': 'Search Results',
  'search.found': 'Found {n} results for "{k}"',
  'search.noResults': 'No results found.',
  'category.noArticles': 'No articles in this category.',
  'tag.title': 'Tag: {name}',
  'tag.noArticles': 'No articles with this tag.',
  'admin.brandSuffix': 'Admin',
  'admin.viewSite': 'View Site',
  'admin.logout': 'Logout',
  'admin.dashboard': 'Dashboard',
  'admin.articles': 'Articles',
  'admin.categories': 'Categories',
  'admin.tags': 'Tags',
  'admin.settings': 'Settings',
  'login.title': 'Admin Login',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.submit': 'Login',
  'login.loggingIn': 'Logging in...',
  'login.failed': 'Login failed',
  'login.timeout': 'Connection timed out, please try again.',
  'login.networkError': 'Network error, please check your connection.',
  'dashboard.title': 'Dashboard',
  'dashboard.totalViews': 'Total Views',
  'dashboard.recentArticles': 'Recent Articles',
  'dashboard.newArticle': 'New Article',
  'dashboard.published': 'Published',
  'dashboard.draft': 'Draft',
  'manage.searchPlaceholder': 'Search articles...',
  'manage.thTitle': 'Title',
  'manage.thCategory': 'Category',
  'manage.thDate': 'Date',
  'manage.thStatus': 'Status',
  'manage.thActions': 'Actions',
  'manage.top': 'Top',
  'manage.unpin': 'Unpin',
  'manage.pin': 'Pin',
  'manage.unpublish': 'Unpublish',
  'manage.publish': 'Publish',
  'manage.delete': 'Delete',
  'manage.deleteConfirm': 'Delete this article?',
  'editor.editTitle': 'Edit Article',
  'editor.newTitle': 'New Article',
  'editor.cancel': 'Cancel',
  'editor.save': 'Save',
  'editor.saving': 'Saving...',
  'editor.titlePlaceholder': 'Article title',
  'editor.slugPlaceholder': 'URL slug',
  'editor.auto': 'Auto',
  'editor.contentPlaceholder': 'Start writing...',
  'editor.selectCategory': 'Select category',
  'editor.summary': 'Summary',
  'editor.summaryPlaceholder': 'Article summary (optional)',
  'editor.published': 'Published',
  'editor.pinned': 'Pinned',
  'editor.saveTimeout': 'Save timed out. Your article was NOT saved. Please try again.',
  'editor.saveNetworkError': 'Network error. Your article was NOT saved. Please try again.',
  'editor.saveFailed': 'Save failed. Please try again.',
  'editor.titleRequired': 'Title is required.',
  'editor.categoryRequired': 'Please select a category.',
  'cm.title': 'Categories',
  'cm.edit': 'Edit Category',
  'cm.new': 'New Category',
  'cm.name': 'Name',
  'cm.slug': 'Slug (URL-friendly)',
  'cm.slugShort': 'Slug',
  'cm.description': 'Description',
  'cm.sortOrder': 'Sort order',
  'cm.update': 'Update',
  'cm.create': 'Create',
  'cm.deleteConfirm': 'Delete?',
  'cm.thArticles': 'Articles',
  'tm.title': 'Tags',
  'tm.edit': 'Edit Tag',
  'tm.new': 'New Tag',
  'settings.title': 'Site Settings',
  'settings.save': 'Save Settings',
  'settings.saved': 'Saved!',
  'settings.saving': 'Saving...',
  'settings.siteTitle': 'Site Title',
  'settings.subtitle': 'Subtitle',
  'settings.description': 'Description (SEO)',
  'settings.keywords': 'Keywords (SEO)',
  'settings.logo': 'Logo URL',
  'settings.footer': 'Footer Text',
  'settings.aboutContent': 'About Page Content (Markdown)',
  'settings.icp': 'ICP Number',
};

const zh: Record<string, string> = {
  'nav.home': '首页',
  'nav.articles': '文章',
  'nav.archives': '归档',
  'nav.about': '关于',
  'common.search': '搜索...',
  'common.copy': '复制',
  'common.copied': '已复制！',
  'common.prev': '上一页',
  'common.next': '下一页',
  'common.loading': '加载中...',
  'common.views': '次阅读',
  'common.words': '字',
  'common.pinned': '置顶',
  'common.categories': '栏目',
  'common.tags': '标签',
  'common.toc': '目录',
  'common.edit': '编辑',
  'common.previous': '上一篇',
  'common.noArticles': '暂无文章。',
  'home.pinned': '置顶',
  'home.latest': '最新',
  'articles.title': '文章',
  'archive.title': '归档',
  'about.title': '关于',
  'search.title': '搜索结果',
  'search.found': '找到 {n} 条与 "{k}" 相关的结果',
  'search.noResults': '未找到相关结果。',
  'category.noArticles': '该栏目下暂无文章。',
  'tag.title': '标签：{name}',
  'tag.noArticles': '该标签下暂无文章。',
  'admin.brandSuffix': '后台',
  'admin.viewSite': '查看站点',
  'admin.logout': '退出登录',
  'admin.dashboard': '仪表盘',
  'admin.articles': '文章',
  'admin.categories': '栏目',
  'admin.tags': '标签',
  'admin.settings': '设置',
  'login.title': '后台登录',
  'login.username': '用户名',
  'login.password': '密码',
  'login.submit': '登录',
  'login.loggingIn': '登录中...',
  'login.failed': '登录失败',
  'login.timeout': '连接超时，请重试。',
  'login.networkError': '网络错误，请检查网络连接。',
  'dashboard.title': '仪表盘',
  'dashboard.totalViews': '总浏览量',
  'dashboard.recentArticles': '最近文章',
  'dashboard.newArticle': '新建文章',
  'dashboard.published': '已发布',
  'dashboard.draft': '草稿',
  'manage.searchPlaceholder': '搜索文章...',
  'manage.thTitle': '标题',
  'manage.thCategory': '栏目',
  'manage.thDate': '日期',
  'manage.thStatus': '状态',
  'manage.thActions': '操作',
  'manage.top': '顶',
  'manage.unpin': '取消置顶',
  'manage.pin': '置顶',
  'manage.unpublish': '取消发布',
  'manage.publish': '发布',
  'manage.delete': '删除',
  'manage.deleteConfirm': '确定删除这篇文章？',
  'editor.editTitle': '编辑文章',
  'editor.newTitle': '新建文章',
  'editor.cancel': '取消',
  'editor.save': '保存',
  'editor.saving': '保存中...',
  'editor.titlePlaceholder': '文章标题',
  'editor.slugPlaceholder': 'URL 别名',
  'editor.auto': '自动',
  'editor.contentPlaceholder': '开始写作...',
  'editor.selectCategory': '选择栏目',
  'editor.summary': '摘要',
  'editor.summaryPlaceholder': '文章摘要（可选）',
  'editor.published': '发布',
  'editor.pinned': '置顶',
  'editor.saveTimeout': '保存超时，文章未保存。请重试。',
  'editor.saveNetworkError': '网络错误，文章未保存。请重试。',
  'editor.saveFailed': '保存失败，请重试。',
  'editor.titleRequired': '请输入文章标题。',
  'editor.categoryRequired': '请选择栏目。',
  'cm.title': '栏目管理',
  'cm.edit': '编辑栏目',
  'cm.new': '新建栏目',
  'cm.name': '名称',
  'cm.slug': '别名（URL友好）',
  'cm.slugShort': '别名',
  'cm.description': '描述',
  'cm.sortOrder': '排序',
  'cm.update': '更新',
  'cm.create': '创建',
  'cm.deleteConfirm': '确定删除？',
  'cm.thArticles': '文章数',
  'tm.title': '标签管理',
  'tm.edit': '编辑标签',
  'tm.new': '新建标签',
  'settings.title': '站点设置',
  'settings.save': '保存设置',
  'settings.saved': '已保存！',
  'settings.saving': '保存中...',
  'settings.siteTitle': '站点标题',
  'settings.subtitle': '副标题',
  'settings.description': '描述（SEO）',
  'settings.keywords': '关键词（SEO）',
  'settings.logo': 'Logo 地址',
  'settings.footer': '页脚文字',
  'settings.aboutContent': '关于页内容（Markdown）',
  'settings.icp': '备案号',
};

const dictionaries: Record<Lang, Record<string, string>> = { en, zh };

function translate(lang: Lang, key: string, params?: Record<string, string | number>): string {
  let text: string = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.split(`{${k}}`).join(String(v));
    }
  }
  return text;
}

export function getMonthNames(lang: Lang): string[] {
  return lang === 'zh'
    ? ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
}

interface I18nContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('site-lang');
    if (saved === 'zh' || saved === 'en') return saved;
    return navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('site-lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  const toggleLang = useCallback(() => setLang(l => (l === 'zh' ? 'en' : 'zh')), []);
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(lang, key, params),
    [lang]
  );

  return <I18nContext.Provider value={{ lang, toggleLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
