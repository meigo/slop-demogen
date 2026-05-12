const valueEl = document.getElementById('value');
const incBtn = document.getElementById('inc');
const resetBtn = document.getElementById('reset');
let n = 0;
const render = () => { valueEl.textContent = String(n); };
incBtn.addEventListener('click', () => { n += 1; render(); });
resetBtn.addEventListener('click', () => { n = 0; render(); });
