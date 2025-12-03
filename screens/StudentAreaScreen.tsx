

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { GraduationCap, Lock, Mail, Play, FileText, ChevronRight, LogOut, ArrowLeft } from 'lucide-react';
import { Student, Course } from '../types';

export const StudentAreaScreen: React.FC = () => {
  const { students, courses } = useData();
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Player State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<{moduleId: string, lessonId: string} | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.email === email && s.password === password);
    if (student) {
      setCurrentStudent(student);
      setLoginError('');
      // Find courses
    } else {
      setLoginError('Email ou senha inválidos.');
    }
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    setSelectedCourse(null);
    setSelectedLesson(null);
    setEmail('');
    setPassword('');
  };

  const myCourses = courses.filter(c => currentStudent?.enrolledCourseIds.includes(c.id));

  // If not logged in
  if (!currentStudent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl">
           <div className="flex justify-center mb-6">
             <div className="bg-blue-100 p-4 rounded-full text-blue-600">
               <GraduationCap size={40} />
             </div>
           </div>
           <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Área do Aluno</h2>
           <p className="text-gray-500 text-center mb-8 text-sm">Acesse seus cursos e materiais.</p>

           <form onSubmit={handleLogin} className="space-y-4">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email de Acesso</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
             </div>
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
             </div>

             {loginError && (
               <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">
                 {loginError}
               </div>
             )}

             <button 
               type="submit"
               className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition"
             >
               Entrar
             </button>
           </form>
        </div>
      </div>
    );
  }

  // --- LOGGED IN AREA ---

  // 1. Course Player
  if (selectedCourse) {
     const currentModule = selectedCourse.modules?.find(m => m.lessons.some(l => l.id === selectedLesson?.lessonId));
     const currentLesson = currentModule?.lessons.find(l => l.id === selectedLesson?.lessonId);
     
     return (
       <div className="p-4 pb-20">
          <div className="flex items-center mb-4">
             <button onClick={() => { setSelectedCourse(null); setSelectedLesson(null); }} className="p-2 bg-white rounded-full shadow-sm mr-3 hover:bg-gray-100">
                <ArrowLeft size={20} className="text-gray-700"/>
             </button>
             <h2 className="font-bold text-lg text-gray-800 line-clamp-1">{selectedCourse.title}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Player Section */}
             <div className="lg:col-span-2">
                <div className="bg-black rounded-xl overflow-hidden shadow-lg aspect-video flex items-center justify-center relative">
                   {currentLesson ? (
                      currentLesson.type === 'video' ? (
                         <iframe 
                           src={currentLesson.url} 
                           className="w-full h-full" 
                           title={currentLesson.title}
                           frameBorder="0" 
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                         ></iframe>
                      ) : (
                         <div className="text-center p-10 bg-gray-100 w-full h-full flex flex-col items-center justify-center">
                            <FileText size={48} className="text-red-500 mb-4"/>
                            <h3 className="font-bold text-gray-800 mb-2">{currentLesson.title}</h3>
                            <a href={currentLesson.url} target="_blank" rel="noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
                               Abrir Documento PDF
                            </a>
                         </div>
                      )
                   ) : (
                      <div className="text-white/50 flex flex-col items-center">
                         <Play size={48} className="mb-2"/>
                         <p>Selecione uma aula para começar</p>
                      </div>
                   )}
                </div>
                {currentLesson && (
                   <div className="mt-4 bg-white p-4 rounded-xl shadow-sm">
                      <h1 className="text-xl font-bold text-gray-800">{currentLesson.title}</h1>
                      <p className="text-sm text-gray-500 mt-1">{currentModule?.title}</p>
                   </div>
                )}
             </div>

             {/* Playlist Section */}
             <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                   <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700">
                      Conteúdo do Curso
                   </div>
                   <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                      {selectedCourse.modules?.map(mod => (
                         <div key={mod.id}>
                            <div className="p-3 bg-gray-50/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                               {mod.title}
                            </div>
                            {mod.lessons.map(lesson => (
                               <button 
                                 key={lesson.id}
                                 onClick={() => setSelectedLesson({ moduleId: mod.id, lessonId: lesson.id })}
                                 className={`w-full text-left p-4 hover:bg-blue-50 transition flex items-center ${selectedLesson?.lessonId === lesson.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                               >
                                  <div className={`mr-3 p-2 rounded-full ${lesson.type === 'video' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                     {lesson.type === 'video' ? <Play size={16} fill="currentColor" /> : <FileText size={16} />}
                                  </div>
                                  <div>
                                     <div className={`font-medium text-sm ${selectedLesson?.lessonId === lesson.id ? 'text-blue-800' : 'text-gray-700'}`}>
                                        {lesson.title}
                                     </div>
                                     {lesson.duration && <div className="text-xs text-gray-400">{lesson.duration}</div>}
                                  </div>
                               </button>
                            ))}
                         </div>
                      ))}
                      {(!selectedCourse.modules || selectedCourse.modules.length === 0) && (
                         <p className="p-4 text-center text-gray-400 text-sm">Conteúdo em breve.</p>
                      )}
                   </div>
                </div>
             </div>
          </div>
       </div>
     );
  }

  // 2. Dashboard (Course List)
  return (
    <div className="p-6 pb-20">
       <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-2xl font-bold text-gray-800">Olá, {currentStudent.name}</h1>
             <p className="text-gray-500 text-sm">Bem-vindo à sua área de estudos.</p>
          </div>
          <button onClick={handleLogout} className="bg-gray-100 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition">
             <LogOut size={20} />
          </button>
       </div>

       <h2 className="font-bold text-gray-700 text-lg mb-4 flex items-center">
          <GraduationCap className="mr-2 text-blue-600"/> Meus Cursos
       </h2>

       {myCourses.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
             <GraduationCap size={48} className="mx-auto mb-4 opacity-20"/>
             <p>Você ainda não está matriculado em nenhum curso.</p>
             <p className="text-xs mt-2">Fale com a administração para liberar seu acesso.</p>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {myCourses.map(course => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition">
                   <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <img src={course.imageUrl || 'https://picsum.photos/400/225'} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                         <div className="bg-white/90 p-3 rounded-full shadow-lg">
                            <Play size={24} className="text-blue-600" fill="currentColor"/>
                         </div>
                      </div>
                   </div>
                   <div className="p-5">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{course.title}</h3>
                      <p className="text-xs text-gray-500 mb-4">{course.workload} • {course.format}</p>
                      
                      <button 
                        onClick={() => {
                           setSelectedCourse(course);
                           // Auto select first lesson
                           if (course.modules && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
                              setSelectedLesson({ moduleId: course.modules[0].id, lessonId: course.modules[0].lessons[0].id });
                           }
                        }}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center justify-center"
                      >
                         Acessar Aulas <ChevronRight size={16} className="ml-1"/>
                      </button>
                   </div>
                </div>
             ))}
          </div>
       )}
    </div>
  );
};