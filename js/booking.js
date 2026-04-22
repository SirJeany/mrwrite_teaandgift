/* ============================================================
   BOOKING PAGE - JavaScript
   ============================================================
   Handles:
     1. Two-day rule: date min = today + 2 days
     2. Dynamic time slots based on selected day of week
     3. Brew progress bar tracking
     4. Dual-action submit: WhatsApp + Email
     5. Real-time button enable/disable based on validity
     6. WhatsApp wa.me link generation
     7. Email modal with mailto: link generation
   ============================================================ */

'use strict';

// ----------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------
const WHATSAPP_NUMBER = '27724734157';
const SHOP_EMAIL = 'cafe@mrwrite.co.za';

document.addEventListener('DOMContentLoaded', () => {
  initDatePicker();
  initTimeSlots();
  initBrewProgress();
  initGuestCountValidation()
  initSubmitButtons();
  initWhatsApp();
  initEmailModal();
});

// ----------------------------------------------------------
// 1. DATE PICKER - Two-day rule enforcement
// ----------------------------------------------------------
function initDatePicker() {
  const dateInput = document.getElementById('bookingDate');
  if (!dateInput) return;

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 2);

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  dateInput.setAttribute('min', formatDate(minDate));

  // Max date: 3 months from now
  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 3);
  dateInput.setAttribute('max', formatDate(maxDate));
}

// ----------------------------------------------------------
// 2. TIME SLOTS - Dynamic based on day of week + hours.json
// ----------------------------------------------------------
function initTimeSlots() {
  const dateInput = document.getElementById('bookingDate');
  const timeSelect = document.getElementById('bookingTime');
  if (!dateInput || !timeSelect) return;

  /** Fallback time slots in case hours.json fails to load */
  const fallbackSlots = {
    weekday: {
      groupLabel: '\uD83C\uDF0A Weekday Sittings (Mon-Fri)',
      slots: [
        { value: '07:30', label: '7:30 AM - The Early Bird Brew' },
        { value: '08:30', label: '8:30 AM - The Dawn Patrol Cuppa' },
        { value: '09:30', label: '9:30 AM - Morning Mist Brew' },
        { value: '10:30', label: '10:30 AM - Mid-Morning Pick-Me-Up' },
        { value: '11:30', label: '11:30 AM - Elevenses (Obviously!)' },
        { value: '12:30', label: '12:30 PM - Noon-Tea Delight' },
        { value: '13:30', label: '1:30 PM - Afternoon Anchor' },
        { value: '14:30', label: '2:30 PM - The Classic High Tea Hour' }
      ]
    },
    saturday: {
      groupLabel: '☀️ Saturday Sittings',
      slots: [
        { value: '07:30', label: '7:30 AM - The Early Bird Brew' },
        { value: '08:30', label: '8:30 AM - Early Bird Market-Goer' },
        { value: '09:30', label: '9:30 AM - Saturday Stroll & Sip' },
        { value: '10:30', label: '10:30 AM - Weekend Wind-Down' },
        { value: '11:30', label: '11:30 AM - Brunch-Hour Bliss' },
        { value: '12:30', label: '12:30 PM - Midday Indulgence' },
        { value: '13:00', label: '1:00 PM - Last Call for Tea' }
      ]
    }
  };

  let timeSlots = fallbackSlots;

  // Listen for hours data from main.js
  window.addEventListener('shopHoursLoaded', (e) => {
    if (e.detail && e.detail.timeSlots) {
      timeSlots = e.detail.timeSlots;
    }
  });

  dateInput.addEventListener('change', () => {
    const selectedDate = new Date(dateInput.value + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();

    // Sunday - shop is closed
    if (dayOfWeek === 0) {
      timeSelect.innerHTML = '';
      timeSelect.disabled = true;

      const closed = document.createElement('option');
      closed.value = '';
      closed.textContent = '\u2615 Sorry, we\'re closed on Sundays!';
      closed.disabled = true;
      closed.selected = true;
      timeSelect.appendChild(closed);

      dateInput.value = '';
      dateInput.setCustomValidity('We\'re closed on Sundays \u2014 please choose another day.');
      dateInput.reportValidity();
      checkFormValidity();
      updateBrewProgress();
      return;
    }

    dateInput.setCustomValidity('');
    const slotSet = dayOfWeek === 6 ? timeSlots.saturday : timeSlots.weekday;

    timeSelect.innerHTML = '';
    timeSelect.disabled = false;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose your sitting...';
    placeholder.disabled = true;
    placeholder.selected = true;
    timeSelect.appendChild(placeholder);

    const group = document.createElement('optgroup');
    group.label = slotSet.groupLabel;

    slotSet.slots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot.value;
      option.textContent = slot.label;
      group.appendChild(option);
    });

    timeSelect.appendChild(group);
    checkFormValidity();
    updateBrewProgress();
  });
}

// ----------------------------------------------------------
// 3. BREW PROGRESS BAR - Tracks form completion
// ----------------------------------------------------------
const TRACKED_FIELDS = ['name', 'date', 'time', 'guests', 'package'];
const PROGRESS_MESSAGES = [
  'Let\'s start brewing...',
  'The kettle\'s on...',
  'Water\'s warming up...',
  'Almost steeped...',
  'Just adding the milk...',
  'Perfect brew! ☕'
];

function initBrewProgress() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('input', () => {
    updateBrewProgress();
    checkFormValidity();
  });
  form.addEventListener('change', () => {
    updateBrewProgress();
    checkFormValidity();
  });
}

function updateBrewProgress() {
  const filled = countFilledFields();
  const total = TRACKED_FIELDS.length;
  const pct = Math.round((filled / total) * 100);

  const fillEl = document.getElementById('brewProgressFill');
  const textEl = document.getElementById('brewProgressText');
  const pctEl = document.getElementById('brewProgressPct');

  if (fillEl) fillEl.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (textEl) textEl.textContent = PROGRESS_MESSAGES[filled] || PROGRESS_MESSAGES[PROGRESS_MESSAGES.length - 1];

  const cups = document.querySelectorAll('.brew-cup');
  cups.forEach((cup, idx) => {
    if (idx < filled) {
      cup.classList.add('filled');
    } else {
      cup.classList.remove('filled');
    }
  });
}

function initGuestCountValidation() {
  const guestInput = document.getElementById('guestCount');
    if (!guestInput) return;

    // Ensure the feedback element has an id for ARIA
    const fb = guestInput.nextElementSibling; // assumes the invalid-feedback div follows the input
    if (fb && !fb.id) fb.id = 'guestCountFeedback';

    guestInput.setAttribute('aria-describedby', fb?.id || '');
    guestInput.addEventListener('input', validateGuestCountRealtime);
    guestInput.addEventListener('blur', validateGuestCountRealtime);

    function validateGuestCountRealtime() {
      const val = parseInt(guestInput.value, 10);
      const isValid = !isNaN(val) && val >= 1 && val <= 12;

      if (!isValid) {
        guestInput.classList.add('is-invalid');
        guestInput.classList.remove('is-valid');
        guestInput.setAttribute('aria-invalid', 'true');
        if (fb) fb.classList.add('d-block');
      } else {
        guestInput.classList.remove('is-invalid');
        guestInput.classList.add('is-valid');
        guestInput.setAttribute('aria-invalid', 'false');
        if (fb) fb.classList.remove('d-block');
      }

      // Re-run the form-completion check so submit buttons enable/disable correctly
      if (typeof checkFormValidity === 'function') checkFormValidity();
    }
}

function countFilledFields() {
  let count = 0;

  const name = document.getElementById('guestName');
  if (name && name.value.trim().length > 0) count++;

  const date = document.getElementById('bookingDate');
  if (date && date.value) count++;

  const time = document.getElementById('bookingTime');
  if (time && time.value) count++;

  const guests = document.getElementById('guestCount');
  if (guests && guests.value && parseInt(guests.value) >= 1 && parseInt(guests.value) <= 12) count++;

  const pkg = document.querySelector('input[name="package"]:checked');
  if (pkg) count++;

  return count;
}

// ----------------------------------------------------------
// 4. SUBMIT BUTTONS - Enable/disable based on form validity
// ----------------------------------------------------------

/**
 * Checks if all required booking fields are filled correctly.
 * Enables or disables the WhatsApp & Email buttons accordingly.
 */
function checkFormValidity() {
  const btnWA = document.getElementById('btnWhatsApp');
  const btnEmail = document.getElementById('btnEmail');
  const instruction = document.getElementById('submitInstruction');
  if (!btnWA || !btnEmail) return;

  const isValid = isFormComplete();

  btnWA.disabled = !isValid;
  btnEmail.disabled = !isValid;

  if (instruction) {
    if (isValid) {
      instruction.innerHTML = '<i class="bi bi-unlock-fill"></i> All set! Choose how you\'d like to send your booking';
      instruction.classList.add('unlocked');
    } else {
      instruction.innerHTML = '<i class="bi bi-lock-fill"></i> Complete all fields above to unlock your booking options';
      instruction.classList.remove('unlocked');
    }
  }
}

/**
 * Validates all required fields without triggering Bootstrap validation UI.
 * Returns true only when every required field has a valid value.
 */
function isFormComplete() {
  const name = document.getElementById('guestName');
  if (!name || name.value.trim().length === 0) return false;

  const date = document.getElementById('bookingDate');
  if (!date || !date.value) return false;

  // enforce two-day rule in JS
 const min = date.getAttribute('min');
 if (min) {
   const chosen = new Date(date.value + 'T00:00:00');
   const minDate = new Date(min + 'T00:00:00');
   if (chosen < minDate) return false;
 }

  const time = document.getElementById('bookingTime');
  if (!time || !time.value) return false;

  const guests = document.getElementById('guestCount');
  const guestVal = parseInt(guests?.value);
  if (!guests || isNaN(guestVal) || guestVal < 1 || guestVal > 12) return false;

  const pkg = document.querySelector('input[name="package"]:checked');
  if (!pkg) return false;

  return true;
}

function initSubmitButtons() {
  // Run initial check on load (all disabled)
  checkFormValidity();
}

// ----------------------------------------------------------
// 5. WHATSAPP INTEGRATION - wa.me link with formatted message
// ----------------------------------------------------------
function initWhatsApp() {
  const btnWA = document.getElementById('btnWhatsApp');
  if (!btnWA) return;

  btnWA.addEventListener('click', () => {
    if (!isFormComplete()) return;

    const data = getBookingData();
    const message = buildWhatsAppMessage(data);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab
    window.open(url, '_blank');

    // Show success modal
    populateSuccessDetails(data, 'WhatsApp');
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
  });
}

/**
 * Builds a formatted WhatsApp message using WA markdown.
 */
function buildWhatsAppMessage(data) {
  let msg = `*High Tea Booking Request*\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `*Name:* ${data.name}\n`;
  msg += `*Date & Time:* ${data.formattedDate} ${data.timeValue}\n`;
  msg += `*Guests:* ${data.guests}\n`;
  msg += `*Package:* ${data.packageName}\n`;

  if (data.notes) {
    msg += `\n*Dietary / Special Requests:*\n${data.notes}\n`;
  }

  msg += `\n━━━━━━━━━━━━━━━━━━\n`;

  return msg;
}

// ----------------------------------------------------------
// 6. EMAIL INTEGRATION - Modal + mailto: link
// ----------------------------------------------------------
function initEmailModal() {
  const btnEmail = document.getElementById('btnEmail');
  const btnSendMail = document.getElementById('btnSendMail');
  if (!btnEmail) return;

  btnEmail.addEventListener('click', () => {
    if (!isFormComplete()) return;

    // Populate the email modal summary preview
    const data = getBookingData();
    const summaryEl = document.getElementById('emailSummary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <p class="email-summary-title"><i class="bi bi-card-checklist"></i> Your Booking Summary</p>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Date & Time:</strong> ${data.formattedDate} ${escapeHtml(data.timeValue)}</p>
        <p><strong>Guests:</strong> ${data.guests}</p>
        <p><strong>Package:</strong> ${data.packageName}</p>
        ${data.notes ? `<p><strong>Notes:</strong> ${escapeHtml(data.notes)}</p>` : ''}
      `;
    }

    // Clear previous email input
    const emailInput = document.getElementById('userEmail');
    if (emailInput) emailInput.value = '';

    // Show the email modal
    const emailModal = new bootstrap.Modal(document.getElementById('emailModal'));
    emailModal.show();
  });

  // Handle "Send Mail" button inside the email modal
  if (btnSendMail) {
    btnSendMail.addEventListener('click', () => {
      const emailInput = document.getElementById('userEmail');
      const email = emailInput?.value.trim();

      // Validate email
      if (!email || !isValidEmail(email)) {
        emailInput.classList.add('is-invalid');
        return;
      }
      emailInput.classList.remove('is-invalid');

      const data = getBookingData();
      const mailtoLink = buildMailtoLink(data, email);

      // Open the mailto link
      window.location.href = mailtoLink;

      // Close email modal, show success
      const emailModal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
      emailModal?.hide();

      // Brief delay so the email modal closes before success opens
      setTimeout(() => {
        populateSuccessDetails(data, 'Email');
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
      }, 400);
    });
  }

  // Clear invalid state on email input when user types
  const emailInput = document.getElementById('userEmail');
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.classList.remove('is-invalid');
    });
  }
}

/**
 * Builds a mailto: link with pre-populated subject and body.
 */
function buildMailtoLink(data, userEmail) {
  const subject = `High Tea Booking - ${data.name} - ${data.formattedDate}`;

  let body = `Hi Mr. Write Tea & Gift Shop,\n\n`;
  body += `I'd like to book a High Tea, please!\n\n`;
  body += `━━━━━━━━━━━━━━━━━━\n`;
  body += `BOOKING DETAILS\n`;
  body += `━━━━━━━━━━━━━━━━━━\n\n`;
  body += `Name: ${data.name}\n`;
  body += `Email: ${userEmail}\n`;
  body += `Date: ${data.formattedDate}\n`;
  body += `Time: ${data.timeLabel}\n`;
  body += `Guests: ${data.guests}\n`;
  body += `Package: ${data.packageName}\n`;

  if (data.notes) {
    body += `\nDietary / Special Requests:\n${data.notes}\n`;
  }

  body += `\n━━━━━━━━━━━━━━━━━━\n`;
  body += `Looking forward to it!\n`;
  body += `${data.name}`;

  return `mailto:${SHOP_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Basic email validation.
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ----------------------------------------------------------
// 7. SHARED HELPERS
// ----------------------------------------------------------

/**
 * Extracts all booking form data into a clean object.
 */
function getBookingData() {
  const name = document.getElementById('guestName').value.trim();
  const date = document.getElementById('bookingDate').value;
  const timeEl = document.getElementById('bookingTime');
  const timeLabel = timeEl.options[timeEl.selectedIndex]?.textContent || '';
  const timeValue = timeEl.value;
  const guests = document.getElementById('guestCount').value;
  const pkg = document.querySelector('input[name="package"]:checked');
  const packageName = pkg?.value === 'fancy' ? 'The Full-on Fancy (R345 pp)' : 'The Budget Brew (R195 pp)';
  const notes = document.getElementById('specialNotes').value.trim();

  // Format date nicely
  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return { name, date, formattedDate, timeLabel, timeValue, guests, packageName, notes };
}

/**
 * Populates the success modal with booking details.
 */
function populateSuccessDetails(data, method) {
  const detailsEl = document.getElementById('successDetails');
  const messageEl = document.getElementById('successMessage');

  if (messageEl) {
    if (method === 'WhatsApp') {
      messageEl.textContent = 'Your booking request has been sent via WhatsApp! We\'ll reply to confirm shortly.';
    } else {
      messageEl.textContent = 'Your booking email is ready to send! Check your mail app and hit send. We\'ll confirm ASAP.';
    }
  }

  if (detailsEl) {
    detailsEl.innerHTML = `
      <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>Date:</strong> ${data.formattedDate}</p>
      <p><strong>Time:</strong> ${escapeHtml(data.timeLabel)}</p>
      <p><strong>Guests:</strong> ${data.guests}</p>
      <p><strong>Package:</strong> ${data.packageName}</p>
      ${data.notes ? `<p><strong>Notes:</strong> ${escapeHtml(data.notes)}</p>` : ''}
      <p class="mt-2"><strong>Sent via:</strong> <span class="badge-method badge-${method.toLowerCase()}">${method === 'WhatsApp' ? '📱 WhatsApp' : '📧 Email'}</span></p>
    `;
  }
}

/**
 * Simple HTML escaping to prevent injection.
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Listen for success modal close → reset form + redirect
document.addEventListener('DOMContentLoaded', () => {
  const modalEl = document.getElementById('successModal');
  if (!modalEl) return;

  modalEl.addEventListener('hidden.bs.modal', () => {
    const form = document.getElementById('bookingForm');
    if (form) {
      form.reset();
      form.classList.remove('was-validated');
    }
    const timeSelect = document.getElementById('bookingTime');
    if (timeSelect) {
      timeSelect.disabled = true;
      timeSelect.innerHTML = '<option value="" selected disabled>Pick a date first...</option>';
    }
    updateBrewProgress();
    checkFormValidity();
    window.location.href = 'index.html';
  });
});
