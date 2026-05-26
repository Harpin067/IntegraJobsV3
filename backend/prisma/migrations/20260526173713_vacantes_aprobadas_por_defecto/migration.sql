-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'EMPRESA', 'CANDIDATO');

-- CreateEnum
CREATE TYPE "TipoTrabajo" AS ENUM ('presencial', 'remoto', 'hibrido');

-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('completo', 'medio', 'temporal', 'freelance');

-- CreateEnum
CREATE TYPE "Experiencia" AS ENUM ('junior', 'mid', 'senior', 'lead');

-- CreateEnum
CREATE TYPE "VacancyStatus" AS ENUM ('activa', 'pausada', 'cerrada', 'rechazada');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('nuevo', 'en_proceso', 'rechazado', 'contratado');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('articulo', 'tutorial', 'video');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CANDIDATO',
    "nombre" TEXT,
    "apellidos" TEXT,
    "telefono" TEXT,
    "avatar_url" TEXT,
    "cv_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "logo_url" TEXT,
    "sitio_web" TEXT,
    "ubicacion" TEXT NOT NULL,
    "industria" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacancies" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "requisitos" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "tipo_trabajo" "TipoTrabajo" NOT NULL,
    "tipo_contrato" "TipoContrato" NOT NULL,
    "salario_min" DECIMAL(65,30),
    "salario_max" DECIMAL(65,30),
    "experiencia" "Experiencia" NOT NULL,
    "contacto" TEXT NOT NULL,
    "status" "VacancyStatus" NOT NULL DEFAULT 'activa',
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacancies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "vacancy_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'nuevo',
    "cv_snapshot" TEXT NOT NULL,
    "mensaje" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "ubicacion" TEXT,
    "tipo_trabajo" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_categories" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_threads" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forum_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forum_replies" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" "ResourceType" NOT NULL,
    "url" TEXT,
    "imagen_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "companies_user_id_key" ON "companies"("user_id");

-- CreateIndex
CREATE INDEX "vacancies_status_is_approved_idx" ON "vacancies"("status", "is_approved");

-- CreateIndex
CREATE INDEX "vacancies_company_id_idx" ON "vacancies"("company_id");

-- CreateIndex
CREATE INDEX "vacancies_created_at_idx" ON "vacancies"("created_at" DESC);

-- CreateIndex
CREATE INDEX "vacancies_tipo_trabajo_idx" ON "vacancies"("tipo_trabajo");

-- CreateIndex
CREATE INDEX "vacancies_experiencia_idx" ON "vacancies"("experiencia");

-- CreateIndex
CREATE INDEX "applications_user_id_idx" ON "applications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_vacancy_id_user_id_key" ON "applications"("vacancy_id", "user_id");

-- CreateIndex
CREATE INDEX "reviews_company_id_is_approved_idx" ON "reviews"("company_id", "is_approved");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_company_id_key" ON "reviews"("user_id", "company_id");

-- CreateIndex
CREATE INDEX "alerts_user_id_idx" ON "alerts"("user_id");

-- CreateIndex
CREATE INDEX "forum_threads_category_id_is_approved_idx" ON "forum_threads"("category_id", "is_approved");

-- CreateIndex
CREATE INDEX "forum_threads_created_at_idx" ON "forum_threads"("created_at" DESC);

-- CreateIndex
CREATE INDEX "forum_replies_thread_id_idx" ON "forum_replies"("thread_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "resources_tipo_is_published_idx" ON "resources"("tipo", "is_published");

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_vacancy_id_fkey" FOREIGN KEY ("vacancy_id") REFERENCES "vacancies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "forum_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_threads" ADD CONSTRAINT "forum_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "forum_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forum_replies" ADD CONSTRAINT "forum_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
