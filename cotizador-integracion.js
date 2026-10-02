/* Capa de cálculo integrada al render existente sin reemplazar diseño. */
(function(){
function init(){
 const R=window.PSReglas2026;if(!R)return;
 const oldRender=window.render;if(typeof oldRender!=='function')return;
 window.render=function(){oldRender();try{
   const u=window.ultimoResultado;if(!u)return;
   const losa=R.losa(u.largo,u.ancho,u.tipoLosa,.20);
   u.ps2026=u.ps2026||{};u.ps2026.losa=losa;
   const retiro=document.getElementById('retiroTierra')?.checked;
   const excavacion=(u.largo+.40)*(u.ancho+.40)*(u.profMax+.20);
   u.ps2026.excavacionM3=excavacion;u.ps2026.retiroTierra=retiro?R.retiroTierra(excavacion):null;
 }catch(e){console.error('PS integración',e)}};
 ['anticipoPct','retiroTierra'].forEach(id=>document.getElementById(id)?.addEventListener('change',()=>window.render()));
 window.render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
})();