'use client';

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { CHILE_DATA } from "@/utils/chile"; 

export default function LoginPage() {
  const { data: session } = useSession();
  
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

  // Estados para los dropdowns visuales
  const [showRegionList, setShowRegionList] = useState(false);
  const [showComunaList, setShowComunaList] = useState(false);

  useEffect(() => {
    if (session) {
      const savedProfile = localStorage.getItem(`profile_${session.user?.email}`);
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        setProfile({ name: session.user?.name || '', address: '', phone: '', region: '', comuna: '', postalCode: '' });
      }
    }
  }, [session]);

  const handleSaveProfile = () => {
    localStorage.setItem(`profile_${session?.user?.email}`, JSON.stringify(profile));
    setIsEditing(false);
    alert("Perfil actualizado correctamente");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const existingUsers = JSON.parse(localStorage.getItem('lownose_users') || '[]');
    if (existingUsers.some((u: any) => u.email === email)) {
      setError("Este correo ya está registrado.");
      return;
    }
    const newUser = { id: Date.now().toString(), name, email, password };
    existingUsers.push(newUser);
    localStorage.setItem('lownose_users', JSON.stringify(existingUsers));
    setSuccess("Cuenta creada. Ya puedes iniciar sesión.");
    setIsRegistering(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let validUser = null;
    if (email === "admin@lownose.cl" && password === "admin123") {
      validUser = { id: "admin", name: "Administrador LowNose", email: "admin@lownose.cl" };
    } else {
      const users = JSON.parse(localStorage.getItem('lownose_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      if (foundUser) validUser = { id: foundUser.id, name: foundUser.name, email: foundUser.email };
    }
    if (!validUser) { setError("Credenciales incorrectas."); return; }
    await signIn("credentials", { ...validUser, redirect: false });
  };

  if (session) {
    const isAdmin = session.user?.email === "admin@lownose.cl";
    return (
      <div className="max-w-md mx-auto py-24 px-4">
        <h2 className="text-2xl font-black uppercase tracking-wider mb-2">¡Hola, {session.user?.name}!</h2>
        
        <div className="bg-neutral-50 dark:bg-neutral-950 p-6 border border-gray-100 dark:border-neutral-900 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Información de Perfil</h3>
          <div className="space-y-4">
            {['name', 'address', 'postalCode', 'phone'].map((key) => (
              <div key={key}>
                <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">{key === 'postalCode' ? 'Código Postal' : key}</label>
                <input
                  type="text"
                  value={profile[key as keyof typeof profile]}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({...profile, [key]: e.target.value})}
                  className={`w-full bg-transparent border-b ${isEditing ? 'border-black dark:border-white' : 'border-transparent'} py-1 text-sm outline-none`}
                />
              </div>
            ))}

            {/* Selector de Región Personalizado */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Región</label>
              <input readOnly value={profile.region} onClick={() => isEditing && setShowRegionList(!showRegionList)} className="w-full bg-transparent border-b py-1 text-sm outline-none cursor-pointer" placeholder="Seleccionar Región..." />
              {showRegionList && isEditing && (
                <div className="absolute z-50 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-h-40 overflow-y-auto mt-1 shadow-lg">
                  {Object.keys(CHILE_DATA).map(r => <div key={r} className="p-2 text-xs uppercase cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { setProfile({...profile, region: r, comuna: ''}); setShowRegionList(false); }}>{r}</div>)}
                </div>
              )}
            </div>

            {/* Selector de Comuna Personalizado */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Comuna</label>
              <input readOnly value={profile.comuna} onClick={() => isEditing && profile.region && setShowComunaList(!showComunaList)} className="w-full bg-transparent border-b py-1 text-sm outline-none cursor-pointer" placeholder="Seleccionar Comuna..." />
              {showComunaList && isEditing && (
                <div className="absolute z-50 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-h-40 overflow-y-auto mt-1 shadow-lg">
                  {(CHILE_DATA[profile.region] || []).map(c => <div key={c} className="p-2 text-xs uppercase cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => { setProfile({...profile, comuna: c}); setShowComunaList(false); }}>{c}</div>)}
                </div>
              )}
            </div>
          </div>

          <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className="mt-6 text-xs font-bold uppercase tracking-widest underline cursor-pointer">
            {isEditing ? "Guardar Cambios" : "Editar Perfil"}
          </button>
        </div>

        {isAdmin && <a href="/admin" className="block text-center bg-amber-600 text-white py-3 mb-4 text-xs font-bold uppercase">Ir al Panel de Admin →</a>}
        <button onClick={() => signOut()} className="w-full bg-black text-white dark:bg-white dark:text-black py-3 text-xs font-bold uppercase">Cerrar Sesión</button>
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
        {isRegistering && <input type="text" required placeholder="Nombre" className="w-full border p-2 text-sm" onChange={(e) => setName(e.target.value)} />}
        <input type="email" required placeholder="Correo" className="w-full border p-2 text-sm" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Contraseña" className="w-full border p-2 text-sm" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black py-3 font-bold uppercase text-xs">{isRegistering ? "Registrarme" : "Iniciar Sesión"}</button>
      </form>
    </div>
  );
}