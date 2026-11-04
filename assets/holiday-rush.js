(() => {
  const KEY = 'jkgs-holiday-rush-v1';
  const $ = id => document.getElementById(id);
  let store = {};
  try { store = JSON.parse(window.localStorage.getItem(KEY) || '{}') || {}; } catch { store = {}; }
  const persist = () => { try { window.localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* storage unavailable: the page still works */ } };

  /* Saved fields */
  const fields = Array.from(document.querySelectorAll('[data-save]'));
  const readField = el => (el.type === 'checkbox' ? el.checked : el.value);
  fields.forEach(el => {
    if (Object.prototype.hasOwnProperty.call(store, el.id)) {
      if (el.type === 'checkbox') el.checked = Boolean(store[el.id]);
      else el.value = store[el.id];
    }
    const eventName = el.type === 'checkbox' || el.tagName === 'SELECT' || el.type === 'date' ? 'change' : 'input';
    el.addEventListener(eventName, () => {
      store[el.id] = readField(el);
      persist();
      refresh(el);
    });
  });

  /* Navigation: one part open at a time; every jump is a button */
  const parts = Array.from(document.querySelectorAll('.hr-part'));
  const header = document.querySelector('.site-header');
  const jumpbar = $('jumpbar');
  const chips = Array.from(document.querySelectorAll('.hr-chip-link[data-part]'));
  const stickyHeader = () => (header && getComputedStyle(header).position === 'sticky' ? header.getBoundingClientRect().height : 0);
  const setHeaderVar = () => document.documentElement.style.setProperty('--hr-header', `${Math.round(stickyHeader())}px`);
  setHeaderVar();
  window.addEventListener('resize', setHeaderVar);
  const offset = () => stickyHeader() + (jumpbar ? jumpbar.getBoundingClientRect().height : 0) + 14;
  const scrollToEl = el => {
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset();
    window.scrollTo(0, Math.max(0, Math.round(y)));
  };
  const syncChips = () => {
    const open = parts.find(part => part.open);
    chips.forEach(chip => {
      const active = Boolean(open) && chip.dataset.part === open.id;
      if (active) chip.setAttribute('aria-current', 'true');
      else chip.removeAttribute('aria-current');
    });
    const active = chips.find(chip => chip.hasAttribute('aria-current'));
    if (active && active.parentElement) {
      const bar = active.parentElement;
      const left = active.offsetLeft - bar.offsetLeft;
      if (left < bar.scrollLeft || left + active.offsetWidth > bar.scrollLeft + bar.clientWidth - 40) bar.scrollLeft = Math.max(0, left - 16);
      bar.dispatchEvent(new Event('scroll'));
    }
  };
  const openPart = part => {
    parts.forEach(other => { if (other !== part) other.open = false; });
    part.open = true;
  };
  const goTo = id => {
    const target = document.getElementById(id);
    if (!target) return;
    const part = target.closest('.hr-part');
    if (part) openPart(part);
    const group = target.closest('[data-group]');
    if (group && target.hidden) {
      expanded.add(group.dataset.group);
      applyGroups(profile());
    }
    let node = target;
    while (node) {
      if (node.tagName === 'DETAILS' && !node.classList.contains('hr-part')) node.open = true;
      node = node.parentElement;
    }
    syncChips();
    scrollToEl(part && target === part ? part : target);
    try { history.replaceState(null, '', `#${id}`); } catch { /* not allowed here */ }
  };
  document.addEventListener('click', event => {
    const summary = event.target.closest('.hr-part > summary');
    if (summary) {
      event.preventDefault();
      const part = summary.parentElement;
      if (part.open) {
        part.open = false;
      } else {
        openPart(part);
        const top = part.getBoundingClientRect().top;
        if (top < offset() - 2 || top > window.innerHeight * 0.65) scrollToEl(part);
      }
      syncChips();
      return;
    }
    const go = event.target.closest('[data-go]');
    if (go) {
      event.preventDefault();
      goTo(go.dataset.go);
      return;
    }
    const showAll = event.target.closest('[data-show-group]');
    if (showAll) {
      const key = showAll.dataset.showGroup;
      if (expanded.has(key)) expanded.delete(key); else expanded.add(key);
      applyGroups(profile());
      return;
    }
    const close = event.target.closest('[data-close]');
    if (close) {
      const part = close.closest('.hr-part');
      if (!part) return;
      part.open = false;
      syncChips();
      scrollToEl(part);
    }
  });
  parts.forEach(part => part.addEventListener('toggle', syncChips));
  const chipRow = document.querySelector('.hr-chips');
  const markOverflow = () => { if (chipRow) chipRow.classList.toggle('has-more', chipRow.scrollLeft + chipRow.clientWidth < chipRow.scrollWidth - 4); };
  chipRow?.addEventListener('scroll', markOverflow, { passive: true });
  window.addEventListener('resize', markOverflow);
  markOverflow();
  const startHash = decodeURIComponent(window.location.hash.slice(1));
  if (startHash && /^[\w-]+$/.test(startHash)) window.requestAnimationFrame(() => goTo(startHash));
  window.addEventListener('hashchange', () => {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash && /^[\w-]+$/.test(hash) && document.getElementById(hash)) goTo(hash);
  });
  let openBeforePrint = null;
  window.addEventListener('beforeprint', () => {
    openBeforePrint = parts.find(part => part.open) || null;
    parts.forEach(part => { part.open = true; });
  });
  window.addEventListener('afterprint', () => {
    parts.forEach(part => { part.open = part === openBeforePrint; });
    syncChips();
  });

  /* Copy buttons */
  const flash = (button, text) => {
    const original = button.dataset.label || button.textContent;
    button.dataset.label = original;
    button.textContent = text;
    button.classList.add('is-done');
    window.clearTimeout(button._timer);
    button._timer = window.setTimeout(() => {
      button.textContent = original;
      button.classList.remove('is-done');
    }, 2200);
  };
  const selectNode = node => {
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    const node = $(button.dataset.copy);
    if (!node) return;
    try {
      await navigator.clipboard.writeText(node.textContent.trim());
      flash(button, 'Copied');
    } catch {
      selectNode(node);
      flash(button, 'Selected');
    }
  });

  /* Part 1: starting setup */
  const setupOut = $('setup-out');
  const setupHint = $('setup-hint');
  const value = id => ($(id) ? readField($(id)) : '');
  let setupReady = false;
  const tool = (name, target, note, modes) => ({ name, target, note, modes });
  const renderSetup = () => {
    if (!setupOut) return;
    const items = [
      tool('Your facts page', 'part-4', 'Every reply comes from it.', ['Free']),
      tool('Order-status fixes', 'part-2', 'Tracking links, an order-by date and a delay email.', ['Free', 'No AI'])
    ];
    const platform = value('q-platform');
    const email = value('q-email');
    const ai = value('q-ai');
    const channels = ['ch-chat', 'ch-email', 'ch-igdm', 'ch-comments', 'ch-market', 'ch-phone'].filter(id => value(id));
    const has = id => channels.includes(id);
    const google = email === 'Gmail' || email === 'Google Workspace';

    if (has('ch-chat')) {
      if (platform === 'Shopify') items.push(tool('Shopify Inbox instant answers', 'save-shopify', 'Customers tap a question in your store chat and see your answer.', ['Sends', 'Free']));
      else items.push(tool('Saved answers in your store chat', 'save-replies', 'Most store chat apps let you save answers. Search their help for "saved replies".', ['Sends', 'Usually free']));
    }
    if (has('ch-email')) {
      if (google) {
        items.push(tool('Gmail templates', 'save-gmail', 'Your saved replies, inserted in two clicks.', ['You send', 'Free']));
        items.push(tool('Needs a person filter', 'filter', 'Damage, refund and complaint emails land in one starred pile. It only sorts, and can miss some.', ['Sorts only', 'Free']));
      } else if (email === 'Outlook or Microsoft 365') {
        items.push(tool('Outlook templates and a rule', 'filter', 'Save replies as templates. Use a rule with the filter words to sort damage and refund emails into a folder.', ['You send', 'Free']));
      } else {
        items.push(tool('Saved replies and a filter in your email', 'filter', 'Most email apps have both. The filter words work in any of them.', ['You send', 'Free']));
      }
    }
    if (has('ch-igdm')) items.push(tool('Meta Business Suite FAQs and greeting', 'save-meta', 'Fixed answers on Instagram and Facebook.', ['Sends', 'Free']));
    if (has('ch-comments')) items.push(tool('Manychat comment-to-DM', 'prompt-7', 'Someone comments GIFT and gets your gift guide by DM. Free to test (about 25 people a month); paid plans from about US$14 a month. No follow-up messages.', ['Sends', 'Free to test']));
    if (has('ch-market')) items.push(tool('Saved replies on Etsy or Amazon', 'save-market', 'Etsy has saved replies in Messages. On Amazon, paste them from a document. Write them with prompt 4.', ['You send', 'Free']));
    if (has('ch-phone')) items.push(tool('Your facts page by the phone', 'part-4', 'Read answers from the same page. This guide doesn\'t cover phone tools.', ['Free']));

    if (channels.length || ai) {
      if (ai === 'ChatGPT' || ai === 'Claude') items.push(tool(`AI drafts in ${ai}`, 'drafts-setup', 'You already pay for it. Keep your facts page and the reply prompt in a Project.', ['Drafts', 'Included']));
      else if (ai === 'Gemini' && email === 'Google Workspace') items.push(tool('Gemini in Gmail', 'drafts-setup', 'Drafts replies inside Gmail, so there\'s nothing to copy.', ['Drafts', 'Included']));
      else if (ai === 'Gemini' || ai === 'Copilot') items.push(tool(`AI drafts in ${ai}`, 'drafts', 'You already pay for it. Paste the reply prompt, your facts page and the question.', ['Drafts', 'Included']));
      else if (email === 'Google Workspace') items.push(tool('Gemini in Gmail', 'drafts-setup', 'Included in Google Workspace business plans. Drafts replies inside Gmail.', ['Drafts', 'Included']));
      else items.push(tool('ChatGPT or Claude, free plan', 'drafts-setup', 'Keep your facts in a Project and paste each question for a draft you check.', ['Drafts', 'Free']));
    }
    if (channels.length >= 3) items.push(tool('Later: one inbox for every channel', 'compare', 'Messages spread across three or more places? Gorgias or Tidio, once the free setup is running. Allow half a day.', ['Paid']));

    const previous = new Set(Array.from(setupOut.querySelectorAll('.hr-setup-go')).map(el => el.textContent));
    setupOut.replaceChildren(...items.map(item => {
      const li = document.createElement('li');
      const go = document.createElement('button');
      go.type = 'button';
      go.className = 'hr-setup-go';
      go.dataset.go = item.target;
      go.textContent = item.name;
      const note = document.createElement('span');
      note.className = 'hr-setup-note';
      note.textContent = item.note;
      const meta = document.createElement('span');
      meta.className = 'hr-setup-meta';
      item.modes.forEach(mode => {
        const chip = document.createElement('span');
        chip.className = 'hr-mode' + (mode === 'Sends' ? ' is-sends' : mode === 'Drafts' ? ' is-drafts' : '');
        chip.textContent = mode;
        meta.append(chip);
      });
      li.append(go, note, meta);
      if (setupReady && !previous.has(item.name)) li.classList.add('is-new');
      return li;
    }));
    if (setupHint) {
      setupHint.textContent = profile().answered
        ? 'Parts 2 to 4 now show the steps for your setup.'
        : 'Tick where your messages arrive. Parts 2 to 4 will then show the steps for your tools.';
      setupHint.classList.toggle('is-tailored', profile().answered);
    }
    setupReady = true;
  };

  /* First-week progress */
  const renderWeek = () => {
    const boxes = Array.from(document.querySelectorAll('.hr-days li')).filter(li => !li.hidden).map(li => li.querySelector('input[type="checkbox"]'));
    const done = boxes.filter(box => box && box.checked).length;
    const out = $('week-progress');
    if (out) out.textContent = boxes.length && done === boxes.length ? 'All done. Time to check it worked.' : `${done} of ${boxes.length} done`;
  };

  /* Part 2: order-by date */
  const parseDate = text => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || '');
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  };
  const minusBusinessDays = (date, days) => {
    const result = new Date(date);
    let left = days;
    while (left > 0) {
      result.setDate(result.getDate() - 1);
      const day = result.getDay();
      if (day !== 0 && day !== 6) left -= 1;
    }
    return result;
  };
  const longDate = date => date.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' });
  const dayOfMonth = date => date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' });
  const renderCalc = () => {
    const out = $('calc-out');
    const banner = $('copy-banner');
    if (!out || !banner) return;
    const carrier = parseDate(value('calc-carrier'));
    const packRaw = parseInt(value('calc-pack'), 10);
    const pack = Number.isFinite(packRaw) ? Math.min(Math.max(packRaw, 0), 15) : 0;
    const pickup = parseDate(value('calc-pickup'));
    const fill = text => {
      const mark = document.createElement('mark');
      mark.textContent = text;
      return mark;
    };
    const orderBy = carrier ? minusBusinessDays(carrier, pack + 1) : null;
    out.textContent = orderBy ? longDate(orderBy) : 'Enter your carrier\'s date';
    out.classList.toggle('is-empty', !orderBy);
    banner.replaceChildren(
      document.createTextNode(orderBy ? 'Order by ' : 'Order by December '),
      orderBy ? document.createTextNode(dayOfMonth(orderBy)) : fill('[date]'),
      document.createTextNode(` for delivery before the 25th. Local pickup until ${pickup ? '' : 'December '}`),
      pickup ? document.createTextNode(dayOfMonth(pickup)) : fill('[date]'),
      document.createTextNode('.')
    );
  };

  /* Part 3: facts page */
  const renderFacts = () => {
    const out = $('facts-out');
    if (!out) return;
    out.replaceChildren(document.createTextNode('SHOP FACTS'));
    document.querySelectorAll('[data-fact]').forEach(row => {
      const text = row.value.trim();
      out.append(`\n${row.dataset.fact}: `);
      if (text) {
        out.append(text);
      } else {
        const mark = document.createElement('mark');
        mark.textContent = '[add this]';
        out.append(mark);
      }
    });
  };

  /* Tailoring: Part 1 answers decide which steps show in Parts 2 to 4 */
  const expanded = new Set();
  const CHANNELS = ['ch-chat', 'ch-email', 'ch-igdm', 'ch-comments', 'ch-market', 'ch-phone'];
  function profile() {
    const platform = value('q-platform');
    const email = value('q-email');
    const ai = value('q-ai');
    const channels = CHANNELS.filter(id => value(id));
    const has = id => channels.includes(id);
    const PLAT = { 'Shopify': 'shopify', 'Wix': 'wix', 'WooCommerce': 'woo', 'Squarespace': 'squarespace', 'Etsy only': 'etsy', 'Amazon only': 'amazon', 'Instagram or DMs, no website': 'social', 'Other': 'other' };
    const plat = PLAT[platform] || '';
    return {
      platform, plat, email, ai, channels, has,
      answered: Boolean(platform || email || ai || channels.length),
      shopify: platform === 'Shopify',
      google: email === 'Gmail' || email === 'Google Workspace',
      workspace: email === 'Google Workspace',
      outlook: email === 'Outlook or Microsoft 365',
      emailOther: email === 'Other',
      noPaidAI: !ai || ai === 'None'
    };
  }
  const WHEN = {
    shopify: p => !p.platform || p.shopify,
    'not-shopify': p => Boolean(p.platform) && !p.shopify,
    'platform-unknown': p => !p.platform,
    'p-wix': p => p.plat === 'wix',
    'p-woo': p => p.plat === 'woo',
    'p-etsy': p => p.plat === 'etsy',
    'p-amazon': p => p.plat === 'amazon',
    'p-social': p => p.plat === 'social',
    'p-generic': p => p.plat === 'squarespace' || p.plat === 'other',
    'p-site': p => ['wix', 'woo', 'squarespace', 'other'].includes(p.plat),
    gmail: p => !p.email || p.google,
    outlook: p => p.outlook,
    'email-other': p => p.emailOther,
    'email-unknown': p => !p.email,
    instagram: p => !p.answered || p.has('ch-igdm') || p.has('ch-comments')
  };
  const FIT = {
    'save-shopify': p => p.shopify,
    'save-gmail': p => p.google,
    'save-email': p => p.outlook || p.emailOther,
    'save-meta': p => p.has('ch-igdm') || p.has('ch-comments') || p.plat === 'social',
    'save-market': p => p.has('ch-market') || p.plat === 'etsy' || p.plat === 'amazon' || (p.has('ch-chat') && Boolean(p.platform) && !p.shopify),
    'ai-chatgpt': p => p.ai === 'ChatGPT' || (p.noPaidAI && !p.workspace),
    'ai-claude': p => p.ai === 'Claude' || (p.noPaidAI && !p.workspace),
    'ai-gemini': p => p.workspace,
    'ai-other': p => p.ai === 'Copilot' || (p.ai === 'Gemini' && !p.workspace)
  };
  const joinList = list => (list.length < 2 ? list.join('') : `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`);
  function applyGroups(p) {
    document.querySelectorAll('[data-group]').forEach(group => {
      const key = group.dataset.group;
      const blocks = Array.from(group.querySelectorAll('[data-fit]'));
      const fits = blocks.map(block => Boolean(FIT[block.dataset.fit] && FIT[block.dataset.fit](p)));
      const canFilter = p.answered && fits.some(Boolean) && fits.some(fit => !fit);
      const filtering = canFilter && !expanded.has(key);
      blocks.forEach((block, i) => { block.hidden = filtering && !fits[i]; });
      const button = document.querySelector(`[data-show-group="${key}"]`);
      if (button) {
        button.hidden = !canFilter;
        const others = fits.filter(fit => !fit).length;
        const noun = key === 'ai' ? 'AI tools' : 'tools';
        button.textContent = expanded.has(key) ? `Show only my ${noun}` : `Show other ${noun} (${others})`;
      }
    });
  }
  function renderTailor() {
    const p = profile();
    document.querySelectorAll('[data-when]').forEach(el => {
      const tests = el.dataset.when.split(/\s+/).map(key => WHEN[key]).filter(Boolean);
      el.hidden = tests.length ? !tests.some(test => test(p)) : false;
    });
    applyGroups(p);
    const names = [];
    const PLAT_NAME = { etsy: 'Etsy', amazon: 'Amazon', social: 'Instagram' };
    if (p.platform && p.platform !== 'Other') names.push(PLAT_NAME[p.plat] || p.platform);
    if (p.email && !p.emailOther) names.push(p.outlook ? 'Outlook' : p.email);
    if (p.ai === 'None') names.push('free AI plans');
    else if (p.ai) names.push(p.ai);
    const text = names.length ? `Showing steps for ${joinList(names)}.` : 'Showing steps for the places you ticked.';
    document.querySelectorAll('.hr-tailored').forEach(line => {
      line.hidden = !p.answered;
      const span = line.querySelector('.hr-tailored-text');
      if (span) span.textContent = text;
    });
    const day4 = $('day-text-4');
    if (day4) {
      const where = [];
      if (p.shopify && (p.has('ch-chat') || !p.channels.length)) where.push('Shopify Inbox');
      if (p.google) where.push('Gmail');
      if (p.outlook) where.push('Outlook');
      if (p.has('ch-igdm') || p.plat === 'social') where.push('Instagram');
      if (p.plat === 'etsy') where.push('Etsy');
      else if (p.plat === 'amazon') where.push('Amazon');
      else if (p.has('ch-market')) where.push('Etsy or Amazon');
      const sorter4 = p.outlook ? 'rule' : 'filter';
      day4.textContent = where.length ? `Save your other four replies in ${joinList(where)}, and switch on the Needs a person ${sorter4}.` : day4.dataset.default;
    }
  }

  function refresh(changed) {
    const id = changed ? changed.id : '';
    if (!changed || /^(ch-|q-)/.test(id)) { if (changed) expanded.clear(); renderSetup(); renderTailor(); renderWeek(); }
    if (!changed || id.startsWith('week-')) renderWeek();
    if (!changed || id.startsWith('calc-')) renderCalc();
    if (!changed || changed.dataset.fact) renderFacts();
  }
  refresh();
  syncChips();

  /* First-week plan: copy as text */
  const planButton = $('copy-plan');
  planButton?.addEventListener('click', async () => {
    const lines = ['My plan for next week'];
    document.querySelectorAll('[data-plan]').forEach(input => lines.push(`${input.dataset.plan}: ${input.value.trim() || '(not filled in yet)'}`));
    lines.push('', 'Every day for two weeks: minutes on messages, drafts I had to fix, tricky ones answered late.');
    const text = lines.join('\n');
    const out = $('plan-out');
    try {
      await navigator.clipboard.writeText(text);
      flash(planButton, 'Copied');
    } catch {
      if (out) { out.textContent = text; out.hidden = false; selectNode(out); }
      flash(planButton, 'Selected');
    }
  });

  /* Clear everything saved */
  const clearButton = $('clear-answers');
  const status = $('data-status');
  clearButton?.addEventListener('click', () => {
    if (!clearButton.classList.contains('is-armed')) {
      clearButton.classList.add('is-armed');
      clearButton.textContent = 'Tap again to clear';
      window.clearTimeout(clearButton._timer);
      clearButton._timer = window.setTimeout(() => {
        clearButton.classList.remove('is-armed');
        clearButton.textContent = 'Clear them';
      }, 4000);
      return;
    }
    window.clearTimeout(clearButton._timer);
    store = {};
    try { window.localStorage.removeItem(KEY); } catch { /* nothing stored */ }
    fields.forEach(el => {
      if (el.type === 'checkbox') el.checked = false;
      else el.value = el.defaultValue || '';
    });
    clearButton.classList.remove('is-armed');
    clearButton.textContent = 'Clear them';
    if (status) status.textContent = 'Cleared.';
    refresh();
  });
})();
