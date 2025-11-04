// === CONFIGURAÇÕES DO SITE ===
const API_URL = "https://script.google.com/macros/s/AKfycbzrHI6Zp7tTkI8VKalbIG8rINhES9dxBQr591q6ZKJD1skbiHLoYsGv8dY96WZMawqJsQ/exec";
const SENHA = "Retiro2025";

// === FUNÇÃO PARA BUSCAR CRIANÇAS ===
async function carregarCrianças() {
  try {
    const resposta = await fetch(API_URL);
    const dados = await resposta.json();
    const lista = document.getElementById("listaCrianças");
    lista.innerHTML = "";

    dados.sort((a, b) => a.nome.localeCompare(b.nome));

    dados.forEach(c => {
      const card = document.createElement("div");
      card.className = "cartao";

      card.innerHTML = `
        <img src="${c.foto || 'https://via.placeholder.com/150'}" alt="Foto de ${c.nome}">
        <div class="info">
          <h3>${c.nome}</h3>
          <p><b>Idade:</b> ${c.idade || ''}</p>
          <p><b>Nascimento:</b> ${c.dataNascimento || ''} às ${c.hora || ''}</p>
          <p><b>TEFA:</b> ${c.tefa || ''}</p>
          <p><b>Pais:</b> ${c.pais || ''}</p>
          <p><b>Local:</b> ${c.local || ''}</p>
        </div>
      `;
      lista.appendChild(card);
    });
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
  }
}

// === BUSCA ===
function buscarPorNome() {
  const termo = document.getElementById("busca").value.toLowerCase();
  const cartoes = document.querySelectorAll(".cartao");
  cartoes.forEach(card => {
    const nome = card.querySelector("h3").textContent.toLowerCase();
    card.style.display = nome.includes(termo) ? "block" : "none";
  });
}

// === CADASTRO ===
async function salvarCadastro(event) {
  event.preventDefault();
  const senha = prompt("Digite a senha para salvar:");
  if (senha !== SENHA) {
    alert("Senha incorreta.");
    return;
  }

  const form = event.target;
  const dados = new FormData(form);

  const resposta = await fetch(API_URL, { method: "POST", body: dados });
  const texto = await resposta.text();

  alert("Cadastro salvo com sucesso!");
  form.reset();
  carregarCrianças();
}

// === INICIALIZAÇÃO ===
document.addEventListener("DOMContentLoaded", carregarCrianças);
