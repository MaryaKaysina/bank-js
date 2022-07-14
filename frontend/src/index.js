import { el, setChildren } from 'redom';
import Chart from 'chart.js/auto';
import {
  authorization,
  authorizationLoader,
  validateAuthorization,
  fetchAuth,
} from './components/authorization/authorization';
import {
  getAccounts,
  accountsLoader,
  accounts,
  createAccount,
  accountsSorted,
} from './components/accounts/accounts';
import {
  getAccountDetail,
  accountDetail,
  accountDetailLoader,
  validateTransaction,
  fetchTransferFunds,
} from './components/account-detail/account-detail';

function createNotification(root, event, text) {
  const notificationBlock =
    document.querySelector('.notifications') ||
    el('div', { class: `notifications` });

  const notification = el('div', { class: `notification ${event}` });
  notification.innerHTML = `${text}
  <button class="notification-btn ${event}"></button>`;

  notificationBlock.append(notification);

  root.append(notificationBlock);

  const btnsNotification = document.querySelectorAll('.notification-btn');
  btnsNotification.forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.parentElement.remove();
    });
  });

  setTimeout(() => {
    const notificationBlock = document.querySelector('.notifications');
    notificationBlock.remove();
  }, 3000);
}

function accountDetailPage(accountDetailList, auth) {
  setChildren(document.body, accountDetailLoader());

  setTimeout(() => {
    console.log(accountDetailList);
    const accountDetailData = accountDetail(accountDetailList);
    setChildren(document.body, accountDetailData.app);

    accountDetailData.historyBalance.reverse();

    let labels = [];
    let dataset = [];
    accountDetailData.historyBalance.forEach((item) => {
      labels.push(item.label);
      dataset.push(Number.parseInt(item.prevBalance));
    });

    const maxY = Math.max.apply(null, dataset);
    const data = {
      maxBarThickness: maxY,
      labels: labels,
      datasets: [
        {
          label: 'label',
          backgroundColor: 'rgb(17, 106, 204)',
          data: dataset,
        },
      ],
    };

    const chartAreaBorder = {
      id: 'chartAreaBorder',
      beforeDraw(chart, args, options) {
        const {
          ctx,
          chartArea: { left, top, width, height },
        } = chart;
        ctx.save();
        ctx.strokeStyle = options.borderColor;
        ctx.lineWidth = options.borderWidth;
        ctx.setLineDash(options.borderDash || []);
        ctx.lineDashOffset = options.borderDashOffset;
        ctx.strokeRect(left, top, width, height);
        ctx.restore();
      },
    };

    const config = {
      type: 'bar',
      data: data,
      options: {
        plugins: {
          legend: {
            display: false,
          },
          chartAreaBorder: {
            borderColor: 'rgb(0 0 0)',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: 'rgb(0 0 0)',
              font: {
                size: 20,
                weight: 700,
                family: 'Ubuntu',
              },
            },
          },
          y: {
            grid: {
              display: false,
            },
            borderColor: 'rgb(17, 106, 204)',
            position: 'right',
            min: 0,
            max: maxY,
            ticks: {
              stepSize: maxY,
              color: 'rgb(0 0 0)',
              font: {
                size: 20,
                weight: 500,
                family: 'Ubuntu',
              },
            },
          },
        },
      },
      plugins: [chartAreaBorder],
    };

    const chart = new Chart(document.getElementById('account-detail'), config);

    const btnBack = document.querySelector('.back');
    btnBack.addEventListener('click', async () => {
      try {
        chart.destroy();
        const cards = await getAccounts(auth);
        accountsPage(cards, auth);
      } catch (err) {
        createNotification(document.body, 'error', err.message);
      }
    });

    const accountInput = document.querySelector('input[name="account"]');
    const sumInput = document.querySelector('input[name="sum"]');
    const accountErr = document.querySelector(
      'input[name="account"] ~ .message-tran'
    );
    const sumErr = document.querySelector('input[name="sum"] ~ .message-tran');
    const btn = document.querySelector('.send');
    const btnError = document.querySelector('.send .message-tran');

    const local = localStorage.getItem('accounts');
    const localTransferAccounts = local ? local.split(',') : [];
    const accountList = document.querySelector('.account__list');
    accountList.innerHTML = '';
    let accountBlock = '';

    if (localTransferAccounts.length > 0) {
      localTransferAccounts.forEach((item) => {
        const account = `<li class="account__item">${item}</li>`;
        accountBlock = accountBlock + account;
      });
      accountList.innerHTML = accountBlock;

      const accounts = document.querySelectorAll('.account__item');
      accounts.forEach((acc) => {
        acc.addEventListener('click', () => {
          accountInput.value = acc.textContent;
          accountList.classList.add('is-hide');
          accountInput.classList.add('valid');
        });
      });

      accountInput.addEventListener('focus', () => {
        accountList.classList.remove('is-hide');
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.account')) {
          accountList.classList.add('is-hide');
        }
      });
    }

    accountInput.addEventListener('change', () => {
      try {
        validateTransaction('account', accountInput.value.trim());
        accountInput.classList.add('valid');
      } catch (err) {
        accountErr.classList.add('error');
        accountErr.textContent = err.message;
        accountErr.classList.remove('hidden');
      }
    });

    accountInput.addEventListener('input', () => {
      accountErr.classList.remove('error');
      accountErr.classList.add('hidden');
      btnError.classList.remove('error');
      btnError.classList.add('hidden');
      setTimeout(() => {
        accountList.classList.add('is-hide');
      }, 2000);
    });

    sumInput.addEventListener('change', () => {
      try {
        validateTransaction('sum', sumInput.value.trim());
        sumInput.classList.add('valid');
      } catch (err) {
        sumErr.classList.add('error');
        sumErr.textContent = err.message;
        sumErr.classList.remove('hidden');
      }
    });

    sumInput.addEventListener('input', () => {
      sumErr.classList.remove('error');
      sumErr.classList.add('hidden');
      btnError.classList.remove('error');
      btnError.classList.add('hidden');
    });

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const accountInput = document.querySelector('input[name="account"]');
      const sumInput = document.querySelector('input[name="sum"]');

      if (
        accountInput.classList.contains('valid') &&
        sumInput.classList.contains('valid')
      ) {
        const transaction = {
          from: accountDetailList.account,
          to: accountInput.value.trim(),
          amount: sumInput.value.trim(),
        };
        try {
          const card = await fetchTransferFunds(auth, transaction);
          console.log(card);
          const local = localStorage.getItem('accounts');
          const localTransferAccounts = local ? local.split(',') : [];

          if (localTransferAccounts.indexOf(transaction.to) == -1) {
            localTransferAccounts.push(transaction.to);
          }

          localStorage.setItem('accounts', localTransferAccounts);
          accountDetailPage(card, auth);
        } catch (err) {
          btnError.classList.add('error');
          btnError.textContent = err.message;
          btnError.classList.remove('hidden');
        }
      }
    });
  }, 300);
}

function accountsPage(accountsList, auth, sort = '') {
  setChildren(document.body, accountsLoader());

  setTimeout(() => {
    setChildren(document.body, accounts(accountsList));

    const btnNewAccount = document.querySelector('.create');
    btnNewAccount.addEventListener('click', async () => {
      try {
        await createAccount(auth);
        const newCards = await getAccounts(auth);
        accountsPage(newCards, auth);
        setTimeout(() => {
          createNotification(
            document.body,
            'success',
            'Новый счёт успешно создан!'
          );
        }, 300);
      } catch (err) {
        createNotification(document.body, 'error', err.message);
      }
    });

    const sortBlock = document.querySelector('.sort');
    const sortTitle = sortBlock.querySelector('.sort__title');
    const sortList = sortBlock.querySelector('.sort__list');
    const sortItems = sortBlock.querySelectorAll('.sort__item');

    sortItems.forEach((item) => {
      if (item.dataset.sort === sort) {
        item.classList.add('active');
      }
    });

    sortTitle.addEventListener('click', () => {
      sortBlock.classList.toggle('active');
      sortList.classList.toggle('is-hide');

      const sortItems = sortBlock.querySelectorAll('.sort__item');
      sortItems.forEach((item) => {
        item.addEventListener('click', () => {
          sortItems.forEach((item) => {
            item.classList.remove('active');
          });
          item.classList.add('active');
          setChildren(
            document.body,
            accountsSorted(accountsList, item.dataset.sort)
          );
          accountsPage(accountsList, auth, item.dataset.sort);
        });
      });

      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('sort__title')) return;
        if (!e.target.closest('.sort__list')) {
          sortBlock.classList.remove('active');
          sortList.classList.add('is-hide');
        }
      });
    });

    const btnOpenAccount = document.querySelectorAll('.card .open');
    btnOpenAccount.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const accountId =
          btn.parentElement.querySelector('.number').textContent;
        try {
          const accountDetail = await getAccountDetail(auth, accountId);
          accountDetailPage(accountDetail, auth);
        } catch (err) {
          createNotification(document.body, 'error', err.message);
        }
      });
    });
  }, 300);
}

function authorizationPage() {
  setChildren(document.body, authorizationLoader());

  setTimeout(() => {
    setChildren(document.body, authorization());

    const loginInput = document.querySelector('input[name="login"]');
    const passInput = document.querySelector('input[name="password"]');
    const loginErr = document.querySelector('input[name="login"] ~ .message');
    const passErr = document.querySelector('input[name="password"] ~ .message');
    const btn = document.querySelector('.form__btn');
    const btnError = document.querySelector('.form__btn .message');

    loginInput.addEventListener('change', () => {
      try {
        validateAuthorization(loginInput.value, 'Логин');
        loginInput.classList.add('valid');
      } catch (err) {
        loginErr.classList.add('error');
        loginErr.textContent = err.message;
        loginErr.classList.remove('hidden');
      }
    });

    loginInput.addEventListener('input', () => {
      loginErr.classList.remove('error');
      loginErr.classList.add('hidden');
      btnError.classList.remove('error');
      btnError.classList.add('hidden');
    });

    passInput.addEventListener('change', () => {
      try {
        validateAuthorization(passInput.value, 'Логин');
        passInput.classList.add('valid');
      } catch (err) {
        passErr.classList.add('error');
        passErr.textContent = err.message;
        passErr.classList.remove('hidden');
      }
    });

    passInput.addEventListener('input', () => {
      passErr.classList.remove('error');
      passErr.classList.add('hidden');
      btnError.classList.remove('error');
      btnError.classList.add('hidden');
    });

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const loginInput = document.querySelector('input[name="login"]');
      const passInput = document.querySelector('input[name="password"]');

      if (
        loginInput.classList.contains('valid') &&
        passInput.classList.contains('valid')
      ) {
        const auth = {
          login: loginInput.value.trim(),
          password: passInput.value.trim(),
        };
        try {
          const token = await fetchAuth(auth);
          const cards = await getAccounts(token.token);
          accountsPage(cards, token.token);
        } catch (err) {
          btnError.classList.add('error');
          btnError.textContent = err.message;
          btnError.classList.remove('hidden');
        }
      }
    });
  }, 300);
}

authorizationPage();

// const dataset = {
//   account: '74213041477477406320783754',
//   balance: 977800.47,
//   mine: true,
//   transactions: [
//     {
//       date: '2021-09-21T10:19:41.656Z',
//       from: '03075161147576483308375751',
//       to: '74213041477477406320783754',
//       amount: 5299.09,
//     },
//     {
//       date: '2021-09-23T01:57:20.223Z',
//       from: '74213041477477406320783754',
//       to: '20676535650685341466086362',
//       amount: 8973.71,
//     },
//     {
//       date: '2021-10-20T16:20:49.799Z',
//       from: '74213041477477406320783754',
//       to: '51086782655845204744803707',
//       amount: 736.58,
//     },
//     {
//       date: '2021-10-19T22:41:24.671Z',
//       from: '74213041477477406320783754',
//       to: '58260448852541766126032272',
//       amount: 9035.65,
//     },
//     {
//       date: '2021-11-19T18:23:13.510Z',
//       from: '74213041477477406320783754',
//       to: '48578624073520776558718428',
//       amount: 6804.39,
//     },
//     {
//       date: '2021-11-21T09:56:23.656Z',
//       from: '06063054426041078483263725',
//       to: '74213041477477406320783754',
//       amount: 3858.05,
//     },
//   ],
// };

// console.log(dataset);

// let currentBalance = dataset.balance;

// for (let i = 0; i < 6; i++) {
//   const currentDate = new Date('2021-12-21');
//   const prevDate = new Date(currentDate.setMonth(currentDate.getMonth() - i));
//   const prevMonth = prevDate.getMonth();
//   const prevYear = prevDate.getFullYear();
//   let tranPrevMonth = 0;

//   dataset.transactions.forEach((item) => {
//     const tranMonth = new Date(item.date).getMonth();
//     const tranYear = new Date(item.date).getFullYear();
//     if (tranMonth === prevMonth && tranYear === prevYear) {
//       tranPrevMonth = tranPrevMonth + item.amount;
//     }
//   });

//   let prevBalance = currentBalance - tranPrevMonth;
//   currentBalance = prevBalance;

//   console.log(prevMonth + ' ' + prevYear + ': ' + prevBalance);
// }
