import { setChildren } from 'redom';
import {
  authorization,
  authorizationLoader,
  validateAuthorization,
  fetchAuth,
} from './components/authorization/authorization';
import {
  getCards,
  cardsLoader,
  cards,
  createAccount,
  cardsSorted,
} from './components/cards/cards';

function cardsPage(cardsList, auth, sort = '') {
  setChildren(document.body, cardsLoader());

  setTimeout(() => {
    setChildren(document.body, cards(cardsList));

    const btnNewAccount = document.querySelector('.create');
    btnNewAccount.addEventListener('click', async () => {
      try {
        await createAccount(auth);
      } catch (err) {
        console.log(err);
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
          setChildren(document.body, cardsSorted(cardsList, item.dataset.sort));
          cardsPage(cardsList, auth, item.dataset.sort);
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
  }, 1000);
}

function authorizationPage() {
  setChildren(document.body, authorizationLoader());

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
        const cards = await getCards(token.token);
        cardsPage(cards, token.token);
      } catch (err) {
        btnError.classList.add('error');
        btnError.textContent = err.message;
        btnError.classList.remove('hidden');
      }
    }
  });
}

authorizationPage();
