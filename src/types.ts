export type Task = {
  id: string; title: string; description: string; startDate: string; endDate: string;
  deadline: string; priority: 'low' | 'normal' | 'high'; completedDates: string[];
  createdAt: number; updatedAt: number; recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
};
export type Countdown = { id: string; title: string; date: string; startDate: string; tone: 'tactical' | 'disciplined' | 'motivational' };
export type AppData = { tasks: Task[]; countdowns: Countdown[]; rangeStart: string; rangeEnd: string; reminderTime: string; remindersEnabled: boolean; tone: Countdown['tone'] };
