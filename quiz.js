const ANSWER_KEYS = {
  '16': ['b','c','b','b','b','c','b','c','b','b','c','b'],
  '19': ['b','b','c','b','c','b','c','b','c','b','b','b'],
  '20': ['b','b','b','b','c','b','b','b','b','b','b','b'],
  '21': ['b','b','c','c','c','b','b','b','b','b','b','b'],
};

function updateProgress(ch) {
  const form = document.getElementById('quiz-' + ch);
  if (!form) return;
  const total = ANSWER_KEYS[ch].length;
  const answered = new Set();
  form.querySelectorAll('input[type=radio]:checked').forEach(r => {
    answered.add(r.name);
  });
  const count = answered.size;
  const pct = Math.round((count / total) * 100);
  const fill = document.getElementById('progress-fill-' + ch);
  const label = document.getElementById('progress-label-' + ch);
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = count + ' / ' + total;
}

function submitQuiz(ch) {
  const form = document.getElementById('quiz-' + ch);
  if (!form) return;
  const key = ANSWER_KEYS[ch];
  let score = 0;

  key.forEach((correct, i) => {
    const qNum = i + 1;
    const selected = form.querySelector('input[name="q' + qNum + '"]:checked');
    const options = form.querySelectorAll('label[data-q="' + qNum + '"]');
    options.forEach(lbl => {
      lbl.classList.remove('correct', 'wrong');
    });
    if (selected) {
      const selectedLabel = form.querySelector('label[data-q="' + qNum + '"][data-val="' + selected.value + '"]');
      if (selected.value === correct) {
        score++;
        if (selectedLabel) selectedLabel.classList.add('correct');
      } else {
        if (selectedLabel) selectedLabel.classList.add('wrong');
        const correctLabel = form.querySelector('label[data-q="' + qNum + '"][data-val="' + correct + '"]');
        if (correctLabel) correctLabel.classList.add('correct');
      }
    } else {
      const correctLabel = form.querySelector('label[data-q="' + qNum + '"][data-val="' + correct + '"]');
      if (correctLabel) correctLabel.classList.add('correct');
    }
    form.querySelectorAll('input[name="q' + qNum + '"]').forEach(r => r.disabled = true);
  });

  const total = key.length;
  const pct = Math.round((score / total) * 100);
  const banner = document.getElementById('result-' + ch);
  if (banner) {
    banner.textContent = 'Score: ' + score + ' / ' + total + ' (' + pct + '%)';
    banner.className = 'result-banner ' + (pct >= 70 ? 'pass' : 'fail');
    banner.style.display = 'block';
    banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  const fill = document.getElementById('progress-fill-' + ch);
  const label = document.getElementById('progress-label-' + ch);
  if (fill) fill.style.width = '100%';
  if (label) label.textContent = total + ' / ' + total;
}

function resetQuiz(ch) {
  const form = document.getElementById('quiz-' + ch);
  if (!form) return;
  const key = ANSWER_KEYS[ch];

  form.querySelectorAll('input[type=radio]').forEach(r => {
    r.checked = false;
    r.disabled = false;
  });
  form.querySelectorAll('label.correct, label.wrong').forEach(lbl => {
    lbl.classList.remove('correct', 'wrong');
  });

  const banner = document.getElementById('result-' + ch);
  if (banner) banner.style.display = 'none';

  const fill = document.getElementById('progress-fill-' + ch);
  const label = document.getElementById('progress-label-' + ch);
  if (fill) fill.style.width = '0%';
  if (label) label.textContent = '0 / ' + key.length;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[type=radio]').forEach(r => {
    r.addEventListener('change', () => {
      const ch = r.closest('form') ? r.closest('form').id.replace('quiz-', '') : null;
      if (ch) updateProgress(ch);
    });
  });
});
