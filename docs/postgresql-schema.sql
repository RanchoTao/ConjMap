-- DESIGN ONLY: not executed. Future self-hosted PostgreSQL adapter mapping.
-- Authentication, authorization and migrations must be designed before shared hosting.
create table problems (
 id text primary key, title text not null, statement text not null, latex text,
 field text not null, msc text[] not null,
 status text not null default 'unknown' check(status in ('open','partially_resolved','solved','disputed','unknown')),
 review_status text not null default 'unverified' check(review_status in ('unverified','reviewed','rejected')),
 proposed_by text, proposed_year integer, last_verified date, difficulty_estimate text,
 provenance jsonb not null, formal_statement text, source_title text,
 check(status='unknown' or (review_status='reviewed' and last_verified is not null))
);
create table sources(id text primary key, name text not null, url text not null, license text, audit jsonb not null);
create table problem_sources(problem_id text references problems(id),source_id text references sources(id),external_id text not null,url text not null,primary key(source_id,external_id));
create table aliases(problem_id text references problems(id),alias text not null,primary key(problem_id,alias));
create table status_evidence(id bigint generated always as identity primary key,problem_id text references problems(id),url text not null,claim text not null,accessed_at date not null,review_status text not null);
create table problem_references(id bigint generated always as identity primary key,problem_id text references problems(id),title text not null,url text not null);
create table relationships(
 source_id text references problems(id), target_id text references problems(id),
 type text check(type in ('implies','equivalent','generalizes','special_case_of','depends_on','related_to')),
 evidence_url text not null,evidence_urls text[] not null,basis text not null,
 review_status text not null default 'unverified',review_date date,
 primary key(source_id,target_id,type),check(source_id<>target_id),
 check(review_status<>'reviewed' or review_date is not null)
);
-- Normalize symmetric endpoints on write in a future migration before enabling imports.
create table research_tasks(
 id uuid primary key,problem_id text references problems(id),api_version text not null,
 engine text not null,objective text not null,is_mock boolean not null,
 status text not null,created_at timestamptz not null,updated_at timestamptz not null
);
create table research_attempts(
 id bigint generated always as identity primary key,problem_id text references problems(id),
 engine text not null,run_id uuid references research_tasks(id),timestamp timestamptz not null,
 hypothesis text not null,method text not null,result text not null,
 verification_status text not null,artifact_urls text[] not null,kind text not null,is_mock boolean not null,
 check(not is_mock or verification_status='unverified')
);
create index problems_field_status on problems(field,status);
create index tasks_problem_created on research_tasks(problem_id,created_at desc);
