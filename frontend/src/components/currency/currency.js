import { el } from 'redom';
import './currency.scss';

export function currencyLoader() {
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
    <div style="width: 100%; display: grid;grid-template-columns: repeat(2, 1fr);gap: 50px 70px;grid-template-areas: 'one three' 'two three';">
      <div class="ssc-head-line w-100" style="height: 284px;border-radius: 50px;grid-area: one;"></div>
      <div class="ssc-head-line w-100" style="height: 284px;border-radius: 50px;grid-area: two;"></div>
      <div class="ssc-head-line w-100" style="height: 100%;border-radius: 50px;grid-area: three;"></div>
    </div>
  </div>
  `;

  return app;
}

export function currency(allCurrencies, currencies) {
  const app = el('div', { id: 'app' });
  let allCurrenciesList = '';
  let currenciesList = '';

  allCurrencies.forEach((item) => {
    const li = `<li class="exc-currency__item">${item}</li>`;
    allCurrenciesList = allCurrenciesList + li;
  });

  for (const key in currencies) {
    if (Math.round(currencies[key].amount) != 0) {
      const li = `<li class="your__row">
        <span class="your__title">${currencies[key].code}</span>
        <span class="your__val">${currencies[key].amount}</span>
      </li>`;
      currenciesList = currenciesList + li;
    }
  }

  app.innerHTML = `<header class="header">
    <div class="container container--header">
      <a href="/" class="header__link">Coin.</a>
      <nav class="header__nav nav">
        <button class="nav__btn" data-page="atm">Банкоматы</button>
        <button class="nav__btn" data-page="accounts">Счета</button>
        <button class="nav__btn active" data-page="currency">Валюта</button>
        <button class="nav__btn" data-page="out">Выйти</button>
      </nav>
    </div>
  </header>
  <main class="currency">
    <div class="container">
      <div class="block block--mb30 block--mb56">
        <h2 class="title">Валютный обмен</h2>
      </div>
      <div class="block block--currency">
        <div class="your bg-wite">
          <h4 class="tran__title">Ваши валюты</h4>
          <ul class="your__table">
            ${currenciesList}
          </ul>
        </div>
        <div class="exchange bg-wite">
          <h4 class="tran__title">Обмен валюты</h4>
          <div class="form form--exchange">
            <div class="form__row form__row--exchange form__row--currency">
              <p class="form__label form__label--exchange">Из</p>
              <div class="exc-currency">
                <input type="text" class="account__title account__title--exchange" name="exchange-from" value="BTC" data-change="from">
                <ul class="exc-currency__list is-hide" data-currency="from">
                  ${allCurrenciesList}
                </ul>
              </div>
              <p class="form__label form__label--exchange">в</p>
              <div class="exc-currency">
                <input type="text" class="account__title account__title--exchange" name="exchange-to" value="ETH" data-change="to">
                <ul class="exc-currency__list is-hide" data-currency="to">
                  ${allCurrenciesList}
                </ul>
              </div>
            </div>
            <div class="form__row form__row--exchange form__row--sum">
              <label class="form__label form__label--sum">
                Сумма
                <input type="number" class="form__input form__input--exchange" name="sum" placeholder="Введите сумму">
                <span class="message-tran sum hidden">Error message</span>
              </label>
            </div>
            <button class="send send--currency">
              Обменять
              <span class="message-tran send-tran send-change hidden">Success message</span>
            </button>
          </div>
        </div>
        <div class="runtime bg-grey">
          <h4 class="tran__title">Изменение курсов в реальном времени</h4>
          <ul class="your__table">
            <li class="your__row your__row--in">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--out">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--out">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--in">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--in">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--in">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--in">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--in">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--in">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--in">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--in">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
            <li class="your__row your__row--in">
              <span class="your__title">BTC/ETH</span>
              <span class="your__val your__val--runtime">6.3123545131</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>
  `;

  return app;
}

export async function getAllCurrencies(auth) {
  const response = await fetch(`http://localhost:3000/all-currencies`, {
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

export async function getCurrencies(auth) {
  const response = await fetch(`http://localhost:3000/currencies`, {
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

export function validateCurrencyChange(sum, from, to) {
  if (+sum <= 0) {
    throw Error(`Сумма должна быть больше нуля`);
  }
  if (from === to) {
    throw Error(`Счёт зачисления должен быть не равен счёту списания`);
  }
  return true;
}

export async function fetchCurrencyBuy(auth, body) {
  const response = await fetch(`http://localhost:3000/currency-buy/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();

  if (data.error) {
    if (data.error === 'Unknown currency code') {
      throw Error(
        'Передан неверный валютный код, код не поддерживается системой'
      );
    } else if (data.error === 'Invalid amount') {
      throw Error('Не указана сумма перевода, или она отрицательная');
    } else if (data.error === 'Not enough currency') {
      throw Error('На валютном счёте списания нет средств');
    } else if (data.error === 'Overdraft prevented') {
      throw Error(
        'Вы попытались перевести больше денег, чем доступно на счёте списания'
      );
    } else {
      throw Error('Упс, что-то пошло не так... Повторите попытку позже');
    }
  }
  return data.payload;
}

export async function websocketCurrencyFeed() {
  const socket = new WebSocket('ws://localhost:3000/currency-feed/');

  socket.onmessage = function (event) {
    return JSON.parse(event.data);
  };
}
