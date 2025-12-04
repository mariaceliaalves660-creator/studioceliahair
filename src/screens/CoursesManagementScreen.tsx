import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { TrendingUp, BookOpen, Plus, Users, ShoppingBag, Edit2, Camera, Trash2, Video, Link as LinkIcon, Play, FileText, BarChart3, Save, CheckSquare, Square, Clock, Upload, Loader2, MessageSquareText } from 'lucide-react';
import { Course, CourseModule, CourseLesson, Student, Client, Sale } from '../types';

export const CoursesManagementScreen: React.FC = () => {
  const { 
    courses, addCourse, updateCourse, removeCourse,
    students, addStudent, updateStudent, removeStudent,
    sales, clients, addClient, addSale, currentAdmin
  } = useData();

  const [view, setView] = useState<'dashboard' | 'list' | 'edit' | 'content' | 'sales' | 'students'>('dashboard');
  
  // --- FORM STATES ---
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Course Info Form
  const [crsTitle, setCrsTitle] = useState('');
  const [crsWorkload, setCrsWorkload] = useState('');
  const [crsFormat, setCrsFormat] = useState<'Presencial' | 'Online' | 'Misto'>('Presencial');
  const [crsCertificate, setCrsCertificate] = useState('');
  const [crsMaterials, setCrsMaterials] = useState('');
  const [crsPrice, setCrsPrice] = useState('');
  const [crsLimit, setCrsLimit] = useState(''); 
  const [crsImage, setCrsImage] = useState('');
  const crsImageRef = useRef<HTMLInputElement>(null);

  // Content Editor State
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  
  // Module Editing
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [modTitleInput, setModTitleInput] = useState('');

  // Lesson Editing
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<'video' | 'pdf' | 'text' | 'upload_video'>('video'); // Updated type
  const [lessonUrl, setLessonUrl] = useState('');
  const [lessonContent, setLessonContent] = useState(''); // NEW: For text lessons
  const [lessonDuration, setLessonDuration] = useState('');
  const [selectedLessonFile, setSelectedLessonFile] = useState<File | null>(null); // For video/pdf upload
  const [uploadingFile, setUploadingFile] = useState(false);
  const lessonFileInputRef = useRef<HTMLInputElement>(null);

  // Student Form State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [stdName, setStdName] = useState('');
  const [stdEmail, setStdEmail] = useState('');
  const [stdPass, setStdPass] = useState('');
  const [stdPhone, setStdPhone] = useState('');
  const [stdCourses, setStdCourses] = useState<string[]>([]);

  // Analytics
  const courseSales = sales.filter(s => s.items.some(i => i.type === 'course'));
  const totalCourseRevenue = courseSales.reduce((acc, sale) => {
      const courseTotal = sale.items.filter(i => i.type === 'course').reduce((s, i) => s + (i.price * i.quantity), 0);
      return acc + courseTotal;
  }, 0);
  const totalStudentsEnrolled = students.length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- COURSE INFO HANDLERS ---
  // New function to only clear form states
  const clearCourseFormStates = () => {
    setEditingCourse(null);
    setCrsTitle(''); setCrsWorkload(''); setCrsFormat('Presencial'); setCrsCertificate('');
    setCrsMaterials(''); setCrsPrice(''); setCrsImage(''); setCrsLimit('');
  };

  const resetCourseForm = () => {
    clearCourseFormStates();
    setView('list');
  };

  const handleSaveCourseInfo = async (e: React.FormEvent) => { // Make it async
    e.preventDefault();
    try {
      const price = parseFloat(crsPrice);
      if (isNaN(price)) {
        alert("Por favor, insira um valor numérico válido para o preço.");
        return;
      }

      const courseData = {
        title: crsTitle,
        workload: crsWorkload,
        format: crsFormat,
        certificate: crsCertificate,
        materials: crsMaterials,
        price: price,
        imageUrl: crsImage,
        active: true,
        maxStudents: crsLimit !== '' ? parseInt(crsLimit) : undefined // Ajustado para tratar '0' corretamente
      };

      console.log("Course data to save:", courseData); // Debugging log

      if (editingCourse) {
        await updateCourse({ ...editingCourse, ...courseData }); // Await update
        alert('Informações do curso atualizadas!');
      } else {
        await addCourse({ id: `crs-${Date.now()}`, ...courseData, modules: [] }); // Await add
        alert('Curso criado com sucesso!');
      }
      clearCourseFormStates(); // Clear form after save
      setView('list'); // Navigate to list after successful save
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Ocorreu um erro ao salvar o curso. Tente novamente.");
    }
  };

  const startEditCourseInfo = (c: Course) => {
    setEditingCourse(c);
    setCrsTitle(c.title); setCrsWorkload(c.workload); setCrsFormat(c.format); setCrsCertificate(c.certificate); setCrsMaterials(c.materials); setCrsPrice(c.price.toString()); setCrsImage(c.imageUrl || ''); setCrsLimit(c.maxStudents ? c.maxStudents.toString() : '');
    setView('edit');
  };

  const openContentEditor = (c: Course) => {
    setEditingCourse(c);
    setView('content');
    setActiveModuleId(null);
    setEditingModuleId(null);
    setEditingLessonId(null);
    // Reset lesson form states
    setLessonTitle(''); setLessonType('video'); setLessonUrl(''); setLessonContent(''); setLessonDuration(''); setSelectedLessonFile(null); setUploadingFile(false);
  };

  // --- MODULE ACTIONS ---
  const handleSaveModule = () => {
    if (!editingCourse || !modTitleInput) return;
    
    let updatedModules = editingCourse.modules || [];

    if (editingModuleId) {
        updatedModules = updatedModules.map(m => m.id === editingModuleId ? { ...m, title: modTitleInput } : m);
    } else {
        updatedModules = [...updatedModules, { id: `mod-${Date.now()}`, title: modTitleInput, lessons: [] }];
    }

    const updatedCourse = { ...editingCourse, modules: updatedModules };
    updateCourse(updatedCourse);
    setEditingCourse(updatedCourse);
    setModTitleInput('');
    setEditingModuleId(null);
    setIsAddingModule(false);
  };

  const startEditModule = (mod: CourseModule) => {
      setModTitleInput(mod.title);
      setEditingModuleId(mod.id);
      setIsAddingModule(true);
  };

  const handleDeleteModule = (modId: string) => {
      if (!editingCourse || !confirm("Tem certeza que deseja excluir este módulo e todas as suas aulas?")) return;
      const updatedModules = (editingCourse.modules || []).filter(m => m.id !== modId);
      const updatedCourse = { ...editingCourse, modules: updatedModules };
      updateCourse(updatedCourse);
      setEditingCourse(updatedCourse);
      if (activeModuleId === modId) setActiveModuleId(null);
  };

  // --- LESSON ACTIONS ---
  const handleSaveLesson = async () => { // Made async
    if (!editingCourse || !activeModuleId || !lessonTitle) return;

    let finalLessonUrl = lessonUrl;
    let finalLessonContent = lessonContent;
    let finalFileName = '';

    if (lessonType === 'upload_video' && selectedLessonFile) {
        setUploadingFile(true);
        try {
            finalLessonUrl = await uploadCourseFile(selectedLessonFile, editingCourse.id, activeModuleId, editingLessonId || `les-${Date.now()}`);
            finalFileName = selectedLessonFile.name;
            finalLessonContent = ''; // Clear content if uploading video
        } catch (error) {
            alert(`Erro ao fazer upload do vídeo: ${error.message}`);
            setUploadingFile(false);
            return;
        } finally {
            setUploadingFile(false);
        }
    } else if (lessonType === 'text') {
        finalLessonUrl = ''; // Clear URL if it's a text lesson
        finalFileName = '';
    } else if (lessonType === 'pdf' || lessonType === 'video') {
        finalLessonContent = ''; // Clear content if it's a URL-based lesson
        finalFileName = ''; // Assuming external URLs don't need fileName
    }

    let updatedModules = editingCourse.modules || [];

    if (editingLessonId) {
        updatedModules = updatedModules.map(mod => {
            if (mod.id === activeModuleId) {
                return {
                    ...mod,
                    lessons: mod.lessons.map(les => les.id === editingLessonId ? { ...les, title: lessonTitle, type: lessonType, url: finalLessonUrl, content: finalLessonContent, duration: lessonDuration, fileName: finalFileName } : les)
                };
            }
            return mod;
        });
    } else {
        const newLesson: CourseLesson = { id: `les-${Date.now()}`, title: lessonTitle, type: lessonType, url: finalLessonUrl, content: finalLessonContent, duration: lessonDuration, fileName: finalFileName };
        updatedModules = updatedModules.map(mod => {
            if (mod.id === activeModuleId) return { ...mod, lessons: [...mod.lessons, newLesson] };
            return mod;
        });
    }

    const updatedCourse = { ...editingCourse, modules: updatedModules };
    updateCourse(updatedCourse);
    setEditingCourse(updatedCourse);
    
    setLessonTitle(''); setLessonType('video'); setLessonUrl(''); setLessonContent(''); setLessonDuration(''); setSelectedLessonFile(null);
    setEditingLessonId(null);
    setIsAddingLesson(false);
  };

  const startEditLesson = (lesson: CourseLesson) => {
      setLessonTitle(lesson.title);
      setLessonType(lesson.type);
      setLessonUrl(lesson.url || '');
      setLessonContent(lesson.content || ''); // Load content
      setLessonDuration(lesson.duration || '');
      setSelectedLessonFile(null); // Clear file input on edit
      setEditingLessonId(lesson.id);
      setIsAddingLesson(true);
  };

  const handleDeleteLesson = (lessonId: string) => {
      if (!editingCourse || !activeModuleId || !confirm("Excluir esta aula?")) return;
      
      const updatedModules = (editingCourse.modules || []).map(mod => {
          if (mod.id === activeModuleId) {
              return { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) };
          }
          return mod;
      });

      const updatedCourse = { ...editingCourse, modules: updatedModules };
      updateCourse(updatedCourse);
      setEditingCourse(updatedCourse);
  };

  // --- STUDENTS HANDLERS ---
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const studentData = { name: stdName, email: stdEmail, password: stdPass, phone: stdPhone, enrolledCourseIds: stdCourses };
    
    if (editingStudent) {
        // Just update student access info
        updateStudent({ ...editingStudent, ...studentData });
        alert('Dados do aluno atualizados!');
    } else {
        // NEW STUDENT:
        // 1. Create Student Access
        addStudent({ id: `stu-${Date.now()}`, ...studentData });
        
        // 2. Automate Sales/Client Record for Point Accrual
        // If courses were selected during registration, treat it as a Sale
        if (stdCourses.length > 0) {
            // Find courses objects to get prices
            const selectedCourseObjs = courses.filter(c => stdCourses.includes(c.id));
            const totalValue = selectedCourseObjs.reduce((acc, c) => acc + c.price, 0);

            if (totalValue > 0) {
                // Find existing client or create new one to link points
                let clientId = '';
                const existingClient = clients.find(c => c.phone === stdPhone);
                
                if (existingClient) {
                    clientId = existingClient.id;
                } else {
                    // Create new client profile
                    clientId = `c-auto-${Date.now()}`;
                    const newClient: Client = {
                        id: clientId,
                        name: stdName,
                        phone: stdPhone,
                        history: []
                    };
                    addClient(newClient);
                }

                // Generate Sale
                const newSale: Sale = {
                    id: `sale-crs-${Date.now()}`,
                    date: new Date().toISOString(),
                    clientId: clientId,
                    clientName: stdName,
                    // customerCpf: stdCpf, // Use stdCpf if available - stdCpf is not defined here
                    total: totalValue,
                    paymentMethod: 'dinheiro', // Default assumption or add selector
                    createdBy: currentAdmin?.id,
                    createdByName: currentAdmin?.name
                };
                addSale(newSale);
            }
        }

        alert('Aluno cadastrado com sucesso! Venda registrada para fidelidade.');
    }
    resetStudentForm();
  };

  const startEditStudent = (s: Student) => {
    setEditingStudent(s);
    setStdName(s.name);
    setStdEmail(s.email);
    setStdPass(s.password);
    setStdPhone(s.phone);
    setStdCourses(s.enrolledCourseIds);
  };

  const resetStudentForm = () => {
    setEditingStudent(null);
    setStdName(''); setStdEmail(''); setStdPass(''); setStdPhone(''); setStdCourses([]);
  };

  const toggleStudentCourse = (courseId: string) => {
    setStdCourses(prev => prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]);
  };

  return (
    <div className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
        <BookOpen className="mr-2" /> Gestão de Cursos
      </h2>

      {/* Navigation */}
      <div className="flex space-x-2 border-b border-gray-100 pb-2 mb-6 overflow-x-auto">
        <button onClick={() => { setView('dashboard'); }} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center ${view === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <TrendingUp size={16} className="mr-2"/> Painel
        </button>
        <button onClick={() => { setView('list'); setEditingCourse(null); }} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center ${view === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <BookOpen size={16} className="mr-2"/> Catálogo / Editar
        </button>
        <button onClick={() => { clearCourseFormStates(); setView('edit'); }} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center ${view === 'edit' && !editingCourse?.id ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Plus size={16} className="mr-2"/> Novo Curso
        </button>
        <button onClick={() => { setView('students'); }} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center ${view === 'students' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <Users size={16} className="mr-2"/> Alunos
        </button>
        <button onClick={() => { setView('sales'); }} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center ${view === 'sales' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
            <ShoppingBag size={16} className="mr-2"/> Vendas
        </button>
      </div>

      {/* DASHBOARD */}
      {view === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 text-sm uppercase">Faturamento Total</h4>
                <div className="text-3xl font-black text-blue-900 mt-2">R$ {totalCourseRevenue.toFixed(2)}</div>
                <p className="text-xs text-blue-600 mt-1">Soma de todas as vendas de cursos</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 text-sm uppercase">Total de Alunos</h4>
                <div className="text-3xl font-black text-blue-900 mt-2">{totalStudentsEnrolled}</div>
                <p className="text-xs text-blue-600 mt-1">Alunos com acesso à plataforma</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-800 text-sm uppercase">Cursos Ativos</h4>
                <div className="text-3xl font-black text-blue-900 mt-2">{courses.filter(c => c.active).length}</div>
                <p className="text-xs text-blue-600 mt-1">Disponíveis para venda</p>
            </div>
        </div>
      )}

      {/* CATALOG LIST */}
      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {courses.map(c => {
                const enrolledCount = students.filter(s => s.enrolledCourseIds.includes(c.id)).length;
                const percentFull = c.maxStudents ? (enrolledCount / c.maxStudents) * 100 : 0;

                return (
                <div key={c.id} className="bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                    <div className="flex items-start mb-4">
                        <img src={c.imageUrl || 'https://picsum.photos/100/100'} className="w-20 h-20 rounded object-cover mr-4 bg-gray-100"/>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-800">{c.title}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {c.active ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{c.format} • {c.workload}</p>
                            <div className="flex items-center mt-2">
                                <div className="text-sm font-bold text-blue-600 mr-4">R$ {c.price.toFixed(2)}</div>
                                {c.maxStudents && (
                                    <div className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {enrolledCount} / {c.maxStudents} Alunos ({percentFull.toFixed(0)}%)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                        <button onClick={() => startEditCourseInfo(c)} className="flex-1 py-2 bg-gray-50 text-gray-700 rounded text-xs font-bold hover:bg-gray-100 flex items-center justify-center border border-gray-200">
                            <Edit2 size={14} className="mr-1"/> Editar Info
                        </button>
                        <button onClick={() => openContentEditor(c)} className="flex-1 py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 flex items-center justify-center shadow-sm">
                            <Video size={14} className="mr-1"/> Aulas e Módulos
                        </button>
                        <button onClick={() => { if(confirm('Excluir curso?')) removeCourse(c.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                    </div>
                </div>
            )})}
        </div>
      )}

      {/* EDIT COURSE INFO */}
      {view === 'edit' && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-fade-in">
            <h3 className="font-bold text-lg mb-4">{editingCourse ? 'Editar Informações do Curso' : 'Cadastrar Novo Curso'}</h3>
            <form onSubmit={handleSaveCourseInfo} className="space-y-4">
                <div 
                    onClick={() => crsImageRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:bg-white bg-white/50"
                >
                    {crsImage ? <img src={crsImage} alt="Preview" className="h-full w-full object-contain" /> : <><Camera className="text-gray-400 mb-2" size={24} /><span className="text-gray-500 font-medium text-xs">Foto do Curso</span></>}
                    <input type="file" ref={crsImageRef} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, setCrsImage)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required placeholder="Nome do Curso" className="w-full p-2 border rounded" value={crsTitle} onChange={e => setCrsTitle(e.target.value)} />
                    <input required placeholder="Carga Horária (Ex: 40h)" className="w-full p-2 border rounded" value={crsWorkload} onChange={e => setCrsWorkload(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select className="w-full p-2 border rounded bg-white" value={crsFormat} onChange={e => setCrsFormat(e.target.value as any)}>
                        <option value="Presencial">Presencial</option>
                        <option value="Online">Online</option>
                        <option value="Misto">Misto</option>
                    </select>
                    <input required placeholder="Certificado" className="w-full p-2 border rounded" value={crsCertificate} onChange={e => setCrsCertificate(e.target.value)} />
                    <input required type="number" step="0.01" placeholder="Valor (R$)" className="w-full p-2 border rounded" value={crsPrice} onChange={e => setCrsPrice(e.target.value)} />
                    <input type="number" placeholder="Limite de Alunos (Opcional)" className="w-full p-2 border rounded" value={crsLimit} onChange={e => setCrsLimit(e.target.value)} />
                </div>
                <input required placeholder="Materiais Inclusos" className="w-full p-2 border rounded" value={crsMaterials} onChange={e => setCrsMaterials(e.target.value)} />
                
                <div className="flex gap-2 mt-4">
                    <button type="button" onClick={() => { clearCourseFormStates(); setView('list'); }} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-300">Cancelar</button>
                    <button className="flex-1 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-md">Salvar Curso</button>
                </div>
            </form>
        </div>
      )}

      {/* CONTENT EDITOR */}
      {view === 'content' && editingCourse && (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-xl text-gray-800">{editingCourse.title}</h3>
                    <p className="text-gray-500 text-sm">Gerenciamento de Módulos e Aulas</p>
                </div>
                <button onClick={() => setView('list')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200">Voltar para Lista</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* MODULES */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-sm text-gray-700 uppercase flex items-center"><BookOpen size={16} className="mr-2 text-blue-600"/> Módulos</h4>
                            <button 
                                onClick={() => { setIsAddingModule(true); setEditingModuleId(null); setModTitleInput(''); }} 
                                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-100 flex items-center"
                            >
                                <Plus size={12} className="mr-1"/> Novo
                            </button>
                        </div>

                        {isAddingModule && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-fade-in">
                                <input 
                                    autoFocus
                                    placeholder="Nome do Módulo..." 
                                    className="w-full p-2 text-sm border rounded mb-2" 
                                    value={modTitleInput} 
                                    onChange={e => setModTitleInput(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => setIsAddingModule(false)} className="flex-1 bg-gray-200 text-gray-600 text-xs py-1 rounded font-bold">Cancelar</button>
                                    <button onClick={handleSaveModule} className="flex-1 bg-blue-600 text-white text-xs py-1 rounded font-bold">Salvar</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                            {editingCourse.modules?.map((mod, idx) => (
                                <div 
                                key={mod.id} 
                                className={`p-3 rounded-lg border transition group ${activeModuleId === mod.id ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                                >
                                    <div className="flex justify-between items-center cursor-pointer" onClick={() => setActiveModuleId(mod.id)}>
                                        <div>
                                            <div className={`font-bold text-sm ${activeModuleId === mod.id ? 'text-blue-800' : 'text-gray-700'}`}>
                                                <span className="mr-2 opacity-50">{idx + 1}.</span>
                                                {mod.title}
                                            </div>
                                            <div className="text-xs font-normal text-gray-500 mt-0.5">{mod.lessons.length} aulas</div>
                                        </div>
                                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); startEditModule(mod); }} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded mr-1"><Edit2 size={12}/></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(mod.id); }} className="p-1.5 text-red-500 hover:bg-red-100 rounded"><Trash2 size={12}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!editingCourse.modules || editingCourse.modules.length === 0) && !isAddingModule && (
                                <p className="text-center text-xs text-gray-400 py-4 italic">Nenhum módulo criado.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* LESSONS */}
                <div className="lg:col-span-2">
                    {activeModuleId ? (
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full flex flex-col">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-gray-800 flex items-center">
                                    <Video size={18} className="mr-2 text-blue-600"/> Aulas do Módulo
                                </h4>
                                <button 
                                    onClick={() => { setIsAddingLesson(true); setEditingLessonId(null); setLessonTitle(''); setLessonType('video'); setLessonUrl(''); setLessonContent(''); setLessonDuration(''); setSelectedLessonFile(null); }}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-green-700 flex items-center shadow-sm"
                                >
                                    <Plus size={16} className="mr-2"/> Adicionar Aula
                                </button>
                            </div>
                            {/* NEW DESCRIPTION */}
                            <p className="text-sm text-gray-500 mb-6">
                                <span className="font-bold">Correção ortográfica e Padronização textual</span>
                            </p>
                            
                            {isAddingLesson && (
                                <div className="mb-6 bg-gray-50 p-5 rounded-xl border border-gray-200 animate-fade-in">
                                    <h5 className="font-bold text-xs text-gray-500 uppercase mb-3">{editingLessonId ? 'Editar Aula' : 'Nova Aula'}</h5>
                                    <div className="space-y-3">
                                        <input placeholder="Título da Aula" className="w-full p-2 border rounded text-sm" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} autoFocus />
                                        
                                        {/* Lesson Type Selector */}
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo de Conteúdo</label>
                                            <select 
                                                className="w-full p-2 border rounded text-sm bg-white" 
                                                value={lessonType} 
                                                onChange={e => { setLessonType(e.target.value as any); setLessonUrl(''); setLessonContent(''); setSelectedLessonFile(null); }}
                                            >
                                                <option value="video">Vídeo (Link Externo)</option>
                                                <option value="upload_video">Vídeo (Upload)</option>
                                                <option value="pdf">Documento PDF (Link Externo)</option>
                                                <option value="text">Texto</option>
                                            </select>
                                        </div>

                                        {/* Conditional Inputs based on Lesson Type */}
                                        {lessonType === 'video' && (
                                            <div className="relative">
                                                <LinkIcon size={14} className="absolute left-3 top-3 text-gray-400"/>
                                                <input required={lessonType === 'video'} placeholder="Link do Vídeo (Youtube/Vimeo)" className="w-full pl-9 p-2 border rounded text-sm" value={lessonUrl} onChange={e => setLessonUrl(e.target.value)} />
                                            </div>
                                        )}
                                        {lessonType === 'upload_video' && (
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="file" 
                                                    ref={lessonFileInputRef}
                                                    accept="video/*" 
                                                    onChange={e => setSelectedLessonFile(e.target.files ? e.target.files[0] : null)} 
                                                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                {selectedLessonFile && (
                                                    <span className="text-xs text-gray-500">{selectedLessonFile.name}</span>
                                                )}
                                            </div>
                                        )}
                                        {lessonType === 'pdf' && (
                                            <div className="relative">
                                                <LinkIcon size={14} className="absolute left-3 top-3 text-gray-400"/>
                                                <input required={lessonType === 'pdf'} placeholder="Link do PDF" className="w-full pl-9 p-2 border rounded text-sm" value={lessonUrl} onChange={e => setLessonUrl(e.target.value)} />
                                            </div>
                                        )}
                                        {lessonType === 'text' && (
                                            <textarea 
                                                required={lessonType === 'text'}
                                                placeholder="Conteúdo da Aula (Texto)" 
                                                className="w-full p-2 border rounded text-sm resize-y min-h-[100px]" 
                                                value={lessonContent} 
                                                onChange={e => setLessonContent(e.target.value)} 
                                            />
                                        )}

                                        <div className="grid grid-cols-1 gap-3">
                                            <input placeholder="Duração (ex: 10:00)" className="p-2 border rounded text-sm" value={lessonDuration} onChange={e => setLessonDuration(e.target.value)} />
                                        </div>
                                        <div className="flex gap-2 justify-end pt-2">
                                            <button onClick={() => setIsAddingLesson(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-bold text-sm">Cancelar</button>
                                            <button 
                                                onClick={handleSaveLesson} 
                                                className="px-4 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 flex items-center justify-center"
                                                disabled={uploadingFile || (lessonType === 'upload_video' && !selectedLessonFile) || (lessonType !== 'text' && !lessonUrl && !selectedLessonFile) || (lessonType === 'text' && !lessonContent)}
                                            >
                                                {uploadingFile ? <><Loader2 className="animate-spin mr-2"/> Enviando...</> : <><Save size={18} className="mr-2"/> Salvar Aula</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 overflow-y-auto max-h-[500px] flex-1">
                                {editingCourse.modules?.find(m => m.id === activeModuleId)?.lessons.map(lesson => (
                                    <div key={lesson.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition group">
                                        <div className="flex items-center flex-1 overflow-hidden">
                                            <div className={`p-2 rounded-full mr-3 shrink-0 ${lesson.type === 'video' || lesson.type === 'upload_video' ? 'bg-blue-100 text-blue-600' : lesson.type === 'pdf' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {lesson.type === 'video' || lesson.type === 'upload_video' ? <Play size={16} fill="currentColor"/> : lesson.type === 'pdf' ? <FileText size={16}/> : <MessageSquareText size={16}/>}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-sm text-gray-800 truncate">{lesson.title}</div>
                                                <div className="text-xs text-gray-400 truncate flex items-center">
                                                    {lesson.duration && <span className="mr-2 flex items-center"><Clock size={10} className="mr-1"/> {lesson.duration}</span>}
                                                    {lesson.type === 'text' ? 'Conteúdo de Texto' : lesson.fileName || lesson.url}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEditLesson(lesson)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16}/></button>
                                            <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                                {editingCourse.modules?.find(m => m.id === activeModuleId)?.lessons.length === 0 && !isAddingLesson && (
                                    <div className="text-center py-10 flex flex-col items-center text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                        <Video size={32} className="mb-2 opacity-20"/>
                                        <p className="text-sm">Nenhuma aula neste módulo.</p>
                                        <button onClick={() => setIsAddingLesson(true)} className="mt-2 text-blue-600 text-xs font-bold hover:underline">Adicionar Primeira Aula</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <BookOpen size={48} className="mb-4 opacity-20"/>
                            <p className="font-medium">Selecione um módulo à esquerda</p>
                            <p className="text-xs mt-1">ou crie um novo para começar a adicionar aulas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* STUDENTS */}
      {view === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800 text-lg">{editingStudent ? 'Editar Aluno' : 'Cadastrar Novo Aluno'}</h4>
                    {editingStudent && <button onClick={resetStudentForm} className="text-xs text-gray-500 hover:text-red-500">Cancelar</button>}
                </div>
                <form onSubmit={handleSaveStudent} className="space-y-4">
                    <input required placeholder="Nome Completo" className="w-full p-3 border rounded-lg bg-white" value={stdName} onChange={e => setStdName(e.target.value)} />
                    <input required type="email" placeholder="Email (Login)" className="w-full p-3 border rounded-lg bg-white" value={stdEmail} onChange={e => setStdEmail(e.target.value)} />
                    <input required placeholder="Senha de Acesso" className="w-full p-3 border rounded-lg bg-white" value={stdPass} onChange={e => setStdPass(e.target.value)} />
                    <input required placeholder="Telefone/WhatsApp" className="w-full p-3 border rounded-lg bg-white" value={stdPhone} onChange={e => setStdPhone(e.target.value)} />
                    
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Matricular nos Cursos:</label>
                        <div className="space-y-2 max-h-[150px] overflow-y-auto">
                            {courses.map(c => (
                                <label key={c.id} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                                    <div className="flex items-center space-x-2">
                                        <input 
                                            type="checkbox" 
                                            checked={stdCourses.includes(c.id)} 
                                            onChange={() => toggleStudentCourse(c.id)}
                                            className="rounded text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{c.title}</span>
                                    </div>
                                    <span className="text-xs font-bold text-blue-600">R$ {c.price.toFixed(2)}</span>
                                </label>
                            ))}
                            {courses.length === 0 && <p className="text-xs text-gray-400">Nenhum curso disponível.</p>}
                        </div>
                    </div>

                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 shadow-md">
                        {editingStudent ? 'Salvar Alterações' : 'Cadastrar e Matricular'}
                    </button>
                </form>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-y-auto max-h-[600px]">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center"><Users size={20} className="mr-2 text-blue-500"/> Alunos Cadastrados ({students.length})</h4>
                <div className="space-y-3">
                    {students.map(s => (
                        <div key={s.id} className="p-4 border rounded-lg hover:shadow-md transition bg-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h5 className="font-bold text-gray-800">{s.name}</h5>
                                    <p className="text-xs text-gray-500">{s.email}</p>
                                    <p className="text-xs text-gray-500">{s.phone}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => startEditStudent(s)} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 size={16}/></button>
                                    <button onClick={() => { if(confirm('Remover aluno?')) removeStudent(s.id); }} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase">Cursos Matriculados:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {s.enrolledCourseIds.length > 0 ? (
                                        s.enrolledCourseIds.map(cid => {
                                            const cName = courses.find(c => c.id === cid)?.title || 'Curso Removido';
                                            return <span key={cid} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{cName}</span>;
                                        })
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Nenhuma matrícula ativa.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {students.length === 0 && (
                        <div className="text-center py-8 text-gray-400">
                            <Users size={32} className="mx-auto mb-2 opacity-20"/>
                            <p>Nenhum aluno cadastrado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* SALES */}
      {view === 'sales' && (
         <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-fade-in">
             <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                 <h4 className="font-bold text-gray-700">Histórico de Matrículas e Vendas</h4>
                 <span className="text-xs text-gray-500">{courseSales.length} registros encontrados</span>
             </div>
             <table className="w-full text-sm text-left">
                 <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs">
                     <tr>
                         <th className="p-3">Data</th>
                         <th className="p-3">Aluno / Cliente</th>
                         <th className="p-3">Curso</th>
                         <th className="p-3 text-right">Valor</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {courseSales.map(sale => (
                         <React.Fragment key={sale.id}>
                             {sale.items.filter(i => i.type === 'course').map((item, idx) => (
                                 <tr key={`${sale.id}-${idx}`} className="hover:bg-blue-50">
                                     <td className="p-3 text-gray-600">{new Date(sale.date).toLocaleDateString()}</td>
                                     <td className="p-3">
                                         <div className="font-bold text-gray-800">{sale.clientName}</div>
                                         <div className="text-xs text-gray-500">CPF: {sale.customerCpf || '-'}</div>
                                     </td>
                                     <td className="p-3 text-blue-600 font-medium">{item.name}</td>
                                     <td className="p-3 text-right font-bold text-gray-800">R$ {item.price.toFixed(2)}</td>
                                 </tr>
                             ))}
                         </React.Fragment>
                     ))}
                     {courseSales.length === 0 && (
                         <tr><td colSpan={4} className="p-6 text-center text-gray-400">Nenhuma venda de curso registrada.</td></tr>
                     )}
                 </tbody>
             </table>
         </div>
      )}
    </div>
  );
};