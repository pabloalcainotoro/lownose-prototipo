'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<any[]>([]);

  // Estados del Formulario de carga/edición
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [maxStock, setMaxStock] = useState(10);
  const [image, setImage] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // Estado para la subida de imagen y base de datos
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const availableSizes = ["S", "M", "L", "XL", "XXL"];

  // 1. Protección estricta de ruta (MANTENIDA)
  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user?.email !== "admin@lownose.cl")) {
      window.location.href = "/login";
    }
  }, [status, session]);

  // 2. Carga directa del catálogo desde SUPABASE (MANTENIDA)
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error("Error cargando productos:", error);
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  // --- FUNCIÓN DE SUBIDA A SUPABASE STORAGE ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      setImage(publicUrlData.publicUrl);
    } catch (error) {
      alert("Error al subir la imagen");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  // ACCIÓN: CREAR O EDITAR PRENDA EN SUPABASE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Lógica de ordenamiento de tallas ---
    const order = ["S", "M", "L", "XL", "XXL"];
    const sortedSizes = [...selectedSizes].sort((a, b) => order.indexOf(a) - order.indexOf(b));

    if (!name || price <= 0 || !image || selectedSizes.length === 0) {
      alert("Por favor completa todos los campos del formulario y selecciona al menos una talla.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingId !== null) {
        const { data, error } = await supabase
          .from('products')
          .update({ name, price: Number(price), maxStock: Number(maxStock), image, sizes: sortedSizes })
          .eq('id', editingId)
          .select();

        if (error) throw error;

        if (data && data[0]) {
          setProducts(products.map(p => p?.id === editingId ? data[0] : p));
        } else {
          window.location.reload();
        }
        setEditingId(null);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([{ name, price: Number(price), maxStock: Number(maxStock), image, sizes: sortedSizes }])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          setProducts([...products, data[0]]);
        } else {
          window.location.reload();
        }
      }

      setName(''); setPrice(0); setMaxStock(10); setImage(''); setSelectedSizes([]);
    } catch (error: any) {
      console.error("Error detallado al guardar:", error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
    setMaxStock(product.maxStock || 10);
    setImage(product.image);

    // --- Ordenar tallas al cargar edición ---
    const order = ["S", "M", "L", "XL", "XXL"];
    const sorted = [...(product.sizes || [])].sort((a, b) => order.indexOf(a) - order.indexOf(b));
    setSelectedSizes(sorted);
  };

  // --- FUNCIÓN DE ELIMINACIÓN (SIMPLIFICADA POR TRIGGER SQL) ---
  const deleteProduct = async (product: any) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto y su imagen?")) {
      try {
        // 1. Eliminar el archivo del Storage usando la API oficial
        const fileName = product.image.split('/').pop();
        if (fileName) {
          const { error: storageError } = await supabase.storage
            .from('products')
            .remove([fileName]);

          if (storageError) throw storageError;
        }

        // 2. Eliminar el registro de la base de datos
        const { error: dbError } = await supabase.from('products').delete().eq('id', product.id);
        if (dbError) throw dbError;

        setProducts(products.filter(p => p?.id !== product.id));
      } catch (error: any) {
        console.error("Error eliminando producto:", error);
        alert(`Error al eliminar: ${error.message}`);
      }
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm font-black uppercase tracking-widest animate-pulse">
          Verificando credenciales de administrador...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Panel de Administración</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="bg-neutral-50 dark:bg-neutral-950 p-6 border border-gray-100 dark:border-neutral-900 h-fit">
          <h2 className="text-md font-black uppercase tracking-wider mb-4 text-neutral-400">
            {editingId ? "Modificar Ítems" : "Añadir al Catálogo"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Nombre de la Prenda</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 p-2 text-sm text-black dark:text-white focus:outline-none" placeholder="Ej: Oversized Hoodie Black" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Precio (CLP)</label>
              <input type="number" value={price || ''} onChange={(e) => setPrice(Number(e.target.value))} className="w-full bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 p-2 text-sm text-black dark:text-white focus:outline-none" placeholder="35000" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Stock Máximo</label>
              <input type="number" value={maxStock || ''} onChange={(e) => setMaxStock(Number(e.target.value))} className="w-full bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 p-2 text-sm text-black dark:text-white focus:outline-none" placeholder="10" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Subir Imagen desde PC</label>
              <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading || isSaving} className="w-full text-xs text-neutral-500" />
              {uploading && <p className="text-[10px] animate-pulse mt-1">Subiendo a la nube...</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">URL de la Imagen</label>
              <input type="text" value={image} onChange={(e) => setImage(e.target.value)} className="w-full bg-white dark:bg-black border border-gray-200 dark:border-neutral-800 p-2 text-sm text-black dark:text-white focus:outline-none" placeholder="https://images.unsplash.com/..." />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Curva de Tallas Disponibles</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => {
                  const isChecked = selectedSizes.includes(size);
                  return (
                    <button type="button" key={size} onClick={() => handleSizeToggle(size)} className={`w-10 h-10 text-xs font-bold border transition-colors cursor-pointer ${isChecked ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'border-gray-200 dark:border-neutral-800 text-gray-400'}`}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex space-x-2">
              <button type="submit" disabled={uploading || isSaving} className={`flex-1 py-3 font-bold uppercase text-xs tracking-widest transition-opacity cursor-pointer ${(uploading || isSaving) ? 'bg-gray-400' : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-80'}`}>
                {isSaving ? "Guardando..." : (uploading ? "Subiendo..." : (editingId ? "Guardar Cambios" : "Publicar Prenda"))}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setName(''); setPrice(0); setMaxStock(10); setImage(''); setSelectedSizes([]); }} className="border border-red-500 text-red-500 px-4 py-2 text-xs font-bold uppercase cursor-pointer">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-md font-black uppercase tracking-wider mb-4 text-neutral-400">
            Inventario Activo ({products.filter(Boolean).length})
          </h2>

          <div className="border border-gray-100 dark:border-neutral-900 divide-y divide-gray-100 dark:divide-neutral-900">
            {products.length === 0 ? (
              <p className="p-8 text-center text-sm text-neutral-400">El catálogo está vacío.</p>
            ) : (
              products.map((product) => {
                if (!product) return null;
                return (
                  <div key={product.id} className="p-4 flex items-center justify-between bg-neutral-50/40 dark:bg-neutral-950/20">
                    <div className="flex items-center space-x-4">
                      <img src={product.image} alt={product.name} className="w-14 h-14 object-cover border border-neutral-200 dark:border-neutral-800" />
                      <div>
                        <h4 className="font-bold text-sm text-black dark:text-white">{product.name}</h4>
                        <p className="text-xs text-neutral-500 font-mono">
                          ${product.price?.toLocaleString('es-CL')} | Stock: {product.maxStock || 0}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.sizes?.map((s: string) => (
                            <span key={s} className="bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 text-[9px] font-mono rounded font-bold text-neutral-700 dark:text-neutral-300">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => startEdit(product)} className="px-3 py-1.5 text-xs uppercase font-bold bg-neutral-200 dark:bg-neutral-800 hover:opacity-80 text-black dark:text-white transition-opacity cursor-pointer">Editar</button>
                      <button onClick={() => deleteProduct(product)} className="px-3 py-1.5 text-xs uppercase font-bold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer">Eliminar</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}