import ioClient from 'socket.io-client';

const socket = ioClient(import.meta.env.VITE_BACKEND_URL);

export const io = socket;