-- CreateTable
CREATE TABLE "TicketSorteo" (
    "id" SERIAL NOT NULL,
    "descripcionSorteo" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "fechaFinal" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketSorteo_pkey" PRIMARY KEY ("id")
);
