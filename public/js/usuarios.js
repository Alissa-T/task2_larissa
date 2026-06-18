// Usuarios Page Logic — CRUD de Usuários
document.addEventListener("DOMContentLoaded", async () => {
	// Verificar sessão
	try {
		const sessao = await API.verificarSessao();
		if (!sessao.logado) {
			window.location.href = "/";
			return;
		}
		document.getElementById("user-name").textContent = sessao.usuario.nome;
	} catch (_e) {
		window.location.href = "/";
		return;
	}

	// State
	let usuarios = [];
	let confirmCallback = null;

	const btnNovoUsuario = document.getElementById("btn-novo-usuario");

	// Logout
	document.getElementById("logout-btn").addEventListener("click", async () => {
		try {
			await API.logout();
		} catch (_e) {}
		window.location.href = "/";
	});

	// ===== LOAD DATA =====
	async function loadData() {
		try {
			const data = await API.listarUsuarios();
			usuarios = data;
			renderUsuarios();
		} catch (_error) {
			showToast("Erro ao carregar usuários", "error");
		}
	}

	// ===== RENDER =====
	function renderUsuarios() {
		const tbody = document.getElementById("usuarios-table-body");
		tbody.innerHTML = "";

		if (usuarios.length === 0) {
			tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Nenhum usuário cadastrado</td></tr>`;
			return;
		}

		usuarios.forEach((u) => {
			const tr = document.createElement("tr");
			tr.innerHTML = `
        <td>#${u.id}</td>
        <td>
          <div class="user-cell">
            <div class="user-cell-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
              </svg>
            </div>
            ${escapeHtml(u.nome)}
          </div>
        </td>
        <td><code class="login-badge">${escapeHtml(u.login)}</code></td>
        <td>${u.email ? escapeHtml(u.email) : '<span class="text-muted">—</span>'}</td>
        <td><span class="badge badge-ativo">Ativo</span></td>
        <td>
          <div class="actions-cell">
            <button class="btn-edit" onclick="editUsuario(${u.id})" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
              </svg>
            </button>
            <button class="btn-delete" onclick="deleteUsuario(${u.id}, '${escapeHtml(u.nome)}')" title="Excluir">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </td>
      `;
			tbody.appendChild(tr);
		});
	}

	// ===== MODAL USUÁRIO =====
	btnNovoUsuario.addEventListener("click", () => openUsuarioModal());

	function openUsuarioModal(usuario = null) {
		const modal = document.getElementById("modal-usuario");
		const title = document.getElementById("modal-usuario-title");
		const form = document.getElementById("form-usuario");
		const senhaInput = document.getElementById("usuario-senha");
		const senhaHint = document.getElementById("senha-hint");

		form.reset();
		document.getElementById("usuario-id").value = "";

		if (usuario) {
			title.textContent = "Editar Usuário";
			document.getElementById("usuario-id").value = usuario.id;
			document.getElementById("usuario-nome").value = usuario.nome;
			document.getElementById("usuario-login").value = usuario.login;
			document.getElementById("usuario-email").value = usuario.email || "";
			senhaInput.required = false;
			senhaInput.placeholder = "Deixe em branco para manter";
			senhaHint.style.display = "block";
		} else {
			title.textContent = "Novo Usuário";
			senhaInput.required = true;
			senhaInput.placeholder = "Mínimo 6 caracteres";
			senhaHint.style.display = "none";
		}

		modal.style.display = "flex";
	}

	// Global edit function
	window.editUsuario = (id) => {
		const u = usuarios.find((item) => item.id === id);
		if (u) openUsuarioModal(u);
	};

	// Global delete function
	window.deleteUsuario = (id, nome) => {
		openConfirmModal(`Deseja excluir o usuário "${nome}"?`, async () => {
			try {
				await API.excluirUsuario(id);
				showToast("Usuário excluído com sucesso!", "success");
				loadData();
			} catch (error) {
				showToast(error.message, "error");
			}
		});
	};

	// Save Usuário
	document
		.getElementById("form-usuario")
		.addEventListener("submit", async (e) => {
			e.preventDefault();

			const id = document.getElementById("usuario-id").value;
			const dados = {
				nome: document.getElementById("usuario-nome").value,
				login: document.getElementById("usuario-login").value,
				email: document.getElementById("usuario-email").value,
			};

			const senha = document.getElementById("usuario-senha").value;
			if (senha) {
				dados.senha = senha;
			}

			// Validação no criar: senha é obrigatória
			if (!id && !senha) {
				showToast("A senha é obrigatória para novos usuários", "error");
				return;
			}

			try {
				if (id) {
					await API.atualizarUsuario(id, dados);
					showToast("Usuário atualizado!", "success");
				} else {
					await API.criarUsuario(dados);
					showToast("Usuário criado!", "success");
				}

				closeModal("modal-usuario");
				loadData();
			} catch (error) {
				showToast(error.message, "error");
			}
		});

	// Modal close handlers
	document
		.getElementById("modal-usuario-close")
		.addEventListener("click", () => closeModal("modal-usuario"));
	document
		.getElementById("modal-usuario-cancel")
		.addEventListener("click", () => closeModal("modal-usuario"));

	// ===== CONFIRM MODAL =====
	function openConfirmModal(message, callback) {
		confirmCallback = callback;
		document.getElementById("confirm-message").textContent = message;
		document.getElementById("modal-confirm").style.display = "flex";
	}

	document.getElementById("confirm-ok").addEventListener("click", () => {
		if (confirmCallback) confirmCallback();
		closeModal("modal-confirm");
	});

	document
		.getElementById("confirm-cancel")
		.addEventListener("click", () => closeModal("modal-confirm"));
	document
		.getElementById("modal-confirm-close")
		.addEventListener("click", () => closeModal("modal-confirm"));

	// ===== UTILITIES =====
	function closeModal(id) {
		document.getElementById(id).style.display = "none";
	}

	function escapeHtml(text) {
		if (!text) return "";
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	function showToast(message, type = "info") {
		const container = document.getElementById("toast-container");
		const toast = document.createElement("div");
		toast.className = `toast toast-${type}`;

		const icons = {
			success: "✓",
			error: "✕",
			info: "ℹ",
		};

		toast.innerHTML = `<span>${icons[type] || ""}</span><span>${message}</span>`;
		container.appendChild(toast);

		setTimeout(() => {
			toast.classList.add("toast-out");
			setTimeout(() => toast.remove(), 300);
		}, 3500);
	}

	// Close modals on overlay click
	document.querySelectorAll(".modal-overlay").forEach((overlay) => {
		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) {
				overlay.style.display = "none";
			}
		});
	});

	// Initial load
	loadData();
});
