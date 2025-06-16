import { useEffect, useState } from 'react';
import { fetchProducts, deleteProduct } from './ProductAPI';
import { Link } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const handleDelete = async (id) => {
    if (confirm("¿Estás seguro de borrar este producto?")) {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="container">
      <h2>Lista de Productos</h2>
      <Link to="/admin/products/add">Agregar Producto</Link>
      <table>
        <thead>
          <tr>
            <th>Nombre</th><th>Precio</th><th>Cantidad</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.precio}</td>
              <td>{p.cantidad}</td>
              <td>
                <Link to={`/admin/products/edit/${p.id}`}>Editar</Link>
                <button onClick={() => handleDelete(p.id)}>Borrar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
