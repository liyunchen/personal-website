import { useCallback, useEffect, useState } from 'react'
import Nav from './components/Nav'
import Home from './pages/Home'
import Experience from './pages/Experience'
import Projects from './pages/Projects'
import AISkills from './pages/AISkills'
import Honors from './pages/Honors'
import Blog from './pages/Blog'
import BlogDetail from './pages/BlogDetail'
import Admin from './admin/Admin'
import { useSiteContent, sortByOrder } from './hooks/useSiteContent'
import './styles/globals.css'

type Page =
  | 'home'
  | 'experience'
  | 'projects'
  | 'ai'
  | 'honors'
  | 'blog'
  | 'blog-detail'
  | 'admin'

export default function App() {
  const { content, loading } = useSiteContent()
  const [currentPage, setCurrentPage] = useState<Page>(() =>
    window.location.hash === '#/admin' ? 'admin' : 'home'
  )
  const [openPostId, setOpenPostId] = useState<string | null>(null)

  const navigate = useCallback((page: string) => {
    const p = page as Page
    setCurrentPage(p)
    if (p === 'admin') {
      window.location.hash = '#/admin'
    } else {
      if (window.location.hash) history.replaceState(null, '', window.location.pathname)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  // 支持浏览器前进/后退
  useEffect(() => {
    const onHash = () => {
      setCurrentPage(window.location.hash === '#/admin' ? 'admin' : 'home')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const openPost = useCallback(
    (id: string) => {
      setOpenPostId(id)
      setCurrentPage('blog-detail')
      window.scrollTo({ top: 0 })
    },
    []
  )

  const scrollContact = useCallback(() => {
    setCurrentPage('home')
    setTimeout(() => {
      document.getElementById('connectHub')?.scrollIntoView({ behavior: 'smooth' })
    }, 60)
  }, [])

  if (currentPage === 'admin') {
    return <Admin onExit={() => navigate('home')} />
  }

  // 兜底：内容未就绪时也渲染骨架，不白屏
  if (loading || !content) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          <div className="loader" />
          <div style={{ marginTop: 12 }}>加载中…</div>
        </div>
      </div>
    )
  }

  const openPost_ = content.posts.find(p => p.id === openPostId) ?? content.posts[0]
  const related = sortByOrder(content.posts)
    .filter(p => p.id !== openPost_?.id)
    .slice(0, 3)
  const navPage = currentPage === 'blog-detail' ? 'blog' : currentPage

  return (
    <div className="page-root">
      <Nav currentPage={navPage} onNavigate={navigate} />

      {currentPage === 'home' && (
        <Home content={content} onNavigate={navigate} onScrollContact={scrollContact} />
      )}
      {currentPage === 'experience' && (
        <Experience experiences={content.experiences} abilities={content.abilities} />
      )}
      {currentPage === 'projects' && <Projects projects={content.projects} />}
      {currentPage === 'ai' && <AISkills skills={content.aiSkills} />}
      {currentPage === 'honors' && <Honors honors={content.honors} />}
      {currentPage === 'blog' && <Blog posts={content.posts} onOpen={openPost} />}
      {currentPage === 'blog-detail' && openPost_ && (
        <BlogDetail post={openPost_} related={related} onBack={() => navigate('blog')} />
      )}

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} {content.profile.name}</span>
      </footer>
    </div>
  )
}