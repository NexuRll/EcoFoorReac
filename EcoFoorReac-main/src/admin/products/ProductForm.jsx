import { useState } from 'react';
import { createProduct } from './ProductAPI';
import { useNavigate } from 'react-router-dom';

export default function ProductForm() {
  const [form, setForm] = useState({
    nombre: '', descripcion: '', vencimiento: '', cantidad: 0, precio: 0, empresaId: '', estado: 'disponible'
  });
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await createProduct(form);
    navigate('/admin/products');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Agregar Producto</h2>
      {["nombre", "descripcion", "vencimiento", "cantidad", "precio", "empresaId", "estado"].map(campo => (
        <div key={campo}>
          <label>{campo}</label>
          <input name={campo} value={form[campo]} onChange={handleChange} />
        </div>
      ))}
      <button type="submit">Guardar</button>
    </form>
  );
}
