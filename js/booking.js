/* ============================================================
   BOOKING PAGE — JavaScript
   ============================================================
   Handles:
     1. Two-day rule: date min = today + 2 days
     2. Dynamic time slots based on selected day of week
     3. Brew progress bar tracking
     4. Form validation & success modal
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initDatePicker();
  initTimeSlots();
  initBrewProgress();
  initBookingForm();
});

// ----------------------------------------------------------
// 1. DATE PICKER — Two-day rule enforcement
// ----------------------------------------------------------
function initDatePicker() {
  const dateInput = document.getElementById('bookingDate');
  if (!dateInput) return;

  // Calculate minimum date: today + 2 days
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 2);

  // Format as YYYY-MM-DD for the input min attribute
  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  dateInput.setAttribute('min', formatDate(minDate));

  // Also set a max date — 3 months from now
  const maxDate = new Date(today);
  maxDate.setMonth(today.getMonth() + 3);
  dateInput.setAttribute('max', formatDate(maxDate));
}

// ----------------------------------------------------------
// 2. TIME SLOTS — Dynamic based on day of week
// ----------------------------------------------------------
function initTimeSlots() {
  const dateInput = document.getElementById('bookingDate');
  const timeSelect = document.getElementById('bookingTime');
  if (!dateInput || !timeSelect) return;

  /**
   * Time slot definitions per day type.
   * Each slot has a value, label, and a quirky Hermanus-flavoured name.
   */
  const timeSlots = {
    // Monday – Friday: 8 AM – 5 PM
    weekday: {
      groupLabel: '🌊 Weekday Sittings (Mon–Fri)',
      slots: [
        { value: '08:00', label: '8:00 AM — The Dawn Patrol Cuppa' },
        { value: '09:00', label: '9:00 AM — Morning Mist Brew' },
        { value: '10:00', label: '10:00 AM — Mid-Morning Pick-Me-Up' },
        { value: '11:00', label: '11:00 AM — Elevenses (Obviously!)' },
        { value: '12:00', label: '12:00 PM — Noon-Tea Delight' },
        { value: '13:00', label: '1:00 PM — Afternoon Anchor' },
        { value: '14:00', label: '2:00 PM — The Classic High Tea Hour' },
        { value: '15:00', label: '3:00 PM — Post-Cliff-Path Refreshment' }
      ]
    },
    // Saturday: 8 AM – 3 PM
    saturday: {
      groupLabel: '☀️ Saturday Sittings',
      slots: [
        { value: '08:00', label: '8:00 AM — Early Bird Market-Goer' },
        { value: '09:00', label: '9:00 AM — Saturday Stroll & Sip' },
        { value: '10:00', label: '10:00 AM — Weekend Wind-Down' },
        { value: '11:00', label: '11:00 AM — Brunch-Hour Bliss' },
        { value: '12:00', label: '12:00 PM — Midday Indulgence' },
        { value: '13:00', label: '1:00 PM — Post-Cliff-Path Refreshment' }
      ]
    },
    // Sunday: 9 AM – 1 PM
    sunday: {
      groupLabel: '🌅 Sunday Sittings — The Early Bird Special',
      slots: [
        { value: '09:00', label: '9:00 AM — The Sunrise Sipper' },
        { value: '10:00', label: '10:00 AM — Sunday Papers & Pot of Tea' },
        { value: '11:00', label: '11:00 AM — Lazy Morning Luxe' }
      ]
    }
  };

  dateInput.addEventListener('change', () => {
    const selectedDate = new Date(dateInput.value + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Determine which slot set to use
    let slotSet;
    if (dayOfWeek === 0) {
      slotSet = timeSlots.sunday;
    } else if (dayOfWeek === 6) {
      slotSet = timeSlots.saturday;
    } else {
      slotSet = timeSlots.weekday;
    }

    // Clear and rebuild the select
    timeSelect.innerHTML = '';
    timeSelect.disabled = false;

    // Default placeholder
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose your sitting…';
    placeholder.disabled = true;
    placeholder.selected = true;
    timeSelect.appendChild(placeholder);

    // Create optgroup with quirky label
    const group = document.createElement('optgroup');
    group.label = slotSet.groupLabel;

    slotSet.slots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot.value;
      option.textContent = slot.label;
      group.appendChild(option);
    });

    timeSelect.appendChild(group);

    // Trigger progress update
    updateBrewProgress();
  });
}

// ----------------------------------------------------------
// 3. BREW PROGRESS BAR — Tracks form completion
// ----------------------------------------------------------

/** Fields tracked for progress (notes is optional, so excluded) */
const TRACKED_FIELDS = ['name', 'date', 'time', 'guests', 'package'];
const PROGRESS_MESSAGES = [
  'Let\'s start brewing…',
  'The kettle\'s on…',
  'Water\'s warming up…',
  'Almost steeped…',
  'Just adding the milk…',
  'Perfect brew! ☕'
];

function initBrewProgress() {
  // Listen to all form field changes
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('input', updateBrewProgress);
  form.addEventListener('change', updateBrewProgress);
}

function updateBrewProgress() {
  const filled = countFilledFields();
  const total = TRACKED_FIELDS.length;
  const pct = Math.round((filled / total) * 100);

  // Update fill bar
  const fillEl = document.getElementById('brewProgressFill');
  const textEl = document.getElementById('brewProgressText');
  const pctEl = document.getElementById('brewProgressPct');

  if (fillEl) fillEl.style.width = `${pct}%`;
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (textEl) textEl.textContent = PROGRESS_MESSAGES[filled] || PROGRESS_MESSAGES[PROGRESS_MESSAGES.length - 1];

  // Update cup icons
  const cups = document.querySelectorAll('.brew-cup');
  cups.forEach((cup, idx) => {
    if (idx < filled) {
      cup.classList.add('filled');
    } else {
      cup.classList.remove('filled');
    }
  });
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
// 4. FORM VALIDATION & SUBMISSION
// ----------------------------------------------------------
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Custom package validation (radios don't get native :invalid styling easily)
    const pkg = document.querySelector('input[name="package"]:checked');
    const pkgError = document.getElementById('packageError');
    if (!pkg && pkgError) {
      pkgError.style.display = 'block';
    } else if (pkgError) {
      pkgError.style.display = 'none';
    }

    // Guest count range check
    const guestInput = document.getElementById('guestCount');
    if (guestInput) {
      const val = parseInt(guestInput.value);
      if (isNaN(val) || val < 1 || val > 12) {
        guestInput.setCustomValidity('Please enter between 1 and 12 guests.');
      } else {
        guestInput.setCustomValidity('');
      }
    }

    // Bootstrap validation classes
    form.classList.add('was-validated');

    // Check overall validity
    if (!form.checkValidity() || !pkg) {
      return;
    }

    // ---- Form is valid — show success modal ----
    showSuccessModal();
  });

  // Clear package error on selection
  document.querySelectorAll('input[name="package"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const pkgError = document.getElementById('packageError');
      if (pkgError) pkgError.style.display = 'none';
    });
  });
}

function showSuccessModal() {
  const name = document.getElementById('guestName').value.trim();
  const date = document.getElementById('bookingDate').value;
  const time = document.getElementById('bookingTime');
  const timeText = time.options[time.selectedIndex]?.textContent || '';
  const guests = document.getElementById('guestCount').value;
  const pkg = document.querySelector('input[name="package"]:checked');
  const pkgName = pkg?.value === 'fancy' ? 'The Full-on Fancy' : 'The Budget Brew';
  const notes = document.getElementById('specialNotes').value.trim();

  // Format the date nicely
  const dateObj = new Date(date + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Build the summary
  const detailsEl = document.getElementById('successDetails');
  if (detailsEl) {
    detailsEl.innerHTML = `
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Time:</strong> ${escapeHtml(timeText)}</p>
      <p><strong>Guests:</strong> ${escapeHtml(guests)}</p>
      <p><strong>Package:</strong> ${pkgName}</p>
      ${notes ? `<p><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : ''}
    `;
  }

  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById('successModal'));
  modal.show();

  // Reset form when modal is closed
  const modalEl = document.getElementById('successModal');
  modalEl.addEventListener('hidden.bs.modal', () => {
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingForm').classList.remove('was-validated');
    document.getElementById('bookingTime').disabled = true;
    document.getElementById('bookingTime').innerHTML = '<option value="" selected disabled>Pick a date first…</option>';
    updateBrewProgress();
    // Redirect to home
    window.location.href = 'index.html';
  }, { once: true });
}

/**
 * Simple HTML escaping to prevent injection in the success modal.
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
