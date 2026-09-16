'use client';

import { Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="w-full bg-[#051b30] text-slate-300 border-t border-slate-900 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Columna 1: Brand & Socials */}
                    <div className="flex flex-col gap-4">
                        <Link href="/" className="flex items-center gap-2.5">
                            <img src="/logo.jpg" alt="NEOSDOC" className="w-8 h-8 rounded-lg object-cover" />
                            <span className="text-lg font-extrabold tracking-tight text-white">
                                NEOS<span className="text-blue-500">DOC</span>
                            </span>
                        </Link>
                        <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                            Conectamos médicos, impulsamos soluciones. El directorio médico que conecta a Ecuador con la salud.
                        </p>
                        
                        {/* Social Media Icons (Inline SVGs to avoid Lucide version issues) */}
                        <div className="flex items-center gap-2.5 mt-2">
                            <a href="#" className="w-7 h-7 rounded-full border border-slate-800 hover:border-blue-500 hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                                </svg>
                            </a>
                            <a href="#" className="w-7 h-7 rounded-full border border-slate-800 hover:border-blue-500 hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                                <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                </svg>
                            </a>
                            <a href="#" className="w-7 h-7 rounded-full border border-slate-800 hover:border-blue-500 hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            </a>
                            <a href="#" className="w-7 h-7 rounded-full border border-slate-800 hover:border-blue-500 hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                                </svg>
                            </a>
                            <a href="#" className="w-7 h-7 rounded-full border border-slate-800 hover:border-blue-500 hover:text-white flex items-center justify-center text-slate-400 transition-colors">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Columna 2: Enlaces Rápidos */}
                    <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Enlaces rápidos</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li><Link href="/" className="hover:text-blue-400 transition-colors">Inicio</Link></li>
                            <li><Link href="/medicos" className="hover:text-blue-400 transition-colors">Médicos</Link></li>
                            <li><Link href="/clinicas" className="hover:text-blue-400 transition-colors">Clínicas</Link></li>
                            <li><Link href="#socios" className="hover:text-blue-400 transition-colors">Socios comerciales</Link></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Preguntas frecuentes</a></li>
                        </ul>
                    </div>

                    {/* Columna 3: Información Legal */}
                    <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Información legal</h4>
                        <ul className="space-y-2 text-xs text-slate-400">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Términos y condiciones</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Política de privacidad y tratamiento de datos (LOPDP)</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Política de cookies</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Aviso legal</a></li>
                        </ul>
                    </div>

                    {/* Columna 4: Soporte */}
                    <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Soporte</h4>
                        <ul className="space-y-2.5 text-xs text-slate-400">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Centro de ayuda</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Contáctanos</a></li>
                            <li className="flex items-center gap-2 mt-2">
                                <Mail className="w-3.5 h-3.5 text-blue-500" />
                                <span className="hover:text-white transition-colors">contacto@neosdoc.ec</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-blue-500" />
                                <span className="hover:text-white transition-colors">099 123 4567</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Línea final */}
                <div className="border-t border-slate-900/60 pt-6 text-center text-[10px] text-slate-500 font-medium">
                    © 2026 NEOSDOC. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
