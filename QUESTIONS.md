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
