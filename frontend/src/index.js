import { el, setChildren } from 'redom';
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
      btn.addEventListener('click', () => {
        console.log(btn.parentElement.querySelector('.number').textContent);
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
