/* global Splide */

class Menu {
  constructor() {
    this.menuWrapper = document.querySelector('#js-menu-wrapper');
    this.menuTrigger = document.querySelector('#js-menu-trigger');

    if (this.menuWrapper && this.menuTrigger) {
      this.menuLinks = this.menuWrapper.querySelectorAll('.js-menu-link');

      this.init = this.init.bind(this);
      this.show = this.show.bind(this);
      this.hide = this.hide.bind(this);
      this.toggle = this.toggle.bind(this);

      this.init();
    }
  }

  show() {
    this.menuWrapper.classList.remove('is-hide');
    this.menuWrapper.classList.add('is-show');
    this.menuTrigger.classList.add('is-open');

    document.body.style['overflow'] = 'hidden';
  }

  hide() {
    this.menuTrigger.classList.remove('is-open');
    this.menuWrapper.classList.remove('is-show');
    this.menuWrapper.classList.add('is-hide');

    document.body.style.removeProperty('overflow');
  }

  toggle() {
    if (this.menuTrigger.classList.contains('is-open')) {
      this.hide();
    } else {
      this.show();
    }
  }

  init() {
    this.menuTrigger.addEventListener('click', () => this.toggle());

    this.menuLinks.forEach((link) => link.addEventListener('click', this.hide));
  }
}

class Tabs {
  constructor(element, { activeClass } = {}) {
    this.tabsRoot = typeof element === 'string' ? document.querySelector(element) : element;

    if (this.tabsRoot) {
      this.tabsTrigger = this.tabsRoot.querySelectorAll('.js-tabs-trigger');
      this.tabsContent = this.tabsRoot.querySelectorAll('.js-tabs-content');

      this.options = {
        activeClass: activeClass || 'is-current',
      };

      this.update = this.update.bind(this);

      this.init();
    }
  }

  update(tabId) {
    this.tabsTrigger.forEach((trigger) => {
      if (trigger.dataset.tabId === tabId) trigger.classList.add(this.options.activeClass);
      if (trigger.dataset.tabId !== tabId) trigger.classList.remove(this.options.activeClass);
    });

    this.tabsContent.forEach((content) => {
      if (content.dataset.tabId === tabId) content.classList.add(this.options.activeClass);
      if (content.dataset.tabId !== tabId) content.classList.remove(this.options.activeClass);
    });
  }

  init() {
    this.tabsTrigger.forEach((trigger) => {
      trigger.addEventListener('click', () => this.update(trigger.dataset.tabId));
    });

    this.update(this.tabsTrigger[0].dataset.tabId);
  }
}

class Album {
  constructor() {
    this.albumRoot = document.querySelector('.js-get-album-photo');
    this.sliderRoot = document.querySelector('.js-get-slider-photo');
    this.albumImages = '';
    this.sliderImages = '';
    this.loacation = location;

    if (this.albumRoot || this.sliderRoot) this.init();
  }

  async get(url) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Could not fetch data. URL: ${this.loacation}/photo, State: ${response.status}.`);
      } else {
        return await response.json();
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  init() {
    const url = this.loacation;
    const album = this.albumRoot;
    const slider = this.sliderRoot;

    this.get(`${url}photo.php`)
      .then((data) => {
        data.forEach((img) => {
          if (this.albumRoot)
            this.albumImages += `<a class="section-album__link" href="${url}photos/${img}" ><img class="photo" src="${url}photos/${img}" alt=""></a>`;
          if (this.sliderRoot)
            this.sliderImages += `<li class="splide__slide"><img class="photo" src="${url}photos/${img}" alt="" loading="lazy"></li>`;
        });
        album.innerHTML = this.albumImages;

        if (slider) {
          slider.innerHTML = this.sliderImages;

          const sliderAlbum = document.querySelector('#slider-album');

          if (sliderAlbum) {
            new Splide(sliderAlbum, {
              type: 'slide',
              gap: '20px',
              pagination: false,
            }).mount();
          }
        }
      })
      .catch(() => {
        album.innerHTML = '<span class="album__message-error">Не удалось загрузить альбом, попробуйте позже...</span>';
      });
  }
}

class Popup {
  constructor({ activeClass, onShow, onHide } = {}) {
    this.popupRoot = document.querySelector('.js-popup');

    if (this.popupRoot) {
      this.popupTrigger = document.querySelectorAll(`.js-popup-trigger`);

      this.options = {
        activeClass: activeClass || 'is-active',
        onShow: onShow || false,
        onHide: onHide || false,
      };

      this.init();
    }
  }

  show(trigger) {
    if (this.options.onShow) this.options.onShow(this.popupRoot, trigger);
    this.popupRoot.classList.add(this.options.activeClass);

    document.body.style['overflow'] = 'hidden';
  }

  hide(trigger) {
    if (this.options.onHide) this.options.onHide(this.popupRoot, trigger);
    this.popupRoot.classList.remove(this.options.activeClass);

    document.body.style.removeProperty('overflow');
  }

  init() {
    this.popupRoot.addEventListener('click', (e) => {
      if (e.target === this.popupRoot) this.hide();
    });

    this.popupTrigger.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        if (trigger.dataset.showPopup === this.popupRoot.id) this.show(trigger);
        if (trigger.dataset.hidePopup === this.popupRoot.id) this.hide(trigger);
      });
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Menu();
  new Album();

  new Popup({
    onHide: (modal) => {
      modal.querySelector('#results-image').src = '#';
      modal.querySelector('#results-pilot').innerHTML = '#';
      modal.querySelector('#results-num').innerHTML = '#';
      modal.querySelector('#results-time-su-1').innerHTML = '#';
      modal.querySelector('#results-time-su-2').innerHTML = '#';
      modal.querySelector('#results-time-su-3').innerHTML = '#';
      modal.querySelector('#results-time-total').innerHTML = '#';
      modal.querySelector('#result-front-axle').innerHTML = '#';
      modal.querySelector('#result-back-axle').innerHTML = '#';
      modal.querySelector('#results-roll-cage').textContent = '#';
    },
    onShow: (modal, trigger) => {
      const imageSrc = trigger.closest('.table__body-row').dataset.resultsImage;
      const pilot = trigger.closest('.table__body-row').querySelector('[data-results-pilot]').innerHTML;
      const num = trigger.closest('.table__body-row').querySelector('[data-results-num]').innerHTML;
      const timeSu1 = trigger.closest('.table__body-row').querySelector('[data-results-time-su-1]').innerHTML;
      const timeSu2 = trigger.closest('.table__body-row').querySelector('[data-results-time-su-2]').innerHTML;
      const timeSu3 = trigger.closest('.table__body-row').querySelector('[data-results-time-su-3]').innerHTML;
      const timeTotal = trigger.closest('.table__body-row').querySelector('[data-results-time-total]').innerHTML;
      const frontAxle = trigger.closest('.table__body-row').querySelector('[data-result-front-axle]').innerHTML;
      const backAxle = trigger.closest('.table__body-row').querySelector('[data-result-back-axle]').innerHTML;
      const rollCage = trigger.closest('.table__body-row').dataset.resultsRollCage;

      modal.querySelector('#results-image').src = imageSrc;
      modal.querySelector('#results-pilot').innerHTML = pilot;
      modal.querySelector('#results-num').innerHTML = num;
      modal.querySelector('#results-time-su-1').innerHTML = timeSu1;
      modal.querySelector('#results-time-su-2').innerHTML = timeSu2;
      modal.querySelector('#results-time-su-3').innerHTML = timeSu3;
      modal.querySelector('#results-time-total').innerHTML = timeTotal;
      modal.querySelector('#result-front-axle').innerHTML = frontAxle;
      modal.querySelector('#result-back-axle').innerHTML = backAxle;
      modal.querySelector('#results-roll-cage').textContent = rollCage;
    },
  });

  document.querySelectorAll('.js-tabs').forEach((item) => new Tabs(item));
});
