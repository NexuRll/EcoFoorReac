import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateProduct, fetchProducts } from './ProductAPI';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProducts().then(data => {
      const prod = data.find(p => p.id === id || p._id === id);
      setProduct(prod);
    });
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await updateProduct(id, product);
    navigate('/admin/products');
  };

  if (!product) return <p>Cargando...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <h2>Editar Producto</h2>
      {Object.keys(product).map(key => (
        <div key={key}>
          <label>{key}</label>
          <input name={key} value={product[key]} onChange={handleChange} />
        </div>
      ))}
      <button type="submit">Actualizar</button>
    </form>
  );
}
