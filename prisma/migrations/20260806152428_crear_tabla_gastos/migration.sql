-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('SUPERMERCADO', 'SERVICIOS', 'COMIDA_AFUERA', 'SALUD', 'OCIO', 'MASCOTAS', 'HOGAR', 'OTROS');

-- CreateTable
CREATE TABLE "Gasto" (
    "id" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "descripcion" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "pusoJose" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pusoCamila" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Gasto_fecha_idx" ON "Gasto"("fecha");

-- CreateIndex
CREATE INDEX "Gasto_categoria_idx" ON "Gasto"("categoria");
