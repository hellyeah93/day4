/// <reference types="vite/client" />
interface Window { dayzeroDesktop?: { notify: (payload: { title: string; body: string }) => Promise<boolean> } }
