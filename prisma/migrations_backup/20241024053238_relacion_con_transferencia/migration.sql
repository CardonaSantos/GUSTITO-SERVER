-- AddForeignKey
ALTER TABLE "TransferenciaProducto" ADD CONSTRAINT "TransferenciaProducto_sucursalDestinoId_fkey" FOREIGN KEY ("sucursalDestinoId") REFERENCES "Sucursal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
