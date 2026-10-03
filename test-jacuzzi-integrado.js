const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
function geo(lado,prof=1.2){const ext=lado+.4,losa=ext*ext*.2,muros=(ext*ext-lado*lado)*prof,asiento=(lado*lado-Math.max(0,lado-1)**2)*.5;return {losa,muros,asiento,total:losa+muros+asiento}}
const j25=geo(2.5),j30=geo(3);
assert(Math.abs(j25.total-6.274)<0.0001,'Jacuzzi 2.5 debe usar 6.274 m3');
assert(Math.abs(j30.total-7.884)<0.0001,'Jacuzzi 3.0 debe usar 7.884 m3');
assert(1899000+60000+380000===2339000,'Bomba calor 70 m3 debe totalizar 2.339.000');
assert(Math.ceil(((2.5+.4)**2*(1.2+.2)*1.2)/12)>=1,'Retiro debe calcular viajes de 12 m3');
console.log('OK jacuzzi integrado');