import express from "express";
import Chat from "../Schemas/chat.js";
const routerChat = express.Router();
import { jwtMiddleware } from "../Middlewares/jwtMiddleware.js";

//Crear un chat asociado a un usuario y organización
routerChat.post("/createChat", jwtMiddleware, async (req, res) => {
  //Solo puedo crear un chat si he hecho login. En el key de token tengo el id de usuario

  //El id de organzación y fecha es necesario mandarlo con el body
  const idOrganizacion = req.body.organizacion;
  const creationDate = req.body.creationDate;

  //El middleware devuelve el jwtPayload con los datos del payload
  const idUser = req.jwtPayload.id;


  try {
    const chat = new Chat(req.body);

    //La forma de asignar el idOrganización es mediante una equivalencia cuando son dependencias 1 a N (sin array en el schema de Chat)
    chat.organizacion = idOrganizacion;

    //Esta es la forma de añadir usuarios al chat cuando son equivalencias N a N
    chat.user.push(idUser);

    await chat.save();
   
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Listar todos los chats
routerChat.get("/allChats", jwtMiddleware, async (req, res) => {
  try {
    const allChats = await Chat.find();
    res.status(200).json(allChats);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Consultar solo un chat
routerChat.get("/chat/:idChat", jwtMiddleware, async (req, res) => {
  const idChat = req.params.idChat;

  try {
    const chat = await Chat.findById(idChat);
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Añadir user al chat en el cual siempre ya hay mínimo un usuario añadido que es el que crea el chat
routerChat.patch("/addUserChat/:idChat", jwtMiddleware, async (req, res) => {
  const idNewUser = req.body.user;
  const idChat = req.params.idChat;

  try {
    // comprobamos que el chat nos lo pasan por parametro de la url
    if (!idChat) return res.status(404).json("IdChat no existe");
    // si el chat existe lo buscamos en la base de datos y lo metemos en la variable chatModified
    const chatModified = await Chat.findById(idChat);

    //Validar que el usuario no está registrado ya
    const existingUser = await Chat.findOne({ _id: idChat, user: idNewUser });

    if (existingUser)
      return res.status(404).json("El usuario ya existe en el chat");

    chatModified.user.push(idNewUser);

    await chatModified.save();

    res.status(200).json(chatModified);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Eliminar un chat al completo
routerChat.delete("/deleteChat/:idChat", jwtMiddleware, async (req, res) => {
  const idChat = req.params.idChat;

  try {
    const chatDelete = await Chat.findByIdAndDelete(idChat);
    res.status(204).json("Chat eliminado");
  } catch (error) {
    res.status(500).json(error);
  }
});

//Eliminar un usuario del chat
routerChat.patch("/deleteUserFromChat/:idChat",  jwtMiddleware, async (req, res) => {
    const idUserToDelete = req.body.user;
    const idChat = req.params.idChat;

    try {
      // comprobamos que el chat nos lo pasan por parametro de la url
      if (!idChat) return res.status(404).json("IdChat no está informado en los params");

      // si el chat existe lo buscamos en la base de datos y lo metemos en la variable chatModified
      const chatFound = await Chat.findById(idChat);

      if (!chatFound) return res.status(404).json("Chat no encontrado");

      //Buscamos el índice del usuario dentro de la matriz user que está dentro del objeto del schema correspondiente al chat
      const deleteUserIndex = chatFound.user.indexOf(idUserToDelete);
      //Si el indexOf es -1 quiere decir que no encuentra el resultado
      if (deleteUserIndex === -1) return res.status(404).json("Usuario no encontrado en el chat");

      //Eliminar el usuario en función del índice encontrado. El método splice devuelve el usuario eliminado y altera la matriz que se utiliza el splice
      const deleteUser = chatFound.user.splice(deleteUserIndex, 1);
  
      await chatFound.save();

      res.status(200).json(chatFound);

    } catch (error) {
      res.status(500).json(error);
    }
  }
);

//MÉTODO AGRUPADO DE AÑADIR Y QUITAR USUARIOS MEDIANTE QUERY PARAMS
routerChat.patch("/modifyUser/:idChat?",  jwtMiddleware, async (req, res) => {
  //Definición del query params:
  //method = a --> add users
  //method = d --> deleter users
  //user = 'id' --> usuario a eliminar/añadir
  //ejemplo query params --> /modifyUser/:idChat?method=a&user=idUser


  const method = req.query.method;
  const idUser = req.query.user;
  const idChat = req.params.idChat;

  if (!method) return res.status(404).json('Método no informado en la llamada')
  if (method !=='a' && method !== 'd') return res.status(404).json('Método con variables incorrectas. Tienen que ser a ó d')

  if (method === 'd'){

  try {
    // comprobamos que el chat nos lo pasan por parametro de la url
    if (!idChat) return res.status(404).json("IdChat no está informado en los params");

    // si el chat existe lo buscamos en la base de datos y lo metemos en la variable chatModified
    const chatFound = await Chat.findById(idChat);

    if (!chatFound) return res.status(404).json("Chat no encontrado");

    //Buscamos el índice del usuario dentro de la matriz user que está dentro del objeto del schema correspondiente al chat
    const deleteUserIndex = chatFound.user.indexOf(idUser);
    //Si el indexOf es -1 quiere decir que no encuentra el resultado
    if (deleteUserIndex === -1) return res.status(404).json("Usuario no encontrado en el chat");

    //Eliminar el usuario en función del índice encontrado. El método splice devuelve el usuario eliminado y altera la matriz que se utiliza el splice
    const deleteUser = chatFound.user.splice(deleteUserIndex, 1);

    await chatFound.save();

    res.status(200).json(chatFound);

  } catch (error) {
    res.status(500).json(error);
  }


} else if(method === 'a') {

    try {
      // comprobamos que el chat nos lo pasan por parametro de la url
      if (!idChat) return res.status(404).json("IdChat no existe");
      // si el chat existe lo buscamos en la base de datos y lo metemos en la variable chatModified
      const chatModified = await Chat.findById(idChat);
  
      console.log("chatModificado", chatModified);
  
      //Validar que el usuario no está registrado ya
      const existingUser = await Chat.findOne({ _id: idChat, user: idUser });
  
      if (existingUser) return res.status(404).json("El usuario ya existe en el chat");
  
      chatModified.user.push(idUser);
  
      await chatModified.save();
  
      res.status(200).json(chatModified);
    } catch (error) {
      res.status(500).json(error);
    }


}else{
  return res.status(400).json('Method not found')
}


});


export default routerChat;
