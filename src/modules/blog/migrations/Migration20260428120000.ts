import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260428120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table if not exists "post" (
        "id" text not null,
        "title" text not null,
        "excerpt" text not null default '',
        "slug" text not null,
        "content" text not null default '',
        "image" text not null default '',
        "thumbnail" text not null default '',
        "tags" jsonb null,
        "author" text not null default '',
        "category" text not null default '',
        "published_at" timestamptz null,
        "status" text check ("status" in ('draft', 'published')) not null default 'draft',
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "post_pkey" primary key ("id"),
        constraint "post_slug_unique" unique ("slug")
      );
    `)

    this.addSql(`
      create index if not exists "IDX_post_slug"
      on "post" ("slug");
    `)
  }

  override async down(): Promise<void> {
    this.addSql('drop table if exists "post" cascade;')
  }
}