import { el } from 'redom';
import './account-detail.scss';

export function accountDetailLoader() {
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
    <div style="width: 100%; display: grid;grid-template-columns: repeat(2, 1fr);gap: 50px 70px;">
      <div class="ssc-head-line w-100" style="height: 284px;border-radius: 50px;"></div>
      <div class="ssc-head-line w-100" style="height: 284px;border-radius: 50px;"></div>
      <div class="ssc-head-line w-100" style="height: 284px;border-radius: 50px;width: 212%;"></div>
    </div>
  </div>
  `;

  return app;
}

export function accountDetail(account) {
  const app = el('div', { id: 'app' });
  let historyBlock = '';
  let historyBalance = [];

  if (account.transactions.length != 0) {
    const tranList = account.transactions;
    const sortTrans = tranList.sort((a, b) => {
      const date1 = new Date(a.date).getTime();
      const date2 = new Date(b.date).getTime();
      return date1 - date2;
    });
    const tranDesc = sortTrans.reverse().slice(0, 10);

    tranDesc.forEach((item) => {
      let historyRow = '';
      const date = new Date(item.date).toLocaleDateString('ru');
      const transactionIn = item.to === account.account;
      historyRow = `<div class="row-history">
        <span class="col-1">${item.from}</span>
        <span class="col-2">${item.to}</span>
        <span class="col-3 ${transactionIn ? 'sum-in' : 'sum-out'}">
          ${transactionIn > 0 ? '+ ' : '- '}
          ${item.amount} <span class="currency">₽</span>
        </span>
        <span class="col-4">${date}</span>
      </div>`;
      historyBlock = historyBlock + historyRow;
    });

    const month = [
      'янв',
      'фев',
      'мар',
      'апр',
      'май',
      'июн',
      'июл',
      'авг',
      'сен',
      'окт',
      'ноя',
      'дек',
    ];
    let currentBalance = Number.parseFloat(account.balance);

    for (let i = 0; i < 6; i++) {
      const currentDate = new Date();
      const prevDate = new Date(
        currentDate.setMonth(currentDate.getMonth() - i)
      );
      const prevMonth = prevDate.getMonth();
      const label = month[prevMonth];
      const prevYear = prevDate.getFullYear();
      let tranPrevMonth = 0;

      account.transactions.forEach((item) => {
        const transactionIn = item.to === account.account;
        const amount = `${transactionIn ? '+' : '-'}` + item.amount;
        const tranMonth = new Date(item.date).getMonth();
        const tranYear = new Date(item.date).getFullYear();
        if (tranMonth === prevMonth && tranYear === prevYear) {
          tranPrevMonth = tranPrevMonth + Number.parseFloat(amount);
        }
      });

      let prevBalance = currentBalance - tranPrevMonth;
      currentBalance = prevBalance;
      historyBalance.push({ label: label, prevBalance: prevBalance });
    }
  }

  app.innerHTML = `<header class="header">
    <div class="container container--header">
      <a href="/" class="header__link">Coin.</a>
      <nav class="header__nav nav">
        <button class="nav__btn">Банкоматы</button>
        <button class="nav__btn">Счета</button>
        <button class="nav__btn">Валюта</button>
        <button class="nav__btn">Выйти</button>
      </nav>
    </div>
  </header>
  <main class="main--detail">
    <div class="container">
      <div class="block block--mb30">
        <h2 class="title">Просмотр счёта</h2>
        <button class="back">Вернуться назад</button>
      </div>
      <div class="block">
        <h3 class="subtitle">№ ${account.account}</h3>
        <p class="balance--detail">Баланс
          <span>${Number.parseFloat(account.balance).toFixed(2)} ₽</span>
        </p>
      </div>
      <div class="block block--main">
        <div class="tran bg-grey">
          <h4 class="tran__title">Новый перевод</h4>
          <div action="#" class="form" method="post">
            <div class="form__row">
              <p class="form__label form__label--detail">Номер счёта получателя</p>
              <div class="account">
                <input type="number" class="account__title account__title--detail" placeholder="Введите счёт" name="account">
                <span class="message-tran hidden">Error message</span>
                <ul class="account__list is-hide">
                  <li class="account__item">74213041477477406320783754</li>
                  <li class="account__item">74213041477477406320783754</li>
                  <li class="account__item">74213041477477406320783754</li>
                  <li class="account__item">74213041477477406320783754</li>
                  <li class="account__item">74213041477477406320783754</li>
                </ul>
              </div>
            </div>
            <div class="form__row">
              <label class="form__label form__label--detail">
                Сумма перевода
                <input type="number" class="form__input" name="sum" placeholder="Введите сумму">
                <span class="message-tran sum hidden">Error message</span>
              </label>
            </div>
            <button class="send">
              Отправить
              <span class="message-tran send-tran hidden">Success message</span>
            </button>
          </div>
        </div>
        <div class="dynamic bg-wite">
          <h4 class="tran__title">Динамика баланса</h4>
          <div><canvas id="account-detail" height="100%"></canvas></div>
        </div>
        <div class="history bg-grey">
          <h4 class="tran__title">История переводов</h4>
          <div class="table-history">
            <div class="thead-history">
              <span class="col-1 thead-out">Счёт отправителя</span>
              <span class="col-2 thead-in">Счёт получателя</span>
              <span class="col-3 thead-sum">Сумма</span>
              <span class="col-4 thead-date">Дата</span>
            </div>
            <div class="tbody-history">
              ${historyBlock}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
    `;

  return { app, historyBalance };
}

export function validateTransaction(input, value) {
  const reg = /^\d+$/;

  if (input === 'sum') {
    if (value <= 0 && !reg.test(value)) {
      throw Error(`Сумма должна быть больше нуля`);
    }
    if (!reg.test(value)) {
      throw Error(`Сумма должна состоять из цифр`);
    }
    return true;
  }

  if (input === 'account') {
    if (!reg.test(value)) {
      throw Error(`Некорректный счёт`);
    }
    return true;
  }
}

export async function getAccountDetail(auth, id) {
  const response = await fetch(`http://localhost:3000/account/${id}`, {
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

export async function fetchTransferFunds(auth, body) {
  const response = await fetch(`http://localhost:3000/transfer-funds/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();

  if (data.error) {
    if (data.error === 'Invalid account to') {
      throw Error('Не указан счёт зачисления или этого счёта не существует');
    } else if (data.error === 'Invalid account from') {
      throw Error(
        'Не указан адрес счёта списания или этот счёт не принадлежит Вам'
      );
    } else if (data.error === 'Invalid amount') {
      throw Error('Не указана сумма перевода или она отрицательная');
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
