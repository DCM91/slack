import { Server } from 'socket.io';
import {server} from '../index.js'


// Creamos el servidor de socket

export const SupremeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
        },
    });

    // Manejamos los eventos de conexión de sockets

    io.on('connection', (socket) => {
        console.log('Usuario conectado al socket: ' + socket.id)

        // El usuario se une al canal "public" al conectarse



        // Emitimos un mensaje a todos los usuarios cuando alguien se conecta

        io.emit('userConect', {
            from: 'server',
            message: 'Usuario conectado',
            room: 'public'
        })


        // Manejamos el evento "chat", que se dispara cuando un usuario envía un mensaje

        socket.on('chat', (data) => {
            console.log('eto e un DATA', data);
            // Enviamos el mensaje a todos los sockets que estén en la misma sala (room)

            socket.to(data.room).emit('reply', {
                from: data.from,
                message: data.message,
                room: data.room

            })
        })

        // Manejamos el evento "joinRoom", que se dispara cuando un usuario se une a una sala
        socket.on('leave', (data) => {
            console.log(`El cliente ${socket.id} ha abandonado la sala ${data}`);
            socket.leave(data);
        });

        socket.on('joinRoom', (data) => {
            console.log(`El cliente ${socket.id} ha entrado la sala ${data}`);
            socket.join(data)

        })
    })

    io.on('disconnect', () => {
        console.log('usuario desconectado');
    })

   
};