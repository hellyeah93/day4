import type { Task, Countdown } from './types';
import { dayDiff, isoDate } from './dates';
let lastBriefingDate = '';
export async function notify(title:string,body:string) {
  if (typeof window !== 'undefined' && window.dayzeroDesktop) { try { await window.dayzeroDesktop.notify({title,body}); return; } catch {} }
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title,{body});
  }
}
export async function requestNotificationPermission() {
  if (typeof window !== 'undefined' && window.dayzeroDesktop) return true;
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return (await Notification.requestPermission()) === 'granted';
  }
  return false;
}
export function scheduleDailyBriefing(time:string, enabled:boolean, tasks:Task[], countdowns:Countdown[], tone:string) {
  if (!enabled) return;
  const now=new Date(); const [hh,mm]=time.split(':').map(Number); const due=new Date(now); due.setHours(hh||8,mm||0,0,0);
  if (due<=now || lastBriefingDate===isoDate(now)) return;
  const ms=due.getTime()-now.getTime();
  window.setTimeout(async()=>{
    lastBriefingDate=isoDate(new Date());
    const today=isoDate(new Date()); const todays=tasks.filter(t=>t.startDate<=today&&t.endDate>=today); const overdue=tasks.filter(t=>t.deadline&&t.deadline<today&&t.completedDates.length===0);
    const event=countdowns.filter(c=>c.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];
    let body='No tasks planned yet. Open the planner and define today’s mission.';
    if(overdue.length) body=`${overdue.length} task(s) are overdue. Your schedule won't fix itself. Start with the next action.`;
    else if(todays.length) body=`${todays.length} task(s) on today's plan. ${tone==='motivational'?'Small progress compounds.':tone==='disciplined'?'Focus on execution, not negotiation.':'Mission brief ready. Execute the plan.'}${event?` ${dayDiff(today,event.date)} days to ${event.title}.`:''}`;
    else if(event) body=`${dayDiff(today,event.date)} days to ${event.title}. Set today's mission before the day runs away.`;
    await notify('DAYZERO | DAILY BRIEFING',body);
  }, Math.min(ms, 2147480000));
}
export function scheduleTaskReminders(tasks:Task[], enabled:boolean) {
  if (!enabled) return;
  const today=isoDate(new Date());
  const overdue=tasks.filter(t=>t.deadline&&t.deadline<today&&t.completedDates.length===0);
  if(overdue.length && sessionStorage.getItem('dayzero-overdue-'+today)!=='1') { sessionStorage.setItem('dayzero-overdue-'+today,'1'); void notify('DAYZERO | OVERDUE',`${overdue.length} unfinished task(s) are past their deadline. Review and reschedule them.`); }
}
