import { useEffect } from 'react'

/**
 * 设置浏览器标签页标题（本地化由调用方 t() 完成）。
 * 卸载时恢复进入前的标题，避免路由切换后残留旧标题。
 */
export function usePageTitle(title: string | undefined): void {
  useEffect(() => {
    if (!title) return
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
