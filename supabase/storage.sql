-- Run this ONCE in Supabase Dashboard → SQL Editor.
-- Creates the private bucket where uploaded product PDFs live, enforces
-- max size (5MB) and allowed MIME type (PDF only). The signed-upload-url
-- API route uses the service role so no extra storage RLS policy is needed.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assessment-docs',
  'assessment-docs',
  false,
  5242880,                                -- 5 MB
  array['application/pdf']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types,
  public = false;
