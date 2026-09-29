// Логика MVP «Персональный помощник по готовке».
// Вся персонализация строится на истории, которая хранится в localStorage.

const HISTORY_KEY = 'cookmate_history_v1';

const SCENARIOS = {
  today: {
    title: 'Что приготовить сегодня',
    hint: 'Подберём варианты с учётом того, что вы готовили недавно.',
    fields: ['people', 'time', 'budget', 'cuisine', 'prefs'],
  },
  home: {
    title: 'Из того, что есть дома',
    hint: 'Укажите продукты, которые у вас уже есть — подберём блюда под них.',
    fields: ['products', 'people'],
  },
  new: {
    title: 'Что-нибудь новое',
    hint: 'Покажем только то, что вы ещё ни разу не готовили.',
    fields: ['people', 'time', 'budget', 'cuisine'],
  },
  quick: {
    title: 'Быстрый ужин',
    hint: 'Только блюда, которые можно приготовить за 30 минут и быстрее.',
    fields: ['people', 'budget'],
  },
  week: {
    title: 'Меню на неделю',
    hint: 'Составим меню на 5 будних дней и общий список покупок.',
    fields: ['people', 'budget', 'time', 'cuisine'],
  },
  guests: {
    title: 'Жду гостей',
    hint: 'Соберём полный стол: горячее, салаты, закуски и напитки.',
    fields: ['guests', 'budget', 'time', 'cuisine'],
  },
};

// ---------- История и статистика ----------

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addHistoryEntry(dish) {
  const history = loadHistory();
  history.push({ dishId: dish.id, date: new Date().toISOString() });
  saveHistory(history);
  renderStats();
  renderHistoryList();
}

function daysSinceLastCooked(dishId, history) {
  const entries = history.filter((h) => h.dishId === dishId);
  if (entries.length === 0) return Infinity;
  const last = entries.reduce((a, b) => (a.date > b.date ? a : b));
  return (Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24);
}

function cuisineDaysSinceCooked(cuisine, history) {
  const entries = history.filter((h) => {
    const d = DISHES.find((x) => x.id === h.dishId);
    return d && d.cuisine === cuisine;
  });
  if (entries.length === 0) return Infinity;
  const last = entries.reduce((a, b) => (a.date > b.date ? a : b));
  return (Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24);
}

function isSameMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function computeStats() {
  const history = loadHistory();
  const monthEntries = history.filter((h) => isSameMonth(h.date));
  const cookedCount = monthEntries.length;

  const idsCookedBeforeThisMonth = new Set(
    history.filter((h) => !isSameMonth(h.date)).map((h) => h.dishId)
  );
  const newDishIds = new Set(
    monthEntries.filter((h) => !idsCookedBeforeThisMonth.has(h.dishId)).map((h) => h.dishId)
  );

  const cuisineCount = {};
  let totalTime = 0;
  let totalCost = 0;
  const ingredientCount = {};

  monthEntries.forEach((h) => {
    const dish = DISHES.find((d) => d.id === h.dishId);
    if (!dish) return;
    cuisineCount[dish.cuisine] = (cuisineCount[dish.cuisine] || 0) + 1;
    totalTime += dish.time;
    totalCost += dish.baseCost / dish.servings;
    dish.ingredients.forEach((ing) => {
      if (isPantryItem(ing.name)) return;
      ingredientCount[ing.name] = (ingredientCount[ing.name] || 0) + 1;
    });
  });

  const favoriteCuisine = Object.keys(cuisineCount).sort(
    (a, b) => cuisineCount[b] - cuisineCount[a]
  )[0];
  const topIngredient = Object.keys(ingredientCount).sort(
    (a, b) => ingredientCount[b] - ingredientCount[a]
  )[0];

  return {
    cookedCount,
    newCount: newDishIds.size,
    favoriteCuisine: favoriteCuisine ? CUISINE_LABELS[favoriteCuisine] : '—',
    avgTime: cookedCount ? Math.round(totalTime / cookedCount) : 0,
    topIngredient: topIngredient || '—',
    avgCost: cookedCount ? Math.round(totalCost / cookedCount) : 0,
  };
}

function renderStats() {
  const stats = computeStats();
  const el = document.getElementById('statsPanel');
  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat"><span class="stat-value">${stats.cookedCount}</span><span class="stat-label">приготовлено блюд</span></div>
      <div class="stat"><span class="stat-value">${stats.newCount}</span><span class="stat-label">новых блюд</span></div>
      <div class="stat"><span class="stat-value">${stats.favoriteCuisine}</span><span class="stat-label">любимая кухня</span></div>
      <div class="stat"><span class="stat-value">${stats.avgTime} мин</span><span class="stat-label">среднее время готовки</span></div>
      <div class="stat"><span class="stat-value">${stats.topIngredient}</span><span class="stat-label">чаще всего используется</span></div>
      <div class="stat"><span class="stat-value">${stats.avgCost.toLocaleString('ru-RU')} ₸</span><span class="stat-label">средняя стоимость блюда</span></div>
    </div>
  `;
}

function renderHistoryList() {
  const history = loadHistory().slice().reverse().slice(0, 8);
  const el = document.getElementById('historyList');
  if (history.length === 0) {
    el.innerHTML = '<p class="muted">Вы ещё ничего не готовили. Выберите блюдо и нажмите «Я приготовил».</p>';
    return;
  }
  el.innerHTML = history
    .map((h) => {
      const dish = DISHES.find((d) => d.id === h.dishId);
      if (!dish) return '';
      const date = new Date(h.date);
      const dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      return `<div class="history-item"><span>${dish.name}</span><span class="muted">${dateStr}</span></div>`;
    })
    .join('');
}

// ---------- Помощники для расчётов ----------

function costPerServing(dish) {
  return Math.round(dish.baseCost / dish.servings);
}

// «по вкусу» не масштабируется (это не число), «шт» округляется вверх —
// нельзя купить 0.6 яйца.
function scaleQty(qty, unit, ratio) {
  if (unit === 'по вкусу') return qty;
  const scaled = qty * ratio;
  if (unit === 'шт') return Math.max(1, Math.ceil(scaled));
  return Math.round(scaled * 10) / 10;
}

function scaleDish(dish, targetServings) {
  const ratio = targetServings / dish.servings;
  return {
    ...dish,
    servings: targetServings,
    cost: Math.round(dish.baseCost * ratio),
    ingredients: dish.ingredients.map((i) => ({
      ...i,
      qty: scaleQty(i.qty, i.unit, ratio),
    })),
  };
}

function matchesPrefs(dish, prefs) {
  if (prefs.includes('quick') && dish.time > 30) return false;
  if (prefs.includes('budget') && costPerServing(dish) > 2500) return false;
  if (prefs.includes('protein') && dish.kbju.protein < 30) return false;
  if (prefs.includes('lowcal') && dish.kbju.cal > 400) return false;
  if (prefs.includes('family') && dish.servings < 4) return false;
  return true;
}

// ---------- Подбор блюд по сценариям ----------

function recommend(scenario, params) {
  const history = loadHistory();
  let pool = DISHES.filter((d) => d.category === 'main');

  if (params.time) pool = pool.filter((d) => d.time <= params.time);
  if (params.cuisines && params.cuisines.length) pool = pool.filter((d) => params.cuisines.includes(d.cuisine));
  if (params.budget && params.people) {
    const perPerson = params.budget / params.people;
    pool = pool.filter((d) => costPerServing(d) <= perPerson * 1.15);
  }
  if (params.prefs && params.prefs.length) {
    pool = pool.filter((d) => matchesPrefs(d, params.prefs));
  }

  if (scenario === 'new') {
    const cookedIds = new Set(history.map((h) => h.dishId));
    pool = pool.filter((d) => !cookedIds.has(d.id));
  }

  if (scenario === 'quick') {
    pool = pool.filter((d) => d.time <= 30);
  }

  if (scenario === 'home') {
    const products = params.products.map((p) => p.toLowerCase().trim()).filter(Boolean);
    pool = DISHES.filter((d) => d.category === 'main').map((d) => {
      const needed = d.ingredients.filter((i) => !isPantryItem(i.name));
      const matched = needed.filter((i) =>
        products.some((p) => i.name.toLowerCase().includes(p) || p.includes(i.name.toLowerCase()))
      );
      const ratio = needed.length ? matched.length / needed.length : 0;
      const missing = needed.filter((i) => !matched.includes(i));
      return { dish: d, ratio, missing };
    }).filter((x) => x.ratio >= 0.5)
      .sort((a, b) => b.ratio - a.ratio || a.dish.time - b.dish.time);
    return pool.slice(0, 6);
  }

  // Скоринг с учётом истории — используется в today/new/quick/week
  const scored = pool.map((d) => {
    let score = 0;
    const daysSince = daysSinceLastCooked(d.id, history);
    score += Math.min(daysSince, 30); // чем дольше не готовили — тем выше
    const cuisineDays = cuisineDaysSinceCooked(d.cuisine, history);
    score += Math.min(cuisineDays, 20) * 0.3;
    if (daysSince < 3) score -= 15; // недавно готовили — понижаем
    return { dish: d, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 6).map((s) => ({ dish: s.dish }));
}

function buildWeekMenu(params) {
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  const history = loadHistory();
  let candidates = DISHES.filter((d) => d.category === 'main');

  if (params.time) candidates = candidates.filter((d) => d.time <= params.time);
  if (params.cuisines && params.cuisines.length) candidates = candidates.filter((d) => params.cuisines.includes(d.cuisine));
  if (params.budget && params.people) {
    const perPerson = (params.budget / 5) / params.people;
    candidates = candidates.filter((d) => costPerServing(d) <= perPerson * 1.3);
  }

  const scored = candidates
    .map((d) => ({ dish: d, days: daysSinceLastCooked(d.id, history) }))
    .sort((a, b) => b.days - a.days);

  const chosen = [];
  const usedCuisines = new Set();
  for (const item of scored) {
    if (chosen.length >= 5) break;
    if (usedCuisines.has(item.dish.cuisine) && usedCuisines.size < 3) continue;
    chosen.push(item.dish);
    usedCuisines.add(item.dish.cuisine);
  }
  // добираем, если не хватило из-за фильтра по кухне
  for (const item of scored) {
    if (chosen.length >= 5) break;
    if (!chosen.includes(item.dish)) chosen.push(item.dish);
  }

  return days.map((day, i) => ({ day, dish: chosen[i] })).filter((x) => x.dish);
}

function buildFeast(params) {
  const guests = params.guests || 6;
  let mains = DISHES.filter((d) => d.category === 'main');
  if (params.cuisines && params.cuisines.length) mains = mains.filter((d) => params.cuisines.includes(d.cuisine));
  if (params.time) mains = mains.filter((d) => d.time <= params.time);
  mains.sort((a, b) => b.servings - a.servings);
  const main = mains[0] || DISHES.find((d) => d.id === 'plov');

  // подбираем салат/закуску/десерт/напиток под кухню выбранного горячего
  const cuisineFilter = main.cuisine;
  const pick = (cat) =>
    DISHES.find((d) => d.category === cat && d.cuisine === cuisineFilter) ||
    DISHES.find((d) => d.category === cat);

  const salad = pick('salad');
  const snack = pick('snack');
  const dessert = pick('dessert');
  const drink = pick('drink');

  const items = [main, salad, snack, dessert, drink]
    .filter(Boolean)
    .map((d) => scaleDish(d, guests));

  return items;
}

// Строка ингредиента: «по вкусу» показываем без бессмысленного числа.
function ingredientLine(i) {
  return i.unit === 'по вкусу' ? `${i.name} — по вкусу` : `${i.name} — ${i.qty} ${i.unit}`;
}

// ---------- Рендер карточек ----------

function kbjuLine(kbju) {
  return `${kbju.cal} ккал · Б ${kbju.protein} г · Ж ${kbju.fat} г · У ${kbju.carbs} г`;
}

const PHOTO_GRADIENTS = [
  'linear-gradient(160deg, rgba(242,106,61,0.24), rgba(233,162,59,0.20))',
  'linear-gradient(160deg, rgba(95,143,97,0.22), rgba(233,162,59,0.16))',
  'linear-gradient(160deg, rgba(233,162,59,0.26), rgba(242,106,61,0.14))',
  'linear-gradient(160deg, rgba(95,143,97,0.20), rgba(242,106,61,0.14))',
];

const CUISINE_BADGE_CLASS = {
  kazakh: 'badge--peach',
  asian: 'badge--amber',
  european: 'badge--green',
  italian: 'badge--green',
  other: 'badge--amber',
};

function photoGradient(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PHOTO_GRADIENTS[hash % PHOTO_GRADIENTS.length];
}

function dishCardHTML(dish, opts = {}) {
  const totalCost = opts.totalCost != null ? opts.totalCost : dish.baseCost;
  const servings = opts.servings || dish.servings;
  const ingredients = opts.ingredients || dish.ingredients;
  const badgeClass = CUISINE_BADGE_CLASS[dish.cuisine] || 'badge--peach';
  const matchBadge = opts.matchRatio != null
    ? `<span class="badge badge-match">${Math.round(opts.matchRatio * 100)}% из ваших продуктов</span>`
    : '';
  const missingHTML = opts.missing && opts.missing.length
    ? `<p class="missing"><strong>Докупить:</strong> ${opts.missing.map((m) => m.name).join(', ')}</p>`
    : '';

  return `
    <article class="dish-card" data-id="${dish.id}">
      <div class="dish-card-main">
        <div class="dish-photo" style="background:${photoGradient(dish.id)}">
          <span class="dish-photo-emoji">${dish.emoji || '🍽'}</span>
        </div>
        <div class="dish-card-body">
          <div class="dish-card-head">
            <h4>${dish.name}</h4>
            <span class="badge ${badgeClass}">${CUISINE_LABELS[dish.cuisine]}</span>
          </div>
          ${matchBadge}
          <div class="dish-meta">
            <span class="meta-item"><span class="meta-icon meta-icon--time">⏱</span>${dish.time} мин</span>
            <span class="meta-item"><span class="meta-icon meta-icon--servings">👥</span>${servings} порц.</span>
            <span class="meta-item"><span class="meta-icon meta-icon--cost">💰</span>${totalCost.toLocaleString('ru-RU')} ₸</span>
          </div>
          <p class="kbju">${kbjuLine(dish.kbju)} <span class="muted">/ порция</span></p>
          ${missingHTML}
        </div>
      </div>
      <details>
        <summary><span class="summary-icon">📋</span>Рецепт и список покупок<span class="chevron">›</span></summary>
        <div class="dish-details">
          <h5>Ингредиенты</h5>
          <ul class="ingredient-list">
            ${ingredients.map((i) => `<li>${ingredientLine(i)}</li>`).join('')}
          </ul>
          <h5>Приготовление</h5>
          <ol class="steps-list">
            ${dish.steps.map((s) => `<li>${s}</li>`).join('')}
          </ol>
        </div>
      </details>
      <button class="btn btn-cooked" data-id="${dish.id}"><span class="btn-cooked-icon">🧑‍🍳</span>Я приготовил</button>
    </article>
  `;
}

function attachCookedHandlers(container) {
  container.querySelectorAll('.btn-cooked').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dish = DISHES.find((d) => d.id === btn.dataset.id);
      addHistoryEntry(dish);
      btn.textContent = 'Сохранено ✓';
      btn.disabled = true;
      showToast(`«${dish.name}» добавлено в историю. Рекомендации станут точнее!`);
    });
  });
}

let toastTimer;
function showToast(text) {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

// ---------- Рендер результатов по сценариям ----------

function renderResults(scenario, params) {
  const resultsEl = document.getElementById('results');
  resultsEl.innerHTML = '';
  resultsEl.classList.remove('empty');

  if (scenario === 'week') {
    const menu = buildWeekMenu(params);
    if (menu.length === 0) {
      resultsEl.innerHTML = '<p class="empty-msg">Не нашли блюд под такие условия. Попробуйте увеличить бюджет или время.</p>';
      return;
    }
    const shopping = aggregateShopping(menu.map((m) => m.dish));
    const rows = menu
      .map(
        (m) => `<tr>
          <td>${m.day}</td>
          <td>${m.dish.name}</td>
          <td>${m.dish.time} мин</td>
          <td>${m.dish.baseCost.toLocaleString('ru-RU')} ₸</td>
        </tr>`
      )
      .join('');
    const total = menu.reduce((sum, m) => sum + m.dish.baseCost, 0);
    resultsEl.innerHTML = `
      <div class="week-menu">
        <table class="week-table">
          <thead><tr><th>День</th><th>Блюдо</th><th>Время</th><th>Стоимость</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p class="total-line">Итого за неделю: <strong>${total.toLocaleString('ru-RU')} ₸</strong></p>
      </div>
      <h3>Список покупок на неделю</h3>
      <ul class="shopping-list">${shopping.map((i) => `<li>${i.name} — ${i.display}</li>`).join('')}</ul>
      <div class="dish-grid">${menu.map((m) => dishCardHTML(m.dish)).join('')}</div>
    `;
    attachCookedHandlers(resultsEl);
    return;
  }

  if (scenario === 'guests') {
    const items = buildFeast(params);
    const total = items.reduce((sum, d) => sum + d.cost, 0);
    const totalTime = Math.max(...items.map((d) => d.time));
    const shopping = aggregateShopping(items);
    resultsEl.innerHTML = `
      <div class="feast-summary">
        <h3>Стол на ${params.guests || 6} гостей</h3>
        <p class="total-line">Ориентировочная стоимость: <strong>${total.toLocaleString('ru-RU')} ₸</strong> · Активная готовка: <strong>~${totalTime} мин</strong></p>
        <div class="feast-choices">
          <button class="btn btn-outline">Приготовить самостоятельно</button>
          <button class="btn btn-outline">Готовить меньше</button>
          <button class="btn btn-outline">Не готовить</button>
        </div>
      </div>
      <h3>Список покупок</h3>
      <ul class="shopping-list">${shopping.map((i) => `<li>${i.name} — ${i.display}</li>`).join('')}</ul>
      <div class="dish-grid">${items
        .map((d) => dishCardHTML(d, { totalCost: d.cost, servings: d.servings, ingredients: d.ingredients }))
        .join('')}</div>
    `;
    attachCookedHandlers(resultsEl);
    return;
  }

  if (scenario === 'home') {
    const matches = recommend('home', params);
    if (matches.length === 0) {
      resultsEl.innerHTML = '<p class="empty-msg">Под указанные продукты пока ничего не нашлось. Добавьте ещё пару ингредиентов.</p>';
      return;
    }
    resultsEl.innerHTML = `<div class="dish-grid">${matches
      .map((m) => dishCardHTML(m.dish, { matchRatio: m.ratio, missing: m.missing }))
      .join('')}</div>`;
    attachCookedHandlers(resultsEl);
    return;
  }

  const matches = recommend(scenario, params);
  if (matches.length === 0) {
    resultsEl.innerHTML = '<p class="empty-msg">Ничего не нашли под такие условия. Попробуйте смягчить фильтры.</p>';
    return;
  }
  resultsEl.innerHTML = `<div class="dish-grid">${matches.map((m) => dishCardHTML(m.dish)).join('')}</div>`;
  attachCookedHandlers(resultsEl);
}

function aggregateShopping(dishes) {
  const map = {};
  dishes.forEach((d) => {
    d.ingredients.forEach((i) => {
      const key = `${i.name}__${i.unit}`;
      if (!map[key]) map[key] = { name: i.name, unit: i.unit, qty: 0 };
      // «по вкусу» не суммируем — это не число
      if (i.unit !== 'по вкусу') map[key].qty += i.qty;
    });
  });
  return Object.values(map)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((i) => ({
      name: i.name,
      display: i.unit === 'по вкусу' ? 'по вкусу' : `${Math.round(i.qty * 10) / 10} ${i.unit}`,
    }));
}

// ---------- UI: сценарии, форма, события ----------

let currentScenario = 'today';

function renderScenarioForm(scenario) {
  const conf = SCENARIOS[scenario];
  document.getElementById('formTitle').textContent = conf.title;
  document.getElementById('formHint').textContent = conf.hint;

  document.querySelectorAll('.field').forEach((f) => {
    f.hidden = !conf.fields.includes(f.dataset.field);
  });
}

function readParams(scenario) {
  const params = {};
  params.people = Number(document.getElementById('peopleInput').value) || 2;
  params.guests = Number(document.getElementById('guestsInput').value) || 6;
  params.budget = Number(document.getElementById('budgetInput').value) || null;
  params.time = Number(document.getElementById('timeInput').value) || null;
  params.cuisines = Array.from(document.querySelectorAll('.cuisine-checkbox:checked')).map((c) => c.value);
  params.prefs = Array.from(document.querySelectorAll('.pref-chips input:checked')).map((c) => c.value);
  params.products = productTags.slice();
  return params;
}

let productTags = [];

function renderProductTags() {
  const el = document.getElementById('productTags');
  el.innerHTML = productTags
    .map(
      (p, i) => `<span class="tag">${p}<button type="button" data-i="${i}" class="tag-remove">×</button></span>`
    )
    .join('');
  el.querySelectorAll('.tag-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      productTags.splice(Number(btn.dataset.i), 1);
      renderProductTags();
    });
  });
  renderActiveFilters();
}

const LOADING_MESSAGES = [
  'Подбираем блюда под ваш запрос',
  'Смотрим, что вы готовили раньше',
  'Считаем время и бюджет',
  'Почти готово',
];

let generateTimer = null;

function showLoadingState() {
  const resultsEl = document.getElementById('results');
  const message = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
  resultsEl.innerHTML = `
    <div class="loading-state">
      <div class="loading-plate">
        <span class="loading-emoji">🍅</span>
        <span class="loading-emoji">🥑</span>
        <span class="loading-emoji">🧄</span>
        <span class="loading-emoji">🌶️</span>
      </div>
      <p class="loading-text">${message}<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span></p>
    </div>
  `;
}

function generateAndShow(scrollToResults) {
  const scenario = currentScenario;
  const params = readParams(scenario);
  const resultsSection = document.getElementById('resultsSection');

  resultsSection.hidden = false;
  showLoadingState();
  if (scrollToResults) {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  clearTimeout(generateTimer);
  generateTimer = setTimeout(() => {
    renderResults(scenario, params);
  }, 750);
}

// Выбор сценария синхронизирует все переключатели (на главной и в шторке настроек)
// и обновляет набор полей формы, не открывая/закрывая шторку сама по себе.
const SCENARIO_SHORT_LABELS = {
  today: 'Для себя',
  guests: 'На гостей',
  home: 'Из дома',
  new: 'Новое',
  quick: 'Быстро',
  week: 'На неделю',
};

const PREF_LABELS = {
  quick: 'Быстро',
  budget: 'Бюджетно',
  protein: 'Высокобелковое',
  lowcal: 'Низкокалорийное',
  family: 'Семейное',
};

// Собирает чипы под кнопкой «Готовить»: текущий сценарий + все выбранные
// фильтры (кухни, предпочтения, бюджет, время, продукты).
function renderActiveFilters() {
  const el = document.getElementById('activeFilters');
  const chips = [`<span class="filter-chip filter-chip--scenario">${SCENARIO_SHORT_LABELS[currentScenario] || currentScenario}</span>`];

  document.querySelectorAll('.cuisine-checkbox:checked').forEach((c) => {
    chips.push(`<span class="filter-chip">${CUISINE_LABELS[c.value] || c.value}</span>`);
  });

  document.querySelectorAll('.pref-chips input:checked').forEach((c) => {
    chips.push(`<span class="filter-chip">${PREF_LABELS[c.value] || c.value}</span>`);
  });

  const budget = document.getElementById('budgetInput').value;
  if (budget) chips.push(`<span class="filter-chip">До ${Number(budget).toLocaleString('ru-RU')} ₸</span>`);

  const time = document.getElementById('timeInput').value;
  if (time) chips.push(`<span class="filter-chip">До ${time} мин</span>`);

  if (productTags.length) chips.push(`<span class="filter-chip">Продукты: ${productTags.length}</span>`);

  el.innerHTML = chips.join('');
}

function chooseScenario(scenario) {
  currentScenario = scenario;
  document.querySelectorAll('.scenario-btn, .drawer-mood-btn').forEach((el) => {
    el.classList.toggle('active', el.dataset.scenario === scenario);
  });
  renderScenarioForm(scenario);
  renderActiveFilters();
}

function openDrawer() {
  const drawer = document.getElementById('settingsDrawer');
  const overlay = document.getElementById('drawerOverlay');
  overlay.hidden = false;
  requestAnimationFrame(() => {
    drawer.classList.add('open');
    overlay.classList.add('open');
  });
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  const drawer = document.getElementById('settingsDrawer');
  const overlay = document.getElementById('drawerOverlay');
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => { overlay.hidden = true; }, 300);
}

function init() {
  renderStats();
  renderHistoryList();

  // сценарии на главной странице — сразу подбирают блюда с параметрами по умолчанию
  document.querySelectorAll('.scenario-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      chooseScenario(btn.dataset.scenario);
      generateAndShow(false);
    });
  });

  // настроения в шторке — только переключают сценарий и поля формы
  document.querySelectorAll('.drawer-mood-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      chooseScenario(btn.dataset.scenario);
    });
  });

  document.getElementById('generateBtn').addEventListener('click', () => {
    generateAndShow(true);
  });

  document.getElementById('openDrawerBtn').addEventListener('click', openDrawer);
  document.getElementById('closeDrawerBtn').addEventListener('click', closeDrawer);
  document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('settingsDrawer').classList.contains('open')) {
      closeDrawer();
    }
  });

  document.getElementById('filterForm').addEventListener('submit', (e) => {
    e.preventDefault();
    generateAndShow(true);
    closeDrawer();
  });

  // живое обновление чипов активных фильтров под кнопкой «Готовить»
  document.querySelectorAll('.cuisine-checkbox, .pref-chips input').forEach((input) => {
    input.addEventListener('change', renderActiveFilters);
  });
  document.getElementById('budgetInput').addEventListener('input', renderActiveFilters);
  document.getElementById('timeInput').addEventListener('input', renderActiveFilters);

  const productInput = document.getElementById('productInput');
  productInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = productInput.value.trim().replace(',', '');
      if (val) {
        productTags.push(val);
        renderProductTags();
        productInput.value = '';
      }
    }
  });

  document.querySelectorAll('.quick-product').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.product;
      if (!productTags.includes(val)) {
        productTags.push(val);
        renderProductTags();
      }
    });
  });

  document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (confirm('Очистить всю историю приготовленных блюд?')) {
      localStorage.removeItem(HISTORY_KEY);
      renderStats();
      renderHistoryList();
    }
  });

  // сценарий по умолчанию
  chooseScenario('today');
}

document.addEventListener('DOMContentLoaded', init);
