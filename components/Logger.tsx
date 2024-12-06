import { useEffect, useState } from 'react';

interface LogEntry {
    message: string;
    timestamp: number;
    type: 'info' | 'error' | 'warning';
}

// 创建一个全局日志存储
const globalLogs: LogEntry[] = [];

// 创建全局日志函数
export const logger = {
    info: (message: string) => {
        const entry = { message, timestamp: Date.now(), type: 'info' as const };
        globalLogs.push(entry);
        console.log(message);
    },
    error: (message: string) => {
        const entry = { message, timestamp: Date.now(), type: 'error' as const };
        globalLogs.push(entry);
        console.error(message);
    },
    warning: (message: string) => {
        const entry = { message, timestamp: Date.now(), type: 'warning' as const };
        globalLogs.push(entry);
        console.warn(message);
    }
};

export function Logger() {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setLogs([...globalLogs]);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed left-4 bottom-4 w-96 max-h-96 overflow-y-auto bg-black/90 text-white p-4 rounded-lg text-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Debug Logs:</h3>
                <button 
                    onClick={() => globalLogs.length = 0}
                    className="px-2 py-1 bg-red-500 rounded text-xs"
                >
                    Clear
                </button>
            </div>
            {logs.map((log, index) => (
                <div 
                    key={index}
                    className={`mb-1 ${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        'text-green-400'
                    }`}
                >
                    <span className="opacity-50 text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    {' '}
                    {log.message}
                </div>
            ))}
        </div>
    );
}