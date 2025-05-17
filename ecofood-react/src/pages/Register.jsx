import { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    direccion: '',
    comuna: '',
    telefono: '',
    tipoUsuario: 'cliente',
    });

    const [errores, setErrores] = useState({});

    const validarContraseña = (contraseña) => {
    const tieneLongitud = contraseña.length >= 6;
    const tieneLetras = /[a-zA-Z]/.test(contraseña);
    const tieneNumeros = /\d/.test(contraseña);
    return tieneLongitud && tieneLetras && tieneNumeros;
    };

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: value,
    });
    };

    const handleSubmit = (e) => {
    e.preventDefault();

    const nuevosErrores = {};
    if (!formData.nombre) nuevosErrores.nombre = 'El nombre es obligatorio';
    if (!formData.correo) nuevosErrores.correo = 'El correo es obligatorio';
    if (!formData.contraseña) {
        nuevosErrores.contraseña = 'La contraseña es obligatoria';
    } else if (!validarContraseña(formData.contraseña)) {
        nuevosErrores.contraseña = 'Debe tener al menos 6 caracteres, letras y numeros';
    }
    if (!formData.direccion) nuevosErrores.direccion = 'La dirección es obligatoria';
    if (!formData.comuna) nuevosErrores.comuna = 'La comuna es obligatoria';

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length === 0) {
        console.log('Datos validos:', formData);
      //llamar a Firebase
    }
    };

    return (
    <div className="register-container">
        <h2>Registro de Cliente</h2>
        <form onSubmit={handleSubmit}>
        <label>
            Nombre completo:
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
            {errores.nombre && <p className="error">{errores.nombre}</p>}
        </label>

        <label>
            Correo electrónico:
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} />
            {errores.correo && <p className="error">{errores.correo}</p>}
        </label>

        <label>
            Contraseña:
            <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} />
            {errores.contraseña && <p className="error">{errores.contraseña}</p>}
        </label>

        <label>
            Dirección:
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} />
            {errores.direccion && <p className="error">{errores.direccion}</p>}
        </label>

        <label>
            Comuna:
            <input type="text" name="comuna" value={formData.comuna} onChange={handleChange} />
            {errores.comuna && <p className="error">{errores.comuna}</p>}
        </label>

        <label>
            Teléfono (opcional):
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
        </label>

        <label>
            Tipo de usuario:
            <input type="text" name="tipoUsuario" value="cliente" disabled />
        </label>

        <button type="submit">Registrarse</button>
        </form>
    </div>
    );
};

export default Register;
