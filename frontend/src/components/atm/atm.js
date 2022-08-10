import { el } from 'redom';
import './atm.scss';

export function atmLoader() {
  const app = el('div', {
    id: 'app',
    class: 'ssc ssc-card',
    style: 'max-width: 100%;',
  });

  app.innerHTML = `<div class="ssc-square mb"
      style="height: 101px; margin-bottom: 44px;">
    </div>
    <div class="container" style="width: 100%; display: flex; align-items: center; margin-bottom: 44px; padding: 0 50px;">
      <div class="w-50">
        <div class="ssc-line w-60"></div>
        <div class="ssc-line w-60"></div>
      </div>
    </div>
    <div class="container" style="width: 100%; display: flex; align-items: center; margin-bottom: 44px; padding: 0 50px;">
    <div class="ssc-head-line w-100" style="height: 728px;border-radius: 0;"></div>
    </div>`;

  return app;
}

export function atm() {
  const app = el('div', { id: 'app' });

  app.innerHTML = `<header class="header">
    <div class="container container--header">
      <a href="/" class="header__link">Coin.</a>
      <nav class="header__nav nav">
        <button class="nav__btn active" data-page="atm">Банкоматы</button>
        <button class="nav__btn" data-page="accounts">Счета</button>
        <button class="nav__btn" data-page="currency">Валюта</button>
        <button class="nav__btn" data-page="out">Выйти</button>
      </nav>
    </div>
  </header>
  <main class="atm">
    <div class="container">
      <div class="block block--mb30 block--mb56">
        <h2 class="title">Карта банкоматов</h2>
      </div>
      <div id="map" style="width: 100%; height: 728px"></div>
    </div>
  </main>`;

  return app;
}

export async function getAtm(auth) {
  const response = await fetch(`http://localhost:3000/banks`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (data.error) {
    throw Error('Упс, что-то пошло не так... Повторите попытку позже');
  }
  return data.payload;
}
