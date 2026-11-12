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

  const I18N = {
    en: {
      'nav.main': 'daca.me Main Lab',
      'nav.services': 'Services',
      'nav.quote': 'Quote Estimator',
      'nav.book': 'Live Booking',
      'nav.text': '💬 Text Us',
      'hero.badge': 'DISPATCH READY // SERVING IRVING, LAS COLINAS & DFW',
      'hero.title': 'Fast, Honest Computer Repair & Tech Support in Irving, TX.',
      'hero.subtitle': 'On-site service and remote diagnostics for slow laptops, Blue Screen crashes, broken home Wi-Fi, and custom workstations. Direct, personal support with zero big-box retail markup. Se habla Español.',
      'hero.ctaCall': '📞 Call (972) 445-7413',
      'hero.ctaBook': '⚡ Book Service Online',
      'trust.onsite': '✔ On-Site & Remote Available',
      'trust.exp': '✔ 10+ Years Systems Experience',
      'trust.pricing': '✔ Transparent Pricing Before Work Starts',
      'trust.bilingual': '✔ Bilingual (English / Español)',
      'hud.online': 'ONLINE',
      'hud.sla': '< 15m Call / SMS',
      'hud.fees': '$0 Hidden Fees',
      'hud.hours': 'HOURS: M–F 9a–8p · Sat 9a–7p · Sun 10a–6p',
      'services.kicker': '// REPAIR & SUPPORT SERVICES',
      'services.heading': 'Common Problems We Solve Daily',
      'card1.num': '01 // DIAGNOSTICS & SPEED-UP',
      'card1.title': 'Computer Repair & Crash Recovery',
      'card1.desc': 'Fixing Blue Screens of Death (BSOD), boot loops, malware removal, and thermal cleaning.',
      'card1.li1': 'Event Viewer & Minidump crash trace',
      'card1.li2': 'DISM / SFC OS corruption repair',
      'card1.li3': 'Thermal paste & fan dust service',
      'card1.cta': 'Book Fix',
      'card2.num': '02 // HARDWARE UPGRADES',
      'card2.title': 'SSD Speed Swaps & Memory',
      'card2.desc': 'Transform sluggish computers into sub-10-second booters. Exact drive cloning with zero data loss.',
      'card2.li1': 'NVMe / SATA SSD sector-level clone',
      'card2.li2': 'DDR4 / DDR5 dual-channel RAM tune',
      'card2.li3': 'BIOS & firmware optimization',
      'card2.cta': 'Upgrade',
      'card3.num': '03 // HOME & OFFICE NETWORK',
      'card3.title': 'Wi-Fi & Mesh Network Setup',
      'card3.desc': 'Eliminate dead zones, install secure Wi-Fi 6 mesh routers, and fix printer connectivity drops.',
      'card3.li1': 'Wi-Fi 6 / 6E mesh node placement',
      'card3.li2': 'WPA3 security & guest VLAN isolation',
      'card3.li3': 'Static IP printer & NAS binding',
      'card3.cta': 'Setup Wi-Fi',
      'card4.num': '04 // CUSTOM HARDWARE',
      'card4.title': 'Workstations & Custom Builds',
      'card4.desc': 'High-performance PCs built for DaVinci Resolve editing, creative studios, and gaming.',
      'card4.li1': 'Airflow & acoustic fan-curve tuning',
      'card4.li2': 'OCCT / Prime95 24-hour burn-in test',
      'card4.li3': 'Clean Windows / Linux OS imaging',
      'card4.cta': 'Build PC',
      'quote.kicker': '// TRANSPARENT PRICING ENGINE',
      'quote.heading': 'Instant Service Quote Estimator',
      'quote.subtitle': 'Configure your service, dispatch zone, and optional add-ons to preview your total before booking.',
      'quote.serviceLabel': '1. Primary Service',
      'quote.opt1': 'Computer Repair & Crash Recovery ($79 base)',
      'quote.opt2': 'SSD / RAM Speed Upgrade ($99 labor)',
      'quote.opt3': 'Wi-Fi & Mesh Network Setup ($129 flat)',
      'quote.opt4': 'Custom PC / Workstation Build ($149)',
      'quote.opt5': 'Remote Tech Consultation ($49)',
      'quote.zoneLabel': '2. Dispatch Mode & Zone',
      'quote.zoneRemote': 'Remote / Drop-Off',
      'quote.zoneIrving': 'On-Site Irving / Las Colinas',
      'quote.zoneDfw': 'Extended DFW Travel',
      'quote.addonsLabel': '3. Optional Add-Ons',
      'quote.addonPriority': 'Same-Day Priority Dispatch',
      'quote.addonBackup': 'Full Drive Backup & Verification',
      'quote.addonThermal': 'Thermal Paste & Deep Fan Clean',
      'quote.noFees': '$0 HIDDEN FEES',
      'quote.totalLabel': 'ESTIMATED TOTAL (LABOR)',
      'quote.baseRow': 'Base Service:',
      'quote.dispatchRow': 'Dispatch / Travel:',
      'quote.addonsRow': 'Selected Add-Ons:',
      'quote.applyBtn': 'Lock Estimate & Book Slot →',
      'quote.note': 'Hardware parts (if needed) are quoted separately at exact cost before purchase.',
      'book.kicker': '// AUTOMATED APPOINTMENT DISPATCH',
      'book.heading': 'Schedule a Diagnostic or Service Call',
      'book.subPre': 'Pick a date to check live availability. Need urgent help? Call or text',
      'book.subPost': 'directly.',
      'book.sumSvc': 'SERVICE:',
      'book.sumWin': 'WINDOW:',
      'book.step1': 'STEP 01 // SERVICE & WINDOW',
      'book.lblService': 'Select Service Needed',
      'book.lblDate': 'Choose Preferred Date',
      'book.errDate': '❌ Please select a valid appointment date.',
      'book.lblSlots': 'Available Appointment Slots',
      'book.slotPrompt': 'Select a date above to load live open slots...',
      'book.step2': 'STEP 02 // DISPATCH DETAILS',
      'book.lblName': 'Your Full Name',
      'book.errName': '❌ Please enter your full name.',
      'book.lblPhone': 'Phone Number (Call or Text)',
      'book.phoneHint': 'Format: 10-digit US phone number for dispatch text updates',
      'book.errPhone': '❌ Please enter a valid phone number so dispatch can confirm your slot.',
      'book.lblDevice': 'Device Model (Optional)',
      'book.lblIssue': 'Describe the Issue',
      'book.phIssue': 'What symptoms are you noticing? (Blue screen, slow boot, no Wi-Fi, etc.)',
      'book.errIssue': '❌ Please briefly describe the symptoms or service needed.',
      'book.submit': 'Confirm & Dispatch Appointment',
      'book.successTitle': 'Appointment Confirmed!',
      'book.successDesc': 'Your service ticket has been routed to dispatch. Hugo will follow up via text at your phone number prior to your appointment window.',
      'book.done': 'Done',
      'pedigree.kicker': '// ENGINEERING INTEGRITY',
      'pedigree.title': 'Enterprise-Grade Skill. Neighborhood Care.',
      'pedigree.p1': 'When you call a big-box retail electronics store, your device is handed to a junior retail clerk following a basic script. At Irving Computer & Tech Support, your systems are diagnosed by an active systems infrastructure and security specialist.',
      'pedigree.p2': 'Looking for my enterprise security architecture, DaedalusX64 open-source work, or live edge MCP telemetry?',
      'pedigree.link': 'View the Main Systems Portfolio & Lab →',
      'footer.serving': 'Serving Irving, Las Colinas, Coppell, and DFW Metroplex.',
      'footer.hours': 'Hours: Mon–Fri: 9:00 AM – 8:00 PM | Sat: 9:00 AM – 7:00 PM | Sun: 10:00 AM – 6:00 PM',
      'footer.maps': 'Find us on Google Maps',
      'dyn.pickSlot': 'pick a slot',
      'dyn.selectWindow': 'Select date & time slot',
      'dyn.checkingSlots': 'Checking live schedule...',
      'dyn.securing': 'Securing Appointment...'
    },
    es: {
      'nav.main': 'Laboratorio Principal',
      'nav.services': 'Servicios',
      'nav.quote': 'Cotizador',
      'nav.book': 'Reservar Cita',
      'nav.text': '💬 Enviar SMS',
      'hero.badge': 'LISTO PARA DESPACHO // IRVING, LAS COLINAS Y DFW',
      'hero.title': 'Reparación de Computadoras y Soporte Técnico Honesto en Irving, TX.',
      'hero.subtitle': 'Servicio a domicilio y diagnóstico remoto para laptops lentas, pantallas azules (BSOD), Wi-Fi con fallas y estaciones de trabajo. Atención directa sin precios inflados. Se habla Español.',
      'hero.ctaCall': '📞 Llamar (972) 445-7413',
      'hero.ctaBook': '⚡ Reservar en Línea',
      'trust.onsite': '✔ Servicio a Domicilio y Remoto',
      'trust.exp': '✔ 10+ Años de Experiencia en Sistemas',
      'trust.pricing': '✔ Precio Transparente Antes de Iniciar',
      'trust.bilingual': '✔ Bilingüe (Inglés / Español)',
      'hud.online': 'EN LÍNEA',
      'hud.sla': '< 15m Llamada / SMS',
      'hud.fees': '$0 Cargos Ocultos',
      'hud.hours': 'HORARIO: L–V 9a–8p · Sáb 9a–7p · Dom 10a–6p',
      'services.kicker': '// SERVICIOS DE REPARACIÓN Y SOPORTE',
      'services.heading': 'Problemas Comunes Que Resolvemos Diario',
      'card1.num': '01 // DIAGNÓSTICO Y OPTIMIZACIÓN',
      'card1.title': 'Reparación de PC y Recuperación',
      'card1.desc': 'Solución de pantallas azules (BSOD), reinicios en bucle, eliminación de virus y limpieza térmica.',
      'card1.li1': 'Análisis de Minidump y visor de eventos',
      'card1.li2': 'Reparación de sistema DISM / SFC',
      'card1.li3': 'Pasta térmica y limpieza de ventiladores',
      'card1.cta': 'Reservar',
      'card2.num': '02 // MEJORAS DE HARDWARE',
      'card2.title': 'Cambio a SSD y Memoria RAM',
      'card2.desc': 'Convierte equipos lentos en arranques de menos de 10 segundos. Clonación exacta sin perder datos.',
      'card2.li1': 'Clonación sector por sector NVMe / SATA',
      'card2.li2': 'Ajuste de memoria RAM DDR4 / DDR5',
      'card2.li3': 'Optimización de BIOS y firmware',
      'card2.cta': 'Mejorar',
      'card3.num': '03 // REDES DE HOGAR Y OFICINA',
      'card3.title': 'Configuración Wi-Fi y Red Mesh',
      'card3.desc': 'Elimina zonas sin señal, instala routers Wi-Fi 6 seguros y corrige desconexiones de impresoras.',
      'card3.li1': 'Ubicación óptima de nodos Wi-Fi 6 / 6E',
      'card3.li2': 'Seguridad WPA3 y red VLAN de invitados',
      'card3.li3': 'IP estática para impresoras y NAS',
      'card3.cta': 'Configurar Wi-Fi',
      'card4.num': '04 // HARDWARE A LA MEDIDA',
      'card4.title': 'Estaciones de Trabajo y PCs Custom',
      'card4.desc': 'Equipos de alto rendimiento armados para edición DaVinci Resolve, estudios creativos y gaming.',
      'card4.li1': 'Flujo de aire y curva silenciosa de ventiladores',
      'card4.li2': 'Prueba de estabilidad OCCT / Prime95 24h',
      'card4.li3': 'Instalación limpia de Windows / Linux',
      'card4.cta': 'Armar PC',
      'quote.kicker': '// MOTOR DE PRECIOS TRANSPARENTES',
      'quote.heading': 'Cotizador Instantáneo de Servicio',
      'quote.subtitle': 'Configura tu servicio, zona de atención y extras opcionales para ver el total antes de reservar.',
      'quote.serviceLabel': '1. Servicio Principal',
      'quote.opt1': 'Reparación y Diagnóstico de PC ($79 base)',
      'quote.opt2': 'Mejora de SSD / Memoria RAM ($99 mano de obra)',
      'quote.opt3': 'Configuración Wi-Fi y Red Mesh ($129 fijo)',
      'quote.opt4': 'Armado de PC / Workstation ($149)',
      'quote.opt5': 'Consulta Técnica Remota ($49)',
      'quote.zoneLabel': '2. Modalidad y Zona de Atención',
      'quote.zoneRemote': 'Remoto / Entrega en Taller',
      'quote.zoneIrving': 'A Domicilio Irving / Las Colinas',
      'quote.zoneDfw': 'Traslado DFW Extendido',
      'quote.addonsLabel': '3. Extras Opcionales',
      'quote.addonPriority': 'Atención Prioritaria el Mismo Día',
      'quote.addonBackup': 'Respaldo Completo y Verificación de Disco',
      'quote.addonThermal': 'Pasta Térmica y Limpieza Profunda',
      'quote.noFees': '$0 CARGOS OCULTOS',
      'quote.totalLabel': 'TOTAL ESTIMADO (MANO DE OBRA)',
      'quote.baseRow': 'Servicio Base:',
      'quote.dispatchRow': 'Traslado / Zona:',
      'quote.addonsRow': 'Extras Seleccionados:',
      'quote.applyBtn': 'Fijar Cotización y Reservar Cita →',
      'quote.note': 'Las piezas de hardware (si se requieren) se cotizan aparte al costo exacto antes de comprar.',
      'book.kicker': '// DESPACHO AUTOMATIZADO DE CITAS',
      'book.heading': 'Programa un Diagnóstico o Servicio',
      'book.subPre': 'Elige una fecha para ver disponibilidad en vivo. ¿Urgencia? Llama o envía SMS al',
      'book.subPost': 'directamente.',
      'book.sumSvc': 'SERVICIO:',
      'book.sumWin': 'HORARIO:',
      'book.step1': 'PASO 01 // SERVICIO Y HORARIO',
      'book.lblService': 'Selecciona el Servicio',
      'book.lblDate': 'Elige Fecha Preferida',
      'book.errDate': '❌ Por favor selecciona una fecha válida.',
      'book.lblSlots': 'Horarios Disponibles',
      'book.slotPrompt': 'Selecciona una fecha arriba para cargar horarios...',
      'book.step2': 'PASO 02 // DATOS DE CONTACTO',
      'book.lblName': 'Nombre Completo',
      'book.errName': '❌ Por favor ingresa tu nombre completo.',
      'book.lblPhone': 'Teléfono (Llamada o SMS)',
      'book.phoneHint': 'Formato: número de EE. UU. de 10 dígitos para confirmación por SMS',
      'book.errPhone': '❌ Ingresa un teléfono válido para confirmar tu cita.',
      'book.lblDevice': 'Modelo del Equipo (Opcional)',
      'book.lblIssue': 'Describe el Problema',
      'book.phIssue': '¿Qué síntomas notas? (Pantalla azul, lentitud, sin Wi-Fi, etc.)',
      'book.errIssue': '❌ Describe brevemente los síntomas o el servicio requerido.',
      'book.submit': 'Confirmar y Enviar Cita',
      'book.successTitle': '¡Cita Confirmada!',
      'book.successDesc': 'Tu ticket fue enviado a despacho. Hugo te enviará un mensaje de texto a tu número antes de tu horario.',
      'book.done': 'Listo',
      'pedigree.kicker': '// INTEGRIDAD DE INGENIERÍA',
      'pedigree.title': 'Nivel Empresarial. Trato Cercano.',
      'pedigree.p1': 'Cuando llamas a una gran tienda comercial, tu equipo termina con un empleado siguiendo un guion básico. En Irving Computer & Tech Support, tus sistemas son diagnosticados por un especialista activo en infraestructura y seguridad.',
      'pedigree.p2': '¿Buscas mi arquitectura de seguridad empresarial, DaedalusX64 o telemetría MCP en el borde?',
      'pedigree.link': 'Ver Portafolio Principal y Laboratorio →',
      'footer.serving': 'Sirviendo a Irving, Las Colinas, Coppell y el Metroplex de DFW.',
      'footer.hours': 'Horario: Lun–Vie: 9:00 AM – 8:00 PM | Sáb: 9:00 AM – 7:00 PM | Dom: 10:00 AM – 6:00 PM',
      'footer.maps': 'Encuéntranos en Google Maps',
      'dyn.pickSlot': 'elige horario',
      'dyn.selectWindow': 'Selecciona fecha y horario',
      'dyn.checkingSlots': 'Consultando horario en vivo...',
      'dyn.securing': 'Confirmando Cita...'
    }
  };

  let currentLang = 'en';
  function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || (I18N.en && I18N.en[key]) || key;
  }

  function setLanguage(lang) {
    currentLang = lang === 'es' ? 'es' : 'en';
    document.documentElement.lang = currentLang;
    document.querySelectorAll('.lang-btn[data-lang]').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === currentLang ? 'true' : 'false');
    });
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key && I18N[currentLang][key]) {
        el.textContent = I18N[currentLang][key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && I18N[currentLang][key]) {
        el.setAttribute('placeholder', I18N[currentLang][key]);
      }
    });
    try {
      localStorage.setItem('daca_support_lang', currentLang);
    } catch {}
    updateBookingSummary();
  }

  document.querySelectorAll('.lang-btn[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang')));
  });

  // Instant Quote Estimator
  const quoteServiceEl = document.getElementById('quote-service');
  const quoteBaseVal = document.getElementById('quote-base-val');
  const quoteDispatchVal = document.getElementById('quote-dispatch-val');
  const quoteAddonsVal = document.getElementById('quote-addons-val');
  const quoteTotalVal = document.getElementById('quote-total-val');
  const quoteApplyBtn = document.getElementById('quote-apply-btn');

  function getQuoteState() {
    let base = 79;
    let serviceName = 'Computer Repair & Diagnostic';
    if (quoteServiceEl) {
      const opt = quoteServiceEl.options[quoteServiceEl.selectedIndex];
      serviceName = quoteServiceEl.value || serviceName;
      base = parseInt(opt?.getAttribute('data-base') || '79', 10) || 79;
    }
    const checkedDispatch = document.querySelector('input[name="quote_dispatch"]:checked');
    const dispatchFee = parseInt(checkedDispatch?.getAttribute('data-fee') || '0', 10) || 0;
    const dispatchZone = checkedDispatch ? checkedDispatch.value : 'remote';

    let addonsFee = 0;
    const selectedAddons = [];
    document.querySelectorAll('.quote-addon-cb:checked').forEach((cb) => {
      addonsFee += parseInt(cb.getAttribute('data-fee') || '0', 10) || 0;
      selectedAddons.push(cb.value);
    });

    return {
      serviceName,
      base,
      dispatchFee,
      dispatchZone,
      addonsFee,
      selectedAddons,
      total: base + dispatchFee + addonsFee
    };
  }

  function updateQuoteEstimator() {
    const q = getQuoteState();
    if (quoteBaseVal) quoteBaseVal.textContent = `$${q.base}`;
    if (quoteDispatchVal) quoteDispatchVal.textContent = `$${q.dispatchFee}`;
    if (quoteAddonsVal) quoteAddonsVal.textContent = `$${q.addonsFee}`;
    if (quoteTotalVal) quoteTotalVal.textContent = `$${q.total}`;
  }

  if (quoteServiceEl) quoteServiceEl.addEventListener('change', updateQuoteEstimator);
  document.querySelectorAll('input[name="quote_dispatch"], .quote-addon-cb').forEach((el) => {
    el.addEventListener('change', updateQuoteEstimator);
  });

  if (quoteApplyBtn) {
    quoteApplyBtn.addEventListener('click', () => {
      const q = getQuoteState();
      if (serviceSelect) {
        serviceSelect.value = q.serviceName;
        updateBookingSummary();
      }
      const issueEl = document.getElementById('issue_description');
      if (issueEl) {
        const addonsText = q.selectedAddons.length ? q.selectedAddons.join(', ') : 'None';
        const tag = `[Quote Estimate: $${q.total} | Zone: ${q.dispatchZone} | Add-ons: ${addonsText}]`;
        const cleaned = issueEl.value.replace(/\[Quote Estimate:[^\]]*\]\s*/g, '').trim();
        issueEl.value = cleaned ? `${tag}\n${cleaned}` : `${tag} `;
      }
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        bookingSection.classList.add('is-highlighted');
        setTimeout(() => bookingSection.classList.remove('is-highlighted'), 1600);
        if (dateInput) {
          setTimeout(() => dateInput.focus({ preventScroll: true }), 350);
        }
      }
    });
  }

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
        summaryWindow.textContent = `${dateVal} (${t('dyn.pickSlot')})`;
      } else {
        summaryWindow.textContent = t('dyn.selectWindow');
      }
    }
  }

  try {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    const savedLang = urlLang || localStorage.getItem('daca_support_lang');
    if (savedLang === 'es' || savedLang === 'en') {
      setLanguage(savedLang);
    }
  } catch {}
  updateQuoteEstimator();

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
