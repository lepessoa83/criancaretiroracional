const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrHI6Zp7tTkI8VKalbIG8rINhES9dxBQr591q6ZKJD1skbiHLoYsGv8dY96WZMawqJsQ/exec";

async function fetchRemote(){
  try{
    const res = await fetch(APPS_SCRIPT_URL);
    if(!res.ok) throw new Error('erro');
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
  const local = JSON.parse(localStorage.getItem('criancas_ret_racional_entries') || '[]');
  const normalized = (remote || []).map(r=>{
    return {
      nome_completo: r.nome_completo || r[0] || '',
      data_nascimento: r.data_nascimento || r[1] || '',
      hora_nascimento: r.hora_nascimento || r[2] || '',
      idade: r.idade || r[3] || '',
      tefa: r.tefa || r[4] || '',
      pais: r.pais || r[5] || '',
      cidade_estado: r.cidade_estado || r[6] || '',
      pais_nome: r.pais_nome || r[7] || '',
      foto: r.foto_url || r.foto || ''
    };
  });
  const data = normalized.concat(local);
  render(data);
}

function render(data){
  const q = document.getElementById('search').value.toLowerCase().trim();
  const container = document.getElementById('cards');
  container.innerHTML = '';
  const list = data.filter(d => (d.nome_completo || '').toLowerCase().includes(q));
  list.sort((a,b)=> (a.nome_completo||'').localeCompare(b.nome_completo||''));
  for(const d of list){
    const div = document.createElement('div');
    div.className = 'card';
    const img = d.foto || d.foto_url || 'https://via.placeholder.com/150x150.png?text=Foto';
    div.innerHTML = `
      <img src="${img}" alt="${d.nome_completo || ''}" />
      <div class="info">
        <div class="name">${d.nome_completo || ''}</div>
        <div class="meta">Idade: ${calcularIdade(d.data_nascimento) || d.idade || ''} • Nasc: ${d.data_nascimento || '-'} ${d.hora_nascimento ? 'às ' + d.hora_nascimento : ''}</div>
        <div class="meta">Pais: ${d.pais || '-'} • ${d.cidade_estado || ''}</div>
      </div>
    `;
    container.appendChild(div);
  }
}

document.getElementById('search').addEventListener('input', ()=> loadData());
document.getElementById('cadBtn').addEventListener('click', ()=> {
  window.location.href = 'cadastro.html';
});

// initial load
loadData();
