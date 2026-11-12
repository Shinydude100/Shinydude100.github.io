// Admin CRM — Irving Computer & Tech Support (daca.me/admin)
// Sentinel Hardened: Safe DOM Node Construction (Stored DOM XSS Prevention), AbortController Timeouts, Accessible Status Banner

document.addEventListener('DOMContentLoaded', () => {
  // Global Security Delegation for external links
  document.addEventListener('click', (e) => {
    if (!e.target || typeof e.target.closest !== 'function') return;
    const link = e.target.closest('a[target="_blank"]');
    if (link) {
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('referrerpolicy', 'no-referrer');
    }
  });

  loadData();
});

function showAdminBanner(message, isError = false) {
  const banner = document.getElementById('admin-status-banner');
  if (!banner) return;
  banner.textContent = message;
  banner.className = isError ? 'admin-banner error' : 'admin-banner success';
  banner.setAttribute('role', isError ? 'alert' : 'status');
  banner.hidden = false;
}

function formatTime(militaryTime) {
  if (!militaryTime || typeof militaryTime !== 'string') return '';
  const parts = militaryTime.split(':');
  if (parts.length < 2) return militaryTime;
  let hour = parseInt(parts[0], 10);
  if (Number.isNaN(hour)) return militaryTime;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${parts[1]} ${ampm}`;
}

function sanitizePhoneHref(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^0-9+*#-]/g, '');
}

async function loadData() {
  const container = document.getElementById('tickets-container');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('/api/admin/appointments', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    // Update Tracker
    const revenue = Number(data.totalRevenue) || 0;
    const goal = Number(data.targetGoal) || 4000;
    const pct = Math.min(100, Math.round((revenue / goal) * 100));

    const revDisplay = document.getElementById('revenue-display');
    const progBar = document.getElementById('progress-bar');
    const progPct = document.getElementById('progress-percent');

    if (revDisplay) revDisplay.textContent = `$${revenue.toFixed(2)} / $${goal.toFixed(2)}`;
    if (progBar) progBar.style.width = `${pct}%`;
    if (progPct) {
      const remainingGigs = Math.max(0, Math.ceil((goal - revenue) / 125));
      progPct.textContent = `${pct}% of USCIS legal & filing fees funded (${remainingGigs} avg gigs remaining)`;
    }

    // Update Stats
    const appts = Array.isArray(data.appointments) ? data.appointments : [];
    const statTotal = document.getElementById('stat-total');
    const statScheduled = document.getElementById('stat-scheduled');
    const statCompleted = document.getElementById('stat-completed');

    if (statTotal) statTotal.textContent = String(appts.length);
    if (statScheduled) statScheduled.textContent = String(appts.filter((a) => a.status === 'SCHEDULED').length);
    if (statCompleted) statCompleted.textContent = String(appts.filter((a) => a.status === 'COMPLETED').length);

    if (!container) return;
    container.textContent = '';

    if (appts.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.style.color = 'var(--text-muted)';
      emptyEl.style.padding = '20px';
      emptyEl.textContent = 'No appointments logged in D1 database yet.';
      container.appendChild(emptyEl);
      return;
    }

    // Sentinel Hardening: Build DOM nodes via DocumentFragment + textContent
    const fragment = document.createDocumentFragment();
    appts.forEach((a) => {
      fragment.appendChild(createTicketCard(a));
    });
    container.appendChild(fragment);
  } catch (err) {
    clearTimeout(timeoutId);
    if (container) {
      container.textContent = '';
      const errEl = document.createElement('div');
      errEl.style.color = 'var(--red)';
      errEl.style.padding = '20px';
      errEl.setAttribute('role', 'alert');
      errEl.textContent = 'Error loading database records. Ensure you are authenticated.';
      container.appendChild(errEl);
    }
  }
}

function createTicketCard(a) {
  const ticketNumber = String(a.ticket_number || '');
  const card = document.createElement('div');
  card.className = 'ticket-card';
  card.id = `card-${ticketNumber}`;

  // Column 1: Ticket Metadata
  const colMeta = document.createElement('div');

  const ticketIdEl = document.createElement('div');
  ticketIdEl.className = 'ticket-id';
  ticketIdEl.textContent = ticketNumber;

  const ticketTimeEl = document.createElement('div');
  ticketTimeEl.className = 'ticket-time';
  ticketTimeEl.textContent = `📅 ${a.appointment_date || ''} @ ${formatTime(a.appointment_time)}`;

  const serviceEl = document.createElement('div');
  serviceEl.style.fontSize = '0.8rem';
  serviceEl.style.color = 'var(--accent)';
  serviceEl.style.marginTop = '4px';
  serviceEl.textContent = String(a.service_type || '');

  colMeta.appendChild(ticketIdEl);
  colMeta.appendChild(ticketTimeEl);
  colMeta.appendChild(serviceEl);

  // Column 2: Client Info (Untrusted fields rendered exclusively with textContent)
  const colClient = document.createElement('div');
  colClient.className = 'client-info';

  const nameStrong = document.createElement('strong');
  nameStrong.textContent = String(a.client_name || 'Client');
  colClient.appendChild(nameStrong);

  const contactsDiv = document.createElement('div');
  contactsDiv.className = 'client-contacts';

  const safePhoneHref = sanitizePhoneHref(a.client_phone);
  const callLink = document.createElement('a');
  callLink.href = `tel:${safePhoneHref}`;
  callLink.textContent = '📞 Call';

  const smsLink = document.createElement('a');
  smsLink.href = `sms:${safePhoneHref}`;
  smsLink.textContent = '💬 Text';

  const phoneSpan = document.createElement('span');
  phoneSpan.style.fontFamily = 'var(--font-mono)';
  phoneSpan.style.fontSize = '0.85rem';
  phoneSpan.style.color = 'var(--text-muted)';
  phoneSpan.textContent = String(a.client_phone || '');

  contactsDiv.appendChild(callLink);
  contactsDiv.appendChild(smsLink);
  contactsDiv.appendChild(phoneSpan);
  colClient.appendChild(contactsDiv);

  const issueDiv = document.createElement('div');
  issueDiv.className = 'issue-text';
  const issueLabel = document.createElement('strong');
  issueLabel.textContent = 'Issue: ';
  issueDiv.appendChild(issueLabel);
  issueDiv.appendChild(document.createTextNode(String(a.issue_description || '')));
  colClient.appendChild(issueDiv);

  if (a.device_model) {
    const deviceDiv = document.createElement('div');
    deviceDiv.style.fontSize = '0.75rem';
    deviceDiv.style.color = 'var(--text-muted)';
    deviceDiv.textContent = `Device: ${a.device_model}`;
    colClient.appendChild(deviceDiv);
  }

  // Column 3: Actions
  const colActions = document.createElement('div');
  colActions.className = 'ticket-actions';

  const statusWrap = document.createElement('div');
  const statusLabel = document.createElement('label');
  statusLabel.style.fontSize = '0.75rem';
  statusLabel.style.color = 'var(--text-muted)';
  statusLabel.htmlFor = `status-${ticketNumber}`;
  statusLabel.textContent = 'Status: ';

  const statusSelect = document.createElement('select');
  statusSelect.className = 'status-select';
  statusSelect.id = `status-${ticketNumber}`;
  statusSelect.name = `status-${ticketNumber}`;

  const statuses = [
    { value: 'SCHEDULED', label: 'SCHEDULED' },
    { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
    { value: 'COMPLETED', label: 'COMPLETED' },
    { value: 'CANCELLED', label: 'CANCELLED' }
  ];
  statuses.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.value;
    opt.textContent = s.label;
    if (a.status === s.value) opt.selected = true;
    statusSelect.appendChild(opt);
  });

  statusWrap.appendChild(statusLabel);
  statusWrap.appendChild(statusSelect);

  const paidWrap = document.createElement('div');
  const paidLabel = document.createElement('label');
  paidLabel.style.fontSize = '0.75rem';
  paidLabel.style.color = 'var(--text-muted)';
  paidLabel.htmlFor = `paid-${ticketNumber}`;
  paidLabel.textContent = 'Paid ($): ';

  const paidInput = document.createElement('input');
  paidInput.type = 'number';
  paidInput.step = '0.01';
  paidInput.className = 'paid-input';
  paidInput.id = `paid-${ticketNumber}`;
  paidInput.name = `paid-${ticketNumber}`;
  paidInput.value = String(Number(a.paid_amount) || 0);
  paidInput.style.width = '90px';

  paidWrap.appendChild(paidLabel);
  paidWrap.appendChild(paidInput);

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'save-btn';
  saveBtn.textContent = 'Save Update';
  saveBtn.addEventListener('click', () => updateTicket(ticketNumber, saveBtn));

  colActions.appendChild(statusWrap);
  colActions.appendChild(paidWrap);
  colActions.appendChild(saveBtn);

  card.appendChild(colMeta);
  card.appendChild(colClient);
  card.appendChild(colActions);

  return card;
}

async function updateTicket(ticketNumber, btnEl) {
  const statusEl = document.getElementById(`status-${ticketNumber}`);
  const paidEl = document.getElementById(`paid-${ticketNumber}`);
  if (!statusEl || !paidEl) return;

  const status = statusEl.value;
  const paid = parseFloat(paidEl.value) || 0;

  if (btnEl) {
    btnEl.disabled = true;
    btnEl.textContent = 'Saving...';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('/api/admin/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticket_number: ticketNumber, status, paid_amount: paid }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const resData = await res.json();
    if (resData.success) {
      showAdminBanner(`Ticket ${ticketNumber} updated!`, false);
      await loadData();
    } else {
      showAdminBanner(`Error: ${resData.error || 'Update failed'}`, true);
    }
  } catch (err) {
    clearTimeout(timeoutId);
    showAdminBanner('Network update error.', true);
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.textContent = 'Save Update';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatTime, sanitizePhoneHref, createTicketCard };
}
