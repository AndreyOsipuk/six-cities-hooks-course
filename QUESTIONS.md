# Вопросы на понимание хуков

Как работать (критерий О11):

1. Скопируйте этот файл в свой репозиторий.
2. Под каждым вопросом напишите ответ **до запуска кода** - своими словами, в блоке «Мой ответ».
3. Запустите код (в песочнице или во временном компоненте) и допишите «Проверка»: совпало или нет. Если не совпало - **не стирайте** исходный ответ, а объясните, где ошиблись.

Если не указано иное, код выполняется в React 18+ **без** `StrictMode`.

---

## 1. Порядок рендера и эффектов

```tsx
function Child() {
  console.log('Child render');
  useEffect(() => {
    console.log('Child effect');
    return () => console.log('Child cleanup');
  });
  return null;
}

function Parent() {
  const [n, setN] = useState(0);
  console.log('Parent render', n);
  useEffect(() => {
    console.log('Parent effect', n);
    return () => console.log('Parent cleanup', n);
  }, [n]);
  return (
    <>
      <button onClick={() => setN(n + 1)}>+</button>
      <Child />
    </>
  );
}
```

а) Что выведется при первом монтировании?
б) Что выведется после одного клика по кнопке?

**Мой ответ:**

**Проверка:**

---

## 2. StrictMode

Тот же код из вопроса 1 обёрнут в `<React.StrictMode>`, режим разработки. Что изменится в выводе при монтировании? Зачем React так делает?

**Мой ответ:**

**Проверка:**

---

## 3. Два обновления подряд

```tsx
const [count, setCount] = useState(0);

const handleClick = () => {
  setCount(count + 1);
  setCount(count + 1);
  console.log(count);
};
```

а) Чему равен `count` после одного клика? Что выведет `console.log`?
б) Как изменится результат, если писать `setCount((c) => c + 1)` дважды?
в) Сколько раз перерисуется компонент за один клик?

**Мой ответ:**

**Проверка:**

---

## 4. Залипшее значение

```tsx
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{count}</p>;
}
```

а) Что будет на экране через 5 секунд?
б) Почему? Назовите это явление.
в) Предложите два разных способа исправить. Чем они отличаются?

**Мой ответ:**

**Проверка:**

---

## 5. Объект в зависимостях

```tsx
function OffersList({ city }: { city: string }) {
  const filter = { city, limit: 10 };

  useEffect(() => {
    console.log('load', filter);
  }, [filter]);

  // ...
}
```

а) Сколько раз сработает эффект, если родитель перерисуется 3 раза с тем же `city`?
б) Почему?
в) Три способа это исправить. Какой выберете вы и почему?

**Мой ответ:**

**Проверка:**

---

## 6. `useRef` и перерисовка

```tsx
function Counter() {
  const clicks = useRef(0);
  console.log('render');
  return (
    <button onClick={() => { clicks.current += 1; }}>
      Clicks: {clicks.current}
    </button>
  );
}
```

а) Что будет на кнопке после 3 кликов? Сколько раз выведется `render`?
б) Для каких задач в вашем проекте вы использовали `useRef` и почему не `useState`?

**Мой ответ:**

**Проверка:**

---

## 7. `useEffect` и `useLayoutEffect`

а) В каком порядке относительно отрисовки на экране срабатывают `useLayoutEffect` и `useEffect`?
б) Какой из них нужен, чтобы восстановить прокрутку списка (H7) без «прыжка» на экране? Почему?

**Мой ответ:**

**Проверка:**

---

## 8. Ключ и сброс состояния

```tsx
<ReviewForm key={offerId} offerId={offerId} />
```

а) Что происходит с состоянием `ReviewForm`, когда меняется `offerId`?
б) Что произошло бы без `key`?
в) Когда сброс через `key` - плохая идея?

**Мой ответ:**

**Проверка:**

---

## 9. Хук в условии

```tsx
function OfferCard({ offer, isAuth }: Props) {
  if (!isAuth) {
    return <Card offer={offer} />;
  }
  const [isHovered, setIsHovered] = useState(false);
  // ...
}
```

а) Что пойдёт не так, когда пользователь залогинится?
б) Почему React требует вызывать хуки в одном и том же порядке? Что он хранит между рендерами?

**Мой ответ:**

**Проверка:**

---

## 10. `useMemo` - не гарантия

Можно ли положиться на `useMemo`, чтобы тяжёлая функция гарантированно вызвалась **один раз**? А чтобы на неё повесить побочный эффект (запрос, подписку)? Почему?

**Мой ответ:**

**Проверка:**

---

## 11. `useCallback` без `memo`

```tsx
function Main() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const handleHover = useCallback((id: string | null) => setHoveredId(id), []);
  return <OffersList offers={offers} onHover={handleHover} />;
}
```

`OffersList` - обычный компонент, без `memo`. Перерисуется ли он при смене `hoveredId`? Есть ли польза от `useCallback` здесь? Что нужно, чтобы польза появилась?

**Мой ответ:**

**Проверка:**

---

## 12. `useSyncExternalStore`

```tsx
const getSnapshot = () => ({ online: navigator.onLine });
const status = useSyncExternalStore(subscribe, getSnapshot);
```

Что не так с этим `getSnapshot`? Что вы увидите в консоли и в работе приложения? Как исправить?

**Мой ответ:**

**Проверка:**

---

## 13. Отменённый запрос

Вы отменили thunk, созданный через `createAsyncThunk`, вызовом `promise.abort()`.

а) Какой action будет отправлен в стор?
б) Как в редьюсере или в хуке отличить отмену от настоящей ошибки сервера?
в) Что увидит пользователь, если этого не различать?

**Мой ответ:**

**Проверка:**

---

## 14. `mousedown` или `click`

Для «клика снаружи» (H3) вы подписываетесь на `document`. Пользователь зажал кнопку мыши **внутри** меню, увёл курсор наружу и отпустил. Что произойдёт при подписке на `click` и при подписке на `mousedown`? Что правильнее для меню сортировки?

**Мой ответ:**

**Проверка:**

---

## 15. Событие `storage`

Вы записали значение в `localStorage` во вкладке А. Придёт ли событие `storage` во вкладку А? Во вкладку Б с тем же сайтом? А во вкладку с другим сайтом? Как это влияет на ваш `usePersistentState`?

**Мой ответ:**

**Проверка:**

---

# Современный React (M1-M8) и Next.js (N1)

Вопросы ниже - про встроенные API React 19 и React Router 8. Отвечайте до того, как переведёте на них свой код.

---

## 16. `useEffectEvent`

```tsx
function useLogHover(offerId: string | null, city: string) {
  const onHover = useEffectEvent((id: string) => {
    console.log('hover', id, 'in', city);
  });

  useEffect(() => {
    if (offerId) {
      onHover(offerId);
    }
  }, [offerId]);
}
```

а) Пользователь навёл на карточку, потом сменил город, не убирая курсор. Сработает ли эффект? Какой `city` попадёт в лог при следующем наведении?
б) Почему `onHover` нет в зависимостях и почему линтер на это не ругается?
в) Что будет, если вызвать `onHover` прямо в теле компонента или передать его в `onClick` дочернего компонента?

**Мой ответ:**

**Проверка:**

---

## 17. `useActionState`

```tsx
const [error, submitAction, isPending] = useActionState(
  async (prevError: string | null, formData: FormData) => {
    const comment = String(formData.get('comment'));
    try {
      await dispatch(postComment({ offerId, comment })).unwrap();
      return null;
    } catch {
      return 'Не удалось отправить отзыв';
    }
  },
  null,
);

return <form action={submitAction}>...</form>;
```

а) Что такое `prevError` при первой отправке и при второй?
б) Чему равен `isPending` во время `await` и после? Где вы раньше хранили это значение сами?
в) Что станет с полями формы после успешной отправки, если ничего не делать? А после ошибки? Совпадает ли это с требованиями ТЗ к форме отзыва?

**Мой ответ:**

**Проверка:**

---

## 18. Что анимирует `<ViewTransition>`

```tsx
const handleCityClick = (city: City) => {
  startTransition(() => {
    dispatch(changeCity(city));
  });
};

const handleSearchInput = (evt: ChangeEvent<HTMLInputElement>) => {
  setQuery(evt.target.value);
};
```

Список предложений обёрнут в `<ViewTransition>`. Анимируется ли смена города? Ввод в поиск? Почему React так разделяет обновления и что было бы, если бы анимировалось каждое нажатие клавиши?

**Мой ответ:**

**Проверка:**

---

## 19. `useOptimistic`

```tsx
const [optimisticIsFavorite, setOptimisticIsFavorite] = useOptimistic(isFavorite);

const handleClick = () => {
  startTransition(async () => {
    setOptimisticIsFavorite(!optimisticIsFavorite);
    await dispatch(toggleFavorite({ offerId, status: !isFavorite })).unwrap();
  });
};
```

а) Сервер ответил ошибкой. Что покажет кнопка после окончания перехода и почему откат произошёл «сам»?
б) Что будет, если вызвать `setOptimisticIsFavorite` вне `startTransition`?
в) Сервер ответил успехом, но редьюсер Redux не обновил `isFavorite`. Что увидит пользователь?

**Мой ответ:**

**Проверка:**

---

## 20. `<Activity>`

```tsx
function Main() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log('subscribe');
    return () => console.log('unsubscribe');
  }, []);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}

<Activity mode={isMainVisible ? 'visible' : 'hidden'}>
  <Main />
</Activity>
```

Пользователь нажал кнопку 3 раза, ушёл на страницу предложения (`hidden`), вернулся (`visible`).

а) Что выведется в консоль на каждом шаге?
б) Что будет на кнопке после возврата?
в) Чем это отличается от условного рендера `{isMainVisible && <Main />}` и от `display: none`?

**Мой ответ:**

**Проверка:**

---

## 21. React Compiler

```tsx
function OffersList({ offers, sortType }: Props) {
  const sorted = offers.sort(getComparator(sortType));
  return <ul>{sorted.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</ul>;
}
```

а) Что не так с этим кодом, даже без компилятора?
б) Как поступит с этим компонентом React Compiler и почему?
в) Нужен ли вам `useMemo` для `sorted`, если компилятор включён и код исправлен?

**Мой ответ:**

**Проверка:**

---

## 22. `loader` в React Router 8

Пользователь на странице `/offer/1` кликает по карточке соседнего предложения `/offer/2`. У маршрута `/offer/:id` есть `loader`.

а) Что видит пользователь, пока `loader` для `/offer/2` выполняется: страницу `/offer/1`, пустой экран или индикатор? От чего это зависит?
б) Пока идёт загрузка, пользователь кликнул на `/offer/3`. Что произойдёт с запросом для `/offer/2`? Кто его отменит?
в) Чем это отличается от вашего `useOfferLoader`, который запускает загрузку в эффекте?

**Мой ответ:**

**Проверка:**

---

## 23. Граница `'use client'` (N1)

```tsx
// app/offer/[id]/page.tsx - серверный компонент
export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const offer = await getOffer(id);
  return <FavoriteButton offerId={id} onToggle={() => console.log('toggle')} />;
}
```

`FavoriteButton` помечен `'use client'`. Что произойдёт и почему? Какие данные можно передавать через эту границу, а какие нет? Как правильно передать «что делать при клике», если это должно выполниться на сервере?

**Мой ответ:**

**Проверка:**

---

## 24. Где хранить токен (N1)

В SPA токен хранится в `localStorage` под ключом `six-cities-token`, в Next.js-версии - в httpOnly-cookie.

а) Что может сделать вредоносный скрипт на странице (XSS) в каждом из вариантов?
б) Почему серверный компонент не может прочитать токен из `localStorage`?
в) Какую новую угрозу добавляет cookie и как от неё защищаются?

**Мой ответ:**

**Проверка:**
