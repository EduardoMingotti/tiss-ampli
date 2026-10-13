import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const cfg=window.CARDIOSYNC_CONFIG||{}; const configured=cfg.supabaseUrl?.startsWith('https://')&&!cfg.supabasePublishableKey?.includes('COLE_');
const db=configured?createClient(cfg.supabaseUrl,cfg.supabasePublishableKey):null; let demo=false; let tuss=[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)]; const brl=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const seed={professionals:[['Felipe','Principal'],['Juan','Principal'],['Rayza','Auxiliar'],['Mariel','Auxiliar'],['Elton','Auxiliar']],rules:['Equipe completa','Sem Elton','Sem Mariel','Sem Rayza','Sem Rayza e Mariel','Sem Mariel e Elton','Sem Rayza e Elton','Felipe + Juan']};
function enter(label='Modo demonstração'){ $('#login').classList.add('hide');$('#app').classList.remove('hide');$('#userLabel').textContent=label;loadAll(); }
$('#demoBtn').onclick=()=>{demo=true;enter()}; $('#loginForm').onsubmit=async e=>{e.preventDefault();if(!db){$('#loginMsg').textContent='Configure config.js antes de entrar, ou use a demonstração.';return}const {data,error}=await db.auth.signInWithPassword({email:$('#email').value,password:$('#password').value});if(error){$('#loginMsg').textContent=error.message;return}enter(data.user.email)};
$('#logout').onclick=async()=>{if(db&&!demo)await db.auth.signOut();location.reload()};
$$('nav button').forEach(b=>b.onclick=()=>{$$('nav button,.view').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.view).classList.add('active');const m={painel:['Painel','Visão objetiva do que exige atenção.'],importacoes:['Importar XML','Entrada dos lotes e histórico processado.'],configuracoes:['Configurações','Cadastros básicos e matrizes versionadas.'],fechamento:['Fechamento','Receber, pagar e gerar extratos.']}[b.dataset.view];$('#pageTitle').textContent=m[0];$('#pageSub').textContent=m[1]});
$$('[data-tab]').forEach(b=>b.onclick=()=>{$$('[data-tab],.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.tab).classList.add('active')});
$$('[data-close-tab]').forEach(b=>b.onclick=()=>{$$('[data-close-tab],.close-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.closeTab).classList.add('active')});
$$('[data-modal]').forEach(b=>b.onclick=()=>$('#'+b.dataset.modal).showModal()); $('#today').textContent=new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
async function rows(table,select='*'){if(demo||!db)return[];const {data,error}=await db.from(table).select(select);if(error){console.error(table,error);return[]}return data||[]}
async function loadAll(){try{tuss=await fetch('data/tuss-22.json').then(r=>r.json())}catch{}; await Promise.all([loadProfessionals(),loadRules(),loadImports(),loadFinancial()]);}
async function loadProfessionals(){let data=demo?seed.professionals.map((x,i)=>({id:i,nome:x[0],tipo:x[1],ativo:true})):await rows('profissionais');$('#professionalRows').innerHTML=data.map(x=>`<tr><td><b>${esc(x.nome)}</b></td><td>${esc(x.tipo||'-')}</td><td><span class="status">${x.ativo?'Ativo':'Inativo'}</span></td></tr>`).join('')||'<tr><td colspan="3">Nenhum profissional cadastrado.</td></tr>'}
async function loadRules(){let data=demo?seed.rules.map((n,i)=>({nome:n,vigencia_inicio:'2026-01-01',vigencia_fim:null,ativo:true,codigo_procedimento:null})):await rows('regras_repasse');$('#ruleCards').innerHTML=data.map(x=>`<article class="rule-card"><h3>${esc(x.nome)}</h3><p>TUSS: ${esc(x.codigo_procedimento||'Todos os selecionados')}</p><p>Vigência: ${new Date(x.vigencia_inicio+'T00:00:00').toLocaleDateString('pt-BR')} até ${x.vigencia_fim?new Date(x.vigencia_fim+'T00:00:00').toLocaleDateString('pt-BR'):'aberto'}</p><span class="status">${x.ativo?'Vigente':'Inativa'}</span></article>`).join('')}
async function loadImports(){let data=demo?[{imported_at:new Date().toISOString(),nome_arquivo:'lote_exemplo.xml',competencia:'2026-09-01',total_atendimentos:6,valor_total:270}]:await rows('importacoes_xml');data.sort((a,b)=>String(b.imported_at).localeCompare(String(a.imported_at)));$('#importRows').innerHTML=data.map(x=>`<tr><td>${new Date(x.imported_at).toLocaleDateString('pt-BR')}</td><td>${esc(x.nome_arquivo)}</td><td>${x.competencia?x.competencia.slice(0,7).split('-').reverse().join('/'):'-'}</td><td>${x.total_atendimentos||0}</td><td>${brl(x.valor_total)}</td></tr>`).join('')||'<tr><td colspan="5">Nenhuma importação.</td></tr>'}
async function loadFinancial(){let at=demo?[{id:1,paciente:'Paciente Amplimed',guia:'1',valor_faturado:90,data_atendimento:'2026-09-14',prazo_dias:45,status_financeiro:'ABERTO',procedimentos:{descricao:'Pago em 45 dias'}},{id:2,paciente:'Paciente Amplimed',guia:'3',valor_faturado:90,data_atendimento:'2026-09-14',prazo_dias:30,status_financeiro:'ABERTO',procedimentos:{descricao:'Pago em 30 dias'}}]:await rows('atendimentos','*, procedimentos(descricao)');let rec=demo?[]:await rows('recebimento_itens');let reps=demo?[]:await rows('repasses_calculados','*, profissionais(nome)');const received=rec.reduce((s,x)=>s+Number(x.valor_baixado),0), billed=at.reduce((s,x)=>s+Number(x.valor_faturado),0), pay=reps.reduce((s,x)=>s+Number(x.valor_repasse),0);$('#mReceber').textContent=brl(billed-received);$('#mRecebido').textContent=brl(received);$('#mPagar').textContent=brl(pay);let alerts=at.filter(x=>(Date.now()-new Date(x.data_atendimento))/864e5>=80&&x.status_financeiro!=='RECEBIDO');$('#mAlertas').textContent=alerts.length;$('#openRows').innerHTML=at.map(x=>`<tr><td>${esc(x.paciente)}</td><td>${esc(x.procedimentos?.descricao||'-')}</td><td>${x.prazo_dias||'-'} dias</td><td>${brl(x.valor_faturado)}</td><td><span class="status">${esc(x.status_financeiro)}</span></td></tr>`).join('');$('#alertList').innerHTML=alerts.map(x=>`<div class="alert-item"><b>${esc(x.paciente)} · ${esc(x.procedimentos?.descricao||'Procedimento')}</b><small>Verificar prazo e saldo pendente.</small></div>`).join('')||'<p>Nenhum alerta crítico no momento.</p>';$('#receivableRows').innerHTML=at.map(x=>`<tr><td>${esc(x.guia)}</td><td>${esc(x.paciente)}</td><td>${esc(x.procedimentos?.descricao||'-')}</td><td>${brl(x.valor_faturado)}</td><td>${brl(0)}</td><td>${brl(x.valor_faturado)}</td></tr>`).join('');const grouped={};reps.forEach(x=>{let k=x.profissionais?.nome||'Clínica';grouped[k]=(grouped[k]||0)+Number(x.valor_repasse)});$('#payableRows').innerHTML=Object.entries(grouped).map(([k,v])=>`<tr><td>${esc(k)}</td><td>-</td><td>-</td><td>${brl(v)}</td></tr>`).join('')||'<tr><td colspan="4">Os repasses aparecerão após o cálculo dos atendimentos.</td></tr>'}
$('#tussSearch').oninput=e=>{let q=e.target.value.toLowerCase().trim();if(q.length<2){$('#tussResults').innerHTML='<p>Digite ao menos 2 caracteres.</p>';return}let arr=(Array.isArray(tuss)?tuss:[]).filter(x=>String(x.id).includes(q)||String(x.display_name).toLowerCase().includes(q)).slice(0,30);$('#tussResults').innerHTML=arr.map(x=>`<div class="result"><div><b>${esc(x.id)}</b><small>${esc(x.display_name)}</small></div><button class="btn secondary small" data-add-tuss="${esc(x.id)}">Adicionar</button></div>`).join('')||'<p>Nenhum resultado.</p>'};
$('#professionalForm').onsubmit=async e=>{e.preventDefault();let f=new FormData(e.target);if(!demo){let {error}=await db.from('profissionais').insert({nome:f.get('nome'),tipo:f.get('tipo')});if(error)return alert(error.message)}e.target.reset();$('#professionalModal').close();loadProfessionals()};
$('#ruleForm').onsubmit=async e=>{e.preventDefault();let f=new FormData(e.target);if(!demo){let {error}=await db.from('regras_repasse').insert({nome:f.get('nome'),codigo_procedimento:f.get('codigo')||null,vigencia_inicio:f.get('inicio'),vigencia_fim:f.get('fim')||null});if(error)return alert(error.message)}e.target.reset();$('#ruleModal').close();loadRules()};
const dz=$('#dropzone'),fi=$('#xmlFile');$('#pickXml').onclick=()=>fi.click();['dragenter','dragover'].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(n=>dz.addEventListener(n,e=>{e.preventDefault();dz.classList.remove('drag')}));dz.addEventListener('drop',e=>processXml(e.dataTransfer.files[0]));fi.onchange=()=>processXml(fi.files[0]);$('#refreshImports').onclick=loadImports;

$('#exportCsv').onclick=()=>{
    let lines=[
        ['Guia','Paciente','Procedimento','Faturado','Recebido','Saldo'],
        ...$$('#receivableRows tr').map(tr=>
            [...tr.cells].map(td=>td.innerText)
        )
    ];

    let csv=lines
        .map(r=>
            r.map(v=>
                '"' + String(v).replaceAll('"','""') + '"'
            ).join(';')
        )
        .join('\n');

    let a=document.createElement('a');

    a.href=URL.createObjectURL(
        new Blob(
            ['\ufeff'+csv],
            {type:'text/csv'}
        )
    );

    a.download='fechamento-cardiosync.csv';

    a.click();
};$('#refreshImports').onclick=loadImports;$('#exportCsv').onclick=()=>{let lines=[['Guia','Paciente','Procedimento','Faturado','Recebido','Saldo'],...$$('#receivableRows tr').map(tr=>[...tr.cells].map(td=>td.innerText))];let csv=lines.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('
');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['﻿'+csv],{type:'text/csv'}));a.download='fechamento-cardiosync.csv';a.click()};
if(db){db.auth.getSession().then(({data})=>{if(data.session)enter(data.session.user.email)})}
