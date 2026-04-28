import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { sdk } from "../../lib/sdk"

type BlogPost = {
  id: string
  title: string
  excerpt: string
  slug: string
  content: string
  image: string
  author: string
  category: string
  date: string
  status: "draft" | "published"
  created_at?: string
  updated_at?: string
}

type BlogPostsResponse = {
  posts: BlogPost[]
}

const BlogListPage = () => {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => sdk.client.fetch<BlogPostsResponse>("/admin/blog"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sdk.client.fetch(`/admin/blog/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blog-posts"] })
    },
  })

  const posts = data?.posts ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ui-border-base px-6 py-4">
        <div>
          <Heading level="h2">Blog</Heading>
          <p className="text-sm text-ui-fg-subtle pt-2">Create, publish, and manage content from Medusa Admin.</p>
        </div>

        <Link
          to="/blog/new"
          className="rounded-md bg-ui-bg-interactive px-4 py-2 text-sm font-medium text-ui-fg-on-inverted"
        >
          New post
        </Link>
      </div>

      <div className="p-6">
        {isLoading ? <p className="text-sm text-ui-fg-subtle">Loading posts...</p> : null}
        {error ? <p className="text-sm text-ui-fg-error">Failed to load posts.</p> : null}

        {!isLoading && !error ? (
          posts.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-ui-border-base">
              <table className="w-full divide-y divide-ui-border-base text-left text-sm">
                <thead className="bg-ui-bg-subtle">
                  <tr>
                    <th className="px-4 py-3 font-medium">Post</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Meta</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ui-border-base bg-ui-bg-base">
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          {post.image ? (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-ui-bg-subtle" />
                          )}
                          <div className="space-y-1">
                            <div className="font-medium text-ui-fg-base">{post.title}</div>
                            <div className="text-xs text-ui-fg-subtle">/{post.slug}</div>
                            <p className="max-w-xl text-xs text-ui-fg-subtle">{post.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full border border-ui-border-base px-2 py-1 text-xs font-medium uppercase tracking-wide">
                          {post.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-ui-fg-subtle">
                        <div>{post.author || "-"}</div>
                        <div>{post.category || "-"}</div>
                      </td>
                      <td className="px-4 py-4 text-xs text-ui-fg-subtle">{post.date || post.created_at || "-"}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/blog/${post.id}`}
                            className="rounded-md border border-ui-border-base px-3 py-2 text-xs font-medium"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="rounded-md border border-ui-border-base px-3 py-2 text-xs font-medium text-ui-fg-error disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => {
                              const shouldDelete = window.confirm(`Delete \"${post.title}\"?`)

                              if (shouldDelete) {
                                deleteMutation.mutate(post.id)
                              }
                            }}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-ui-border-base px-6 py-12 text-center">
              <p className="text-sm text-ui-fg-subtle">No blog posts yet.</p>
              <Link
                to="/blog/new"
                className="mt-4 inline-flex rounded-md bg-ui-bg-interactive px-4 py-2 text-sm font-medium text-ui-fg-on-inverted"
              >
                Create your first post
              </Link>
            </div>
          )
        ) : null}
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Blog",
})

export default BlogListPage