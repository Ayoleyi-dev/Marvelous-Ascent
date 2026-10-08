/* Browser-only interactive examples; no analytics events, network calls or real client data. */
(() => {
  'use strict';
  const root = document.getElementById('showcase');
  if (!root) return;
  const scenarios = {
    reporting: {
      title: 'Spend less time combining reports. More time knowing what matters.',
      summary: 'Imagine your weekly work scattered across several sheets. A shared KPI view makes the priorities easier to spot.',
      before: 'Updates in different sheets. Repeated checks. No shared view of what needs attention.',
      after: 'A single overview of progress, pending work and next actions.',
      service: 'services/data-analytics.html', serviceText: 'See how we approach data & reporting',
      appTitle: 'Weekly operations overview', caption: 'A clearer picture of this week',
      kpis: [['Tasks tracked','25'],['Completed','18'],['Need attention','2']],
      chartTitle:'Work at a glance', rows:[['Completed','18',72],['In progress','5',20],['Blocked','2',8]],
      insight:'Review the two blocked tasks and agree who owns the follow-up.',
      update:'Showing a fictional reporting example.'
    },
    automation: {
      title: 'Let routine requests move forward without the constant copying.',
      summary: 'Imagine enquiries arriving in multiple places. A planned routing flow can show which requests are ready and which need a person to review them.',
      before: 'Someone copies each message, updates a tracker and remembers the next reminder.',
      after: 'Each request follows clear capture, review and ownership steps with human checkpoints.',
      service: 'services/workflow-automation.html',serviceText: 'Explore thoughtful workflow automation',
      appTitle:'Request-handling overview',caption:'A sample routing queue — nothing has been sent',
      kpis:[['Requests received','8'],['Ready for owner','6'],['Need review','2']],
      chartTitle:'Example routing stages',rows:[['Ready','6',75],['Needs review','2',25],['Messages sent','0',0]],
      insight:'Give the two flagged requests to a team member before any response is prepared.',
      update:'Showing a fictional automation workflow. No messages are sent.'
    },
    web: {
      title: 'Give visitors an easier way to understand you and reach out.',
      summary: 'An organised website is a welcoming front door. The example below shows three clear page goals, not actual website traffic.',
      before: 'People move between scattered links and struggle to find the next step.',
      after: 'A clear online home helps visitors discover the work, understand the offer and get in touch.',
      service:'services/web-presence.html',serviceText:'See how we build an online home',
      appTitle:'Website journey checklist',caption:'An illustrative digital-presence plan',
      kpis:[['Page goals','3'],['Clear routes','3'],['Live visitors','N/A']],
      chartTitle:'Illustrative page structure',rows:[['Discover','Ready',100],['Explore','Ready',100],['Contact','Ready',100]],
      insight:'Build the first pages around the visitor’s most important questions and next action.',
      update:'Showing a fictional website journey — not measured traffic.'
    }
  };
  const tabs = [...root.querySelectorAll('[role="tab"][data-showcase]')];
  const panel = document.getElementById('showcase-panel');
  const text = (id,value) => { const el=document.getElementById(id); if(el) el.textContent=value; };
  const link = document.getElementById('showcase-service-link');
  const rows = document.getElementById('showcase-chart-rows');
  let active = 'reporting';

  function choose(key, focus) {
    const example=scenarios[key];
    if (!example || !panel) return;
    active=key;
    for(const tab of tabs) {
      const chosen=tab.dataset.showcase===key;
      tab.classList.toggle('is-selected',chosen);
      tab.setAttribute('aria-selected',String(chosen));
      tab.tabIndex=chosen?0:-1;
      if(chosen) {
        panel.setAttribute('aria-labelledby',tab.id);
        if(focus) tab.focus();
      }
    }
    text('showcase-scenario-title',example.title);
    text('showcase-scenario-summary',example.summary);
    text('showcase-before',example.before);
    text('showcase-after',example.after);
    text('showcase-app-title',example.appTitle);
    text('showcase-preview-caption',example.caption);
    text('showcase-chart-title',example.chartTitle);
    text('showcase-update',example.update);
    link.href=example.service;
    link.replaceChildren(document.createTextNode(example.serviceText+' '));
    const arrow=document.createElement('span');arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';link.appendChild(arrow);
    example.kpis.forEach(([label,value],i)=>{
      text('showcase-kpi-label-'+i,label);
      text('showcase-kpi-value-'+i,value);
    });
    rows.replaceChildren();
    for(const [label,value,percentage] of example.rows) {
      const wrapper=document.createElement('div');wrapper.className='showcase-chart-row';
      const caption=document.createElement('span');caption.textContent=label;
      const track=document.createElement('div');track.className='showcase-track';
      const fill=document.createElement('i');fill.style.width=percentage+'%';
      track.appendChild(fill);
      const metric=document.createElement('strong');metric.textContent=value;
      wrapper.append(caption,track,metric);
      rows.appendChild(wrapper);
    }
    const insight=document.getElementById('showcase-insight-text');
    insight.replaceChildren();
    const intro=document.createElement('strong');intro.textContent='A helpful next step: ';
    insight.append(intro,document.createTextNode(example.insight));
  }

  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>choose(tab.dataset.showcase,false));
    tab.addEventListener('keydown',event=>{
      let next=null;
      if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(index+1)%tabs.length;
      else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(index+tabs.length-1)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      if(next===null)return;
      event.preventDefault();
      choose(tabs[next].dataset.showcase,true);
    });
  });
  choose(active,false);
})();
