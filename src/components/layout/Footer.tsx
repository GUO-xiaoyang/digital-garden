/**
 * 数字花园 · 前台页脚
 */
import { Link } from 'react-router-dom'
import { getProfile } from '../../api/profile'
import { getSettings } from '../../api/settings'

export function Footer() {
  const settings = getSettings()
  const profile = getProfile()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-[14px] font-semibold">{settings.siteName}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-3">{settings.tagline}</p>
            <p className="mt-3 text-[12.5px] text-ink-3">{settings.footerText}</p>
          </div>

          <div className="flex gap-10">
            <div>
              <p className="mb-2.5 text-[12.5px] font-semibold text-ink-2">导航</p>
              <ul className="space-y-1.5 text-[13px] text-ink-3">
                <li>
                  <Link to="/" className="transition-colors hover:text-accent-a">
                    笔记
                  </Link>
                </li>
                <li>
                  <Link to="/tags" className="transition-colors hover:text-accent-a">
                    知识网络
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="transition-colors hover:text-accent-a">
                    项目
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="transition-colors hover:text-accent-a">
                    关于我
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="mb-2.5 text-[12.5px] font-semibold text-ink-2">联系</p>
              <ul className="space-y-1.5 text-[13px] text-ink-3">
                <li>
                  <a href={`mailto:${profile.email}`} className="transition-colors hover:text-accent-a">
                    {profile.email}
                  </a>
                </li>
                {profile.socials.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-accent-a"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link to="/admin" className="transition-colors hover:text-accent-a">
                    后台管理
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-[12.5px] text-ink-3">
          <span>
            © {year} {profile.name} · 保留所有权利
          </span>
          {settings.icp && <span>{settings.icp}</span>}
        </div>
      </div>
    </footer>
  )
}
