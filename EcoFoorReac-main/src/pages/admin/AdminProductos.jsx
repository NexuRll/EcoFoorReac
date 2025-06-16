import { useEffect, useState } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import dayjs from 'dayjs';

export default function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ nombre: '', descripcion: '', vencimiento: '', empresaId: '' });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    const querySnapshot = await getDocs(collection(db, 'productos'));
    const docs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      vencimiento: doc.data().vencimiento?.toDate?.() || new Date()
    }));
    setProductos(docs);
  };

  const manejarCambio = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const productoVencido = (fecha) => dayjs(fecha).isBefore(dayjs(), 'day');
  const porVencer = (fecha) => dayjs(fecha).diff(dayjs(), 'day') <= 3 && !productoVencido(fecha);

  const manejarSubmit = async e => {
    e.preventDefault();
    const fecha = dayjs(form.vencimiento);
    if (fecha.isBefore(dayjs(), 'day')) {
      return setMensaje('No se puede agregar un producto vencido.');
    }

    const datos = {
      ...form,
      vencimiento: Timestamp.fromDate(new Date(form.vencimiento)),
    };

    try {
      if (editId) {
        await updateDoc(doc(db, 'productos', editId), datos);
        setMensaje('Producto actualizado correctamente.');
      } else {
        await addDoc(collection(db, 'productos'), datos);
        setMensaje('Producto agregado correctamente.');
      }
      setForm({ nombre: '', descripcion: '', vencimiento: '', empresaId: '' });
      setEditId(null);
      obtenerProductos();
    } catch (error) {
      console.error(error);
      setMensaje('Error al guardar producto.');
    }
  };

  const manejarEliminar = async id => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      await deleteDoc(doc(db, 'productos', id));
      obtenerProductos();
    }
  };

  const manejarEditar = producto => {
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      vencimiento: dayjs(producto.vencimiento).format('YYYY-MM-DD'),
      empresaId: producto.empresaId || '',
    });
    setEditId(producto.id);
  };

  return (
    <div>
      <h2>Gestión de Productos</h2>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <form onSubmit={manejarSubmit} className="mb-4">
        <input type="text" name="nombre" placeholder="Nombre" value={form.nombre} onChange={manejarCambio} className="form-control mb-2" required />
        <input type="text" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={manejarCambio} className="form-control mb-2" />
        <input type="date" name="vencimiento" value={form.vencimiento} onChange={manejarCambio} className="form-control mb-2" required />
        <input type="text" name="empresaId" placeholder="Empresa ID" value={form.empresaId} onChange={manejarCambio} className="form-control mb-2" />

        <button className="btn btn-success" type="submit">{editId ? 'Actualizar' : 'Agregar'} Producto</button>
        {editId && <button className="btn btn-secondary ms-2" type="button" onClick={() => { setEditId(null); setForm({ nombre: '', descripcion: '', vencimiento: '', empresaId: '' }); }}>Cancelar</button>}
      </form>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Vencimiento</th>
            <th>Empresa ID</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id}>
              <td>{p.nombre}</td>
              <td>{p.descripcion}</td>
              <td>{dayjs(p.vencimiento).format('YYYY-MM-DD')}</td>
              <td>{p.empresaId}</td>
              <td>
                {productoVencido(p.vencimiento) ? (
                  <span className="badge bg-danger">Vencido</span>
                ) : porVencer(p.vencimiento) ? (
                  <span className="badge bg-warning text-dark">Por vencer</span>
                ) : (
                  <span className="badge bg-success">Vigente</span>
                )}
              </td>
              <td>
                <button onClick={() => manejarEditar(p)} className="btn btn-sm btn-primary me-1">Editar</button>
                <button onClick={() => manejarEliminar(p.id)} className="btn btn-sm btn-danger">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
