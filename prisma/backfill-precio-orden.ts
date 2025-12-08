// prisma/backfill-precio-orden.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando backfill de orden en PrecioProducto...');

  const productos = await prisma.producto.findMany({
    select: { id: true },
  });

  console.log(`📦 Productos encontrados: ${productos.length}`);

  let productosConPrecios = 0;
  let totalPreciosEncontrados = 0;
  let totalPreciosActualizados = 0;
  const errores: { productoId: number; error: unknown }[] = [];

  for (let index = 0; index < productos.length; index++) {
    const producto = productos[index];

    // Solo precios sin orden, para que sea idempotente
    const precios = await prisma.precioProducto.findMany({
      where: {
        productoId: producto.id,
        orden: null,
      },
      orderBy: {
        fechaCreacion: 'desc', // 1 = más nuevo
      },
      select: { id: true },
    });

    if (precios.length === 0) {
      continue;
    }

    productosConPrecios++;
    totalPreciosEncontrados += precios.length;

    try {
      // Transacción POR PRODUCTO: si falla uno, ese producto no se queda a medias
      await prisma.$transaction(
        precios.map((precio, i) =>
          prisma.precioProducto.update({
            where: { id: precio.id },
            data: { orden: i + 1 }, // 1 = más nuevo
          }),
        ),
      );

      totalPreciosActualizados += precios.length;
    } catch (error) {
      console.error(`❌ Error procesando producto ${producto.id}:`, error);
      errores.push({ productoId: producto.id, error });
    }

    // Log de progreso cada X productos
    if ((index + 1) % 50 === 0) {
      console.log(
        `⏳ Progreso: ${index + 1}/${productos.length} productos procesados | precios actualizados: ${totalPreciosActualizados}`,
      );
    }
  }

  console.log('\n✅ Backfill de orden completado.');
  console.log('--- Resumen ---');
  console.log(`Productos totales: ${productos.length}`);
  console.log(`Productos con precios (orden NULL): ${productosConPrecios}`);
  console.log(`Precios encontrados (orden NULL): ${totalPreciosEncontrados}`);
  console.log(`Precios actualizados: ${totalPreciosActualizados}`);
  console.log(`Productos con error: ${errores.length}`);

  if (errores.length > 0) {
    console.log('\nAlgunos errores:');
    for (const e of errores.slice(0, 10)) {
      console.log(`- Producto ${e.productoId}:`, e.error);
    }
    if (errores.length > 10) {
      console.log(`... y ${errores.length - 10} productos más con error.`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error fatal en backfill de orden:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
