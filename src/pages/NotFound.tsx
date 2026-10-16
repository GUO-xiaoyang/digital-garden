/**
 * 数字花园 · 404
 */
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="text-[56px] font-extrabold leading-none tracking-tight text-accent-a/30">404</p>
      <h1 className="mt-4 text-[20px] font-bold">这片花园里没有这个页面</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
        链接可能已经失效，或者笔记被重命名了。回首页看看还长了什么。
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/">
          <Button size="lg">回到首页</Button>
        </Link>
        <Link to="/tags">
          <Button size="lg" variant="secondary">
            浏览标签
          </Button>
        </Link>
      </div>
    </div>
  )
}
