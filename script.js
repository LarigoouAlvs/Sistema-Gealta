import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAn64Ruhj0LH5p-Skb8QXgZiUTl1TIpniA",
  authDomain: "construsistem-3ea46.firebaseapp.com",
  projectId: "construsistem-3ea46",
  storageBucket: "construsistem-3ea46.appspot.com",
  messagingSenderId: "745830372376",
  appId: "1:745830372376:web:dc731dc0e18a812363df6d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let obras = [];
let gastos = [];

async function cadastrarObra() {
  const nome = document.getElementById("obra-nome").value.trim();
  if (!nome) return alert("Nome da obra é obrigatório");
  await addDoc(collection(db, "obras"), { nome });
  document.getElementById("obra-nome").value = "";
}

async function lancarGasto() {
  const obraId = document.getElementById("obra-select").value;
  const descricao = document.getElementById("descricao-gasto").value.trim();
  const valor = parseFloat(document.getElementById("valor-gasto").value);
  if (!obraId || !descricao || isNaN(valor)) return alert("Preencha todos os campos");
  await addDoc(collection(db, "gastos"), { obraId, descricao, valor });
  document.getElementById("descricao-gasto").value = "";
  document.getElementById("valor-gasto").value = "";
}

async function excluirObra(id) {
  if (!confirm("Excluir esta obra também excluirá todos os seus gastos. Continuar?")) return;
  const q = query(collection(db, "gastos"), where("obraId", "==", id));
  const snap = await getDocs(q);
  snap.forEach(docu => deleteDoc(doc(db, "gastos", docu.id)));
  await deleteDoc(doc(db, "obras", id));
}

async function excluirGasto(id) {
  await deleteDoc(doc(db, "gastos", id));
}

function atualizarInterface() {
  const select = document.getElementById("obra-select");
  select.innerHTML = '<option value="">Selecione a Obra</option>';
  obras.forEach(o => {
    select.innerHTML += `<option value="${o.id}">${o.nome}</option>`;
  });

  const container = document.getElementById("gastos-lista");
  if (obras.length === 0) {
    container.innerHTML = `<p class="text-muted">Nenhuma obra cadastrada.</p>`;
    return;
  }

  container.innerHTML = obras
    .map(obra => {
      const listaGastos = gastos.filter(g => g.obraId === obra.id);
      const total = listaGastos.reduce((soma, g) => soma + g.valor, 0).toFixed(2);
      const linhas = listaGastos
        .map(
          gasto => `<li class="list-group-item d-flex justify-content-between align-items-center">
            ${gasto.descricao} - R$ ${gasto.valor.toFixed(2)}
            <button class="btn btn-sm btn-outline-danger" onclick="excluirGasto('${gasto.id}')">Excluir</button>
          </li>`
        )
        .join("");

      return `
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <h5>${obra.nome}</h5>
            <button class="btn btn-sm btn-outline-danger" onclick="excluirObra('${obra.id}')">Excluir Obra</button>
          </div>
          <ul class="list-group mt-2">${linhas || "<li class='list-group-item'>Nenhum gasto lançado.</li>"}</ul>
          <p class="mt-2 fw-bold">Total: R$ ${total}</p>
        </div>`;
    })
    .join("");
}

onSnapshot(collection(db, "obras"), snap => {
  obras = [];
  snap.forEach(doc => obras.push({ id: doc.id, ...doc.data() }));
  atualizarInterface();
});

onSnapshot(collection(db, "gastos"), snap => {
  gastos = [];
  snap.forEach(doc => gastos.push({ id: doc.id, ...doc.data() }));
  atualizarInterface();
});
