/* PiscinaSur · reglas financieras y de obra 2026-10-02 */
(function(){
'use strict';
const n=v=>Number(v)||0, ceil=Math.ceil;
window.PSReglas2026={
 version:'2026.10.02',
 losa(largo,ancho,tipo,espesor=.20){const m3=(n(largo)+.40)*(n(ancho)+.40)*n(espesor);return {m3,tipo,hormigonCamionM3:tipo==='camion'?m3:0,manualM3:tipo==='mano'?m3:0};},
 jacuzzi(medida,prof,tipo,precios={}){const lado=medida==='2.5x2.5'?2.5:3,mo=lado===2.5?2000000:2700000,muro=.20,ext=lado+.40;const losa=ext*ext*.20,muros=(ext*ext-lado*lado)*n(prof),libre=Math.max(0,lado-1),areaAsiento=lado*lado-libre*libre,asiento=areaAsiento*.50,totalM3=losa+muros+asiento;const sacos=tipo==='mano'?ceil(totalM3*15):0;const materiales=tipo==='camion'?totalM3*n(precios.hormigon):totalM3*n(precios.arido)+sacos*n(precios.cemento);return {lado,exterior:ext,losaM3:losa,murosM3:muros,asientoM3:asiento,totalM3,sacos,manoObra:mo,materiales,total:mo+materiales};},
 retiroTierra(excavacionM3){const suelto=n(excavacionM3)*1.20,viajes=ceil(suelto/12);return {excavacionM3:n(excavacionM3),sueltoM3:suelto,viajes,precioViaje:100000,total:viajes*100000};},
 incidencia(partidas){const neto=partidas.reduce((s,p)=>s+n(p.subtotal),0);return partidas.map(p=>({...p,incidenciaPct:neto?n(p.subtotal)/neto*100:0}));},
 hidraulicaInicial(p={}){const rows=[['Drenos',n(p.drenos)||1,n(p.precioDreno)],['Skimmer',1,n(p.precioSkimmer)],['Tuberías',3,n(p.precioTuberia)],['Codos',6,n(p.precioCodo)],['Terminales HE',2,n(p.precioTerminalHE)],['Tee',2,n(p.precioTee)]];const items=rows.map(([nombre,cantidad,unitario])=>({nombre,cantidad,unitario,subtotal:cantidad*unitario,etapa:'Obra gruesa / compra inicial'}));return {items,total:items.reduce((s,x)=>s+x.subtotal,0)};},
 anticipo(x={}){const pct=n(x.porcentaje)||50,cliente=n(x.totalVenta)*pct/100,utilidad=n(x.totalVenta)-n(x.costoTotal),rescate=utilidad*pct/100,maestros=n(x.manoObraMaestros)*.50,base=n(x.obraGruesaInicial)+n(x.excavacion)+n(x.hidraulicaInicial)+maestros+n(x.retiroTierra)+rescate,pc=n(x.precioCemento),totalSacos=n(x.cementoTotalSacos),inicial=Math.min(totalSacos,pc>0?Math.max(0,Math.floor((cliente-base)/pc)):0),pendientes=Math.max(0,totalSacos-inicial),flete=pendientes>0?75000:0,etapa1=base+inicial*pc;return {porcentaje:pct,anticipoCliente:cliente,utilidadEsperada:utilidad,utilidadRescate:rescate,anticipoMaestros:maestros,sacosIniciales:inicial,sacosPendientes:pendientes,fleteSegundaCompra:flete,necesidadEtapa1:etapa1,diferencia:cliente-etapa1};}
};
})();