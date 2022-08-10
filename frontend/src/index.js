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
import { historyLoader, history } from './components/history/history';
import {
  currencyLoader,
  currency,
  getAllCurrencies,
  getCurrencies,
  validateCurrencyChange,
  fetchCurrencyBuy,
} from './components/currency/currency';

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

function navigate(auth, socket = null) {
  const navBtns = document.querySelectorAll('.nav__btn');

  navBtns.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      if (socket) {
        socket.close();
      }

      if (e.target.dataset.page === 'currency') {
        try {
          const allCurrencies = await getAllCurrencies(auth);
          const currencies = await getCurrencies(auth);
          currencyPage(auth, allCurrencies, currencies);
        } catch (err) {
          createNotification(document.body, 'error', err.message);
        }
      }
      if (e.target.dataset.page === 'accounts') {
        try {
          accountsPage(auth);
        } catch (err) {
          createNotification(document.body, 'error', err.message);
        }
      }
    });
  });
}

function historyPage(accountDetailList, auth) {
  setChildren(document.body, historyLoader());

  setTimeout(() => {
    const historyData = history(accountDetailList);
    setChildren(document.body, historyData.app);

    historyData.historyBalance.reverse();
    historyData.historyTransactions.reverse();

    let labels = [];
    let datasetBalance = [];
    historyData.historyBalance.forEach((item) => {
      labels.push(item.label);
      datasetBalance.push(Number.parseInt(item.prevBalance));
    });

    const maxYBalance = Math.max.apply(null, datasetBalance);

    const dataBalance = {
      maxBarThickness: maxYBalance,
      labels: labels,
      datasets: [
        {
          label: '',
          backgroundColor: 'rgb(17, 106, 204)',
          data: datasetBalance,
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

    const configBalance = {
      type: 'bar',
      data: dataBalance,
      options: {
        layout: {
          padding: {
            right: 100,
          },
        },
        aspectRatio: 1000 / 165,
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
            ticks: {
              min: 0,
              max: maxYBalance,
              stepSize: maxYBalance,
              color: 'rgb(0 0 0)',
              font: {
                size: 20,
                weight: 500,
                family: 'Work Sans',
              },
              callback(value) {
                return `   ${value}₽ `;
              },
            },
          },
        },
      },
      plugins: [chartAreaBorder],
    };

    new Chart(document.getElementById('balance-history'), configBalance);

    let datasetTransactionIn = [];
    let datasetTransactionOut = [];
    historyData.historyTransactions.forEach((item) => {
      datasetTransactionIn.push(Number.parseInt(item.historyTransactionIn));
      datasetTransactionOut.push(Number.parseInt(item.historyTransactionOut));
    });
    const datasetTransaction = [...datasetTransactionIn].map(
      (e, i) => e + datasetTransactionOut[i]
    );
    const maxYTransaction = Math.max.apply(null, datasetTransaction);
    const maxYTransactionIn = Math.max.apply(null, datasetTransactionIn);
    const maxYTransactionOut = Math.max.apply(null, datasetTransactionOut);

    let ratioYTransaction = maxYTransactionIn;
    const datasetTransactions = [
      { data: datasetTransactionIn, backgroundColor: 'rgb(118 202 102)' },
      { data: datasetTransactionOut, backgroundColor: 'rgb(253 78 93)' },
    ];

    if (maxYTransactionIn < maxYTransactionOut) {
      datasetTransactions.reverse();
      ratioYTransaction = maxYTransactionOut;
    }

    const dataTransaction = {
      maxBarThickness: maxYTransaction,
      labels: labels,
      datasets: datasetTransactions,
    };

    const configTransaction = {
      type: 'bar',
      data: dataTransaction,
      options: {
        layout: {
          padding: {
            right: 100,
          },
        },
        aspectRatio: 1000 / 165,
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
            stacked: true,
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
            stacked: true,
            grid: {
              display: false,
            },
            borderColor: 'rgb(17, 106, 204)',
            position: 'right',
            min: 0,
            max: maxYTransaction,
            ticks: {
              stepSize: 100,
              color: 'rgb(0 0 0)',
              font: {
                size: 20,
                weight: 500,
                family: 'Work Sans',
              },
              callback: function (value) {
                if (
                  Math.ceil(value) == 0 ||
                  Math.ceil(value) == Math.ceil(maxYTransaction)
                ) {
                  return `    ${Math.ceil(value)}₽    `;
                }
                if (
                  Math.ceil(value / 100) == Math.ceil(ratioYTransaction / 100)
                ) {
                  return `    ${Math.ceil(ratioYTransaction)}₽    `;
                }
              },
            },
          },
        },
      },
      plugins: [chartAreaBorder],
    };

    new Chart(
      document.getElementById('transaction-history'),
      configTransaction
    );

    const historyBlocks = document.querySelectorAll('.history');
    const paginationBlock = document.querySelector('.pagination__block');
    const paginationPage = document.querySelectorAll('.pagination__page');
    const paginationNext = document.querySelector('.pagination__step--next');
    const paginationPrev = document.querySelector('.pagination__step--prev');

    if (paginationPage.length < 7) {
      paginationNext.classList.add('hide');
      paginationPrev.classList.add('hide');
    }

    paginationBlock.addEventListener('click', (e) => {
      const currentPage = +paginationBlock.querySelector('.active').textContent;
      const btnsShow = paginationBlock.querySelectorAll('.is-show');
      const minBtnShow = btnsShow[0];
      const maxBtnShow = btnsShow[btnsShow.length - 1];

      if (e.target.closest('.pagination__next')) {
        if (currentPage === paginationPage.length) {
          const paginationStepNext =
            paginationBlock.querySelector('.pagination__next');
          paginationStepNext.classList.add('disable');
          return;
        }
        const paginationStepPrev =
          paginationBlock.querySelector('.pagination__prev');
        paginationStepPrev.classList.remove('disable');

        historyBlocks.forEach((block) => {
          block.classList.add('is-hide');
        });
        paginationPage.forEach((btn) => {
          btn.classList.remove('active');
        });
        const nextPage = document.querySelector(
          `.history[data-page="${currentPage + 1}"]`
        );
        nextPage.classList.remove('is-hide');

        const nextBtn = document.querySelector(
          `.pagination__page[data-page="${currentPage + 1}"]`
        );
        nextBtn.classList.add('active');
        if (currentPage + 1 > +maxBtnShow.textContent) {
          nextBtn.classList.add('is-show');
          nextBtn.classList.remove('is-hide');
          minBtnShow.classList.add('is-hide');
          minBtnShow.classList.remove('is-show');
          if (currentPage + 1 === 7) {
            btnsShow[1].classList.add('is-hide');
            btnsShow[1].classList.remove('is-show');
            const paginationStepPrev = paginationBlock.querySelector(
              '.pagination__step--prev'
            );
            paginationStepPrev.classList.remove('hide');
          }
          if (currentPage + 1 === paginationPage.length) {
            const prevBtn = document.querySelector(
              `.pagination__page[data-page="${currentPage - 4}"]`
            );
            prevBtn.classList.remove('is-hide');
            prevBtn.classList.add('is-show');
            const paginationStepNext = paginationBlock.querySelector(
              '.pagination__step--next'
            );
            paginationStepNext.classList.add('hide');
          }
        }
      }

      if (e.target.closest('.pagination__prev')) {
        if (currentPage === 1) {
          const paginationStepPrev =
            paginationBlock.querySelector('.pagination__prev');
          paginationStepPrev.classList.add('disable');
          return;
        }
        const paginationStepNext =
          paginationBlock.querySelector('.pagination__next');
        paginationStepNext.classList.remove('disable');

        historyBlocks.forEach((block) => {
          block.classList.add('is-hide');
        });
        paginationPage.forEach((btn) => {
          btn.classList.remove('active');
        });
        const nextPage = document.querySelector(
          `.history[data-page="${currentPage - 1}"]`
        );
        nextPage.classList.remove('is-hide');

        const nextBtn = document.querySelector(
          `.pagination__page[data-page="${currentPage - 1}"]`
        );
        nextBtn.classList.add('active');
        if (currentPage - 1 < +minBtnShow.textContent) {
          nextBtn.classList.add('is-show');
          nextBtn.classList.remove('is-hide');
          maxBtnShow.classList.add('is-hide');
          maxBtnShow.classList.remove('is-show');
          if (currentPage - 1 === 1) {
            const nextBtn = document.querySelector(
              `.pagination__page[data-page="${currentPage + 4}"]`
            );
            nextBtn.classList.remove('is-hide');
            nextBtn.classList.add('is-show');
            const paginationStepPrev = paginationBlock.querySelector(
              '.pagination__step--prev'
            );
            paginationStepPrev.classList.add('hide');
          }
          if (currentPage - 1 === paginationPage.length - 6) {
            btnsShow[btnsShow.length - 2].classList.add('is-hide');
            btnsShow[btnsShow.length - 2].classList.remove('is-show');
            maxBtnShow.classList.add('is-hide');
            maxBtnShow.classList.remove('is-show');
            const paginationStepNext = paginationBlock.querySelector(
              '.pagination__step--next'
            );
            paginationStepNext.classList.remove('hide');
          }
        }
      }

      if (e.target.closest('.pagination__step--next')) {
        const paginationNext =
          paginationBlock.querySelector('.pagination__next');
        paginationNext.classList.add('disable');

        const paginationPrev =
          paginationBlock.querySelector('.pagination__prev');
        paginationPrev.classList.remove('disable');

        historyBlocks.forEach((block) => {
          block.classList.add('is-hide');
        });
        paginationPage.forEach((btn) => {
          btn.classList.remove('active');
          btn.classList.remove('is-show');
          btn.classList.add('is-hide');
        });
        const nextPage = document.querySelector(
          `.history[data-page="${paginationPage.length}"]`
        );
        nextPage.classList.remove('is-hide');

        const nextBtn = document.querySelector(
          `.pagination__page[data-page="${paginationPage.length}"]`
        );
        nextBtn.classList.add('active');

        const paginationStepPrev = paginationBlock.querySelector(
          '.pagination__step--prev'
        );
        paginationStepPrev.classList.remove('hide');
        const paginationStepNext = paginationBlock.querySelector(
          '.pagination__step--next'
        );
        paginationStepNext.classList.add('hide');

        for (let i = 0; i < 6; i++) {
          const nextBtn = document.querySelector(
            `.pagination__page[data-page="${paginationPage.length - i}"]`
          );
          nextBtn.classList.add('is-show');
          nextBtn.classList.remove('is-hide');
        }
      }

      if (e.target.closest('.pagination__step--prev')) {
        const paginationNext =
          paginationBlock.querySelector('.pagination__next');
        paginationNext.classList.remove('disable');

        const paginationPrev =
          paginationBlock.querySelector('.pagination__prev');
        paginationPrev.classList.add('disable');

        historyBlocks.forEach((block) => {
          block.classList.add('is-hide');
        });
        paginationPage.forEach((btn) => {
          btn.classList.remove('active');
          btn.classList.remove('is-show');
          btn.classList.add('is-hide');
        });
        const nextPage = document.querySelector(`.history[data-page="${1}"]`);
        nextPage.classList.remove('is-hide');

        const nextBtn = document.querySelector(
          `.pagination__page[data-page="${1}"]`
        );
        nextBtn.classList.add('active');

        const paginationStepPrev = paginationBlock.querySelector(
          '.pagination__step--prev'
        );
        paginationStepPrev.classList.add('hide');
        const paginationStepNext = paginationBlock.querySelector(
          '.pagination__step--next'
        );
        paginationStepNext.classList.remove('hide');

        for (let i = 0; i < 6; i++) {
          const nextBtn = document.querySelector(
            `.pagination__page[data-page="${1 + i}"]`
          );
          nextBtn.classList.add('is-show');
          nextBtn.classList.remove('is-hide');
        }
      }

      if (e.target.closest('.pagination__page')) {
        if (+e.target.dataset.page === paginationPage.length) {
          const paginationNext =
            paginationBlock.querySelector('.pagination__next');
          paginationNext.classList.add('disable');
        }

        if (+e.target.dataset.page === 1) {
          const paginationPrev =
            paginationBlock.querySelector('.pagination__prev');
          paginationPrev.classList.remove('disable');
        }

        historyBlocks.forEach((block) => {
          block.classList.add('is-hide');
        });
        paginationPage.forEach((btn) => {
          btn.classList.remove('active');
          btn.classList.remove('is-show');
          btn.classList.add('is-hide');
        });
        const nextPage = document.querySelector(
          `.history[data-page="${e.target.dataset.page}"]`
        );
        nextPage.classList.remove('is-hide');

        const nextBtn = document.querySelector(
          `.pagination__page[data-page="${e.target.dataset.page}"]`
        );
        nextBtn.classList.add('active');

        if (+e.target.dataset.page < paginationPage.length - 4) {
          for (let i = 0; i < 5; i++) {
            const nextBtn = document.querySelector(
              `.pagination__page[data-page="${+e.target.dataset.page + i}"]`
            );
            nextBtn.classList.add('is-show');
            nextBtn.classList.remove('is-hide');
          }

          const paginationStepPrev = paginationBlock.querySelector(
            '.pagination__step--prev'
          );
          paginationStepPrev.classList.remove('hide');
          const paginationStepNext = paginationBlock.querySelector(
            '.pagination__step--next'
          );
          paginationStepNext.classList.remove('hide');
        } else {
          for (let i = 0; i < 6; i++) {
            const nextBtn = document.querySelector(
              `.pagination__page[data-page="${paginationPage.length - i}"]`
            );
            nextBtn.classList.add('is-show');
            nextBtn.classList.remove('is-hide');
          }

          const paginationStepPrev = paginationBlock.querySelector(
            '.pagination__step--prev'
          );
          paginationStepPrev.classList.remove('hide');
          const paginationStepNext = paginationBlock.querySelector(
            '.pagination__step--next'
          );
          paginationStepNext.classList.add('hide');
        }
      }
    });

    const btnBack = document.querySelector('.back');
    btnBack.addEventListener('click', async () => {
      try {
        const cards = await getAccountDetail(auth, accountDetailList.account);
        accountDetailPage(cards, auth);
      } catch (err) {
        createNotification(document.body, 'error', err.message);
      }
    });

    navigate(auth);
  }, 300);
}

function accountDetailPage(accountDetailList, auth) {
  setChildren(document.body, accountDetailLoader());

  setTimeout(() => {
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
          const local = localStorage.getItem('accounts');
          const localTransferAccounts = local ? local.split(',') : [];

          if (localTransferAccounts.indexOf(transaction.to) == -1) {
            localTransferAccounts.push(transaction.to);
          }

          localStorage.setItem('accounts', localTransferAccounts);
          accountDetailPage(card, auth);
          setTimeout(() => {
            createNotification(
              document.body,
              'success',
              'Перевод успешно выполнен!'
            );
          }, 300);
        } catch (err) {
          btnError.classList.add('error');
          btnError.textContent = err.message;
          btnError.classList.remove('hidden');
        }
      }
    });

    const historyBlocks = document.querySelectorAll('.history-block');
    historyBlocks.forEach((block) => {
      block.addEventListener('click', () => {
        historyPage(accountDetailList, auth);
      });
    });

    navigate(auth);
  }, 300);
}

function accountsPage(auth, sort = '') {
  setChildren(document.body, accountsLoader());

  setTimeout(async () => {
    const accountsList = await getAccounts(auth);
    if (sort == '') {
      setChildren(document.body, accounts(accountsList));
    } else {
      setChildren(document.body, accountsSorted(accountsList, sort));
    }

    setChildren(document.body, accounts(accountsList));

    const btnNewAccount = document.querySelector('.create');
    btnNewAccount.addEventListener('click', async () => {
      try {
        await createAccount(auth);
        accountsPage(auth);
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
          accountsPage(auth, item.dataset.sort);
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

    navigate(auth);
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
          accountsPage(token.token);
        } catch (err) {
          btnError.classList.add('error');
          btnError.textContent = err.message;
          btnError.classList.remove('hidden');
        }
      }
    });
  }, 300);
}

function currencyPage(auth, allCurrencies, currencies) {
  setChildren(document.body, currencyLoader());

  setTimeout(() => {
    setChildren(document.body, currency(allCurrencies, currencies));

    const inputsCurrency = document.querySelectorAll(
      '.account__title--exchange'
    );
    inputsCurrency.forEach((input) => {
      input.addEventListener('click', (e) => {
        inputsCurrency.forEach(() => {
          const errMessage = document.querySelector('.send-tran');
          errMessage.classList.remove('error');
          errMessage.classList.add('hidden');
        });
        const target = e.target.dataset.change;
        const list = document.querySelector(`[data-currency="${target}"]`);
        const lists = document.querySelectorAll(`[data-currency]`);

        lists.forEach((listCur) => {
          if (list !== listCur) {
            listCur.classList.add('is-hide');
          }
        });

        if (list.classList.contains('is-hide')) {
          list.classList.remove('is-hide');
        } else {
          list.classList.add('is-hide');
        }

        const items = list.querySelectorAll('.exc-currency__item');
        items.forEach((item) => {
          item.addEventListener('click', () => {
            input.value = item.textContent;
            list.classList.add('is-hide');
          });
        });
      });
    });

    const sumInput = document.querySelector('[name="sum"]');
    sumInput.addEventListener('input', () => {
      const errMessage = document.querySelector('.send-tran');
      errMessage.classList.remove('error');
      errMessage.classList.add('hidden');
    });

    const btnChange = document.querySelector('.send--currency');
    btnChange.addEventListener('click', async () => {
      const sum = document.querySelector('[name="sum"]').value || 0;
      const from = document.querySelector('[name="exchange-from"]').value;
      const to = document.querySelector('[name="exchange-to"]').value;
      const errMessage = document.querySelector('.send-tran');

      try {
        validateCurrencyChange(sum, from, to);
        const body = {};
        body.from = from;
        body.to = to;
        body.amount = sum;
        const currencies = await fetchCurrencyBuy(auth, body);
        currencyPage(auth, allCurrencies, currencies);
      } catch (err) {
        errMessage.classList.add('error');
        errMessage.textContent = err.message;
        errMessage.classList.remove('hidden');
      }
    });

    const socket = new WebSocket('ws://localhost:3000/currency-feed/');

    socket.onmessage = function (event) {
      const currencyFeed = JSON.parse(event.data);
      if (currencyFeed.type === 'EXCHANGE_RATE_CHANGE') {
        const block = document.querySelector('.runtime .your__table');
        const li = el('li', { class: `your__row` });

        li.innerHTML = `<span class="your__title">
            ${currencyFeed.from}/${currencyFeed.to}
          </span>
          <span class="your__val your__val--runtime">
            ${currencyFeed.rate}
          </span>`;

        if (currencyFeed.change == -1) {
          li.classList.add('your__row--out');
        } else {
          li.classList.add('your__row--in');
        }
        const rows = document.querySelectorAll('.runtime .your__row');
        if (rows.length > 20) {
          block.children[0].remove();
        }
        block.append(li);
      }
    };

    socket.onerror = function (error) {
      console.log(`[error] ${error.message}`);
    };

    navigate(auth, socket);
  }, 300);
}

authorizationPage();

// {"type":"EXCHANGE_RATE_CHANGE","from":"AUD","to":"CAD","rate":84.23,"change":1}
// {"type":"EXCHANGE_RATE_CHANGE","from":"AUD","to":"UAH","rate":36.74,"change":1}
// {"type":"EXCHANGE_RATE_CHANGE","from":"USD","to":"BTC","rate":34.85,"change":-1}
// {"type":"EXCHANGE_RATE_CHANGE","from":"EUR","to":"CHF","rate":30.5,"change":1}

// animation: {
//   onComplete: () => {
//     delayed = true;
//   },
//   delay: (context) => {
//     let delay = 0;
//     if (context.type === 'data' && context.mode === 'default' && !delayed) {
//       delay = context.dataIndex * 300 + context.datasetIndex * 100;
//     }
//     return delay;
//   },
// },

// const socket = new WebSocket('ws://localhost:3000/currency-feed/');

// socket.onmessage = function (event) {
//   const currencyFeed = JSON.parse(event.data);
//   console.log(currencyFeed.type);
// }
