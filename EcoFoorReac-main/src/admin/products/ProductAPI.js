export async function fetchProducts(){
  const res = await fetch('/api/products');
  return res.json();
}

export async function createProduct(product){
  const res = await fetch('/api/products', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(product),
  });
  return res.json();
}

export async function updateProduct(id, product){
  const res = await fetch(`/api/products/${id}`, {
    method:'PUT',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(product),
  });
  return res.json();
}

export async function deleteProduct(id){
  await fetch(`/api/products/${id}`,{method:'DELETE'})
}
