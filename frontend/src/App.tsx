import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import AdminLayout from './components/Layout/AdminLayout';
import Home from './pages/Home';
import ArticleList from './pages/ArticleList';
import ArticleDetail from './pages/ArticleDetail';
import CategoryArticles from './pages/CategoryArticles';
import TagArticles from './pages/TagArticles';
import Archive from './pages/Archive';
import About from './pages/About';
import Search from './pages/Search';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ArticleManage from './pages/admin/ArticleManage';
import ArticleEditor from './pages/admin/ArticleEditor';
import CategoryManage from './pages/admin/CategoryManage';
import TagManage from './pages/admin/TagManage';
import SiteConfig from './pages/admin/SiteConfig';
import ProtectedRoute from './components/Admin/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/category/:slug" element={<CategoryArticles />} />
        <Route path="/tag/:slug" element={<TagArticles />} />
        <Route path="/archives" element={<Archive />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Search />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="articles" element={<ArticleManage />} />
        <Route path="articles/new" element={<ArticleEditor />} />
        <Route path="articles/:id/edit" element={<ArticleEditor />} />
        <Route path="categories" element={<CategoryManage />} />
        <Route path="tags" element={<TagManage />} />
        <Route path="settings" element={<SiteConfig />} />
      </Route>
    </Routes>
  );
}
