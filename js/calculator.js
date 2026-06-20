(() => {
  const display = document.getElementById('display');
  const keys = document.querySelectorAll('.calc-keys button');
  let current = '';

  function updateDisplay() { display.value = current || '0'; }

  function calculate(expr) {
    try {
      // sanitize expression: allow only digits, operators, decimal, percent
      if (!/^[0-9.+\-*/()%\s]+$/.test(expr)) return 'Error';
      // replace percentage
      expr = expr.replace(/%(?![0-9])/g, '%');
      // evaluate
      // eslint-disable-next-line no-eval
      const result = eval(expr);
      return String(result);
    } catch (e) { return 'Error'; }
  }

  keys.forEach(btn => btn.addEventListener('click', () => {
    const val = btn.getAttribute('data-value');
    const action = btn.getAttribute('data-action');

    if (action === 'clear') { current = ''; updateDisplay(); return; }
    if (action === 'del') { current = current.slice(0, -1); updateDisplay(); return; }
    if (action === 'percent') { current = (current ? String(parseFloat(current) / 100) : '0'); updateDisplay(); return; }
    if (action === 'equals') { current = calculate(current); updateDisplay(); return; }
    if (val) { current = current + val; updateDisplay(); }
  }));

  updateDisplay();
})();
