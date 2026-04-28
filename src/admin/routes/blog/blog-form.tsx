import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { Heading } from "@medusajs/ui"
import { sdk } from "../../lib/sdk"

export type BlogPostFormValues = {
  title: string
  excerpt: string
  slug: string
  content: string
  image: string
  author: string
  category: string
  date: string
  status: "draft" | "published"
}

type BlogFormProps = {
  initialValues?: Partial<BlogPostFormValues>
  submitLabel: string
  onSubmit: (values: BlogPostFormValues) => Promise<void>
  isSubmitting?: boolean
  onDelete?: () => Promise<void>
  deleteLabel?: string
  isDeleting?: boolean
}

const defaultValues: BlogPostFormValues = {
  title: "",
  excerpt: "",
  slug: "",
  content: "",
  image: "",
  author: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  status: "draft",
}

const mergeValues = (values?: Partial<BlogPostFormValues>): BlogPostFormValues => ({
  ...defaultValues,
  ...values,
})

const BlogForm = ({
  initialValues,
  submitLabel,
  onSubmit,
  isSubmitting = false,
  onDelete,
  deleteLabel = "Delete post",
  isDeleting = false,
}: BlogFormProps) => {
  const [values, setValues] = useState<BlogPostFormValues>(mergeValues(initialValues))
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadingField, setUploadingField] = useState<"image" | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValues(mergeValues(initialValues))
  }, [initialValues])

  const updateField = (field: keyof BlogPostFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))
    setSuccess(null)
  }

  const uploadImage = async (file: File) => {
    const response = await sdk.admin.upload.create({
      files: [file],
    })

    const uploadedFile = response.files[0]

    if (!uploadedFile?.url) {
      throw new Error("Upload did not return a file URL.")
    }

    return uploadedFile.url
  }

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>,
    field: "image"
  ) => {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file) {
      return
    }

    setError(null)
    setUploadingField(field)

    try {
      const url = await uploadImage(file)
      updateField(field, url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload image.")
    } finally {
      setUploadingField(null)
      input.value = ""
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      await onSubmit(values)
      setSuccess("Post saved successfully.")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to save the post.")
    }
  }

  return (
    <div className="p-6">
      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Heading level="h2">Post Details</Heading>
          <p className="text-sm text-ui-fg-subtle">
            Manage the blog post content, publishing state, and image assets from one place.
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-ui-fg-error bg-ui-bg-error px-4 py-3 text-sm text-ui-fg-error">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-md border border-ui-fg-success bg-ui-bg-success px-4 py-3 text-sm text-ui-fg-success">
            {success}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Title</span>
            <input
              className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none transition focus:border-ui-border-interactive"
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Slug</span>
            <input
              className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none transition focus:border-ui-border-interactive"
              value={values.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              placeholder="post-slug"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Author</span>
            <input
              className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none transition focus:border-ui-border-interactive"
              value={values.author}
              onChange={(event) => updateField("author", event.target.value)}
              placeholder="Admin User"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Category</span>
            <input
              className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none transition focus:border-ui-border-interactive"
              value={values.category}
              onChange={(event) => updateField("category", event.target.value)}
              placeholder="Announcements"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Publish Date</span>
            <input
              type="date"
              className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none transition focus:border-ui-border-interactive"
              value={values.date}
              onChange={(event) => updateField("date", event.target.value)}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium">Status</span>
            <select
              className="w-full rounded-md border border-ui-border-base px-3 py-2 text-sm outline-none transition focus:border-ui-border-interactive"
              value={values.status}
              onChange={(event) => updateField("status", event.target.value as BlogPostFormValues["status"])}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-sm font-medium">Excerpt</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none transition focus:border-ui-border-interactive"
            value={values.excerpt}
            onChange={(event) => updateField("excerpt", event.target.value)}
            placeholder="Short summary for cards and SEO"
          />
        </label>

        <label className="space-y-2 block">
          <span className="text-sm font-medium">Content</span>
          <textarea
            className="min-h-64 w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none transition focus:border-ui-border-interactive"
            value={values.content}
            onChange={(event) => updateField("content", event.target.value)}
            placeholder="Write the full blog post content here."
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium">Featured Image URL</span>
            <input
              className="w-full rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm outline-none transition focus:border-ui-border-interactive"
              value={values.image}
              onChange={(event) => updateField("image", event.target.value)}
              placeholder="https://..."
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (event) => handleFileChange(event, "image")}
            />
            <button
              type="button"
              className="rounded-md border border-ui-border-base px-3 py-2 text-sm font-medium"
              onClick={() => imageInputRef.current?.click()}
            >
              {uploadingField === "image" ? "Uploading..." : "Upload image"}
            </button>
          </label>

        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-ui-bg-interactive px-4 py-2 text-sm font-medium text-ui-fg-on-inverted disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving changes..." : submitLabel}
          </button>

          {onDelete ? (
            <button
              type="button"
              className="rounded-md border border-ui-border-base px-4 py-2 text-sm font-medium text-ui-fg-error disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : deleteLabel}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  )
}

export default BlogForm