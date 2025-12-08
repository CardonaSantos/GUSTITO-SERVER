/*
  Warnings:

  - Changed the type of `metodoPago` on the `Pago` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'PAYPAL', 'OTRO');

-- AlterTable
ALTER TABLE "Pago" DROP COLUMN "metodoPago",
ADD COLUMN     "metodoPago" "MetodoPago" NOT NULL;
