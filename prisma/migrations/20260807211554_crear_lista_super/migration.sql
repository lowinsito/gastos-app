-- CreateTable
CREATE TABLE "ItemLista" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "comprado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemLista_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemLista_comprado_creadoEn_idx" ON "ItemLista"("comprado", "creadoEn");
