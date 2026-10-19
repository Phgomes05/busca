const $ = (s) => document.querySelector(s);
const onlyDigits = (v) => v.replace(/\D/g, "");
const formatCep = (v) => { const d=onlyDigits(v).slice(0,8); return d.length>5 ? d.slice(0,5)+"-"+d.slice(5) : d; };
const formatCnpj = (v) => { const d=onlyDigits(v).slice(0,14); return d.replace(/^(\d{2})(\d)/,"$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3").replace(/\.(\d{3})(\d)/,".$1/$2").replace(/(\d{4})(\d)/,"$1-$2"); };
["#cep-input","#cep-old","#cep-new"].forEach(sel=>$(sel).addEventListener("input",e=>e.target.value=formatCep(e.target.value)));
$("#cnpj-input").addEventListener("input",e=>e.target.value=formatCnpj(e.target.value));

document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b===btn));
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id===btn.dataset.panel));
}));

function setLoading(el, message="Consultando dados..."){el.innerHTML=`<div class="loading">${message}</div>`;}
function status(type, text){return `<div class="status ${type}"><span>${type==="ok"?"✓":type==="bad"?"!":"◷"}</span><span>${text}</span></div>`;}
function esc(value){return String(value ?? "Não informado").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function item(key,value,full=false){return `<div class="data-item ${full?"full":""}"><span class="key">${esc(key)}</span><span class="value">${esc(value || "Não informado")}</span></div>`;}
function showError(el,msg){el.innerHTML=status("bad",msg);}

$("#cep-form").addEventListener("submit",async e=>{
  e.preventDefault(); const el=$("#cep-result"), cep=onlyDigits($("#cep-input").value);
  if(cep.length!==8){showError(el,"Informe um CEP com exatamente 8 números.");return;}
  setLoading(el);
  try{
    const res=await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if(!res.ok)throw new Error("O serviço de CEP respondeu com erro.");
    const d=await res.json();
    if(d.erro){showError(el,"CEP não encontrado na base consultada. Confira os números ou confirme em outra fonte.");return;}
    const address=[d.logradouro,d.bairro,d.localidade,d.uf].filter(Boolean).join(", ");
    el.innerHTML=status("ok","CEP encontrado na base do ViaCEP.")+`<div class="data-grid">${item("CEP",formatCep(d.cep||cep))}${item("UF",d.uf)}${item("Logradouro",d.logradouro,true)}${item("Bairro",d.bairro)}${item("Cidade",d.localidade)}${item("Código IBGE",d.ibge)}${item("Endereço resumido",address,true)}</div><p class="small-note">Resultado baseado na base consultada; não é uma certificação oficial do endereço.</p>`;
  }catch(err){showError(el,"Não foi possível consultar o CEP agora. Verifique sua conexão e tente novamente.");}
});

$("#cnpj-form").addEventListener("submit",async e=>{
  e.preventDefault(); const el=$("#cnpj-result"), cnpj=onlyDigits($("#cnpj-input").value);
  if(cnpj.length!==14){showError(el,"Informe um CNPJ com 14 números. Esta versão inicial aceita CNPJs numéricos.");return;}
  setLoading(el);
  try{
    const res=await fetch(`https://minhareceita.org/${cnpj}`);
    if(res.status===404){showError(el,"CNPJ não encontrado na base consultada. Isso não prova, por si só, que o registro não exista.");return;}
    if(res.status===400){showError(el,"O serviço recusou o CNPJ. Confira se os números foram digitados corretamente.");return;}
    if(!res.ok)throw new Error("Serviço indisponível");
    const d=await res.json();
    const cep=formatCep(d.cep||"");
    const situacao=d.descricao_situacao_cadastral || (d.situacao_cadastral ? String(d.situacao_cadastral) : "Não informada");
    const ativa=String(situacao).toLowerCase().includes("ativa");
    const address=[d.logradouro,d.numero,d.complemento,d.bairro,d.municipio,d.uf].filter(Boolean).join(", ");
    el.innerHTML=status(ativa?"ok":"warn",`CNPJ encontrado. Situação cadastral: ${situacao}.`)+`<div class="data-grid">${item("CNPJ",formatCnpj(cnpj))}${item("Situação cadastral",situacao)}${item("Razão social",d.razao_social,true)}${item("Nome fantasia",d.nome_fantasia,true)}${item("CEP cadastrado",cep)}${item("Município / UF",[d.municipio,d.uf].filter(Boolean).join(" / "))}${item("Endereço",address,true)}${item("Atualização",d.data_situacao_cadastral||d.data_inicio_atividade||"Data não fornecida")}</div><p class="small-note">Dados retornados pela BrasilAPI/Minha Receita. A disponibilidade e a data de atualização dependem da fonte.</p><button class="primary" id="use-company-cep" type="button" style="margin-top:14px">Usar este CEP na comparação →</button>`;
    $("#use-company-cep").addEventListener("click",()=>{
      if(d.cep){$("#cep-new").value=formatCep(d.cep);document.querySelector('[data-panel="compare-panel"]').click();$("#cep-old").focus();}
    });
  }catch(err){showError(el,"A consulta de CNPJ está temporariamente indisponível ou a API limitou o acesso. Tente novamente mais tarde.");}
});

$("#compare-form").addEventListener("submit",async e=>{
  e.preventDefault(); const el=$("#compare-result"), oldCep=onlyDigits($("#cep-old").value), newCep=onlyDigits($("#cep-new").value);
  if(oldCep.length!==8||newCep.length!==8){showError(el,"Preencha os dois CEPs com 8 números cada.");return;}
  if(oldCep===newCep){el.innerHTML=status("ok","Os CEPs são iguais.")+`<div class="data-grid">${item("CEP cadastrado",formatCep(oldCep))}${item("CEP encontrado",formatCep(newCep))}</div><p class="small-note">Os CEPs coincidem, mas isso não garante que todos os demais campos do endereço estejam corretos.</p>`;return;}
  setLoading(el,"Consultando os dois CEPs para comparar os endereços...");
  try{
    const [aRes,bRes]=await Promise.all([fetch(`https://viacep.com.br/ws/${oldCep}/json/`),fetch(`https://viacep.com.br/ws/${newCep}/json/`)]);
    if(!aRes.ok||!bRes.ok)throw new Error();
    const [a,b]=await Promise.all([aRes.json(),bRes.json()]);
    if(a.erro||b.erro){showError(el,"Um ou ambos os CEPs não foram encontrados na base do ViaCEP. Confira os dados antes de concluir.");return;}
    const addr=d=>[d.logradouro,d.bairro,d.localidade,d.uf].filter(Boolean).join(", ");
    el.innerHTML=status("warn","Divergência de CEP identificada. Isso não confirma, sozinho, uma mudança de endereço.")+`<div class="data-grid">${item("CEP cadastrado",formatCep(oldCep))}${item("CEP encontrado",formatCep(newCep))}${item("Endereço do CEP cadastrado",addr(a),true)}${item("Endereço do CEP encontrado",addr(b),true)}</div><p class="small-note">Confirme a alteração com uma fonte oficial ou com a empresa antes de modificar o cadastro.</p>`;
  }catch(err){showError(el,"Não foi possível comparar os CEPs agora. Tente novamente.");}
});
