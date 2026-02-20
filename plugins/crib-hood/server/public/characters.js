/* ============================================================
   The Crib Board — Agent Character SVG Definitions (Pixel Art Edition)
   Each character: 64x64 viewBox, inline colors, CSS class hooks
   for animation: .char-body .char-eyes .char-accessory .char-limbs
   Pixel art style: rect elements as "pixels" (~4x4 units), grid-snapped
   ============================================================ */

window.CHARACTERS = {

  /* Hamster 뚝딱이 — Round orange body, pink cheeks, black eyes, running legs */
  executor: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-body">
      <!-- ears -->
      <rect x="16" y="8" width="8" height="8" fill="#e8903a"/>
      <rect x="40" y="8" width="8" height="8" fill="#e8903a"/>
      <rect x="18" y="10" width="4" height="4" fill="#f5a0b0"/>
      <rect x="42" y="10" width="4" height="4" fill="#f5a0b0"/>
      <!-- head -->
      <rect x="16" y="16" width="32" height="4" fill="#e8903a"/>
      <rect x="12" y="20" width="40" height="4" fill="#e8903a"/>
      <rect x="12" y="24" width="40" height="4" fill="#e8903a"/>
      <rect x="12" y="28" width="40" height="4" fill="#e8903a"/>
      <rect x="16" y="32" width="32" height="4" fill="#e8903a"/>
      <!-- cheek pouches -->
      <rect x="8" y="24" width="8" height="8" fill="#f5c09a"/>
      <rect x="48" y="24" width="8" height="8" fill="#f5c09a"/>
      <!-- belly -->
      <rect x="20" y="28" width="24" height="4" fill="#f5d0b0"/>
      <!-- body -->
      <rect x="16" y="36" width="32" height="4" fill="#e8903a"/>
      <rect x="16" y="40" width="32" height="4" fill="#e8903a"/>
      <rect x="20" y="44" width="24" height="4" fill="#e8903a"/>
    </g>
    <g class="char-eyes">
      <rect x="20" y="22" width="6" height="6" fill="#1a1a1a"/>
      <rect x="38" y="22" width="6" height="6" fill="#1a1a1a"/>
      <rect x="22" y="22" width="2" height="2" fill="#ffffff"/>
      <rect x="40" y="22" width="2" height="2" fill="#ffffff"/>
    </g>
    <!-- nose -->
    <rect x="28" y="30" width="8" height="4" fill="#c06040"/>
    <rect x="30" y="28" width="4" height="4" fill="#c06040"/>
    <g class="char-accessory">
      <!-- tiny tail -->
      <rect x="48" y="36" width="8" height="6" fill="#f5c09a"/>
      <rect x="52" y="34" width="4" height="4" fill="#f5c09a"/>
    </g>
    <g class="char-limbs">
      <!-- running legs -->
      <rect x="16" y="48" width="8" height="4" fill="#d07830"/>
      <rect x="12" y="52" width="8" height="4" fill="#d07830"/>
      <rect x="40" y="48" width="8" height="4" fill="#d07830"/>
      <rect x="44" y="52" width="8" height="4" fill="#d07830"/>
    </g>
  </svg>`,

  /* Dog 킁킁이 — Golden, floppy ears, visible nose, wagging tail */
  explorer: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- wagging tail -->
      <rect x="50" y="24" width="4" height="12" fill="#c07a30"/>
      <rect x="54" y="20" width="4" height="8" fill="#c07a30"/>
      <rect x="58" y="16" width="4" height="8" fill="#c07a30"/>
    </g>
    <g class="char-body">
      <!-- floppy ears -->
      <rect x="8" y="16" width="8" height="20" fill="#c07a30"/>
      <rect x="12" y="14" width="8" height="20" fill="#c07a30"/>
      <rect x="48" y="14" width="8" height="20" fill="#c07a30"/>
      <rect x="48" y="16" width="8" height="20" fill="#c07a30"/>
      <!-- head -->
      <rect x="16" y="12" width="32" height="4" fill="#d99848"/>
      <rect x="12" y="16" width="40" height="4" fill="#d99848"/>
      <rect x="12" y="20" width="40" height="4" fill="#d99848"/>
      <rect x="12" y="24" width="40" height="4" fill="#d99848"/>
      <rect x="12" y="28" width="40" height="4" fill="#d99848"/>
      <rect x="16" y="32" width="32" height="4" fill="#d99848"/>
      <!-- snout -->
      <rect x="20" y="28" width="24" height="8" fill="#c07a30"/>
      <!-- body -->
      <rect x="16" y="36" width="32" height="4" fill="#d99848"/>
      <rect x="16" y="40" width="32" height="4" fill="#d99848"/>
      <rect x="20" y="44" width="24" height="4" fill="#d99848"/>
    </g>
    <!-- nose block -->
    <rect x="24" y="26" width="16" height="6" fill="#1a1a1a"/>
    <rect x="26" y="24" width="12" height="4" fill="#1a1a1a"/>
    <!-- nose highlight -->
    <rect x="26" y="26" width="4" height="2" fill="#3a3a3a"/>
    <g class="char-eyes">
      <rect x="18" y="20" width="8" height="8" fill="#1a1a1a"/>
      <rect x="38" y="20" width="8" height="8" fill="#1a1a1a"/>
      <rect x="20" y="20" width="3" height="3" fill="#ffffff"/>
      <rect x="40" y="20" width="3" height="3" fill="#ffffff"/>
    </g>
    <g class="char-limbs">
      <!-- legs -->
      <rect x="16" y="48" width="8" height="8" fill="#c07a30"/>
      <rect x="40" y="48" width="8" height="8" fill="#c07a30"/>
      <rect x="16" y="56" width="12" height="4" fill="#a06020"/>
      <rect x="36" y="56" width="12" height="4" fill="#a06020"/>
    </g>
  </svg>`,

  /* Owl 지혜 — Brown, giant amber eyes, ear tufts, tiny beak */
  planner: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- ear tufts -->
      <rect x="18" y="4" width="6" height="10" fill="#4e3820"/>
      <rect x="20" y="2" width="4" height="6" fill="#4e3820"/>
      <rect x="40" y="4" width="6" height="10" fill="#4e3820"/>
      <rect x="40" y="2" width="4" height="6" fill="#4e3820"/>
    </g>
    <g class="char-body">
      <!-- ear tuft base (part of body color) -->
      <!-- head -->
      <rect x="16" y="12" width="32" height="4" fill="#7c5c3a"/>
      <rect x="12" y="16" width="40" height="4" fill="#7c5c3a"/>
      <rect x="12" y="20" width="40" height="4" fill="#7c5c3a"/>
      <rect x="12" y="24" width="40" height="4" fill="#7c5c3a"/>
      <rect x="12" y="28" width="40" height="4" fill="#7c5c3a"/>
      <rect x="16" y="32" width="32" height="4" fill="#7c5c3a"/>
      <!-- eye rings (cream) -->
      <rect x="14" y="18" width="16" height="16" fill="#c4a06a"/>
      <rect x="34" y="18" width="16" height="16" fill="#c4a06a"/>
      <!-- body -->
      <rect x="20" y="36" width="24" height="4" fill="#7c5c3a"/>
      <rect x="16" y="40" width="32" height="4" fill="#7c5c3a"/>
      <rect x="16" y="44" width="32" height="4" fill="#7c5c3a"/>
      <rect x="20" y="48" width="24" height="4" fill="#7c5c3a"/>
      <!-- chest -->
      <rect x="22" y="38" width="20" height="12" fill="#c4a06a"/>
      <!-- wings -->
      <rect x="8" y="36" width="10" height="16" fill="#4e3820"/>
      <rect x="46" y="36" width="10" height="16" fill="#4e3820"/>
    </g>
    <g class="char-eyes">
      <!-- eyes amber -->
      <rect x="16" y="20" width="12" height="12" fill="#f5a623"/>
      <rect x="36" y="20" width="12" height="12" fill="#f5a623"/>
      <!-- pupils -->
      <rect x="20" y="22" width="6" height="8" fill="#1a1a1a"/>
      <rect x="40" y="22" width="6" height="8" fill="#1a1a1a"/>
      <!-- eye glints -->
      <rect x="20" y="22" width="2" height="2" fill="#ffffff"/>
      <rect x="40" y="22" width="2" height="2" fill="#ffffff"/>
    </g>
    <!-- beak -->
    <rect x="28" y="30" width="8" height="4" fill="#e8a020"/>
    <rect x="30" y="34" width="4" height="4" fill="#e8a020"/>
    <g class="char-limbs">
      <!-- feet -->
      <rect x="22" y="52" width="8" height="4" fill="#e8a020"/>
      <rect x="18" y="56" width="4" height="4" fill="#e8a020"/>
      <rect x="22" y="56" width="4" height="4" fill="#e8a020"/>
      <rect x="26" y="56" width="4" height="4" fill="#e8a020"/>
      <rect x="34" y="52" width="8" height="4" fill="#e8a020"/>
      <rect x="32" y="56" width="4" height="4" fill="#e8a020"/>
      <rect x="36" y="56" width="4" height="4" fill="#e8a020"/>
      <rect x="40" y="56" width="4" height="4" fill="#e8a020"/>
    </g>
  </svg>`,

  /* Beaver 댐댐이 — Brown, hard hat, buck teeth, flat tail */
  architect: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- hard hat dome -->
      <rect x="18" y="4" width="28" height="4" fill="#f5c518"/>
      <rect x="14" y="6" width="36" height="4" fill="#f5c518"/>
      <rect x="14" y="10" width="36" height="4" fill="#f5c518"/>
      <rect x="12" y="14" width="40" height="4" fill="#e0a800"/>
      <!-- flat tail at bottom -->
      <rect x="16" y="56" width="32" height="6" fill="#6b4428"/>
      <rect x="12" y="52" width="40" height="6" fill="#8b5e3c"/>
      <!-- tail texture lines -->
      <rect x="16" y="52" width="8" height="2" fill="#6b4428"/>
      <rect x="28" y="54" width="8" height="2" fill="#6b4428"/>
      <rect x="40" y="52" width="8" height="2" fill="#6b4428"/>
    </g>
    <g class="char-body">
      <!-- ears -->
      <rect x="14" y="18" width="6" height="8" fill="#b07848"/>
      <rect x="44" y="18" width="6" height="8" fill="#b07848"/>
      <!-- head -->
      <rect x="16" y="18" width="32" height="4" fill="#b07848"/>
      <rect x="12" y="22" width="40" height="4" fill="#b07848"/>
      <rect x="12" y="26" width="40" height="4" fill="#b07848"/>
      <rect x="12" y="30" width="40" height="4" fill="#b07848"/>
      <rect x="16" y="34" width="32" height="4" fill="#b07848"/>
      <!-- body -->
      <rect x="16" y="38" width="32" height="4" fill="#b07848"/>
      <rect x="16" y="42" width="32" height="4" fill="#b07848"/>
      <rect x="20" y="46" width="24" height="4" fill="#b07848"/>
      <!-- arms -->
      <rect x="8" y="38" width="10" height="6" fill="#9a6838"/>
      <rect x="46" y="38" width="10" height="6" fill="#9a6838"/>
    </g>
    <g class="char-eyes">
      <rect x="20" y="24" width="8" height="8" fill="#2d1b10"/>
      <rect x="36" y="24" width="8" height="8" fill="#2d1b10"/>
      <rect x="22" y="24" width="3" height="3" fill="#ffffff"/>
      <rect x="38" y="24" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- nose -->
    <rect x="26" y="32" width="12" height="4" fill="#7a4428"/>
    <!-- buck teeth -->
    <rect x="26" y="36" width="5" height="6" fill="#ffffff"/>
    <rect x="33" y="36" width="5" height="6" fill="#ffffff"/>
    <rect x="31" y="36" width="2" height="6" fill="#e0d0c0"/>
    <g class="char-limbs">
      <rect x="18" y="50" width="8" height="4" fill="#9a6838"/>
      <rect x="38" y="50" width="8" height="4" fill="#9a6838"/>
    </g>
  </svg>`,

  /* Hawk 날카로미 — Golden, fierce eyes, spread wings, talons */
  verifier: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- left wing -->
      <rect x="0" y="28" width="8" height="4" fill="#8b6914"/>
      <rect x="4" y="24" width="8" height="4" fill="#8b6914"/>
      <rect x="8" y="20" width="8" height="8" fill="#8b6914"/>
      <rect x="12" y="18" width="8" height="10" fill="#8b6914"/>
      <rect x="16" y="24" width="8" height="8" fill="#8b6914"/>
      <!-- right wing -->
      <rect x="56" y="28" width="8" height="4" fill="#8b6914"/>
      <rect x="52" y="24" width="8" height="4" fill="#8b6914"/>
      <rect x="48" y="20" width="8" height="8" fill="#8b6914"/>
      <rect x="40" y="18" width="8" height="10" fill="#8b6914"/>
      <rect x="36" y="24" width="8" height="8" fill="#8b6914"/>
    </g>
    <g class="char-body">
      <!-- head -->
      <rect x="18" y="10" width="28" height="4" fill="#c8a030"/>
      <rect x="14" y="14" width="36" height="4" fill="#c8a030"/>
      <rect x="14" y="18" width="36" height="4" fill="#c8a030"/>
      <rect x="14" y="22" width="36" height="4" fill="#c8a030"/>
      <rect x="14" y="26" width="36" height="4" fill="#c8a030"/>
      <rect x="18" y="30" width="28" height="4" fill="#c8a030"/>
      <!-- body -->
      <rect x="22" y="34" width="20" height="4" fill="#c8a030"/>
      <rect x="20" y="38" width="24" height="4" fill="#c8a030"/>
      <rect x="20" y="42" width="24" height="4" fill="#c8a030"/>
      <rect x="22" y="46" width="20" height="4" fill="#c8a030"/>
      <!-- chest patch -->
      <rect x="24" y="36" width="16" height="12" fill="#e8d090"/>
    </g>
    <!-- fierce brow marks -->
    <rect x="16" y="16" width="12" height="4" fill="#6b4e10"/>
    <rect x="36" y="16" width="12" height="4" fill="#6b4e10"/>
    <g class="char-eyes">
      <!-- fierce amber eyes -->
      <rect x="18" y="20" width="12" height="8" fill="#f5a623"/>
      <rect x="34" y="20" width="12" height="8" fill="#f5a623"/>
      <!-- pupils -->
      <rect x="22" y="21" width="6" height="6" fill="#1a1a1a"/>
      <rect x="38" y="21" width="6" height="6" fill="#1a1a1a"/>
      <rect x="22" y="21" width="2" height="2" fill="#ffffff"/>
      <rect x="38" y="21" width="2" height="2" fill="#ffffff"/>
    </g>
    <!-- sharp beak -->
    <rect x="26" y="30" width="12" height="4" fill="#e8a020"/>
    <rect x="28" y="34" width="8" height="4" fill="#e8a020"/>
    <rect x="30" y="38" width="4" height="4" fill="#e8a020"/>
    <g class="char-limbs">
      <!-- talons -->
      <rect x="22" y="50" width="4" height="8" fill="#c8a030"/>
      <rect x="16" y="56" width="4" height="4" fill="#c8a030"/>
      <rect x="20" y="56" width="4" height="4" fill="#c8a030"/>
      <rect x="24" y="58" width="4" height="4" fill="#c8a030"/>
      <rect x="38" y="50" width="4" height="8" fill="#c8a030"/>
      <rect x="44" y="56" width="4" height="4" fill="#c8a030"/>
      <rect x="40" y="56" width="4" height="4" fill="#c8a030"/>
      <rect x="36" y="58" width="4" height="4" fill="#c8a030"/>
    </g>
  </svg>`,

  /* Detective 셜록 — Deerstalker hat, coat, magnifying glass */
  debugger: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- deerstalker hat -->
      <rect x="10" y="8" width="16" height="6" fill="#9a7a48"/>
      <rect x="8" y="10" width="4" height="8" fill="#7a5a30"/>
      <rect x="14" y="6" width="36" height="4" fill="#9a7a48"/>
      <rect x="12" y="8" width="40" height="6" fill="#9a7a48"/>
      <rect x="10" y="14" width="44" height="4" fill="#7a5a30"/>
      <rect x="44" y="10" width="10" height="8" fill="#7a5a30"/>
      <!-- magnifying glass -->
      <rect x="4" y="44" width="4" height="4" fill="#c8a050"/>
      <rect x="6" y="40" width="4" height="6" fill="#c8a050"/>
      <rect x="8" y="36" width="4" height="6" fill="#c8a050"/>
      <rect x="8" y="34" width="12" height="4" fill="#c8a050"/>
      <rect x="6" y="36" width="4" height="4" fill="#c8a050"/>
      <rect x="10" y="30" width="10" height="4" fill="#c8a050"/>
      <rect x="20" y="30" width="4" height="12" fill="#c8a050"/>
      <rect x="10" y="40" width="12" height="4" fill="#c8a050"/>
      <!-- lens -->
      <rect x="12" y="32" width="8" height="10" fill="#c8e8f8"/>
      <rect x="12" y="32" width="3" height="3" fill="#e0f4ff"/>
      <!-- handle -->
      <rect x="2" y="46" width="4" height="4" fill="#7a5a30"/>
      <rect x="4" y="50" width="4" height="4" fill="#7a5a30"/>
      <rect x="6" y="54" width="4" height="4" fill="#7a5a30"/>
    </g>
    <g class="char-body">
      <!-- coat -->
      <rect x="14" y="40" width="32" height="4" fill="#2d2d2d"/>
      <rect x="12" y="44" width="36" height="4" fill="#2d2d2d"/>
      <rect x="12" y="48" width="36" height="4" fill="#2d2d2d"/>
      <rect x="14" y="52" width="32" height="4" fill="#2d2d2d"/>
      <!-- coat collar -->
      <rect x="24" y="38" width="6" height="4" fill="#1a1a1a"/>
      <rect x="34" y="38" width="6" height="4" fill="#1a1a1a"/>
      <!-- left arm (holding glass) -->
      <rect x="6" y="40" width="8" height="6" fill="#2d2d2d"/>
      <rect x="8" y="44" width="6" height="6" fill="#2d2d2d"/>
      <!-- right arm -->
      <rect x="50" y="40" width="8" height="6" fill="#2d2d2d"/>
      <rect x="50" y="46" width="6" height="6" fill="#2d2d2d"/>
      <!-- head -->
      <rect x="18" y="18" width="28" height="4" fill="#e8b48a"/>
      <rect x="14" y="22" width="36" height="4" fill="#e8b48a"/>
      <rect x="14" y="26" width="36" height="4" fill="#e8b48a"/>
      <rect x="14" y="30" width="36" height="4" fill="#e8b48a"/>
      <rect x="18" y="34" width="28" height="4" fill="#e8b48a"/>
      <!-- ears -->
      <rect x="10" y="22" width="6" height="10" fill="#d9a07a"/>
      <rect x="48" y="22" width="6" height="10" fill="#d9a07a"/>
    </g>
    <g class="char-eyes">
      <rect x="20" y="24" width="8" height="7" fill="#2d1b10"/>
      <rect x="36" y="24" width="8" height="7" fill="#2d1b10"/>
      <rect x="22" y="24" width="3" height="3" fill="#ffffff"/>
      <rect x="38" y="24" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- eyebrows (focused) -->
    <rect x="20" y="21" width="8" height="3" fill="#6a4a20"/>
    <rect x="36" y="21" width="8" height="3" fill="#6a4a20"/>
    <!-- nose -->
    <rect x="28" y="30" width="8" height="4" fill="#c08060"/>
    <!-- mouth -->
    <rect x="24" y="34" width="16" height="3" fill="#b07050"/>
    <g class="char-limbs">
      <!-- legs -->
      <rect x="20" y="56" width="8" height="6" fill="#1a1a1a"/>
      <rect x="36" y="56" width="8" height="6" fill="#1a1a1a"/>
    </g>
  </svg>`,

  /* Cat 까칠냥 — Purple, pointed ears, whiskers, half-closed eyes */
  reviewer: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- tail -->
      <rect x="48" y="36" width="6" height="4" fill="#9b8dba"/>
      <rect x="52" y="28" width="6" height="10" fill="#9b8dba"/>
      <rect x="54" y="20" width="6" height="10" fill="#9b8dba"/>
      <rect x="52" y="16" width="6" height="6" fill="#9b8dba"/>
      <rect x="48" y="14" width="6" height="4" fill="#9b8dba"/>
    </g>
    <g class="char-body">
      <!-- pointed ears -->
      <rect x="14" y="4" width="8" height="8" fill="#b8a8d8"/>
      <rect x="16" y="2" width="6" height="6" fill="#b8a8d8"/>
      <rect x="18" y="0" width="4" height="4" fill="#b8a8d8"/>
      <rect x="16" y="4" width="4" height="4" fill="#f5b4c8"/>
      <rect x="42" y="4" width="8" height="8" fill="#b8a8d8"/>
      <rect x="42" y="2" width="6" height="6" fill="#b8a8d8"/>
      <rect x="42" y="0" width="4" height="4" fill="#b8a8d8"/>
      <rect x="44" y="4" width="4" height="4" fill="#f5b4c8"/>
      <!-- head -->
      <rect x="14" y="10" width="36" height="4" fill="#b8a8d8"/>
      <rect x="10" y="14" width="44" height="4" fill="#b8a8d8"/>
      <rect x="10" y="18" width="44" height="4" fill="#b8a8d8"/>
      <rect x="10" y="22" width="44" height="4" fill="#b8a8d8"/>
      <rect x="10" y="26" width="44" height="4" fill="#b8a8d8"/>
      <rect x="14" y="30" width="36" height="4" fill="#b8a8d8"/>
      <!-- body -->
      <rect x="16" y="34" width="32" height="4" fill="#b8a8d8"/>
      <rect x="14" y="38" width="34" height="4" fill="#b8a8d8"/>
      <rect x="14" y="42" width="34" height="4" fill="#b8a8d8"/>
      <rect x="16" y="46" width="32" height="4" fill="#b8a8d8"/>
    </g>
    <!-- eyelids (half closed) -->
    <rect x="18" y="20" width="14" height="4" fill="#b8a8d8"/>
    <rect x="32" y="20" width="14" height="4" fill="#b8a8d8"/>
    <g class="char-eyes">
      <!-- half-closed judgmental eyes -->
      <rect x="18" y="22" width="14" height="6" fill="#2d1b3d"/>
      <rect x="32" y="22" width="14" height="6" fill="#2d1b3d"/>
      <!-- slit pupils -->
      <rect x="23" y="22" width="4" height="6" fill="#1a0a2e"/>
      <rect x="37" y="22" width="4" height="6" fill="#1a0a2e"/>
      <!-- eye glints -->
      <rect x="20" y="22" width="2" height="2" fill="#ffffff"/>
      <rect x="34" y="22" width="2" height="2" fill="#ffffff"/>
    </g>
    <!-- nose -->
    <rect x="28" y="28" width="8" height="4" fill="#f5a0b4"/>
    <rect x="30" y="26" width="4" height="4" fill="#f5a0b4"/>
    <!-- flat unamused mouth -->
    <rect x="24" y="32" width="16" height="3" fill="#9b7090"/>
    <!-- whiskers -->
    <rect x="0" y="26" width="14" height="2" fill="#e0d8f0"/>
    <rect x="0" y="30" width="14" height="2" fill="#e0d8f0"/>
    <rect x="50" y="26" width="14" height="2" fill="#e0d8f0"/>
    <rect x="50" y="30" width="14" height="2" fill="#e0d8f0"/>
    <g class="char-limbs">
      <!-- paws -->
      <rect x="16" y="50" width="10" height="6" fill="#9b8dba"/>
      <rect x="38" y="50" width="10" height="6" fill="#9b8dba"/>
    </g>
  </svg>`,

  /* Octopus 먹물이 — Pink, round head, 4 visible tentacles */
  writer: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- ink spot / mantle tip -->
      <rect x="28" y="2" width="8" height="4" fill="#c04070"/>
      <rect x="26" y="4" width="12" height="4" fill="#e06090"/>
    </g>
    <g class="char-limbs">
      <!-- tentacles (back) -->
      <rect x="12" y="40" width="6" height="4" fill="#e06090"/>
      <rect x="10" y="44" width="6" height="4" fill="#e06090"/>
      <rect x="8" y="48" width="6" height="4" fill="#e06090"/>
      <rect x="6" y="52" width="6" height="4" fill="#e06090"/>
      <rect x="8" y="56" width="6" height="4" fill="#e06090"/>
      <rect x="46" y="40" width="6" height="4" fill="#e06090"/>
      <rect x="48" y="44" width="6" height="4" fill="#e06090"/>
      <rect x="50" y="48" width="6" height="4" fill="#e06090"/>
      <rect x="52" y="52" width="6" height="4" fill="#e06090"/>
      <rect x="50" y="56" width="6" height="4" fill="#e06090"/>
      <!-- tentacles (front) -->
      <rect x="20" y="42" width="6" height="4" fill="#f07aaa"/>
      <rect x="18" y="46" width="6" height="4" fill="#f07aaa"/>
      <rect x="16" y="50" width="6" height="4" fill="#f07aaa"/>
      <rect x="14" y="54" width="6" height="4" fill="#f07aaa"/>
      <rect x="38" y="42" width="6" height="4" fill="#f07aaa"/>
      <rect x="40" y="46" width="6" height="4" fill="#f07aaa"/>
      <rect x="42" y="50" width="6" height="4" fill="#f07aaa"/>
      <rect x="44" y="54" width="6" height="4" fill="#f07aaa"/>
    </g>
    <g class="char-body">
      <!-- mantle top dome -->
      <rect x="24" y="4" width="16" height="4" fill="#e06090"/>
      <rect x="20" y="6" width="24" height="4" fill="#e06090"/>
      <rect x="18" y="8" width="28" height="4" fill="#e06090"/>
      <!-- head -->
      <rect x="16" y="12" width="32" height="4" fill="#f07aaa"/>
      <rect x="12" y="16" width="40" height="4" fill="#f07aaa"/>
      <rect x="12" y="20" width="40" height="4" fill="#f07aaa"/>
      <rect x="12" y="24" width="40" height="4" fill="#f07aaa"/>
      <rect x="12" y="28" width="40" height="4" fill="#f07aaa"/>
      <rect x="16" y="32" width="32" height="4" fill="#f07aaa"/>
      <!-- body/mantle -->
      <rect x="18" y="36" width="28" height="4" fill="#f07aaa"/>
      <rect x="16" y="40" width="32" height="4" fill="#f07aaa"/>
    </g>
    <g class="char-eyes">
      <!-- large cute eyes -->
      <rect x="16" y="18" width="12" height="12" fill="#ffffff"/>
      <rect x="36" y="18" width="12" height="12" fill="#ffffff"/>
      <rect x="18" y="20" width="8" height="8" fill="#1a1a2e"/>
      <rect x="38" y="20" width="8" height="8" fill="#1a1a2e"/>
      <rect x="18" y="20" width="3" height="3" fill="#ffffff"/>
      <rect x="38" y="20" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- blush -->
    <rect x="10" y="28" width="8" height="4" fill="#f5a0c0"/>
    <rect x="46" y="28" width="8" height="4" fill="#f5a0c0"/>
    <!-- smile -->
    <rect x="22" y="32" width="20" height="4" fill="#c04070"/>
    <rect x="24" y="34" width="4" height="4" fill="#f07aaa"/>
    <rect x="36" y="34" width="4" height="4" fill="#f07aaa"/>
  </svg>`,

  /* Mouse 쥐박사 — Grey, huge ears, tiny glasses, long tail */
  scientist: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- big ears -->
      <rect x="4" y="8" width="16" height="20" fill="#d4b8b8"/>
      <rect x="6" y="6" width="12" height="20" fill="#d4b8b8"/>
      <rect x="8" y="4" width="8" height="18" fill="#d4b8b8"/>
      <rect x="8" y="8" width="8" height="14" fill="#f5c0c0"/>
      <rect x="44" y="8" width="16" height="20" fill="#d4b8b8"/>
      <rect x="46" y="6" width="12" height="20" fill="#d4b8b8"/>
      <rect x="48" y="4" width="8" height="18" fill="#d4b8b8"/>
      <rect x="48" y="8" width="8" height="14" fill="#f5c0c0"/>
      <!-- tail -->
      <rect x="46" y="50" width="4" height="4" fill="#c8a0a0"/>
      <rect x="50" y="46" width="4" height="6" fill="#c8a0a0"/>
      <rect x="54" y="40" width="4" height="8" fill="#c8a0a0"/>
      <rect x="58" y="32" width="4" height="10" fill="#c8a0a0"/>
      <rect x="60" y="24" width="4" height="10" fill="#c8a0a0"/>
      <!-- glasses frames -->
      <rect x="14" y="24" width="14" height="12" fill="none" stroke="#8090c0" stroke-width="0"/>
      <rect x="14" y="24" width="14" height="2" fill="#8090c0"/>
      <rect x="14" y="34" width="14" height="2" fill="#8090c0"/>
      <rect x="14" y="24" width="2" height="12" fill="#8090c0"/>
      <rect x="26" y="24" width="2" height="12" fill="#8090c0"/>
      <rect x="36" y="24" width="14" height="2" fill="#8090c0"/>
      <rect x="36" y="34" width="14" height="2" fill="#8090c0"/>
      <rect x="36" y="24" width="2" height="12" fill="#8090c0"/>
      <rect x="48" y="24" width="2" height="12" fill="#8090c0"/>
      <!-- glasses bridge -->
      <rect x="28" y="28" width="8" height="2" fill="#8090c0"/>
      <!-- temple arms -->
      <rect x="10" y="26" width="4" height="2" fill="#8090c0"/>
      <rect x="50" y="26" width="4" height="2" fill="#8090c0"/>
    </g>
    <g class="char-body">
      <!-- head -->
      <rect x="16" y="14" width="32" height="4" fill="#d4b8b8"/>
      <rect x="12" y="18" width="40" height="4" fill="#d4b8b8"/>
      <rect x="12" y="22" width="40" height="4" fill="#d4b8b8"/>
      <rect x="12" y="26" width="40" height="4" fill="#d4b8b8"/>
      <rect x="12" y="30" width="40" height="4" fill="#d4b8b8"/>
      <rect x="14" y="34" width="36" height="4" fill="#d4b8b8"/>
      <!-- body -->
      <rect x="16" y="38" width="28" height="4" fill="#d4b8b8"/>
      <rect x="14" y="42" width="32" height="4" fill="#d4b8b8"/>
      <rect x="14" y="46" width="32" height="4" fill="#d4b8b8"/>
      <rect x="16" y="50" width="28" height="4" fill="#d4b8b8"/>
    </g>
    <g class="char-eyes">
      <rect x="18" y="26" width="8" height="8" fill="#2d1b2e"/>
      <rect x="38" y="26" width="8" height="8" fill="#2d1b2e"/>
      <rect x="20" y="26" width="3" height="3" fill="#ffffff"/>
      <rect x="40" y="26" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- nose -->
    <rect x="26" y="34" width="12" height="4" fill="#e08080"/>
    <rect x="28" y="32" width="8" height="4" fill="#e08080"/>
    <!-- smile -->
    <rect x="22" y="38" width="20" height="3" fill="#b06868"/>
    <g class="char-limbs">
      <!-- tiny arms -->
      <rect x="8" y="42" width="8" height="6" fill="#c0a8a8"/>
      <rect x="48" y="42" width="8" height="6" fill="#c0a8a8"/>
      <!-- feet -->
      <rect x="18" y="54" width="8" height="6" fill="#c0a8a8"/>
      <rect x="38" y="54" width="8" height="6" fill="#c0a8a8"/>
    </g>
  </svg>`,

  /* Fox 센스 — Orange, pointed ears, bushy tail, sly eyes */
  designer: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- bushy tail -->
      <rect x="46" y="32" width="8" height="4" fill="#e8701a"/>
      <rect x="48" y="36" width="8" height="4" fill="#e8701a"/>
      <rect x="50" y="40" width="8" height="8" fill="#e8701a"/>
      <rect x="50" y="48" width="8" height="6" fill="#e8701a"/>
      <rect x="52" y="38" width="6" height="16" fill="#e8701a"/>
      <!-- tail white tip -->
      <rect x="52" y="50" width="6" height="8" fill="#f5f0e8"/>
      <rect x="50" y="52" width="8" height="6" fill="#f5f0e8"/>
    </g>
    <g class="char-body">
      <!-- pointed ears -->
      <rect x="12" y="4" width="8" height="12" fill="#e8701a"/>
      <rect x="14" y="2" width="6" height="8" fill="#e8701a"/>
      <rect x="16" y="0" width="4" height="6" fill="#e8701a"/>
      <rect x="14" y="4" width="4" height="6" fill="#f5b4b4"/>
      <rect x="44" y="4" width="8" height="12" fill="#e8701a"/>
      <rect x="44" y="2" width="6" height="8" fill="#e8701a"/>
      <rect x="44" y="0" width="4" height="6" fill="#e8701a"/>
      <rect x="46" y="4" width="4" height="6" fill="#f5b4b4"/>
      <!-- head -->
      <rect x="16" y="12" width="32" height="4" fill="#e8701a"/>
      <rect x="12" y="16" width="40" height="4" fill="#e8701a"/>
      <rect x="12" y="20" width="40" height="4" fill="#e8701a"/>
      <rect x="12" y="24" width="40" height="4" fill="#e8701a"/>
      <rect x="12" y="28" width="40" height="4" fill="#e8701a"/>
      <rect x="14" y="32" width="36" height="4" fill="#e8701a"/>
      <!-- white muzzle -->
      <rect x="20" y="26" width="24" height="12" fill="#f5f0e8"/>
      <rect x="18" y="28" width="28" height="8" fill="#f5f0e8"/>
      <!-- body -->
      <rect x="16" y="36" width="28" height="4" fill="#e8701a"/>
      <rect x="14" y="40" width="32" height="4" fill="#e8701a"/>
      <rect x="14" y="44" width="32" height="4" fill="#e8701a"/>
      <rect x="16" y="48" width="28" height="4" fill="#e8701a"/>
      <!-- chest white -->
      <rect x="20" y="38" width="20" height="12" fill="#f5f0e8"/>
    </g>
    <!-- eyelid sly overlay -->
    <rect x="14" y="20" width="14" height="4" fill="#e8701a"/>
    <rect x="36" y="20" width="14" height="4" fill="#e8701a"/>
    <g class="char-eyes">
      <!-- sly half-closed eyes -->
      <rect x="14" y="22" width="14" height="6" fill="#2d1810"/>
      <rect x="36" y="22" width="14" height="6" fill="#2d1810"/>
      <rect x="16" y="22" width="4" height="3" fill="#ffffff"/>
      <rect x="38" y="22" width="4" height="3" fill="#ffffff"/>
    </g>
    <!-- nose -->
    <rect x="26" y="28" width="12" height="4" fill="#2d1810"/>
    <rect x="28" y="26" width="8" height="4" fill="#2d1810"/>
    <!-- sly smirk -->
    <rect x="22" y="34" width="8" height="3" fill="#b05010"/>
    <rect x="30" y="32" width="12" height="3" fill="#b05010"/>
    <g class="char-limbs">
      <rect x="16" y="52" width="8" height="6" fill="#d06010"/>
      <rect x="36" y="52" width="8" height="6" fill="#d06010"/>
    </g>
  </svg>`,

  /* Turtle 꼼꼼이 — Green, grid-pattern shell, steady smile */
  "test-engineer": `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- tail nub -->
      <rect x="28" y="56" width="8" height="4" fill="#7ab870"/>
      <rect x="30" y="58" width="4" height="4" fill="#5a9060"/>
    </g>
    <g class="char-body">
      <!-- shell base -->
      <rect x="8" y="28" width="48" height="4" fill="#4a9a50"/>
      <rect x="6" y="32" width="52" height="4" fill="#4a9a50"/>
      <rect x="6" y="36" width="52" height="4" fill="#4a9a50"/>
      <rect x="6" y="40" width="52" height="4" fill="#4a9a50"/>
      <rect x="8" y="44" width="48" height="4" fill="#4a9a50"/>
      <rect x="12" y="48" width="40" height="4" fill="#4a9a50"/>
      <!-- shell grid pattern -->
      <rect x="12" y="28" width="8" height="8" fill="#3a7a40"/>
      <rect x="24" y="28" width="8" height="8" fill="#3a7a40"/>
      <rect x="36" y="28" width="8" height="8" fill="#3a7a40"/>
      <rect x="48" y="28" width="8" height="8" fill="#3a7a40"/>
      <rect x="8" y="36" width="8" height="8" fill="#3a7a40"/>
      <rect x="20" y="36" width="8" height="8" fill="#3a7a40"/>
      <rect x="32" y="36" width="8" height="8" fill="#3a7a40"/>
      <rect x="44" y="36" width="8" height="8" fill="#3a7a40"/>
      <rect x="12" y="44" width="8" height="8" fill="#3a7a40"/>
      <rect x="24" y="44" width="8" height="8" fill="#3a7a40"/>
      <rect x="36" y="44" width="8" height="8" fill="#3a7a40"/>
      <!-- shell highlight -->
      <rect x="14" y="30" width="4" height="4" fill="#6ac870"/>
      <rect x="26" y="30" width="4" height="4" fill="#6ac870"/>
      <!-- neck -->
      <rect x="24" y="18" width="16" height="4" fill="#7ab870"/>
      <rect x="22" y="22" width="20" height="4" fill="#7ab870"/>
      <!-- head -->
      <rect x="20" y="8" width="24" height="4" fill="#7ab870"/>
      <rect x="18" y="12" width="28" height="4" fill="#7ab870"/>
      <rect x="16" y="16" width="32" height="4" fill="#7ab870"/>
      <rect x="16" y="20" width="32" height="4" fill="#7ab870"/>
      <rect x="18" y="24" width="28" height="4" fill="#7ab870"/>
    </g>
    <g class="char-eyes">
      <rect x="20" y="13" width="8" height="8" fill="#1a2e1a"/>
      <rect x="36" y="13" width="8" height="8" fill="#1a2e1a"/>
      <rect x="22" y="13" width="3" height="3" fill="#ffffff"/>
      <rect x="38" y="13" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- steady smile -->
    <rect x="22" y="22" width="4" height="3" fill="#3a6040"/>
    <rect x="38" y="22" width="4" height="3" fill="#3a6040"/>
    <rect x="24" y="24" width="16" height="3" fill="#3a6040"/>
    <g class="char-limbs">
      <!-- four legs -->
      <rect x="4" y="32" width="10" height="6" fill="#7ab870"/>
      <rect x="2" y="36" width="8" height="6" fill="#7ab870"/>
      <rect x="50" y="32" width="10" height="6" fill="#7ab870"/>
      <rect x="54" y="36" width="8" height="6" fill="#7ab870"/>
      <rect x="6" y="44" width="10" height="6" fill="#7ab870"/>
      <rect x="4" y="48" width="8" height="6" fill="#7ab870"/>
      <rect x="48" y="44" width="10" height="6" fill="#7ab870"/>
      <rect x="52" y="48" width="8" height="6" fill="#7ab870"/>
    </g>
  </svg>`,

  /* Hedgehog 뾰족이 — Spiky dark back, cream face, tiny snout */
  "security-reviewer": `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- pixel spikes -->
      <rect x="20" y="4" width="4" height="8" fill="#3a2810"/>
      <rect x="28" y="0" width="4" height="12" fill="#3a2810"/>
      <rect x="36" y="0" width="4" height="12" fill="#3a2810"/>
      <rect x="44" y="4" width="4" height="8" fill="#3a2810"/>
      <rect x="50" y="10" width="4" height="8" fill="#3a2810"/>
      <rect x="54" y="18" width="4" height="8" fill="#3a2810"/>
    </g>
    <g class="char-body">
      <!-- spiky back (pixel spikes) -->
      <rect x="20" y="8" width="4" height="8" fill="#3a2810"/>
      <rect x="28" y="4" width="4" height="12" fill="#3a2810"/>
      <rect x="36" y="4" width="4" height="12" fill="#3a2810"/>
      <rect x="44" y="8" width="4" height="8" fill="#3a2810"/>
      <rect x="14" y="14" width="4" height="8" fill="#3a2810"/>
      <rect x="50" y="14" width="4" height="8" fill="#3a2810"/>
      <rect x="10" y="22" width="4" height="8" fill="#3a2810"/>
      <rect x="54" y="22" width="4" height="8" fill="#3a2810"/>
      <!-- body (dark spiny back) -->
      <rect x="16" y="16" width="36" height="4" fill="#5a4020"/>
      <rect x="12" y="20" width="44" height="4" fill="#5a4020"/>
      <rect x="10" y="24" width="44" height="4" fill="#5a4020"/>
      <rect x="10" y="28" width="44" height="4" fill="#5a4020"/>
      <rect x="12" y="32" width="40" height="4" fill="#5a4020"/>
      <rect x="16" y="36" width="32" height="4" fill="#5a4020"/>
      <rect x="20" y="40" width="24" height="4" fill="#5a4020"/>
      <!-- belly cream -->
      <rect x="20" y="32" width="22" height="12" fill="#e8d0a0"/>
    </g>
    <!-- face (cream, offset to left-center) -->
    <rect x="10" y="22" width="28" height="4" fill="#e8d0a0"/>
    <rect x="8" y="26" width="28" height="4" fill="#e8d0a0"/>
    <rect x="8" y="30" width="28" height="4" fill="#e8d0a0"/>
    <rect x="10" y="34" width="24" height="4" fill="#e8d0a0"/>
    <!-- pointy snout -->
    <rect x="4" y="30" width="10" height="6" fill="#d4b880"/>
    <rect x="2" y="32" width="6" height="4" fill="#d4b880"/>
    <!-- nose -->
    <rect x="2" y="32" width="4" height="4" fill="#1a1a1a"/>
    <!-- ear -->
    <rect x="28" y="18" width="6" height="6" fill="#e8d0a0"/>
    <rect x="30" y="16" width="4" height="4" fill="#f5b4a0"/>
    <g class="char-eyes">
      <rect x="14" y="26" width="8" height="8" fill="#1a1a1a"/>
      <rect x="16" y="26" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- tiny smile -->
    <rect x="10" y="36" width="8" height="3" fill="#a09060"/>
    <g class="char-limbs">
      <!-- feet -->
      <rect x="20" y="44" width="8" height="6" fill="#d4b880"/>
      <rect x="36" y="44" width="8" height="6" fill="#d4b880"/>
    </g>
  </svg>`,

  /* Mechanic 수리수리 — Red cap, blue overalls, wrench */
  "build-fixer": `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- red cap -->
      <rect x="18" y="8" width="28" height="4" fill="#d84040"/>
      <rect x="14" y="10" width="36" height="4" fill="#d84040"/>
      <rect x="14" y="12" width="36" height="4" fill="#d84040"/>
      <rect x="12" y="14" width="40" height="4" fill="#c03030"/>
      <!-- cap button -->
      <rect x="30" y="6" width="4" height="4" fill="#c03030"/>
      <!-- wrench -->
      <rect x="50" y="38" width="4" height="4" fill="#909090"/>
      <rect x="52" y="34" width="4" height="6" fill="#909090"/>
      <rect x="54" y="30" width="4" height="6" fill="#909090"/>
      <rect x="54" y="28" width="8" height="4" fill="#909090"/>
      <rect x="58" y="24" width="4" height="8" fill="#909090"/>
      <rect x="54" y="24" width="4" height="4" fill="#909090"/>
      <!-- wrench jaw gap -->
      <rect x="56" y="26" width="2" height="4" fill="#3a6aaa"/>
    </g>
    <g class="char-body">
      <!-- overalls body -->
      <rect x="16" y="38" width="32" height="4" fill="#3a6aaa"/>
      <rect x="14" y="42" width="36" height="4" fill="#3a6aaa"/>
      <rect x="14" y="46" width="36" height="4" fill="#3a6aaa"/>
      <rect x="16" y="50" width="32" height="4" fill="#3a6aaa"/>
      <!-- overalls bib -->
      <rect x="24" y="34" width="16" height="8" fill="#4a7abb"/>
      <!-- bib pocket -->
      <rect x="28" y="38" width="8" height="4" fill="#3a5a9a"/>
      <!-- overall straps -->
      <rect x="22" y="32" width="4" height="6" fill="#4a7abb"/>
      <rect x="38" y="32" width="4" height="6" fill="#4a7abb"/>
      <!-- left arm -->
      <rect x="6" y="38" width="10" height="4" fill="#3a6aaa"/>
      <rect x="4" y="42" width="10" height="4" fill="#3a6aaa"/>
      <rect x="4" y="46" width="8" height="4" fill="#e8b48a"/>
      <!-- right arm (holding wrench) -->
      <rect x="48" y="38" width="10" height="4" fill="#3a6aaa"/>
      <rect x="50" y="42" width="8" height="4" fill="#e8b48a"/>
      <!-- head -->
      <rect x="18" y="18" width="28" height="4" fill="#e8b48a"/>
      <rect x="14" y="20" width="36" height="4" fill="#e8b48a"/>
      <rect x="14" y="24" width="36" height="4" fill="#e8b48a"/>
      <rect x="14" y="28" width="36" height="4" fill="#e8b48a"/>
      <rect x="18" y="32" width="28" height="4" fill="#e8b48a"/>
      <!-- ears -->
      <rect x="10" y="22" width="6" height="8" fill="#d9a07a"/>
      <rect x="48" y="22" width="6" height="8" fill="#d9a07a"/>
    </g>
    <g class="char-eyes">
      <rect x="20" y="22" width="8" height="8" fill="#2d1b10"/>
      <rect x="36" y="22" width="8" height="8" fill="#2d1b10"/>
      <rect x="22" y="22" width="3" height="3" fill="#ffffff"/>
      <rect x="38" y="22" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- eyebrows -->
    <rect x="20" y="20" width="8" height="3" fill="#7a4a20"/>
    <rect x="36" y="20" width="8" height="3" fill="#7a4a20"/>
    <!-- nose -->
    <rect x="28" y="28" width="8" height="4" fill="#c08060"/>
    <!-- smile -->
    <rect x="24" y="32" width="4" height="3" fill="#b07050"/>
    <rect x="36" y="32" width="4" height="3" fill="#b07050"/>
    <rect x="26" y="34" width="12" height="3" fill="#b07050"/>
    <g class="char-limbs">
      <!-- legs -->
      <rect x="20" y="54" width="8" height="6" fill="#2a5a8a"/>
      <rect x="36" y="54" width="8" height="6" fill="#2a5a8a"/>
    </g>
  </svg>`,

  /* Black Cat 깜냥이 — Dark body, glowing amber pixel eyes, tail */
  "git-master": `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- tail -->
      <rect x="46" y="40" width="6" height="4" fill="#1a1428"/>
      <rect x="50" y="32" width="6" height="10" fill="#1a1428"/>
      <rect x="54" y="22" width="6" height="12" fill="#1a1428"/>
      <rect x="56" y="16" width="6" height="8" fill="#1a1428"/>
      <rect x="54" y="12" width="6" height="6" fill="#1a1428"/>
      <rect x="50" y="10" width="6" height="4" fill="#1a1428"/>
    </g>
    <g class="char-body">
      <!-- pointed ears -->
      <rect x="12" y="4" width="8" height="12" fill="#1a1428"/>
      <rect x="14" y="2" width="6" height="8" fill="#1a1428"/>
      <rect x="16" y="0" width="4" height="6" fill="#1a1428"/>
      <rect x="14" y="4" width="4" height="6" fill="#2e1838"/>
      <rect x="44" y="4" width="8" height="12" fill="#1a1428"/>
      <rect x="44" y="2" width="6" height="8" fill="#1a1428"/>
      <rect x="44" y="0" width="4" height="6" fill="#1a1428"/>
      <rect x="46" y="4" width="4" height="6" fill="#2e1838"/>
      <!-- head -->
      <rect x="14" y="12" width="36" height="4" fill="#1a1428"/>
      <rect x="10" y="16" width="44" height="4" fill="#1a1428"/>
      <rect x="10" y="20" width="44" height="4" fill="#1a1428"/>
      <rect x="10" y="24" width="44" height="4" fill="#1a1428"/>
      <rect x="10" y="28" width="44" height="4" fill="#1a1428"/>
      <rect x="14" y="32" width="36" height="4" fill="#1a1428"/>
      <!-- body -->
      <rect x="14" y="36" width="32" height="4" fill="#1a1428"/>
      <rect x="12" y="40" width="36" height="4" fill="#1a1428"/>
      <rect x="12" y="44" width="36" height="4" fill="#1a1428"/>
      <rect x="14" y="48" width="32" height="4" fill="#1a1428"/>
    </g>
    <!-- eye glow halos -->
    <rect x="16" y="18" width="16" height="14" fill="#f5a623" opacity="0.15"/>
    <rect x="32" y="18" width="16" height="14" fill="#f5a623" opacity="0.15"/>
    <g class="char-eyes">
      <!-- glowing amber eyes -->
      <rect x="18" y="20" width="12" height="10" fill="#f5a623"/>
      <rect x="34" y="20" width="12" height="10" fill="#f5a623"/>
      <!-- slit pupils -->
      <rect x="22" y="20" width="4" height="10" fill="#1a0a08"/>
      <rect x="38" y="20" width="4" height="10" fill="#1a0a08"/>
      <!-- eye glints -->
      <rect x="18" y="20" width="2" height="2" fill="#ffffff" opacity="0.8"/>
      <rect x="34" y="20" width="2" height="2" fill="#ffffff" opacity="0.8"/>
    </g>
    <!-- nose -->
    <rect x="28" y="31" width="8" height="4" fill="#8060a0"/>
    <rect x="30" y="29" width="4" height="4" fill="#8060a0"/>
    <!-- whiskers -->
    <rect x="0" y="28" width="14" height="2" fill="#3a3050"/>
    <rect x="0" y="32" width="14" height="2" fill="#3a3050"/>
    <rect x="50" y="28" width="14" height="2" fill="#3a3050"/>
    <rect x="50" y="32" width="14" height="2" fill="#3a3050"/>
    <g class="char-limbs">
      <!-- paws -->
      <rect x="14" y="52" width="10" height="6" fill="#1a1428"/>
      <rect x="36" y="52" width="10" height="6" fill="#1a1428"/>
    </g>
  </svg>`,

  /* Parrot 딴지 — Green body, colorful feathers, curved beak, one eye */
  critic: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- branch -->
      <rect x="4" y="52" width="56" height="8" fill="#8b5e3c"/>
      <rect x="4" y="52" width="56" height="4" fill="#a07048"/>
      <!-- tail feathers -->
      <rect x="36" y="46" width="4" height="4" fill="#22d3ee"/>
      <rect x="36" y="50" width="4" height="4" fill="#22d3ee"/>
      <rect x="38" y="54" width="4" height="4" fill="#22d3ee"/>
      <rect x="40" y="58" width="4" height="4" fill="#22d3ee"/>
      <rect x="30" y="48" width="4" height="4" fill="#4ade80"/>
      <rect x="30" y="52" width="4" height="4" fill="#4ade80"/>
      <rect x="32" y="56" width="4" height="4" fill="#4ade80"/>
      <rect x="24" y="48" width="4" height="4" fill="#f5a623"/>
      <rect x="22" y="52" width="4" height="4" fill="#f5a623"/>
      <rect x="22" y="56" width="4" height="6" fill="#f5a623"/>
    </g>
    <g class="char-body">
      <!-- body -->
      <rect x="18" y="34" width="28" height="4" fill="#22c070"/>
      <rect x="16" y="38" width="30" height="4" fill="#22c070"/>
      <rect x="16" y="42" width="28" height="4" fill="#22c070"/>
      <rect x="18" y="46" width="22" height="4" fill="#22c070"/>
      <!-- wing -->
      <rect x="8" y="36" width="10" height="16" fill="#18a060"/>
      <rect x="6" y="38" width="10" height="12" fill="#18a060"/>
      <!-- wing highlight cyan -->
      <rect x="8" y="38" width="6" height="10" fill="#22d3ee"/>
      <!-- head -->
      <rect x="20" y="14" width="28" height="4" fill="#22c070"/>
      <rect x="18" y="18" width="32" height="4" fill="#22c070"/>
      <rect x="16" y="22" width="36" height="4" fill="#22c070"/>
      <rect x="16" y="26" width="36" height="4" fill="#22c070"/>
      <rect x="18" y="30" width="32" height="4" fill="#22c070"/>
      <!-- head top patch yellow -->
      <rect x="22" y="10" width="20" height="4" fill="#f5a623"/>
      <rect x="24" y="8" width="16" height="4" fill="#f5a623"/>
      <rect x="20" y="14" width="24" height="6" fill="#f5a623"/>
    </g>
    <!-- eye ring white -->
    <rect x="38" y="20" width="14" height="12" fill="#ffffff"/>
    <g class="char-eyes">
      <!-- single visible eye -->
      <rect x="40" y="22" width="10" height="8" fill="#1a1a2e"/>
      <rect x="42" y="22" width="6" height="6" fill="#2d60c0"/>
      <rect x="44" y="23" width="2" height="2" fill="#ffffff"/>
    </g>
    <!-- curved beak -->
    <rect x="10" y="24" width="10" height="4" fill="#e8c020"/>
    <rect x="8" y="26" width="8" height="4" fill="#e8c020"/>
    <rect x="10" y="28" width="6" height="4" fill="#e8c020"/>
    <rect x="12" y="32" width="4" height="4" fill="#e8c020"/>
    <g class="char-limbs">
      <!-- feet on branch -->
      <rect x="22" y="50" width="4" height="4" fill="#c0a030"/>
      <rect x="18" y="54" width="4" height="4" fill="#c0a030"/>
      <rect x="22" y="54" width="4" height="4" fill="#c0a030"/>
      <rect x="26" y="54" width="4" height="4" fill="#c0a030"/>
      <rect x="34" y="50" width="4" height="4" fill="#c0a030"/>
      <rect x="30" y="54" width="4" height="4" fill="#c0a030"/>
      <rect x="34" y="54" width="4" height="4" fill="#c0a030"/>
      <rect x="38" y="54" width="4" height="4" fill="#c0a030"/>
    </g>
  </svg>`,

  /* Squirrel 도토리 — Brown, bushy tail, holding acorn */
  "dependency-expert": `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- bushy tail (large, curls up behind) -->
      <rect x="42" y="30" width="8" height="4" fill="#b07030"/>
      <rect x="46" y="22" width="8" height="10" fill="#b07030"/>
      <rect x="48" y="14" width="8" height="10" fill="#b07030"/>
      <rect x="46" y="10" width="8" height="6" fill="#b07030"/>
      <rect x="42" y="8" width="6" height="6" fill="#b07030"/>
      <rect x="38" y="10" width="6" height="4" fill="#b07030"/>
      <!-- tail inner lighter -->
      <rect x="46" y="14" width="6" height="8" fill="#d09050"/>
      <rect x="48" y="18" width="6" height="6" fill="#e8c080"/>
      <!-- acorn -->
      <rect x="38" y="42" width="12" height="14" fill="#b07020"/>
      <rect x="36" y="40" width="16" height="6" fill="#7a5018"/>
      <rect x="38" y="38" width="12" height="4" fill="#7a5018"/>
      <rect x="43" y="34" width="4" height="6" fill="#7a5018"/>
      <!-- acorn lines -->
      <rect x="38" y="44" width="12" height="2" fill="#906018"/>
      <rect x="38" y="48" width="12" height="2" fill="#906018"/>
    </g>
    <g class="char-body">
      <!-- ears pointy -->
      <rect x="14" y="6" width="6" height="10" fill="#c08040"/>
      <rect x="16" y="4" width="4" height="8" fill="#c08040"/>
      <rect x="16" y="6" width="4" height="6" fill="#f5b4a0"/>
      <rect x="32" y="6" width="6" height="10" fill="#c08040"/>
      <rect x="32" y="4" width="4" height="8" fill="#c08040"/>
      <rect x="34" y="6" width="4" height="6" fill="#f5b4a0"/>
      <!-- head -->
      <rect x="14" y="14" width="28" height="4" fill="#c08040"/>
      <rect x="10" y="18" width="32" height="4" fill="#c08040"/>
      <rect x="10" y="22" width="32" height="4" fill="#c08040"/>
      <rect x="10" y="26" width="32" height="4" fill="#c08040"/>
      <rect x="10" y="30" width="32" height="4" fill="#c08040"/>
      <rect x="12" y="34" width="28" height="4" fill="#c08040"/>
      <!-- body -->
      <rect x="12" y="38" width="28" height="4" fill="#c08040"/>
      <rect x="10" y="42" width="28" height="4" fill="#c08040"/>
      <rect x="10" y="46" width="28" height="4" fill="#c08040"/>
      <rect x="12" y="50" width="24" height="4" fill="#c08040"/>
      <!-- arms holding acorn -->
      <rect x="36" y="38" width="6" height="4" fill="#c08040"/>
      <rect x="38" y="34" width="4" height="6" fill="#c08040"/>
    </g>
    <g class="char-eyes">
      <rect x="16" y="22" width="8" height="8" fill="#1a1010"/>
      <rect x="28" y="22" width="8" height="8" fill="#1a1010"/>
      <rect x="18" y="22" width="3" height="3" fill="#ffffff"/>
      <rect x="30" y="22" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- cheeks blush -->
    <rect x="10" y="30" width="6" height="4" fill="#e09060"/>
    <rect x="32" y="30" width="6" height="4" fill="#e09060"/>
    <!-- nose -->
    <rect x="22" y="30" width="8" height="4" fill="#a06030"/>
    <!-- smile -->
    <rect x="18" y="36" width="4" height="3" fill="#806030"/>
    <rect x="30" y="36" width="4" height="3" fill="#806030"/>
    <rect x="20" y="38" width="12" height="3" fill="#806030"/>
    <g class="char-limbs">
      <rect x="14" y="54" width="8" height="6" fill="#a06830"/>
      <rect x="28" y="54" width="8" height="6" fill="#a06830"/>
    </g>
  </svg>`,

  /* Robot 로봇 — Boxy body, antenna, LED eyes, vent slots */
  default: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- antenna -->
      <rect x="30" y="2" width="4" height="10" fill="#7090b0"/>
      <rect x="26" y="2" width="12" height="4" fill="#a0c8f0"/>
      <rect x="28" y="0" width="8" height="4" fill="#22d3ee"/>
    </g>
    <g class="char-body">
      <!-- head -->
      <rect x="14" y="12" width="36" height="4" fill="#3a5a7a"/>
      <rect x="10" y="16" width="44" height="4" fill="#3a5a7a"/>
      <rect x="10" y="20" width="44" height="4" fill="#3a5a7a"/>
      <rect x="10" y="24" width="44" height="4" fill="#3a5a7a"/>
      <rect x="10" y="28" width="44" height="4" fill="#3a5a7a"/>
      <rect x="10" y="32" width="44" height="4" fill="#3a5a7a"/>
      <rect x="14" y="36" width="36" height="4" fill="#3a5a7a"/>
      <!-- head highlight -->
      <rect x="12" y="14" width="40" height="4" fill="#4a7aaa" opacity="0.5"/>
      <!-- eye panels dark recess -->
      <rect x="14" y="20" width="14" height="12" fill="#1a2a3a"/>
      <rect x="36" y="20" width="14" height="12" fill="#1a2a3a"/>
      <!-- mouth panel -->
      <rect x="16" y="34" width="32" height="6" fill="#1a2a3a"/>
      <!-- neck -->
      <rect x="26" y="40" width="12" height="4" fill="#2a4a6a"/>
      <!-- body -->
      <rect x="12" y="44" width="40" height="4" fill="#2a4a6a"/>
      <rect x="10" y="48" width="44" height="4" fill="#2a4a6a"/>
      <rect x="10" y="52" width="44" height="4" fill="#2a4a6a"/>
      <rect x="12" y="56" width="40" height="4" fill="#2a4a6a"/>
      <!-- body panel -->
      <rect x="14" y="48" width="14" height="10" fill="#1a2a3a"/>
      <!-- vent slots -->
      <rect x="32" y="50" width="16" height="2" fill="#3a6a8a"/>
      <rect x="32" y="54" width="16" height="2" fill="#3a6a8a"/>
      <rect x="32" y="58" width="16" height="2" fill="#3a6a8a"/>
      <!-- arms -->
      <rect x="0" y="46" width="10" height="6" fill="#2a4a6a"/>
      <rect x="54" y="46" width="10" height="6" fill="#2a4a6a"/>
      <rect x="0" y="52" width="8" height="4" fill="#3a5a7a"/>
      <rect x="56" y="52" width="8" height="4" fill="#3a5a7a"/>
    </g>
    <g class="char-eyes">
      <!-- glowing cyan eyes -->
      <rect x="16" y="22" width="10" height="8" fill="#22d3ee"/>
      <rect x="38" y="22" width="10" height="8" fill="#22d3ee"/>
      <!-- eye glow -->
      <rect x="14" y="20" width="14" height="12" fill="#22d3ee" opacity="0.15"/>
      <rect x="36" y="20" width="14" height="12" fill="#22d3ee" opacity="0.15"/>
      <!-- pupils -->
      <rect x="19" y="24" width="4" height="4" fill="#0a8090"/>
      <rect x="41" y="24" width="4" height="4" fill="#0a8090"/>
      <rect x="17" y="22" width="2" height="2" fill="#ffffff" opacity="0.7"/>
      <rect x="39" y="22" width="2" height="2" fill="#ffffff" opacity="0.7"/>
    </g>
    <!-- mouth LED dots -->
    <rect x="18" y="36" width="4" height="4" fill="#4ade80"/>
    <rect x="24" y="36" width="4" height="4" fill="#4ade80"/>
    <rect x="30" y="36" width="4" height="4" fill="#fbbf24"/>
    <rect x="36" y="36" width="4" height="4" fill="#fbbf24"/>
    <!-- power button -->
    <rect x="18" y="50" width="8" height="8" fill="#22d3ee" opacity="0.8"/>
    <g class="char-limbs">
      <!-- leg stubs -->
      <rect x="16" y="60" width="10" height="4" fill="#2a4a6a"/>
      <rect x="38" y="60" width="10" height="4" fill="#2a4a6a"/>
    </g>
  </svg>`,

};

/* ============================================================
   The Crib Board — Hood Style Character SVG Definitions
   Same pixel art grid (64x64, 4x4 rects) but dressed in
   streetwear: snapbacks, hoodies, gold chains, boomboxes,
   spray cans, durags, grillz, headphones, and swagger.
   Color palette: golds #ffd700, purples #6b21a8, reds #ef4444,
   blues #3b82f6, blacks #1a1a1a — vibrant, bold, fun.
   ============================================================ */

window.CHARACTERS_HOOD = {

  /* Hamster 뚝딱이 — Snapback (tilted), gold chain, fresh sneakers */
  executor: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-body">
      <!-- ears -->
      <rect x="16" y="12" width="8" height="8" fill="#e8903a"/>
      <rect x="40" y="12" width="8" height="8" fill="#e8903a"/>
      <rect x="18" y="14" width="4" height="4" fill="#f5a0b0"/>
      <rect x="42" y="14" width="4" height="4" fill="#f5a0b0"/>
      <!-- head -->
      <rect x="16" y="18" width="32" height="4" fill="#e8903a"/>
      <rect x="12" y="22" width="40" height="4" fill="#e8903a"/>
      <rect x="12" y="26" width="40" height="4" fill="#e8903a"/>
      <rect x="12" y="30" width="40" height="4" fill="#e8903a"/>
      <rect x="16" y="34" width="32" height="4" fill="#e8903a"/>
      <!-- cheek pouches -->
      <rect x="8" y="26" width="8" height="8" fill="#f5c09a"/>
      <rect x="48" y="26" width="8" height="8" fill="#f5c09a"/>
      <!-- body -->
      <rect x="16" y="38" width="32" height="4" fill="#e8903a"/>
      <rect x="16" y="42" width="32" height="4" fill="#e8903a"/>
      <rect x="20" y="46" width="24" height="4" fill="#e8903a"/>
    </g>
    <g class="char-accessory">
      <!-- snapback brim (tilted right) -->
      <rect x="10" y="18" width="44" height="4" fill="#1a1a1a"/>
      <!-- snapback cap body -->
      <rect x="14" y="6" width="36" height="4" fill="#ef4444"/>
      <rect x="12" y="8" width="40" height="6" fill="#ef4444"/>
      <rect x="10" y="14" width="44" height="4" fill="#ef4444"/>
      <!-- cap sticker stripe -->
      <rect x="22" y="10" width="20" height="2" fill="#ffd700"/>
      <!-- brim underside dark -->
      <rect x="10" y="20" width="44" height="2" fill="#111111"/>
      <!-- gold chain row 1 -->
      <rect x="22" y="38" width="4" height="2" fill="#ffd700"/>
      <rect x="28" y="38" width="4" height="2" fill="#ffd700"/>
      <rect x="34" y="38" width="4" height="2" fill="#ffd700"/>
      <rect x="38" y="40" width="2" height="4" fill="#ffd700"/>
      <rect x="24" y="40" width="14" height="2" fill="#ffd700"/>
      <!-- gold pendant -->
      <rect x="28" y="42" width="8" height="4" fill="#ffd700"/>
      <rect x="30" y="44" width="4" height="4" fill="#f5c542"/>
    </g>
    <g class="char-eyes">
      <rect x="20" y="24" width="6" height="6" fill="#1a1a1a"/>
      <rect x="38" y="24" width="6" height="6" fill="#1a1a1a"/>
      <rect x="22" y="24" width="2" height="2" fill="#ffffff"/>
      <rect x="40" y="24" width="2" height="2" fill="#ffffff"/>
    </g>
    <!-- nose -->
    <rect x="28" y="30" width="8" height="4" fill="#c06040"/>
    <!-- confident smirk -->
    <rect x="28" y="34" width="12" height="3" fill="#a04020"/>
    <rect x="36" y="32" width="4" height="4" fill="#a04020"/>
    <g class="char-limbs">
      <!-- sneakers left -->
      <rect x="14" y="50" width="10" height="4" fill="#ef4444"/>
      <rect x="12" y="54" width="12" height="4" fill="#1a1a1a"/>
      <rect x="12" y="54" width="4" height="4" fill="#ffffff"/>
      <!-- sneakers right -->
      <rect x="40" y="50" width="10" height="4" fill="#ef4444"/>
      <rect x="40" y="54" width="12" height="4" fill="#1a1a1a"/>
      <rect x="48" y="54" width="4" height="4" fill="#ffffff"/>
    </g>
  </svg>`,

  /* Dog 킁킁이 — Hoodie with hood up, headphones around neck */
  explorer: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- hoodie hood (up, framing head) -->
      <rect x="8" y="12" width="10" height="24" fill="#6b21a8"/>
      <rect x="6" y="14" width="10" height="20" fill="#6b21a8"/>
      <rect x="46" y="12" width="10" height="24" fill="#6b21a8"/>
      <rect x="48" y="14" width="10" height="20" fill="#6b21a8"/>
      <rect x="16" y="8" width="32" height="6" fill="#6b21a8"/>
      <rect x="14" y="12" width="36" height="4" fill="#7c3aed"/>
      <!-- hoodie front opening -->
      <rect x="24" y="38" width="16" height="18" fill="#5b21b6"/>
      <!-- kangaroo pocket -->
      <rect x="22" y="46" width="20" height="8" fill="#4c1d95"/>
    </g>
    <g class="char-body">
      <!-- floppy ears (inside hood) -->
      <rect x="10" y="18" width="8" height="16" fill="#c07a30"/>
      <rect x="46" y="18" width="8" height="16" fill="#c07a30"/>
      <!-- head -->
      <rect x="16" y="14" width="32" height="4" fill="#d99848"/>
      <rect x="14" y="18" width="36" height="4" fill="#d99848"/>
      <rect x="14" y="22" width="36" height="4" fill="#d99848"/>
      <rect x="14" y="26" width="36" height="4" fill="#d99848"/>
      <rect x="14" y="30" width="36" height="4" fill="#d99848"/>
      <rect x="16" y="34" width="32" height="4" fill="#d99848"/>
      <!-- snout -->
      <rect x="20" y="28" width="24" height="8" fill="#c07a30"/>
      <!-- body hoodie fill -->
      <rect x="16" y="38" width="32" height="4" fill="#6b21a8"/>
      <rect x="16" y="42" width="32" height="4" fill="#6b21a8"/>
      <rect x="20" y="46" width="24" height="4" fill="#6b21a8"/>
      <rect x="20" y="50" width="24" height="4" fill="#6b21a8"/>
    </g>
    <!-- nose block -->
    <rect x="24" y="26" width="16" height="6" fill="#1a1a1a"/>
    <rect x="26" y="24" width="12" height="4" fill="#1a1a1a"/>
    <rect x="26" y="26" width="4" height="2" fill="#3a3a3a"/>
    <g class="char-eyes">
      <rect x="18" y="20" width="8" height="8" fill="#1a1a1a"/>
      <rect x="38" y="20" width="8" height="8" fill="#1a1a1a"/>
      <rect x="20" y="20" width="3" height="3" fill="#ffffff"/>
      <rect x="40" y="20" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- headphones band over top -->
    <rect x="18" y="34" width="28" height="3" fill="#1a1a1a"/>
    <!-- headphone cups -->
    <rect x="12" y="32" width="8" height="8" fill="#ffd700"/>
    <rect x="44" y="32" width="8" height="8" fill="#ffd700"/>
    <rect x="14" y="34" width="4" height="4" fill="#1a1a1a"/>
    <rect x="46" y="34" width="4" height="4" fill="#1a1a1a"/>
    <g class="char-limbs">
      <rect x="14" y="54" width="10" height="6" fill="#6b21a8"/>
      <rect x="40" y="54" width="10" height="6" fill="#6b21a8"/>
    </g>
  </svg>`,

  /* Owl 지혜 — Bandana, gold watch, wise street look */
  planner: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- ear tufts -->
      <rect x="18" y="4" width="6" height="8" fill="#4e3820"/>
      <rect x="20" y="2" width="4" height="6" fill="#4e3820"/>
      <rect x="40" y="4" width="6" height="8" fill="#4e3820"/>
      <rect x="40" y="2" width="4" height="6" fill="#4e3820"/>
      <!-- bandana around neck -->
      <rect x="18" y="36" width="28" height="4" fill="#ef4444"/>
      <rect x="20" y="38" width="24" height="4" fill="#ef4444"/>
      <!-- bandana knot -->
      <rect x="28" y="42" width="8" height="4" fill="#cc2222"/>
      <!-- bandana triangle front -->
      <rect x="22" y="40" width="20" height="2" fill="#ef4444"/>
      <!-- gold watch on right wing -->
      <rect x="8" y="42" width="10" height="6" fill="#ffd700"/>
      <rect x="10" y="44" width="6" height="2" fill="#ffffff"/>
      <rect x="10" y="44" width="2" height="2" fill="#1a1a1a"/>
    </g>
    <g class="char-body">
      <!-- head -->
      <rect x="16" y="12" width="32" height="4" fill="#7c5c3a"/>
      <rect x="12" y="16" width="40" height="4" fill="#7c5c3a"/>
      <rect x="12" y="20" width="40" height="4" fill="#7c5c3a"/>
      <rect x="12" y="24" width="40" height="4" fill="#7c5c3a"/>
      <rect x="12" y="28" width="40" height="4" fill="#7c5c3a"/>
      <rect x="16" y="32" width="32" height="4" fill="#7c5c3a"/>
      <!-- eye rings cream -->
      <rect x="14" y="18" width="16" height="16" fill="#c4a06a"/>
      <rect x="34" y="18" width="16" height="16" fill="#c4a06a"/>
      <!-- body -->
      <rect x="20" y="36" width="24" height="4" fill="#7c5c3a"/>
      <rect x="16" y="40" width="32" height="4" fill="#7c5c3a"/>
      <rect x="16" y="44" width="32" height="4" fill="#7c5c3a"/>
      <rect x="20" y="48" width="24" height="4" fill="#7c5c3a"/>
      <!-- chest -->
      <rect x="22" y="38" width="20" height="12" fill="#c4a06a"/>
      <!-- wings -->
      <rect x="6" y="36" width="12" height="16" fill="#4e3820"/>
      <rect x="46" y="36" width="12" height="16" fill="#4e3820"/>
    </g>
    <g class="char-eyes">
      <rect x="16" y="20" width="12" height="12" fill="#f5a623"/>
      <rect x="36" y="20" width="12" height="12" fill="#f5a623"/>
      <rect x="20" y="22" width="6" height="8" fill="#1a1a1a"/>
      <rect x="40" y="22" width="6" height="8" fill="#1a1a1a"/>
      <rect x="20" y="22" width="2" height="2" fill="#ffffff"/>
      <rect x="40" y="22" width="2" height="2" fill="#ffffff"/>
    </g>
    <!-- beak -->
    <rect x="28" y="30" width="8" height="4" fill="#e8a020"/>
    <rect x="30" y="34" width="4" height="4" fill="#e8a020"/>
    <g class="char-limbs">
      <rect x="22" y="52" width="8" height="4" fill="#e8a020"/>
      <rect x="18" y="56" width="4" height="4" fill="#e8a020"/>
      <rect x="22" y="56" width="4" height="4" fill="#e8a020"/>
      <rect x="26" y="56" width="4" height="4" fill="#e8a020"/>
      <rect x="34" y="52" width="8" height="4" fill="#e8a020"/>
      <rect x="32" y="56" width="4" height="4" fill="#e8a020"/>
      <rect x="36" y="56" width="4" height="4" fill="#e8a020"/>
      <rect x="40" y="56" width="4" height="4" fill="#e8a020"/>
    </g>
  </svg>`,

  /* Beaver 댐댐이 — Fitted cap, oversized jacket, blueprint scroll */
  architect: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- fitted cap (flat brim) -->
      <rect x="14" y="8" width="36" height="4" fill="#1a1a1a"/>
      <rect x="16" y="4" width="32" height="6" fill="#3b82f6"/>
      <rect x="18" y="2" width="28" height="4" fill="#3b82f6"/>
      <!-- cap logo stitch -->
      <rect x="28" y="4" width="8" height="4" fill="#ffd700"/>
      <!-- flat tail at bottom -->
      <rect x="16" y="56" width="32" height="6" fill="#6b4428"/>
      <rect x="12" y="52" width="40" height="6" fill="#8b5e3c"/>
      <rect x="16" y="52" width="8" height="2" fill="#6b4428"/>
      <rect x="28" y="54" width="8" height="2" fill="#6b4428"/>
      <rect x="40" y="52" width="8" height="2" fill="#6b4428"/>
      <!-- blueprint scroll in arms -->
      <rect x="2" y="38" width="12" height="16" fill="#dbeafe"/>
      <rect x="2" y="38" width="12" height="2" fill="#3b82f6"/>
      <rect x="2" y="52" width="12" height="2" fill="#3b82f6"/>
      <!-- blueprint lines -->
      <rect x="4" y="42" width="8" height="1" fill="#3b82f6"/>
      <rect x="4" y="45" width="8" height="1" fill="#3b82f6"/>
      <rect x="4" y="48" width="8" height="1" fill="#3b82f6"/>
      <!-- oversized jacket -->
      <rect x="12" y="38" width="40" height="4" fill="#1a1a1a"/>
      <rect x="10" y="42" width="44" height="4" fill="#1a1a1a"/>
      <rect x="10" y="46" width="44" height="4" fill="#1a1a1a"/>
      <rect x="12" y="50" width="40" height="4" fill="#1a1a1a"/>
    </g>
    <g class="char-body">
      <!-- ears -->
      <rect x="14" y="18" width="6" height="8" fill="#b07848"/>
      <rect x="44" y="18" width="6" height="8" fill="#b07848"/>
      <!-- head -->
      <rect x="16" y="18" width="32" height="4" fill="#b07848"/>
      <rect x="12" y="22" width="40" height="4" fill="#b07848"/>
      <rect x="12" y="26" width="40" height="4" fill="#b07848"/>
      <rect x="12" y="30" width="40" height="4" fill="#b07848"/>
      <rect x="16" y="34" width="32" height="4" fill="#b07848"/>
    </g>
    <g class="char-eyes">
      <rect x="20" y="24" width="8" height="8" fill="#2d1b10"/>
      <rect x="36" y="24" width="8" height="8" fill="#2d1b10"/>
      <rect x="22" y="24" width="3" height="3" fill="#ffffff"/>
      <rect x="38" y="24" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- nose -->
    <rect x="26" y="32" width="12" height="4" fill="#7a4428"/>
    <!-- buck teeth -->
    <rect x="26" y="36" width="5" height="6" fill="#ffffff"/>
    <rect x="33" y="36" width="5" height="6" fill="#ffffff"/>
    <rect x="31" y="36" width="2" height="6" fill="#e0d0c0"/>
    <!-- gold chain over jacket -->
    <rect x="22" y="38" width="4" height="2" fill="#ffd700"/>
    <rect x="28" y="38" width="4" height="2" fill="#ffd700"/>
    <rect x="34" y="38" width="4" height="2" fill="#ffd700"/>
    <rect x="38" y="40" width="2" height="3" fill="#ffd700"/>
    <rect x="24" y="40" width="14" height="2" fill="#ffd700"/>
    <g class="char-limbs">
      <rect x="18" y="50" width="8" height="4" fill="#1a1a1a"/>
      <rect x="38" y="50" width="8" height="4" fill="#1a1a1a"/>
    </g>
  </svg>`,

  /* Hawk 날카로미 — Aviator shades, leather jacket pixel art */
  verifier: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- left wing leather-styled -->
      <rect x="0" y="28" width="8" height="4" fill="#1a1a1a"/>
      <rect x="4" y="24" width="8" height="4" fill="#1a1a1a"/>
      <rect x="8" y="20" width="8" height="8" fill="#1a1a1a"/>
      <rect x="12" y="18" width="8" height="10" fill="#1a1a1a"/>
      <rect x="16" y="24" width="8" height="8" fill="#1a1a1a"/>
      <!-- right wing leather-styled -->
      <rect x="56" y="28" width="8" height="4" fill="#1a1a1a"/>
      <rect x="52" y="24" width="8" height="4" fill="#1a1a1a"/>
      <rect x="48" y="20" width="8" height="8" fill="#1a1a1a"/>
      <rect x="40" y="18" width="8" height="10" fill="#1a1a1a"/>
      <rect x="36" y="24" width="8" height="8" fill="#1a1a1a"/>
      <!-- leather jacket studs on wings -->
      <rect x="4" y="28" width="2" height="2" fill="#ffd700"/>
      <rect x="56" y="28" width="2" height="2" fill="#ffd700"/>
      <!-- aviator shades frame -->
      <rect x="14" y="20" width="16" height="10" fill="#1a1a1a"/>
      <rect x="34" y="20" width="16" height="10" fill="#1a1a1a"/>
      <!-- shades bridge -->
      <rect x="30" y="22" width="4" height="3" fill="#1a1a1a"/>
      <!-- shades lens gold tint -->
      <rect x="16" y="21" width="12" height="8" fill="#c8950a"/>
      <rect x="36" y="21" width="12" height="8" fill="#c8950a"/>
      <!-- shades highlight -->
      <rect x="16" y="21" width="4" height="2" fill="#ffd700"/>
      <rect x="36" y="21" width="4" height="2" fill="#ffd700"/>
      <!-- temple arms -->
      <rect x="10" y="22" width="4" height="2" fill="#1a1a1a"/>
      <rect x="50" y="22" width="4" height="2" fill="#1a1a1a"/>
    </g>
    <g class="char-body">
      <!-- head gold -->
      <rect x="18" y="10" width="28" height="4" fill="#c8a030"/>
      <rect x="14" y="14" width="36" height="4" fill="#c8a030"/>
      <rect x="14" y="18" width="36" height="4" fill="#c8a030"/>
      <rect x="14" y="22" width="36" height="4" fill="#c8a030"/>
      <rect x="14" y="26" width="36" height="4" fill="#c8a030"/>
      <rect x="18" y="30" width="28" height="4" fill="#c8a030"/>
      <!-- leather jacket body -->
      <rect x="18" y="34" width="28" height="4" fill="#1a1a1a"/>
      <rect x="16" y="38" width="32" height="4" fill="#1a1a1a"/>
      <rect x="16" y="42" width="32" height="4" fill="#1a1a1a"/>
      <rect x="18" y="46" width="28" height="4" fill="#1a1a1a"/>
      <!-- jacket chest patch -->
      <rect x="24" y="36" width="16" height="10" fill="#2d2d2d"/>
      <!-- jacket zipper -->
      <rect x="30" y="34" width="4" height="14" fill="#888888"/>
    </g>
    <!-- beak -->
    <rect x="26" y="30" width="12" height="4" fill="#e8a020"/>
    <rect x="28" y="34" width="8" height="4" fill="#e8a020"/>
    <g class="char-limbs">
      <rect x="22" y="50" width="4" height="8" fill="#c8a030"/>
      <rect x="16" y="56" width="4" height="4" fill="#c8a030"/>
      <rect x="20" y="56" width="4" height="4" fill="#c8a030"/>
      <rect x="24" y="58" width="4" height="4" fill="#c8a030"/>
      <rect x="38" y="50" width="4" height="8" fill="#c8a030"/>
      <rect x="44" y="56" width="4" height="4" fill="#c8a030"/>
      <rect x="40" y="56" width="4" height="4" fill="#c8a030"/>
      <rect x="36" y="58" width="4" height="4" fill="#c8a030"/>
    </g>
  </svg>`,

  /* Detective 셜록 — Long hoodie, phone in hand, beanie, street mode */
  debugger: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- beanie hat -->
      <rect x="14" y="4" width="36" height="4" fill="#ef4444"/>
      <rect x="12" y="6" width="40" height="6" fill="#ef4444"/>
      <rect x="14" y="10" width="36" height="4" fill="#ef4444"/>
      <!-- beanie cuff -->
      <rect x="12" y="14" width="40" height="4" fill="#cc2222"/>
      <!-- beanie pom pom -->
      <rect x="28" y="0" width="8" height="6" fill="#ffffff"/>
      <rect x="26" y="2" width="12" height="4" fill="#ffffff"/>
      <!-- phone in right hand -->
      <rect x="48" y="40" width="10" height="16" fill="#1a1a1a"/>
      <rect x="50" y="42" width="6" height="12" fill="#3b82f6"/>
      <!-- phone screen glow -->
      <rect x="50" y="44" width="6" height="4" fill="#60a5fa"/>
      <rect x="50" y="50" width="6" height="2" fill="#93c5fd"/>
      <!-- long hoodie body -->
      <rect x="14" y="38" width="32" height="4" fill="#1a1a1a"/>
      <rect x="12" y="42" width="36" height="4" fill="#1a1a1a"/>
      <rect x="12" y="46" width="36" height="4" fill="#1a1a1a"/>
      <rect x="14" y="50" width="32" height="6" fill="#1a1a1a"/>
      <!-- hoodie pocket -->
      <rect x="22" y="46" width="20" height="6" fill="#111111"/>
    </g>
    <g class="char-body">
      <!-- left arm in hoodie -->
      <rect x="6" y="40" width="8" height="6" fill="#1a1a1a"/>
      <rect x="8" y="44" width="6" height="6" fill="#1a1a1a"/>
      <!-- right arm holding phone -->
      <rect x="50" y="38" width="8" height="4" fill="#1a1a1a"/>
      <!-- head skin -->
      <rect x="18" y="18" width="28" height="4" fill="#e8b48a"/>
      <rect x="14" y="22" width="36" height="4" fill="#e8b48a"/>
      <rect x="14" y="26" width="36" height="4" fill="#e8b48a"/>
      <rect x="14" y="30" width="36" height="4" fill="#e8b48a"/>
      <rect x="18" y="34" width="28" height="4" fill="#e8b48a"/>
      <!-- ears -->
      <rect x="10" y="22" width="6" height="10" fill="#d9a07a"/>
      <rect x="48" y="22" width="6" height="10" fill="#d9a07a"/>
    </g>
    <g class="char-eyes">
      <!-- focused eyes with suspicion -->
      <rect x="20" y="24" width="8" height="7" fill="#2d1b10"/>
      <rect x="36" y="24" width="8" height="7" fill="#2d1b10"/>
      <rect x="22" y="24" width="3" height="3" fill="#ffffff"/>
      <rect x="38" y="24" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- eyebrows intense -->
    <rect x="20" y="21" width="8" height="3" fill="#6a4a20"/>
    <rect x="36" y="21" width="8" height="3" fill="#6a4a20"/>
    <!-- nose -->
    <rect x="28" y="30" width="8" height="4" fill="#c08060"/>
    <!-- skeptical mouth -->
    <rect x="24" y="34" width="16" height="3" fill="#b07050"/>
    <g class="char-limbs">
      <rect x="20" y="56" width="8" height="6" fill="#1a1a1a"/>
      <rect x="36" y="56" width="8" height="6" fill="#1a1a1a"/>
    </g>
  </svg>`,

  /* Cat 까칠냥 — Tiny pixel sunglasses, gold chain necklace */
  reviewer: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- tail curled high -->
      <rect x="48" y="36" width="6" height="4" fill="#9b8dba"/>
      <rect x="52" y="28" width="6" height="10" fill="#9b8dba"/>
      <rect x="54" y="20" width="6" height="10" fill="#9b8dba"/>
      <rect x="52" y="16" width="6" height="6" fill="#9b8dba"/>
      <rect x="48" y="14" width="6" height="4" fill="#9b8dba"/>
      <!-- sunglasses frames (tiny pixel shades) -->
      <rect x="14" y="21" width="14" height="7" fill="#1a1a1a"/>
      <rect x="36" y="21" width="14" height="7" fill="#1a1a1a"/>
      <!-- shades bridge -->
      <rect x="28" y="23" width="8" height="2" fill="#1a1a1a"/>
      <!-- shades lens electric blue -->
      <rect x="16" y="22" width="10" height="5" fill="#3b82f6"/>
      <rect x="38" y="22" width="10" height="5" fill="#3b82f6"/>
      <!-- lens highlight -->
      <rect x="16" y="22" width="3" height="2" fill="#93c5fd"/>
      <rect x="38" y="22" width="3" height="2" fill="#93c5fd"/>
      <!-- temple arms -->
      <rect x="10" y="23" width="4" height="2" fill="#1a1a1a"/>
      <rect x="50" y="23" width="4" height="2" fill="#1a1a1a"/>
      <!-- gold chain necklace -->
      <rect x="20" y="34" width="4" height="2" fill="#ffd700"/>
      <rect x="26" y="34" width="4" height="2" fill="#ffd700"/>
      <rect x="32" y="34" width="4" height="2" fill="#ffd700"/>
      <rect x="38" y="34" width="4" height="2" fill="#ffd700"/>
      <rect x="22" y="36" width="18" height="2" fill="#ffd700"/>
      <!-- chain pendant -->
      <rect x="28" y="38" width="8" height="4" fill="#ffd700"/>
      <rect x="30" y="40" width="4" height="4" fill="#f5c542"/>
    </g>
    <g class="char-body">
      <!-- pointed ears -->
      <rect x="14" y="4" width="8" height="8" fill="#b8a8d8"/>
      <rect x="16" y="2" width="6" height="6" fill="#b8a8d8"/>
      <rect x="18" y="0" width="4" height="4" fill="#b8a8d8"/>
      <rect x="16" y="4" width="4" height="4" fill="#f5b4c8"/>
      <rect x="42" y="4" width="8" height="8" fill="#b8a8d8"/>
      <rect x="42" y="2" width="6" height="6" fill="#b8a8d8"/>
      <rect x="42" y="0" width="4" height="4" fill="#b8a8d8"/>
      <rect x="44" y="4" width="4" height="4" fill="#f5b4c8"/>
      <!-- head -->
      <rect x="14" y="10" width="36" height="4" fill="#b8a8d8"/>
      <rect x="10" y="14" width="44" height="4" fill="#b8a8d8"/>
      <rect x="10" y="18" width="44" height="4" fill="#b8a8d8"/>
      <rect x="10" y="22" width="44" height="4" fill="#b8a8d8"/>
      <rect x="10" y="26" width="44" height="4" fill="#b8a8d8"/>
      <rect x="14" y="30" width="36" height="4" fill="#b8a8d8"/>
      <!-- body -->
      <rect x="16" y="34" width="32" height="4" fill="#b8a8d8"/>
      <rect x="14" y="38" width="34" height="4" fill="#b8a8d8"/>
      <rect x="14" y="42" width="34" height="4" fill="#b8a8d8"/>
      <rect x="16" y="46" width="32" height="4" fill="#b8a8d8"/>
    </g>
    <!-- nose -->
    <rect x="28" y="28" width="8" height="4" fill="#f5a0b4"/>
    <rect x="30" y="26" width="4" height="4" fill="#f5a0b4"/>
    <!-- unimpressed flat mouth -->
    <rect x="24" y="32" width="16" height="3" fill="#9b7090"/>
    <!-- whiskers -->
    <rect x="0" y="26" width="14" height="2" fill="#e0d8f0"/>
    <rect x="0" y="30" width="14" height="2" fill="#e0d8f0"/>
    <rect x="50" y="26" width="14" height="2" fill="#e0d8f0"/>
    <rect x="50" y="30" width="14" height="2" fill="#e0d8f0"/>
    <g class="char-limbs">
      <rect x="16" y="50" width="10" height="6" fill="#9b8dba"/>
      <rect x="38" y="50" width="10" height="6" fill="#9b8dba"/>
    </g>
  </svg>`,

  /* Octopus 먹물이 — Beanie, multiple arms with spray cans (graffiti writer) */
  writer: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- beanie on mantle top -->
      <rect x="20" y="2" width="24" height="4" fill="#1a1a1a"/>
      <rect x="18" y="4" width="28" height="4" fill="#1a1a1a"/>
      <!-- beanie stripe -->
      <rect x="18" y="6" width="28" height="2" fill="#ffd700"/>
      <!-- spray cans in tentacles -->
      <!-- can 1 (left front) red -->
      <rect x="2" y="46" width="6" height="12" fill="#ef4444"/>
      <rect x="2" y="44" width="6" height="4" fill="#cc2222"/>
      <rect x="4" y="42" width="2" height="4" fill="#888888"/>
      <!-- can 2 (right front) blue -->
      <rect x="56" y="46" width="6" height="12" fill="#3b82f6"/>
      <rect x="56" y="44" width="6" height="4" fill="#2563eb"/>
      <rect x="58" y="42" width="2" height="4" fill="#888888"/>
      <!-- spray mist left -->
      <rect x="0" y="46" width="2" height="2" fill="#ef4444"/>
      <rect x="0" y="50" width="2" height="2" fill="#fca5a5"/>
      <!-- spray mist right -->
      <rect x="62" y="46" width="2" height="2" fill="#3b82f6"/>
      <rect x="62" y="50" width="2" height="2" fill="#93c5fd"/>
    </g>
    <g class="char-limbs">
      <!-- tentacles (back) styled with color bands -->
      <rect x="12" y="40" width="6" height="4" fill="#e06090"/>
      <rect x="10" y="44" width="6" height="4" fill="#e06090"/>
      <rect x="8" y="48" width="6" height="4" fill="#ffd700"/>
      <rect x="6" y="52" width="6" height="4" fill="#e06090"/>
      <rect x="46" y="40" width="6" height="4" fill="#e06090"/>
      <rect x="48" y="44" width="6" height="4" fill="#e06090"/>
      <rect x="50" y="48" width="6" height="4" fill="#ffd700"/>
      <rect x="52" y="52" width="6" height="4" fill="#e06090"/>
      <!-- front tentacles holding cans -->
      <rect x="6" y="44" width="6" height="4" fill="#f07aaa"/>
      <rect x="4" y="48" width="6" height="4" fill="#f07aaa"/>
      <rect x="52" y="44" width="6" height="4" fill="#f07aaa"/>
      <rect x="54" y="48" width="6" height="4" fill="#f07aaa"/>
    </g>
    <g class="char-body">
      <!-- mantle dome with beanie coverage -->
      <rect x="24" y="6" width="16" height="4" fill="#e06090"/>
      <rect x="20" y="8" width="24" height="4" fill="#e06090"/>
      <rect x="18" y="10" width="28" height="4" fill="#e06090"/>
      <!-- head -->
      <rect x="16" y="14" width="32" height="4" fill="#f07aaa"/>
      <rect x="12" y="18" width="40" height="4" fill="#f07aaa"/>
      <rect x="12" y="22" width="40" height="4" fill="#f07aaa"/>
      <rect x="12" y="26" width="40" height="4" fill="#f07aaa"/>
      <rect x="12" y="30" width="40" height="4" fill="#f07aaa"/>
      <rect x="16" y="34" width="32" height="4" fill="#f07aaa"/>
      <!-- body/mantle -->
      <rect x="18" y="38" width="28" height="4" fill="#f07aaa"/>
      <rect x="16" y="42" width="32" height="4" fill="#f07aaa"/>
    </g>
    <g class="char-eyes">
      <rect x="16" y="18" width="12" height="12" fill="#ffffff"/>
      <rect x="36" y="18" width="12" height="12" fill="#ffffff"/>
      <rect x="18" y="20" width="8" height="8" fill="#1a1a2e"/>
      <rect x="38" y="20" width="8" height="8" fill="#1a1a2e"/>
      <rect x="18" y="20" width="3" height="3" fill="#ffffff"/>
      <rect x="38" y="20" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- blush -->
    <rect x="10" y="28" width="8" height="4" fill="#f5a0c0"/>
    <rect x="46" y="28" width="8" height="4" fill="#f5a0c0"/>
    <!-- smile -->
    <rect x="22" y="32" width="20" height="4" fill="#c04070"/>
  </svg>`,

  /* Mouse 쥐박사 — Varsity jacket, stylized glasses, gold acorns replaced with lab pride */
  scientist: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- big ears -->
      <rect x="4" y="8" width="16" height="20" fill="#d4b8b8"/>
      <rect x="6" y="6" width="12" height="20" fill="#d4b8b8"/>
      <rect x="8" y="4" width="8" height="18" fill="#d4b8b8"/>
      <rect x="8" y="8" width="8" height="14" fill="#f5c0c0"/>
      <rect x="44" y="8" width="16" height="20" fill="#d4b8b8"/>
      <rect x="46" y="6" width="12" height="20" fill="#d4b8b8"/>
      <rect x="48" y="4" width="8" height="18" fill="#d4b8b8"/>
      <rect x="48" y="8" width="8" height="14" fill="#f5c0c0"/>
      <!-- stylized chunky glasses frames -->
      <rect x="12" y="24" width="18" height="14" fill="#1a1a1a"/>
      <rect x="34" y="24" width="18" height="14" fill="#1a1a1a"/>
      <!-- glasses lens hot red -->
      <rect x="14" y="26" width="14" height="10" fill="#ef4444"/>
      <rect x="36" y="26" width="14" height="10" fill="#ef4444"/>
      <!-- lens highlight -->
      <rect x="14" y="26" width="4" height="3" fill="#fca5a5"/>
      <rect x="36" y="26" width="4" height="3" fill="#fca5a5"/>
      <!-- glasses bridge -->
      <rect x="28" y="28" width="8" height="3" fill="#1a1a1a"/>
      <!-- temple arms -->
      <rect x="8" y="27" width="4" height="2" fill="#1a1a1a"/>
      <rect x="52" y="27" width="4" height="2" fill="#1a1a1a"/>
      <!-- tail -->
      <rect x="46" y="50" width="4" height="4" fill="#c8a0a0"/>
      <rect x="50" y="46" width="4" height="6" fill="#c8a0a0"/>
      <rect x="54" y="40" width="4" height="8" fill="#c8a0a0"/>
      <rect x="58" y="32" width="4" height="10" fill="#c8a0a0"/>
    </g>
    <g class="char-body">
      <!-- head -->
      <rect x="16" y="14" width="32" height="4" fill="#d4b8b8"/>
      <rect x="12" y="18" width="40" height="4" fill="#d4b8b8"/>
      <rect x="12" y="22" width="40" height="4" fill="#d4b8b8"/>
      <rect x="12" y="26" width="40" height="4" fill="#d4b8b8"/>
      <rect x="12" y="30" width="40" height="4" fill="#d4b8b8"/>
      <rect x="14" y="34" width="36" height="4" fill="#d4b8b8"/>
      <!-- varsity jacket body -->
      <rect x="14" y="38" width="36" height="4" fill="#1a1a1a"/>
      <rect x="12" y="42" width="40" height="4" fill="#1a1a1a"/>
      <rect x="12" y="46" width="40" height="4" fill="#1a1a1a"/>
      <rect x="14" y="50" width="36" height="4" fill="#1a1a1a"/>
      <!-- varsity sleeves -->
      <rect x="6" y="40" width="8" height="10" fill="#ef4444"/>
      <rect x="50" y="40" width="8" height="10" fill="#ef4444"/>
      <!-- varsity chest letter -->
      <rect x="26" y="40" width="12" height="8" fill="#2d2d2d"/>
      <rect x="28" y="40" width="4" height="8" fill="#ffd700"/>
      <rect x="28" y="44" width="8" height="2" fill="#ffd700"/>
    </g>
    <g class="char-eyes">
      <rect x="16" y="26" width="10" height="8" fill="#2d1b2e"/>
      <rect x="38" y="26" width="10" height="8" fill="#2d1b2e"/>
      <rect x="18" y="26" width="3" height="3" fill="#ffffff"/>
      <rect x="40" y="26" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- nose -->
    <rect x="26" y="34" width="12" height="4" fill="#e08080"/>
    <rect x="28" y="32" width="8" height="4" fill="#e08080"/>
    <!-- smile -->
    <rect x="22" y="38" width="20" height="3" fill="#b06868"/>
    <g class="char-limbs">
      <rect x="8" y="50" width="8" height="4" fill="#ef4444"/>
      <rect x="48" y="50" width="8" height="4" fill="#ef4444"/>
      <rect x="16" y="54" width="10" height="6" fill="#1a1a1a"/>
      <rect x="38" y="54" width="10" height="6" fill="#1a1a1a"/>
    </g>
  </svg>`,

  /* Fox 센스 — Bucket hat, carrying boombox on shoulder */
  designer: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- bushy tail -->
      <rect x="46" y="32" width="8" height="4" fill="#e8701a"/>
      <rect x="48" y="36" width="8" height="4" fill="#e8701a"/>
      <rect x="50" y="40" width="8" height="8" fill="#e8701a"/>
      <rect x="50" y="48" width="8" height="6" fill="#e8701a"/>
      <rect x="52" y="50" width="6" height="8" fill="#f5f0e8"/>
      <!-- bucket hat brim -->
      <rect x="10" y="14" width="44" height="4" fill="#6b21a8"/>
      <!-- bucket hat dome -->
      <rect x="16" y="4" width="32" height="4" fill="#7c3aed"/>
      <rect x="14" y="6" width="36" height="6" fill="#7c3aed"/>
      <rect x="12" y="10" width="40" height="6" fill="#7c3aed"/>
      <!-- hat logo patch -->
      <rect x="28" y="8" width="8" height="6" fill="#ffd700"/>
      <rect x="30" y="9" width="4" height="4" fill="#6b21a8"/>
      <!-- boombox body on left arm -->
      <rect x="0" y="38" width="14" height="10" fill="#1a1a1a"/>
      <rect x="0" y="36" width="14" height="4" fill="#2d2d2d"/>
      <!-- boombox speakers -->
      <rect x="1" y="40" width="4" height="4" fill="#3b82f6"/>
      <rect x="9" y="40" width="4" height="4" fill="#3b82f6"/>
      <!-- boombox tape deck -->
      <rect x="4" y="41" width="6" height="2" fill="#888888"/>
      <!-- boombox antenna -->
      <rect x="12" y="30" width="2" height="8" fill="#888888"/>
      <!-- sound wave -->
      <rect x="14" y="40" width="2" height="6" fill="#ffd700"/>
    </g>
    <g class="char-body">
      <!-- pointed ears -->
      <rect x="12" y="8" width="8" height="8" fill="#e8701a"/>
      <rect x="14" y="6" width="6" height="6" fill="#e8701a"/>
      <rect x="14" y="8" width="4" height="4" fill="#f5b4b4"/>
      <rect x="44" y="8" width="8" height="8" fill="#e8701a"/>
      <rect x="44" y="6" width="6" height="6" fill="#e8701a"/>
      <rect x="46" y="8" width="4" height="4" fill="#f5b4b4"/>
      <!-- head -->
      <rect x="16" y="16" width="32" height="4" fill="#e8701a"/>
      <rect x="12" y="18" width="40" height="4" fill="#e8701a"/>
      <rect x="12" y="22" width="40" height="4" fill="#e8701a"/>
      <rect x="12" y="26" width="40" height="4" fill="#e8701a"/>
      <rect x="12" y="30" width="40" height="4" fill="#e8701a"/>
      <rect x="14" y="34" width="36" height="4" fill="#e8701a"/>
      <!-- white muzzle -->
      <rect x="20" y="26" width="24" height="12" fill="#f5f0e8"/>
      <rect x="18" y="28" width="28" height="8" fill="#f5f0e8"/>
      <!-- body -->
      <rect x="18" y="38" width="28" height="4" fill="#e8701a"/>
      <rect x="16" y="42" width="32" height="4" fill="#e8701a"/>
      <rect x="16" y="46" width="32" height="4" fill="#e8701a"/>
      <rect x="18" y="50" width="28" height="4" fill="#e8701a"/>
      <!-- chest white -->
      <rect x="22" y="40" width="20" height="12" fill="#f5f0e8"/>
    </g>
    <!-- sly eyelid overlay -->
    <rect x="14" y="20" width="14" height="4" fill="#e8701a"/>
    <rect x="36" y="20" width="14" height="4" fill="#e8701a"/>
    <g class="char-eyes">
      <rect x="14" y="22" width="14" height="6" fill="#2d1810"/>
      <rect x="36" y="22" width="14" height="6" fill="#2d1810"/>
      <rect x="16" y="22" width="4" height="3" fill="#ffffff"/>
      <rect x="38" y="22" width="4" height="3" fill="#ffffff"/>
    </g>
    <!-- nose -->
    <rect x="26" y="28" width="12" height="4" fill="#2d1810"/>
    <rect x="28" y="26" width="8" height="4" fill="#2d1810"/>
    <!-- smirk -->
    <rect x="22" y="34" width="8" height="3" fill="#b05010"/>
    <rect x="30" y="32" width="12" height="3" fill="#b05010"/>
    <g class="char-limbs">
      <!-- left arm holding boombox -->
      <rect x="4" y="36" width="12" height="4" fill="#d06010"/>
      <rect x="16" y="54" width="8" height="6" fill="#d06010"/>
      <rect x="36" y="54" width="8" height="6" fill="#d06010"/>
    </g>
  </svg>`,

  /* Turtle 꼼꼼이 — Graffiti-pattern shell, backwards cap */
  "test-engineer": `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- backwards snapback cap on head (brim behind) -->
      <rect x="18" y="4" width="28" height="4" fill="#ef4444"/>
      <rect x="16" y="6" width="32" height="4" fill="#ef4444"/>
      <rect x="18" y="8" width="28" height="4" fill="#ef4444"/>
      <!-- brim going back -->
      <rect x="22" y="12" width="20" height="4" fill="#cc2222"/>
      <!-- cap button -->
      <rect x="30" y="2" width="4" height="4" fill="#cc2222"/>
      <!-- tail nub -->
      <rect x="28" y="56" width="8" height="4" fill="#7ab870"/>
      <rect x="30" y="58" width="4" height="4" fill="#5a9060"/>
    </g>
    <g class="char-body">
      <!-- shell base with graffiti colors -->
      <rect x="8" y="28" width="48" height="4" fill="#4a9a50"/>
      <rect x="6" y="32" width="52" height="4" fill="#4a9a50"/>
      <rect x="6" y="36" width="52" height="4" fill="#4a9a50"/>
      <rect x="6" y="40" width="52" height="4" fill="#4a9a50"/>
      <rect x="8" y="44" width="48" height="4" fill="#4a9a50"/>
      <rect x="12" y="48" width="40" height="4" fill="#4a9a50"/>
      <!-- graffiti pattern squares (colorful tags) -->
      <rect x="12" y="28" width="8" height="8" fill="#ef4444"/>
      <rect x="24" y="28" width="8" height="8" fill="#ffd700"/>
      <rect x="36" y="28" width="8" height="8" fill="#3b82f6"/>
      <rect x="48" y="28" width="8" height="8" fill="#6b21a8"/>
      <rect x="8" y="36" width="8" height="8" fill="#ffd700"/>
      <rect x="20" y="36" width="8" height="8" fill="#6b21a8"/>
      <rect x="32" y="36" width="8" height="8" fill="#ef4444"/>
      <rect x="44" y="36" width="8" height="8" fill="#3b82f6"/>
      <rect x="12" y="44" width="8" height="8" fill="#3b82f6"/>
      <rect x="24" y="44" width="8" height="8" fill="#ef4444"/>
      <rect x="36" y="44" width="8" height="8" fill="#ffd700"/>
      <!-- graffiti highlight dots -->
      <rect x="14" y="30" width="4" height="2" fill="#ffd700"/>
      <rect x="26" y="30" width="4" height="2" fill="#ffffff"/>
      <!-- neck -->
      <rect x="24" y="18" width="16" height="4" fill="#7ab870"/>
      <rect x="22" y="22" width="20" height="4" fill="#7ab870"/>
      <!-- head -->
      <rect x="20" y="10" width="24" height="4" fill="#7ab870"/>
      <rect x="18" y="12" width="28" height="4" fill="#7ab870"/>
      <rect x="16" y="16" width="32" height="4" fill="#7ab870"/>
      <rect x="16" y="20" width="32" height="4" fill="#7ab870"/>
      <rect x="18" y="24" width="28" height="4" fill="#7ab870"/>
    </g>
    <g class="char-eyes">
      <rect x="20" y="14" width="8" height="8" fill="#1a2e1a"/>
      <rect x="36" y="14" width="8" height="8" fill="#1a2e1a"/>
      <rect x="22" y="14" width="3" height="3" fill="#ffffff"/>
      <rect x="38" y="14" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- steady smile -->
    <rect x="22" y="23" width="4" height="3" fill="#3a6040"/>
    <rect x="38" y="23" width="4" height="3" fill="#3a6040"/>
    <rect x="24" y="25" width="16" height="3" fill="#3a6040"/>
    <g class="char-limbs">
      <rect x="4" y="32" width="10" height="6" fill="#7ab870"/>
      <rect x="2" y="36" width="8" height="6" fill="#7ab870"/>
      <rect x="50" y="32" width="10" height="6" fill="#7ab870"/>
      <rect x="54" y="36" width="8" height="6" fill="#7ab870"/>
      <rect x="6" y="44" width="10" height="6" fill="#7ab870"/>
      <rect x="4" y="48" width="8" height="6" fill="#7ab870"/>
      <rect x="48" y="44" width="10" height="6" fill="#7ab870"/>
      <rect x="52" y="48" width="8" height="6" fill="#7ab870"/>
    </g>
  </svg>`,

  /* Hedgehog 뾰족이 — Spiky mohawk spines, studded collar */
  "security-reviewer": `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- mohawk-style spines (colored tips = punk/street) -->
      <rect x="20" y="0" width="4" height="10" fill="#ef4444"/>
      <rect x="28" y="0" width="4" height="14" fill="#ffd700"/>
      <rect x="36" y="0" width="4" height="14" fill="#ef4444"/>
      <rect x="44" y="2" width="4" height="10" fill="#ffd700"/>
      <rect x="50" y="8" width="4" height="8" fill="#ef4444"/>
      <rect x="54" y="16" width="4" height="8" fill="#ffd700"/>
      <!-- spike base shafts dark -->
      <rect x="20" y="6" width="4" height="8" fill="#3a2810"/>
      <rect x="28" y="6" width="4" height="12" fill="#3a2810"/>
      <rect x="36" y="6" width="4" height="12" fill="#3a2810"/>
      <rect x="44" y="8" width="4" height="8" fill="#3a2810"/>
      <rect x="50" y="14" width="4" height="8" fill="#3a2810"/>
      <rect x="54" y="22" width="4" height="8" fill="#3a2810"/>
      <!-- studded collar -->
      <rect x="8" y="36" width="28" height="5" fill="#1a1a1a"/>
      <!-- studs gold -->
      <rect x="10" y="37" width="3" height="3" fill="#ffd700"/>
      <rect x="16" y="37" width="3" height="3" fill="#ffd700"/>
      <rect x="22" y="37" width="3" height="3" fill="#ffd700"/>
      <rect x="28" y="37" width="3" height="3" fill="#ffd700"/>
    </g>
    <g class="char-body">
      <!-- spiky back -->
      <rect x="14" y="14" width="4" height="8" fill="#3a2810"/>
      <rect x="10" y="22" width="4" height="8" fill="#3a2810"/>
      <!-- body dark spiny back -->
      <rect x="16" y="16" width="36" height="4" fill="#5a4020"/>
      <rect x="12" y="20" width="44" height="4" fill="#5a4020"/>
      <rect x="10" y="24" width="44" height="4" fill="#5a4020"/>
      <rect x="10" y="28" width="44" height="4" fill="#5a4020"/>
      <rect x="12" y="32" width="40" height="4" fill="#5a4020"/>
      <rect x="16" y="36" width="32" height="4" fill="#5a4020"/>
      <rect x="20" y="40" width="24" height="4" fill="#5a4020"/>
      <!-- belly cream -->
      <rect x="20" y="32" width="22" height="8" fill="#e8d0a0"/>
    </g>
    <!-- face cream -->
    <rect x="10" y="22" width="28" height="4" fill="#e8d0a0"/>
    <rect x="8" y="26" width="28" height="4" fill="#e8d0a0"/>
    <rect x="8" y="30" width="28" height="4" fill="#e8d0a0"/>
    <rect x="10" y="34" width="24" height="4" fill="#e8d0a0"/>
    <!-- pointy snout -->
    <rect x="4" y="30" width="10" height="6" fill="#d4b880"/>
    <rect x="2" y="32" width="6" height="4" fill="#d4b880"/>
    <!-- nose -->
    <rect x="2" y="32" width="4" height="4" fill="#1a1a1a"/>
    <!-- ear -->
    <rect x="28" y="18" width="6" height="6" fill="#e8d0a0"/>
    <rect x="30" y="16" width="4" height="4" fill="#f5b4a0"/>
    <g class="char-eyes">
      <rect x="14" y="26" width="8" height="8" fill="#1a1a1a"/>
      <rect x="16" y="26" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- fierce smirk -->
    <rect x="10" y="36" width="10" height="3" fill="#a09060"/>
    <g class="char-limbs">
      <rect x="20" y="44" width="8" height="6" fill="#d4b880"/>
      <rect x="36" y="44" width="8" height="6" fill="#d4b880"/>
    </g>
  </svg>`,

  /* Mechanic 수리수리 — Durag, overalls one strap down, blinged wrench */
  "build-fixer": `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- durag cap on head -->
      <rect x="14" y="10" width="36" height="4" fill="#1a1a1a"/>
      <rect x="14" y="8" width="36" height="4" fill="#1a1a1a"/>
      <rect x="16" y="6" width="32" height="4" fill="#1a1a1a"/>
      <rect x="18" y="4" width="28" height="4" fill="#1a1a1a"/>
      <!-- durag tail hanging back -->
      <rect x="46" y="14" width="8" height="20" fill="#111111"/>
      <rect x="48" y="18" width="6" height="18" fill="#111111"/>
      <rect x="50" y="32" width="4" height="10" fill="#111111"/>
      <!-- durag knot front -->
      <rect x="28" y="14" width="8" height="4" fill="#333333"/>
      <!-- bling wrench (gold plated) -->
      <rect x="48" y="38" width="6" height="4" fill="#ffd700"/>
      <rect x="50" y="34" width="4" height="6" fill="#ffd700"/>
      <rect x="52" y="30" width="4" height="6" fill="#ffd700"/>
      <rect x="52" y="28" width="8" height="4" fill="#ffd700"/>
      <rect x="56" y="24" width="4" height="8" fill="#ffd700"/>
      <rect x="52" y="24" width="4" height="4" fill="#ffd700"/>
      <!-- wrench gems -->
      <rect x="54" y="26" width="2" height="2" fill="#ef4444"/>
      <rect x="58" y="26" width="2" height="2" fill="#3b82f6"/>
      <!-- overalls (one strap only) -->
      <rect x="16" y="38" width="32" height="4" fill="#3b82f6"/>
      <rect x="14" y="42" width="36" height="4" fill="#3b82f6"/>
      <rect x="14" y="46" width="36" height="4" fill="#3b82f6"/>
      <rect x="16" y="50" width="32" height="4" fill="#3b82f6"/>
      <!-- one strap (left side only) -->
      <rect x="22" y="32" width="5" height="8" fill="#4a7abb"/>
      <!-- bib pocket -->
      <rect x="22" y="38" width="14" height="8" fill="#4a7abb"/>
      <rect x="24" y="40" width="10" height="4" fill="#3a5a9a"/>
    </g>
    <g class="char-body">
      <!-- head skin -->
      <rect x="18" y="18" width="28" height="4" fill="#e8b48a"/>
      <rect x="14" y="20" width="36" height="4" fill="#e8b48a"/>
      <rect x="14" y="24" width="36" height="4" fill="#e8b48a"/>
      <rect x="14" y="28" width="36" height="4" fill="#e8b48a"/>
      <rect x="18" y="32" width="28" height="4" fill="#e8b48a"/>
      <!-- ears -->
      <rect x="10" y="22" width="6" height="8" fill="#d9a07a"/>
      <rect x="48" y="22" width="6" height="8" fill="#d9a07a"/>
      <!-- left arm reaching -->
      <rect x="6" y="38" width="10" height="4" fill="#3b82f6"/>
      <rect x="4" y="42" width="10" height="4" fill="#3b82f6"/>
      <rect x="4" y="46" width="8" height="4" fill="#e8b48a"/>
      <!-- right arm holding bling wrench -->
      <rect x="48" y="38" width="10" height="4" fill="#3b82f6"/>
      <rect x="50" y="42" width="8" height="4" fill="#e8b48a"/>
    </g>
    <g class="char-eyes">
      <rect x="20" y="22" width="8" height="8" fill="#2d1b10"/>
      <rect x="36" y="22" width="8" height="8" fill="#2d1b10"/>
      <rect x="22" y="22" width="3" height="3" fill="#ffffff"/>
      <rect x="38" y="22" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- eyebrows -->
    <rect x="20" y="20" width="8" height="3" fill="#7a4a20"/>
    <rect x="36" y="20" width="8" height="3" fill="#7a4a20"/>
    <!-- nose -->
    <rect x="28" y="28" width="8" height="4" fill="#c08060"/>
    <!-- confident smile -->
    <rect x="24" y="32" width="16" height="3" fill="#b07050"/>
    <g class="char-limbs">
      <rect x="20" y="54" width="8" height="6" fill="#2a5a8a"/>
      <rect x="36" y="54" width="8" height="6" fill="#2a5a8a"/>
    </g>
  </svg>`,

  /* Black Cat 깜냥이 — All black, glowing amber eyes, tiny gold chain */
  "git-master": `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- tail curling up mysteriously -->
      <rect x="46" y="40" width="6" height="4" fill="#1a1428"/>
      <rect x="50" y="32" width="6" height="10" fill="#1a1428"/>
      <rect x="54" y="22" width="6" height="12" fill="#1a1428"/>
      <rect x="56" y="16" width="6" height="8" fill="#1a1428"/>
      <rect x="54" y="12" width="6" height="6" fill="#1a1428"/>
      <rect x="50" y="10" width="6" height="4" fill="#1a1428"/>
      <!-- tiny gold chain -->
      <rect x="18" y="34" width="4" height="2" fill="#ffd700"/>
      <rect x="24" y="34" width="4" height="2" fill="#ffd700"/>
      <rect x="30" y="34" width="4" height="2" fill="#ffd700"/>
      <rect x="36" y="34" width="4" height="2" fill="#ffd700"/>
      <rect x="20" y="36" width="20" height="2" fill="#ffd700"/>
      <!-- tiny pendant -->
      <rect x="28" y="38" width="8" height="4" fill="#ffd700"/>
      <rect x="30" y="40" width="4" height="3" fill="#f5c542"/>
    </g>
    <g class="char-body">
      <!-- pointed ears -->
      <rect x="12" y="4" width="8" height="12" fill="#1a1428"/>
      <rect x="14" y="2" width="6" height="8" fill="#1a1428"/>
      <rect x="16" y="0" width="4" height="6" fill="#1a1428"/>
      <rect x="14" y="4" width="4" height="6" fill="#2e1838"/>
      <rect x="44" y="4" width="8" height="12" fill="#1a1428"/>
      <rect x="44" y="2" width="6" height="8" fill="#1a1428"/>
      <rect x="44" y="0" width="4" height="6" fill="#1a1428"/>
      <rect x="46" y="4" width="4" height="6" fill="#2e1838"/>
      <!-- head -->
      <rect x="14" y="12" width="36" height="4" fill="#1a1428"/>
      <rect x="10" y="16" width="44" height="4" fill="#1a1428"/>
      <rect x="10" y="20" width="44" height="4" fill="#1a1428"/>
      <rect x="10" y="24" width="44" height="4" fill="#1a1428"/>
      <rect x="10" y="28" width="44" height="4" fill="#1a1428"/>
      <rect x="14" y="32" width="36" height="4" fill="#1a1428"/>
      <!-- body -->
      <rect x="14" y="36" width="32" height="4" fill="#1a1428"/>
      <rect x="12" y="40" width="36" height="4" fill="#1a1428"/>
      <rect x="12" y="44" width="36" height="4" fill="#1a1428"/>
      <rect x="14" y="48" width="32" height="4" fill="#1a1428"/>
    </g>
    <!-- eye glow halos amber -->
    <rect x="16" y="18" width="16" height="14" fill="#f5a623" opacity="0.2"/>
    <rect x="32" y="18" width="16" height="14" fill="#f5a623" opacity="0.2"/>
    <g class="char-eyes">
      <!-- glowing amber eyes, larger and brighter -->
      <rect x="18" y="20" width="12" height="10" fill="#f5a623"/>
      <rect x="34" y="20" width="12" height="10" fill="#f5a623"/>
      <!-- LED sunglasses vibe: dark bar over top half of eyes -->
      <rect x="18" y="20" width="12" height="4" fill="#1a1428"/>
      <rect x="34" y="20" width="12" height="4" fill="#1a1428"/>
      <!-- slit pupils -->
      <rect x="22" y="24" width="4" height="6" fill="#1a0a08"/>
      <rect x="38" y="24" width="4" height="6" fill="#1a0a08"/>
      <!-- eye glints -->
      <rect x="18" y="24" width="2" height="2" fill="#ffffff" opacity="0.8"/>
      <rect x="34" y="24" width="2" height="2" fill="#ffffff" opacity="0.8"/>
    </g>
    <!-- nose -->
    <rect x="28" y="31" width="8" height="4" fill="#8060a0"/>
    <rect x="30" y="29" width="4" height="4" fill="#8060a0"/>
    <!-- whiskers -->
    <rect x="0" y="28" width="14" height="2" fill="#3a3050"/>
    <rect x="0" y="32" width="14" height="2" fill="#3a3050"/>
    <rect x="50" y="28" width="14" height="2" fill="#3a3050"/>
    <rect x="50" y="32" width="14" height="2" fill="#3a3050"/>
    <g class="char-limbs">
      <rect x="14" y="52" width="10" height="6" fill="#1a1428"/>
      <rect x="36" y="52" width="10" height="6" fill="#1a1428"/>
    </g>
  </svg>`,

  /* Parrot 딴지 — Snapback, mic in claw (rapper parrot), colorful plumage */
  critic: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- branch -->
      <rect x="4" y="52" width="56" height="8" fill="#8b5e3c"/>
      <rect x="4" y="52" width="56" height="4" fill="#a07048"/>
      <!-- snapback brim over head -->
      <rect x="14" y="18" width="40" height="4" fill="#1a1a1a"/>
      <!-- snapback cap dome -->
      <rect x="18" y="8" width="28" height="4" fill="#ef4444"/>
      <rect x="16" y="10" width="32" height="6" fill="#ef4444"/>
      <rect x="14" y="14" width="36" height="6" fill="#ef4444"/>
      <!-- cap sticker logo -->
      <rect x="26" y="11" width="12" height="4" fill="#ffd700"/>
      <rect x="28" y="11" width="8" height="4" fill="#ef4444"/>
      <!-- microphone in right claw -->
      <rect x="42" y="44" width="6" height="14" fill="#888888"/>
      <rect x="40" y="42" width="10" height="6" fill="#3b82f6"/>
      <rect x="38" y="40" width="14" height="4" fill="#3b82f6"/>
      <!-- mic grille dots -->
      <rect x="40" y="43" width="2" height="2" fill="#1a1a1a"/>
      <rect x="44" y="43" width="2" height="2" fill="#1a1a1a"/>
      <rect x="42" y="45" width="2" height="2" fill="#1a1a1a"/>
      <!-- sound wave from mic -->
      <rect x="54" y="38" width="2" height="8" fill="#ffd700"/>
      <!-- tail feathers colorful -->
      <rect x="28" y="46" width="4" height="4" fill="#22d3ee"/>
      <rect x="28" y="50" width="4" height="4" fill="#22d3ee"/>
      <rect x="30" y="54" width="4" height="4" fill="#22d3ee"/>
      <rect x="22" y="48" width="4" height="4" fill="#4ade80"/>
      <rect x="22" y="52" width="4" height="4" fill="#4ade80"/>
      <rect x="16" y="48" width="4" height="4" fill="#ffd700"/>
      <rect x="14" y="52" width="4" height="6" fill="#ffd700"/>
    </g>
    <g class="char-body">
      <!-- body -->
      <rect x="18" y="34" width="28" height="4" fill="#22c070"/>
      <rect x="16" y="38" width="30" height="4" fill="#22c070"/>
      <rect x="16" y="42" width="28" height="4" fill="#22c070"/>
      <rect x="18" y="46" width="22" height="4" fill="#22c070"/>
      <!-- wing -->
      <rect x="8" y="36" width="10" height="16" fill="#18a060"/>
      <rect x="6" y="38" width="10" height="12" fill="#18a060"/>
      <rect x="8" y="38" width="6" height="10" fill="#22d3ee"/>
      <!-- head -->
      <rect x="20" y="18" width="28" height="4" fill="#22c070"/>
      <rect x="18" y="20" width="32" height="4" fill="#22c070"/>
      <rect x="16" y="24" width="36" height="4" fill="#22c070"/>
      <rect x="16" y="28" width="36" height="4" fill="#22c070"/>
      <rect x="18" y="32" width="32" height="4" fill="#22c070"/>
      <!-- head top yellow patch under cap -->
      <rect x="22" y="18" width="20" height="4" fill="#f5a623"/>
    </g>
    <!-- eye ring white -->
    <rect x="38" y="22" width="14" height="12" fill="#ffffff"/>
    <g class="char-eyes">
      <rect x="40" y="24" width="10" height="8" fill="#1a1a2e"/>
      <rect x="42" y="24" width="6" height="6" fill="#2d60c0"/>
      <rect x="44" y="25" width="2" height="2" fill="#ffffff"/>
    </g>
    <!-- curved beak -->
    <rect x="10" y="26" width="10" height="4" fill="#e8c020"/>
    <rect x="8" y="28" width="8" height="4" fill="#e8c020"/>
    <rect x="10" y="30" width="6" height="4" fill="#e8c020"/>
    <rect x="12" y="34" width="4" height="4" fill="#e8c020"/>
    <g class="char-limbs">
      <!-- feet on branch -->
      <rect x="22" y="50" width="4" height="4" fill="#c0a030"/>
      <rect x="18" y="54" width="4" height="4" fill="#c0a030"/>
      <rect x="22" y="54" width="4" height="4" fill="#c0a030"/>
      <rect x="26" y="54" width="4" height="4" fill="#c0a030"/>
      <rect x="36" y="50" width="4" height="4" fill="#c0a030"/>
      <rect x="36" y="54" width="4" height="4" fill="#c0a030"/>
      <rect x="40" y="54" width="4" height="4" fill="#c0a030"/>
    </g>
  </svg>`,

  /* Squirrel 도토리 — Hoodie, gold acorns instead of regular ones */
  "dependency-expert": `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- bushy tail gold-tipped (extra flamboyant) -->
      <rect x="42" y="30" width="8" height="4" fill="#b07030"/>
      <rect x="46" y="22" width="8" height="10" fill="#b07030"/>
      <rect x="48" y="14" width="8" height="10" fill="#b07030"/>
      <rect x="46" y="10" width="8" height="6" fill="#b07030"/>
      <rect x="42" y="8" width="6" height="6" fill="#b07030"/>
      <rect x="38" y="10" width="6" height="4" fill="#b07030"/>
      <!-- tail inner gold accent -->
      <rect x="46" y="14" width="6" height="8" fill="#ffd700"/>
      <rect x="48" y="18" width="6" height="6" fill="#f5c542"/>
      <!-- hoodie body -->
      <rect x="10" y="38" width="30" height="4" fill="#6b21a8"/>
      <rect x="8" y="42" width="32" height="4" fill="#6b21a8"/>
      <rect x="8" y="46" width="32" height="4" fill="#6b21a8"/>
      <rect x="10" y="50" width="28" height="4" fill="#6b21a8"/>
      <!-- hoodie pocket -->
      <rect x="12" y="44" width="22" height="6" fill="#5b21b6"/>
      <!-- gold acorn in hands (shiny!) -->
      <rect x="34" y="42" width="12" height="14" fill="#ffd700"/>
      <rect x="32" y="40" width="16" height="6" fill="#b07030"/>
      <rect x="34" y="38" width="12" height="4" fill="#b07030"/>
      <rect x="39" y="34" width="4" height="6" fill="#b07030"/>
      <!-- acorn shine lines -->
      <rect x="34" y="44" width="12" height="2" fill="#f5c542"/>
      <rect x="34" y="48" width="12" height="2" fill="#f5c542"/>
    </g>
    <g class="char-body">
      <!-- ears pointy -->
      <rect x="14" y="6" width="6" height="10" fill="#c08040"/>
      <rect x="16" y="4" width="4" height="8" fill="#c08040"/>
      <rect x="16" y="6" width="4" height="6" fill="#f5b4a0"/>
      <rect x="32" y="6" width="6" height="10" fill="#c08040"/>
      <rect x="32" y="4" width="4" height="8" fill="#c08040"/>
      <rect x="34" y="6" width="4" height="6" fill="#f5b4a0"/>
      <!-- head -->
      <rect x="14" y="14" width="28" height="4" fill="#c08040"/>
      <rect x="10" y="18" width="32" height="4" fill="#c08040"/>
      <rect x="10" y="22" width="32" height="4" fill="#c08040"/>
      <rect x="10" y="26" width="32" height="4" fill="#c08040"/>
      <rect x="10" y="30" width="32" height="4" fill="#c08040"/>
      <rect x="12" y="34" width="28" height="4" fill="#c08040"/>
      <!-- arms holding acorn -->
      <rect x="36" y="38" width="6" height="4" fill="#c08040"/>
      <rect x="38" y="34" width="4" height="6" fill="#c08040"/>
    </g>
    <g class="char-eyes">
      <rect x="16" y="22" width="8" height="8" fill="#1a1010"/>
      <rect x="28" y="22" width="8" height="8" fill="#1a1010"/>
      <rect x="18" y="22" width="3" height="3" fill="#ffffff"/>
      <rect x="30" y="22" width="3" height="3" fill="#ffffff"/>
    </g>
    <!-- cheeks blush -->
    <rect x="10" y="30" width="6" height="4" fill="#e09060"/>
    <rect x="32" y="30" width="6" height="4" fill="#e09060"/>
    <!-- nose -->
    <rect x="22" y="30" width="8" height="4" fill="#a06030"/>
    <!-- smile -->
    <rect x="18" y="36" width="4" height="3" fill="#806030"/>
    <rect x="30" y="36" width="4" height="3" fill="#806030"/>
    <rect x="20" y="38" width="12" height="3" fill="#806030"/>
    <g class="char-limbs">
      <rect x="12" y="54" width="8" height="6" fill="#6b21a8"/>
      <rect x="26" y="54" width="8" height="6" fill="#6b21a8"/>
    </g>
  </svg>`,

  /* Robot 로봇 — Snapback, gold chain, LED eyes styled as sunglasses */
  default: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <g class="char-accessory">
      <!-- snapback on robot head (no antenna, replaced) -->
      <rect x="10" y="14" width="44" height="4" fill="#1a1a1a"/>
      <!-- snapback dome -->
      <rect x="16" y="4" width="32" height="4" fill="#ffd700"/>
      <rect x="14" y="6" width="36" height="6" fill="#ffd700"/>
      <rect x="12" y="10" width="40" height="6" fill="#ffd700"/>
      <!-- cap logo -->
      <rect x="28" y="8" width="8" height="4" fill="#1a1a1a"/>
      <!-- gold chain -->
      <rect x="18" y="50" width="4" height="2" fill="#ffd700"/>
      <rect x="24" y="50" width="4" height="2" fill="#ffd700"/>
      <rect x="30" y="50" width="4" height="2" fill="#ffd700"/>
      <rect x="36" y="50" width="4" height="2" fill="#ffd700"/>
      <rect x="42" y="50" width="4" height="2" fill="#ffd700"/>
      <rect x="20" y="52" width="24" height="2" fill="#ffd700"/>
      <!-- chain pendant robot logo -->
      <rect x="28" y="54" width="8" height="6" fill="#ffd700"/>
      <rect x="30" y="56" width="4" height="4" fill="#22d3ee"/>
    </g>
    <g class="char-body">
      <!-- head -->
      <rect x="14" y="16" width="36" height="4" fill="#3a5a7a"/>
      <rect x="10" y="20" width="44" height="4" fill="#3a5a7a"/>
      <rect x="10" y="24" width="44" height="4" fill="#3a5a7a"/>
      <rect x="10" y="28" width="44" height="4" fill="#3a5a7a"/>
      <rect x="10" y="32" width="44" height="4" fill="#3a5a7a"/>
      <rect x="14" y="36" width="36" height="4" fill="#3a5a7a"/>
      <!-- head highlight -->
      <rect x="12" y="18" width="40" height="4" fill="#4a7aaa" opacity="0.5"/>
      <!-- eye panels dark recess -->
      <rect x="14" y="22" width="14" height="12" fill="#1a2a3a"/>
      <rect x="36" y="22" width="14" height="12" fill="#1a2a3a"/>
      <!-- mouth panel -->
      <rect x="16" y="34" width="32" height="6" fill="#1a2a3a"/>
      <!-- neck -->
      <rect x="26" y="40" width="12" height="4" fill="#2a4a6a"/>
      <!-- body -->
      <rect x="12" y="44" width="40" height="4" fill="#2a4a6a"/>
      <rect x="10" y="48" width="44" height="4" fill="#2a4a6a"/>
      <rect x="10" y="52" width="44" height="4" fill="#2a4a6a"/>
      <rect x="12" y="56" width="40" height="4" fill="#2a4a6a"/>
      <!-- vent slots -->
      <rect x="32" y="50" width="16" height="2" fill="#3a6a8a"/>
      <rect x="32" y="54" width="16" height="2" fill="#3a6a8a"/>
      <!-- arms -->
      <rect x="0" y="46" width="10" height="6" fill="#2a4a6a"/>
      <rect x="54" y="46" width="10" height="6" fill="#2a4a6a"/>
      <rect x="0" y="52" width="8" height="4" fill="#3a5a7a"/>
      <rect x="56" y="52" width="8" height="4" fill="#3a5a7a"/>
    </g>
    <g class="char-eyes">
      <!-- LED eyes styled as horizontal sunglasses bars -->
      <rect x="14" y="22" width="14" height="12" fill="#1a1a1a"/>
      <rect x="36" y="22" width="14" height="12" fill="#1a1a1a"/>
      <!-- shades lens gold -->
      <rect x="16" y="24" width="10" height="8" fill="#ffd700"/>
      <rect x="38" y="24" width="10" height="8" fill="#ffd700"/>
      <!-- LED glow lines on shades -->
      <rect x="16" y="26" width="10" height="2" fill="#f5c542"/>
      <rect x="38" y="26" width="10" height="2" fill="#f5c542"/>
      <!-- shades bridge -->
      <rect x="26" y="26" width="12" height="3" fill="#1a1a1a"/>
      <!-- lens highlight -->
      <rect x="16" y="24" width="3" height="2" fill="#ffffff" opacity="0.6"/>
      <rect x="38" y="24" width="3" height="2" fill="#ffffff" opacity="0.6"/>
    </g>
    <!-- mouth LED dots (grillz style) -->
    <rect x="18" y="36" width="4" height="4" fill="#ffd700"/>
    <rect x="24" y="36" width="4" height="4" fill="#ffd700"/>
    <rect x="30" y="36" width="4" height="4" fill="#ffd700"/>
    <rect x="36" y="36" width="4" height="4" fill="#ffd700"/>
    <!-- power button -->
    <rect x="16" y="50" width="10" height="6" fill="#22d3ee" opacity="0.8"/>
    <g class="char-limbs">
      <rect x="16" y="60" width="10" height="4" fill="#2a4a6a"/>
      <rect x="38" y="60" width="10" height="4" fill="#2a4a6a"/>
    </g>
  </svg>`,

};
