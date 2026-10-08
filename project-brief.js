// Guided project brief: browser-only, with review and explicit mailto handoff.
// No form details are sent to Marvelous Ascent until the visitor sends the email.
(() => {
  const form = document.getElementById('project-brief-form');
  if (!form) return;
  const steps = [...form.querySelectorAll('.warm-intake-step')];
  const indicators = [...document.querySelectorAll('.warm-progress-dot')];
  const progress = document.getElementById('brief-progress');
  const label = document.getElementById('brief-step-label');
  const back = document.getElementById('brief-back');
  const next = document.getElementById('brief-next');
  const send = document.getElementById('brief-send');
  const error = document.getElementById('brief-error');
  const review = document.getElementById('brief-review');
  const titles = ['A little about you', 'What you need help with', 'Review your details'];
  let active = 0;

  function showStep(index) {
    active = index;
    steps.forEach((section, i) => { section.hidden = i !== index; });
    indicators.forEach((indicator, i) => indicator.classList.toggle('is-active', i <= index));
    progress.setAttribute('aria-valuenow', String(index + 1));
    label.textContent = 'Step ' + (index + 1) + ' of 3 · ' + titles[index];
    back.hidden = index === 0;
    next.hidden = index === 2;
    send.hidden = index !== 2;
    error.textContent = '';
  }
  function validate(index) {
    const controls = [...steps[index].querySelectorAll('input,select,textarea')];
    for (const control of controls) {
      if (!control.checkValidity()) {
        control.reportValidity();
        error.textContent = 'Please check this field before continuing.';
        return false;
      }
    }
    return true;
  }
  const fields = [
    ['Name','name'],
    ['Email','email'],
    ['Business','company'],
    ['Location','country'],
    ['Service area','service'],
    ['What you need','challenge'],
    ['Current tools','tools'],
    ['Timeline','timing'],
    ['Budget indication','budget']
  ];
  function collect() {
    const values = new FormData(form);
    return fields.map(([name,key]) => [name, String(values.get(key) || '').trim() || 'Not provided']);
  }
  function renderReview() {
    review.replaceChildren();
    for (const [title,value] of collect()) {
      const wrapper = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = title;
      dd.textContent = value;
      wrapper.append(dt,dd);
      review.appendChild(wrapper);
    }
  }
  back.addEventListener('click', () => showStep(Math.max(active - 1,0)));
  next.addEventListener('click', () => {
    if (!validate(active)) return;
    if (active === 1) renderReview();
    showStep(Math.min(active + 1,2));
    label.scrollIntoView({behavior:'auto',block:'center'});
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!validate(0) || !validate(1)) {
      showStep(1);
      error.textContent = 'Please check the earlier fields before preparing the email.';
      return;
    }
    const values = collect();
    const company = String(new FormData(form).get('company') || '').trim();
    const subject = 'Project enquiry — ' + (company || 'new project');
    const body = [
      'Hello Marvelous Ascent,',
      '',
      'Here is a little about what I need:',
      '',
      ...values.map(([name,value]) => name + ': ' + value),
      '',
      'I would love to discuss a practical next step.',
      '',
      'Thank you.'
    ].join('\n');
    if (body.length > 3500) {
      error.textContent = 'The project brief is too long for an email draft. Please shorten your description.';
      return;
    }
    const url = 'mailto:meet.ayoleyi@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = url;
    error.textContent = 'Your email app should open now. Please review the draft and press Send there.';
  });
  showStep(0);
})();
