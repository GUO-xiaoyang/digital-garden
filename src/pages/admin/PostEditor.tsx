/**
 * 数字花园 · 笔记编辑器（新建 / 编辑共用）
 * zod 校验 + 左写右预览 + 标题自动生成 slug + 标签编辑
 */
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { createPost, getPostById, updatePost } from '../../api/posts'
import { Field } from '../../components/admin/Field'
import { MarkdownEditor } from '../../components/admin/MarkdownEditor'
import { TagInput } from '../../components/admin/TagInput'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useToast } from '../../components/ui/Toast'
import { readingTime } from '../../lib/readingTime'

/** 表单校验规则；类型由 schema 推导，避免两处维护（AGENTS.md 4.3） */
const postSchema = z.object({
  title: z.string().min(2, '标题至少 2 个字').max(80, '标题不超过 80 字'),
  slug: z
    .string()
    .min(1, '请填写 slug')
    .regex(/^[a-z0-9-]+$/, 'slug 只能用小写字母、数字与连字符'),
  summary: z.string().max(160, '摘要不超过 160 字'),
  content: z.string().min(1, '正文不能为空'),
  tags: z.array(z.string()).max(8, '最多 8 个标签'),
  published: z.boolean(),
  pinned: z.boolean(),
})

type PostForm = z.infer<typeof postSchema>

const INPUT =
  'w-full rounded-[10px] border border-line-strong bg-bg px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent-a/60'

/** 中文标题转拼音 slug 不现实，这里用时间戳兜底，用户可手改 */
function fallbackSlug(): string {
  return `note-${Date.now().toString(36)}`
}

export function PostEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const isEdit = Boolean(id)
  const existing = useMemo(() => (id ? getPostById(id) : null), [id])
  const [slugTouched, setSlugTouched] = useState(isEdit)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PostForm>({
    resolver: zodResolver(postSchema),
    defaultValues: existing
      ? {
          title: existing.title,
          slug: existing.slug,
          summary: existing.summary,
          content: existing.content,
          tags: existing.tags,
          published: existing.published,
          pinned: existing.pinned,
        }
      : {
          title: '',
          slug: fallbackSlug(),
          summary: '',
          content: '',
          tags: [],
          published: true,
          pinned: false,
        },
  })

  const title = watch('title')
  const content = watch('content')

  // 新建时标题变化 → 若用户未手动改过 slug，则自动跟随
  useEffect(() => {
    if (isEdit || slugTouched) return
    const latin = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-{2,}/g, '-')
    if (latin.length >= 2) setValue('slug', latin)
  }, [title, isEdit, slugTouched, setValue])

  // 编辑模式下 id 无效
  if (isEdit && !existing) {
    return (
      <Card className="p-6">
        <p className="text-[14px] text-ink-2">这篇笔记不存在，可能已被删除。</p>
        <Button className="mt-4" onClick={() => navigate('/admin/posts')}>
          返回笔记列表
        </Button>
      </Card>
    )
  }

  const onSubmit = (values: PostForm) => {
    try {
      if (isEdit && existing) {
        updatePost(existing.id, values)
        toast.success('笔记已更新，前台立即生效')
      } else {
        createPost(values)
        toast.success('笔记已创建，前台首页立即可见')
      }
      navigate('/admin/posts')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败，请重试')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight">{isEdit ? '编辑笔记' : '写新笔记'}</h1>
          <p className="mt-1.5 text-[13px] text-ink-3">
            正文约 {readingTime(content)} 分钟读完 · 保存后前台立即生效
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate('/admin/posts')}>
            返回列表
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '保存中…' : isEdit ? '保存修改' : '创建笔记'}
          </Button>
        </div>
      </header>

      <Card className="space-y-4 p-5">
        <Field label="标题" htmlFor="title" error={errors.title?.message} required>
          <input
            id="title"
            className={INPUT}
            placeholder="笔记标题"
            {...register('title')}
          />
        </Field>

        <Field
          label="URL 标识（slug）"
          htmlFor="slug"
          error={errors.slug?.message}
          hint="出现在地址栏 /posts/ 后面，只能用小写字母、数字与连字符"
          required
        >
          <input
            id="slug"
            className={INPUT}
            placeholder="redis-cache-penetration"
            {...register('slug', {
              onChange: () => setSlugTouched(true),
            })}
          />
        </Field>

        <Field
          label="摘要"
          htmlFor="summary"
          error={errors.summary?.message}
          hint="显示在列表卡片与详情页顶部，留空则自动截取正文"
        >
          <textarea
            id="summary"
            rows={2}
            className={`${INPUT} resize-y`}
            placeholder="一句话概括这篇笔记讲了什么"
            {...register('summary')}
          />
        </Field>

        <Field label="标签" error={errors.tags?.message} hint="回车添加，最多 8 个；标签会用于知识网络">
          <Controller
            control={control}
            name="tags"
            render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
          />
        </Field>

        <div className="flex flex-wrap gap-5">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-2">
            <input type="checkbox" className="h-4 w-4 accent-[var(--accent-a)]" {...register('published')} />
            立即发布（取消勾选则存为草稿）
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-ink-2">
            <input type="checkbox" className="h-4 w-4 accent-[var(--accent-b)]" {...register('pinned')} />
            在列表置顶
          </label>
        </div>

        <Field label="正文" error={errors.content?.message} hint="支持 Markdown 与代码块高亮" required>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <MarkdownEditor
                value={field.value}
                onChange={field.onChange}
                error={errors.content?.message}
                minHeight={460}
              />
            )}
          />
        </Field>
      </Card>

      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => navigate('/admin/posts')}>
          取消
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? '保存中…' : isEdit ? '保存修改' : '创建笔记'}
        </Button>
      </div>
    </form>
  )
}
