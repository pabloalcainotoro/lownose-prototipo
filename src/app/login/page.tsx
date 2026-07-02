'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CHILE_DATA } from "@/utils/chile"; 

export default function LoginPage() {
  const [session, setSession] = useState<any>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para Edición de Perfil
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ 
    name: '', address: '', phone: '', region: '', comuna: '', postalCode: '' 
  });

  const [showRegionList, setShowRegionList] = useState(false);
  const [showComunaList, setShowComunaList] = useState(false);

  // Cargar sesión y perfil desde Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    
    if (error) {
      console.error("Error al cargar perfil desde Supabase:", error);
      return;
    }

    if (data) {
      setProfile({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        region: data.region || '',
        comuna: data.comuna || '',
        postalCode: data.postal_code || ''
      });
    }
  };

  const handleSaveProfile = async () => {
    const payload = {
      id: session.user.id,
      name: profile.name || null,
      address: profile.address || null,
      phone: profile.phone || null,
      region: profile.region || null,
      comuna: profile.comuna || null,
      postal_code: profile.postalCode || null
    };

    const { error } = await supabase.from('profiles').upsert(payload);

    if (error) {
      console.error("Error crítico al actualizar perfil en Supabase:", error);
      alert(`Error al guardar perfil: ${error.message}`);
    } else { 
      alert("Perfil actualizado correctamente"); 
      setIsEditing(false); 
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) setError(error.message);
    else setSuccess("Cuenta creada. Por favor verifica tu correo si es necesario.");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Credenciales incorrectas.");
    else window.location.reload();
  };

  if (session) {
    const isAdmin = session.user?.email === "admin@lownose.cl";

    // Ordenamos las regiones alfabéticamente
    const sortedRegions = Object.keys(CHILE_DATA).sort((a, b) => a.localeCompare(b));
    
    // Ordenamos las comunas de la región seleccionada alfabéticamente
    const sortedComunas = profile.region ? [...(CHILE_DATA[profile.region] || [])].sort((a, b) => a.localeCompare(b)) : [];

    return (
      <div className="max-w-md mx-auto py-24 px-4">
        <h2 className="text-2xl font-black uppercase tracking-wider mb-2">¡Hola, {session.user?.user_metadata.name || 'Usuario'}!</h2>
        
        <div className="bg-neutral-50 dark:bg-neutral-950 p-6 border border-gray-100 dark:border-neutral-900 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Información de Perfil</h3>
          <div className="space-y-4">
            {['name', 'address', 'postalCode', 'phone'].map((key) => (
              <div key={key}>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">
                  {key === 'postalCode' ? 'Código Postal' : key === 'name' ? 'Nombre' : key === 'address' ? 'Dirección' : 'Teléfono'}
                </label>
                <input
                  type="text"
                  value={profile[key as keyof typeof profile] || ''}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, [key]: e.target.value})}
                  className={`w-full bg-transparent border-b ${isEditing ? 'border-black dark:border-white' : 'border-transparent'} py-1 text-sm outline-none`}
                />
              </div>
            ))}

            {/* Región con opción de limpiar selección */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Región</label>
              <input readOnly value={profile.region || ''} onClick={() => isEditing && setShowRegionList(!showRegionList)} className="w-full bg-transparent border-b py-1 text-sm outline-none cursor-pointer" placeholder="Seleccionar Región..." />
              {showRegionList && isEditing && (
                <div className="absolute z-50 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-h-40 overflow-y-auto mt-1 shadow-lg">
                  <div className="p-2 text-xs uppercase cursor-pointer text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold border-b border-neutral-100 dark:border-neutral-800" onClick={() => { setProfile({...profile, region: '', comuna: ''}); setShowRegionList(false); }}>
                    -- Ninguna / Limpiar --
                  </div>
                  {sortedRegions.map(r => (
                    <div key={r} className="p-2 text-xs uppercase cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { setProfile({...profile, region: r, comuna: ''}); setShowRegionList(false); }}>
                      {r}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comuna con opción de limpiar selección */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Comuna</label>
              <input readOnly value={profile.comuna || ''} onClick={() => isEditing && profile.region && setShowComunaList(!showComunaList)} className="w-full bg-transparent border-b py-1 text-sm outline-none cursor-pointer" placeholder={profile.region ? "Seleccionar Comuna..." : "Selecciona una región primero"} />
              {showComunaList && isEditing && profile.region && (
                <div className="absolute z-50 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-h-40 overflow-y-auto mt-1 shadow-lg">
                  <div className="p-2 text-xs uppercase cursor-pointer text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-bold border-b border-neutral-100 dark:border-neutral-800" onClick={() => { setProfile({...profile, comuna: ''}); setShowComunaList(false); }}>
                    -- Ninguna / Limpiar --
                  </div>
                  {sortedComunas.map(c => (
                    <div key={c} className="p-2 text-xs uppercase cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { setProfile({...profile, comuna: c}); setShowComunaList(false); }}>
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className="mt-6 text-xs font-bold uppercase tracking-widest underline cursor-pointer">
            {isEditing ? "Guardar Cambios" : "Editar Perfil"}
          </button>
        </div>

        {isAdmin && <a href="/admin" className="block text-center bg-amber-600 text-white py-3 mb-4 text-xs font-bold uppercase">Ir al Panel de Admin →</a>}
        <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="w-full bg-black text-white dark:bg-white dark:text-black py-3 text-xs font-bold uppercase">Cerrar Sesión</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-24 px-4">
      <div className="flex justify-center space-x-8 mb-8">
        <button onClick={() => setIsRegistering(false)} className={`text-lg uppercase font-black ${!isRegistering ? 'border-b-2 border-black dark:border-white' : 'text-gray-400'}`}>Entrar</button>
        <button onClick={() => setIsRegistering(true)} className={`text-lg uppercase font-black ${isRegistering ? 'border-b-2 border-black dark:border-white' : 'text-gray-400'}`}>Crear Cuenta</button>
      </div>
      <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4 bg-neutral-50 dark:bg-neutral-950 p-6 border border-gray-100 dark:border-neutral-900">
        {error && <p className="text-red-600 text-xs p-2 bg-red-100">{error}</p>}
        {success && <p className="text-green-600 text-xs p-2 bg-green-100">{success}</p>}
        {isRegistering && <input type="text" required placeholder="Nombre" className="w-full border p-2 text-sm" onChange={(e) => setName(e.target.value)} />}
        <input type="email" required placeholder="Correo" className="w-full border p-2 text-sm" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Contraseña" className="w-full border p-2 text-sm" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black py-3 font-bold uppercase text-xs">{isRegistering ? "Registrarme" : "Iniciar Sesión"}</button>
      </form>
    </div>
  );
}