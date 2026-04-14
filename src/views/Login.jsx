import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/login/FormularioLogin";
import { supabase } from "../database/supabaseconfig";

const Login = () => {
    const [usuario, setUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState(null);
    const navegar = useNavigate();

    const registrarUsuario = async () => {
        const { data, error } = await supabase.auth.signUp({
            email: "dev51unan@gmail.com",
            password: "123456",
        });

        console.log("REGISTRO:", data, error);
    };

    const iniciarSesion = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: usuario,
                password: contrasena,
            });

            if (error) {
                console.log("ERROR REAL:", error);
                setError(error.message);
                return;
            }

            if (data.user) {
                localStorage.setItem("usuario-supabase", usuario);
                navegar("/");
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
            console.error("Error en la solicitud:", err);
        }
    };

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem("usuario-supabase");
        if (usuarioGuardado) {
            navegar("/");
        }
    }, [navegar]);

    useEffect(() => {
        registrarUsuario();
    }, []);

    return (
        <div className="contenedor-login">
            <FormularioLogin
                usuario={usuario}
                setUsuario={setUsuario}
                contrasena={contrasena}
                setContrasena={setContrasena}
                iniciarSesion={iniciarSesion}
                error={error}
            />
        </div>
    );

};


export default Login;