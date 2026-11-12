// =================================================================
// Irving Computer & Tech Support — Storefront & WebMCP Booking Engine
// Enforces Sentinel (CSP, safe textContent DOM sinks, AbortController timeouts),
// Bolt (DocumentFragment batching), Palette (ARIA states), and
// Chrome Modern Web Guidance (WebMCP Declarative + Imperative APIs).
// =================================================================

(function () {
  'use strict';

  const dateInput = document.getElementById('appointment_date');
  const slotsWrapper = document.getElementById('slots-wrapper');
  const selectedTimeInput = document.getElementById('selected_time');
  const bookingForm = document.getElementById('booking-form');
  const submitBtn = document.getElementById('submit-btn');
  const feedbackEl = document.getElementById('form-feedback');
  const bookingSuccess = document.getElementById('booking-success');
  const successTicket = document.getElementById('success-ticket');

  // 🛡️ Sentinel: Global click delegation for external target="_blank" links
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a[target="_blank"]');
    if (link) {
      link.setAttribute('rel', 'noopener noreferrer');
      link.setAttribute('referrerpolicy', 'no-referrer');
    }
  });

  function setFeedback(message, type) {
    if (!feedbackEl) return;
    if (!message) {
      feedbackEl.textContent = '';
      feedbackEl.className = 'form-feedback';
      feedbackEl.hidden = true;
      return;
    }
    feedbackEl.textContent = message;
    feedbackEl.className = 'form-feedback ' + (type === 'error' ? 'is-error' : 'is-info');
    feedbackEl.hidden = false;
  }

  function renderSlotStatus(message, isError) {
    if (!slotsWrapper) return;
    slotsWrapper.replaceChildren();
    const span = document.createElement('span');
    span.className = isError ? 'slot-status is-error' : 'slot-status';
    span.textContent = message;
    slotsWrapper.appendChild(span);
  }

  function formatTime(militaryTime) {
    if (typeof militaryTime !== 'string' || !militaryTime.includes(':')) return String(militaryTime || '');
    const parts = militaryTime.split(':');
    let hour = parseInt(parts[0], 10);
    const minute = parts[1] || '00';
    if (Number.isNaN(hour)) return militaryTime;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }

  const serviceSelect = document.getElementById('service_type');
  const bookingSection = document.getElementById('book');
  const summaryService = document.getElementById('summary-service');
  const summaryWindow = document.getElementById('summary-window');

  function updateBookingSummary() {
    if (summaryService && serviceSelect) {
      summaryService.textContent = serviceSelect.value || 'Computer Repair & Diagnostic';
    }
    if (summaryWindow) {
      const dateVal = dateInput ? dateInput.value : '';
      const timeVal = selectedTimeInput ? selectedTimeInput.value : '';
      if (dateVal && timeVal) {
        summaryWindow.textContent = `${dateVal} @ ${formatTime(timeVal)}`;
      } else if (dateVal) {
        summaryWindow.textContent = `${dateVal} (pick a slot)`;
      } else {
        summaryWindow.textContent = 'Select date & time slot';
      }
    }
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', updateBookingSummary);
  }

  document.querySelectorAll('[data-select-service]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const targetService = btn.getAttribute('data-select-service');
      if (serviceSelect && targetService) {
        serviceSelect.value = targetService;
        updateBookingSummary();
      }
      if (bookingSection) {
        e.preventDefault();
        bookingSection.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        bookingSection.classList.add('is-highlighted');
        setTimeout(() => bookingSection.classList.remove('is-highlighted'), 1600);
        if (dateInput) {
          setTimeout(() => dateInput.focus({ preventScroll: true }), 350);
        }
      }
    });
  });

  const progressEl = document.getElementById('scroll-progress');
  const supportsScrollTimeline = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline', 'scroll()');
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (progressEl && !supportsScrollTimeline && !prefersReduced) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const pct = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
          progressEl.style.transform = `scaleX(${pct})`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function selectSlot(slotValue, activeBtn) {
    if (!slotsWrapper || !selectedTimeInput) return;
    slotsWrapper.querySelectorAll('.slot-btn').forEach((btn) => {
      const isSelected = btn === activeBtn;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
    selectedTimeInput.value = slotValue;
    setFeedback('', 'info');
    updateBookingSummary();
  }

  async function fetchAvailabilityForDate(selectedDate, externalSignal) {
    if (!selectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      return { available: false, slots: [], reason: 'Please provide a valid date in YYYY-MM-DD format.' };
    }

    renderSlotStatus('Checking live schedule...', false);
    if (selectedTimeInput) selectedTimeInput.value = '';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    if (externalSignal) {
      if (externalSignal.aborted) {
        clearTimeout(timeoutId);
        controller.abort();
      } else {
        externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    try {
      const res = await fetch(`/api/availability?date=${encodeURIComponent(selectedDate)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid schedule payload');
      }

      if (!data.available || !Array.isArray(data.slots) || data.slots.length === 0) {
        const reason = typeof data.reason === 'string' && data.reason
          ? data.reason
          : 'No available slots for this date. Please choose another day.';
        renderSlotStatus(`⚠️ ${reason}`, true);
        return { available: false, slots: [], reason };
      }

      // ⚡ Bolt: Batch DOM insertions with DocumentFragment
      const fragment = document.createDocumentFragment();
      data.slots.forEach((slot) => {
        if (typeof slot !== 'string') return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot-btn';
        btn.dataset.slot = slot;
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = formatTime(slot);
        btn.addEventListener('click', () => selectSlot(slot, btn));
        fragment.appendChild(btn);
      });

      slotsWrapper.replaceChildren(fragment);
      return { available: true, date: selectedDate, slots: data.slots };
    } catch (err) {
      renderSlotStatus('Error loading schedule. Please text (972) 445-7413 directly.', true);
      if (externalSignal && externalSignal.aborted) {
        throw err;
      }
      return {
        available: false,
        slots: [],
        error: 'Unable to load live schedule. Please call or text (972) 445-7413.'
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function submitBookingPayload(payload) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await res.json();
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid booking response');
      }
      return result;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    dateInput.addEventListener('change', (e) => {
      const selectedDate = e.target.value;
      updateBookingSummary();
      if (!selectedDate) return;
      fetchAvailabilityForDate(selectedDate);
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setFeedback('', 'info');

      const serviceType = document.getElementById('service_type')?.value || '';
      const appointmentDate = dateInput ? dateInput.value : '';
      const appointmentTime = selectedTimeInput ? selectedTimeInput.value : '';
      const clientName = document.getElementById('client_name')?.value.trim() || '';
      const clientPhone = document.getElementById('client_phone')?.value.trim() || '';
      const deviceModel = document.getElementById('device_model')?.value.trim() || '';
      const issueDescription = document.getElementById('issue_description')?.value.trim() || '';

      const missing = [];
      if (!appointmentDate) missing.push('appointment_date (choose a preferred date)');
      if (!appointmentTime) missing.push('appointment_time (select an available time slot)');
      if (!clientName) missing.push('name (enter your full name)');
      if (!clientPhone) missing.push('phone (enter a call or text phone number)');
      if (!issueDescription) missing.push('issue_description (describe the computer or network issue)');

      if (missing.length > 0) {
        const errMsg = !appointmentTime
          ? 'Please select an available appointment time slot before confirming.'
          : 'Please complete all required fields: ' + missing.join(', ');
        setFeedback(errMsg, 'error');
        if (!appointmentTime && slotsWrapper) {
          const firstSlot = slotsWrapper.querySelector('.slot-btn');
          if (firstSlot) firstSlot.focus();
        }
        if (event.agentInvoked && typeof event.respondWith === 'function') {
          event.respondWith(Promise.resolve('Validation failed: ' + missing.join(', ')));
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Securing Appointment...';
      }

      const payload = {
        service_type: serviceType,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        name: clientName,
        phone: clientPhone,
        device_model: deviceModel,
        issue_description: issueDescription
      };

      const bookingOperation = (async () => {
        try {
          const result = await submitBookingPayload(payload);
          if (result.success) {
            bookingForm.hidden = true;
            if (successTicket) {
              successTicket.textContent = `Ticket ID: ${result.ticket}`;
            }
            if (bookingSuccess) {
              bookingSuccess.hidden = false;
              bookingSuccess.focus();
            }
            return {
              status: 'confirmed',
              ticket: result.ticket,
              appointment_date: appointmentDate,
              appointment_time: appointmentTime
            };
          } else {
            const errText = 'Booking error: ' + (result.error || 'Please call or text (972) 445-7413 directly.');
            setFeedback(errText, 'error');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Confirm & Dispatch Appointment';
            }
            return { error: errText };
          }
        } catch {
          const netErr = 'Connection error while securing appointment. Please call or text (972) 445-7413.';
          setFeedback(netErr, 'error');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm & Dispatch Appointment';
          }
          return { error: netErr };
        }
      })();

      if (event.agentInvoked && typeof event.respondWith === 'function') {
        event.respondWith(bookingOperation);
      }
    });
  }

  // 🤖 WebMCP Imperative Tool Registration (document.modelContext)
  const mc = (typeof document !== 'undefined' && document.modelContext) ||
    (typeof navigator !== 'undefined' && navigator.modelContext);
  if (mc && typeof mc.registerTool === 'function') {
    const webMcpController = new AbortController();
    const registerSupportTools = () => {
      try {
        mc.registerTool({
          name: 'check_support_availability',
          description: 'Checks live technician appointment availability for a specific date and populates the page time-slot selector. Use before booking an appointment.',
          inputSchema: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                description: 'Preferred appointment date in YYYY-MM-DD format.'
              }
            },
            required: ['date']
          },
          execute: async ({ date } = {}, { signal } = {}) => {
            if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              return { error: 'Pass a valid date in YYYY-MM-DD format.' };
            }
            if (dateInput) {
              dateInput.value = date;
            }
            return await fetchAvailabilityForDate(date, signal);
          },
          annotations: { readOnlyHint: true }
        }, { signal: webMcpController.signal });
      } catch (e) {
        console.error('Failed to register support WebMCP tool:', e);
      }
    };

    if (typeof window !== 'undefined' && typeof window.requestIdleCallback !== 'undefined') {
      window.requestIdleCallback(registerSupportTools);
    } else {
      setTimeout(registerSupportTools, 0);
    }
  }
})();
