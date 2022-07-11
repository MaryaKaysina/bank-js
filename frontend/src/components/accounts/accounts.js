import { el } from 'redom';
import './accounts.scss';

export function accountsLoader() {
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
      <div class="ssc-line w-50"></div>
      <div class="ssc-line w-60"></div>
      <div class="ssc-line w-60"></div>
    </div>
    <div class="w-30" style="margin-right: 0; margin-left: auto;">
      <div class="ssc-head-line w-100" style="height: 46px;"></div>
    </div>
  </div>
  <div class="container" style="width: 100%; display: flex; align-items: center; margin-bottom: 44px; padding: 0 50px;">
    <div style="width: 100%; display: grid;grid-template-columns: repeat(3, 1fr);gap: 50px 70px;">
      <div class="ssc-head-line w-100" style="height: 145px;"></div>
      <div class="ssc-head-line w-100" style="height: 145px;"></div>
      <div class="ssc-head-line w-100" style="height: 145px;"></div>
      <div class="ssc-head-line w-100" style="height: 145px;"></div>
      <div class="ssc-head-line w-100" style="height: 145px;"></div>
      <div class="ssc-head-line w-100" style="height: 145px;"></div>
      <div class="ssc-head-line w-100" style="height: 145px;"></div>
      <div class="ssc-head-line w-100" style="height: 145px;"></div>
      <div class="ssc-head-line w-100" style="height: 145px;"></div>
    </div>
  </div>
  `;

  return app;
}

export function accounts(accounts) {
  const app = el('div', { id: 'app' });
  let accountsBlock = '';

  accounts.forEach((item) => {
    let account = '';
    let date = '';
    if (item.transactions.length != 0) {
      date = new Date(item.transactions[0].date)
        .toLocaleDateString('ru', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        .replace(' г.', '');
    } else {
      date = 'Транзакций пока не было';
    }

    account = `<div class="card">
    <h3 class="number">${item.account}</h3>
    <p class="balance">${item.balance} ₽</p>
    <p class="text">Последняя транзакция:<br>
      <span class="date">${date}</span>
    </p>
    <button class="open">Открыть</button>
    </div>`;

    accountsBlock = accountsBlock + account;
  });

  app.innerHTML = `<header class="header--cards">
    <div class="container container--header">
      <a href="/" class="header__link">Coin.</a>
      <nav class="header__nav nav">
        <button class="nav__btn">Банкоматы</button>
        <button class="nav__btn active">Счета</button>
        <button class="nav__btn">Валюта</button>
        <button class="nav__btn">Выйти</button>
      </nav>
    </div>
  </header>
  <main class="main--cards">
    <div class="container">
      <div class="block--cards">
        <h2 class="title">Ваши счета</h2>
        <div class="sort">
            <h3 class="sort__title">Сортировка</h3>
            <ul class="sort__list is-hide">
              <li class="sort__item" data-sort="number">По номеру</li>
              <li class="sort__item" data-sort="balance">По балансу</li>
              <li class="sort__item" data-sort="transaction">По последней транзакции</li>
            </ul>
          </div>
        <button class="create">Создать новый счёт</button>
      </div>
      <div class="cards">
      ${accountsBlock}
      </div>
    </div>
  </main>
  `;

  return app;
}

export function accountsSorted(accountsList, field) {
  let newAccounts = [];
  if (field === 'number') {
    newAccounts = accountsList.sort((a, b) => a.account - b.account);
  }
  if (field === 'balance') {
    newAccounts = accountsList.sort((a, b) => a.balance - b.balance);
  }
  if (field === 'transaction') {
    newAccounts = accountsList.sort((a, b) => {
      let date1 = 0;
      let date2 = 0;
      if (a.transactions.length != 0) {
        date1 = new Date(a.transactions[0].date).getTime();
      }
      if (b.transactions.length != 0) {
        date2 = new Date(b.transactions[0].date).getTime();
      }
      return date1 - date2;
    });
  }

  const app = accounts(newAccounts);
  return app;
}

export async function getAccounts(auth) {
  const response = await fetch('http://localhost:3000/accounts', {
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

export async function createAccount(auth) {
  const response = await fetch('http://localhost:3000/create-account', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  if (data.error) {
    throw Error('Упс, что-то пошло не так... Повторите попытку позже');
  }
  getAccounts(auth);
}
