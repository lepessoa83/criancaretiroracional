const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrHI6Zp7tTkI8VKalbIG8rINhES9dxBQr591q6ZKJD1skbiHLoYsGv8dY96WZMawqJsQ/exec";
const LOCAL_KEY = 'criancas_ret_racional_entries';

// pede os dados da planilha (GET)
async function fetchRemote(){
  try{
    const res = await fetch(APPS_SCRIPT_URL);
    if(!res.ok) throw new Error('Erro fetch');
    const data = await res.json();
    return data;
  }catch(e){
    console.warn('Não foi possível ler da planilha:', e);
    return [];
  }
}

function calcularIdade(dataStr){
  if(!dataStr) return '';
  const bd = new Date(dataStr);
  const now = new Date();
  let years = now.getFullYear() - bd.getFullYear();
  const m = now.getMonth() - bd.getMonth();
  if(m < 0 || (m===0 && now.getDate() < bd.getDate())) years--;
  return years;
}

async function loadData(){
  const remote = await fetchRemote();
  const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');

  // normaliza remote (pode ser array de objetos com headers)
  const normalized = (remote || []).map(r=>{
    // quando o Apps Script retorna objetos, usar as keys; se retornar arrays, fallback
    return {
      nome_completo: r.nome_completo || r[0] || '',
      data_nascimento: r.data_nascimento || r[1] || '',
      hora_nascimento: r.hora_nascimento || r[2] || '',
      idade: r.idade || r[3] || '',
      tefa: r.tefa || r[4] || '',
      pais: r.pais || r[5] || '',
      cidade_estado: r.cidade_estado || r[6] || '',
      pais_nome: r.pais_nome || r[7] || '',
      foto_url: r.foto_url || r[8] || r.foto || ''
    };
  });

  // concatenar: primeiro os remotos (oficiais), depois os locais (pendentes)
  const data = normalized.concat(local);
  render(data);
}

function render(data){
  const q = document.getElementById('search') ? document.getElementById('search').value.toLowerCase().trim() : '';
  const container = document.getElementById('cards');
  container.innerHTML = '';
  const list = data.filter(d => (d.nome_completo || '').toLowerCase().includes(q));
  list.sort((a,b)=> (a.nome_completo||'').localeCompare(b.nome_completo||''));
  if(list.length === 0){
    document.getElementById('empty').style.display = 'block';
  } else {
    document.getElementById('empty').style.display = 'none';
  }
  for(const d of list){
    const div = document.createElement('div');
    div.className = 'card';
    const img = d.foto_url || d.foto || d.fotoUrl || 'https://via.placeholder.com/150x150.png?text=Foto';
    div.innerHTML = `
      <img src="${img}" alt="${(d.nome_completo||'')}" />
      <div class="info">
        <div class="name">${d.nome_completo || ''}</div>
        <div class="meta">Idade: ${calcularIdade(d.data_nascimento) || d.idade || ''} • Nasc: ${d.data_nascimento || '-'} ${d.hora_nascimento ? 'às ' + d.hora_nascimento : ''}</div>
        <div class="meta">Pais: ${d.pais || '-'} • ${d.cidade_estado || ''}</div>
      </div>
    `;
    container.appendChild(div);
  }
}

// eventos
document.addEventListener('DOMContentLoaded', ()=> {
  // load initial
  loadData();

  const search = document.getElementById('search');
  if(search){
    search.addEventListener('input', ()=> loadData());
  }

  const cadBtn = document.getElementById('cadBtn');
  if(cadBtn){
    cadBtn.addEventListener('click', ()=> {
      window.location.href = 'cadastro.html';
    });
  }
});
