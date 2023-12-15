"use strict";

/* global Splide */

window.addEventListener('DOMContentLoaded', () => {
  // Sliders
  const SLIDER_ALBUM = document.querySelector('#slider-album');
  if (SLIDER_ALBUM) {
    new Splide(SLIDER_ALBUM, {
      type: 'slide',
      gap: '20px',
      pagination: false
    }).mount();
  }
});