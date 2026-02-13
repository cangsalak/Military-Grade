import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getTimeAgo = (date: string) => {
    const d = new Date(date);
    if (d.getTime() === 0 || isNaN(d.getTime())) return 'ไม่เคย';
    const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
    if (seconds < 60) return `${seconds} วินาทีที่แล้ว`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} นาทีที่แล้ว`;
    return d.toLocaleTimeString('th-TH');
};
