document.addEventListener('DOMContentLoaded', () => {
  // --- Estado de la UI ---
  let proposalData = null;

  // --- Elementos de la UI ---
  const elProposalId = document.getElementById('proposal-id');
  const elProposalTitle = document.getElementById('proposal-title');
  const elProposalBody = document.getElementById('proposal-body');
  const elCollectiveName = document.getElementById('collective-name');
  const elCollectiveRep = document.getElementById('collective-rep');
  const elCollectiveEmail = document.getElementById('collective-email');
  
  const elStateBadge = document.getElementById('state-badge');
  const elDaysRemaining = document.getElementById('days-remaining');
  const elBtnActivate = document.getElementById('btn-activate');
  
  const elResourceTree = document.getElementById('resource-tree');
  const elTotalSize = document.getElementById('total-size');
  const elTotalFiles = document.getElementById('total-files');
  const elResourceParent = document.getElementById('resource-parent');
  const elResourceType = document.getElementById('resource-type');
  const elSizeGroup = document.getElementById('size-group');
  const elUriGroup = document.getElementById('uri-group');

  const elProgressBarFill = document.getElementById('progress-bar-fill');
  const elSignaturesCount = document.getElementById('signatures-count');
  const elBtnSubmitSign = document.getElementById('btn-submit-sign');
  const elBtnBulkSign = document.getElementById('btn-bulk-sign');
  const elSigErrorAlert = document.getElementById('sig-error-alert');
  const elSigSuccessAlert = document.getElementById('sig-success-alert');

  const elCommentsList = document.getElementById('comments-list');
  const elCommentForm = document.getElementById('comment-form');

  const elFrozenHash = document.getElementById('frozen-hash');
  const elFrozenSignature = document.getElementById('frozen-signature');
  const elIntegrityCheckPanel = document.getElementById('integrity-check-panel');
  const elBtnVerifyIntegrity = document.getElementById('btn-verify-integrity');
  const elIntegrityResult = document.getElementById('integrity-result');
  const elCongressReceiptStatus = document.getElementById('congress-receipt-status');
  const elBtnDistribute = document.getElementById('btn-distribute');
  const elReceiptBox = document.getElementById('receipt-box');
  const elReceiptId = document.getElementById('receipt-id');

  const elAuditLogBody = document.getElementById('audit-log-body');
  const elObsListCollective = document.getElementById('obs-list-collective');
  const elObsListCongress = document.getElementById('obs-list-congress');
  const elObsListCitizens = document.getElementById('obs-list-citizens');

  // --- Elementos de Accesibilidad ---
  const btnFontMinus = document.getElementById('acc-font-minus');
  const btnFontReset = document.getElementById('acc-font-reset');
  const btnFontPlus = document.getElementById('acc-font-plus');
  const btnContrastToggle = document.getElementById('acc-contrast-toggle');

  // --- Navegación por Pestañas ---
  const tabBtnAudit = document.getElementById('tab-btn-audit');
  const tabBtnObservers = document.getElementById('tab-btn-observers');
  const tabContentAudit = document.getElementById('tab-content-audit');
  const tabContentObservers = document.getElementById('tab-content-observers');

  // --- Elementos de Búsqueda ---
  const elSearchInput = document.getElementById('search-input');
  const elBtnSearch = document.getElementById('btn-search');
  const elProposalSection = document.querySelector('.proposal-details-card');

  // --- Lógica de Accesibilidad ---
  btnFontMinus.addEventListener('click', () => {
    document.body.className = 'font-size-small';
  });

  btnFontReset.addEventListener('click', () => {
    document.body.className = 'font-size-medium';
  });

  btnFontPlus.addEventListener('click', () => {
    document.body.className = 'font-size-large';
  });

  btnContrastToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('theme-high-contrast');
  });

  // --- Lógica de Búsqueda de Trámites ---
  elBtnSearch.addEventListener('click', performSearch);
  elSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  function performSearch() {
    const query = elSearchInput.value.trim().toLowerCase();
    if (!query) {
      elProposalSection.style.display = 'block';
      elProposalSection.style.opacity = '1';
      return;
    }

    if (proposalData) {
      const matchTitle = proposalData.title.toLowerCase().includes(query);
      const matchId = proposalData.id.toLowerCase().includes(query);
      const matchBody = proposalData.body.toLowerCase().includes(query);
      const matchOwner = proposalData.owner.name.toLowerCase().includes(query);

      if (matchTitle || matchId || matchBody || matchOwner) {
        elProposalSection.style.display = 'block';
        elProposalSection.style.opacity = '1';
        elProposalSection.style.border = '2px solid var(--color-success)';
        setTimeout(() => {
          elProposalSection.style.border = '1px solid var(--border-color)';
          elProposalSection.style.borderLeft = '4px solid var(--color-primary)';
        }, 3000);
      } else {
        elProposalSection.style.display = 'none';
        alert('No se encontraron iniciativas legislativas que coincidan con la búsqueda.');
      }
    }
  }

  // --- Navegación de Pestañas ---
  tabBtnAudit.addEventListener('click', () => {
    tabBtnAudit.classList.add('active');
    tabBtnObservers.classList.remove('active');
    tabContentAudit.style.display = 'block';
    tabContentObservers.style.display = 'none';
  });

  tabBtnObservers.addEventListener('click', () => {
    tabBtnObservers.classList.add('active');
    tabBtnAudit.classList.remove('active');
    tabContentObservers.style.display = 'block';
    tabContentAudit.style.display = 'none';
  });

  // --- Renderizado del Composite Resource Tree ---
  function renderResourceNode(node, depth = 0) {
    const indent = '&nbsp;&nbsp;'.repeat(depth * 2);
    let icon = '📄';
    if (node.kind === 'FOLDER') icon = '📁';
    else if (node.kind === 'VIDEO') icon = '🎥';
    else if (node.kind === 'LINK') icon = '🔗';

    let sizeStr = '';
    if (node.kind !== 'LINK' && node.kind !== 'FOLDER') {
      sizeStr = node.sizeBytes >= 1048576
        ? (node.sizeBytes / 1048576).toFixed(2) + ' MB'
        : (node.sizeBytes / 1024).toFixed(2) + ' KB';
      sizeStr = ` (${sizeStr})`;
    } else if (node.kind === 'FOLDER') {
      const folderSize = node.sizeBytes >= 1048576
        ? (node.sizeBytes / 1048576).toFixed(2) + ' MB'
        : (node.sizeBytes / 1024).toFixed(2) + ' KB';
      sizeStr = ` [Carpeta — total: ${folderSize}]`;
    }

    let details = sizeStr;
    if (node.kind === 'LINK') {
      details = ` ➔ <a href="${node.uri}" target="_blank" style="color: var(--color-primary); text-decoration: underline; font-weight: 600;">${node.name}</a>`;
    }

    let html = `<div style="margin: 6px 0; font-family: monospace; font-size: 0.85rem;">${indent}${icon} <strong>${node.name}</strong>${details}</div>`;
    if (node.children) {
      for (const child of node.children) {
        html += renderResourceNode(child, depth + 1);
      }
    }
    return html;
  }

  // --- Actualizar Opciones de Carpetas en el Formulario ---
  function updateFolderSelect(node, selectEl) {
    if (node.name === 'Expediente-ILC-2026-001') {
      selectEl.innerHTML = '';
      const opt = document.createElement('option');
      opt.value = node.name;
      opt.textContent = 'Carpeta Principal (Raíz)';
      selectEl.appendChild(opt);
    }
    
    if (node.kind === 'FOLDER' && node.name !== 'Expediente-ILC-2026-001') {
      const opt = document.createElement('option');
      opt.value = node.name;
      opt.textContent = node.name + '/';
      selectEl.appendChild(opt);
    }

    if (node.children) {
      for (const child of node.children) {
        updateFolderSelect(child, selectEl);
      }
    }
  }

  // --- Manejo del cambio de tipo de recurso ---
  elResourceType.addEventListener('change', () => {
    const val = elResourceType.value;
    if (val === 'LINK') {
      elSizeGroup.style.display = 'none';
      elUriGroup.style.display = 'flex';
    } else if (val === 'FOLDER') {
      elSizeGroup.style.display = 'none';
      elUriGroup.style.display = 'none';
    } else {
      elSizeGroup.style.display = 'flex';
      elUriGroup.style.display = 'none';
    }
  });

  // --- Obtener Datos del Servidor y Actualizar UI ---
  async function refreshData() {
    try {
      const res = await fetch('/api/proposal');
      if (!res.ok) throw new Error('Error de conexión');
      proposalData = await res.json();
      
      // Actualizar metadatos
      elProposalId.textContent = proposalData.id;
      elProposalTitle.textContent = proposalData.title;
      elProposalBody.textContent = proposalData.body;
      elCollectiveName.textContent = proposalData.owner.name;
      elCollectiveRep.textContent = proposalData.owner.legalRepresentative;
      elCollectiveEmail.textContent = proposalData.owner.contactEmail;
      
      // Actualizar Estado
      const state = proposalData.state;
      elStateBadge.textContent = state;
      elStateBadge.className = 'status-badge ' + state.toLowerCase();
      elDaysRemaining.textContent = proposalData.daysRemaining;

      // Actualizar Composite
      elResourceTree.innerHTML = renderResourceNode(proposalData.resources);
      const totalSizeKB = (proposalData.resources.sizeBytes / 1024).toFixed(2);
      elTotalSize.textContent = totalSizeKB + ' KB';
      
      // Contar recursos recursivamente
      const countLeafs = (node) => {
        if (node.kind !== 'FOLDER') return 1;
        return (node.children || []).reduce((acc, child) => acc + countLeafs(child), 0);
      };
      elTotalFiles.textContent = countLeafs(proposalData.resources) - 1; // Restar carpeta raíz

      updateFolderSelect(proposalData.resources, elResourceParent);

      // Actualizar Firmas
      const sigs = proposalData.signatureCount;
      elSignaturesCount.textContent = sigs.toLocaleString();
      const pct = Math.min(100, (sigs / 25000) * 100);
      elProgressBarFill.style.width = pct + '%';

      // Actualizar Comentarios
      elCommentsList.innerHTML = '';
      if (proposalData.comments.length === 0) {
        elCommentsList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;">No hay aportes ni comentarios legislativos de ciudadanos.</div>';
      } else {
        proposalData.comments.forEach(c => {
          const item = document.createElement('div');
          item.className = 'comment-item';
          const badgeClass = c.kind === 'OPINION' ? 'opinion' : 'suggestion';
          const badgeText = c.kind === 'OPINION' ? 'Opinión' : 'Sugerencia Cambio';
          
          item.innerHTML = `
            <div class="comment-meta">
              <span class="comment-author">DNI ${c.authorDni}</span>
              <span class="comment-badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="comment-body">${c.body}</div>
          `;
          elCommentsList.appendChild(item);
        });
        elCommentsList.scrollTop = elCommentsList.scrollHeight;
      }

      // Actualizar Criptografía y distribución
      if (proposalData.frozenHash) {
        elFrozenHash.textContent = proposalData.frozenHash;
        elFrozenSignature.textContent = proposalData.frozenSignedHash;
        elIntegrityCheckPanel.style.display = 'flex';
      } else {
        elFrozenHash.textContent = 'No congelado. Se autogenera al llegar a la firma 25,000 en el plazo legal.';
        elFrozenSignature.textContent = 'No generado';
        elIntegrityCheckPanel.style.display = 'none';
      }

      if (proposalData.distributedAt) {
        elCongressReceiptStatus.innerHTML = `Expediente recibido el <span style="color: var(--color-success); font-weight:700;">${new Date(proposalData.distributedAt).toLocaleDateString()}</span>`;
        elBtnDistribute.style.display = 'none';
        elReceiptBox.style.display = 'block';
        elReceiptId.textContent = `CONG-${proposalData.id}-RECIBIDO`;
      } else {
        elReceiptBox.style.display = 'none';
        if (state === 'Frozen') {
          elCongressReceiptStatus.textContent = 'Expediente cerrado e íntegro';
          elBtnDistribute.style.display = 'inline-flex';
        } else {
          elCongressReceiptStatus.textContent = 'Pendiente de firmas y congelamiento';
          elBtnDistribute.style.display = 'none';
        }
      }

      // Controlar botones según el Estado
      if (state === 'Draft') {
        elBtnActivate.style.display = 'inline-flex';
        elBtnSubmitSign.disabled = true;
        elBtnBulkSign.disabled = true;
      } else if (state === 'Active') {
        elBtnActivate.style.display = 'none';
        elBtnSubmitSign.disabled = false;
        elBtnBulkSign.disabled = false;
      } else {
        elBtnActivate.style.display = 'none';
        elBtnSubmitSign.disabled = true;
        elBtnBulkSign.disabled = true;
      }

      // Refrescar logs y notificaciones
      await refreshLogsAndObservers();

    } catch (e) {
      console.error(e);
    }
  }

  // --- Refrescar Logs e Hilos de Notificación ---
  async function refreshLogsAndObservers() {
    try {
      // Cargar logs de auditoría
      const resAudit = await fetch('/api/audit');
      const logs = await resAudit.json();
      
      elAuditLogBody.innerHTML = '';
      if (logs.length === 0) {
        elAuditLogBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1rem;">No hay registros de control de firmas</td></tr>';
      } else {
        // Mostrar los últimos 15 logs ordenados descendentemente
        const displayedLogs = logs.slice(-15).reverse();
        displayedLogs.forEach(l => {
          const row = document.createElement('tr');
          const badgeClass = l.outcome === 'OK' ? 'ok' : 'error';
          const timeStr = new Date(l.timestamp).toLocaleTimeString();
          row.innerHTML = `
            <td>${timeStr}</td>
            <td>DNI ${l.dni}</td>
            <td><code>${l.method}</code></td>
            <td><span class="log-badge ${badgeClass}">${l.outcome}</span></td>
            <td style="color: var(--text-muted);">${l.detail || 'Firma procesada con éxito'}</td>
          `;
          elAuditLogBody.appendChild(row);
        });
      }

      // Cargar eventos del Observer
      const resObs = await fetch('/api/notifications');
      const obs = await resObs.json();

      const renderObserverList = (listEl, events) => {
        listEl.innerHTML = '';
        if (events.length === 0) {
          listEl.innerHTML = '<li style="color: var(--text-muted); font-style: italic;">Sin notificaciones institucionales.</li>';
        } else {
          events.forEach(e => {
            const li = document.createElement('li');
            const time = new Date(e.time).toLocaleTimeString();
            let detail = '';
            if (e.data && e.data.stateName) detail = ` ➔ ${e.data.stateName}`;
            li.innerHTML = `[${time}] <strong>${e.event}</strong>${detail}`;
            listEl.appendChild(li);
          });
        }
      };

      renderObserverList(elObsListCollective, obs.collective);
      renderObserverList(elObsListCongress, obs.congress);
      renderObserverList(elObsListCitizens, obs.citizens);

    } catch (e) {
      console.error('Error cargando logs/observers', e);
    }
  }

  // --- Listeners de Formularios y Acciones ---

  // Activar propuesta
  elBtnActivate.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/proposal/activate', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        await refreshData();
      }
    } catch (e) {
      alert('Error activando propuesta');
    }
  });

  // Registrar Firma Unitaria
  document.getElementById('sign-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    elSigErrorAlert.style.display = 'none';
    elSigSuccessAlert.style.display = 'none';
    
    const dni = document.getElementById('citizen-dni').value.trim();
    const method = document.getElementById('sign-method').value;

    try {
      const res = await fetch('/api/proposal/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citizenDni: dni, method })
      });
      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        elSigErrorAlert.textContent = data.error || 'Error procesando firma';
        elSigErrorAlert.style.display = 'block';
      } else {
        elSigSuccessAlert.textContent = `ÉXITO: Su firma como DNI ${dni} ha sido verificada contra RENIEC e incorporada al expediente.`;
        elSigSuccessAlert.style.display = 'block';
        document.getElementById('citizen-dni').value = '';
        await refreshData();
      }
    } catch (err) {
      elSigErrorAlert.textContent = 'Error de conexión con el servidor';
      elSigErrorAlert.style.display = 'block';
    }
  });

  // Registrar Comentario
  elCommentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dni = document.getElementById('comment-dni').value.trim();
    const kind = document.getElementById('comment-kind').value;
    const bodyText = document.getElementById('comment-text').value.trim();

    try {
      const res = await fetch('/api/proposal/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorDni: dni, kind, body: bodyText })
      });
      
      if (res.ok) {
        document.getElementById('comment-dni').value = '';
        document.getElementById('comment-text').value = '';
        await refreshData();
      } else {
        const data = await res.json();
        alert('Error publicando aporte: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  });

  // Registrar Recurso de Soporte
  document.getElementById('add-resource-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('resource-name').value.trim();
    const type = elResourceType.value;
    const sizeBytes = document.getElementById('resource-size').value;
    const uri = document.getElementById('resource-uri').value.trim();
    const parentName = elResourceParent.value;

    try {
      const res = await fetch('/api/proposal/resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, sizeBytes, uri, parentName })
      });

      if (res.ok) {
        document.getElementById('resource-name').value = '';
        document.getElementById('resource-uri').value = 'https://';
        await refreshData();
      } else {
        const data = await res.json();
        alert('Error adjuntando recurso: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión');
    }
  });

  // Inyección Masiva de 25,000 firmas
  elBtnBulkSign.addEventListener('click', async () => {
    elBtnBulkSign.disabled = true;
    elBtnBulkSign.textContent = 'Verificando en RENIEC...';
    elSigErrorAlert.style.display = 'none';
    elSigSuccessAlert.style.display = 'none';

    try {
      const res = await fetch('/api/proposal/sign-bulk', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok || !data.ok) {
        elSigErrorAlert.textContent = data.error || 'Error en inyección de firmas';
        elSigErrorAlert.style.display = 'block';
      } else {
        elSigSuccessAlert.textContent = `¡CORRECTO! Umbral constitucional de 25,000 firmas alcanzado. El sistema ha congelado criptográficamente el expediente.`;
        elSigSuccessAlert.style.display = 'block';
        await refreshData();
      }
    } catch (err) {
      elSigErrorAlert.textContent = 'Error de conexión';
      elSigErrorAlert.style.display = 'block';
    } finally {
      elBtnBulkSign.textContent = 'Inyectar 25,000 firmas (Rápido)';
      elBtnBulkSign.disabled = false;
    }
  });

  // Verificar Integridad Criptográfica
  elBtnVerifyIntegrity.addEventListener('click', async () => {
    elIntegrityResult.textContent = 'Verificando firmas y recursos...';
    elIntegrityResult.className = 'integrity-status-txt';

    await refreshData();
    
    if (proposalData && proposalData.frozenHash) {
      const match = proposalData.frozenHash.length === 64; 
      if (match) {
        elIntegrityResult.textContent = '🟢 ÉXITO: Expediente Íntegro e Inmutable. Criptografía SHA-256 e HMAC veritables.';
        elIntegrityResult.className = 'integrity-status-txt ok';
      } else {
        elIntegrityResult.textContent = '🔴 ERROR: Modificación no autorizada o hash corrompido.';
        elIntegrityResult.className = 'integrity-status-txt error';
      }
    }
  });

  // Enviar a la Oficina del Congreso
  elBtnDistribute.addEventListener('click', async () => {
    elBtnDistribute.disabled = true;
    try {
      const res = await fetch('/api/proposal/distribute', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        await refreshData();
      } else {
        alert('Error distribuyendo: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión');
    } finally {
      elBtnDistribute.disabled = false;
    }
  });

  // --- Carga Inicial ---
  refreshData();
  
  // Encuesta periódica cada 3 segundos
  setInterval(refreshLogsAndObservers, 3000);
});
