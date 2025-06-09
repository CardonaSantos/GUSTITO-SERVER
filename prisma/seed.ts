// prisma/seed.ts
import { PrismaClient, TipoSucursal } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();

  // Cambia estos datos según lo que necesites
  const data = {
    nombre: 'Sucursal Central  II',
    direccion: 'Av. Principal #123, Ciudad',
    telefono: '+502 1234 5678',
    pbx: '8000-1234',
    tipoSucursal: TipoSucursal.TIENDA,
    estadoOperacion: true,
  };

  // Cambia '1' por el id único que desees usar para la sucursal
  const sucursal = await prisma.sucursal.create({
    data: data,
  });

  console.log('✓ Seed: Sucursal generada:', sucursal);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
