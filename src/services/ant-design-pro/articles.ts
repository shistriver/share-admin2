import { request } from '@umijs/max';

/** 获取文章列表接口 GET /api/articles */
export async function getArticleList(params: {
  current?: number;
  pageSize?: number;
  [key: string]: any;
}) {
  return request<{
    data: API.ArticleListItem[];
    total: number;
    success: boolean;
  }>('/api/articles', {
    method: 'GET',
    params,
  });
}

/** 发布文章接口 POST /api/articles */
export async function addArticles(body: API.ArticleParams) {
  return request<Record<string, any>>('/api/articles', {
    method: 'POST',
    data: body,
  });
}

/** 根据ID获取文章接口 GET /api/articles/:id */
export async function getArticle(id: String) {
  return request<Record<string, any>>(`/api/articles/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** 编辑文章接口 POST /api/articles/:id */
export async function editeArticles(id: String, body: API.ArticleParams, options?: { [key: string]: any }) {
  return request<Record<string, any>>(`/api/articles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 根据ID删除文章接口 GET /api/articles/:id */
export async function delArticle(id: number) {
  return request<Record<string, any>>(`/api/articles/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}