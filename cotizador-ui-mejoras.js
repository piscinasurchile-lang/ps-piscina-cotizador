/* Integración UI no destructiva sobre el cotizador V8.20 */
(function(){
function add(tag,attrs={},html=''){const e=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));e.innerHTML=html;return e}
function init(){
 const tipo=document.getElementById('tipoProyecto'); if(tipo){tipo.innerHTML='<option value="piscina">Piscina</option><option value="jacuzzi">Jacuzzi</option><option value="piscina-jacuzzi">Piscina + Jacuzzi</option>';}
 const margen=document.getElementById('margen'); if(margen && !document.getElementById('anticipoPct')){const f=add('div',{'class':'field'},'<label>Anticipo cliente</label><select id="anticipoPct"><option value="50">50%</option><option value="60">60%</option></select><div class="hint">Análisis interno de caja inicial y rescate proporcional de utilidad.</div>');margen.closest('.field').after(f);}
 const addPanel=document.getElementById('adicionales')?.closest('.panel'); if(addPanel && !document.getElementById('retiroTierra')){const row=add('div',{'class':'toggle-row'},'<span>Retiro de tierra</span><div style="display:flex;align-items:center;gap:10px"><span class="price">Automático: +20% esponjamiento · camión 12 m³ · $100.000/viaje</span><label class="switch"><input type="checkbox" id="retiroTierra"><span class="slider"></span></label></div>');addPanel.appendChild(row);}
 const actions=document.querySelector('.pdf-actions'); if(actions && !document.getElementById('btnPdfInterno')){const b=add('button',{'class':'pdf-btn','type':'button','id':'btnPdfInterno'},'PDF interno de compras');b.addEventListener('click',()=>alert('PDF interno: se habilitará al completar la integración de partidas editables.'));actions.prepend(b);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();