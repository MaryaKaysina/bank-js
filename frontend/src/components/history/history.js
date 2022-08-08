import { el } from 'redom';
import './history.scss';

export function historyLoader() {
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
    <div style="width: 100%; display: grid;grid-template-columns: repeat(1, 1fr);gap: 50px 70px;">
      <div class="ssc-head-line w-100" style="height: 284px;border-radius: 50px;"></div>
      <div class="ssc-head-line w-100" style="height: 284px;border-radius: 50px;"></div>
      <div class="ssc-head-line w-100" style="height: 284px;border-radius: 50px;"></div>
    </div>
  </div>
  `;

  return app;
}

export function history(account) {
  const app = el('div', { id: 'app' });
  let historyBlock = [];
  let historyBalance = [];
  let historyTransactions = [];
  let historyPages = '';
  let paginationPages = '';
  let paginations = '';

  if (account.transactions.length != 0) {
    const tranList = account.transactions;
    const sortTrans = tranList.sort((a, b) => {
      const date1 = new Date(a.date).getTime();
      const date2 = new Date(b.date).getTime();
      return date1 - date2;
    });
    historyBlock = sortTrans.reverse();
    const size = 25;
    const countPageHistory = Math.ceil(historyBlock.length / size);
    let historyBlockPages = [];
    for (let i = 0; i < countPageHistory; i++) {
      historyBlockPages[i] = historyBlock.slice(i * size, i * size + size);
    }

    historyBlockPages.forEach((historyBlockPage, index) => {
      let historyRows = '';
      historyBlockPage.forEach((item) => {
        const date = new Date(item.date).toLocaleDateString('ru');
        const transactionIn = item.to === account.account;
        const historyRow = `<div class="row-history">
          <span class="col-1">${item.from}</span>
          <span class="col-2">${item.to}</span>
          <span class="col-3 ${transactionIn ? 'sum-in' : 'sum-out'}">
            ${transactionIn > 0 ? '+ ' : '- '}
            ${item.amount} <span class="currency">₽</span>
          </span>
          <span class="col-4">${date}</span>
        </div>`;
        historyRows = historyRows + historyRow;
      });
      const historyPage = `<div
          class="history history--history bg-grey ${
            index == 0 ? '' : 'is-hide'
          }"
          data-page="${index + 1}">
        <h4 class="tran__title">История переводов</h4>
        <div class="table-history">
          <div class="thead-history">
            <span class="col-1 thead-out">Счёт отправителя</span>
            <span class="col-2 thead-in">Счёт получателя</span>
            <span class="col-3 thead-sum">Сумма</span>
            <span class="col-4 thead-date">Дата</span>
          </div>
          <div class="tbody-history">
            ${historyRows}
          </div>
        </div>
      </div>`;
      const pagination = `<button
        class="pagination__page ${index == 0 ? 'active' : ''}
        ${index < 6 ? 'is-show' : 'is-hide'}"
        data-page="${index + 1}">${index + 1}
        </button>`;
      historyPages = historyPages + historyPage;
      paginations = paginations + pagination;
    });

    paginationPages = `<div class="pagination__block">
      <button class="pagination__prev"></button>
      <button class="pagination__step pagination__step--prev hide">...</button>
      ${paginations}
      <button class="pagination__step pagination__step--next">...</button>
      <button class="pagination__next"></button>
    </div>`;

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

    for (let i = 0; i < 12; i++) {
      const currentDate = new Date();
      const prevDate = new Date(
        currentDate.setMonth(currentDate.getMonth() - i)
      );
      const prevMonth = prevDate.getMonth();
      const label = month[prevMonth];
      const prevYear = prevDate.getFullYear();
      let tranPrevMonth = 0;
      let historyTransactionIn = 0;
      let historyTransactionOut = 0;

      account.transactions.forEach((item) => {
        const transactionIn = item.to === account.account;
        const amount = `${transactionIn ? '+' : '-'}` + item.amount;
        const tranMonth = new Date(item.date).getMonth();
        const tranYear = new Date(item.date).getFullYear();
        if (tranMonth === prevMonth && tranYear === prevYear) {
          tranPrevMonth = tranPrevMonth + Number.parseFloat(amount);
          if (transactionIn) {
            historyTransactionIn = historyTransactionIn + item.amount;
          } else {
            historyTransactionOut = historyTransactionOut + item.amount;
          }
        }
      });

      let prevBalance = currentBalance - tranPrevMonth;

      if (i === 0) {
        historyBalance.push({ label: label, prevBalance: currentBalance });
      } else {
        historyBalance.push({ label: label, prevBalance: prevBalance });
      }

      historyTransactions.push({
        label: label,
        historyTransactionIn: historyTransactionIn,
        historyTransactionOut: historyTransactionOut,
      });

      currentBalance = prevBalance;
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
        <div class="dynamic dynamic--history bg-wite">
          <h4 class="tran__title">Динамика баланса</h4>
          <div><canvas id="balance-history"></canvas></div>
        </div>
        <div class="dynamic dynamic--history bg-wite">
          <h4 class="tran__title">Соотношение входящих исходящих транзакций</h4>
          <div><canvas id="transaction-history"></canvas></div>
        </div>
        <div class="history__tabs">
          ${historyPages}
          ${paginationPages}
        </div>
      </div>
    </div>
  </main>
    `;

  return { app, historyBalance, historyTransactions };
}
