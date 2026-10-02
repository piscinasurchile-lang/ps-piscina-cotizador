// Pruebas numéricas independientes para auditar las fórmulas aprobadas.
function jacuzziGeometry(largo, ancho, h) {
  const slab = (largo + 0.40) * (ancho + 0.40) * 0.20;
  const wallRing = (((largo + 0.40) * (ancho + 0.40)) - (largo * ancho)) * h;
  // asiento perimetral interior 0,50 x 0,50 sin duplicar esquinas
  const seat = ((2 * largo + 2 * ancho) * 0.50 - 4 * 0.50 * 0.50) * 0.50;
  return { slab, walls: wallRing, seat, total: slab + wallRing + seat };
}
function near(a,b,t=0.001){ if(Math.abs(a-b)>t) throw new Error(`${a} != ${b}`); }
const j30=jacuzziGeometry(3,3,1.20);
near(j30.slab,2.312); near(j30.walls,3.072); near(j30.seat,2.50); near(j30.total,7.884);
const j25=jacuzziGeometry(2.5,2.5,1.20);
near(j25.slab,1.682); near(j25.walls,2.592); near(j25.seat,2.00); near(j25.total,6.274);
console.log('OK V8.20 Jacuzzi geometry', {j25,j30});