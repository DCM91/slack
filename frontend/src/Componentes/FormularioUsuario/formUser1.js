import React from "react";
import {useForm} from "react-hook-form"
import { useNavigate } from "react-router-dom";
import styles from "./formUser.module.css"
import { postToMongo } from "../../utils/fetchToMongo.js";

const FormUser1 = () =>{
    
 const navigate = useNavigate();
 const { register, handleSubmit, formState:{errors}} = useForm()
 const onDataSubmit2 = (data) => {
  
    postToMongo("user", data).then((dataServer) => {
        alert(`el usuario ${dataServer.userName} ha sido creado.`)
        //navigate(`/user/${dataServer._id}`)
     })
 }
    return (
        <>
        <div className={styles.title}>
        <h1>Bienvenido a SkuadLack </h1>
        </div>
        <form className={styles.card} onSubmit={handleSubmit(onDataSubmit2)}>
            <h3>Rellena el siguiente campo con tu nombre usuario, este sera el visible</h3>
            <input placeholder='Nombre de Usuario.' {...register("userName" , {required: true})} />
            {errors.userName && <span>❌campo obligatorio❗❗</span>}
            <h3>Rellena el siguiente campo con tu email</h3>
            <input placeholder='email.' {...register("email" , {required: true})} />
            {errors.email && <span>❌campo obligatorio❗❗</span>}
            <h3>Rellena el siguiente campo con tu nombre</h3>
            <input placeholder='Nombre.' {...register("name" , {required: true})} />
            {errors.name && <span>❌campo obligatorio❗❗</span>}
            <h3>Rellena el siguiente campo con tu apellido</h3>
            <input placeholder='Apellido.' {...register("lastName" , {required: true})} />
            {errors.lastName && <span>❌campo obligatorio❗❗</span>}
            <h3>Define una contraseña guapa</h3>
            <input placeholder='password' {...register("password" , {required: true})} />
            {errors.password && <span>❌campo obligatorio❗❗</span>}
            <br/>
            <input type="submit"/>
        </form>
        </>

    )
}

export default FormUser1;