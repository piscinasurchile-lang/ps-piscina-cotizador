/* PiscinaSur · corrección producción V8.24 · 2026-10-02 */
(function(){
const q=id=>document.getElementById(id), money=n=>'$'+Math.round(Number(n||0)).toLocaleString('es-CL');
function field(label,html,hint=''){return `<div class="field"><label>${label}</label>${html}${hint?`<div class="hint">${hint}</div>`:''}</div>`}
function jacuzzi(size,ciudadInfo,tipoLosa,prof){
 const L=size===2.5?2.5:3,A=L,extL=L+.40,extA=A+.40,H=Math.max(.5,Number(prof)||1.2);
 const losa=extL*extA*.20;
 const muros=(extL*extA-L*A)*H;
 const asiento=(L*A-Math.max(0,L-1)*Math.max(0,A-1))*.50;
 const m3=losa+muros+asiento;
 const hub=ciudadInfo?.hub||'Puerto Montt';
 const pAr=ARIDOS_HUB[hub]??38000,pCe=CEMENTO_HUB[hub]??5420,pHo=(HORMIGON_HUB_UF[hub]??3.92)*valorUFActual;
 const sacos=Math.ceil(m3*RATIOS.cementoSacosPorM3Arido);
 const materiales=tipoLosa==='camion'?m3*pHo:m3*pAr+sacos*pCe;
 const mo=size===2.5?2000000:2700000;
 return {largo:L,ancho:A,profundidad:H,volumenLosa:losa,volumenMuros:muros,volumenAsiento:asiento,volumenHormigon:m3,sacosCemento:sacos,costoMaterialHormigon:materiales,manoObra:mo,total:mo+materiales};
}
window.calcularJacuzziPS=jacuzzi;
try{calcularJacuzzi30=(ciudad,tipo,prof)=>jacuzzi(3,ciudad,tipo,prof);}catch(e){}

function installUI(){
 const left=document.querySelector('.grid>div'); if(!left||q('psFinanzas')) return;
 const dataPanel=left.querySelector('.panel');
 const p=document.createElement('div');p.className='panel';p.id='psFinanzas';
 p.innerHTML=`<h2>Tipo de obra y forma de pago</h2>
 ${field('Tipo de obra','<select id="psTipoObra"><option value="piscina">Piscina</option><option value="jacuzzi25">Jacuzzi 2,5 × 2,5</option><option value="jacuzzi30">Jacuzzi 3 × 3</option><option value="ambos">Piscina + Jacuzzi</option></select>','Jacuzzi se calcula como obra independiente; no como adicional.')}
 ${field('Anticipo cliente','<select id="psAnticipo"><option value="50">50%</option><option value="60">60%</option></select>','Anticipo configurable para planificación interna.')}
 ${field('Retiro de tierra','<select id="psRetiro"><option value="no">No incluir</option><option value="si">Incluir</option></select>','Volumen excavado × 1,20; camión 12 m³; $100.000 por viaje.')}
 ${field('Mano de obra borde y vereda ($)','<input id="psMoBorde" type="number" min="0" step="10000" value="0">','Valor total editable.')}`;
 dataPanel?.after(p);
 const actions=document.querySelector('.pdf-actions');
 if(actions&&!q('psPdfInterno')){const b=document.createElement('button');b.type='button';b.className='pdf-btn';b.id='psPdfInterno';b.textContent='PDF interno compras / etapas';actions.insertBefore(b,actions.firstChild);b.onclick=pdfInterno;}
 ['psTipoObra','psAnticipo','psRetiro','psMoBorde'].forEach(id=>q(id)?.addEventListener('change',()=>{applyMode();render();}));
 applyMode();
}
function applyMode(){
 const tipo=q('psTipoObra')?.value||'piscina';
 const poolPanel=q('largo')?.closest('.panel');
 if(poolPanel){const h=poolPanel.querySelector('h2');if(h)h.textContent=tipo==='piscina'?'Medidas de la piscina':tipo==='ambos'?'Medidas de piscina + jacuzzi':'Medidas del jacuzzi';}
 const jf=q('jacuzziProfField');
 if(jf){jf.style.display=(tipo==='jacuzzi30'||tipo==='ambos')?'block':'none';const lab=jf.querySelector('label');if(lab)lab.textContent='Profundidad Jacuzzi (m)';}
 document.querySelectorAll('.add-group').forEach(g=>{if(g.querySelector('.add-group-title')?.textContent.trim()==='Jacuzzi')g.style.display='none';});
}

const oldCalc=calcular;
calcular=function(o){
 const r=oldCalc(o);if(!r||!Array.isArray(r.materiales))return r;
 const oldLosa=r.materiales.find(m=>String(m[0]).startsWith('Losa '));
 const oldLosaM3=Number(oldLosa?.[1]||0);
 const m3Losa=(Number(o.largo)+.40)*(Number(o.ancho)+.40)*.20;
 if(oldLosa){oldLosa[1]=round1(m3Losa);oldLosa[4]=oldLosa[1]*oldLosa[3];oldLosa[0]=oldLosa[0].replace('Largo×Ancho×Espesor','(Largo+0,40)×(Ancho+0,40)×0,20');}
 if(o.tipoLosa==='mano'){
   const cem=r.materiales.find(m=>String(m[0]).startsWith('Sacos cemento'));
   if(cem){const extra=Math.round((m3Losa-oldLosaM3)*RATIOS.cementoSacosPorM3Arido);cem[1]=Math.max(0,Number(cem[1])+extra);cem[4]=cem[1]*cem[3];}
 }
 r.materiales=r.materiales.filter(m=>!String(m[0]).startsWith('Fitting hidráulico'));
 [['Tubería hidráulica inicial',3,'tiras',42933],['Codos hidráulicos iniciales',6,'ud',2439.5],['Terminales HE iniciales',2,'ud',2150],['Tee hidráulica inicial',2,'ud',3300]].forEach(x=>r.materiales.push([x[0],x[1],x[2],x[3],x[1]*x[3],'OBRA GRUESA / HIDRÁULICA INICIAL']));
 const prof=(Number(o.profMin)+Number(o.profMax))/2,exc=(Number(o.largo)+.8)*(Number(o.ancho)+.8)*(prof+.3),suelto=exc*1.20,viajes=Math.ceil(suelto/12),retiro=q('psRetiro')?.value==='si',retiroCosto=retiro?viajes*100000:0;
 if(retiro)r.materiales.push(['Retiro de tierra',viajes,'viajes',100000,retiroCosto,'OBRA GRUESA / EXCAVACIÓN']);
 const moBorde=Number(q('psMoBorde')?.value)||0;if(moBorde)r.materiales.push(['Mano de obra borde y vereda',1,'gl',moBorde,moBorde,'BORDE PISCINA']);
 const tipo=q('psTipoObra')?.value||'piscina';
 if(tipo==='jacuzzi25'||tipo==='jacuzzi30'||tipo==='ambos'){
   const size=tipo==='jacuzzi25'?2.5:3;
   const H=Number(q('profJacuzzi30')?.value)||1.2;
   const j=jacuzzi(size,o.ciudadInfo,o.tipoLosa,H);
   r.jacuzzi=j;
   if(tipo==='jacuzzi25'||tipo==='jacuzzi30'){
     r.materiales=[['Hormigón/materiales estructura Jacuzzi',round1(j.volumenHormigon),'m3',j.costoMaterialHormigon/j.volumenHormigon,j.costoMaterialHormigon,'JACUZZI']];
     r.totalManoObra=j.manoObra;r.tierMO={tam:`${size}x${size}`,valor:j.manoObra};r.sup=size*size;r.per=4*size;r.vol=size*size*H;r.areaDes=r.per*H+r.sup;
   }else{
     r.materiales.push(['Materiales estructura Jacuzzi',round1(j.volumenHormigon),'m3',j.costoMaterialHormigon/j.volumenHormigon,j.costoMaterialHormigon,'JACUZZI']);
     r.totalManoObra+=j.manoObra;
   }
 }
 r.volumenExcavacion=exc;r.volumenTierraSuelta=suelto;r.viajesTierra=viajes;r.retiroTierraCosto=retiroCosto;r.volumenLosa20=m3Losa;
 r.totalMateriales=r.materiales.reduce((s,m)=>s+Number(m[4]||0),0);r.totalNeto=r.totalMateriales+r.totalManoObra;r.nivel1Subtotal=r.totalNeto;r.nivel2Subtotal=r.totalNeto+r.bcEquipo+r.bcFlete+r.bcInstalacion;r.nivel1Total=r.nivel1Subtotal*(1+r.mk);r.nivel2Total=r.nivel2Subtotal*(1+r.mk);
 return r;
};

function finance(){if(typeof ultimoResultado==='undefined'||!ultimoResultado)return null;const u=ultimoResultado,r=u.r,pct=Number(q('psAnticipo')?.value||50)/100,total=r.nivel1Total,anticipo=total*pct,mo50=r.totalManoObra*.5,utilidad=Math.max(0,total-r.totalNeto),rescate=utilidad*pct;return{pct,total,anticipo,mo50,rescate,retiro:r.retiroTierraCosto||0,viajes:r.viajesTierra||0,exc:r.volumenExcavacion||0,suelto:r.volumenTierraSuelta||0};}
function pdfInterno(){render();const f=finance();if(!f)return;const u=ultimoResultado,r=u.r,rows=r.materiales.map(m=>`<tr><td>${m[5]}</td><td>${m[0]}</td><td>${m[1]} ${m[2]}</td><td>${money(m[3])}</td><td>${money(m[4])}</td></tr>`).join('');const h=`<!doctype html><meta charset="utf-8"><title>Compras ${u.quoteId}</title><style>body{font:12px Arial;padding:24px;color:#173247}h1,h2{color:#0B5E6B}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccd;padding:6px;text-align:left}.sum{font-size:14px;line-height:1.7}</style><h1>PiscinaSur · Compras y Etapa 1</h1><p>${u.quoteId} · ${u.ciudadInfo.ciudad}</p><div class="sum"><b>Anticipo cliente ${Math.round(f.pct*100)}%:</b> ${money(f.anticipo)}<br><b>Anticipo mano de obra maestros – 50%:</b> ${money(f.mo50)}<br><b>Utilidad proporcional a rescatar:</b> ${money(f.rescate)}<br><b>Excavación estimada:</b> ${f.exc.toFixed(2)} m³ · tierra suelta ${f.suelto.toFixed(2)} m³<br><b>Retiro tierra:</b> ${f.viajes} viajes · ${money(f.retiro)}</div><h2>Partidas</h2><table><tr><th>Etapa</th><th>Ítem</th><th>Cantidad</th><th>Unitario</th><th>Total</th></tr>${rows}</table><script>setTimeout(()=>print(),400)<\/script>`;const w=open('','_blank');if(w){w.document.write(h);w.document.close()}else alert('Habilita ventanas emergentes.');}
const oldRender=render;render=function(){oldRender();applyMode();};
function boot(){installUI();render();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,80));else setTimeout(boot,80);
})();