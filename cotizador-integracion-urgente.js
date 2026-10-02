/* PiscinaSur - integración urgente 2026-10-02. Carga sobre V8.20 sin reemplazar su interfaz. */
(function(){
const q=id=>document.getElementById(id), money=n=>'$'+Math.round(Number(n||0)).toLocaleString('es-CL');
function field(label,html,hint=''){return `<div class="field"><label>${label}</label>${html}${hint?`<div class="hint">${hint}</div>`:''}</div>`}
function installUI(){
 const left=document.querySelector('.grid>div'); if(!left||q('psFinanzas')) return;
 const p=document.createElement('div'); p.className='panel'; p.id='psFinanzas';
 p.innerHTML=`<h2>Etapa inicial y forma de pago</h2>
 ${field('Tipo de obra','<select id="psTipoObra"><option value="piscina">Piscina</option><option value="jacuzzi25">Jacuzzi 2,5 × 2,5</option><option value="jacuzzi30">Jacuzzi 3 × 3</option><option value="ambos">Piscina + Jacuzzi</option></select>')}
 ${field('Anticipo cliente','<select id="psAnticipo"><option value="50">50%</option><option value="60">60%</option></select>','Se analiza contra compras iniciales, 50% maestros y utilidad proporcional.')}
 ${field('Retiro de tierra','<select id="psRetiro"><option value="no">No incluir</option><option value="si">Incluir</option></select>','Volumen excavado × 1,20; camión 12 m³; $100.000 por viaje.')}
 ${field('Mano de obra borde y vereda ($)','<input id="psMoBorde" type="number" min="0" step="10000" value="0">','Valor total editable; no se multiplica por m² ni ML.')}
 <div class="toggle-row"><span>Compra inicial / anticipo maestros</span><span class="price">50% de MO</span></div>`;
 left.appendChild(p);
 const actions=document.querySelector('.pdf-actions'); if(actions){const b=document.createElement('button');b.type='button';b.className='pdf-btn';b.id='psPdfInterno';b.textContent='PDF interno compras / etapas';actions.insertBefore(b,actions.firstChild);b.onclick=pdfInterno;}
 ['psTipoObra','psAnticipo','psRetiro','psMoBorde'].forEach(id=>q(id)?.addEventListener('input',()=>window.render&&render()));
}
// Corrige geometría estructural de jacuzzi: dimensiones interiores + muros 20 cm + asiento 50x50.
window.calcularJacuzziPS=function(size,ciudadInfo,tipoLosa,prof){
 const L=size===2.5?2.5:3, A=L, extL=L+.40, extA=A+.40, e=.20, H=Math.max(.5,Number(prof)||1.2);
 const losa=extL*extA*.20, muros=(extL*extA-L*A)*H, interior=Math.max(0,L-1)*Math.max(0,A-1), asiento=(L*A-interior)*.50;
 const m3=losa+muros+asiento, hub=ciudadInfo?.hub||'Puerto Montt', pAr=(window.ARIDOS_HUB?.[hub]||38000), pCe=(window.CEMENTO_HUB?.[hub]||5420), pHo=(window.HORMIGON_HUB_UF?.[hub]||3.92)*(window.valorUFActual||40850.06);
 const sacos=Math.ceil(m3*15), materiales=tipoLosa==='camion'?m3*pHo:m3*pAr+sacos*pCe, mo=size===2.5?2000000:2700000;
 return {largo:L,ancho:A,profundidad:H,volumenLosa:losa,volumenMuros:muros,volumenAsiento:asiento,volumenHormigon:m3,sacosCemento:sacos,costoMaterialHormigon:materiales,manoObra:mo,total:mo+materiales};
};
try{ calcularJacuzzi30=(ciudad,tipo,prof)=>window.calcularJacuzziPS(3,ciudad,tipo,prof); }catch(e){}
const oldCalc=window.calcular;
if(typeof oldCalc==='function') window.calcular=function(o){
 const r=oldCalc(o); if(!r||!Array.isArray(r.materiales)) return r;
 // Losa definitiva: huella exterior +20 cm por lado y 20 cm de espesor. Mantiene exclusión camión/manual del motor original.
 const m3Losa=(Number(o.largo)+.40)*(Number(o.ancho)+.40)*.20;
 const retiro=q('psRetiro')?.value==='si'; const prof=(Number(o.profMin)+Number(o.profMax))/2; const exc=(Number(o.largo)+.8)*(Number(o.ancho)+.8)*(prof+.3); const suelto=exc*1.20, viajes=Math.ceil(suelto/12), retiroCosto=retiro?viajes*100000:0;
 // Desglosa fitting inicial exigido para obra gruesa.
 r.materiales=r.materiales.filter(m=>!String(m[0]).startsWith('Fitting hidráulico'));
 [['Tubería hidráulica inicial',3,'tiras',42933],['Codos hidráulicos iniciales',6,'ud',2439.5],['Terminales HE iniciales',2,'ud',2150],['Tee hidráulica inicial',2,'ud',3300]].forEach(x=>r.materiales.push([x[0],x[1],x[2],x[3],x[1]*x[3],'OBRA GRUESA / HIDRÁULICA INICIAL']));
 if(retiro) r.materiales.push(['Retiro de tierra',viajes,'viajes',100000,retiroCosto,'OBRA GRUESA / EXCAVACIÓN']);
 const moBorde=Number(q('psMoBorde')?.value)||0; if(moBorde) r.materiales.push(['Mano de obra borde y vereda',1,'gl',moBorde,moBorde,'BORDE PISCINA']);
 r.volumenExcavacion=exc;r.volumenTierraSuelta=suelto;r.viajesTierra=viajes;r.retiroTierraCosto=retiroCosto;r.volumenLosa20=m3Losa;
 r.totalMateriales=r.materiales.reduce((s,m)=>s+Number(m[4]||0),0);r.totalNeto=r.totalMateriales+r.totalManoObra;r.nivel1Subtotal=r.totalNeto;r.nivel2Subtotal=r.totalNeto+r.bcEquipo+r.bcFlete+r.bcInstalacion;r.nivel1Total=r.nivel1Subtotal*(1+r.mk);r.nivel2Total=r.nivel2Subtotal*(1+r.mk);
 return r;
};
function finance(){if(!window.ultimoResultado)return null;const u=ultimoResultado,r=u.r,pct=Number(q('psAnticipo')?.value||50)/100,total=(r.nivel1Subtotal+(window.adicionalesList?adicionalesList(r.areaDes,u.ciudadInfo,u.tipoLosa,u.profJacuzzi30).filter(a=>window.adicionalesState?.[a.id]).reduce((s,a)=>s+a.precio,0):0))*(1+u.margen/100);const anticipo=total*pct,mo50=r.tierMO?.valor*.5||0,utilidad=Math.max(0,total-r.totalNeto),rescate=utilidad*pct;return{pct,total,anticipo,mo50,rescate,retiro:r.retiroTierraCosto||0,viajes:r.viajesTierra||0,exc:r.volumenExcavacion||0,suelto:r.volumenTierraSuelta||0};}
function pdfInterno(){if(window.render)render();const f=finance();if(!f)return;const u=ultimoResultado,r=u.r,rows=r.materiales.map(m=>`<tr><td>${m[5]}</td><td>${m[0]}</td><td>${m[1]} ${m[2]}</td><td>${money(m[3])}</td><td>${money(m[4])}</td></tr>`).join('');const h=`<!doctype html><meta charset="utf-8"><title>Compras Etapa 1 ${u.quoteId}</title><style>body{font:12px Arial;padding:24px;color:#173247}h1,h2{color:#0B5E6B}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccd;padding:6px;text-align:left}.sum{font-size:14px;line-height:1.7}</style><h1>PiscinaSur · Compras y Etapa 1</h1><p>${u.quoteId} · ${u.ciudadInfo.ciudad}</p><div class="sum"><b>Anticipo cliente ${Math.round(f.pct*100)}%:</b> ${money(f.anticipo)}<br><b>Anticipo mano de obra maestros – 50%:</b> ${money(f.mo50)}<br><b>Utilidad proporcional a rescatar:</b> ${money(f.rescate)}<br><b>Excavación estimada:</b> ${f.exc.toFixed(2)} m³ · tierra suelta ${f.suelto.toFixed(2)} m³<br><b>Retiro tierra:</b> ${f.viajes} viajes · ${money(f.retiro)}</div><h2>Partidas</h2><table><tr><th>Etapa</th><th>Ítem</th><th>Cantidad</th><th>Unitario</th><th>Total</th></tr>${rows}</table><script>setTimeout(()=>print(),400)<\/script>`;const w=open('','_blank');if(w){w.document.write(h);w.document.close()}else alert('Habilita ventanas emergentes para generar el PDF interno.');}
function boot(){installUI(); if(window.render)render();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,50));else setTimeout(boot,50);
})();