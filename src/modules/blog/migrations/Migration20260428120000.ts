import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260428120000 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table if not exists "post" ("id" text not null, "title" text not null, "excerpt" text not null default \'\', "slug" text not null, "content" text not null default \'\', "image" text not null default \'\', "thumbnail" text not null default \'\', "author" text not null default \'\', "category" text not null default \'\', "date" text not null default \'\', "status" text not null default \'draft\', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "post_pkey" primary key ("id"));'
    )
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "post" cascade;')
  }
}