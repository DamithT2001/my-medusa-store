import { Container, Heading } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate, useParams } from "react-router-dom"
import BlogForm, { BlogPostFormValues } from "../blog-form"
import { sdk } from "../../../lib/sdk"

type BlogPost = BlogPostFormValues & {
  id: string
  created_at?: string
  updated_at?: string
}

type BlogPostResponse = {
  post: BlogPost
}

const BlogEditPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ["blog-post", id],
    queryFn: () => sdk.client.fetch<BlogPostResponse>(`/admin/blog/${id}`),
    enabled: Boolean(id),
  })

  const saveMutation = useMutation({
    mutationFn: (values: BlogPostFormValues) =>
      sdk.client.fetch<BlogPostResponse>(`/admin/blog/${id}`, {
        method: "PATCH",
        body: values,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blog-posts"] })
      await queryClient.invalidateQueries({ queryKey: ["blog-post", id] })
      await navigate("/blog")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => sdk.client.fetch(`/admin/blog/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blog-posts"] })
      await navigate("/blog")
    },
  })

  if (!id) {
    return (
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2">Missing post id</Heading>
        </div>
      </Container>
    )
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ui-border-base px-6 py-4">
        <div>
          <Heading level="h2">Edit Blog Post</Heading>
          <p className="text-sm text-ui-fg-subtle pt-2">Update content, images, and publishing metadata.</p>
        </div>

        <Link to="/blog" className="text-sm font-medium text-ui-fg-interactive">
          Back to blog
        </Link>
      </div>

      <div className="p-6">
        {isLoading ? <p className="text-sm text-ui-fg-subtle">Loading post...</p> : null}
        {error ? <p className="text-sm text-ui-fg-error">Failed to load this post.</p> : null}
      </div>

      {data?.post ? (
        <BlogForm
          initialValues={data.post}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await saveMutation.mutateAsync(values)
          }}
          isSubmitting={saveMutation.isPending}
          onDelete={async () => {
            const shouldDelete = window.confirm(`Delete \"${data.post.title}\"?`)

            if (shouldDelete) {
              await deleteMutation.mutateAsync()
            }
          }}
          deleteLabel="Delete post"
          isDeleting={deleteMutation.isPending}
        />
      ) : null}
    </Container>
  )
}

export default BlogEditPage